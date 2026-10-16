"use client";

import { useEffect, useRef } from "react";

/**
 * DLC "전체보기" 버튼 (legacy #dlc_btn). bootstrap collapse(`.multi-collapse`)는 data-bs-* 선언형으로 동작.
 * show/hidden.bs.collapse 이벤트에 맞춰 버튼 텍스트를 "닫기"↔"전체보기"로 토글(legacy 위임 핸들러).
 */
export function DlcCollapseButton() {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const onShow = () => {
      btn.innerHTML = '닫기 <img class="reverseY" src="/assets/images/icon/icon-arrow_down.svg">';
    };
    const onHidden = () => {
      btn.innerHTML = '전체보기 <img src="/assets/images/icon/icon-arrow_down.svg">';
    };
    document.addEventListener("show.bs.collapse", onShow);
    document.addEventListener("hidden.bs.collapse", onHidden);
    return () => {
      document.removeEventListener("show.bs.collapse", onShow);
      document.removeEventListener("hidden.bs.collapse", onHidden);
    };
  }, []);

  return (
    <div className="text-end mb-3">
      <hr />
      <button
        ref={btnRef}
        className="btn text-primary font-16"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target=".multi-collapse"
        aria-expanded="false"
        id="dlc_btn"
      >
        전체보기 <img src="/assets/images/icon/icon-arrow_down.svg" />
      </button>
    </div>
  );
}
