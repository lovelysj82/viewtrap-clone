import React, { useState, useEffect } from 'react'

interface SimpleChannelModalProps {
  isOpen: boolean
  onClose: () => void
  channelId: string
  onVideoSelect?: (videoId: string, title: string) => void
}

interface ChannelVideo {
  id: string
  title: string
  thumbnailUrl?: string
  viewCount?: number
  publishedAt?: string
}

const SimpleChannelModal: React.FC<SimpleChannelModalProps> = ({ isOpen, onClose, channelId, onVideoSelect }) => {
  const [videos, setVideos] = useState<ChannelVideo[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && channelId) {
      setLoading(true)
      fetch(`/api/youtube/channel/${channelId}/videos`)
        .then(res => res.json())
        .then(data => {
          console.log('Channel videos data:', data)
          if (data.success) {
            setVideos(data.data)
          }
        })
        .catch(error => {
          console.error('Error fetching channel videos:', error)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [isOpen, channelId])

  if (!isOpen) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '600px',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#333', fontWeight: 'bold' }}>채널 영상 목록</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>
        
        <div>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
            채널 ID: {channelId}
          </p>
          
          {loading ? (
            <p style={{ color: '#333', textAlign: 'center', padding: '20px' }}>
              영상 목록을 불러오는 중...
            </p>
          ) : videos.length > 0 ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              {videos.slice(0, 10).map((video) => (
                <div 
                  key={video.id}
                  style={{
                    display: 'flex',
                    padding: '10px',
                    border: '1px solid #eee',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: '#fafafa'
                  }}
                  onClick={() => {
                    if (onVideoSelect) {
                      onVideoSelect(video.id, video.title)
                      onClose()
                    }
                  }}
                >
                  {video.thumbnailUrl && (
                    <img 
                      src={video.thumbnailUrl}
                      alt={video.title}
                      style={{
                        width: '120px',
                        height: '90px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        marginRight: '12px'
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '14px', 
                      color: '#333',
                      fontWeight: '500',
                      lineHeight: '1.3'
                    }}>
                      {video.title}
                    </h4>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '12px', 
                      color: '#888' 
                    }}>
                      조회수: {video.viewCount?.toLocaleString() || '정보 없음'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#333', textAlign: 'center', padding: '20px' }}>
              영상을 찾을 수 없습니다.
            </p>
          )}
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              onClick={onClose}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleChannelModal