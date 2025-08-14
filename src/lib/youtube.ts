import { google } from 'googleapis'
import type { YouTubeChannel, YouTubeVideo, TrendingVideo } from '@/types'

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
})

export class YouTubeService {
  private static instance: YouTubeService
  private apiKey: string

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('YouTube API key is required')
    }
  }

  static getInstance(): YouTubeService {
    if (!YouTubeService.instance) {
      YouTubeService.instance = new YouTubeService()
    }
    return YouTubeService.instance
  }

  async searchVideos(query: string, maxResults: number = 50): Promise<YouTubeVideo[]> {
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
      throw new Error('Failed to search videos')
    }
  }

  async getVideoDetails(videoIds: string[]): Promise<YouTubeVideo[]> {
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
      throw new Error('Failed to get trending videos')
    }
  }

  async getChannelVideos(channelId: string, maxResults: number = 50): Promise<YouTubeVideo[]> {
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
      throw new Error('Failed to get channel videos')
    }
  }

  async searchChannels(query: string, maxResults: number = 25): Promise<YouTubeChannel[]> {
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
      throw new Error('Failed to search channels')
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
}