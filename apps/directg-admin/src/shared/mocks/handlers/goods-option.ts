import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

type GoodsOption = {
  product_code: string;
  goods_sku: string;
  product_name: string;
  product_name_en: string;
  keyword: string;
  model_code: string;
  model_name: string;
  product_platform: string;
  option_type: string;
  game_type: string;
  display_type: string;
  spoken_korean: string;
  interface_korean: string;
  subtitle_korean: string;
  exclusive_korean: string;
  steam_appid: string;
  packageid: string;
  bundleid: string;
};
type MutationResponse = { success: boolean; product_code: string };

const uuid = () => crypto.randomUUID();

const opt = (over: Partial<GoodsOption> & { product_code: string }): GoodsOption => ({
  goods_sku: uuid(),
  product_name: "",
  product_name_en: "",
  keyword: "",
  model_code: "",
  model_name: "",
  product_platform: "1",
  option_type: "digital",
  game_type: "game",
  display_type: "basic",
  spoken_korean: "",
  interface_korean: "",
  subtitle_korean: "",
  exclusive_korean: "",
  steam_appid: "",
  packageid: "",
  bundleid: "",
  ...over,
});

// tbl_goods_item — 옵션상품 master(가변). title-option 후보 코드로 seed해 ✏️ 수정 로드 연동.
const optionStore = new Map<string, GoodsOption>();
const seed = (o: GoodsOption) => optionStore.set(o.product_code, o);
seed(
  opt({
    product_code: "DG-G-1001",
    product_name: "젤다의 전설 왕국의 눈물",
    product_name_en: "Zelda TotK",
    keyword: "젤다,zelda,totk,닌텐도",
    game_type: "game",
    display_type: "basic",
    interface_korean: "Y",
    subtitle_korean: "Y",
    spoken_korean: "Y",
    steam_appid: "0",
  }),
);
seed(
  opt({
    product_code: "DG-D-3001",
    product_name: "확장팩 DLC",
    product_name_en: "Expansion DLC",
    keyword: "dlc,확장팩,expansion",
    game_type: "dlc",
    display_type: "dlc",
    steam_appid: "1086941",
  }),
);
seed(
  opt({
    product_code: "DG-H-5001",
    product_name: "홀로모델 본체",
    product_name_en: "Holomodel Base",
    keyword: "홀로모델,holomodel",
    product_platform: "51",
    game_type: "holomodels",
    display_type: "holomodels",
  }),
);
// 실물상품(retail) — modify 조건부 model_code/model_name 필드 검증용. 직접 URL 진입.
seed(
  opt({
    product_code: "DG-R-7001",
    product_name: "닌텐도 스위치 프로 컨트롤러",
    product_name_en: "Nintendo Switch Pro Controller",
    keyword: "컨트롤러,프로콘,controller",
    option_type: "retail",
    model_code: "HAC-013",
    model_name: "Pro Controller",
    product_platform: "32",
    game_type: "accessories",
    display_type: "basic",
  }),
);
// 타임딜 상품 — sales 화면 timedeal 블록(display_type==timedeal) 검증용. 직접 URL 진입.
seed(
  opt({
    product_code: "DG-T-4001",
    product_name: "발더스 게이트 3 타임딜",
    product_name_en: "Baldur's Gate 3 Timedeal",
    keyword: "타임딜,timedeal",
    game_type: "timedeal",
    display_type: "timedeal",
    steam_appid: "1086940",
  }),
);

let codeSeq = 90000;

// ===== 옵션상품 목록(goods_option_list) =====
const NAME_PLATFORM: Record<string, string> = {
  "1": "Steam",
  "34": "Epic",
  "30": "Ubisoft Connect",
  "35": "Rockstar Games Launcher",
  "33": "Bethesda",
  "3": "Origin",
  "51": "홀로모델",
  "32": "기타",
};
const NAME_GAME_TYPE: Record<string, string> = {
  game: "게임",
  dlc: "DLC",
  music: "사운드트랙",
  bundle: "번들",
  randombox: "랜덤박스",
  timedeal: "타임딜",
  accessories: "악세사리",
  holomodels: "홀로모델",
};
const NAME_DISPLAY_TYPE: Record<string, string> = {
  basic: "기본게임",
  edition: "에디션",
  multi: "멀티팩",
  dlc: "DLC",
  game_bundle: "기본게임번들",
  dlc_bundle: "DLC번들",
  etc_bundle: "기타번들",
  timedeal: "타임딜",
  holomodels: "홀로모델",
  holomodelsdlc: "홀로모델 DLC",
  holomodelsedition: "홀로모델 에디션",
};
const NAME_STATUS: Record<string, string> = {
  "0": "판매중",
  "1": "판매중지",
  "2": "품절",
  "9": "승인대기",
  "3": "판매종료",
};
const NAME_ORDER_SYSTEM: Record<string, string> = {
  "1": "Asset API",
  "2": "Ztorm API",
  "9": "Genba API",
  "8": "Valutn API",
  "10": "PointNexus API",
};
const SUPPLIERS = [
  { code: "H2", name: "H2 Interactive" },
  { code: "NT", name: "닌텐도" },
  { code: "LR", name: "라리안" },
  { code: "VL", name: "Valve" },
];

type OptionListItem = {
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
  supplier_code: string;
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
  genres: { code: string; name: string }[];
  categories: { code: string; name: string }[];
  deliveries: {
    order_system_name: string;
    item_id: string;
    item_name: string;
    item_type: string;
    item_platform: string;
    item_publisher: string;
    stock: number;
    age_limit?: string;
  }[];
  title_id?: string; // 판매종료 목록 부가정보
  is_special?: string; // 판매종료 목록 특전제공유무 필터
  model_code?: string; // 실물상품 목록
  model_name?: string;
  domain?: string;
  delivery_type?: string;
};

const listItem = (over: Partial<OptionListItem> & { product_code: string }): OptionListItem => {
  const game_type = over.game_type ?? "game";
  const display_type = over.display_type ?? "basic";
  const platform = over.platform ?? "1";
  const status = over.status ?? "0";
  const supplier_code = over.supplier_code ?? "H2";
  const supplier_name = SUPPLIERS.find((s) => s.code === supplier_code)?.name ?? "";
  return {
    // 기본값(비 code/name 필드) — override로 덮음.
    goods_sku: uuid(),
    product_name: "옵션상품",
    product_name_en: "Option Product",
    option_type: "digital",
    release_date: "2026-06-01",
    is_free: "N",
    discount: 10,
    consumer_price: 66000,
    price: 59400,
    steam_appid: "",
    packageid: "",
    bundleid: "",
    is_view: "Y",
    spoken_korean: "",
    interface_korean: "Y",
    subtitle_korean: "Y",
    exclusive_korean: "",
    is_bonus: "N",
    is_auth: "N",
    soldout: "N",
    is_preorder: "N",
    is_naverpay_coupon: "N",
    delivery_date: 0,
    view_url: "https://directg.net/game/game_view.html",
    package_view_url: "",
    is_package_view: "N",
    genres: [{ code: "10", name: "액션" }],
    categories: [{ code: "50", name: "싱글 플레이어" }],
    deliveries: [
      {
        order_system_name: NAME_ORDER_SYSTEM["1"],
        item_id: `ASSET-${over.product_code}`,
        item_name: over.product_name ?? "옵션상품",
        item_type: "CDKEY",
        item_platform: NAME_PLATFORM[platform] ?? platform,
        item_publisher: supplier_name,
        stock: 120,
      },
    ],
    ...over,
    // code/name 파생 필드는 override 반영 로컬 기준으로 한 번만 확정(spread 뒤).
    game_type,
    game_type_name: NAME_GAME_TYPE[game_type] ?? game_type,
    display_type,
    display_type_name: NAME_DISPLAY_TYPE[display_type] ?? display_type,
    platform,
    platform_name: NAME_PLATFORM[platform] ?? platform,
    status,
    status_name: NAME_STATUS[status] ?? status,
    supplier_code,
    supplier_name,
  };
};

const OPTION_LIST: OptionListItem[] = [
  listItem({
    product_code: "DG-G-1001",
    product_name: "젤다의 전설 왕국의 눈물",
    product_name_en: "Zelda TotK",
    game_type: "game",
    display_type: "basic",
    supplier_code: "NT",
    platform: "1",
    interface_korean: "Y",
    subtitle_korean: "Y",
    spoken_korean: "Y",
    consumer_price: 79000,
    discount: 10,
    price: 71100,
  }),
  listItem({
    product_code: "DG-E-2001",
    product_name: "젤다 디럭스 에디션",
    product_name_en: "Zelda Deluxe",
    game_type: "game",
    display_type: "edition",
    supplier_code: "NT",
    consumer_price: 89000,
    price: 80100,
    is_package_view: "Y",
    package_view_url: "https://directg.net/game/game_package_view.html",
  }),
  listItem({
    product_code: "DG-D-3001",
    product_name: "확장팩 DLC",
    product_name_en: "Expansion DLC",
    game_type: "dlc",
    display_type: "dlc",
    steam_appid: "1086941",
    consumer_price: 30000,
    price: 27000,
    is_bonus: "Y",
  }),
  listItem({
    product_code: "DG-M-8001",
    product_name: "오리지널 사운드트랙",
    product_name_en: "OST",
    game_type: "music",
    display_type: "dlc",
    consumer_price: 15000,
    price: 13500,
    status: "9",
  }),
  listItem({
    product_code: "DG-B-9001",
    product_name: "게임+DLC 번들",
    product_name_en: "Game + DLC Bundle",
    game_type: "bundle",
    display_type: "game_bundle",
    bundleid: "5501",
    consumer_price: 99000,
    price: 79000,
    is_preorder: "Y",
  }),
  listItem({
    product_code: "DG-G-1006",
    product_name: "발더스 게이트 3",
    product_name_en: "Baldur's Gate 3",
    game_type: "game",
    display_type: "basic",
    supplier_code: "LR",
    platform: "1",
    steam_appid: "1086940",
    interface_korean: "Y",
    subtitle_korean: "Y",
    exclusive_korean: "Y",
    consumer_price: 66000,
    discount: 20,
    price: 52800,
    is_auth: "Y",
  }),
  listItem({
    product_code: "DG-G-1007",
    product_name: "무료 체험판",
    product_name_en: "Free Trial",
    game_type: "game",
    display_type: "basic",
    is_free: "Y",
    is_view: "N",
    status: "1",
  }),
];

