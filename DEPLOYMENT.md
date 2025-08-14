# 배포 가이드

## Vercel 배포 (추천)

### 1. Vercel 계정 생성 및 CLI 설치
```bash
npm install -g vercel
vercel login
```

### 2. 프로젝트 배포
```bash
vercel
```

### 3. 환경 변수 설정
Vercel 대시보드에서 또는 CLI로 설정:
```bash
vercel env add YOUTUBE_API_KEY
vercel env add OPENAI_API_KEY
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
```

### 4. 데이터베이스 설정 (Vercel Postgres)
```bash
# Vercel에서 PostgreSQL 추가
vercel postgres create

# 데이터베이스 URL 자동 설정됨
# Prisma 마이그레이션
npx prisma migrate deploy
```

## Railway 배포

### 1. Railway CLI 설치 및 로그인
```bash
npm install -g @railway/cli
railway login
```

### 2. 프로젝트 초기화
```bash
railway init
railway add postgresql
railway add redis
```

### 3. 환경 변수 설정
Railway 대시보드에서 환경 변수 설정

### 4. 배포
```bash
railway up
```

## 환경별 설정

### Production 환경 변수
```env
NEXTAUTH_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### 데이터베이스 마이그레이션
```bash
# 프로덕션 DB에 마이그레이션 적용
npx prisma migrate deploy

# 또는 Prisma 스키마 푸시
npx prisma db push
```

## 도메인 설정

### Vercel
1. Vercel 대시보드 → Domains
2. 커스텀 도메인 추가
3. DNS 설정 (A 레코드 또는 CNAME)

### Google OAuth 설정
프로덕션 URL로 승인된 리디렉션 URI 업데이트:
```
https://your-domain.com/api/auth/callback/google
```

## 성능 최적화

### Next.js 설정
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.ytimg.com', 'yt3.ggpht.com'],
  },
  // 프로덕션 최적화
  swcMinify: true,
  compress: true,
  // API 라우트 최적화
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
}
```

### 환경별 Prisma 설정
```json
// package.json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

## 모니터링

### Vercel Analytics
```bash
npm install @vercel/analytics
```

### 로그 모니터링
- Vercel Functions Logs
- Railway Logs
- Sentry (에러 추적)

## 백업 및 보안

### 데이터베이스 백업
- Vercel Postgres: 자동 백업
- Railway: Point-in-time recovery

### 보안 체크리스트
- [ ] 환경 변수 암호화
- [ ] CORS 설정
- [ ] Rate limiting 구현
- [ ] API 키 로테이션
- [ ] HTTPS 강제 설정