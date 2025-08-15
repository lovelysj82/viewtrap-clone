import { useState, useEffect } from 'react'
import { X, ExternalLink, Play, Pause } from 'lucide-react'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoId: string
  title: string
}

export default function VideoModal({ isOpen, onClose, videoId, title }: VideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  console.log('VideoModal render with props:', { isOpen, videoId, title })

  useEffect(() => {
    console.log('VideoModal useEffect triggered with isOpen:', isOpen)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setIsPlaying(false) // 모달 열릴 때 항상 정지 상태로 시작
    } else {
      document.body.style.overflow = 'unset'
      setIsPlaying(false)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

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

  const togglePlay = () => {
    console.log('Toggle play clicked, current state:', isPlaying)
    setIsPlaying(!isPlaying)
  }

  if (!isOpen) {
    console.log('VideoModal not rendering because isOpen is false')
    return null
  }

  console.log('VideoModal rendering with isOpen true, isPlaying:', isPlaying, 'videoId:', videoId)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="relative w-full max-w-5xl mx-4 bg-black rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-900">
          <h3 className="text-white text-lg font-medium truncate pr-4">
            {title}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlay}
              className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
              title={isPlaying ? "정지" : "재생"}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
              title="YouTube에서 보기"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
              title="닫기 (ESC)"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Video Content */}
        <div className="relative w-full bg-black" style={{ aspectRatio: '16/9', minHeight: '400px' }}>
          {isPlaying ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ 
                border: 'none',
                width: '100%',
                height: '100%',
                backgroundColor: '#000'
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <button
                  onClick={togglePlay}
                  className="bg-red-600 hover:bg-red-700 text-white p-8 rounded-full transition-colors mb-6 shadow-lg"
                >
                  <Play className="h-16 w-16 fill-current ml-1" />
                </button>
                <h4 className="text-white text-xl font-medium px-8 max-w-2xl mx-auto leading-relaxed">
                  {title}
                </h4>
                <p className="text-gray-300 mt-3">클릭하여 재생</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}