import type { MypageRetailOrderViewResponse } from "@entities/mypage-order";
import { MypageAside } from "@widgets/mypage-aside";

interface MypageRetailOrderViewScreenProps {
  data: MypageRetailOrderViewResponse;
}

const nf = (value: number) => value.toLocaleString("en-US");

/**
 * 실물주문 상세보기 (legacy `pc/mypage/mypage_retail_order_view.html`). 세션 SSR 상세(DGKR DB). 가드는 route.
 * ⚠️ verbatim parity(개발자 승인): 하드코딩 m_no(백엔드), dead 버튼 마크업, legacy 버그(주문상태·반송정보·결제수단 빈값) 유지.
 */
export function MypageRetailOrderViewScreen({ data }: MypageRetailOrderViewScreenProps) {
  const { order, naverpay, kcp } = data;

  const hasReserve = Boolean(order.reserve_id);
  const stepInDelivery = ["2", "3", "4", "5", "6"].includes(order.step);

  // legacy PG 분기
  const productName =
    order.pg_provider === "naverpay" ? (naverpay?.productName ?? "") : order.goods_nm;
  const cardAuthNo =
    order.pg_provider === "naverpay"
      ? (naverpay?.cardAuthNo ?? "")
      : order.pg_provider === "kcp"
        ? (kcp?.app_no ?? "")
        : "";
  // $settlekind: naverpay만 "네이버페이 " 할당, kcp·기타는 미정의(빈값) — legacy 버그 그대로
  const settlekindDisplay = order.pg_provider === "naverpay" ? "네이버페이 " : "";

  return (
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        {/* legacy는 $aside_menu['retail_order'] 설정하나 라이브 aside에 해당 항목 없음 → 하이라이트 없음 */}
        <MypageAside />
        <section id="content" className="content rounded-0">
          <div className="col-12">
            <table className="table table-bordered table-centered mb-0">
              <tbody>
                <tr>
                  <th className="text-center">주문번호</th>
                  <th className="text-center">상품코드</th>
                  <th className="text-center">상품명</th>
                  <th className="text-center">결제금액</th>
                  {hasReserve && <th className="text-center">키확인</th>}
                  <th className="text-center">주문상태</th>
                  <th className="text-center">비고</th>
                </tr>

                <tr>
                  <td className="text-center">{order.settle_no}</td>
                  <td className="text-center">{order.goods_code}</td>
                  <td className="text-center">{order.goods_nm}</td>
                  <td className="text-center" style={{ whiteSpace: "nowrap" }}>
                    {nf(order.settleprice)}원
                  </td>
                  {hasReserve && stepInDelivery && (
                    <td className="text-center">
                      {order.is_lic_actv === "1" ? (
                        <button
                          type="button"
                          className="btn btn-info btn-sm btn_licence_view"
                          data-reserveid={order.reserve_id}
                          data-assetid={order.asset_id}
                          data-settleno={order.settle_no}
                        >
                          키확인
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-success btn-sm btn_activate"
                          data-reserveid={order.reserve_id}
                          data-assetid={order.asset_id}
                          data-settleno={order.settle_no}
                        >
                          활성화
                        </button>
                      )}
                    </td>
                  )}
                  {/* 주문상태: legacy $statusText 미정의 → 빈값 */}
                  <td className="text-center"></td>
                  <td className="text-center">
                    {order.step !== "8" && order.step !== "9" && order.is_lic_actv !== "1" && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm btn_order_cancel"
                        data-toggle="modal"
                        data-target="#orderCancelModal"
                        data-todo="주문취소요청"
                        data-settleno={order.settle_no}
                        data-actv={order.is_lic_actv}
                        data-status={order.step}
                      >
                        주문취소
                      </button>
                    )}
                  </td>
                </tr>

                <tr>
                  <th className="text-center align-middle" rowSpan={3}>
                    배송 정보
                  </th>
                  <td colSpan={hasReserve ? 5 : 4}>
                    ({order.zipcode}) {order.address} {order.address_detail} {order.name}
                  </td>
                  <td className="text-center">
                    {order.step === "2" ? (
                      <button
                        type="button"
                        className="btn btn-warning btn_adddress_edit"
                        data-toggle="modal"
                        data-target="#addressModal"
                        data-settleno={order.settle_no}
                        data-delivery={order.step}
                        data-mode="edit"
                      >
                        주소수정
                      </button>
                    ) : order.step === "4" || order.step === "5" ? (
                      <>
                        CJ대한통운
                        <br />
                        {order.tracking_no}
                        <br />
                        <button
                          type="button"
                          className="btn btn-info btn-sm btn_delivery_search"
                          data-trackingno={order.tracking_no}
                        >
                          배송조회
                        </button>
                      </>
                    ) : null}
                  </td>
                </tr>
                <tr>
                  <td colSpan={hasReserve ? 4 : 3}>배송요청메세지 : {order.message}</td>
                  <td colSpan={2}>연락처) {order.phone}</td>
                </tr>
                {hasReserve && (
                  <tr>
                    <td colSpan={6}>
                      <span className="text-danger">
                        ※ 제품 코드(키) 수신 후에는 단순 변심으로 인한 주문 및 발송 철회 불가합니다.
                      </span>
                      <br />
                    </td>
                  </tr>
                )}
                {(order.step === "8" || order.step === "9") && (
                  <tr>
                    <th>반송 정보</th>
                    {/* getRetailOrderLog fetchAll 버그로 항상 빈값 — legacy 그대로 */}
                    <td colSpan={hasReserve ? 6 : 5}>() &nbsp;/ </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="card shadow-none rounded-0 my-3 p-3">
              <p>
                <strong>
                  ※ 디지털상품은 활성화(수신)되지 않은 제품 코드(키)에 한하여 구입 후 7일 이내에
                  주문취소 요청이 가능합니다.
                </strong>
              </p>
              <p>
                <strong>
                  ※ 실물배송상품은 상품 수령일로부터 7일 이내에 교환/반품 요청이 가능합니다.
                </strong>
              </p>
              <p>
                <strong>
                  ※ [특전제공] 상품은 개발사/퍼블리셔 정책에 따라 출시 후 예고 없이 특전지급이
                  중단될 수 있습니다.
                </strong>
              </p>
              <p>
                <strong>
                  ※ 주문완료 후 가급적 빠른 시일 내에 제품 코드(키)를 활성화 하시고, 플랫폼에
                  등록해주시기 바랍니다.
                </strong>
              </p>
            </div>

            <div className="row">
              <div className="col-md-7 col_left">
                <div className="card shadow-none rounded-0" id="order_info">
                  <div className="card-header text-white fw-bold bg-card">주문 정보</div>
                  <div className="card-body">
                    <table className="col-12">
                      <tbody>
                        {order.pg_provider === "naverpay" && (
                          <tr>
                            <th>결제번호</th>
                            <td>{naverpay?.paymentId}</td>
                          </tr>
                        )}
                        <tr>
                          <th className="col-3">주문명</th>
                          <td className="col-9">{productName}</td>
                        </tr>
                        <tr>
                          <th>결제수단</th>
                          <td>{settlekindDisplay}</td>
                        </tr>
                        <tr>
                          <th>결제금액</th>
                          <td>{nf(order.settleprice)} 원</td>
                        </tr>
                        <tr>
                          <th>결제일자</th>
                          <td>{order.regdt}</td>
                        </tr>
                        {order.settlekind === "BANK" && order.pg_provider === "kcp" && (
                          <>
                            <tr>
                              <th>은행명</th>
                              <td>{kcp?.bank_name}</td>
                            </tr>
                            <tr>
                              <th>현금영수증 거래번호</th>
                              <td>{kcp?.cash_no}</td>
                            </tr>
                            <tr>
                              <th>현금영수증 승인번호</th>
                              <td>{kcp?.cash_authno}</td>
                            </tr>
                          </>
                        )}
                        {order.settlekind === "CARD" && (
                          <tr>
                            <th>카드승인번호</th>
                            <td>{cardAuthNo}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-md-5">
                <div className="card shadow-none rounded-0" id="discount_info">
                  <div className="card-header text-white fw-bold bg-card">할인 정보</div>
                  <div className="card-body">
                    <dl>
                      {order.emoney > 0 && (
                        <>
                          <dt>포인트할인</dt>
                          <dd>{nf(order.emoney)} 원</dd>
                        </>
                      )}
                      {order.coupon > 0 && (
                        <>
                          <dt>쿠폰할인</dt>
                          <dd>{nf(order.coupon)} 원</dd>
                        </>
                      )}
                      {order.cash > 0 && (
                        <>
                          <dt>캐시할인</dt>
                          <dd>{nf(order.cash)} 원</dd>
                        </>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
