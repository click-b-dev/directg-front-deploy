import type { PropsWithChildren } from "react";
import Script from "next/script";

import { getPromotionGroups } from "@entities/promotion-group";
import { getSearchRecommendations } from "@entities/search-recommendation";
import { getMemberSession } from "@entities/member-auth/api/get-member-session";
import { SiteHeader } from "@widgets/site-header";
import { SiteFooter } from "@widgets/site-footer";

// legacy pc/index.php는 매 요청 SSR(배너/공지/프로모션 실시간). PC 브랜치도 동적 렌더 유지.
export const dynamic = "force-dynamic";

type PcLayoutProps = PropsWithChildren;

/**
 * PC(데스크톱) 브랜치 레이아웃 — legacy `pc/inc/header.html`·`footer.html` + head 자산 스택 재현.
 * `<html>`/`<body>` 태그는 루트 레이아웃이 소유하며, 여기서는 `<link>`/`<Script>`를 렌더해
 * Next가 `<head>`로 hoist하도록 한다(legacy pc/index.php head와 동일 URL·버전·integrity).
 */
export default async function PcLayout({ children }: PcLayoutProps) {
  const [promotionGroups, searchRecommendations, member] = await Promise.all([
    getPromotionGroups(),
    getSearchRecommendations(),
    getMemberSession(),
  ]);

  return (
    <>
      {/* legacy pc/index.php head 자산 스택 — 동일 URL·버전·integrity 재현 */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7"
        crossOrigin="anonymous"
      />
      {/* 로컬 CSS (public/assets/css/ 무수정 복사) */}
      <link href="/assets/css/custom.css" rel="stylesheet" />
      <link href="/assets/css/directg.css" rel="stylesheet" />
      <link href="/assets/css/styleguide.css" rel="stylesheet" />

      {/* 추적코드 (legacy 동일, 항상 로드) — Google Tag Manager */}
      <Script id="gtm-loader" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KH8W35P3');`}
      </Script>
      {/* Google tag (gtag.js) — 세션 미정으로 비로그인 config(user_id 없음) 고정 */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-S69YNEJF27"
        strategy="afterInteractive"
      />
      <Script id="gtag-config" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-S69YNEJF27');`}
      </Script>
      {/* Microsoft Clarity */}
      <Script id="ms-clarity" strategy="afterInteractive">
        {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "vn7kuje787");`}
      </Script>

      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-KH8W35P3"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        ></iframe>
      </noscript>

      <SiteHeader
        promotionGroups={promotionGroups}
        searchRecommendations={searchRecommendations}
        member={member}
      />
      {children}
      <SiteFooter />

      {/* Bootstrap 5.3.5 bundle — 드롭다운/collapse 인터랙션 (legacy 동일 CDN·integrity) */}
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-k6d4wzSIapyDyv1kpU366/PK5hCdSbCRGRCMv+eplOQJWyd1fbcAu9OCUj5zNLiq"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </>
  );
}
