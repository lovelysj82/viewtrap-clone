import type { NextApiRequest, NextApiResponse } from 'next'
import { YouTubeService } from '@/lib/youtube'
import { mockTrendingVideos } from '@/lib/mock-data'
import type { ApiResponse, TrendingVideo } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<TrendingVideo[]>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { region = 'KR', maxResults = '50' } = req.query

  // Return mock data if YouTube API key is not configured
  if (!process.env.YOUTUBE_API_KEY) {
    console.info('YouTube API key not configured, returning mock data')
    return res.status(200).json({ 
      success: true, 
      data: mockTrendingVideos.slice(0, parseInt(maxResults as string)) 
    })
  }

  try {
    const youtubeService = YouTubeService.getInstance()
    const trendingVideos = await youtubeService.getTrendingVideos(
      region as string,
      parseInt(maxResults as string)
    )

    res.status(200).json({ success: true, data: trendingVideos })
  } catch (error) {
    console.error('Trending API error:', error)
    console.info('Falling back to mock data')
    
    // Fallback to mock data on API error
    res.status(200).json({ 
      success: true, 
      data: mockTrendingVideos.slice(0, parseInt(maxResults as string)),
      message: 'Using demo data - API key may be invalid or quota exceeded'
    })
  }
}