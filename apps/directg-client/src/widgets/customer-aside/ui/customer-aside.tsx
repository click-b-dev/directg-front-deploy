import { SiteAside, type AsideMenuItem } from "@widgets/site-aside";

/** 고객지원 aside active 키 (legacy `$aside_menu[key]`). 자료실은 legacy 주석처리라 미포함. */
export type CustomerAsideKey = "faq" | "qna";

/** legacy `pc/inc/aside_customer.html` 항목. 라벨 "- " 프리픽스까지 원문 유지. */
const CUSTOMER_ASIDE_ITEMS: { key: CustomerAsideKey; label: string; href: string }[] = [
  { key: "faq", label: "- 자주묻는질문", href: "/board/faq" },
  { key: "qna", label: "- 문의하기", href: "/mypage/mypage_qna_register" },
];

/**
 * 고객지원 공통 aside (legacy `pc/inc/aside_customer.html`).
 * `widgets/site-aside` 셸에 고객지원 메뉴를 채운다. 자료실 항목은 legacy 주석처리 → 미포함.
 */
export function CustomerAside({ active }: { active: CustomerAsideKey }) {
  const items: AsideMenuItem[] = CUSTOMER_ASIDE_ITEMS.map((item) => ({
    label: item.label,
    href: item.href,
    active: item.key === active,
  }));

  return <SiteAside title="고객지원" items={items} />;
}
