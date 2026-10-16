import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy steam/steam_apps_list.php — 스팀 Apps 검색(steam_game + 집계). 가격은 cents.
const STEAM_APP_LIST = [
  {
    steam_appid: "1086940",
    app_type: "game",
    name: "Baldur's Gate 3",
    coming_soon: "",
    coming_soon_date: "",
    release_date: "2026-01-30",
    consumer_price: 6600000,
    price: 5940000,
    title_id: "T0002100",
    developer: "Larian Studios",
    publisher: "Larian Studios",
    drm_notice: "",
    ext_user_account_notice: "",
    batch_date: "2026-07-20 03:00:00",
    supported_languages: "English, 한국어*, Japanese, French",
    genre: "RPG,어드벤처,전략",
    category: "싱글 플레이어,협동,클라우드 저장",
    basic_game_appid: "",
    basic_game_name: "",
    tags_ko: [
      { code: "G0201", name: "RPG" },
      { code: "T0003", name: "판타지" },
    ],
    reviews: [
      {
        language: "all",
        purchase_type: "all",
        review_score: 9,
        review_score_desc: "압도적으로 긍정적",
        total_positive: 480000,
        total_negative: 12000,
        total_reviews: 492000,
      },
      {
        language: "koreana",
        purchase_type: "steam",
        review_score: 8,
        review_score_desc: "매우 긍정적",
        total_positive: 9500,
        total_negative: 500,
        total_reviews: 10000,
      },
    ],
    packages: [
      {
        packageid: "P100",
        package_name: "발더스 게이트 3 - 스탠다드",
        package_coming_soon: "0",
        package_release: "2026-01-30",
        price_initial: 6600000,
        price_final: 5940000,
        discount_percent: 10,
        price_individual: 6600000,
      },
    ],
    dlcs: [
      {
        dlc_appid: "1086941",
        name: "디지털 디럭스 업그레이드",
        app_type: "dlc",
        coming_soon: "0",
        coming_soon_date: "",
        release_date: "2026-02-15",
        is_free: "0",
        consumer_price: 1500000,
        price: 1350000,
      },
      {
        dlc_appid: "1086942",
        name: "무료 보너스 팩",
        app_type: "dlc",
        coming_soon: "0",
        coming_soon_date: "",
        release_date: "2026-03-01",
        is_free: "1",
        consumer_price: 0,
        price: 0,
      },
    ],
  },
  {
    steam_appid: "1086941",
    app_type: "dlc",
    name: "디지털 디럭스 업그레이드",
    coming_soon: "",
    coming_soon_date: "",
    release_date: "2026-02-15",
    consumer_price: 1500000,
    price: 1350000,
    title_id: "",
    developer: "Larian Studios",
    publisher: "Larian Studios",
    drm_notice: "",
    ext_user_account_notice: "",
    batch_date: "2026-07-20 03:00:00",
    supported_languages: "English, 한국어",
    genre: "RPG",
    category: "다운로드 가능한 콘텐츠",
    basic_game_appid: "1086940",
    basic_game_name: "Baldur's Gate 3",
    tags_ko: [{ code: "G0201", name: "RPG" }],
    reviews: [],
    packages: [],
    dlcs: [],
  },
  {
    steam_appid: "1245620",
    app_type: "game",
    name: "ELDEN RING",
    coming_soon: "1",
    coming_soon_date: "2026-09-01",
    release_date: "",
    consumer_price: 5900000,
    price: 5900000,
    title_id: "T0002288",
    developer: "FromSoftware",
    publisher: "Bandai Namco",
    drm_notice: "제 3자 DRM: EasyAntiCheat",
    ext_user_account_notice: "Bandai Namco 계정 필요",
    batch_date: "2026-07-19 03:00:00",
    supported_languages: "English, 한국어",
    genre: "액션,RPG",
    category: "싱글 플레이어,멀티플레이어",
    basic_game_appid: "",
    basic_game_name: "",
    tags_ko: [{ code: "G0101", name: "핵앤슬래시" }],
    reviews: [],
    packages: [],
    dlcs: [],
  },
];
const PER_PAGE_STEAM = 10;

