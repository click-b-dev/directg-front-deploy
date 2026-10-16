import { MobileSubHeader } from "@widgets/mobile-sub-header";

/**
 * 모바일 Steam 이용안내 허브 (legacy `mobile/service/guide_steam.html`).
 * listview로 step1~5 링크. bottom_menu/sidebar는 layout chrome(표시).
 * 일반 허브와 달리 `#appCapsuleSub`에 full-height 없음, dead 캐러셀 스크립트 없음.
 */
export function MobileServiceGuideSteamScreen() {
  return (
    <>
      <MobileSubHeader pageTitle="Steam 이용안내" />
      <div id="appCapsuleSub" className="mt-0">
        <div className="section full mt-2">
          <div className="listview-title mt-2 fs-5">Steam</div>
          <ul className="listview link-listview">
            <li>
              <a href="/service/guide_steam_step1">제품 키 확인 및 활성화</a>
            </li>
            <li>
              <a href="/service/guide_steam_step2">가입 및 계정만들기</a>
            </li>
            <li>
              <a href="/service/guide_steam_step3">클라이언트 설치하기</a>
            </li>
            <li>
              <a href="/service/guide_steam_step4">라이브러리 게임 등록 및 플레이</a>
            </li>
            <li>
              <a href="/service/guide_steam_step5">코드 중복 입력 대처법</a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
