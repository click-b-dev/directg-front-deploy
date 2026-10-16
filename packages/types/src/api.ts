/**
 * API 공통 계약 타입.
 *
 * 정의:
 * - 백엔드 에러 응답의 공통 구조를 타입화한다.
 * - 2xx 성공 응답은 `T` 직접 반환이므로 별도 래퍼 타입을 두지 않는다.
 *
 * use case:
 * - `@click-b/api-client`의 에러 파싱 레이어
 * - 앱 레벨 에러 핸들링에서 서버 에러 본문 접근
 *
 * 지침:
 * - 도메인별 에러 코드 enum은 앱의 entities에서 정의한다.
 * - 이 타입은 구조 계약만 담당한다.
 */

export interface ApiErrorResponse {
  code: string;
  message: string;
  timestamp: string;
}
