import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useQuery } from '@tanstack/react-query'
import { Search as SearchIcon, Eye, Heart, Users, Clock, Play } from 'lucide-react'
import { format } from 'date-fns'
import type { SearchResult } from '@/types'
import VideoModal from '@/components/VideoModal'
import ChannelModal from '@/components/ChannelModal'

export default function Search() {
  const [inputQuery, setInputQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'videos' | 'channels'>('videos')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedVideo, setSelectedVideo] = useState<{id: string, title: string} | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return null
      const response = await fetch(`/api/youtube/search?query=${encodeURIComponent(searchQuery)}&maxResults=20`)
      if (!response.ok) {
        throw new Error('Failed to search')
      }
      const result = await response.json()
      return result.data as SearchResult
    },
    enabled: !!searchQuery.trim(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Save search to localStorage
  const saveSearch = (query: string) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem('recent-searches', JSON.stringify(updated))
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputQuery.trim()) {
      setSearchQuery(inputQuery.trim())
      saveSearch(inputQuery.trim())
    }
  }

  const handleRecentSearch = (query: string) => {
    setInputQuery(query)
    setSearchQuery(query)
  }

  const handleVideoClick = (videoId: string, title: string) => {
    setSelectedVideo({ id: videoId, title })
  }

  const handleChannelClick = (channelId: string) => {
    setSelectedChannel(channelId)
  }

  return (
    <>
      <Head>
        <title>검색 - ViewTrap Clone</title>
        <meta name="description" content="YouTube 콘텐츠를 검색하고 분석하세요" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-4">
            <SearchIcon className="mr-3 h-8 w-8 text-blue-600" />
            콘텐츠 검색
          </h1>
          <p className="text-gray-600 mb-6">
            키워드로 YouTube 비디오와 채널을 검색하고 트렌드를 분석하세요
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="검색할 키워드를 입력하세요"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <SearchIcon className="h-5 w-5" />
                  <span className="font-medium">검색</span>
                </div>
              </button>
            </div>
          </form>

          {/* Recent Searches */}
          {recentSearches.length > 0 && !searchQuery && (
            <div className="max-w-2xl mt-4">
              <p className="text-sm text-gray-600 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                최근 검색어
              </p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((recent, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearch(recent)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {recent}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {searchQuery && (
          <>
            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`${
                      activeTab === 'videos'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                  >
                    비디오 ({searchResults?.videos.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('channels')}
                    className={`${
                      activeTab === 'channels'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                  >
                    채널 ({searchResults?.channels.length || 0})
                  </button>
                </nav>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col sm:flex-row bg-white rounded-lg shadow animate-pulse p-4">
                    <div className="flex-shrink-0 mb-3 sm:mb-0 sm:mr-4">
                      <div className="bg-gray-300 rounded-lg" style={{ width: '360px', height: '270px' }}></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded mb-2 w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600">
                  검색 중 오류가 발생했습니다.
                </p>
                <p className="text-sm text-red-500 mt-1">
                  API 키가 설정되어 있는지 확인해주세요.
                </p>
              </div>
            )}

            {/* Videos Tab - YouTube Style Layout */}
            {!isLoading && !error && activeTab === 'videos' && searchResults?.videos && (
              <div className="space-y-4">
                {searchResults.videos.map((video) => (
                  <div key={video.id} className="flex bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4">
                    {/* Left: Thumbnail */}
                    <div className="flex-shrink-0 mr-4">
                      <button
                        onClick={() => handleVideoClick(video.id, video.title)}
                        className="block relative group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                      >
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                          style={{ width: '360px', height: '270px', minWidth: '360px', minHeight: '270px', maxWidth: '360px', maxHeight: '270px' }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <Play className="h-8 w-8 text-white fill-current" />
                        </div>
                      </button>
                    </div>
                    
                    {/* Right: Video Info */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                          {video.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <button
                          onClick={() => handleChannelClick(video.channelId)}
                          className="flex items-center hover:text-blue-600 focus:outline-none focus:text-blue-600 transition-colors mr-2"
                        >
                          <div className="w-6 h-6 bg-gray-200 rounded-full mr-2 flex-shrink-0"></div>
                          {video.channelTitle}
                        </button>
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

            {/* Channels Tab */}
            {!isLoading && !error && activeTab === 'channels' && searchResults?.channels && (
              <div className="space-y-4">
                {searchResults.channels.map((channel) => (
                  <div key={channel.id} className="flex items-center bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4">
                    <button
                      onClick={() => handleChannelClick(channel.id)}
                      className="flex items-center flex-1 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                    >
                      <div className="flex-shrink-0 mr-4">
                        {channel.thumbnailUrl ? (
                          <img
                            src={channel.thumbnailUrl}
                            alt={channel.title}
                            className="rounded-full object-cover"
                            style={{ width: '200px', height: '200px', minWidth: '200px', minHeight: '200px' }}
                          />
                        ) : (
                          <div className="bg-gray-200 rounded-full flex items-center justify-center" style={{ width: '200px', height: '200px' }}>
                            <Users className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{channel.title}</h3>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span>구독자 {formatNumber(channel.subscriberCount || 0)}명</span>
                          <span>동영상 {formatNumber(channel.videoCount || 0)}개</span>
                        </div>
                        {channel.description && (
                          <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                            {channel.description}
                          </p>
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && searchResults && (
              activeTab === 'videos' ? 
                searchResults.videos.length === 0 && (
                  <div className="text-center py-12">
                    <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">검색 결과가 없습니다</h3>
                    <p className="mt-1 text-sm text-gray-500">다른 키워드로 검색해보세요.</p>
                  </div>
                ) :
                searchResults.channels.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">채널이 없습니다</h3>
                    <p className="mt-1 text-sm text-gray-500">다른 키워드로 검색해보세요.</p>
                  </div>
                )
            )}
          </>
        )}

        {/* Search suggestions when no query */}
        {!searchQuery && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">인기 검색어</h2>
            <div className="flex flex-wrap gap-2">
              {[
                '쇼츠', '브이로그', '게임', '요리', '음악', '리뷰', '튜토리얼', '코미디',
                'ASMR', '스포츠', '여행', '패션', '뷰티', '기술', '교육', '뉴스'
              ].map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => handleRecentSearch(keyword)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm transition-colors"
                >
                  {keyword}
                </button>
              ))}
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

      {/* Channel Modal */}
      {selectedChannel && (
        <ChannelModal
          isOpen={!!selectedChannel}
          onClose={() => setSelectedChannel(null)}
          channelId={selectedChannel}
          onVideoSelect={handleVideoClick}
        />
      )}
    </>
  )
}