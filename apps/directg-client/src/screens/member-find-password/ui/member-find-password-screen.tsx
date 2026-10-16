"use client";

import { useState, type FormEvent } from "react";

import { postMemberFindPassword } from "@entities/member-auth";

/** legacy `pc/member/find_password.html` head `<style>` 원문. */
const FIND_PASSWORD_CSS = `
main{
	min-height:450px;
}
`;

/** user_certification 진입 파라미터 저장 키 — `{ m_id, token }`(회원 인증 체인 client state). */
const CERTIFICATION_STATE_KEY = "dg_user_certification";

/**
 * 비밀번호 찾기 - 가입여부확인 (legacy `pc/member/find_password.html`).
 * 성공 시 alert 후 `{ m_id, token }`을 sessionStorage에 담아 `/member/user_certification.html`로 이동.
 * legacy는 hidden form POST였으나, Next 페이지 라우트는 POST body를 못 읽으므로 client state + GET 이동으로 대체(동작 동일, URL parity 유지).
 */
export function MemberFindPasswordScreen() {
  const [email, setEmail] = useState("");

  const goToCertification = (mId: string, token: string) => {
    window.sessionStorage.setItem(CERTIFICATION_STATE_KEY, JSON.stringify({ m_id: mId, token }));
    window.location.href = "/member/user_certification";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = await postMemberFindPassword({ email });
      if (data.error_code === "0") {
        window.alert(data.msg);
        goToCertification(data.m_id ?? email, data.token ?? "");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      window.alert(`비밀번호찾기 중 오류가 발생했습니다. ${message}`);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FIND_PASSWORD_CSS }} />
      <main>
        <div className="container text-center">
          <div className="row justify-content-md-center mt-5">
            <div className="col-md-auto">
              <div className="row justify-content-center">
                <div className="col-12">
                  <div className="card shadow-none rounded-0">
                    <div className="mb-1 border-bottom">
                      <h4 className="fs-4 text-center py-3 fw-bold my-0">
                        비밀번호 찾기 - 가입여부확인
                      </h4>
                    </div>
                    <div className="card-body p-4">
                      <p className="text-muted mb-4 text-start">
                        가입한 회원아이디(이메일)을 입력하시면 임시비밀번호를 발급하여 메일로
                        보내드립니다.
                      </p>
                      <form
                        name="passwordFrm"
                        id="passwordFrm"
                        method="post"
                        action="/member/join_proc.php"
                        className="needs-validation p-2"
                        onSubmit={handleSubmit}
                      >
                        <input type="hidden" name="mode" value="findpassword" readOnly />
                        <div className="g-3 row">
                          <div className="col-12 text-start">
                            <label htmlFor="email" className="form-label font-14">
                              아이디(이메일주소)
                            </label>
                            <input
                              className="form-control form-control-lg rounded-0"
                              type="email"
                              id="email"
                              name="email"
                              placeholder="가입한 아이디(이메일주소)를 입력해주세요"
                              required
                              value={email}
                              onChange={(event) => setEmail(event.target.value)}
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
