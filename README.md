# 공강메이트 (GongGang Mate)

## 실행 방법

### 필요한 것
- Node.js 18 이상 (https://nodejs.org)

### 1단계 — 백엔드 실행 (터미널 1)

```bash
cd gonggangmate/backend
npm install
npm start
```

성공하면 이런 메시지가 뜹니다:
```
🎓 공강메이트 백엔드 서버 실행 중
📡 http://localhost:8080/api/v1/health
```

### 2단계 — 프론트엔드 실행 (터미널 2)

```bash
cd gonggangmate/frontend
npm install --legacy-peer-deps
npx expo start --web
```

브라우저에서 http://localhost:8081 이 자동으로 열립니다.

### 모바일 화면으로 보기
- Chrome에서 F12 → Ctrl+Shift+M → iPhone 12 Pro 선택 → 375pt

## 앱 흐름
앱 실행 → 학교 선택 → 시간표 등록 → 관심 태그 선택 → 홈 화면
