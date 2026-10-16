"use client";

/** legacy `mobile/member/find_password_complete.html` head `<style>` 원문. */
const COMPLETE_CSS = `
#appCapsuleSub{
	padding-top:56px;
}
`;

/**
 * 모바일 비밀번호 찾기 - 재설정 완료 (legacy `mobile/member/find_password_complete.html`).
 * 완전 정적(가드/AJAX 없음). 완료 안내 + 로그인 버튼. goBack(base.js) 재현.
 */
export function MobileMemberFindPasswordCompleteScreen() {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: COMPLETE_CSS }} />
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
        <div className="pageTitle">비밀번호 재설정</div>
        <div className="right"></div>
      </div>
      <div id="appCapsuleSub" className="mt-0">
        <div className="login-form">
          <div className="section mt-2">
            <h4>비밀번호 재설정이 완료되었습니다.</h4>
          </div>
          <div className="section mt-2 mb-5">
            <div className="form-button-group">
              <a href="/member/login" className="btn btn-primary btn-block btn-lg">
                로그인
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
