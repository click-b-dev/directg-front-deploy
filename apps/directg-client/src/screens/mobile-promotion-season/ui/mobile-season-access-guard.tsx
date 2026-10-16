"use client";

import { useEffect } from "react";

interface MobileSeasonAccessGuardProps {
  /** 미리보기 허용(관리자 IP) — true면 alert만, false면 홈 리다이렉트. */
  allowView: boolean;
}

/** legacy 모바일 시즌 프로모션 기간 접근제한 메시지(주말특가보다 짧음 — 부가 설명 없음). */
const MESSAGE = "프로모션 기간이 아닙니다.";

/**
 * 모바일 시즌 프로모션 접근제한 (legacy `mobile/promotion/promotion_season.html` is_view=N 분기 재현).
 * 기간 밖: alert. 관리자 IP(allowView) 아니면 홈(`/`)으로 리다이렉트(legacy m.directg.net/index.php).
 */
export function MobileSeasonAccessGuard({ allowView }: MobileSeasonAccessGuardProps) {
  useEffect(() => {
    alert(MESSAGE);
    if (!allowView) {
      location.href = "/";
    }
  }, [allowView]);

  return null;
}
