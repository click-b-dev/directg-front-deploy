import type { TimedealResponse } from "@entities/promotion-timedeal";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobileTimedealCountdown } from "./mobile-timedeal-countdown";

/** legacy `mobile/promotion/timedeal.html` head `<style>` (countdown / timedeal_price bg / GmarketSans). */
const TIMEDEAL_CSS = `
@font-face {
	font-family: 'GmarketSans';
	src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff') format('woff');
}
.countdown{
	background-color:#000000;
	font-size:44px;
	font-weight:bold;
	border-radius:5px;
	padding:0px 8px 0px 8px;
	color:#FFFFFF;
}
.timedeal_price{
	background-image:url('https://image.directg.net/f7PjRn2Md4');
}
.timedeal_price > *{
	font-family:"GmarketSans";
}
`;

const nf = (value: number) => value.toLocaleString("en-US");

/** legacy age_limit 표시 변환: 0→10, 18→19, 그 외 그대로. age_<n>.gif용. */
function ageImageLevel(ageLimit: number): number {
  if (ageLimit === 0) return 10;
  if (ageLimit === 18) return 19;
  return ageLimit;
}

/**
 * 모바일 타임딜 (legacy `mobile/promotion/timedeal.html` — DGKR 이벤트 구동 단일상품 랜딩).
 * MobileSubHeader + 배너/소진임박 + 카운트다운(vendor) + 상품 이미지/가격 + 장바구니(dead, 인페이지 핸들러 없음) + 유의사항.
 * 이벤트 없으면 상품 이미지가 404(active=false). 공개(세션 불필요).
 */
export function MobilePromotionTimedealScreen({ data }: { data: TimedealResponse }) {
  const { active, event, goods } = data;
  const productImg =
    active && goods ? `https://directg.net/upload/product/${goods.open_graph}` : "/images/404.jpg";
  const showLowStock = goods ? goods.event_ea - goods.order_ea <= 50 : false;

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
      <link href="https://fonts.googleapis.com/css2?family=Material+Icons" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: TIMEDEAL_CSS }} />

      <MobileSubHeader pageTitle="타임딜" />

      <div id="appCapsule" className="mt-2 full-height">
        <div className="section inset">
          <div className="mb-2 position-relative">
            <img src="https://image.directg.net/O7PjnFN5nl" className="w-100" alt="" />
            {showLowStock && (
              <img
                src="https://image.directg.net/P7PaBshmEs"
                className="position-absolute top-0 end-0 m-1"
                alt=""
              />
            )}
          </div>
          <div
            id="countdown_banner"
            className="d-flex justify-content-between align-items-center text-nowrap my-2"
          >
            <div>
              {event?.end_dt ? <MobileTimedealCountdown endDateTime={event.end_dt} /> : null}
            </div>
            <div>
              {goods && (
                <img
                  src={`https://directg.net/images/common/age_${ageImageLevel(goods.age_limit)}.gif`}
                  alt=""
                />
              )}
            </div>
          </div>

          <a href={`/game/game_page?product_code=${goods?.goods_code ?? ""}`}>
            <div className="flex-fill position-relative text-white">
              <div>
                <img src={productImg} className="w-100" alt="" />
              </div>
              <div className="position-absolute w-100 text-center lh-2 bottom-0 bg-black opacity-75">
                <span>
                  게임정보 바로가기 <i className="fa fa-long-arrow-right"></i>
                </span>
              </div>
            </div>
          </a>

          <div className="d-flex justify-content-between my-2 align-items-center">
            <div className="align-self-center fw-bold">{goods?.goods_name}</div>
            <div>
              <span className="badge badge-danger font-14 rounded-2 fw-bold">TIMEDEAL</span>
            </div>
          </div>

          {goods?.goods_info && (
            <div
              className="card shadow-none rounded-0 my-1 p-1 text-white border fw-bold"
              dangerouslySetInnerHTML={{ __html: goods.goods_info }}
            />
          )}

          <div className="timedeal_price d-flex fst-italic py-3 my-3 text-nowrap">
            <div className="fw-800 text-center align-self-center col-3 font-14">
              정상가
              <br />
              <s>{goods ? nf(goods.consumer_price) : 0}</s>원
            </div>
            <div className="fw-bold text-center align-self-center col-1">
              <i className="fa fa-long-arrow-right"></i>
            </div>
            <div className="fw-bold text-center align-self-center col-3 text-warning font-16">
              할인가
              <br />
              {goods ? nf(goods.sale_price) : 0}원
            </div>
            <div className="fw-800 text-center align-self-center col-5 text-danger fs-1 fst-normal">
              {goods?.discount_rate ?? 0}
              <span className="fst-italic">%off</span>
            </div>
          </div>

          <div className="cart">
            {/* legacy: btn_cart 인페이지 핸들러 없음 → dead 버튼(장바구니는 order 도메인 후속) */}
            <button
              type="button"
              className="btn btn-danger btn_cart w-100 rounded-0 font-14"
              id="btn_cart"
              data-goodscode={goods?.goods_code}
              data-assetid=""
              data-prodtp=""
            >
              장바구니 담기
            </button>
          </div>
          <hr />
          <div className="card shadow-none rounded-0 my-1 p-1 text-white font-14">
            <p>※ 유의사항</p>
            <ul>
              <li>기간 내 결제 후 제품 코드(키) 활성화(수신)까지 완료된 주문 건에 해당됩니다.</li>
              <li>타임딜 상품은 가상계좌 결제수단을 지원하지 않습니다.</li>
              <li>
                이벤트 기간 내 주문 금액의 합계로 적용되며, 이벤트 페이지에서 나의 누적 주문 금액과
                참여 기회 횟수를 확인하실 수 있습니다.
              </li>
              <li>
                해당 이벤트는 휴대폰 본인 인증된 계정 기준, 1인당 기간 내 최대 1회에 한하여
                당첨됩니다.
              </li>
              <li>미당첨 시에는 재참여가 가능하며, 당첨된 경우 추가 참여가 불가합니다.</li>
              <li>
                포인트는 당첨 시 즉시 지급되며, [마이페이지 - 포인트] 메뉴에서 확인하실 수 있습니다.
              </li>
              <li>
                당첨된 포인트는 다이렉트 게임즈에서 주문 결제 시 사용이 가능하며, 현금화는
                불가합니다.
              </li>
              <li>
                이벤트 기간, 적립 기준 및 금액은 사정에 따라 사전 공지 없이 변경될 수 있습니다.
              </li>
              <li>
                부적절한 방법을 통한 참여 및 당첨은 모두 취소되며 법적인 처벌을 받을 수 있습니다.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
