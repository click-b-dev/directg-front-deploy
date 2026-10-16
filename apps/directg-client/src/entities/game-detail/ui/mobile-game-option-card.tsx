import type { GameOption } from "../model/types";

const formatWon = (value: number) => value.toLocaleString("ko-KR");

/**
 * 모바일 상세 옵션 카드 (legacy `mobile/game/game_view.html`·`holomodels_view.html` 기본게임/에디션).
 * 이름 + 할인%·가격 + 위시리스트/장바구니 버튼(soldout 시 "품절").
 * 위시/장바구니 버튼은 order/session 도메인 이월 — 마크업만 재현(핸들러 보류).
 */
export function MobileGameOptionCard({ option }: { option: GameOption }) {
  return (
    <li className="p-0">
      <div className="item w-100">
        <div className="card p-0 mb-0">
          <h5 className="card-title fs-5 p-2 mb-0">{option.product_name}</h5>
          <div className="card-body p-0">
            <div className="d-flex justify-content-between align-items-center p-1">
              <div className="p-0 text-center">
                {option.discount > 0 && (
                  <span
                    className={`fs-5 badge ${option.promotion_label} rounded-2 px-3 py-3 fw-bold minus`}
                  >
                    {option.discount} %
                  </span>
                )}
              </div>
              <div className="price text-end">
                {option.discount > 0 && (
                  <s className="old-price font-12 text-secondary pe-1 won">
                    {" "}
                    {formatWon(option.consumer_price)}
                  </s>
                )}
                <span className="fs-5 current-price text-white won">
                  {" "}
                  {formatWon(option.price)}
                </span>
              </div>
            </div>
          </div>
          <div className="card-footer px-3">
            <div className="d-flex d-row justify-content-between">
              <button
                type="button"
                className="btn btn-sm shadow-none font-14 rounded-0 bg-danger btn_wishlist"
                data-sku={option.goods_sku}
              >
                <ion-icon name="heart-outline"></ion-icon> 위시리스트
              </button>
              {option.soldout === "N" ? (
                <button
                  type="button"
                  className="btn btn-sm shadow-none font-14 rounded-0 bg-primary btn_cart"
                  data-sku={option.goods_sku}
                  data-name={option.product_name}
                  data-price={option.price}
                >
                  <ion-icon name="cart-outline"></ion-icon> 장바구니
                </button>
              ) : (
                <span className="badge bg-secondary font-16 rounded-1">품절</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
