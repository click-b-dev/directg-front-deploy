import { MobileSubHeader } from "@widgets/mobile-sub-header";

/**
 * 모바일 RockStar Games 이용안내 허브 (legacy `mobile/service/guide_rockstar.html`).
 * listview로 step1~4 링크. bottom_menu/sidebar는 layout chrome(표시).
 * legacy: `.section-title`·`#appCapsuleSub.mt-0.full-height`(Epic 허브와 동형). title "RockStar Games"(대문자 S).
 */
export function MobileServiceGuideRockstarScreen() {
  return (
    <>
      <MobileSubHeader pageTitle="RockStar Games 이용안내" />
      <div id="appCapsuleSub" className="mt-0 full-height">
        <div className="section full mt-2">
          <div className="section-title">RockStar Games</div>
          <ul className="listview link-listview">
            <li>
              <a href="/service/guide_rockstar_step1">제품 키 확인 및 활성화</a>
            </li>
            <li>
              <a href="/service/guide_rockstar_step2">가입 및 계정만들기</a>
            </li>
            <li>
              <a href="/service/guide_rockstar_step3">클라이언트 설치하기</a>
            </li>
            <li>
              <a href="/service/guide_rockstar_step4">라이브러리 게임 등록 및 플레이</a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
