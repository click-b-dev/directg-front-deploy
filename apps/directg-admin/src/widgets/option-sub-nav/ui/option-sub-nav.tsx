// legacy inc/sub_sidebar_option.php — 단일 옵션상품 설정 하위 영역의 세로 nav-pills.
// 옵션상품 하위 단위(상세/기본정보/장르/카테고리/이미지/…) 공용. 미이관 페이지는 대상 경로로 anchor 렌더.

export type OptionSubNavKey =
  | "view"
  | "modify"
  | "genre"
  | "category"
  | "image"
  | "screenshot"
  | "sales"
  | "description"
  | "package"
  | "tag"
  | "repay";

type OptionSubNavProps = {
  productCode: string;
  active: OptionSubNavKey;
  gameType: string; // 스크린샷 설정 노출 판정(dlc | accessories)
};

type NavItem = {
  key: OptionSubNavKey;
  label: string;
  path: string; // 대상 라우트(.php 제거)
  icon: string;
};

const HOME = "mdi mdi-home-variant";
const CIRCLE = "mdi mdi-account-circle";

// legacy sub_sidebar_option.php 순서/아이콘/라벨 그대로. 전 항목 fw-500. 상세보기만 home 아이콘.
const ITEMS: NavItem[] = [
  { key: "view", label: "상세보기", path: "/goods/goods_option_view", icon: HOME },
  { key: "modify", label: "기본정보 설정", path: "/goods/goods_option_modify", icon: CIRCLE },
  { key: "genre", label: "장르 설정", path: "/goods/goods_option_genre_register", icon: CIRCLE },
  {
    key: "category",
    label: "카테고리 설정",
    path: "/goods/goods_option_category_register",
    icon: CIRCLE,
  },
  { key: "image", label: "이미지 설정", path: "/goods/goods_option_image_register", icon: CIRCLE },
  {
    key: "screenshot",
    label: "옵션상품 스크린샷 설정",
    path: "/goods/goods_option_screenshot_register",
    icon: CIRCLE,
  },
  { key: "sales", label: "판매 설정", path: "/goods/goods_option_sales_register", icon: CIRCLE },
  {
    // 운영 대조: v1/v2 메뉴 통합 — 단일 "상세설명 설정"이 v2(병합) 라우트로 연결.
    key: "description",
    label: "상세설명 설정",
    path: "/goods/goods_option_description_register_v2",
    icon: CIRCLE,
  },
  {
    key: "package",
    label: "구성정보 설정",
    path: "/goods/goods_option_package_register",
    icon: CIRCLE,
  },
  { key: "tag", label: "태그 설정", path: "/goods/goods_option_tag_register", icon: CIRCLE },
  { key: "repay", label: "포인트 설정", path: "/goods/goods_option_repay_register", icon: CIRCLE },
];

export const OptionSubNav = ({ productCode, active, gameType }: OptionSubNavProps) => {
  // legacy: 스크린샷 설정은 game_type이 dlc 또는 accessories일 때만 노출.
  const items = ITEMS.filter(
    (item) => item.key !== "screenshot" || gameType === "dlc" || gameType === "accessories",
  );

  return (
    <div
      className="nav flex-column nav-pills bg-nav-pills mb-2"
      id="v-pills-tab"
      aria-orientation="vertical"
    >
      {items.map((item) => (
        <a
          key={item.key}
          className={`nav-link ${item.key === active ? "active" : ""} rounded-0 fw-500`}
          href={`${item.path}?product_code=${productCode}`}
        >
          <i className={`${item.icon} d-md-none d-block`} />
          <span className="d-none d-md-block">{item.label}</span>
        </a>
      ))}
    </div>
  );
};
