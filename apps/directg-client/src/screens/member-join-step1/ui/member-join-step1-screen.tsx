"use client";

import { openSnsLoginPopup } from "@entities/member-auth";
import { JoinStepNav } from "@widgets/join-step-nav";

/** legacy `pc/member/join_step1.html` head `<style>` 원문 (SNS 버튼 색상). */
const JOIN_STEP1_CSS = `


#btn_join_naver {
	background: #1EC800;
	color: #ffffff;
	font-weight: bold;
	border-radius: 4px;
}

#btn_join_kakao {
	background: #FFE500;
	border: 1px solid #FA2828;
	color: #5C5200;
	font-weight: bold;
	border-radius: 4px;
}

#btn_join_payco {
	background: #FA2828;
	border: 1px solid #FA2828;
	color: #FFFFFF;
	font-weight: bold;
	border-radius: 4px;
}
`;

/**
 * 회원가입 Step 1 — 가입방법 선택 (legacy `pc/member/join_step1.html`).
 * SNS 간편가입 팝업은 로그인과 동일(`openSnsLoginPopup`). 팝업 콜백(join_step2 POST)은 후속 단위.
 */
export function MemberJoinStep1Screen() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: JOIN_STEP1_CSS }} />
      <div className="container my-3 pb-5">
        <main>
          <JoinStepNav current={1} />

          <div className="row g-0 mb-3">
            <div className="offset-md-4 col-lg-4">
              <div className="card shadow-none rounded-0">
                <div className="card-header text-center py-3">
                  <span className="text-dark-50 text-center fw-bold fs-4">가입방법 선택</span>
                </div>
                <div className="card-body p-3">
                  <form action="#">
                    <div className="mb-0">
                      <div className="d-grid gap-4">
                        <button
                          type="button"
                          className="btn btn-block border-0 shadow-none fs-3 fw-bold p-0 d-flex flex-row align-items-center"
                          id="btn_join_naver"
                          onClick={() => openSnsLoginPopup("naver")}
                        >
                          <img src="/assets/images/member/icon_naver.png" className="float-start" />
                          <span className="flex-fill">NAVER로 간편가입</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-block border-0 shadow-none fs-3 fw-bold p-0 d-flex flex-row align-items-center"
                          id="btn_join_kakao"
                          onClick={() => openSnsLoginPopup("kakao")}
                        >
                          <img src="/assets/images/member/icon_kakao.png" className="float-start" />
                          <span className="flex-fill">KAKAO로 간편가입</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-block border-0 shadow-none fs-3 fw-bold p-0 d-flex flex-row align-items-center"
                          id="btn_join_payco"
                          onClick={() => openSnsLoginPopup("payco")}
                        >
                          <img src="/assets/images/member/icon_payco.png" className="float-start" />
                          <span className="flex-fill">PAYCO로 간편가입</span>
                        </button>
                        {/*<button class="btn btn-primary" type="button">휴대폰번호로 로그인</button>*/}
                        <a
                          href="/member/join_step2"
                          className="btn btn-block btn-secondary border-0 fw-bold shadow-none fs-3 p-0 py-3 align-items-center"
                          id="btn_join_email"
                        >
                          이메일 주소로 회원가입
                        </a>
                      </div>
                    </div>
                  </form>
                </div>
                {/* end card-body */}
              </div>
              {/* end card */}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
