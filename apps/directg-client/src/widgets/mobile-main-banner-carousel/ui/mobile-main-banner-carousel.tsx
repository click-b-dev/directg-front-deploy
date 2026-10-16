"use client";

import { useSplide } from "@shared/lib/use-splide";
import type { MainBanner } from "@entities/main-banner";

/** legacy index.php main_banner splide 옵션(loop autoplay 4s). grid extension은 perPage 1이라 무효과 → 생략. */
const MAIN_BANNER_OPTIONS = {
  type: "loop",
  perPage: 1,
  perMove: 1,
  pagination: false,
  arrows: false,
  drag: true,
  flickMaxPages: 1,
  autoplay: true,
  interval: 4000,
};

const formatWon = (value: number) => value.toLocaleString("ko-KR");

/** legacy: round((consumer - price) * 100 / consumer). consumer 0 방어. */
const calcDiscount = (consumer: number, price: number) =>
  consumer > 0 ? Math.round(((consumer - price) * 100) / consumer) : 0;

function BannerSlide({ banner }: { banner: MainBanner }) {
  const option = banner.option_info;
  const consumerPrice = option?.consumer_price ?? 0;

  let price = 0;
  let discount = 0;
  let promotionLabel = "";
  let isPromotion = false;
  if (option) {
    if ((option.promotion?.sale_price ?? 0) > 0) {
      price = option.promotion!.sale_price;
      isPromotion = true;
      promotionLabel = "bg-danger";
    } else {
      price = option.price;
      isPromotion = false;
      promotionLabel = "bg-cprimary";
    }
    discount = calcDiscount(consumerPrice, price);
  }

  const salesStatus =
    option?.is_preorder === "Y"
      ? { label: "예약구매", className: "bg-cwarning" }
      : { label: "절찬 판매중", className: "bg-cprimary" };

  return (
    <li className="splide__slide">
      <div className="card product-card rounded-0">
        <a href={banner.main_banner_link}>
          <img
            src={banner.main_banner_mobile}
            className="imaged w-100 rounded-0"
            alt={`${option?.product_name ?? ""} 이미지`}
          />

          <div className="card-img-overlay rounded-0 d-flex align-items-end">
            <div className="status_badge col-6 p-0">
              {/* show_prod_info=Y 일 때만 판매상태 */}
              {banner.show_prod_info === "Y" && option && (
                <span className={`badge ${salesStatus.className} rounded-1`}>
                  {salesStatus.label}
                </span>
              )}
              {option && isPromotion && (
                <span className="badge bg-cdanger rounded-1">프로모션</span>
              )}
              {option && option.is_bonus === "Y" && (
                <span className="badge bg-cinfo rounded-1">특전</span>
              )}
            </div>

            <div className="status_price col-6 p-0">
              {/* show_sale_info=Y 일 때만 가격 */}
              {banner.show_sale_info === "Y" && option && (
                <>
                  {discount > 0 && (
                    <div className="d-flex align-items-end">
                      <span className={`badge ${promotionLabel} fw-bold num rounded-1 minus`}>
                        {discount} %
                      </span>
                    </div>
                  )}
                  <div className="d-flex flex-column align-items-start">
                    {discount > 0 && <s className="num mb-0 won"> {formatWon(consumerPrice)}</s>}
                    <span className="fw-bold num text-white won"> {formatWon(price)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </a>
      </div>
    </li>
  );
}

/**
 * 모바일 메인 배너 캐러셀 (legacy index.php `#main_banner` carousel-full splide).
 * `getMainBanners()` 재사용. overlay(status_badge/status_price) + show_prod/sale_info 분기.
 */
export function MobileMainBannerCarousel({ banners }: { banners: MainBanner[] }) {
  const ref = useSplide<HTMLDivElement>(MAIN_BANNER_OPTIONS);

  return (
    <div className="section full mb-2">
      <div className="carousel-full splide" id="main_banner" ref={ref}>
        <div className="splide__track">
          <ul className="splide__list">
            {banners.map((banner, index) => (
              <BannerSlide key={index} banner={banner} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
