import type { PropsWithChildren } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAuthSession } from "@shared/lib/auth/provider";
import logo from "@/renewal/assets/logo-horizontal.png";
import iconBellDot from "@/renewal/assets/icon-bell-dot.svg";
import iconDot from "@/renewal/assets/icon-dot.svg";
import iconProfile from "@/renewal/assets/icon-profile.svg";
import { cx } from "@/renewal/shared/lib/cx";
import { Button } from "@/renewal/shared/ui";
import { ACTIVE_TOP_MENU, SIDE_MENU, TOP_MENU, UTILITY_BUTTONS } from "../model/nav";

// Figma GNB — Tab/Item: h80 · p16 · 활성 = 하단 4px brand 선 + Medium primary / 비활성 = Regular secondary
const TAB =
  "rn:flex rn:h-80 rn:shrink-0 rn:items-center rn:justify-center rn:p-16 rn:text-body2 rn:whitespace-nowrap";

const GlobalNav = () => {
  const { session } = useAuthSession();
  const accountName = session?.user?.name ?? "";

  return (
    <header className="rn:flex rn:items-center rn:justify-between rn:gap-24 rn:bg-surface rn:px-24">
      <nav aria-label="주 메뉴" className="rn:flex rn:min-w-0 rn:items-center rn:overflow-x-auto">
        {TOP_MENU.map((item) => {
          const active = item.label === ACTIVE_TOP_MENU;
          const className = cx(
            TAB,
            active
              ? "rn:border-b-4 rn:border-solid rn:border-brand rn:font-medium rn:text-ink"
              : "rn:font-regular rn:text-ink-2",
          );
          return item.to ? (
            <Link key={item.label} to={item.to} className={className}>
              {item.label}
            </Link>
          ) : (
            <span key={item.label} className={className}>
              {item.label}
            </span>
          );
        })}
      </nav>
      <div className="rn:flex rn:shrink-0 rn:items-center rn:gap-20">
        <div className="rn:relative rn:flex rn:items-center rn:gap-6">
          {UTILITY_BUTTONS.map((label) => (
            <Button key={label} tone="inverse" variant="outline" size="S">
              {label}
            </Button>
          ))}
          <Button tone="inverse" variant="outline" size="S" aria-label="알림" iconOnly>
            <img src={iconBellDot} alt="" width={20} height={20} />
          </Button>
          <img
            src={iconDot}
            alt=""
            width={4}
            height={4}
            className="rn:pointer-events-none rn:absolute rn:top-8 rn:left-64"
          />
        </div>
        <span aria-hidden="true" className="rn:h-28 rn:w-2 rn:bg-sub" />
        <div className="rn:flex rn:items-center rn:gap-8">
          <img src={iconProfile} alt="" width={32} height={32} />
          <span className="rn:text-body3 rn:whitespace-nowrap rn:text-ink-2">{accountName}</span>
        </div>
      </div>
    </header>
  );
};

// Figma SNB: w250 · p24 · 로고 160×37 · 메뉴 그룹 라벨(detail) + 아이템(h36, radius 8)
const SideNav = () => {
  const { pathname } = useLocation();
  return (
    <aside className="rn:flex rn:w-250 rn:shrink-0 rn:flex-col rn:gap-60 rn:bg-surface rn:p-24">
      <img src={logo} alt="DIRECT G." width={160} height={37} />
      <nav aria-label="보조 메뉴" className="rn:flex rn:flex-col rn:gap-24">
        {SIDE_MENU.map((group) => (
          <div key={group.label} className="rn:flex rn:flex-col rn:gap-6">
            <p className="rn:text-detail rn:font-medium rn:text-ink-2">{group.label}</p>
            <ul className="rn:flex rn:flex-col rn:gap-4">
              {group.items.map((item) => {
                const prefix = item.activePrefix ?? item.to;
                const active = prefix !== undefined && pathname.startsWith(prefix);
                const className = cx(
                  "rn:flex rn:h-36 rn:items-center rn:rounded-8 rn:text-body2",
                  active ? "rn:font-semibold rn:text-brand" : "rn:font-regular rn:text-ink",
                );
                return (
                  <li key={item.label}>
                    {item.to ? (
                      <Link
                        to={item.to}
                        className={className}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className={className}>{item.label}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export const RenewalLayout = ({ children }: PropsWithChildren) => (
  <div className="rn-root rn:flex">
    <SideNav />
    <div className="rn:flex rn:min-w-0 rn:flex-1 rn:flex-col rn:gap-24">
      <GlobalNav />
      <main className="rn:px-20 rn:pb-32">{children}</main>
    </div>
  </div>
);
