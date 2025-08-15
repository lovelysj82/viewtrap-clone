import type { NextApiRequest, NextApiResponse } from 'next'
import { YouTubeService } from '@/lib/youtube'
import type { ApiResponse, YouTubeVideo } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<YouTubeVideo[]>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { channelId, maxResults = '25' } = req.query

  if (!channelId || typeof channelId !== 'string') {
    return res.status(400).json({ success: false, error: 'Channel ID is required' })
  }

  try {
    const youtubeService = YouTubeService.getInstance()
    const videos = await youtubeService.getChannelVideos(
      channelId,
      parseInt(maxResults as string)
    )

    res.status(200).json({ success: true, data: videos })
  } catch (error) {
    console.error('Channel videos API error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch channel videos' 
    })
  }
}