// legacy steam/steam_game_list.php — 스팀 Game 현황(getSteamGame, 집계요약).
const STEAM_GAME_LIST = [
  {
    steam_appid: "1245620",
    app_type: "game",
    name: "ELDEN RING",
    supported_languages: "English, 한국어",
    publisher: "FromSoftware",
    release_date: "",
    coming_soon_date: "2026-09-01",
    package_count: 2,
    dlc_count: 1,
    consumer_price: 5900000,
    price: 5900000,
    review_score: "9",
    review_score_desc: "압도적으로 긍정적",
    title_id: "T0002288",
    batch_date: "2026-07-19 03:00:00",
  },
  {
    steam_appid: "1086940",
    app_type: "game",
    name: "Baldur's Gate 3",
    supported_languages: "English, 한국어*, Japanese",
    publisher: "Larian Studios",
    release_date: "2026-01-30",
    coming_soon_date: "",
    package_count: 1,
    dlc_count: 2,
    consumer_price: 6600000,
    price: 5940000,
    review_score: "9",
    review_score_desc: "압도적으로 긍정적",
    title_id: "T0002100",
    batch_date: "2026-07-20 03:00:00",
  },
  {
    steam_appid: "1966720",
    app_type: "game",
    name: "Sintopia",
    supported_languages: "English",
    publisher: "Neowiz",
    release_date: "2026-04-17",
    coming_soon_date: "",
    package_count: 0,
    dlc_count: 0,
    consumer_price: 2500000,
    price: 2250000,
    review_score: "",
    review_score_desc: "",
    title_id: "T0002398",
    batch_date: "2026-07-18 03:00:00",
  },
];
const PER_PAGE_GAME = 50;

// legacy steam/steam_dlc_list.php — 스팀 DLC 현황(dlc/music, is_free≠Y).
const STEAM_DLC_LIST = [
  {
    steam_appid: "1086941",
    app_type: "dlc",
    name: "디지털 디럭스 업그레이드",
    supported_languages: "English, 한국어",
    basic_game_appid: "1086940",
    basic_game_name: "Baldur's Gate 3",
    coming_soon: "0",
    coming_soon_date: "",
    release_date: "2026-02-15",
    package_count: 1,
    is_free: "0",
    consumer_price: 1500000,
    price: 1350000,
    product_code: "DG-D-3001",
    batch_date: "2026-07-20 03:00:00",
  },
  {
    steam_appid: "1245621",
    app_type: "dlc",
    name: "ELDEN RING - 황금 나무의 그림자",
    supported_languages: "English, 한국어",
    basic_game_appid: "1245620",
    basic_game_name: "ELDEN RING",
    coming_soon: "1",
    coming_soon_date: "2026-09-15",
    release_date: "",
    package_count: 0,
    is_free: "0",
    consumer_price: 4000000,
    price: 4000000,
    product_code: "",
    batch_date: "2026-07-19 03:00:00",
  },
  {
    steam_appid: "1086943",
    app_type: "music",
    name: "발더스 게이트 3 OST",
    supported_languages: "English",
    basic_game_appid: "1086940",
    basic_game_name: "Baldur's Gate 3",
    coming_soon: "0",
    coming_soon_date: "",
    release_date: "2026-02-20",
    package_count: 1,
    is_free: "0",
    consumer_price: 1200000,
    price: 1080000,
    product_code: "DG-M-8001",
    batch_date: "2026-07-20 03:00:00",
  },
];
const PER_PAGE_DLC = 50;

