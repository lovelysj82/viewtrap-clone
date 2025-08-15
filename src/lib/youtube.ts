import { google } from 'googleapis'
import type { YouTubeChannel, YouTubeVideo, TrendingVideo } from '@/types'

let youtube: ReturnType<typeof google.youtube> | null = null

try {
  youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
  })
} catch (error) {
  console.error('Failed to initialize YouTube API:', error)
}

export class YouTubeService {
  private static instance: YouTubeService
  private apiKey: string

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || ''
    console.log('YouTube API Key available:', !!this.apiKey)
    console.log('YouTube API Key length:', this.apiKey?.length || 0)
  }

  static getInstance(): YouTubeService {
    if (!YouTubeService.instance) {
      YouTubeService.instance = new YouTubeService()
    }
    return YouTubeService.instance
  }

  async searchVideos(query: string, maxResults: number = 50): Promise<YouTubeVideo[]> {
    if (!this.apiKey || !youtube) {
      console.warn('YouTube API key not available, returning mock data')
      return this.getMockVideos(query, maxResults)
    }

    try {
      const response = await youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['video'],
        maxResults,
        order: 'relevance',
        regionCode: 'KR',
        relevanceLanguage: 'ko',
      })

      if (!response.data.items) return []

      const videoIds = response.data.items.map(item => item.id?.videoId).filter(Boolean)
      const videoDetails = await this.getVideoDetails(videoIds as string[])

      return videoDetails
    } catch (error) {
      console.error('Error searching videos:', error)
      console.warn('Falling back to mock data')
      return this.getMockVideos(query, maxResults)
    }
  }

  async getVideoDetails(videoIds: string[]): Promise<YouTubeVideo[]> {
    if (!youtube) {
      return []
    }

    try {
      const response = await youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: videoIds,
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
    if (!youtube) {
      return null
    }

    try {
      const response = await youtube.channels.list({
        part: ['snippet', 'statistics'],
        id: [channelId],
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
    if (!this.apiKey || !youtube) {
      console.warn('YouTube API key not available, returning mock trending data')
      return this.getMockTrendingVideos(regionCode, maxResults)
    }

    try {
      const response = await youtube.videos.list({
        part: ['snippet', 'statistics'],
        chart: 'mostPopular',
        regionCode,
        maxResults,
      })

      if (!response.data.items) return []

      return response.data.items.map((item, index) => ({
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
    } catch (error) {
      console.error('Error getting trending videos:', error)
      console.warn('Falling back to mock trending data')
      return this.getMockTrendingVideos(regionCode, maxResults)
    }
  }

  async getChannelVideos(channelId: string, maxResults: number = 50): Promise<YouTubeVideo[]> {
    if (!this.apiKey || !youtube) {
      console.warn('YouTube API key not available, returning mock channel videos')
      return this.getMockChannelVideos(channelId, maxResults)
    }

    try {
      const response = await youtube.search.list({
        part: ['snippet'],
        channelId,
        type: ['video'],
        maxResults,
        order: 'date',
      })

      if (!response.data.items) return []

      const videoIds = response.data.items.map(item => item.id?.videoId).filter(Boolean)
      return await this.getVideoDetails(videoIds as string[])
    } catch (error) {
      console.error('Error getting channel videos:', error)
      console.warn('Falling back to mock channel videos')
      return this.getMockChannelVideos(channelId, maxResults)
    }
  }

  async searchChannels(query: string, maxResults: number = 25): Promise<YouTubeChannel[]> {
    if (!this.apiKey || !youtube) {
      console.warn('YouTube API key not available, returning mock channels')
      return this.getMockChannels(query, maxResults)
    }

    try {
      const response = await youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['channel'],
        maxResults,
        order: 'relevance',
        regionCode: 'KR',
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

      return channels
    } catch (error) {
      console.error('Error searching channels:', error)
      console.warn('Falling back to mock channels')
      return this.getMockChannels(query, maxResults)
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