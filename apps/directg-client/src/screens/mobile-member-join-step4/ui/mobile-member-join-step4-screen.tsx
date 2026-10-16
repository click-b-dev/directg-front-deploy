"use client";

/**
 * 모바일 회원가입 - 가입완료 (legacy `mobile/member/join_step4.html`).
 * 완전 정적(인증대기 안내 + 로그인 링크). 위저드 ④가입완료 active. goBack(base.js) 재현.
 * `<i class="mdi mdi-login">`은 legacy도 mdi CSS 미로드로 비표시(dead) — verbatim 유지.
 */
export function MobileMemberJoinStep4Screen() {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <>
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
          <a href="#" className="button-item">
            <strong>1</strong>
            <p className="font-12">가입방법 선택</p>
          </a>
          <a href="#" className="button-item">
            <strong>2</strong>
            <p className="font-12">약관동의</p>
          </a>
          <a href="#" className="button-item">
            <strong>3</strong>
            <p className="font-12">정보입력</p>
          </a>
          <a href="#" className="button-item active text-primary">
            <ion-icon
              name="checkmark-outline"
              role="img"
              className="md hydrated bg-primary rounded-3"
              aria-label="checkmark outline"
            ></ion-icon>
            <p className="font-12">가입완료</p>
          </a>
        </div>
      </div>
      <div id="appCapsule" className="extra-header-active mt-0">
        <div className="section full">
          <div className="wide-block">
            <div className="card mb-3" id="email_login">
              <div className="card-header text-center">
                <h5 className="card-title">인증대기</h5>
              </div>
              <div className="card-body">
                <div className="text-center m-auto">
                  <h4 className="text-dark-50 text-center mt-4 fw-bold">
                    가입된 아이디(이메일)로 인증메일이 발송되었습니다.
                  </h4>
                  <p className="text-muted mb-4">수신된 인증메일에서 [인증완료]를 눌러주세요.</p>
                </div>

                <form action="index">
                  <div className="mb-0 text-center">
                    <a href="/member/login" className="btn btn-primary shadow-none">
                      <i className="mdi mdi-login"></i> 로그인
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
