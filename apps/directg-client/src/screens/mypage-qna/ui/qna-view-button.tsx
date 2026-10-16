"use client";

import { useState } from "react";

import { postMypageQnaView } from "@entities/mypage-qna";

interface QnaViewButtonProps {
  idx: number;
  /** collapse 대상 id (`collapse-{index}`). */
  targetId: string;
}

/**
 * 답변보기 버튼 (legacy `.btn-show-answer`). Bootstrap collapse(data 속성)로 아코디언 토글하고,
 * **펼치는 전환**에서만 조회 로그(`mode=view` → replyStatus=1)를 fire-and-forget으로 남긴다.
 */
export function QnaViewButton({ idx, targetId }: QnaViewButtonProps) {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    const willExpand = !expanded;
    setExpanded(willExpand);
    if (willExpand) {
      void postMypageQnaView(idx);
    }
  };

  return (
    <button
      className="btn btn-sm btn-primary font-14 w-75 btn-show-answer"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target={`#${targetId}`}
      aria-expanded="false"
      aria-controls={`#${targetId}`}
      data-idx={idx}
      onClick={handleClick}
    >
      답변보기
    </button>
  );
}
