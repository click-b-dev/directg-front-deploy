import { JoinStepNav } from "@widgets/join-step-nav";

/**
 * 회원가입 Step 5 — 가입완료 (legacy `pc/member/join_step5.html`).
 * 정적 완료 화면. 카드 클래스가 Step4와 다르고(rounded-0/btn-lg 없음), h4 오타 "가입완료이"는 원문 유지.
 */
export function MemberJoinStep5Screen() {
  return (
    <div className="container my-3 pb-5">
      <main>
        <JoinStepNav current={5} linked />

        <div className="row justify-content-center">
          <div className="col-5">
            <div className="card shadow-none">
              <div className="card-header">
                <h5 className="text-center pb-0 fw-bold my-0">가입완료</h5>
              </div>
              <div className="card-body p-4">
                <div className="text-center m-auto">
                  <h4 className="text-dark-50 text-center mt-4 fw-bold">
                    가입완료이 완료되었습니다.
                  </h4>
                  <p className="text-muted mb-4">로그인 후 서비스 이용이 가능합니다.</p>
                </div>

                <form action="index">
                  <div className="mb-0 text-center">
                    <a href="/member/login" className="btn btn-primary shadow-none">
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
