"use client";

import type { WeekendRecommandGame } from "@entities/promotion-weekend";
import { useSplide } from "@shared/lib/use-splide";

/** legacy `#promotion_recommand` splide1 옵션. grid는 확장 미마운트로 무효 → core(perPage 2)만. */
const RECOMMAND_OPTIONS = {
  perPage: 2,
  perMove: 1,
  pagination: false,
  arrows: false,
  drag: true,
  flickMaxPages: 1,
};

const nf = (value: number) => value.toLocaleString("en-US");

/**
 * 모바일 주말특가 W-2 — DG 추천게임 (legacy `mobile/promotion/promotion_weekend.html` `#promotion_recommand`).
 * Splide carousel-multiple(perPage 2). 카드 헤더/alt는 title_name, 가격은 option 파생(백엔드).
 */
export function MobileWeekendRecommandSection({ list }: { list: WeekendRecommandGame[] }) {
  const ref = useSplide<HTMLDivElement>(RECOMMAND_OPTIONS);

  return (
    <div className="section full mb-3">
      <div className="section-title py-2 px-2">
        <div className="d-flex justify-content-between align-items-end w-100">
          <h2 className="mb-0 font-16">DG 추천게임</h2>
        </div>
      </div>
      <div className="carousel-multiple splide px-2" id="promotion_recommand" ref={ref}>
        <div className="splide__track">
          <ul className="splide__list">
            {list.map((recommand, index) => (
              <li className="splide__slide" key={index}>
                <div className="card product-card">
                  <div className="card-header rounded-0 text-truncate ps-1 border-0">
                    {recommand.title_name}
                  </div>
                  <div className="card-img position-relative rounded-0">
                    <a href={`/game/game_view?product_id=${recommand.sku}`}>
                      <img
                        src={`${recommand.domain}/upload/title/${recommand.title_id}/hero/hero_capsule.jpg`}
                        className="imaged w-100 square"
                        alt={`${recommand.title_name} image`}
                      />
                    </a>
                  </div>
                  <div className="card-body px-2">
                    <div
                      className="d-flex justify-content-between lh-1 align-items-center"
                      style={{ minHeight: "32px" }}
                    >
                      <div>
                        {recommand.discount > 0 && (
                          <span
                            className={`rounded-2 ${recommand.promotion_label} badge percent px-2 minus`}
                          >
                            {recommand.discount} %
                          </span>
                        )}
                      </div>
                      <div className="card-price">
                        {recommand.discount > 0 && (
                          <div className="old-price">
                            <s className="won"> {nf(recommand.consumer_price)}</s>
                          </div>
                        )}
                        <div className="current-price text-white won"> {nf(recommand.price)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
