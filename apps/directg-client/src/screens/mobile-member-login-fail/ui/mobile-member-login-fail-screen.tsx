"use client";

import { useState, type FormEvent } from "react";

import { openSnsLoginPopup, type SnsProvider } from "@entities/member-auth";

/** legacy `mobile/member/login_fail.html` head `<style>` 원문(SNS 버튼 색/아이콘). */
const LOGIN_FAIL_CSS = `
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
 * 모바일 로그인 (legacy `mobile/member/login_fail.html` — 카드형 변형, title "로그인").
 * ⚠️ legacy 버그: 이메일 로그인 JS가 `#btn_login`(부재)에 바인딩 → dead. 이메일 로그인은 비동작(검증/AJAX 없음).
 * 이관: form self-submit(405) 회피 위해 onSubmit no-op. SNS는 팝업 정상 동작(openSnsLoginPopup 재사용).
 */
export function MobileMemberLoginFailScreen() {
  const [mId, setMId] = useState("");
  const [mPwd, setMPwd] = useState("");

  const handleGoBack = () => {
    window.history.back();
  };

  // legacy 이메일 로그인 핸들러는 dead(#btn_login 선택자 버그) → 아무 동작 없음. self-submit(405)만 방지.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleSnsLogin = (provider: SnsProvider) => {
    void openSnsLoginPopup(provider);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LOGIN_FAIL_CSS }} />
      <div className="appHeader bg-primary text-light">
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
        <div className="pageTitle">로그인</div>
        <div className="right"></div>
      </div>
      <div id="appCapsuleSub" className="full-height">
        <div className="section full">
          <div className="card mb-3" id="email_login">
            <div className="card-header text-center">
              <h5 className="card-title">기존회원 로그인</h5>
            </div>
            <div className="card-body">
              <form
                className="needs-validation mb-0"
                id="loginFrm"
                method="POST"
                onSubmit={handleSubmit}
              >
                <div className="g-3 row">
                  <div className="col-12">
                    <label className="form-label font-14" htmlFor="m_id">
                      아이디(이메일)
                    </label>
                    <input
                      placeholder="가입한 이메일주소를 입력해주세요."
                      id="m_id"
                      className="form-control rounded-0"
                      type="email"
                      name="m_id"
                      required
                      autoComplete="off"
                      value={mId}
                      onChange={(e) => setMId(e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <div className="password-field position-relative">
                      <label className="form-label font-14" htmlFor="m_pwd">
                        비밀번호
                      </label>
                      <div className="password-field position-relative">
                        <input
                          placeholder="비밀번호를 입력해 주세요"
                          id="m_pwd"
                          className="form-control rounded-0"
                          type="password"
                          name="m_pwd"
                          required
                          autoComplete="off"
                          value={mPwd}
                          onChange={(e) => setMPwd(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="d-flex">
                    <div className="text-end">
                      비밀번호를 잃어버렸다면? <a href="/member/find_password"> 비밀번호 재설정</a>
                    </div>
                  </div>
                  <div className="d-grid col-12">
                    <button type="submit" className="btn btn-lg btn-primary">
                      로그인
                    </button>
                  </div>
                  <div className="row mt-3">
                    <div className="col-12 text-center">
                      <p className="text-white font-14">
                        다이렉트 게임즈 계정이 없다면?{" "}
                        <a href="/member/join_step1" className="text-white ms-1">
                          <b>회원가입</b>
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="section full">
          <div className="card mb-3" id="sns_login">
            <div className="card-header text-center">
              <h5 className="card-title">간편로그인</h5>
            </div>
            <div className="card-body p-2">
              <form className="p-0 mb-0" action="#">
                <div className="d-grid gap-3">
                  <button
                    type="button"
                    className="btn btn-block btn-lg border-0 shadow-none fs-3 fw-bold p-0 d-flex flex-row align-items-center"
                    id="btn_login_naver"
                    onClick={() => handleSnsLogin("naver")}
                  >
                    <img
                      src="/mobile-assets/images/member/icon_naver.png"
                      className="float-start"
                    />
                    <span className="flex-fill">NAVER 로그인</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-block btn-lg border-0 shadow-none fs-3 fw-bold p-0 d-flex flex-row align-items-center"
                    id="btn_login_kakao"
                    onClick={() => handleSnsLogin("kakao")}
                  >
                    <img
                      src="/mobile-assets/images/member/icon_kakao.png"
                      className="float-start"
                    />
                    <span className="flex-fill">KAKAO 로그인</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-block btn-lg border-0 shadow-none fs-3 fw-bold p-0 d-flex flex-row align-items-center"
                    id="btn_login_payco"
                    onClick={() => handleSnsLogin("payco")}
                  >
                    <img
                      src="/mobile-assets/images/member/icon_payco.png"
                      className="float-start"
                    />
                    <span className="flex-fill">PAYCO 로그인</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
