import { MOBILE_FOOTER_INNER_HTML } from "./footer-html";

/**
 * 모바일 메인 푸터 — legacy `mobile/inc/main_footer.html`(renewal-m-footer) 재현.
 * 완전 정적(브랜드 로고·소셜·회사정보·정책링크). base64 인라인 자산이라 외부 자산 복사 불필요.
 * 388KB 정적 SVG를 손 전사하면 오류 위험이 커, 원문을 그대로 주입해 DOM parity를 보장한다.
 * 외곽 `.appFooter.renewal-m-footer`를 root로 승격(legacy 구조 동일, 중복 래퍼 없음).
 */
export function MobileMainFooter() {
  return (
    <div
      className="appFooter renewal-m-footer"
      dangerouslySetInnerHTML={{ __html: MOBILE_FOOTER_INNER_HTML }}
    />
  );
}
