import { useState } from 'react'
import Head from 'next/head'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Eye, Heart, Play } from 'lucide-react'
import { format } from 'date-fns'
import type { TrendingVideo } from '@/types'
import VideoModal from '@/components/VideoModal'

export default function Trending() {
  const [region, setRegion] = useState('KR')
  const [selectedVideo, setSelectedVideo] = useState<{id: string, title: string} | null>(null)

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

  const handleVideoClick = (videoId: string, title: string) => {
    setSelectedVideo({ id: videoId, title })
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
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row bg-white rounded-lg shadow animate-pulse p-4">
                <div className="flex-shrink-0 mb-3 sm:mb-0 sm:mr-4">
                  <div className="bg-gray-300 w-full sm:w-16 h-16 sm:h-12 rounded-lg"></div>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
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
          <div className="space-y-4">
            {trendingVideos?.map((video) => (
              <div key={video.id} className="flex flex-col sm:flex-row bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4">
                {/* Left: Thumbnail with Rank */}
                <div className="flex-shrink-0 mb-3 sm:mb-0 sm:mr-4">
                  <button
                    onClick={() => handleVideoClick(video.id, video.title)}
                    className="block relative group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                  >
                    {video.thumbnailUrl && (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full sm:w-16 h-16 sm:h-12 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                      />
                    )}
                    <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-semibold">
                      #{video.rankPosition}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <Play className="h-8 w-8 text-white fill-current" />
                    </div>
                  </button>
                </div>
                
                {/* Right: Video Info */}
                <div className="flex-1 min-w-0">
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mb-2"
                  >
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                      {video.title}
                    </h3>
                  </a>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span>{video.channelTitle}</span>
                    {video.publishedAt && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{format(new Date(video.publishedAt), 'yyyy년 MM월 dd일')}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>조회수 {formatNumber(video.viewCount || 0)}회</span>
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      <span>좋아요 {formatNumber(video.likeCount || 0)}개</span>
                    </div>
                  </div>

                  {video.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {video.description}
                    </p>
                  )}

                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
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

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoId={selectedVideo.id}
          title={selectedVideo.title}
        />
      )}
    </>
  )
}