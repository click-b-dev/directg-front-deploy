"use client";

import { useEffect, useRef, useState } from "react";

import { postCartAction, type CartItem } from "@entities/cart";

const nf = (value: number) => value.toLocaleString("en-US");

/** GA4 gtag 안전 호출 (layout GTM 전역). */
function gtag(...args: unknown[]) {
  (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.(...args);
}

/** 프로모션 우선 판매가(합계 계산용) — legacy `.price` data 값. */
const sellPrice = (item: CartItem) =>
  item.promotion && item.promotion.sale_price > 0 ? item.promotion.sale_price : item.price;

/** legacy view_url 분기 (product_type retail 우선, 이후 game_type). */
function viewUrl(item: CartItem): string {
  const { product_type, game_type, display_type, goods_sku, title_sku } = item;
  if (product_type === "retail") {
    return `/game/goods_item_view?product_id=${title_sku}&sku=${goods_sku}`;
  }
  switch (game_type) {
    case "game":
      return `/game/game_view?product_id=${title_sku}&sku=${goods_sku}`;
    case "dlc":
    case "music":
      return `/game/dlc_view?sku=${goods_sku}`;
    case "bundle":
      return `/game/bundle_view?sku=${goods_sku}`;
    case "holomodels":
      return display_type === "holomodelsdlc"
        ? `/game/holomodelsdlc_view?sku=${goods_sku}&platform=`
        : `/game/holomodels_view?product_id=${title_sku}&sku=${goods_sku}`;
    default:
      return "";
  }
}

/** 상품카드 좌하단 타입 badge (legacy cart.html — PC 표준 색, game/dlc/music/bundle=py-2, holomodels=fw-bold). */
function typeBadge(item: CartItem): { text: string; className: string } | null {
  const { game_type, display_type } = item;
  if (game_type === "game") {
    if (display_type === "basic")
      return { text: "기본게임", className: "bg-info rounded-0 font-12 py-2" };
    if (display_type === "edition")
      return { text: "에디션", className: "bg-primary rounded-0 font-12 py-2" };
    if (display_type === "multi")
      return { text: "멀티팩", className: "bg-warning rounded-0 font-12 py-2" };
    return null;
  }
  if (game_type === "dlc") return { text: "DLC", className: "bg-content rounded-0 font-12 py-2" };
  if (game_type === "music")
    return { text: "Music", className: "bg-content rounded-0 font-12 py-2" };
  if (game_type === "bundle")
    return { text: "번들", className: "bg-success rounded-0 font-12 py-2" };
  if (game_type === "holomodels") {
    if (display_type === "holomodels")
      return { text: "본체", className: "bg-success rounded-0 font-12 fw-bold" };
    if (display_type === "holomodelsdlc")
      return { text: "DLC", className: "bg-content rounded-0 font-12 fw-bold" };
    if (display_type === "holomodelsedition")
      return { text: "에디션", className: "bg-primary rounded-0 font-12 fw-bold" };
  }
  return null;
}

/** 플랫폼 아이콘 (legacy: 1 steam / 34 epic_w / 35 rockstar_2 / 51 holomodels(w-75)). */
function platformIcon(platform: string) {
  switch (platform) {
    case "1":
      return (
        <img className="mx-auto d-block rounded-0" src="/assets/images/platform/steam.svg" alt="" />
      );
    case "34":
      return (
        <img
          className="mx-auto d-block rounded-0"
          src="/assets/images/platform/epic_w.svg"
          alt=""
        />
      );
    case "35":
      return (
        <img
          className="mx-auto d-block rounded-0"
          src="/assets/images/platform/rockstar_2.svg"
          alt=""
        />
      );
    case "51":
      return (
        <img
          className="mx-auto d-block rounded-0 w-75"
          src="/assets/images/platform/holomodels.svg"
          alt=""
        />
      );
    default:
      return null;
  }
}

/** 가격 셀 (프로모션 → 상시할인 → 정가 분기). */
function PriceCell({ item }: { item: CartItem }) {
  if (item.promotion) {
    return (
      <div className="d-flex flex-row justify-content-between align-self-end">
        <span className="badge bg-danger align-self-center px-3 py-2 font-14 num minus">
          {item.promotion.discount_rate} %
        </span>
        <div className="d-flex flex-column align-items-end">
          <s className="text-muted font-11 num consumer_price won"> {nf(item.consumer_price)}</s>
          <span className="text-white fw-bold font-14 num price won">
            {" "}
            {nf(item.promotion.sale_price)}
          </span>
        </div>
      </div>
    );
  }
  if (item.discount > 0) {
    return (
      <div className="d-flex flex-row justify-content-between align-self-end">
        <span className="badge bg-primary align-self-center px-3 py-2 font-14 num minus">
          {item.discount} %
        </span>
        <div className="d-flex flex-column align-items-end">
          <s className="text-muted font-11 num consumer_price won"> {nf(item.consumer_price)}</s>
          <span className="text-white fw-bold font-14 num price won"> {nf(item.price)}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="d-flex flex-row justify-content-end align-self-end">
      <div className="d-flex flex-column align-items-end">
        <span className="text-white fw-bold font-14 num price won"> {nf(item.price)}</span>
      </div>
    </div>
  );
}

/**
 * 장바구니 본문 (legacy `pc/order/cart.html` — form/table/합계/버튼 + cart_proc AJAX + gtag).
 * 선택 상태는 서버 영속(select/deselect), 삭제/선택삭제는 reload, 주문하기는 order.html POST.
 */
export function CartContent({ items }: { items: CartItem[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(items.filter((it) => it.selected === "1").map((it) => it.goods_sku)),
  );

  // legacy: gtag('view_cart') on ready
  useEffect(() => {
    gtag("event", "view_cart", {
      currency: "KRW",
      items: items.map((it) => ({ item_id: it.goods_sku, item_name: it.product_name })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allChecked = items.length > 0 && items.every((it) => checked.has(it.goods_sku));
  const selectedItems = items.filter((it) => checked.has(it.goods_sku));
  const totalCount = selectedItems.length;
  const totalPrice = selectedItems.reduce((sum, it) => sum + sellPrice(it), 0);

  const toggleOne = (sku: string, on: boolean) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (on) next.add(sku);
      else next.delete(sku);
      return next;
    });
    // legacy: 체크→cart_item_select / 해제→cart_item_deselect (선택상태 영속화, 응답 무시)
    postCartAction({ mode: on ? "cart_item_select" : "cart_item_deselect", goods_sku: sku });
  };

  const toggleAll = (on: boolean) => {
    setChecked(on ? new Set(items.map((it) => it.goods_sku)) : new Set());
    // legacy: 전체선택은 각 체크박스 trigger('change') → 항목마다 select/deselect 발생
    items.forEach((it) =>
      postCartAction({
        mode: on ? "cart_item_select" : "cart_item_deselect",
        goods_sku: it.goods_sku,
      }),
    );
  };

  const deleteOne = async (item: CartItem) => {
    if (!confirm("해당 상품을 장바구니에서 삭제하시겠습니까?")) return;
    await postCartAction({ mode: "del_cart", goods_sku: item.goods_sku });
    gtag("event", "remove_from_cart", {
      items: [{ item_id: item.goods_sku, item_name: item.product_name, quantity: 1 }],
    });
    window.location.reload();
  };

  const selectDelete = async () => {
    const skuArr = selectedItems.map((it) => it.goods_sku);
    const productArr = selectedItems.map((it) => ({
      item_id: it.goods_sku,
      item_name: it.product_name,
      quantity: 1,
    }));
    if (!confirm("선택한 상품을 장바구니에서 삭제하시겠습니까?")) return;
    await postCartAction({ mode: "select_del_cart", goods_sku_arr: skuArr });
    gtag("event", "remove_from_cart", { items: productArr });
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
      <form
        ref={formRef}
        className="form-horizontal needs-validation mb-4"
        name="orderFrm"
        id="orderFrm"
        method="POST"
        action="order"
        noValidate
      >
        <div className="row">
          <div className="col-12">
            <div className="mb-2">
              <table
                className="table table-bordered table-centered caption-top mb-0 shadow-none"
                id="order_table"
                cellSpacing={0}
              >
                <caption className="font-14">장바구니 상품수 ( {items.length}/20 )</caption>
                <thead className="table-light font-15">
                  <tr>
                    <th scope="col" className="text-center fw-500" style={{ width: "50px" }}>
                      <input
                        type="checkbox"
                        className="form-check-input shadow-none"
                        name="goods_sku_all"
                        value="all"
                        id="cart_chk_all"
                        checked={allChecked}
                        onChange={(e) => toggleAll(e.target.checked)}
                      />
                    </th>
                    <th scope="col" className="text-center fw-500" style={{ width: "70px" }}>
                      삭제
                    </th>
                    <th scope="col" className="text-center fw-500">
                      상품정보
                    </th>
                    <th scope="col" className="text-center fw-500" style={{ width: "180px" }}>
                      가격정보
                    </th>
                  </tr>
                </thead>
                <tbody className="font-14 table-dark">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center">
                        장바구니가 비었습니다.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => {
                      const badge = typeBadge(item);
                      return (
                        <tr key={item.goods_sku}>
                          <td className="text-center align-middle">
                            <input
                              type="checkbox"
                              className="form-check-input shadow-none"
                              name="goods_sku[]"
                              value={item.goods_sku}
                              id={`cart_chk_${index}`}
                              data-productname={item.product_name}
                              checked={checked.has(item.goods_sku)}
                              onChange={(e) => toggleOne(item.goods_sku, e.target.checked)}
                            />
                          </td>
                          <td className="text-center align-middle">
                            <a
                              href="javascript:void(0);"
                              className="action-icon btn_cart_del text-dark"
                              data-sku={item.goods_sku}
                              data-productname={item.product_name}
                              onClick={() => deleteOne(item)}
                            >
                              {" "}
                              <i className="fa-solid fa-trash"></i>
                            </a>
                          </td>
                          <td className="align-middle">
                            <div className="card rounded-0 border-0 table-dark">
                              <div className="row g-0">
                                <div className="col-md-2 rounded-0">
                                  <div className="position-relative">
                                    <a href={viewUrl(item)} className="text-white" target="_blank">
                                      <img
                                        src={`/upload/product/${item.product_code}/header/header.jpg`}
                                        className="img-fluid rounded-0 w-100 h-100"
                                        alt=""
                                      />
                                    </a>
                                    <div className="position-absolute bottom-0 start-0">
                                      {badge && (
                                        <span className={`badge ${badge.className}`}>
                                          {badge.text}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-1">
                                  <div className="text-center align-content-center h-100">
                                    {platformIcon(item.product_platform)}
                                  </div>
                                </div>
                                <div className="col-md-9">
                                  <div className="row g-0 overflow-hidden flex-md-row shadow-sm position-relative">
                                    <div className="col py-1 px-3 d-flex flex-column position-static align-content-start">
                                      <div className="mb-2 text-body-secondary">
                                        {item.delivery_type === "1" && (
                                          <span className="badge rounded-2 badge-outline-success font-11 fw-500">
                                            코드발송
                                          </span>
                                        )}
                                        {item.delivery_type === "2" && (
                                          <span className="badge rounded-2 badge-outline-post font-11 fw-500">
                                            택배발송
                                          </span>
                                        )}
                                        {item.delivery_type === "3" && (
                                          <span className="badge rounded-2 badge-outline-code-post font-11 fw-500">
                                            코드+택배발송
                                          </span>
                                        )}
                                      </div>
                                      <h5 className="mb-2">{item.product_name}</h5>
                                      <div className="text-body-secondary">
                                        {item.promotion && (
                                          <span className="badge rounded-2 badge-outline-danger font-11 fw-500">
                                            프로모션
                                          </span>
                                        )}
                                        {item.is_preorder === "Y" && (
                                          <span className="badge rounded-2 badge-outline-warning font-11 fw-500">
                                            예약구매
                                          </span>
                                        )}
                                        {item.is_bonus === "Y" && (
                                          <span className="badge rounded-2 badge-outline-info font-11 fw-500">
                                            특전
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 align-middle">
                            <div className="d-block">
                              <PriceCell item={item} />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="d-grid gap-2 d-md-block">
              <button
                className="btn btn-outline-light shadow-none"
                type="button"
                id="btn_select_del"
                onClick={selectDelete}
              >
                선택 상품 삭제
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="py-4 text-center bg-light-subtle rounded-0 border-top border-bottom border-primary border-2 shadow-none mb-4">
        <div className="d-flex flex-row justify-content-center">
          <div className="px-4">
            <div className="mb-2">
              <strong className="font-16">총 주문수량</strong>
            </div>
            <div className="font-16 fw-bold text-center">
              <span className="num" id="total_goods_count">
                {totalCount}
              </span>{" "}
              개
            </div>
          </div>
          <div className="px-4">
            <div className="mb-2">
              <strong className="font-16 mb-3">총 주문금액</strong>
            </div>
            <div className="font-16 fw-bold text-center">
              <span className="num" id="total_price">
                {nf(totalPrice)}
              </span>{" "}
              원
            </div>
          </div>
        </div>
      </div>

      <div className="d-grid gap-3 d-flex justify-content-center">
        <button
          className="btn btn-secondary btn-lg rounded-0 fs-4 w-25 py-3 shadow-none"
          type="button"
        >
          쇼핑 계속하기
        </button>
        <button
          className="btn btn-primary btn-lg rounded-0 fs-4 w-25 py-3 shadow-none"
          type="button"
          id="btn_select_order"
          onClick={order}
        >
          주문하기
        </button>
      </div>
    </>
  );
}
