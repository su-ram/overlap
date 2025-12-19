// 대한민국 공휴일 정보 유틸리티 (date-holidays 사용)

import Holidays from 'date-holidays';

// 대한민국 공휴일 인스턴스 생성
const hd = new Holidays('KR');

type HolidayInfo = {
  date: string;
  start: Date;
  end: Date;
  name: string;
  type: string;
  [key: string]: any;
};

/**
 * 특정 날짜가 공휴일인지 확인
 */
export function isHoliday(date: Date): boolean {
  const holiday = hd.isHoliday(date);
  return holiday !== false;
}

/**
 * 특정 날짜의 공휴일 이름을 반환 (없으면 null)
 */
export function getHolidayName(date: Date): string | null {
  const holiday = hd.isHoliday(date);
  if (holiday === false) {
    return null;
  }
  
  // holiday는 배열일 수 있으므로 첫 번째 항목의 name 반환
  if (Array.isArray(holiday)) {
    const firstHoliday = holiday[0] as HolidayInfo;
    return firstHoliday?.name || null;
  }
  
  // holiday가 객체인 경우
  const holidayObj = holiday as HolidayInfo;
  return holidayObj?.name || null;
}



