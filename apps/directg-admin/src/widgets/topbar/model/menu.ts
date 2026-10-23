// legacy _Admin_/inc/topbar.php 메뉴 — 순서·라벨·링크·아이콘 그대로.
// href는 legacy URL 구조에서 `.php`만 제거(미이관 페이지는 이관되며 라우트 생성).
// match는 active 산출용 접두(최장 매칭). 제휴(jehu)는 legacy에서 주석 처리 → 미포함.

export type TopMenuItem = {
  key: string;
  label: string;
  href: string;
  match: string;
  /** match 외에 같은 메뉴로 취급할 접두(재고 사이드바 area와 동일). */
  alsoMatch?: readonly string[];
  icon: string;
};

export const TOP_MENU_ITEMS: readonly TopMenuItem[] = [
  { key: "dashboard", label: "대시보드", href: "/main", match: "/main", icon: "uil uil-dashboard" },
  {
    key: "site",
    label: "사이트",
    href: "/site/banner_list",
    match: "/site",
    icon: "dripicons-gear noti-icon",
  },
  {
    key: "goods",
    label: "상품",
    href: "/goods/dashboard_goods",
    match: "/goods",
    icon: "uil-store",
  },
  {
    key: "stock",
    label: "재고",
    href: "/goods/stock/dashboard_stock",
    match: "/goods/stock",
    // 사이드바 stock area(/goods/stock·/goods/asset)와 동일 — Asset 서버 관리 화면도 재고 탭 활성.
    alsoMatch: ["/goods/asset"],
    icon: "mdi mdi-warehouse",
  },
  {
    key: "member",
    label: "회원",
    href: "/member/dashboard_crm",
    match: "/member",
    icon: "dripicons-user",
  },
  {
    key: "order",
    label: "주문",
    href: "/order/dashboard_order",
    match: "/order",
    icon: "uil uil-notes",
  },
  {
    key: "promotion",
    label: "프로모션",
    href: "/promotion/dashboard_promotion",
    match: "/promotion",
    icon: "uil-calender",
  },
  {
    key: "event",
    label: "이벤트",
    href: "/event/event_board_list",
    match: "/event",
    icon: "uil uil-document",
  },
  {
    key: "board",
    label: "게시판",
    href: "/board/dashboard_board",
    match: "/board",
    icon: "uil uil-document",
  },
  {
    key: "statistics",
    label: "통계",
    href: "/statistics/order/order_day_count",
    match: "/statistics",
    icon: "uil-chart",
  },
  {
    key: "china",
    label: "중국결제",
    href: "/china/invoice_list",
    match: "/china",
    icon: "uil uil-invoice",
  },
  {
    key: "partner",
    label: "파트너",
    href: "/partner/partner_list",
    match: "/partner",
    icon: "dripicons-article",
  },
];

// legacy product_viewer(admin_level=="1") — 상품 1개만.
export const PRODUCT_VIEWER_MENU: readonly TopMenuItem[] = [
  {
    key: "goods",
    label: "상품",
    href: "/goods/dashboard_goods",
    match: "/goods",
    icon: "uil-store",
  },
];

/** 현재 경로에 대한 active 메뉴 key(최장 접두 매칭). 없으면 null. */
export const resolveActiveKey = (
  pathname: string,
  items: readonly TopMenuItem[],
): string | null => {
  let bestKey: string | null = null;
  let bestLen = -1;
  for (const item of items) {
    for (const prefix of [item.match, ...(item.alsoMatch ?? [])]) {
      const matched = pathname === prefix || pathname.startsWith(`${prefix}/`);
      if (matched && prefix.length > bestLen) {
        bestKey = item.key;
        bestLen = prefix.length;
      }
    }
  }
  return bestKey;
};
