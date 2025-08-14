import { useState } from 'react'
import Head from 'next/head'
import { useMutation } from '@tanstack/react-query'
import { Brain, Star, Copy, Check, Sparkles, FileText, Tag } from 'lucide-react'

type RecommendationType = 'title' | 'description' | 'tags'

interface RecommendationRequest {
  type: RecommendationType
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

export default function Recommendations() {
  const [activeTab, setActiveTab] = useState<RecommendationType>('title')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    category: ''
  })
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const recommendationMutation = useMutation({
    mutationFn: async (request: RecommendationRequest): Promise<RecommendationResponse> => {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error('Failed to get recommendations')
      }

      const result = await response.json()
      return result.data
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    let originalText = ''
    let requestData: RecommendationRequest

    switch (activeTab) {
      case 'title':
        originalText = formData.title
        requestData = {
          type: 'title',
          originalText,
          description: formData.description || undefined,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : undefined,
          category: formData.category || undefined,
        }
        break
      case 'description':
        originalText = formData.description
        requestData = {
          type: 'description',
          originalText,
          title: formData.title,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : undefined,
        }
        break
      case 'tags':
        originalText = formData.tags
        requestData = {
          type: 'tags',
          originalText,
          title: formData.title,
          description: formData.description || undefined,
        }
        break
    }

    if (!originalText.trim()) {
      alert('입력 내용을 확인해주세요.')
      return
    }

    recommendationMutation.mutate(requestData)
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100'
    if (score >= 6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <>
      <Head>
        <title>AI 추천 - ViewTrap Clone</title>
        <meta name="description" content="AI가 추천하는 최적화된 제목, 설명, 태그를 확인하세요" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-4">
            <Brain className="mr-3 h-8 w-8 text-blue-600" />
            AI 콘텐츠 최적화
          </h1>
          <p className="text-gray-600">
            AI가 분석한 최적화된 제목, 설명, 태그를 확인하고 적용하세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">콘텐츠 정보 입력</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="비디오 제목을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="비디오 설명을 입력하세요"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  태그 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="태그1, 태그2, 태그3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">카테고리 선택</option>
                  <option value="게임">게임</option>
                  <option value="음악">음악</option>
                  <option value="교육">교육</option>
                  <option value="엔터테인먼트">엔터테인먼트</option>
                  <option value="뉴스">뉴스</option>
                  <option value="스포츠">스포츠</option>
                  <option value="기술">기술</option>
                  <option value="여행">여행</option>
                  <option value="요리">요리</option>
                  <option value="뷰티">뷰티</option>
                </select>
              </div>

              {/* Recommendation Type Tabs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  추천받을 항목
                </label>
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setActiveTab('title')}
                    className={`${
                      activeTab === 'title'
                        ? 'bg-white text-blue-600 shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    } flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1`}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>제목</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('description')}
                    className={`${
                      activeTab === 'description'
                        ? 'bg-white text-blue-600 shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    } flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1`}
                  >
                    <FileText className="h-4 w-4" />
                    <span>설명</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('tags')}
                    className={`${
                      activeTab === 'tags'
                        ? 'bg-white text-blue-600 shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    } flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1`}
                  >
                    <Tag className="h-4 w-4" />
                    <span>태그</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={recommendationMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                {recommendationMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>AI 분석 중...</span>
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    <span>AI 추천 받기</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">AI 추천 결과</h2>
            
            {recommendationMutation.isPending && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">AI가 최적화 방안을 분석하고 있습니다...</p>
              </div>
            )}

            {recommendationMutation.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600">
                  AI 추천을 불러오는 중 오류가 발생했습니다.
                </p>
                <p className="text-sm text-red-500 mt-1">
                  OpenAI API 키가 설정되어 있는지 확인해주세요.
                </p>
              </div>
            )}

            {recommendationMutation.data && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">
                    {activeTab === 'title' && '제목 추천'}
                    {activeTab === 'description' && '설명 추천'}
                    {activeTab === 'tags' && '태그 추천'}
                  </span>
                </div>

                {recommendationMutation.data.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {recommendationMutation.data?.scores && (
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                                recommendationMutation.data.scores[index]
                              )}`}
                            >
                              <Star className="h-3 w-3 mr-1" />
                              {recommendationMutation.data.scores[index].toFixed(1)}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900 leading-relaxed">
                          {recommendation}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => copyToClipboard(recommendation, index)}
                        className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="클립보드에 복사"
                      >
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {activeTab === 'title' && recommendationMutation.data.scores && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">점수 가이드</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><span className="font-medium">8-10점:</span> 높은 클릭률이 예상됩니다</p>
                      <p><span className="font-medium">6-7점:</span> 보통 수준의 성과가 예상됩니다</p>
                      <p><span className="font-medium">5점 이하:</span> 개선이 필요합니다</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!recommendationMutation.data && !recommendationMutation.isPending && !recommendationMutation.error && (
              <div className="text-center py-12">
                <Brain className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">AI 추천을 받아보세요</h3>
                <p className="mt-1 text-sm text-gray-500">
                  콘텐츠 정보를 입력하고 AI 추천 받기 버튼을 클릭하세요.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">💡 최적화 팁</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-medium mb-2">제목 최적화</p>
              <ul className="space-y-1 text-gray-600">
                <li>• 60자 이내로 작성</li>
                <li>• 감정을 자극하는 단어 포함</li>
                <li>• 숫자나 특수문자 활용</li>
                <li>• 명확하고 구체적인 표현 사용</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">태그 최적화</p>
              <ul className="space-y-1 text-gray-600">
                <li>• 10-15개의 관련 태그 사용</li>
                <li>• 롱테일 키워드 포함</li>
                <li>• 경쟁이 낮은 니치 키워드</li>
                <li>• 트렌딩 키워드 활용</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}