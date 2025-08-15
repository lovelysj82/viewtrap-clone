import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { q } = req.query

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required' })
  }

  try {
    // YouTube의 비공식 자동완성 API 엔드포인트 사용
    const url = `https://clients1.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(q)}&hl=ko`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch suggestions')
    }

    const text = await response.text()
    
    // YouTube API는 JSONP 형태로 응답하므로 파싱 필요
    // 응답 형태: window.google.ac.h(["query", [["suggestion1"], ["suggestion2"], ...]])
    const match = text.match(/\[.*\]/)
    if (!match) {
      return res.status(200).json({ suggestions: [] })
    }

    const data = JSON.parse(match[0]) as [string, string[][]]
    const suggestions = data[1]?.map((item: string[]) => item[0])?.filter(Boolean) || []

    res.status(200).json({ suggestions })
  } catch (error) {
    console.error('Error fetching YouTube autocomplete:', error)
    
    // 에러 시 로컬 데이터로 폴백
    const fallbackSuggestions = getFallbackSuggestions(q as string)
    res.status(200).json({ suggestions: fallbackSuggestions })
  }
}

// 폴백용 로컬 데이터
function getFallbackSuggestions(query: string): string[] {
  const popularKeywords = [
    '뉴진스', '영어 공부법', '요리 레시피', '게임 실황', 'ASMR 수면',
    '운동 루틴', '메이크업 튜토리얼', '여행 브이로그', '주식 투자',
    '영어 회화', '다이어트 운동', '강아지 훈련', '넷플릭스 추천',
    '영어 잘하는 법', '간단한 요리', '홈트레이닝', '스킨케어 루틴'
  ]

  return popularKeywords
    .filter(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8)
}