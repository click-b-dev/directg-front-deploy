import type { PropsWithChildren } from "react";
import Script from "next/script";

import { getPromotionGroups } from "@entities/promotion-group";
import { getMemberSession } from "@entities/member-auth/api/get-member-session";
import { MobileBottomNav } from "@widgets/mobile-bottom-nav";
import { MobileDialogs } from "@widgets/mobile-dialogs";
import { MobileSidebar } from "@widgets/mobile-sidebar";

// legacy 모바일도 매 요청 SSR(세션/목록 실시간). 동적 렌더 유지.
export const dynamic = "force-dynamic";

type MobileLayoutProps = PropsWithChildren;

/**
 * 모바일 브랜치 레이아웃 — legacy 모바일 페이지의 공통 자산 스택 + 페이지 불변 chrome을 담당한다.
 * `<html>`/`<body>`(dark-mode-active)는 루트 레이아웃이 소유. 여기서 `<link>`/`<Script>`를 렌더해
 * Next가 `<head>`로 hoist하도록 한다(legacy mobile head: style.css/dg_style.css/styleguide.css + Material Icons + ionicons).
 * 서브페이지 헤더(pageTitle 가변)와 본문(appCapsuleSub)은 각 screen이 렌더한다.
 * sidebar(#sidebarPanel)는 홈·서브 공유 chrome이라 여기서 렌더(메뉴 버튼 data-bs-target 대상).
 * Bootstrap JS는 sidebar 모달/아코디언·dialog 모달 구동에 필요(legacy `bootstrap.min.js` 사본).
 */
export default async function MobileLayout({ children }: MobileLayoutProps) {
  const [member, promotionGroups] = await Promise.all([getMemberSession(), getPromotionGroups()]);
  const isLoggedIn = Boolean(member?.m_id);

  return (
    <>
      {/* legacy mobile head 자산 (public/mobile-assets/ 네임스페이스 복사본, ?t 버전쿼리 유지) */}
      <link rel="stylesheet" href="/mobile-assets/css/style.css?t=20251023" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Icons" />
      <link rel="stylesheet" href="/mobile-assets/css/dg_style.css?t=20251023" />
      <link rel="stylesheet" href="/mobile-assets/css/styleguide.css?t=20251023" />

      {/* Google tag (gtag.js) — legacy mobile sub_header.html: 로그인 시 user_id 포함 */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-S69YNEJF27"
        strategy="afterInteractive"
      />
      <Script id="gtag-config-mobile" strategy="afterInteractive">
        {isLoggedIn
          ? `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());var user_id = "${member?.m_no}";gtag('config', 'G-S69YNEJF27', {'user_id': user_id});`
          : `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-S69YNEJF27');`}
      </Script>

      {children}

      <MobileBottomNav isLoggedIn={isLoggedIn} />
      <MobileSidebar
        isLoggedIn={isLoggedIn}
        memberName={member?.name}
        promotionGroups={promotionGroups}
      />
      <MobileDialogs isLoggedIn={isLoggedIn} />

      {/* Bootstrap (모달/아코디언/offcanvas 인터랙션) — legacy `/assets/js/lib/bootstrap.min.js` 사본 */}
      <Script src="/mobile-assets/js/lib/bootstrap.min.js" strategy="afterInteractive" />

      {/* Ionicons (웹 컴포넌트 <ion-icon> 렌더용) — legacy 동일 CDN */}
      <Script
        type="module"
        src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"
        strategy="afterInteractive"
      />
    </>
  );
}
