import { MobileSubHeader } from "@widgets/mobile-sub-header";

interface MobileOrderFailScreenProps {
  /** legacy GET msg + message (연결 표시). */
  msg: string;
  message: string;
}

/**
 * 모바일 주문실패 (legacy `mobile/order/order_fail.html`).
 * 정적 카드 — "주문에 실패하였습니다" + msg+message + 장바구니 링크. 데이터/PG 없음(login_check 가드는 route).
 * head popover style은 body에 popover 없어 dead → 미이식.
 */
export function MobileOrderFailScreen({ msg, message }: MobileOrderFailScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle="주문실패" />
      <div id="appCapsuleSub" className="full-height">
        <div className="section full px-3 pt-2">
          <div className="card">
            <div className="card-header">
              <h4 className="text-dark-50 text-center fw-bold fs-4">주문에 실패하였습니다</h4>
            </div>
            <div className="card-body">
              <div className="text-center text-white fw-bold fs-4 mb-3">
                {msg}
                {message}
              </div>
              <div className="text-center ">
                <a href="/order/cart" className="btn btn-primary" type="button">
                  <i className="mdi mdi-home"></i> 장바구니
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
