"use client";

import { useEffect, useState, type KeyboardEvent } from "react";

import { postMemberOtpVerify } from "@entities/member-auth";

/** legacy `mobile/member/user_certification_confirm.html` head `<style>` 원문. */
const CONFIRM_CSS = `
#appCapsuleSub{
	padding-top:56px;
}
`;

/** 비번찾기 체인 진입 파라미터 키 — user_certification이 `{m_id, token}` 저장, 여기서 `{m_id, token, auth_code}`로 확장. */
const PW_FIND_STATE_KEY = "dg_mobile_pw_find";

interface ConfirmEntry {
  m_id: string;
  token: string;
}

/** sessionStorage에서 m_id/token을 읽는다. 없으면 빈 값(token 가드에서 걸림). */
function readEntry(): ConfirmEntry {
  const empty: ConfirmEntry = { m_id: "", token: "" };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.sessionStorage.getItem(PW_FIND_STATE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<ConfirmEntry>;
    return { m_id: parsed.m_id ?? "", token: parsed.token ?? "" };
  } catch {
    return empty;
  }
}

/**
 * 모바일 비밀번호 찾기 - 인증번호 입력 (legacy `mobile/member/user_certification_confirm.html`).
 * 진입 가드: token 빈값 → alert "잘못된 접근입니다." + user_certification 복귀.
 * 확인/Enter → OTP 검증 → code=="ok"면 auth_code 담아 find_password_reset 이동, 아니면 alert(message).
 */
export function MobileMemberUserCertificationConfirmScreen() {
  const [mId, setMId] = useState("");
  const [token, setToken] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [tokenOk, setTokenOk] = useState<boolean | null>(null);

  useEffect(() => {
    const entry = readEntry();
    // legacy 서버 가드: token=="" → "잘못된 접근입니다." + user_certification 복귀.
    if (!entry.token) {
      setTokenOk(false);
      window.alert("잘못된 접근입니다.");
      window.location.href = "/member/user_certification";
      return;
    }
    setMId(entry.m_id);
    setToken(entry.token);
    setTokenOk(true);
  }, []);

  const verify = async () => {
    if (authCode === "") {
      window.alert("인증번호를 입력하세요.");
      return;
    }
    try {
      const data = await postMemberOtpVerify({ m_id: mId, token, auth_code: authCode });
      if (data.code === "ok") {
        window.sessionStorage.setItem(
          PW_FIND_STATE_KEY,
          JSON.stringify({ m_id: mId, token, auth_code: authCode }),
        );
        window.location.href = "/member/find_password_reset";
      } else {
        window.alert(data.message);
      }
    } catch {
      window.alert("에러");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void verify();
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  // legacy는 token 가드 통과 시에만 렌더. 판정 전/실패 시 빈 렌더.
  if (tokenOk !== true) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CONFIRM_CSS }} />
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
            <h1>인증번호 입력</h1>
            <h4>수신된 이메일의 인증번호를 입력해 주세요.</h4>
          </div>
          <div className="section mt-2 mb-5">
            <form
              name="formAuthConfirm"
              id="formAuthConfirm"
              method="post"
              onKeyDown={handleKeyDown}
            >
              <input type="hidden" name="token" value={token} readOnly />
              <input type="hidden" name="m_id" value={mId} readOnly />
              <div className="form-group boxed">
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-control"
                    id="auth_code"
                    name="auth_code"
                    placeholder=""
                    required
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                  />
                  <i className="clear-input" onClick={() => setAuthCode("")}>
                    <ion-icon name="close-circle" role="img" className="md hydrated"></ion-icon>
                  </i>
                </div>
              </div>
              <div className="form-button-group">
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg"
                  id="btn_auth_confirm"
                  onClick={() => void verify()}
                >
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
