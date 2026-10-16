import type { ReactNode } from "react";

/** step1 이미지 CDN 베이스(legacy 복붙 버그: 구 경로 `upload/guide`, 파일도 일부 epic). */
const IMG_OLD = "https://directg.diskn.com/upload/guide";
/** step2~4 이미지 CDN 베이스(정상 경로). */
const IMG = "https://directg.diskn.com/upload/ezwel/guide/mobile";

/** 한 step 페이지 구성 — legacy `guide_rockstar_stepN.html`. */
export interface RockstarGuideStep {
  /** 커스텀 헤더 className(step1은 mt-0 없음, step2~4 mt-0). */
  headerClassName: string;
  /** 헤더 pageTitle(대부분 허브 링크 라벨과 불일치 — legacy 복붙 verbatim). */
  pageTitle: string;
  /** `#appCapsule` className(step1은 없음=undefined, step2~4 "mt-0"). */
  capsuleClassName?: string;
  /** 닫기 href(step2만 `/service/guide_epic.html` 복붙 버그, 그 외 guide_rockstar.html). */
  closeHref: string;
  /** footer 버튼 추가 클래스(step1만 "btn-lg"). */
  footerButtonClassName?: string;
  /** footer 게임 버튼 라벨(step1 "Rockstar  목록"(공백2)·step2 "Rockstar 목록"·step3/4 "락스타 게임즈 목록"). */
  gameLabel: string;
  /** 라우트 metadata(title/description/keywords) — step1 "Rock Games" 오타·step4 "Epic Games" 복붙 verbatim. */
  meta: { title: string; description: string; keywords: string };
  /** 캐러셀 슬라이드(`li.splide__slide.p-2`) — h2/h3 혼용·인라인 링크 포함 JSX. */
  slides: ReactNode;
}

