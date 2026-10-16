"use client";

import { useEffect, useState, type FormEvent } from "react";

import { postMemberCheckId, postMemberJoin } from "@entities/member-auth";

/** 회원가입 join 플로우 상태 키 — step2가 저장한 동의값. */
const JOIN_STATE_KEY = "dg_mobile_join";

const PWD_RULE_MSG =
  "비밀번호는 영문소문자, 숫자, 특수문자를 포함 8자리 이상 ~ 16이하로 입력해주세요.";

interface JoinState {
  is_private: string;
  is_agreement: string;
  is_mailling: string;
  is_sms: string;
  is_event: string;
}

/** sessionStorage에서 step2 동의값을 읽는다. 없으면 빈 값(가드에서 걸림). */
function readJoinState(): JoinState {
  const empty: JoinState = {
    is_private: "",
    is_agreement: "",
    is_mailling: "",
    is_sms: "",
    is_event: "",
  };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.sessionStorage.getItem(JOIN_STATE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<JoinState>;
    return {
      is_private: parsed.is_private ?? "",
      is_agreement: parsed.is_agreement ?? "",
      is_mailling: parsed.is_mailling ?? "",
      is_sms: parsed.is_sms ?? "",
      is_event: parsed.is_event ?? "",
    };
  } catch {
    return empty;
  }
}

/**
 * 모바일 회원가입 - 정보입력 (legacy `mobile/member/join_step3.html`).
 * 진입 가드: `is_private<>"Y" && is_agreement<>"Y"`(둘 다 Y 아니면) → "잘못된 접근입니다."(legacy AND 조건 그대로).
 * 아이디 중복확인 + 비번검증 5종 + hCaptcha(stub) + 가입(join_proc). error_code 0/2 → join_step4, else alert.
 * visitorId·hCaptcha는 PC 선례대로 stub(Fingerprint2/실제 위젯 미도입).
 */
export function MobileMemberJoinStep3Screen() {
  const [access, setAccess] = useState<boolean | null>(null);
  const [state, setState] = useState<JoinState | null>(null);
  const [mId, setMId] = useState("");
  const [mPwd, setMPwd] = useState("");
  const [mPwdRe, setMPwdRe] = useState("");
  const [idChk, setIdChk] = useState("");

  useEffect(() => {
    const s = readJoinState();
    setState(s);
    // legacy 가드: 둘 다 Y가 아니면 차단(하나라도 Y면 통과).
    if (s.is_private !== "Y" && s.is_agreement !== "Y") {
      setAccess(false);
    } else {
      setAccess(true);
    }
  }, []);

  const handleGoBack = () => {
    window.history.back();
  };

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
        is_mailling: state?.is_mailling ?? "",
        is_event: state?.is_event ?? "",
        visitorId: "",
        hCaptchaToken,
      });
      // legacy: error_code 0 성공, 2(해외차단)도 join_step4 진행(quirk), 그 외 alert.
      if (data.error_code === "0") {
        window.location.href = "/member/join_step4";
      } else if (data.error_code === "2") {
        window.alert(data.msg);
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
    // TODO(후속): 실제 hCaptcha 위젯(runCaptcha → onCaptchaSuccess). 개발 단계는 stub 토큰(PC 선례).
    void doJoin("dev-stub");
  };

  if (access === null) return null;
  // legacy 가드 실패: plain text만 출력(HTML 미출력).
  if (access === false) return <>잘못된 접근입니다.</>;

  return (
    <>
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
        <div className="pageTitle">회원가입</div>
        <div className="right"></div>
      </div>
      <div className="extraHeader p-0">
        <div className="form-wizard-section">
          <a href="#" className="button-item">
            <strong>1</strong>
            <p className="font-12">가입방법 선택</p>
          </a>
          <a href="#" className="button-item">
            <strong>2</strong>
            <p className="font-12">약관동의</p>
          </a>
          <a href="#" className="button-item active text-primary">
            <ion-icon
              name="checkmark-outline"
              role="img"
              className="md hydrated bg-primary rounded-3"
              aria-label="checkmark outline"
            ></ion-icon>
            <p className="font-12">정보입력</p>
          </a>
          <a href="#" className="button-item">
            <strong>4</strong>
            <p className="font-12">가입완료</p>
          </a>
        </div>
      </div>
      <div id="appCapsule" className="extra-header-active mt-0">
        <div className="section full">
          <div className="card mb-3" id="email_login">
            <div className="card-header text-center">
              <h5 className="card-title">정보입력</h5>
            </div>
            <div className="card-body">
              <form
                className="needs-validation mb-0"
                id="form_auth"
                name="form_auth"
                method="POST"
                onSubmit={handleSubmit}
              >
                <input type="hidden" id="mode" name="mode" value="join" readOnly />
                <input
                  type="hidden"
                  id="is_mailling"
                  name="is_mailling"
                  value={state?.is_mailling ?? ""}
                  readOnly
                />
                <input
                  type="hidden"
                  id="is_sms"
                  name="is_sms"
                  value={state?.is_sms ?? ""}
                  readOnly
                />
                <input
                  type="hidden"
                  id="is_event"
                  name="is_event"
                  value={state?.is_event ?? ""}
                  readOnly
                />
                <input type="hidden" id="id_chk" name="id_chk" value={idChk} readOnly />
                <input type="hidden" id="visitorId" name="visitorId" value="" readOnly />

                <div className="g-3 row">
                  <div className="col-12">
                    <label className="form-label font-14" htmlFor="m_id">
                      아이디(이메일)
                    </label>
                    <div className="input-group">
                      <input
                        placeholder="아이디(이메일)를 입력해주세요."
                        id="m_id"
                        className="form-control rounded-0"
                        type="email"
                        name="m_id"
                        required
                        autoComplete="off"
                        value={mId}
                        onChange={(e) => setMId(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary shadow-none rounded-0"
                        id="btn_id_chk"
                        name="btn_id_chk"
                        onClick={handleIdCheck}
                      >
                        아이디 중복확인
                      </button>
                    </div>
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
                  <div className="col-12">
                    <div className="password-field position-relative">
                      <label className="form-label font-14" htmlFor="m_pwd_re">
                        비밀번호 확인
                      </label>
                      <div className="password-field position-relative">
                        <input
                          placeholder="비밀번호를 입력해 주세요"
                          id="m_pwd_re"
                          className="form-control rounded-0"
                          type="password"
                          name="m_pwd_re"
                          required
                          autoComplete="off"
                          value={mPwdRe}
                          onChange={(e) => setMPwdRe(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="d-grid col-12">
                    <div id="hcaptcha-container"></div>
                    <button type="submit" className="btn btn-lg btn-primary">
                      회원가입
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
