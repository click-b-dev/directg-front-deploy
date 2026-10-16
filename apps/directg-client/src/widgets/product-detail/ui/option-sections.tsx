import type { GameOption } from "@shared/types/product-detail";

import { CartButton, WishlistButton } from "./option-actions";
import { DlcCollapseButton } from "./dlc-collapse-button";

const formatWon = (value: number) => value.toLocaleString("ko-KR");

/** 플랫폼 로고(카드 헤더, legacy Platform_logo_{steam,epic,rockstar}.png). */
export function PlatformLogo({ platform, widthClass }: { platform: string; widthClass: string }) {
  const src =
    platform === "1"
      ? "/assets/images/platform/Platform_logo_steam.png"
      : platform === "34"
        ? "/assets/images/platform/Platform_logo_epic.png"
        : platform === "35"
          ? "/assets/images/platform/Platform_logo_rockstar.png"
          : platform === "51"
            ? "/assets/images/platform/Platform_logo_holomodels.svg"
            : null;
  if (!src) return null;
  return (
    <div className="text-center">
      <img src={src} className={widthClass} />
    </div>
  );
}

/** 배송타입 뱃지(코드/택배/코드+택배발송). */
export function DeliveryBadge({ deliveryType }: { deliveryType: string }) {
  if (deliveryType === "1")
    return (
      <div className="me-2">
        <span className="badge badge-outline-success py-1 px-2 font-11">코드발송</span>
      </div>
    );
  if (deliveryType === "2")
    return (
      <div className="me-2">
        <span className="badge badge-outline-post py-1 px-2 font-11">택배발송</span>
      </div>
    );
  if (deliveryType === "3")
    return (
      <div className="me-2">
        <span className="badge badge-outline-code-post py-1 px-2 font-11">코드+택배발송</span>
      </div>
    );
  return null;
}

