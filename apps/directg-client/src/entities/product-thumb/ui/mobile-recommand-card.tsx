import type { ProductThumb } from "../model/types";

const formatWon = (value: number) => value.toLocaleString("ko-KR");

/**
 * game_type/display_type별 badge (legacy 모바일 `#recommand_list` — `MobileThumbCard`와 동일 매핑).
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
 * 모바일 추천·특집 row 카드 — legacy `mobile/index.php` `#recommand_list`(L381~480) 마크업 재현.
 * 좌 커버(product header)+타입 badge / 우 한국어 badge·product_name / 하단 card-tail(발송·프로모션·예약·특전 badge + 가격).
 * URL은 백엔드 precompute `view_url` 재사용. 프로모션 라벨은 legacy 규칙(is_promotion Y→bg-cdanger)으로 파생.
 */
export function MobileRecommandCard({ product }: { product: ProductThumb }) {
  const badge = typeBadge(product);
  const promotionLabel = product.is_promotion === "Y" ? "bg-cdanger" : "bg-cprimary";

  return (
    <div className="card row-card rounded-1 card-shadow border-0">
      <div className="card-body d-flex p-0">
        <div className="img rounded-0 position-relative col-5">
          <a href={product.view_url}>
            <img
              src={`${product.domain}/upload/product/${product.product_code}/header/header.jpg`}
              className="img-fluid"
              alt={product.product_name}
            />
          </a>
          <div className="position-absolute top-0 start-0">
            {badge && <span className={`badge ${badge.className} rounded-0`}>{badge.text}</span>}
          </div>
        </div>
        <div className="product-info col-7">
          <div className="card-title d-flex flex-column mb-0 justify-content-evenly w-100 h-100">
            <div className="d-flex align-items-start flex-wrap align-content-start flex-shrink-0">
              {product.spoken_korean === "Y" && (
                <span className="badge rounded-2 bg-cinfo">음성 한국어</span>
              )}
              {product.interface_korean === "Y" && (
                <span className="badge rounded-2 bg-clight">인터페이스/자막 한글</span>
              )}
              {product.exclusive_korean === "Y" && (
                <span className="badge rounded-2 bg-clight">독점 한국어</span>
              )}
            </div>
            <div className="product_name text-truncate">{product.product_name}</div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between card-tail">
        <div className="d-flex flex-row justify-content-start flex-wrap card-badge align-content-center">
          {product.delivery_type === "1" && (
            <span className="badge badge-outline-success rounded-2">코드</span>
          )}
          {product.delivery_type === "2" && (
            <span className="badge badge-outline-post rounded-2">택배</span>
          )}
          {product.delivery_type === "3" && (
            <span className="badge badge-outline-code-post rounded-2">코드+택배</span>
          )}
          {product.is_promotion === "Y" && (
            <span className="badge badge-outline-danger rounded-2">프로모션</span>
          )}
          {product.is_preorder === "Y" && (
            <span className="badge rounded-2 badge-outline-warning">예약</span>
          )}
          {product.is_bonus === "Y" && (
            <span className="badge rounded-2 badge-outline-info">특전</span>
          )}
        </div>
        <div>
          <div className="d-flex flex-row justify-content-between align-items-center card-price">
            {product.discount > 0 ? (
              <div className={`rounded-2 ${promotionLabel} badge percent minus`}>
                {product.discount} %
              </div>
            ) : (
              <div></div>
            )}
            <div className="align-content-end d-flex flex-column align-items-end">
              {product.discount > 0 && (
                <s className="num won old-price"> {formatWon(product.consumer_price)}</s>
              )}
              <span className="current-price text-white num won"> {formatWon(product.price)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
