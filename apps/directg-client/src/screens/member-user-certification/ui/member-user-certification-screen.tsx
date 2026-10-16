"use client";

import { useEffect, useState, type FormEvent } from "react";

import { postMemberAuthConfirm } from "@entities/member-auth";

/** legacy `pc/member/user_certification.html` head `<style>` 원문. */
const CERTIFICATION_CSS = `
main{
	min-height:450px;
}
`;

/** 진입 파라미터(선행 find_password가 저장) — `{ m_id, token }`. */
const CERTIFICATION_STATE_KEY = "dg_user_certification";
/** 후속 find_password_reset 진입 파라미터 — `{ m_id, token, auth_code }`. */
const RESET_STATE_KEY = "dg_password_reset";

interface CertificationEntry {
  m_id: string;
  token: string;
}

/** sessionStorage에서 진입 파라미터를 읽는다. 없거나 파싱 실패 시 빈 값. */
function readEntry(): CertificationEntry {
  const empty: CertificationEntry = { m_id: "", token: "" };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.sessionStorage.getItem(CERTIFICATION_STATE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<CertificationEntry>;
    return { m_id: parsed.m_id ?? "", token: parsed.token ?? "" };
  } catch {
    return empty;
  }
}

/**
 * 비밀번호 찾기 - 인증번호 입력 (legacy `pc/member/user_certification.html`).
 * 인증 성공 시 alert 후 `find_password_reset.html`로 이동(m_id/token/auth_code 전달).
 * 서버 가드 없음(legacy도 m_id/token만 읽고 렌더).
 */
export function MemberUserCertificationScreen() {
  const [mId, setMId] = useState("");
  const [token, setToken] = useState("");
  const [authCode, setAuthCode] = useState("");

  useEffect(() => {
    const entry = readEntry();
    setMId(entry.m_id);
    setToken(entry.token);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = await postMemberAuthConfirm({ email: mId, token, auth_code: authCode });
      if (data.error_code === "0") {
        window.alert(data.msg);
        // legacy passwordResetFrm: auth_code/token은 응답값, m_id는 선행 값.
        window.sessionStorage.setItem(
          RESET_STATE_KEY,
          JSON.stringify({ m_id: mId, token: data.token ?? "", auth_code: data.auth_code ?? "" }),
        );
        window.location.href = "/member/find_password_reset";
      } else {
        window.alert(data.msg);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      window.alert(`비밀번호찾기 중 오류가 발생했습니다. ${message}`);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CERTIFICATION_CSS }} />
      <main>
        <div className="container text-center">
          <div className="row justify-content-md-center mt-5">
            <div className="col-md-auto">
              <div className="row justify-content-center">
                <div className="col-12">
                  <div className="card shadow-none rounded-0">
                    <div className="mb-1 border-bottom">
                      <h4 className="fs-4 text-center py-3 fw-bold my-0">
                        비밀번호 찾기 - 인증번호 입력
                      </h4>
                    </div>
                    <div className="card-body p-4">
                      <p className="text-muted mb-4 text-start">
                        받으신 안내메일의 인증번호를 입력해 주세요.
                      </p>
                      <form
                        name="memberFrm"
                        id="memberFrm"
                        method="post"
                        action="/member/join_proc.php"
                        className="needs-validation p-2"
                        onSubmit={handleSubmit}
                      >
                        <input type="hidden" name="mode" value="authConfirm" readOnly />
                        <input type="hidden" name="email" value={mId} readOnly />
                        <input type="hidden" name="token" value={token} readOnly />
                        <div className="g-3 row">
                          <div className="col-12 text-start">
                            <label htmlFor="auth_code" className="form-label font-14">
                              인증번호
                            </label>
                            <input
                              className="form-control form-control-lg rounded-0"
                              type="text"
                              id="auth_code"
                              name="auth_code"
                              placeholder="메일로 전송받은 인증번호"
                              required
                              value={authCode}
                              onChange={(event) => setAuthCode(event.target.value)}
                            />
                          </div>
                          <div className="col-12">
                            <button className="btn btn-lg btn-primary shadow-none">확인</button>
                          </div>
                        </div>
                      </form>
                    </div>
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
