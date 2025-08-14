# ViewTrap Clone

크리에이터를 위한 트렌드 리서치 및 콘텐츠 최적화 플랫폼

## 주요 기능

- 📈 YouTube 트렌드 분석
- 🎯 AI 기반 제목/썸네일 추천
- 📊 실시간 성과 대시보드
- 🔍 경쟁자 분석
- ⏰ 최적 업로드 시간 분석

## 기술 스택

- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Prisma
- **Database**: PostgreSQL + Redis
- **AI/ML**: OpenAI API
- **APIs**: YouTube Data API v3

## 개발 환경 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```bash
cp .env.example .env.local
```

### 3. 데이터베이스 설정 (선택사항)

실제 데이터베이스를 사용하려면:

```bash
# PostgreSQL 데이터베이스 마이그레이션
npx prisma migrate dev --name init

# Prisma Studio로 데이터베이스 확인
npx prisma studio
```

### 4. 개발 서버 실행

```bash
npm run dev
```

### 5. 빌드 및 테스트

```bash
# 타입 체크
npm run type-check

# 린터 실행
npm run lint

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

## 환경 변수

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```
YOUTUBE_API_KEY=your_youtube_api_key
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## 프로젝트 구조

```
src/
├── components/     # 재사용 가능한 UI 컴포넌트
├── pages/         # Next.js 페이지 컴포넌트
├── lib/           # 유틸리티 함수 및 설정
├── types/         # TypeScript 타입 정의
├── hooks/         # 커스텀 React 훅
└── utils/         # 헬퍼 함수
```