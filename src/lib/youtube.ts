import { google } from 'googleapis'
import type { YouTubeChannel, YouTubeVideo, TrendingVideo } from '@/types'
import { CacheService, CACHE_TTL } from './cache'

export class YouTubeService {
  private static instance: YouTubeService
  private apiKeys: string[]
  private currentKeyIndex: number = 0
  private keyQuotaExhausted: Set<number> = new Set()
  private cache: CacheService

  constructor() {
    // 환경변수에서 API 키들을 가져와서 배열로 만듦
    const keysString = process.env.YOUTUBE_API_KEYS || process.env.YOUTUBE_API_KEY || ''
    this.apiKeys = keysString.split(',').map(key => key.trim()).filter(Boolean)
    
    // 캐시 서비스 초기화
    this.cache = CacheService.getInstance()
    
    console.log('YouTube API Keys available:', this.apiKeys.length)
    console.log('API Keys prefixes:', this.apiKeys.map(key => key.substring(0, 10)))
  }

  static getInstance(): YouTubeService {
    if (!YouTubeService.instance) {
      YouTubeService.instance = new YouTubeService()
    }
    return YouTubeService.instance
  }

  private getCurrentApiKey(): string | null {
    if (this.apiKeys.length === 0) return null
    
    // 모든 키가 할당량 초과 상태면 첫 번째 키로 리셋 (다음날 할당량 리셋 대비)
    if (this.keyQuotaExhausted.size === this.apiKeys.length) {
      console.log('모든 API 키의 할당량이 초과되었습니다. 첫 번째 키로 리셋합니다.')
      this.keyQuotaExhausted.clear()
      this.currentKeyIndex = 0
    }
    
    // 현재 키가 할당량 초과 상태가 아닌 키를 찾음
    let attempts = 0
    while (attempts < this.apiKeys.length) {
      if (!this.keyQuotaExhausted.has(this.currentKeyIndex)) {
        return this.apiKeys[this.currentKeyIndex]
      }
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length
      attempts++
    }
    
    return null
  }

  private createYouTubeClient(): ReturnType<typeof google.youtube> | null {
    const apiKey = this.getCurrentApiKey()
    if (!apiKey) return null

    try {
      return google.youtube({
        version: 'v3',
        auth: apiKey,
      })
    } catch (error) {
      console.error('Failed to create YouTube client:', error)
      return null
    }
  }

  private handleQuotaExhausted(error: { message?: string }): boolean {
    if (error.message?.includes('quota') || error.message?.includes('exceeded')) {
      console.log(`API 키 ${this.currentKeyIndex + 1}의 할당량이 초과되었습니다. 다음 키로 전환합니다.`)
      this.keyQuotaExhausted.add(this.currentKeyIndex)
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length
      return true
    }
    return false
  }

  private async executeWithRetry<T>(operation: (youtube: ReturnType<typeof google.youtube>) => Promise<T>): Promise<T> {
    let lastError: Error | unknown
    
    for (let attempt = 0; attempt < this.apiKeys.length; attempt++) {
      const youtube = this.createYouTubeClient()
      if (!youtube) {
        throw new Error('No valid YouTube API keys available')
      }

      try {
        const result = await operation(youtube)
        console.log(`API 키 ${this.currentKeyIndex + 1} 사용 성공`)
        return result
      } catch (error: unknown) {
        const errorObj = error as { message?: string }
        lastError = error
        console.error(`API 키 ${this.currentKeyIndex + 1} 오류:`, errorObj.message)
        
        if (this.handleQuotaExhausted(errorObj)) {
          continue // 다음 키로 시도
        } else {
          throw error // 할당량 문제가 아닌 다른 오류는 즉시 throw
        }
      }
    }
    
    throw lastError || new Error('All API keys exhausted')
  }

  async searchVideos(query: string, maxResults: number = 50): Promise<YouTubeVideo[]> {
    // 캐시에서 먼저 확인
    const cacheParams = { query, maxResults, type: 'videos' }
    const cached = await this.cache.get<YouTubeVideo[]>('search', cacheParams)
    if (cached) {
      console.log('캐시에서 검색 결과 반환:', query)
      return cached
    }

    if (this.apiKeys.length === 0) {
      console.warn('No YouTube API keys available, returning mock data')
      const mockData = this.getMockVideos(query, maxResults)
      await this.cache.set('search', cacheParams, mockData, CACHE_TTL.SEARCH)
      return mockData
    }

    try {
      const response = await this.executeWithRetry(async (youtube) => {
        return await youtube.search.list({
          part: ['snippet'],
          q: query,
          type: ['video'],
          maxResults,
          order: 'relevance',
          regionCode: 'KR',
          relevanceLanguage: 'ko',
        })
      })

      if (!response.data.items) return []

      const videoIds = response.data.items.map(item => item.id?.videoId).filter(Boolean)
      const videoDetails = await this.getVideoDetails(videoIds as string[])

      // 결과를 캐시에 저장 (30분)
      await this.cache.set('search', cacheParams, videoDetails, CACHE_TTL.SEARCH)
      console.log('검색 결과를 캐시에 저장:', query)

      return videoDetails
    } catch (error) {
      console.error('Error searching videos:', error)
      console.warn('Falling back to mock data')
      const mockData = this.getMockVideos(query, maxResults)
      await this.cache.set('search', cacheParams, mockData, CACHE_TTL.SEARCH)
      return mockData
    }
  }

