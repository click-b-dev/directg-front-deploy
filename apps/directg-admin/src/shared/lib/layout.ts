// legacy 관리자 레이아웃 모드.
// - 대부분의 콘텐츠 페이지(328개): 좌측 사이드바(leftside-menu) 레이아웃.
// - 대시보드(main.php): 사이드바 없는 topnav 레이아웃(로고를 topbar에).
//
// legacy main.php는 body에 data-layout 속성을 두지 않는다. topnav 레이아웃은
// `.navbar-custom.topnav-navbar`(=position:relative;left:0, in-flow 전폭) + content
// `.content-page.ms-0.pt-0`(margin-left:0, padding-top:0) 유틸 클래스로만 구성된다.
// 따라서 우리도 별도 body 속성 없이 라우트로만 레이아웃을 분기한다.

const TOPNAV_PATHS = ["/main"];

export const isTopnavPath = (pathname: string) =>
  TOPNAV_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
