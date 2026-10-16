"use client";

import { useEffect, useState } from "react";

import { postMemberPasswordReset } from "@entities/member-auth";

/** legacy `mobile/member/find_password_reset.html` head `<style>` 원문. */
const RESET_CSS = `
#appCapsuleSub{
	padding-top:56px;
}
`;

/** 비번찾기 체인 진입 파라미터 키 — confirm이 `{m_id, token, auth_code}` 저장. */
const PW_FIND_STATE_KEY = "dg_mobile_pw_find";

interface ResetEntry {
  m_id: string;
  token: string;
}

/** sessionStorage에서 m_id/token을 읽는다. 없으면 빈 값(token 가드에서 걸림). */
function readEntry(): ResetEntry {
  const empty: ResetEntry = { m_id: "", token: "" };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.sessionStorage.getItem(PW_FIND_STATE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<ResetEntry>;
    return { m_id: parsed.m_id ?? "", token: parsed.token ?? "" };
  } catch {
    return empty;
  }
}

/**
 * 모바일 비밀번호 찾기 - 재설정 (legacy `mobile/member/find_password_reset.html`).
 * 진입 가드: token 빈값 → alert "잘못된 접근입니다." + find_password 복귀.
 * 확인 → 검증 3종(빈값/빈값/불일치) → 재설정 → code=="ok"면 find_password_complete 이동, 아니면 alert(message).
 * legacy body는 bg-white(흰 배경) — 라우트 style로 재현.
 */
export function MobileMemberFindPasswordResetScreen() {
  const [mId, setMId] = useState("");
  const [token, setToken] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newPwdRe, setNewPwdRe] = useState("");
  const [tokenOk, setTokenOk] = useState<boolean | null>(null);

  useEffect(() => {
    const entry = readEntry();
    // legacy 서버 가드: token=="" → "잘못된 접근입니다." + find_password 복귀.
    if (!entry.token) {
      setTokenOk(false);
      window.alert("잘못된 접근입니다.");
      window.location.href = "/member/find_password";
      return;
    }
    setMId(entry.m_id);
    setToken(entry.token);
    setTokenOk(true);
  }, []);

  const handleReset = async () => {
    if (newPwd === "") {
      window.alert("변경할 비밀번호를 입력하세요.");
      return;
    }
    if (newPwdRe === "") {
      window.alert("새 비밀번호 확인을 입력하세요.");
      return;
    }
    if (newPwd !== newPwdRe) {
      window.alert("변경할 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    try {
      const data = await postMemberPasswordReset({
        m_id: mId,
        token,
        new_pwd: newPwd,
        new_pwd_re: newPwdRe,
      });
      if (data.code === "ok") {
        window.location.href = "/member/find_password_complete";
      } else {
        window.alert(data.message);
      }
    } catch {
      window.alert("에러");
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  // legacy는 token 가드 통과 시에만 렌더. 판정 전/실패 시 빈 렌더.
  if (tokenOk !== true) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: RESET_CSS }} />
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
          <div className="section mt-2 mb-5">
            <form
              name="formReset"
              id="formReset"
              action="find_password_reset_proc.php"
              method="post"
            >
              <input type="hidden" name="m_id" value={mId} readOnly />
              <input type="hidden" name="token" value={token} readOnly />
              <div className="form-group boxed">
                <div className="input-wrapper">
                  <input
                    type="password"
                    className="form-control bg-white text-dark"
                    id="new_pwd"
                    name="new_pwd"
                    placeholder="영문대/소문자, 숫자, 특수문자 중 2가지 이상 조합하세요"
                    required
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                  />
                  <i className="clear-input" onClick={() => setNewPwd("")}>
                    <ion-icon name="close-circle"></ion-icon>
                  </i>
                </div>
              </div>
              <div className="form-group boxed">
                <div className="input-wrapper">
                  <input
                    type="password"
                    className="form-control bg-white text-dark"
                    id="new_pwd_re"
                    name="new_pwd_re"
                    placeholder="새 비밀번호 확인"
                    required
                    value={newPwdRe}
                    onChange={(e) => setNewPwdRe(e.target.value)}
                  />
                  <i className="clear-input" onClick={() => setNewPwdRe("")}>
                    <ion-icon name="close-circle"></ion-icon>
                  </i>
                </div>
              </div>
              <div className="form-button-group">
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg"
                  id="btn_reset"
                  onClick={handleReset}
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