/** 기본게임/에디션 카드 (legacy 동형, variant로 mb-3+itemscope vs mb-2 구분). */
export function GameEditionCard({
  item,
  isLogin,
  variant,
}: {
  item: GameOption;
  isLogin: string;
  variant: "game" | "edition";
}) {
  const cardClass =
    variant === "game"
      ? "card mb-3 rounded-0 bg-card border-0"
      : "card mb-2 rounded-0 bg-card border-0";

  return (
    <div
      className={cardClass}
      {...(variant === "game" ? { itemScope: true, itemType: "http://schema.org/Product" } : {})}
    >
      <div className="card-header p-1">
        <div className="d-flex flex-row justify-content-between align-items-center">
          <div className="d-flex flex-row align-items-center">
            <h5
              className="font-16 ms-3 text-white"
              {...(variant === "game" ? { itemProp: "name" } : {})}
            >
              {item.product_name}
            </h5>
          </div>
          <PlatformLogo platform={item.product_platform} widthClass="w-75 " />
        </div>
      </div>
      {item.is_promotion === "Y" && (
        <div className="card-body py-3 border-0 border-bottom">
          <div className="d-flex flex-row g-0 justify-content-between">
            <div className="ps-2">
              <span className="text-primary font-14">프로모션 종료일: {item.promotion_end}</span>
            </div>
            {variant === "edition" && <div className="pe-1"></div>}
          </div>
        </div>
      )}
      <div className="card-footer p-0 border-0 px-2">
        <div className="d-flex flex-row align-items-center justify-content-between">
          <div className="flex-fill flew-row align-items-center">
            <div className={variant === "game" ? "d-flex mb-1" : "d-flex"}>
              <DeliveryBadge deliveryType={item.delivery_type} />
              {item.is_bonus === "Y" && (
                <div className="me-2">
                  <span className="badge text-info border border-info py-1 px-2 font-11">특전</span>
                </div>
              )}
              {item.is_promotion === "Y" && (
                <div className="me-2">
                  <span className="badge text-danger border border-danger py-1 px-2 font-11">
                    프로모션
                  </span>
                </div>
              )}
              {item.is_preorder === "Y" && (
                <div className="me-2">
                  <span className="badge text-warning border border-warning py-1 px-2 font-11">
                    예약구매
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="px-2">
            <div className="d-flex flew-row align-items-center">
              {item.discount > 0 && (
                <span className={`badge ${item.promotion_label} font-12 px-3 py-2 num me-3 minus`}>
                  {item.discount} %
                </span>
              )}
              <div className="d-flex flex-column align-items-end">
                {item.discount > 0 && (
                  <s className="font-11 num text-secondary won">
                    {" "}
                    {formatWon(item.consumer_price)}
                  </s>
                )}
                <strong className="font-14 num fw-bold text-white won">
                  {" "}
                  {formatWon(item.price)}
                </strong>
              </div>
            </div>
          </div>
          <div className="px-1 py-2">
            <div className="d-grid gap-1 d-flex justify-content-end">
              <WishlistButton
                goodsSku={item.goods_sku}
                isLogin={isLogin}
                wishlistChk={item.wishlist_chk}
                className="btn btn-sm shadow-none font-14 fw-bold btn_wishlist"
              />
              <CartButton
                goodsSku={item.goods_sku}
                isLogin={isLogin}
                soldout={item.soldout}
                className="btn btn-sm shadow-none font-14 fw-bold btn_cart text-nowrap"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** DLC 카드(가로형). legacy: 4번째부터 collapse 래퍼. dlcViewPath로 dlc/holomodelsdlc 분기. */
function DlcCard({
  item,
  isLogin,
  dlcViewPath,
}: {
  item: GameOption;
  isLogin: string;
  dlcViewPath: string;
}) {
  return (
    <div className="card mb-0 border-bottom border-black rounded-0 bg-card border-0">
      <div className="card-footer py-1 px-2 border-0">
        <div className="d-flex flex-row align-items-center justify-content-between">
          <div className="flex-fill flew-row align-items-center">
            <div className="d-flex">
              <div className="flex-fill p-2 flex-grow-1">
                <a
                  href={`${dlcViewPath}?sku=${item.goods_sku}`}
                  className="text-decoration-none"
                  target="_blank"
                >
                  <span className="font-14 fw-500 py-0 mb-0 text-white">{item.product_name}</span>
                </a>
              </div>
            </div>
          </div>
          <div className="text-end align-content-center px-2">
            <div className="d-flex flew-row align-items-center">
              {item.discount > 0 && (
                <span className={`badge ${item.promotion_label} font-12 px-3 py-2 num me-3 minus`}>
                  {item.discount} %
                </span>
              )}
              <div className="d-flex flex-column align-items-end">
                {item.discount > 0 && (
                  <s className="font-11 num text-secondary won">
                    {" "}
                    {formatWon(item.consumer_price)}
                  </s>
                )}
                <strong className="font-14 num fw-bold text-white won">
                  {" "}
                  {formatWon(item.price)}
                </strong>
              </div>
            </div>
          </div>
          <div className="d-grid gap-1 d-flex justify-content-end">
            <WishlistButton
              goodsSku={item.goods_sku}
              isLogin={isLogin}
              wishlistChk={item.wishlist_chk}
              className="btn btn-sm text-danger shadow-none font-14 fw-bold  mt-1 btn_wishlist"
            />
            <CartButton
              goodsSku={item.goods_sku}
              isLogin={isLogin}
              soldout={item.soldout}
              className="btn btn-sm shadow-none font-14 fw-bold mt-1 btn_cart text-nowrap"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** DLC 섹션(처음 3개 표시 + 나머지 collapse). title/dlcViewPath로 game/holomodels 분기. */
export function DlcSection({
  list,
  isLogin,
  title = "DLC",
  dlcViewPath = "/game/dlc_view",
}: {
  list: GameOption[];
  isLogin: string;
  title?: string;
  dlcViewPath?: string;
}) {
  const hasCollapse = list.length > 3;
  return (
    <section className="mb-3">
      <h4 className="option_title font-18">{title}</h4>
      {list.map((item, index) =>
        index < 3 ? (
          <DlcCard key={item.goods_sku} item={item} isLogin={isLogin} dlcViewPath={dlcViewPath} />
        ) : (
          <div
            className="collapse multi-collapse"
            id={`multiCollapseDLC${index}`}
            key={item.goods_sku}
          >
            <DlcCard item={item} isLogin={isLogin} dlcViewPath={dlcViewPath} />
          </div>
        ),
      )}
      {hasCollapse && <DlcCollapseButton />}
    </section>
  );
}

/** DLC번들 섹션. */
export function DlcBundleSection({
  list,
  productId,
  isLogin,
  bundleViewPath = "/game/bundle_view",
}: {
  list: GameOption[];
  productId: string;
  isLogin: string;
  bundleViewPath?: string;
}) {
  return (
    <section className="mb-3">
      <h4 className="option_title font-18">DLC번들</h4>
      {list.map((item) => (
        <div className="card mb-2 border-0" key={item.goods_sku}>
          <div className="card-header p-0">
            <div className="d-flex flex-row justify-content-between align-items-center">
              <div className="d-flex flex-row align-items-center">
                {item.is_bonus === "Y" && (
                  <div className="ps-1">
                    <span className="badge text-info border border-info py-1 px-1 font-12">
                      특전
                    </span>
                  </div>
                )}
                <h5 className="font-15 py-1 ms-2">{item.product_name}</h5>
              </div>
              <PlatformLogo platform={item.product_platform} widthClass="w-50 " />
            </div>
          </div>
          {item.is_promotion === "Y" && (
            <div className="card-body py-3 border-0 border-bottom">
              <div className="d-flex flex-row g-0 justify-content-between">
                <div className="ps-2">
                  <span className="text-primary font-14">
                    프로모션 종료일: {item.promotion_end}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className="card-footer p-0 border-0 px-2">
            <div className="d-flex flex-row align-items-center justify-content-between">
              <div className="pe-1">
                <a
                  href={`${bundleViewPath}?product_id=${productId}&goods_sku=${item.goods_sku}`}
                  className="btn btn-sm btn-info shadow-none font-13"
                >
                  정보 보기
                </a>
              </div>
              <div className="flex-fill flew-row">
                <div className="d-flex">
                  <DeliveryBadge deliveryType={item.delivery_type} />
                  {item.is_promotion === "Y" && (
                    <div className="me-1">
                      <span className="badge text-danger border border-danger py-1 px-1 font-12">
                        프로모션
                      </span>
                    </div>
                  )}
                  {item.is_preorder === "Y" && (
                    <div className="me-1">
                      <span className="badge text-warning border border-warning py-1 px-1 font-12">
                        예약구매
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-2">
                <div className="d-flex flew-row align-items-center">
                  {(item.promotion_discount ?? 0) > 0 ? (
                    <span className="badge bg-danger font-12 px-3 py-2 num me-3 minus">
                      {item.promotion_discount} %
                    </span>
                  ) : (
                    item.discount > 0 && (
                      <span className="badge bg-primary font-12 px-3 py-2 num me-3 minus">
                        {item.discount} %
                      </span>
                    )
                  )}
                  <div className="d-flex flex-column align-items-end">
                    {item.discount > 0 && (
                      <s className="font-11 num text-muted won">
                        {" "}
                        {formatWon(item.consumer_price)}
                      </s>
                    )}
                    <strong className="font-14 num fw-bold won"> {formatWon(item.price)}</strong>
                  </div>
                </div>
              </div>
              <div className="px-1 py-2">
                {item.soldout === "N" ? (
                  <div className="d-grid gap-1 d-flex justify-content-end">
                    <WishlistButton
                      goodsSku={item.goods_sku}
                      isLogin={isLogin}
                      wishlistChk={item.wishlist_chk}
                      className="btn btn-sm shadow-none font-14 text-danger fw-bold btn_wishlist"
                    />
                    <CartButton
                      goodsSku={item.goods_sku}
                      isLogin={isLogin}
                      soldout="N"
                      className="btn btn-sm shadow-none font-14 fw-bold btn_cart text-nowrap"
                    />
                  </div>
                ) : (
                  <span className="badge bg-secondary fw-bold font-14 py-2 px-2">품절</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
