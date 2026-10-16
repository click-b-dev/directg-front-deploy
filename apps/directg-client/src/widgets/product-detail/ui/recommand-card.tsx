"use client";

import type { RecommandItem } from "@shared/types/product-detail";

const formatWon = (value: number) => value.toLocaleString("ko-KR");

/**
 * 추천상품 카드 (legacy game_view.html recommand_title, content-right 2열).
 * title 기반 이미지(`/upload/title/{title_id}/header/{title_id}.jpg`, onerror hidden), 버튼 없음.
 * view_url = `{viewPath}?product_id={sku}` (기본 game_view, holomodels는 holomodels_view).
 */
export function RecommandCard({
  value,
  viewPath = "/game/game_view",
}: {
  value: RecommandItem;
  viewPath?: string;
}) {
  return (
    <div className="col-6">
      <div className="card mb-1 rounded-0 border-0 bg-card">
        <div className="card-header mb-0 p-2 rounded-0 border-0">
          <h5 className="card-title fw-400 font-14 text-white mb-0 text-nowrap text-truncate py-2">
            {value.product_name}
          </h5>
        </div>
        <a href={`${viewPath}?product_id=${value.sku}`} title={value.product_name}>
          <img
            src={`${value.domain}/upload/title/${value.title_id}/header/${value.title_id}.jpg`}
            className="card-img-top rounded-0"
            alt={value.product_name}
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden";
            }}
          />
        </a>
        <div className="card-badge bg-grey d-flex flex-row align-items-center">
          {value.delivery_type === "1" && (
            <span className="badge badge-outline-success rounded-2 font-10 p-2 ms-2">코드발송</span>
          )}
          {value.delivery_type === "2" && (
            <span className="badge badge-outline-post rounded-2 font-10 p-2 ms-2">택배발송</span>
          )}
          {value.delivery_type === "3" && (
            <span className="badge badge-outline-code-post rounded-2 font-10 p-2 ms-2">
              코드+택배발송
            </span>
          )}
          {value.is_promotion === "Y" && (
            <span className="badge badge-outline-danger rounded-2 font-10 p-2 ms-2">프로모션</span>
          )}
          {value.is_preorder === "Y" && (
            <span className="badge rounded-2 badge-outline-warning font-10 p-2 ms-2">예약구매</span>
          )}
          {value.is_bonus === "Y" && (
            <span className="badge rounded-2 badge-outline-info font-10 p-2 ms-2">특전</span>
          )}
        </div>
        <div className="card-footer px-2 py-0 border-0">
          <div
            className="d-flex flex-row justify-content-between align-items-center"
            style={{ minHeight: 48 }}
          >
            {value.discount > 0 && (
              <div>
                <span className={`badge ${value.promotion_label} num font-14 px-3 py-2 minus`}>
                  {value.discount} %
                </span>
              </div>
            )}
            <div className="ms-auto text-end align-text-bottom">
              {value.discount > 0 && (
                <div className="d-block fw-normal p-0 m-0">
                  <small className="text-decoration-line-through text-muted font-11 num won">
                    {" "}
                    {formatWon(value.consumer_price)}
                  </small>
                </div>
              )}
              <div className="d-block">
                <span className="d-block p-0 m-0 num text-white font-14 fw-bold won">
                  {" "}
                  {formatWon(value.price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
