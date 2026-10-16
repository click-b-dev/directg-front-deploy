/**
 * 주문실패 (legacy `pc/order/order_fail.html`). 결제 실패 정적 에러 화면.
 * 로그인 게이트 없음(public). msg 있으면 {msg}{message} li 렌더. footer_banner·step nav 없음.
 */
export function OrderFailScreen({ msg, message }: { msg: string; message: string }) {
  return (
    <div className="container">
      <main className="mb-5">
        <div className="row g-0 my-3">
          <div className="col-12">
            <div className="row justify-content-center g-3">
              <div className="col-lg-6 pb-3">
                <div className="text-center">
                  <h1 className="text-error mt-4">
                    <i className="mdi mdi-alert-circle-outline"></i>
                  </h1>
                  <h4 className="text-uppercase text-danger mt-3 mb-3">
                    고객님께 불편을 드려서 대단히 죄송합니다.
                  </h4>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item text-start">* 주문과 결제가 실패하였습니다.</li>
                    <li className="list-group-item text-start">
                      * 다시 주문/결제 과정을 진행하여 주십시오.
                    </li>
                    {msg && (
                      <li className="list-group-item text-start">
                        {msg}
                        {message}
                      </li>
                    )}
                  </ul>

                  <a className="btn btn-info mt-3" href="/index">
                    홈으로 이동
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
