"use client";

/**
 * 타임딜 랜딩 장바구니 버튼 + 모달 (legacy `pc/promotion/time_deal.html` JS).
 *
 * - legacy 버튼 `data-sku="<?=$game['goods_sku']?>"` 는 `$game` 미정의 → **빈값(legacy 버그)**, `data-timedealNo=""`.
 * - 클릭: `m_id==""`(비로그인) → alert("로그인을 하셔야 이용이 가능합니다.") 후 return(**리다이렉트 없음**).
 *   현재 앱은 세션 미착수 → 비로그인 경로만 활성.
 * - 로그인 경로: legacy POST `/order/cart_proc.php {mode:add_timedeal_cart, goods_sku, timedeal_no}` →
 *   **order 도메인 이월**(계약 `/api/order/cart` 만 연결, dormant).
 */

export function TimeDealCart() {
  // legacy 로그인 경로(order 도메인 이월): m_id!="" 시 POST /order/cart_proc.php
  // {mode:add_timedeal_cart, goods_sku, timedeal_no} → 응답 HTML을 #cart_result 주입 후 #cart-modal 표시.
  // 세션 이관 전까지 dormant. 현재는 비로그인 경로만 활성.
  const handleClick = () => {
    // 비로그인(legacy `m_id==""`): alert 후 종료(리다이렉트 없음).
    alert("로그인을 하셔야 이용이 가능합니다.");
  };

  return (
    <>
      <div className="cart mt-3">
        <div className="d-grid">
          <button
            type="button"
            className="btn btn-warning btn-lg btn-block btn-warning btn_cart rounded-0 font-16"
            data-sku=""
            data-timedealno=""
            onClick={handleClick}
          >
            <i className="fa fa-shopping-cart"></i> 장바구니
          </button>
        </div>
      </div>

      {/* 장바구니 안내 모달 (legacy #cart-modal — 로그인 경로에서만 표시) */}
      <div
        id="cart-modal"
        className="modal"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="primary-header-modalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered" style={{ maxWidth: 900 }}>
          <div className="modal-content border border-3 border-start border-end-0 border-top-0 border-bottom-0 border-primary">
            <div className="modal-header">
              <h4 className="modal-title" id="topModalLabel">
                장바구니
              </h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-hidden="true"
              ></button>
            </div>
            <div className="modal-body p-2 rounded-0">
              <div id="cart_result" className="p-0"></div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm btn-light shadow-none font-14"
                id="btn_model_close"
                data-bs-dismiss="modal"
              >
                쇼핑 계속하기
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary shadow-none font-14"
                id="btn_cart_move"
                onClick={() => {
                  location.href = "/order/cart";
                }}
              >
                장바구니 바로가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
