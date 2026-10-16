import type { OrderComplete, OrderCompleteItem } from "@entities/order";
import { FooterBannerSection } from "@widgets/footer-banner-section";

import { PurchaseGtag } from "./purchase-gtag";

const nf = (value: number) => value.toLocaleString("en-US");

/** 결제수단 라벨 (legacy order_end.html payment_method_label). */
const PAYMENT_METHOD_LABEL: Record<string, string> = {
  SC0010: "신용카드",
  SC0030: "계좌이체",
  SC0040: "가상계좌",
  SC0060: "휴대폰",
  PAYCO: "페이코",
  toss_bank: "퀵계좌이체(토스)",
  POINT: "네이버포인트",
  DG0000: "전액할인",
  toss_pay: "토스페이머니",
};

/** 타입 badge (legacy order_end.html — basic→info/edition→primary, **bundle 케이스 없음** verbatim). */
function typeBadge(item: OrderCompleteItem): { text: string; className: string } | null {
  const { game_type, display_type } = item;
  if (game_type === "game") {
    if (display_type === "basic") return { text: "기본게임", className: "bg-info" };
    if (display_type === "edition") return { text: "에디션", className: "bg-primary" };
    if (display_type === "multi") return { text: "멀티팩", className: "bg-warning" };
    return null;
  }
  if (game_type === "dlc") return { text: "DLC", className: "bg-content" };
  if (game_type === "music") return { text: "Music", className: "bg-content" };
  if (game_type === "holomodels") {
    if (display_type === "holomodels") return { text: "본체", className: "bg-success" };
    if (display_type === "holomodelsdlc") return { text: "DLC", className: "bg-content" };
    if (display_type === "holomodelsedition") return { text: "에디션", className: "bg-primary" };
  }
  return null;
}

/** 플랫폼 아이콘 (legacy order_end.html — svg, holomodels w-75). */
function platformIcon(platform: string) {
  switch (platform) {
    case "1":
      return (
        <img className="mx-auto d-block rounded-0" src="/assets/images/platform/steam.svg" alt="" />
      );
    case "34":
      return (
        <img
          className="mx-auto d-block rounded-0"
          src="/assets/images/platform/epic_w.svg"
          alt=""
        />
      );
    case "35":
      return (
        <img
          className="mx-auto d-block rounded-0"
          src="/assets/images/platform/rockstar_2.svg"
          alt=""
        />
      );
    case "51":
      return (
        <img
          className="mx-auto d-block rounded-0 w-75"
          src="/assets/images/platform/holomodels.svg"
          alt=""
        />
      );
    default:
      return null;
  }
}

