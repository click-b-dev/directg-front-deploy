"use client";

import { useEffect, useState, type FormEvent } from "react";

import { postMemberLogin, openSnsLoginPopup, type SnsProvider } from "@entities/member-auth";

/** legacy `pc/member/login.html` head `<style>` 원문. */
const LOGIN_CSS = `
main{
	min-height:450px;
}

.login_form{
	width: 388px;
	margin-bottom: 26px;
}

.login_form form{
	width: 340px;
	margin-top: 19px;
}

.login_form input{
	width: 340px;
	height: 49px;
	margin-bottom: 10px;
}

.login_form #btn_login{
	margin-top: 2px;
	margin-bottom: 16px;
	height: 49px;
}

.bar{
	width: 18px;
	height: 15px;
	border-right: 2px solid rgba(var(--bs-secondary-rgb), 0.25);
}

.join{
	padding-left: 18px;
}

.bar_horizon{
	margin-top: 17px;
	margin-bottom: 16px;
}

.sns-login form{
	width: 204px;
	height: 81px;
	margin-bottom: 17px;
}

#btn_login_naver{
	cursor: pointer;
}
#btn_login_kakao{
	cursor: pointer;
}
#btn_login_payco{
	cursor: pointer;
}


.sns-login button{
	width: 340px;
	height: 60px;
}

input:focus::placeholder{
	color:transparent;
}

input:focus::-ms-input-placeholder{
	color:transparent;
}
`;

/**
 * 로그인 (legacy `pc/member/login.html`).
 * 세션은 백엔드 httpOnly 쿠키(성공 시 서버 set) — 프론트는 로그인 API 호출 후 `return_url||"/"`로 이동.
 * hCaptcha는 MSW 개발 단계 stub(실제 위젯/키는 백엔드 연동 시). SNS는 팝업 진입까지(콜백/가입은 후속 단위).
 */
export function MemberLoginScreen() {
  const [mId, setMId] = useState("");
  const [mPwd, setMPwd] = useState("");
  const [returnUrl, setReturnUrl] = useState("");

  // legacy: HTTP_REFERER가 directg.net 포함 시 return_url로 사용.
  useEffect(() => {
    const referer = document.referrer;
    setReturnUrl(referer.includes("directg.net") ? referer : "");
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
    // TODO(후속): 실제 hCaptcha 위젯(runCaptcha → onCaptchaSuccess). 개발 단계는 stub 토큰.
    void doLogin("dev-stub");
  };

  const handleSnsLogin = (provider: SnsProvider) => {
    void openSnsLoginPopup(provider);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LOGIN_CSS }} />
      <main>
        <div className="container text-center">
          <div className="row mt-5">
            <div className="d-flex justify-content-center">
              <div className="login_form">
                <div>
                  <span className="font-19 text-center py-3 fw-bold my-0 text-white">
                    기존회원 로그인
                  </span>
                </div>
                <div className="d-flex flex-column justify-content-center">
                  <form
                    className="needs-validation p-0 align-self-center"
                    id="memberFrm"
                    name="memberFrm"
                    method="POST"
                    action="login_proc.php"
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
                        className="form-control form-control-lg rounded-0 bg-light border-0"
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
                          className="form-control form-control-lg rounded-0 bg-light border-0"
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
                        className="btn btn-lg btn-primary w-100 font-17 fw-500"
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
                        className="font-13 text-secondary text-decoration-none hover-70"
                      >
                        비밀번호 찾기
                      </a>
                    </div>
                    <div className="bar align-self-center"></div>
                    <div className="join">
                      <a
                        href="/member/join_step1"
                        className="font-13 text-secondary text-decoration-none hover-70"
                      >
                        회원가입
                      </a>
                    </div>
                  </div>
                  <div className="border border-bottom bar_horizon border-secondary opacity-25"></div>
                </div>
                <div>
                  <span className="font-19 text-center py-3 fw-bold my-0 text-white">
                    간편로그인
                  </span>
                </div>
                <div className="d-flex flex-column justify-content-center sns-login">
                  <form className="align-self-center">
                    <div className="d-flex justify-content-between h-100">
                      <div
                        className="d-flex flex-column justify-content-between"
                        id="btn_login_naver"
                        onClick={() => handleSnsLogin("naver")}
                      >
                        <img
                          src="/assets/images/member/naver_login_circle.png"
                          className="float-start hover-70"
                        />
                        <span className="">네이버</span>
                      </div>
                      <div
                        className="d-flex flex-column justify-content-between"
                        id="btn_login_kakao"
                        onClick={() => handleSnsLogin("kakao")}
                      >
                        <img
                          src="/assets/images/member/kakao_login_circle.png"
                          className="float-start hover-70"
                        />
                        <span className="">카카오</span>
                      </div>
                      <div
                        className="d-flex flex-column justify-content-between"
                        id="btn_login_payco"
                        onClick={() => handleSnsLogin("payco")}
                      >
                        <img
                          src="/assets/images/member/payco_login_circle.png"
                          className="float-start hover-70"
                        />
                        <span className="">페이코</span>
                      </div>
                    </div>
                  </form>
                  <div className="d-flex align-self-center">
                    <a
                      href="https://safelogin.kr/sauth/regist?site_code=OG&sub_code=0"
                      target="_blank"
                      title="로그인플러스"
                      id="loginplus_banner"
                      className="text-decoration-none"
                    >
                      <button
                        className="btn btn-block shadow-none p-0 d-flex flex-column align-items-center btn-outline-primary justify-content-center "
                        id=""
                      >
                        <span className="font-16 text-secondary fw-500">휴대폰간편로그인</span>
                        <span className="font-14 text-secondary">로그인플러스유료서비스광고AD</span>
                      </button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
