/**
 * API 타입 정의
 * @module api
 */

/**
 * 모임 생성 요청
 */
export interface CreateMoimRequest {
  /** 모임 이름 */
  moim_name?: string | null;
}

/**
 * 모임 응답
 */
export interface MoimResponse {
  /** 모임 ID (UUID) */
  id: string;
  /** 모임 이름 */
  moim_name?: string | null;
  /** 생성일시 */
  created_at?: string;
  /** 참여자 목록 */
  buddies?: Buddy[];
  /** 시간 슬롯 목록 */
  slots?: Slot[];
}

/**
 * 참여자 정보
 */
export interface Buddy {
  /** 참여자 ID */
  id: number;
  /** 모임 ID */
  moim: string;
  /** 참여자 이름 */
  name?: string;
  /** 생성일시 */
  created_at?: string;
}

/**
 * 시간 슬롯
 */
export interface Slot {
  /** 슬롯 ID */
  id: number;
  /** 모임 ID */
  moim: string;
  /** 참여자 ID */
  buddy?: number;
  /** 날짜 (YYYY-MM-DD) */
  date: string;
  /** 시작 시간 */
  begin?: string | null;
  /** 종료 시간 */
  end?: string | null;
  /** 투표 값 (1: 가능, -1: 불가능) */
  pick?: number;
  /** 고정 여부 */
  fix?: boolean;
  /** 생성일시 */
  created_at?: string;
}

/**
 * 슬롯 생성 요청
 */
export interface CreateSlotRequest {
  /** 모임 ID */
  moimId: string;
  /** 참여자 ID */
  buddyId: number;
  /** 날짜 (YYYY-MM-DD) */
  date: string;
  /** 시작 시간 (선택) */
  begin?: string | null;
  /** 종료 시간 (선택) */
  end?: string | null;
  /** 투표 값 (1: 가능, -1: 불가능, 기본값: 1) */
  pick?: number;
}

/**
 * 슬롯 업데이트 요청
 */
export interface UpdateSlotRequest {
  /** 모임 ID */
  moimId: string;
  /** 날짜 (YYYY-MM-DD) */
  date: string;
  /** 참여자 ID (선택) */
  buddyId?: number;
  /** 고정 여부 (선택) */
  fix?: boolean;
  /** 투표 값 (선택) */
  pick?: number;
}

/**
 * 추천 시간 슬롯 조회 파라미터
 */
export interface TopTimeslotsParams {
  /** 모임 ID */
  moimId: string;
  /** 연도 */
  year: number;
  /** 월 (1-12) */
  month: number;
}

/**
 * 추천 시간 슬롯 응답
 */
export interface TopTimeslotsResponse {
  /** 슬롯 목록 */
  slots: Slot[];
}

/**
 * 사용 불가능한 슬롯 조회 파라미터
 */
export interface UnavailableSlotsParams {
  /** 모임 ID */
  moimId: string;
  /** 연도 */
  year: number;
  /** 월 (1-12) */
  month: number;
}

/**
 * 사용 불가능한 슬롯 응답
 */
export interface UnavailableSlotsResponse {
  /** 날짜 키 목록 (YYYY-M-D 형식) */
  dates: string[];
}

/**
 * 에러 응답
 */
export interface ErrorResponse {
  /** 에러 메시지 */
  error: string;
}