// ===== 판매종료 옵션상품(goods_option_end) — status=3 목록 =====
const END_LIST: OptionListItem[] = [
  listItem({
    product_code: "DG-E-3901",
    product_name: "옛 명작 게임",
    product_name_en: "Old Classic Game",
    game_type: "game",
    display_type: "basic",
    supplier_code: "H2",
    status: "3",
    steam_appid: "70",
    interface_korean: "Y",
    is_bonus: "Y",
    title_id: "3901",
    is_special: "Y",
  }),
  listItem({
    product_code: "DG-E-3902",
    product_name: "종료된 DLC",
    product_name_en: "Ended DLC",
    game_type: "dlc",
    display_type: "dlc",
    supplier_code: "LR",
    status: "3",
    consumer_price: 20000,
    price: 18000,
    title_id: "",
    is_special: "N",
  }),
];
const PER_PAGE_END = 30; // legacy getGoodsOptionList $limit 30

// ===== 홀로모델 옵션상품(goods_holomodels_list) — status≠3 + holomodels 계열 =====
const HOLO_TYPES = ["holomodels", "holomodelsdlc", "holomodelsedition"];
const HOLO_LIST: OptionListItem[] = [
  listItem({
    product_code: "DG-H-5001",
    product_name: "홀로모델 본체",
    product_name_en: "Holomodel Base",
    game_type: "holomodels",
    display_type: "holomodels",
    platform: "51",
    supplier_code: "H2",
    status: "0",
    consumer_price: 49000,
    price: 44100,
    view_url: "https://directg.net/game/holomodels_view.html?product_id=5001&platform=51",
  }),
  listItem({
    product_code: "DG-H-5002",
    product_name: "홀로모델 확장 DLC",
    product_name_en: "Holomodel Expansion DLC",
    game_type: "holomodelsdlc",
    display_type: "holomodelsdlc",
    platform: "51",
    supplier_code: "NT",
    status: "0",
    consumer_price: 15000,
    price: 15000,
    discount: 0,
    view_url: "https://directg.net/game/holomodelsdlc_view.html?platform=51",
  }),
];
const PER_PAGE_HOLO = 20; // legacy getGoodsOptionList $limit 20

// ===== 실물상품 목록(goods_etc_list) — status≠3 + game_type=accessories =====
const ETC_LIST: OptionListItem[] = [
  listItem({
    product_code: "DG-A-6001",
    product_name: "닌텐도 스위치 프로 컨트롤러",
    product_name_en: "Nintendo Switch Pro Controller",
    game_type: "accessories",
    display_type: "basic",
    platform: "32",
    supplier_code: "NT",
    status: "0",
    consumer_price: 64800,
    price: 58000,
    delivery_type: "2",
    model_code: "HAC-013",
    model_name: "Pro Controller",
    domain: "image.directg.net",
    title_id: "6001",
    view_url: "https://directg.net/game/goods_item_view.html?sku=DG-A-6001&platform=32",
  }),
  listItem({
    product_code: "DG-A-6002",
    product_name: "게임+굿즈 실물패키지",
    product_name_en: "Game + Goods Physical Package",
    game_type: "accessories",
    display_type: "basic",
    platform: "1",
    supplier_code: "H2",
    status: "0",
    consumer_price: 89000,
    price: 80100,
    delivery_type: "3",
    model_code: "PKG-002",
    model_name: "Collector Package",
    domain: "image.directg.net",
    title_id: "",
    steam_appid: "1086940",
    view_url: "https://directg.net/game/goods_item_view.html?sku=DG-A-6002&platform=1",
    deliveries: [
      {
        order_system_name: "Asset API",
        item_id: "ASSET-6002",
        item_name: "Baldur's Gate 3",
        item_type: "CDKEY",
        item_platform: "Steam",
        item_publisher: "라리안",
        stock: 40,
        age_limit: "15",
      },
    ],
  }),
];
const PER_PAGE_ETC = 30; // legacy getGoodsOptionList $limit 30

const PER_PAGE_OPT = 20; // legacy getGoodsOptionList 20/page
const contains2 = (haystack: string, needle: string) =>
  haystack.toLowerCase().includes(needle.toLowerCase());

// goods_option_image_chk 전용: product_code → header 이미지 도메인/웹서버 존재. 미지정은 domain=null·미존재.
// domain: tbl_goods_item.domain(웹서버 https://directg.net / 디스크엔 https://image.directg.net / ""(웹서버 미분류) / null(이미지없음)).
// header_web_exists: 웹서버 header.jpg 존재 → 디스크엔 등록 버튼 노출용.
const OPTION_IMAGE_STATE: Record<string, { domain: string | null; header_web_exists: boolean }> = {
  "DG-G-1001": { domain: "https://image.directg.net", header_web_exists: true },
  "DG-E-2001": { domain: "https://directg.net", header_web_exists: true },
  "DG-D-3001": { domain: "https://directg.net", header_web_exists: true },
  "DG-M-8001": { domain: null, header_web_exists: false },
  "DG-B-9001": { domain: "https://image.directg.net", header_web_exists: true },
  "DG-G-1006": { domain: "", header_web_exists: true },
  "DG-G-1007": { domain: "https://image.directg.net", header_web_exists: false },
  "DG-E-3901": { domain: "https://directg.net", header_web_exists: false },
  "DG-E-3902": { domain: null, header_web_exists: false },
  "DG-H-5001": { domain: "https://image.directg.net", header_web_exists: true },
  "DG-H-5002": { domain: null, header_web_exists: false },
  "DG-A-6001": { domain: "https://directg.net", header_web_exists: true },
  "DG-A-6002": { domain: null, header_web_exists: false },
};

// goods_option_screenshot_chk 전용: DLC 옵션 + 스팀 스크린샷 후보(downloaded=로컬 존재→완료).
const ssShot = (appid: string, id: number, downloaded: boolean) => ({
  id,
  path_full: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/ss_${id}.jpg`,
  path_thumbnail: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/ss_${id}.116x65.jpg`,
  downloaded,
});
const SCREENSHOT_CHK_LIST = [
  {
    product_code: "DG-D-3001",
    steam_appid: "1086941",
    goods_sku: "SKU-DLC-3001",
    product_name: "확장팩 DLC",
    product_name_en: "Expansion DLC",
    release_date: "2026-05-20",
    sales_status: "S",
    has_json: true,
    screenshots: [
      ssShot("1086941", 0, true),
      ssShot("1086941", 1, false),
      ssShot("1086941", 2, false),
      ssShot("1086941", 3, false),
    ],
  },
  {
    product_code: "DG-D-3002",
    steam_appid: "2050650",
    goods_sku: "SKU-DLC-3002",
    product_name: "시즌 패스 DLC",
    product_name_en: "Season Pass DLC",
    release_date: "2026-03-10",
    sales_status: "C",
    has_json: true,
    screenshots: [
      ssShot("2050650", 0, true),
      ssShot("2050650", 1, true),
      ssShot("2050650", 2, true),
    ],
  },
  {
    product_code: "DG-D-3003",
    steam_appid: "9999999",
    goods_sku: "SKU-DLC-3003",
    product_name: "스토리 확장 DLC",
    product_name_en: "Story Expansion DLC",
    release_date: "2026-01-05",
    sales_status: "S",
    has_json: false,
    screenshots: [],
  },
];
const PER_PAGE_SS_CHK = 10; // legacy getGoodsOptionList 10/page

// ===== 옵션상품 상세보기(goods_option_view) 시드 =====
type OptionDelivery = {
  order_system: string;
  item_platform: string;
  item_id: string;
  item_type: string;
  item_name: string;
  flag: string;
  item_publisher?: string; // 판매설정(sales) 배송아이템 공급처 컬럼
};
type OptionPackageItem = {
  package_srl: number;
  appid: string;
  item_type: string;
  item_code: string;
  item_name: string;
  app_price: number;
};
type OptionTag = { code: string; name: string };
type OptionViewSeed = {
  option: Record<string, string | number>;
  description_html: string;
  requirements_html: string;
  short_description: string;
  screenshots: {
    idx: number;
    screenshot_num: string;
    url: string;
    thumbnail: string;
    sort: number;
  }[];
  title_info: {
    title_id: string;
    title_name: string;
    title_name_en: string;
    publisher: string;
    release_date: string;
  };
  genres: OptionTag[];
  categories: OptionTag[];
};

// 편집 대상(가변) store. delivery/package는 mutation으로 변경.
const deliveriesStore = new Map<string, OptionDelivery[]>();
const packageItemsStore = new Map<string, OptionPackageItem[]>();
let packageSrlSeq = 7000;

const viewDetail = (over: Record<string, string | number>) => ({
  goods_sku: uuid(),
  model_code: "",
  model_name: "",
  product_platform: "1",
  genre: "",
  category: "",
  release_date: "2026-06-01",
  option_type: "digital",
  game_type: "game",
  delivery_type: "1",
  display_type: "basic",
  spoken_korean: "",
  interface_korean: "Y",
  exclusive_korean: "",
  subtitle_korean: "Y",
  is_view: "Y",
  bundle_type: "",
  is_package_view: "N",
  domain: "cdn.directg.net",
  status: "0",
  purchase_limit_yn: "N",
  purchase_limit: 0,
  is_stock: "N",
  item_stock: 100,
  consumer_price: 66000,
  price: 59400,
  discount: 10,
  supplier_code: "H2",
  product_srp: 60000,
  product_ppr: 42000,
  product_rs: "30",
  steam_appid: "",
  packageid: "",
  bundleid: "",
  ...over,
});

const viewSeeds = new Map<string, OptionViewSeed>();
const seedView = (code: string, seed: OptionViewSeed) => viewSeeds.set(code, seed);

