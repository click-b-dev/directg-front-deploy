"use client";

import { useEffect } from "react";

/**
 * dev 전용 브라우저 MSW 부트스트랩. 마운트 시 worker를 시작해 client-side 요청(로그인/회원가입 등)을 가로챈다.
 * 렌더를 막지 않음(가입/로그인 fetch는 사용자 상호작용 시점이라 그때는 worker 준비 완료). 프로덕션에선 no-op.
 */
export function MswProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    void import("./browser").then(({ worker }) => worker.start({ onUnhandledRequest: "bypass" }));
  }, []);

  return null;
}
