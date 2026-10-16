// legacy goods_option_register.php — 옵션상품(tbl_goods_item) 기본/부가정보.

export type GoodsOption = {
  product_code: string;
  goods_sku: string;
  product_name: string;
  product_name_en: string;
  keyword: string; // 검색키워드(modify 폼에서만 편집)
  model_code: string; // 실물상품 모델코드(option_type==retail)
  model_name: string; // 실물상품 모델명(option_type==retail)
  product_platform: string; // 1 Steam / 34 Epic / 30 Ubisoft / 35 Rockstar / 33 Bethesda / 3 Origin / 51 홀로모델 / 32 기타
  option_type: string; // digital | retail
  game_type: string; // game|dlc|music|bundle|randombox|timedeal|accessories|holomodels
  display_type: string; // basic|edition|multi|dlc|game_bundle|dlc_bundle|etc_bundle|timedeal|holomodels|holomodelsdlc|holomodelsedition
  spoken_korean: string; // Y | ""(N)
  interface_korean: string;
  subtitle_korean: string;
  exclusive_korean: string;
  steam_appid: string;
  packageid: string;
  bundleid: string;
};

// 등록 초기값(채번 product_code + uuid goods_sku).
export type NewGoodsOption = {
  product_code: string;
  goods_sku: string;
};

// register/modify 저장 요청(폼 필드 전체).
export type SaveGoodsOptionRequest = GoodsOption;

export type GoodsOptionMutationResponse = { success: boolean; product_code: string };

// legacy goods_option_list.php — 옵션상품 목록 행(enriched).
export type OptionTag = { code: string; name: string };
export type OptionDeliveryItem = {
  order_system_name: string;
  item_id: string;
  item_name: string;
  item_type: string;
  item_platform: string;
  item_publisher: string;
  stock: number;
  age_limit?: string; // 실물상품 목록(goods_etc_list) 디지털배송 연령제한
};
export type OptionListItem = {
  product_code: string;
  goods_sku: string;
  product_name: string;
  product_name_en: string;
  option_type: string;
  game_type: string;
  game_type_name: string;
  display_type: string;
  display_type_name: string;
  platform: string;
  platform_name: string;
  supplier_name: string;
  release_date: string;
  status: string;
  status_name: string;
  is_free: "Y" | "N";
  discount: number;
  consumer_price: number;
  price: number;
  steam_appid: string;
  packageid: string;
  bundleid: string;
  is_view: string;
  spoken_korean: string;
  interface_korean: string;
  subtitle_korean: string;
  exclusive_korean: string;
  is_bonus: string;
  is_auth: string;
  soldout: string;
  is_preorder: string;
  is_naverpay_coupon: string;
  delivery_date: number;
  view_url: string;
  package_view_url: string;
  is_package_view: string;
  genres: OptionTag[];
  categories: OptionTag[];
  deliveries: OptionDeliveryItem[];
  title_id?: string; // 판매종료 목록(goods_option_end) 부가정보 — getTitleID
  is_special?: string; // 판매종료 목록 특전제공유무 필터
  model_code?: string; // 실물상품 목록(goods_etc_list) 실물배송 모델
  model_name?: string;
  domain?: string; // 실물상품 목록 header 이미지 caption
  delivery_type?: string; // 실물상품 목록 배송유형(1 디지털코드/2 실물/3 실물+디지털코드)
  header_web_exists?: boolean; // 옵션 Header 이미지 확인(goods_option_image_chk): 웹서버 header.jpg 존재 → 디스크엔 버튼 노출용
};

// legacy goods_etc_list.php — 실물상품 목록 필터(status≠3 + game_type=accessories 고정).
export type EtcSearch = {
  page: number;
  search_product_code: string;
  search_product_name: string;
  search_product_name_en: string;
  search_supplier_code: string;
  search_product_platform: string;
  search_status: string;
  search_is_view: string;
  search_delivery_type: string;
  search_soldout: string;
};

// legacy goods_option_image_chk.php — 옵션상품 Header 이미지 확인 필터(product_platform≠3 고정).
export type OptionImageChkSearch = {
  page: number;
  search_key: string; // search_product_name | search_product_code
  search_value: string;
  search_status: string; // 1(승인대기) | 0(판매중) | 3(판매종료)
  search_domain: string; // all | https://directg.net | https://image.directg.net | Null(이미지없음)
  search_is_view: string; // all | Y | N (⚠️ WHERE 미적용 dead 필터)
};
// legacy goods_option_ps.php mode=diskn_upload_chk — 디스크엔 등록 완료.
export type DisknUploadChkRequest = { product_code: string };

