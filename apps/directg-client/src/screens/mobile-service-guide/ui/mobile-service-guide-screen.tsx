import { MobileSubHeader } from "@widgets/mobile-sub-header";

/**
 * 모바일 이용안내 허브 (legacy `mobile/service/guide.html`).
 * listview로 회원가입/구매방법 step 페이지 링크. bottom_menu/sidebar는 layout chrome(표시).
 * (legacy 말미 `#carousel-slider2` Splide 스크립트는 해당 요소 부재 → dead, 미이식.)
 */
export function MobileServiceGuideScreen() {
  return (
    <>
      <MobileSubHeader pageTitle="다이렉트 게임즈 이용안내" />
      <div id="appCapsuleSub" className="mt-0 full-height">
        <div className="section full mt-2">
          <div className="listview-title mt-2 fs-5">다이렉트 게임즈</div>
          <ul className="listview link-listview">
            <li>
              <a href="/service/guide_step1">회원가입</a>
            </li>
            <li>
              <a href="/service/guide_step2">구매방법</a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
