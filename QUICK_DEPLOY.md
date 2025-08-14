# 🚀 5분만에 배포하기 (Vercel + Supabase)

## 1단계: Supabase 데이터베이스 생성 (2분)

### 1. Supabase 계정 생성
- https://supabase.com 접속
- GitHub으로 로그인

### 2. 새 프로젝트 생성
```
Project name: viewtrap-clone
Database password: (강한 비밀번호 설정)
Region: Northeast Asia (Tokyo)
```

### 3. 데이터베이스 URL 복사
- Settings → Database
- Connection string 복사 (postgresql://...)

## 2단계: Vercel 배포 (2분)

### 1. GitHub에 코드 푸시
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/viewtrap-clone.git
git push -u origin main
```

### 2. Vercel에서 Import
- https://vercel.com 접속
- GitHub으로 로그인
- "Import Git Repository" 선택
- viewtrap-clone 저장소 선택

## 3단계: 환경 변수 설정 (1분)

Vercel 배포 화면에서 Environment Variables 설정:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=https://your-app-name.vercel.app
YOUTUBE_API_KEY=your-youtube-api-key
OPENAI_API_KEY=your-openai-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NODE_ENV=production
```

## 4단계: 배포 완료!

"Deploy" 버튼 클릭 → 2-3분 후 완료!

---

## 💡 API 키 발급 가이드

### YouTube API Key
1. Google Cloud Console → APIs & Services
2. YouTube Data API v3 활성화
3. Credentials → API Key 생성

### OpenAI API Key
1. https://platform.openai.com
2. API Keys → Create new secret key

### Google OAuth
1. Google Cloud Console → Credentials
2. OAuth 2.0 Client IDs 생성
3. Authorized redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`

---

## ⚡ 마이그레이션 시나리오

### 현재 → 나중에
- **Supabase (무료)** → **Vercel Postgres ($20/월)**
- **Vercel (무료)** → **Railway/AWS (확장성)**

### 마이그레이션 과정 (10분)
1. 새 데이터베이스 생성
2. `DATABASE_URL` 환경 변수 변경
3. `npx prisma migrate deploy` 실행
4. 데이터 마이그레이션 (필요시)

### 제로 다운타임 마이그레이션
- Vercel은 Blue-Green 배포 지원
- 환경 변수 변경 후 바로 적용
- 문제시 즉시 롤백 가능

---

## 📈 사용량별 비용 예측

| 사용자 수 | 월 비용 | 플랫폼 |
|-----------|---------|--------|
| ~1,000명 | **$0** | Vercel + Supabase 무료 |
| ~5,000명 | **$20** | Vercel + Vercel Postgres |
| ~50,000명 | **$100** | Railway/AWS + 전용 DB |

---

## 🔧 배포 후 체크리스트

- [ ] HTTPS 동작 확인
- [ ] Google OAuth 로그인 테스트
- [ ] YouTube API 트렌딩 페이지 동작
- [ ] OpenAI API 추천 기능 테스트
- [ ] 모바일 반응형 확인

배포가 완료되면 실제 URL을 공유해주세요! 🎉