// legacy goods_holomodels_list.php — 홀로모델 옵션상품 목록 필터(status≠3 + holomodels 계열 고정).
export type HolomodelsSearch = {
  page: number;
  search_key: string;
  search_value: string;
  search_status: string;
  search_supplier_code: string;
  search_product_platform: string;
  search_game_type: string;
  search_display_type: string;
  search_is_view: string;
  search_soldout: string;
  search_is_bonus: string;
  search_is_preorder: string;
  search_is_naverpay_coupon: string;
  search_interface_korean: string;
  search_subtitle_korean: string;
  search_spoken_korean: string;
  search_exclusive_korean: string;
};

// legacy goods_option_end.php — 판매종료 옵션상품 목록 필터(status=3 고정).
export type OptionEndSearch = {
  page: number;
  search_product_code: string;
  search_product_name: string;
  search_product_name_en: string;
  search_supplier_code: string;
  search_product_platform: string;
  search_game_type: string;
  search_is_view: string;
  search_status: string;
  search_is_special: string;
  search_interface_korean: string;
  search_spoken_korean: string;
  search_exclusive_korean: string;
};
// ===== 옵션상품 상세보기(goods_option_view) =====
export type OptionScreenshot = {
  idx: number;
  screenshot_num: string;
  url: string;
  thumbnail: string;
  sort: number;
};
export type OptionDelivery = {
  order_system: string; // 1 Asset / 2 Ztorm / 8 Vaultn / 9 Genba / 10 PointNexus
  item_platform: string;
  item_id: string;
  item_type: string;
  item_name: string;
  flag: string; // Y 배송중 / 그 외 종료
};
export type OptionPackageItem = {
  package_srl: number;
  appid: string;
  item_type: string; // 1 게임 / 2 DLC / 3 패키지
  item_code: string;
  item_name: string;
  app_price: number;
};
export type OptionTitleInfo = {
  title_id: string;
  title_name: string;
  title_name_en: string;
  publisher: string;
  release_date: string;
};
// tbl_goods_item 상세(view 표시용 확장 필드 포함).
export type OptionViewDetail = {
  product_code: string;
  goods_sku: string;
  product_name: string;
  product_name_en: string;
  model_code: string;
  model_name: string;
  product_platform: string;
  genre: string; // 콤마 코드
  category: string; // 콤마 코드
  release_date: string;
  option_type: string;
  game_type: string;
  delivery_type: string; // 1 코드발송 / 2 택배발송 / 3 코드+택배
  display_type: string;
  spoken_korean: string;
  interface_korean: string;
  exclusive_korean: string;
  subtitle_korean: string;
  is_view: string;
  bundle_type: string;
  is_package_view: string;
  domain: string;
  status: string;
  purchase_limit_yn: string;
  purchase_limit: number;
  is_stock: string;
  item_stock: number;
  consumer_price: number;
  price: number;
  discount: number;
  supplier_code: string;
  product_srp: number;
  product_ppr: number;
  product_rs: string;
  steam_appid: string;
  packageid: string;
  bundleid: string;
};
export type GoodsOptionView = {
  option: OptionViewDetail;
  description_html: string; // 서버 Parsedown 변환
  requirements_html: string;
  short_description: string;
  screenshots: OptionScreenshot[];
  title_info: OptionTitleInfo;
  deliveries: OptionDelivery[];
  package_items: OptionPackageItem[];
  genres: OptionTag[]; // getTagName 대응
  categories: OptionTag[];
};
// 구성 추가(package_add) 요청.
export type AddPackageRequest = {
  item_type: string;
  item_name: string;
  appid: string;
  item_code?: string;
};

// ===== 옵션상품 장르 설정(goods_option_genre_register) =====
export type OptionTagGroup = {
  group_code: string;
  group_name: string;
  tags: { tag_code: string; tag_name: string }[];
};
export type OptionGenreProduct = {
  product_name: string;
  product_platform: string;
  game_type: string;
  display_type: string;
};
export type OptionGenreData = {
  product: OptionGenreProduct;
  groups: OptionTagGroup[];
  selected: string[];
};
// 저장 요청 — 선택 tag_code 배열.
export type SaveOptionGenreRequest = { genre: string[] };

