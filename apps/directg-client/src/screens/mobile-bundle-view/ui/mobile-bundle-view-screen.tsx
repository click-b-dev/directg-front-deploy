import type { BundleDetailResponse } from "@entities/bundle-detail";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

const formatWon = (value: number) => value.toLocaleString("ko-KR");

/** legacy `date("Y년 m월 d일")` — release_date(YYYY-MM-DD) zero-pad 유지. */
function formatReleaseDate(releaseDate: string): string {
  if (!releaseDate) return "";
  const [y, m, d] = releaseDate.slice(0, 10).split("-");
  return `${y}년 ${m}월 ${d}일`;
}

/** legacy display_type in game_bundle/dlc_bundle/etc_bundle 이면 번들 상세정보 섹션 노출. */
const BUNDLE_TYPES = new Set(["game_bundle", "dlc_bundle", "etc_bundle"]);

/**
 * 모바일 번들 상세 (legacy `mobile/game/bundle_view.html`). 서브페이지 셸 + 번들 카드 + 구성품.
 * PC보다 단순: 상세설명/권리표기/연령등급/언어지원 없음. 위시·장바구니 order 이월(마크업만).
 */
export function MobileBundleViewScreen({ data }: { data: BundleDetailResponse }) {
  const g = data.goods_item;

  if (data.goods_status === "N") {
    return (
      <>
        <MobileSubHeader pageTitle="상세정보" />
        <div id="appCapsuleSub" className="full-height mt-0">
          <div className="error-page">
            <div className="icon-box text-danger">
              <ion-icon name="alert-circle" role="img" aria-label="alert circle"></ion-icon>
            </div>
            <h1 className="title">ERROR</h1>
            <div className="text mb-5">{data.goods_status_msg}</div>
          </div>
        </div>
      </>
    );
  }

  const hasPromotion = g.promotion.sale_price > 0;
  const hasDiscountRate = g.promotion.discount_rate > 0;
  const showOldPrice = g.discount > 0 || hasDiscountRate;
  const showBundleItems = BUNDLE_TYPES.has(g.display_type);

  return (
    <>
      <MobileSubHeader pageTitle="상세정보" />
      <div id="appCapsuleSub" className="full-height mt-0">
        {/* 헤더 카드 */}
        <div className="card mb-2">
          <img
            src={`${g.domain}/upload/product/${g.product_code}/header/header.jpg`}
            className="card-img-top rounded-0"
            alt=""
          />
        </div>

        {/* region_msg */}
        {data.region_msg && (
          <div className="section full mb-2">
            <div className="wide-block px-2 mt-2">
              <div className="alert alert-danger rounded-0" role="alert">
                <p className="text-break text-wrap font-14 mb-0">{data.region_msg}</p>
              </div>
            </div>
          </div>
        )}

        {/* 번들 상품 카드 */}
        <div className="section full mb-2">
          <div className="wide-block p-0">
            <ul className="listview simple-listview">
              <li className="p-0">
                <div className="item w-100">
                  <div className="card p-0 mb-0">
                    <h5 className="card-title fs-5 p-2 mb-0">{g.product_name}</h5>
                    <div className="card-body p-0">
                      <div className="d-flex justify-content-between align-items-center p-1">
                        <div className="p-0 text-center">
                          {hasDiscountRate ? (
                            <span className="fs-5 badge bg-danger rounded-2 px-3 py-3 fw-bold minus">
                              {g.promotion.discount_rate} %
                            </span>
                          ) : (
                            g.discount > 0 && (
                              <span className="fs-5 badge bg-primary rounded-2 px-3 py-3 fw-bold">
                                {g.discount} %
                              </span>
                            )
                          )}
                        </div>
                        <div className="price text-end">
                          {showOldPrice && (
                            <s className="old-price font-12 text-secondary pe-1 won">
                              {" "}
                              {formatWon(g.consumer_price)}
                            </s>
                          )}
                          <span className="fs-5 current-price text-white won">
                            {" "}
                            {formatWon(hasPromotion ? g.promotion.sale_price : g.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer px-3">
                      <div className="d-flex d-row justify-content-between">
                        <button
                          type="button"
                          className="btn btn-sm shadow-none font-14 rounded-0 bg-danger btn_wishlist"
                          data-sku={g.goods_sku}
                        >
                          <ion-icon name="heart-outline"></ion-icon> 위시리스트
                        </button>
                        {g.soldout === "N" ? (
                          <button
                            type="button"
                            className="btn btn-sm shadow-none font-14 rounded-0 bg-primary btn_cart"
                            data-sku={g.goods_sku}
                          >
                            <ion-icon name="cart-outline"></ion-icon> 장바구니
                          </button>
                        ) : (
                          <span className="badge bg-secondary font-16 rounded-1">품절</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* 번들 상세정보 */}
        {showBundleItems && (
          <div className="section full mb-2">
            <div className="section-title">번들 상세정보</div>
            <div className="wide-block p-0">
              <ul className="listview simple-listview">
                {data.package_items.map((pkg, i) => (
                  <li key={i}>
                    <div className="row">
                      <div className="col-4">
                        <img src={pkg.header_image} className="img-fluid border-0" alt="" />
                        <p className="font-12 text-center pt-2 mb-0">출시일: {pkg.release_date}</p>
                      </div>
                      <div className="col-8">
                        <h4 className="font-12">{pkg.item_name}</h4>
                        <div
                          className="font-12"
                          dangerouslySetInnerHTML={{ __html: pkg.short_description }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 상세정보 */}
        <div className="section full mb-2">
          <div className="section-title">상세정보</div>
          <div className="wide-block p-0">
            <ul className="list-unstyled mb-0">
              <li className="ps-2 py-2 border-bottom border-opacity-25">
                <div className="mb-0">
                  <span className="text-secondary font-14">출시일</span>
                  <p className="mb-0 font-14">{formatReleaseDate(g.release_date)}</p>
                </div>
              </li>
              <li className="ps-2 py-2 border-bottom border-opacity-25">
                <div className="mb-0">
                  <span className="text-secondary font-14">개발사</span>
                  <p className="mb-0 font-14">{g.developer}</p>
                </div>
              </li>
              <li className="ps-2 py-2 border-bottom border-opacity-25">
                <div className="mb-0 fs-5">
                  <span className="text-secondary font-14">퍼블리셔</span>
                  <p className="mb-0 font-14">{g.publisher}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* 상품 정보 제공 고시 */}
        <div className="section full mb-2">
          <div className="section-title">상품 정보 제공 고시</div>
          <div className="wide-block p-0">
            <ul className="list-unstyled mb-0">
              <li className="ps-2 py-2 border-bottom border-opacity-25">
                <div className="mb-0">
                  <span className="text-secondary font-14">제작자 또는 공급자</span>
                  <p className="mb-0 font-14">상세정보 개발사/퍼블리셔 참조</p>
                </div>
              </li>
              <li className="ps-2 py-2 border-bottom border-opacity-25">
                <div className="mb-0">
                  <span className="text-secondary font-14">이용조건/이용기간</span>
                  <p className="mb-0 font-14">
                    제품 코드 수신, 등록 후{" "}
                    <a href="https://store.steampowered.com/" target="_blank" rel="noreferrer">
                      {data.platform_name}
                    </a>
                    의 서비스 종료까지
                  </p>
                </div>
              </li>
              <li className="ps-2 py-2 border-bottom border-opacity-25">
                <div className="mb-0">
                  <span className="text-secondary font-14">상품 제공 방식</span>
                  <p className="mb-0 font-14">마이페이지를 통한 제품 코드 실시간 발송</p>
                </div>
              </li>
              <li className="ps-2 py-2 border-bottom border-opacity-25">
                <div className="mb-0">
                  <span className="text-secondary font-14">최소 시스템 사양, 필수 소프트웨어</span>
                  <p className="mb-0 font-14">
                    <a href="#system_info">시스템 요구사항</a> 참조
                  </p>
                </div>
              </li>
              <li className="ps-2 py-2 border-bottom border- 1 border-opacity-25">
                <div className="mb-0">
                  <span className="text-secondary font-14">
                    청약철회 또는 계약의 해제 해지의 따른 효과
                  </span>
                  <p className="mb-0 font-14">
                    <a href="/service/refund_policy" target="_blank" rel="noreferrer">
                      환불정책안내
                    </a>{" "}
                    참조{" "}
                  </p>
                </div>
              </li>
              <li className="ps-2 py-2 border-bottom border- 1 border-opacity-25">
                <div className="mb-0">
                  <span className="text-secondary font-14">소비자상담 관련 전화번호</span>
                  <p className="mb-0 font-14">1544-2367</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
