# Yorkie 기술 검토 보고서

## 1. 현재 시스템 분석

### 현재 아키텍처
- **데이터 저장**: Supabase (PostgreSQL)
- **동기화 방식**: 
  - REST API 기반 (POST, DELETE, GET, PATCH)
  - Supabase Realtime을 일부 사용 (`useRealtimeAvailability`, timetable 페이지)
  - 수동 새로고침 또는 폴링으로 데이터 동기화
- **데이터 구조**: 
  - `slot` 테이블: `moim`, `buddy`, `date`, `pick` 필드
  - 투표 정보는 각 slot 레코드로 저장

### 현재 문제점
1. **실시간 동기화 부족**: 투표 시 다른 사용자에게 즉시 반영되지 않음
2. **충돌 처리 미흡**: 동시 투표 시 race condition 가능성
3. **오프라인 지원 없음**: 네트워크 끊김 시 투표 불가
4. **수동 새로고침 필요**: 변경사항 확인을 위해 페이지 새로고침 필요

## 2. Yorkie 개요

### 핵심 기능
- **CRDT 기반 Document**: Conflict-free Replicated Data Types로 자동 충돌 해결
- **Presence**: 누가 현재 보고 있는지 실시간 추적
- **Channel**: 경량 실시간 통신 (Presence, 메시지 브로드캐스트)
- **오프라인 지원**: 네트워크 끊김 시에도 로컬 편집 가능, 재연결 시 자동 동기화
- **Cloud/Self-Hosted**: 클라우드 서비스 또는 자체 서버 운영 가능

### 아키텍처
```
Client (Next.js) ←→ Yorkie Server (Cloud/Self-Hosted) ←→ Database
```

## 3. Yorkie 도입 시 장점

### ✅ 실시간 동기화
- 투표 시 즉시 다른 사용자에게 반영
- Supabase Realtime보다 더 안정적인 동기화

### ✅ 자동 충돌 해결
- CRDT 기반으로 동시 편집 시 자동으로 충돌 해결
- 투표 데이터 일관성 보장

### ✅ 오프라인 지원
- 네트워크 끊김 시에도 투표 가능
- 재연결 시 자동으로 서버와 동기화

### ✅ Presence 기능
- 현재 누가 모임 페이지를 보고 있는지 실시간 표시
- 협업 경험 향상

### ✅ 성능
- 변경사항만 동기화 (전체 데이터 새로고침 불필요)
- 효율적인 네트워크 사용

## 4. Yorkie 도입 시 단점 및 고려사항

### ❌ 아키텍처 변경 필요
- 현재 REST API 기반 → Yorkie Document 기반으로 전환
- 데이터 구조 재설계 필요

### ❌ 학습 곡선
- CRDT 개념 이해 필요
- Yorkie SDK 학습 필요

### ❌ 인프라 비용
- Cloud 사용 시: 추가 비용 발생
- Self-Hosted: 서버 운영 및 관리 필요

### ❌ 데이터 마이그레이션
- 기존 Supabase 데이터를 Yorkie Document 형식으로 변환 필요
- 기존 API와의 호환성 고려

### ❌ 복잡도 증가
- 현재 단순한 REST API → Yorkie Document 관리 복잡도 증가
- 디버깅 난이도 상승

## 5. 도입 시나리오

### 시나리오 1: 하이브리드 접근
- **투표 데이터**: Yorkie Document로 관리 (실시간 동기화)
- **메타데이터**: Supabase에 유지 (모임 정보, 참여자 정보 등)
- **장점**: 점진적 도입 가능, 기존 시스템과 공존
- **단점**: 두 시스템 간 데이터 동기화 필요

### 시나리오 2: 완전 전환
- 모든 데이터를 Yorkie Document로 전환
- **장점**: 일관된 아키텍처
- **단점**: 대규모 리팩토링 필요

## 6. 대안 기술 비교

### Supabase Realtime (현재 부분 사용)
- ✅ 이미 사용 중, 추가 비용 없음
- ✅ PostgreSQL과 통합
- ❌ CRDT 기반이 아니어서 충돌 해결이 수동
- ❌ 오프라인 지원 제한적

### Yjs
- ✅ CRDT 기반, 오픈소스
- ✅ Supabase와 통합 가능
- ❌ 서버 인프라 직접 구축 필요
- ❌ Presence 기능 별도 구현 필요

### Firebase Realtime Database
- ✅ 실시간 동기화
- ❌ NoSQL 구조, 마이그레이션 필요
- ❌ 비용 구조 복잡

## 7. 권장사항

### 단기 (현재 시스템 개선)
1. **Supabase Realtime 확대 사용**
   - `slot` 테이블에 Realtime 구독 추가
   - 투표 변경 시 즉시 반영
   - 비용 증가 없음, 구현 난이도 낮음

2. **Optimistic Updates**
   - 투표 시 즉시 UI 업데이트
   - 서버 응답 대기 중에도 반영

### 중장기 (Yorkie 도입 검토)
1. **프로토타입 개발**
   - 소규모 기능에 Yorkie 적용 테스트
   - 성능 및 사용성 평가

2. **비용 분석**
   - Cloud vs Self-Hosted 비용 비교
   - 예상 사용량 기반 비용 산출

3. **점진적 도입**
   - 하이브리드 접근으로 시작
   - 투표 기능만 Yorkie로 전환
   - 성공 시 확대

## 8. 결론

**현재 단계에서는 Supabase Realtime 확대 사용을 권장합니다.**

**이유:**
- 추가 비용 없음
- 구현 난이도 낮음
- 기존 아키텍처와 호환
- 충분한 실시간 동기화 제공

**Yorkie 도입은 다음 경우에 고려:**
- 사용자 수가 크게 증가하여 충돌 빈도가 높아질 때
- 오프라인 지원이 필수 요구사항이 될 때
- 더 복잡한 협업 기능이 필요할 때

## 참고 자료
- [Yorkie 공식 문서](https://yorkie.dev/docs)
- [Yorkie GitHub](https://github.com/yorkie-team/yorkie)
- [CRDT 설명](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)
