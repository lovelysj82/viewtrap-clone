import { kv } from '@vercel/kv'

// 인메모리 캐시 (개발용)
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

const memoryCache = new Map<string, CacheItem<any>>()

export class CacheService {
  private static instance: CacheService
  private isKvAvailable: boolean
  private useMemoryCache: boolean

  constructor() {
    // Vercel KV가 사용 가능한지 확인
    this.isKvAvailable = !!process.env.KV_URL || !!process.env.KV_REST_API_URL
    // 개발 환경에서는 인메모리 캐시 사용
    this.useMemoryCache = !this.isKvAvailable && process.env.NODE_ENV === 'development'
    
    console.log('Cache service initialized:', {
      kvAvailable: this.isKvAvailable,
      memoryCache: this.useMemoryCache,
      environment: process.env.NODE_ENV
    })
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  // 캐시 키 생성
  private getCacheKey(type: string, params: Record<string, any>): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|')
    return `yt:${type}:${Buffer.from(paramString).toString('base64').slice(0, 50)}`
  }

  // 캐시에서 데이터 가져오기
  async get<T>(type: string, params: Record<string, any>): Promise<T | null> {
    const key = this.getCacheKey(type, params)
    
    // 인메모리 캐시 먼저 확인 (개발용)
    if (this.useMemoryCache) {
      const cached = memoryCache.get(key)
      if (cached) {
        const now = Date.now()
        if (now - cached.timestamp > cached.ttl * 1000) {
          console.log(`Memory Cache EXPIRED: ${key}`)
          memoryCache.delete(key)
          return null
        }
        console.log(`Memory Cache HIT: ${key}`)
        return cached.data
      }
      console.log(`Memory Cache MISS: ${key}`)
      return null
    }

    // Vercel KV 사용
    if (!this.isKvAvailable) {
      return null
    }

    try {
      console.log(`Cache GET: ${key}`)
      
      const cached = await kv.get<{
        data: T
        timestamp: number
        ttl: number
      }>(key)

      if (!cached) {
        console.log(`Cache MISS: ${key}`)
        return null
      }

      // TTL 확인
      const now = Date.now()
      if (now - cached.timestamp > cached.ttl * 1000) {
        console.log(`Cache EXPIRED: ${key}`)
        await kv.del(key)
        return null
      }

      console.log(`Cache HIT: ${key}`)
      return cached.data
    } catch (error) {
      console.error('Cache GET error:', error)
      return null
    }
  }

  // 캐시에 데이터 저장
  async set<T>(
    type: string, 
    params: Record<string, any>, 
    data: T, 
    ttlSeconds: number = 3600
  ): Promise<void> {
    const key = this.getCacheKey(type, params)
    
    // 인메모리 캐시에 저장 (개발용)
    if (this.useMemoryCache) {
      console.log(`Memory Cache SET: ${key} (TTL: ${ttlSeconds}s)`)
      const cacheData: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlSeconds
      }
      memoryCache.set(key, cacheData)
      
      // 메모리 캐시 크기 제한 (최대 100개)
      if (memoryCache.size > 100) {
        const firstKey = memoryCache.keys().next().value
        if (firstKey) {
          memoryCache.delete(firstKey)
        }
      }
      return
    }

    // Vercel KV에 저장
    if (!this.isKvAvailable) {
      return
    }

    try {
      console.log(`Cache SET: ${key} (TTL: ${ttlSeconds}s)`)
      
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl: ttlSeconds
      }

      await kv.set(key, cacheData, { ex: ttlSeconds + 60 }) // 여유분 60초 추가
    } catch (error) {
      console.error('Cache SET error:', error)
    }
  }

  // 캐시 삭제
  async delete(type: string, params: Record<string, any>): Promise<void> {
    if (!this.isKvAvailable) {
      return
    }

    try {
      const key = this.getCacheKey(type, params)
      console.log(`Cache DELETE: ${key}`)
      await kv.del(key)
    } catch (error) {
      console.error('Cache DELETE error:', error)
    }
  }

  // 패턴으로 캐시 삭제 (주의: 많은 키가 있을 때 성능 주의)
  async deletePattern(pattern: string): Promise<void> {
    if (!this.isKvAvailable) {
      return
    }

    try {
      console.log(`Cache DELETE PATTERN: ${pattern}`)
      // Vercel KV는 scan을 지원하지 않으므로 개별 삭제 필요
      // 실제 구현시에는 키 목록을 별도로 관리하거나 다른 방법 사용
    } catch (error) {
      console.error('Cache DELETE PATTERN error:', error)
    }
  }

  // 캐시 통계
  async getStats(): Promise<{ 
    kvAvailable: boolean
    memoryCache: boolean
    memoryCacheSize?: number
    environment: string 
  }> {
    return {
      kvAvailable: this.isKvAvailable,
      memoryCache: this.useMemoryCache,
      memoryCacheSize: this.useMemoryCache ? memoryCache.size : undefined,
      environment: process.env.NODE_ENV || 'unknown'
    }
  }
}

// 미리 정의된 TTL 상수들
export const CACHE_TTL = {
  // 트렌딩 데이터 - 1시간 (자주 변하지 않음)
  TRENDING: 3600,
  
  // 검색 결과 - 30분 (중간 정도)
  SEARCH: 1800,
  
  // 채널 정보 - 24시간 (거의 변하지 않음)
  CHANNEL: 86400,
  
  // 비디오 상세 정보 - 6시간
  VIDEO_DETAILS: 21600,
  
  // 자동완성 - 1시간
  AUTOCOMPLETE: 3600,
  
  // 채널 비디오 목록 - 2시간
  CHANNEL_VIDEOS: 7200
} as const