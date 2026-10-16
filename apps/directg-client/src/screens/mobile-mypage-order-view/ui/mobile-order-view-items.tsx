"use client";

import { useState } from "react";

import {
  postOrderActivate,
  postOrderCancel,
  postOrderLicence,
  type OrderViewItem,
} from "@entities/mypage-order";

interface MobileOrderViewItemsProps {
  items: OrderViewItem[];
  settleNo: string;
  /** 환불계좌 필드 노출 판정(SC0040/SC0030/toss_bank). */
  paymentMethod: string;
}

/** getShipmentStatus(legacy Order). 미해당 빈 문자열. */
function shipmentStatusLabel(shipmentStatus: string): string {
  switch (shipmentStatus) {
    case "2":
      return "배송대기";
    case "3":
      return "배송준비";
    case "4":
      return "배송중";
    case "5":
      return "배송완료";
    case "6":
      return "구매확정";
    default:
      return "";
  }
}

const nf = (value: number) => value.toLocaleString("en-US");

const EMPTY_REFUND = { message3: "", message4: "", message5: "" };

/**
 * 모바일 주문 상세 - 상품 카드 + 뮤테이션 (legacy `mypage_order_view.html` 상품 반복 + 모달/JS).
 * 상태배지·키확인/키활성화/취소요청/배송조회 + activate/licence/orderCancel 모달(React 제어).
 * preorderModal 분기는 legacy에서 data-preorder 미설정으로 dead → 미구현.
 */
