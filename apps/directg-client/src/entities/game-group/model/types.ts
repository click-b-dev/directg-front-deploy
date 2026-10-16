import type { ProductThumb } from "@entities/product-thumb";

/** 그룹 접근 상태 — 백엔드 판정(use_flag/기간/관리자 세션). legacy msg() 분기 재현. */
export type GroupAccess = "ok" | "invalid" | "closed";

/**
 * 번들/그룹 목록 (legacy `tbl_group` + `Goods::getGoodsGroupList`).
 * 계약: `GET /api/game/group`. 카드 필드는 product-thumb ProductThumb 재사용.
 * 문서: docs/migration/storefront/game/group.md
 */
export interface GroupResponse {
  /** ok=열람, invalid=잘못된 접근, closed=기간밖(비관리자). 관리자는 기간밖이어도 ok. */
  access: GroupAccess;
  /** group_info.subject — page_title/breadcrumb. */
  subject: string;
  /** group_info.banner 파일명("" 이면 배너 없음). */
  banner: string;
  /** group_info.banner_domain — 배너 img 도메인. */
  bannerDomain: string;
  list: ProductThumb[];
  page: number;
  totalPages: number;
  /** 총 결과 수(정렬 UI "총 N개"). */
  total: number;
}
