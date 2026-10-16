"use client";

import { useState } from "react";

/**
 * 모바일 메인 헤더 — legacy `mobile/inc/main_header.html` 재현.
 * 메뉴(사이드바 #sidebarPanel 모달) + 로고 + 검색토글(#search .show) + 장바구니.
 * 검색폼: GET /game/game_search_thumb.html (q, minLength 2, required).
 * (legacy base.js `.toggle-searchbox`: #search .show 토글 + input focus. `directgames` 앱 UA 분기($isApp)는 후속.)
 */
export function MobileMainHeader() {
  const [searchShown, setSearchShown] = useState(false);

  return (
    <>
      <div className="appHeader">
        <div className="left">
          <a
            href="#"
            className="headerButton"
            data-bs-toggle="modal"
            data-bs-target="#sidebarPanel"
          >
            <img src="/mobile-assets/images/icon/menu_icon_white.svg" alt="메뉴" />
          </a>
        </div>
        <div className="pageTitle">
          <img src="/mobile-assets/img/logo_v2.png" alt="logo" className="logo" />
        </div>
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
              placeholder="Search..."
              minLength={2}
              required
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
