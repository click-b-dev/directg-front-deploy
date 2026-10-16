import { Fragment, useState } from "react";
import { openDeliveryTracking } from "@shared/lib/delivery-tracking";
import {
  useOrderDetail,
  useOrderLicence,
  useKcpRefund,
  useTossAdapterRefund,
  useTossRefund,
  useTosspayRefund,
  usePaycoRefund,
  usePaycoCancel,
  useNaverpayRefund,
  useOrderItemCancel,
  useOrderReject,
  useOrderResend,
  useTrackingRegister,
  useOrderMemoAdd,
  usePointRefund,
  useOrderRefund,
  usePaycoDetail,
  getOrderStatusLabel,
  getCheckoutStatusLabel,
  getSettleKindLabel,
  getShipmentStatusFullLabel,
  type OrderDetailSearch,
  type OrderDetailItem,
  type OrderDetailPointNexusItem,
  type OrderLicenceResponse,
  type OrderDetailSettleLog,
  type OrderDetailPaycoInfo,
  type OrderDetailPaycoPaymentDetail,
} from "@entities/order";

const nf = (n: number) => n.toLocaleString("en-US");

// 키확인 버튼 핸들러(mode + item_order_id).
type KeyCheckHandler = (mode: string, itemOrderId: string) => void;

// 주문취소 모달 대상(취소 버튼 클릭 시 채움).
type CancelModalItem = {
  ordno: string;
  product_name: string;
  order_system: string;
  delivery_type: string;
};

// legacy order_view.php Genba State switch (2=주문완료·3=환불완료 — #213 목록의 "완료"와 다름).
const GENBA_STATE_VIEW_LABEL: Record<string, string> = {
  "0": "품절",
  "1": "예약구매",
  "2": "주문완료",
  "3": "환불완료",
};

// legacy $pn_action_colors / $pn_status_colors.
const PN_ACTION_COLOR: Record<string, string> = {
  sell: "primary",
  book: "warning",
  confirm: "success",
  bookCancel: "secondary",
  cancel: "danger",
  reveal: "info",
};
const PN_STATUS_COLOR: Record<string, string> = {
  sold: "success",
  booked: "warning",
  confirmed: "success",
  canceled: "secondary",
  failed: "danger",
  pending_reveal: "info",
  cancel_pending: "warning",
  cancel_failed: "danger",
};

