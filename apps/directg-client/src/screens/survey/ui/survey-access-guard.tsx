"use client";

import { useEffect } from "react";

import type { SurveyResponse } from "@entities/survey";

interface SurveyAccessGuardProps {
  /** closed=종료, full=인원마감 (둘 다 alert + history.back). */
  accessError: Extract<SurveyResponse["accessError"], "closed" | "full">;
}

/**
 * 설문 접근 차단 (legacy survey.html 조건 체크 재현).
 * closed → "종료된 설문입니다.", full → "참여인원이 마감된 설문입니다." + history.go(-1).
 */
export function SurveyAccessGuard({ accessError }: SurveyAccessGuardProps) {
  useEffect(() => {
    const message =
      accessError === "closed" ? "종료된 설문입니다." : "참여인원이 마감된 설문입니다.";
    alert(message);
    history.go(-1);
  }, [accessError]);

  return null;
}
