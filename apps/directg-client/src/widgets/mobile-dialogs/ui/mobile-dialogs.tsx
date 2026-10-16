/**
 * 모바일 공통 알림 모달 — legacy `mobile/inc/dialog_cart.html`(장바구니/위시리스트 알림) 재현.
 * legacy는 base.js/bootstrap이 장바구니·위시리스트 액션 성공 시 모달을 연다.
 * 해당 mutation은 후속 단위 — 여기서는 DOM parity를 위해 정적 마크업만 포함(트리거 전까지 비활성).
 */
export function MobileDialogs({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <>
      {/* 장바구니 알림 */}
      <div
        className="modal fade dialogbox"
        id="dialog_cart"
        data-bs-backdrop="static"
        tabIndex={-1}
        role="dialog"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">장바구니 알림</h5>
            </div>
            <div className="modal-body">
              <span className="font-14" id="msg">
                장바구니에 상품이 추가되었습니다
              </span>
            </div>
            <div className="modal-footer">
              <div className="btn-inline">
                <a href="#" className="btn btn-text-danger" data-bs-dismiss="modal">
                  닫기
                </a>
                <a href="/order/cart" className="btn btn-text-primary">
                  {isLoggedIn ? "장바구니 이동" : "로그인"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 위시리스트 알림 */}
      <div
        className="modal fade dialogbox"
        id="dialog_wishlist"
        data-bs-backdrop="static"
        tabIndex={-1}
        role="dialog"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">위시리스트 알림</h5>
            </div>
            <div className="modal-body">
              <span className="font-14" id="msg">
                위시리스트에 상품이 추가되었습니다.
              </span>
            </div>
            <div className="modal-footer">
              <div className="btn-inline">
                <a href="#" className="btn btn-text-danger" data-bs-dismiss="modal">
                  닫기
                </a>
                <a href="/mypage/mypage_wishlist" className="btn btn-text-primary">
                  {isLoggedIn ? "위시리스트 이동" : "로그인"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
