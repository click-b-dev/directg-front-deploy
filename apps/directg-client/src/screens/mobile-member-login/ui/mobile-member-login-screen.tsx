"use client";

import { useEffect, useState, type FormEvent } from "react";

import { postMemberLogin, openSnsLoginPopup, type SnsProvider } from "@entities/member-auth";

/** legacy `mobile/member/login.html` head `<style>` 원문(모바일). */
const LOGIN_CSS = `
main{
	min-height:450px;
}

.login_form{
	width: 100%;
	margin-bottom: 2rem;
}

.login_form form{
	margin-top: 1.5rem;
}

.login_form input{
	margin-bottom: 0.75rem;
	padding-top: 1rem;
	padding-bottom: 1rem;
}

.login_form input::placeholder{
	color: #CED4DA;
}

.login_form #btn_login{
	margin-bottom: 1rem;
	padding-top: 0.75rem;
	padding-bottom: 0.75rem;
}

.bar{
	width: 1rem;
	height: 1rem;
	border-right: 2px solid rgba(var(--bs-secondary-rgb), 0.25);
	box-sizing: content-box;
}

.join{
	padding-left: 1rem;
}

.bar_horizon{
	margin-top: 1rem;
	margin-bottom: 1rem;
}

.sns-login form{
	min-width: 200px;
	margin-bottom: 1rem;
}

#btn_login_naver{
	cursor: pointer;
	padding-left: 0.5625rem;
	padding-right: 0.5625rem;
}

#btn_login_kakao{
	cursor: pointer;
	padding-left: 0.5625rem;
	padding-right: 0.5625rem;
}

#btn_login_payco{
	cursor: pointer;
	padding-left: 0.5625rem;
	padding-right: 0.5625rem;
}

.sns-login button{
	padding-top: 0.575rem;
	padding-bottom: 0.575rem;
}

.sns-login img{
	width: 3.5rem;
}

input:focus::placeholder{
	color:transparent;
}

input:focus::-ms-input-placeholder{
	color:transparent;
}
`;

/**
 * 모바일 로그인 (legacy `mobile/member/login.html`).
 * 세션은 백엔드 httpOnly 쿠키(성공 시 서버 set). hCaptcha는 PC 선례대로 개발 단계 stub(실제 위젯은 백엔드 연동 시).
 * SNS는 팝업 진입까지(콜백/가입은 후속 join 단위). return_url·LastUrl은 legacy 모바일 로직 재현.
 */
