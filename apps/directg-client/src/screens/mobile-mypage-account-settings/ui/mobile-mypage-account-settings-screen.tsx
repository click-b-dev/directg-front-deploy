"use client";

import { useRef, useState, type FormEvent } from "react";

import {
  postPasswordChange,
  postMemberLeave,
  postCertReg,
  type MemberAccountInfo,
} from "@entities/mypage-account";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

interface MobileMypageAccountSettingsScreenProps {
  account: MemberAccountInfo;
}

const PWD_RULE_MSG =
  "비밀번호는 영문소문자, 숫자, 특수문자를 포함 8자리 이상 ~ 16이하로 입력해주세요.";

/**
 * 모바일 마이페이지 - 계정 설정 (legacy `mobile/mypage/account_settings.html`).
 * 프로필 readonly + 본인인증(is_auth Y→"인증됨"/else 버튼) + 비번변경 + 회원탈퇴(Bootstrap 모달) + KCP cert.
 * PC와 달리 메일수신/수신 메일주소 섹션 없음. 성공 후 legacy처럼 reload / 탈퇴는 /index.php.
 */
export function MobileMypageAccountSettingsScreen({
  account,
}: MobileMypageAccountSettingsScreenProps) {
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordRe, setNewPasswordRe] = useState("");
  const certFormRef = useRef<HTMLFormElement>(null);

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pwd = newPassword.trim();

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
    if (newPassword !== newPasswordRe) {
      window.alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    if (newPasswordRe.trim() === "") {
      window.alert("새로운 비밀번호 확인을 입력해 주세요.");
      return;
    }
    try {
      const data = await postPasswordChange(newPassword, newPasswordRe);
      window.alert(data.error_msg);
      window.location.reload();
    } catch {
      window.alert("비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("정말로 탈퇴하시겠습니까?")) {
      return;
    }
    try {
      await postMemberLeave();
      window.location.href = "/index.php";
    } catch {
      window.alert("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  const openCertPopup = (callUrl: string, regCertKey: string) => {
    const width = 410;
    const height = 500;
    const leftpos = screen.width / 2 - width / 2;
    const toppos = screen.height / 2 - height / 2;
    const winopts = `width=${width}, height=${height}, toolbar=no,status=no,statusbar=no,menubar=no,scrollbars=no,resizable=no`;
    const position = `,left=${leftpos}, top=${toppos}`;
    window.open("", "auth_popup", winopts + position);
    const frm = certFormRef.current;
    if (!frm) return;
    (frm.elements.namedItem("call_url") as HTMLInputElement).value = callUrl;
    (frm.elements.namedItem("reg_cert_key") as HTMLInputElement).value = regCertKey;
    (frm.elements.namedItem("kcp_page_submit_yn") as HTMLInputElement).value = "N";
    frm.action = callUrl;
    frm.method = "post";
    frm.target = "auth_popup";
    frm.submit();
  };

  const startCert = async () => {
    try {
      const res = await postCertReg();
      if (!res || res.res_cd !== "0000" || !res.call_url || !res.reg_cert_key) {
        window.alert("본인인증 거래등록에 실패하였습니다.\n" + (res?.res_msg ?? ""));
        return;
      }
      openCertPopup(res.call_url, res.reg_cert_key);
    } catch {
      window.alert("본인인증 요청 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <MobileSubHeader pageTitle="계정 설정" />
      <div id="appCapsuleSub">
        <div className="section full mt-2 mb-2">
          <div className="section-title font-16">회원 계정 상세정보</div>
          <div className="wide-block pb-1 pt-2">
            <form method="post" id="form_auth" name="form_auth">
              <div className="form-group boxed">
                <div className="input-wrapper">
                  <label htmlFor="m_id_input" className="form-label">
                    아이디 (이메일주소)
                  </label>
                  <input
                    type="text"
                    id="m_id_input"
                    className="form-control"
                    value={account.m_id}
                    readOnly
                  />
                </div>
              </div>
              <div className="form-group boxed">
                <div className="input-wrapper">
                  <label htmlFor="name_input" className="form-label">
                    이름
                  </label>
                  <input
                    id="name_input"
                    className="form-control bg-cdeepdark border-0"
                    type="text"
                    name="name"
                    value={account.name}
                    readOnly
                  />
                </div>
              </div>
              <div className="form-group boxed">
                <div className="input-wrapper">
                  <label htmlFor="hp_input" className="form-label">
                    휴대폰번호
                  </label>
                  <input
                    id="hp_input"
                    className="form-control bg-cdeepdark border-0"
                    type="text"
                    name="hp"
                    value={account.hp}
                    readOnly
                  />
                </div>
              </div>
              <div className="form-group boxed">
                <div className="input-wrapper">
                  <label htmlFor="birth_day" className="form-label">
                    생년월일
                  </label>
                  <input
                    type="text"
                    className="form-control bg-cdeepdark border-0"
                    id="birth_day"
                    name="birth_day"
                    value={account.birth_day}
                    readOnly
                  />
                </div>
              </div>
              <div className="form-group boxed">
                <div className="input-wrapper">
                  <label htmlFor="btn_auth" className="form-label">
                    본인인증
                  </label>
                  {account.is_auth === "Y" ? (
                    "인증됨"
                  ) : (
                    <input
                      type="button"
                      className="form-control btn btn-primary font-14"
                      id="btn_auth"
                      name="btn_auth"
                      value="휴대폰본인인증"
                      onClick={startCert}
                    />
                  )}
                </div>
              </div>
            </form>
            <form name="form_cert" method="post" style={{ display: "none" }} ref={certFormRef}>
              <input type="hidden" name="call_url" defaultValue="" />
              <input type="hidden" name="reg_cert_key" defaultValue="" />
              <input type="hidden" name="kcp_page_submit_yn" defaultValue="N" />
            </form>
          </div>
        </div>

        <div className="section full mt-2 mb-2">
          <div className="section-title font-16">비밀번호 설정</div>
          <div className="wide-block pb-1 pt-2">
            <form id="password_form" name="password_form" onSubmit={handlePasswordSubmit}>
              <div className="form-group boxed">
                <div className="input-wrapper">
                  <label className="form-label">새로운 비밀번호</label>
                  <input
                    placeholder="**********"
                    className="form-control"
                    type="password"
                    name="new_password"
                    id="new_password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div id="passwordHelpBlock" className="input-info">
                  영문소문자, 숫자, 특수문자를 포함하여 8자이상 16이하로 사용이 가능합니다. (@는
                  포함하실수 없습니다.)
                </div>
              </div>
              <div className="form-group boxed">
                <div className="input-wrapper">
                  <label className="form-label">새로운 비밀번호 확인</label>
                  <input
                    placeholder="**********"
                    className="form-control"
                    type="password"
                    name="new_password_re"
                    id="new_password_re"
                    value={newPasswordRe}
                    onChange={(e) => setNewPasswordRe(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-block font-14"
                  id="pwd_save"
                  name="pwd_save"
                >
                  비밀번호 저장
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="section full mt-2 mb-2">
          <div className="section-title font-16">회원 탈퇴</div>
          <div className="wide-block pb-1 pt-2">
            <p className="mb-0 font-12">
              ※ 유의사항: 회원탈퇴 전 다음의 내용을 반드시 확인 후 신중하게 진행해주시기 바랍니다.
            </p>
            <p className="mb-0 font-12 ps-1">
              - 회원탈퇴 즉시 계정의 정보는 파기되며, 제품코드, 주문내역, 제공콘텐츠(한글패치 등)와
              같은 정보 조회가 불가합니다.
            </p>
            <p className="mb-3 font-12 ps-1">
              - 회원탈퇴 즉시 계정이 소유한 포인트는 소멸하며, 복구가 불가합니다.
            </p>
            <input
              type="button"
              className="btn btn-danger font-14"
              name="leave"
              id="leave"
              value="회원탈퇴 요청"
              data-bs-toggle="modal"
              data-bs-target="#dialog_leave"
            />
          </div>
        </div>
      </div>

      {/* 회원탈퇴 요청 알림 */}
      <div
        className="modal fade dialogbox"
        id="dialog_leave"
        data-bs-backdrop="static"
        tabIndex={-1}
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">회원탈퇴</h5>
            </div>
            <div className="modal-body text-start">
              <div className="alert text-warning rounded-0 px-0 py-0">
                <p className="alert-heading font-14 mb-1">
                  유의사항: 회원탈퇴 전 다음의 내용을 반드시 확인 후 신중하게 진행해주시기 바랍니다.
                </p>
                <p className="font-12 ps-0">
                  회원탈퇴 즉시 계정의 정보는 파기되며, 제품코드, 주문내역, 제공콘텐츠(한글패치
                  등)와 같은 정보 조회가 불가합니다.
                </p>
                <p className="font-12 ps-0">
                  회원탈퇴 즉시 계정이 소유한 포인트는 소멸하며, 복구가 불가합니다.
                </p>
              </div>
              <p className="font-12  text-danger fw-bold">
                위 내용을 인지하였으며, 회원탈퇴를 진행하시겠습니까?
              </p>
            </div>
            <div className="modal-footer">
              <div className="btn-inline">
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  id="btn_member_leave"
                  onClick={handleLeave}
                >
                  예
                </button>
                <button type="button" className="btn btn-sm btn-light" data-bs-dismiss="modal">
                  아니오
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
