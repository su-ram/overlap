# Overlap API 문서화

이 프로젝트는 Next.js + TypeDoc + openapi-typescript를 사용하여 API를 명세화합니다.

## 설치된 패키지

- **typedoc**: TypeScript 코드에서 API 문서 생성
- **openapi-typescript**: OpenAPI 스키마를 TypeScript 타입으로 변환
- **swagger-ui-react**: OpenAPI 스키마를 시각적으로 표시

## 사용 방법

### 1. OpenAPI 스키마 생성

```bash
npm run docs:openapi
```

이 명령어는 `openapi.json` 파일을 생성합니다. 이 파일은 `/public/openapi.json`에도 복사되어 API 문서 페이지에서 사용됩니다.

### 2. TypeScript 타입 생성 (OpenAPI 스키마에서)

```bash
npm run docs:types
```

이 명령어는 `openapi.json`을 기반으로 TypeScript 타입 정의 파일(`src/types/openapi.d.ts`)을 생성합니다.

### 3. TypeDoc 문서 생성

```bash
npm run docs:generate
```

이 명령어는 TypeScript 코드의 JSDoc 주석을 기반으로 API 문서를 `docs/api` 폴더에 생성합니다.

### 4. API 문서 페이지 확인

개발 서버를 실행한 후 다음 URL에서 Swagger UI를 통해 API 문서를 확인할 수 있습니다:

```
http://localhost:3000/api-docs
```

## API 엔드포인트

### 모임 (Moim)

- `POST /api/moim` - 모임 생성
- `GET /api/moim?id={uuid}` - 모임 조회

### 시간 슬롯 (Slot)

- `POST /api/slot` - 시간 슬롯 생성
- `GET /api/slot?moimId={id}&buddyId={id}&date={date}` - 시간 슬롯 조회
- `PATCH /api/slot` - 시간 슬롯 업데이트
- `DELETE /api/slot?moimId={id}&buddyId={id}&date={date}` - 시간 슬롯 삭제

### 추천 시간 슬롯

- `GET /api/top-timeslots?moimId={id}&year={year}&month={month}` - 추천 시간 슬롯 조회

### 사용 불가능한 슬롯

- `GET /api/unavailable-slots?moimId={id}&year={year}&month={month}` - 사용 불가능한 슬롯 조회

## 타입 정의

모든 API 타입은 `src/types/api.ts`에 정의되어 있습니다:

- `CreateMoimRequest`
- `MoimResponse`
- `CreateSlotRequest`
- `UpdateSlotRequest`
- `Slot`
- `Buddy`
- `TopTimeslotsResponse`
- `UnavailableSlotsResponse`
- `ErrorResponse`

## JSDoc 주석 작성 가이드

API 라우트 함수에 JSDoc 주석을 추가하여 TypeDoc 문서를 생성할 수 있습니다:

```typescript
/**
 * 모임 생성
 * @route POST /api/moim
 * @param {CreateMoimRequest} req.body - 모임 생성 요청 데이터
 * @returns {Promise<NextResponse<MoimResponse | ErrorResponse>>} 생성된 모임 정보 또는 에러
 */
export async function POST(req: Request) {
  // ...
}
```

## 파일 구조

```
overlap-web/
├── src/
│   ├── app/
│   │   ├── api/              # API 라우트
│   │   └── api-docs/         # API 문서 페이지
│   └── types/
│       ├── api.ts            # API 타입 정의
│       └── openapi.d.ts      # OpenAPI에서 생성된 타입
├── scripts/
│   └── generate-openapi.ts   # OpenAPI 스키마 생성 스크립트
├── docs/
│   └── api/                  # TypeDoc 생성 문서
├── public/
│   └── openapi.json          # OpenAPI 스키마 (정적 파일)
├── openapi.json              # OpenAPI 스키마 (루트)
└── typedoc.json              # TypeDoc 설정
```

## 업데이트 방법

1. API를 수정한 후 `src/types/api.ts`의 타입 정의를 업데이트합니다.
2. `scripts/generate-openapi.ts`를 수정하여 OpenAPI 스키마를 업데이트합니다.
3. `npm run docs:openapi`를 실행하여 `openapi.json`을 재생성합니다.
4. API 라우트에 JSDoc 주석을 추가/수정합니다.
5. `npm run docs:generate`를 실행하여 TypeDoc 문서를 재생성합니다.
