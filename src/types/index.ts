export interface YouTubeChannel {
  id: string
  title: string
  description?: string
  thumbnailUrl?: string
  subscriberCount?: number
  videoCount?: number
  viewCount?: number
  publishedAt?: string
  customUrl?: string
  country?: string
}

export interface YouTubeVideo {
  id: string
  title: string
  description?: string
  thumbnailUrl?: string
  duration?: string
  viewCount?: number
  likeCount?: number
  commentCount?: number
  publishedAt?: string
  tags?: string[]
  categoryId?: string
  channelId: string
  channelTitle?: string
}

export interface TrendingVideo extends YouTubeVideo {
  rankPosition: number
  trendingDate: string
  region: string
}

export interface VideoAnalytics {
  id: string
  videoId: string
  date: string
  viewCount: number
  likeCount: number
  commentCount: number
  averageViewDuration?: number
  clickThroughRate?: number
  impressions?: number
}

export interface ChannelAnalytics {
  id: string
  channelId: string
  date: string
  subscriberCount: number
  viewCount: number
  videoCount: number
  estimatedRevenue?: number
  averageViewDuration?: number
}

export interface Recommendation {
  id: string
  videoId: string
  type: 'TITLE' | 'THUMBNAIL' | 'DESCRIPTION' | 'TAGS'
  originalText: string
  recommendedText: string
  score?: number
  isApplied: boolean
  createdAt: string
}

export interface SearchResult {
  query: string
  videos: YouTubeVideo[]
  channels: YouTubeChannel[]
  totalResults: number
}

export interface TrendAnalysis {
  keyword: string
  volume: number
  growth: number
  relatedKeywords: string[]
  categoryId?: string
}

export interface User {
  id: string
  email: string
  name?: string
  image?: string
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  userId: string
  plan: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'TRIAL'
  startDate: string
  endDate?: string
}

export interface DashboardData {
  totalVideos: number
  totalViews: number
  totalSubscribers: number
  avgViewDuration: number
  topVideos: YouTubeVideo[]
  recentAnalytics: VideoAnalytics[]
  trendingKeywords: TrendAnalysis[]
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}