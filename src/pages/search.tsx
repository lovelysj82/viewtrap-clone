import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useQuery } from '@tanstack/react-query'
import { Search as SearchIcon, Eye, Heart, Users, Calendar, Clock, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import type { SearchResult } from '@/types'

export default function Search() {
  const [inputQuery, setInputQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'videos' | 'channels'>('videos')
  const [recentSearches, setRecentSearches] = useState<string[]>([])

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
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

            {/* Videos Tab */}
            {!isLoading && !error && activeTab === 'videos' && searchResults?.videos && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {searchResults.videos.map((video) => (
                  <div key={video.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="relative group">
                      {video.thumbnailUrl && (
                        <a
                          href={`https://www.youtube.com/watch?v=${video.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block relative"
                        >
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-32 object-cover rounded-t-lg group-hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <ExternalLink className="h-6 w-6 text-white" />
                          </div>
                        </a>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <a
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <h3 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2 hover:text-blue-600 transition-colors">
                          {video.title}
                        </h3>
                      </a>
                      
                      <p className="text-xs text-gray-600 mb-2">
                        {video.channelTitle}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {formatNumber(video.viewCount || 0)}
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            {formatNumber(video.likeCount || 0)}
                          </div>
                        </div>
                        
                        {video.publishedAt && (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(video.publishedAt), 'MM/dd')}
                          </div>
                        )}
                      </div>

                      {video.tags && video.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {video.tags.slice(0, 2).map((tag, i) => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.channels.map((channel) => (
                  <div key={channel.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      {channel.thumbnailUrl ? (
                        <img
                          src={channel.thumbnailUrl}
                          alt={channel.title}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{channel.title}</h3>
                        {channel.customUrl && (
                          <p className="text-sm text-gray-500">@{channel.customUrl}</p>
                        )}
                      </div>
                    </div>

                    {channel.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {channel.description}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatNumber(channel.subscriberCount || 0)}
                        </p>
                        <p className="text-xs text-gray-500">구독자</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatNumber(channel.videoCount || 0)}
                        </p>
                        <p className="text-xs text-gray-500">동영상</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatNumber(channel.viewCount || 0)}
                        </p>
                        <p className="text-xs text-gray-500">조회수</p>
                      </div>
                    </div>
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
    </>
  )
}