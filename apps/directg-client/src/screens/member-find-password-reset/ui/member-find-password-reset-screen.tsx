"use client";

import { useEffect, useState, type FormEvent } from "react";

import { getMemberOtpStatus, postMemberResetPassword } from "@entities/member-auth";

/** legacy `pc/member/find_password_reset.html` head `<style>` 원문. */
const RESET_CSS = `
main{
	min-height:450px;
}
`;

/**
 * 진입 파라미터 저장 키. 선행 화면 `user_certification.html`(후속 이관)이 client 네비게이션 시
 * `{ m_id, token, auth_code }`를 sessionStorage에 담아 전달한다(legacy POST body 대체, URL parity 유지).
 */
const RESET_STATE_KEY = "dg_password_reset";

type GuardState = "loading" | "invalid_access" | "wrong_access" | "ok";

interface ResetEntry {
  m_id: string;
  token: string;
  auth_code: string;
}

/** sessionStorage에서 진입 파라미터를 읽는다. 없거나 파싱 실패 시 빈 값(legacy 미전달과 동일 취급). */
function readEntry(): ResetEntry {
  const empty: ResetEntry = { m_id: "", token: "", auth_code: "" };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.sessionStorage.getItem(RESET_STATE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<ResetEntry>;
    return {
      m_id: parsed.m_id ?? "",
      token: parsed.token ?? "",
      auth_code: parsed.auth_code ?? "",
    };
  } catch {
    return empty;
  }
}

/**
 * 비밀번호 찾기 - 재설정 (legacy `pc/member/find_password_reset.html`).
 * 진입 가드(legacy 순서): `getOtp(m_id).auth=='0'` → "비정상적인 접근", 이후 `!token` → "잘못된 접근입니다.".
 * 재설정 성공 시 alert 후 `/member/login.html` 이동.
 */
export function MemberFindPasswordResetScreen() {
  const [guard, setGuard] = useState<GuardState>("loading");
  const [mId, setMId] = useState("");
  const [mPwd, setMPwd] = useState("");
  const [mPwdRe, setMPwdRe] = useState("");

  useEffect(() => {
    const entry = readEntry();
    setMId(entry.m_id);
    let cancelled = false;
    // legacy: getOtp(m_id) 조회 후 auth 검사, 그다음 POST token 유무 검사.
    getMemberOtpStatus(entry.m_id)
      .then((status) => {
        if (cancelled) return;
        if (status.auth === "0") {
          setGuard("invalid_access");
        } else if (!entry.token) {
          setGuard("wrong_access");
        } else {
          setGuard("ok");
        }
      })
      .catch(() => {
        // getOtp 조회 실패 시 auth 판정 불가 → 남은 가드(token 유무)만 적용.
        if (cancelled) return;
        setGuard(entry.token ? "ok" : "wrong_access");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const pwd = mPwd;
    const num = pwd.search(/[0-9]/g);
    const eng = pwd.search(/[a-z]/gi);
    const spe = pwd.search(/[`~!#$%^&*()|\\'_";:\/?]/gi);
    const spe2 = pwd.match(/[^0-9a-z`~!#$%^&*()|\\'_";:\/?]/gi);
    const spa = /\s/.test(pwd);

    if (pwd.length < 8 || pwd.length > 16) {
      window.alert(
        "비밀번호는 영문소문자, 숫자, 특수문자를 포함 8자리 이상 ~ 16이하로 입력해주세요.",
      );
      return;
    }
    if (num < 0 || eng < 0 || spe < 0) {
      window.alert(
        "비밀번호는 영문소문자, 숫자, 특수문자를 포함 8자리 이상 ~ 16이하로 입력해주세요.",
      );
      return;
    }
    if (spa) {
      window.alert("비밀번호는 공백없이 입력해주세요.");
      return;
    }
    if (spe2) {
      window.alert("비밀번호에 사용할 수 없는 문자가 포함되어 있습니다.");
      return;
    }
    if (mPwd !== mPwdRe) {
      window.alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      const data = await postMemberResetPassword({ m_id: mId, m_pwd: mPwd, m_pwd_re: mPwdRe });
      if (data.error_code === "0") {
        window.alert(data.msg);
        window.location.href = "/member/login";
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      window.alert(`비밀번호찾기 중 오류가 발생했습니다. ${message}`);
    }
  };

  // legacy 가드는 DOCTYPE 이전 plain text echo + exit(HTML 미출력). 메시지 원문만 렌더.
  if (guard === "loading") return null;
  if (guard === "invalid_access") return <>비정상적인 접근</>;
  if (guard === "wrong_access") return <>잘못된 접근입니다.</>;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: RESET_CSS }} />
      <main>
        <div className="container text-center">
          <div className="row justify-content-md-center mt-5">
            <div className="col-md-auto">
              <div className="row justify-content-center">
                <div className="col-6">
                  <div className="card shadow-none rounded-0">
                    <div className="mb-1 border-bottom">
                      <h4 className="fs-4 text-center py-3 fw-bold my-0">비밀번호 찾기 - 재설정</h4>
                    </div>
                    <div className="card-body p-4">
                      <p className="text-muted mb-4 text-start">
                        사용하실 비밀번호를 입력해 주세요
                      </p>
                      <form
                        name="memberFrm"
                        id="memberFrm"
                        method="post"
                        action="/member/join_proc.php"
                        className="needs-validation p-2"
                        onSubmit={handleSubmit}
                      >
                        <input type="hidden" name="mode" value="resetpassword" readOnly />
                        <input type="hidden" name="m_id" value={mId} readOnly />
                        <div className="g-3 row">
                          <div className="col-12 text-start">
                            <label htmlFor="m_pwd" className="form-label font-14">
                              비밀번호
                            </label>
                            <input
                              className="form-control form-control-lg rounded-0"
                              type="password"
                              id="m_pwd"
                              name="m_pwd"
                              placeholder="비밀번호를 입력해 주세요."
                              required
                              value={mPwd}
                              onChange={(event) => setMPwd(event.target.value)}
                            />
                          </div>

                          <div className="col-12 text-start">
                            <label htmlFor="m_pwd_re" className="form-label font-14">
                              비밀번호 확인
                            </label>
                            <input
                              className="form-control form-control-lg rounded-0"
                              type="password"
                              id="m_pwd_re"
                              name="m_pwd_re"
                              placeholder="비밀번호확인을 입력해 주세요."
                              required
                              value={mPwdRe}
                              onChange={(event) => setMPwdRe(event.target.value)}
                            />
                          </div>
                          <div className="col-12 text-start">
                            <span id="passwordHelpInline" className="form-text">
                              영문소문자, 숫자, 특수문자를 포함하여 8자이상 16이하로 사용이
                              가능합니다. (@는 포함하실수 없습니다.)
                            </span>
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
