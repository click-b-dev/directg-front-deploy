import { createTable } from "../table";

// legacy tbl_main_banner 도출 — docs/migration/admin/site/banner-list.md 계약 기준.
// FSD: shared 레이어이므로 entities 계약 타입을 import하지 않고 여기서 자체 정의한다.
// banner_start/banner_end는 legacy처럼 unix epoch 초(int).
export type MainBannerRow = {
  idx: number;
  banner_sort: number;
  banner_pc: string;
  banner_mobile: string;
  banner_link: string;
  banner_target: string;
  banner_title: string;
  product_code: string;
  banner_publisher: string;
  banner_start: number;
  banner_end: number;
  flag: "Y" | "N";
  bannerPeriodOutputFl: "Y" | "N";
  show_prod_info: string;
  show_sale_info: string;
  is_del: "Y" | "N";
};

// 기준 시각(고정 시드): 상태 뱃지 분기(게시예정/게시중/게시종료)를 재현하기 위한 상대 오프셋 기준.
const DAY = 86_400;
const NOW = 1_784_000_000; // ≈ 2026-07-14 (고정 시드 — 결정적 상태 분기용)

const makeRow = (idx: number, over: Partial<MainBannerRow>): MainBannerRow => ({
  idx,
  banner_sort: idx,
  banner_pc: `https://img.directg.net/banner/pc_${idx}.jpg`,
  banner_mobile: `https://img.directg.net/banner/mo_${idx}.jpg`,
  banner_link: `/game/game_view.html?product_id=${1000 + idx}`,
  banner_target: "_blank",
  banner_title: `메인 배너 ${idx}`,
  product_code: `DG${String(1000 + idx)}`,
  banner_publisher: "H2 Interactive",
  banner_start: 0,
  banner_end: 0,
  flag: "Y",
  bannerPeriodOutputFl: "N",
  show_prod_info: "N",
  show_sale_info: "N",
  is_del: "N",
  ...over,
});

// 20건 초과(페이징 2쪽) + 상태/노출 분기 다양화 시드.
const seed: readonly MainBannerRow[] = [
  // 상시노출 + 게시중(flag=Y)
  makeRow(1, {
    banner_title: "신작 RPG 대작",
    product_code: "DG20001",
    flag: "Y",
    bannerPeriodOutputFl: "N",
  }),
  // 상시노출 + 게시종료(flag=N)
  makeRow(2, {
    banner_title: "구작 프로모션",
    product_code: "DG20002",
    flag: "N",
    bannerPeriodOutputFl: "N",
  }),
  // 기간노출 + 게시중
  makeRow(3, {
    banner_title: "여름 할인전",
    product_code: "DG20003",
    bannerPeriodOutputFl: "Y",
    banner_start: NOW - 10 * DAY,
    banner_end: NOW + 20 * DAY,
    flag: "Y",
  }),
  // 기간노출 + 게시예정
  makeRow(4, {
    banner_title: "출시 예정 신작",
    product_code: "DG20004",
    bannerPeriodOutputFl: "Y",
    banner_start: NOW + 5 * DAY,
    banner_end: NOW + 40 * DAY,
    flag: "Y",
  }),
  // 기간노출 + 게시종료
  makeRow(5, {
    banner_title: "종료된 이벤트",
    product_code: "DG20005",
    bannerPeriodOutputFl: "Y",
    banner_start: NOW - 40 * DAY,
    banner_end: NOW - 5 * DAY,
    flag: "N",
    banner_publisher: "네오위즈",
  }),
  // 삭제된 행(is_del='Y') — 목록에 나오면 안 됨(필터 검증용)
  makeRow(6, { banner_title: "삭제된 배너", product_code: "DG20006", is_del: "Y" }),
  // 나머지 filler (페이징 2쪽 확보) — idx 7~23
  ...Array.from({ length: 17 }, (_, i) => {
    const idx = i + 7;
    return makeRow(idx, {
      banner_title: `프로모션 배너 ${idx}`,
      product_code: `DG${20000 + idx}`,
      flag: idx % 2 === 0 ? "N" : "Y",
      bannerPeriodOutputFl: "N",
    });
  }),
];

export const mainBannerTable = createTable(seed);
