import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Head from 'next/head'
import { useQuery } from '@tanstack/react-query'
import { Search as SearchIcon, Eye, Heart, Users, Clock, Play } from 'lucide-react'
import { format } from 'date-fns'
import type { SearchResult } from '@/types'
import SimpleModal from '@/components/SimpleModal'
import SimpleChannelModal from '@/components/SimpleChannelModal'

export default function Search() {
  const [inputQuery, setInputQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'videos' | 'channels'>('videos')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedVideo, setSelectedVideo] = useState<{id: string, title: string} | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [preventAutoComplete, setPreventAutoComplete] = useState(false)
  const isRecentSearchClick = useRef(false)
  const skipNextEffect = useRef(false)
  const [inputReadOnly, setInputReadOnly] = useState(false)

  // 인기 검색 키워드 및 문구 목록 (useMemo로 최적화)
  const popularKeywords = useMemo(() => [
    // K-POP 관련
    '뉴진스', 'NewJeans', 'BTS', '블랙핑크', 'BLACKPINK', 'IVE', 'aespa', '에스파',
    '아이브', '르세라핌', 'LE SSERAFIM', '(여자)아이들', 'ITZY', '있지',
    '뉴진스 신곡', 'BTS 콘서트', '블랙핑크 리사', '아이브 안유진', 'aespa 카리나',
    'K-POP 댄스', '케이팝 랜덤플레이', '아이돌 커버댄스', '케이팝 리액션',
    
    // 게임 관련
    '게임', '롤', '리그오브레전드', '배틀그라운드', '피파', '오버워치',
    '롤 하이라이트', '배그 핵', '피파 22', '오버워치 2', '발로란트',
    '게임 실황', '게임 공략', '게임 리뷰', '모바일 게임', '신작 게임',
    
    // 음식/요리 관련
    '먹방', '쿠킹', '요리', '레시피', '맛집', '음식',
    '요리 레시피', '간단한 요리', '맛집 추천', '집에서 만들기', '다이어트 음식',
    '백종원 레시피', '간편 요리', '혼밥 레시피', '술안주 만들기', '디저트 만들기',
    
    // 일상/브이로그 관련
    '브이로그', 'VLOG', '일상', '여행', '캠핑', '데이트',
    '일상 브이로그', '여행 브이로그', '캠핑 브이로그', '데이트 코스', '주말 일상',
    '혼자 여행', '국내 여행', '해외 여행', '맛집 투어', '카페 투어',
    
    // 뷰티/패션 관련
    '뷰티', '메이크업', '화장', '스킨케어', '패션', '코디',
    '메이크업 튜토리얼', '데일리 메이크업', '올리브영 추천', '스킨케어 루틴', '뷰티 리뷰',
    '옷 코디', '패션 하울', '신상 옷', '겨울 코디', '여름 코디',
    
    // 운동/건강 관련
    '운동', '헬스', '다이어트', '요가', '홈트', '필라테스',
    '홈트레이닝', '다이어트 운동', '살 빼는 법', '근력 운동', '스트레칭',
    '요가 따라하기', '필라테스 동작', '운동 루틴', '헬스장 운동', '복근 운동',
    
    // 기술/리뷰 관련
    '리뷰', '언박싱', '신제품', '아이폰', '갤럭시', '노트북',
    '아이폰 14', '갤럭시 S23', '맥북 리뷰', '노트북 추천', '핸드폰 비교',
    '언박싱 리뷰', '제품 리뷰', '가성비 제품', 'IT 리뷰', '전자제품 추천',
    
    // 영화/드라마/예능 관련
    '영화', '드라마', '예능', '웹드라마', '웹툰', '애니메이션',
    '넷플릭스 추천', '영화 리뷰', '드라마 추천', '예능 하이라이트', '웹툰 추천',
    '디즈니 플러스', '티빙 드라마', '애니메이션 추천', '로맨스 영화', '액션 영화',
    
    // ASMR/힐링 관련
    'ASMR', '힐링', '수면', '백색소음', '빗소리', '자연소리',
    'ASMR 수면', '빗소리 3시간', '백색소음 수면', '자연의 소리', '힐링 음악',
    '수면 유도', 'ASMR 먹방', 'ASMR 역할극', '명상 음악', '잠 잘 오는 소리',
    
    // 투자/경제 관련
    '주식', '투자', '부동산', '경제', '재테크', '코인',
    '주식 투자', '부동산 투자', '코인 투자', '재테크 방법', '용돈 벌기',
    '주식 초보', '투자 공부', '경제 뉴스', '돈 버는 법', '부업 추천',
    
    // 공부/교육 관련 (영어 중심으로 대폭 확장)
    '공부', '수험생', '토익', '영어', '일본어', '중국어',
    
    // 영어 관련 (유튜브에서 실제로 많이 검색되는 것들)
    '영어', '영어 공부법', '영어 잘하는 법', '영어 단어 500개', '영어 회화',
    '영어회화', '영어동요', '영어기초배우기', '영어듣기', '영어노래',
    '영어단어 쉽게 외우기', '영어회화 공부법', '영어단어', '영어공부',
    '영어발음', '영어문법', '영어독해', '영어작문', '영어말하기',
    '영어 패턴', '영어 표현', '영어 숙어', '영어 문장', '영어 기초',
    '영어 초보', '영어 왕초보', '영어 독학', '영어 강의', '영어 강좌',
    '영어 인강', '영어 무료', '영어 기본', '영어 기초회화', '영어 생활회화',
    '영어 비즈니스', '영어 면접', '영어 프레젠테이션', '영어 이메일',
    '영어 리스닝', '영어 스피킹', '영어 라이팅', '영어 리딩',
    '영어 TOEIC', '영어 TOEFL', '영어 IELTS', '영어 오픽',
    '영어 드라마', '영어 영화', '영어 팝송', '영어 뉴스', '영어 만화',
    
    // 기타 언어
    '토익 공부', '일본어 기초', '중국어 회화', '수능 공부',
    '일본어 히라가나', '중국어 발음', '공무원 시험',
    '토익 LC', '토익 RC', '일본어 배우기', '중국어 왕초보',
    
    // 반려동물 관련
    '반려동물', '강아지', '고양이', '펫', '동물', '새끼',
    '강아지 훈련', '고양이 키우기', '반려견 산책', '펫샵 브이로그', '동물 병원',
    '강아지 미용', '고양이 놀이', '반려동물 용품', '펫푸드 추천', '강아지 목욕',
    
    // 트렌드/엔터테인먼트 관련
    '쇼츠', 'Shorts', '밈', '짤', '유행', '챌린지',
    '틱톡 챌린지', '유튜브 쇼츠', '인스타 릴스', '밈 모음', '웃긴 영상',
    '바이럴 영상', '트렌드 댄스', '챌린지 모음', '개그 영상', '꿀잼 영상',
    
    // 스포츠 관련
    '스포츠', '축구', '야구', '농구', '배구', '올림픽',
    '월드컵', 'KBO 야구', 'NBA 농구', '손흥민', '이강인',
    '축구 하이라이트', '야구 홈런', '농구 덩크', '올림픽 하이라이트', '스포츠 뉴스'
  ], [])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // 로컬 폴백 함수를 useCallback으로 메모이제이션
  const getLocalSuggestions = useCallback((query: string): string[] => {
    const lowerQuery = query.toLowerCase()
    
    // 우선순위별 필터링
    const exactMatch = popularKeywords.filter(keyword => 
      keyword.toLowerCase() === lowerQuery
    )
    
    const startsWith = popularKeywords.filter(keyword => 
      keyword.toLowerCase().startsWith(lowerQuery) && keyword.toLowerCase() !== lowerQuery
    )
    
    const wordBoundary = popularKeywords.filter(keyword => {
      const lowerKeyword = keyword.toLowerCase()
      const index = lowerKeyword.indexOf(lowerQuery)
      return index > 0 && lowerKeyword[index - 1] === ' ' && 
             !lowerKeyword.startsWith(lowerQuery) && lowerKeyword !== lowerQuery
    })
    
    const contains = popularKeywords.filter(keyword => {
      const lowerKeyword = keyword.toLowerCase()
      const hasQuery = lowerKeyword.includes(lowerQuery)
      const isExact = lowerKeyword === lowerQuery
      const startsWithQuery = lowerKeyword.startsWith(lowerQuery)
      const hasWordBoundary = lowerKeyword.indexOf(lowerQuery) > 0 && lowerKeyword[lowerKeyword.indexOf(lowerQuery) - 1] === ' '
      
      return hasQuery && !isExact && !startsWithQuery && !hasWordBoundary
    })
    
    return [...exactMatch, ...startsWith, ...wordBoundary, ...contains].slice(0, 10)
  }, [popularKeywords])

  // 실제 YouTube 자동완성 API 호출
  useEffect(() => {
    console.log('useEffect triggered:', {
      inputQuery,
      skipNextEffect: skipNextEffect.current,
      isRecentSearchClick: isRecentSearchClick.current,
      preventAutoComplete,
      inputReadOnly
    })

    // 최근 검색어 클릭으로 인한 effect 실행이면 스킵
    if (skipNextEffect.current) {
      console.log('Effect skipped due to skipNextEffect flag')
      skipNextEffect.current = false
      return
    }

    // 최근 검색어나 인기 검색어 클릭 시 자동완성 완전 차단
    if (isRecentSearchClick.current || preventAutoComplete || inputReadOnly) {
      console.log('Effect blocked due to flags:', {
        isRecentSearchClick: isRecentSearchClick.current,
        preventAutoComplete,
        inputReadOnly
      })
      setShowSuggestions(false)
      setFilteredSuggestions([])
      setSelectedSuggestionIndex(-1)
      setIsLoadingSuggestions(false)
      return
    }

    const fetchSuggestions = async (query: string) => {
      // 다시 한번 플래그 확인
      if (isRecentSearchClick.current || preventAutoComplete) {
        return
      }

      setIsLoadingSuggestions(true)
      try {
        const response = await fetch(`/api/youtube/autocomplete?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        
        // API 호출 완료 후에도 플래그 확인
        if (isRecentSearchClick.current || preventAutoComplete) {
          setIsLoadingSuggestions(false)
          return
        }
        
        if (data.suggestions && data.suggestions.length > 0) {
          setFilteredSuggestions(data.suggestions.slice(0, 10))
          setShowSuggestions(true)
        } else {
          // API 응답이 없으면 로컬 데이터로 폴백
          const localSuggestions = getLocalSuggestions(query)
          setFilteredSuggestions(localSuggestions)
          setShowSuggestions(localSuggestions.length > 0)
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        // 에러 시에도 플래그 확인
        if (!isRecentSearchClick.current && !preventAutoComplete) {
          const localSuggestions = getLocalSuggestions(query)
          setFilteredSuggestions(localSuggestions)
          setShowSuggestions(localSuggestions.length > 0)
        }
      } finally {
        setIsLoadingSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    if (inputQuery.trim().length > 0) {
      // 딜레이를 추가하여 너무 자주 API 호출하지 않도록 함
      const delayTimer = setTimeout(() => {
        fetchSuggestions(inputQuery.trim())
      }, 300)

      return () => clearTimeout(delayTimer)
    } else {
      setShowSuggestions(false)
      setFilteredSuggestions([])
      setSelectedSuggestionIndex(-1)
      setIsLoadingSuggestions(false)
    }
  }, [inputQuery, getLocalSuggestions, preventAutoComplete])

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

  const handleRecentSearch = (e: React.MouseEvent, query: string) => {
    // 이벤트 전파 완전 차단
    e.preventDefault()
    e.stopPropagation()
    
    console.log('Recent search clicked:', query)
    
    // 1. 모든 플래그를 즉시 그리고 강력하게 설정
    isRecentSearchClick.current = true
    setPreventAutoComplete(true)
    skipNextEffect.current = true
    
    // 2. 자동완성 관련 모든 상태 즉시 차단
    setShowSuggestions(false)
    setFilteredSuggestions([])
    setSelectedSuggestionIndex(-1)
    setIsLoadingSuggestions(false)
    
    // 3. input 포커스 제거
    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement
    if (inputElement) {
      inputElement.blur()
    }
    
    // 4. input을 임시로 비활성화 (더 강력한 차단)
    setInputReadOnly(true)
    
    // 5. 즉시 검색어 설정 및 검색 실행
    setInputQuery(query)
    setSearchQuery(query)
    saveSearch(query)
    
    // 6. 1초 후 readOnly 해제 (더 안전하게)
    setTimeout(() => {
      setInputReadOnly(false)
      console.log('ReadOnly disabled after recent search')
    }, 1000)
    
    // 7. 10초 후 모든 플래그 해제 (매우 길게)
    setTimeout(() => {
      console.log('All flags cleared after recent search')
      setPreventAutoComplete(false)
      isRecentSearchClick.current = false
      skipNextEffect.current = false
    }, 10000)
  }

  const handleVideoClick = (videoId: string, title: string) => {
    console.log('Video clicked:', videoId, title)
    setSelectedVideo({ id: videoId, title })
    console.log('Selected video set to:', { id: videoId, title })
  }

  const handleChannelClick = (channelId: string) => {
    console.log('Channel clicked:', channelId)
    setSelectedChannel(channelId)
    console.log('Selected channel set to:', channelId)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputQuery(suggestion)
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    setFilteredSuggestions([])
    setSelectedSuggestionIndex(-1)
    saveSearch(suggestion)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    console.log('Input change:', newValue, 'readOnly:', inputReadOnly, 'isRecent:', isRecentSearchClick.current, 'preventAuto:', preventAutoComplete)
    
    // 최근 검색어 처리 중이거나 자동완성 차단 중이면 완전 무시
    if (inputReadOnly || isRecentSearchClick.current || preventAutoComplete) {
      console.log('Input change completely blocked')
      e.preventDefault()
      e.stopPropagation()
      return
    }
    
    setInputQuery(newValue)
    
    // 사용자가 직접 타이핑하는 경우에만 플래그 해제
    console.log('User typing detected, clearing flags if needed')
  }

  const handleInputFocus = () => {
    console.log('Input focus event:', {
      inputQuery: inputQuery.trim(),
      isRecentSearchClick: isRecentSearchClick.current,
      preventAutoComplete,
      inputReadOnly
    })
    
    // 최근 검색어 클릭 중이거나 자동완성이 차단된 상태면 무시
    if (isRecentSearchClick.current || preventAutoComplete || inputReadOnly) {
      console.log('Focus ignored due to flags')
      return
    }
    
    if (inputQuery.trim().length > 0 && filteredSuggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleInputBlur = () => {
    // 약간의 지연을 두어 suggestion 클릭이 가능하게 함
    setTimeout(() => {
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }, 200)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        )
        break
      case 'Enter':
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault()
          handleSuggestionClick(filteredSuggestions[selectedSuggestionIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
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
          <form onSubmit={handleSearch} className="max-w-2xl relative">
            <div className="flex">
              <input
                type="text"
                value={inputQuery}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                placeholder="검색할 키워드를 입력하세요"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoComplete="off"
                readOnly={inputReadOnly}
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
            
            {/* 자동완성 드롭다운 */}
            {(showSuggestions || isLoadingSuggestions) && !isRecentSearchClick.current && !preventAutoComplete && (
              <div className="absolute top-full left-0 right-12 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {isLoadingSuggestions ? (
                  <div className="px-4 py-3 text-gray-500 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                      검색어를 불러오는 중...
                    </div>
                  </div>
                ) : filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full text-left px-4 py-2 focus:outline-none transition-colors border-b border-gray-100 last:border-b-0 ${
                      index === selectedSuggestionIndex 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <SearchIcon className={`h-4 w-4 mr-3 ${
                        index === selectedSuggestionIndex ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                      <span>{suggestion}</span>
                    </div>
                  </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-center">
                    검색 결과가 없습니다
                  </div>
                )}
              </div>
            )}
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
                    onClick={(e) => handleRecentSearch(e, recent)}
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
                  onClick={(e) => handleRecentSearch(e, keyword)}
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
        <>
          {console.log('Rendering SimpleModal with selectedVideo:', selectedVideo)}
          <SimpleModal
            isOpen={!!selectedVideo}
            onClose={() => setSelectedVideo(null)}
            videoId={selectedVideo.id}
            title={selectedVideo.title}
          />
        </>
      )}

      {/* Channel Modal */}
      {selectedChannel && (
        <>
          {console.log('Rendering SimpleChannelModal with selectedChannel:', selectedChannel)}
          <SimpleChannelModal
            isOpen={!!selectedChannel}
            onClose={() => setSelectedChannel(null)}
            channelId={selectedChannel}
            onVideoSelect={handleVideoClick}
          />
        </>
      )}
    </>
  )
}