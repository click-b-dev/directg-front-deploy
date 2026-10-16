"use client";

import { useEffect } from "react";

interface WeekendAccessGuardProps {
  /** 미리보기 허용(관리자) — true면 alert만, false면 index로 redirect. */
  allowView: boolean;
}

/** legacy 주말특가 기간 접근제한 메시지 (개행 verbatim). */
const MESSAGE =
  "프로모션 기간이 아닙니다. \n주말특가 프로모션은 금요일 16시 ~ 월요일 16시에 진행됩니다. \n(단, 대규모 프로모션 기간은 제외)";

/**
 * 주말특가 접근제한 (legacy promotion_weekend.html is_view=N 분기 재현).
 * 기간 밖: alert. 관리자 IP(allowView) 아니면 index.php로 redirect.
 */
export function WeekendAccessGuard({ allowView }: WeekendAccessGuardProps) {
  useEffect(() => {
    alert(MESSAGE);
    if (!allowView) {
      location.href = "https://directg.net/index.php";
    }
  }, [allowView]);

  return null;
}
