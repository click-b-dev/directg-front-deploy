// mock DB 공개 API. handler는 이 모듈만 import하여 테이블에 접근한다.
// 이관 단위가 새 테이블을 필요로 할 때 tables/<name>.ts를 추가하고 여기에 등록한다.
//
// 세션 내메모리: 상태는 각 테이블 모듈 스코프에 보관되며, 새로고침 시 seed로 자동 리셋된다.
// db.reset()은 테스트에서 세션 중간에 명시적으로 초기화할 때 사용한다.

import { adminTable } from "./tables/admin";
import { mainBannerTable } from "./tables/main-banner";
import { mainRecommandTable } from "./tables/main-recommand";
import { searchRecommandTable } from "./tables/search-recommand";
import { goodsTitleTable } from "./tables/goods-title";

export const db = {
  admin: adminTable,
  mainBanner: mainBannerTable,
  mainRecommand: mainRecommandTable,
  searchRecommand: searchRecommandTable,
  goodsTitle: goodsTitleTable,
};

export type Db = typeof db;

/** 모든 테이블을 seed 상태로 되돌린다(테스트/디버깅용). */
export function resetDb(): void {
  Object.values(db).forEach((table) => table.reset());
}

export type { AdminRow } from "./tables/admin";
export type { MainBannerRow } from "./tables/main-banner";
export type { MainRecommandRow } from "./tables/main-recommand";
export type { SearchRecommandRow } from "./tables/search-recommand";
export type { GoodsTitleRow } from "./tables/goods-title";