export function MobileOrderViewItems({
  items,
  settleNo,
  paymentMethod,
}: MobileOrderViewItemsProps) {
  const [activate, setActivate] = useState<{
    open: boolean;
    ordno: string;
    productName: string;
    orderSystem: string;
  }>({ open: false, ordno: "", productName: "", orderSystem: "" });
  const [licence, setLicence] = useState<{ open: boolean; html: string }>({
    open: false,
    html: "",
  });
  const [cancel, setCancel] = useState<{ open: boolean; ordno: string; productName: string }>({
    open: false,
    ordno: "",
    productName: "",
  });
  const [refund, setRefund] = useState(EMPTY_REFUND);
  const [submitting, setSubmitting] = useState(false);

  const showRefundFields =
    paymentMethod === "SC0040" || paymentMethod === "SC0030" || paymentMethod === "toss_bank";

  /** 배송조회 — 우체국(002)/CJ대한통운 외부 폼 POST, 새 탭. */
  const trackDelivery = (trackingNo: string, deliveryCode: string) => {
    const form = document.createElement("form");
    form.method = "post";
    form.target = "_blank";
    let inputName: string;
    if (deliveryCode === "002") {
      form.action = "https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm";
      inputName = "sid1";
    } else {
      form.action = "https://trace.cjlogistics.com/web/detail.jsp";
      inputName = "slipno";
    }
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = inputName;
    input.value = trackingNo;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const openLicence = async (item: OrderViewItem) => {
    try {
      const data = await postOrderLicence({
        settle_no: settleNo,
        ordno: item.ordno,
        order_system: item.order_system,
      });
      setLicence({ open: true, html: data.html });
    } catch (e) {
      alert(String(e));
    }
  };

  const confirmActivate = async () => {
    setSubmitting(true);
    try {
      const data = await postOrderActivate({
        settle_no: settleNo,
        ordno: activate.ordno,
        order_system: activate.orderSystem,
      });
      if (data.error_code === "99") {
        alert(data.error_msg);
        setSubmitting(false);
      } else {
        window.location.reload();
      }
    } catch (e) {
      setSubmitting(false);
      alert(String(e));
    }
  };

  const confirmCancel = async () => {
    setSubmitting(true);
    try {
      const data = await postOrderCancel({
        settle_no: settleNo,
        ordno: cancel.ordno,
        product_name: cancel.productName,
        order_status: "",
        ...(showRefundFields ? refund : {}),
      });
      setSubmitting(false);
      if (data.error_code === "OK") {
        alert(data.error_msg);
        window.location.reload();
      }
    } catch (e) {
      setSubmitting(false);
      alert(String(e));
    }
  };

  const openCancel = (item: OrderViewItem) => {
    setRefund(EMPTY_REFUND);
    setCancel({ open: true, ordno: item.ordno, productName: item.product_name });
  };

  return (
    <>
      <div className="section full">
        <div className="section-title">주문 상품 정보</div>
        <div className="wide-block">
          {items.map((item) => {
            const showTracking =
              item.shipment_status === "4" ||
              item.shipment_status === "5" ||
              item.shipment_status === "6";
            return (
              <div className="card" key={item.ordno}>
                <div className="card-header">
                  <div className="d-flex justify-content-between">
                    <div>
                      {item.ordno} <small>({item.order_date})</small>
                    </div>
                  </div>
                </div>
                <div className="card-body p-2" style={{ background: "#191919" }}>
                  {item.status === "1" && item.send_status === "fail" && (
                    <div className="mb-1">
                      <span className="badge bg-danger">발송오류</span>
                    </div>
                  )}
                  {item.status === "2" && item.delivery_type === "1" && (
                    <span className="badge bg-secondary">
                      {item.is_actv === "1" ? "수령완료" : "수령대기"}
                    </span>
                  )}
                  {item.status === "2" && item.delivery_type !== "1" && (
                    <span className="badge bg-secondary">
                      {shipmentStatusLabel(item.shipment_status)}
                    </span>
                  )}
                  {item.status === "8" && (
                    <div className="mb-1">
                      <span className="badge bg-danger">취소요청</span>
                    </div>
                  )}
                  {item.status === "9" && (
                    <div className="mb-1">
                      <span className="badge bg-danger">취소완료</span>
                      취소 일자 : {item.cancel_date}
                    </div>
                  )}
                  <p className="mt-2 card-text font-16 text-white">{item.product_name}</p>
                  <p className="card-text">
                    <span className="num">{nf(item.price)}</span> 원{" "}
                  </p>
                </div>
                <div className="card-footer">
                  {item.is_actv === "1" ? (
                    <button
                      type="button"
                      className="btn btn-success btn-block btn_license"
                      onClick={() => openLicence(item)}
                    >
                      키 확인
                    </button>
                  ) : (
                    <>
                      {item.status === "2" && (
                        <>
                          {item.delivery_type !== "2" && (
                            <button
                              type="button"
                              className="btn btn-primary btn-block btn_activate"
                              onClick={() =>
                                setActivate({
                                  open: true,
                                  ordno: item.ordno,
                                  productName: item.product_name,
                                  orderSystem: item.order_system,
                                })
                              }
                            >
                              키 활성화
                            </button>
                          )}
                          <div className="mt-2">
                            <button
                              type="button"
                              className="btn btn-danger btn-block btn_cancel"
                              onClick={() => openCancel(item)}
                            >
                              취소요청{" "}
                            </button>
                          </div>
                        </>
                      )}
                      {item.status === "1" && item.send_status === "fail" && (
                        <div className="mt-2">
                          <button
                            type="button"
                            className="btn btn-danger btn-block btn_cancel"
                            onClick={() => openCancel(item)}
                          >
                            취소요청{" "}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  {showTracking && (
                    <button
                      type="button"
                      className="mt-1 btn btn-primary btn-block btn_delivery_search"
                      onClick={() => trackDelivery(item.tracking_number, item.delivery_code)}
                    >
                      배송조회
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 키 활성화 안내 모달 (legacy activateModal) */}
      {activate.open && (
        <>
          <div
            className="modal fade modalbox show d-block"
            id="activateModal"
            tabIndex={-1}
            role="dialog"
          >
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">제품 코드(키) 활성화 안내</h5>
                  <a
                    href="#"
                    className="modal-close text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      setActivate((p) => ({ ...p, open: false }));
                    }}
                  >
                    <ion-icon name="close-outline"></ion-icon>
                  </a>
                </div>
                <div className="modal-body">
                  <p className="text font-14">
                    ※ 제품코드 활성화 전, 아래의 내용을 다시 한 번 확인 후 신중하게 진행해주시기
                    바랍니다.
                  </p>
                  <p className="text font-14">
                    - 제품코드를 활성화하신 경우 수령완료 처리되며, 이후 특별한 사유 없이 환불이
                    불가합니다.
                  </p>
                  <p className="text font-14">
                    - 단순변심, 구매실수, 중복주문, 프로모션을 포함한 가격변동 등은 환불사유가 될 수
                    없습니다.
                  </p>
                  <p className="text font-14">
                    - 주문하신 상품의 이름, 플랫폼, 가격, 중복 여부를 다시 한 번 확인해주시기
                    바랍니다.
                  </p>
                  <p className="text font-14">주문하신 상품의 제품코드를 활성화하시겠습니까?</p>
                  <div className="form-group mb-3">
                    <label htmlFor="product_name" className="control-label mb-1">
                      제품명
                    </label>
                    <div className="col-sm-4">
                      <input
                        type="text"
                        className="form-control input-sm"
                        value={activate.productName}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer justify-content-center">
                  <div className="row w-100">
                    <div className="col-6">
                      <button
                        type="button"
                        className="btn btn-secondary btn-block"
                        onClick={() => setActivate((p) => ({ ...p, open: false }))}
                      >
                        취소
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        type="button"
                        className="btn btn-primary btn-block"
                        id="btn_activate"
                        disabled={submitting}
                        onClick={confirmActivate}
                      >
                        수취확인
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* 제품키 확인 모달 (legacy licenceModal) */}
      {licence.open && (
        <>
          <div
            className="modal fade modalbox show d-block"
            id="licenceModal"
            tabIndex={-1}
            role="dialog"
          >
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">제품 코드(키) 확인</h5>
                  <a
                    href="#"
                    className="modal-close text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      setLicence({ open: false, html: "" });
                    }}
                  >
                    <ion-icon name="close-outline"></ion-icon>
                  </a>
                </div>
                <div className="modal-body">
                  <div
                    id="license_result"
                    className="text-dark"
                    dangerouslySetInnerHTML={{ __html: licence.html }}
                  />
                </div>
                <div className="modal-footer justify-content-center">
                  <div className="row w-100">
                    <div className="col">
                      <button
                        type="button"
                        className="btn btn-secondary btn-block"
                        onClick={() => setLicence({ open: false, html: "" })}
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* 주문취소요청 모달 (legacy orderCancelModal) */}
      {cancel.open && (
        <>
          <div
            className="modal fade modalbox show d-block"
            id="orderCancelModal"
            tabIndex={-1}
            role="dialog"
          >
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">주문취소요청</h4>
                  <button
                    type="button"
                    className="close"
                    aria-label="Close"
                    onClick={() => setCancel((p) => ({ ...p, open: false }))}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form className="form-horizontal" name="cancelFrm" id="cancelFrm" method="post">
                    <div className="form-group mb-3">
                      <label className="control-label mb-1">제품명</label>
                      <div className="col-sm-4">
                        <input
                          type="text"
                          className="form-control input-sm"
                          value={cancel.productName}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="form-group mb-3">
                      <label htmlFor="ordno" className="control-label mb-1">
                        주문번호
                      </label>
                      <div className="col-sm-4">
                        <input
                          type="text"
                          className="form-control input-sm"
                          id="ordno"
                          value={cancel.ordno}
                          readOnly
                        />
                      </div>
                    </div>
                    {showRefundFields && (
                      <div className="form-group py-3">
                        <label className="control-label mb-2">환불 받으실 계좌 정보</label>
                        <br />
                        <label htmlFor="message3" className="control-label mb-1">
                          은행명
                        </label>
                        <div className="col-sm-4">
                          <input
                            type="text"
                            className="form-control input-sm"
                            id="message3"
                            value={refund.message3}
                            onChange={(e) => setRefund((p) => ({ ...p, message3: e.target.value }))}
                          />
                        </div>
                        <label htmlFor="message4" className="control-label mb-1">
                          계좌번호
                        </label>
                        <div className="col-sm-4">
                          <input
                            type="text"
                            className="form-control input-sm"
                            id="message4"
                            value={refund.message4}
                            onChange={(e) => setRefund((p) => ({ ...p, message4: e.target.value }))}
                          />
                        </div>
                        <label htmlFor="message5" className="control-label mb-1">
                          예금주
                        </label>
                        <div className="col-sm-4">
                          <input
                            type="text"
                            className="form-control input-sm"
                            id="message5"
                            value={refund.message5}
                            onChange={(e) => setRefund((p) => ({ ...p, message5: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}
                  </form>
                  <div>
                    <p>
                      ※ 결제 방식에 따라 결제 취소로 환불 진행을 원칙으로 하며, 결제 취소가 되지
                      않는 일부 주문 건의 환불 지연과 회원님의 수고를 미연에 방지하고자 계좌 정보를
                      미리 요청하는 점 양해 부탁드립니다.
                    </p>
                    <p>
                      ※ 주문취소 요청 건은 영업일 기준 요청한 다음 날 고객센터 운영 시간에
                      순차적으로 처리되며, PG사 승인 절차로 인해 환불 완료 시까지 공휴일을 제외한
                      영업일 기준 3~5일 정도의 기간이 소요될 수 있습니다.
                    </p>
                    <p>※ 주문 취소 요청 후에는 제품 키 활성화 및 확인이 불가능합니다.</p>
                  </div>
                </div>
                <div className="modal-footer text-center">
                  <button
                    type="button"
                    className="btn btn-danger mx-3 font-14"
                    id="btn_order_cancel"
                    disabled={submitting}
                    onClick={confirmCancel}
                  >
                    취소요청
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary mx-3 font-14"
                    onClick={() => setCancel((p) => ({ ...p, open: false }))}
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
}
