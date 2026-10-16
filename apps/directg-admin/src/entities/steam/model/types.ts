// legacy steam/steam_apps_list.php — 스팀 Apps 검색(getSteamList + 집계). 읽기 뷰.

export type SteamAppSearch = {
  page: number;
  search_app_type: string; // all | game | dlc | music
  search_appid: string;
  search_name: string;
  drm_notice: string; // "Y" | ""
  ext_user_account_notice: string; // "Y" | ""
};

export type SteamTagKo = { code: string; name: string };

export type SteamReviewRow = {
  language: string;
  purchase_type: string;
  review_score: number;
  review_score_desc: string;
  total_positive: number;
  total_negative: number;
  total_reviews: number;
};

export type SteamPackageRow = {
  packageid: string;
  package_name: string;
  package_coming_soon: string; // "1"이면 예약판매
  package_release: string;
  price_initial: number; // cents
  price_final: number; // cents
  discount_percent: number;
  price_individual: number; // cents
};

export type SteamDlcRow = {
  dlc_appid: string;
  name: string;
  app_type: string;
  coming_soon: string; // "1"이면 출시예정
  coming_soon_date: string;
  release_date: string;
  is_free: string; // "1"이면 무료
  consumer_price: number; // cents
  price: number; // cents
};

export type SteamAppItem = {
  steam_appid: string;
  app_type: string;
  name: string;
  coming_soon: string; // truthy면 coming_soon_date 표기
  coming_soon_date: string;
  release_date: string;
  consumer_price: number; // cents (/100 표기)
  price: number; // cents
  title_id: string;
  developer: string;
  publisher: string;
  drm_notice: string;
  ext_user_account_notice: string;
  batch_date: string;
  supported_languages: string; // 콤마분리 파싱(한국어/한국어*)
  genre: string; // 콤마분리
  category: string; // 콤마분리
  basic_game_appid: string; // 비game 기본게임(getSteamBasicGame)
  basic_game_name: string; // getSteamAppinfo
  tags_ko: SteamTagKo[];
  reviews: SteamReviewRow[];
  packages: SteamPackageRow[];
  dlcs: SteamDlcRow[];
};

export type SteamPagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};

export type SteamAppListResponse = {
  items: SteamAppItem[];
  pagination: SteamPagination;
};

// legacy steam/steam_game_list.php — 스팀 Game 현황(getSteamGame, 50/page). 읽기 뷰.
export type SteamGameSearch = {
  page: number;
  search_appid: string;
  search_name: string;
};
export type SteamGameItem = {
  steam_appid: string;
  app_type: string;
  name: string;
  supported_languages: string;
  publisher: string;
  release_date: string;
  coming_soon_date: string;
  package_count: number;
  dlc_count: number;
  consumer_price: number; // cents
  price: number; // cents
  review_score: string; // 요약(빈값 가능)
  review_score_desc: string;
  title_id: string;
  batch_date: string;
};
export type SteamGameListResponse = {
  items: SteamGameItem[];
  pagination: SteamPagination;
};

// legacy steam/steam_dlc_list.php — 스팀 DLC 현황(getSteamAppDLC, 50/page). 읽기 뷰.
export type SteamDlcSearch = {
  page: number;
  search_appid: string;
  search_name: string;
  is_free: string; // "1" | ""
};
export type SteamDlcListItem = {
  steam_appid: string;
  app_type: string;
  name: string;
  supported_languages: string;
  basic_game_appid: string;
  basic_game_name: string;
  coming_soon: string; // "1"이면 출시예정
  coming_soon_date: string;
  release_date: string;
  package_count: number; // 0이면 판매종료 표기
  is_free: string; // "1"이면 무료
  consumer_price: number; // cents
  price: number; // cents
  product_code: string; // getSteamAppChk
  batch_date: string;
};
export type SteamDlcListResponse = {
  items: SteamDlcListItem[];
  pagination: SteamPagination;
};

// legacy steam/steam_package_list.php — 스팀 Package 현황(getSteamAppPackage, 50/page). 읽기 뷰.
export type SteamPackageSearch = {
  page: number;
  search_packageid: string;
  search_name: string;
};
export type SteamPackageListItem = {
  packageid: string;
  appid: string;
  package_name: string;
  package_release: string;
  package_coming_soon: string; // "1"이면 예약판매
  cc: number; // 포함된 APP수
  price_initial: number; // cents
  price_final: number; // cents
  display_type: string; // basic|dlc|music|edition → 라벨 매핑
  batch_date: number; // unix 초(0이면 업데이트 필요)
};
export type SteamPackageListResponse = {
  items: SteamPackageListItem[];
  pagination: SteamPagination;
};

