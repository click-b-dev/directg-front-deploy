"use client";

import { useEffect, useState } from "react";

/**
 * footer 상단의 TOP 버튼. legacy `pc/index.php` 하단 인라인 스크립트 재현:
 * scrollY > 200 이면 `show` 클래스 부여, 클릭 시 최상단으로 smooth 스크롤.
 */
export function TopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 200);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      id="topBtn"
      className={show ? "show" : undefined}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <img src="/assets/images/icon/bytesize_chevron-top.svg" />
      <br />
      TOP
    </button>
  );
}
