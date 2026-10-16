import { SiteAside, type AsideMenuItem } from "@widgets/site-aside";

/** 이용안내 aside active 키 (legacy `$aside_menu[key]`). 홀로모델은 active 없음. */
export type ServiceAsideKey = "guide" | "guide_steam" | "guide_epic" | "guide_rockstar";

/** legacy `pc/inc/aside_service.html` 항목. 라벨 "- " 프리픽스까지 원문 유지. */
const SERVICE_ASIDE_ITEMS: {
  key?: ServiceAsideKey;
  label: string;
  href: string;
  external?: boolean;
}[] = [
  { key: "guide", label: "- 다이렉트 게임즈", href: "/service/guide" },
  { key: "guide_steam", label: "- 스팀", href: "/service/guide_steam" },
  { key: "guide_epic", label: "- 에픽 게임즈", href: "/service/guide_epic" },
  { key: "guide_rockstar", label: "- 락스타 게임즈", href: "/service/guide_rockstar" },
  {
    label: "- 홀로 모델",
    href: "https://xr-marketplace.com/ko/holomodels/play/ar",
    external: true,
  },
];

/**
 * 이용안내 공통 aside (legacy `pc/inc/aside_service.html`).
 * `widgets/site-aside` 셸에 service 메뉴를 채운다. 각 페이지가 active 항목을 지정.
 */
export function ServiceAside({ active }: { active: ServiceAsideKey }) {
  const items: AsideMenuItem[] = SERVICE_ASIDE_ITEMS.map((item) => ({
    label: item.label,
    href: item.href,
    external: item.external,
    active: item.key !== undefined && item.key === active,
  }));

  return <SiteAside title="이용안내" items={items} />;
}
