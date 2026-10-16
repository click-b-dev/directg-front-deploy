import type { SyntheticEvent } from "react";
import {
  usePromotionWeekendView,
  type PromotionWeekendViewSearch,
  type WeekendViewGoods,
} from "@entities/promotion";
import { Badge, type BadgeVariant } from "@shared/ui";
import "@shared/styles/storefront-preview.css";

const FALLBACK_IMG = "/assets/images/logo/H2_DG_BI_VERTICAL.svg";
const won = (n: number) => n.toLocaleString();

// 뷰 파생: 프로모션가(sale_price>0) 우선. promotion_label은 통일 Badge variant로 대체.
const derive = (g: WeekendViewGoods) => {
  const isPromo = g.promotion_sale_price > 0;
  return {
    isPromo,
    price: isPromo ? g.promotion_sale_price : g.option_price,
    discount: isPromo ? g.promotion_discount_rate : g.option_discount,
    priceVariant: (isPromo ? "danger" : "primary") as BadgeVariant,
  };
};

// legacy option_gubun: display_type(basic/edition) → game_type bundle이 덮어씀.
const optionGubun = (g: WeekendViewGoods): { variant: BadgeVariant; label: string } | null => {
  let badge: { variant: BadgeVariant; label: string } | null = null;
  if (g.display_type === "basic") badge = { variant: "info", label: "기본게임" };
  else if (g.display_type === "edition") badge = { variant: "primary", label: "에디션" };
  if (g.game_type === "bundle") badge = { variant: "success", label: "번들" };
  return badge;
};

// legacy view_url: game_type 분기(game=product_id, dlc/bundle=sku).
const bestViewUrl = (g: WeekendViewGoods) => {
  if (g.game_type === "dlc") return `/game/dlc_view.html?sku=${g.goods_sku}`;
  if (g.game_type === "bundle") return `/game/bundle_view.html?sku=${g.goods_sku}`;
  if (g.game_type === "game") return `/game/game_view.html?product_id=${g.title_sku}`;
  return "";
};

const onImgError = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.src = FALLBACK_IMG;
};

// legacy promotion/promotion_weekend_view.php — 주말특가 상세보기(카드 미리보기).
export const PromotionWeekendViewScreen = ({ idx }: PromotionWeekendViewSearch) => {
  const { data } = usePromotionWeekendView(idx);

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
                    주말특가 프로모션 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">주말특가 프로모션 상세보기</li>
              </ol>
            </div>
            <h4 className="page-title">{data.promotion_week_name}</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="container">
            {/* legacy: 배너 이미지 URL 하드코딩 */}
            <a href={data.promotion_week_banner_link} target="_blank" rel="noreferrer">
              <img
                src="https://image.directg.net/U84s2DngyK"
                className="w-100"
                alt="다이렉트 게임즈 주말 프로모션"
              />
            </a>
            <div className="b-example-divider" />
          </div>

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

          <section className="mb-3">
            <div className="container">
              <h3 className="fw-bold">프로모션 인기게임</h3>

              <div className="row row-col-1 row-cols-md-4 g-2 justify-content-center mb-3">
                {bestLarge.map((g, i) => (
                  <BestLargeCard key={`${g.product_code}-${i}`} g={g} ranking={i + 1} />
                ))}
              </div>

              <div className="row row-col-1 row-cols-md-6 g-2 justify-content-center">
                {bestSmall.map((g, i) => (
                  <BestSmallCard key={`${g.product_code}-${i}`} g={g} ranking={i + 5} />
                ))}
              </div>
            </div>
            <div className="b-example-divider" />
          </section>
        </div>
      </div>
    </>
  );
};

const RecommandCard = ({ g }: { g: WeekendViewGoods }) => {
  const { price, discount, priceVariant } = derive(g);
  return (
    <div className="col-3">
      <div className="card mb-0 rounded-1 card-shadow bg-card border-0">
        <div className="card-header bg-secondary text-white">{g.title_name}</div>
        <a href={`/game/game_view.html?product_id=${g.title_sku}`} title={g.title_name}>
          <img
            src={`${g.title_domain}/upload/title/${g.title_id}/hero/hero_capsule.jpg`}
            className="card-img-top rounded-1"
            alt={g.title_name}
            onError={onImgError}
          />
        </a>
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
                    {won(g.consumer_price)}
                  </small>
                </div>
              )}
              <div className="d-block">
                <span className="d-block p-0 m-0 num text-white font-16 fw-bold won">
                  {" "}
                  {won(price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PromoBadges = ({ g }: { g: WeekendViewGoods }) => {
  const { isPromo } = derive(g);
  return (
    <div className="p-2">
      <Badge variant="success" outline className="ms-1 mb-1">
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

const GubunBadge = ({ g }: { g: WeekendViewGoods }) => {
  const gubun = optionGubun(g);
  if (!gubun) return null;
  return <Badge variant={gubun.variant}>{gubun.label}</Badge>;
};

const BestLargeCard = ({ g, ranking }: { g: WeekendViewGoods; ranking: number }) => {
  const { price, discount, priceVariant } = derive(g);
  const viewUrl = bestViewUrl(g);
  return (
    <div className="col-3">
      <div className="card mb-0 rounded-1 card-shadow bg-dark text-white border-0">
        <div className="card-header mb-0 p-2 border-0 rounded-0 bg-secondary">
          <a href={viewUrl} title={g.product_name}>
            <h5 className="card-title fw-400 font-14 text-white mb-0 py-1 align-content-center text-truncate">
              {g.product_name}
            </h5>
          </a>
        </div>
        <div className="card-body p-0 bg-grey rounded-0">
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
                src={`${g.option_domain}/upload/product/${g.product_code}/header/header.jpg?t=20251027`}
                className="card-img-top rounded-0"
                alt={g.product_name}
                onError={onImgError}
              />
            </a>
            <div className="position-absolute bottom-0 start-0">
              <GubunBadge g={g} />
            </div>
          </div>
          <PromoBadges g={g} />
        </div>
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
                    {won(g.consumer_price)}
                  </small>
                </div>
              )}
              <div className="d-block">
                <span className="d-block p-0 m-0 num text-white font-14 fw-bold won">
                  {" "}
                  {won(price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BestSmallCard = ({ g, ranking }: { g: WeekendViewGoods; ranking: number }) => {
  const { price, discount, priceVariant } = derive(g);
  const viewUrl = bestViewUrl(g);
  return (
    <div className="col-2">
      <div className="card mb-0 rounded-1 card-shadow bg-card border-0">
        <div className="card-header mb-0 p-2 border-0 rounded-0 bg-secondary">
          <a href={viewUrl} title={g.product_name}>
            <h5 className="card-title fw-400 font-14 text-white mb-0 py-1 align-content-center text-truncate">
              {g.product_name}
            </h5>
          </a>
        </div>
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
              src={`${g.option_domain}/upload/product/${g.product_code}/header/header.jpg`}
              className="card-img-top rounded-0"
              alt={g.product_name}
              onError={onImgError}
            />
          </a>
          <div className="position-absolute bottom-0 start-0">
            <GubunBadge g={g} />
          </div>
        </div>
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
            {/* legacy 소형: discount 조건 없이 항상 취소선+price */}
            <div className="ms-auto text-end align-text-bottom">
              <div className="d-block fw-normal p-0 m-0">
                <small className="text-decoration-line-through text-white font-11 num won">
                  {" "}
                  {won(g.consumer_price)}
                </small>
              </div>
              <div className="d-block">
                <span className="d-block p-0 m-0 num text-white font-14 fw-bold won">
                  {" "}
                  {won(price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