export function MobileMemberLoginScreen() {
  const [mId, setMId] = useState("");
  const [mPwd, setMPwd] = useState("");
  const [returnUrl, setReturnUrl] = useState("/");

  // legacy 모바일: referer가 (m.)directg.net 포함 시 referer, 아니면 "/". login.html이면 "/". LastUrl 미설정 시 초기화.
  // 단일 도메인 이관이라 host 판정은 PC 선례대로 "directg.net"(m 포함) 사용.
  useEffect(() => {
    const referer = document.referrer;
    let url = referer.includes("directg.net") ? referer : "/";
    if (referer.includes("/member/login")) url = "/";
    setReturnUrl(url);
    if (!window.sessionStorage.getItem("LastUrl")) {
      window.sessionStorage.setItem("LastUrl", url);
    }
  }, []);

  const doLogin = async (hCaptchaToken: string) => {
    try {
      const data = await postMemberLogin({
        m_id: mId,
        m_pwd: mPwd,
        return_url: returnUrl,
        hCaptchaToken,
      });
      if (data.error_code === "0" || data.error_msg === "OK") {
        window.location.href = returnUrl ? returnUrl : "/";
      } else {
        window.alert(data.error_msg);
      }
    } catch {
      window.alert("로그인 처리 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mId === "") {
      window.alert("아이디를 입력해주세요.");
      return;
    }
    if (mPwd === "") {
      window.alert("비밀번호를 입력해주세요.");
      return;
    }
    // TODO(후속): 실제 hCaptcha 위젯(runCaptcha → onCaptchaSuccess). 개발 단계는 stub 토큰(PC 선례).
    void doLogin("dev-stub");
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleSnsLogin = (provider: SnsProvider) => {
    void openSnsLoginPopup(provider);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LOGIN_CSS }} />
      <div className="appHeader bg-cprimary text-light">
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
        <div className="section">
          <div className="d-flex justify-content-center pt-3">
            <div className="login_form text-center">
              <div className="login_title">
                <span className="fs-19 text-center py-3 fw-bold my-0 text-white">
                  기존회원 로그인
                </span>
              </div>
              <div className="d-flex flex-column justify-content-center">
                <form
                  className="needs-validation p-0 align-self-center mb-0 w-100"
                  id="loginFrm"
                  name="loginFrm"
                  method="POST"
                  onSubmit={handleSubmit}
                >
                  <input
                    type="hidden"
                    name="return_url"
                    id="return_url"
                    value={returnUrl}
                    readOnly
                  />
                  <div className="d-flex flex-column">
                    <label className="" htmlFor="m_id"></label>
                    <input
                      placeholder="아이디(이메일)"
                      id="m_id"
                      className="form-control form-control-lg rounded-0 bg-clight border-0 w-100 fs-13"
                      type="email"
                      name="m_id"
                      required
                      autoComplete="off"
                      value={mId}
                      onChange={(e) => setMId(e.target.value)}
                    />
                    <label className="" htmlFor="m_pwd"></label>
                    <div className="password-field position-relative">
                      <input
                        placeholder="비밀번호"
                        id="m_pwd"
                        className="form-control form-control-lg rounded-0 bg-clight border-0 w-100 fs-13"
                        type="password"
                        name="m_pwd"
                        required
                        autoComplete="off"
                        value={mPwd}
                        onChange={(e) => setMPwd(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="">
                    <div id="hcaptcha-container"></div>
                    <button
                      type="submit"
                      className="btn btn-lg btn-cprimary w-100 font-17 fw-500 h-100"
                      id="btn_login"
                    >
                      로그인
                    </button>
                  </div>
                </form>
                <div className="d-flex align-self-center">
                  <div>
                    <a
                      href="/member/find_password"
                      className="fs-13 text-csecondary text-decoration-none active-70"
                    >
                      비밀번호 찾기
                    </a>
                  </div>
                  <div className="bar align-self-center"></div>
                  <div className="join">
                    <a
                      href="/member/join_step1"
                      className="fs-13 text-csecondary text-decoration-none active-70"
                    >
                      회원가입
                    </a>
                  </div>
                </div>
                <div className="border border-bottom border-csecondary opacity-25 bar_horizon"></div>
              </div>
              <div>
                <span className="text-center py-3 fw-bold my-0 text-white fs-16">간편로그인</span>
              </div>
              <div className="d-flex flex-column justify-content-center sns-login w-100">
                <form className="align-self-center">
                  <div className="d-flex justify-content-between h-100 g-5">
                    <div
                      className="d-flex flex-column justify-content-between"
                      id="btn_login_naver"
                      onClick={() => handleSnsLogin("naver")}
                    >
                      <img
                        src="/mobile-assets/images/member/naver.svg"
                        className="float-start active-70"
                      />
                      <span className="fs-12 text-secondary">네이버</span>
                    </div>
                    <div
                      className="d-flex flex-column justify-content-between"
                      id="btn_login_kakao"
                      onClick={() => handleSnsLogin("kakao")}
                    >
                      <img
                        src="/mobile-assets/images/member/kakao.svg"
                        className="float-start active-70"
                      />
                      <span className="fs-12 text-secondary">카카오</span>
                    </div>
                    <div
                      className="d-flex flex-column justify-content-between"
                      id="btn_login_payco"
                      onClick={() => handleSnsLogin("payco")}
                    >
                      <img
                        src="/mobile-assets/images/member/payco.svg"
                        className="float-start active-70"
                      />
                      <span className="fs-12 text-secondary">페이코</span>
                    </div>
                  </div>
                </form>
                <div className="d-flex align-self-center w-100">
                  <a
                    href="https://safelogin.kr/sauth/regist?site_code=OG&sub_code=0"
                    target="_blank"
                    rel="noreferrer"
                    title="로그인플러스"
                    id="loginplus_banner"
                    className="text-decoration-none w-100"
                  >
                    <button className="btn btn-block shadow-none d-flex flex-column align-items-center btn-outline-cprimary justify-content-center w-100 h-100 active-70">
                      <span className="fs-16 text-secondary mb-1">휴대폰간편로그인</span>
                      <span className="fs-14 text-secondary fw-400">
                        로그인플러스유료서비스광고AD
                      </span>
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
