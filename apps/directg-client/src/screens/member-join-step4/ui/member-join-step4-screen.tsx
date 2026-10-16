import { JoinStepNav } from "@widgets/join-step-nav";

/**
 * 회원가입 Step 4 — 인증대기 (legacy `pc/member/join_step4.html`).
 * 정적 결과 화면. legacy는 POST 수신하나 로깅만·정적 표시라 서버 컴포넌트로 충분.
 */
export function MemberJoinStep4Screen() {
  return (
    <div className="container my-3 pb-5">
      <main>
        <JoinStepNav current={4} linked />

        <div className="row justify-content-center">
          <div className="col-5">
            <div className="card shadow-none rounded-0">
              <div className="card-header py-3 font-16 bg-body-secondary">
                <h5 className="text-center pb-0 fw-bold my-0">승인대기</h5>
              </div>
              <div className="card-body p-4">
                <div className="text-center m-auto">
                  <h4 className="text-dark-50 text-center mt-4 fw-bold">
                    가입된 아이디(이메일)로 인증메일이 발송되었습니다.
                  </h4>
                  <p className="text-muted mb-4">수신된 인증메일에서 [인증완료]를 눌러주세요.</p>
                </div>

                <form action="index">
                  <div className="mb-0 text-center">
                    <a href="/member/login" className="btn btn-primary btn-lg shadow-none">
                      <i className="mdi mdi-login"></i> 로그인
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
