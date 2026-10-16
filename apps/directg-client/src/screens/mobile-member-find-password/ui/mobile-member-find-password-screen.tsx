"use client";

import { useState, type FormEvent } from "react";

/** legacy `mobile/member/find_password.html` head `<style>` 원문. */
const FIND_PASSWORD_CSS = `
#appCapsuleSub{
	padding-top:56px;
}
`;

/** 후속 user_certification 진입 파라미터 저장 키 — `{ m_id }`(모바일 비번찾기 체인). */
const PW_FIND_STATE_KEY = "dg_mobile_pw_find";

/**
 * 모바일 비밀번호 찾기 - 가입여부확인 (legacy `mobile/member/find_password.html`).
 * legacy는 email만 받아 `user_certification.html`로 POST(회원확인·OTP 발송은 그쪽 담당). AJAX 없음.
 * 여기선 m_id를 sessionStorage에 담아 `/member/user_certification.html`로 이동(POST 대체, 후속 단위 소비).
 */
export function MobileMemberFindPasswordScreen() {
  const [mId, setMId] = useState("");

  const handleGoBack = () => {
    window.history.back();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.sessionStorage.setItem(PW_FIND_STATE_KEY, JSON.stringify({ m_id: mId }));
    window.location.href = "/member/user_certification";
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FIND_PASSWORD_CSS }} />
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
        <div className="pageTitle">비밀번호 찾기</div>
        <div className="right"></div>
      </div>
      <div id="appCapsuleSub" className="mt-0">
        <div className="login-form">
          <div className="section mt-2">
            <h1>비밀번호를 분실하셨나요?</h1>
            <h4>가입한 회원아이디(이메일)를 입력해주세요.</h4>
          </div>
          <div className="section mt-2 mb-5">
            <form name="frm" method="POST" action="user_certification" onSubmit={handleSubmit}>
              <div className="form-group boxed">
                <div className="input-wrapper">
                  <input
                    type="email"
                    className="form-control"
                    id="m_id"
                    name="m_id"
                    placeholder="가입한 회원아이디를 입력해 주세요."
                    required
                    value={mId}
                    onChange={(e) => setMId(e.target.value)}
                  />
                  <i className="clear-input" onClick={() => setMId("")}>
                    <ion-icon name="close-circle" role="img" className="md hydrated"></ion-icon>
                  </i>
                </div>
              </div>
              <div className="form-button-group">
                <button type="submit" className="btn btn-primary btn-block btn-lg">
                  가입여부 확인
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
