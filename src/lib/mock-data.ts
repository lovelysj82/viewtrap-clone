import type { TrendingVideo, YouTubeVideo, YouTubeChannel } from '@/types'

export const mockTrendingVideos: TrendingVideo[] = [
  {
    id: 'mock-1',
    title: '🔥 2025년 가장 핫한 트렌드 예측! | 크리에이터가 알아야 할 필수 정보',
    description: '2025년에 주목해야 할 YouTube 트렌드를 미리 알아보세요!',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    viewCount: 1234567,
    likeCount: 89012,
    commentCount: 5678,
    publishedAt: new Date().toISOString(),
    tags: ['트렌드', '2025년', '크리에이터', 'YouTube'],
    categoryId: '22',
    channelId: 'mock-channel-1',
    channelTitle: '트렌드 연구소',
    rankPosition: 1,
    trendingDate: new Date().toISOString(),
    region: 'KR'
  },
  {
    id: 'mock-2', 
    title: '💡 AI가 추천하는 완벽한 썸네일 만들기 | 클릭률 300% 증가 비법',
    description: 'AI 도구를 활용해서 클릭률을 극대화하는 썸네일 제작법을 알려드립니다.',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    viewCount: 987654,
    likeCount: 67890,
    commentCount: 3456,
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    tags: ['AI', '썸네일', '클릭률', '디자인'],
    categoryId: '22',
    channelId: 'mock-channel-2',
    channelTitle: 'AI 크리에이터',
    rankPosition: 2,
    trendingDate: new Date().toISOString(),
    region: 'KR'
  },
  {
    id: 'mock-3',
    title: '📈 작은 채널도 성공할 수 있다! | 구독자 0명에서 10만명까지',
    description: '구독자가 적어도 성공할 수 있는 YouTube 성장 전략을 공개합니다.',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 
    viewCount: 654321,
    likeCount: 45678,
    commentCount: 2345,
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    tags: ['YouTube', '성장', '구독자', '전략'],
    categoryId: '22',
    channelId: 'mock-channel-3',
    channelTitle: 'YouTube 성장 가이드',
    rankPosition: 3,
    trendingDate: new Date().toISOString(),
    region: 'KR'
  }
]

export const mockSearchResults = {
  videos: [
    {
      id: 'search-1',
      title: '검색된 비디오 예시 - ViewTrap 클론 테스트',
      description: 'API 키가 설정되지 않았을 때 표시되는 목업 데이터입니다.',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      viewCount: 123456,
      likeCount: 8901,
      commentCount: 234,
      publishedAt: new Date().toISOString(),
      tags: ['테스트', '목업', 'ViewTrap'],
      channelId: 'mock-channel',
      channelTitle: '테스트 채널'
    }
  ] as YouTubeVideo[],
  channels: [
    {
      id: 'channel-1',
      title: '테스트 채널',
      description: 'ViewTrap 클론 테스트용 목업 채널입니다.',
      thumbnailUrl: 'https://yt3.ggpht.com/a/default-user=s88-c-k-c0x00ffffff-no-rj',
      subscriberCount: 50000,
      videoCount: 150,
      viewCount: 1000000,
      publishedAt: new Date().toISOString(),
      customUrl: '@testchannel',
      country: 'KR'
    }
  ] as YouTubeChannel[]
}

export const mockRecommendations = {
  title: [
    '🔥 이 제목으로 바꾸면 조회수 10배 증가!',
    '💡 클릭률 폭증하는 제목 작성법 대공개',
    '📈 유튜버들이 숨기고 싶어하는 제목의 비밀',
    '⚡ 3초만에 시선을 사로잡는 제목 만들기',
    '🎯 알고리즘이 좋아하는 제목 패턴 분석'
  ],
  description: [
    '이 비디오에서는 YouTube 크리에이터를 위한 최신 트렌드와 성공 전략을 자세히 다룹니다.\n\n📌 주요 내용:\n• 2025년 트렌드 예측\n• 효과적인 콘텐츠 제작법\n• 구독자 증가 비법\n\n🔗 더 많은 정보:\n• 블로그: example.com\n• 인스타그램: @creator\n\n#YouTube #크리에이터 #트렌드 #성장전략',
  ],
  tags: [
    'YouTube', '크리에이터', '트렌드', '2025년', '성장전략', 
    '구독자증가', '조회수', '콘텐츠제작', '유튜브팁', 'YouTuber',
    '영상제작', '썸네일', '제목작성법', 'AI추천', '분석'
  ]
}