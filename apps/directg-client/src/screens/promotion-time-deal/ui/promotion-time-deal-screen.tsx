import type { PromotionTimeDealResponse } from "@entities/promotion-time-deal";

import { CountdownTimer } from "./countdown-timer";
import { TimeDealCart } from "./time-deal-cart";

/** legacy number_format(). */
const formatWon = (value: number) => value.toLocaleString("ko-KR");

/**
 * 타임딜 랜딩 (legacy `pc/promotion/time_deal.html`). 하드코딩 단일 상품, 공개 SSR.
 * is_view=N → 진행기간 아님 alert. is_view=Y → 배너/카운트다운/상품카드/유의사항/하단배너.
 */
export function PromotionTimeDealScreen({ data }: { data: PromotionTimeDealResponse }) {
  const {
    is_view,
    goods_sku,
    product_code,
    product_name,
    product_platform,
    consumer_price,
    region_msg,
    timedeal,
  } = data;

  const timedealPrice = timedeal?.timedeal_price ?? 0;
  const timedealSrp = timedeal?.timedeal_srp ?? 0;
  const discountRate =
    timedealSrp > 0 ? Math.round(((timedealSrp - timedealPrice) * 100) / timedealSrp) : 0;

  // legacy: if(DATE("Y-m-d")=="2025-02-12") — 과거 날짜 조건부 유의사항(verbatim, 현재 미노출).
  const today = new Date();
  const isFeb12 =
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate(),
    ).padStart(2, "0")}` === "2025-02-12";

  return (
    <>
      <style>{`
