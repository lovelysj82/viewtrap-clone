import { useEffect } from 'react'
import { X, Play, Eye, Heart, ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import type { YouTubeVideo, YouTubeChannel } from '@/types'

interface ChannelModalProps {
  isOpen: boolean
  onClose: () => void
  channelId: string
  onVideoSelect: (videoId: string, title: string) => void
}

export default function ChannelModal({ isOpen, onClose, channelId, onVideoSelect }: ChannelModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Fetch channel details
  const { data: channelDetails } = useQuery({
    queryKey: ['channel', channelId],
    queryFn: async () => {
      const response = await fetch(`/api/youtube/channel/${channelId}`)
      if (!response.ok) throw new Error('Failed to fetch channel')
      const result = await response.json()
      return result.data as YouTubeChannel
    },
    enabled: !!channelId && isOpen,
  })

  // Fetch channel videos
  const { data: channelVideos, isLoading } = useQuery({
    queryKey: ['channel-videos', channelId],
    queryFn: async () => {
      const response = await fetch(`/api/youtube/channel/${channelId}/videos`)
      if (!response.ok) throw new Error('Failed to fetch channel videos')
      const result = await response.json()
      return result.data as YouTubeVideo[]
    },
    enabled: !!channelId && isOpen,
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleVideoClick = (videoId: string, title: string) => {
    onVideoSelect(videoId, title)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={onClose}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            돌아가기
          </button>
          <div className="flex items-center flex-1">
            {channelDetails?.thumbnailUrl && (
              <img
                src={channelDetails.thumbnailUrl}
                alt={channelDetails.title}
                className="w-8 h-8 rounded-full object-cover mr-3"
              />
            )}
            <div>
              <h3 className="font-medium text-gray-900">{channelDetails?.title}</h3>
              <p className="text-sm text-gray-500">
                구독자 {formatNumber(channelDetails?.subscriberCount || 0)}명
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex bg-gray-100 rounded-lg animate-pulse p-3">
                  <div className="flex-shrink-0 mr-3">
                    <div className="bg-gray-300 w-16 h-12 rounded-lg"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {channelVideos?.map((video) => (
                <div key={video.id} className="flex bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <button
                    onClick={() => handleVideoClick(video.id, video.title)}
                    className="flex w-full text-left p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                  >
                    <div className="flex-shrink-0 mr-3">
                      <div className="relative group">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-16 h-12 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <Play className="h-6 w-6 text-white fill-current" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">
                        {video.title}
                      </h4>
                      <div className="flex items-center text-sm text-gray-500 space-x-3">
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          <span>{formatNumber(video.viewCount || 0)}</span>
                        </div>
                        <div className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          <span>{formatNumber(video.likeCount || 0)}</span>
                        </div>
                        {video.publishedAt && (
                          <span>{format(new Date(video.publishedAt), 'yyyy.MM.dd')}</span>
                        )}
                      </div>
                      {video.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}