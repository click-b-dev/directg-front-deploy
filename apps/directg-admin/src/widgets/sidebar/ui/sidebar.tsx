import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "@tanstack/react-router";
import { resolveSideNav } from "../model/nav";
import "./sidebar.css";

// legacy: pc/_Admin_/inc/sidebar_*.php (docs/migration/admin/layout/sidebar.md)
// 경로 area로 트리 전환(resolveSideNav): site / goods(+steam/tag/code).
// 서브메뉴 펼침: legacy Bootstrap Collapse 클래스 흐름을 React state로 재현한다.
//   · 초기 표시: site는 markup의 `collapse show`, goods는 app.min.js가 활성 링크 부모에 붙이는 `show`.
//   · 클릭 표시: `collapsing` + inline height(0.35s) 후 `collapse show`.
//   · toggle 방식: 새 그룹이 열릴 때 기존 열린 `.side-nav .collapse.show`를 닫는 legacy accordion.
// active 하이라이트(Hyper 규칙):
//   · `.side-nav-item.menuitem-active > a` = 상위 항목/그룹 활성(흰색 + 화살표 회전)
//   · `.side-nav-second-level li.active > a` = 2차 항목 활성(흰색)
const COLLAPSE_TRANSITION_MS = 350;

type CollapsePhase = "hidden" | "showing" | "shown" | "hiding";

type SidebarCollapseProps = PropsWithChildren<{
  id: string;
  open: boolean;
}>;

const SidebarCollapse = ({ id, open, children }: SidebarCollapseProps) => {
  const collapseRef = useRef<HTMLDivElement>(null);
  const previousOpenRef = useRef(open);
  const animationFrameRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const [phase, setPhase] = useState<CollapsePhase>(open ? "shown" : "hidden");
  const [height, setHeight] = useState<string>();

  const clearPendingTransition = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  useLayoutEffect(() => {
    if (previousOpenRef.current === open) return;

    previousOpenRef.current = open;
    clearPendingTransition();

    const collapse = collapseRef.current;
    if (!collapse) {
      setPhase(open ? "shown" : "hidden");
      setHeight(undefined);
      return;
    }

    if (open) {
      setHeight("0px");
      setPhase("showing");
      return;
    }

    if (phase === "hidden") return;
    setHeight(`${collapse.scrollHeight}px`);
    setPhase("hiding");
  }, [clearPendingTransition, open, phase]);

  useLayoutEffect(() => {
    if (phase !== "showing" && phase !== "hiding") return;

    clearPendingTransition();

    const collapse = collapseRef.current;
    if (!collapse) {
      setPhase(open ? "shown" : "hidden");
      setHeight(undefined);
      return;
    }

    animationFrameRef.current = window.requestAnimationFrame(() => {
      setHeight(phase === "showing" ? `${collapse.scrollHeight}px` : "0px");
    });

    transitionTimeoutRef.current = window.setTimeout(() => {
      setPhase(phase === "showing" ? "shown" : "hidden");
      setHeight(undefined);
      transitionTimeoutRef.current = null;
      animationFrameRef.current = null;
    }, COLLAPSE_TRANSITION_MS);

    return clearPendingTransition;
  }, [clearPendingTransition, open, phase]);

  useEffect(() => clearPendingTransition, [clearPendingTransition]);

  const className =
    phase === "shown" ? "collapse show" : phase === "hidden" ? "collapse" : "collapsing";

  return (
    <div
      ref={collapseRef}
      className={className}
      id={id}
      style={phase === "showing" || phase === "hiding" ? { height } : undefined}
    >
      {children}
    </div>
  );
};

export const Sidebar = () => {
  const { pathname } = useLocation();
  const { entries, expandAll } = resolveSideNav(pathname);
  const isMatch = (match: string) => pathname === match || pathname.startsWith(`${match}/`);
  const isLeafActive = (href: string) => href !== "#" && isMatch(href);

  const defaultOpenGroupIds = useMemo(
    () =>
      entries.flatMap((entry) => {
        if (entry.type !== "group") return [];
        const groupActive = entry.children.some(
          (leaf) =>
            leaf.href !== "#" && (pathname === leaf.href || pathname.startsWith(`${leaf.href}/`)),
        );
        return expandAll || groupActive ? [entry.id] : [];
      }),
    [entries, expandAll, pathname],
  );
  const [openGroupIds, setOpenGroupIds] = useState(defaultOpenGroupIds);

  useEffect(() => {
    setOpenGroupIds(defaultOpenGroupIds);
  }, [defaultOpenGroupIds]);

  const toggleGroup = (id: string) => {
    setOpenGroupIds((prev) => (prev.includes(id) ? prev.filter((openId) => openId !== id) : [id]));
  };

  return (
    <div className="leftside-menu">
      {/* LOGO */}
      <a href="/main" className="logo text-center logo-light">
        <span className="logo-lg">
          <img src="/assets/images/H2_DG_BI_nm_160x37.png" alt="로고" />
        </span>
        <span className="logo-sm">
          <img src="/assets/images/H2_DG_BI_nm_160x37.png" alt="로고" />
        </span>
      </a>

      <div className="h-100" id="leftside-menu-container" data-simplebar>
        <ul className="side-nav">
          {entries.map((entry) => {
            if (entry.type === "link") {
              return (
                <li
                  key={entry.href}
                  className={`side-nav-item${isMatch(entry.match) ? " menuitem-active" : ""}`}
                >
                  <a href={entry.href} className="side-nav-link">
                    <i className={entry.icon} />
                    <span>{entry.label}</span>
                  </a>
                </li>
              );
            }

            const groupActive = entry.children.some((leaf) => isLeafActive(leaf.href));
            const expanded = openGroupIds.includes(entry.id);

            return (
              <li
                key={entry.id}
                className={`side-nav-item${groupActive ? " menuitem-active" : ""}`}
              >
                <a
                  data-bs-toggle="collapse"
                  href={`#${entry.id}`}
                  aria-expanded={expanded}
                  aria-controls={entry.id}
                  className={`side-nav-link${expanded ? "" : " collapsed"}`}
                  onClick={(event) => {
                    event.preventDefault();
                    toggleGroup(entry.id);
                  }}
                >
                  <i className={entry.icon} />
                  <span>{entry.label}</span>
                  <span className="menu-arrow" />
                </a>
                <SidebarCollapse id={entry.id} open={expanded}>
                  <ul className="side-nav-second-level">
                    {entry.children.map((leaf) => (
                      <li
                        key={leaf.label}
                        className={isLeafActive(leaf.href) ? "active" : undefined}
                      >
                        <a href={leaf.href}>{leaf.label}</a>
                      </li>
                    ))}
                  </ul>
                </SidebarCollapse>
              </li>
            );
          })}
        </ul>

        <div className="clearfix" />
      </div>
    </div>
  );
};
