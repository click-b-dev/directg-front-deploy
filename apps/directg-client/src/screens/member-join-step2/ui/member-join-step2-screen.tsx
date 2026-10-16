"use client";

import type { CSSProperties, FormEvent } from "react";

import { JoinStepNav } from "@widgets/join-step-nav";

interface MemberJoinStep2ScreenProps {
  /** legacy `pc/service/agreement.txt` 원문(HTML 포함) — 이용약관 `<pre>` inline. */
  agreementHtml: string;
}

/** 이용약관 pre 스타일 (legacy inline). */
const AGREEMENT_PRE_STYLE: CSSProperties = {
  height: "300px",
  textWrap: "auto",
  fontFamily: "'Noto Sans KR', sans-serif",
};

/**
 * 회원가입 Step 2 — 약관동의 (legacy `pc/member/join_step2.html`).
 * 정적 동의 폼. `is_private`·`is_agreement` 필수(HTML5 required). 제출 시 step3로 이동.
 * 멀티스텝 상태(잠정): `is_mailling`을 쿼리로 step3 전달. 최종 방식은 Step3 착수 시 확정.
 */
export function MemberJoinStep2Screen({ agreementHtml }: MemberJoinStep2ScreenProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 멀티스텝 상태는 URL 쿼리로 step3에 전달(필수 동의 통과 = is_private/is_agreement Y).
    const isMailling = new FormData(e.currentTarget).get("is_mailling") === "Y";
    const params = new URLSearchParams({ is_private: "Y", is_agreement: "Y" });
    if (isMailling) params.set("is_mailling", "Y");
    window.location.href = `/member/join_step3?${params.toString()}`;
  };

  return (
    <div className="container my-3 pb-5">
      <main>
        <JoinStepNav current={2} />

        <div className="row mb-5">
          <div className="col-12">
            <form method="post" action="/member/join_step3" onSubmit={handleSubmit}>
              <input type="hidden" name="sns_id" value="" readOnly />
              <input type="hidden" name="sns_email" value="" readOnly />
              <input type="hidden" name="name" value="" readOnly />
              <input type="hidden" name="access_token" value="" readOnly />
              <input type="hidden" name="sns_type" value="" readOnly />

              <div className="card shadow-none rounded-0 mb-5">
                <h5 className="card-header py-3 font-16">
                  <span className="text-danger">[필수]</span> 개인정보 수집 및 이용
                </h5>
                <div className="card-body font-16">
                  <p>
                    다이렉트 게임즈는 개인정보 보호법에 따라서 본인의 동의를 받아 회원가입,
                    고객상담, 고지사항 전달 등을 위해서 아래와 같이 개인정보를 수집 이용합니다.
                  </p>
                  <table className="table table-centered mb-0 table-bordered mb-3">
                    <thead className="font-16">
                      <tr>
                        <th className="text-center bg-body-secondary">수집 목적</th>
                        <th className="text-center bg-body-secondary">수집 항목</th>
                        <th className="text-center bg-body-secondary">보유기간</th>
                        <th className="text-center bg-body-secondary">수집 근거</th>
                      </tr>
                    </thead>
                    <tbody className="font-14">
                      <tr>
                        <td>본인확인 및 연령인증</td>
                        <td>아이디(이메일),비밀번호,이름,생년월일,성별,휴대폰번호,DI</td>
                        <td>회원탈퇴 처리완료시</td>
                        <td>
                          개인정보 보호법 제15조 제1항 <br />
                          청소년 보호법 시행령 제 17조 제1항
                        </td>
                      </tr>
                      <tr>
                        <td>재화 또는 서비스 제공</td>
                        <td>이름,이메일,접속 로그, 접속 IP 정보, 결제기록</td>
                        <td>
                          계약 또는 청약철회 등에 관한 기록 : 5년
                          <br />
                          대금 결제 및 재화 등의 공급에 관한 기록 : 5년
                        </td>
                        <td rowSpan={2}>전자상거래 등에서의 소비자보호에 관한 법률</td>
                      </tr>
                      <tr>
                        <td>문의상담</td>
                        <td>이메일,접속 로그, 접속 IP 정보</td>
                        <td>소비자의 불만 또는 분쟁처리에 관한 기록 : 3년</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="mb-0">
                    <div className="input-group justify-content-center">
                      <span className="pe-3">위 개인정보 수집 이용에 동의합니다.(필수)</span>
                      <div className="form-check">
                        <label className="form-check-label" htmlFor="is_private">
                          동의함
                        </label>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="is_private"
                          name="is_private"
                          value="Y"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card shadow-none rounded-0 mb-5">
                <h5 className="card-header py-3 font-16">
                  <span className="text-danger">[필수]</span> 이용약관
                </h5>
                <div className="card-body">
                  <div className="p-0 mb-3">
                    <pre
                      className="overflow-y-scroll text-auto font-14"
                      style={AGREEMENT_PRE_STYLE}
                      dangerouslySetInnerHTML={{ __html: agreementHtml }}
                    />
                  </div>
                  <div className="border-top pt-3 mb-0 font-16">
                    <div className="input-group justify-content-center">
                      <span className="pe-3">이용약관에 동의합니다.(필수)</span>
                      <div className="form-check">
                        <label className="form-check-label" htmlFor="is_agreement">
                          동의함
                        </label>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="is_agreement"
                          name="is_agreement"
                          value="Y"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card shadow-none rounded-0 mb-5">
                <h5 className="card-header py-3 font-16">[선택] 홍보 및 마케팅에 관한 동의</h5>
                <div className="card-body font-16">
                  <table className="table table-centered mb-0 table-bordered mb-3">
                    <thead className="font-16">
                      <tr>
                        <th className="text-center bg-body-secondary">수집 목적</th>
                        <th className="text-center bg-body-secondary">수집 항목</th>
                        <th className="text-center bg-body-secondary">보유기간</th>
                        <th className="text-center bg-body-secondary">동의 여부(선택)</th>
                      </tr>
                    </thead>
                    <tbody className="font-14">
                      <tr>
                        <td>뉴스레터 발송(주1회)</td>
                        <td>이메일</td>
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
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="text-end">
                <button type="submit" className="btn btn-primary btn-lg shadow-none font-16">
                  다음단계로
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
