"use client";

import { useState, type FormEvent } from "react";

import { postMemberCheckId, postMemberJoin } from "@entities/member-auth";
import { JoinStepNav } from "@widgets/join-step-nav";

interface MemberJoinStep3ScreenProps {
  /** step2 쿼리에서 전달(마케팅 동의). */
  isMailling: string;
  /** step2엔 없어 빈값(legacy 주석). */
  isEvent: string;
}

const PWD_RULE_MSG =
  "비밀번호는 영문소문자, 숫자, 특수문자를 포함 8자리 이상 ~ 16이하로 입력해주세요.";

/**
 * 회원가입 Step 3 — 정보입력 (legacy `pc/member/join_step3.html`, 본인인증 블록 주석 제외).
 * 이메일 중복확인 + 비번검증 + 가입(join_proc). hCaptcha·visitorId는 stub(개발 단계).
 * 죽은 KCP hidden 필드/본인확인 UI는 미렌더(생략) — behavior-neutral.
 */
export function MemberJoinStep3Screen({ isMailling, isEvent }: MemberJoinStep3ScreenProps) {
  const [mId, setMId] = useState("");
  const [mPwd, setMPwd] = useState("");
  const [mPwdRe, setMPwdRe] = useState("");
  const [idChk, setIdChk] = useState("");

  const handleIdCheck = async () => {
    if (mId === "") {
      window.alert("아이디를 입력하세요.");
      return;
    }
    try {
      const data = await postMemberCheckId(mId);
      if (data.error_code === "1") {
        window.alert(data.msg);
        setIdChk("");
        setMId("");
        return;
      }
      setIdChk("1");
      window.alert("등록이 가능한 아이디입니다.");
    } catch {
      window.alert("에러입니다.");
    }
  };

  const doJoin = async (hCaptchaToken: string) => {
    try {
      const data = await postMemberJoin({
        m_id: mId,
        m_pwd: mPwd,
        m_pwd_re: mPwdRe,
        is_mailling: isMailling,
        is_event: isEvent,
        visitorId: "",
        hCaptchaToken,
      });
      if (data.error_code === "0") {
        window.location.href = "/member/join_step4";
      } else {
        window.alert(data.msg);
      }
    } catch {
      window.alert("회원가입 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pwd = mPwd;

    if (idChk === "") {
      window.alert("아이디 중복확인을 하세요.");
      return;
    }
    if (pwd.length < 8 || pwd.length > 16) {
      window.alert(PWD_RULE_MSG);
      return;
    }
    const hasNum = /[0-9]/.test(pwd);
    const hasEng = /[a-z]/i.test(pwd);
    const hasSpe = /[`~!#$%^&*()|\\'_";:/?]/i.test(pwd);
    if (!hasNum || !hasEng || !hasSpe) {
      window.alert(PWD_RULE_MSG);
      return;
    }
    if (/\s/.test(pwd)) {
      window.alert("비밀번호는 공백없이 입력해주세요.");
      return;
    }
    if (/[^0-9a-z`~!#$%^&*()|\\'_";:/?]/i.test(pwd)) {
      window.alert("비밀번호에 사용할 수 없는 문자가 포함되어 있습니다.");
      return;
    }
    if (mPwd !== mPwdRe) {
      window.alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    // TODO(후속): 실제 hCaptcha. 개발 단계는 stub 토큰.
    void doJoin("dev-stub");
  };

  return (
    <div className="container my-3 pb-5">
      <main>
        <JoinStepNav current={3} />

        <div className="row">
          <div className="offset-1 col-10">
            <div className="card shadow-none mb-5 border rounded-0">
              <div className="card-header py-3 font-16 bg-body-secondary">
                <h5 className="text-center pb-0 fw-bold my-0">기본정보 입력</h5>
              </div>
              <div className="card-body p-2">
                <form
                  name="form_auth"
                  id="form_auth"
                  method="post"
                  className="p-3 shadow-none border-0"
                  onSubmit={handleSubmit}
                >
                  <input type="hidden" id="mode" name="mode" value="join" readOnly />
                  <input
                    type="hidden"
                    id="is_mailling"
                    name="is_mailling"
                    value={isMailling}
                    readOnly
                  />
                  <input type="hidden" id="is_event" name="is_event" value={isEvent} readOnly />
                  <input type="hidden" id="id_chk" name="id_chk" value={idChk} readOnly />
                  <input type="hidden" id="visitorId" name="visitorId" value="" readOnly />
                  <div className="mb-3 row align-items-center">
                    <label htmlFor="m_id" className="col-sm-2 col-form-label font-14">
                      아이디(이메일주소)
                    </label>
                    <div className="col-sm-4">
                      <input
                        className="form-control form-control-lg shadow-none"
                        type="email"
                        id="m_id"
                        name="m_id"
                        placeholder="아이디(이메일주소)를 입력해주세요"
                        required
                        value={mId}
                        onChange={(e) => setMId(e.target.value)}
                      />
                    </div>
                    <div className="col-auto">
                      <button
                        type="button"
                        className="btn btn-dark shadow-none"
                        id="btn_id_chk"
                        name="btn_id_chk"
                        onClick={handleIdCheck}
                      >
                        아이디 중복확인
                      </button>
                    </div>
                  </div>
                  <div className="mb-3 row">
                    <label htmlFor="m_pwd" className="col-sm-2 col-form-label font-14">
                      비밀번호
                    </label>
                    <div className="col-sm-4">
                      <input
                        className="form-control form-control-lg"
                        type="password"
                        id="m_pwd"
                        name="m_pwd"
                        required
                        placeholder="비밀번호를 입력해 주세요"
                        value={mPwd}
                        onChange={(e) => setMPwd(e.target.value)}
                      />
                    </div>
                    <div className="col-sm-6">
                      <span id="passwordHelpInline" className="form-text">
                        영문소문자, 숫자, 특수문자를 포함하여 8자이상 16이하로 사용이 가능합니다.
                        (@는 포함하실수 없습니다.)
                      </span>
                    </div>
                  </div>
                  <div className="mb-3 row">
                    <label htmlFor="m_pwd_re" className="col-sm-2 col-form-label font-14">
                      비밀번호확인
                    </label>
                    <div className="col-sm-4">
                      <input
                        className="form-control form-control-lg"
                        type="password"
                        id="m_pwd_re"
                        name="m_pwd_re"
                        required
                        placeholder="비밀번호확인을 입력해주세요"
                        value={mPwdRe}
                        onChange={(e) => setMPwdRe(e.target.value)}
                      />
                    </div>
                    <div className="col-sm-6">
                      <span id="passwordHelpInline" className="form-text">
                        영문소문자, 숫자, 특수문자를 포함하여 8자이상 16이하로 사용이 가능합니다.
                        (@는 포함하실수 없습니다.)
                      </span>
                    </div>
                  </div>

                  <div className="d-grid gap-2 col-6 mx-auto mt-5">
                    <button className="btn btn-primary btn-lg shadow-none" type="submit">
                      가입완료
                    </button>
                  </div>

                  <div id="hcaptcha-container"></div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
