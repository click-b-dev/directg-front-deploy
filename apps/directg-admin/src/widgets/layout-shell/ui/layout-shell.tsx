import type { PropsWithChildren } from "react";
import { useLocation } from "@tanstack/react-router";
import { Sidebar } from "@widgets/sidebar";
import { Topbar } from "@widgets/topbar";
import { Footer } from "@widgets/footer";
import { isPublicPath } from "@shared/lib/route-guard";
import { isTopnavPath } from "@shared/lib/layout";

type LayoutShellProps = PropsWithChildren;

export const LayoutShell = ({ children }: LayoutShellProps) => {
  const { pathname } = useLocation();

  // legacy: 로그인 등 인증 화면(authentication-bg)은 사이드바/topbar 없는 독립 레이아웃.
  if (isPublicPath(pathname)) {
    return <>{children}</>;
  }

  // legacy main.php: 사이드바 없는 topnav 레이아웃.
  // `.navbar-custom.topnav-navbar`(position:relative;left:0, in-flow 전폭) +
  // `.content-page.ms-0.pt-0`(margin-left:0, padding-top:0). data-layout 속성 없음(legacy 동일).
  if (isTopnavPath(pathname)) {
    return (
      <>
        <Topbar variant="topnav" />
        <div className="wrapper">
          <div className="content-page ms-0 pt-0">
            <div className="content">
              <div className="container-fluid">{children}</div>
            </div>
          </div>
        </div>
        {/* footer는 .wrapper 밖(공통 패턴 banner_list). main.php는 wrapper 안이지만
            .wrapper{overflow:hidden}에 클리핑되므로 공통 패턴을 따른다. */}
        <Footer />
      </>
    );
  }

  // legacy 사이드바 페이지(banner_list.php) 조립 구조 그대로:
  //   .wrapper > [sidebar + topbar(admin_body_start)] + .content-page > .content > .container-fluid
  //   footer는 .wrapper 밖(admin_body_end).
  return (
    <>
      <div className="wrapper">
        <Sidebar />
        <Topbar />
        <div className="content-page">
          <div className="content">
            <div className="container-fluid">{children}</div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