// legacy steam/steam_package_list.php — 스팀 Package 현황(getSteamAppPackage). batch_date=unix초.
const STEAM_PACKAGE_LIST = [
  {
    packageid: "P100",
    appid: "1086940",
    package_name: "발더스 게이트 3 - 스탠다드",
    package_release: "2026-01-30",
    package_coming_soon: "0",
    cc: 1,
    price_initial: 6600000,
    price_final: 5940000,
    display_type: "basic",
    batch_date: 1784764800,
  },
  {
    packageid: "P101",
    appid: "1086941",
    package_name: "발더스 게이트 3 - 디지털 디럭스",
    package_release: "2026-02-15",
    package_coming_soon: "0",
    cc: 2,
    price_initial: 8100000,
    price_final: 7290000,
    display_type: "edition",
    batch_date: 1784764800,
  },
  {
    packageid: "P200",
    appid: "1245620",
    package_name: "ELDEN RING - 디럭스 에디션",
    package_release: "2026-09-01",
    package_coming_soon: "1",
    cc: 2,
    price_initial: 7900000,
    price_final: 7900000,
    display_type: "edition",
    batch_date: 0,
  },
];
const PER_PAGE_PACKAGE = 50;

// legacy steam/steam_review_list.php — 스팀 평가 현황(getSteamReviewList, app_type=game).
const STEAM_REVIEW_LIST = [
  {
    steam_appid: "1086940",
    app_type: "game",
    name: "Baldur's Gate 3",
    genre: "RPG,어드벤처,전략",
    publisher: "Larian Studios",
    release_date: "2026-01-30",
    review_score: "9",
    review_score_desc: "압도적으로 긍정적",
    total_positive: 480000,
    total_negative: 12000,
    total_reviews: 492000,
    batch_date: "2026-07-20 03:00:00",
  },
  {
    steam_appid: "1245620",
    app_type: "game",
    name: "ELDEN RING",
    genre: "액션,RPG",
    publisher: "Bandai Namco",
    release_date: "2025-12-12",
    review_score: "9",
    review_score_desc: "압도적으로 긍정적",
    total_positive: 720000,
    total_negative: 45000,
    total_reviews: 765000,
    batch_date: "2026-07-19 03:00:00",
  },
  {
    steam_appid: "1966720",
    app_type: "game",
    name: "Sintopia",
    genre: "시뮬레이션",
    publisher: "Neowiz",
    release_date: "2026-04-17",
    review_score: "6",
    review_score_desc: "복합적",
    total_positive: 3000,
    total_negative: 2000,
    total_reviews: 5000,
    batch_date: "2026-07-18 03:00:00",
  },
];
const PER_PAGE_REVIEW = 50;

// legacy steam/steam_apps_list_all.php — 스팀 Apps list(steam_app_list 원본).
const STEAM_APP_ALL_LIST = [
  {
    appid: "1086940",
    name: "Baldur's Gate 3",
    app_type: "game",
    coming_soon: "",
    coming_soon_date: "",
    release_date: "2026-01-30",
    is_free: "0",
    consumer_price: 6600000,
    price: 5940000,
    developer: "Larian Studios",
    publisher: "Larian Studios",
    recommendations: 492000,
    supported_languages: "English, 한국어*, Japanese<strong>*음성이 지원되는 언어</strong>",
    batch_date: "2026-07-20 03:00:00",
    last_modified: 1784764800,
    basic_game_appid: "",
    basic_game_name: "",
    packages: [
      {
        packageid: "P100",
        package_name: "발더스 게이트 3 - 스탠다드",
        package_release: "2026-01-30",
        package_coming_soon: "0",
        price_initial: 6600000,
      },
      {
        packageid: "P199",
        package_name: "",
        package_release: "",
        package_coming_soon: "",
        price_initial: 0,
      },
    ],
    dlcs: [
      { dlc_appid: "1086941", name: "디지털 디럭스 업그레이드" },
      { dlc_appid: "1086999", name: "" },
    ],
  },
  {
    appid: "1086941",
    name: "디지털 디럭스 업그레이드",
    app_type: "dlc",
    coming_soon: "",
    coming_soon_date: "",
    release_date: "2026-02-15",
    is_free: "0",
    consumer_price: 1500000,
    price: 1350000,
    developer: "Larian Studios",
    publisher: "Larian Studios",
    recommendations: 0,
    supported_languages: "English, 한국어",
    batch_date: "2026-07-20 03:00:00",
    last_modified: 1784764800,
    basic_game_appid: "1086940",
    basic_game_name: "Baldur's Gate 3",
    packages: [],
    dlcs: [],
  },
  {
    appid: "1245620",
    name: "ELDEN RING",
    app_type: "game",
    coming_soon: "1",
    coming_soon_date: "2026-09-01",
    release_date: "",
    is_free: "0",
    consumer_price: 5900000,
    price: 5900000,
    developer: "FromSoftware",
    publisher: "Bandai Namco",
    recommendations: 765000,
    supported_languages: "English, 한국어",
    batch_date: "2026-07-19 03:00:00",
    last_modified: 1784678400,
    basic_game_appid: "",
    basic_game_name: "",
    packages: [
      {
        packageid: "P200",
        package_name: "ELDEN RING - 디럭스",
        package_release: "2026-09-01",
        package_coming_soon: "1",
        price_initial: 7900000,
      },
    ],
    dlcs: [{ dlc_appid: "1245621", name: "황금 나무의 그림자" }],
  },
];
const STEAM_PUBLISHERS = [
  { publisher: "Larian Studios", cc: 12 },
  { publisher: "Bandai Namco", cc: 45 },
  { publisher: "SEGA", cc: 88 },
];
const PER_PAGE_APP_ALL = 20;

