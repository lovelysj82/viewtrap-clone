import type { NextApiRequest, NextApiResponse } from 'next'
import { YouTubeService } from '@/lib/youtube'
import type { ApiResponse, SearchResult } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<SearchResult>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { query, maxResults = '25' } = req.query

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ success: false, error: 'Query parameter is required' })
  }

  try {
    const youtubeService = YouTubeService.getInstance()
    const [videos, channels] = await Promise.all([
      youtubeService.searchVideos(query, parseInt(maxResults as string)),
      youtubeService.searchChannels(query, Math.min(parseInt(maxResults as string), 10))
    ])

    const result: SearchResult = {
      query,
      videos,
      channels,
      totalResults: videos.length + channels.length
    }

    res.status(200).json({ success: true, data: result })
  } catch (error) {
    console.error('Search API error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to search YouTube content' 
    })
  }
}