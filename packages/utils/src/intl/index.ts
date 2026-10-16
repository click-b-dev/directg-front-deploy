/**
 * locale-aware 숫자/통화/날짜 포맷을 제공하는 Intl facade 모듈.
 *
 * 정의:
 * - `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`
 *   위에 얇은 래퍼를 제공해 앱 전반의 포맷 로직을 일관되게 만든다.
 * - 번역 메시지 관리가 아니라, 숫자/통화/날짜/상대 시간의 표현 형식만 책임진다.
 *
 * use case:
 * - SSR/CSR 모두에서 locale과 time zone을 명시적으로 넣어 재현 가능한 포맷을 만들 때
 * - `next-intl`, `react-intl` 같은 앱 레벨 i18n 라이브러리와 역할을 분리하고 싶을 때
 * - 기존 `date`, `number` 유틸의 하드코딩 포맷을 locale-aware 표기로 확장할 때
 *
 * out of scope:
 * - locale context 주입, 번역 키 관리, 라우팅 locale 결정
 * - 캘린더 계산, 타임존 변환 라이브러리 수준의 고급 date handling
 */

export type IntlDateTimeInput = Date | string | number;
export type IntlDateTimeOptions = Intl.DateTimeFormatOptions & {
  /** SSR/CSR 결과를 안정화하려면 가능한 한 명시적으로 전달한다. */
  timeZone?: string;
};

const toDate = (value: IntlDateTimeInput): Date => {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError("Invalid date value.");
  }

  return date;
};

/**
 * 일반 숫자를 locale-aware 포맷으로 변환한다.
 *
 * 인터페이스:
 * - 입력: 숫자 값, 선택적 locale, 선택적 `Intl.NumberFormatOptions`
 * - 출력: locale 규칙이 반영된 문자열
 */
export const formatNumber = (
  value: number,
  locale?: string,
  options?: Intl.NumberFormatOptions,
): string => {
  return new Intl.NumberFormat(locale, options).format(value);
};

/**
 * 통화를 locale-aware 포맷으로 변환한다.
 *
 * 인터페이스:
 * - 입력: 숫자 값, locale, ISO currency code, 선택적 number format 옵션
 * - 출력: 통화 기호/자릿수 규칙이 반영된 문자열
 */
export const formatCurrency = (
  value: number,
  locale: string,
  currency: string,
  options?: Intl.NumberFormatOptions,
): string => {
  return new Intl.NumberFormat(locale, {
    ...options,
    style: "currency",
    currency,
  }).format(value);
};

/**
 * 날짜/시간 값을 locale-aware 포맷으로 변환한다.
 *
 * 인터페이스:
 * - 입력: `Date | string | number`, 선택적 locale, 선택적 date/time 포맷 옵션
 * - 출력: locale과 timeZone 규칙이 반영된 날짜 문자열
 * - 실패: 유효하지 않은 날짜 입력이면 `TypeError`를 던진다
 */
export const formatDateTime = (
  value: IntlDateTimeInput,
  locale?: string,
  options?: IntlDateTimeOptions,
): string => {
  const { timeZone, ...dateTimeOptions } = options ?? {};

  return new Intl.DateTimeFormat(locale, {
    ...dateTimeOptions,
    ...(timeZone ? { timeZone } : {}),
  }).format(toDate(value));
};

/**
 * 수치 기반 상대 시간을 locale-aware 포맷으로 변환한다.
 *
 * 인터페이스:
 * - 입력: 상대 수치, 단위, 선택적 locale, 선택적 `Intl.RelativeTimeFormatOptions`
 * - 출력: `"3일 전"`, `"in 2 hours"` 같은 상대 시간 문자열
 *
 * @example
 * formatRelativeTime(-3, "day", "ko-KR"); // "3일 전"
 * formatRelativeTime(2, "hour", "en-US"); // "in 2 hours"
 */
export const formatIntlRelativeTime = (
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale?: string,
  options?: Intl.RelativeTimeFormatOptions,
): string => {
  return new Intl.RelativeTimeFormat(locale, options).format(value, unit);
};
