"use client";

import type { ProductThumb } from "@entities/product-thumb";
import { useSplide } from "@shared/lib/use-splide";

/** legacy `#promotion_max_discount`/`_add_repay`/`_price_*` splide 옵션(공통). grid 확장 미마운트 → perPage 2만. */
const CAROUSEL_OPTIONS = {
  perPage: 2,
  perMove: 1,
  pagination: false,
  arrows: false,
  drag: true,
  flickMaxPages: 1,
};

const nf = (value: number) => value.toLocaleString("en-US");

/** legacy S-5~S-7 카드 option_gubun: display_type만 분기(best와 달리 dlc/bundle 처리 없음). */
function optionGubun(game: ProductThumb): { label: string; cls: string } | null {
  if (game.display_type === "basic") return { label: "기본게임", cls: "bg-info" };
  if (game.display_type === "edition") return { label: "에디션", cls: "bg-primary" };
  return null;
}

interface MobileSeasonCarouselSectionProps {
  /** 섹션 제목(h2). */
  title: string;
  /** 캐러셀 컨테이너 id(legacy `#promotion_max_discount` 등). */
  carouselId: string;
  /** 전체보기 링크(config 파생 또는 하드코딩 가격 프리셋). */
  allViewLink: string;
  list: ProductThumb[];
}

/**
 * 모바일 시즌 공용 캐러셀 섹션 — S-5(역대 최대할인)/S-6(추가 포인트 적립)/S-7(5천·1만원 미만) 공유.
 * legacy 카드 구조 동일(순위 없음, card-header ps-1 없음, display_type gubun만, 비프로모션 label bg-primary, game_view 링크=view_url).
 * best(S-3)와 차이: ranking 배지 없음, DLC/번들 gubun 없음, card-header ps-1 없음.
 */
export function MobileSeasonCarouselSection({
  title,
  carouselId,
  allViewLink,
  list,
}: MobileSeasonCarouselSectionProps) {
  const ref = useSplide<HTMLDivElement>(CAROUSEL_OPTIONS);

  return (
    <div className="section full mb-3">
      <div className="section-title py-2 px-2">
        <div className="d-flex justify-content-between align-items-end w-100">
          <h2 className="mb-0 font-16">{title}</h2>
          <a href={allViewLink} className="btn btn-outline-primary btn-allview">
            전체보기
          </a>
        </div>
      </div>
      <div className="carousel-multiple splide px-2" id={carouselId} ref={ref}>
        <div className="splide__track">
          <ul className="splide__list">
            {list.map((game, index) => {
              const gubun = optionGubun(game);
              return (
                <li className="splide__slide" key={index}>
                  <div className="card product-card">
                    <div className="card-header rounded-0 text-truncate">{game.product_name}</div>
                    <div className="card-img position-relative rounded-0">
                      <a href={game.view_url}>
                        <img
                          src={`${game.domain}/upload/product/${game.product_code}/header/header.jpg`}
                          className="imaged w-100 square"
                          alt={`${game.product_name} image`}
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
                      {game.is_preorder === "Y" && (
                        <span className="badge rounded-2 badge-outline-warning">예약구매</span>
                      )}
                      {game.is_bonus === "Y" && (
                        <span className="badge rounded-2 badge-outline-info">특전</span>
                      )}
                    </div>
                    <div className="card-body px-2">
                      <div
                        className="d-flex justify-content-between align-items-center"
                        style={{ minHeight: "32px" }}
                      >
                        <div>
                          {game.discount > 0 && (
                            <span className={`badge ${game.promotion_label} rounded-1 percent`}>
                              -{game.discount}%
                            </span>
                          )}
                        </div>
                        <div className="card-price">
                          {game.discount > 0 && (
                            <div className="old-price">
                              <s className="won"> {nf(game.consumer_price)}</s>
                            </div>
                          )}
                          <div className="current-price text-white won"> {nf(game.price)}</div>
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
