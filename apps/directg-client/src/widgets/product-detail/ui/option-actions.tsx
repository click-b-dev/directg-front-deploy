"use client";

/**
 * 옵션 카드 위시리스트/장바구니 버튼 + 전역 모달 (legacy game_view.html JS의 btn_wishlist/btn_cart).
 *
 * - 비로그인(`isLogin==="N"`, 현재 앱의 유일 활성 경로): alert("로그인 이후에 이용이 가능합니다.")
 *   후 `/member/login.html`로 이동. **백엔드 무관, parity 완전 재현**.
 * - 로그인: legacy는 `/order/{cart,wishlist}_proc.php`로 POST 후 응답 HTML을 모달에 주입.
 *   **order/session 도메인 이월** — 계약(`/api/order/{cart,wishlist}`)만 연결, 도메인 이관 전까지 dormant.
 */

interface BootstrapModal {
  show: () => void;
  hide: () => void;
}
interface BootstrapGlobal {
  Modal: { getOrCreateInstance: (el: Element) => BootstrapModal };
}
const getBootstrap = (): BootstrapGlobal | undefined =>
  (window as unknown as { bootstrap?: BootstrapGlobal }).bootstrap;

const requireLogin = () => {
  alert("로그인 이후에 이용이 가능합니다.");
  location.href = "/member/login";
};

/** 위시리스트 담기 버튼. */
export function WishlistButton({
  goodsSku,
  isLogin,
  wishlistChk,
  className,
}: {
  goodsSku: string;
  /** 미제공 시 로그인 게이트 없음(dlc/bundle 등 직접 AJAX). "N"이면 alert+redirect(game_view). */
  isLogin?: string;
  wishlistChk: string;
  className: string;
}) {
  const isOn = wishlistChk === "Y";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    if (isLogin === "N") {
      requireLogin();
      return;
    }
    // order/session 도메인 이월: legacy POST /order/wishlist_proc.php {mode:add_wishlist, goods_sku}
    void fetch("/api/order/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ mode: "add_wishlist", goods_sku: goodsSku }),
    })
      .then((res) => res.text())
      .then((data) => {
        if (!data.includes('id="fail"')) {
          btn.classList.remove("btn_wishlist_off");
          const img = btn.querySelector("img");
          if (img) img.setAttribute("src", "/assets/images/icon/wishlist-icon_y.svg");
        }
        const result = document.getElementById("wishlist_result");
        if (result) result.innerHTML = data;
        const modal = document.getElementById("wishlist-modal");
        if (modal) getBootstrap()?.Modal.getOrCreateInstance(modal).show();
      })
      .catch((err) => alert(String(err)));
  };

  return (
    <button
      type="button"
      className={`${className}${isOn ? "" : " btn_wishlist_off"}`}
      data-sku={goodsSku}
      data-login={isLogin}
      onClick={handleClick}
    >
      <img src={`/assets/images/icon/wishlist-icon_${isOn ? "y" : "n"}.svg`} />
    </button>
  );
}

/** 장바구니 담기 버튼(soldout 시 품절 뱃지). */
export function CartButton({
  goodsSku,
  isLogin,
  soldout,
  className,
}: {
  goodsSku: string;
  /** 미제공 시 로그인 게이트 없음. "N"이면 alert+redirect(game_view). */
  isLogin?: string;
  soldout: string;
  className: string;
}) {
  if (soldout !== "N") {
    return <span className="badge bg-secondary fw-bold font-14 py-2 px-2">품절</span>;
  }

  const handleClick = () => {
    if (isLogin === "N") {
      requireLogin();
      return;
    }
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
    <button
      type="button"
      className={className}
      data-sku={goodsSku}
      data-login={isLogin}
      onClick={handleClick}
    >
      <img src="/assets/images/icon/basket-icon-white.svg" className="me-1" /> 장바구니
    </button>
  );
}

/**
 * 전역 장바구니/위시리스트 모달 (legacy #cart-modal / #wishlist-modal).
 * 로그인 시 버튼 핸들러가 결과 HTML을 주입하고 표시. 닫힘 시 새로고침(cart만).
 */
export function CartWishlistModals({ cartTitle = "장바구니" }: { cartTitle?: string } = {}) {
  const handleCartHidden = (el: HTMLDivElement | null) => {
    if (!el) return;
    el.addEventListener("hidden.bs.modal", () => location.reload());
  };

  return (
    <>
      <div
        id="cart-modal"
        className="modal"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="primary-header-modalLabel"
        aria-hidden="true"
        ref={handleCartHidden}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered" style={{ maxWidth: 900 }}>
          <div className="modal-content border border-3 border-start border-end-0 border-top-0 border-bottom-0 border-primary">
            <div className="modal-header">
              <h4 className="modal-title" id="topModalLabel">
                {cartTitle}
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
                className="btn btn-sm btn-dark shadow-none font-14"
                data-bs-dismiss="modal"
              >
                쇼핑 계속하기
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary shadow-none font-14"
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

      <div
        id="wishlist-modal"
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
                위시리스트
              </h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-hidden="true"
              ></button>
            </div>
            <div className="modal-body p-2 rounded-0">
              <div id="wishlist_result" className="p-0"></div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm btn-dark shadow-none font-14"
                data-bs-dismiss="modal"
              >
                쇼핑 계속하기
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary shadow-none font-14"
                onClick={() => {
                  location.href = "/mypage/mypage_wishlist";
                }}
              >
                위시리스트 바로가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
