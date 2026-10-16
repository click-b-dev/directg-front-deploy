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

/**
 * legacy option_gubun: display_type(basic/edition) 지정 후 game_type(dlc/bundle)이 override.
 * → bundle/dlc가 basic/edition보다 우선. game_type=game이면 display_type 결과 사용.
 */
function optionGubun(game: ProductThumb): { label: string; cls: string } | null {
  if (game.game_type === "bundle") return { label: "번들", cls: "bg-success" };
  if (game.game_type === "dlc") return { label: "DLC", cls: "bg-ccontent" };
  if (game.display_type === "basic") return { label: "기본게임", cls: "bg-info" };
  if (game.display_type === "edition") return { label: "에디션", cls: "bg-primary" };
  return null;
}

/**
 * 모바일 시즌 S-3 — 프로모션 인기게임 (legacy `#promotion_best` 233~318).
 * Splide carousel-multiple(perPage 2). ranking 배지 + option_gubun + 코드발송/예약구매/특전 + 가격.
 * legacy 단일 foreach(순위 연속) 재현: thumbList+gridList 평면 concat, ranking=index+1.
 * 주말특가 W-3와 차이: card-header border-0 없음, gubun 배지 `font-11 py-1 px-2` 포함, DLC(bg-ccontent) 처리,
 * 배지 `rounded-1 percent -{discount}%`, min-height:32px row(lh-1 없음), gubun 없어도 빈 div 렌더(verbatim).
 */
export function MobileSeasonBestSection({ list }: { list: ProductThumb[] }) {
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
                    <div className="card-header rounded-0 text-truncate ps-1">
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
                      <div className="position-absolute bottom-0 start-0">
                        {gubun && (
                          <span className={`badge ${gubun.cls} rounded-0 font-11 py-1 px-2`}>
                            {gubun.label}
                          </span>
                        )}
                      </div>
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
                      <div
                        className="d-flex justify-content-between align-items-center"
                        style={{ minHeight: "32px" }}
                      >
                        <div>
                          {best.discount > 0 && (
                            <span className={`badge ${best.promotion_label} rounded-1 percent`}>
                              -{best.discount}%
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
