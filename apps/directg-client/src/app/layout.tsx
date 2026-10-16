import type { PropsWithChildren } from "react";
import { headers } from "next/headers";

import { MswProvider } from "@shared/mocks/msw-provider";

// legacy는 PHP 매 요청 SSR(배너/공지/프로모션 실시간) — 정적 생성이 아닌 동적 렌더로 parity 유지.
// (빌드 프리렌더 워커에는 MSW가 적용되지 않으므로 SSR 데이터 fetch도 런타임으로 미룬다.)
export const dynamic = "force-dynamic";

type RootLayoutProps = PropsWithChildren;

/**
 * 루트 레이아웃 — PC/모바일 공통 골격만 담당한다.
 * - `<head>` 공유 자산은 Noto Sans KR 폰트뿐(legacy PC·모바일 모두 로드).
 * - PC 전용 자산/셸은 `app/(pc)/layout.tsx`, 모바일 전용은 `app/m/layout.tsx`가 담당.
 * - 브랜치 판정은 middleware가 세팅한 `x-viewport` 헤더 기준. legacy는 PC `data-bs-theme="dark"`,
 *   모바일 `<body class="dark-mode-active">`로 테마가 달라 `<html>`/`<body>` 속성을 여기서 분기한다.
 */
export default async function RootLayout({ children }: RootLayoutProps) {
  const isMobile = (await headers()).get("x-viewport") === "mobile";

  return (
    <html lang="ko" data-bs-theme={isMobile ? undefined : "dark"}>
      <head>
        {/* 공유 폰트 (legacy PC·모바일 공통) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap"
        />
      </head>
      <body data-project="directg-client" className={isMobile ? "dark-mode-active" : undefined}>
        {/* dev 전용 브라우저 MSW 부트스트랩 (client-side 로그인/회원가입 요청 mock) */}
        <MswProvider />
        {children}
      </body>
    </html>
  );
}