// ===== 옵션상품 카테고리 설정(goods_option_category_register) =====
export type OptionCategoryProduct = {
  product_name: string;
  product_name_en: string;
};
export type OptionCategoryData = {
  product: OptionCategoryProduct;
  groups: OptionTagGroup[]; // C*/HC*/P*/R*
  selected: string[];
};
export type SaveOptionCategoryRequest = { category: string[] };

// ===== 옵션상품 태그 설정(goods_option_tag_register) =====
export type OptionTagSettingData = {
  product: OptionCategoryProduct; // product_name/product_name_en 재사용
  groups: OptionTagGroup[]; // GT*/T*
  selected: string[];
};
export type SaveOptionTagRequest = { tag: string[] };

// ===== 옵션상품 판매 설정(goods_option_sales_register) =====
export type OptionSalesProduct = {
  product_name: string;
  platform_name: string; // getPlatformName(product_platform)
  game_type: string;
  display_type: string;
};
export type OptionSalesSettings = {
  is_view: string; // Y | N (서버: status 0→Y, 3→N 오버라이드)
  status: string; // 9 승인대기 | 0 판매중 | 1 판매중지 | 3 판매종료
  purchase_limit_yn: string; // Y | N
  purchase_limit: string;
  release_date: string; // 출시일(포맷 문자열)
  delivery_date: string; // 수령가능일자(포맷 문자열)
  is_preorder: string; // Y | N
  soldout: string; // Y | N
  is_auth: string; // Y | N
  is_bonus: string; // Y | N
  is_naverpay_coupon: string; // Y | N
  delivery_type: string; // 1 코드발송 | 2 실물배송 | 3 코드+실물
};
export type OptionPriceSettings = {
  consumer_price: string;
  price: string;
  discount: string; // 서버 재계산(폼 값 무시)
};
export type OptionSupplierSettings = {
  supplier_code: string;
  product_srp: string;
  product_ppr: string;
  product_rs: string;
};
export type OptionPublisher = { publisher_code: string; publisher_name: string };
export type OptionSalesDelivery = {
  order_system: string;
  order_system_name: string; // getOrderSystem
  item_platform: string;
  item_type: string;
  item_name: string;
  item_id: string;
  item_publisher: string;
};
export type OptionSalesData = {
  product: OptionSalesProduct;
  sales: OptionSalesSettings;
  price: OptionPriceSettings;
  supplier: OptionSupplierSettings;
  publishers: OptionPublisher[];
  deliveries: OptionSalesDelivery[];
};
export type SaveOptionSalesRequest = OptionSalesSettings;
export type SaveOptionPriceRequest = { consumer_price: string; price: string; discount: string };
export type SaveOptionSupplierRequest = OptionSupplierSettings;

// ===== 옵션상품 구성정보 설정(goods_option_package_register — col-8) =====
export type OptionPackageProduct = {
  product_name: string;
  platform_name: string;
  game_type: string;
  display_type: string;
  goods_sku: string;
};
export type OptionPackageUnit = {
  idx: number;
  unit_code: string;
  unit_type: string; // 1 Game | 2 DLC | 3 Music | 4 특전 | 5 기타
  unit_name: string;
};
export type OptionPackageData = {
  product: OptionPackageProduct;
  is_package_view: string; // Y | N
  is_bonus: string; // Y | N (표시 전용)
  units: OptionPackageUnit[];
  bonus_description: string; // SmartEditor2 초기값
  bonus_description_preview_html: string; // 프리뷰 렌더
};
export type AddPackageUnitRequest = { unit_type: string; unit_code: string; unit_name: string };
export type PackageOptionSearchResult = {
  unit_code: string;
  unit_type: string;
  unit_name: string;
  game_type: string;
};
export type SaveBonusDescriptionRequest = { value: string };

