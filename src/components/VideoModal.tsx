import { useState, useEffect, useRef } from 'react'
import { X, ExternalLink, Play, Pause } from 'lucide-react'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoId: string
  title: string
}

export default function VideoModal({ isOpen, onClose, videoId, title }: VideoModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setIsPlaying(false)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      setIsPlaying(false)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, videoId])

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

  const handlePlay = () => {
    setIsPlaying(true)
    setIsLoading(true)
  }

  const handleStop = () => {
    setIsPlaying(false)
    setIsLoading(false)
  }

  if (!isOpen) return null

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
            {isPlaying ? (
              <button
                onClick={handleStop}
                className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                title="정지"
              >
                <Pause className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handlePlay}
                className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                title="재생"
              >
                <Play className="h-5 w-5" />
              </button>
            )}
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

        {/* Video Player */}
        <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
          {!isPlaying ? (
            // Thumbnail and Play Button
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              <div className="text-center">
                <button
                  onClick={handlePlay}
                  className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-full transition-colors mb-4"
                >
                  <Play className="h-12 w-12 fill-current" />
                </button>
                <p className="text-white text-xl font-medium px-4">{title}</p>
              </div>
            </div>
          ) : (
            // Video iframe
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                key={`video-${videoId}-${Date.now()}`}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&fs=1&cc_load_policy=0&iv_load_policy=3&start=0&mute=0`}
                title={title}
                className="absolute top-0 left-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                onLoad={() => {
                  console.log('Video loaded')
                  setIsLoading(false)
                }}
                onError={(e) => {
                  console.error('Video error:', e)
                  setIsLoading(false)
                }}
                style={{ 
                  border: 'none',
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#000'
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}