import type { ReactNode } from "react";

/** legacy Epic 가이드 이미지 CDN 베이스(외부, 자산 복사 없음). */
const IMG = "https://directg.diskn.com/upload/ezwel/guide/mobile";

/** 한 step 페이지 구성 — legacy `guide_epic_stepN.html`. */
export interface EpicGuideStep {
  /** 커스텀 헤더 className(step1은 mt-0 없음, step2~5 mt-0). */
  headerClassName: string;
  /** 헤더 pageTitle. */
  pageTitle: string;
  /** `#appCapsule` className(step1은 없음=undefined, step2~5 "mt-0"). */
  capsuleClassName?: string;
  /** 닫기 버튼 className(step1/2/4/5 "close-button text-white", step3 "headerButton text-white"). */
  closeClassName: string;
  /** footer 버튼 추가 클래스(step1만 "btn-lg"). */
  footerButtonClassName?: string;
  /** 라우트 metadata(title/description/keywords) — step3는 Mobilekit 템플릿 잔재 verbatim. */
  meta: { title: string; description: string; keywords: string };
  /** 캐러셀 슬라이드(`li.splide__slide.p-2`) — 인라인 링크/span/br 포함 JSX. */
  slides: ReactNode;
}

const META_BLANK = { title: "이용안내(Epic Games)", description: "", keywords: "" };
// step3 head는 Mobilekit 템플릿 잔재가 남아있다(verbatim 이식).
const META_TEMPLATE = {
  title: "이용안내(Epic Games)",
  description: "Mobilekit HTML Mobile UI Kit",
  keywords: "bootstrap 5, mobile template, cordova, phonegap, mobile, html",
};

