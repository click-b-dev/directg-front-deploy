"use client";

import { useRef, useState, type FormEvent } from "react";

import {
  postMaillingChange,
  postEmailChange,
  postPasswordChange,
  postMemberLeave,
  postCertReg,
  type MemberAccountInfo,
} from "@entities/mypage-account";
import { MypageAside } from "@widgets/mypage-aside";

interface MypageAccountSettingsScreenProps {
  account: MemberAccountInfo;
}

const PWD_RULE_MSG =
  "비밀번호는 영문소문자, 숫자, 특수문자를 포함 8자리 이상 ~ 16이하로 입력해주세요.";

/** legacy emailCheck 정규식. */
const emailCheck = (email: string) =>
  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i.test(email);

/**
 * 마이페이지 — 계정 설정 (legacy `pc/mypage/account_settings.html`).
 * 프로필 표시 + 메일수신/메일주소/비번/탈퇴 뮤테이션 + KCP 본인인증(cert-reg mock).
 * LoadingOverlay(jQuery)는 미도입. 성공 후 legacy처럼 location.reload().
 */
export function MypageAccountSettingsScreen({ account }: MypageAccountSettingsScreenProps) {
  const [emailEditing, setEmailEditing] = useState(false);
  const [email, setEmail] = useState(account.email ? account.email : account.m_id);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordRe, setNewPasswordRe] = useState("");
  const certFormRef = useRef<HTMLFormElement>(null);

  const handleMaillingChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const data = await postMaillingChange(e.target.checked ? "Y" : "");
      window.alert(data.error_msg);
      window.location.reload();
    } catch {
      window.alert("오류가 발생했습니다.");
    }
  };

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!emailCheck(email)) {
      window.alert("유효하지 않은 이메일 주소입니다.");
      return;
    }
    try {
      const data = await postEmailChange(email);
      window.alert(data.error_msg);
      window.location.reload();
    } catch {
      window.alert("오류가 발생했습니다.");
    }
  };

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
      window.location.href = "/";
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
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <MypageAside active="profile" />
        <section id="content" className="content rounded-0">
          <div className="p-2">
            <div className="mb-3">
              <h2 className="mb-0">계정 설정</h2>
            </div>
            <hr className="my-4" />
            <div>
              <h5 className="mb-4">회원 계정 상세정보</h5>
              <div className="row">
                <div className="col-lg-6">
                  <form method="post" id="form_auth" name="form_auth">
                    <div className="row mb-3">
                      <label htmlFor="m_id" className="col-sm-4 col-form-label font-14">
                        아이디 (이메일주소)
                      </label>
                      <div className="col-sm-8">
                        <input
                          type="text"
                          readOnly
                          className="form-control-plaintext form-control-lg"
                          value={account.m_id}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <label htmlFor="name" className="col-sm-4 col-form-label font-14">
                        이름
                      </label>
                      <div className="col-sm-8">
                        <input
                          className="form-control-plaintext form-control-lg"
                          type="text"
                          name="name"
                          value={account.name}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <label htmlFor="hp" className="col-sm-4 col-form-label font-14">
                        휴대폰번호
                      </label>
                      <div className="col-sm-8">
                        <input
                          className="form-control-plaintext form-control-lg"
                          type="text"
                          name="hp"
                          value={account.hp}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <label htmlFor="birth_day" className="col-sm-4 col-form-label font-14">
                        생년월일
                      </label>
                      <div className="col-sm-8">
                        <input
                          type="text"
                          readOnly
                          className="form-control-plaintext form-control-lg"
                          id="birth_day"
                          name="birth_day"
                          value={account.birth_day}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <label htmlFor="birth_day" className="col-sm-4 col-form-label font-14">
                        본인인증
                      </label>
                      <div className="col-sm-8 align-content-center">
                        {account.is_auth === "Y" ? (
                          <span className="font-14">인증완료</span>
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
                  <form
                    name="form_cert"
                    method="post"
                    style={{ display: "none" }}
                    ref={certFormRef}
                  >
                    <input type="hidden" name="call_url" defaultValue="" />
                    <input type="hidden" name="reg_cert_key" defaultValue="" />
                    <input type="hidden" name="kcp_page_submit_yn" defaultValue="N" />
                  </form>
                </div>
              </div>
            </div>
            <form>
              <div className="row col-lg-6">
                <label className="col-sm-4 col-form-label font-14">메일수신</label>
                <div className="col-sm-8 align-content-center">
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="mailling"
                      name="mailling"
                      value="Y"
                      defaultChecked={account.mailling === "Y"}
                      onChange={handleMaillingChange}
                    />
                    <label htmlFor="mailling" className="form-check-label font-14">
                      {" "}
                      뉴스레터 발송 동의
                    </label>
                  </div>
                </div>
              </div>
            </form>
            <form
              name="emailFrm"
              id="emailFrm"
              method="post"
              action="account_proc.php"
              onSubmit={handleEmailSubmit}
            >
              <div className="row col-lg-6">
                <label className="col-sm-4 col-form-label font-14">수신 메일주소</label>
                <div className="col-sm-8 align-content-center">
                  <input
                    type="text"
                    readOnly={!emailEditing}
                    className={
                      emailEditing
                        ? "form-control form-control-lg"
                        : "form-control-plaintext form-control-lg"
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="email-input"
                    name="email-input"
                  />
                  {!emailEditing && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      id="btn-edit"
                      onClick={() => setEmailEditing(true)}
                    >
                      메일주소수정
                    </button>
                  )}
                  {emailEditing && (
                    <button type="submit" className="btn btn-primary me-3" id="btn-confirm">
                      확인
                    </button>
                  )}
                  {emailEditing && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      id="btn-cancel"
                      onClick={() => {
                        setEmail(account.email ? account.email : account.m_id);
                        setEmailEditing(false);
                      }}
                    >
                      취소
                    </button>
                  )}
                </div>
              </div>
            </form>
            <hr className="my-4" />
            <div className="pe-lg-14">
              <h5 className="mb-4">비밀번호 설정</h5>
              <div className="row row-cols-lg-2 row-cols-1">
                <form id="password_form" name="password_form" onSubmit={handlePasswordSubmit}>
                  <div className="mb-3 col">
                    <label className="form-label">새로운 비밀번호</label>
                    <input
                      placeholder="**********"
                      className="form-control form-control-lg"
                      type="password"
                      name="new_password"
                      id="new_password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <span id="passwordHelpInline" className="form-text">
                      영문소문자, 숫자, 특수문자를 포함하여 8자이상 16이하로 사용이 가능합니다. (@는
                      포함하실수 없습니다.)
                    </span>
                  </div>
                  <div className="mb-3 col">
                    <label className="form-label">새로운 비밀번호 확인</label>
                    <input
                      placeholder="**********"
                      className="form-control form-control-lg"
                      type="password"
                      name="new_password_re"
                      id="new_password_re"
                      value={newPasswordRe}
                      onChange={(e) => setNewPasswordRe(e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      id="pwd_save"
                      name="pwd_save"
                    >
                      비밀번호 저장
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <hr className="my-4" />

            <div>
              <h5 className="mb-4">회원 탈퇴</h5>
              <p className="mb-2">
                ※ 유의사항: 회원탈퇴 전 다음의 내용을 반드시 확인 후 신중하게 진행해주시기 바랍니다.
              </p>
              <p className="mb-2 ms-2">
                - 회원탈퇴 즉시 계정의 정보는 파기되며, 제품코드, 주문내역, 제공콘텐츠(한글패치
                등)와 같은 정보 조회가 불가합니다.
              </p>
              <p className="mb-5 ms-2">
                - 회원탈퇴 즉시 계정이 소유한 포인트는 소멸하며, 복구가 불가합니다.
              </p>
              <button
                type="button"
                className="btn btn-danger btn-lg"
                name="leave"
                id="leave"
                data-bs-toggle="modal"
                data-bs-target="#leave-modal"
              >
                회원탈퇴 요청
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 회원탈퇴 modal */}
      <div
        id="leave-modal"
        className="modal"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="leave-modal-modalLabel"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-dialog-centered"
          style={{ maxWidth: "650px" }}
        >
          <div className="modal-content border border-3 border-start border-end-0 border-top-0 border-bottom-0 border-danger">
            <div className="modal-header">
              <h4 className="modal-title" id="leave-modallLabel">
                회원탈퇴
              </h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-hidden="true"
              ></button>
            </div>
            <div className="modal-body p-3 rounded-0">
              <div className="alert text-warning rounded-0 px-1 py-0">
                <h5 className="alert-heading">
                  <i className="uil uil-exclamation-triangle"></i>유의사항: 회원탈퇴 전 다음의
                  내용을 반드시 확인 후 신중하게 진행해주시기 바랍니다.
                </h5>
                <p className="font-13 lh-sm mb-2 ps-2">
                  <i className="mdi mdi-circle-medium"></i>회원탈퇴 즉시 계정의 정보는 파기되며,
                  제품코드, 주문내역, 제공콘텐츠(한글패치 등)와 같은 정보 조회가 불가합니다.
                </p>
                <p className="font-13 lh-sm mb-2 ps-2">
                  <i className="mdi mdi-circle-medium"></i>회원탈퇴 즉시 계정이 소유한 포인트는
                  소멸하며, 복구가 불가합니다.
                </p>
              </div>
              <p className="ps-3 text-danger fw-bold">
                위 내용을 인지하였으며, 회원탈퇴를 진행하시겠습니까?
              </p>
            </div>
            <div className="modal-footer justify-content-md-center">
              <div className="w-50 text-center">
                <button
                  type="button"
                  className="btn btn-danger shadow-none w-25 me-2"
                  id="btn_member_leave"
                  onClick={handleLeave}
                >
                  네
                </button>
                <button
                  type="button"
                  className="btn btn-dark shadow-none w-25"
                  id="btn_model_close"
                  data-bs-dismiss="modal"
                >
                  아니오
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
