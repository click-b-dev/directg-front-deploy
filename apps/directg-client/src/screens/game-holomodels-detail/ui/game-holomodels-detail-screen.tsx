import { Fragment } from "react";

import type { GameDetailResponse } from "@entities/game-detail";
import {
  MediaGallery,
  CartWishlistModals,
  GameEditionCard,
  DlcSection,
  DlcBundleSection,
  RecommandCard,
} from "@widgets/product-detail";

/** 플랫폼 탭 아이콘(legacy holomodels_view file_name: 51→holomodels). */
const TAB_ICON: Record<string, string> = {
  "1": "steam",
  "34": "epic_w",
  "35": "rockstar_2",
  "51": "holomodels",
};

/** legacy date("Y년 m월 d일"). */
function formatReleaseDate(release: string): string {
  const m = release.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  return `${m[1]}년 ${m[2]}월 ${m[3]}일`;
}

/** legacy nl2br. */
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

/** 홀로모델 상세 (legacy `pc/game/holomodels_view.html`). game_view 동형 + 홀로모델 특화. */
export function GameHolomodelsDetailScreen({
  data,
  productId,
  sku,
}: {
  data: GameDetailResponse;
  productId: string;
  sku: string;
}) {
  const {
    goods_status,
    goods_status_msg,
    is_login,
    platform,
    title_info,
    goods_description,
    media_list,
    title_platform,
    goods_item,
    is_event_info,
    event_data,
    recommand_title,
    flags,
    description_html,
    legal_html,
  } = data;

  const platformItem = goods_item[platform] ?? {};

  return (
    <>
      <style>{`
.screenshot-thumbnail{width:112px;height:63px;margin-right:4px;}
#media_list{overflow-x:scroll;}
#description_html div{font-size:14px;}
#description_html img{max-width:100%;height:auto;}
#description_html video{max-width:100%;height:auto;}
#description_html div hr{margin-top:30px;margin-bottom:30px;}
#description_html h1{color:#ffffff;font-size:18px;margin-top:10px;margin-bottom:10px;}
.card-badge{min-height:42px;}
.platform_title li{width:153px;height:74px;}
.platform_title li img{width:70px;}
.opacity-30{opacity:30%;}
.container{width:1320px;max-width:none!important;}
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
                <div className="col-11">
                  <div className="h3 text-white fw-bold mb-0">{title_info.title_name}</div>
                  <small className="eng text-secondary font-16">({title_info.title_name_en})</small>
                </div>
                <div className="col-1"></div>
              </div>

              <div
                className="d-grid justify-content-between"
                style={{ gridTemplateColumns: "812px 460px" }}
              >
                {/* content-left */}
                <div className="content-left">
                  {media_list.length > 0 && <MediaGallery mediaList={media_list} />}

                  {flags.only_multiplayer === "Y" && (
                    <div className="row row-cols-1 g-0">
                      <div className="col-12">
                        <div
                          className="alert alert-light text-warning border-0 fw-400 font-14 px-3 rounded-1"
                          role="alert"
                        >
                          <p className="mb-1">
                            <i className="fa-solid fa-triangle-exclamation"></i> 온라인/멀티플레이
                            전용 게임입니다. 싱글플레이는 지원하지 않습니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {flags.is_early_access === "Y" && (
                    <div className="row row-cols-1 g-0">
                      <div className="col-12">
                        <div
                          className="alert alert-light text-warning border-0 fw-400 font-14 px-3 rounded-1"
                          role="alert"
                        >
                          <p className="mb-1">
                            <i className="fa-solid fa-triangle-exclamation"></i> 정식 출시 전 앞서
                            해보기를 진행하는 상품입니다. 게임 내 기술적인 요소와 컨텐츠, 언어 등은
                            지속적인 업데이트를 통해 개선될 예정입니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {title_info.drm_notice && (
                    <div className="row row-cols-1 g-0">
                      <div className="col-12">
                        <div
                          className="alert alert-light text-warning border-0 fw-400 font-14 px-3 rounded-1"
                          role="alert"
                        >
                          <p className="mb-1">
                            <i className="fa-solid fa-triangle-exclamation"></i> 제 3자 DRM을
                            사용합니다. ({title_info.drm_notice.replace(/<[^>]*>/g, "")})
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {title_info.ext_user_account_notice && (
                    <div className="row row-cols-1 g-0">
                      <div className="col-12">
                        <div
                          className="alert alert-light text-warning border-0 fw-400 font-14 px-3 rounded-1"
                          role="alert"
                        >
                          <p className="mb-1">
                            <i className="fa-solid fa-triangle-exclamation"></i>{" "}
                            {title_info.ext_user_account_notice.replace(/<[^>]*>/g, "")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {flags.is_free === "Y" && (
                    <div className="row row-cols-1 g-0">
                      <div className="col-12">
                        <div className="alert bg-info text-white border-0 fw-500" role="alert">
                          <i className="dripicons-information me-1"></i> 기본 게임인{" "}
                          {title_info.title_name}은(는) 스팀(Steam)을 통해 무료 다운로드 및 플레이가
                          가능합니다.
                        </div>
                      </div>
                    </div>
                  )}
                  {goods_description.region_msg && (
                    <div className="row row-cols-1 g-0">
                      <div className="col-12">
                        <div
                          className="alert danger bg-danger text-white border-0 fw-500 rounded-0"
                          role="alert"
                        >
                          <i className="dripicons-wrong me-2"></i> {goods_description.region_msg}
                        </div>
                      </div>
                    </div>
                  )}

                  {title_platform.length > 0 && (
                    <div className="platform_title mb-3">
                      <h4 className="subtitle font-18 fw-bold mb-3">플랫폼</h4>
                      <span className="eng fw-bold"></span>
                      <ul className="nav nav-pills">
                        {title_platform.map((p) => {
                          const active =
                            p.product_platform === platform
                              ? "active border-primary border-4"
                              : "border-2 border-secondary";
                          const menuOpacity = p.product_platform === platform ? "" : "opacity-30";
                          const fileName = TAB_ICON[p.product_platform] ?? "";
                          return (
                            <li className="nav-item p-0 me-2" key={p.product_platform}>
                              <a
                                href={`/game/holomodels_view?product_id=${productId}&sku=${sku}&platform=${p.product_platform}`}
                              >
                                <div
                                  className={`w-100 h-100 d-flex justify-content-center align-items-center border ${active}`}
                                >
                                  <img
                                    className={`rounded-0 ${menuOpacity}`}
                                    src={`/assets/images/platform/${fileName}.svg`}
                                  />
                                </div>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(platformItem.game) && (
                    <section className="mb-3">
                      <h4 className="option_title font-18 fw-bold mb-3">홀로 모델 본체</h4>
                      {platformItem.game.map((item) => (
                        <GameEditionCard
                          key={item.goods_sku}
                          item={item}
                          isLogin={is_login}
                          variant="game"
                        />
                      ))}
                    </section>
                  )}
                  {Array.isArray(platformItem.edition) && (
                    <section className="mb-3">
                      <h4 className="option_title font-18 fw-bold mb-3">에디션</h4>
                      {platformItem.edition.map((item) => (
                        <GameEditionCard
                          key={item.goods_sku}
                          item={item}
                          isLogin={is_login}
                          variant="edition"
                        />
                      ))}
                    </section>
                  )}
                  {Array.isArray(platformItem.dlc) && (
                    <DlcSection
                      list={platformItem.dlc}
                      isLogin={is_login}
                      title="확장 애니메이션"
                      dlcViewPath="/game/holomodelsdlc_view"
                    />
                  )}
                  {Array.isArray(platformItem.dlc_bundle) && (
                    <DlcBundleSection
                      list={platformItem.dlc_bundle}
                      productId={productId}
                      isLogin={is_login}
                      bundleViewPath="/game/holomodels_view"
                    />
                  )}

                  {is_event_info === "Y" && event_data && (
                    <div className="card mb-4 rounded-0 border-0">
                      <div className="card-header text-white font-16 fw-bold bg-card py-3 border-0">
                        진행중인 이벤트
                      </div>
                      <div className="row g-0">
                        <div className="col-md-12">
                          <a href={event_data.event_link_url} target={event_data.event_link_target}>
                            <img
                              src={event_data.event_banner}
                              className="img-fluid rounded-0"
                              alt={event_data.subject}
                            />
                          </a>
                        </div>
                        <div className="col-md-12">
                          <div className="card-body">
                            <h5 className="card-title mb-2 fw-bold" style={{ color: "#0dcaf0" }}>
                              ■ {event_data.subject}
                            </h5>
                            <div className="event_contents">
                              <div dangerouslySetInnerHTML={{ __html: event_data.contents_html }} />
                              <hr />
                              <div
                                dangerouslySetInnerHTML={{ __html: event_data.event_notes_html }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 상세설명 — legacy holomodels는 전체보기 토글 없음 */}
                  <section id="game_info" className="mb-4">
                    <div className="card shadow-none rounded-0 border-0">
                      <div className="card-header text-white font-16 fw-bold bg-card py-3 border-0">
                        상세설명
                      </div>
                      <div
                        className="card-body p-3 content-wrapper"
                        id="description_html"
                        dangerouslySetInnerHTML={{ __html: description_html }}
                      />
                    </div>
                  </section>

                  <section id="legal_notice" className="mb-4">
                    <div className="card shadow-none rounded-0 border-0">
                      <div className="card-header text-white font-16 fw-bold bg-card py-3 border-0">
                        권리표기
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

                {/* content-right */}
                <div className="content-right">
                  <section id="title_info" className="mb-4">
                    <div className="card shadow-none mb-3 rounded-0 border-0">
                      <img
                        src={`${title_info.domain}/upload/title/${title_info.title_id}/header/${title_info.title_id}.jpg`}
                        className="card-img-top rounded-0"
                        alt={title_info.title_name}
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
                            {title_info.coming_soon === "Y" ? (
                              <span className="num font-14">{title_info.coming_soon_date}</span>
                            ) : (
                              <span className="num font-14">
                                {formatReleaseDate(title_info.release_date)}
                              </span>
                            )}
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

                  <section id="recommand_title" className="mb-4">
                    <div className="section_title text-white fw-bold fs-4 mb-2">추천상품</div>
                    <div className="section_title text-secondary font-12 mb-3">
                      장르, 개발사, 태그 등의 게임정보가 유사한 상품들입니다.
                    </div>
                    <div className="row row-col-2 row-cols-md-2 g-3">
                      {recommand_title.map((value) => (
                        <RecommandCard
                          key={value.sku}
                          value={value}
                          viewPath="/game/holomodels_view"
                        />
                      ))}
                    </div>
                  </section>

                  <section id="goods_legal_info" className="mb-4">
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

      <CartWishlistModals />
    </>
  );
}
