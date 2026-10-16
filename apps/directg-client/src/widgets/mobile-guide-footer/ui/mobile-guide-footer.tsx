"use client";

interface MobileGuideFooterProps {
  /** 뒤로가기 버튼 라벨. 기본 "뒤로가기"(guide 일반). Steam 등은 "뒤로 가기"(공백). */
  backLabel?: string;
  /** 게임 목록 링크 href. 기본 `/game/game.html`(guide 일반). */
  gameHref?: string;
  /** 게임 목록 버튼 라벨. 기본 "게임 목록"(guide 일반). */
  gameLabel?: string;
  /** 두 버튼에 덧붙일 클래스(예: legacy Steam step2의 `fs-6`). */
  buttonClassName?: string;
}

/**
 * 모바일 이용가이드 step 페이지 하단 버튼 — legacy `.carousel-button-footer`(guide 일반·플랫폼 가이드 공통).
 * 뒤로가기(goBack, dg_default.js 동작 재현: referrer 있으면 history.back, 없으면 "/") + 게임 목록 링크.
 * 기본값은 guide 일반(`뒤로가기`/`게임 목록`/`/game/game.html`) — 하위호환. props로 라벨/링크/추가클래스 재정의.
 */
export function MobileGuideFooter({
  backLabel = "뒤로가기",
  gameHref = "/game/game",
  gameLabel = "게임 목록",
  buttonClassName = "",
}: MobileGuideFooterProps = {}) {
  const handleGoBack = () => {
    if (document.referrer && document.referrer !== location.href) {
      history.back();
    } else {
      window.location.href = "/";
    }
  };

  const extra = buttonClassName ? ` ${buttonClassName}` : "";

  return (
    <div className="carousel-button-footer">
      <div className="row">
        <div className="col-6">
          <a
            href="#"
            className={`btn btn-secondary btn-block goBack${extra}`}
            onClick={(e) => {
              e.preventDefault();
              handleGoBack();
            }}
          >
            {backLabel}
          </a>
        </div>
        <div className="col-6">
          <a href={gameHref} className={`btn btn-primary btn-block${extra}`}>
            {gameLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
