"use client";

import { useState } from "react";

import { postGiftClaim, postGiftLicence, type GiftItem } from "@entities/mypage-gift";
import { openDaumPostcode } from "@shared/lib/daum-postcode";

interface GiftListProps {
  items: GiftItem[];
}

/** legacy `$status_array`. */
const STATUS_LABEL: Record<string, string> = {
  "0": "당첨완료",
  "1": "발송요청",
  "2": "배송중",
  "3": "수령완료",
};

const EMPTY_ADDRESS = { name: "", zipcode: "", address: "", address_detail: "", tel: "" };

/**
 * 사은품 카드 그리드/표 (legacy `mypage_gift.html` 본문). 조건부 버튼 + 배송지/제품키 모달(React 제어) +
 * Daum 우편번호 + 키수령/키확인/배송조회. 페이지네이션 UI 없음(legacy 버그).
 */
export function GiftList({ items }: GiftListProps) {
  const [addressModal, setAddressModal] = useState<{
    open: boolean;
    idx: number;
    isDelivery: string;
  }>({ open: false, idx: 0, isDelivery: "" });
  const [addr, setAddr] = useState(EMPTY_ADDRESS);
  const [submitting, setSubmitting] = useState(false);
  const [licence, setLicence] = useState<{ open: boolean; loading: boolean; html: string }>({
    open: false,
    loading: false,
    html: "",
  });

  const openAddressModal = (idx: number, isDelivery: string) => {
    setAddr(EMPTY_ADDRESS);
    setAddressModal({ open: true, idx, isDelivery });
  };

  const findZipcode = async () => {
    const result = await openDaumPostcode();
    setAddr((prev) => ({ ...prev, zipcode: result.zonecode, address: result.address }));
  };

  const submitAddress = async () => {
    if (addr.name === "") return alert("이름을 입력해주세요.");
    if (addr.zipcode === "") return alert("우편번호를 입력해주세요.");
    if (addr.address === "") return alert("주소를 입력해주세요.");
    if (addr.address_detail === "") return alert("상세주소를 입력해주세요.");
    if (addr.tel === "") return alert("연락처를 입력해주세요.");
    setSubmitting(true);
    try {
      const res = await postGiftClaim({ idx: addressModal.idx, is_delivery: "Y", ...addr });
      alert(res.msg);
      window.location.reload();
    } catch (e) {
      setSubmitting(false);
      alert(String(e));
    }
  };

  const claimKey = async (idx: number) => {
    try {
      const res = await postGiftClaim({ idx, is_delivery: "N" });
      alert(res.msg);
      window.location.reload();
    } catch (e) {
      alert(String(e));
    }
  };

  const openLicence = async (ordno: string, reserveId: string) => {
    setLicence({ open: true, loading: true, html: "" });
    try {
      const data = await postGiftLicence({ ordno, reserve_id: reserveId });
      if (data.error_code === "0") {
        setLicence({ open: true, loading: false, html: data.error_msg });
      } else {
        setLicence({ open: false, loading: false, html: "" });
        alert("관리자에게 문의해주세요");
      }
    } catch (e) {
      setLicence({ open: false, loading: false, html: "" });
      alert(String(e));
    }
  };

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

  return (
    <>
      <div className="col-12">
        <table className="table table-bordered table-centered mb-0 text-center align-middle text-nowrap">
          <thead className="align-middle">
            <tr>
              <th>이벤트명</th>
              <th>사은품</th>
              <th>배송</th>
              <th>키확인</th>
              <th>상태</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {items.map((data) => (
              <tr key={data.idx}>
                <td className="text-start text-wrap">{data.title}</td>
                <td className="text-start text-wrap">{data.gift_nm}</td>
                <td>
                  {data.is_delivery === "Y" && data.status === "0" && (
                    <button
                      type="button"
                      className="btn btn-info btn-sm btn_event_gift_choice font-14"
                      onClick={() => openAddressModal(data.idx, data.is_delivery)}
                    >
                      배송주소입력
                    </button>
                  )}
                </td>
                <td>
                  {data.is_delivery === "N" &&
                    (data.status === "0" ? (
                      <button
                        type="button"
                        className="btn btn-info btn-sm btn_event_gift_confirm font-14"
                        onClick={() => claimKey(data.idx)}
                      >
                        키수령
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-info btn-sm btn_event_gift_licence font-14"
                        onClick={() => openLicence(data.ordno, data.reserve_id)}
                      >
                        키확인
                      </button>
                    ))}
                </td>
                <td>
                  {data.status === "2" && data.tracking_no ? (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm btn_delivery_search font-14"
                      onClick={() => trackDelivery(data.tracking_no, data.delivery_code)}
                    >
                      배송조회
                    </button>
                  ) : (
                    STATUS_LABEL[data.status]
                  )}
                </td>
                <td>
                  {data.address_enddt !== "" && (
                    <>
                      {data.is_delivery === "Y" ? "입력기한" : "수령기한"}
                      <br />
                      {data.address_enddt}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 배송지 입력 모달 */}
      {addressModal.open && (
        <>
          <div className="modal show d-block" id="giftModal" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border border-3 border-start border-end-0 border-top-0 border-bottom-0 border-primary">
                <div className="modal-header justify-content-between">
                  <h4 className="modal-title">사은품 배송지 입력</h4>
                  <button
                    type="button"
                    className="close"
                    aria-label="Close"
                    onClick={() => setAddressModal((p) => ({ ...p, open: false }))}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body font-14">
                  <div id="gift_result">
                    <div id="gift_add">
                      <div className="form-group">
                        <div className="col-sm-12">
                          <h4>
                            * 배송지 정보 <small>사은품을 배송받을 정보를 입력해 주세요.</small>
                          </h4>
                        </div>
                      </div>
                      <div className="form-group mb-2">
                        <label htmlFor="name" className="control-label mb-1">
                          이름
                        </label>
                        <div className="col-sm-4">
                          <input
                            type="text"
                            className="form-control rounded-0"
                            id="name"
                            value={addr.name}
                            onChange={(e) => setAddr((p) => ({ ...p, name: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="form-group mb-2">
                        <label htmlFor="address" className="control-label mb-1">
                          주소
                        </label>
                        <div className="col-sm-8">
                          <div className="input-group mb-2 col-sm-6">
                            <input
                              type="text"
                              className="form-control rounded-0"
                              placeholder="우편번호"
                              maxLength={5}
                              readOnly
                              value={addr.zipcode}
                            />
                            <button
                              className="btn btn-secondary rounded-0 font-14"
                              type="button"
                              id="btn_zipcode"
                              onClick={findZipcode}
                            >
                              우편번호 찾기
                            </button>
                          </div>
                          <input
                            type="text"
                            className="form-control rounded-0 mb-2"
                            placeholder="주소"
                            readOnly
                            value={addr.address}
                          />
                          <input
                            type="text"
                            className="form-control rounded-0"
                            placeholder="상세주소"
                            value={addr.address_detail}
                            onChange={(e) =>
                              setAddr((p) => ({ ...p, address_detail: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                      <div className="form-group mb-2">
                        <label htmlFor="tel" className="control-label mb-1">
                          연락처
                        </label>
                        <div className="col-sm-4">
                          <input
                            type="text"
                            className="form-control rounded-0"
                            id="tel"
                            value={addr.tel}
                            onChange={(e) => setAddr((p) => ({ ...p, tel: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-danger btn-inline font-14"
                        id="btn_order_gift_confirm"
                        disabled={submitting}
                        onClick={submitAddress}
                      >
                        선택완료
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}

      {/* 제품키 모달 */}
      {licence.open && (
        <>
          <div className="modal show d-block" id="licenceModal" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border border-3 border-start border-end-0 border-top-0 border-bottom-0 border-primary">
                <div className="modal-header justify-content-between">
                  <h4 className="modal-title">
                    주문번호 <span id="ordno"></span>의 제품키
                  </h4>
                  <button
                    type="button"
                    className="close btn btn-secondary"
                    aria-label="Close"
                    onClick={() => setLicence({ open: false, loading: false, html: "" })}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div id="licence_result" dangerouslySetInnerHTML={{ __html: licence.html }} />
                  <div className="text-center mt-2">
                    <button
                      type="button"
                      className="btn btn-secondary btn-inline font-14"
                      onClick={() => setLicence({ open: false, loading: false, html: "" })}
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}
    </>
  );
}
