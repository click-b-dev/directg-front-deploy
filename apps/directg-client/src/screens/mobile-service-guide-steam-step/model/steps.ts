import type { MobileGuideSlide } from "@widgets/mobile-guide-carousel";

/** legacy Steam 가이드 이미지 CDN 베이스(외부, 자산 복사 없음). */
const IMG = "https://directg.diskn.com/upload/ezwel/guide/mobile";

/** 한 step 페이지 구성 — legacy `guide_steam_stepN.html`. */
export interface SteamGuideStep {
  /** 커스텀 헤더 pageTitle. */
  pageTitle: string;
  /** footer 게임 버튼 라벨(step1/3/4/5 "Steam 게임목록", step2 "Steam 게임"). */
  gameLabel: string;
  /** footer 버튼 추가 클래스(step2만 fs-6). */
  buttonClassName?: string;
  /** pagination `<style>` 포함 여부(step2만 true). */
  hasPagination: boolean;
  /** 라우트 metadata(title/description/keywords) — step3/5는 템플릿 잔재 verbatim. */
  meta: { title: string; description: string; keywords: string };
  slides: MobileGuideSlide[];
}

const META_BLANK = { title: "이용안내(Steam)", description: "", keywords: "" };
// step3/step5 head는 Mobilekit 템플릿 잔재가 남아있다(verbatim 이식).
const META_TEMPLATE = {
  title: "이용안내(Steam)",
  description: "Mobilekit HTML Mobile UI Kit",
  keywords: "bootstrap 5, mobile template, cordova, phonegap, mobile, html",
};

