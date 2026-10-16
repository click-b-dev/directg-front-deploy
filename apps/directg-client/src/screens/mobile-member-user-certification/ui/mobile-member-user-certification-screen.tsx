"use client";

import { useEffect, useState } from "react";

import { getMemberExists, postMemberOtpSend } from "@entities/member-auth";

/** legacy `mobile/member/user_certification.html` head `<style>` 원문. */
const CERTIFICATION_CSS = `
#appCapsuleSub{
	padding-top:56px;
}
`;

/** 비번찾기 체인 진입 파라미터 키 — find_password가 `{m_id}` 저장, 여기서 `{m_id, token, gubun}`로 확장. */
const PW_FIND_STATE_KEY = "dg_mobile_pw_find";
const GUBUN = "password";

/** 진입 파라미터에서 m_id를 읽는다. 없으면 빈 값(가드에서 미존재 취급). */
function readMId(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = window.sessionStorage.getItem(PW_FIND_STATE_KEY);
    if (!raw) return "";
    const parsed = JSON.parse(raw) as { m_id?: string };
    return parsed.m_id ?? "";
  } catch {
    return "";
  }
}

/**
 * 모바일 비밀번호 찾기 - 인증번호 발송 (legacy `mobile/member/user_certification.html`).
 * 진입 가드: `isMemberChk2(m_id)` 미존재 → alert "일치하는 회원이 존재하지 않습니다." + find_password 복귀.
 * "인증번호 받기" → OTP 발송(authEmail) → alert(msg) → token 담아 confirm으로 이동.
 */
export function MobileMemberUserCertificationScreen() {
  const [mId, setMId] = useState("");
  const [memberOk, setMemberOk] = useState<boolean | null>(null);

  useEffect(() => {
    const id = readMId();
    setMId(id);
    let cancelled = false;
    // legacy: 서버 진입 시 isMemberChk2. 미존재 → 문구 alert 후 find_password 복귀.
    getMemberExists(id)
      .then((res) => {
        if (cancelled) return;
        if (res.exists) {
          setMemberOk(true);
        } else {
          setMemberOk(false);
          window.alert("일치하는 회원이 존재하지 않습니다.");
          window.location.href = "/member/find_password";
        }
      })
      .catch(() => {
        if (cancelled) return;
        setMemberOk(false);
        window.alert("일치하는 회원이 존재하지 않습니다.");
        window.location.href = "/member/find_password";
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSendOtp = async () => {
    try {
      const data = await postMemberOtpSend({ m_id: mId, gubun: GUBUN });
      window.alert(data.msg);
      window.sessionStorage.setItem(
        PW_FIND_STATE_KEY,
        JSON.stringify({ m_id: mId, token: data.token, gubun: GUBUN }),
      );
      window.location.href = "/member/user_certification_confirm";
    } catch {
      window.alert("에러");
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  // legacy는 가드 통과(회원 존재) 시에만 화면을 렌더한다. 판정 전/실패 시 빈 렌더.
  if (memberOk !== true) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CERTIFICATION_CSS }} />
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
            <h1>인증번호 발송</h1>
            <h4>이메일({mId})로 인증번호가 발송됩니다.</h4>
          </div>
          <div className="section mt-2 mb-5">
            <form
              className="form-horizontal"
              name="formAuth"
              id="formAuth"
              method="post"
              action="user_certification_confirm"
            >
              <input type="hidden" name="mode" id="mode" value="authEmail" readOnly />
              <input type="hidden" name="authType" value="authEmail" readOnly />
              <input type="hidden" name="m_id" value={mId} readOnly />
              <input type="hidden" name="token" id="token" value="" readOnly />
              <input type="hidden" name="gubun" id="gubun" value={GUBUN} readOnly />
              <div className="form-button-group">
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg"
                  id="btn_auth"
                  onClick={handleSendOtp}
                >
                  인증번호 받기
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
