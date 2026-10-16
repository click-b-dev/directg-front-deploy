"use client";

import { useEffect } from "react";

interface MobileWeekendAccessGuardProps {
  /** 미리보기 허용(관리자 IP) — true면 alert만, false면 홈 리다이렉트. */
  allowView: boolean;
}

/** legacy 모바일 주말특가 기간 접근제한 메시지(PC와 다름: \n 1개, "(단," 인라인). */
const MESSAGE =
  "프로모션 기간이 아닙니다. \n주말특가 프로모션은 금요일 16시 ~ 월요일 16시에 진행됩니다. (단, 대규모 프로모션 기간은 제외)";

/**
 * 모바일 주말특가 접근제한 (legacy `mobile/promotion/promotion_weekend.html` is_view=N 분기 재현).
 * 기간 밖: alert. 관리자 IP(allowView) 아니면 홈(`/`)으로 리다이렉트(legacy m.directg.net/index.php).
 */
export function MobileWeekendAccessGuard({ allowView }: MobileWeekendAccessGuardProps) {
  useEffect(() => {
    alert(MESSAGE);
    if (!allowView) {
      location.href = "/";
    }
  }, [allowView]);

  return null;
}
