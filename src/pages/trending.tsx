import { useState } from 'react'
import Head from 'next/head'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Eye, Heart, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import type { TrendingVideo } from '@/types'

export default function Trending() {
  const [region, setRegion] = useState('KR')

  const { data: trendingVideos, isLoading, error } = useQuery({
    queryKey: ['trending', region],
    queryFn: async () => {
      const response = await fetch(`/api/youtube/trending?region=${region}&maxResults=25`)
      if (!response.ok) {
        throw new Error('Failed to fetch trending videos')
      }
      const result = await response.json()
      return result.data as TrendingVideo[]
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  })

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  return (
    <>
      <Head>
        <title>트렌딩 비디오 - ViewTrap Clone</title>
        <meta name="description" content="현재 트렌딩 중인 YouTube 비디오를 확인하세요" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="mr-3 h-8 w-8 text-blue-600" />
              트렌딩 비디오
            </h1>
            <p className="mt-2 text-gray-600">
              현재 가장 인기 있는 YouTube 비디오들을 확인하세요
            </p>
          </div>

          <div>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="KR">한국</option>
              <option value="US">미국</option>
              <option value="JP">일본</option>
              <option value="GB">영국</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                <div className="bg-gray-300 h-48 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-4 w-3/4"></div>
                  <div className="flex space-x-4">
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">
              트렌딩 비디오를 불러오는 중 오류가 발생했습니다.
            </p>
            <p className="text-sm text-red-500 mt-1">
              API 키가 설정되어 있는지 확인해주세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingVideos?.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="relative">
                  {video.thumbnailUrl && (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-semibold">
                    #{video.rankPosition}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {video.channelTitle}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {formatNumber(video.viewCount || 0)}
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {formatNumber(video.likeCount || 0)}
                      </div>
                    </div>
                    
                    {video.publishedAt && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(video.publishedAt), 'MM/dd')}
                      </div>
                    )}
                  </div>

                  {video.tags && video.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {video.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics */}
        {trendingVideos && trendingVideos.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">트렌드 분석</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(
                    trendingVideos.reduce((sum, video) => sum + (video.viewCount || 0), 0)
                  )}
                </p>
                <p className="text-sm text-gray-600">총 조회수</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(
                    trendingVideos.reduce((sum, video) => sum + (video.viewCount || 0), 0) / 
                    trendingVideos.length
                  ).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">평균 조회수</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {trendingVideos.length}
                </p>
                <p className="text-sm text-gray-600">트렌딩 비디오</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}