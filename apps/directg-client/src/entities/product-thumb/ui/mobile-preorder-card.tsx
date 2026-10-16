import type { ProductThumb } from "../model/types";

const formatWon = (value: number) => value.toLocaleString("ko-KR");

/** game_type별 badge (legacy 모바일 `#main_preorder` — GAME/DLC/Music/번들). */
function gameTypeBadge(gameType: string): { text: string; className: string } | null {
  switch (gameType) {
    case "game":
      return { text: "GAME", className: "bg-cinfo" };
    case "dlc":
      return { text: "DLC", className: "bg-ccontent" };
    case "music":
      return { text: "Music", className: "bg-ccontent" };
    case "bundle":
      return { text: "번들", className: "bg-csuccess" };
    default:
      return null;
  }
}

/**
 * legacy `#main_preorder` url 규칙(L692~706):
 * delivery 1 → game→game_view(title sku) · dlc→dlc_view(goods sku) / delivery 2·3 → goods_item_view(title sku + goods sku).
 * (new_game과 달리 delivery1에 dlc→dlc_view 분기가 있음.)
 */
function preorderUrl(product: ProductThumb): string {
  const titleSku = product.title_sku ?? "";
  if (product.delivery_type === "2" || product.delivery_type === "3") {
    return `/game/goods_item_view?product_id=${titleSku}&sku=${product.goods_sku}`;
  }
  if (product.game_type === "dlc") {
    return `/game/dlc_view?sku=${product.goods_sku}`;
  }
  return `/game/game_view?product_id=${titleSku}`;
}

/**
 * 모바일 예약구매 카드 — legacy `mobile/index.php` `#main_preorder`(L710~769) 마크업 재현.
 * new_game 카드와 유사하나 **product header 이미지**·url 분기(delivery1 dlc)·alt("{name} 이미지")가 다르다.
 */
export function MobilePreorderCard({ product }: { product: ProductThumb }) {
  const badge = gameTypeBadge(product.game_type);

  return (
    <li className="splide__slide">
      <div className="card product-card">
        <div className="card-header rounded-0 text-truncate ps-1 border-0">
          {product.product_name}
        </div>
        <div className="card-img position-relative rounded-0">
          <a href={preorderUrl(product)}>
            <img
              src={`${product.domain}/upload/product/${product.product_code}/header/header.jpg`}
              className="imaged w-100 square"
              alt={`${product.product_name} 이미지`}
            />
          </a>
          <div className="position-absolute bottom-0 start-0">
            {badge && <span className={`badge ${badge.className} rounded-0`}>{badge.text}</span>}
          </div>
        </div>
        <div className="card-badge bg-grey d-flex flex-row align-items-center">
          {product.delivery_type === "1" && (
            <span className="badge badge-outline-success rounded-2">코드발송</span>
          )}
          {product.delivery_type === "2" && (
            <span className="badge badge-outline-post rounded-2">택배발송</span>
          )}
          {product.delivery_type === "3" && (
            <span className="badge badge-outline-code-post rounded-2">코드+택배발송</span>
          )}
          {product.is_promotion === "Y" && (
            <span className="badge badge-outline-danger rounded-2">프로모션</span>
          )}
          {product.is_preorder === "Y" && (
            <span className="badge rounded-2 badge-outline-warning">예약구매</span>
          )}
          {product.is_bonus === "Y" && (
            <span className="badge rounded-2 badge-outline-info">특전</span>
          )}
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              {product.discount > 0 && (
                <span className="badge bg-cprimary rounded-1 percent minus">
                  {product.discount} %
                </span>
              )}
            </div>
            <div className="card-price">
              <div className="old-price">
                {product.discount > 0 ? (
                  <s className="won"> {formatWon(product.consumer_price)}</s>
                ) : (
                  " "
                )}
              </div>
              <div className="current-price text-white won"> {formatWon(product.price)}</div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
