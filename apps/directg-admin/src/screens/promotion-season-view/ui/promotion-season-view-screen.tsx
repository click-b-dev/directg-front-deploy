import type { SyntheticEvent } from "react";
import {
  usePromotionSeasonView,
  type PromotionSeasonViewSearch,
  type SeasonViewGoods,
} from "@entities/promotion";
import { Badge, type BadgeVariant } from "@shared/ui";
import "@shared/styles/storefront-preview.css";

const FALLBACK_IMG = "/assets/images/logo/H2_DG_BI_VERTICAL.svg";
const won = (n: number) => n.toLocaleString();
const onImgError = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.src = FALLBACK_IMG;
};

const derive = (g: SeasonViewGoods) => {
  const isPromo = g.promotion_sale_price > 0;
  return {
    isPromo,
    price: isPromo ? g.promotion_sale_price : g.option_price,
    discount: isPromo ? g.promotion_discount_rate : g.option_discount,
    priceVariant: (isPromo ? "danger" : "primary") as BadgeVariant,
  };
};

const optionGubun = (g: SeasonViewGoods): { variant: BadgeVariant; label: string } | null => {
  let badge: { variant: BadgeVariant; label: string } | null = null;
  if (g.display_type === "basic") badge = { variant: "info", label: "기본게임" };
  else if (g.display_type === "edition") badge = { variant: "primary", label: "에디션" };
  if (g.game_type === "bundle") badge = { variant: "success", label: "번들" };
  return badge;
};

const bestViewUrl = (g: SeasonViewGoods) => {
  if (g.game_type === "dlc") return `/game/dlc_view.html?sku=${g.goods_sku}`;
  if (g.game_type === "bundle") return `/game/bundle_view.html?sku=${g.goods_sku}`;
  if (g.game_type === "game") return `/game/game_view.html?product_id=${g.title_sku}`;
  return "";
};
const gameViewUrl = (g: SeasonViewGoods) => `/game/game_view.html?product_id=${g.title_sku}`;

const GubunBadge = ({ g }: { g: SeasonViewGoods }) => {
  const gubun = optionGubun(g);
  if (!gubun) return null;
  return <Badge variant={gubun.variant}>{gubun.label}</Badge>;
};

// legacy promotion/promotion_season_view.php — 대규모 프로모션 상세보기(6섹션).
export const PromotionSeasonViewScreen = ({ idx }: PromotionSeasonViewSearch) => {
  const { data } = usePromotionSeasonView(idx);

  if (!data) {
    return null;
  }

  const bestLarge = data.best.slice(0, 4);
  const bestSmall = data.best.slice(4);

  return (
    <>
      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    프로모션
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    대규모 프로모션 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">대규모 프로모션 상세보기</li>
              </ol>
            </div>
            <h4 className="page-title">{data.promotion_season_name}</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          {/* 배너 */}
          <div className="container">
            <a href={data.promotion_season_banner_link} target="_blank" rel="noreferrer">
              <img
                src={data.promotion_season_banner_pc}
                className="w-100"
                alt={data.promotion_season_name}
              />
            </a>
            <div className="b-example-divider" />
          </div>

          {/* DG 추천게임 */}
          <section className="mb-3">
            <div className="container">
              <h3 className="fw-bold">DG 추천게임</h3>
              <div className="row row-col-1 row-cols-md-4 g-2 justify-content-center">
                {data.recommand.map((g, i) => (
                  <RecommandCard key={`${g.product_code}-${i}`} g={g} />
                ))}
              </div>
            </div>
            <div className="b-example-divider" />
          </section>

          {/* 프로모션 인기게임 */}
          <section className="mb-3">
            <div className="container">
              <h3 className="fw-bold">프로모션 인기게임</h3>
              <div className="row row-col-1 row-cols-md-4 g-2 justify-content-center mb-3">
                {bestLarge.map((g, i) => (
                  <BestCard key={`${g.product_code}-${i}`} g={g} ranking={i + 1} small={false} />
                ))}
              </div>
              <div className="row row-col-1 row-cols-md-6 g-2 justify-content-center">
                {bestSmall.map((g, i) => (
                  <BestCard key={`${g.product_code}-${i}`} g={g} ranking={i + 5} small />
                ))}
              </div>
            </div>
            <div className="b-example-divider" />
          </section>

          {/* 역대 최대할인 */}
          <section className="mb-3">
            <div className="container">
              <div className="d-flex flex-row align-items-start">
                <h2 className="fw-bold">역대 최대할인</h2>
              </div>
              <div className="row row-col-1 row-cols-md-4 g-4 justify-content-center">
                <div className="col-3">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    <img src="https://image.directg.net/h843N9Ie0v" className="h-100" alt="" />
                  </a>
                </div>
                {data.max_discount.map((g, i) => (
                  <TitleCard key={`${g.product_code}-${i}`} g={g} />
                ))}
              </div>
            </div>
            <div className="b-example-divider" />
          </section>

          {/* 추가 포인트 적립 */}
          <section className="mb-3">
            <div className="container">
              <div className="d-flex flex-row align-items-start">
                <h2 className="fw-bold">추가 포인트 적립</h2>
              </div>
              <div className="row row-col-1 row-cols-md-4 g-4 justify-content-center">
                <div className="col-3">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    <img src="https://image.directg.net/Y88eupClXn" className="h-100" alt="" />
                  </a>
                </div>
                {data.add_repay.map((g, i) => (
                  // legacy 버그: add_repay 취소선은 오타 변수($max_dadd_repayiscount) → 0 표시
                  <TitleCard key={`${g.product_code}-${i}`} g={g} strikeValue={0} />
                ))}
              </div>
            </div>
            <div className="b-example-divider" />
          </section>

          {/* 5천원/1만원 미만 게임 */}
          <section className="mb-3">
            <div className="container">
              <div className="row">
                <div className="col-6">
                  <div className="d-flex flex-row align-items-start">
                    <h2 className="fw-bold">5천원 미만 게임</h2>
                  </div>
                  <article id="price_5000">
                    <div className="row row-cols-1 row-cols-md-1 g-3">
                      {data.price_5000.map((g, i) => (
                        <PriceCard key={`${g.product_code}-${i}`} g={g} />
                      ))}
                    </div>
                  </article>
                </div>
                <div className="col-6">
                  <div className="d-flex flex-row align-items-start">
                    <h2 className="fw-bold">1만원 미만 게임</h2>
                  </div>
                  <article id="price_10000">
                    <div className="row row-cols-1 row-cols-md-1 g-3">
                      {data.price_10000.map((g, i) => (
                        <PriceCard key={`${g.product_code}-${i}`} g={g} truncateTitle />
                      ))}
                    </div>
                  </article>
                </div>
              </div>
            </div>
            <div className="b-example-divider" />
          </section>
        </div>
      </div>
    </>
  );
};

