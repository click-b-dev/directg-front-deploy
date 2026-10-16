import { MobileSubHeader } from "@widgets/mobile-sub-header";
import { MobileAppSearch } from "@widgets/mobile-app-search";

import { MobileServiceMastheadBg } from "./mobile-service-masthead-bg";
import { MobileServiceBenefitCarousel } from "./mobile-service-benefit-carousel";

/**
 * legacy `$publisher_array` (code=>name) — 배열 순서 verbatim.
 * 중복 키 "53"(Aspyr, Atari) → PHP 후자 우선 규칙대로 Map으로 dedup(Atari만 남고 Aspyr 탈락).
 */
const PUBLISHER_ENTRIES: [string, string][] = [
  ["90", "WiredProductions"],
  ["135", "10Chambers"],
  ["11", "11bitstudios"],
  ["71", "1COnlineGamesLtd"],
  ["12", "2K"],
  ["85", "34BigThingssrl"],
  ["46", "505Games"],
  ["70", "AmanitaDesign"],
  ["47", "ArcSystemWorks"],
  ["53", "Aspyr"],
  ["62", "Badland"],
  ["133", "BehaviourInteractive"],
  ["38", "BethesdaSoftworks"],
  ["34", "Capcom"],
  ["66", "CFK"],
  ["1", "Cigames"],
  ["114", "CITYCONNECTION"],
  ["132", "CloudedLeopard"],
  ["87", "CurveGames"],
  ["73", "D3PUBLISHER"],
  ["59", "DefiantDevelopment"],
  ["115", "Digicon"],
  ["96", "Dotemu"],
  ["22", "Focus"],
  ["81", "Funcom"],
  ["163", "Gearbox"],
  ["140", "Graffiti-Games"],
  ["43", "GreyBox"],
  ["48", "Haemimont"],
  ["88", "HandyGames"],
  ["154", "HatinhInteractive"],
  ["98", "HeadupGmbH"],
  ["136", "HitGrab"],
  ["99", "IcebergInteractive"],
  ["40", "InXileEntertainment"],
  ["6", "KalypsoMedia"],
  ["75", "Konami"],
  ["49", "LeagueofGeeks"],
  ["45", "LevelUpLabs"],
  ["126", "Lightning"],
  ["120", "Mantisco"],
  ["143", "MapleWhispering"],
  ["130", "Merge"],
  ["63", "Microids"],
  ["91", "Milestone"],
  ["109", "MIXTVISION"],
  ["100", "Modus"],
  ["84", "Nacon"],
  ["117", "NEOWIZ"],
  ["72", "NISAmerica"],
  ["30", "Paradox"],
  ["119", "Pieplus"],
  ["25", "PlugInDigital"],
  ["78", "PridefulSloth"],
  ["86", "PrivateDivision"],
  ["134", "RedHookStudio"],
  ["14", "Rockstar"],
  ["97", "SamuraiPunk"],
  ["93", "SEGA"],
  ["89", "Shiro"],
  ["74", "SNK"],
  ["58", "Team17"],
  ["23", "THQNordic"],
  ["52", "Ubisoft"],
  ["128", "UnitedLabel"],
  ["80", "Versus"],
  ["3", "WarnerBros"],
  ["112", "WayForward"],
  ["53", "Atari"],
];

/** dedup(후자 우선) 후 이름 오름차순(ASCII strcmp = JS 문자열 비교). */
const PUBLISHERS = [...new Map(PUBLISHER_ENTRIES.map(([c, n]) => [c, n])).values()].sort((a, b) =>
  a < b ? -1 : a > b ? 1 : 0,
);

/**
 * 모바일 서비스소개 (legacy `mobile/service/service.html`).
 * sub_header(검색+장바구니) + 마스트헤드 + progressbar + 혜택 Splide 캐러셀 + 퍼블리셔 그리드.
 * 퍼블리셔 링크는 legacy가 계산만 하고 미출력 → img만 렌더(alt/title=name, ?3 버전쿼리 유지).
 */
export function MobileServiceIntroScreen() {
  return (
    <>
      <MobileSubHeader pageTitle="서비스 소개" />
      <div id="appCapsuleSub" className="full-height">
        <div className="section full">
          <div className="ja-masthead">
            <MobileServiceMastheadBg>
              <div className="flex-container">
                <div className="flex-item">
                  <h3 className="ja-masthead-title">
                    실시간 엔터테인먼트 플랫폼 <br /> 다이렉트 게임즈에 오신 것을 환영합니다!
                  </h3>
                </div>
                <div className="flex-item">
                  <div className="bg_tag">
                    <span className="tag_color">#상시할인</span>
                    <span className="tag_color">#정기프로모션</span>
                    <span className="tag_color">#실시간코드확인</span>
                    <span className="tag_color">#정식라이센스</span>
                  </div>
                </div>
                <div className="flex-item">
                  <div className="ja-masthead-description">
                    <div className="flex_item2">
                      <img src="/mobile-assets/images/service/00-00_h2intlogo_v2.png" />
                    </div>
                    <div className="flex_item2">
                      <p>
                        다이렉트 게임즈는 에이치투 인터렉티브에서 운영하는 공식 디지털 스토어입니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </MobileServiceMastheadBg>
          </div>
          <section className="content">
            <h3>보다 믿을 수 있는 서비스 제공을 약속합니다.</h3>
            <div className="section_content">
              <div className="progressbar-wrapper">
                <ul className="progressbar">
                  <li></li>
                  <li className="active"></li>
                  <li></li>
                </ul>
              </div>
              <p
                style={{
                  lineHeight: "150%",
                  fontSize: "0.875em",
                  fontFamily: "'Noto Sans KR', sans-serif",
                }}
              >
                다이렉트 게임즈는 세계 유수의 개발사 및 퍼블리셔와 직접 제휴하여 자체 유통 마진은
                최소화하면서도 양질의 상품들을 좀 더 합리적인 가치로써 제공하고 있습니다. 또한,
                회원분들의 다양한 피드백을 전달하여 직접적인 상호작용과 원활한 소통을 이어가고
                있습니다.
              </p>
            </div>
          </section>
          <section className="content">
            <h3>다이렉트 게임즈 회원만의 혜택이 기다립니다.</h3>
            <MobileServiceBenefitCarousel />
          </section>

          <section className="content">
            <h3>세계 유수의 파트너들이 함께합니다.</h3>
            <div className="section_content">
              <div className="section_container2">
                {PUBLISHERS.map((name) => (
                  <div className="section_item3" key={name}>
                    <img
                      src={`/mobile-assets/images/service/v4/${name}_partners_contents_0.png?3`}
                      alt={name}
                      title={name}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
      <MobileAppSearch />
    </>
  );
}