export const EPIC_STEPS: Record<"1" | "2" | "3" | "4" | "5", EpicGuideStep> = {
  "1": {
    headerClassName: "appHeader no-border bg-primary",
    pageTitle: "제품 키 확인 및 활성화",
    closeClassName: "close-button text-white",
    footerButtonClassName: "btn-lg",
    meta: META_BLANK,
    // step1은 이미지 없는 텍스트 캐러셀(4슬라이드), 각 슬라이드 `.section full mt-2` 래핑.
    slides: (
      <>
        <li className="splide__slide p-2">
          <div className="section full mt-2">
            <h3>상품 선택</h3>
            <p className="fs-6">
              다이렉트 게임즈에서 원하는 상품을 선택하여 상세 페이지로 이동합니다.
            </p>
          </div>
        </li>
        <li className="splide__slide p-2">
          <div className="section full mt-2">
            <h3>주문하기</h3>
            <p>구매하고자 하는 게임을 선택하신 후 `구매하기`를 클릭합니다.</p>
          </div>
        </li>
        <li className="splide__slide p-2">
          <div className="section full mt-2">
            <h3>결제하기</h3>
            <p>`구매하기`를 클릭하여 안내에 따라 결제를 완료합니다.</p>
          </div>
        </li>
        <li className="splide__slide p-2">
          <div className="section full mt-2">
            <h3>주문완료</h3>
            <p>
              게임 구매가 완료되었습니다! 구매하신 제품 코드(키)는 `마이페이지 &gt; 주문완료
              내역`에서 확인 가능합니다.
            </p>
          </div>
        </li>
      </>
    ),
  },
  "2": {
    headerClassName: "appHeader no-border bg-primary mt-0",
    capsuleClassName: "mt-0",
    pageTitle: "가입 및 계정만들기",
    closeClassName: "close-button text-white",
    meta: META_BLANK,
    slides: (
      <>
        <li className="splide__slide p-2">
          <div className="section full mt-2">
            <img
              src={`${IMG}/M_KR_Guide_epic_A_01.jpg`}
              title="가입 및 로그인"
              className="imaged w-100 square mb-2"
            />
            <h3>가입 및 로그인</h3>
            <p className="fs-6">
              에픽 게임즈(
              <a href="https://www.epicgames.com/store/ko/" target="_blank" rel="noreferrer">
                https://www.epicgames.com/store/ko/
              </a>
              ) 접속 후 메인 페이지 우측 상단의 ‘로그인’을 선택합니다.
            </p>
          </div>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_A_02.jpg`}
            alt="가입양식 입력"
            title="가입양식 입력"
            className="imaged w-100 square mb-2"
          />
          <h3>가입양식 입력</h3>
          <p className="fs-6">
            에픽 게임즈에 이미 가입하신 고객님의 경우 팝업창 내에 계정정보를 입력하면 로그인이
            가능합니다.
            <br />
            계정 생성을 원하는 고객님께서는
            <span className="text-danger fs-5 fw-bold"> ① 가입</span>을 선택한 후{" "}
            <span className="text-danger fs-5 fw-bold">② 이메일로 가입</span>을 선택하시길 바랍니다.
            <br />
            (※본 설명서는 &apos;이메일로 가입&apos; 이외의 가입 절차는 안내하지 않으니 양해 부탁
            드립니다.)
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_A_03.jpg`}
            alt="가입양식 입력 및 이용약관과 동의서 확인"
            title="가입양식 입력 및 이용약관과 동의서 확인"
            className="imaged w-100 square mb-2"
          />
          <h3>가입양식 입력 및 이용약관과 동의서 확인</h3>
          <p className="fs-6">
            ③ 팝업창에 각각의 정보를 입력한 후 ‘이용약관에 동의하셔야 합니다’를 선택합니다.
            <br />④ 팝업창에 나타나는 규약을 모두 확인하지 않을 경우 다음 단계로 진행할 수 없습니다.{" "}
            <br />
            특히 ‘이용 약관’은 모든 내용을 확인하지 않을 경우 하단의 ⑤‘동의합니다’ 버튼이 활성화되지
            않으니 주의하시기 바랍니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_A_04.jpg`}
            alt="이용약관과 동의서 확인 완료"
            title="이용약관과 동의서 확인 완료"
            className="imaged w-100 square mb-2"
          />
          <h3>이용약관과 동의서 확인 완료</h3>
          <p className="fs-6">
            각각의 체크 박스를 클릭한 후 ‘동의합니다’를 선택합니다. 이전 상태의 ⑦ 팝업창으로
            돌아오게 되며, 정보 수신을 원하는 고객님께서는 체크 박스를 클릭한 후에 ‘계속’을
            선택합니다. 정보 수신을 원하지 않는 고객님께서는 체크 박스 클릭 없이 ‘계속’을
            선택합니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_A_05.jpg`}
            alt="인증용 보안 코드 입력"
            title="인증용 보안 코드 입력"
            className="imaged w-100 square mb-2"
          />
          <h3>인증용 보안 코드 입력</h3>
          <p className="fs-6">
            ⑧ 팝업창을 통해 인증용 보안 코드를 입력해야 합니다. ③팝업창에서 고객님께서 입력한 이메일
            주소에 에픽 게임즈로부터 ⑨인증용 보안 코드가 포함되어 있는 이메일이 도착하였는지 확인을
            바랍니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_A_06.jpg`}
            alt="계정 생성 완료"
            title="계정 생성 완료"
            className="imaged w-100 square mb-2"
          />
          <h3>계정 생성 완료</h3>
          <p className="fs-6">
            ⑩팝업창에 인증용 보안 코드를 입력하신 후 ‘이메일 인증’을 선택합니다. 이후 에픽 게임즈
            메인 페이지로 화면이 자동 전환되며 이를 통해 에픽 게임즈 계정 생성은 끝이 납니다.
          </p>
        </li>
      </>
    ),
  },
  "3": {
    headerClassName: "appHeader no-border bg-primary mt-0",
    capsuleClassName: "mt-0",
    pageTitle: "클라이언트 설치하기",
    closeClassName: "headerButton text-white",
    meta: META_TEMPLATE,
    slides: (
      <>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_B_01.jpg`}
            alt="에픽 게임즈 메인 페이지"
            title="에픽 게임즈 메인 페이지"
            className="imaged w-100 square mb-2"
          />
          <h3>에픽 게임즈 메인 페이지</h3>
          <p className="fs-6">
            <a href="https://www.epicgames.com/store/ko/" target="_blank" rel="noreferrer">
              에픽 게임즈
            </a>{" "}
            메인 페이지 우측 상단의 ‘에픽게임즈 받기’를 선택합니다. 이후 자동으로 클라이언트 설치
            파일의 다운로드가 진행됩니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_B_02.jpg`}
            alt="에픽 게임즈 클라이언트 설치 완료"
            title="에픽 게임즈 클라이언트 설치 완료"
            className="imaged w-100 square mb-2"
          />
          <h3>에픽 게임즈 클라이언트 설치 완료</h3>
          <p className="fs-6">
            설치가 정상적으로 완료 되면 자동적으로 클라이언트가 실행되며 아래와 같은 화면이
            표시됩니다. 이것으로 에픽 게임즈 클라이언트 설치는 끝이 납니다.
          </p>
        </li>
      </>
    ),
  },
  "4": {
    headerClassName: "appHeader no-border bg-primary mt-0",
    capsuleClassName: "mt-0",
    pageTitle: "라이브러리 게임 등록 및 플레이",
    closeClassName: "close-button text-white",
    meta: META_BLANK,
    slides: (
      <>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_C_01.jpg`}
            alt="에픽 게임즈 클라이언트 메인 페이지"
            title="에픽 게임즈 클라이언트 메인 페이지"
            className="imaged w-100 square mb-2"
          />
          <h3>에픽 게임즈 클라이언트 메인 페이지</h3>
          <p className="fs-6">
            에픽 게임즈 클라이언트를 실행해주시기 바랍니다. 로그인 후 화면 우측 상단의 ‘라이브러리
            게임 등록 및 플레이’ 아이콘을 선택합니다. 이후 슬라이드 형식으로 표시되는 페이지에서
            ‘코드 사용’을 선택합니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_C_02.jpg`}
            alt="에픽 게임즈 제품 코드 입력"
            title="에픽 게임즈 제품 코드 입력"
            className="imaged w-100 square mb-2"
          />
          <h3>에픽 게임즈 제품 코드 입력</h3>
          <p className="fs-6">
            제품 등록 화면으로 페이지가 전환됩니다. 다이렉트 게임즈를 통해 고객님이 구매하신 에픽
            게임즈 제품의 코드를 입력합니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_C_03.jpg`}
            alt="에픽 게임즈 제품 코드 사용"
            title="에픽 게임즈 제품 코드 사용"
            className="imaged w-100 square mb-2"
          />
          <h3>에픽 게임즈 제품 코드 사용</h3>
          <p className="fs-6">
            정상적으로 코드 입력을 완료하면 고객님이 구매하신 제품의 썸네일이 좌측에 표시됩니다.
            이후 파란색 버튼의 ‘사용’을 선택합니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_C_04.jpg`}
            alt="에픽 게임즈 제품 등록 완료"
            title="에픽 게임즈 제품 등록 완료"
            className="imaged w-100 square mb-2"
          />
          <h3>에픽 게임즈 제품 등록 완료</h3>
          <p className="fs-6">
            ‘제품을 성공적으로 등록했습니다!’라는 문장이 표시됩니다. 이로서 고객님이 구매하신 에픽
            게임즈 제품의 등록이 정상적으로 완료 되었습니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_C_05.jpg`}
            alt="에픽 게임즈 클라이언트 메인 화면"
            title="에픽 게임즈 클라이언트 메인 화면"
            className="imaged w-100 square mb-2"
          />
          <h3>에픽 게임즈 클라이언트 메인 화면</h3>
          <p className="fs-6">
            에픽 게임즈 클라이언트 메인 페이지의 좌측 메뉴에서 ‘라이브러리’를 선택합니다. 고객님의
            PC에 해당 게임을 설치하는 과정을 거쳐야 합니다. 구매하신 게임을 마우스로 클릭하시기
            바랍니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_C_06.jpg`}
            alt="에픽 게임즈 최종 사용자 라이선스 계약"
            title="에픽 게임즈 최종 사용자 라이선스 계약"
            className="imaged w-100 square mb-2"
          />
          <h3>에픽 게임즈 최종 사용자 라이선스 계약</h3>
          <p className="fs-6">
            최종 사용자 라이선스 계약 내용이 표시됩니다. 내용을 확인하고 체크 박스를 클릭하여 동의한
            후 ‘수락’을 선택하면 구매하신 게임의 다운로드 및 설치가 진행됩니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_C_07.jpg`}
            alt="설치 완료 및 게임 플레이"
            title="설치 완료 및 게임 플레이"
            className="imaged w-100 square mb-2"
          />
          <h3>설치 완료 및 게임 플레이</h3>
          <p className="fs-6">
            게임 설치가 정상적으로 완료되면, 라이브러리에서 구매하신 에픽 게임즈 게임을 언제든지
            플레이할 수 있습니다.
            <br />
            (※ 구매하신 게임 플레이에 성인 인증이 필요한 경우, 등록 불가 상황 대처법 페이지를 확인해
            주시기 바랍니다.)
          </p>
        </li>
      </>
    ),
  },
  "5": {
    headerClassName: "appHeader no-border bg-primary mt-0",
    capsuleClassName: "mt-0",
    pageTitle: "본인(성인) 인증 및 홈페이지를 통한 제품 등록 안내",
    closeClassName: "close-button text-white",
    meta: META_BLANK,
    slides: (
      <>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_D_01.jpg`}
            alt="가입 및 로그인"
            title="가입 및 로그인"
            className="imaged w-100 square mb-2"
          />
          <h3>가입 및 로그인</h3>
          <p className="fs-6">
            일부 에픽 게임즈 제품은 심의 규정으로 인해 본인(성인) 인증 후에 등록 및 플레이가
            가능합니다. <br />
            <a href="https://www.epicgames.com/realid/identity" target="_blank" rel="noreferrer">
              본인 인증 페이지
            </a>{" "}
            에 접속하여 로그인합니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_D_02.jpg`}
            alt="서비스 이용 본인확인"
            title="서비스 이용 본인확인"
            className="imaged w-100 square mb-2"
          />
          <h3>서비스 이용 본인확인</h3>
          <p className="fs-6">
            개인정보 수집, 활용 동의서 내용을 확인하고 동의한 후 확인 버튼을 클릭합니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_D_03.jpg`}
            alt="인증 방법 선택"
            title="인증 방법 선택"
            className="imaged w-100 square mb-2"
          />
          <h3>인증 방법 선택</h3>
          <p className="fs-6">휴대폰 또는 아이핀 인증 방법 중에 선택하여 진행합니다.</p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_D_04.jpg`}
            alt="본인 인증 완료"
            title="본인 인증 완료"
            className="imaged w-100 square mb-2"
          />
          <h3>본인 인증 완료</h3>
          <p className="fs-6">
            일련의 과정을 거쳐 본인 인증 후 다시 로그인하여 제품 등록을 시도해주시길 바랍니다.
          </p>
        </li>
        <li className="splide__slide p-2">
          <img
            src={`${IMG}/M_KR_Guide_epic_D_05.jpg`}
            alt="홈페이지를 통한 제품 등록"
            title="홈페이지를 통한 제품 등록"
            className="imaged w-100 square mb-2"
          />
          <h3>홈페이지를 통한 제품 등록</h3>
          <p className="fs-6">
            클라이언트에서 일시적으로 발생하는 오류일 수 있으며,{" "}
            <a
              href="https://www.epicgames.com/account/code-redemption"
              target="_blank"
              rel="noreferrer"
            >
              에픽 게임즈 홈페이지
            </a>
            를 통해서도 등록이 가능합니다.
            <br />
            지속적인 문제가 발생할 경우, 문제 상황 스크린샷과 함께 다이렉트 게임즈 고객센터에
            문의하여 주시면 확인 후 신속히 조치할 수 있도록 하겠습니다.
          </p>
        </li>
      </>
    ),
  },
};
