"use client";

import { openSnsLoginPopup, type SnsProvider } from "@entities/member-auth";

/** legacy `mobile/member/join_step1.html` head `<style>` 원문(SNS 버튼 색/아이콘). */
const JOIN_STEP1_CSS = `
#btn_login_naver {
	background: #1EC800;
	color: #ffffff;
	font-weight: bold;
	border-radius: 4px;
}

#btn_login_naver img{
	position:relative;
	float:left;
	height:100%;
}

#btn_login_kakao {
	background: #FFE500;
	border: 1px solid #FA2828;
	color: #5C5200;
	font-weight: bold;
	border-radius: 4px;
}

#btn_login_kakao img{
	position:relative;
	float:left;
	height:100%;
}

#btn_login_payco {
	background: #FF2233;
	border: 1px solid #FF2233;
	color: #FFFFFF;
	font-weight: bold;
}

#btn_login_payco img{
	position:relative;
	float:left;
	height:100%;
}
`;

/**
 * 모바일 회원가입 - 가입방법 선택 (legacy `mobile/member/join_step1.html`).
 * 4단계 위저드(①가입방법 선택 active) + SNS 3종 회원가입(팝업, openSnsLoginPopup 재사용) + 이메일주소로 회원가입(join_step2 링크).
 * SNS 콜백→join_step2는 후속 단위. dead `#btn_login` cruft(폼 없음)는 미이식.
 */
export function MobileMemberJoinStep1Screen() {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleSnsJoin = (provider: SnsProvider) => {
    void openSnsLoginPopup(provider);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: JOIN_STEP1_CSS }} />
      <div className="appHeader mt-0 bg-primary text-light">
        <div className="left">
          <a
            href="#"
            className="headerButton goBack"
            onClick={(e) => {
              e.preventDefault();
              handleGoBack();
            }}
          >
            <ion-icon name="chevron-back-outline"></ion-icon>
          </a>
        </div>
        <div className="pageTitle">회원가입</div>
        <div className="right"></div>
      </div>
      <div className="extraHeader p-0">
        <div className="form-wizard-section">
          <a href="#" className="button-item active text-primary">
            <ion-icon
              name="checkmark-outline"
              role="img"
              className="md hydrated bg-primary rounded-3"
              aria-label="checkmark outline"
            ></ion-icon>
            <p className="font-12">가입방법 선택</p>
          </a>
          <a href="#" className="button-item font-12">
            <strong>2</strong>
            <p className="font-12">약관동의</p>
          </a>
          <a href="#" className="button-item font-12">
            <strong>3</strong>
            <p className="font-12">정보입력</p>
          </a>
          <a href="#" className="button-item font-12">
            <strong>4</strong>
            <p className="font-12">가입완료</p>
          </a>
        </div>
      </div>
      <div id="appCapsule" className="extra-header-active mt-0">
        <div className="section full mt-2 mb-2">
          <div className="section-title2 mb-2 text-center">가입방법 선택</div>
          <div className="wide-block pt-2 pb-2">
            <div className="d-grid gap-3">
              <button
                type="button"
                className="btn btn-block btn-lg border-0 shadow-none fs-3 fw-bold p-0 d-flex flex-row align-items-center"
                id="btn_login_naver"
                onClick={() => handleSnsJoin("naver")}
              >
                <img src="/mobile-assets/images/member/icon_naver.png" className="float-start" />
                <span className="flex-fill">NAVER로 회원가입</span>
              </button>
              <button
                type="button"
                className="btn btn-block btn-lg border-0 shadow-none fs-3 fw-bold p-0 d-flex flex-row align-items-center"
                id="btn_login_kakao"
                onClick={() => handleSnsJoin("kakao")}
              >
                <img src="/mobile-assets/images/member/icon_kakao.png" className="float-start" />
                <span className="flex-fill">KAKAO로 회원가입</span>
              </button>
              <button
                type="button"
                className="btn btn-block btn-lg border-0 shadow-none fs-3 fw-bold p-0 d-flex flex-row align-items-center"
                id="btn_login_payco"
                onClick={() => handleSnsJoin("payco")}
              >
                <img src="/mobile-assets/images/member/icon_payco.png" className="float-start" />
                <span className="flex-fill">PAYCO로 회원가입</span>
              </button>
              <a
                href="/member/join_step2"
                className="btn btn-secondary btn-block btn-lg"
                id="btn_email"
              >
                이메일주소로 회원가입
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
