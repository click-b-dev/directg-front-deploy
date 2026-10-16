// legacy tbl_goods(title_code='33' 디지털상품) + enrichment (docs/migration/admin/goods/title-list.md).

export type YN = "Y" | "N";
export type SalesStatus = "C" | "S" | "E";

// 관련상품 카운트: 옵션구분 × 상태(9 판매예정 / 0 판매중 / 3 판매종료).
export type GoodsOptionCounts = {
  game_9: number;
  game_0: number;
  game_3: number;
  edition_9: number;
  edition_0: number;
  edition_3: number;
  dlc_9: number;
  dlc_0: number;
  dlc_3: number;
  holo_9: number;
  holo_0: number;
  holo_3: number;
  holo_edition_9: number;
  holo_edition_0: number;
  holo_edition_3: number;
  holo_dlc_9: number;
  holo_dlc_0: number;
  holo_dlc_3: number;
};

// grac_list 심의정보.
export type GracInfo = {
  orgname: string;
  entname: string;
  rateddate: string;
  givenrate: string;
  descriptors: string;
};

export type GoodsTag = { code: string; name: string };

export type GoodsTitleListItem = {
  title_id: number;
  title_name: string;
  title_name_en: string;
  sku: string;
  publisher: string;
  developer: string;
  release_date: string;
  interface_korean: YN;
  subtitle_korean: YN;
  spoken_korean: YN;
  exclusive_korean: YN;
  is_view: string;
  sales_status: SalesStatus | "";
  steam_appid: number;
  steam_synced: boolean;
  franchise_idx: number;
  franchise_name: string;
  drm_notice: string;
  ext_user_account_notice: string;
  hit: number;
  rateno: number;
  age_limit: string;
  counts: GoodsOptionCounts;
  grac: GracInfo | null;
  genres: GoodsTag[];
  categories: GoodsTag[];
};

export type GoodsTitlePagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};

export type GoodsTitleListResponse = {
  items: GoodsTitleListItem[];
  pagination: GoodsTitlePagination;
};

// legacy title_list.php 9종 필터.
export type GoodsTitleListQuery = {
  page?: number;
  search_key?: string; // search_name | search_title_id | search_title_sku | search_publisher | search_developer
  search_value?: string;
  search_is_view?: string; // all | Y | N
  search_sales_status?: string; // C | S | E
  search_age_limit?: string; // 10 | 12 | 15 | 19
  search_interface_korean?: string; // Y | N
  search_subtitle_korean?: string;
  search_spoken_korean?: string;
  search_exclusive_korean?: string;
};

export type SteamSyncRequest = { steam_appid: number };
export type GoodsMutationResponse = { success: boolean };

// 등록 초기값(title_id 채번·uuid sku·product_code prefill).
export type TitlePrefill = {
  title_name: string;
  title_name_en: string;
  steam_appid: number;
  release_date: string;
  developer: string;
  publisher: string;
};

export type NewTitleResponse = {
  title_id: number;
  sku: string;
  prefill: TitlePrefill | null;
};

// legacy title_ps.php register — 폼 필드(미노출 필드는 서버가 빈값 처리).
export type CreateTitleRequest = {
  title_id: number;
  sku: string;
  title_name: string;
  title_name_en: string;
  coming_soon: string; // Y(출시예정)/N(출시확정)
  coming_soon_date: string;
  release_date: string;
  title_code: string; // 33 | 12
  is_view: YN;
  sales_status: SalesStatus;
  publisher: string;
  developer: string;
  steam_appid: string;
  game_rate_text: string;
};

export type CreateTitleResponse = { success: boolean; title_id: number };

// legacy title_modify.php 로드 — SELECT * FROM tbl_goods WHERE title_id (폼 초기값).
export type GoodsTitleDetail = {
  title_id: number;
  sku: string;
  title_name: string;
  title_name_en: string;
  publisher: string;
  developer: string;
  spoken_korean: string; // "Y" | "" (미체크는 빈값 저장)
  interface_korean: string;
  subtitle_korean: string;
  exclusive_korean: string;
  is_view: string; // Y | N
  sales_status: SalesStatus | "";
  coming_soon: string; // Y(출시예정)/N(출시확정)
  coming_soon_date: string;
  release_date: string;
  title_code: string; // 33 | 12
  steam_appid: number;
  model_name: string;
};