// ===== 옵션상품 스크린샷 설정(goods_option_screenshot_register) =====
export type OptionScreenshotItem = {
  idx: number;
  screenshot_num: string;
  url: string;
  thumbnail: string;
  sort: number;
  disk_exists: boolean; // remoteFileExist(image.directg.net)==200 (col-3 노출 판정)
};
export type OptionSteamScreenshotCandidate = {
  id: number;
  path_full: string;
  path_thumbnail: string;
  downloaded: boolean;
};
export type OptionScreenshotData = {
  product: {
    product_name: string;
    product_name_en: string;
    game_type: string;
    platform_name: string;
    steam_appid: string;
  };
  screenshots: OptionScreenshotItem[];
  steam_candidates: OptionSteamScreenshotCandidate[];
};
// legacy goods_option_screenshot_chk.php — DLC 스크린샷 체크 목록(game_type=dlc, status∉{1,3}, display_type≠dlc_bundle).
export type OptionScreenshotChkSearch = {
  page: number;
  search_product_code: string; // ⚠️ WHERE 미처리 dead 필터(legacy)
  search_product_name: string;
  search_appid: string;
};
export type OptionScreenshotChkItem = {
  product_code: string;
  steam_appid: string;
  goods_sku: string;
  product_name: string;
  product_name_en: string;
  release_date: string;
  sales_status: "S" | "C" | "E" | ""; // 조인 타이틀 판매상태(뱃지 텍스트)
  has_json: boolean; // 스팀 JSON 존재
  screenshots: OptionSteamScreenshotCandidate[]; // 최대 10(downloaded=로컬 존재→완료)
};
export type OptionScreenshotChkResponse = {
  items: OptionScreenshotChkItem[];
  pagination: OptionPagination;
};

export type SortOptionScreenshotRequest = { idx: number; dir: "up" | "down" };
export type DownloadOptionScreenshotRequest = {
  id: number;
  path_full: string;
  path_thumbnail: string;
  num: number;
};
export type UploadOptionScreenshotRequest = { file_name: string };

// ===== 옵션상품 포인트 설정(goods_option_repay_register) =====
export type OptionRepayHistory = {
  repay_point: number;
  repay_type: string; // % | 원
  start_dt: string;
  end_dt: string;
  repay_flag: string; // 지급여부
};
export type OptionRepayData = {
  product: { product_name: string; product_name_en: string };
  is_repay: string; // Y | N
  add_repay_history: OptionRepayHistory[];
};
export type SaveRepayRequest = { is_repay: string };
export type AddRepayRequest = {
  add_repay: string;
  repay_type: string; // % | 원
  start_dt: string;
  end_dt: string;
};

// ===== 옵션상품 구성정보 — Steam 참고 패널(package col-4) =====
export type OptionSteamPackageItem = {
  appid: string;
  app_type: string; // game | dlc | music
  app_name: string;
  app_price: number; // getSteamAppPrice/100
};
export type OptionSteamPackageData = {
  package_type: string; // package | bundle | ""
  packageid: string;
  bundleid: string;
  items: OptionSteamPackageItem[];
  total: number;
};

// ===== 옵션상품 타임딜 설정(sales 조건부 블록, display_type==timedeal) =====
export type OptionTimedealConfig = {
  timedeal_start_date: string;
  timedeal_end_date: string;
  product_srp: string;
  product_ppr: string;
  timedeal_price: string;
  timedeal_stock: string;
  timedeal_confirm: string; // 폼 라디오(Y/N). legacy는 저장 시 timedeal_status 미매핑(버그)
};
export type OptionTimedealHistory = {
  timedeal_start: string; // 포맷 기간
  timedeal_end: string;
  timedeal_stock: number;
  timedeal_srp: number;
  timedeal_ppr: number;
  timedeal_price: number;
  timedeal_order: number; // 실제 판매수량
  timedeal_status: string;
};
export type OptionTimedealData = {
  config: OptionTimedealConfig;
  history: OptionTimedealHistory[];
};
export type SaveOptionTimedealRequest = {
  timedeal_start_date: string;
  timedeal_end_date: string;
  product_srp: string;
  product_ppr: string;
  timedeal_price: string;
  timedeal_stock: string;
  timedeal_confirm: string; // 전송되나 백엔드 timedeal_status 미매핑(legacy 버그)
};

