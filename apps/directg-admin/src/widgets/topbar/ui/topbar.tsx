import { useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { adminLogout } from "@entities/admin-auth";
import { useAuthSession } from "@shared/lib/auth/provider";
import { PRODUCT_VIEWER_MENU, TOP_MENU_ITEMS, resolveActiveKey } from "../model/menu";
import "./topbar.css";

// legacy: pc/_Admin_/inc/topbar.php (사이드바 레이아웃) + pc/_Admin_/main.php 인라인 topbar(topnav)
// docs/migration/admin/layout/topbar.md
type TopbarVariant = "sidebar" | "topnav";

export const Topbar = ({ variant = "sidebar" }: { variant?: TopbarVariant }) => {
  const { session, setSession } = useAuthSession();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isTopnav = variant === "topnav";

  // legacy: admin_level=="1" → product_viewer(상품 1개), 그 외 12개 메뉴
  const isProductViewer = session?.user?.role === "1";
  const items = isProductViewer ? PRODUCT_VIEWER_MENU : TOP_MENU_ITEMS;
  const activeKey = resolveActiveKey(pathname, items);
  const adminName = session?.user?.name ?? "";
  const adminLevel = session?.user?.role ?? "";

  const handleLogout = async () => {
    // legacy logout.php: session_destroy 후 로그인으로. 엔드포인트 실패해도 세션은 파기.
    try {
      await adminLogout();
    } catch {
      // 로컬 세션은 항상 파기
    }
    setSession(null);
    void navigate({ to: "/login" });
  };

  const menuList = (
    <ul
      className={
        isTopnav
          ? "nav nav-pills col-9 justify-content-start"
          : "nav nav-pills col-12 col-lg-auto me-lg-auto justify-content-start border border-secondary mh-100"
      }
      id="topmenu"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isActive = activeKey === item.key;
        return (
          <li key={item.key} className={`nav-item${isLast ? "" : " border-end border-secondary"}`}>
            <a href={item.href} className={`nav-link px-2 rounded-0${isActive ? " active" : ""}`}>
              <div className="d-flex flex-column text-center">
                <i className={`${item.icon} font-22`} />
                <span>{item.label}</span>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );

  const dropdownItems = (
    // Bootstrap JS(Popper) 미로드 → 우측 정렬 규칙(.dropdown-menu-end[data-bs-popper])이 안 걸림.
    // JS가 열 때 붙이는 data-bs-popper를 정적으로 부여해 top:100%/right:0(end) 위치를 재현.
    <div
      data-bs-popper="static"
      className={`dropdown-menu dropdown-menu-end dropdown-menu-animated topbar-dropdown-menu profile-dropdown${
        menuOpen ? " show" : ""
      }`}
    >
      {/* legacy: 상단 항목은 javascript:void(0) no-op */}
      <a href="#" className="dropdown-item notify-item" onClick={(event) => event.preventDefault()}>
        <i className="mdi mdi-account-circle me-1" />
        <span>프로필 관리</span>
      </a>
      <a href="#" className="dropdown-item notify-item" onClick={(event) => event.preventDefault()}>
        <i className="mdi mdi-account-edit me-1" />
        <span>설정</span>
      </a>
      <a href="#" className="dropdown-item notify-item" onClick={(event) => event.preventDefault()}>
        <i className="mdi mdi-lifebuoy me-1" />
        <span>활동이력</span>
      </a>
      {/* legacy main.php 전용: 화면잠금(no-op) */}
      {isTopnav ? (
        <a
          href="#"
          className="dropdown-item notify-item"
          onClick={(event) => event.preventDefault()}
        >
          <i className="mdi mdi-lock-outline me-1" />
          <span>화면잠금</span>
        </a>
      ) : null}
      {/* legacy: 로그아웃 → logout.php. SPA는 adminLogout + 세션 파기 후 /login */}
      <button type="button" className="dropdown-item notify-item" onClick={handleLogout}>
        <i className="mdi mdi-logout me-1" />
        <span>로그아웃</span>
      </button>
    </div>
  );

  // topnav 레이아웃(main.php): 로고 + nav-user 텍스트 프로필
  if (isTopnav) {
    return (
      <div className="navbar-custom topnav-navbar topnav-navbar-dark">
        <div className="container-fluid">
          <div className="d-flex flex-row">
            <div className="px-0 text-center">
              <a href="/main" className="topnav-logo">
                <span className="topnav-logo-lg">
                  <img src="/assets/images/logo/H2_DG_BI_nm_194x45_v2.png" alt="" />
                </span>
                <span className="topnav-logo-sm">
                  <img src="/assets/images/logo/H2_DG_BI_nm_194x45_v2.png" alt="" />
                </span>
              </a>
            </div>

            {menuList}

            <div className={`dropdown float-end col-1${menuOpen ? " show" : ""}`}>
              <a
                className="nav-link dropdown-toggle nav-user arrow-none me-0"
                href="#"
                role="button"
                aria-haspopup="true"
                aria-expanded={menuOpen}
                onClick={(event) => {
                  event.preventDefault();
                  setMenuOpen((open) => !open);
                }}
              >
                <span className="account-user-name">{adminName}</span>({adminLevel})
              </a>
              {dropdownItems}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 사이드바 레이아웃(inc/topbar.php): 로고 없음 + 아바타 원형 프로필
  return (
    <div className="navbar-custom px-2">
      <header className="p-0">
        <div className="container-fluid">
          <div className="d-flex flex-wrap align-items-center justify-content-start justify-content-lg-start">
            {menuList}

            <div className={`dropdown text-end${menuOpen ? " show" : ""}`}>
              <a
                className="nav-link dropdown-toggle arrow-none me-0"
                href="#"
                role="button"
                aria-haspopup="true"
                aria-expanded={menuOpen}
                onClick={(event) => {
                  event.preventDefault();
                  setMenuOpen((open) => !open);
                }}
              >
                <div className="avatar-md">
                  <span className="avatar-title bg-success rounded-circle">{adminName}</span>
                </div>
              </a>
              {dropdownItems}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};
