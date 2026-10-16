import type { ProductThumb } from "@entities/product-thumb";

/** 장르 베스트 캐러셀의 태그(genre/category 코드→이름). legacy 콤마 코드 → getTagName resolve. */
export interface GenreBestTag {
  code: string;
  name: string;
}

/** 장르 베스트 타이틀 1건 (legacy `Goods::getGenreBestTitle` 판매랭킹 당월 상위 5). */
export interface GenreBestTitle {
  domain: string;
  titleId: string;
  titleName: string;
  /** legacy release_date 원본(포맷 "Y년 m월 d일"은 프론트). */
  releaseDate: string;
  /** b.genre 콤마 코드 → game_genre_thumb 링크 badge. */
  genres: GenreBestTag[];
  /** b.category 콤마 코드 → game_category_thumb 링크 badge. */
  categories: GenreBestTag[];
}

/**
 * 장르별 상품 목록 (legacy `Goods::getGoodsList2` + genre_code, `getPrimaryGenreName`, `getGenreBestTitle`).
 * 계약: `GET /api/game/genre`. 카드 필드는 product-thumb ProductThumb 재사용.
 * 문서: docs/migration/storefront/game/game-genre.md
 */
export interface GameGenreResponse {
  list: ProductThumb[];
  page: number;
  totalPages: number;
  /** 총 결과 수(정렬 UI "총 N개"). */
  total: number;
  /** 장르명(legacy getPrimaryGenreName(genre_code)) — page_title. */
  genreName: string;
  /** 장르 베스트 캐러셀(legacy getGenreBestTitle, 최대 5). */
  bestTitles: GenreBestTitle[];
}
