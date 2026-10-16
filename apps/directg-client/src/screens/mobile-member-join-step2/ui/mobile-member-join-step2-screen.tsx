"use client";

import { type FormEvent } from "react";

interface MobileMemberJoinStep2ScreenProps {
  /** legacy `conf/agreement_20250701.txt`(= public `agreement_250701.txt`) 원문 — 이용약관 textarea 내용. */
  agreementText: string;
}

/** 회원가입 join 플로우 상태 저장 키 — 약관동의 값(join_step3가 소비). */
const JOIN_STATE_KEY = "dg_mobile_join";

/**
 * 모바일 회원가입 - 약관동의 (legacy `mobile/member/join_step2.html`).
 * 위저드(②약관동의) + 3카드(필수 개인정보/필수 이용약관 textarea/선택 마케팅). is_private·is_agreement required.
 * 제출 시 동의값을 sessionStorage에 담아 join_step3로 이동(legacy POST 대체). "이전" 버튼은 legacy에서 dead.
 */
export function MobileMemberJoinStep2Screen({ agreementText }: MobileMemberJoinStep2ScreenProps) {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    // required 통과 = is_private/is_agreement "Y". 마케팅은 선택.
    window.sessionStorage.setItem(
      JOIN_STATE_KEY,
      JSON.stringify({
        is_private: "Y",
        is_agreement: "Y",
        is_mailling: form.get("is_mailling") === "Y" ? "Y" : "",
        is_sms: form.get("is_sms") === "Y" ? "Y" : "",
        is_event: form.get("is_event") === "Y" ? "Y" : "",
      }),
    );
    window.location.href = "/member/join_step3";
  };

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
          <a href="#" className="button-item active text-primary">
            <ion-icon
              name="checkmark-outline"
              role="img"
              className="md hydrated bg-primary rounded-3"
              aria-label="checkmark outline"
            ></ion-icon>
            <p className="font-12">약관동의</p>
          </a>
          <a href="#" className="button-item">
            <strong>3</strong>
            <p className="font-12">정보입력</p>
          </a>
          <a href="#" className="button-item">
            <strong>4</strong>
            <p className="font-12">가입완료</p>
          </a>
        </div>
      </div>
      <div id="appCapsule" className="extra-header-active mt-0">
        <div className="section full mt-2 mb-2">
          <div className="section-title2 mb-2 text-center">약관동의</div>
          <div className="wide-block">
            <form method="post" action="/member/join_step3" onSubmit={handleSubmit}>
              <div className="card">
                <div className="card-header">
                  <span className="text-danger">[필수]</span> 개인정보 수집 및 이용
                </div>
                <div className="card-body p-0">
                  <p className="font-14 px-2">
                    다이렉트 게임즈는 개인정보 보호법에 따라서 본인의 동의를 받아 회원가입,
                    고객상담, 고지사항 전달 등을 위해서 아래와 같이 개인정보를 수집 이용합니다.
                  </p>
                  <ol className="font-14">
                    <li>
                      [본인확인 및 연령인증]
                      <ul>
                        <li>수집항목: 아이디(이메일),비밀번호,이름,생년월일,성별,휴대폰번호,DI</li>
                        <li>보유기간: 회원탈퇴 처리완료시</li>
                        <li>
                          수집근거: 개인정보 보호법 제15조 제1항, 청소년 보호법 시행령 제 17조 제1항
                        </li>
                      </ul>
                    </li>
                    <li>
                      [재화 또는 서비스 제공]
                      <ul>
                        <li>수집항목: 이름,이메일,접속 로그, 접속 IP 정보, 결제기록</li>
                        <li>
                          보유기간: 계약 또는 청약철회 등에 관한 기록 : 5년, 대금 결제 및 재화 등의
                          공급에 관한 기록 : 5년
                        </li>
                        <li>수집근거: 전자상거래 등에서의 소비자보호에 관한 법률</li>
                      </ul>
                    </li>
                    <li>
                      [문의상담]
                      <ul>
                        <li>수집항목: 이메일,접속 로그, 접속 IP 정보</li>
                        <li>보유기간: 소비자의 불만 또는 분쟁처리에 관한 기록 : 3년</li>
                        <li>수집근거: 전자상거래 등에서의 소비자보호에 관한 법률</li>
                      </ul>
                    </li>
                  </ol>
                </div>
                <div className="card-footer">
                  위 개인정보 수집 이용에 동의합니다.(필수)
                  <div className="form-check form-check-inline">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="is_private"
                      name="is_private"
                      value="Y"
                      required
                    />
                    <label className="form-check-label" htmlFor="is_private">
                      동의함
                    </label>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="text-danger">[필수]</span> 이용약관
                </div>
                <div className="card-body p-0">
                  <div className="form-group boxed py-0">
                    <textarea
                      className="form-control rounded-0 mb-0 font-12"
                      name="agreement"
                      rows={10}
                      readOnly
                      defaultValue={agreementText}
                    />
                  </div>
                </div>
                <div className="card-footer">
                  이용약관에 동의합니다.(필수)
                  <div className="form-check form-check-inline">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="is_agreement"
                      name="is_agreement"
                      value="Y"
                      required
                    />
                    <label className="form-check-label" htmlFor="is_agreement">
                      동의함
                    </label>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="">[선택]</span> 홍보 및 마케팅에 관한 동의
                </div>
                <div className="card-body p-0">
                  <table className="table table-light table-centered mb-0 table-bordered">
                    <thead className="table-dark text-nowrap">
                      <tr>
                        <th className="text-center">수집 목적</th>
                        <th className="text-center">수집 항목</th>
                        <th className="text-center">보유기간</th>
                        <th className="text-center">동의 여부(선택)</th>
                      </tr>
                    </thead>
                    <tbody className="">
                      <tr>
                        <td>뉴스레터 발송(주1회)</td>
                        <td className="text-nowrap">이메일</td>
                        <td>수집일로부터 1년</td>
                        <td className="text-center">
                          <div className="form-check form-check-inline">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="is_mailling"
                              name="is_mailling"
                              value="Y"
                            />
                            <label className="form-check-label" htmlFor="is_mailling">
                              &nbsp;
                            </label>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>SMS 발송(주1회)</td>
                        <td className="text-nowrap">휴대폰번호</td>
                        <td>회원탈퇴시 삭제</td>
                        <td className="text-center">
                          <div className="form-check form-check-inline">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="is_sms"
                              name="is_sms"
                              value="Y"
                            />
                            <label className="form-check-label" htmlFor="is_sms">
                              &nbsp;
                            </label>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>이벤트 참여 및 사은품 배송</td>
                        <td className="text-nowrap">주소</td>
                        <td>회원탈퇴시 삭제</td>
                        <td className="text-center">
                          <div className="form-check form-check-inline">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="is_event"
                              name="is_event"
                              value="Y"
                            />
                            <label className="form-check-label" htmlFor="is_event">
                              &nbsp;
                            </label>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="card-footer">
                  <input type="button" className="btn btn-danger" value="이전" />
                  <input type="submit" className="btn btn-primary" value="다음" />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
