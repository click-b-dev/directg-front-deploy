import type { DlcDetailResponse } from "@entities/dlc-detail";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

const formatWon = (value: number) => value.toLocaleString("ko-KR");

/** legacy `date("Y년 m월 d일")` — release_date(YYYY-MM-DD) zero-pad 유지. */
function formatReleaseDate(releaseDate: string): string {
  const [y, m, d] = releaseDate.slice(0, 10).split("-");
  return `${y}년 ${m}월 ${d}일`;
}

/** legacy `strip_tags` 등가 (권리표기 텍스트화). */
const stripTags = (html: string) => html.replace(/<[^>]*>/g, "");

/**
 * 모바일 DLC 상세 (legacy `mobile/game/dlc_view.html`). 서브페이지 셸 + 단일 DLC 카드.
 * PC보다 단순: 미디어/steam_info/장르카테고리/toggle 없음. 위시·장바구니 order 도메인 이월(마크업만).
 */
export function MobileDlcViewScreen({ data }: { data: DlcDetailResponse }) {
  const d = data.dlc_info;
  const t = data.title_info;
  const pageTitle = d.product_name;

  if (data.goods_status === "N") {
    return (
      <>
        <MobileSubHeader pageTitle={pageTitle} />
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

  const hasKorean =
    d.spoken_korean === "Y" || d.interface_korean === "Y" || d.exclusive_korean === "Y";
  const hasPromotion = d.promotion.sale_price > 0;
  const ageImg = t.age_limit === "10" ? "age_all.png" : t.age_limit ? `age_${t.age_limit}.png` : "";
  const gradeImgs = t.game_rate
    .split("")
    .map((c, i) => (c === "1" ? `grade${i + 1}.png` : null))
    .filter((v): v is string => v !== null);
  const gameViewUrl = `/game/game_view?product_id=${t.product_id}`;

  return (
    <>
      <MobileSubHeader pageTitle={pageTitle} />
      <div id="appCapsuleSub" className="full-height mt-0">
        {/* 헤더 카드 */}
        <div className="card">
          <img
            src={`${d.domain}/upload/product/${d.product_code}/header/header.jpg`}
            className="card-img-top rounded-0"
            alt={d.product_name}
          />
          <div className="p-2 text-white font-14">{data.goods_description.short_description}</div>
        </div>
        <div className="divider"></div>

        {/* DLC 안내 alert */}
        <div className="section full">
          <div className="wide-block px-2 mt-2">
            <div className="alert alert-warning border-0 font-14 rounded-0" role="alert">
              <i className="fa-solid fa-triangle-exclamation"></i> 추가 콘텐츠(DLC) 대한 안내
              페이지입니다. 전체 게임의 정보는{" "}
              <a href={gameViewUrl} className="text-primary">
                [{t.title_name}]
              </a>
              에서 확인해 주시기 바랍니다.
            </div>
          </div>
        </div>

        {/* 기본게임 필요 alert */}
        <div className="section full mb-2">
          <div className="wide-block px-2 mt-2">
            <div className="alert alert-warning border-0 font-14 rounded-0" role="alert">
              <i className="bi bi-info-circle"></i> 플레이하려면 {data.platform_name} 버전인{" "}
              <a href={gameViewUrl} className="alert-link">
                {t.title_name}
              </a>{" "}
              기본 게임이 필요합니다.
            </div>
          </div>
        </div>

        {/* region_msg */}
        {data.goods_description.region_msg && (
          <div className="section full mb-2">
            <div className="wide-block px-2 mt-2">
              <div className="alert alert-danger rounded-0" role="alert">
                <p className="text-break text-wrap font-14 mb-0">
                  {data.goods_description.region_msg}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="divider"></div>

        {/* DLC 카드 */}
        <div className="card shadow-none p-1">
          <div className="card-body text-white p-1">
            <h2 className="mb-1 pb-0">{d.product_name} </h2>
            <div className="mb-1">
              <small className="font-12">[{d.product_name_en}]</small>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              {hasPromotion ? (
                <>
                  <div className="p-0 text-center">
                    <span className="font-14 badge bg-danger rounded-2 px-3 py-2 fw-bold minus">
                      {d.promotion.discount_rate} %
                    </span>
                  </div>
                  <div className="price text-end">
                    <s className="old-price font-12 text-secondary pe-1 won">
                      {" "}
                      {formatWon(d.consumer_price)}
                    </s>
                    <span className="font-14 current-price text-white won">
                      {" "}
                      {formatWon(d.promotion.sale_price)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-0 text-center">
                    {d.discount > 0 && (
                      <span className="font-14 badge bg-primary rounded-2 px-3 py-2 fw-bold minus">
                        {d.discount} %
                      </span>
                    )}
                  </div>
                  <div className="price text-end">
                    {d.discount > 0 && (
                      <s className="old-price font-12 text-secondary pe-1 won">
                        {" "}
                        {formatWon(d.consumer_price)}
                      </s>
                    )}
                    <span className="font-14 current-price text-white won">
                      {" "}
                      {formatWon(d.price)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="card-footer px-3">
            <div className="d-flex d-row justify-content-between">
              <button
                type="button"
                className="btn btn-sm shadow-none font-14 rounded-0 bg-danger btn_wishlist"
                data-sku={d.goods_sku}
                data-agelimit={t.age_limit}
              >
                <ion-icon name="heart-outline"></ion-icon> 위시리스트
              </button>
              {d.soldout === "N" ? (
                <button
                  type="button"
                  className="btn btn-sm shadow-none font-14 rounded-0 bg-primary btn_cart"
                  data-sku={d.goods_sku}
                  data-agelimit={t.age_limit}
                >
                  <ion-icon name="cart-outline"></ion-icon> 장바구니
                </button>
              ) : (
                <span className="badge bg-secondary font-16 rounded-1">품절</span>
              )}
            </div>
          </div>
        </div>

        {/* 연령/등급 */}
        <div className="section full">
          <div className="wide-block pt-1 pb-1">
            <div className="d-flex flex-row">
              {ageImg && (
                <img src={`/mobile-assets/images/game/${ageImg}`} className="me-1" alt="" />
              )}
              {gradeImgs.map((g) => (
                <img key={g} src={`/mobile-assets/images/game/${g}`} className="me-1" alt="" />
              ))}
            </div>
          </div>
        </div>

        {/* 상세정보 */}
        <div className="section full mb-2">
          <div className="section-title">상세정보</div>
          <div className="wide-block p-0">
            <ul className="list-unstyled mb-0">
              <li className="ps-2 py-2 border-bottom border-opacity-25">
                <div className="mb-0">
                  <span className="text-secondary me-1 font-14">출시일</span>
                  <span className="font-14">{formatReleaseDate(d.release_date)}</span>
                </div>
              </li>
              <li className="ps-2 py-2 border-bottom border-opacity-25">
                <div className="mb-0">
                  <span className="text-secondary me-1 font-14">개발사</span>
                  <span className="font-14">{t.developer}</span>
                </div>
              </li>
              <li className="ps-2 py-2 border-bottom border-opacity-25">
                <div className="mb-0">
                  <span className="text-secondary me-1 font-14">퍼블리셔</span>
                  <span className="font-14">{t.publisher}</span>
                </div>
              </li>
              {hasKorean ? (
                <li className="ps-2 py-2 border-bottom border-opacity-25">
                  <p className="mb-0">
                    <span className="text-secondary me-1 font-14">언어지원</span>
                    <span className="badge bg-secondary font-12 fw-400">
                      {d.spoken_korean === "Y" ? "음성 한글" : ""}
                    </span>
                    <span className="badge bg-secondary font-12 fw-400">
                      {d.interface_korean === "Y" ? "인터페이스/자막 한글" : ""}
                    </span>
                    <span className="badge bg-secondary font-12 fw-400">
                      {d.exclusive_korean === "Y" ? "독점/한글패치" : ""}
                    </span>
                  </p>
                </li>
              ) : (
                <li className="ps-2 py-2 border-bottom border-opacity-25">
                  <p className="mb-0">
                    <span className="text-secondary me-1 font-14">언어지원</span>
                    <span className="badge bg-secondary font-12 fw-400">한국어지원안함</span>
                  </p>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* 구성정보 상세 */}
        {data.package_info.length > 0 && (
          <div className="section full mb-2">
            <div className="section-title">구성정보 상세</div>
            <div className="wide-block p-0">
              <ul className="listview simple-listview border-0">
                {data.package_info.map((pkg, i) => (
                  <li key={i} className="border-1 border-bottom border-opacity-25">
                    <h4 className="font-12">{pkg.unit_name}</h4>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 상세설명 */}
        <div className="section full">
          <div className="section-title">상세설명</div>
          <div className="wide-block pt-2 pb-2">
            <div
              className="goods_detail_info"
              dangerouslySetInnerHTML={{ __html: data.description_html }}
            />
          </div>
        </div>

        {/* 권리표기 */}
        <a id="copyright"></a>
        <div className="section full">
          <div className="section-title">권리표기</div>
          <div className="wide-block pt-2 pb-2">
            <div className="goods_detail_info">{stripTags(data.legal_html)}</div>
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