// legacy steam/steam_apps_comingsoon.php — 출시예정작(coming_soon='1' + 큐레이션 퍼블리셔). SteamAppAllItem 형태.
const STEAM_COMINGSOON_LIST = [
  {
    appid: "2358720",
    name: "STRANGER THAN HEAVEN",
    app_type: "game",
    coming_soon: "1",
    coming_soon_date: "2027-01-15",
    release_date: "",
    is_free: "0",
    consumer_price: 6900000,
    price: 6900000,
    developer: "Ryu Ga Gotoku Studio",
    publisher: "SEGA",
    recommendations: 0,
    supported_languages: "English, 한국어, Japanese",
    batch_date: "2026-07-20 03:00:00",
    last_modified: 1784764800,
    basic_game_appid: "",
    basic_game_name: "",
    packages: [
      {
        packageid: "P900",
        package_name: "STRANGER THAN HEAVEN - 스탠다드",
        package_release: "2027-01-15",
        package_coming_soon: "1",
        price_initial: 6900000,
      },
      {
        packageid: "P901",
        package_name: "",
        package_release: "",
        package_coming_soon: "",
        price_initial: 0,
      },
    ],
    dlcs: [{ dlc_appid: "2358721", name: "디럭스 보너스" }],
  },
  {
    appid: "2842040",
    name: "Fogpiercer",
    app_type: "game",
    coming_soon: "1",
    coming_soon_date: "2026-07-18",
    release_date: "",
    is_free: "0",
    consumer_price: 2500000,
    price: 2500000,
    developer: "Fogpiercer Team",
    publisher: "Astrolabe Games",
    recommendations: 120,
    supported_languages: "English, 한국어*",
    batch_date: "2026-07-19 03:00:00",
    last_modified: 1784678400,
    basic_game_appid: "",
    basic_game_name: "",
    packages: [],
    dlcs: [],
  },
];
const PER_PAGE_COMINGSOON = 50;

