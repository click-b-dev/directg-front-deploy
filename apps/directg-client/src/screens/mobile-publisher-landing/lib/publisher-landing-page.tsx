import type { Metadata, Viewport } from "next";

import { getPublisherLanding } from "@entities/game-publisher-landing/api/get-publisher-landing";

import { PUBLISHER_BRANDS } from "./brands";
import { MobilePublisherLandingScreen } from "../ui/mobile-publisher-landing-screen";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** page/sort 제외 필터 파라미터 수집(publisher_code는 브랜드 고정 — sp에 없음). */
const collectFilters = (sp: Record<string, string | string[] | undefined>) => {
  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (key === "page" || key === "sort") continue;
    const v = firstParam(value);
    if (v) {
      filters[key] = v;
    }
  }
  return filters;
};

/**
 * 모바일 퍼블리셔 랜딩 라우트 팩토리 — legacy `publisher_<brand>.html`(무접미) 8종 공통 구현.
 * 각 라우트는 brandKey만 다르다(publisher_code·title·배너는 PUBLISHER_BRANDS config).
 * legacy head: viewport theme#000, title=하드코딩 브랜드명.
 */
export function makePublisherLandingPage(brandKey: keyof typeof PUBLISHER_BRANDS) {
  const brand = PUBLISHER_BRANDS[brandKey];

  /** legacy mobile: width=device-width, scale 1 고정, viewport-fit=cover, theme #000. */
  const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    minimumScale: 1,
    maximumScale: 1,
    viewportFit: "cover",
    themeColor: "#000000",
  };

  /** legacy head: title=브랜드명(하드코딩), description/keywords 빈값, apple-web-app 메타. */
  const metadata: Metadata = {
    title: brand.title,
    description: "",
    keywords: "",
    appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
  };

  async function Page({ searchParams }: { searchParams: SearchParams }) {
    const sp = await searchParams;
    const sort = firstParam(sp.sort);
    const pageParam = firstParam(sp.page);
    const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1
    const filters = collectFilters(sp);

    const data = await getPublisherLanding(brand.publisherCode, page, filters, sort);

    return <MobilePublisherLandingScreen brand={brand} data={data} sort={sort} />;
  }

  return { viewport, metadata, Page };
}