// legacy steam/steam_review_list.php — 스팀 평가 현황(getSteamReviewList, 50/page). 읽기 뷰.
export type SteamReviewSearch = {
  page: number;
  search_appid: string;
  search_name: string;
  search_year: string;
};
export type SteamReviewListItem = {
  steam_appid: string;
  app_type: string;
  name: string;
  genre: string; // 콤마분리
  publisher: string;
  release_date: string;
  review_score: string;
  review_score_desc: string;
  total_positive: number;
  total_negative: number;
  total_reviews: number;
  batch_date: string;
};
export type SteamReviewListResponse = {
  items: SteamReviewListItem[];
  pagination: SteamPagination;
};

// legacy steam/steam_apps_list_all.php — 스팀 Apps list(getSteamListAll, steam_app_list, 20/page). 읽기 뷰.
export type SteamAppAllSearch = {
  page: number;
  search_year: string;
  search_publisher: string;
  search_appid: string;
  search_name: string;
  search_app_type: string; // all | game | dlc | music
  is_free: string; // "1" | ""
  supported_languages: string;
  search_developer: string;
};
export type SteamAppAllPackage = {
  packageid: string;
  package_name: string; // 빈값이면 미동기화
  package_release: string;
  package_coming_soon: string;
  price_initial: number; // cents
};
export type SteamAppAllDlc = {
  dlc_appid: string;
  name: string; // 빈값이면 미동기화
};
export type SteamAppAllItem = {
  appid: string;
  name: string;
  app_type: string;
  coming_soon: string;
  coming_soon_date: string;
  release_date: string;
  is_free: string; // "1"이면 무료
  consumer_price: number; // cents
  price: number; // cents
  developer: string;
  publisher: string;
  recommendations: number;
  supported_languages: string; // 클린 표시
  batch_date: string;
  last_modified: number; // unix 초
  basic_game_appid: string;
  basic_game_name: string;
  packages: SteamAppAllPackage[];
  dlcs: SteamAppAllDlc[];
};
export type SteamPublisherOption = { publisher: string; cc: number };
export type SteamAppAllListResponse = {
  items: SteamAppAllItem[];
  pagination: SteamPagination;
  publishers: SteamPublisherOption[];
};

// legacy steam/steam_apps_comingsoon.php — 출시예정작(coming_soon='1'). 항목은 SteamAppAllItem 재사용.
export type SteamComingSoonSearch = {
  page: number;
  search_appid: string;
  search_name: string;
  search_title_id: string;
};
export type SteamComingSoonResponse = {
  items: SteamAppAllItem[];
  pagination: SteamPagination;
};

// legacy steam/steam_apps_ranking.php — 스팀 Apps 평가수 순위(getSteamAppRanking, 50/page). 카드 그리드.
export type SteamRankingSearch = {
  page: number;
  search_year: string;
  search_publisher: string;
  is_free: string; // "1"이면 무료 제외
};
export type SteamRankingItem = {
  appid: string;
  name: string;
  developer: string;
  publisher: string;
  release_date: string;
  supported_languages: string;
  recommendations: number;
  diff_per_day: number;
  consumer_price: number; // cents
  price: number; // cents
  metacritic_score: number;
  package_count: number;
  dlc_count: number;
  batch_date: string;
  genres: string[];
};
export type SteamRankingResponse = {
  items: SteamRankingItem[];
  pagination: SteamPagination;
  publishers: string[];
};

// ===== 동기화 액션 레이어(#69~76 후속) =====
export type SteamSyncResult = { success: boolean; message: string };
export type SteamAppSyncRequest = { appids: string; title_id?: string; mode?: string };
export type SteamGenreSyncRequest = { appids: string; title_id: string };
export type SteamTagSyncRequest = { appids: string };
export type SteamReviewSyncRequest = { appid: string; purchase_type: string; language: string };
export type SteamPackageSyncRequest = { packageid: string; appid: string };
export type SteamRegisterRequest = { appids: string };
