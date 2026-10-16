"use client";

import { useState } from "react";

import { postWishlistAction, type WishlistItem } from "@entities/mypage-wishlist";
import { ServerPagination } from "@shared/ui/server-pagination";

interface WishlistTableProps {
  items: WishlistItem[];
  page: number;
  totalPages: number;
}

const nf = (value: number) => value.toLocaleString("en-US");

/** legacy view_url game_type 분기. */
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
 * 위시리스트 표 (legacy `mypage_wishlist.html` 본문). 체크박스 + 삭제/선택삭제/장바구니이동 +
 * 프로모션가 표시 + view_url. 프로모션가·title_sku는 백엔드 enrich(WishlistItem).
 */
export function WishlistTable({ items, page, totalPages }: WishlistTableProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const selectableItems = items.filter((it) => it.status === "0" && it.soldout !== "Y");
  const allChecked =
    selectableItems.length > 0 && selectableItems.every((it) => checked.has(it.idx));

  const toggleAll = (on: boolean) =>
    setChecked(on ? new Set(selectableItems.map((it) => it.idx)) : new Set());

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
    const productCodes = items.filter((it) => checked.has(it.idx)).map((it) => it.product_code);
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
      window.location.href = "mypage_wishlist";
    }
  };

  return (
    <>
      <div className="col-12">
        <table className="table table-bordered table-centered mb-3 text-center align-middle text-nowrap">
          <colgroup>
            <col width="5%" />
            <col width="*" />
            <col width="6%" />
            <col width="6%" />
            <col width="6%" />
            <col width="6%" />
            <col width="5%" />
          </colgroup>
          <thead className="align-middle">
            <tr>
              <th className="bg-body-tertiary">
                <input
                  type="checkbox"
                  id="chk_all"
                  checked={allChecked}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              <th className="bg-body-tertiary">상품정보</th>
              <th className="bg-body-tertiary">할인률</th>
              <th className="bg-body-tertiary">판매가</th>
              <th className="bg-body-tertiary">판매상태</th>
              <th className="bg-body-tertiary">저장일</th>
              <th className="bg-body-tertiary">비고</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7}>위시리스트에 등록된 상품이 없습니다.</td>
              </tr>
            ) : (
              items.map((data) => (
                <tr key={data.idx}>
                  <td>
                    {data.status !== "0" ? (
                      <button
                        type="button"
                        className="btn btn-danger btn_delete font-14"
                        onClick={() => deleteOne(data.idx)}
                      >
                        <i className="fa fa-close"></i> 삭제
                      </button>
                    ) : data.soldout === "Y" ? (
                      "품절"
                    ) : (
                      <input
                        type="checkbox"
                        name="idx"
                        value={data.idx}
                        checked={checked.has(data.idx)}
                        onChange={(e) => toggleOne(data.idx, e.target.checked)}
                      />
                    )}
                  </td>
                  <td className="text-start">
                    <a
                      href={viewUrl(data)}
                      className="text-decoration-none text-white"
                      target="_blank"
                    >
                      {data.product_name}
                    </a>
                    {data.is_promotion === "Y" && (
                      <span className="badge badge-outline-danger rounded-2 font-12 p-2 ms-2">
                        프로모션
                      </span>
                    )}
                  </td>
                  <td>
                    {data.discount > 0 && (
                      <div className="">
                        <span
                          className={`badge ${data.is_promotion === "Y" ? "bg-danger" : "bg-primary"} num font-14 px-2 py-2 minus`}
                        >
                          {data.discount} %
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="text-end">
                    <div className="d-flex flex-row justify-content-between align-items-center">
                      <div className="ms-auto text-end align-text-bottom">
                        <div className="d-block fw-normal p-0 m-0">
                          {data.discount > 0 && (
                            <small className="text-decoration-line-through font-11 num text-secondary won">
                              {" "}
                              {nf(data.consumer_price)}
                            </small>
                          )}
                        </div>
                        <div className="d-block">
                          <span className="d-block p-0 m-0 num text-white font-16 fw-bold won">
                            {" "}
                            {nf(data.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{data.status === "0" ? "판매중" : data.status === "3" ? "판매종료" : ""}</td>
                  <td>{data.reg_date.slice(0, 10)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm btn_delete font-14"
                      onClick={() => deleteOne(data.idx)}
                    >
                      <i className="fa fa-close"></i> 삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
      <div id="pagination" className="mt-4">
        <ServerPagination page={page} totalPages={totalPages} baseUrl="/mypage/mypage_wishlist" />
      </div>
    </>
  );
}