// legacy pc/_Admin_/order/order_view.php — 주문 상세(읽기전용 스코프 217a). 액션·모달·PG카드·메모폼 제외.
export const OrderDetailScreen = (search: OrderDetailSearch) => {
  const { data } = useOrderDetail(search);
  const licence = useOrderLicence();
  const kcpRefund = useKcpRefund();
  const tossAdapterRefund = useTossAdapterRefund();
  const tossRefund = useTossRefund();
  const tosspayRefund = useTosspayRefund();
  const paycoRefund = usePaycoRefund();
  const paycoCancel = usePaycoCancel();
  const naverpayRefund = useNaverpayRefund();
  const itemCancel = useOrderItemCancel();
  const orderReject = useOrderReject();
  const orderResend = useOrderResend();
  const trackingRegister = useTrackingRegister();
  const memoAdd = useOrderMemoAdd();
  const pointRefund = usePointRefund();
  const orderRefund = useOrderRefund();
  const paycoDetail = usePaycoDetail();
  const [licenceOpen, setLicenceOpen] = useState(false);
  const [paycoDetailOpen, setPaycoDetailOpen] = useState(false); // Payco 결제 상세정보 팝업
  const [cancelItem, setCancelItem] = useState<CancelModalItem | null>(null); // 주문취소 모달
  const [refundOpen, setRefundOpen] = useState(false); // 일반 toss 부분취소 모달
  const [tosspayRefundOpen, setTosspayRefundOpen] = useState(false); // 토스페이 부분취소 모달

  // 키확인 버튼: 모달 열고 조회(POST).
  const openLicence: KeyCheckHandler = (mode, itemOrderId) => {
    setLicenceOpen(true);
    licence.mutate({ mode, item_order_id: itemOrderId });
  };

  if (!data || !data.order) {
    return null;
  }

  const { order, items, address, logs, settle_log: settleLog, payco } = data;

  // legacy 누적 계산: total_price=Σprice, 취소요청(status 8)·취소완료(status 9) 건수/금액.
  const totalPrice = items.reduce((sum, it) => sum + it.price, 0);
  const cancelRequest = items.filter((it) => it.status === "8");
  const cancelFinish = items.filter((it) => it.status === "9");
  const cancelRequestPrice = cancelRequest.reduce((sum, it) => sum + it.price, 0);
  const cancelFinishPrice = cancelFinish.reduce((sum, it) => sum + it.price, 0);
  const hasCancel = cancelRequest.length > 0 || cancelFinish.length > 0;

  // 반려(order_reject): confirm 후 즉시 POST(모달 없음).
  const handleReject = (ordno: string) => {
    if (window.confirm("해당 취소요청 주문을 반려처리 하시겠습니까?")) {
      orderReject.mutate({
        settle_no: order.settle_no,
        ordno,
        payment_method: order.payment_method,
      });
    }
  };

  // 재발송(resend): confirm 후 POST.
  const handleResend = (ordno: string) => {
    if (window.confirm(`[${ordno}] 이 상품을 재발송(키발급 재시도)하시겠습니까?`)) {
      orderResend.mutate({ settle_no: order.settle_no, ordno });
    }
  };

  // 운송장 등록(register_tracking_no_item): confirm 후 POST. escw_yn은 settle_log, payment_method는 order.
  const handleTrackingRegister = (ordno: string, deliveryCode: string, trackingNo: string) => {
    if (window.confirm("운송장번호를 입력하시겠습니까?")) {
      trackingRegister.mutate({
        settle_no: order.settle_no,
        ordno,
        escw_yn: settleLog?.escw_yn ?? "",
        payment_method: order.payment_method,
        delivery_code: deliveryCode,
        tracking_no: trackingNo,
      });
    }
  };

  return (
    <>
      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    주문
                  </a>
                </li>
                <li className="breadcrumb-item active">주문내역 상세보기</li>
              </ol>
            </div>
            <h4 className="page-title">주문내역 상세보기</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 주문상품 정보 */}
      <div className="row">
        <div className="col-lg-12">
          <div className="card mb-0">
            <h5 className="card-header bg-secondary text-white font-14">주문상품 정보</h5>
            <div className="card-body p-1">
              <div className="table-responsive">
                <table className="table table-bordered table-sm mb-0">
                  <thead className="table-light font-13">
                    <tr>
                      <th className="text-center" style={{ width: "50px" }}>
                        선택
                      </th>
                      <th className="text-center" style={{ width: "80px" }}>
                        주문번호
                      </th>
                      <th className="text-center">상품정보</th>
                      <th className="text-center" style={{ width: "70px" }}>
                        적립
                      </th>
                      <th className="text-center" style={{ width: "90px" }}>
                        정상가
                      </th>
                      <th className="text-center" style={{ width: "90px" }}>
                        판매가
                      </th>
                      <th className="text-center" style={{ width: "90px" }}>
                        주문상태
                      </th>
                      <th className="text-center" style={{ width: "90px" }}>
                        수령상태
                      </th>
                      <th className="text-center" style={{ width: "90px" }}>
                        취소처리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-12">
                    {items.map((item, idx) => (
                      <OrderDetailItemRows
                        key={item.ordno}
                        item={item}
                        seq={idx + 1}
                        step={order.step}
                        onKeyCheck={openLicence}
                        onCancelClick={setCancelItem}
                        onReject={handleReject}
                        onResend={handleResend}
                        onTrackingRegister={handleTrackingRegister}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* 좌: 주문자/취소/결제 */}
        <div className="col-lg-4">
          <div className="card mb-3">
            <h5 className="card-header bg-secondary text-white font-14">주문자 정보</h5>
            <div className="card-body p-1">
              <table className="table table-bordered table-sm mb-0">
                <colgroup>
                  <col width="25%" />
                  <col width="*" />
                </colgroup>
                <tbody className="font-12">
                  <tr>
                    <th className="table-light">회원 고유번호</th>
                    <td>
                      <span className="text-start">{order.m_no}</span>
                    </td>
                  </tr>
                  <tr>
                    <th className="table-light">회원 ID</th>
                    <td>
                      <a
                        href={`/_Admin_/member/member_view.php?m_no=${order.m_no}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="text-start">{order.m_id}</span>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th className="table-light">주문경로</th>
                    <td>
                      <span className="text-start">
                        {order.is_mobile === "N" ? "PC" : "모바일"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th className="table-light">주문 IP</th>
                    <td>
                      <span className="text-start">{order.ip}</span>
                    </td>
                  </tr>
                  <tr>
                    <th className="table-light">주문 국가</th>
                    <td>
                      <span className="text-start">{order.country}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {hasCancel && (
            <div className="card mb-3">
              <h5 className="card-header bg-secondary text-white font-14">취소 정보</h5>
              <div className="card-body p-1">
                <table className="table table-bordered table-sm mb-0">
                  <colgroup>
                    <col width="25%" />
                    <col width="*" />
                  </colgroup>
                  <tbody className="font-12">
                    <tr>
                      <th className="table-light">취소요청</th>
                      <td>
                        {nf(cancelRequestPrice)} 원({cancelRequest.length} 건)
                      </td>
                    </tr>
                    <tr>
                      <th className="table-light">취소완료</th>
                      <td>
                        {nf(cancelFinishPrice)} 원 ({cancelFinish.length} 건)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="card mb-3">
            <h5 className="card-header bg-secondary text-white font-14 ">결제 정보</h5>
            <div className="card-body p-1">
              <div className="table-responsive">
                <table className="table table-sm table-bordered mb-0">
                  <tbody className="font-12">
                    <tr>
                      <th className="table-light">주문생성일</th>
                      <td className="text-start">{order.reg_date}</td>
                    </tr>
                    <tr>
                      <th className="table-light">결제번호</th>
                      <td className="text-start">{order.settle_no}</td>
                    </tr>
                    <tr>
                      <th className="table-light">결제PG</th>
                      <td className="text-start">{order.pg_provider}</td>
                    </tr>
                    <tr>
                      <th className="table-light">결제수단</th>
                      <td className="text-start">{getSettleKindLabel(order.payment_method)}</td>
                    </tr>
                    <tr>
                      <th className="table-light">총 주문금액 </th>
                      <td className="text-start">{nf(totalPrice)} 원</td>
                    </tr>
                    <tr>
                      <th className="table-light">총 할인금액</th>
                      <td className="text-start">
                        <span>{nf(order.use_emoney + order.use_cash + order.member_dc)} 원</span>
                        {/* 적립금반환(217g): DGKR+DG0000이면 결제취소+반환, 아니면 사용적립금 반환. use_emoney>0 조건. */}
                        {order.pg_provider === "DGKR" &&
                        order.payment_method === "DG0000" &&
                        order.use_emoney > 0 ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-dark btn-sm"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "결제를 취소하고 사용된 적립금을 반환(환불)처리 하시겠습니까?",
                                  )
                                ) {
                                  orderRefund.mutate({
                                    settle_no: order.settle_no,
                                    use_emoney: order.use_emoney,
                                  });
                                }
                              }}
                            >
                              결제취소+사용적립금 반환
                            </button>
                            <br />
                          </>
                        ) : order.use_emoney > 0 ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-dark btn-sm"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "해당 결제시 할인에 사용된 적립금을 반환(환불)처리 하시겠습니까?",
                                  )
                                ) {
                                  pointRefund.mutate({
                                    settle_no: order.settle_no,
                                    use_emoney: order.use_emoney,
                                  });
                                }
                              }}
                            >
                              사용적립금 반환
                            </button>
                            <br />
                          </>
                        ) : null}
                        <div>
                          (포인트 할인 {nf(order.use_emoney)} 원: + 캐시할인 {nf(order.use_cash)} 원
                          + 회원 즉시할인 {nf(order.member_dc)} 원)
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="table-light">최종 결제금액</th>
                      <td className="text-start">{nf(order.total_price)} 원</td>
                    </tr>
                    <tr>
                      <th className="table-light">결제상태</th>
                      <td>
                        <span className="badge bg-secondary font-12">
                          {getCheckoutStatusLabel(order.step)}
                        </span>
                      </td>
                    </tr>
                    {order.step !== "1" && (
                      <tr>
                        <th className="table-light">결제완료일자</th>
                        <td>{order.payment_date}</td>
                      </tr>
                    )}
                    {/* 아임포트 주문번호(217g): settle_log.imp_uid 있을 때만. */}
                    {settleLog && settleLog.imp_uid !== "" && (
                      <tr>
                        <th className="table-light">아임포트 주문번호</th>
                        <td>{settleLog.imp_uid}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {order.pg_provider === "kcp" && settleLog && (
            <KcpPaymentCard
              settleLog={settleLog}
              step={order.step}
              paymentMethod={order.payment_method}
              onRefund={() => {
                if (window.confirm("해당 KCP결제를 취소하시겠습니까?")) {
                  kcpRefund.mutate({
                    settle_no: order.settle_no,
                    mod_type: settleLog.escw_yn === "N" ? "STSC" : "STE2",
                    tno: settleLog.tno,
                  });
                }
              }}
            />
          )}

          {order.pg_provider === "toss" && settleLog && (
            <TossPaymentCard
              settleLog={settleLog}
              step={order.step}
              paymentMethod={order.payment_method}
              onAdapterRefund={() => {
                if (window.confirm("해당 토스 결제를 취소하시겠습니까?")) {
                  tossAdapterRefund.mutate({
                    settle_no: order.settle_no,
                    mod_type: "STSC",
                    tno: settleLog.tno,
                  });
                }
              }}
              onOpenRefundModal={() => setRefundOpen(true)}
            />
          )}

          {order.pg_provider === "toss_pay" && settleLog && (
            <TosspayPaymentCard
              settleLog={settleLog}
              step={order.step}
              onOpenRefundModal={() => setTosspayRefundOpen(true)}
            />
          )}

          {order.pg_provider === "payco" && payco && (
            <PaycoPaymentCard
              payco={payco}
              step={order.step}
              onDetailClick={() => {
                setPaycoDetailOpen(true);
                paycoDetail.mutate({
                  reserve_order_no: payco.reserve_order_no,
                  seller_order_reference_key: order.settle_no,
                });
              }}
              onRefund={() => {
                if (window.confirm("해당 PAYCO결제를 취소하시겠습니까?")) {
                  paycoRefund.mutate({
                    settle_no: order.settle_no,
                    order_no: payco.order_no,
                    cancel_total_amt: payco.total_payment_amt,
                    order_certify_key: payco.order_certify_key,
                  });
                }
              }}
              onCancel={() => {
                if (window.confirm("해당 PAYCO결제를 취소하시겠습니까?")) {
                  paycoCancel.mutate({
                    settle_no: order.settle_no,
                    order_no: payco.order_no,
                    cancel_total_amt: payco.total_payment_amt,
                    order_certify_key: payco.order_certify_key,
                  });
                }
              }}
            />
          )}

          {order.pg_provider === "naverpay" && settleLog && (
            <NaverpayPaymentCard
              settleLog={settleLog}
              step={order.step}
              paymentDate={order.payment_date}
              onRefund={() => {
                if (window.confirm("해당 네이버페이 결제를 취소하시겠습니까?")) {
                  naverpayRefund.mutate({
                    settle_no: order.settle_no,
                    payment_id: settleLog.payment_id,
                    cancel_amount: settleLog.total_pay_amount,
                  });
                }
              }}
            />
          )}
        </div>

        {/* 우: 배송지/히스토리 */}
        <div className="col-lg-8">
          {address && address.zipcode !== "" && (
            <div className="card mb-2">
              <h5 className="card-header bg-secondary text-white font-14">배송지 정보</h5>
              <div className="card-body p-1">
                <table className="table table-bordered table-sm mb-0">
                  <thead className="table-light font-13">
                    <tr>
                      <th className="text-center" style={{ width: "150px" }}>
                        우편번호
                      </th>
                      <th className="text-center">주소</th>
                      <th className="text-center" style={{ width: "100px" }}>
                        주문자
                      </th>
                      <th className="text-center" style={{ width: "100px" }}>
                        휴대폰번호
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-12">
                    <tr>
                      <td className="text-center">{address.zipcode}</td>
                      <td className="text-start">
                        {address.address} {address.address_detail}
                      </td>
                      <td className="text-center">{address.name}</td>
                      <td className="text-center">{address.tel}</td>
                    </tr>
                    <tr>
                      <th className="bg-light text-center">배송요청 메시지</th>
                      <td colSpan={3}>{address.msg}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="card mb-2">
            <h5 className="card-header bg-secondary text-white font-14">주문 히스토리</h5>
            <div className="card-body p-1">
              <table className="table table-bordered table-sm mb-0">
                <thead className="table-light font-13">
                  <tr>
                    <th className="text-center">주문번호</th>
                    <th className="text-center">처리자</th>
                    <th className="text-center">처리일자</th>
                    <th className="text-center">내용</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {logs.map((log, idx) => (
                    <tr key={`${log.ordno}-${idx}`}>
                      <td>{log.ordno}</td>
                      <td>{log.admin_id}</td>
                      <td>{log.reg_date}</td>
                      <td>{log.memo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-footer">
              <OrderMemoForm
                onSubmit={(memoGubun, ordno, message) => {
                  if (window.confirm("메모를 기록하겠습니까")) {
                    // legacy: 성공 시 reload 안 함(quirk). 목록 즉시 미갱신.
                    memoAdd.mutate({
                      settle_no: order.settle_no,
                      memo_gubun: memoGubun,
                      ordno,
                      message,
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <OrderLicenceModal
        open={licenceOpen}
        onClose={() => setLicenceOpen(false)}
        loading={licence.isPending}
        result={licence.data ?? null}
      />

      {order.pg_provider === "payco" && (
        <PaycoDetailModal
          open={paycoDetailOpen}
          onClose={() => setPaycoDetailOpen(false)}
          loading={paycoDetail.isPending}
          detail={paycoDetail.data?.detail ?? null}
        />
      )}

      <OrderCancelModal
        item={cancelItem}
        onClose={() => setCancelItem(null)}
        onSubmit={(message) => {
          if (cancelItem) {
            itemCancel.mutate({
              settle_no: order.settle_no,
              ordno: cancelItem.ordno,
              delivery_type: cancelItem.delivery_type,
              order_system: cancelItem.order_system,
              message,
            });
            setCancelItem(null);
          }
        }}
      />

      {order.pg_provider === "toss" && settleLog && (
        <TossRefundModal
          open={refundOpen}
          onClose={() => setRefundOpen(false)}
          settleNo={order.settle_no}
          paymentMethodLabel={getSettleKindLabel(order.payment_method)}
          totalAmount={settleLog.total_amount}
          balanceAmount={settleLog.balance_amount}
          onRefund={(cancelAmount) => {
            if (window.confirm("해당 토스 결제를 취소하시겠습니까?")) {
              tossRefund.mutate({
                settle_no: order.settle_no,
                payment_key: settleLog.payment_key,
                cancel_amount: cancelAmount,
              });
              setRefundOpen(false);
            }
          }}
        />
      )}

      {order.pg_provider === "toss_pay" && settleLog && (
        <TosspayRefundModal
          open={tosspayRefundOpen}
          onClose={() => setTosspayRefundOpen(false)}
          settleNo={order.settle_no}
          paymentMethodLabel={getSettleKindLabel(order.payment_method)}
          amount={settleLog.amount}
          paidAmount={settleLog.paid_amount}
          onRefund={(cancelAmount) => {
            if (window.confirm("해당 토스페이 결제를 취소하시겠습니까?")) {
              tosspayRefund.mutate({
                settle_no: order.settle_no,
                pay_token: settleLog.pay_token,
                cancel_amount: cancelAmount,
              });
              setTosspayRefundOpen(false);
            }
          }}
        />
      )}
    </>
  );
};

// 주문상품 표: 항목 요약 행 + 상세 행(디지털 발송현황 / 실물 배송현황). 키확인 버튼 포함(217b).
const OrderDetailItemRows = ({
  item,
  seq,
  step,
  onKeyCheck,
  onCancelClick,
  onReject,
  onResend,
  onTrackingRegister,
}: {
  item: OrderDetailItem;
  seq: number;
  step: string;
  onKeyCheck: KeyCheckHandler;
  onCancelClick: (item: CancelModalItem) => void;
  onReject: (ordno: string) => void;
  onResend: (ordno: string) => void;
  onTrackingRegister: (ordno: string, deliveryCode: string, trackingNo: string) => void;
}) => {
  const isDigital = item.delivery_type === "1" || item.delivery_type === "3";
  const isPhysical = item.delivery_type === "2" || item.delivery_type === "3";
  const statusDanger = item.status === "8" || item.status === "9";

  return (
    <>
      <tr>
        <td className="text-center">{seq}</td>
        <td className="text-center">{item.ordno}</td>
        <td>
          <a
            href={`/_Admin_/goods/goods_option_list.php?search_key=search_product_code&search_value=${item.product_code}`}
            target="_blank"
            rel="noreferrer"
          >
            {item.product_code}
            <p className="mb-0">{item.product_name}</p>
          </a>
        </td>
        <td className="text-end">{nf(item.repay)}</td>
        <td className="text-end">{nf(item.goods_price)} 원</td>
        <td className="text-end">{nf(item.price)} 원</td>
        <td className={`text-center ${statusDanger ? "text-danger fw-bold" : ""}`}>
          {getOrderStatusLabel(item.status)}
        </td>
        <td className="text-center">
          {item.is_actv === "1" ? "수령완료" : "미수령"}
          {item.is_actv === "1" && item.completion_date !== "" && (
            <>
              <br />
              <small>({item.completion_date})</small>
            </>
          )}
        </td>
        {/* 취소처리(217d): 취소(status≠9)·반려(status==8). 재발송은 217e 후속. */}
        <td className="text-center">
          {item.status !== "9" && (
            <button
              type="button"
              className="btn btn-danger btn-sm shadow-none"
              onClick={() =>
                onCancelClick({
                  ordno: item.ordno,
                  product_name: item.product_name,
                  order_system: item.order_system,
                  delivery_type: item.delivery_type,
                })
              }
            >
              취소
            </button>
          )}
          {item.status === "8" && (
            <>
              <hr />
              <button
                type="button"
                className="btn btn-success btn-sm shadow-none"
                onClick={() => onReject(item.ordno)}
              >
                반려
              </button>
            </>
          )}
          {/* 재발송(217e): step==2 && 디지털(1·3) && send_status==fail && status==1 */}
          {step === "2" &&
            (item.delivery_type === "1" || item.delivery_type === "3") &&
            item.send_status === "fail" &&
            item.status === "1" && (
              <>
                <hr />
                <button
                  type="button"
                  className="btn btn-warning btn-sm shadow-none"
                  onClick={() => onResend(item.ordno)}
                >
                  재발송
                </button>
              </>
            )}
        </td>
      </tr>
      <tr>
        <td colSpan={9}>
          <table className="table table-bordered table-sm">
            <tbody className="font-12">
              {isDigital && (
                <tr>
                  <th className="text-center bg-black text-white">디지털상품</th>
                  <td>
                    <DigitalFulfillmentTable item={item} onKeyCheck={onKeyCheck} />
                  </td>
                </tr>
              )}
              {isPhysical && (
                <tr>
                  <th className="text-center bg-black text-white">실물상품</th>
                  <td>
                    <PhysicalDeliveryTable item={item} onTrackingRegister={onTrackingRegister} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </td>
      </tr>
    </>
  );
};

// 디지털 발송현황(Asset/Ztorm/Genba/Vaultn/PointNexus). Asset·PointNexus 행에 키확인 버튼(217b).
const DigitalFulfillmentTable = ({
  item,
  onKeyCheck,
}: {
  item: OrderDetailItem;
  onKeyCheck: KeyCheckHandler;
}) => (
  <table className="table table-bordered table-sm mb-0">
    <colgroup>
      <col width="6%" />
      <col width="19%" />
      <col width="*" />
      <col width="10%" />
      <col width="10%" />
      <col width="19%" />
      <col width="6%" />
      <col width="7%" />
    </colgroup>
    <thead className="table-light font-12">
      <tr>
        <th className="text-center">주문시스템</th>
        <th className="text-center">Item ID</th>
        <th className="text-center">Item Name</th>
        <th className="text-center">Item Platform</th>
        <th className="text-center">Item Publisher</th>
        <th className="text-center">Item Order ID</th>
        <th className="text-center">Status</th>
        <th className="text-center">키확인</th>
      </tr>
    </thead>
    <tbody>
      {item.asset.map((a, i) => (
        <tr key={`asset-${i}`}>
          <td className="text-center">Asset</td>
          <td className="text-center">{a.asset_id}</td>
          <td>{a.asset_name}</td>
          <td className="text-center">{a.asset_platform}</td>
          <td className="text-center">{a.asset_publisher}</td>
          <td className="text-center">{a.reserve_id}</td>
          <td></td>
          <td className="text-center">
            <button
              type="button"
              className="btn btn-info btn-sm shadow-none"
              onClick={() => onKeyCheck("getAssetLicence", a.reserve_id)}
            >
              키 확인
            </button>
          </td>
        </tr>
      ))}
      {item.ztorm.map((z, i) => (
        <tr key={`ztorm-${i}`}>
          <td className="text-center">Ztorm</td>
          <td className="text-center">{z.ztorm_item_id}</td>
          <td>{z.ztorm_item_name}</td>
          <td className="text-center">{z.ztorm_publisher}</td>
          <td className="text-center">{z.ztorm_platform}</td>
          <td className="text-center">
            <a
              href={`https://hub.exertisztorm.net/hub/orders/list?id=&retailer_order=&retailer_customer=&customer_product=${z.customer_product_id}&after=&before=`}
              target="_BLANK"
              rel="noreferrer"
            >
              {z.customer_product_id}
            </a>
          </td>
          <td></td>
          <td></td>
        </tr>
      ))}
      {item.genba.map((g, i) => (
        <tr key={`genba-${i}`}>
          <td className="text-center">Genba</td>
          <td className="text-center">{g.sku}</td>
          <td>{g.name}</td>
          <td className="text-center">{g.platform}</td>
          <td className="text-center">{g.publisher}</td>
          <td className="text-center">
            <a
              href={`/_Admin_/order/genba_order_view.php?search_type=item_order_id&search_value=${encodeURIComponent(g.id)}`}
              target="_blank"
              rel="noreferrer"
              title="Genba 주문조회"
            >
              {g.id}
            </a>
            {g.client_transaction_id !== "" && (
              <>
                <br />
                <small>
                  <a
                    href={`/_Admin_/order/genba_order_view.php?search_type=client_transaction_id&search_value=${encodeURIComponent(g.client_transaction_id)}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Genba 주문조회"
                  >
                    ({g.client_transaction_id})
                  </a>
                </small>
              </>
            )}
          </td>
          <td className="text-center">{GENBA_STATE_VIEW_LABEL[g.state] ?? ""}</td>
          <td></td>
        </tr>
      ))}
      {item.vaultn.map((v, i) => (
        <tr key={`vaultn-${i}`}>
          <td className="text-center">Vaultn</td>
          <td className="text-center">{v.sku}</td>
          <td>{v.name}</td>
          <td className="text-center">{v.provider}</td>
          <td className="text-center">{v.publisher_name}</td>
          <td className="text-center">{v.order_id}</td>
          <td className="text-center">{v.status}</td>
          <td></td>
        </tr>
      ))}
      {item.pointnexus.map((p, i) => (
        <PointNexusRow
          key={`pn-${i}`}
          p={p}
          isActv={item.is_actv}
          completionDate={item.completion_date}
          onKeyCheck={onKeyCheck}
        />
      ))}
    </tbody>
  </table>
);

const PointNexusRow = ({
  p,
  isActv,
  completionDate,
  onKeyCheck,
}: {
  p: OrderDetailPointNexusItem;
  isActv: string;
  completionDate: string;
  onKeyCheck: KeyCheckHandler;
}) => {
  const actColor = PN_ACTION_COLOR[p.action] ?? "secondary";
  const stColor = PN_STATUS_COLOR[p.status] ?? "light";
  const isChild = p.parent_operation_id !== "";
  return (
    <tr>
      <td className="text-center">
        PointNexus
        <br />
        <span className={`badge bg-${actColor}`}>{p.action || "—"}</span>
      </td>
      <td className="text-center">{p.product_id}</td>
      <td>{p.name}</td>
      <td className="text-center">{p.license_platform}</td>
      <td className="text-center"></td>
      <td className="text-center">
        <a
          href={`/_Admin_/goods/pointnexus/pointnexus_operation.php?id=${encodeURIComponent(p.operation_id)}&mode=${encodeURIComponent(p.mode)}`}
          target="_blank"
          rel="noreferrer"
          title="PointNexus API 실시간 조회"
        >
          {p.operation_id}
        </a>
        {isChild && (
          <>
            <br />
            <small className="text-muted">
              parent:{" "}
              <a
                href={`/_Admin_/goods/pointnexus/pointnexus_operation.php?id=${encodeURIComponent(p.parent_operation_id)}&mode=${encodeURIComponent(p.mode)}`}
                target="_blank"
                rel="noreferrer"
                title="원본 op 조회"
              >
                {p.parent_operation_id}
              </a>
            </small>
          </>
        )}
      </td>
      <td className="text-center">
        <span className={`badge bg-${stColor}`}>{p.status}</span>
        {isActv === "1" && completionDate !== "" && (
          <>
            <br />
            <small className="text-muted" style={{ fontSize: "10px" }}>
              수령일: {completionDate}
            </small>
          </>
        )}
      </td>
      <td className="text-center">
        <button
          type="button"
          className="btn btn-info btn-sm shadow-none"
          onClick={() => onKeyCheck("getPointNexusLicence", p.idx)}
        >
          키 확인
        </button>
      </td>
    </tr>
  );
};

// 실물 배송현황(217e: 배송조회 버튼 + 운송장 등록 폼 복원).
const PhysicalDeliveryTable = ({
  item,
  onTrackingRegister,
}: {
  item: OrderDetailItem;
  onTrackingRegister: (ordno: string, deliveryCode: string, trackingNo: string) => void;
}) => (
  <table className="table table-bordered table-sm">
    <thead className="table-light font-12">
      <tr>
        <th className="text-center">상품정보</th>
        <th className="text-center">배송상태</th>
        <th className="text-center">운송장번호</th>
        <th className="text-center">주문일자</th>
        <th className="text-center">배송시작일자</th>
        <th className="text-center">배송완료일자</th>
        <th className="text-center">구매확정일자</th>
        <th className="text-center">배송조회</th>
      </tr>
    </thead>
    <tbody>
      {item.delivery.map((d, i) => {
        const shipDanger = d.shipment_status === "8" || d.shipment_status === "9";
        return (
          <Fragment key={`delivery-${i}`}>
            <tr>
              <td className="text-start">
                [{d.model_code}] {d.model_name}
              </td>
              <td className={`text-center ${shipDanger ? "text-danger" : ""}`}>
                {getShipmentStatusFullLabel(d.shipment_status)}
              </td>
              <td className="text-center">
                {d.tracking_number}
                <br />({d.shipment_company_name})
              </td>
              <td className="text-center">{item.order_date}</td>
              <td className="text-center">{d.shipped_date}</td>
              <td className="text-center">{d.estimated_delivery_date}</td>
              <td className="text-center">{d.actual_delivery_date}</td>
              <td className="text-center">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary shadow-none font-12"
                  onClick={() =>
                    openDeliveryTracking(d.tracking_number.replace(/-/g, ""), d.delivery_code)
                  }
                >
                  배송조회
                </button>
              </td>
            </tr>
            <tr>
              <td className="bg-secondary text-white font-14">운송장 정보</td>
              <td colSpan={7}>
                <TrackingRegisterForm
                  onSubmit={(deliveryCode, trackingNo) =>
                    onTrackingRegister(item.ordno, deliveryCode, trackingNo)
                  }
                />
              </td>
            </tr>
          </Fragment>
        );
      })}
    </tbody>
  </table>
);

// legacy deliveryFrm — 운송장 등록(delivery_code select + tracking_no).
const TrackingRegisterForm = ({
  onSubmit,
}: {
  onSubmit: (deliveryCode: string, trackingNo: string) => void;
}) => {
  const [deliveryCode, setDeliveryCode] = useState("001");
  const [trackingNo, setTrackingNo] = useState("");
  return (
    <div className="input-group">
      <select
        className="form-select bg-light"
        value={deliveryCode}
        onChange={(e) => setDeliveryCode(e.target.value)}
      >
        <option value="001">CJ</option>
        <option value="002">로젠</option>
      </select>
      <input
        type="text"
        className="form-control w-75"
        placeholder="운송장번호"
        value={trackingNo}
        onChange={(e) => setTrackingNo(e.target.value)}
      />
      <button
        className="btn btn-dark shadow-none"
        type="button"
        onClick={() => onSubmit(deliveryCode, trackingNo)}
      >
        등록
      </button>
    </div>
  );
};

// legacy KCP bill_url(payment_method별 영수증 URL).
const kcpBillUrl = (paymentMethod: string, s: OrderDetailSettleLog): string => {
  const base = `tno=${s.tno}&order_no=${s.settle_no}&trade_mony=${s.amount}`;
  switch (paymentMethod) {
    case "SC0010":
      return `https://partner.kcp.co.kr/bill/card?cmd=card_bill&${base}`;
    case "SC0030":
      return `https://partner.kcp.co.kr/bill/acnt?cmd=acnt_bill&${base}`;
    case "SC0040":
      return `https://partner.kcp.co.kr/bill/vcnt?cmd=vcnt_bill&${base}`;
    case "SC0060":
      return `https://partner.kcp.co.kr/bill/mcash?cmd=mcash_bill&${base}`;
    default:
      return "";
  }
};

// legacy va_date(YmdHis) → 'YYYY-MM-DD HH:mm:ss' (substr 분해 그대로).
const fmtVaDate = (v: string) =>
  `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)} ${v.slice(8, 10)}:${v.slice(10, 12)}:${v.slice(12, 14)}`;

// legacy order_view.php KCP 결제정보 카드(pg_provider=="kcp"). 217c-1.
const KcpPaymentCard = ({
  settleLog: s,
  step,
  paymentMethod,
  onRefund,
}: {
  settleLog: OrderDetailSettleLog;
  step: string;
  paymentMethod: string;
  onRefund: () => void;
}) => {
  const billUrl = kcpBillUrl(paymentMethod, s);
  return (
    <div className="card mb-3">
      <h5 className="card-header bg-secondary text-white font-14">KCP 결제정보</h5>
      <div className="card-body p-1">
        <table className="table table-bordered table-sm mb-0">
          <colgroup>
            <col width="30%" />
            <col width="*" />
          </colgroup>
          <tbody className="font-13">
            <tr>
              <th className="table-light">KCP 거래 고유번호</th>
              <td>{s.tno}</td>
            </tr>
            <tr>
              <th className="table-light">KCP 상태코드</th>
              <td>{s.tx_cd}</td>
            </tr>
            <tr>
              <th className="table-light">결제수단명</th>
              <td>{s.pay_method}</td>
            </tr>
            <tr>
              <th className="table-light">에스크로여부</th>
              <td>{s.escw_yn}</td>
            </tr>

            {paymentMethod === "SC0010" && (
              <>
                {s.isp_issuer_nm !== "" && (
                  <tr>
                    <th className="table-light">ISP 계열 카드 발급 사 명</th>
                    <td>{s.isp_issuer_nm}</td>
                  </tr>
                )}
                <tr>
                  <th className="table-light">카드명</th>
                  <td>
                    {s.card_name}{" "}
                    {s.card_bin_type_01 !== "" && (
                      <span className="badge bg-secondary">
                        {s.card_bin_type_01 === "0" ? "개인" : "법인"}
                      </span>
                    )}
                    {s.card_bin_type_02 !== "" && (
                      <span className="badge bg-secondary">
                        {s.card_bin_type_02 === "0" ? "신용카드" : "체크카드"}
                      </span>
                    )}{" "}
                  </td>
                </tr>
                <tr>
                  <th className="table-light">카드번호</th>
                  <td>{s.card_no}</td>
                </tr>
                <tr>
                  <th className="table-light">신용카드 결제금액</th>
                  <td>{nf(s.card_mny)}</td>
                </tr>
                {s.coupon_mny > 0 && (
                  <tr>
                    <th className="table-light">쿠폰 할인 금액</th>
                    <td>{nf(s.coupon_mny)}</td>
                  </tr>
                )}
                {s.payco_point_mny > 0 && (
                  <tr>
                    <th className="table-light">페이코 포인트 사용 금액</th>
                    <td>{nf(s.payco_point_mny)}</td>
                  </tr>
                )}
                <tr>
                  <th className="table-light">결제승인번호</th>
                  <td>{s.app_no}</td>
                </tr>
                <tr>
                  <th className="table-light">결제승인시간</th>
                  <td>{s.app_time}</td>
                </tr>
                <tr>
                  <th className="table-light">결제금액</th>
                  <td>{nf(s.amount)}</td>
                </tr>
              </>
            )}

            {paymentMethod === "SC0030" && (
              <>
                <tr>
                  <th className="table-light">은행명</th>
                  <td>{s.bank_name}</td>
                </tr>
                <tr>
                  <th className="table-light">은행코드</th>
                  <td>{s.bank_code}</td>
                </tr>
                <tr>
                  <th className="table-light">계좌이체 결제 금액</th>
                  <td>{s.bk_mny}</td>
                </tr>
                <tr>
                  <th className="table-light">현금영수증 승인번호</th>
                  <td>{s.cash_authno}</td>
                </tr>
                <tr>
                  <th className="table-light">현금영수증 거래번호</th>
                  <td>{s.cash_no}</td>
                </tr>
                <tr>
                  <th className="table-light">계좌이체 결제시각</th>
                  <td>{s.app_time}</td>
                </tr>
              </>
            )}

            {paymentMethod === "SC0040" && (
              <>
                {(step === "1" || step === "8") && (
                  <tr>
                    <th className="table-light">가상계좌 취소</th>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm shadow-none"
                        onClick={onRefund}
                      >
                        계좌반납
                      </button>
                    </td>
                  </tr>
                )}
                <tr>
                  <th className="table-light">주문자명</th>
                  <td>{s.ipgm_name}</td>
                </tr>
                <tr>
                  <th className="table-light">은행명</th>
                  <td>{s.bank_name}</td>
                </tr>
                <tr>
                  <th className="table-light">가상계좌번호</th>
                  <td>{s.account}</td>
                </tr>
                <tr>
                  <th className="table-light">입금할 계좌 입금주</th>
                  <td>{s.depositor}</td>
                </tr>
                <tr>
                  <th className="table-light">가상계좌 입금예정금액</th>
                  <td>{nf(s.amount)}</td>
                </tr>
                <tr>
                  <th className="table-light">가상계좌 입금마감일자</th>
                  <td>{fmtVaDate(s.va_date)}</td>
                </tr>
                <tr>
                  <th className="table-light">가상계좌 입금 금액</th>
                  <td>{s.ipgm_mnyx}</td>
                </tr>
                <tr>
                  <th className="table-light">가상계좌에 입금된 금액합계</th>
                  <td>{s.totl_mnyx}</td>
                </tr>
                <tr>
                  <th className="table-light">가상계좌 입금 시각</th>
                  <td>{s.ipgm_time}</td>
                </tr>
                <tr>
                  {/* legacy 버그: $settle_log['bank_code '](trailing space) → 항상 빈값. 그대로 이식. */}
                  <th className="table-light">가상계좌 은행코드</th>
                  <td></td>
                </tr>
                <tr>
                  <th className="table-light">입금된 가상계좌번호</th>
                  <td>{s.account}</td>
                </tr>
                <tr>
                  <th className="table-light">가상계좌 입금 통보 아이디</th>
                  <td>{s.noti_id}</td>
                </tr>
                <tr>
                  <th className="table-light">가상계좌 입금 구분코드</th>
                  <td>{s.op_cd}</td>
                </tr>
                <tr>
                  <th className="table-light">가상계좌 입금자명</th>
                  <td>{s.remitter}</td>
                </tr>
                <tr>
                  <th className="table-light">현금영수증 승인번호</th>
                  <td>{s.cash_a_no}</td>
                </tr>
                <tr>
                  <th className="table-light">현금영수증 거래번호</th>
                  <td>{s.cash_no}</td>
                </tr>
              </>
            )}

            {paymentMethod === "SC0060" && (
              <>
                <tr>
                  <th className="table-light">통신사 코드</th>
                  <td>{s.commid}</td>
                </tr>
                <tr>
                  <th className="table-light">휴대폰 번호</th>
                  <td>{s.mobile_no}</td>
                </tr>
                <tr>
                  <th className="table-light">실물/컨텐츠 구분</th>
                  <td>{s.van_id}</td>
                </tr>
              </>
            )}

            <tr>
              <th className="table-light">결제 건의 부분취소 가능 유무</th>
              <td>{s.partcanc_yn}</td>
            </tr>
            {step === "2" && (
              <tr>
                <th className="table-light">결제취소</th>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm shadow-none"
                    onClick={onRefund}
                  >
                    결제취소
                  </button>
                </td>
              </tr>
            )}
            <tr>
              <th className="table-light">거래영수증</th>
              <td>
                <a
                  className="btn btn-secondary shadow-none btn-sm"
                  href={billUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  가맹점용 영수증 보기
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// legacy order_view.php 토스 결제정보 카드(pg_provider=="toss"). 217c-2.
const TossPaymentCard = ({
  settleLog: s,
  step,
  paymentMethod,
  onAdapterRefund,
  onOpenRefundModal,
}: {
  settleLog: OrderDetailSettleLog;
  step: string;
  paymentMethod: string;
  onAdapterRefund: () => void;
  onOpenRefundModal: () => void;
}) => {
  // toss_bank(계좌이체) 변형.
  if (paymentMethod === "toss_bank") {
    const billUrl = `https://dashboard.tosspayments.com/receipt/mids/directg/orders/${s.settle_no}/cash-receipt?ref=PX`;
    return (
      <div className="card mb-3">
        <h5 className="card-header bg-secondary text-white font-14">토스 결제정보</h5>
        <div className="card-body p-1">
          <table className="table table-bordered table-sm mb-0">
            <colgroup>
              <col width="30%" />
              <col width="*" />
            </colgroup>
            <tbody className="font-13">
              <tr>
                <th className="table-light">은행명</th>
                <td>{s.bank_name}</td>
              </tr>
              <tr>
                <th className="table-light">은행코드</th>
                <td>{s.bank_code}</td>
              </tr>
              {s.coupon_mny > 0 && (
                <tr>
                  <th className="table-light">즉시할인 금액</th>
                  <td>{nf(s.coupon_mny)} 원</td>
                </tr>
              )}
              <tr>
                <th className="table-light">계좌이체 결제 금액</th>
                <td>{nf(Number(s.bk_mny))} 원</td>
              </tr>
              <tr>
                <th className="table-light">현금영수증 승인번호</th>
                <td>{s.cash_authno}</td>
              </tr>
              <tr>
                <th className="table-light">현금영수증 거래번호</th>
                <td>{s.cash_no}</td>
              </tr>
              <tr>
                <th className="table-light">계좌이체 결제시각</th>
                <td>{s.app_time}</td>
              </tr>
              <tr>
                <th className="table-light">tno</th>
                <td>{s.tno}</td>
              </tr>
              <tr>
                <th className="table-light">에스크로 여부</th>
                <td>{s.escw_yn}</td>
              </tr>
              {step === "2" && (
                <tr>
                  <th className="table-light">결제취소</th>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm shadow-none"
                      onClick={onAdapterRefund}
                    >
                      결제취소
                    </button>
                  </td>
                </tr>
              )}
              <tr>
                <th className="table-light">거래영수증</th>
                <td>
                  <a
                    className="btn btn-secondary shadow-none btn-sm"
                    href={billUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    가맹점용 현금영수증 보기
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  // 일반 toss 변형.
  return (
    <div className="card mb-3">
      <h5 className="card-header bg-secondary text-white font-14">토스 결제정보</h5>
      <div className="card-body p-1">
        <table className="table table-bordered table-sm mb-0">
          <colgroup>
            <col width="30%" />
            <col width="*" />
          </colgroup>
          <tbody className="font-13">
            <tr>
              <th className="table-light">결제수단</th>
              <td>{s.method}</td>
            </tr>
            <tr>
              <th className="table-light">총 결제금액</th>
              <td>{nf(s.total_amount)}</td>
            </tr>
            {s.coupon_mny > 0 && (
              <tr>
                <th className="table-light">즉시할인 금액</th>
                <td>{nf(s.ba)} 원</td>
              </tr>
            )}
            <tr>
              <th className="table-light">취소 가능금액</th>
              <td>{nf(s.balance_amount)}</td>
            </tr>
            <tr>
              <th className="table-light">결제 시간</th>
              <td>{s.requested_at}</td>
            </tr>
            <tr>
              <th className="table-light">승인 시간</th>
              <td>{s.approved_at}</td>
            </tr>
            {step === "2" && (
              <tr>
                <th className="table-light">결제취소</th>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm shadow-none"
                    onClick={onOpenRefundModal}
                  >
                    결제취소
                  </button>
                </td>
              </tr>
            )}
            <tr>
              <th className="table-light">거래영수증</th>
              <td>
                <a
                  className="btn btn-secondary shadow-none btn-sm"
                  href=""
                  target="_blank"
                  rel="noreferrer"
                >
                  가맹점용 현금영수증 보기
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// legacy #order-refund-modal — 일반 toss 부분취소(React 제어). 217c-2.
const TossRefundModal = ({
  open,
  onClose,
  settleNo,
  paymentMethodLabel,
  totalAmount,
  balanceAmount,
  onRefund,
}: {
  open: boolean;
  onClose: () => void;
  settleNo: string;
  paymentMethodLabel: string;
  totalAmount: number;
  balanceAmount: number;
  onRefund: (cancelAmount: string) => void;
}) => {
  const [cancelAmount, setCancelAmount] = useState("");
  if (!open) {
    return null;
  }
  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-hidden="false">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header modal-colored-header bg-danger">
              <h4 className="modal-title">결제취소</h4>
              <button type="button" className="btn-close" aria-hidden="true" onClick={onClose} />
            </div>
            <div className="modal-body">
              <div className="form-group row mb-2">
                <label className="col-sm-4 control-label">결제번호</label>
                <div className="col-sm-8">{settleNo}</div>
              </div>
              <div className="form-group row mb-2">
                <label className="col-sm-4 control-label">결제수단</label>
                <div className="col-sm-8">{paymentMethodLabel}</div>
              </div>
              <div className="form-group row mb-2">
                <label className="col-sm-4 control-label">결제금액</label>
                <div className="col-sm-8">{nf(totalAmount)} 원</div>
              </div>
              <div className="form-group row mb-2">
                <label className="col-sm-4 control-label">취소가능금액</label>
                <div className="col-sm-8">{nf(balanceAmount)} 원</div>
              </div>
              <div className="form-group row mb-2">
                <label className="col-sm-4 control-label">
                  취소금액
                  <br />
                  (입력하지 않으면 전액)
                </label>
                <div className="col-sm-8">
                  <input
                    type="text"
                    className="form-control"
                    id="cancelAmount"
                    name="cancelAmount"
                    value={cancelAmount}
                    onChange={(e) => setCancelAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger shadow-none"
                onClick={() => onRefund(cancelAmount)}
              >
                결제 취소
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
};

// legacy 토스페이 payMethod switch.
const TOSSPAY_PAY_METHOD_LABEL: Record<string, string> = {
  TOSS_MONEY: "토스머니",
  CARD: "카드",
  TOSSPAY_MONEY: "토스페이머니",
  ACCOUNT: "ACCOUNT",
  RESELLER_CARD: "RESELLER_CARD",
  BNPL: "BNPL",
};

// legacy order_view.php 토스페이 결제정보 카드(pg_provider=="toss_pay"). 217c-3.
const TosspayPaymentCard = ({
  settleLog: s,
  step,
  onOpenRefundModal,
}: {
  settleLog: OrderDetailSettleLog;
  step: string;
  onOpenRefundModal: () => void;
}) => (
  <div className="card mb-3">
    <h5 className="card-header bg-secondary text-white font-14">토스페이 결제정보</h5>
    <div className="card-body p-1">
      <table className="table table-bordered table-sm mb-0">
        <colgroup>
          <col width="35%" />
          <col width="*" />
        </colgroup>
        <tbody className="font-13">
          <tr>
            <th className="table-light">결제수단</th>
            <td>{TOSSPAY_PAY_METHOD_LABEL[s.pay_method] ?? ""}</td>
          </tr>
          <tr>
            <th className="table-light">총 결제금액</th>
            <td>{nf(s.amount)}</td>
          </tr>
          <tr>
            <th className="table-light">할인 금액</th>
            <td>{nf(s.discounted_amount)} 원</td>
          </tr>
          <tr>
            <th className="table-light">취소 가능금액</th>
            <td>{nf(s.paid_amount)}</td>
          </tr>
          <tr>
            <th className="table-light">결제완료처리 시간</th>
            <td>{s.paid_ts}</td>
          </tr>
          {step === "2" && (
            <tr>
              <th className="table-light">결제취소</th>
              <td>
                <button
                  type="button"
                  className="btn btn-danger btn-sm shadow-none"
                  onClick={onOpenRefundModal}
                >
                  결제취소
                </button>
              </td>
            </tr>
          )}
          <tr>
            <th className="table-light">거래영수증</th>
            <td>
              <a
                className="btn btn-secondary shadow-none btn-sm"
                href=""
                target="_blank"
                rel="noreferrer"
              >
                가맹점용 현금영수증 보기
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

// legacy #order-tosspay-refund-modal — 토스페이 부분취소(React 제어). 217c-3.
const TosspayRefundModal = ({
  open,
  onClose,
  settleNo,
  paymentMethodLabel,
  amount,
  paidAmount,
  onRefund,
}: {
  open: boolean;
  onClose: () => void;
  settleNo: string;
  paymentMethodLabel: string;
  amount: number;
  paidAmount: number;
  onRefund: (cancelAmount: string) => void;
}) => {
  const [cancelAmount, setCancelAmount] = useState("");
  if (!open) {
    return null;
  }
  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-hidden="false">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header modal-colored-header bg-danger">
              <h4 className="modal-title">결제취소</h4>
              <button type="button" className="btn-close" aria-hidden="true" onClick={onClose} />
            </div>
            <div className="modal-body">
              <div className="form-group row mb-2">
                <label className="col-sm-4 control-label">결제번호</label>
                <div className="col-sm-8">{settleNo}</div>
              </div>
              <div className="form-group row mb-2">
                <label className="col-sm-4 control-label">결제수단</label>
                <div className="col-sm-8">{paymentMethodLabel}</div>
              </div>
              <div className="form-group row mb-2">
                <label className="col-sm-4 control-label">주문금액</label>
                <div className="col-sm-8">{nf(amount)} 원</div>
              </div>
              <div className="form-group row mb-2">
                <label className="col-sm-4 control-label">결제금액</label>
                <div className="col-sm-8">{nf(paidAmount)} 원</div>
              </div>
              <div className="form-group row mb-2">
                <label className="col-sm-4 control-label">
                  취소금액
                  <br />
                  (입력하지 않으면 전액)
                </label>
                <div className="col-sm-8">
                  <input
                    type="text"
                    className="form-control"
                    id="cancelAmount"
                    name="cancelAmount"
                    value={cancelAmount}
                    onChange={(e) => setCancelAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger shadow-none"
                onClick={() => onRefund(cancelAmount)}
              >
                결제 취소
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
};

// legacy adminFrm — 관리자 메모 등록(주문 히스토리 card-footer). 217f.
const OrderMemoForm = ({
  onSubmit,
}: {
  onSubmit: (memoGubun: string, ordno: string, message: string) => void;
}) => {
  const [memoGubun, setMemoGubun] = useState("일반");
  const [ordno, setOrdno] = useState("");
  const [message, setMessage] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(memoGubun, ordno, message);
      }}
    >
      <div className="row gy-2 gx-2 align-items-center">
        <div className="col-3">
          <div className="form-floating">
            <select
              className="form-select"
              id="memo_gubun"
              value={memoGubun}
              onChange={(e) => setMemoGubun(e.target.value)}
              required
            >
              <option value="일반">일반</option>
              <option value="취소환불">취소환불</option>
              <option value="차액환불">차액환불</option>
            </select>
            <label htmlFor="memo_gubun">처리유형</label>
          </div>
        </div>
        <div className="col-9">
          <div className="form-floating">
            <input
              type="text"
              className="form-control"
              value={ordno}
              onChange={(e) => setOrdno(e.target.value)}
              required
            />
            <label>주문번호</label>
          </div>
        </div>
        <div className="col-10">
          <div className="form-floating">
            <textarea
              className="form-control"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <label htmlFor="message">내용</label>
          </div>
        </div>
        <div className="col-2">
          <button type="submit" className="btn btn-primary">
            기록하기
          </button>
        </div>
      </div>
    </form>
  );
};

// legacy #order-cancel-modal — 주문항목 취소(React 제어). 217d.
const OrderCancelModal = ({
  item,
  onClose,
  onSubmit,
}: {
  item: CancelModalItem | null;
  onClose: () => void;
  onSubmit: (message: string) => void;
}) => {
  const [message, setMessage] = useState("");
  if (!item) {
    return null;
  }
  // legacy: Ztorm 주문은 Hub에서 별도 취소 안내.
  const notice =
    item.order_system === "Ztorm" ? "Ztorm 주문은 Hub에서 별도로 주문취소 하셔야 합니다." : "";
  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-hidden="false">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header modal-colored-header bg-danger">
              <h4 className="modal-title">주문취소</h4>
              <button type="button" className="btn-close" aria-hidden="true" onClick={onClose} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="col-sm-2 control-label">주문상품</label>
                <div className="col-sm-10">
                  <input type="text" className="form-control" value={item.product_name} readOnly />
                </div>
              </div>
              <div className="form-group">
                <label className="col-sm-2 control-label">주문번호:</label>
                <div className="col-sm-10">
                  <input type="text" className="form-control" value={item.ordno} readOnly />
                </div>
              </div>
              <div className="form-group">
                <label className="col-sm-2 control-label">주문처리</label>
                <div className="col-sm-10">
                  <input type="text" className="form-control" value="주문취소" readOnly />
                </div>
              </div>
              <div className="form-group">
                <label className="col-sm-2 control-label">주문시스템</label>
                <div className="col-sm-10">
                  <input type="text" className="form-control" value={item.order_system} readOnly />
                  <span className="text-danger">{notice}</span>
                </div>
              </div>
              <div className="form-group">
                <label className="col-sm-2 control-label">처리자</label>
                <div className="col-sm-10">
                  {/* legacy: 세션 관리자(admin_id). 백엔드에서 세션 기준 기록. */}
                  <input type="text" className="form-control" value="" readOnly />
                </div>
              </div>
              <div className="form-group">
                <label className="col-sm-2 control-label">처리사유</label>
                <div className="col-sm-10">
                  <textarea
                    className="form-control"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger shadow-none"
                onClick={() => onSubmit(message)}
              >
                취소 완료
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
};

// legacy order_detail.php 팝업(PaycoPG 검증 응답 debug 덤프) — React 제어 모달로 JSON 표시.
const PaycoDetailModal = ({
  open,
  onClose,
  loading,
  detail,
}: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  detail: unknown;
}) => {
  if (!open) {
    return null;
  }
  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-hidden="false">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">결제 상세정보</h4>
              <button type="button" className="btn-close" aria-hidden="true" onClick={onClose} />
            </div>
            <div className="modal-body">
              {loading ? (
                <p>조회 중...</p>
              ) : (
                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  {JSON.stringify(detail, null, 2)}
                </pre>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose}>
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
};

// legacy 네이버페이 admissionTypeCode switch.
const NAVERPAY_ADMISSION_LABEL: Record<string, string> = {
  "01": "원결제 승인",
  "03": "전체취소",
  "04": "부분취소",
};

// legacy order_view.php 네이버페이 결제 정보 카드(pg_provider=="naverpay"). 217c-5.
const NaverpayPaymentCard = ({
  settleLog: s,
  step,
  paymentDate,
  onRefund,
}: {
  settleLog: OrderDetailSettleLog;
  step: string;
  paymentDate: string;
  onRefund: () => void;
}) => (
  <div className="card mb-0">
    <h5 className="card-header bg-secondary text-white font-14">네이버페이 결제 정보</h5>
    <div className="card-body p-2">
      <table className="table table-bordered table-sm mb-0">
        <colgroup>
          <col width="25%" />
          <col width="*" />
        </colgroup>
        <tbody className="font-13">
          <tr>
            <th className="table-light">네이버페이 결제번호</th>
            <td>{s.payment_id}</td>
          </tr>
          <tr>
            <th className="table-light">결제승인 유형</th>
            <td>
              {s.admission_type_code}
              {NAVERPAY_ADMISSION_LABEL[s.admission_type_code] ?? ""}
            </td>
          </tr>
          <tr>
            <th className="table-light">결제/취소 일시</th>
            <td>{s.admission_ymdt}</td>
          </tr>
          <tr>
            <th className="table-light">거래 완료 일시</th>
            <td>{s.trade_confirm_ymdt}</td>
          </tr>
          <tr>
            <th className="table-light">총 결제/취소 금액</th>
            <td>{s.total_pay_amount}</td>
          </tr>
          <tr>
            <th className="table-light">구매자 결제/취소 금액</th>
            <td>{s.apply_pay_amount}</td>
          </tr>
          <tr>
            <th className="table-light">주 결제 수단 결제/취소 금액</th>
            <td>{s.primary_pay_amount}</td>
          </tr>
          <tr>
            <th className="table-light">네이버페이 포인트/머니 결제/취소 금액</th>
            <td>{s.npoint_pay_amount}</td>
          </tr>
          <tr>
            <th className="table-light">즉시 할인 결제/취소 금액</th>
            <td>{s.discount_pay_amount}</td>
          </tr>
          <tr>
            <th className="table-light">주 결제 수단</th>
            <td>{s.primary_pay_means}</td>
          </tr>
          {s.primary_pay_means === "CARD" && (
            <>
              <tr>
                <th className="table-light">주 결제 수단 카드사</th>
                <td>{s.card_corp_code}</td>
              </tr>
              <tr>
                <th className="table-light">카드 번호</th>
                <td>{s.card_no}</td>
              </tr>
              <tr>
                <th className="table-light">카드승인번호</th>
                <td>{s.card_auth_no}</td>
              </tr>
            </>
          )}
          {s.primary_pay_means === "BANK" && (
            <>
              <tr>
                <th className="table-light">주 결제 수단 은행</th>
                <td>{s.bank_corp_code}</td>
              </tr>
              <tr>
                <th className="table-light">계좌 번호</th>
                <td>{s.bank_account_no}</td>
              </tr>
            </>
          )}
          {(step === "2" || step === "8") && (
            <>
              <tr>
                <th>결제완료일자</th>
                <td>{paymentDate}</td>
              </tr>
              <tr>
                <th>결제취소</th>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm shadow-none"
                    onClick={onRefund}
                  >
                    결제취소
                  </button>
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// legacy order_view.php PAYCO 결제 정보 카드(pg_provider=="payco"). 217c-4.
// 결제 상세정보 팝업(#order_detail → order_detail.php)은 후속(제외).
const PaycoPaymentCard = ({
  payco,
  step,
  onDetailClick,
  onRefund,
  onCancel,
}: {
  payco: OrderDetailPaycoInfo;
  step: string;
  onDetailClick: () => void;
  onRefund: () => void;
  onCancel: () => void;
}) => {
  const details = payco.payment_details;
  const paycoTotal = details.reduce((sum, d) => sum + d.payment_amt, 0);
  const billUrl = `https://bill.payco.com/seller/receipt/GBPT2K/${payco.seller_order_reference_key}/${payco.order_no}`;
  return (
    <div className="card mb-0">
      <h5 className="card-header bg-secondary text-white font-14">PAYCO 결제 정보</h5>
      <div className="card-body p-2">
        <table className="table table-bordered table-sm mb-0">
          <colgroup>
            <col width="25%" />
            <col width="*" />
          </colgroup>
          <tbody className="font-13">
            <tr>
              <th className="table-light">PAYCO 예약번호</th>
              <td>
                {payco.reserve_order_no}
                {step === "2" && (
                  <button type="button" onClick={onDetailClick}>
                    결제 상세정보
                  </button>
                )}
              </td>
            </tr>
            <tr>
              <th className="table-light">PAYCO 주문번호</th>
              <td>{payco.order_no}</td>
            </tr>
            <tr>
              <th className="table-light">주문자명</th>
              <td>{payco.member_name}</td>
            </tr>
            <tr>
              <th className="table-light">주문자 EMAIL</th>
              <td>{payco.member_email}</td>
            </tr>
            <tr>
              <th className="table-light">총 주문금액</th>
              <td>{nf(payco.total_order_amt)}</td>
            </tr>
            <tr>
              <th className="table-light">복합결제 합계</th>
              <td className="fw-bold">
                {nf(paycoTotal)}원 <span className="badge bg-info">{details.length}개 수단</span>
              </td>
            </tr>
            {details.map((d, i) => (
              <PaycoPaymentDetailRows
                key={`payco-${i}`}
                detail={d}
                idx={i + 1}
                step={step}
                onCancel={onCancel}
              />
            ))}
            <tr>
              <td colSpan={2} className="bg-dark text-white fw-bold py-2">
                ■ 결제 처리 / 영수증
              </td>
            </tr>
            {step === "2" && (
              <tr>
                <th className="table-light">결제취소</th>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm shadow-none"
                    onClick={onRefund}
                  >
                    결제취소
                  </button>
                </td>
              </tr>
            )}
            <tr>
              <th className="table-light">거래영수증</th>
              <td>
                <a
                  className="btn btn-secondary shadow-none btn-sm"
                  href={billUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  가맹점용 영수증 보기
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// legacy paymentDetails[] 항목별 행(수단 헤더 + 승인정보 + settle-info 5종).
const PaycoPaymentDetailRows = ({
  detail: d,
  idx,
  step,
  onCancel,
}: {
  detail: OrderDetailPaycoPaymentDetail;
  idx: number;
  step: string;
  onCancel: () => void;
}) => (
  <>
    <tr>
      <td colSpan={2} className="bg-secondary text-white fw-bold py-1">
        ▣ {idx}. {d.payment_method_name} &nbsp;&nbsp;{nf(d.payment_amt)}원
      </td>
    </tr>
    <tr>
      <th className="table-light">결제일시</th>
      <td>{d.trade_ymdt}</td>
    </tr>
    <tr>
      <th className="table-light">결제 승인번호</th>
      <td>{d.pg_admission_no}</td>
    </tr>
    <tr>
      <th className="table-light">결제 승인일시</th>
      <td>{d.pg_admission_ymdt}</td>
    </tr>
    <tr>
      <th className="table-light">PAYCO 간편결제여부</th>
      <td>{d.easy_payment_yn}</td>
    </tr>
    <tr>
      <th className="table-light">총 결제금액</th>
      <td>
        {nf(d.payment_amt)} (공급가액: {nf(d.taxable_amt)} + 부가세: {nf(d.vat_amt)})
      </td>
    </tr>
    {d.card_settle_info && (
      <tr>
        <th className="table-light">신용카드 결제정보</th>
        <td>
          <ul className="list-group ">
            <li className="list-group-item">카드사명: {d.card_settle_info.card_company_name}</li>
            <li className="list-group-item">카드사코드: {d.card_settle_info.card_company_code}</li>
            <li className="list-group-item">카드번호: {d.card_settle_info.card_no}</li>
            <li className="list-group-item">
              할부개월수: {d.card_settle_info.card_installment_month_number}
            </li>
            <li className="list-group-item">
              카드사 승인번호: {d.card_settle_info.card_admission_no}
            </li>
            <li className="list-group-item">
              무이자여부: {d.card_settle_info.card_interest_free_yn}
            </li>
            <li className="list-group-item">
              법인카드 여부: {d.card_settle_info.corporate_card_yn}
            </li>
            <li className="list-group-item">
              부분취소가능 여부: {d.card_settle_info.part_cancel_possible_yn}
            </li>
            <li className="list-group-item">
              매입사 코드: {d.card_settle_info.acquirers_corporation_code}
            </li>
          </ul>
        </td>
      </tr>
    )}
    {d.cellphone_settle_info && (
      <tr>
        <th className="table-light">휴대폰 결제정보</th>
        <td>
          <ul className="list-group">
            <li className="list-group-item">통신사명: {d.cellphone_settle_info.company_name}</li>
            <li className="list-group-item">휴대폰 번호: {d.cellphone_settle_info.cellphone_no}</li>
          </ul>
        </td>
      </tr>
    )}
    {d.realtime_account_transfer_settle_info && (
      <tr>
        <th className="table-light">실시간계좌이체 결제정보</th>
        <td>
          <ul className="list-group">
            <li className="list-group-item">
              은행명: {d.realtime_account_transfer_settle_info.bank_name}
            </li>
            <li className="list-group-item">
              은행코드: {d.realtime_account_transfer_settle_info.bank_code}
            </li>
          </ul>
        </td>
      </tr>
    )}
    {d.non_bankbook_settle_info && (
      <>
        <tr>
          <th className="table-light">무통장입금 결제정보</th>
          <td>
            <ul className="list-group">
              <li className="list-group-item">은행명: {d.non_bankbook_settle_info.bank_name}</li>
              <li className="list-group-item">은행코드: {d.non_bankbook_settle_info.bank_code}</li>
              <li className="list-group-item">계좌번호: {d.non_bankbook_settle_info.account_no}</li>
              <li className="list-group-item">
                입금만료일: {d.non_bankbook_settle_info.payment_expiration_ymd}
              </li>
            </ul>
          </td>
        </tr>
        {(step === "1" || step === "8") && (
          <tr>
            <th className="table-light">결제취소</th>
            <td>
              <button
                type="button"
                className="btn btn-danger btn-sm shadow-none"
                onClick={onCancel}
              >
                계좌반납
              </button>
            </td>
          </tr>
        )}
      </>
    )}
    {d.coupon_settle_info && (
      <tr>
        <th className="table-light">쿠폰 결제정보</th>
        <td>
          <ul className="list-group">
            <li className="list-group-item">쿠폰 할인금액: {d.coupon_settle_info.discount_amt}</li>
            <li className="list-group-item">
              쿠폰 할인조건: {d.coupon_settle_info.discount_condition_amt}
            </li>
          </ul>
        </td>
      </tr>
    )}
  </>
);

// legacy #orderLicence-modal + order_licence.php 응답 조각 재현(React 제어 모달).
const OrderLicenceModal = ({
  open,
  onClose,
  loading,
  result,
}: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  result: OrderLicenceResponse | null;
}) => {
  if (!open) {
    return null;
  }
  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-hidden="false">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header modal-colored-header bg-primary">
              <h4 className="modal-title">키확인</h4>
              <button type="button" className="btn-close" aria-hidden="true" onClick={onClose} />
            </div>
            <div className="modal-body">
              <div id="licence_result">
                {loading ? <p>조회 중...</p> : <OrderLicenceResult result={result} />}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose}>
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
};

// legacy order_licence.php mode별 출력 재현.
const OrderLicenceResult = ({ result }: { result: OrderLicenceResponse | null }) => {
  if (!result) {
    return null;
  }
  // getAssetLicence — list-group(title/key/활성화 일자)
  if (result.asset) {
    return (
      <div className="list-group">
        <li className="list-group-item">
          <h4 className="list-group-item-heading">{result.asset.title}</h4>
          <p className="list-group-item-text" style={{ fontSize: "14px" }}>
            {result.asset.key}
          </p>
          <p>
            {" "}
            <small>제품키 활성화 일자 : ({result.asset.activated_dt})</small>
          </p>
        </li>
      </div>
    );
  }
  // getPointNexusLicence
  if (result.pointnexus) {
    const pn = result.pointnexus;
    if (!pn.found) {
      return (
        <div className="list-group">
          <li className="list-group-item">발급 정보가 없습니다.</li>
        </div>
      );
    }
    return (
      <div className="list-group">
        <li className="list-group-item">
          <h4 className="list-group-item-heading">{pn.name}</h4>
          {pn.source === "db_fallback" && (
            <div className="alert alert-danger py-1 px-2 my-1" style={{ fontSize: "12px" }}>
              {pn.error !== "" && (
                <>
                  <small>{pn.error}</small>
                  <br />
                </>
              )}
              DB 저장값
            </div>
          )}
          <PointNexusLicenceMessage
            status={pn.status}
            licenseKey={pn.license_key}
            licensePlatform={pn.license_platform}
          />
        </li>
      </div>
    );
  }
  return null;
};

// legacy status switch 메시지.
const PointNexusLicenceMessage = ({
  status,
  licenseKey,
  licensePlatform,
}: {
  status: string;
  licenseKey: string;
  licensePlatform: string;
}) => {
  if (status === "sold" || status === "confirmed") {
    if (licenseKey !== "") {
      return (
        <>
          <p className="list-group-item-text" style={{ fontSize: "14px" }}>
            {licenseKey}
          </p>
          {licensePlatform !== "" && (
            <p>
              <small>플랫폼: {licensePlatform}</small>
            </p>
          )}
        </>
      );
    }
    return <p>키 정보를 확인하는 중입니다.</p>;
  }
  if (status === "booked") {
    return <p>가상계좌 입금 대기 중인 주문입니다. 입금 완료 후 키가 발급됩니다.</p>;
  }
  if (status === "pending_reveal") {
    return <p>예약 판매 상품으로, 출시 후 키가 발급됩니다.</p>;
  }
  if (status === "canceled") {
    return <p>환불처리가 완료된 주문입니다.</p>;
  }
  if (status === "failed") {
    return <p>주문 처리 중 오류가 발생한 건입니다. 확인이 필요합니다.</p>;
  }
  return <p>주문 처리 중입니다.</p>;
};