.countdown{ background-color:#000000; font-size:50px; font-weight:bold; border-radius:5px; padding:0px 8px 0px 8px; }
.top_banner{ background-image:url('https://image.directg.net/R7PayUdWBZ'); background-repeat:no-repeat; background-size:cover; height:165px; display:flex; justify-content:end; align-items:center; padding-right:50px; }
.timedeal_info{ color:#d43f3a; line-height:140%; font-weight:bold; font-size:14px; }
@font-face{ font-family:'GmarketSans'; src:url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff') format('woff'); }
.timedeal_price{ font-family:"GmarketSans"; background-image:url('https://image.directg.net/p7PgALO8wy'); background-size:cover; font-style:italic; height:70px; align-items:baseline; justify-content:space-between; }
.price{ flex:2; }
.price, .price span{ font-family:"GmarketSans"; font-size:18px; }
.price span{ text-decoration:line-through; font-style:italic; }
.sale_price{ font-family:"GmarketSans"; font-size:28px; color:#ffa72b; flex:3; }
.discount_rate{ font-family:"GmarketSans"; font-size:55px; font-style:normal; width:125px; text-align:center; }
.goods_image{ position:relative; color:#FFFFFF; }
.discount_rate span{ font-family:"GmarketSans"; font-size:18px; font-style:italic; }
.goods_page{ position:absolute; bottom:0; width:100%; background-color:#000000; opacity:0.8; text-align:center; line-height:2; }
.bottom_banner{ margin:50px 0; text-align:center; }
`}</style>

      <div className="container my-3 pb-5">
        <main>
          {is_view === "N" ? (
            <div className="row mt-3">
              <div
                className="alert alert-danger alert-dismissible bg-danger text-white border-0 fade show"
                role="alert"
              >
                <strong>타임딜 진행기간이 아닙니다.</strong>
              </div>
            </div>
          ) : (
            <>
              <div className="row">
                <div className="col-12 mb-5">
                  <div className="top_banner">
                    <img
                      src="https://image.directg.net/P7PaBshmEs"
                      style={{ position: "absolute", transform: "translate(0,-220%)" }}
                    />
                    <div id="countdown_banner">
                      <div>
                        <CountdownTimer endUnix={timedeal?.timedeal_end ?? 0} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-3" style={{ gridTemplateColumns: "460px auto" }}>
                <div className="left">
                  <a href={`/game/timedeal_view?sku=${goods_sku}`}>
                    <div className="flex-fill mr-50 goods_image">
                      <div>
                        <img src={`/upload/product/${product_code}/header/header.jpg`} />
                      </div>
                      <div className="goods_page">
                        <span className="font-14">
                          게임정보 바로가기 <i className="fa fa-arrow-right"></i>
                        </span>
                      </div>
                    </div>
                  </a>
                </div>
                <div className="right ps-3">
                  <div className="d-flex flex-column">
                    <div className="d-flex flex-row align-items-center">
                      <div className="flex-fill">
                        <h4 className="font-18">{product_name}</h4>
                      </div>
                      <div className="px-2">
                        <img src="https://image.directg.net/A7PbXeIpxX" />
                      </div>
                      <div className="px-2">
                        {product_platform === "1" && (
                          <img
                            src="/assets/images/platform/Platform_logo_steam.png"
                            className="w-100"
                          />
                        )}
                        {product_platform === "34" && (
                          <img
                            src="/assets/images/platform/Platform_logo_epic.png"
                            className="w-100"
                          />
                        )}
                      </div>
                      <div className="px-2">
                        <img src="/assets/images/game/age_15.png" />
                      </div>
                    </div>
                    <div className="timedeal_msg text-danger py-2">{region_msg}</div>

                    <div className="timedeal_price d-flex py-2">
                      <div className="price" style={{ textAlign: "center" }}>
                        정상가 <span>{formatWon(consumer_price)}</span>원
                      </div>
                      <div style={{ textAlign: "center", margin: "0 10px", fontSize: "18px" }}>
                        <i className="fa fa-long-arrow-right"></i>
                      </div>
                      <div className="sale_price">할인가 {formatWon(timedealPrice)}원</div>
                      <div className="discount_rate">
                        {discountRate}
                        <span>%off</span>
                      </div>
                    </div>

                    <TimeDealCart />
                  </div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-5"></div>
                <div className="col-7"></div>
              </div>

              <hr className="my-5" />

              <div className="row">
                <div className="col-12">
                  <div className="text-warning font-14">
                    <h5>※ 유의사항</h5>
                    <ul>
                      {isFeb12 && (
                        <>
                          <li className="font-red">
                            2월 13일(목)부터{" "}
                            <a
                              href="https://directg.net/mypage/v2/mypage_event_gift"
                              target="_blank"
                            >
                              [마이페이지 - 사은품]
                            </a>
                            에서 배송정보 입력이 가능합니다.
                          </li>
                          <li className="font-red">
                            2월 18일(화)까지 배송정보 입력이 완료되지 않을 경우, 주문 취소 처리되니
                            기한 내 입력해 주시기 바랍니다.
                          </li>
                          <li className="font-red">
                            Xbox 무선 컨트롤러는 실물로 배송되며, 게임은 제품 코드(키)는 실물로
                            배송되지 않는 디지털 상품입니다.
                          </li>
                          <li className="font-red">
                            Xbox 무선 컨트롤러는 2월 19일(수)에 발송 예정이며, 제품 코드(키)는 2월
                            20일(목)에 발송 예정입니다.
                          </li>
                          <li className="font-red">
                            <a
                              href="https://directg.net/event/purchase_event_202502"
                              target="_blank"
                            >
                              [포인트 + 랜덤 게임 이벤트]
                            </a>{" "}
                            사은품은 2월 21일(금) 출시 이후 수령하실 수 있습니다.
                          </li>
                          <li className="font-red">
                            Xbox 무선 컨트롤러는 실물로 배송되며, 게임은 제품 코드(키)는 실물로
                            배송되지 않는 디지털 상품입니다.
                          </li>
                        </>
                      )}
                      <li>
                        타임딜 상품은 다이렉트 게임즈 포인트 할인 적용이 불가하며, 포인트 적립
                        대상에서 제외됩니다.
                      </li>
                      <li>타임딜 상품은 가상계좌 결제수단을 지원하지 않습니다.</li>
                      <li>
                        타임딜 상품은 한정 시간으로 준비되며, 시간 초과 시 할인 적용이 안 될 수
                        있습니다. 최종 결제 금액을 확인해 주시기 바랍니다.
                      </li>
                      <li>
                        타임딜 상품은 한정 수량으로 준비되며, 수량 소진 시 제품 코드(키)가 지급되지
                        않을 수 있습니다.
                      </li>
                      <li>
                        타임딜 상품, 기간, 가격(할인율)은 사정에 따라 사전 고지 없이 변경 또는 종료
                        될 수 있습니다.
                      </li>
                      <li>
                        사용하지 않는 플랫폼, PC 사양 및 호환 문제 등은 환불 사유에 해당하지
                        않습니다. 상품 페이지 내 정보를 반드시 확인해 주시기 바랍니다.
                      </li>
                      <li>
                        다이렉트 게임즈 환불정책에 따라 주문일로부터 7일이 경과하거나, 제품 코드(키)
                        활성화 및 수신이 완료된 경우에는 주문 취소 및 환불이 불가합니다.
                      </li>
                      <li>
                        부적절한 방법으로 참여가 확인되는 경우, 주문은 모두 취소되며 법적인 처벌을
                        받을 수 있습니다.
                      </li>
                    </ul>
                  </div>

                  <hr />
                  <div className="bottom_banner">
                    {/* legacy: $bottom_banner 미정의 → 빈 suffix(버그) verbatim */}
                    <img src="https://directg.net/upload/event/" />
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