export const STEAM_STEPS: Record<"1" | "2" | "3" | "4" | "5", SteamGuideStep> = {
  "1": {
    pageTitle: "제품 키 확인 및 활성화",
    gameLabel: "Steam 게임목록",
    hasPagination: false,
    meta: META_BLANK,
    // step1은 이미지 없는 텍스트 캐러셀(3슬라이드).
    slides: [
      {
        heading: "다이렉트 게임즈 마이페이지",
        body: "다이렉트 게임즈 마이페이지의 ‘주문완료 내역’에서 ‘활성화’를 선택합니다. 디지털 제품 특성상 제품 키 활성화 후에는 환불이 불가능하므로, 구매하신 제품의 구성과 플랫폼을 다시 한 번 확인 부탁드립니다.",
      },
      {
        heading: "제품 활성화 최종 안내",
        body: "구매하신 스팀 제품의 활성화와 관련된 최종 안내 및 환불 가능 조건을 안내해 드립니다. 모든 내용에 동의하고 제품 키의 확인을 원하시는 경우 ‘활성화’를 선택하시길 바랍니다.",
      },
      {
        heading: "제품 활성화 성공 및 키 확인",
        body: "구매하신 스팀 제품키 활성화에 성공하였습니다. ‘키 확인’을 선택하면 팝업창이 나타나며 이를 통해 구매하신 제품의 키를 확인할 수 있습니다.",
      },
    ],
  },
  "2": {
    pageTitle: "스팀(Steam) 가입 및 계정 만들기",
    gameLabel: "Steam 게임",
    buttonClassName: "fs-6",
    hasPagination: true,
    meta: META_BLANK,
    slides: [
      {
        img: `${IMG}/M_KR_Guide_steam_A_01.jpg`,
        alt: "가입 및 로그인",
        heading: "1. 가입 및 로그인",
        body: "스팀(https://store.steampowered.com/)접속 후 우측 상단의 ‘로그인’을 선택합니다. 이후 바뀐 화면에서 아이디가 있을 경우는 계정정보를 입력한 후 로그인, 아이디가 없을 경우는 ‘Steam 가입하기’를 선택합니다.",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_A_02.jpg`,
        alt: "가입양식 기입",
        heading: "2. 가입양식 기입",
        body: "스팀 계정 가입양식에 맞게 차례대로 입력해 주시기 바랍니다. 특히 스팀 가입에 사용된 이메일은 추후 혹시 모를 아이디/비밀번호 분실 시 꼭 필요한 정보에 해당되므로 자주 사용하시는 이메일 주소를 기입하는 것을 권장합니다.",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_A_03.jpg`,
        alt: "이메일 주소 인증 대기",
        heading: "3. 이메일 주소 인증 대기",
        body: "이메일 주소 기입, 거주국가 선택, 봇 방지 체크, 이용 약관과 개인정보 보호 정책에 동의한 후 가장 아래의 ‘계속하기’를 선택하면 다음과 같은 팝업창이 나타납니다. 이후 가입양식에 기입한 이메일 주소의 받은 편지함을 확인해주시기 바랍니다.",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_A_04.jpg`,
        alt: "받은 편지함 확인 후 이메일 주소 인증",
        heading: "4. 받은 편지함 확인 후 이메일 주소 인증",
        body: "받은 편지함에 있는 ‘새 Steam 계정 이메일 인증’이라는 제목의 이메일을 확인한 후 이메일 본문에 있는 ‘내 이메일 주소 인증하기’를 선택합니다.",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_A_05.jpg`,
        alt: "이메일 인증 완료 확인 페이지",
        heading: "5. 이메일 인증 완료 확인 페이지",
        body: "‘내 이메일 주소 인증하기’를 선택하면 다음과 같은 화면으로 바뀌며 이메일 인증이 완료됩니다. 이후 “3. 이메일 주소 인증 대기”의 인터넷 페이지로 이동하여 다음 과정을 진행합니다.",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_A_06.jpg`,
        alt: "계정 만들기 완료",
        heading: "6. 계정 만들기 완료",
        body: "이전 페이지로 이동하여 원하는 Steam 계정 이름과 비밀번호를 입력하고 가장 아래에 있는 ‘완료’를 선택하면 Steam 계정이 생성됩니다. 이것으로 Steam 계정 생성은 끝이 납니다.",
      },
    ],
  },
  "3": {
    pageTitle: "스팀(Steam) 클라이언트 설치하기",
    gameLabel: "Steam 게임목록",
    hasPagination: false,
    meta: META_TEMPLATE,
    slides: [
      {
        img: `${IMG}/M_KR_Guide_steam_B_01.jpg`,
        alt: "Steam 접속",
        heading: "1. Steam 접속",
        body: "스팀(https://store.steampowered.com/)접속 후 우측 상단의 ‘Steam 설치’ 버튼을 클릭합니다.",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_B_02.jpg`,
        alt: "Steam 설치",
        heading: "2. Steam 설치",
        body: "파란색 버튼의 ‘Steam 설치하기’를 클릭하면 자동으로 스팀 클라이언트의 다운로드가 실행되며 다운로드 완료 후 설치를 하는 것으로 Steam 클라이언트 설치는 끝이 납니다.",
      },
    ],
  },
  "4": {
    pageTitle: "라이브러리 게임 등록 및 플레이",
    gameLabel: "Steam 게임목록",
    hasPagination: false,
    meta: META_BLANK,
    slides: [
      {
        img: `${IMG}/M_KR_Guide_steam_C_01.jpg`,
        alt: "Steam 메인 화면",
        heading: "1. Steam 메인 화면",
        body: "PC에 설치된 Steam 어플리케이션을 실행하여 메인 화면 좌측 상단의 ‘게임’을 선택한 후 ‘Steam에 제품 등록’을 선택합니다.",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_C_02.jpg`,
        alt: "제품 등록 팝업창",
        heading: "2. 제품 등록 팝업창",
        body: "“제품 등록“ 팝업창이 나타나면 ‘다음’을 선택합니다.",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_C_03.jpg`,
        alt: "이용 약관 동의 팝업창",
        heading: "3. 이용 약관 동의 팝업창",
        body: "“이용 약관 동의“ 팝업창의 모든 이용 약관을 확인하신 후 ‘동의’를 선택합니다.",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_C_04.jpg`,
        alt: "제품 코드 입력 팝업창",
        heading: "4. 제품 코드 입력 팝업창",
        body: "‘제품 코드’에 설치를 원하는 게임의 Steam 코드를 입력한 후 ‘다음’을 선택합니다.",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_C_05.jpg`,
        alt: "제품 등록 완료 팝업창",
        heading: "5. 제품 등록 완료 팝업창",
        body: "Steam 게임 등록이 정상적으로 완료되었습니다. 코드 입력을 완료한 게임은 고객님의 계정에 영구히 등록됩니다. 영수증이 필요한 경우는 ‘영수증 인쇄’를 불필요한 경우는 ‘마침’을 선택합니다.",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_C_06.jpg`,
        alt: "제품 설치 팝업창",
        heading: "6. 제품 설치 팝업창",
        body: "구매한 Steam 게임의 “바로 가기” 아이콘을 만들고 싶을 경우는 현재 상태에서 ‘다음’을 선택합니다.“바로 가기” 아이콘이 불필요한 경우는 체크를 해제한 후 ‘다음’을 선택합니다.",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_C_07.jpg`,
        alt: "제품 다운로드 대기 팝업창",
        heading: "7. 제품 다운로드 대기 팝업창",
        body: "구매한 Steam 게임이 다운로드 대기 상태일 경우 안내되는 팝업창입니다. 이후 표시를 원하지 않을 경우는 ‘이 페이지를 다시 표시하지 않습니다’에 체크를 한 후 ‘마침’을 선택합니다.",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_C_08.jpg`,
        alt: "라이브러리 등록 완료",
        heading: "8. 라이브러리 등록 완료",
        body: "Steam 어플리케이션의 “라이브러리”에 자동으로 이동합니다. ‘최근 게임’은 방금 막 설치를 끝낸 게임이 표시되며, 이미 설치를 했던 기존의 게임이 있을 경우 ‘모든 게임’을 통해 확인이 가능합니다.",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_C_09.jpg`,
        alt: "게임 플레이",
        heading: "9. 게임 플레이",
        body: "라이브러리 화면에서 시작을 원하는 게임의 ①녹색 화살표를 선택하거나 또는 해당 게임의 썸네일을 선택하면 나타나는 ",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_C_10.jpg`,
        alt: "게임 플레이",
        heading: "9. 게임 플레이",
        body: "②‘플레이’ 버튼 선택을 통해 고객님이 구입한 게임의 플레이가 가능합니다.",
      },
    ],
  },
  "5": {
    pageTitle: "코드 중복 입력 대처법",
    gameLabel: "Steam 게임목록",
    hasPagination: false,
    meta: META_TEMPLATE,
    // step5 이미지 class는 mb-4, alt/title은 step2 복붙 잔재(h3와 불일치) — verbatim.
    slides: [
      {
        img: `${IMG}/M_KR_Guide_steam_D_01.jpg`,
        alt: "가입 및 로그인",
        imgClassName: "imaged w-100 square mb-4",
        heading: "1.Steam 메인 화면",
        body: "타 계정에 이미 등록된 Steam 코드를 중복 입력할 경우입니다. 최초 제품 등록 순서와 동일하게 Steam 어플리케이션 메인 화면 좌측 상단의 ‘게임’을 선택한 후 ‘Steam에 제품 등록’을 선택합니다.",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_D_02.jpg`,
        alt: "가입양식 기입",
        imgClassName: "imaged w-100 square mb-4",
        heading: "2. 제품 등록 팝업창",
        body: "“제품 등록“ 팝업창이 나타나면 ‘다음’을 선택합니다.",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_D_03.jpg`,
        alt: "이메일 주소 인증 대기",
        imgClassName: "imaged w-100 square mb-4",
        heading: "3. 이용 약관 동의 팝업창",
        body: "“이용 약관 동의“ 팝업창의 모든 이용 약관을 확인하신 후 ‘동의’를 선택합니다.",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_D_04.jpg`,
        alt: "받은 편지함 확인 후 이메일 주소 인증",
        imgClassName: "imaged w-100 square mb-4",
        heading: "4. 제품 코드 입력 팝업창",
        body: "‘제품 코드’에 설치를 원하는 게임의 Steam 코드를 입력한 후 ‘다음’을 선택합니다.",
      },
      {
        img: `${IMG}/M_KR_Guide_steam_D_05.jpg`,
        alt: "이메일 인증 완료 확인 페이지",
        imgClassName: "imaged w-100 square mb-4",
        heading: "5. 제품 코드 중복 안내 팝업창",
        body: "이미 다른 Steam 계정에 의해 등록된 코드이기에 다시 사용할 수 없다는 안내 문장이 표시됩니다. 이하의 팝업창이 나타날 경우, 다이렉트 게임즈 고객센터에 문의하여 주시면 확인 후 신속히 조치할 수 있도록 하겠습니다.",
      },
    ],
  },
};
