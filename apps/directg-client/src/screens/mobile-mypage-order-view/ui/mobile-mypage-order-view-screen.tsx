import type { MypageOrderViewResponse } from "@entities/mypage-order";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobileOrderViewItems } from "./mobile-order-view-items";

interface MobileMypageOrderViewScreenProps {
  data: MypageOrderViewResponse;
}

const nf = (value: number) => value.toLocaleString("en-US");

/** getPaymentMethod(legacy). */
function paymentMethodLabel(paymentMethod: string): string {
  switch (paymentMethod) {
    case "SC0010":
      return "신용카드";
    case "SC0030":
      return "실시간 계좌이체";
    case "SC0040":
      return "가상계좌";
    case "SC0060":
      return "휴대폰";
    case "DG0000":
      return "전액할인";
    case "PAYCO":
      return "페이코";
    case "samsung":
      return "삼성페이";
    case "POINT":
      return "네이버포인트";
    case "toss_bank":
      return "퀵계좌이체";
    case "toss_pay":
      return "토스페이";
    default:
      return "";
  }
}

/** getCheckoutStatus(legacy). */
function checkoutStatusLabel(step: string): string {
  switch (step) {
    case "1":
      return "입금대기";
    case "2":
      return "결제완료";
    case "8":
      return "환불요청";
    case "9":
      return "환불완료";
    case "99":
      return "취소완료";
    default:
      return "";
  }
}

/**
 * 모바일 마이페이지 - 주문 내역 상세보기 (legacy `mobile/mypage/mypage_order_view.html`).
 * 상품 카드(client, 뮤테이션/모달) + 주문 정보 + 결제정보(구매영수증 bill_url, step=="2"만). 총 주문금액=Σ item price.
 */
export function MobileMypageOrderViewScreen({ data }: MobileMypageOrderViewScreenProps) {
  const { order, items } = data;
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const totalDiscount = order.use_emoney + order.use_cash + order.member_dc;

  return (
    <>
      <MobileSubHeader pageTitle="주문 내역 상세보기" />
      <div id="appCapsuleSub">
        <MobileOrderViewItems
          items={items}
          settleNo={order.settle_no}
          paymentMethod={order.payment_method}
        />

        <div className="section full mb-3">
          <div className="section-title">주문 정보</div>
          <div className="wide-block">
            <ul className="list-group">
              <li className="list-group-item bg-transparent px-0 border-0 border-white border-bottom border-opacity-10">
                <div className="d-flex flex-row justify-content-start">
                  <strong className="text-secondary me-2 font-14">결제번호</strong>
                  <span className="font-14 text-white">{order.settle_no}</span>
                </div>
              </li>
              <li className="list-group-item bg-transparent px-0 border-0 border-white border-bottom border-opacity-10">
                <div className="d-flex flex-row justify-content-start">
                  <strong className="text-secondary me-2 font-14">총 주문금액</strong>
                  <span className="font-14 text-white">{nf(totalPrice)} 원</span>
                </div>
              </li>
              <li className="list-group-item bg-transparent px-0 border-0 border-white border-bottom border-opacity-10">
                <div className="d-flex flex-row justify-content-start">
                  <div className="align-self-center me-2">
                    <strong className="text-secondary font-14 text-break">총 할인금액</strong>
                  </div>
                  <div className="p-0">
                    <span className="d-block font-14 text-white">{nf(totalDiscount)} 원</span>
                    <span className="d-block font-12 text-white">
                      (포인트 할인 {nf(order.use_emoney)} 원{" "}
                      {order.use_cash > 0 && <>+ 캐시할인 {nf(order.use_cash)} 원 </>}
                      {order.member_dc > 0 && <>+ 회원 즉시할인 {nf(order.member_dc)} 원</>})
                    </span>
                  </div>
                </div>
              </li>
              <li className="list-group-item bg-transparent px-0 border-0 border-white border-bottom border-opacity-10">
                <div className="d-flex flex-row justify-content-start">
                  <strong className="text-secondary me-2 font-14">총 결제금액</strong>
                  <span className="font-14 text-white">{nf(order.total_price)} 원</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="section full mb-3">
          <div className="section-title">결제정보</div>
          <div className="wide-block">
            <ul className="list-group">
              <li className="list-group-item bg-transparent px-0 border-0 border-white border-bottom border-opacity-10">
                <div className="d-flex flex-row justify-content-start">
                  <strong className="text-secondary me-2 font-14">결제PG</strong>
                  <span className="font-14 text-white">{order.pg_provider}</span>
                </div>
              </li>
              <li className="list-group-item bg-transparent px-0 border-0 border-white border-bottom border-opacity-10">
                <div className="d-flex flex-row justify-content-start">
                  <strong className="text-secondary me-2 font-14">결제수단</strong>
                  <span className="font-14 text-white">
                    {paymentMethodLabel(order.payment_method)}
                  </span>
                </div>
              </li>
              <li className="list-group-item bg-transparent px-0 border-0 border-white border-bottom border-opacity-10">
                <div className="d-flex flex-row justify-content-start">
                  <strong className="text-secondary me-2 font-14">결제상태</strong>
                  <span className="font-14 text-white">{checkoutStatusLabel(order.step)}</span>
                </div>
              </li>
              <li className="list-group-item bg-transparent px-0 border-0 border-white border-bottom border-opacity-10">
                <div className="d-flex flex-row justify-content-start">
                  <strong className="text-secondary me-2 font-14">결제일자</strong>
                  <span className="font-14 text-white">{order.payment_date}</span>
                </div>
              </li>
              <li
                className={`list-group-item bg-transparent px-0 border-0 border-white border-bottom border-opacity-10 ${order.step !== "2" ? "d-none" : ""}`}
              >
                <div className="d-flex flex-row justify-content-start">
                  <strong className="text-secondary me-2 font-14">구매영수증</strong>
                  <span className="font-14 text-white">
                    {order.step === "2" && (
                      <a
                        className="btn btn-secondary shadow-none btn-sm"
                        href={order.bill_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        고객용 영수증 보기
                      </a>
                    )}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