/** legacy va_date(YYYYMMDDHHMM…) → "YYYY-MM-DD HH:MM". */
function formatVaDate(v: string): string {
  return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)} ${v.slice(8, 10)}:${v.slice(10, 12)}`;
}

/**
 * 주문완료 (legacy `pc/order/order_end.html`). step nav(04) + 헤드라인 + [SC0040 입금안내] +
 * 주문정보/결제정보 표 + 버튼 + footer_banner. 표시 전용(gtag purchase만 CSR). 가드는 route.
 */
export function OrderEndScreen({ data }: { data: OrderComplete }) {
  const { order_info, items, payment_log } = data;
  const isVbank = order_info.payment_method === "SC0040";
  const totalGoodsPrice = items.reduce((s, it) => s + it.price, 0); // legacy: sum(price)

  return (
    <div className="container">
      <main className="mb-5">
        <div className="row g-0 my-3">
          <div className="col-12">
            <div className="mb-4">
              <ul className="nav nav-pills nav-fill">
                <li className="nav-item rounded-0 border-start border-top border-bottom py-4">
                  <h4 className="list-group-item-heading mb-0">01 장바구니</h4>
                </li>
                <li className="nav-item rounded-0 border-start border-top border-bottom py-4">
                  <h4 className="list-group-item-heading mb-0">02 주문하기</h4>
                </li>
                <li className="nav-item rounded-0 border-start border-top border-bottom py-4">
                  <h4 className="list-group-item-heading mb-0">03 결제하기</h4>
                </li>
                <li className="nav-item rounded-0 bg-primary border-primary py-4">
                  <h4 className="list-group-item-heading fw-bold mb-0">04 주문완료</h4>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <p className="h4 text-center bg-primary py-4 text-white fw-bold">
              {isVbank
                ? "가상계좌(무통장입금) 결제 주문건은 기간 내에 입금 확인 후 주문이 완료됩니다."
                : "주문이 완료되었습니다."}
            </p>
          </div>
        </div>

        {isVbank && payment_log && (
          <div className="row mb-3">
            <div className="col-12">
              <h3 className="pt-2 mb-3">가상계좌 입금 안내</h3>
              <span className="font-14">
                ※ 아래의 지정된 계좌정보로 입금마감 전 입금해 주시기 바랍니다. 기입하신 입금자명으로
                입금해야 결제가 정상 진행됩니다.
              </span>
              <table className="table table-centered border-primary border border-2 border-start-0 border-end-0 mt-2">
                <colgroup>
                  <col width="15%" />
                  <col width="*" />
                </colgroup>
                <tbody className="border-top-2 border-primary">
                  <tr className="border-light-subtle">
                    <td className="text-center py-3 bg-transparent">결제금액</td>
                    <td className="py-3 bg-transparent">{nf(payment_log.amount)} 원</td>
                  </tr>
                  <tr className="border-light-subtle">
                    <td className="text-center py-3 bg-transparent">입금자</td>
                    <td className="py-3 bg-transparent">{payment_log.va_name}</td>
                  </tr>
                  <tr className="border-light-subtle">
                    <td className="text-center py-3 bg-transparent">입금계좌정보</td>
                    <td className="py-3 bg-transparent">
                      {payment_log.bank_name} {payment_log.account}
                    </td>
                  </tr>
                  <tr className="border-light-subtle">
                    <td className="text-center py-3 bg-transparent">예금주</td>
                    <td className="py-3 bg-transparent">{payment_log.depositor}</td>
                  </tr>
                  <tr className="border-light-subtle">
                    <td className="text-center py-3 bg-transparent">입금마감일시</td>
                    <td className="py-3 bg-transparent">{formatVaDate(payment_log.va_date)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="row">
          <div className="col-12">
            <h3 className="pt-2 mb-3">주문정보</h3>
            <table
              className="table table-bordered table-centered caption-top mb-4 shadow-none"
              id="order_table"
              cellSpacing={0}
            >
              <caption className="font-14 text-white">상품수 ( 총 {items.length} 개 )</caption>
              <thead className="font-15">
                <tr className="">
                  <th scope="col" className="text-center fw-500 py-2">
                    주문번호
                  </th>
                  <th scope="col" className="text-center fw-500 py-2">
                    상품정보
                  </th>
                  <th scope="col" className="text-center fw-500 py-2" style={{ width: "150px" }}>
                    가격정보
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const badge = typeBadge(item);
                  const discount =
                    item.goods_price > 0
                      ? Math.round(((item.goods_price - item.price) * 100) / item.goods_price)
                      : 0;
                  return (
                    <tr key={item.ordno}>
                      <td className="text-center">{item.ordno}</td>
                      <td className="p-0">
                        <div className="card rounded-0 border-0 bg-grey">
                          <div className="row g-0">
                            <div className="col-md-2 rounded-0">
                              <div className="position-relative">
                                <img
                                  src={`/upload/product/${item.product_code}/header/header.jpg`}
                                  className="img-fluid rounded-0 w-100 h-100"
                                  alt=""
                                />
                                <div className="position-absolute bottom-0 start-0">
                                  {badge && (
                                    <span
                                      className={`badge ${badge.className} rounded-0 font-12 py-2`}
                                    >
                                      {badge.text}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-1">
                              <div className="text-center align-content-center h-100">
                                {platformIcon(item.product_platform)}
                              </div>
                            </div>
                            <div className="col-md-9">
                              <div className="row g-0 overflow-hidden flex-md-row shadow-sm position-relative">
                                <div className="p-2 d-flex flex-column position-static align-content-start">
                                  <div className="mb-2 text-body-secondary">
                                    {item.delivery_type === "1" && (
                                      <span className="badge badge-outline-success rounded-2 font-11 fw-500">
                                        코드발송
                                      </span>
                                    )}
                                    {item.delivery_type === "2" && (
                                      <span className="badge badge-outline-post rounded-2 font-11 fw-500">
                                        택배발송
                                      </span>
                                    )}
                                    {item.delivery_type === "3" && (
                                      <span className="badge badge-outline-code-post rounded-2 font-11 fw-500">
                                        코드+택배발송
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="mb-2 text-white">{item.product_name}</h5>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center align-middle">
                        <div className="d-flex">
                          <div className="d-grid grid-2 col-12">
                            <div className="d-flex flex-row justify-content-between mb-2">
                              <span className="badge bg-primary align-self-center px-3 py-2 font-14 num minus">
                                {discount} %
                              </span>
                              <div className="d-flex flex-column align-items-end">
                                <s className="text-muted font-11 num won">
                                  {" "}
                                  {nf(item.goods_price)}
                                </s>
                                <span className="text-white fw-bold font-14 num won">
                                  {" "}
                                  {nf(item.price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-12">
            <h3 className="pt-2 mb-3">결제정보</h3>
            <table className="table table-centered border-primary border border-2 border-start-0 border-end-0">
              <colgroup>
                <col width="15%" />
                <col width="*" />
              </colgroup>
              <tbody className="border-top-2 border-primary">
                <tr className="border-light-subtle">
                  <td className="text-center py-3 bg-transparent">결제번호</td>
                  <td className="py-3 bg-transparent">{order_info.settle_no}</td>
                </tr>
                <tr className="border-light-subtle">
                  <td className="text-center py-3 bg-transparent">결제수단</td>
                  <td className="py-3 bg-transparent">
                    {PAYMENT_METHOD_LABEL[order_info.payment_method]}
                  </td>
                </tr>
                <tr className="border-light-subtle">
                  <td className="text-center py-3 bg-transparent">결제상태</td>
                  <td className="py-3 bg-transparent">{order_info.checkout_status}</td>
                </tr>
                <tr className="border-light-subtle">
                  <td className="text-center py-3 bg-transparent">
                    {isVbank ? "주문" : "결제"}일자
                  </td>
                  <td className="py-3 bg-transparent">{order_info.payment_date}</td>
                </tr>
                <tr className="border-light-subtle">
                  <td className="text-center py-3 bg-transparent">총 주문 금액</td>
                  <td className="py-3 bg-transparent">{nf(totalGoodsPrice)} 원</td>
                </tr>
                {order_info.use_emoney > 0 && (
                  <tr className="border-light-subtle">
                    <td className="text-center py-3 bg-transparent">포인트 할인</td>
                    <td className="py-3 bg-transparent">{nf(order_info.use_emoney)} 원</td>
                  </tr>
                )}
                <tr className="">
                  <td className="text-center py-3 bg-transparent">총 결제금액</td>
                  <td className="py-3 bg-transparent">{nf(order_info.total_price)} 원</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="d-grid gap-3 d-flex justify-content-center">
          <a
            href="/index.php"
            className="btn btn-secondary btn-lg rounded-0 fs-4 w-25 py-3 shadow-none"
          >
            쇼핑 계속하기
          </a>
          <a
            href={`/mypage/mypage_order_view?settle_no=${order_info.settle_no}`}
            className="btn btn-primary btn-lg rounded-0 fs-4 w-25 py-3 shadow-none"
          >
            <i className="mdi mdi-home"></i> 주문내역 확인하기
          </a>
        </div>

        {/* 기획 고정 배너2 */}
        <FooterBannerSection />
      </main>
      <PurchaseGtag orderInfo={order_info} items={items} />
    </div>
  );
}
