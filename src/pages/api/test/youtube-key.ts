import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const keysString = process.env.YOUTUBE_API_KEYS || process.env.YOUTUBE_API_KEY || ''
  const apiKeys = keysString.split(',').map(key => key.trim()).filter(Boolean)
  
  res.status(200).json({
    totalKeys: apiKeys.length,
    keyPrefixes: apiKeys.map(key => key.substring(0, 10)),
    env: process.env.NODE_ENV
  })
}