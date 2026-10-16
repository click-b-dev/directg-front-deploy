"use client";

import { useState } from "react";

import { postWishlistAction, type WishlistItem } from "@entities/mypage-wishlist";

interface MobileMypageWishlistScreenProps {
  list: WishlistItem[];
  /** 회원 나이(legacy PHP 계산) — 연령 게이팅용. */
  age: number;
}

const nf = (value: number) => value.toLocaleString("en-US");

/** legacy view_url game_type 분기(모바일 동일). */
function viewUrl(item: WishlistItem): string {
  const { game_type, goods_sku, display_type, product_platform, title_sku } = item;
  switch (game_type) {
    case "game":
      return `/game/game_view?product_id=${title_sku}&sku=${goods_sku}`;
    case "dlc":
      return display_type === "dlc_bundle"
        ? `/game/dlc_view?sku=${goods_sku}&platform=${product_platform}`
        : `/game/dlc_view?sku=${goods_sku}`;
    case "music":
      return `/game/dlc_view?sku=${goods_sku}`;
    case "bundle":
      return `/game/bundle_view?sku=${goods_sku}`;
    case "accessories":
      return `/game/goods_item_view?product_id=${title_sku}&sku=${goods_sku}`;
    case "holomodels":
      return display_type === "holomodelsdlc"
        ? `/game/holomodelsdlc_view?sku=${goods_sku}&platform=${product_platform}`
        : `/game/holomodels_view?product_id=${title_sku}&sku=${goods_sku}`;
    default:
      return "#";
  }
}

/**
 * 모바일 마이페이지 - 위시리스트 (legacy `mobile/mypage/mypage_wishlist.html`).
 * 커스텀 헤더 + 카드형 + 연령 게이팅(age_limit>17 && >age → 체크박스 숨김) + 삭제/선택삭제/장바구니이동.
 * 페이지네이션/chk_all 없음. 프로모션가·title_sku는 백엔드 enrich(WishlistItem).
 */
export function MobileMypageWishlistScreen({ list, age }: MobileMypageWishlistScreenProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  /** legacy: age_limit>17 && age_limit>age → 성인 게이팅(체크박스 숨김 + "N세 이용가"). */
  const isAgeGated = (item: WishlistItem) => item.age_limit > 17 && item.age_limit > age;

  const goBack = () => window.history.back();

  const toggleOne = (idx: number, on: boolean) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (on) next.add(idx);
      else next.delete(idx);
      return next;
    });

  const deleteOne = async (idx: number) => {
    if (!confirm("선택하신 상품을 삭제하시겠습니까?")) return;
    const data = await postWishlistAction({ mode: "delete", idx });
    alert(data.error_msg);
    window.location.href = "mypage_wishlist";
  };

  const selectDelete = async () => {
    const idxArr = [...checked];
    if (idxArr.length === 0) {
      alert("삭제할 상품을 선택해 주세요.");
      return;
    }
    if (!confirm("선택하신 상품을 삭제하시겠습니까?")) return;
    const data = await postWishlistAction({ mode: "select_delete", idx_arr: idxArr });
    alert(data.error_msg);
    window.location.href = "mypage_wishlist";
  };

  const moveToCart = async () => {
    const checkedItems = list.filter((it) => checked.has(it.idx));
    const productCodes: string[] = [];
    const productNames: string[] = [];
    const invalidIdx: number[] = [];
    for (const it of checkedItems) {
      if (it.status !== "0") {
        productNames.push(it.product_name);
        invalidIdx.push(it.idx); // legacy: 판매중 아닌 항목 체크 해제
      } else {
        productCodes.push(it.product_code);
      }
    }

    if (productNames.length > 0) {
      // legacy: 판매중이 아닌 상품이 하나라도 선택되면 이동 중단 + 해당 항목 체크 해제
      setChecked((prev) => {
        const next = new Set(prev);
        invalidIdx.forEach((idx) => next.delete(idx));
        return next;
      });
      alert(productNames.join(", ") + "은(는) 판매중인 상품이 아닙니다.");
      return;
    }

    if (productCodes.length === 0) {
      alert("장바구니로 이동할 상품을 선택해 주세요.");
      return;
    }
    if (!confirm("선택하신 상품을 장바구니로 이동하시겠습니까?")) return;
    const data = await postWishlistAction({ mode: "cart_move", product_code_arr: productCodes });
    alert(data.error_msg);
    if (confirm("장바구니로 이동하시겠습니까?")) {
      window.location.href = "/order/cart";
    } else {
      window.location.href = "/mypage/mypage_wishlist";
    }
  };

  return (
    <>
      <div className="appHeader bg-primary text-light">
        <div className="left">
          <a
            href="#"
            className="headerButton goBack"
            onClick={(e) => {
              e.preventDefault();
              goBack();
            }}
          >
            <ion-icon name="chevron-back-outline"></ion-icon>
          </a>
        </div>
        <div className="pageTitle">위시리스트 내역</div>
        <div className="right"></div>
      </div>

      <div id="appCapsuleSub">
        <div className="section pt-2">
          {list.map((data) => {
            const gated = isAgeGated(data);
            const isPromotion = data.is_promotion === "Y";
            return (
              <div className="card cart-item mb-2" key={data.idx}>
                <div className="card-body">
                  <div className="in form-check">
                    {!gated && (
                      <>
                        <input
                          type="checkbox"
                          name="idx"
                          className="form-check-input"
                          id={`chk_${data.idx}`}
                          value={data.idx}
                          checked={checked.has(data.idx)}
                          onChange={(e) => toggleOne(data.idx, e.target.checked)}
                        />
                        <label className="form-check-label in" htmlFor={`chk_${data.idx}`}></label>
                      </>
                    )}
                    <a
                      href={viewUrl(data)}
                      className="text-decoration-none text-white"
                      target="_self"
                    >
                      <div className="text flex-fill">
                        <h3 className="title mb-2">{data.product_name}</h3>
                        <p className="detail text-secondary mb-2">
                          {data.status === "0" ? "판매중" : data.status === "3" ? "판매종료" : ""}
                          {gated && (
                            <>
                              <br />
                              {data.age_limit}세 이용가
                            </>
                          )}
                          {isPromotion && (
                            <span className="badge badge-outline-danger rounded-2 font-12 ms-1">
                              프로모션
                            </span>
                          )}
                        </p>

                        <div className="me-1">
                          {data.discount > 0 && (
                            <span
                              className={`badge ${isPromotion ? "bg-danger" : "bg-primary"} num font-14 px-2 py-2 rounded-1 fw-bold minus`}
                            >
                              {data.discount} %
                            </span>
                          )}
                          <s className="font-11 text-secondary">{nf(data.consumer_price)} 원</s>
                          <strong className="price text-white font-16">{nf(data.price)} 원</strong>
                        </div>
                      </div>
                    </a>
                  </div>
                  <div className="cart-item-footer">
                    <input
                      type="button"
                      className="btn btn-danger btn-sm btn_delete"
                      value="삭제"
                      onClick={() => deleteOne(data.idx)}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {list.length === 0 ? (
            <div className="text-center">위시리스트에 등록된 상품이 없습니다.</div>
          ) : (
            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-danger font-14"
                id="btn_select_delete"
                onClick={selectDelete}
              >
                선택상품 삭제
              </button>
              <button
                type="button"
                className="btn btn-primary font-14"
                id="btn_select_move_cart"
                onClick={moveToCart}
              >
                장바구니 이동
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