seedView("DG-G-1001", {
  option: viewDetail({
    product_code: "DG-G-1001",
    product_name: "젤다의 전설 왕국의 눈물",
    product_name_en: "Zelda TotK",
    genre: "10,11",
    category: "50",
    interface_korean: "Y",
    subtitle_korean: "Y",
    spoken_korean: "Y",
    consumer_price: 79000,
    price: 71100,
    discount: 10,
    steam_appid: "0",
  }),
  description_html: "<p>광활한 하이랄을 모험하세요.</p>",
  requirements_html: "<p><strong>최소</strong>: Nintendo Switch</p>",
  short_description: "오픈월드 액션 어드벤처",
  screenshots: [
    {
      idx: 1,
      screenshot_num: "1",
      url: "/upload/product/DG-G-1001/screenshot/1.jpg",
      thumbnail: "/upload/product/DG-G-1001/screenshot/1_t.jpg",
      sort: 1,
    },
    {
      idx: 2,
      screenshot_num: "2",
      url: "/upload/product/DG-G-1001/screenshot/2.jpg",
      thumbnail: "/upload/product/DG-G-1001/screenshot/2_t.jpg",
      sort: 2,
    },
  ],
  title_info: {
    title_id: "1001",
    title_name: "젤다의 전설 왕국의 눈물",
    title_name_en: "The Legend of Zelda: Tears of the Kingdom",
    publisher: "닌텐도",
    release_date: "2023-05-12",
  },
  genres: [
    { code: "10", name: "액션" },
    { code: "11", name: "어드벤처" },
  ],
  categories: [{ code: "50", name: "싱글 플레이어" }],
});

seedView("DG-D-3001", {
  option: viewDetail({
    product_code: "DG-D-3001",
    product_name: "확장팩 DLC",
    product_name_en: "Expansion DLC",
    game_type: "dlc",
    display_type: "dlc",
    genre: "10",
    consumer_price: 30000,
    price: 27000,
    steam_appid: "1086941",
    packageid: "0",
  }),
  description_html: "<p>추가 컨텐츠 확장팩.</p>",
  requirements_html: "<p>본편 필요.</p>",
  short_description: "본편 확장 DLC",
  screenshots: [],
  title_info: {
    title_id: "1006",
    title_name: "발더스 게이트 3",
    title_name_en: "Baldur's Gate 3",
    publisher: "라리안",
    release_date: "2023-08-03",
  },
  genres: [{ code: "10", name: "액션" }],
  categories: [],
});

seedView("DG-R-7001", {
  option: viewDetail({
    product_code: "DG-R-7001",
    product_name: "닌텐도 스위치 프로 컨트롤러",
    product_name_en: "Nintendo Switch Pro Controller",
    option_type: "retail",
    model_code: "HAC-013",
    model_name: "Pro Controller",
    product_platform: "32",
    game_type: "accessories",
    delivery_type: "2",
    consumer_price: 64800,
    price: 58000,
    discount: 10,
  }),
  description_html: "<p>정품 프로 컨트롤러.</p>",
  requirements_html: "",
  short_description: "무선 컨트롤러",
  screenshots: [],
  title_info: {
    title_id: "",
    title_name: "",
    title_name_en: "",
    publisher: "",
    release_date: "",
  },
  genres: [],
  categories: [],
});

// ===== 옵션상품 장르 설정(goods_option_genre_register) =====
// 태그 그룹 마스터(G0*=게임 장르, HG*=홀로모델 장르). goods-title TAG_MASTER와 정합.
const GENRE_GROUPS = [
  {
    group_code: "G0001",
    group_name: "게임 장르",
    tags: [
      { tag_code: "10", tag_name: "액션" },
      { tag_code: "11", tag_name: "어드벤처" },
      { tag_code: "12", tag_name: "RPG" },
      { tag_code: "13", tag_name: "전략" },
      { tag_code: "14", tag_name: "시뮬레이션" },
      { tag_code: "15", tag_name: "스포츠" },
      { tag_code: "16", tag_name: "캐주얼" },
      { tag_code: "17", tag_name: "인디" },
      { tag_code: "18", tag_name: "앞서 해보기" },
      { tag_code: "19", tag_name: "레이싱" },
    ],
  },
  {
    group_code: "HG0001",
    group_name: "홀로모델 장르",
    tags: [{ tag_code: "HG10", tag_name: "엔터테인먼트" }],
  },
];
// 옵션상품 선택 장르 코드(가변). view 시드 genre와 정합.
const genreStore = new Map<string, string[]>();
genreStore.set("DG-G-1001", ["10", "11"]);
genreStore.set("DG-D-3001", ["10"]);

// ===== 옵션상품 카테고리 설정(goods_option_category_register) =====
// C0*=게임 카테고리, HC*=홀로모델, P*=PS 액세서리, R*=Razer. goods-title TAG_MASTER와 정합.
const CATEGORY_GROUPS = [
  {
    group_code: "C0001",
    group_name: "플레이어 수",
    tags: [
      { tag_code: "50", tag_name: "싱글 플레이어" },
      { tag_code: "51", tag_name: "멀티플레이어" },
      { tag_code: "52", tag_name: "온라인 PvP" },
      { tag_code: "53", tag_name: "온라인 협동" },
      { tag_code: "54", tag_name: "LAN PvP" },
      { tag_code: "55", tag_name: "LAN 협동" },
      { tag_code: "56", tag_name: "협동" },
      { tag_code: "57", tag_name: "MMO" },
      { tag_code: "58", tag_name: "플랫폼간 멀티플레이어" },
      { tag_code: "59", tag_name: "4인 로컬 플레이" },
      { tag_code: "60", tag_name: "로컬 멀티플레이어" },
      { tag_code: "61", tag_name: "비동기 멀티플레이어" },
      { tag_code: "62", tag_name: "대규모 멀티플레이어" },
    ],
  },
  {
    group_code: "C0002",
    group_name: "화면 및 디스플레이",
    tags: [
      { tag_code: "70", tag_name: "HDR 사용 가능" },
      { tag_code: "71", tag_name: "스크린 공유 및 분할 PvP" },
      { tag_code: "72", tag_name: "스크린 공유 및 분할 협동" },
      { tag_code: "73", tag_name: "공유/분할 화면" },
    ],
  },
  {
    group_code: "C0003",
    group_name: "VR 및 컨트롤러 지원",
    tags: [
      { tag_code: "80", tag_name: "VR 전용" },
      { tag_code: "81", tag_name: "VR 지원" },
      { tag_code: "82", tag_name: "추적되는 컨트롤러 지원" },
      { tag_code: "83", tag_name: "컨트롤러 완벽 지원" },
      { tag_code: "84", tag_name: "컨트롤러 일부 지원" },
    ],
  },
  {
    group_code: "C0004",
    group_name: "게임 서비스 및 기능",
    tags: [
      { tag_code: "90", tag_name: "코멘터리 제공" },
      { tag_code: "91", tag_name: "추가적인 고품질 오디오" },
      { tag_code: "92", tag_name: "레벨 에디터 포함" },
      { tag_code: "93", tag_name: "다운로드 가능한 콘텐츠" },
    ],
  },
  {
    group_code: "C0005",
    group_name: "접근성 기능",
    tags: [
      { tag_code: "100", tag_name: "텍스트 크기 조절" },
      { tag_code: "101", tag_name: "자막 옵션" },
      { tag_code: "102", tag_name: "색상 대체" },
      { tag_code: "103", tag_name: "카메라 움직임 조정" },
      { tag_code: "104", tag_name: "음량 개별 조정" },
      { tag_code: "105", tag_name: "스테레오 사운드" },
      { tag_code: "106", tag_name: "서라운드 사운드" },
      { tag_code: "107", tag_name: "게임 메뉴 음성 안내" },
      { tag_code: "108", tag_name: "퀵타임 이벤트 없이 플레이 가능" },
      { tag_code: "109", tag_name: "텍스트 채팅 음성 변환" },
      { tag_code: "110", tag_name: "키보드 전용 옵션" },
      { tag_code: "111", tag_name: "마우스 전용 옵션" },
      { tag_code: "112", tag_name: "터치 전용 옵션" },
      { tag_code: "113", tag_name: "난이도 조정" },
      { tag_code: "114", tag_name: "수시 저장" },
    ],
  },
  {
    group_code: "HC0001",
    group_name: "홀로모델 카테고리",
    tags: [
      { tag_code: "HC50", tag_name: "디지털 피규어 본체" },
      { tag_code: "HC51", tag_name: "확장 세트" },
      { tag_code: "HC52", tag_name: "전용 굿즈 및 액세서리" },
    ],
  },
  {
    group_code: "P0001",
    group_name: "PS 액세서리",
    tags: [
      { tag_code: "P10", tag_name: "컨트롤러" },
      { tag_code: "P11", tag_name: "헤드셋" },
    ],
  },
  {
    group_code: "R0001",
    group_name: "Razer",
    tags: [
      { tag_code: "R10", tag_name: "마우스" },
      { tag_code: "R11", tag_name: "키보드" },
    ],
  },
];
// 옵션상품 선택 카테고리 코드(가변). view 시드 category와 정합.
const categoryStore = new Map<string, string[]>();
categoryStore.set("DG-G-1001", ["50"]);

// ===== 옵션상품 태그 설정(goods_option_tag_register) =====
// GT*=게임 장르 연관태그, T*=게임 태그정보. 운영 태그(tbl_tags) 미확인 → placeholder.
const TAG_SETTING_GROUPS = [
  {
    group_code: "GT0001",
    group_name: "게임 장르 연관태그",
    tags: [
      { tag_code: "GT10", tag_name: "액션 어드벤처" },
      { tag_code: "GT11", tag_name: "핵 앤 슬래시" },
      { tag_code: "GT12", tag_name: "오픈 월드" },
      { tag_code: "GT13", tag_name: "로그라이크" },
      { tag_code: "GT14", tag_name: "소울라이크" },
    ],
  },
  {
    group_code: "T0001",
    group_name: "게임 태그정보",
    tags: [
      { tag_code: "T10", tag_name: "스토리 중심" },
      { tag_code: "T11", tag_name: "분위기" },
      { tag_code: "T12", tag_name: "판타지" },
      { tag_code: "T13", tag_name: "공포" },
      { tag_code: "T14", tag_name: "협동" },
      { tag_code: "T15", tag_name: "난이도 있는" },
    ],
  },
];
// 옵션상품 선택 태그 코드(가변).
const tagStore = new Map<string, string[]>();
tagStore.set("DG-G-1001", ["GT12", "T10"]);