export const ROCKSTAR_STEPS: Record<"1" | "2" | "3" | "4", RockstarGuideStep> = {
  // step1: legacy 복붙 버그 집합 — title "Rock Games"·h3/h2 혼용·이미지 epic 파일·slide4/5/6 내용 무관·slide5 p 미종료·mb-4·footer "Rockstar  목록"(공백2)·btn-lg.
  "1": {
    headerClassName: "appHeader no-border bg-primary",
    pageTitle: "가입 및 계정만들기",
    closeHref: "/service/guide_rockstar",
    footerButtonClassName: "btn-lg",
    gameLabel: "Rockstar  목록",
    meta: { title: "이용안내(Rock Games)", description: "", keywords: "" },
    slides: (
      <>
        <li className="splide__slide p-2">
          <div className="section full mt-2">
            <img
              src={`${IMG_OLD}/KR_Guide_Rockstar_A_01.jpg`}
              title="상품 선택"
              className="imaged w-100 square mb-4"
            />
            <h3>상품 선택</h3>
            <p className="fs-6">
              다이렉트 게임즈에서 원하는 상품을 선택하여 상세 페이지로 이동합니다.
            </p>
          </div>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG_OLD}/KR_Guide_epic_A_02.jpg`}
            alt="주문하기"
            title="주문하기"
            className="imaged w-100 square mb-4"
          />
          <h2>주문하기</h2>
          <p>{"구매하고자 하는 게임을 선택하신 후 `구매하기`를 클릭합니다."}</p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG_OLD}/KR_Guide_epic_A_03.jpg`}
            alt="결제하기"
            title="결제하기"
            className="imaged w-100 square mb-4"
          />
          <h2>결제하기</h2>
          <p>{"`구매하기`를 클릭하여 안내에 따라 결제를 완료합니다."}</p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG_OLD}/KR_Guide_epic_A_04.jpg`}
            alt="주문완료"
            title="주문완료"
            className="imaged w-100 square mb-4"
          />
          <h2>주문완료</h2>
          <p>
            각각의 체크 박스를 클릭한 후 ‘동의합니다’를 선택합니다. 이전 상태의 ⑦팝업창으로 돌아오게
            되며, 정보 수신을 원하는 고객님께서는 체크 박스를 클릭한 후에 ‘계속’을 선택합니다. 정보
            수신을 원하지 않는 고객님께서는 체크 박스 클릭 없이 ‘계속’을 선택합니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG_OLD}/KR_Guide_epic_A_05.jpg`}
            alt="인증용 보안 코드 입력"
            title="인증용 보안 코드 입력"
            className="imaged w-100 square mb-4"
          />
          <h2>인증용 보안 코드 입력</h2>
          {/* legacy `<p>` 미종료(malformed) — 브라우저 auto-close와 동일하게 닫힌 `<p>`로 렌더. */}
          <p>
            {
              "게임 구매가 완료되었습니다! 구매하신 제품 코드(키)는 `마이페이지 > 주문완료 내역`에서 확인 가능합니다."
            }
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG_OLD}/KR_Guide_epic_A_06.jpg`}
            alt="계정 생성 완료"
            title="계정 생성 완료"
            className="imaged w-100 square mb-4"
          />
          <h2>계정 생성 완료</h2>
          <p>
            ⑩팝업창에 인증용 보안 코드를 입력하신 후 ‘이메일 인증’을 선택합니다. 이후 에픽 게임즈
            메인 페이지로 화면이 자동 전환되며 이를 통해 에픽 게임즈 계정 생성은 끝이 납니다.
          </p>
        </li>
      </>
    ),
  },
  // step2: 7슬라이드. 닫기 href 복붙 버그(guide_epic). slide1 wrap+img alt없음·링크. slide6 h3≠img alt. slide5 straight quote.
  "2": {
    headerClassName: "appHeader no-border bg-primary mt-0",
    capsuleClassName: "mt-0",
    pageTitle: "가입 및 계정만들기",
    closeHref: "/service/guide_epic",
    gameLabel: "Rockstar 목록",
    meta: { title: "이용안내(Rockstar Games)", description: "", keywords: "" },
    slides: (
      <>
        <li className="splide__slide p-2">
          <div className="section full mt-2">
            <img
              src={`${IMG}/M_KR_Guide_Rockstar_A_01.jpg`}
              title="가입 및 로그인"
              className="imaged w-100 square mb-2"
            />
            <h3>가입 및 로그인</h3>
            <p className="fs-6">
              <a href="https://socialclub.rockstargames.com/" target="_blank" rel="noreferrer">
                Rockstar Games Social Club
              </a>{" "}
              접속 후 메인 페이지 중앙의 ‘로그인’을 선택합니다. 이미 가입하신 고객님은 페이지가
              전환된 후 계정정보를 입력하여 로그인이 가능합니다. 계정 생성을 원하는 고객님께서는
              ‘회원 가입’을 선택하시길 바랍니다.
            </p>
          </div>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_Rockstar_A_02.jpg`}
            alt="생년월일 입력"
            title="생년월일 입력"
            className="imaged w-100 square mb-2"
          />
          <h3>생년월일 입력</h3>
          <p className="fs-6">
            화면이 바뀌며 생년월일을 입력하는 창이 표시됩니다. 가입을 원하는 고객님의 생년월일을
            입력하신 후 ‘다음’을 선택합니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_Rockstar_A_03.jpg`}
            alt="락스타 게임즈 약관 및 정책"
            title="락스타 게임즈 약관 및 정책"
            className="imaged w-100 square mb-2"
          />
          <h3>락스타 게임즈 약관 및 정책</h3>
          <p className="fs-6">
            Rockstar Games 약관 및 정책의 내용을 확인하고 체크박스를 클릭하여 동의하신 후 ‘다음’을
            선택합니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_Rockstar_A_04.jpg`}
            alt="락스타 게임즈 각종 설정 선택"
            title="락스타 게임즈 각종 설정 선택"
            className="imaged w-100 square mb-2"
          />
          <h3>계정 정보 입력</h3>
          <p className="fs-6">
            Rockstar Games 가입 양식에 맞게 차례대로 입력하시길 바랍니다. 특히 이메일 주소는 추후
            비밀번호 분실 시 재발급을 위해 반드시 필요한 정보에 해당되므로 자주 사용하시는 이메일
            주소를 입력하는 것을 권장합니다. 마케팅 메일의 수신 희망 여부를 결정하신 후 ‘다음’을
            선택합니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_Rockstar_A_05.jpg`}
            alt="이메일 주소 인증"
            title="이메일 주소 인증"
            className="imaged w-100 square mb-2"
          />
          <h3>이메일 주소 인증</h3>
          <p className="fs-6">
            {
              '"4. 계정 정보 입력"에서 고객님께서 입력하신 이메일 주소에 Rockstar Games Social Club으로부터 화면과 같은 이메일이 도착하였는지 확인을 바랍니다. 메일 내용을 확인한 후 ‘이메일 주소 인증하기’를 선택합니다.'
            }
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_Rockstar_A_06.jpg`}
            alt="인증용 보안 코드 입력"
            title="인증용 보안 코드 입력"
            className="imaged w-100 square mb-2"
          />
          <h3>락스타 게임즈 각종 설정 선택</h3>
          <p className="fs-6">
            Rockstar Games 및 Rockstar Games Social Club의 각종 설정을 편집할 수 있습니다. 편집을
            마친 고객님께서는 ‘계속’을 선택합니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_Rockstar_A_07.jpg`}
            alt="계정 생성 완료"
            title="계정 생성 완료"
            className="imaged w-100 square mb-2"
          />
          <h3>계정 생성 완료</h3>
          <p className="fs-6">
            Rockstar Games Social Club의 페이지로 전환됩니다. 계정 생성이 정상적으로 완료되면 좌측
            상단에 고객님의 Rockstar Games Social Club ID가 표시됩니다. 이로서 Rockstar Games
            Launcher 계정 생성은 끝이 납니다.
          </p>
        </li>
      </>
    ),
  },
  // step3: 3슬라이드(B_01~03). pageTitle "락스타 게임즈 런처 설치"(허브 링크 불일치). slide1 wrap+링크.
  "3": {
    headerClassName: "appHeader no-border bg-primary mt-0",
    capsuleClassName: "mt-0",
    pageTitle: "락스타 게임즈 런처 설치",
    closeHref: "/service/guide_rockstar",
    gameLabel: "락스타 게임즈 목록",
    meta: { title: "이용안내(Rockstar Games)", description: "", keywords: "" },
    slides: (
      <>
        <li className="splide__slide p-2">
          <div className="section full mt-2">
            <img
              src={`${IMG}/M_KR_Guide_Rockstar_B_01.jpg`}
              title="락스타 게임즈 소셜 클럽 메인 페이지"
              className="imaged w-100 square mb-2"
            />
            <h3>락스타 게임즈 소셜 클럽 메인 페이지</h3>
            <p className="fs-6">
              <a href="https://socialclub.rockstargames.com/" target="_blank" rel="noreferrer">
                Rockstar Games Social Club
              </a>{" "}
              접속 후 메인 페이지 우측 상단의 ‘LAUNCHER 다운로드’를 선택합니다.
            </p>
          </div>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_Rockstar_B_02.jpg`}
            alt="락스타 게임즈 런처 다운로드"
            title="락스타 게임즈 런처 다운로드"
            className="imaged w-100 square mb-2"
          />
          <h3>락스타 게임즈 런처 다운로드</h3>
          <p className="fs-6">
            화면이 바뀌면 좌측 하단에 보이는 ‘Windows용 다운로드’를 선택합니다. 이후 자동으로
            Rockstar Games Launcher의 설치 파일 다운로드가 진행됩니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_Rockstar_B_03.jpg`}
            alt="락스타 게임즈 런처 설치 완료"
            title="락스타 게임즈 런처 설치 완료"
            className="imaged w-100 square mb-2"
          />
          <h3>락스타 게임즈 런처 설치 완료</h3>
          <p className="fs-6">
            설치가 정상적으로 완료 되면 자동적으로 클라이언트가 실행되며 아래와 같은 화면이
            표시됩니다. 이것으로 Rockstar Games Launcher 설치는 끝이 납니다.
          </p>
        </li>
      </>
    ),
  },
  // step4: 6슬라이드(C_01~06). title "Epic Games" 복붙 버그·pageTitle "가입 및 계정만들기"(허브 링크 불일치).
  "4": {
    headerClassName: "appHeader no-border bg-primary mt-0",
    capsuleClassName: "mt-0",
    pageTitle: "가입 및 계정만들기",
    closeHref: "/service/guide_rockstar",
    gameLabel: "락스타 게임즈 목록",
    meta: { title: "이용안내(Epic Games)", description: "", keywords: "" },
    slides: (
      <>
        <li className="splide__slide p-2">
          <div className="section full mt-2">
            <img
              src={`${IMG}/M_KR_Guide_Rockstar_C_01.jpg`}
              title="Rockstar Games Launcher 메인 페이지"
              className="imaged w-100 square mb-2"
            />
            <h3>Rockstar Games Launcher 메인 페이지</h3>
            <p className="fs-6">
              락스타 게임즈 런처 실행 및 로그인 후 화면 우측 상단의 ‘Rockstar Games Launcher 메인
              페이지’ 아이콘을 선택합니다. 이후 슬라이드 형식으로 표시되는 페이지에서 ‘코드 등록’을
              선택합니다.
            </p>
          </div>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_Rockstar_C_02.jpg`}
            alt="Rockstar Games 활성화 코드 입력"
            title="Rockstar Games 활성화 코드 입력"
            className="imaged w-100 square mb-2"
          />
          <h3>Rockstar Games 활성화 코드 입력</h3>
          <p className="fs-6">
            Rockstar 활성화 코드 화면으로 페이지가 전환됩니다. 다이렉트 게임즈를 통해 고객님께서
            구매하신 락스타 게임즈 활성화 코드를 입력하신 후 ‘확인’을 선택합니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_Rockstar_C_03.jpg`}
            alt="Rockstar Games Social Club 이용 규약"
            title="Rockstar Games Social Club 이용 규약"
            className="imaged w-100 square mb-2"
          />
          <h3>Rockstar Games Social Club 이용 규약</h3>
          <p className="fs-6">
            Rockstar Games Social Club 이용 규약이 안내됩니다. 고객님께서 등록한 제품은 현재 계정에
            영구히 귀속되며, 양도할 수 없음을 인지하셨다면 체크박스를 클릭한 후 ‘사용’을 선택합니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_Rockstar_C_04.jpg`}
            alt="Rockstar Games 게임 등록 완료"
            title="Rockstar Games 게임 등록 완료"
            className="imaged w-100 square mb-2"
          />
          <h3>Rockstar Games 게임 등록 완료</h3>
          <p className="fs-6">
            페이지가 바뀌며 ‘다음 콘텐츠가 활성화되었습니다!’라는 문장이 표시됩니다. 이로서 고객님이
            구매하신 락스타 게임즈 제품 등록이 정상적으로 완료 되었습니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_Rockstar_C_05.jpg`}
            alt="락스타 게임즈 런처 메인 페이지"
            title="락스타 게임즈 런처 메인 페이지"
            className="imaged w-100 square mb-2"
          />
          <h3>락스타 게임즈 런처 메인 페이지</h3>
          <p className="fs-6">
            제품 구매 후 고객님의 PC에 해당 게임을 설치하는 과정을 거쳐야 합니다. Rockstar Games
            Launcher 메인 페이지에 화면과 같이 ‘지금 설치’ 버튼이 표시됩니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_Rockstar_C_06.jpg`}
            alt="설치 완료 및 게임 플레이"
            title="설치 완료 및 게임 플레이"
            className="imaged w-100 square mb-2"
          />
          <h3>설치 완료 및 게임 플레이</h3>
          <p className="fs-6">
            게임 설치가 정상적으로 완료되면 화면과 같이 ‘플레이’ 버튼이 표시됩니다. 이것으로
            고객님이 구매하신 락스타 게임즈 게임을 언제든지 플레이 가능합니다.
          </p>
        </li>
      </>
    ),
  },
};
