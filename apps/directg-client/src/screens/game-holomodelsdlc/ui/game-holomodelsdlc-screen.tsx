import { Fragment } from "react";

import type { DlcDetailResponse } from "@entities/dlc-detail";
import {
  MediaGallery,
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

/** legacy nl2br — 개행을 <br>로. */
function Nl2br({ text }: { text: string }) {
  const parts = text.split("\n");
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {p}
          {i < parts.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}

/** 홀로모델 DLC 상세 (legacy `pc/game/holomodelsdlc_view.html`). 공개 SSR + 인터랙션(게이트 없음). */
export function GameHolomodelsDlcScreen({ data }: { data: DlcDetailResponse }) {
  const {
    goods_status,
    goods_status_msg,
    is_preorder_notice,
    dlc_info,
    title_info,
    goods_description,
    description_html,
    legal_html,
    media_list,
    package_info,
  } = data;

  const promo = dlc_info.promotion;
  const hasDiscount = dlc_info.discount > 0 || promo.discount_rate > 0;

  return (
    <>
      <style>{`
#description_html p{font-size:14px;}
#description_html img{max-width:100%;height:auto;}
.screenshot-thumbnail{width:112px;height:63px;margin-right:4px;}
#game_info video{max-width:100%;height:auto;}
.holomodels-info{height:219px;}
.holomodels-info .card-header{padding-top:10px;padding-bottom:10px;}
.holomodels-info .card-header .holomodels-img img{width:94px;height:auto;}
.holomodels-info .card-header{height:114px;}
.holomodels-info .card-body img{width:160px;}
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
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <div className="h3 text-white fw-bold mb-0">{dlc_info.product_name}</div>
                  <small className="eng text-secondary font-16">({dlc_info.product_name_en})</small>
                </div>
              </div>

              <div
                className="d-grid justify-content-between"
                style={{ gridTemplateColumns: "812px 460px" }}
              >
                {/* content-left */}
                <div className="content-left mt-0">
                  {media_list[0]?.media_url && <MediaGallery mediaList={media_list} />}

                  <div className="row row-cols-1 g-2">
                    <div className="col-12">
                      <div className="alert alert-warning border-0 font-12 rounded-0" role="alert">
                        <i className="fa-solid fa-triangle-exclamation"></i> 확장 애니메이션(DLC)에
                        대한 안내 페이지입니다.
                      </div>
                      <div className="alert alert-warning border-0 font-12 rounded-0" role="alert">
                        <i className="fa-solid fa-triangle-exclamation"></i> 플레이하려면{" "}
                        <span className="">
                          {" "}
                          <a
                            href={`/game/holomodels_view?product_id=${title_info.product_id}`}
                            className="text-primary"
                          >
                            [{title_info.title_name}]
                          </a>{" "}
                          홀로 모델 본체가 필요합니다.
                        </span>
                      </div>
                      {is_preorder_notice === "Y" && (
                        <div
                          className="alert alert-warning border-0 font-12 rounded-0"
                          role="alert"
                        >
                          <i className="fa-solid fa-triangle-exclamation"></i> 제품 코드(키) 발송은
                          추후 공지사항을 통해 안내해드릴 예정입니다.
                        </div>
                      )}
                    </div>
                  </div>

                  {goods_description.region_msg && (
                    <div className="row">
                      <div className="col-12">
                        <div
                          className="alert danger bg-danger text-white border-0 font-12 rounded-0"
                          role="alert"
                        >
                          {goods_description.region_msg}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="row row-cols-1 g-2">
                    <div className="col-12">
                      <div className="card mb-3 rounded-0 bg-card border-0">
                        <div className="card-header p-1">
                          <div className="d-flex flex-row justify-content-between align-items-center">
                            <div className="d-flex flex-row align-items-center">
                              <h5 className="font-16 ms-3 text-white">{dlc_info.product_name}</h5>
                            </div>
                            <PlatformLogo platform={dlc_info.product_platform} widthClass="w-75 " />
                          </div>
                        </div>
                        {promo.sale_price > 0 && (
                          <div className="card-body py-3 border-0 border-bottom">
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
                                {dlc_info.is_bonus === "Y" && (
                                  <div className="me-2">
                                    <span className="badge text-info border border-info py-1 px-2 font-11">
                                      특전
                                    </span>
                                  </div>
                                )}
                                {promo.sale_price > 0 && (
                                  <div className="me-2">
                                    <span className="badge text-danger border border-danger py-1 px-2 font-11">
                                      프로모션
                                    </span>
                                  </div>
                                )}
                                {dlc_info.is_preorder === "Y" && (
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
                                {promo.discount_rate > 0 ? (
                                  <span className="badge bg-danger font-14 px-3 py-2 num me-3 minus">
                                    {promo.discount_rate} %
                                  </span>
                                ) : (
                                  dlc_info.discount > 0 && (
                                    <span className="badge bg-primary font-14 px-3 py-2 num me-3 minus">
                                      {dlc_info.discount} %
                                    </span>
                                  )
                                )}
                                <div className="d-flex flex-column align-items-end">
                                  {hasDiscount && (
                                    <s className="font-11 num text-secondary won">
                                      {" "}
                                      {formatWon(dlc_info.consumer_price)}
                                    </s>
                                  )}
                                  <strong className="font-14 num fw-bold text-white won">
                                    {" "}
                                    {formatWon(
                                      promo.sale_price > 0 ? promo.sale_price : dlc_info.price,
                                    )}
                                  </strong>
                                </div>
                              </div>
                            </div>
                            <div className="px-1 py-2">
                              <div className="d-grid gap-1 d-flex justify-content-end">
                                <WishlistButton
                                  goodsSku={dlc_info.goods_sku}
                                  wishlistChk={dlc_info.wishlist_chk}
                                  className="btn btn-sm shadow-none font-14 fw-bold btn_wishlist"
                                />
                                <CartButton
                                  goodsSku={dlc_info.goods_sku}
                                  soldout={dlc_info.soldout}
                                  className="btn btn-sm shadow-none font-14 fw-bold btn_cart text-nowrap"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {package_info.length > 0 && (
                    <section id="package_info" className="mb-4">
                      <h4 className="subtitle font-16 fw-bold mb-3">구성정보 상세</h4>
                      <ul className="list-group list-group-flush">
                        {package_info.map((sub, i) => (
                          <li className="list-group-item py-3" key={i}>
                            {sub.unit_name}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  <div className="row row-cols-1 g-2">
                    <div className="col-12">
                      {/* 상세설명 — legacy holomodelsdlc는 전체보기 토글 버튼 없음(hr만) */}
                      <section id="game_info" className="mb-4">
                        <div className="card shadow-none rounded-0 border-0">
                          <div className="card-header text-white fw-500 font-16 bg-card">
                            상세설명
                          </div>
                          <div
                            className="card-body p-3 content-wrapper font-14"
                            id="description_html"
                            dangerouslySetInnerHTML={{ __html: description_html }}
                          />
                        </div>
                        <div className="text-end mb-3">
                          <hr />
                        </div>
                      </section>

                      <section id="legal_notice" className="mb-4">
                        <div className="card shadow-none rounded-0 border-0">
                          <div className="card-header text-white fw-500 font-16 bg-card">
                            Copyright
                          </div>
                          <div className="card-body p-3">
                            <div
                              id="legal_text"
                              className="eng font-14"
                              dangerouslySetInnerHTML={{ __html: legal_html }}
                            />
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>

                {/* content-right */}
                <div className="content-right">
                  <section id="title_info" className="mb-4">
                    <div className="card shadow-none mb-3 rounded-0 border-0">
                      <img
                        src={`${dlc_info.domain}/upload/product/${dlc_info.product_code}/header/header.jpg`}
                        className="card-img-top"
                        alt={dlc_info.product_name}
                      />
                      <div className="">
                        <p className="font-14 p-3 mb-0">
                          <Nl2br text={goods_description.short_description} />
                        </p>
                      </div>
                      <div className="p-3">
                        <dl className="row g-2 mb-0">
                          <dt className="col-sm-3 font-14">출시일</dt>
                          <dd className="col-sm-9">
                            <span className="num font-14">
                              {formatReleaseDate(dlc_info.release_date)}
                            </span>
                          </dd>
                        </dl>
                      </div>
                    </div>

                    <div className="card shadow-none mb-3 rounded-0 border-0 bg-table-dark text-white holomodels-info">
                      <div className="card-header px-0 mb-0 rounded-0 border-0 d-flex bg-card">
                        <div className="holomodels-img">
                          <img src="https://image.directg.net/o87uC9Zd0J" />
                        </div>
                        <div className="d-flex flex-column justify-content-between">
                          <span className="font-16">XR(AR/VR) 디지털 피규어</span>
                          <img
                            src="https://image.directg.net/M87uCcbuA4"
                            className="w-75 img-fluid"
                          />
                        </div>
                      </div>
                      <div className="card-body p-3 d-flex flex-column justify-content-between">
                        <div>
                          <span className="font-16 fw-bold">홀로 모델 다운로드</span>
                        </div>
                        <div>
                          <a
                            href="https://play.google.com/store/apps/details?id=jp.gugenka.holomodels3&hl=ko&gl=KR&utm_source=apac_med"
                            target="_blank"
                            className="me-2"
                          >
                            <img src="https://image.directg.net/x87niyypzY" />
                          </a>
                          <a
                            href="https://apps.apple.com/kr/app/holomodels-%E3%83%9B%E3%83%AD%E3%83%A2%E3%83%87%E3%83%AB/id6744629360"
                            target="_blank"
                          >
                            <img src="https://image.directg.net/X87niyl2MK" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section id="goods_legal_info">
                    <div className="card shadow-none rounded-0 border-0 bg-light">
                      <div className="card-header text-white fw-500 font-16">
                        상품 정보 제공 고시
                        <br />
                        <small className="font-12 fw-300">
                          [전자상거래에 관한 상품정보 제공에 관한 고시] 항목에 의거 등록된
                          정보입니다.
                        </small>
                      </div>
                      <ul className="list-group py-2 font-12">
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white pe-2 ">이용조건/이용기간</span>
                          <span className="sub-title">
                            {" "}
                            제품 코드 수령, 등록 후의 서비스 종료까지
                          </span>
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white pe-2 ">상품 제공 방식</span>
                          <span className="sub-title"> 마이페이지를 통한 제품코드 실시간 발송</span>
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white pe-2 ">필수 소프트웨어</span>
                          <span className="sub-title">
                            {" "}
                            스마트폰・태블릿 iOS/Android App 또는 HoloModeLink
                          </span>
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white pe-2 ">
                            청약철회 또는 계약의 해제 해지의 따른 효과
                          </span>
                          <span className="sub-title">
                            {" "}
                            <a href="/service/refund_policy" target="_blank">
                              환불정책안내
                            </a>{" "}
                            참조
                          </span>
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white pe-2">소비자상담 관련 전화번호</span>
                          <span className="sub-title">사이트 하단에 고객센터 정보 참조</span>
                        </li>
                      </ul>
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