// ===== 옵션상품 이미지 설정(goods_option_image_register) — header 슬롯 =====
// header_image는 steam JSON 파싱(mock 미보유 → "")·steam_url은 appid로 조립(legacy header_url 폴백 경로).
const steamHeaderUrl = (appid: string) =>
  Number.parseInt(appid || "0", 10) > 0
    ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`
    : "";
// 이미지 존재 상태(가변). web_uploaded=로컬 header.jpg, disk_exists=디스크엔(remoteFileExist).
type OptionImageState = { web_uploaded: boolean; disk_exists: boolean };
const optionImageStore = new Map<string, OptionImageState>();
optionImageStore.set("DG-G-1001", { web_uploaded: true, disk_exists: false });
optionImageStore.set("DG-D-3001", { web_uploaded: false, disk_exists: true });

// ===== 옵션상품 상세설명 설정(goods_option_description_register_v2 — 운영 병합 페이지) =====
// description_v2(SE2 HTML) + 마크다운/텍스트 필드(가변).
const descriptionV2Store = new Map<string, string>();
descriptionV2Store.set("DG-G-1001", "<p>젤다의 전설 왕국의 눈물 — 상세설명(ver2).</p>");
type OptionDescFields = {
  requirements: string;
  legal_text: string;
  short_description: string;
  region_msg: string;
};
const descriptionFieldsStore = new Map<string, OptionDescFields>();
descriptionFieldsStore.set("DG-G-1001", {
  requirements: "**최소**: Nintendo Switch",
  legal_text: "© Nintendo",
  short_description: "오픈월드 액션 어드벤처",
  region_msg: "대한민국 외 국가에서는 제품코드(키) 등록 및 플레이가 불가능합니다.",
});
const emptyDescFields = (): OptionDescFields => ({
  requirements: "",
  legal_text: "",
  short_description: "",
  region_msg: "",
});

// ===== 옵션상품 판매 설정(goods_option_sales_register) =====
const PUBLISHERS_SALES = [
  { publisher_code: "H2", publisher_name: "H2 Interactive" },
  { publisher_code: "NT", publisher_name: "닌텐도" },
  { publisher_code: "LR", publisher_name: "라리안" },
  { publisher_code: "VL", publisher_name: "Valve" },
];
type SalesSettings = {
  is_view: string;
  status: string;
  purchase_limit_yn: string;
  purchase_limit: string;
  release_date: string;
  delivery_date: string;
  is_preorder: string;
  soldout: string;
  is_auth: string;
  is_bonus: string;
  is_naverpay_coupon: string;
  delivery_type: string;
};
type PriceSettings = { consumer_price: string; price: string; discount: string };
type SupplierSettings = {
  supplier_code: string;
  product_srp: string;
  product_ppr: string;
  product_rs: string;
};
type SalesState = { sales: SalesSettings; price: PriceSettings; supplier: SupplierSettings };
const defaultSalesState = (): SalesState => ({
  sales: {
    is_view: "Y",
    status: "0",
    purchase_limit_yn: "N",
    purchase_limit: "0",
    release_date: "",
    delivery_date: "",
    is_preorder: "N",
    soldout: "N",
    is_auth: "N",
    is_bonus: "N",
    is_naverpay_coupon: "N",
    delivery_type: "1",
  },
  price: { consumer_price: "0", price: "0", discount: "0" },
  supplier: { supplier_code: "", product_srp: "0", product_ppr: "0", product_rs: "0" },
});
const salesStore = new Map<string, SalesState>();
salesStore.set("DG-G-1001", {
  sales: {
    is_view: "Y",
    status: "0",
    purchase_limit_yn: "N",
    purchase_limit: "0",
    release_date: "2023-05-12 00:00",
    delivery_date: "2023-05-12 00:00",
    is_preorder: "N",
    soldout: "N",
    is_auth: "N",
    is_bonus: "N",
    is_naverpay_coupon: "N",
    delivery_type: "1",
  },
  price: { consumer_price: "79000", price: "71100", discount: "10" },
  supplier: { supplier_code: "NT", product_srp: "60000", product_ppr: "42000", product_rs: "30" },
});
// legacy discount = round((consumer-price)/consumer*100)(0 나눗셈 방지).
const computeDiscount = (consumer: string, price: string) => {
  const c = Number.parseInt(consumer || "0", 10);
  const p = Number.parseInt(price || "0", 10);
  if (!c) {
    return "0";
  }
  return String(Math.round(((c - p) / c) * 100));
};

// ===== 옵션상품 구성정보 설정(goods_option_package_register — col-8) =====
type PackageUnit = { idx: number; unit_code: string; unit_type: string; unit_name: string };
type PackageState = {
  is_package_view: string;
  is_bonus: string;
  bonus_description: string;
  units: PackageUnit[];
};
let unitIdxSeq = 8000;
const packageStore = new Map<string, PackageState>();
packageStore.set("DG-D-3001", {
  is_package_view: "Y",
  is_bonus: "Y",
  bonus_description: "<p>구매특전: 오리지널 사운드트랙 다운로드 코드 제공.</p>",
  units: [
    { idx: 8001, unit_code: "DG-G-1006", unit_type: "1", unit_name: "발더스 게이트 3 (스팀)" },
    { idx: 8002, unit_code: "DG-D-3001", unit_type: "2", unit_name: "확장팩 DLC" },
  ],
});
const defaultPackageState = (): PackageState => ({
  is_package_view: "N",
  is_bonus: "N",
  bonus_description: "",
  units: [],
});
// game_type → unit_type(구성상세) 매핑.
const UNIT_TYPE_BY_GAME: Record<string, string> = { game: "1", dlc: "2", music: "3" };
const platformSuffix = (platform: string) =>
  platform === "1" ? " (스팀)" : platform === "34" ? " (에픽게임즈)" : "";

// ===== Steam 구성정보 참고(package col-4) — read-only 샘플 =====
type SteamPackageItem = { appid: string; app_type: string; app_name: string; app_price: number };
type SteamPackageState = {
  package_type: string;
  packageid: string;
  bundleid: string;
  items: SteamPackageItem[];
};
const steamPackageStore = new Map<string, SteamPackageState>();
steamPackageStore.set("DG-D-3001", {
  package_type: "bundle",
  packageid: "",
  bundleid: "5501",
  items: [
    { appid: "1086940", app_type: "game", app_name: "Baldur's Gate 3", app_price: 66000 },
    { appid: "1086941", app_type: "dlc", app_name: "", app_price: 30000 },
  ],
});

// ===== 옵션상품 포인트 설정(goods_option_repay_register) =====
type RepayHistory = {
  repay_point: number;
  repay_type: string;
  start_dt: string;
  end_dt: string;
  repay_flag: string;
};
const repayStore = new Map<string, string>(); // product_code → is_repay
repayStore.set("DG-G-1001", "Y");

// ===== 옵션상품 스크린샷 설정(goods_option_screenshot_register) =====
type ScreenshotItem = {
  idx: number;
  screenshot_num: string;
  url: string;
  thumbnail: string;
  sort: number;
  disk_exists: boolean;
};
let screenshotIdxSeq = 9000;
const screenshotStore = new Map<string, ScreenshotItem[]>();
screenshotStore.set("DG-D-3001", [
  {
    idx: 9001,
    screenshot_num: "1",
    url: "/upload/screenshot/DG-D-3001/1.jpg",
    thumbnail: "upload/screenshot/DG-D-3001/thumbnail/1.jpg",
    sort: 1,
    disk_exists: true,
  },
  {
    idx: 9002,
    screenshot_num: "2",
    url: "/upload/screenshot/DG-D-3001/2.jpg",
    thumbnail: "upload/screenshot/DG-D-3001/thumbnail/2.jpg",
    sort: 2,
    disk_exists: false,
  },
]);
// steam 다운로드 후보(apps JSON) 샘플.
const steamScreenshotCandidates = (appid: string) =>
  Number.parseInt(appid || "0", 10) > 0
    ? Array.from({ length: 4 }, (_, i) => ({
        id: i,
        path_full: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appid}/ss_${i}.jpg`,
        path_thumbnail: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appid}/ss_${i}_thumb.jpg`,
        downloaded: i < 2,
      }))
    : [];
const addRepayHistoryStore = new Map<string, RepayHistory[]>();
addRepayHistoryStore.set("DG-G-1001", [
  {
    repay_point: 5,
    repay_type: "%",
    start_dt: "2026-06-01 00:00:00",
    end_dt: "2026-06-30 23:59:59",
    repay_flag: "지급중",
  },
  {
    repay_point: 1000,
    repay_type: "원",
    start_dt: "2026-05-01 00:00:00",
    end_dt: "2026-05-31 23:59:59",
    repay_flag: "종료",
  },
]);

// ===== 옵션상품 타임딜 설정(sales timedeal 블록) =====
type TimedealConfig = {
  timedeal_start_date: string;
  timedeal_end_date: string;
  product_srp: string;
  product_ppr: string;
  timedeal_price: string;
  timedeal_stock: string;
  timedeal_confirm: string;
};
type TimedealHistory = {
  timedeal_start: string;
  timedeal_end: string;
  timedeal_stock: number;
  timedeal_srp: number;
  timedeal_ppr: number;
  timedeal_price: number;
  timedeal_order: number;
  timedeal_status: string;
};
const timedealConfigStore = new Map<string, TimedealConfig>();
timedealConfigStore.set("DG-T-4001", {
  // legacy: start/end 초기값 미정의(빈값). srp/ppr/price/stock은 tbl_goods_item 현재값.
  timedeal_start_date: "",
  timedeal_end_date: "",
  product_srp: "60000",
  product_ppr: "42000",
  timedeal_price: "39000",
  timedeal_stock: "100",
  timedeal_confirm: "",
});
const timedealHistoryStore = new Map<string, TimedealHistory[]>();
timedealHistoryStore.set("DG-T-4001", [
  {
    timedeal_start: "2026-06-01 00:00:00",
    timedeal_end: "2026-06-07 23:59:59",
    timedeal_stock: 100,
    timedeal_srp: 60000,
    timedeal_ppr: 42000,
    timedeal_price: 39000,
    timedeal_order: 57,
    timedeal_status: "종료",
  },
]);

// 배송아이템/구성 초기 시드.
deliveriesStore.set("DG-G-1001", [
  {
    order_system: "1",
    item_platform: "Nintendo",
    item_id: "ASSET-1001",
    item_type: "기본게임",
    item_name: "Zelda TotK",
    flag: "Y",
    item_publisher: "닌텐도",
  },
]);
deliveriesStore.set("DG-D-3001", [
  {
    order_system: "2",
    item_platform: "Steam",
    item_id: "ZT-3001",
    item_type: "DLC",
    item_name: "Expansion DLC",
    flag: "N",
    item_publisher: "라리안",
  },
]);
packageItemsStore.set("DG-D-3001", [
  {
    package_srl: 6001,
    appid: "1086940",
    item_type: "1",
    item_code: "",
    item_name: "Baldur's Gate 3",
    app_price: 66000,
  },
  {
    package_srl: 6002,
    appid: "1086941",
    item_type: "2",
    item_code: "",
    item_name: "Expansion DLC",
    app_price: 30000,
  },
]);

export const goodsOptionHandlers = [
  // legacy goods_option_list.php — 필터/페이징(status<>3, game_type in game/dlc/music/bundle 기본, product_code desc).
  http.get(api("/admin/goods/options"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = OPTION_LIST.filter((r) => r.status !== "3");
    const gameType = q("search_game_type");
    if (gameType) {
      rows = rows.filter((r) => r.game_type === gameType);
    } else {
      rows = rows.filter((r) => ["game", "dlc", "music", "bundle"].includes(r.game_type));
    }
    const value = q("search_value");
    if (value) {
      const key = q("search_key") || "search_name";
      rows = rows.filter((r) => {
        switch (key) {
          case "search_product_code":
            return r.product_code === value;
          case "search_goods_sku":
            return r.goods_sku === value;
          case "search_name":
          default:
            return contains2(r.product_name, value) || contains2(r.product_name_en, value);
        }
      });
    }
    const status = q("search_status");
    if (status) {
      rows = rows.filter((r) => r.status === status);
    }
    const platform = q("search_product_platform");
    if (platform) {
      rows = rows.filter((r) => r.platform === platform);
    }
    const supplier = q("search_supplier_code");
    if (supplier) {
      rows = rows.filter((r) => r.supplier_code === supplier);
    }
    const isView = q("search_is_view");
    if (isView) {
      rows = rows.filter((r) => r.is_view === isView);
    }
    const displayType = q("search_display_type");
    if (displayType) {
      rows = rows.filter((r) => r.display_type === displayType);
    }
    const koreanFilter = (field: keyof OptionListItem, param: string) => {
      const v = q(param);
      if (v === "Y") {
        rows = rows.filter((r) => r[field] === "Y");
      } else if (v === "N") {
        rows = rows.filter((r) => r[field] !== "Y");
      }
    };
    koreanFilter("interface_korean", "search_interface_korean");
    koreanFilter("subtitle_korean", "search_subtitle_korean");
    koreanFilter("spoken_korean", "search_spoken_korean");
    koreanFilter("exclusive_korean", "search_exclusive_korean");

    // 예약판매/구매특전/네이버페이 쿠폰/본인인증 (Y|N), 품절여부(Y 체크박스).
    const ynFilter = (field: keyof OptionListItem, param: string) => {
      const v = q(param);
      if (v) {
        rows = rows.filter((r) => r[field] === v);
      }
    };
    ynFilter("is_preorder", "search_is_preorder");
    ynFilter("is_bonus", "search_is_bonus");
    ynFilter("is_naverpay_coupon", "search_is_naverpay_coupon");
    ynFilter("is_auth", "search_is_auth");
    const soldout = q("search_soldout");
    if (soldout) {
      rows = rows.filter((r) => r.soldout === soldout);
    }

    rows.sort((a, b) => (a.product_code < b.product_code ? 1 : -1));

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_OPT));
    const start = (page - 1) * PER_PAGE_OPT;
    const items = rows.slice(start, start + PER_PAGE_OPT);
    return HttpResponse.json({
      items,
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_OPT,
        total_results: totalResults,
        total_pages: totalPages,
      },
      suppliers: SUPPLIERS,
    });
  }),

  // legacy goods_option_end.php — 판매종료(status=3) 옵션상품 목록.
  http.get(api("/admin/goods/options/end"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    // 기본 필터: status=3 && display_type<>timedeal && game_type<>randombox (seed는 이미 status=3).
    let rows = END_LIST.filter(
      (r) => r.status === "3" && r.display_type !== "timedeal" && r.game_type !== "randombox",
    );
    const code = q("search_product_code");
    if (code) {
      rows = rows.filter((r) => r.product_code === code);
    }
    const name = q("search_product_name");
    if (name) {
      rows = rows.filter((r) => contains2(r.product_name, name));
    }
    const nameEn = q("search_product_name_en");
    if (nameEn) {
      rows = rows.filter((r) => contains2(r.product_name_en, nameEn));
    }
    const supplier = q("search_supplier_code");
    if (supplier) {
      rows = rows.filter((r) => r.supplier_code === supplier);
    }
    const platform = q("search_product_platform");
    if (platform) {
      rows = rows.filter((r) => r.platform === platform);
    }
    const gameType = q("search_game_type");
    if (gameType) {
      rows = rows.filter((r) => r.game_type === gameType);
    }
    const isView = q("search_is_view");
    if (isView) {
      rows = rows.filter((r) => r.is_view === isView);
    }
    const status = q("search_status");
    if (status) {
      rows = rows.filter((r) => r.status === status);
    }
    const isSpecial = q("search_is_special");
    if (isSpecial) {
      rows = rows.filter((r) => (r.is_special ?? "N") === isSpecial);
    }
    // 한국어(체크박스): Y일 때만 필터.
    for (const field of ["interface_korean", "spoken_korean", "exclusive_korean"] as const) {
      if (q(`search_${field}`) === "Y") {
        rows = rows.filter((r) => r[field] === "Y");
      }
    }

    rows.sort((a, b) => (a.product_code < b.product_code ? 1 : -1));

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_END));
    const start = (page - 1) * PER_PAGE_END;
    const items = rows.slice(start, start + PER_PAGE_END);
    return HttpResponse.json({
      items,
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_END,
        total_results: totalResults,
        total_pages: totalPages,
      },
      suppliers: SUPPLIERS,
    });
  }),

  // legacy goods_holomodels_list.php — 홀로모델 옵션상품 목록(status≠3 + holomodels 계열).
  http.get(api("/admin/goods/options/holomodels"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    // 기본 필터: status<>3. 구분(game_type) 미선택 시 holomodels 계열.
    let rows = HOLO_LIST.filter((r) => r.status !== "3");
    const gameType = q("search_game_type");
    if (gameType) {
      rows = rows.filter((r) => r.game_type === gameType);
    } else {
      rows = rows.filter((r) => HOLO_TYPES.includes(r.game_type));
    }
    const value = q("search_value");
    if (value) {
      const key = q("search_key") || "search_name";
      rows = rows.filter((r) => {
        switch (key) {
          case "search_product_code":
            return r.product_code === value;
          case "search_goods_sku":
            return r.goods_sku === value;
          default:
            return contains2(r.product_name, value) || contains2(r.product_name_en, value);
        }
      });
    }
    const status = q("search_status");
    if (status) {
      rows = rows.filter((r) => r.status === status);
    }
    const supplier = q("search_supplier_code");
    if (supplier) {
      rows = rows.filter((r) => r.supplier_code === supplier);
    }
    const platform = q("search_product_platform");
    if (platform) {
      rows = rows.filter((r) => r.platform === platform);
    }
    const displayType = q("search_display_type");
    if (displayType) {
      rows = rows.filter((r) => r.display_type === displayType);
    }
    const isView = q("search_is_view");
    if (isView) {
      rows = rows.filter((r) => r.is_view === isView);
    }
    const soldout = q("search_soldout");
    if (soldout) {
      rows = rows.filter((r) => r.soldout === soldout);
    }
    // 한국어(라디오 Y/N).
    for (const field of [
      "interface_korean",
      "subtitle_korean",
      "spoken_korean",
      "exclusive_korean",
    ] as const) {
      const v = q(`search_${field}`);
      if (v === "Y") {
        rows = rows.filter((r) => r[field] === "Y");
      } else if (v === "N") {
        rows = rows.filter((r) => r[field] !== "Y");
      }
    }
    // 특전/예약/쿠폰 (Y|N).
    const ynFilter = (field: keyof OptionListItem, param: string) => {
      const v = q(param);
      if (v) {
        rows = rows.filter((r) => r[field] === v);
      }
    };
    ynFilter("is_bonus", "search_is_bonus");
    ynFilter("is_preorder", "search_is_preorder");
    ynFilter("is_naverpay_coupon", "search_is_naverpay_coupon");

    rows.sort((a, b) => (a.product_code < b.product_code ? 1 : -1));

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_HOLO));
    const start = (page - 1) * PER_PAGE_HOLO;
    const items = rows.slice(start, start + PER_PAGE_HOLO);
    return HttpResponse.json({
      items,
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_HOLO,
        total_results: totalResults,
        total_pages: totalPages,
      },
      suppliers: SUPPLIERS,
    });
  }),

  // legacy goods_etc_list.php — 실물상품 목록(status≠3 + game_type=accessories).
  http.get(api("/admin/goods/options/etc"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    // 기본 필터: status<>3 && game_type=accessories.
    let rows = ETC_LIST.filter((r) => r.status !== "3" && r.game_type === "accessories");
    const code = q("search_product_code");
    if (code) {
      rows = rows.filter((r) => r.product_code === code);
    }
    const name = q("search_product_name");
    if (name) {
      rows = rows.filter((r) => contains2(r.product_name, name));
    }
    const nameEn = q("search_product_name_en");
    if (nameEn) {
      rows = rows.filter((r) => contains2(r.product_name_en, nameEn));
    }
    const supplier = q("search_supplier_code");
    if (supplier) {
      rows = rows.filter((r) => r.supplier_code === supplier);
    }
    const platform = q("search_product_platform");
    if (platform) {
      rows = rows.filter((r) => r.platform === platform);
    }
    const status = q("search_status");
    if (status) {
      rows = rows.filter((r) => r.status === status);
    }
    const isView = q("search_is_view");
    if (isView) {
      rows = rows.filter((r) => r.is_view === isView);
    }
    const deliveryType = q("search_delivery_type");
    if (deliveryType) {
      rows = rows.filter((r) => (r.delivery_type ?? "") === deliveryType);
    }
    const soldout = q("search_soldout");
    if (soldout) {
      rows = rows.filter((r) => r.soldout === soldout);
    }

    rows.sort((a, b) => (a.product_code < b.product_code ? 1 : -1));

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_ETC));
    const start = (page - 1) * PER_PAGE_ETC;
    const items = rows.slice(start, start + PER_PAGE_ETC);
    return HttpResponse.json({
      items,
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_ETC,
        total_results: totalResults,
        total_pages: totalPages,
      },
      suppliers: SUPPLIERS,
    });
  }),

  // legacy goods_option_image_chk.php — 옵션 Header 이미지 확인 목록(product_platform≠3). :productCode보다 먼저.
  http.get(api("/admin/goods/options/image-chk"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    // 기본 WHERE: product_platform<>'3'(seed 전제). status<>3 기본제외 없음(판매종료 포함).
    let rows = OPTION_LIST.filter((r) => r.platform !== "3");
    const value = q("search_value");
    if (value) {
      const key = q("search_key") || "search_product_name";
      rows = rows.filter((r) =>
        key === "search_product_code"
          ? r.product_code === value
          : contains2(r.product_name, value) || contains2(r.product_name_en, value),
      );
    }
    const status = q("search_status");
    if (status) {
      rows = rows.filter((r) => r.status === status);
    }
    // domain 필터: 'Null' → domain is null, else 등호('all' → empty, legacy 버그). is_view는 무시(dead 필터).
    const domain = q("search_domain");
    if (domain) {
      rows = rows.filter((r) => {
        const d = OPTION_IMAGE_STATE[r.product_code]?.domain ?? null;
        return domain === "Null" ? d === null : d === domain;
      });
    }

    rows = [...rows].sort((a, b) => (a.product_code < b.product_code ? 1 : -1));

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_OPT));
    const start = (page - 1) * PER_PAGE_OPT;
    const items = rows.slice(start, start + PER_PAGE_OPT).map((r) => {
      const st = OPTION_IMAGE_STATE[r.product_code];
      return { ...r, domain: st?.domain ?? "", header_web_exists: st?.header_web_exists ?? false };
    });
    return HttpResponse.json({
      items,
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_OPT,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy goods_option_ps.php mode=diskn_upload_chk — 디스크엔 등록 완료. :productCode보다 먼저.
  http.post(api("/admin/goods/options/diskn-upload-chk"), async ({ request }) => {
    await request.json().catch(() => ({}));
    return HttpResponse.json({ success: true });
  }),

  // legacy goods_option_screenshot_chk.php — DLC 스크린샷 체크 목록. :productCode보다 먼저.
  http.get(api("/admin/goods/options/screenshot-chk"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    // 기본 WHERE(game_type=dlc, status∉{1,3}, display_type≠dlc_bundle)는 seed 전제.
    // ⚠️ search_product_code는 legacy에서 WHERE 미처리(dead) — 미적용.
    let rows = SCREENSHOT_CHK_LIST;
    const name = q("search_product_name");
    if (name) {
      rows = rows.filter((r) => contains2(r.product_name, name));
    }
    const appid = q("search_appid");
    if (appid) {
      rows = rows.filter((r) => r.steam_appid === appid);
    }
    rows = [...rows].sort((a, b) => (a.release_date < b.release_date ? 1 : -1));

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_SS_CHK));
    const start = (page - 1) * PER_PAGE_SS_CHK;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_SS_CHK),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_SS_CHK,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy 등록 진입 — product_code 채번 + goods_sku uuid.
  http.get(api("/admin/goods/options/new"), () => {
    codeSeq += 1;
    return HttpResponse.json({ product_code: `DG${codeSeq}`, goods_sku: uuid() });
  }),

  // legacy 수정 로드 — tbl_goods_item.
  http.get(api("/admin/goods/options/:productCode"), ({ params }) => {
    const code = String(params.productCode);
    const row = optionStore.get(code);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return HttpResponse.json(row);
  }),

  // legacy goods_option_ps.php register — INSERT tbl_goods_item.
  http.post(api("/admin/goods/options"), async ({ request }) => {
    const body = (await request.json()) as GoodsOption;
    optionStore.set(body.product_code, opt({ ...body }));
    return HttpResponse.json<MutationResponse>({ success: true, product_code: body.product_code });
  }),

  // legacy goods_option_ps.php modify — UPDATE tbl_goods_item(폼 필드).
  http.put(api("/admin/goods/options/:productCode"), async ({ params, request }) => {
    const code = String(params.productCode);
    const body = (await request.json()) as GoodsOption;
    const current = optionStore.get(code) ?? opt({ product_code: code });
    optionStore.set(code, { ...current, ...body, product_code: code });
    return HttpResponse.json<MutationResponse>({ success: true, product_code: code });
  }),

  // ===== 옵션상품 상세보기(goods_option_view) =====
  // legacy 통합 조회 — tbl_goods_item + description + screenshot + title_info + delivery + package.
  http.get(api("/admin/goods/options/:productCode/view"), ({ params }) => {
    const code = String(params.productCode);
    const seed = viewSeeds.get(code);
    if (!seed) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return HttpResponse.json({
      ...seed,
      deliveries: deliveriesStore.get(code) ?? [],
      package_items: packageItemsStore.get(code) ?? [],
    });
  }),

  // legacy delivery_item_delete — DELETE tbl_goods_item_delivery.
  http.delete(api("/admin/goods/options/:productCode/deliveries"), async ({ params, request }) => {
    const code = String(params.productCode);
    const body = (await request.json()) as { item_id: string; order_system: string };
    const rows = deliveriesStore.get(code) ?? [];
    deliveriesStore.set(
      code,
      rows.filter((r) => !(r.item_id === body.item_id && r.order_system === body.order_system)),
    );
    return HttpResponse.json({ success: true });
  }),

  // legacy package_delete — setGoodsItemPackageDelete(package_srl).
  http.delete(api("/admin/goods/options/packages/:packageSrl"), ({ params }) => {
    const srl = Number(params.packageSrl);
    for (const [code, rows] of packageItemsStore) {
      if (rows.some((r) => r.package_srl === srl)) {
        packageItemsStore.set(
          code,
          rows.filter((r) => r.package_srl !== srl),
        );
        break;
      }
    }
    return HttpResponse.json({ success: true });
  }),

  // legacy goods_ps.php package_add — INSERT tbl_goods_item_package.
  http.post(api("/admin/goods/options/:productCode/packages"), async ({ params, request }) => {
    const code = String(params.productCode);
    const body = (await request.json()) as {
      item_type: string;
      item_name: string;
      appid: string;
      item_code?: string;
    };
    packageSrlSeq += 1;
    const rows = packageItemsStore.get(code) ?? [];
    rows.push({
      package_srl: packageSrlSeq,
      appid: body.appid ?? "",
      item_type: body.item_type ?? "",
      item_code: body.item_code ?? "",
      item_name: body.item_name ?? "",
      app_price: 0,
    });
    packageItemsStore.set(code, rows);
    return HttpResponse.json({ success: true });
  }),

  // legacy bundle_delete — setGoodsItemBundleDelete(bndl_no). (bundle_item 단순화 — no-op)
  http.delete(api("/admin/goods/options/bundles/:bndlNo"), () =>
    HttpResponse.json({ success: true }),
  ),

  // ===== 옵션상품 장르 설정 =====
  // legacy goods_option_genre_register.php — 로드(product + 태그 그룹 + 현재 genre).
  http.get(api("/admin/goods/options/:productCode/genre"), ({ params }) => {
    const code = String(params.productCode);
    const row = optionStore.get(code);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return HttpResponse.json({
      product: {
        product_name: row.product_name,
        product_platform: row.product_platform,
        game_type: row.game_type,
        display_type: row.display_type,
      },
      groups: GENRE_GROUPS,
      selected: genreStore.get(code) ?? [],
    });
  }),

  // legacy goods_option_genre_ps.php — UPDATE tbl_goods_item.genre(콤마).
  http.put(api("/admin/goods/options/:productCode/genre"), async ({ params, request }) => {
    const code = String(params.productCode);
    const body = (await request.json()) as { genre: string[] };
    genreStore.set(code, body.genre ?? []);
    return HttpResponse.json({ success: true });
  }),

  // ===== 옵션상품 카테고리 설정 =====
  // legacy goods_option_category_register.php — 로드(product + 태그 그룹 + 현재 category).
  http.get(api("/admin/goods/options/:productCode/category"), ({ params }) => {
    const code = String(params.productCode);
    const row = optionStore.get(code);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return HttpResponse.json({
      product: {
        product_name: row.product_name,
        product_name_en: row.product_name_en,
      },
      groups: CATEGORY_GROUPS,
      selected: categoryStore.get(code) ?? [],
    });
  }),

  // legacy goods_option_category_ps.php — UPDATE tbl_goods_item.category(콤마).
  http.put(api("/admin/goods/options/:productCode/category"), async ({ params, request }) => {
    const code = String(params.productCode);
    const body = (await request.json()) as { category: string[] };
    categoryStore.set(code, body.category ?? []);
    return HttpResponse.json({ success: true });
  }),

  // ===== 옵션상품 태그 설정 =====
  // legacy goods_option_tag_register.php — 로드(product + GT*/T* 태그 그룹 + 현재 tag).
  http.get(api("/admin/goods/options/:productCode/tag"), ({ params }) => {
    const code = String(params.productCode);
    const row = optionStore.get(code);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return HttpResponse.json({
      product: {
        product_name: row.product_name,
        product_name_en: row.product_name_en,
      },
      groups: TAG_SETTING_GROUPS,
      selected: tagStore.get(code) ?? [],
    });
  }),

  // legacy goods_option_tag_ps.php — UPDATE tbl_goods_item.tag + tbl_goods_item_tags upsert.
  http.put(api("/admin/goods/options/:productCode/tag"), async ({ params, request }) => {
    const code = String(params.productCode);
    const body = (await request.json()) as { tag: string[] };
    tagStore.set(code, body.tag ?? []);
    return HttpResponse.json({ success: true });
  }),

  // ===== 옵션상품 이미지 설정(goods_option_image_register) — header 슬롯 =====
  // legacy 로드 — tbl_goods_item + steam JSON header_image + remoteFileExist(로컬/디스크엔).
  http.get(api("/admin/goods/options/:productCode/images"), ({ params }) => {
    const code = String(params.productCode);
    const row = optionStore.get(code);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    const state = optionImageStore.get(code) ?? { web_uploaded: false, disk_exists: false };
    return HttpResponse.json({
      product_code: row.product_code,
      product_name: row.product_name,
      product_name_en: row.product_name_en,
      steam_appid: row.steam_appid,
      game_type: row.game_type,
      display_type: row.display_type,
      packageid: row.packageid,
      header_image: "", // steam JSON 미보유 → 빈 값(백엔드 파싱)
      steam_url: steamHeaderUrl(row.steam_appid),
      web_uploaded: state.web_uploaded,
      disk_exists: state.disk_exists,
    });
  }),

  // legacy steam_image_download2.php — 스팀 header 다운로드(→ 서버 디스크 저장).
  http.post(api("/admin/goods/options/:productCode/images/download"), ({ params }) => {
    const code = String(params.productCode);
    const state = optionImageStore.get(code) ?? { web_uploaded: false, disk_exists: false };
    optionImageStore.set(code, { ...state, web_uploaded: true });
    return HttpResponse.json({ success: true });
  }),

  // legacy goods_option_ps.php header_upload — header 직접 업로드(→ 서버 디스크 저장).
  http.post(api("/admin/goods/options/:productCode/images/upload"), ({ params }) => {
    const code = String(params.productCode);
    const state = optionImageStore.get(code) ?? { web_uploaded: false, disk_exists: false };
    optionImageStore.set(code, { ...state, web_uploaded: true });
    return HttpResponse.json({ success: true });
  }),

  // ===== 옵션상품 상세설명 설정(운영 병합 페이지) =====
  // legacy 로드 — tbl_goods_item + description_v2 + 필드(requirements/legal/short/region).
  http.get(api("/admin/goods/options/:productCode/description-v2"), ({ params }) => {
    const code = String(params.productCode);
    const row = optionStore.get(code);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    // legacy: description_v2 있으면 raw, 없으면 백엔드 parsedown(about_the_game) fallback.
    const description_v2 =
      descriptionV2Store.get(code) ?? `<p>${row.product_name} 상세설명(steam fallback).</p>`;
    const fields = descriptionFieldsStore.get(code) ?? emptyDescFields();
    return HttpResponse.json({
      product_code: row.product_code,
      product_name: row.product_name,
      platform_name: NAME_PLATFORM[row.product_platform] ?? row.product_platform,
      game_type: row.game_type,
      display_type: row.display_type,
      goods_sku: row.goods_sku,
      steam_appid: row.steam_appid,
      description_v2,
      ...fields,
    });
  }),

  // legacy goods_option_ps.php description_save2 — description_v2(SE2) 저장(alert-only).
  http.put(api("/admin/goods/options/:productCode/description-v2"), async ({ params, request }) => {
    const code = String(params.productCode);
    const body = (await request.json()) as { value: string };
    descriptionV2Store.set(code, body.value ?? "");
    return HttpResponse.json({ success: true });
  }),

  // legacy requirements_save/legal_text_save/short_description_save/region_msg_save — 필드별 저장(alert-only).
  http.put(
    api("/admin/goods/options/:productCode/description-field"),
    async ({ params, request }) => {
      const code = String(params.productCode);
      const body = (await request.json()) as { field: keyof OptionDescFields; value: string };
      const fields = descriptionFieldsStore.get(code) ?? emptyDescFields();
      descriptionFieldsStore.set(code, { ...fields, [body.field]: body.value ?? "" });
      return HttpResponse.json({ success: true });
    },
  ),

  // legacy get_steam_game_info.php steam_sync_desc — SE2 상세설명 steam 동기화(→ reload).
  http.post(api("/admin/goods/options/:productCode/description-v2/sync"), () =>
    HttpResponse.json({ success: true }),
  ),

  // legacy get_steam_game_info.php steam_sync_system — 시스템요구사항 steam 동기화(→ reload).
  http.post(api("/admin/goods/options/:productCode/description/sync"), () =>
    HttpResponse.json({ success: true }),
  ),

  // ===== 옵션상품 판매 설정(goods_option_sales_register) =====
  // legacy 로드 — tbl_goods_item + publisher 목록 + 배송아이템 목록.
  http.get(api("/admin/goods/options/:productCode/sales"), ({ params }) => {
    const code = String(params.productCode);
    const row = optionStore.get(code);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    const state = salesStore.get(code) ?? defaultSalesState();
    const deliveries = (deliveriesStore.get(code) ?? []).map((d) => ({
      order_system: d.order_system,
      order_system_name: NAME_ORDER_SYSTEM[d.order_system] ?? d.order_system,
      item_platform: d.item_platform,
      item_type: d.item_type,
      item_name: d.item_name,
      item_id: d.item_id,
      item_publisher: d.item_publisher ?? "",
    }));
    return HttpResponse.json({
      product: {
        product_name: row.product_name,
        platform_name: NAME_PLATFORM[row.product_platform] ?? row.product_platform,
        game_type: row.game_type,
        display_type: row.display_type,
      },
      sales: state.sales,
      price: state.price,
      supplier: state.supplier,
      publishers: PUBLISHERS_SALES,
      deliveries,
    });
  }),

  // legacy sales_config — 판매설정 저장(status 0→is_view Y, 3→N 서버 오버라이드).
  http.put(api("/admin/goods/options/:productCode/sales"), async ({ params, request }) => {
    const code = String(params.productCode);
    const body = (await request.json()) as SalesSettings;
    const state = salesStore.get(code) ?? defaultSalesState();
    const is_view = body.status === "0" ? "Y" : body.status === "3" ? "N" : body.is_view;
    salesStore.set(code, { ...state, sales: { ...body, is_view } });
    return HttpResponse.json({ success: true });
  }),

  // legacy price_save — 가격설정 저장(discount 서버 재계산).
  http.put(api("/admin/goods/options/:productCode/price"), async ({ params, request }) => {
    const code = String(params.productCode);
    const body = (await request.json()) as PriceSettings;
    const state = salesStore.get(code) ?? defaultSalesState();
    const discount = computeDiscount(body.consumer_price, body.price);
    salesStore.set(code, {
      ...state,
      price: { consumer_price: body.consumer_price, price: body.price, discount },
    });
    return HttpResponse.json({ success: true });
  }),

  // legacy supplier_save — 공급처설정 저장.
  http.put(api("/admin/goods/options/:productCode/supplier"), async ({ params, request }) => {
    const code = String(params.productCode);
    const body = (await request.json()) as SupplierSettings;
    const state = salesStore.get(code) ?? defaultSalesState();
    salesStore.set(code, { ...state, supplier: body });
    return HttpResponse.json({ success: true });
  }),

  // legacy {system}_search — 연동시스템 배송아이템 검색(후보 1건 반환).
  http.post(api("/admin/goods/options/:productCode/deliveries/search"), async ({ request }) => {
    const body = (await request.json()) as {
      system: string;
      order_system: string;
      query: string;
      pn_mode?: string;
    };
    if (!body.query) {
      return HttpResponse.json({ items: [] });
    }
    const platform =
      body.system === "pointnexus" ? "PointNexus" : body.system === "vaultn" ? "Vaultn" : "Steam";
    const item = {
      item_platform: platform,
      item_type: body.system === "genba" ? "" : "기본게임",
      item_id: body.query,
      item_name: `${body.system} 상품 ${body.query}`,
      item_publisher: "H2 Interactive",
      providers_channel: body.system === "ztorm" ? "CH-1" : "",
    };
    return HttpResponse.json({ items: [item] });
  }),

  // legacy {system}_add — setGoodsOptionDeliveryItem(배송아이템 추가).
  http.post(api("/admin/goods/options/:productCode/deliveries"), async ({ params, request }) => {
    const code = String(params.productCode);
    const body = (await request.json()) as {
      order_system: string;
      item_platform: string;
      item_type: string;
      item_id: string;
      item_name: string;
      item_publisher: string;
    };
    const rows = deliveriesStore.get(code) ?? [];
    rows.push({
      order_system: body.order_system,
      item_platform: body.item_platform,
      item_id: body.item_id,
      item_type: body.item_type,
      item_name: body.item_name,
      flag: "Y",
      item_publisher: body.item_publisher,
    });
    deliveriesStore.set(code, rows);
    return HttpResponse.json({ success: true });
  }),

  // ===== 옵션상품 타임딜 설정(timedeal 블록) =====
  // legacy 로드 — tbl_goods_item(현재 설정) + getTimedealHistory(이력).
  http.get(api("/admin/goods/options/:productCode/timedeal"), ({ params }) => {
    const code = String(params.productCode);
    const row = optionStore.get(code);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    const config = timedealConfigStore.get(code) ?? {
      timedeal_start_date: "",
      timedeal_end_date: "",
      product_srp: "0",
      product_ppr: "0",
      timedeal_price: "0",
      timedeal_stock: "0",
      timedeal_confirm: "",
    };
    return HttpResponse.json({ config, history: timedealHistoryStore.get(code) ?? [] });
  }),

  // legacy timedeal_config — tbl_timedeal INSERT(이력 누적). timedeal_status는 timedeal_confirm 미매핑(버그).
  http.post(api("/admin/goods/options/:productCode/timedeal"), async ({ params, request }) => {
    const code = String(params.productCode);
    const body = (await request.json()) as {
      timedeal_start_date: string;
      timedeal_end_date: string;
      product_srp: string;
      product_ppr: string;
      timedeal_price: string;
      timedeal_stock: string;
      timedeal_confirm: string;
    };
    const num = (v: string) => Number.parseInt(v || "0", 10);
    const history = timedealHistoryStore.get(code) ?? [];
    history.push({
      timedeal_start: body.timedeal_start_date,
      timedeal_end: body.timedeal_end_date,
      timedeal_stock: num(body.timedeal_stock),
      timedeal_srp: num(body.product_srp),
      timedeal_ppr: num(body.product_ppr),
      timedeal_price: num(body.timedeal_price),
      timedeal_order: 0,
      timedeal_status: "", // legacy 버그: timedeal_confirm 미반영
    });
    timedealHistoryStore.set(code, history);
    return HttpResponse.json({ success: true });
  }),

  // ===== 옵션상품 구성정보 설정(package col-8) =====
  // legacy 로드 — tbl_goods_item + bonus_description + tbl_goods_option_bundle.
  http.get(api("/admin/goods/options/:productCode/package"), ({ params }) => {
    const code = String(params.productCode);
    const row = optionStore.get(code);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    const state = packageStore.get(code) ?? defaultPackageState();
    return HttpResponse.json({
      product: {
        product_name: row.product_name,
        platform_name: NAME_PLATFORM[row.product_platform] ?? row.product_platform,
        game_type: row.game_type,
        display_type: row.display_type,
        goods_sku: row.goods_sku,
      },
      is_package_view: state.is_package_view,
      is_bonus: state.is_bonus,
      units: state.units,
      bonus_description: state.bonus_description,
      // 백엔드 정제 프리뷰(mock은 원본 그대로).
      bonus_description_preview_html: state.bonus_description,
    });
  }),

  // legacy package_view_config — is_package_view 저장.
  http.put(api("/admin/goods/options/:productCode/package-view"), async ({ params, request }) => {
    const code = String(params.productCode);
    const body = (await request.json()) as { is_package_view: string };
    const state = packageStore.get(code) ?? defaultPackageState();
    packageStore.set(code, { ...state, is_package_view: body.is_package_view });
    return HttpResponse.json({ success: true });
  }),

  // legacy goods_option_unit_add — 구성상세 추가.
  http.post(api("/admin/goods/options/:productCode/package-units"), async ({ params, request }) => {
    const code = String(params.productCode);
    const body = (await request.json()) as {
      unit_type: string;
      unit_code: string;
      unit_name: string;
    };
    const state = packageStore.get(code) ?? defaultPackageState();
    unitIdxSeq += 1;
    packageStore.set(code, {
      ...state,
      units: [
        ...state.units,
        {
          idx: unitIdxSeq,
          unit_code: body.unit_code ?? "",
          unit_type: body.unit_type ?? "",
          unit_name: body.unit_name ?? "",
        },
      ],
    });
    return HttpResponse.json({ success: true });
  }),

  // legacy goods_option_unit_delete — 구성상세 삭제(idx).
  http.delete(api("/admin/goods/options/:productCode/package-units/:idx"), ({ params }) => {
    const code = String(params.productCode);
    const idx = Number(params.idx);
    const state = packageStore.get(code) ?? defaultPackageState();
    packageStore.set(code, { ...state, units: state.units.filter((u) => u.idx !== idx) });
    return HttpResponse.json({ success: true });
  }),

  // legacy goods_option_search — 옵션상품 검색(구성추가용).
  http.post(api("/admin/goods/options/:productCode/package-units/search"), async ({ request }) => {
    const body = (await request.json()) as { search_option_code: string };
    const found = optionStore.get(body.search_option_code);
    if (!found) {
      return HttpResponse.json({ item: null });
    }
    return HttpResponse.json({
      item: {
        unit_code: found.product_code,
        unit_type: UNIT_TYPE_BY_GAME[found.game_type] ?? "",
        unit_name: found.product_name + platformSuffix(found.product_platform),
        game_type: found.game_type,
      },
    });
  }),

  // legacy bonus_description_save — 특전설명(SE2) 저장.
  http.put(
    api("/admin/goods/options/:productCode/bonus-description"),
    async ({ params, request }) => {
      const code = String(params.productCode);
      const body = (await request.json()) as { value: string };
      const state = packageStore.get(code) ?? defaultPackageState();
      packageStore.set(code, { ...state, bonus_description: body.value ?? "" });
      return HttpResponse.json({ success: true });
    },
  ),

  // legacy package col-4 — Steam 구성정보 참고(steam 조회 결과, read-only).
  http.get(api("/admin/goods/options/:productCode/steam-package"), ({ params }) => {
    const code = String(params.productCode);
    const row = optionStore.get(code);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    const state = steamPackageStore.get(code) ?? {
      package_type: "",
      packageid: "",
      bundleid: "",
      items: [],
    };
    const total = state.items.reduce((sum, i) => sum + i.app_price, 0);
    return HttpResponse.json({ ...state, total });
  }),

  // ===== 옵션상품 포인트 설정(goods_option_repay_register) =====
  // legacy 로드 — tbl_goods_item.is_repay + getAddRepayHistory.
  http.get(api("/admin/goods/options/:productCode/repay"), ({ params }) => {
    const code = String(params.productCode);
    const row = optionStore.get(code);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return HttpResponse.json({
      product: { product_name: row.product_name, product_name_en: row.product_name_en },
      is_repay: repayStore.get(code) ?? "N",
      add_repay_history: addRepayHistoryStore.get(code) ?? [],
    });
  }),

  // legacy repay_config — is_repay UPDATE.
  http.put(api("/admin/goods/options/:productCode/repay"), async ({ params, request }) => {
    const code = String(params.productCode);
    const body = (await request.json()) as { is_repay: string };
    repayStore.set(code, body.is_repay);
    return HttpResponse.json({ success: true });
  }),

  // legacy add_repay_config — tbl_add_repay INSERT(이력 누적).
  http.post(api("/admin/goods/options/:productCode/repay/add"), async ({ params, request }) => {
    const code = String(params.productCode);
    const body = (await request.json()) as {
      add_repay: string;
      repay_type: string;
      start_dt: string;
      end_dt: string;
    };
    const history = addRepayHistoryStore.get(code) ?? [];
    history.unshift({
      repay_point: Number.parseInt(body.add_repay || "0", 10),
      repay_type: body.repay_type,
      start_dt: body.start_dt,
      end_dt: body.end_dt,
      repay_flag: "지급중",
    });
    addRepayHistoryStore.set(code, history);
    return HttpResponse.json({ success: true });
  }),

  // ===== 옵션상품 스크린샷 설정(goods_option_screenshot_register) =====
  // legacy 로드 — tbl_goods_item + getProductScreenshotList + steam 후보.
  http.get(api("/admin/goods/options/:productCode/screenshots"), ({ params }) => {
    const code = String(params.productCode);
    const row = optionStore.get(code);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    const list = [...(screenshotStore.get(code) ?? [])].sort((a, b) => a.sort - b.sort);
    return HttpResponse.json({
      product: {
        product_name: row.product_name,
        product_name_en: row.product_name_en,
        game_type: row.game_type,
        platform_name: NAME_PLATFORM[row.product_platform] ?? row.product_platform,
        steam_appid: row.steam_appid,
      },
      screenshots: list,
      steam_candidates: steamScreenshotCandidates(row.steam_appid),
    });
  }),

  // legacy steam_screenshot_download.php(screenshot_delete) — 삭제(legacy 미갱신).
  http.delete(api("/admin/goods/options/:productCode/screenshots/:screenshotNum"), ({ params }) => {
    const code = String(params.productCode);
    const num = String(params.screenshotNum);
    const list = screenshotStore.get(code) ?? [];
    screenshotStore.set(
      code,
      list.filter((s) => s.screenshot_num !== num),
    );
    return HttpResponse.json({ success: true });
  }),

  // legacy screenshot_sort_up/down — sort ∓1.
  http.post(
    api("/admin/goods/options/:productCode/screenshots/sort"),
    async ({ params, request }) => {
      const code = String(params.productCode);
      const body = (await request.json()) as { idx: number; dir: "up" | "down" };
      const list = screenshotStore.get(code) ?? [];
      const target = list.find((s) => s.idx === body.idx);
      if (target) {
        target.sort += body.dir === "up" ? -1 : 1;
      }
      return HttpResponse.json({ success: true });
    },
  ),

  // legacy steam_screenshot_download.php — steam 다운로드(→ 파일 저장 + 등록).
  http.post(
    api("/admin/goods/options/:productCode/screenshots/download"),
    async ({ params, request }) => {
      const code = String(params.productCode);
      const body = (await request.json()) as { num: number };
      const list = screenshotStore.get(code) ?? [];
      screenshotIdxSeq += 1;
      list.push({
        idx: screenshotIdxSeq,
        screenshot_num: String(body.num),
        url: `/upload/screenshot/${code}/${body.num}.jpg`,
        thumbnail: `upload/screenshot/${code}/thumbnail/${body.num}.jpg`,
        sort: list.length + 1,
        disk_exists: false,
      });
      screenshotStore.set(code, list);
      return HttpResponse.json({ success: true });
    },
  ),

  // legacy goods_option_ps.php screenshot_upload — 직접 업로드.
  http.post(api("/admin/goods/options/:productCode/screenshots/upload"), ({ params }) => {
    const code = String(params.productCode);
    const list = screenshotStore.get(code) ?? [];
    screenshotIdxSeq += 1;
    const num = list.length + 1;
    list.push({
      idx: screenshotIdxSeq,
      screenshot_num: String(num),
      url: `/upload/screenshot/${code}/${num}.jpg`,
      thumbnail: `upload/screenshot/${code}/thumbnail/${num}.jpg`,
      sort: num,
      disk_exists: false,
    });
    screenshotStore.set(code, list);
    return HttpResponse.json({ success: true });
  }),
];
