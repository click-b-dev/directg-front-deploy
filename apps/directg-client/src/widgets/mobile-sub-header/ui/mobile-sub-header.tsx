"use client";

import { useState } from "react";

/**
 * 모바일 서브페이지 헤더 — legacy `mobile/inc/sub_header.html` 재현.
 * 뒤로가기(goBack) + pageTitle + 검색 토글(#search .show) + 장바구니 링크.
 * (legacy base.js의 goBack/toggle-searchbox 동작을 React로 재현. `directgames` 앱 UA 분기는 후속.)
 */
export function MobileSubHeader({ pageTitle }: { pageTitle: string }) {
  const [searchShown, setSearchShown] = useState(false);

  // legacy base.js goBack: referrer가 있으면 history.back, 없으면 "/".
  const handleGoBack = () => {
    if (document.referrer && document.referrer !== location.href) {
      history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <>
      <div className="appHeader bg-primary text-light mt-0">
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
        <div className="right">
          <a
            href="#"
            className="headerButton toggle-searchbox"
            onClick={(e) => {
              e.preventDefault();
              setSearchShown((v) => !v);
            }}
          >
            <div className="col">
              <img src="/mobile-assets/images/icon/search_icon_white.svg" alt="검색" />
            </div>
          </a>
          <a href="/order/cart" className="headerButton" title="장바구니">
            <div className="col">
              <img src="/mobile-assets/images/icon/basket_icon_white.svg" alt="장바구니" />
            </div>
          </a>
        </div>
      </div>

      {/* Search Component */}
      <div id="search" className={`appHeader${searchShown ? " show" : ""}`}>
        <form className="search-form" method="GET" action="/game/game_search_thumb">
          <div className="form-group searchbox bg-black">
            <input
              type="text"
              className="form-control"
              id="q"
              name="q"
              minLength={2}
              placeholder="Search..."
            />
            <i className="input-icon">
              <ion-icon name="search-outline"></ion-icon>
            </i>
            <a
              href="#"
              className="ms-1 close toggle-searchbox"
              onClick={(e) => {
                e.preventDefault();
                setSearchShown(false);
              }}
            >
              <ion-icon name="close-circle"></ion-icon>
            </a>
          </div>
        </form>
      </div>
      {/* * Search Component */}
    </>
  );
}