const DiscountPriceFooter = ({ g, strikeValue }: { g: SeasonViewGoods; strikeValue?: number }) => {
  const { price, discount, priceVariant } = derive(g);
  const strike = strikeValue ?? g.consumer_price;
  return (
    <div className="card-footer px-2 py-0 border-0 bg-secondary">
      <div
        className="d-flex flex-row justify-content-between align-items-center"
        style={{ minHeight: "48px" }}
      >
        {discount > 0 && (
          <div>
            <Badge variant={priceVariant} className="num">
              -{discount}%
            </Badge>
          </div>
        )}
        <div className="ms-auto text-end align-text-bottom">
          {discount > 0 && (
            <div className="d-block fw-normal p-0 m-0">
              <small className="text-decoration-line-through text-white font-11 num won">
                {" "}
                {won(strike)}
              </small>
            </div>
          )}
          <div className="d-block">
            <span className="d-block p-0 m-0 num text-white font-16 fw-bold won">
              {` ${won(price)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CodeBadges = ({ g }: { g: SeasonViewGoods }) => {
  const { isPromo } = derive(g);
  return (
    <div className="p-2">
      <Badge variant="success" outline className="ms-1">
        코드발송
      </Badge>
      {isPromo && (
        <Badge variant="danger" outline className="ms-2">
          프로모션
        </Badge>
      )}
      {g.is_preorder === "Y" && (
        <Badge variant="warning" outline className="ms-2">
          예약구매
        </Badge>
      )}
      {g.is_bonus === "Y" && (
        <Badge variant="info" outline className="ms-2">
          특전
        </Badge>
      )}
    </div>
  );
};

const RecommandCard = ({ g }: { g: SeasonViewGoods }) => (
  <div className="col-3">
    <div className="card mb-0 rounded-1 card-shadow bg-card border-0">
      <div className="card-header bg-secondary text-white">{g.title_name}</div>
      <a href={gameViewUrl(g)} title={g.title_name}>
        <img
          src={`${g.title_domain}/upload/title/${g.title_id}/hero/hero_capsule.jpg?t=20251118`}
          className="card-img-top rounded-1"
          alt={g.title_name}
          onError={onImgError}
        />
      </a>
      <DiscountPriceFooter g={g} />
    </div>
  </div>
);

const BestCard = ({
  g,
  ranking,
  small,
}: {
  g: SeasonViewGoods;
  ranking: number;
  small: boolean;
}) => {
  const viewUrl = bestViewUrl(g);
  const suffix = small ? "" : "?t=20251027";
  const Inner = (
    <>
      <div className="position-relative">
        <div className="position-absolute top-0 start-0">
          <div className="ratio ratio-1x1" style={{ width: "32px", height: "32px" }}>
            <span className="badge bg-dark text-white rounded-0 font-14 num px-1 py-2">
              {ranking}
            </span>
          </div>
        </div>
        <a href={viewUrl} title={g.product_name}>
          <img
            src={`${g.option_domain}/upload/product/${g.product_code}/header/header.jpg${suffix}`}
            className="card-img-top rounded-0"
            alt={g.product_name}
            onError={onImgError}
          />
        </a>
        <div className="position-absolute bottom-0 start-0">
          <GubunBadge g={g} />
        </div>
      </div>
      {!small && <CodeBadges g={g} />}
    </>
  );
  return (
    <div className={small ? "col-2" : "col-3"}>
      <div className="card mb-0 rounded-1 card-shadow bg-dark text-white border-0">
        <div className="card-header mb-0 p-2 border-0 rounded-0 bg-secondary">
          <a href={viewUrl} title={g.product_name}>
            <h5 className="card-title fw-400 font-14 text-white mb-0 py-1 align-content-center text-truncate">
              {g.product_name}
            </h5>
          </a>
        </div>
        {small ? Inner : <div className="card-body p-0 bg-grey rounded-0">{Inner}</div>}
        <DiscountPriceFooter g={g} />
      </div>
    </div>
  );
};

const TitleCard = ({ g, strikeValue }: { g: SeasonViewGoods; strikeValue?: number }) => (
  <div className="col-3">
    <div className="card mb-0 rounded-1 card-shadow bg-dark border-0 h-100">
      <div className="card-header mb-0 p-2 border-0 rounded-0 bg-secondary">
        <a href={gameViewUrl(g)} title={g.product_name}>
          <h5 className="card-title fw-400 font-14 text-white mb-0 py-1 align-content-center text-truncate">
            {g.product_name}
          </h5>
        </a>
      </div>
      <div className="card-body p-0 bg-grey">
        <div className="position-relative">
          <a href={gameViewUrl(g)} title={g.title_name}>
            <img
              src={`https://image.directg.net/upload/title/${g.title_id}/header/${g.title_id}.jpg`}
              className="img-fluid"
              alt={g.title_name}
              onError={onImgError}
            />
          </a>
          <div className="position-absolute bottom-0 start-0">
            <GubunBadge g={g} />
          </div>
        </div>
        <CodeBadges g={g} />
      </div>
      <DiscountPriceFooter g={g} strikeValue={strikeValue} />
    </div>
  </div>
);

const KoreanBadges = ({ g }: { g: SeasonViewGoods }) => (
  <div className="d-flex flex-row align-items-end col-6 flex-nowrap">
    {g.spoken_korean === "Y" && (
      <Badge variant="secondary" className="fw-500 me-1">
        음성 한국어
      </Badge>
    )}
    {g.interface_korean === "Y" && (
      <Badge variant="secondary" className="fw-500 me-1">
        인터페이스/자막 한글
      </Badge>
    )}
    {g.exclusive_korean === "Y" && (
      <Badge variant="secondary" className="fw-500 me-1 mb-1">
        독점 한국어
      </Badge>
    )}
  </div>
);

const PriceCard = ({ g, truncateTitle }: { g: SeasonViewGoods; truncateTitle?: boolean }) => {
  const { price, discount, priceVariant } = derive(g);
  const url = gameViewUrl(g);
  return (
    <div className="col">
      <div className="card rounded-1 bg-dark card-shadow border-0 mb-0 p-0">
        <div className="row g-0">
          <div className="col-md-4 rounded-0 position-relative">
            <a href={url} title={g.product_name}>
              <img
                src={`${g.option_domain}/upload/product/${g.product_code}/header/header.jpg`}
                className="img-fluid rounded-start"
                alt={g.product_name}
                onError={onImgError}
              />
            </a>
            <div className="position-absolute top-0 start-0">
              <GubunBadge g={g} />
            </div>
          </div>
          <div className="col-md-8">
            <div className="card-body h-100 d-flex flex-column justify-content-between p-2">
              <div className="d-flex flex-row mb-0 justify-content-between">
                <h5
                  className={`text-white card-title${truncateTitle ? " d-inline-block text-truncate" : ""}`}
                  style={{ letterSpacing: "-1px" }}
                >
                  <a href={url} className="text-white text-decoration-none" title={g.product_name}>
                    {g.product_name}
                  </a>
                </h5>
                <div className="d-flex justify-content-end align-items-start flex-wrap align-content-start flex-shrink-0">
                  <Badge variant="success" outline className="ms-1 mb-1">
                    코드발송
                  </Badge>
                  {g.is_preorder === "Y" && (
                    <Badge variant="warning" outline className="ms-2">
                      예약구매
                    </Badge>
                  )}
                  {g.is_bonus === "Y" && (
                    <Badge variant="info" outline className="ms-2">
                      특전
                    </Badge>
                  )}
                </div>
              </div>
              <div className="d-flex flex-row">
                <KoreanBadges g={g} />
                <div className="d-flex flex-row justify-content-end col-6 align-items-end">
                  {discount > 0 && (
                    <span
                      className={`rounded-2 bg-${priceVariant} font-14 text-white fw-bold px-2 py-1 num text-nowrap`}
                    >
                      -{won(discount)}%
                    </span>
                  )}
                  <div className="text-end mb-0 text-nowrap ms-2">
                    {discount > 0 && (
                      <s className="num pe-1 font-11 text-secondary won">
                        {` ${won(g.consumer_price)}`}
                      </s>
                    )}
                    <span className="num font-14 fw-bold text-white won"> {won(price)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
