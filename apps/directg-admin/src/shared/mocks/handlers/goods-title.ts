import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import { db } from "../db";
import type { GoodsTitleRow } from "../db";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

type GoodsTitleListItem = Omit<GoodsTitleRow, "title_code">;
type GoodsTitleListResponse = {
  items: GoodsTitleListItem[];
  pagination: {
    current_page: number;
    results_per_page: number;
    total_results: number;
    total_pages: number;
  };
};
type MutationResponse = { success: boolean };

const PER_PAGE = 10; // legacy getGoodsList results_per_page

// 응답에서 title_code 제외(계약: 목록 아이템은 title_code 미포함).
const toItem = (row: GoodsTitleRow): GoodsTitleListItem => {
  const item: Partial<GoodsTitleRow> = { ...row };
  delete item.title_code;
  return item as GoodsTitleListItem;
};

const contains = (haystack: string, needle: string) =>
  haystack.toLowerCase().includes(needle.toLowerCase());

// legacy title_view.php 동영상(tbl_goods_media). 삭제 가능하도록 title별 가변 저장.
type ViewMedia = { youtube_media_id: string; media_thumb: string; media_url: string };
const mediaStore = new Map<number, ViewMedia[]>();
const embed = (id: string): ViewMedia => ({
  youtube_media_id: id,
  media_thumb: "mqdefault.jpg",
  media_url: `https://www.youtube.com/embed/${id}`,
});
const getMedia = (titleId: number): ViewMedia[] => {
  if (!mediaStore.has(titleId)) {
    // 샘플 2개(젤다/발더스 등 실제 트레일러 id 형태).
    mediaStore.set(titleId, [embed("uHGShqcAHlQ"), embed("1rPxiXXxftE")]);
  }
  return mediaStore.get(titleId)!;
};

// legacy getYoutubeVideoSearch — title_name_en 기반 유튜브 검색 결과(백엔드 YouTube API).
// mock: 고정 샘플(publishedAt은 고정 unix seconds).
type VideoCandidateRow = {
  videoId: string;
  thumbnails: string;
  title: string;
  channelTitle: string;
  publishedAt: number;
  viewCount: number;
};
const SAMPLE_CANDIDATES: VideoCandidateRow[] = [
  {
    videoId: "P8k3fT2bAyU",
    thumbnails: "https://img.youtube.com/vi/P8k3fT2bAyU/mqdefault.jpg",
    title: "Official Launch Trailer",
    channelTitle: "Publisher Official",
    publishedAt: 1_717_200_000,
    viewCount: 1_284_000,
  },
  {
    videoId: "Qw9bT4rL2mE",
    thumbnails: "https://img.youtube.com/vi/Qw9bT4rL2mE/mqdefault.jpg",
    title: "Gameplay Overview",
    channelTitle: "GameChannel",
    publishedAt: 1_714_521_600,
    viewCount: 452_310,
  },
  {
    videoId: "Zx7mN0pQ8sD",
    thumbnails: "https://img.youtube.com/vi/Zx7mN0pQ8sD/mqdefault.jpg",
    title: "Story Teaser",
    channelTitle: "Publisher Official",
    publishedAt: 1_711_929_600,
    viewCount: 98_540,
  },
];

// legacy tbl_title_attribute_set — title별 상품정보 제공고시 + 거래조건(upsert 가변 저장).
type AttributeSetRow = {
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
const emptyAttribute = (): AttributeSetRow => ({
  model_name: "",
  product_name: "",
  kc_safety_infomartion: "",
  rated_voltage: "",
  power: "",
  manufacturing_date: "",
  manufacturer: "",
  manufacture_country: "",
  size: "",
  weight: "",
  main_requirements: "",
  warranty_service: "",
  as_information: "",
  terms_use: "",
  applicable_period: "",
  product_supply_method: "",
  cancel_right: "",
  delivery_method_info: "",
  as_information2: "",
});
const attributeStore = new Map<number, AttributeSetRow>();
const getAttribute = (titleId: number): AttributeSetRow => {
  if (!attributeStore.has(titleId)) {
    // 샘플: title 1001(디지털)에 제공고시 일부 채움.
    const seed = emptyAttribute();
    if (titleId === 1001) {
      seed.manufacturer = "닌텐도";
      seed.terms_use = "구매 후 다운로드";
      seed.applicable_period = "영구";
      seed.product_supply_method = "다운로드";
      seed.main_requirements = "Nintendo Switch";
      seed.cancel_right = "콘텐츠 미사용 시 7일 이내 청약철회";
      seed.as_information = "1600-0000";
      seed.delivery_method_info = "온라인 다운로드";
      seed.as_information2 = "1600-0000";
    }
    attributeStore.set(titleId, seed);
  }
  return attributeStore.get(titleId)!;
};

// legacy tbl_goods_screenshot — title별 스크린샷(가변 저장) + steam 다운로드 후보.
type ScreenshotRow = {
  idx: number;
  screenshot_num: number;
  url: string;
  thumbnail: string;
  sort: number;
};
type SteamCandidateRow = {
  id: number;
  path_full: string;
  path_thumbnail: string;
  downloaded: boolean;
};
const screenshotStore = new Map<number, ScreenshotRow[]>();
const steamCandidateStore = new Map<number, SteamCandidateRow[]>();
const shot = (titleId: number, num: number): ScreenshotRow => ({
  idx: titleId * 100 + num,
  screenshot_num: num,
  url: `/upload/title/${titleId}/screenshot/ss${num}.jpg`,
  thumbnail: `/upload/title/${titleId}/screenshot/thumbnail/ss${num}.jpg`,
  sort: num,
});
const getScreenshots = (titleId: number): ScreenshotRow[] => {
  if (!screenshotStore.has(titleId)) {
    screenshotStore.set(titleId, [shot(titleId, 1), shot(titleId, 2), shot(titleId, 3)]);
  }
  return screenshotStore.get(titleId)!;
};
const getSteamCandidates = (titleId: number): SteamCandidateRow[] => {
  if (!steamCandidateStore.has(titleId)) {
    steamCandidateStore.set(
      titleId,
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        path_full: `https://cdn.steam.example/ss/${titleId}/full_${i}.jpg`,
        path_thumbnail: `https://cdn.steam.example/ss/${titleId}/thumb_${i}.jpg`,
        downloaded: i < 3, // 앞 3개는 이미 다운로드됨(완료)
      })),
    );
  }
  return steamCandidateStore.get(titleId)!;
};

