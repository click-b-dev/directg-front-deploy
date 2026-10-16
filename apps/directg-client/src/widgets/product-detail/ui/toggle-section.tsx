"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 게임설명/시스템요구사항 "전체보기" 섹션 (legacy initToggleContent/toggleContent).
 * 마운트 시 scrollHeight를 maxHeight와 비교해 접힘/펼침 초기화(legacy 500ms 지연),
 * 버튼 클릭 시 토글(펼침: max-height=scrollHeight, 접힘: max-height=maxHeight).
 */
export function ToggleSection({
  sectionId,
  contentId,
  title,
  html,
  maxHeight,
  variant = "game",
}: {
  sectionId: string;
  contentId: string;
  title: string;
  html: string;
  maxHeight: number;
  /** game(기본): 헤더 fw-bold py-3. dlc: 헤더 fw-500 + 본문 font-14(legacy dlc_view). */
  variant?: "game" | "dlc";
}) {
  const targetRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState<boolean | null>(null);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    // legacy: setTimeout(500) 후 초기화
    const timer = setTimeout(() => {
      if (el.scrollHeight > maxHeight) {
        el.style.maxHeight = `${maxHeight}px`;
        setCollapsed(true);
      } else {
        el.style.maxHeight = `${el.scrollHeight}px`;
        setCollapsed(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [maxHeight]);

  const toggle = () => {
    const el = targetRef.current;
    if (!el || collapsed === null) return;
    if (collapsed) {
      el.style.maxHeight = `${el.scrollHeight}px`;
      setCollapsed(false);
    } else {
      el.style.maxHeight = `${maxHeight}px`;
      setCollapsed(true);
    }
  };

  const contentBase =
    variant === "dlc" ? "card-body p-3 content-wrapper font-14" : "card-body p-3 content-wrapper";
  const contentClass =
    collapsed === null
      ? contentBase
      : `${contentBase} ${collapsed ? "content-collapsed" : "content-expanded"}`;
  const headerClass =
    variant === "dlc"
      ? "card-header text-white fw-500 font-16 bg-card"
      : "card-header text-white font-16 fw-bold bg-card py-3 border-0";

  return (
    <section id={sectionId} className="mb-4">
      <div className="card shadow-none rounded-0 border-0">
        <div className={headerClass}>{title}</div>
        <div
          ref={targetRef}
          className={contentClass}
          id={contentId}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      <div className="text-end mb-3">
        <hr />
        <button
          className="btn text-primary font-16 toggle-btn"
          type="button"
          data-target={`#${contentId}`}
          data-maxheight={maxHeight}
          onClick={toggle}
        >
          {collapsed === false ? "닫기" : "전체보기"}{" "}
          <img
            className={collapsed === false ? "reverseY" : undefined}
            src="/assets/images/icon/icon-arrow_down.svg"
          />
        </button>
      </div>
    </section>
  );
}