// legacy title_ps.php modify — UPDATE tbl_goods(지정 필드만, 미변경 필드 보존).
export type UpdateTitleRequest = {
  title_name: string;
  title_name_en: string;
  is_view: string; // 빈값이면 서버가 "N"
  sales_status: SalesStatus | "";
  release_date: string;
  developer: string;
  steam_appid: string;
  publisher: string;
  interface_korean: string; // "Y" | "" (미체크)
  spoken_korean: string;
  exclusive_korean: string;
  subtitle_korean: string;
  coming_soon: string; // Y | N
  coming_soon_date: string;
  title_code: string; // 33 | 12
  model_name: string; // 폼 미노출 → "" (legacy: 저장 시 덮임)
};

export type UpdateTitleResponse = { success: boolean; title_id: number };

// legacy title_view.php — 대표상품 상세(read-only) 조립 데이터.
export type TitleMedia = {
  youtube_media_id: string;
  media_thumb: string;
  media_url: string;
};

export type TitleSteamInfo = {
  steam_appid: number;
  name: string;
  drm_notice: string;
  ext_user_account_notice: string;
  recommendations: number;
  review_score: number;
  review_score_desc: string;
  total_positive: number;
  total_reviews: number;
  packages: { package_name: string; packageid: number }[];
  dlcs: { name: string; steam_appid: number }[];
};

export type GoodsTitleView = {
  title_id: number;
  sku: string;
  title_name: string;
  title_name_en: string;
  publisher: string;
  developer: string;
  title_code: string;
  interface_korean: string;
  spoken_korean: string;
  exclusive_korean: string;
  is_view: string;
  sales_status: string;
  coming_soon: string;
  release_date: string;
  coming_soon_date: string;
  drm_notice: string;
  ext_user_account_notice: string;
  rateno: number;
  steam_appid: number;
  short_description: string;
  media: TitleMedia[];
  // 백엔드 Parsedown 렌더 완료 HTML(프론트 미렌더).
  game_html: string;
  requirements_html: string;
  legal_text_html: string;
  perks_html: string | null;
  grac: GracInfo | null;
  genres: GoodsTag[];
  categories: GoodsTag[];
  tags: GoodsTag[]; // code 접두문자(G/M/T/V/A/F)로 색상 결정
  steam: TitleSteamInfo | null; // title_code==33만
};

// legacy tbl_title_attribute_set — 상품정보 제공고시 + 거래조건(33/12 필드 합집합).
export type AttributeSet = {
  model_name: string;
  product_name: string;
  kc_safety_infomartion: string;
  rated_voltage: string;
  power: string;
  manufacturing_date: string;
  manufacturer: string;
  manufacture_country: string;
  size: string;
  weight: string;
  main_requirements: string;
  warranty_service: string;
  as_information: string;
  terms_use: string;
  applicable_period: string;
  product_supply_method: string;
  cancel_right: string;
  delivery_method_info: string;
  as_information2: string;
};

export type TitleAttributeSet = {
  title_id: number;
  title_name: string;
  title_name_en: string;
  title_code: string;
  attribute: AttributeSet;
};

// legacy title_grac_chk.php — 심의정보 설정확인(age_limit is null 목록).
export type GracChkSearch = {
  page: number;
  search_age_limit: string;
};
export type GracChkListItem = {
  title_id: number;
  title_name: string;
  title_name_en: string;
  release_date: string;
  rateno: string; // 등급분류번호(GRAC 문자 코드)
  grac: GracInfo | null;
};
export type GracChkListResponse = {
  items: GracChkListItem[];
  pagination: GoodsTitlePagination;
};

// legacy title_image_header_chk.php — 대표상품 이미지(Header) 확인 목록.
// getGoodsList(title_code≠12, sales_status≠E 상시) + domain. 형제: library/vertical capsule.
export type TitleImageChkSearch = {
  page: number;
  search_key: string; // search_name | search_title_id | search_publisher | search_developer
  search_value: string;
  search_is_view: string; // all | Y | N  (⚠️ all은 등호비교라 empty — legacy 버그)
  search_sales_status: string; // C | S | E  (⚠️ E는 항상 empty — legacy 버그)
  search_domain: string; // all | https://directg.net | https://image.directg.net (⚠️ all empty)
};
export type TitleImageChkListItem = {
  title_id: number;
  steam_appid: number;
  sales_status: SalesStatus | "";
  sku: string;
  title_name: string;
  title_name_en: string;
  release_date: string;
  domain: string;
  hero_web_exists?: boolean; // vertical 전용: 웹서버 hero_capsule 존재 → 완료 버튼 노출용
};
export type TitleImageChkListResponse = {
  items: TitleImageChkListItem[];
  pagination: GoodsTitlePagination;
};