// legacy title_image_register.php — title별 이미지 슬롯 상태(header/capsule231/library/hero).
type ImageSlotKeyMock = "header" | "capsule231" | "library" | "hero";
type ImageSlotStateMock = { web_uploaded: boolean; disk_exists: boolean };
const imageStore = new Map<number, Record<ImageSlotKeyMock, ImageSlotStateMock>>();
const getImages = (titleId: number): Record<ImageSlotKeyMock, ImageSlotStateMock> => {
  if (!imageStore.has(titleId)) {
    // header는 웹서버 업로드됨(목록/상세 노출), 디스크엔(CDN)은 미동기화로 seed. 나머지는 미업로드.
    imageStore.set(titleId, {
      header: { web_uploaded: true, disk_exists: false },
      capsule231: { web_uploaded: false, disk_exists: false },
      library: { web_uploaded: false, disk_exists: false },
      hero: { web_uploaded: false, disk_exists: false },
    });
  }
  return imageStore.get(titleId)!;
};
// 슬롯별 steam 소스 URL(steam_appid로 조립). appid=0이면 header/capsule231은 "".
const steamImageUrl = (key: ImageSlotKeyMock, appid: number): string => {
  if (appid <= 0 && (key === "header" || key === "capsule231")) {
    return "";
  }
  const base = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}`;
  switch (key) {
    case "header":
      return `${base}/header.jpg`;
    case "capsule231":
      return `${base}/capsule_231x87.jpg`;
    case "library":
      return `${base}/library_600x900.jpg`;
    case "hero":
      return `${base}/hero_capsule.jpg`;
  }
};

// legacy tbl_goods_description — title별 설명 6종(필드별 저장, 가변).
type DescriptionRow = {
  dgkr_description: string;
  detail: string; // 상세설명(로드=description 컬럼)
  requirements: string;
  legal_text: string;
  short_description: string;
  region_msg: string;
};
const descriptionStore = new Map<number, DescriptionRow>();
// v2 상세설명(SmartEditor2 HTML) 별도 저장.
const descriptionV2Store = new Map<number, string>();
const getDescriptionV2 = (titleId: number): string => {
  if (!descriptionV2Store.has(titleId)) {
    descriptionV2Store.set(
      titleId,
      titleId === 1001
        ? "<h2>왕국의 눈물</h2><p>스마트에디터2로 작성한 <b>HTML 상세설명</b>입니다.</p>"
        : "",
    );
  }
  return descriptionV2Store.get(titleId)!;
};
const getDescription = (titleId: number): DescriptionRow => {
  if (!descriptionStore.has(titleId)) {
    const seed: DescriptionRow =
      titleId === 1001
        ? {
            dgkr_description: "## 독점 한국어 안내\n\n디렉트게임 독점 한국어화 타이틀입니다.",
            detail: "## 게임 소개\n\n광활한 하이랄을 탐험하세요.",
            requirements: "- OS: Windows 10\n- CPU: i5\n- RAM: 8GB",
            legal_text: "© Nintendo. All rights reserved.",
            short_description: "젤다의 전설 왕국의 눈물",
            region_msg: "본 상품은 국내 전용입니다.",
          }
        : {
            dgkr_description: "",
            detail: "",
            requirements: "",
            legal_text: "",
            short_description: "",
            region_msg: "",
          };
    descriptionStore.set(titleId, seed);
  }
  return descriptionStore.get(titleId)!;
};

// legacy getTagList/getTagGroupInfo — 태그 마스터(그룹 접두어로 섹션 분류).
// G0*=디지털 장르, C*=디지털 카테고리, HG*=홀로 장르, HC*=홀로 카테고리, P*=PS, R*=Razer.
type TagMasterGroup = {
  group_code: string;
  group_name: string;
  tags: { tag_code: string; tag_name: string }[];
};
// 운영환경 태그 마스터 재현(스크린샷 기준). tag_code는 mock 임의 부여(실제 tbl_tags 코드는 백엔드).
const TAG_MASTER: TagMasterGroup[] = [
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
    group_code: "HG0001",
    group_name: "홀로모델 장르",
    tags: [{ tag_code: "HG10", tag_name: "엔터테인먼트" }],
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
  // title_code==12(소형전자) 섹션 — 운영 스크린샷 미확인, mock placeholder.
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
// 그룹 접두어 → genre[] / category[] 필드 판정(legacy: G0*·HG*=genre, 그 외=category).
const isGenreGroup = (groupCode: string) =>
  groupCode.startsWith("G0") || groupCode.startsWith("HG");
const tagNameByCode = new Map(
  TAG_MASTER.flatMap((g) => g.tags.map((t) => [t.tag_code, t.tag_name] as const)),
);

// legacy 태그 접두문자(G/M/T/V/A/F)로 색상 결정 — view 전용 샘플.
const sampleTags = [
  { code: "G10", name: "액션" },
  { code: "M20", name: "다크" },
  { code: "T30", name: "판타지" },
  { code: "V40", name: "3인칭" },
  { code: "A50", name: "수작" },
  { code: "F60", name: "싱글플레이" },
];

// ===== 실물상품 목록(accessories_list) — title_code=12, sales_status≠E =====
const accAttr = (over: Record<string, string>) => ({
  model_name: "",
  product_name: "",
  kc_safety_infomartion: "",
  rated_voltage: "",
  power: "",
  manufacturing_date: "",
  manufacturer: "",
  manufacture_country: "",
  size: "",
  weight: "",
  main_requirements: "",
  warranty_service: "",
  as_information: "",
  terms_use: "",
  applicable_period: "",
  product_supply_method: "",
  cancel_right: "",
  delivery_method_info: "",
  as_information2: "",
  ...over,
});
const ACCESSORIES_LIST = [
  {
    title_id: 6001,
    title_name: "닌텐도 스위치 프로 컨트롤러",
    title_name_en: "Nintendo Switch Pro Controller",
    sku: "ACC-6001",
    publisher: "닌텐도",
    developer: "Nintendo",
    is_view: "Y",
    sales_status: "S",
    age_limit: "10",
    categories: [{ code: "P10", name: "컨트롤러" }],
    counts: { taekbae_9: 0, taekbae_0: 2, taekbae_3: 1, code_9: 0, code_0: 0, code_3: 0 },
    attribute: accAttr({
      model_name: "HAC-013",
      product_name: "프로 컨트롤러",
      kc_safety_infomartion: "R-R-XXX-HAC013",
      rated_voltage: "DC 5V",
      power: "2.5W",
      size: "152 x 106 x 60",
      weight: "0.246",
      manufacturing_date: "2023-01",
      manufacturer: "Nintendo",
      manufacture_country: "중국",
      main_requirements: "Nintendo Switch",
      warranty_service: "구입일로부터 1년",
      as_information: "닌텐도 고객센터 1588-0000",
    }),
  },
  {
    title_id: 6002,
    title_name: "게임 콜렉터 패키지",
    title_name_en: "Game Collector Package",
    sku: "ACC-6002",
    publisher: "H2 Interactive",
    developer: "라리안",
    is_view: "N",
    sales_status: "C",
    age_limit: "15",
    categories: [{ code: "P11", name: "굿즈" }],
    counts: { taekbae_9: 1, taekbae_0: 0, taekbae_3: 0, code_9: 1, code_0: 1, code_3: 0 },
    attribute: accAttr({
      model_name: "PKG-002",
      product_name: "콜렉터 패키지",
      manufacturer: "H2 Interactive",
      manufacture_country: "대한민국",
    }),
  },
];
const PER_PAGE_ACC = 10;

// ===== 심의정보 설정확인(title_grac_chk) — age_limit is null 목록 =====
// legacy 설정확인 목록은 심의정보 미설정(grac empty) 타이틀 위주 — production 실데이터 형태 재현
// (긴 한/영 병기 상품명 + 등급 컬럼 empty → auto-layout이 잔여 폭을 균등 분배).
const GRAC_CHK_LIST = [
  {
    title_id: 2482,
    title_name: "스트레인저 댄 헤븐",
    title_name_en: "STRANGER THAN HEAVEN",
    release_date: "2027-01-15",
    rateno: "",
    grac: null,
  },
  {
    title_id: 2498,
    title_name: "포그피어서",
    title_name_en: "Fogpiercer",
    release_date: "2026-07-18",
    rateno: "",
    grac: null,
  },
  {
    title_id: 2415,
    title_name: "FZ: 포메이션 Z",
    title_name_en: "FZ: Formation Z",
    release_date: "2026-05-21",
    rateno: "",
    grac: null,
  },
  {
    title_id: 2465,
    title_name: "신죠 아카네 (뉴 오더 의상) 홀로 모델 본체 『SSSS.GRIDMAN』",
    title_name_en: "Akane Shinjo (New Order Costume) HoloModel Base 『Gridman Universe』",
    release_date: "2026-04-25",
    rateno: "",
    grac: null,
  },
  {
    title_id: 2398,
    title_name: "신토피아",
    title_name_en: "Sintopia",
    release_date: "2026-04-17",
    rateno: "",
    grac: null,
  },
  {
    title_id: 2463,
    title_name: "신죠 아카네 홀로 모델 본체 『SSSS.GRIDMAN』",
    title_name_en: "Akane Shinjo HoloModel Base 『SSSS.GRIDMAN』",
    release_date: "2026-03-28",
    rateno: "",
    grac: null,
  },
  {
    title_id: 2464,
    title_name: "신죠 아카네 (수영복) 홀로 모델 본체 『SSSS.GRIDMAN』",
    title_name_en: "Akane Shinjo (Swimsuit) HoloModel Base 『SSSS.GRIDMAN』",
    release_date: "2026-03-28",
    rateno: "",
    grac: null,
  },
  {
    title_id: 2342,
    title_name: "듀얼센스 무선 컨트롤러 - 마라톤 한정판",
    title_name_en: "CFI-ZCT1GZD",
    release_date: "2026-03-06",
    rateno: "",
    grac: null,
  },
  {
    title_id: 2341,
    title_name: "듀얼센스 무선 컨트롤러 미드나이트 블랙",
    title_name_en: "CFI-ZCT2G",
    release_date: "2026-03-05",
    rateno: "",
    grac: null,
  },
  {
    title_id: 2352,
    title_name: "하츠네 미쿠 - SNOW MIKU 2026 홀로 모델 본체",
    title_name_en: "初音ミク- SNOW MIKU 2026 ホロモデル本体",
    release_date: "2026-02-06",
    rateno: "",
    grac: null,
  },
];
const PER_PAGE_GRAC_CHK = 10;

// legacy title_image_header_chk.php / title_image_library_capsule_chk.php — 이미지 확인 목록.
// title_code<>12 + sales_status<>E(상시) 통과분. publisher/developer/is_view/is_library는 필터용.
// is_library: b.is_library HTTP 상태(200=있음/404=없음) — Library capsule 필터 전용(미표시).
const IMAGE_CHK_LIST = [
  {
    title_id: 2482,
    steam_appid: 2358720,
    sales_status: "C",
    sku: "DG-STRANGERTHANHEAVEN",
    title_name: "스트레인저 댄 헤븐",
    title_name_en: "STRANGER THAN HEAVEN",
    release_date: "2027-01-15",
    domain: "https://directg.net",
    is_view: "Y",
    is_library: "404",
    publisher: "SEGA",
    developer: "Ryu Ga Gotoku Studio",
  },
  {
    title_id: 2498,
    steam_appid: 2842040,
    sales_status: "C",
    sku: "DG-FOGPIERCER",
    title_name: "포그피어서",
    title_name_en: "Fogpiercer",
    release_date: "2026-07-18",
    domain: "https://directg.net",
    is_view: "Y",
    is_library: "404",
    publisher: "Astrolabe Games",
    developer: "Fogpiercer Team",
  },
  {
    title_id: 2415,
    steam_appid: 2183160,
    sales_status: "S",
    sku: "DG-FZFORMATIONZ",
    title_name: "FZ: 포메이션 Z",
    title_name_en: "FZ: Formation Z",
    release_date: "2026-05-21",
    domain: "https://image.directg.net",
    is_view: "Y",
    is_library: "200",
    publisher: "City Connection",
    developer: "City Connection",
  },
  {
    title_id: 2465,
    steam_appid: 0,
    sales_status: "S",
    sku: "DG-AKANE-NEWORDER",
    title_name: "신죠 아카네 (뉴 오더 의상) 홀로 모델 본체 『SSSS.GRIDMAN』",
    title_name_en: "Akane Shinjo (New Order Costume) HoloModel Base 『Gridman Universe』",
    release_date: "2026-04-25",
    domain: "https://image.directg.net",
    is_view: "Y",
    is_library: "200",
    publisher: "GENBA",
    developer: "GENBA",
  },
  {
    title_id: 2398,
    steam_appid: 1966720,
    sales_status: "S",
    sku: "DG-SINTOPIA",
    title_name: "신토피아",
    title_name_en: "Sintopia",
    release_date: "2026-04-17",
    domain: "https://directg.net",
    is_view: "N",
    is_library: "200",
    publisher: "Neowiz",
    developer: "Sintopia Studio",
  },
  {
    title_id: 2463,
    steam_appid: 0,
    sales_status: "S",
    sku: "DG-AKANE-BASE",
    title_name: "신죠 아카네 홀로 모델 본체 『SSSS.GRIDMAN』",
    title_name_en: "Akane Shinjo HoloModel Base 『SSSS.GRIDMAN』",
    release_date: "2026-03-28",
    domain: "https://image.directg.net",
    is_view: "Y",
    is_library: "200",
    publisher: "GENBA",
    developer: "GENBA",
  },
  {
    title_id: 2464,
    steam_appid: 0,
    sales_status: "S",
    sku: "DG-AKANE-SWIMSUIT",
    title_name: "신죠 아카네 (수영복) 홀로 모델 본체 『SSSS.GRIDMAN』",
    title_name_en: "Akane Shinjo (Swimsuit) HoloModel Base 『SSSS.GRIDMAN』",
    release_date: "2026-03-28",
    domain: "https://image.directg.net",
    is_view: "Y",
    is_library: "200",
    publisher: "GENBA",
    developer: "GENBA",
  },
  {
    title_id: 2342,
    steam_appid: 0,
    sales_status: "S",
    sku: "DG-DUALSENSE-MARATHON",
    title_name: "듀얼센스 무선 컨트롤러 - 마라톤 한정판",
    title_name_en: "CFI-ZCT1GZD",
    release_date: "2026-03-06",
    domain: "https://directg.net",
    is_view: "Y",
    is_library: "404",
    publisher: "SIE",
    developer: "SIE",
  },
  {
    title_id: 2341,
    steam_appid: 0,
    sales_status: "S",
    sku: "DG-DUALSENSE-MIDNIGHT",
    title_name: "듀얼센스 무선 컨트롤러 미드나이트 블랙",
    title_name_en: "CFI-ZCT2G",
    release_date: "2026-03-05",
    domain: "https://directg.net",
    is_view: "Y",
    is_library: "404",
    publisher: "SIE",
    developer: "SIE",
  },
  {
    title_id: 2352,
    steam_appid: 0,
    sales_status: "S",
    sku: "DG-SNOWMIKU-2026",
    title_name: "하츠네 미쿠 - SNOW MIKU 2026 홀로 모델 본체",
    title_name_en: "初音ミク- SNOW MIKU 2026 ホロモデル本体",
    release_date: "2026-02-06",
    domain: "https://image.directg.net",
    is_view: "Y",
    is_library: "200",
    publisher: "GENBA",
    developer: "GENBA",
  },
  {
    title_id: 2301,
    steam_appid: 1817070,
    sales_status: "S",
    sku: "DG-MARVELSPIDERMAN2",
    title_name: "마블 스파이더맨 2",
    title_name_en: "Marvel's Spider-Man 2",
    release_date: "2026-01-30",
    domain: "https://directg.net",
    is_view: "Y",
    is_library: "200",
    publisher: "PlayStation PC LLC",
    developer: "Insomniac Games",
  },
  {
    title_id: 2288,
    steam_appid: 1245620,
    sales_status: "S",
    sku: "DG-ELDENRING",
    title_name: "엘든 링",
    title_name_en: "ELDEN RING",
    release_date: "2025-12-12",
    domain: "https://image.directg.net",
    is_view: "N",
    is_library: "200",
    publisher: "FromSoftware",
    developer: "FromSoftware",
  },
];
const PER_PAGE_IMAGE_CHK = 10;

// vertical 전용 hero 상태(title_id → is_hero HTTP코드/웹서버 hero_capsule 존재). 미지정은 is_hero=null(404 취급).
// is_hero: b.is_hero(디스크엔/스팀 캐시), hero_web_exists: 웹서버 로컬 파일 존재(완료 버튼 노출용).
const HERO_STATE: Record<number, { is_hero: string | null; hero_web_exists: boolean }> = {
  2482: { is_hero: null, hero_web_exists: false },
  2498: { is_hero: "404", hero_web_exists: false },
  2415: { is_hero: "200", hero_web_exists: true },
  2465: { is_hero: "200", hero_web_exists: true },
  2398: { is_hero: null, hero_web_exists: false },
  2463: { is_hero: "200", hero_web_exists: true },
  2464: { is_hero: "200", hero_web_exists: false }, // 디스크엔 있으나 웹서버 파일 없음 → 완료 버튼 숨김
  2342: { is_hero: "404", hero_web_exists: false },
  2341: { is_hero: "404", hero_web_exists: false },
  2352: { is_hero: "200", hero_web_exists: true },
  2301: { is_hero: "200", hero_web_exists: true },
  2288: { is_hero: "200", hero_web_exists: true },
};

export const goodsTitleHandlers = [
  // legacy title_grac_chk.php — 심의정보 설정확인(age_limit is null). :titleId보다 먼저.
  http.get(api("/admin/goods/titles/grac-chk"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    // 기본: age_limit is null (seed 전제). search_age_limit 선택 시 실질 빈결과(legacy quirk) — 미적용.
    const rows = GRAC_CHK_LIST;
    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_GRAC_CHK));
    const start = (page - 1) * PER_PAGE_GRAC_CHK;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_GRAC_CHK),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_GRAC_CHK,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy title_image_{header|library_capsule|vertical_capsule}_chk.php — 이미지 확인 목록(공용). :titleId보다 먼저.
  http.get(api("/admin/goods/titles/image-chk"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);
    const imageType = q("image_type"); // header | library | vertical

    // 기본 WHERE: title_code<>12(seed 전제). E 상시제외는 header/library만(vertical은 legacy에 해당 라인 없음).
    let rows =
      imageType === "vertical"
        ? [...IMAGE_CHK_LIST]
        : IMAGE_CHK_LIST.filter((r) => r.sales_status !== "E");

    const value = q("search_value");
    if (value) {
      const key = q("search_key") || "search_name";
      rows = rows.filter((r) => {
        switch (key) {
          case "search_title_id":
            return String(r.title_id) === value;
          case "search_publisher":
            return r.publisher.toLowerCase().includes(value.toLowerCase());
          case "search_developer":
            return r.developer.toLowerCase().includes(value.toLowerCase());
          default:
            return (
              r.title_name.toLowerCase().includes(value.toLowerCase()) ||
              r.title_name_en.toLowerCase().includes(value.toLowerCase())
            );
        }
      });
    }
    // ⚠️ legacy 버그 그대로: 등호 비교(가드 없음). is_view='all'/domain='all' → empty, sales_status='E' → empty.
    const isView = q("search_is_view");
    if (isView) {
      rows = rows.filter((r) => r.is_view === isView);
    }
    const salesStatus = q("search_sales_status");
    if (salesStatus) {
      rows = rows.filter((r) => r.sales_status === salesStatus);
    }
    const domain = q("search_domain");
    if (domain) {
      rows = rows.filter((r) => r.domain === domain);
    }
    // image_type=library 전용(b.is_library 200/404 등호). header/vertical에선 미전송.
    const isLibrary = q("search_is_library");
    if (isLibrary) {
      rows = rows.filter((r) => r.is_library === isLibrary);
    }
    // image_type=vertical 전용(b.is_hero). 404는 null 포함(legacy `='404' or is null`).
    const isHero = q("search_is_hero");
    if (isHero) {
      rows = rows.filter((r) => {
        const hero = HERO_STATE[r.title_id]?.is_hero ?? null;
        return isHero === "404" ? hero === "404" || hero === null : hero === isHero;
      });
    }

    // 정렬: vertical=release_date desc, header/library=title_id desc.
    rows =
      imageType === "vertical"
        ? [...rows].sort((a, b) => b.release_date.localeCompare(a.release_date))
        : [...rows].sort((a, b) => b.title_id - a.title_id);

    // vertical만 hero_web_exists(완료 버튼 노출용) 부가.
    const items = rows.slice(
      (page - 1) * PER_PAGE_IMAGE_CHK,
      (page - 1) * PER_PAGE_IMAGE_CHK + PER_PAGE_IMAGE_CHK,
    );
    const payload =
      imageType === "vertical"
        ? items.map((r) => ({
            ...r,
            hero_web_exists: HERO_STATE[r.title_id]?.hero_web_exists ?? false,
          }))
        : items;

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_IMAGE_CHK));
    return HttpResponse.json({
      items: payload,
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_IMAGE_CHK,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy title_ps.php mode=hero_capsule_chk — hero_capsule 완료 체크(appid). :titleId보다 먼저.
  http.post(api("/admin/goods/titles/hero-capsule-chk"), async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { steam_appid?: number };
    return HttpResponse.json({
      success: true,
      message: `hero_capsule 처리되었습니다. (appid: ${body?.steam_appid ?? 0})`,
    });
  }),

  // legacy accessories_list.php — 실물상품 목록(title_code=12, sales_status≠E). :titleId보다 먼저 등록.
  http.get(api("/admin/goods/titles/accessories"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    // 기본 필터: sales_status<>E (title_code=12는 seed 전제).
    let rows = ACCESSORIES_LIST.filter((r) => r.sales_status !== "E");
    const value = q("search_value");
    if (value) {
      const key = q("search_key") || "search_name";
      rows = rows.filter((r) => {
        switch (key) {
          case "search_title_id":
            return String(r.title_id) === value;
          case "search_publisher":
            return r.publisher.toLowerCase().includes(value.toLowerCase());
          case "search_developer":
            return r.developer.toLowerCase().includes(value.toLowerCase());
          default:
            return (
              r.title_name.toLowerCase().includes(value.toLowerCase()) ||
              r.title_name_en.toLowerCase().includes(value.toLowerCase())
            );
        }
      });
    }
    const salesStatus = q("search_sales_status");
    if (salesStatus) {
      rows = rows.filter((r) => r.sales_status === salesStatus);
    }
    const isView = q("search_is_view");
    if (isView && isView !== "all") {
      rows = rows.filter((r) => r.is_view === isView);
    }
    const ageLimit = q("search_age_limit");
    if (ageLimit) {
      rows = rows.filter((r) => r.age_limit === ageLimit);
    }

    rows.sort((a, b) => b.title_id - a.title_id);

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_ACC));
    const start = (page - 1) * PER_PAGE_ACC;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_ACC),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_ACC,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy Admin::getGoodsList — title_code='33' + 필터, order title_id desc, 10/page.
  http.get(api("/admin/goods/titles"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    // legacy: title_code='33' 강제
    let rows = db.goodsTitle.filter((row) => row.title_code === "33");

    const searchKey = q("search_key") || "search_name";
    const searchValue = q("search_value");
    if (searchValue) {
      rows = rows.filter((row) => {
        switch (searchKey) {
          case "search_title_id":
            return String(row.title_id) === searchValue;
          case "search_title_sku":
            return row.sku === searchValue;
          case "search_publisher":
            return contains(row.publisher, searchValue);
          case "search_developer":
            return contains(row.developer, searchValue);
          case "search_name":
          default:
            return (
              contains(row.title_name, searchValue) || contains(row.title_name_en, searchValue)
            );
        }
      });
    }

    const salesStatus = q("search_sales_status");
    if (salesStatus) {
      rows = rows.filter((row) => row.sales_status === salesStatus);
    }
    const isView = q("search_is_view");
    if (isView && isView !== "all") {
      rows = rows.filter((row) => row.is_view === isView);
    }
    const ageLimit = q("search_age_limit");
    if (ageLimit) {
      rows = rows.filter((row) => row.age_limit === ageLimit);
    }
    const iface = q("search_interface_korean");
    if (iface) {
      rows = rows.filter((row) => row.interface_korean === iface);
    }
    const subtitle = q("search_subtitle_korean");
    if (subtitle) {
      rows = rows.filter((row) => row.subtitle_korean === subtitle);
    }
    const spoken = q("search_spoken_korean");
    if (spoken) {
      rows = rows.filter((row) => row.spoken_korean === spoken);
    }
    const exclusive = q("search_exclusive_korean");
    if (exclusive) {
      rows = rows.filter((row) => row.exclusive_korean === exclusive);
    }

    rows.sort((a, b) => b.title_id - a.title_id);

    const totalResults = rows.length;
    const totalPages = Math.ceil(totalResults / PER_PAGE);
    const start = (page - 1) * PER_PAGE;
    const items = rows.slice(start, start + PER_PAGE).map(toItem);

    return HttpResponse.json<GoodsTitleListResponse>({
      items,
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy btn_steam_sync — 스팀 동기화(mock: steam_synced=true 처리). 실제 steam API는 백엔드.
  http.post(api("/admin/goods/titles/:titleId/steam-sync"), ({ params }) => {
    const titleId = Number(params.titleId);
    const updated = db.goodsTitle.update((row) => row.title_id === titleId, { steam_synced: true });
    if (!updated) {
      return HttpResponse.json<MutationResponse>({ success: false }, { status: 404 });
    }
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy title_register.php 로드 — title_id 채번·uuid sku·product_code prefill.
  // ⚠️ GET :titleId(상세) 추가 시 이 핸들러를 먼저 등록해야 "new"가 :titleId로 먹히지 않음.
  http.get(api("/admin/goods/titles/new"), ({ request }) => {
    const productCode = new URL(request.url).searchParams.get("product_code") ?? "";
    const nextId = db.goodsTitle.all().reduce((max, row) => Math.max(max, row.title_id), 1000) + 1;
    const sku = crypto.randomUUID();
    const prefill = productCode
      ? {
          title_name: `옵션연동 상품(${productCode})`,
          title_name_en: `Option Linked (${productCode})`,
          steam_appid: 123456,
          release_date: "2026-06-01",
          developer: "Steam Developer",
          publisher: "Steam Publisher",
        }
      : null;
    return HttpResponse.json({ title_id: nextId, sku, prefill });
  }),

  // legacy title_modify.php 로드 — SELECT tbl_goods WHERE title_id. (위 /new 뒤에 등록.)
  http.get(api("/admin/goods/titles/:titleId"), ({ params }) => {
    const titleId = Number(params.titleId);
    const row = db.goodsTitle.all().find((r) => r.title_id === titleId);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return HttpResponse.json({
      title_id: row.title_id,
      sku: row.sku,
      title_name: row.title_name,
      title_name_en: row.title_name_en,
      publisher: row.publisher,
      developer: row.developer,
      spoken_korean: row.spoken_korean,
      interface_korean: row.interface_korean,
      subtitle_korean: row.subtitle_korean,
      exclusive_korean: row.exclusive_korean,
      is_view: row.is_view,
      sales_status: row.sales_status,
      coming_soon: row.coming_soon,
      coming_soon_date: row.coming_soon_date,
      release_date: row.release_date,
      title_code: row.title_code,
      steam_appid: row.steam_appid,
      model_name: row.model_name,
    });
  }),

  // legacy title_ps.php modify — UPDATE tbl_goods(지정 필드만, 미변경 필드 보존).
  http.put(api("/admin/goods/titles/:titleId"), async ({ params, request }) => {
    const titleId = Number(params.titleId);
    const body = (await request.json()) as {
      title_name: string;
      title_name_en: string;
      is_view: string;
      sales_status: "C" | "S" | "E" | "";
      release_date: string;
      developer: string;
      steam_appid: string;
      publisher: string;
      interface_korean: string;
      spoken_korean: string;
      exclusive_korean: string;
      subtitle_korean: string;
      coming_soon: string;
      coming_soon_date: string;
      title_code: string;
      model_name: string;
    };
    // legacy: if(!$is_view) $is_view="N";
    const isView = body.is_view ? (body.is_view as "Y" | "N") : "N";
    const updated = db.goodsTitle.update((row) => row.title_id === titleId, {
      title_name: body.title_name,
      title_name_en: body.title_name_en,
      is_view: isView,
      sales_status: body.sales_status,
      release_date: body.release_date,
      developer: body.developer,
      steam_appid: Number(body.steam_appid) || 0,
      publisher: body.publisher,
      // 미체크 체크박스는 "" 저장 → 타입상 "Y"|"N"이나 legacy 빈값 동작 재현.
      interface_korean: (body.interface_korean === "Y" ? "Y" : "N") as "Y" | "N",
      spoken_korean: (body.spoken_korean === "Y" ? "Y" : "N") as "Y" | "N",
      exclusive_korean: (body.exclusive_korean === "Y" ? "Y" : "N") as "Y" | "N",
      subtitle_korean: (body.subtitle_korean === "Y" ? "Y" : "N") as "Y" | "N",
      coming_soon: (body.coming_soon === "N" ? "N" : "Y") as "Y" | "N",
      coming_soon_date: body.coming_soon_date,
      title_code: body.title_code,
      model_name: body.model_name,
    });
    if (!updated) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    return HttpResponse.json({ success: true, title_id: titleId });
  }),

  // legacy title_view.php 로드 — 상세 read-only 조립(기본정보 + media/description HTML/steam/tags).
  http.get(api("/admin/goods/titles/:titleId/view"), ({ params }) => {
    const titleId = Number(params.titleId);
    const row = db.goodsTitle.all().find((r) => r.title_id === titleId);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    const isDigital = row.title_code === "33";
    return HttpResponse.json({
      title_id: row.title_id,
      sku: row.sku,
      title_name: row.title_name,
      title_name_en: row.title_name_en,
      publisher: row.publisher,
      developer: row.developer,
      title_code: row.title_code,
      interface_korean: row.interface_korean,
      spoken_korean: row.spoken_korean,
      exclusive_korean: row.exclusive_korean,
      is_view: row.is_view,
      sales_status: row.sales_status,
      coming_soon: row.coming_soon,
      release_date: row.release_date,
      coming_soon_date: row.coming_soon_date,
      drm_notice: row.drm_notice,
      ext_user_account_notice: row.ext_user_account_notice,
      rateno: row.rateno,
      steam_appid: row.steam_appid,
      short_description: `${row.title_name} — 짧은 상품 설명(관리자 표시용).`,
      media: getMedia(titleId),
      // 백엔드 Parsedown 렌더 결과 HTML(프론트 미렌더).
      game_html: `<h2>${row.title_name}</h2><p>게임 상세 설명 본문입니다.</p>`,
      requirements_html: "<ul><li>OS: Windows 10</li><li>RAM: 8GB</li></ul>",
      legal_text_html: `<p>© ${row.publisher}. All rights reserved.</p>`,
      perks_html: null,
      grac: row.grac,
      genres: row.genres,
      categories: row.categories,
      tags: sampleTags,
      steam: isDigital
        ? {
            steam_appid: row.steam_appid,
            name: row.title_name_en,
            drm_notice: row.drm_notice,
            ext_user_account_notice: row.ext_user_account_notice,
            recommendations: 12345,
            review_score: 8,
            review_score_desc: "매우 긍정적",
            total_positive: 9500,
            total_reviews: 10000,
            packages: [{ package_name: `${row.title_name} 스탠다드`, packageid: 100000 + titleId }],
            dlcs: [{ name: `${row.title_name_en} DLC`, steam_appid: row.steam_appid + 1 }],
          }
        : null,
    });
  }),

  // legacy goods_ps.php delete_youtube — 영상 삭제.
  http.delete(api("/admin/goods/titles/:titleId/media/:youtubeMediaId"), ({ params }) => {
    const titleId = Number(params.titleId);
    const mediaId = String(params.youtubeMediaId);
    const list = getMedia(titleId);
    mediaStore.set(
      titleId,
      list.filter((m) => m.youtube_media_id !== mediaId),
    );
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy title_media_register.php 로드 — 등록 영상 + YouTube 검색 후보(등록분 제외).
  http.get(api("/admin/goods/titles/:titleId/media"), ({ params }) => {
    const titleId = Number(params.titleId);
    const row = db.goodsTitle.all().find((r) => r.title_id === titleId);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    const media = getMedia(titleId);
    const registered = new Set(media.map((m) => m.youtube_media_id));
    const candidates = SAMPLE_CANDIDATES.filter((c) => !registered.has(c.videoId));
    return HttpResponse.json({
      title_id: row.title_id,
      title_name: row.title_name,
      title_name_en: row.title_name_en,
      media,
      candidates,
    });
  }),

  // legacy title_ps.php add_youtube — 영상 추가(embed URL 조립 INSERT).
  http.post(api("/admin/goods/titles/:titleId/media"), async ({ params, request }) => {
    const titleId = Number(params.titleId);
    const body = (await request.json()) as { youtube_media_id: string };
    const id = body.youtube_media_id.trim();
    if (id) {
      const list = getMedia(titleId);
      if (!list.some((m) => m.youtube_media_id === id)) {
        mediaStore.set(titleId, [...list, embed(id)]);
      }
    }
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy title_screenshot_register.php 로드 — 등록 스크린샷(sort 오름차순) + steam 후보.
  http.get(api("/admin/goods/titles/:titleId/screenshots"), ({ params }) => {
    const titleId = Number(params.titleId);
    const row = db.goodsTitle.all().find((r) => r.title_id === titleId);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    const screenshots = [...getScreenshots(titleId)].sort((a, b) => a.sort - b.sort);
    return HttpResponse.json({
      title_id: row.title_id,
      title_name: row.title_name,
      title_name_en: row.title_name_en,
      steam_appid: row.steam_appid,
      screenshots,
      steam_candidates: getSteamCandidates(titleId),
    });
  }),

  // legacy steam_image_download.php screenshot_delete — 스크린샷 삭제.
  http.delete(api("/admin/goods/titles/:titleId/screenshots/:screenshotNum"), ({ params }) => {
    const titleId = Number(params.titleId);
    const num = Number(params.screenshotNum);
    screenshotStore.set(
      titleId,
      getScreenshots(titleId).filter((s) => s.screenshot_num !== num),
    );
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy title_ps.php screenshot_sort_up/down — sort ∓1(idx 기준).
  http.post(api("/admin/goods/titles/:titleId/screenshots/sort"), async ({ params, request }) => {
    const titleId = Number(params.titleId);
    const body = (await request.json()) as { idx: number; dir: "up" | "down" };
    screenshotStore.set(
      titleId,
      getScreenshots(titleId).map((s) =>
        s.idx === body.idx ? { ...s, sort: s.sort + (body.dir === "up" ? -1 : 1) } : s,
      ),
    );
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy steam_image_download.php — steam 스크린샷 다운로드(후보 완료 + 스크린샷 추가).
  http.post(
    api("/admin/goods/titles/:titleId/screenshots/download"),
    async ({ params, request }) => {
      const titleId = Number(params.titleId);
      const body = (await request.json()) as { id: number; num: number };
      steamCandidateStore.set(
        titleId,
        getSteamCandidates(titleId).map((c) => (c.id === body.id ? { ...c, downloaded: true } : c)),
      );
      const list = getScreenshots(titleId);
      screenshotStore.set(titleId, [...list, shot(titleId, body.num)]);
      return HttpResponse.json<MutationResponse>({ success: true });
    },
  ),

  // legacy title_ps.php screenshot_upload — 직접 업로드(mock: 파일명으로 항목 추가).
  http.post(api("/admin/goods/titles/:titleId/screenshots/upload"), async ({ params }) => {
    const titleId = Number(params.titleId);
    const list = getScreenshots(titleId);
    const nextNum = list.reduce((max, s) => Math.max(max, s.screenshot_num), 0) + 1;
    screenshotStore.set(titleId, [...list, shot(titleId, nextNum)]);
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy title_image_register.php 로드 — 이미지 슬롯 상태(웹서버/디스크엔 + steam url).
  http.get(api("/admin/goods/titles/:titleId/images"), ({ params }) => {
    const titleId = Number(params.titleId);
    const row = db.goodsTitle.all().find((r) => r.title_id === titleId);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    const state = getImages(titleId);
    const slot = (key: ImageSlotKeyMock) => ({
      web_uploaded: state[key].web_uploaded,
      disk_exists: state[key].disk_exists,
      steam_url: steamImageUrl(key, row.steam_appid),
      // legacy: remoteFileExist(steam_url)==200일 때만 스팀 다운로드 버튼 노출.
      // 스팀 capsule은 통상 존재, hero_capsule(cloudflare)은 통상 미존재 → 운영 화면과 동일하게 재현.
      steam_available: key === "capsule231" && row.steam_appid > 0,
      // legacy: header 디스크엔 placeholder에 remoteFileExist 코드 표기(미존재 시 403 예시).
      http_code: key === "header" && !state[key].disk_exists ? 403 : 0,
    });
    return HttpResponse.json({
      title_id: row.title_id,
      title_name: row.title_name,
      title_name_en: row.title_name_en,
      steam_appid: row.steam_appid,
      slots: {
        header: slot("header"),
        capsule231: slot("capsule231"),
        library: slot("library"),
        hero: slot("hero"),
      },
    });
  }),

  // legacy steam_image_download.php — 스팀 이미지 다운로드(해당 슬롯 업로드/디스크엔 처리).
  http.post(api("/admin/goods/titles/:titleId/images/download"), async ({ params, request }) => {
    const titleId = Number(params.titleId);
    const body = (await request.json()) as { key: ImageSlotKeyMock };
    const state = getImages(titleId);
    imageStore.set(titleId, {
      ...state,
      [body.key]: { web_uploaded: true, disk_exists: true },
    });
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy title_ps.php {type}_upload — 직접 업로드(mock: 파일명만, 슬롯 업로드 처리).
  http.post(api("/admin/goods/titles/:titleId/images/upload"), async ({ params, request }) => {
    const titleId = Number(params.titleId);
    const body = (await request.json()) as { key: ImageSlotKeyMock; file_name: string };
    const state = getImages(titleId);
    imageStore.set(titleId, {
      ...state,
      [body.key]: { web_uploaded: true, disk_exists: true },
    });
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy title_description_register.php 로드 — 설명 필드 6종.
  http.get(api("/admin/goods/titles/:titleId/description"), ({ params }) => {
    const titleId = Number(params.titleId);
    const row = db.goodsTitle.all().find((r) => r.title_id === titleId);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return HttpResponse.json({
      title_id: row.title_id,
      title_name: row.title_name,
      title_name_en: row.title_name_en,
      steam_appid: row.steam_appid,
      description: getDescription(titleId),
    });
  }),

  // legacy 필드별 저장(description_save2/3/requirements/legal_text/short_description/region_msg).
  http.put(api("/admin/goods/titles/:titleId/description"), async ({ params, request }) => {
    const titleId = Number(params.titleId);
    const body = (await request.json()) as { field: keyof DescriptionRow; value: string };
    const current = getDescription(titleId);
    descriptionStore.set(titleId, { ...current, [body.field]: body.value });
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy get_steam_game_info.php — 상세설명/시스템요구사항 steam 동기화(mock: 샘플 채움).
  http.post(api("/admin/goods/titles/:titleId/description/sync"), async ({ params, request }) => {
    const titleId = Number(params.titleId);
    const body = (await request.json()) as { target: "description" | "requirements" };
    const current = getDescription(titleId);
    if (body.target === "description") {
      descriptionStore.set(titleId, {
        ...current,
        detail: "## Steam 동기화 상세설명\n\n스팀에서 가져온 상세설명입니다.",
      });
    } else {
      descriptionStore.set(titleId, {
        ...current,
        requirements: "- OS: Windows 11\n- CPU: i7\n- RAM: 16GB\n- GPU: RTX 3060",
      });
    }
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy title_description_register_v2.php 로드 — SE2 초기값 + steam read-only 렌더.
  http.get(api("/admin/goods/titles/:titleId/description-v2"), ({ params }) => {
    const titleId = Number(params.titleId);
    const row = db.goodsTitle.all().find((r) => r.title_id === titleId);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    // 운영 병합 페이지: 마크다운 필드(dgkr/requirements/legal/short/region) + SE2(description_v2).
    const desc = getDescription(titleId);
    return HttpResponse.json({
      title_id: row.title_id,
      title_name: row.title_name,
      title_name_en: row.title_name_en,
      steam_appid: row.steam_appid,
      description_v2: getDescriptionV2(titleId),
      dgkr_description: desc.dgkr_description,
      requirements: desc.requirements,
      legal_text: desc.legal_text,
      short_description: desc.short_description,
      region_msg: desc.region_msg,
    });
  }),

  // legacy title_ps.php description_save_v2 — SE2 HTML 저장(version='2').
  http.put(api("/admin/goods/titles/:titleId/description-v2"), async ({ params, request }) => {
    const titleId = Number(params.titleId);
    const body = (await request.json()) as { value: string };
    descriptionV2Store.set(titleId, body.value);
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy get_steam_game_info.php description_sync_v2 — steam 동기화(mock: 샘플 채움).
  http.post(api("/admin/goods/titles/:titleId/description-v2/sync"), ({ params }) => {
    const titleId = Number(params.titleId);
    descriptionV2Store.set(
      titleId,
      "<h2>Steam 동기화</h2><p>스팀에서 가져온 HTML 상세설명입니다.</p>",
    );
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy title_attribute_set_register.php 로드 — tbl_goods(title_code/명) + tbl_title_attribute_set.
  http.get(api("/admin/goods/titles/:titleId/attribute-set"), ({ params }) => {
    const titleId = Number(params.titleId);
    const row = db.goodsTitle.all().find((r) => r.title_id === titleId);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return HttpResponse.json({
      title_id: row.title_id,
      title_name: row.title_name,
      title_name_en: row.title_name_en,
      title_code: row.title_code,
      attribute: getAttribute(titleId),
    });
  }),

  // legacy title_ps.php attribute_set — 제공고시 UPSERT(현재 title_code 필드만 채워지고 나머지 빈값).
  http.put(api("/admin/goods/titles/:titleId/attribute-set"), async ({ params, request }) => {
    const titleId = Number(params.titleId);
    const body = (await request.json()) as Partial<AttributeSetRow>;
    const current = getAttribute(titleId);
    attributeStore.set(titleId, {
      ...current,
      model_name: body.model_name ?? "",
      product_name: body.product_name ?? "",
      kc_safety_infomartion: body.kc_safety_infomartion ?? "",
      rated_voltage: body.rated_voltage ?? "",
      power: body.power ?? "",
      manufacturing_date: body.manufacturing_date ?? "",
      manufacturer: body.manufacturer ?? "",
      manufacture_country: body.manufacture_country ?? "",
      size: body.size ?? "",
      weight: body.weight ?? "",
      main_requirements: body.main_requirements ?? "",
      warranty_service: body.warranty_service ?? "",
      as_information: body.as_information ?? "",
      terms_use: body.terms_use ?? "",
      applicable_period: body.applicable_period ?? "",
      product_supply_method: body.product_supply_method ?? "",
      cancel_right: body.cancel_right ?? "",
    });
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy title_ps.php attribute_set2 — 거래조건 UPSERT.
  http.put(api("/admin/goods/titles/:titleId/trade-terms"), async ({ params, request }) => {
    const titleId = Number(params.titleId);
    const body = (await request.json()) as Partial<AttributeSetRow>;
    const current = getAttribute(titleId);
    attributeStore.set(titleId, {
      ...current,
      delivery_method_info: body.delivery_method_info ?? "",
      as_information2: body.as_information2 ?? "",
    });
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy title_grac_register.php 로드 — tbl_goods 심의정보(rateno/age_limit/game_rate).
  http.get(api("/admin/goods/titles/:titleId/grac"), ({ params }) => {
    const titleId = Number(params.titleId);
    const row = db.goodsTitle.all().find((r) => r.title_id === titleId);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return HttpResponse.json({
      title_id: row.title_id,
      title_name: row.title_name,
      title_name_en: row.title_name_en,
      rateno: row.rateno ? String(row.rateno) : "",
      age_limit: row.age_limit,
      game_rate: row.game_rate,
    });
  }),

  // legacy title_ps.php grac_save — tbl_goods rateno/age_limit/game_rate UPDATE(game_rate=pad7).
  // orgname은 폼 미노출 → 빈값(mock 미저장). tbl_title_option age_limit 전파는 백엔드 책임.
  http.put(api("/admin/goods/titles/:titleId/grac"), async ({ params, request }) => {
    const titleId = Number(params.titleId);
    const body = (await request.json()) as {
      rateno: string;
      age_limit: string;
      game_rate_text: string;
    };
    // legacy: str_pad(game_rate_text, 7, '0', STR_PAD_LEFT)
    const gameRate = (body.game_rate_text || "0").padStart(7, "0").slice(-7);
    const updated = db.goodsTitle.update((r) => r.title_id === titleId, {
      rateno: Number(body.rateno) || 0,
      age_limit: body.age_limit,
      game_rate: gameRate,
    });
    if (!updated) {
      return HttpResponse.json<MutationResponse>({ success: false }, { status: 404 });
    }
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy title_tag_register.php 로드 — 태그 마스터 + checked(저장 genre/category 코드 기준).
  http.get(api("/admin/goods/titles/:titleId/tags"), ({ params }) => {
    const titleId = Number(params.titleId);
    const row = db.goodsTitle.all().find((r) => r.title_id === titleId);
    if (!row) {
      return HttpResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    const genreCodes = new Set(row.genres.map((g) => g.code));
    const categoryCodes = new Set(row.categories.map((c) => c.code));
    const groups = TAG_MASTER.map((group) => {
      const codes = isGenreGroup(group.group_code) ? genreCodes : categoryCodes;
      return {
        group_code: group.group_code,
        group_name: group.group_name,
        tags: group.tags.map((t) => ({
          tag_code: t.tag_code,
          tag_name: t.tag_name,
          checked: codes.has(t.tag_code),
        })),
      };
    });
    return HttpResponse.json({
      title_id: row.title_id,
      title_name: row.title_name,
      title_name_en: row.title_name_en,
      title_code: row.title_code,
      groups,
    });
  }),

  // legacy title_tag_ps.php tag_save — tbl_goods.genre/category UPDATE(체크 tag_code 목록).
  http.put(api("/admin/goods/titles/:titleId/tags"), async ({ params, request }) => {
    const titleId = Number(params.titleId);
    const body = (await request.json()) as { genre: string[]; category: string[] };
    const toTags = (codes: string[]) =>
      codes.map((code) => ({ code, name: tagNameByCode.get(code) ?? code }));
    const updated = db.goodsTitle.update((r) => r.title_id === titleId, {
      genres: toTags(body.genre ?? []),
      categories: toTags(body.category ?? []),
    });
    if (!updated) {
      return HttpResponse.json<MutationResponse>({ success: false }, { status: 404 });
    }
    return HttpResponse.json<MutationResponse>({ success: true });
  }),

  // legacy title_ps.php register — INSERT tbl_goods(폼 필드 + 미노출 필드 빈값). enriched 기본값.
  http.post(api("/admin/goods/titles"), async ({ request }) => {
    const body = (await request.json()) as {
      title_id: number;
      sku: string;
      title_name: string;
      title_name_en: string;
      coming_soon: "Y" | "N";
      coming_soon_date: string;
      release_date: string;
      title_code: string;
      is_view: "Y" | "N";
      sales_status: "C" | "S" | "E";
      publisher: string;
      developer: string;
      steam_appid: string;
    };
    const steamAppid = Number(body.steam_appid) || 0;
    db.goodsTitle.insert({
      title_id: body.title_id,
      title_code: body.title_code,
      title_name: body.title_name,
      title_name_en: body.title_name_en,
      sku: body.sku,
      publisher: body.publisher,
      developer: body.developer,
      release_date: body.release_date,
      interface_korean: "N",
      subtitle_korean: "N",
      spoken_korean: "N",
      exclusive_korean: "N",
      is_view: body.is_view,
      sales_status: body.sales_status,
      coming_soon: body.coming_soon === "N" ? "N" : "Y",
      coming_soon_date: body.coming_soon_date,
      model_name: "",
      steam_appid: steamAppid,
      steam_synced: steamAppid === 0,
      franchise_idx: 0,
      franchise_name: "",
      drm_notice: "",
      ext_user_account_notice: "",
      hit: 0,
      rateno: 0,
      age_limit: "",
      game_rate: "0000000",
      counts: {
        game_9: 0,
        game_0: 0,
        game_3: 0,
        edition_9: 0,
        edition_0: 0,
        edition_3: 0,
        dlc_9: 0,
        dlc_0: 0,
        dlc_3: 0,
        holo_9: 0,
        holo_0: 0,
        holo_3: 0,
        holo_edition_9: 0,
        holo_edition_0: 0,
        holo_edition_3: 0,
        holo_dlc_9: 0,
        holo_dlc_0: 0,
        holo_dlc_3: 0,
      },
      grac: null,
      genres: [],
      categories: [],
    });
    return HttpResponse.json({ success: true, title_id: body.title_id });
  }),
];
