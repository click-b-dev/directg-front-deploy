import type { TimedealDetailResponse } from "@entities/timedeal-detail";
import { PlatformLogo } from "@widgets/product-detail";

import { TimedealCart } from "./timedeal-cart";

const formatWon = (value: number) => value.toLocaleString("ko-KR");

/** legacy date("Y년 m월 d일"). */
function formatReleaseDate(release: string): string {
  const m = release.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  return `${m[1]}년 ${m[2]}월 ${m[3]}일`;
}

/** 타임딜 상세 (legacy `pc/game/timedeal_view.html`). 공개 SSR + cart(게이트 없음, 위시리스트 없음). */
export function GameTimedealScreen({ data }: { data: TimedealDetailResponse }) {
  const {
    goods_status,
    goods_status_msg,
    timedeal_info,
    timedeal_schedule,
    steam_info,
    goods_description,
    description_html,
    requirements_html,
    legal_html,
    genre_names,
    category_names,
  } = data;

  const timedealPrice = timedeal_schedule.timedeal_price;
  const discount =
    timedealPrice > 0
      ? Math.round(
          ((timedeal_info.consumer_price - timedealPrice) * 100) / timedeal_info.consumer_price,
        )
      : 0;

  const ageImg =
    timedeal_info.age_limit === "10"
      ? "/assets/images/game/age_all.png"
      : timedeal_info.age_limit !== ""
        ? `/assets/images/game/age_${timedeal_info.age_limit}.png`
        : null;
  const gradeImgs = timedeal_info.game_rate
    .split("")
    .map((c, i) => (c === "1" ? `/assets/images/game/grade${i + 1}.png` : null))
    .filter((s): s is string => s !== null);

  return (
    <>
      <style>{`
#description_html img{max-width:100%;}
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
              <div className="row g-0">
                <div className="col-12">
                  <div className="h3 text-white mb-3">
                    {timedeal_info.product_name}{" "}
                    <small className="eng text-secondary">
                      ( {timedeal_info.product_name_en} )
                    </small>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-3" style={{ gridTemplateColumns: "auto 460px" }}>
                {/* content-left */}
                <div className="content-left mt-3">
                  <div className="row row-cols-1 g-2">
                    <div className="col-12">
                      <div className="card mb-3 rounded-0 bg-card">
                        <div className="card-header p-1">
                          <div className="d-flex flex-row justify-content-between align-items-center">
                            <div className="d-flex flex-row align-items-center">
                              <h5 className="font-16 ms-3">{timedeal_info.product_name}</h5>
                            </div>
                            <PlatformLogo
                              platform={timedeal_info.product_platform}
                              widthClass="w-75 "
                            />
                          </div>
                        </div>
                        <div className="card-footer p-0 border-0 px-2">
                          <div className="d-flex flex-row align-items-center justify-content-between">
                            <div className="px-2">
                              <div className="d-flex flew-row align-items-center">
                                {timedealPrice > 0 && (
                                  <span className="badge bg-primary font-12 px-3 py-2 num me-3">
                                    {discount} %
                                  </span>
                                )}
                                {timedealPrice > 0 && (
                                  <s className="font-11 num text-muted me-2">
                                    {" "}
                                    &#8361; {formatWon(timedeal_info.consumer_price)}
                                  </s>
                                )}
                                <strong className="font-14 num fw-bold ">
                                  {" "}
                                  &#8361; {formatWon(timedealPrice)}
                                </strong>
                              </div>
                            </div>
                            <TimedealCart
                              goodsSku={timedeal_info.goods_sku}
                              ageLimit={timedeal_info.age_limit}
                              soldout={timedeal_info.soldout}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row row-cols-1 g-2">
                    <div className="col-12">
                      <section id="game_info" className="mb-4">
                        <div className="card shadow-none rounded-0">
                          <div className="card-header text-white fw-500 font-16">상세설명</div>
                          <div className="card-body p-3">
                            <div
                              id="description_html"
                              className="p-2 font-14"
                              dangerouslySetInnerHTML={{ __html: description_html }}
                            />
                          </div>
                        </div>
                      </section>

                      <section id="system_info" className="mb-4">
                        <div className="card shadow-none rounded-0">
                          <div className="card-header text-white fw-500 font-16">
                            시스템 요구사항
                          </div>
                          <div className="card-body p-3">
                            <div
                              id="requirements_html"
                              className="p-2 font-14"
                              dangerouslySetInnerHTML={{ __html: requirements_html }}
                            />
                          </div>
                        </div>
                      </section>

                      <section id="legal_notice" className="mb-4">
                        <div className="card shadow-none rounded-0">
                          <div className="card-header text-white fw-500 font-16">Copyright</div>
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
                    <div className="card shadow-none mb-3 rounded-0">
                      <img
                        src={`/upload/product/${timedeal_info.product_code}/header/header.jpg`}
                        className="card-img-top"
                        alt={timedeal_info.product_name}
                      />
                      <div className="bg-body">
                        <p className="font-14 p-3 mb-0">{goods_description.short_description}</p>
                      </div>
                      <hr className="mt-0" />

                      <div className="d-flex flex-row mb-2">
                        {ageImg && <img src={ageImg} className="me-2" />}
                        {gradeImgs.map((src, i) => (
                          <img src={src} className="me-2" key={i} />
                        ))}
                      </div>

                      <hr className="my-0" />

                      <div className="card shadow-none mb-0 rounded-0 border-0">
                        <div className="card-body p-3">
                          <dl className="row g-2 mb-0">
                            <dt className="col-sm-3 font-14">출시일</dt>
                            <dd className="col-sm-9">
                              <span className="num font-14">
                                {formatReleaseDate(timedeal_info.release_date)}
                              </span>
                            </dd>
                            <dt className="col-sm-3 font-14">개발사</dt>
                            <dd className="col-sm-9">
                              <span className="eng font-14">{steam_info.developer}</span>
                            </dd>
                            <dt className="col-sm-3 font-14">퍼블리셔</dt>
                            <dd className="col-sm-9">
                              <span className="eng font-14">{steam_info.publisher}</span>
                            </dd>

                            {(timedeal_info.spoken_korean === "Y" ||
                              timedeal_info.interface_korean === "Y") && (
                              <>
                                <dt className="col-sm-3 font-14">한국어지원</dt>
                                <dd className="col-sm-9">
                                  <span className="badge bg-secondary font-12 fw-400 me-2">
                                    {timedeal_info.spoken_korean === "Y" ? "음성 한글" : ""}
                                  </span>
                                  <span className="badge bg-secondary font-12 fw-400">
                                    {timedeal_info.interface_korean === "Y"
                                      ? "인터페이스/자막 한글"
                                      : ""}
                                  </span>
                                </dd>
                              </>
                            )}
                            <dt className="col-sm-3 font-14">장르</dt>
                            <dd className="col-sm-9">
                              <div className="d-flex flex-row flex-wrap mb-2">
                                {genre_names.map((name, i) => (
                                  <div className="me-2" key={i}>
                                    <span className="badge bg-secondary font-12 fw-400 px-2">
                                      {name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </dd>
                            <dt className="col-sm-3 font-14">카테고리</dt>
                            <dd className="col-sm-9">
                              <div className="d-flex flex-row flex-wrap align-content-around">
                                {category_names.map((name, i) => (
                                  <div className="me-2 mb-3" key={i}>
                                    <span className="badge bg-secondary font-12 fw-400 px-2">
                                      {name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    {steam_info.drm_notice && (
                      <div className="alert alert-light mb-3" role="alert">
                        <strong>타사 DRM: </strong>
                        {steam_info.drm_notice}
                      </div>
                    )}
                    {steam_info.ext_user_account_notice && (
                      <div className="alert alert-light mb-3" role="alert">
                        <strong>타사 계정 필요:</strong> {steam_info.ext_user_account_notice}
                      </div>
                    )}
                  </section>

                  <section id="goods_legal_info">
                    <div className="card shadow-none rounded-0">
                      <div className="card-header text-white fw-500 font-16">
                        상품 정보 제공 고시
                        <br />
                        <small className="font-12 fw-300">
                          [전자상거래에 관한 상품정보 제공에 관한 고시] 항목에 의거 등록된
                          정보입니다.
                        </small>
                      </div>
                      <ul className="list-group py-1 font-14 bg-body">
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white pe-2 ">제작자 또는 공급자</span>{" "}
                          <span className="text-white text-opacity-50">
                            상품페이지에 개발사/퍼블리셔 정보 참조
                          </span>
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white pe-2 ">이용조건/이용기간</span>{" "}
                          <span className="text-white text-opacity-50">
                            제품 코드 수신, 등록 후 <a href="" target="_blank"></a>의 서비스
                            종료까지
                          </span>
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white pe-2 ">상품 제공 방식</span>{" "}
                          <span className="text-white text-opacity-50">
                            마이페이지를 통한 제품 코드 실시간 발송
                          </span>
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white pe-2 ">
                            최소 시스템 사양, 필수 소프트웨어
                          </span>{" "}
                          <span className="text-white text-opacity-50 ">
                            상품페이지에 시스템 요구사항 참조
                          </span>
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white pe-2 ">
                            청약철회 또는 계약의 해제 해지의 따른 효과
                          </span>{" "}
                          <span className="text-white text-opacity-50  ">
                            <a href="/service/refund_policy" target="_blank">
                              환불정책안내
                            </a>{" "}
                            참조
                          </span>
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white pe-2">소비자상담 관련 전화번호</span>{" "}
                          <span className="text-white text-opacity-50 ">
                            사이트 하단에 CALL CENTER 정보 참조
                          </span>
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
    </>
  );
}