  async getVideoDetails(videoIds: string[]): Promise<YouTubeVideo[]> {
    if (this.apiKeys.length === 0) {
      return []
    }

    try {
      const response = await this.executeWithRetry(async (youtube) => {
        return await youtube.videos.list({
          part: ['snippet', 'statistics', 'contentDetails'],
          id: videoIds,
        })
      })

      if (!response.data.items) return []

      return response.data.items.map(item => ({
        id: item.id!,
        title: item.snippet?.title || '',
        description: item.snippet?.description || undefined,
        thumbnailUrl: item.snippet?.thumbnails?.high?.url || undefined,
        duration: item.contentDetails?.duration || undefined,
        viewCount: parseInt(item.statistics?.viewCount || '0'),
        likeCount: parseInt(item.statistics?.likeCount || '0'),
        commentCount: parseInt(item.statistics?.commentCount || '0'),
        publishedAt: item.snippet?.publishedAt || undefined,
        tags: item.snippet?.tags || undefined,
        categoryId: item.snippet?.categoryId || undefined,
        channelId: item.snippet?.channelId || '',
        channelTitle: item.snippet?.channelTitle || undefined,
      }))
    } catch (error) {
      console.error('Error getting video details:', error)
      throw new Error('Failed to get video details')
    }
  }

  async getChannelDetails(channelId: string): Promise<YouTubeChannel | null> {
    if (this.apiKeys.length === 0) {
      return null
    }

    try {
      const response = await this.executeWithRetry(async (youtube) => {
        return await youtube.channels.list({
          part: ['snippet', 'statistics'],
          id: [channelId],
        })
      })

      if (!response.data.items || response.data.items.length === 0) {
        return null
      }

      const channel = response.data.items[0]
      return {
        id: channel.id!,
        title: channel.snippet?.title || '',
        description: channel.snippet?.description || undefined,
        thumbnailUrl: channel.snippet?.thumbnails?.high?.url || undefined,
        subscriberCount: parseInt(channel.statistics?.subscriberCount || '0'),
        videoCount: parseInt(channel.statistics?.videoCount || '0'),
        viewCount: parseInt(channel.statistics?.viewCount || '0'),
        publishedAt: channel.snippet?.publishedAt || undefined,
        customUrl: channel.snippet?.customUrl || undefined,
        country: channel.snippet?.country || undefined,
      }
    } catch (error) {
      console.error('Error getting channel details:', error)
      throw new Error('Failed to get channel details')
    }
  }

  async getTrendingVideos(regionCode: string = 'KR', maxResults: number = 50): Promise<TrendingVideo[]> {
    // 캐시에서 먼저 확인
    const cacheParams = { regionCode, maxResults }
    const cached = await this.cache.get<TrendingVideo[]>('trending', cacheParams)
    if (cached) {
      console.log('캐시에서 트렌딩 데이터 반환:', regionCode)
      return cached
    }

    if (this.apiKeys.length === 0) {
      console.warn('No YouTube API keys available, returning mock trending data')
      return this.getMockTrendingVideos(regionCode, maxResults)
    }

    try {
      const response = await this.executeWithRetry(async (youtube) => {
        return await youtube.videos.list({
          part: ['snippet', 'statistics'],
          chart: 'mostPopular',
          regionCode,
          maxResults,
        })
      })

      if (!response.data.items) return []

      const trendingVideos = response.data.items.map((item, index) => ({
        id: item.id!,
        title: item.snippet?.title || '',
        description: item.snippet?.description || undefined,
        thumbnailUrl: item.snippet?.thumbnails?.high?.url || undefined,
        viewCount: parseInt(item.statistics?.viewCount || '0'),
        likeCount: parseInt(item.statistics?.likeCount || '0'),
        commentCount: parseInt(item.statistics?.commentCount || '0'),
        publishedAt: item.snippet?.publishedAt || undefined,
        tags: item.snippet?.tags || undefined,
        categoryId: item.snippet?.categoryId || undefined,
        channelId: item.snippet?.channelId || '',
        channelTitle: item.snippet?.channelTitle || undefined,
        rankPosition: index + 1,
        trendingDate: new Date().toISOString(),
        region: regionCode,
      }))

      // 결과를 캐시에 저장 (1시간)
      await this.cache.set('trending', cacheParams, trendingVideos, CACHE_TTL.TRENDING)
      console.log('트렌딩 데이터를 캐시에 저장:', regionCode)

      return trendingVideos
    } catch (error) {
      console.error('Error getting trending videos:', error)
      console.warn('Falling back to mock trending data')
      return this.getMockTrendingVideos(regionCode, maxResults)
    }
  }

