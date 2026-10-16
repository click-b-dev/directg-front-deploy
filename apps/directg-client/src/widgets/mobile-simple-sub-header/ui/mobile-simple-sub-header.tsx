"use client";

/**
 * 모바일 서브페이지 최소 헤더 — legacy service 정적 페이지(`mobile/service/agreement.html` 등)의
 * 인라인 `div.appHeader.appHeaderSub.bg-primary.text-light` 재현.
 * 뒤로가기(goBack) + pageTitle + **빈 right**. `MobileSubHeader`(sub_header.html)와 달리
 * 검색 토글·장바구니 버튼이 없다(legacy service 헤더가 `.right`를 비워둠).
 * goBack은 legacy base.js 동작(referrer 있으면 history.back, 없으면 "/") 재현.
 */
export function MobileSimpleSubHeader({ pageTitle }: { pageTitle: string }) {
  const handleGoBack = () => {
    if (document.referrer && document.referrer !== location.href) {
      history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="appHeader appHeaderSub bg-primary text-light">
      <div className="left">
        <a
          href="#"
          className="headerButton goBack"
          data-rel="back"
          onClick={(e) => {
            e.preventDefault();
            handleGoBack();
          }}
        >
          <ion-icon name="chevron-back-outline"></ion-icon>
        </a>
      </div>
      <div className="pageTitle">{pageTitle}</div>
      <div className="right"></div>
    </div>
  );
}
