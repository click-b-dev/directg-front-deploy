"use client";

import { useEffect } from "react";

interface SeasonAccessGuardProps {
  /** 미리보기 허용(관리자) — true면 alert만, false면 index로 redirect. */
  allowView: boolean;
}

/**
 * 시즌 프로모션 기간 접근제한 (legacy promotion_season.html is_view=N 분기 재현).
 * 기간 밖: alert("프로모션 기간이 아닙니다."). 관리자 IP(allowView) 아니면 index.php로 redirect.
 */
export function SeasonAccessGuard({ allowView }: SeasonAccessGuardProps) {
  useEffect(() => {
    alert("프로모션 기간이 아닙니다.");
    if (!allowView) {
      location.href = "https://directg.net/index.php";
    }
  }, [allowView]);

  return null;
}
