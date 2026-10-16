import type { CancelViewItem, MypageCancelViewResponse } from "@entities/mypage-order";
import { MypageAside } from "@widgets/mypage-aside";

interface MypageCancelViewScreenProps {
  data: MypageCancelViewResponse;
}

const nf = (value: number) => value.toLocaleString("en-US");

/** getDeliveryType(legacy). 1·2·3 외 빈값. */
function deliveryTypeLabel(deliveryType: string): string {
  switch (deliveryType) {
    case "1":
      return "코드발송";
    case "2":
      return "택배발송";
    case "3":
      return "코드+택배발송";
    default:
      return "";
  }
}

/** getOrderStatus(legacy). 7·default 빈값. */
function orderStatusLabel(status: string): string {
  switch (status) {
    case "1":
      return "주문대기";
    case "2":
      return "주문완료";
    case "3":
      return "배송준비";
    case "4":
      return "배송중";
    case "5":
      return "배송완료";
    case "6":
      return "구매확정";
    case "8":
      return "취소요청";
    case "9":
      return "취소완료";
    default:
      return "";
  }
}

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
 * 취소완료 상세보기 (legacy `pc/mypage/mypage_cancel_view.html`). 세션 SSR 상세(리뉴얼 DB). 가드는 route.
 * 상품표 + 배송지 카드(조건부) + 주문/결제 카드. 숨김(d-none) 상세행은 제외.
 */
export function MypageCancelViewScreen({ data }: MypageCancelViewScreenProps) {
  const { order, items, address } = data;
  const totalPrice = items.reduce((sum: number, item: CancelViewItem) => sum + item.price, 0);
  const totalDiscount = order.use_emoney + order.use_cash + order.member_dc;

  return (
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <MypageAside active="cancel_end" />
        <section id="content" className="content rounded-0">
          <div className="row mb-3">
            <div className="col-12">
              <table className="table table-bordered table-centered mb-0 text-center align-middle text-nowrap">
                <colgroup>
                  <col width="10%" />
                  <col width="*" />
                  <col width="8%" />
                  <col width="8%" />
                  <col width="8%" />
                </colgroup>
                <thead className="font-14">
                  <tr>
                    <th className="text-center bg-body-tertiary">주문번호</th>
                    <th className="text-center bg-body-tertiary">주문상품정보</th>
                    <th className="text-center bg-body-tertiary">주문금액</th>
                    <th className="text-center bg-body-tertiary">진행상태</th>
                    <th className="text-center bg-body-tertiary">비고</th>
                  </tr>
                </thead>
                <tbody className="font-14">
                  {items.map((item) => (
                    <tr key={item.ordno}>
                      <td className="text-center">{item.ordno}</td>
                      <td className="text-start">
                        <div className="mb-1">
                          <span className="badge text-bg-secondary">
                            {deliveryTypeLabel(item.delivery_type)}
                          </span>
                        </div>
                        <span className="d-block">{item.product_name}</span>
                      </td>
                      <td className="text-center">{nf(item.price)} 원</td>
                      <td className="text-center">
                        <div className="mb-1">
                          {item.status === "9" ? (
                            <span className="badge text-bg-danger">
                              {orderStatusLabel(item.status)}
                            </span>
                          ) : (
                            <span className="badge text-bg-secondary">
                              {orderStatusLabel(item.status)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        {item.status === "9" ? `취소 일자 : ${item.cancel_date}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {address && address.zipcode !== "" && (
            <div className="row">
              <div className="col-12 mb-3">
                <div className="card shadow-none rounded-0" id="address_info">
                  <div className="card-header bg-card font-14">
                    <div className="d-flex align-items-center">
                      <h5 className="text-white fw-bold">배송지 정보</h5>
                      <div className="d-flex ms-auto">
                        <button
                          className="btn btn-secondary btn-sm font-12 d-none"
                          data-bs-toggle="modal"
                          data-bs-target="#addressModal"
                          data-bs-whatever="@getbootstrap"
                        >
                          배송지 수정
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <table className="table table-bordered table-sm mb-0">
                      <thead className="font-13">
                        <tr>
                          <th className="bg-body-secondary text-center py-2">우편번호</th>
                          <th className="bg-body-secondary text-center py-2">주소</th>
                          <th className="bg-body-secondary text-center py-2">주문자</th>
                          <th className="bg-body-secondary text-center py-2">휴대폰번호</th>
                        </tr>
                      </thead>
                      <tbody className="font-12">
                        <tr>
                          <td className="text-center py-2">{address.zipcode}</td>
                          <td className="text-start py-2">
                            {address.address} {address.address_detail}
                          </td>
                          <td className="text-center py-2">{address.name}</td>
                          <td className="text-center py-2">{address.tel}</td>
                        </tr>
                        <tr>
                          <th className="bg-body-secondary text-center py-2">배송요청 메시지</th>
                          <td className="py-2" colSpan={3}>
                            {address.msg}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="row">
            <div className="col-6">
              <div className="card shadow-none rounded-0" id="order_info">
                <div className="card-header text-white fw-bold bg-card font-14">주문 정보</div>
                <div className="card-body">
                  <dl className="row g-2 mb-0">
                    <dt className="col-sm-3">결제번호</dt>
                    <dd className="col-sm-9">{order.settle_no} </dd>
                    <dt className="col-sm-3">총 주문금액</dt>
                    <dd className="col-sm-9">{nf(totalPrice)} 원</dd>
                    <dt className="col-sm-3">총 할인금액</dt>
                    <dd className="col-sm-9">
                      <span>{nf(totalDiscount)} 원</span>
                      <div>
                        (포인트 할인 {nf(order.use_emoney)} 원: + 캐시할인 {nf(order.use_cash)} 원 +
                        회원 즉시할인 {nf(order.member_dc)} 원)
                      </div>
                    </dd>
                    <dt className="col-sm-3">최종 결제금액</dt>
                    <dd className="col-sm-9">{nf(order.total_price)} 원</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card shadow-none rounded-0" id="settle_info">
                <div className="card-header text-white fw-bold bg-card">결제 정보</div>
                <div className="card-body">
                  <dl className="row g-2 mb-0">
                    <dt className="col-sm-3">결제PG</dt>
                    <dd className="col-sm-9">{order.pg_provider}</dd>
                    <dt className="col-sm-3">결제수단</dt>
                    <dd className="col-sm-9">{paymentMethodLabel(order.payment_method)}</dd>
                    <dt className="col-sm-3">결제상태</dt>
                    <dd className="col-sm-9">{checkoutStatusLabel(order.step)}</dd>
                    <dt className="col-sm-3">결제일자</dt>
                    <dd className="col-sm-9">{order.payment_date}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
