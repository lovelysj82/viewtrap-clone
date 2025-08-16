import type { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.YOUTUBE_API_KEY
  
  if (!apiKey) {
    return res.status(500).json({ error: 'No API key' })
  }

  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    })

    const response = await youtube.search.list({
      part: ['snippet'],
      q: '뉴진스',
      type: ['video'],
      maxResults: 3,
      order: 'relevance',
      regionCode: 'KR',
    })

    res.status(200).json({
      success: true,
      itemsCount: response.data.items?.length || 0,
      firstItem: response.data.items?.[0] || null
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.errors?.[0] || null
    })
  }
}