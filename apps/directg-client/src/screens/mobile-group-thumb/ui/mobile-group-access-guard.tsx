"use client";

import { useEffect } from "react";

interface MobileGroupAccessGuardProps {
  /** invalid=잘못된 접근, closed=기간밖(비관리자). */
  access: "invalid" | "closed";
}

/** legacy msg() 메시지 (verbatim, mobile group_thumb/list 동일). */
const MESSAGES: Record<MobileGroupAccessGuardProps["access"], string> = {
  invalid: "잘못된 접근입니다.",
  closed: "프로모션 기간이 아닙니다. 일정을 확인해 주시기 바랍니다.",
};

/**
 * 모바일 그룹 접근제한 (legacy `msg($msg, "/")` = alert + `/` redirect 재현).
 * invalid: use_flag≠Y/미존재. closed: 기간밖 & 비관리자(관리자는 백엔드가 ok 반환).
 * PC `GroupAccessGuard`와 동일 동작 — 모바일 네임스페이스. mobile-group-list와 공유.
 */
export function MobileGroupAccessGuard({ access }: MobileGroupAccessGuardProps) {
  useEffect(() => {
    alert(MESSAGES[access]);
    location.href = "/";
  }, [access]);

  return null;
}
