import type { NextApiRequest, NextApiResponse } from 'next'
import { YouTubeService } from '@/lib/youtube'
import type { ApiResponse, YouTubeChannel } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<YouTubeChannel>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { channelId } = req.query

  if (!channelId || typeof channelId !== 'string') {
    return res.status(400).json({ success: false, error: 'Channel ID is required' })
  }

  try {
    const youtubeService = YouTubeService.getInstance()
    const channel = await youtubeService.getChannelDetails(channelId)

    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' })
    }

    res.status(200).json({ success: true, data: channel })
  } catch (error) {
    console.error('Channel API error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch channel details' 
    })
  }
}