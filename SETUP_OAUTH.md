# Google OAuth 설정 가이드

## 1. Google Cloud Console 설정

### 1단계: 프로젝트 생성
1. https://console.cloud.google.com 접속
2. 새 프로젝트 생성: "ViewTrap Clone"

### 2단계: OAuth 동의 화면 설정
1. APIs & Services → OAuth consent screen
2. External 선택
3. 필수 정보 입력:
   - App name: ViewTrap Clone
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com

### 3단계: OAuth 클라이언트 생성
1. APIs & Services → Credentials
2. Create Credentials → OAuth 2.0 Client IDs
3. Application type: Web application
4. Name: ViewTrap Clone Web Client
5. Authorized redirect URIs 추가:
   - http://localhost:3000/api/auth/callback/google (개발용)
   - https://your-app-name.vercel.app/api/auth/callback/google (배포용)

### 4단계: 클라이언트 ID와 Secret 복사
- Client ID와 Client Secret을 .env.local에 추가

## 2. 환경 변수 업데이트

```env
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
```

## 빠른 테스트 (OAuth 없이)

OAuth 설정 전에도 앱은 작동합니다:
- 로그인 없이 모든 페이지 접근 가능
- 트렌딩, 검색, AI 추천 기능 모두 사용 가능
- Mock 데이터로 완전한 데모 경험 제공

OAuth는 나중에 설정해도 됩니다!