// ===== 배송아이템 검색·추가(sales tfoot subsystem) =====
export type DeliverySystemKey = "asset" | "ztorm" | "genba" | "vaultn" | "pointnexus";
export type DeliverySearchRequest = {
  system: DeliverySystemKey;
  order_system: string; // 선택 라디오(1/2/9/8/10)
  query: string; // asset/ztorm=search_value, genba/vaultn=sku, pointnexus=productID
  pn_mode?: string; // pointnexus test|prod
};
export type DeliverySearchItem = {
  item_platform: string;
  item_type: string;
  item_id: string;
  item_name: string;
  item_publisher: string;
  providers_channel: string; // ztorm 전용
};
export type AddDeliveryItemRequest = {
  order_system: string; // 시스템 고정값
  item_platform: string;
  item_type: string;
  item_id: string;
  item_name: string;
  item_publisher: string;
  providers_channel: string;
};

// ===== 옵션상품 상세설명 설정(goods_option_description_register_v2 — 운영 병합 페이지) =====
// 운영에선 v1/v2 메뉴가 단일 "상세설명 설정"으로 통합, v2 URL이 병합 페이지.
// title(#29)과 달리 옵션은 독점설명 카드 없음. col-8[상세설명ver2 SE2/시스템요구사항 MD/권리표기 MD] + col-4[짧은설명/지역제한].
export type OptionDescriptionFields = {
  requirements: string; // 시스템요구사항 (마크다운)
  legal_text: string; // 권리표기 (마크다운)
  short_description: string; // 짧은설명 (textarea)
  region_msg: string; // 지역제한 안내문구 (textarea)
};
export type OptionDescriptionFieldKey = keyof OptionDescriptionFields;
export type OptionDescriptionV2 = {
  product_code: string;
  product_name: string;
  platform_name: string; // getPlatformName(product_platform)
  game_type: string;
  display_type: string;
  goods_sku: string;
  steam_appid: string;
  description_v2: string; // 상세설명(ver2) SmartEditor2 초기 HTML
  requirements: string;
  legal_text: string;
  short_description: string;
  region_msg: string;
};
// description_save2 — SE2 HTML 저장.
export type SaveOptionDescriptionV2Request = { value: string };
// 필드별 독립 저장(requirements_save/legal_text_save/short_description_save/region_msg_save).
export type SaveOptionDescriptionFieldRequest = { field: OptionDescriptionFieldKey; value: string };
// steam 동기화 — 시스템요구사항(steam_sync_system). SE2 상세설명은 별도(description-v2/sync=steam_sync_desc).
export type SyncOptionDescriptionRequest = { target: "requirements" };

// ===== 옵션상품 이미지 설정(goods_option_image_register) — header 슬롯 단일 =====
export type OptionImages = {
  product_code: string;
  product_name: string;
  product_name_en: string;
  steam_appid: string;
  game_type: string; // sub-nav 스크린샷 메뉴 노출 판정(dlc|accessories)
  display_type: string; // basic|dlc일 때만 스팀 다운로드 블록 노출
  packageid: string;
  header_image: string; // steam JSON 값(span 표시). 없으면 ""
  steam_url: string; // 다운로드 버튼 data-url(header_image 또는 steamstatic CDN). appid 0이면 ""
  web_uploaded: boolean; // 로컬 header.jpg 존재
  disk_exists: boolean; // image.directg.net remoteFileExist 200
};
// 직접 업로드(header_upload) — mock은 파일명만.
export type OptionImageUploadRequest = { file_name: string };
// 스팀 다운로드(steam_image_download2) 요청.
export type OptionImageDownloadRequest = {
  image_type: string; // "header_460x215"
  image_url: string;
  packageid: string;
  appid: string;
};

export type OptionPagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};
export type OptionListResponse = {
  items: OptionListItem[];
  pagination: OptionPagination;
  suppliers: OptionTag[];
};
// legacy 필터(native GET).
export type OptionListQuery = {
  page?: number;
  search_key?: string; // search_name | search_product_code | search_goods_sku
  search_value?: string;
  search_status?: string; // 9 | 0 | 1
  search_product_platform?: string;
  search_supplier_code?: string;
  search_game_type?: string; // game | dlc | music | bundle
  search_is_view?: string; // Y | N
  search_display_type?: string;
  search_interface_korean?: string; // Y | N
  search_subtitle_korean?: string;
  search_spoken_korean?: string;
  search_exclusive_korean?: string;
  search_is_preorder?: string; // Y | N
  search_is_bonus?: string;
  search_is_naverpay_coupon?: string;
  search_is_auth?: string;
  search_soldout?: string; // Y (품절 체크박스)
};
