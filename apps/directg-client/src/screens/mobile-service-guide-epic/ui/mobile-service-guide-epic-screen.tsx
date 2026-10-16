import { MobileSubHeader } from "@widgets/mobile-sub-header";

/**
 * 모바일 Epic Games 이용안내 허브 (legacy `mobile/service/guide_epic.html`).
 * listview로 step1~5 링크. bottom_menu/sidebar는 layout chrome(표시).
 * legacy는 `.section-title`(Steam 허브의 `.listview-title`과 다름)·`#appCapsuleSub.mt-0.full-height`.
 */
export function MobileServiceGuideEpicScreen() {
  return (
    <>
      <MobileSubHeader pageTitle="Epic Games 이용안내" />
      <div id="appCapsuleSub" className="mt-0 full-height">
        <div className="section full mt-2">
          <div className="section-title">Epic Games</div>
          <ul className="listview link-listview">
            <li>
              <a href="/service/guide_epic_step1">제품 키 확인 및 활성화</a>
            </li>
            <li>
              <a href="/service/guide_epic_step2">가입 및 계정만들기</a>
            </li>
            <li>
              <a href="/service/guide_epic_step3">클라이언트 설치하기</a>
            </li>
            <li>
              <a href="/service/guide_epic_step4">라이브러리 게임 등록 및 플레이</a>
            </li>
            <li>
              <a href="/service/guide_epic_step5">등록 불가 상황 대처법</a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
