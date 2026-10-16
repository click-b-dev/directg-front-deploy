// legacy inc/sub_sidebar_title.php — 단일 대표상품 설정 하위 영역의 세로 nav-pills.
// 대표상품 설정 하위 단위(상세/기본정보/제공고시/…) 공용. 미이관 페이지는 대상 경로로 anchor 렌더.

export type TitleSubNavKey =
  | "view"
  | "modify"
  | "attribute_set"
  | "grac"
  | "tag"
  | "media"
  | "screenshot"
  | "image"
  | "description"
  | "option";

type TitleSubNavProps = {
  titleId: number;
  titleCode: string;
  active: TitleSubNavKey;
};

type NavItem = {
  key: TitleSubNavKey;
  label: string;
  path: string; // 대상 라우트(.php 제거)
  icon: string;
  fw500: boolean;
};

const SETTINGS = "mdi mdi-settings-outline";

// legacy sub_sidebar_title.php 순서/아이콘/라벨 그대로. 상세보기만 fw500 없음.
const ITEMS: NavItem[] = [
  {
    key: "view",
    label: "상세보기",
    path: "/goods/title_view",
    icon: "mdi mdi-home-variant",
    fw500: false,
  },
  {
    key: "modify",
    label: "기본정보 설정",
    path: "/goods/title_modify",
    icon: "mdi mdi-account-circle",
    fw500: true,
  },
  {
    key: "attribute_set",
    label: "상품정보 제공고시 설정",
    path: "/goods/title_attribute_set_register",
    icon: "mdi mdi-account-circle",
    fw500: true,
  },
  {
    key: "grac",
    label: "심의정보 설정",
    path: "/goods/title_grac_register",
    icon: SETTINGS,
    fw500: true,
  },
  {
    key: "tag",
    label: "태그정보 설정",
    path: "/goods/title_tag_register",
    icon: SETTINGS,
    fw500: true,
  },
  {
    key: "media",
    label: "동영상 설정",
    path: "/goods/title_media_register",
    icon: SETTINGS,
    fw500: true,
  },
  {
    key: "screenshot",
    label: "스크린샷 설정",
    path: "/goods/title_screenshot_register",
    icon: SETTINGS,
    fw500: true,
  },
  {
    key: "image",
    label: "이미지 설정",
    path: "/goods/title_image_register",
    icon: SETTINGS,
    fw500: true,
  },
  {
    // 운영: 상세설명 설정은 단일 메뉴 → v2(병합) 페이지. (v1/v2 메뉴 분리 없음)
    key: "description",
    label: "상세설명 설정",
    path: "/goods/title_description_register_v2",
    icon: SETTINGS,
    fw500: true,
  },
  {
    key: "option",
    label: "관련상품 설정",
    path: "/goods/title_option_register",
    icon: SETTINGS,
    fw500: true,
  },
];

export const TitleSubNav = ({ titleId, titleCode, active }: TitleSubNavProps) => {
  // legacy: 심의정보 설정(grac)은 title_code=='33'일 때만 노출.
  const items = ITEMS.filter((item) => item.key !== "grac" || titleCode === "33");

  return (
    <div
      className="nav flex-column nav-pills bg-nav-pills mb-2"
      id="v-pills-tab"
      aria-orientation="vertical"
    >
      {items.map((item) => (
        <a
          key={item.key}
          className={`nav-link ${item.key === active ? "active" : ""} rounded-0${item.fw500 ? " fw-500" : " "}`}
          href={`${item.path}?title_id=${titleId}`}
        >
          <i className={`${item.icon} d-md-none d-block`} />
          <span className="d-none d-md-block">{item.label}</span>
        </a>
      ))}
    </div>
  );
};