// legacy steam/steam_apps_ranking.php — 스팀 Apps 평가수 순위(game + recommendations>0).
const STEAM_RANKING_LIST = [
  {
    appid: "1245620",
    name: "ELDEN RING",
    developer: "FromSoftware",
    publisher: "Bandai Namco",
    release_date: "2025-12-12",
    supported_languages: "English, 한국어",
    recommendations: 765000,
    diff_per_day: 3421.235,
    consumer_price: 5900000,
    price: 5900000,
    metacritic_score: 96,
    package_count: 2,
    dlc_count: 1,
    batch_date: "2026-07-19 03:00:00",
    genres: ["액션", "RPG"],
  },
  {
    appid: "1086940",
    name: "Baldur's Gate 3",
    developer: "Larian Studios",
    publisher: "Larian Studios",
    release_date: "2026-01-30",
    supported_languages: "English, 한국어*, Japanese",
    recommendations: 492000,
    diff_per_day: 2841.11,
    consumer_price: 6600000,
    price: 5940000,
    metacritic_score: 97,
    package_count: 1,
    dlc_count: 2,
    batch_date: "2026-07-20 03:00:00",
    genres: ["RPG", "어드벤처", "전략"],
  },
  {
    appid: "1966720",
    name: "Sintopia",
    developer: "Sintopia Studio",
    publisher: "Neowiz",
    release_date: "2026-04-17",
    supported_languages: "English",
    recommendations: 5000,
    diff_per_day: 52.083,
    consumer_price: 2500000,
    price: 2250000,
    metacritic_score: 74,
    package_count: 0,
    dlc_count: 0,
    batch_date: "2026-07-18 03:00:00",
    genres: ["시뮬레이션"],
  },
];
const STEAM_RANKING_PUBLISHERS = ["Bandai Namco", "Larian Studios", "Neowiz", "SEGA"];
const PER_PAGE_RANKING = 50;

