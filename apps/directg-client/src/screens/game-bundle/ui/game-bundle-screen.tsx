import type { BundleDetailResponse } from "@entities/bundle-detail";
import {
  ToggleSection,
  WishlistButton,
  CartButton,
  CartWishlistModals,
  PlatformLogo,
} from "@widgets/product-detail";

const formatWon = (value: number) => value.toLocaleString("ko-KR");

/** legacy date("Y년 m월 d일", strtotime(release_date)). */
function formatReleaseDate(release: string): string {
  const m = release.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  return `${m[1]}년 ${m[2]}월 ${m[3]}일`;
}

/** 연령등급 이미지(legacy max_rating 분기: 10→age_all, 18→age_19, else age_{n}). */
function ratingImage(maxRating: string): string | null {
  if (maxRating === "10") return "/assets/images/game/age_all.png";
  if (maxRating === "18") return "/assets/images/game/age_19.png";
  if (maxRating !== "") return `/assets/images/game/age_${maxRating}.png`;
  return null;
}

/** 번들 상세 (legacy `pc/game/bundle_view.html`). 공개 SSR + 인터랙션(게이트 없음). */
export function GameBundleScreen({ data }: { data: BundleDetailResponse }) {
  const {
    goods_status,
    goods_status_msg,
    goods_item,
    region_msg,
    show_description,
    description_html,
    show_bundle_items,
    package_items,
    max_rating,
  } = data;

  const promo = goods_item.promotion;
  const hasDiscount = goods_item.discount > 0 || promo.discount_rate > 0;
  const ageImg = ratingImage(max_rating);

  return (
    <>
      <style>{`
#description_html img{max-width:100%;height:auto;}
`}</style>

      <main>
        <div className="container my-3 pb-5">
          {goods_status === "N" ? (
            <div className="row mt-3">
              <div
                className="alert alert-danger alert-dismissible bg-danger text-white border-0 fade show"
                role="alert"
              >
                <strong>Error - </strong> {goods_status_msg}
              </div>
            </div>
          ) : (
            <>
              <div className="row g-0 mb-3">
                <div className="col-12">
                  <div className="h3 text-white fw-bold mb-0">{goods_item.product_name}</div>
                  <small className="eng text-secondary font-16">
                    ({goods_item.product_name_en})
                  </small>
                </div>
              </div>

              <div
                className="d-grid justify-content-between"
                style={{ gridTemplateColumns: "812px 460px" }}
              >
                {/* content-left */}
                <div className="content-left">
                  {region_msg && (
                    <div className="row">
                      <div className="col-12">
                        <div
                          className="alert danger bg-danger text-white border-0 font-12 rounded-0"
                          role="alert"
                        >
                          {region_msg}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="card mb-4 rounded-0 bg-card">
                    <div className="card-header p-1">
                      <div className="d-flex flex-row justify-content-between align-items-center">
                        <div className="d-flex flex-row align-items-center">
                          <h5 className="font-16 ms-3">{goods_item.product_name}</h5>
                        </div>
                        <PlatformLogo platform={goods_item.product_platform} widthClass="w-75 " />
                      </div>
                    </div>
                    {promo.sale_price > 0 && (
                      <div className="card-body p-3 border-0 border-bottom">
                        <div className="d-flex flex-row g-0 justify-content-between">
                          <div className="ps-2">
                            <span className="text-primary font-14">
                              프로모션 종료일: {promo.promotion_end}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="card-footer p-0 border-0 px-2">
                      <div className="d-flex flex-row align-items-center justify-content-between">
                        <div className="flex-fill flew-row align-items-center">
                          <div className="d-flex mb-1">
                            {/* legacy 프로모션 badge는 $value 오타(undefined)로 미노출 — 재현 */}
                            {goods_item.is_preorder === "Y" && (
                              <div className="me-1">
                                <span className="badge text-warning border border-warning py-1 px-1 font-12">
                                  예약구매
                                </span>
                              </div>
                            )}
                            {goods_item.is_bonus === "Y" && (
                              <div className="me-1">
                                <span className="badge text-info border border-info py-1 px-3 font-12">
                                  특전
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="px-2">
                          <div className="d-flex flew-row align-items-center">
                            {promo.discount_rate > 0 ? (
                              <span className="badge bg-danger font-14 px-3 py-2 num me-3 minus">
                                {promo.discount_rate} %
                              </span>
                            ) : (
                              goods_item.discount > 0 && (
                                <span className="badge bg-primary font-14 px-3 py-2 num me-3 minus">
                                  {goods_item.discount} %
                                </span>
                              )
                            )}
                            <div className="d-flex flex-column align-items-end">
                              {hasDiscount && (
                                <s className="font-11 num text-secondary won">
                                  {" "}
                                  {formatWon(goods_item.consumer_price)}
                                </s>
                              )}
                              <strong className="font-14 num fw-bold text-white won">
                                {" "}
                                {formatWon(
                                  promo.sale_price > 0 ? promo.sale_price : goods_item.price,
                                )}
                              </strong>
                            </div>
                          </div>
                        </div>
                        <div className="px-1 py-2">
                          <div className="d-grid gap-1 d-flex justify-content-end">
                            <WishlistButton
                              goodsSku={goods_item.goods_sku}
                              wishlistChk={goods_item.wishlist_chk}
                              className="btn btn-sm shadow-none font-14 fw-bold btn_wishlist"
                            />
                            <CartButton
                              goodsSku={goods_item.goods_sku}
                              soldout={goods_item.soldout}
                              className="btn btn-sm shadow-none font-14 fw-bold btn_cart text-nowrap"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {show_description === "Y" && (
                    <ToggleSection
                      sectionId="game_info"
                      contentId="description_html"
                      title="상세설명"
                      html={description_html}
                      maxHeight={800}
                    />
                  )}

                  {show_bundle_items === "Y" && package_items.length > 0 && (
                    <section id="bundle_item" className="mb-4">
                      <div className="card shadow-none rounded-0">
                        <div className="card-header text-white font-16 fw-bold bg-card py-3">
                          번들 상세정보
                        </div>
                        <ul className="list-group list-group-flush">
                          {package_items.map((pkg, i) => (
                            <li className="list-group-item py-3" key={i}>
                              <div className="row">
                                <div className="col-3">
                                  <img src={pkg.header_image} className="img-fluid border-0" />
                                  <p className="text-center pt-2 mb-0">
                                    {pkg.release_date ? `출시일: ${pkg.release_date}` : ""}
                                  </p>
                                </div>
                                <div className="col-9">
                                  <h4 className="font-14">{pkg.item_name}</h4>
                                  <div
                                    className="bundle_description"
                                    dangerouslySetInnerHTML={{ __html: pkg.short_description }}
                                  />
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </section>
                  )}
                </div>

                {/* content-right */}
                <div className="content-right">
                  <section id="title_info" className="mb-4">
                    <div className="card shadow-none mb-0 rounded-0 border-0">
                      <img
                        src={`${goods_item.domain}/upload/product/${goods_item.product_code}/header/header.jpg`}
                        className="card-img-top rounded-0"
                        alt={goods_item.product_name}
                      />
                    </div>

                    <div className="card shadow-none mb-3 rounded-0 border-0 bg-none">
                      <div className="d-flex flex-row flex-wrap mb-2">
                        {ageImg && <img src={ageImg} />}
                        {/* legacy game_rate는 $title_info 미정의로 미노출 — 재현 */}
                      </div>
                    </div>

                    <div className="card shadow-none mb-3 rounded-0 border-0 bg-table-dark text-white">
                      <div className="card-body px-3">
                        <dl className="row g-2 mb-0">
                          <dt className="col-sm-3 font-14">출시일</dt>
                          <dd className="col-sm-9">
                            {goods_item.coming_soon === "Y" ? (
                              <span className="num font-14">{goods_item.coming_soon_date}</span>
                            ) : (
                              <span className="num font-14">
                                {formatReleaseDate(goods_item.release_date)}
                              </span>
                            )}
                          </dd>

                          <dt className="col-sm-3 font-14">개발사</dt>
                          <dd className="col-sm-9">
                            <span className="eng font-14">{goods_item.developer}</span>
                          </dd>
                          <dt className="col-sm-3 font-14">퍼블리셔</dt>
                          <dd className="col-sm-9">
                            <span className="eng font-14">{goods_item.publisher}</span>
                          </dd>
                          {/* legacy 한국어지원 row는 $title_info 미정의로 미노출 — 재현 */}
                        </dl>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <CartWishlistModals cartTitle="장바구니 안내" />
    </>
  );
}
