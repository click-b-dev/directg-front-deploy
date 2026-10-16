"use client";

import { useEffect, useRef, useState } from "react";

import { postCartAction, type CartItem } from "@entities/cart";

const nf = (value: number) => value.toLocaleString("en-US");

/** GA4 gtag 안전 호출 (app/m/layout gtag 전역). */
function gtag(...args: unknown[]) {
  (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.(...args);
}

/** 프로모션 우선 판매가 — legacy `.price[data]` 값. */
const sellPrice = (item: CartItem) =>
  item.promotion && item.promotion.sale_price > 0 ? item.promotion.sale_price : item.price;

/**
 * legacy getOrderPrice의 consumer(`.consumer_price[data]`) — 프로모션/상시할인 항목에만 존재,
 * 정가 항목은 span 없어 0 → price로 대체.
 */
const goodsPrice = (item: CartItem) => {
  const consumer = item.promotion || item.discount > 0 ? item.consumer_price : 0;
  return consumer === 0 ? sellPrice(item) : consumer;
};

/**
 * 모바일 장바구니 (legacy `mobile/order/cart.html`).
 * 커스텀 헤더 + `#appCapsuleSub` 카드형 + 체크박스 선택 영속화 + 합계 재계산 + 삭제/주문 + gtag.
 * PC `order-cart`와 데이터 동일(`entities/cart` 재사용, 증분 0), 마크업만 모바일 단순화.
 */
export function MobileOrderCartScreen({ items }: { items: CartItem[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [searchShown, setSearchShown] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(items.filter((it) => it.selected === "1").map((it) => it.goods_sku)),
  );

  // legacy: gtag('view_cart') on ready — 전체 cart_list 항목.
  useEffect(() => {
    gtag("event", "view_cart", {
      currency: "KRW",
      items: items.map((it) => ({ item_id: it.goods_sku, item_name: it.product_name })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // legacy base.js goBack: referrer가 있으면 history.back, 없으면 "/".
  const handleGoBack = () => {
    if (document.referrer && document.referrer !== location.href) {
      history.back();
    } else {
      window.location.href = "/";
    }
  };

  const selectedItems = items.filter((it) => checked.has(it.goods_sku));
  const totalGoodsPrice = selectedItems.reduce((sum, it) => sum + goodsPrice(it), 0);
  const totalPrice = selectedItems.reduce((sum, it) => sum + sellPrice(it), 0);
  const totalDiscount = totalGoodsPrice - totalPrice;

  const toggleOne = (item: CartItem, on: boolean) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (on) next.add(item.goods_sku);
      else next.delete(item.goods_sku);
      return next;
    });
    // legacy: 체크→cart_item_select / 해제→cart_item_deselect (선택상태 영속화, 응답 무시)
    postCartAction({
      mode: on ? "cart_item_select" : "cart_item_deselect",
      goods_sku: item.goods_sku,
    });
  };

  const deleteOne = async (item: CartItem) => {
    if (!confirm("해당 상품을 장바구니에서 삭제하시겠습니까?")) return;
    await postCartAction({ mode: "del_cart", goods_sku: item.goods_sku });
    gtag("event", "remove_from_cart", {
      items: [{ item_id: item.goods_sku, item_name: item.product_name, quantity: 1 }],
    });
    window.location.reload();
  };

  const order = () => {
    if (totalPrice === 0) {
      alert("구매할 상품을 선택해 주세요.");
      return;
    }
    gtag("event", "begin_checkout", {
      currency: "KRW",
      items: selectedItems.map((it) => ({
        item_id: it.goods_sku,
        item_name: it.product_name,
        quantity: 1,
      })),
    });
    formRef.current?.submit();
  };

  return (
    <>
      <style>{`
        .form-check-input{ width:1.5rem; height:1.5rem; }
        #btn-order-wrap{ width:100%; position:fixed; bottom:56px; left:0; align-items:center; justify-content:center; padding:0 16px; text-align:center; }
      `}</style>

      {/* App Header */}
      <div className="appHeader bg-primary text-light mt-0">
        <div className="left">
          <a
            href="#"
            className="headerButton goBack"
            data-rel="back"
            onClick={(e) => {
              e.preventDefault();
              handleGoBack();
            }}
          >
            <ion-icon name="chevron-back-outline"></ion-icon>
          </a>
        </div>
        <div className="pageTitle">장바구니</div>
        <div className="right">
          <a
            href="#"
            className="headerButton toggle-searchbox"
            onClick={(e) => {
              e.preventDefault();
              setSearchShown((v) => !v);
            }}
          >
            <div className="col">
              <img src="/mobile-assets/images/icon/search_icon_white.svg" alt="검색" />
            </div>
          </a>
        </div>
      </div>
      {/* * App Header */}

      {/* Search Component */}
      <div id="search" className={`appHeader${searchShown ? " show" : ""}`}>
        <form className="search-form" method="GET" action="/game/game_search">
          <div className="form-group searchbox bg-black">
            <input type="text" className="form-control" id="q" name="q" placeholder="Search..." />
            <i className="input-icon">
              <ion-icon name="search-outline"></ion-icon>
            </i>
            <a
              href="#"
              className="ms-1 close toggle-searchbox"
              onClick={(e) => {
                e.preventDefault();
                setSearchShown(false);
              }}
            >
              <ion-icon name="close-circle"></ion-icon>
            </a>
          </div>
        </form>
      </div>
      {/* * Search Component */}

      {/* Dialog Clear — legacy dead 모달(여는 트리거 없음, verbatim 유지) */}
      <div
        className="modal fade dialogbox"
        id="DialogClear"
        data-bs-backdrop="static"
        tabIndex={-1}
        role="dialog"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Empty Cart</h5>
            </div>
            <div className="modal-body">All items will be deleted.</div>
            <div className="modal-footer">
              <div className="btn-inline">
                <a href="#" className="btn btn-text-secondary" data-bs-dismiss="modal">
                  CLOSE
                </a>
                <a href="#" className="btn btn-text-primary" data-bs-dismiss="modal">
                  DELETE
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* * Dialog Clear */}

      {/* App Capsule */}
      <div id="appCapsuleSub" className="full-height">
        <div className="section pt-2">
          {items.length === 0 ? (
            <div className="text-center font-16 mt-5">장바구니가 비었습니다.</div>
          ) : (
            <>
              <p className="mb-1">장바구니 상품수 ( {items.length}/20 )</p>
              <form
                ref={formRef}
                className="form-horizontal needs-validation"
                name="orderFrm"
                id="orderFrm"
                method="POST"
                action="order"
                noValidate
              >
                {items.map((item) => (
                  <div className="card cart-item mb-2 rounded-0" key={item.goods_sku}>
                    <div className="card-header bg-secondary">
                      <div className="d-flex justify-content-between">
                        <input
                          type="checkbox"
                          className="form-check-input shadow-none"
                          name="goods_sku[]"
                          value={item.goods_sku}
                          data-productname={item.product_name}
                          checked={checked.has(item.goods_sku)}
                          onChange={(e) => toggleOne(item, e.target.checked)}
                        />
                        <a
                          href="javascript:void(0);"
                          className="btn_cart_del btn btn-sm btn-secondary px-1 mx-0 text-center"
                          data-sku={item.goods_sku}
                          data-productname={item.product_name}
                          onClick={() => deleteOne(item)}
                        >
                          <i className="bi bi-trash-fill mx-0"></i>
                        </a>
                      </div>
                    </div>
                    <img
                      src={`/upload/product/${item.product_code}/header/header.jpg`}
                      alt="product"
                      className="card-img-top rounded-0"
                    />
                    <div className="card-body">
                      <h5 className="card-title fs-4 fw-normal mb-2">{item.product_name}</h5>
                      <p className="card-text">
                        {item.promotion ? (
                          <>
                            <span className="badge bg-danger align-self-center px-3 py-3 font-16 num fw-bold rounded-2 minus">
                              {item.promotion.discount_rate} %
                            </span>
                            <strong className="ms-1 font-16 num fw-bold price won">
                              {" "}
                              {nf(item.promotion.sale_price)}
                            </strong>
                            <s className="ms-1 font-12 num consumer_price won">
                              {" "}
                              {nf(item.consumer_price)}
                            </s>
                          </>
                        ) : (
                          <>
                            {item.discount > 0 && (
                              <span className="badge bg-primary align-self-center px-3 py-3 font-16 num fw-bold rounded-2 minus">
                                {item.discount} %
                              </span>
                            )}
                            <strong className="ms-1 font-16 num fw-bold price won">
                              {" "}
                              {nf(item.price)}
                            </strong>
                            {item.discount > 0 && (
                              <s className="ms-1 font-12 num consumer_price won">
                                {" "}
                                {nf(item.consumer_price)}
                              </s>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="section mt-2 mb-5">
                  <div className="card">
                    <ul className="listview flush transparent simple-listview">
                      <li>
                        총 상품 가격{" "}
                        <span className="num font-14 won" id="total_goods_price">
                          {" "}
                          {nf(totalGoodsPrice)}
                        </span>
                      </li>
                      <li>
                        총 할인{" "}
                        <span className="num font-14 text-danger m-won" id="total_discount_price">
                          {" "}
                          {nf(totalDiscount)}
                        </span>
                      </li>
                      <li>
                        총 결제 금액{" "}
                        <span className="num fw-bold font-14 won" id="total_price">
                          {" "}
                          {nf(totalPrice)}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="section inset mb-2">
                  <div id="btn-order-wrap" className="wide-block full">
                    <button
                      type="button"
                      className="btn btn-primary btn-lg btn-block"
                      id="btn_select_order"
                      onClick={order}
                    >
                      주문하기
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
      {/* * App Capsule */}
    </>
  );
}
