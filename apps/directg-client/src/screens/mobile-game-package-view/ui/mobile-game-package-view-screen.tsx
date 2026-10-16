import type { GamePackageDetailResponse } from "@entities/game-package-detail";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

const formatWon = (value: number) => value.toLocaleString("ko-KR");

/** game_rate 문자열 → grade 이미지 인덱스(char "1" 위치 i → grade{i+1}.png). */
function gradeImages(gameRate: string): number[] {
  const grades: number[] = [];
  for (let i = 0; i < gameRate.length; i += 1) {
    if (gameRate[i] === "1") grades.push(i + 1);
  }
  return grades;
}

/**
 * 모바일 패키지 옵션 상세 (legacy `mobile/game/game_package_view.html`).
 * status=N → error-page. status=Y → 헤더/상품카드/구성정보/상세정보/상세설명.
 * 위시리스트/장바구니는 order 도메인 이월 — 마크업만(핸들러 없음). head padding-top:56px 유지.
 */
export function MobileGamePackageViewScreen({ data }: { data: GamePackageDetailResponse }) {
  const { goods_status, goods_status_msg, goods_item, title_info } = data;
  const hasKorean =
    title_info.spoken_korean === "Y" ||
    title_info.interface_korean === "Y" ||
    title_info.exclusive_korean === "Y";
  const discounted = goods_item.discount > 0 || goods_item.promotion.discount_rate > 0;

  return (
    <>
      <MobileSubHeader pageTitle={goods_item.product_name} />
      {goods_status === "N" ? (
        <div id="appCapsuleSub" className="full-height mt-0" style={{ paddingTop: 56 }}>
          <div className="error-page">
            <div className="icon-box text-danger">
              <ion-icon
                name="alert-circle"
                role="img"
                className="md hydrated"
                aria-label="alert circle"
              />
            </div>
            <h1 className="title">ERROR</h1>
            <div className="text mb-5">{goods_status_msg}</div>
          </div>
        </div>
      ) : (
        <div id="appCapsuleSub" className="full-height mt-0" style={{ paddingTop: 56 }}>
          <div className="card mb-2">
            <img
              src={`${goods_item.domain}/upload/product/${goods_item.product_code}/header/header.jpg`}
              className="card-img-top rounded-0"
              alt={goods_item.product_name}
            />
            <div className="p-2 text-white font-14">{data.short_description}</div>
          </div>

          {data.region_msg && (
            <div className="section full mb-2">
              <div className="wide-block px-2 mt-2">
                <div className="alert alert-danger rounded-0" role="alert">
                  <p className="text-break text-wrap font-14 mb-0">{data.region_msg}</p>
                </div>
              </div>
            </div>
          )}

          <div className="section full mb-2">
            <div className="wide-block p-0">
              <ul className="listview simple-listview">
                <li className="p-0">
                  <div className="item w-100">
                    <div className="card p-0 mb-0">
                      <h5 className="card-title fs-5 p-2 mb-0">{goods_item.product_name}</h5>
                      <div className="card-body p-0">
                        <div className="d-flex justify-content-between align-items-center p-1">
                          <div className=" p-0 text-center">
                            {goods_item.promotion.discount_rate > 0 ? (
                              <span className="fs-5 badge bg-danger rounded-2 px-3 py-3 fw-bold minus">
                                {goods_item.promotion.discount_rate} %
                              </span>
                            ) : (
                              goods_item.discount > 0 && (
                                <span className="fs-5 badge bg-primary rounded-2 px-3 py-3 fw-bold">
                                  {goods_item.discount} %
                                </span>
                              )
                            )}
                          </div>
                          <div className="price text-end">
                            {discounted && (
                              <s className="old-price font-12 text-secondary pe-1 won">
                                {" "}
                                {formatWon(goods_item.consumer_price)}
                              </s>
                            )}{" "}
                            {goods_item.promotion.sale_price > 0 ? (
                              <span className="fs-5 current-price text-white won">
                                {" "}
                                {formatWon(goods_item.promotion.sale_price)}
                              </span>
                            ) : (
                              <span className="fs-5 current-price text-white won">
                                {" "}
                                {formatWon(goods_item.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="card-footer px-3">
                        <div className="d-flex d-row justify-content-between">
                          <button
                            type="button"
                            className="btn btn-sm shadow-none font-14 rounded-0 bg-danger btn_wishlist"
                            data-sku={goods_item.goods_sku}
                          >
                            <ion-icon name="heart-outline" /> 위시리스트
                          </button>
                          {goods_item.soldout === "N" ? (
                            <button
                              type="button"
                              className="btn btn-sm shadow-none font-14 rounded-0 bg-primary btn_cart"
                              data-sku={goods_item.goods_sku}
                            >
                              <ion-icon name="cart-outline" /> 장바구니
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

          <div className="section full mb-2">
            <div className="wide-block px-2 mt-2">
              <div className="alert alert-light rounded-0" role="alert">
                <p className="text-warning text-break text-wrap font-14 mb-0">
                  <ion-icon name="alert-circle" /> 구성정보에 대한 안내 페이지입니다. 전체 게임의
                  정보는{" "}
                  <a
                    href={`/game/game_view?product_id=${title_info.product_id}`}
                    className="text-primary"
                  >
                    [{title_info.title_name}]
                  </a>
                  에서 확인해 주시기 바랍니다.
                </p>
                <p className="text-warning text-break text-wrap font-14 mb-0">
                  <ion-icon name="alert-circle" /> 다이렉트 게임즈에서 상품의 구성과 표기는 Steam,
                  Epic Games 등 각 플랫폼과 다소 차이가 있을 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {data.package_units.length > 0 && (
            <div className="section full mb-2">
              <div className="section-title">구성정보 상세</div>
              <div className="wide-block p-0">
                <ul className="listview simple-listview border-0">
                  {data.package_units.map((unit, i) => (
                    <li key={i} className="border-1 border-bottom border-opacity-25">
                      <h4 className="font-12">{unit}</h4>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="section full mb-2">
            <div className="section-title">상세정보</div>
            <div className="wide-block p-0">
              <ul className="list-unstyled mb-0">
                <li className="ps-2 py-2 border-bottom border-opacity-25">
                  <div className="mb-0">
                    <span className="text-secondary font-14">출시일</span>
                    <p className="mb-0 font-14">{goods_item.release_date.substring(0, 10)}</p>
                  </div>
                </li>
                <li className="ps-2 py-2 border-bottom border-opacity-25">
                  <div className="mb-0">
                    <span className="text-secondary font-14">개발사</span>
                    <p className="mb-0 font-14">{title_info.developer}</p>
                  </div>
                </li>
                <li className="px-3 py-2 border-bottom border-opacity-25">
                  <p className="mb-0">
                    <span className="text-secondary me-1 fw-500 font-14">언어지원</span>
                    {hasKorean ? (
                      <>
                        <span className="badge bg-secondary font-12 fw-400 rounded-2">
                          {title_info.spoken_korean === "Y" ? "음성 한글" : ""}
                        </span>
                        <span className="badge bg-secondary font-12 fw-400 rounded-2">
                          {title_info.interface_korean === "Y" ? "인터페이스/자막 한글" : ""}
                        </span>
                        <span className="badge bg-secondary font-12 fw-400 rounded-2">
                          {title_info.exclusive_korean === "Y" ? "독점/한글패치" : ""}
                        </span>
                      </>
                    ) : (
                      <span className="badge bg-secondary font-12 fw-400 rounded-2">
                        한국어지원안함
                      </span>
                    )}
                  </p>
                </li>
                <li className="px-3 py-2 border-bottom border-opacity-25">
                  <p className="mb-0">
                    <span className="text-secondary me-1 fw-500 font-14">퍼블리셔</span>
                    <span className="font-14">{title_info.publisher}</span>
                  </p>
                </li>
                <li className="px-3 py-2 border-bottom border-opacity-25">
                  <div className="d-flex flex-row flex-wrap">
                    {data.genre_tags.map((tag, i) => (
                      <span
                        key={`g${i}`}
                        className="badge bg-secondary font-12 fw-400 px-2 rounded-2 me-1 my-1"
                      >
                        {tag}
                      </span>
                    ))}
                    {data.category_tags.map((tag, i) => (
                      <span
                        key={`c${i}`}
                        className="badge bg-secondary font-12 fw-400 px-2 rounded-2 me-1 my-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </li>
                <li className="px-3 py-2 border-bottom border-opacity-25">
                  <div className="d-flex flex-row flex-wrap">
                    {title_info.age_limit === "10" ? (
                      <img
                        src="/mobile-assets/images/game/age_all.png"
                        className="me-1 my-1"
                        alt=""
                      />
                    ) : (
                      title_info.age_limit !== "" && (
                        <img
                          src={`/mobile-assets/images/game/age_${title_info.age_limit}.png`}
                          className="me-1 my-1"
                          alt=""
                        />
                      )
                    )}
                    {gradeImages(title_info.game_rate).map((n) => (
                      <img
                        key={n}
                        src={`/mobile-assets/images/game/grade${n}.png`}
                        className="me-1 my-1"
                        alt=""
                      />
                    ))}
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="section full">
            <div className="section-title">상세설명</div>
            <div className="wide-block p-0">
              <div
                className="goods_detail_info p-2 border-opacity-25 border-bottom"
                dangerouslySetInnerHTML={{ __html: data.description_html }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