export const steamHandlers = [
  // legacy steam/steam_apps_list.php — 스팀 Apps 검색.
  http.get(api("/admin/steam/apps"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = STEAM_APP_LIST;
    const appType = q("search_app_type");
    if (appType && appType !== "all") {
      rows = rows.filter((r) => r.app_type === appType);
    }
    const appid = q("search_appid");
    if (appid) {
      rows = rows.filter((r) => r.steam_appid === appid);
    }
    const name = q("search_name");
    if (name) {
      rows = rows.filter((r) => r.name.toLowerCase().includes(name.toLowerCase()));
    }
    if (q("drm_notice") === "Y") {
      rows = rows.filter((r) => r.drm_notice !== "");
    }
    if (q("ext_user_account_notice") === "Y") {
      rows = rows.filter((r) => r.ext_user_account_notice !== "");
    }

    // release_date desc (coming_soon은 release_date 빈값 → 뒤로)
    rows = [...rows].sort((a, b) => (a.release_date < b.release_date ? 1 : -1));

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_STEAM));
    const start = (page - 1) * PER_PAGE_STEAM;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_STEAM),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_STEAM,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy steam/steam_game_list.php — 스팀 Game 현황.
  http.get(api("/admin/steam/games"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = STEAM_GAME_LIST;
    const appid = q("search_appid");
    if (appid) {
      rows = rows.filter((r) => r.steam_appid === appid);
    }
    const name = q("search_name");
    if (name) {
      rows = rows.filter((r) => r.name.toLowerCase().includes(name.toLowerCase()));
    }
    // orderby coming_soon desc → coming_soon_date desc → release_date desc.
    // (mock: coming_soon_date 있으면 예정작 우선, 이후 release_date desc)
    rows = [...rows].sort((a, b) => {
      const ac = a.coming_soon_date ? 1 : 0;
      const bc = b.coming_soon_date ? 1 : 0;
      if (ac !== bc) return bc - ac;
      if (ac === 1) return a.coming_soon_date < b.coming_soon_date ? 1 : -1;
      return a.release_date < b.release_date ? 1 : -1;
    });

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_GAME));
    const start = (page - 1) * PER_PAGE_GAME;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_GAME),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_GAME,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy steam/steam_dlc_list.php — 스팀 DLC 현황.
  http.get(api("/admin/steam/dlcs"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = STEAM_DLC_LIST;
    const appid = q("search_appid");
    if (appid) {
      rows = rows.filter((r) => r.steam_appid === appid);
    }
    const name = q("search_name");
    if (name) {
      rows = rows.filter((r) => r.name.toLowerCase().includes(name.toLowerCase()));
    }
    if (q("is_free") === "1") {
      rows = rows.filter((r) => r.is_free === "1");
    }
    // coming_soon desc, coming_soon_date desc, release_date desc, name desc.
    rows = [...rows].sort((a, b) => {
      if (a.coming_soon !== b.coming_soon) return b.coming_soon < a.coming_soon ? -1 : 1;
      if (a.coming_soon_date !== b.coming_soon_date)
        return a.coming_soon_date < b.coming_soon_date ? 1 : -1;
      if (a.release_date !== b.release_date) return a.release_date < b.release_date ? 1 : -1;
      return a.name < b.name ? 1 : -1;
    });

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_DLC));
    const start = (page - 1) * PER_PAGE_DLC;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_DLC),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_DLC,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy steam/steam_package_list.php — 스팀 Package 현황.
  http.get(api("/admin/steam/packages"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = STEAM_PACKAGE_LIST;
    const packageid = q("search_packageid");
    if (packageid) {
      rows = rows.filter((r) => r.packageid === packageid);
    }
    const name = q("search_name");
    if (name) {
      rows = rows.filter((r) => r.package_name.toLowerCase().includes(name.toLowerCase()));
    }
    // package_coming_soon desc, package_release desc, package_name desc.
    rows = [...rows].sort((a, b) => {
      if (a.package_coming_soon !== b.package_coming_soon)
        return b.package_coming_soon < a.package_coming_soon ? -1 : 1;
      if (a.package_release !== b.package_release)
        return a.package_release < b.package_release ? 1 : -1;
      return a.package_name < b.package_name ? 1 : -1;
    });

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_PACKAGE));
    const start = (page - 1) * PER_PAGE_PACKAGE;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_PACKAGE),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_PACKAGE,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy steam/steam_review_list.php — 스팀 평가 현황.
  http.get(api("/admin/steam/reviews"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = STEAM_REVIEW_LIST;
    const appid = q("search_appid");
    if (appid) {
      rows = rows.filter((r) => r.steam_appid === appid);
    }
    const name = q("search_name");
    if (name) {
      rows = rows.filter((r) => r.name.toLowerCase().includes(name.toLowerCase()));
    }
    const year = q("search_year");
    if (year) {
      rows = rows.filter((r) => r.release_date.slice(0, 4) === year);
    }
    rows = [...rows].sort((a, b) => (a.release_date < b.release_date ? 1 : -1));

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_REVIEW));
    const start = (page - 1) * PER_PAGE_REVIEW;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_REVIEW),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_REVIEW,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy steam/steam_apps_list_all.php — 스팀 Apps list.
  http.get(api("/admin/steam/apps-all"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = STEAM_APP_ALL_LIST;
    const appid = q("search_appid");
    if (appid) {
      rows = rows.filter((r) => r.appid === appid);
    }
    const name = q("search_name");
    if (name) {
      rows = rows.filter((r) => r.name.toLowerCase().includes(name.toLowerCase())); // REGEXP 근사
    }
    if (q("is_free")) {
      rows = rows.filter((r) => r.is_free === q("is_free"));
    }
    const developer = q("search_developer");
    if (developer) {
      rows = rows.filter((r) => r.developer.toLowerCase().includes(developer.toLowerCase()));
    }
    const langs = q("supported_languages");
    if (langs) {
      rows = rows.filter((r) => r.supported_languages.toLowerCase().includes(langs.toLowerCase()));
    }
    const appType = q("search_app_type");
    if (appType && appType !== "all") {
      rows = rows.filter((r) => r.app_type === appType);
    }
    const publisher = q("search_publisher");
    if (publisher) {
      rows = rows.filter((r) => r.publisher.startsWith(publisher)); // LIKE 'val%'
    }
    const year = q("search_year");
    if (year) {
      rows = rows.filter((r) => r.release_date.slice(0, 4) === year);
    }
    // coming_soon desc, release_date desc, batch_date desc.
    rows = [...rows].sort((a, b) => {
      if (a.coming_soon !== b.coming_soon) return b.coming_soon < a.coming_soon ? -1 : 1;
      if (a.release_date !== b.release_date) return a.release_date < b.release_date ? 1 : -1;
      return a.batch_date < b.batch_date ? 1 : -1;
    });

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_APP_ALL));
    const start = (page - 1) * PER_PAGE_APP_ALL;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_APP_ALL),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_APP_ALL,
        total_results: totalResults,
        total_pages: totalPages,
      },
      publishers: STEAM_PUBLISHERS,
    });
  }),

  // legacy steam/steam_apps_comingsoon.php — 스팀 출시예정 App.
  http.get(api("/admin/steam/coming-soon"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    // base coming_soon='1' + 큐레이션 퍼블리셔(seed 전제).
    let rows = STEAM_COMINGSOON_LIST;
    const appid = q("search_appid");
    if (appid) {
      rows = rows.filter((r) => r.appid === appid);
    }
    const name = q("search_name");
    if (name) {
      rows = rows.filter((r) => r.name.toLowerCase().includes(name.toLowerCase()));
    }
    // sort asc, coming_soon_date asc, release_date asc, batch_date asc.
    rows = [...rows].sort((a, b) => {
      if (a.coming_soon_date !== b.coming_soon_date)
        return a.coming_soon_date < b.coming_soon_date ? -1 : 1;
      if (a.release_date !== b.release_date) return a.release_date < b.release_date ? -1 : 1;
      return a.batch_date < b.batch_date ? -1 : 1;
    });

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_COMINGSOON));
    const start = (page - 1) * PER_PAGE_COMINGSOON;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_COMINGSOON),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_COMINGSOON,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy steam/steam_apps_ranking.php — 스팀 Apps 평가수 순위.
  http.get(api("/admin/steam/ranking"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    // base game + recommendations>0(seed 전제).
    let rows = STEAM_RANKING_LIST;
    const year = q("search_year");
    if (year) {
      rows = rows.filter((r) => r.release_date.slice(0, 4) === year);
    }
    const publisher = q("search_publisher");
    if (publisher) {
      rows = rows.filter((r) => r.publisher.startsWith(publisher)); // LIKE 'val%'
    }
    // is_free=1이면 무료 제외(mock 데이터엔 무료 game 없음 — 필터 no-op).
    rows = [...rows].sort((a, b) => b.recommendations - a.recommendations);

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_RANKING));
    const start = (page - 1) * PER_PAGE_RANKING;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_RANKING),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_RANKING,
        total_results: totalResults,
        total_pages: totalPages,
      },
      publishers: STEAM_RANKING_PUBLISHERS,
    });
  }),

  // ===== 동기화 액션(#69~76 후속) — 모두 {success, message} =====
  http.post(api("/admin/steam/apps/sync"), async ({ request }) => {
    const b = (await request.json().catch(() => ({}))) as { appids?: string };
    return HttpResponse.json({
      success: true,
      message: `스팀 동기화 완료 (appid: ${b?.appids ?? ""})`,
    });
  }),
  http.post(api("/admin/steam/apps/sync-genre"), () =>
    HttpResponse.json({ success: true, message: "장르 동기화 완료" }),
  ),
  http.post(api("/admin/steam/apps/sync-category"), () =>
    HttpResponse.json({ success: true, message: "카테고리 동기화 완료" }),
  ),
  http.post(api("/admin/steam/apps/sync-tag"), () =>
    HttpResponse.json({ success: true, message: "TAG 동기화 완료" }),
  ),
  http.post(api("/admin/steam/reviews/sync"), () =>
    HttpResponse.json({ success: true, message: "평가 동기화 완료" }),
  ),
  http.post(api("/admin/steam/packages/sync"), () =>
    HttpResponse.json({ success: true, message: "패키지 동기화 완료" }),
  ),
  http.post(api("/admin/steam/apps/register"), async ({ request }) => {
    const b = (await request.json().catch(() => ({}))) as { appids?: string };
    return HttpResponse.json({
      success: true,
      message: `Steam App 등록 완료 (${b?.appids ?? ""})`,
    });
  }),
  http.delete(api("/admin/steam/apps/:appid"), ({ params }) =>
    HttpResponse.json({ success: true, message: `삭제 완료 (appid: ${String(params.appid)})` }),
  ),
  http.delete(api("/admin/steam/packages/:packageid"), ({ params }) =>
    HttpResponse.json({ success: true, message: `패키지 삭제 완료 (${String(params.packageid)})` }),
  ),
];
