import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAIService } from '@/lib/openai'
import type { ApiResponse } from '@/types'

interface RecommendationRequest {
  type: 'title' | 'description' | 'tags'
  originalText: string
  title?: string
  description?: string
  tags?: string[]
  category?: string
}

interface RecommendationResponse {
  recommendations: string[]
  scores?: number[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<RecommendationResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { type, originalText, title, description, tags, category }: RecommendationRequest = req.body

  if (!type || !originalText) {
    return res.status(400).json({ 
      success: false, 
      error: 'Type and originalText are required' 
    })
  }

  try {
    const openaiService = OpenAIService.getInstance()
    let recommendations: string[] = []
    let scores: number[] = []

    switch (type) {
      case 'title':
        recommendations = await openaiService.generateTitleRecommendations(
          originalText,
          description,
          tags,
          category
        )
        // Score each title recommendation
        scores = await Promise.all(
          recommendations.map(title => openaiService.scoreTitle(title))
        )
        break

      case 'description':
        if (!title) {
          return res.status(400).json({ 
            success: false, 
            error: 'Title is required for description recommendations' 
          })
        }
        recommendations = await openaiService.generateDescriptionRecommendations(
          originalText,
          title,
          tags
        )
        break

      case 'tags':
        if (!title) {
          return res.status(400).json({ 
            success: false, 
            error: 'Title is required for tag recommendations' 
          })
        }
        recommendations = await openaiService.generateTagRecommendations(
          title,
          description,
          tags
        )
        break

      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid recommendation type' 
        })
    }

    const result: RecommendationResponse = {
      recommendations,
      ...(scores.length > 0 && { scores })
    }

    res.status(200).json({ success: true, data: result })
  } catch (error) {
    console.error('AI recommendations API error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate recommendations' 
    })
  }
}