  async getChannelVideos(channelId: string, maxResults: number = 50): Promise<YouTubeVideo[]> {
    // 캐시에서 먼저 확인
    const cacheParams = { channelId, maxResults }
    const cached = await this.cache.get<YouTubeVideo[]>('channelVideos', cacheParams)
    if (cached) {
      console.log('캐시에서 채널 비디오 반환:', channelId)
      return cached
    }

    if (this.apiKeys.length === 0) {
      console.warn('No YouTube API keys available, returning mock channel videos')
      return this.getMockChannelVideos(channelId, maxResults)
    }

    try {
      const response = await this.executeWithRetry(async (youtube) => {
        return await youtube.search.list({
          part: ['snippet'],
          channelId,
          type: ['video'],
          maxResults,
          order: 'date',
        })
      })

      if (!response.data.items) return []

      const videoIds = response.data.items.map(item => item.id?.videoId).filter(Boolean)
      const channelVideos = await this.getVideoDetails(videoIds as string[])

      // 결과를 캐시에 저장 (2시간)
      await this.cache.set('channelVideos', cacheParams, channelVideos, CACHE_TTL.CHANNEL_VIDEOS)
      console.log('채널 비디오를 캐시에 저장:', channelId)

      return channelVideos
    } catch (error) {
      console.error('Error getting channel videos:', error)
      console.warn('Falling back to mock channel videos')
      return this.getMockChannelVideos(channelId, maxResults)
    }
  }

  async searchChannels(query: string, maxResults: number = 25): Promise<YouTubeChannel[]> {
    // 캐시에서 먼저 확인
    const cacheParams = { query, maxResults, type: 'channels' }
    const cached = await this.cache.get<YouTubeChannel[]>('search', cacheParams)
    if (cached) {
      console.log('캐시에서 채널 검색 결과 반환:', query)
      return cached
    }

    if (this.apiKeys.length === 0) {
      console.warn('No YouTube API keys available, returning mock channels')
      const mockData = this.getMockChannels(query, maxResults)
      await this.cache.set('search', cacheParams, mockData, CACHE_TTL.SEARCH)
      return mockData
    }

    try {
      const response = await this.executeWithRetry(async (youtube) => {
        return await youtube.search.list({
          part: ['snippet'],
          q: query,
          type: ['channel'],
          maxResults,
          order: 'relevance',
          regionCode: 'KR',
        })
      })

      if (!response.data.items) return []

      const channelIds = response.data.items.map(item => item.id?.channelId).filter(Boolean)
      const channels: YouTubeChannel[] = []

      for (const channelId of channelIds) {
        const channel = await this.getChannelDetails(channelId!)
        if (channel) {
          channels.push(channel)
        }
      }

      // 결과를 캐시에 저장 (30분)
      await this.cache.set('search', cacheParams, channels, CACHE_TTL.SEARCH)
      console.log('채널 검색 결과를 캐시에 저장:', query)

      return channels
    } catch (error) {
      console.error('Error searching channels:', error)
      console.warn('Falling back to mock channels')
      const mockData = this.getMockChannels(query, maxResults)
      await this.cache.set('search', cacheParams, mockData, CACHE_TTL.SEARCH)
      return mockData
    }
  }

