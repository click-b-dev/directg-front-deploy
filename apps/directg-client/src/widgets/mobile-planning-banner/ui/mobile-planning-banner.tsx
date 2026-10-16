"use client";

import { useState } from "react";

/**
 * 모바일 기획배너 고정형 (legacy index.php adbox-320-55, 시즌 프로모션).
 * closebutton: legacy base.js `.adbox .closebutton` → 부모 `.adbox`에 `.hide` 추가(모달 아님).
 * 노출 여부(기간게이트)는 호출측(screen, 서버)에서 판정.
 */
export function MobilePlanningBanner() {
  const [hidden, setHidden] = useState(false);

  return (
    <div className="section">
      <div className={`adbox adbox-320-55 fixed${hidden ? " hide" : ""}`}>
        <a href="/promotion/promotion_season">
          <img
            src="https://image.directg.net/x8a5Yy5gI7"
            alt="다이렉트 게임즈 2026 여름 프로모션"
          />
        </a>
        <span className="closebutton" data-bs-dismiss="modal" onClick={() => setHidden(true)}>
          <ion-icon name="close-outline"></ion-icon>
        </span>
      </div>
    </div>
  );
}
