import type { ProductThumb } from "../model/types";

const formatWon = (value: number) => value.toLocaleString("ko-KR");

/**
 * game_type/display_type별 badge (legacy 모바일 `thumb_inc.php` — PC 카드와 클래스 다름: bg-c* 계열).
 */
function typeBadge(product: ProductThumb): { text: string; className: string } | null {
  const { game_type, display_type } = product;
  if (game_type === "game") {
    if (display_type === "basic") return { text: "기본게임", className: "bg-cinfo" };
    if (display_type === "edition") return { text: "에디션", className: "bg-cprimary" };
    if (display_type === "multi") return { text: "멀티팩", className: "bg-cwarning" };
    return null;
  }
  if (game_type === "dlc") return { text: "DLC", className: "bg-ccontent" };
  if (game_type === "music") return { text: "Music", className: "bg-ccontent" };
  if (game_type === "bundle") return { text: "번들", className: "bg-csuccess" };
  if (game_type === "holomodels") {
    if (display_type === "holomodels") return { text: "본체", className: "bg-csuccess" };
    if (display_type === "holomodelsdlc") return { text: "DLC", className: "bg-ccontent" };
    if (display_type === "holomodelsedition") return { text: "에디션", className: "bg-cprimary" };
  }
  return null;
}

/**
 * 모바일 상품 thumb 카드 — legacy `mobile/game/thumb_inc.php`(L66~146) 마크업 재현.
 * PC `ProductThumbCard`와 마크업이 다르다(모바일 thumb에는 위시/장바구니·한국어/플랫폼 배지 없음).
 */
export function MobileThumbCard({ product }: { product: ProductThumb }) {
  const badge = typeBadge(product);

  return (
    <div className="card thumb-card card-shadow border-0 rounded-0 justify-content-between">
      <div>
        <div className="product_name text-truncate">{product.product_name}</div>
        <div className="img position-relative">
          <a href={product.view_url} data-sku={product.goods_sku} className="product-link">
            <img
              src={`${product.domain}/upload/product/${product.product_code}/header/header.jpg`}
              className="w-100"
              alt={product.product_name}
            />
          </a>
          <div className="position-absolute bottom-0 start-0">
            {badge && <span className={`badge ${badge.className} rounded-0`}>{badge.text}</span>}
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between card-tail p-25 lh-1 align-items-center">
        <div className="align-self-center card-price">
          {product.discount > 0 ? (
            <div className={`rounded-2 ${product.promotion_label} badge percent px-2 minus`}>
              {product.discount} %
            </div>
          ) : (
            <div></div>
          )}
        </div>
        <div className="align-items-end d-flex flex-column">
          {product.discount > 0 && (
            <s className="num won old-price"> {formatWon(product.consumer_price)}</s>
          )}
          <span className="current-price text-white num won"> {formatWon(product.price)}</span>
        </div>
      </div>
    </div>
  );
}
