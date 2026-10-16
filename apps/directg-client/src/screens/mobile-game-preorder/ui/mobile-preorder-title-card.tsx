import type { PreorderTitle } from "@entities/preorder-list";

const formatWon = (value: number) => value.toLocaleString("ko-KR");

/**
 * 예약구매 타이틀 카드 — legacy `game_preorder.html`(L90~134) 마크업 재현.
 * 타이틀 헤더 이미지 + 옵션(game/edition/dlc) listview(출시예정일·상품명·할인/정가/판매가).
 * 링크는 옵션 무관 타이틀 game_view(product_id={sku}) — legacy 동일.
 */
export function MobilePreorderTitleCard({ title }: { title: PreorderTitle }) {
  const viewUrl = `/game/game_view?product_id=${title.sku}`;

  return (
    <div className="col-12">
      <div className="card product-card mx-2">
        <div className="card-body p-0">
          <a href={viewUrl} className="text-white">
            <div className="position-relative">
              <img
                src={`${title.domain}/upload/title/${title.title_id}/header/${title.title_id}.jpg`}
                className="image rounded-0"
                alt={`${title.title_name} image`}
              />
            </div>
            {/* 옵션상품 목록 */}
            <ul className="listview image-listview">
              {title.options.map((option) => (
                <li key={option.product_code}>
                  <a href={viewUrl} className="item">
                    <div className="in">
                      <div>
                        <header className="mb-1">출시 예정일: {title.release_date}</header>
                        <p className="font-16 mb-0">{option.product_name}</p>
                        <footer>
                          {option.discount > 0 && (
                            <span
                              className={`badge ${option.promotion_label} fw-bold font-14 num rounded-2 me-1 px-2 py-2`}
                            >
                              -{option.discount}%
                            </span>
                          )}
                          {option.discount > 0 && (
                            <span className="text-decoration-line-through text-muted font-11 num me-1">
                              ₩ {formatWon(option.consumer_price)}
                            </span>
                          )}
                          <span className="fw-bold font-14 num me-1">
                            ₩ {formatWon(option.price)}
                          </span>
                        </footer>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </a>
        </div>
      </div>
    </div>
  );
}
