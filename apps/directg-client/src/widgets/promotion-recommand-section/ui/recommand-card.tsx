"use client";

import type { WeekendRecommandGame } from "@entities/promotion-weekend";

const formatWon = (value: number) => value.toLocaleString("ko-KR");

/**
 * DG 추천게임 카드 (legacy promotion_weekend.html 154–171). hero_capsule + onerror 로고 + 할인/가격.
 * onError(client 인터랙션) 때문에 client 컴포넌트로 분리.
 */
export function RecommandCard({ game }: { game: WeekendRecommandGame }) {
  return (
    <div className="col-3">
      <div className="card mb-0 rounded-1 card-shadow bg-card border-0">
        <a href={`/game/game_view?product_id=${game.sku}`} title={game.product_name}>
          <img
            src={`${game.domain}/upload/title/${game.title_id}/hero/hero_capsule.jpg`}
            className="card-img-top rounded-1"
            alt={game.product_name}
            onError={(e) => {
              e.currentTarget.src = "/assets/images/logo/H2_DG_BI_VERTICAL.svg";
            }}
          />
        </a>
        <div className="card-footer px-2 py-0 border-0">
          <div
            className="d-flex flex-row justify-content-between align-items-center"
            style={{ minHeight: "48px" }}
          >
            {game.discount > 0 && (
              <div>
                <span className={`badge ${game.promotion_label} num font-14 px-3 py-2`}>
                  -{game.discount}%
                </span>
              </div>
            )}
            <div className="ms-auto text-end align-text-bottom">
              {game.discount > 0 && (
                <div className="d-block fw-normal p-0 m-0">
                  <small className="text-decoration-line-through text-secondary font-11 num won">
                    {" "}
                    {formatWon(game.consumer_price)}
                  </small>
                </div>
              )}
              <div className="d-block">
                <span className="d-block p-0 m-0 num text-white font-14 fw-bold won">
                  {" "}
                  {formatWon(game.price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
