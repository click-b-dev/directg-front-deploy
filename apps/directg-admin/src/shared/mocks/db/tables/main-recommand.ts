import { createTable } from "../table";

// legacy tbl_main_recommand 도출 — docs/migration/admin/site/recommand-list.md 계약 기준.
// recommand_goods_1~4는 raw product_code(핸들러가 tbl_goods_item으로 enrich).
export type MainRecommandRow = {
  idx: number;
  recommand_sort: number;
  recommand_banner: string;
  recommand_banner_link: string;
  recommand_banner_target: string;
  recommand_name: string;
  recommand_start: number;
  recommand_end: number;
  recommand_goods_1: string;
  recommand_goods_2: string;
  recommand_goods_3: string;
  recommand_goods_4: string;
  is_view: "Y" | "N";
  is_del: "Y" | "N";
};

const DAY = 86_400;
// 상태(게시예정/게시중/게시종료)가 어느 시점에 테스트해도 올바르게 매핑되도록
// 고정 상수 대신 실제 현재시각(모듈 로드 시) 기준 상대 오프셋을 쓴다.
const NOW = Math.floor(Date.now() / 1000);

const makeRow = (idx: number, over: Partial<MainRecommandRow>): MainRecommandRow => ({
  idx,
  recommand_sort: idx,
  recommand_banner: `https://img.directg.net/recommand/pc_${idx}.jpg`,
  recommand_banner_link: `/game/game_view.html?product_id=${2000 + idx}`,
  recommand_banner_target: "_blank",
  recommand_name: `추천/특집 ${idx}`,
  recommand_start: NOW - 10 * DAY,
  recommand_end: NOW + 20 * DAY,
  recommand_goods_1: "",
  recommand_goods_2: "",
  recommand_goods_3: "",
  recommand_goods_4: "",
  is_view: "Y",
  is_del: "N",
  ...over,
});

// 20건 초과(2쪽) + 상태(게시예정/게시중/게시종료)·노출·상품슬롯 다양화 시드.
const seed: readonly MainRecommandRow[] = [
  // 게시중 + 노출 + 상품 4개
  makeRow(1, {
    recommand_name: "여름 신작 특집",
    recommand_start: NOW - 10 * DAY,
    recommand_end: NOW + 20 * DAY,
    is_view: "Y",
    recommand_goods_1: "DG20001",
    recommand_goods_2: "DG20003",
    recommand_goods_3: "DG20005",
    recommand_goods_4: "DG20007",
  }),
  // 게시예정 + 노출 + 상품 2개
  makeRow(2, {
    recommand_name: "출시예정 추천",
    recommand_start: NOW + 5 * DAY,
    recommand_end: NOW + 40 * DAY,
    is_view: "Y",
    recommand_goods_1: "DG20002",
    recommand_goods_2: "DG20004",
  }),
  // 게시종료 + 노출
  makeRow(3, {
    recommand_name: "지난 이벤트 특집",
    recommand_start: NOW - 40 * DAY,
    recommand_end: NOW - 5 * DAY,
    is_view: "Y",
    recommand_goods_1: "DG20001",
  }),
  // 노출 N(상태 뱃지 미표시) + 상품 없음
  makeRow(4, {
    recommand_name: "비노출 추천",
    is_view: "N",
  }),
  // 삭제됨(is_del=Y) — 목록 제외
  makeRow(5, { recommand_name: "삭제된 추천", is_del: "Y" }),
  // filler idx 6~22 (2쪽 확보). 대부분 노출(Y)로 상태 컬럼이 채워지도록,
  // 상태는 3종(게시중/게시예정/게시종료)을 순환. 6번째마다만 비노출(N).
  ...Array.from({ length: 17 }, (_, i) => {
    const idx = i + 6;
    const cycle = i % 3; // 0:게시중 1:게시예정 2:게시종료
    const period =
      cycle === 0
        ? { recommand_start: NOW - 7 * DAY, recommand_end: NOW + 14 * DAY }
        : cycle === 1
          ? { recommand_start: NOW + 3 * DAY, recommand_end: NOW + 30 * DAY }
          : { recommand_start: NOW - 30 * DAY, recommand_end: NOW - 3 * DAY };
    return makeRow(idx, {
      recommand_name: `추천/특집 배너 ${idx}`,
      is_view: idx % 6 === 0 ? "N" : "Y",
      recommand_goods_1: "DG20001",
      recommand_goods_2: idx % 2 === 0 ? "DG20003" : "",
      ...period,
    });
  }),
];

export const mainRecommandTable = createTable(seed);
