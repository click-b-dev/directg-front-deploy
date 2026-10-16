"use client";

import { useSplide } from "@shared/lib/use-splide";
import type { MainBanner } from "@entities/main-banner";

/** legacy Splide arrowPath (커스텀 chevron). */
const BANNER_ARROW_PATH =
  "M33.1875 26.1313L15.7719 42.725C15.4813 43.002 15.0952 43.1566 14.6937 43.1566C14.2923 43.1566 13.9062 43.002 13.6156 42.725L13.5969 42.7063C13.4555 42.572 13.3429 42.4103 13.266 42.2312C13.1891 42.052 13.1494 41.859 13.1494 41.6641C13.1494 41.4691 13.1891 41.2762 13.266 41.097C13.3429 40.9178 13.4555 40.7562 13.5969 40.6219L29.9969 24.9969L13.5969 9.37813C13.4555 9.24384 13.3429 9.0822 13.266 8.90303C13.1891 8.72387 13.1494 8.53092 13.1494 8.33595C13.1494 8.14096 13.1891 7.94802 13.266 7.76886C13.3429 7.58969 13.4555 7.42805 13.5969 7.29376L13.6156 7.27501C13.9062 6.99799 14.2923 6.84346 14.6937 6.84346C15.0952 6.84346 15.4813 6.99799 15.7719 7.27501L33.1875 23.8688C33.3407 24.0147 33.4626 24.1902 33.5459 24.3847C33.6292 24.5791 33.6722 24.7885 33.6722 25C33.6722 25.2116 33.6292 25.4209 33.5459 25.6154C33.4626 25.8098 33.3407 25.9853 33.1875 26.1313Z";

const BANNER_OPTIONS = {
  type: "loop",
  padding: "15%",
  autoWidth: true,
  focus: "center",
  arrows: true,
  arrowPath: BANNER_ARROW_PATH,
  classes: {
    pagination: "splide__pagination splide-button",
    page: "splide__pagination__page splide-button",
  },
  autoplay: true,
  interval: 4000,
};

const formatWon = (value: number) => value.toLocaleString("ko-KR");

function BannerSlide({ banner }: { banner: MainBanner }) {
  const option = banner.option_info;
  const consumerPrice = option?.consumer_price ?? 0;
  let price = 0;
  let discount = 0;
  let promotionLabel = "";
  let salesStatus: { label: string; className: string } | null = null;

  if (option) {
    if ((option.promotion?.sale_price ?? 0) > 0) {
      price = option.promotion!.sale_price;
      promotionLabel = "bg-danger";
    } else {
      price = option.price;
      promotionLabel = "bg-primary";
    }
    discount = ((consumerPrice - price) * 100) / consumerPrice;
    salesStatus =
      option.is_preorder === "Y"
        ? { label: "예약구매", className: "bg-warning" }
        : { label: "절찬 판매중", className: "bg-primary" };
  }

  const showCaption = banner.show_prod_info === "Y" || banner.show_sale_info === "Y";

  return (
    <li className="splide__slide">
      <div className="splide__slide__container">
        <a
          href={banner.main_banner_link}
          className="stretched-link"
          title={banner.banner_title}
          target={banner.main_banner_target}
        >
          <img src={banner.main_banner_pc} alt={banner.banner_title} />
        </a>
        {showCaption && (
          <div className="caption w-50">
            <div className="d-flex flex-column" style={{ height: "400px" }}>
              <div className="mb-3">
                {banner.show_prod_info === "Y" && salesStatus && (
                  <span className={`badge ${salesStatus.className} fs-5 badge-lg`}>
                    {salesStatus.label}
                  </span>
                )}
              </div>
              <div className="mb-auto">
                {banner.show_prod_info === "Y" && (
                  <h2 className="h2 text-white fw-bold text-wrap lh-sm">{option?.product_name}</h2>
                )}
              </div>
              {banner.show_sale_info === "Y" && (
                <>
                  <div className="mb-3">
                    <span className="h4">{banner.title_info?.publisher}</span>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex flex-row align-items-center">
                      {discount > 0 && (
                        <div className="pe-3">
                          <span
                            className={`badge ${promotionLabel} fw-bold font-16 num px-3 py-3 lh-1`}
                          >
                            -{Math.round(discount)}%
                          </span>
                        </div>
                      )}
                      <div className="d-flex flex-column">
                        {discount > 0 && (
                          <s className="font-12 text-secondary num won">
                            {" "}
                            {formatWon(consumerPrice)}
                          </s>
                        )}
                        <span className="font-16 fw-bold num won"> {formatWon(price)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    {option && option.release_date > "1990-01-01 00:00:00" && (
                      <span className="font-16">
                        출시일: {option.release_date.substring(0, 10)}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

export function MainBannerCarousel({ banners }: { banners: MainBanner[] }) {
  const ref = useSplide<HTMLElement>(BANNER_OPTIONS);

  return (
    <section className="splide mt-5" id="splide" ref={ref}>
      <div className="splide__track">
        <ul className="splide__list">
          {banners.map((banner, index) => (
            <BannerSlide key={index} banner={banner} />
          ))}
        </ul>
      </div>
    </section>
  );
}