// legacy title_image_library_capsule_chk.php — Header 필터 + Library capsule 이미지(is_library) 필터.
// getGoodsImageChkList(JOIN b.is_library). 응답 항목은 TitleImageChkListItem 재사용(is_library 미표시).
export type TitleImageLibraryChkSearch = TitleImageChkSearch & {
  search_is_library: string; // 200(있음) | 404(없음)
};

// legacy title_image_vertical_capsule_chk.php — Header 필터 + Vertical capsule 이미지(is_hero) 필터.
// getGoodsImageChkList(JOIN b.is_hero, order release_date desc). 404 필터는 null 포함. sales_status<>E 상시제외 없음.
export type TitleImageVerticalChkSearch = TitleImageChkSearch & {
  search_is_hero: string; // 200(있음) | 404(없음, null 포함)
};

// legacy title_ps.php mode=hero_capsule_chk — 완료 버튼(appid로 스팀 hero_capsule 체크/반영).
export type HeroCapsuleChkRequest = { steam_appid: number };
export type HeroCapsuleChkResponse = { success: boolean; message: string };

// legacy accessories_list.php — 실물상품 목록(대표상품 레벨, title_code=12).
export type AccessoriesSearch = {
  page: number;
  search_key: string;
  search_value: string;
  search_age_limit: string;
  search_is_view: string;
  search_sales_status: string;
};
// getGoodsAccessoriesCount(title_id, status, delivery_type): 택배발송(dt=2)/코드+택배(dt=3) × 판매예정(9)/판매중(0)/판매종료(3).
export type AccessoriesCounts = {
  taekbae_9: number;
  taekbae_0: number;
  taekbae_3: number;
  code_9: number;
  code_0: number;
  code_3: number;
};
export type AccessoriesListItem = {
  title_id: number;
  title_name: string;
  title_name_en: string;
  sku: string;
  publisher: string;
  developer: string;
  is_view: string;
  sales_status: SalesStatus | "";
  categories: GoodsTag[];
  counts: AccessoriesCounts;
  attribute: AttributeSet;
};
export type AccessoriesListResponse = {
  items: AccessoriesListItem[];
  pagination: GoodsTitlePagination;
};

// mode=attribute_set UPSERT(제공고시). 현재 title_code에 해당하는 값만 채워지고 나머지 빈값.
export type AttributeSetRequest = {
  model_name: string;
  product_name: string;
  kc_safety_infomartion: string;
  rated_voltage: string;
  power: string;
  manufacturing_date: string;
  manufacturer: string;
  manufacture_country: string;
  size: string;
  weight: string;
  main_requirements: string;
  warranty_service: string;
  as_information: string;
  terms_use: string;
  applicable_period: string;
  product_supply_method: string;
  cancel_right: string;
};

// mode=attribute_set2 UPSERT(거래조건).
export type TradeTermsRequest = {
  delivery_method_info: string;
  as_information2: string;
};

// legacy title_grac_register.php — 심의정보(tbl_goods rateno/age_limit/game_rate).
export type TitleGrac = {
  title_id: number;
  title_name: string;
  title_name_en: string;
  rateno: string;
  age_limit: string;
  game_rate: string; // 7자리 2진(선정성64…사행성1)
};

// mode=grac_save UPDATE. game_rate_text는 체크값 합의 2진 문자열(서버가 pad7).
export type GracRequest = {
  rateno: string;
  age_limit: string;
  game_rate_text: string;
  orgname: string; // 폼 미노출 → "" (legacy: 저장 시 덮임)
};

// legacy title_tag_register.php — 태그 마스터(그룹별) + title checked.
export type TagItem = { tag_code: string; tag_name: string; checked: boolean };
export type TagGroup = { group_code: string; group_name: string; tags: TagItem[] };
export type TitleTags = {
  title_id: number;
  title_name: string;
  title_name_en: string;
  title_code: string;
  groups: TagGroup[];
};