  parseDuration(duration: string): number {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    if (!match) return 0

    const hours = (match[1] || '').replace('H', '') || '0'
    const minutes = (match[2] || '').replace('M', '') || '0'
    const seconds = (match[3] || '').replace('S', '') || '0'

    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds)
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  private getMockVideos(query: string, maxResults: number): YouTubeVideo[] {
    const mockVideos: YouTubeVideo[] = [
      {
        id: 'mock1',
        title: `${query}에 대한 인기 동영상`,
        description: '이것은 모의 데이터입니다. YouTube API 키가 설정되지 않았습니다.',
        thumbnailUrl: `https://via.placeholder.com/320x180.png?text=${encodeURIComponent(query)}`,
        duration: 'PT5M32S',
        viewCount: 123456,
        likeCount: 1234,
        commentCount: 56,
        publishedAt: new Date().toISOString(),
        tags: [query, '모의데이터', '테스트'],
        categoryId: '22',
        channelId: 'mock-channel-1',
        channelTitle: '모의 채널'
      },
      {
        id: 'mock2',
        title: `${query} 튜토리얼`,
        description: '이것은 모의 데이터입니다.',
        thumbnailUrl: `https://via.placeholder.com/320x180.png?text=Tutorial+${encodeURIComponent(query)}`,
        duration: 'PT10M15S',
        viewCount: 789012,
        likeCount: 5678,
        commentCount: 123,
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        tags: [query, '튜토리얼', '가이드'],
        categoryId: '27',
        channelId: 'mock-channel-2',
        channelTitle: '테스트 채널'
      }
    ]

    return mockVideos.slice(0, maxResults)
  }

  private getMockChannels(query: string, maxResults: number): YouTubeChannel[] {
    const mockChannels: YouTubeChannel[] = [
      {
        id: 'mock-channel-1',
        title: `${query} 공식 채널`,
        description: '이것은 모의 채널 데이터입니다.',
        thumbnailUrl: `https://via.placeholder.com/88x88.png?text=${encodeURIComponent(query)}`,
        subscriberCount: 123456,
        videoCount: 89,
        viewCount: 9876543,
        publishedAt: new Date(Date.now() - 86400000 * 365).toISOString(),
        customUrl: `mock-${query.toLowerCase()}`,
        country: 'KR'
      },
      {
        id: 'mock-channel-2',
        title: `${query} TV`,
        description: '모의 데이터 채널입니다.',
        thumbnailUrl: `https://via.placeholder.com/88x88.png?text=TV+${encodeURIComponent(query)}`,
        subscriberCount: 456789,
        videoCount: 234,
        viewCount: 12345678,
        publishedAt: new Date(Date.now() - 86400000 * 180).toISOString(),
        customUrl: `${query.toLowerCase()}-tv`,
        country: 'KR'
      }
    ]

    return mockChannels.slice(0, maxResults)
  }

  private getMockTrendingVideos(regionCode: string, maxResults: number): TrendingVideo[] {
    const trendingTopics = ['K-POP', '게임', '요리', 'VLOG', '리뷰', '튜토리얼', '뉴스', '음악', '예능', 'SHORTS']
    
    const mockTrendingVideos = trendingTopics.map((topic, index) => ({
      id: `trending-${index + 1}`,
      title: `인기 급상승! ${topic} 관련 영상`,
      description: `현재 ${regionCode} 지역에서 트렌딩 중인 ${topic} 관련 영상입니다. 실제 YouTube 데이터가 아닌 모의 데이터입니다.`,
      thumbnailUrl: `https://picsum.photos/320/180?random=${index + 1}`,
      duration: 'PT8M45S',
      viewCount: Math.floor(Math.random() * 10000000) + 100000,
      likeCount: Math.floor(Math.random() * 100000) + 1000,
      commentCount: Math.floor(Math.random() * 10000) + 100,
      publishedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      tags: [topic, '트렌딩', '인기'],
      categoryId: '22',
      channelId: `mock-trending-channel-${index + 1}`,
      channelTitle: `${topic} 전문 채널`,
      rankPosition: index + 1,
      trendingDate: new Date().toISOString(),
      region: regionCode,
    }))

    return mockTrendingVideos.slice(0, maxResults)
  }

  private getMockChannelVideos(channelId: string, maxResults: number): YouTubeVideo[] {
    const videoTopics = ['최신 영상', '인기 영상', '리뷰', '튜토리얼', '브이로그', 'Q&A', '라이브 스트림', '컬래버레이션']
    
    const mockChannelVideos = videoTopics.map((topic, index) => ({
      id: `channel-video-${channelId}-${index + 1}`,
      title: `${topic} - 채널의 ${topic} 영상`,
      description: `이 채널의 ${topic} 관련 영상입니다. 실제 YouTube 데이터가 아닌 모의 데이터입니다.`,
      thumbnailUrl: `https://picsum.photos/320/180?random=${channelId}-${index + 1}`,
      duration: `PT${Math.floor(Math.random() * 20 + 5)}M${Math.floor(Math.random() * 60)}S`,
      viewCount: Math.floor(Math.random() * 1000000) + 10000,
      likeCount: Math.floor(Math.random() * 50000) + 500,
      commentCount: Math.floor(Math.random() * 5000) + 50,
      publishedAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
      tags: [topic, '채널', '영상'],
      categoryId: '22',
      channelId: channelId,
      channelTitle: '모의 채널',
    }))

    return mockChannelVideos.slice(0, maxResults)
  }
}