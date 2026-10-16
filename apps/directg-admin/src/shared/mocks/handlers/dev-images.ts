import { http, HttpResponse } from "msw";

// dev 전용: 백엔드/CDN 부재로 로드 실패하는 image.directg.net 이미지를 legacy 비율 SVG 플레이스홀더로 응답.
// 화면 마크업/이미지 URL은 legacy 원문 그대로 유지(parity 무영향) — 서비스워커 레벨에서만 대체해
// 카드 그리드가 실제 비율로 렌더되게 한다(프로모션 상세 미리보기 등). 실서비스는 CDN이 실제 이미지 서빙.
const dimsFor = (pathname: string): [number, number] => {
  if (pathname.includes("hero_capsule")) return [460, 215]; // 대표상품 hero
  if (pathname.includes("/header/")) return [460, 215]; // 옵션/타이틀 header
  if (pathname.includes("recommand")) return [640, 573]; // 추천/특집 배너
  if (pathname.includes("_pc")) return [1296, 500]; // PC 배너
  if (pathname.includes("_mo")) return [720, 720]; // 모바일 배너
  // legacy 하드코딩 해시 이미지(경로 신호 없음): 용도별 비율 매핑.
  if (pathname.includes("U84s2DngyK")) return [1200, 380]; // 주말특가 상단 배너(w-100, 가로)
  // 대규모 섹션 promo(<a><img class="h-100">): h-100이 부모 높이 없어 해석 불가 → SVG 고유 크기가
  // 곧 렌더 크기가 된다. 높이를 카드 자연 높이(~250px)에 맞춰 배너가 카드와 같은 높이로 차게 하고,
  // 폭은 세로형(<높이)으로 잡아 col-3 가로 오버플로를 방지한다(legacy 실 이미지 근사).
  if (pathname.includes("h843N9Ie0v") || pathname.includes("Y88eupClXn")) return [210, 250];
  return [460, 215]; // 기본 landscape
};

const placeholderSvg = (w: number, h: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
  `<rect width="100%" height="100%" fill="#3a4149"/>` +
  `<text x="50%" y="50%" fill="#8a939b" font-family="sans-serif" font-size="${Math.round(
    Math.min(w, h) / 6,
  )}" text-anchor="middle" dominant-baseline="middle">${w}×${h}</text>` +
  `</svg>`;

export const devImageHandlers = [
  http.get(/^https:\/\/image\.directg\.net\//, ({ request }) => {
    const { pathname } = new URL(request.url);
    const [w, h] = dimsFor(pathname);
    return new HttpResponse(placeholderSvg(w, h), {
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
    });
  }),
];