// mode=tag_save UPDATE. 체크된 tag_code 배열(genre/category).
export type TagsRequest = { genre: string[]; category: string[] };

// legacy title_media_register.php — 등록 영상 + YouTube 검색 후보.
export type VideoCandidate = {
  videoId: string;
  thumbnails: string;
  title: string;
  channelTitle: string;
  publishedAt: number; // unix seconds
  viewCount: number;
};
export type TitleMediaSettings = {
  title_id: number;
  title_name: string;
  title_name_en: string;
  media: TitleMedia[];
  candidates: VideoCandidate[];
};

// mode=add_youtube. 수동 입력 id 또는 검색결과 videoId.
export type AddMediaRequest = { youtube_media_id: string };

// legacy title_screenshot_register.php — 등록 스크린샷 + steam 다운로드 후보.
export type Screenshot = {
  idx: number;
  screenshot_num: number;
  url: string;
  thumbnail: string;
  sort: number;
};
export type SteamScreenshotCandidate = {
  id: number;
  path_full: string;
  path_thumbnail: string;
  downloaded: boolean;
};
export type TitleScreenshots = {
  title_id: number;
  title_name: string;
  title_name_en: string;
  steam_appid: number;
  screenshots: Screenshot[];
  steam_candidates: SteamScreenshotCandidate[];
};

export type ScreenshotSortRequest = { idx: number; dir: "up" | "down" };
export type ScreenshotDownloadRequest = {
  id: number;
  path_full: string;
  path_thumbnail: string;
  num: number;
};
export type ScreenshotUploadRequest = { file_name: string };

// legacy title_image_register.php — 이미지 슬롯 4종(header/capsule231/library/hero).
export type ImageSlotKey = "header" | "capsule231" | "library" | "hero";
export type ImageSlotState = {
  web_uploaded: boolean; // 로컬(웹서버) 파일 존재
  disk_exists: boolean; // 디스크엔(CDN) 존재
  steam_url: string; // 스팀 소스(없으면 "")
  steam_available: boolean; // 스팀 CDN에 해당 이미지 실제 존재(remoteFileExist==200) — 다운로드 버튼 노출 조건
  http_code: number; // remoteFileExist 응답코드(header 디스크엔 placeholder에 표기, 0=미표기)
};
export type TitleImages = {
  title_id: number;
  title_name: string;
  title_name_en: string;
  steam_appid: number;
  slots: Record<ImageSlotKey, ImageSlotState>;
};

export type ImageDownloadRequest = { key: ImageSlotKey };
export type ImageUploadRequest = { key: ImageSlotKey; file_name: string };

// legacy title_description_register.php — 설명 필드 6종(tbl_goods_description).
export type DescriptionFields = {
  dgkr_description: string; // 독점설명 (SimpleMDE)
  detail: string; // 상세설명 (SimpleMDE) — 로드=description 컬럼, 저장=about_the_game+description
  requirements: string; // 시스템요구사항 (SimpleMDE)
  legal_text: string; // 권리표기 (SimpleMDE)
  short_description: string; // 짧은설명 (일반 textarea)
  region_msg: string; // 지역제한 안내문구 (일반 textarea)
};
export type DescriptionFieldKey = keyof DescriptionFields;
export type TitleDescription = {
  title_id: number;
  title_name: string;
  title_name_en: string;
  steam_appid: number;
  description: DescriptionFields;
};

// 필드별 독립 저장.
export type SaveDescriptionRequest = { field: DescriptionFieldKey; value: string };
// steam 동기화(description / requirements).
export type SyncDescriptionRequest = { target: "description" | "requirements" };

// legacy(운영) title_description_register_v2.php — 상세설명 설정 병합 페이지.
// 운영에선 v1/v2 메뉴가 하나로 통합: 마크다운 필드들 + 상세설명(SmartEditor2 HTML).
export type TitleDescriptionV2 = {
  title_id: number;
  title_name: string;
  title_name_en: string;
  steam_appid: number;
  description_v2: string; // 상세설명(ver2) SmartEditor2 초기 HTML
  dgkr_description: string; // 독점설명 (마크다운)
  requirements: string; // 시스템요구사항 (마크다운)
  legal_text: string; // 권리표기 (마크다운)
  short_description: string; // 짧은설명 (textarea)
  region_msg: string; // 지역제한 안내문구 (textarea)
};
export type SaveDescriptionV2Request = { value: string }; // SE2 HTML
