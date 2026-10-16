"use client";

import { useEffect } from "react";

import type { SurveyResponse } from "@entities/survey";

interface MobileSurveyAccessGuardProps {
  accessError: Extract<SurveyResponse["accessError"], "closed" | "full">;
}

/** 모바일 설문 접근 차단 — legacy alert + history.go(-1). */
export function MobileSurveyAccessGuard({ accessError }: MobileSurveyAccessGuardProps) {
  useEffect(() => {
    const message =
      accessError === "closed" ? "종료된 설문입니다." : "참여인원이 마감된 설문입니다.";
    alert(message);
    history.go(-1);
  }, [accessError]);

  return null;
}
