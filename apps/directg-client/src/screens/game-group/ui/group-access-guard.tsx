"use client";

import { useEffect } from "react";

interface GroupAccessGuardProps {
  /** invalid=잘못된 접근, closed=기간밖(비관리자). */
  access: "invalid" | "closed";
}

/** legacy msg() 메시지 (verbatim). */
const MESSAGES: Record<GroupAccessGuardProps["access"], string> = {
  invalid: "잘못된 접근입니다.",
  closed: "프로모션 기간이 아닙니다. 일정을 확인해 주시기 바랍니다.",
};

/**
 * 그룹 접근제한 (legacy `msg($msg, "/")` = alert + `/` redirect 재현).
 * invalid: use_flag≠Y/미존재. closed: 기간밖 & 비관리자(관리자는 백엔드가 ok 반환).
 */
export function GroupAccessGuard({ access }: GroupAccessGuardProps) {
  useEffect(() => {
    alert(MESSAGES[access]);
    location.href = "/";
  }, [access]);

  return null;
}
