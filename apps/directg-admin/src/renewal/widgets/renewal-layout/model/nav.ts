// Figma `회원_회원내역` GNB(Tab) / SNB. `to`가 없는 항목은 아직 리뉴얼 라우트가 없는 메뉴다.
export type NavItem = {
  label: string;
  to?: "/renewal/member/list" | "/renewal/member/grade";
  /** 이 접두사로 시작하는 경로에서도 활성으로 표시한다(상세 화면 등). */
  activePrefixes?: string[];
};

export const TOP_MENU: NavItem[] = [
  { label: "대시보드" },
  { label: "회원", to: "/renewal/member/list" },
  { label: "운영자" },
  { label: "상품" },
  { label: "재고" },
  { label: "주문/배송" },
  { label: "혜택" },
  { label: "파트너" },
  { label: "운영" },
  { label: "고객지원" },
];

export const ACTIVE_TOP_MENU = "회원";

export const UTILITY_BUTTONS = ["승인관리", "연동관리"];

export type SideMenuGroup = { label: string; items: NavItem[] };

export const SIDE_MENU: SideMenuGroup[] = [
  {
    label: "회원",
    items: [
      {
        label: "회원 내역",
        to: "/renewal/member/list",
        activePrefixes: ["/renewal/member/list", "/renewal/member/detail"],
      },
      { label: "회원 등급 설정", to: "/renewal/member/grade" },
    ],
  },
];
