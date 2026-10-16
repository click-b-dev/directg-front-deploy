"use client";

/**
 * 타임딜 장바구니 버튼 + 모달 (legacy timedeal_view.html — 위시리스트 없음, cart만).
 * 아이콘 폰트 버튼(data-age), 로그인 게이트 없음. AJAX는 order 도메인 이월(계약 연결).
 */

interface BootstrapModal {
  show: () => void;
}
const getBootstrap = () =>
  (
    window as unknown as {
      bootstrap?: { Modal: { getOrCreateInstance: (el: Element) => BootstrapModal } };
    }
  ).bootstrap;

export function TimedealCart({
  goodsSku,
  ageLimit,
  soldout,
}: {
  goodsSku: string;
  ageLimit: string;
  soldout: string;
}) {
  const handleClick = () => {
    // order 도메인 이월: legacy POST /order/cart_proc.php {mode:add_cart, goods_sku}
    void fetch("/api/order/cart", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ mode: "add_cart", goods_sku: goodsSku }),
    })
      .then((res) => res.text())
      .then((data) => {
        const result = document.getElementById("cart_result");
        if (result) result.innerHTML = data;
        const modal = document.getElementById("cart-modal");
        if (modal) getBootstrap()?.Modal.getOrCreateInstance(modal).show();
      })
      .catch((err) => alert(String(err)));
  };

  return (
    <>
      <div className="px-1 py-2">
        {soldout === "N" ? (
          <div className="d-grid gap-1 d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-sm shadow-none font-14 rounded-0 text-info fw-bold btn_cart"
              data-sku={goodsSku}
              data-age={ageLimit}
              onClick={handleClick}
            >
              <i className="fa-solid fa-bag-shopping"></i> 장바구니
            </button>
          </div>
        ) : (
          <span className="badge bg-success fw-bold font-14 py-2 px-2">품절</span>
        )}
      </div>

      {/* 장바구니 안내 모달 (cart만 — 위시리스트 없음) */}
      <div
        id="cart-modal"
        className="modal"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="primary-header-modalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered" style={{ maxWidth: 900 }}>
          <div className="modal-content border border-3 border-start border-end-0 border-top-0 border-bottom-0 border-primary rounded-2">
            <div className="modal-header">
              <h4 className="modal-title" id="topModalLabel">
                장바구니 안내
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
                className="btn btn-light shadow-none font-14"
                data-bs-dismiss="modal"
              >
                쇼핑 계속하기
              </button>
              <button
                type="button"
                className="btn btn-primary shadow-none font-14"
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
