import type { OrderComplete } from "@entities/order";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobilePurchaseGtag } from "./purchase-gtag";

const nf = (value: number) => value.toLocaleString("en-US");

/** 결제수단 라벨 (legacy mobile order_end.html payment_method_label, PC 동일). */
const PAYMENT_METHOD_LABEL: Record<string, string> = {
  SC0010: "신용카드",
  SC0030: "계좌이체",
  SC0040: "가상계좌",
  SC0060: "휴대폰",
  PAYCO: "페이코",
  POINT: "네이버포인트",
  toss_bank: "퀵계좌이체(토스)",
  DG0000: "전액할인",
  toss_pay: "토스페이머니",
};

/** legacy va_date(YYYYMMDDHHMMSS…) → "YYYY-MM-DD HH:MM:SS" (모바일은 초까지, PC는 분까지). */
function formatVaDate(vaDate: string): string {
  const d = vaDate ?? "";
  return `${d.substr(0, 4)}-${d.substr(4, 2)}-${d.substr(6, 2)} ${d.substr(8, 2)}:${d.substr(10, 2)}:${d.substr(12, 2)}`;
}

/**
 * 모바일 주문완료 (legacy `mobile/order/order_end.html`).
 * 단일 카드 표시(결제번호/수단/금액/일자 또는 SC0040 가상계좌 입금안내) + gtag purchase. 폼/뮤테이션 없음.
 */
export function MobileOrderEndScreen({ data }: { data: OrderComplete }) {
  const { order_info, items, payment_log } = data;
  const isVbank = order_info.payment_method === "SC0040";

  return (
    <>
      <MobileSubHeader pageTitle="주문완료" />
      <div id="appCapsuleSub" className="full-height">
        <div className="section full px-3 pt-2">
          <div className="card">
            <div className="card-body">
              <h4 className="text-dark-50 text-center fw-bold mb-3 fs-4">
                주문이 정상적으로 완료되었습니다.
              </h4>
              <div className="text-start mb-3">
                <p className="">
                  <strong className="text-white">결제번호</strong>{" "}
                  <span className="ps-2">{order_info.settle_no}</span>
                </p>
                <p className="">
                  <strong className="text-white">결제수단</strong>{" "}
                  <span className="ps-2">
                    {PAYMENT_METHOD_LABEL[order_info.payment_method] ?? ""}
                  </span>
                </p>
                {isVbank && payment_log ? (
                  <>
                    <p className="">
                      <strong className="text-white">결제금액</strong>{" "}
                      <span className="ps-2">{nf(payment_log.amount)} 원</span>
                    </p>
                    <p className="">
                      <strong className="text-white">입금자</strong>{" "}
                      <span className="ps-2">{payment_log.va_name}</span>
                    </p>
                    <p className="">
                      <strong className="text-white">입금계좌정보</strong>{" "}
                      <span className="ps-2">
                        {payment_log.bank_name} / {payment_log.account}
                      </span>
                    </p>
                    <p className="">
                      <strong className="text-white">예금주</strong>{" "}
                      <span className="ps-2">{payment_log.depositor}</span>
                    </p>
                    <p className="">
                      <strong className="text-white">입금마감시기</strong>{" "}
                      <span className="ps-2">{formatVaDate(payment_log.va_date)}</span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="">
                      <strong className="text-white">결제금액</strong>{" "}
                      <span className="ps-2">{nf(order_info.total_price)} 원</span>
                    </p>
                    <p className="">
                      <strong className="text-white">결제일자</strong>{" "}
                      <span className="ps-2">{order_info.payment_date}</span>
                    </p>
                  </>
                )}
              </div>
              <div className="mb-0 text-center">
                <a
                  href={`/mypage/mypage_order_view?settle_no=${order_info.settle_no}`}
                  className="btn btn-primary"
                  type="button"
                >
                  <i className="mdi mdi-home"></i> 주문내역 확인하기
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobilePurchaseGtag orderInfo={order_info} items={items} />
    </>
  );
}
