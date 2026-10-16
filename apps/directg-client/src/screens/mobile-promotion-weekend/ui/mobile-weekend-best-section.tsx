"use client";

import type { ProductThumb } from "@entities/product-thumb";
import { useSplide } from "@shared/lib/use-splide";

/** legacy `#promotion_best` splide2 옵션(recommand와 동일). grid 확장 미마운트 → perPage 2만. */
const BEST_OPTIONS = {
  perPage: 2,
  perMove: 1,
  pagination: false,
  arrows: false,
  drag: true,
  flickMaxPages: 1,
};

const nf = (value: number) => value.toLocaleString("en-US");

/** legacy option_gubun: bundle이 display_type basic/edition보다 우선. */
function optionGubun(game: ProductThumb): { label: string; cls: string } | null {
  if (game.game_type === "bundle") return { label: "번들", cls: "bg-success" };
  if (game.display_type === "basic") return { label: "기본게임", cls: "bg-info" };
  if (game.display_type === "edition") return { label: "에디션", cls: "bg-primary" };
  return null;
}

/**
 * 모바일 주말특가 W-3 — 프로모션 인기게임 (legacy `#promotion_best`).
 * Splide carousel-multiple(perPage 2). ranking 배지 + option_gubun + 코드발송/예약구매/특전 + 가격.
 * legacy 단일 foreach(순위 연속) 재현 위해 thumbList+gridList를 평면 concat, ranking=index+1.
 */
export function MobileWeekendBestSection({ list }: { list: ProductThumb[] }) {
  const ref = useSplide<HTMLDivElement>(BEST_OPTIONS);

  return (
    <div className="section full mb-3">
      <div className="section-title py-2 px-2">
        <div className="d-flex justify-content-between align-items-end w-100">
          <h2 className="mb-0 font-16">프로모션 인기게임</h2>
        </div>
      </div>
      <div className="carousel-multiple splide px-2" id="promotion_best" ref={ref}>
        <div className="splide__track">
          <ul className="splide__list">
            {list.map((best, index) => {
              const gubun = optionGubun(best);
              return (
                <li className="splide__slide" key={index}>
                  <div className="card product-card">
                    <div className="card-header rounded-0 text-truncate ps-1 border-0">
                      {best.product_name}
                    </div>
                    <div className="card-img position-relative rounded-0">
                      <div className="position-absolute top-0 start-0">
                        <div
                          className="bg-secondary text-dark text-center"
                          style={{ width: "32px", height: "32px", background: "#313E4F" }}
                        >
                          <span className="badge rounded-0 font-14 my-1">{index + 1}</span>
                        </div>
                      </div>
                      <a href={best.view_url}>
                        <img
                          src={`${best.domain}/upload/product/${best.product_code}/header/header.jpg`}
                          className="imaged w-100 square"
                          alt={`${best.product_name} image`}
                        />
                      </a>
                      {gubun && (
                        <div className="position-absolute bottom-0 start-0">
                          <span className={`badge ${gubun.cls} rounded-0`}>{gubun.label}</span>
                        </div>
                      )}
                    </div>
                    <div className="card-badge bg-grey d-flex flex-row align-items-center">
                      <span className="badge badge-outline-success rounded-2">코드발송</span>
                      {best.is_preorder === "Y" && (
                        <span className="badge rounded-2 badge-outline-warning">예약구매</span>
                      )}
                      {best.is_bonus === "Y" && (
                        <span className="badge rounded-2 badge-outline-info">특전</span>
                      )}
                    </div>
                    <div className="card-body px-2">
                      <div className="d-flex justify-content-between lh-1 align-items-center">
                        <div>
                          {best.discount > 0 && (
                            <span
                              className={`rounded-2 ${best.promotion_label} badge percent px-2 minus`}
                            >
                              {best.discount} %
                            </span>
                          )}
                        </div>
                        <div className="card-price">
                          {best.discount > 0 && (
                            <div className="old-price">
                              <s className="won"> {nf(best.consumer_price)}</s>
                            </div>
                          )}
                          <div className="current-price text-white won"> {nf(best.price)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
