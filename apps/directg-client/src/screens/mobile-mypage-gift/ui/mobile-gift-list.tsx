"use client";

import { useState, type FormEvent } from "react";

import { postGiftClaim, postGiftLicence, type GiftItem } from "@entities/mypage-gift";
import { openDaumPostcode } from "@shared/lib/daum-postcode";

interface MobileGiftListProps {
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
 * 모바일 사은품 카드 목록 (legacy `mobile/mypage/mypage_gift.html` 본문).
 * 카드형 + 상태/배송 조합 버튼 + 배송지(giftModal)/제품키(licenceModal) 모달(React 제어) + Daum + 배송조회 외부폼.
 * 페이지네이션 없음(legacy #btn_more 미렌더 · 더보기 JS는 copy-paste dead → 미이식).
 */
export function MobileGiftList({ items }: MobileGiftListProps) {
  const [addressModal, setAddressModal] = useState<{
    open: boolean;
    idx: number;
    isDelivery: string;
  }>({ open: false, idx: 0, isDelivery: "" });
  const [addr, setAddr] = useState(EMPTY_ADDRESS);
  const [submitting, setSubmitting] = useState(false);
  const [licence, setLicence] = useState<{ open: boolean; html: string }>({
    open: false,
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

  const submitAddress = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (addr.name === "") return alert("이름을 입력해주세요.");
    if (addr.zipcode === "") return alert("우편번호를 입력해주세요.");
    if (addr.address === "") return alert("주소를 입력해주세요.");
    if (addr.address_detail === "") return alert("상세주소를 입력해주세요.");
    if (addr.tel === "") return alert("연락처를 입력해주세요.");
    setSubmitting(true);
    try {
      const res = await postGiftClaim({
        idx: addressModal.idx,
        is_delivery: addressModal.isDelivery,
        ...addr,
      });
      alert(res.msg);
      window.location.reload();
    } catch (e) {
      setSubmitting(false);
      console.log(e);
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

  /** legacy: licence_result에 응답을 그대로 주입(error_code 파싱 안 함). error_msg가 제품키 HTML. */
  const openLicence = async (ordno: string, reserveId: string) => {
    setLicence({ open: true, html: "" });
    try {
      const data = await postGiftLicence({ ordno, reserve_id: reserveId });
      setLicence({ open: true, html: data.error_msg });
    } catch (e) {
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

  const closeAddress = () => setAddressModal((p) => ({ ...p, open: false }));
  const closeLicence = () => setLicence({ open: false, html: "" });

  return (
    <>
      <div className="section pt-2">
        {items.map((data) => (
          <div className="card mb-1" key={data.idx}>
            <div className="card-header">{data.title}</div>
            <div className="card-body">
              <h6 className="card-subtitle">{STATUS_LABEL[data.status]}</h6>
              {data.address_enddt !== "" && (
                <p className="d-flex justify-content-between">
                  <span>{data.is_delivery === "Y" ? "입력기한" : "수령기한"}</span>{" "}
                  <span>~{data.address_enddt}</span>
                </p>
              )}
              <p className="card-text">{data.gift_nm}</p>
              {data.is_delivery === "Y" ? (
                <>
                  {data.status === "0" && (
                    <button
                      type="button"
                      className="btn btn-info btn-block btn_event_gift_choice"
                      onClick={() => openAddressModal(data.idx, data.is_delivery)}
                    >
                      배송주소입력
                    </button>
                  )}
                  {data.status === "2" && data.tracking_no && (
                    <button
                      type="button"
                      className="btn btn-success btn-block btn_delivery_search"
                      onClick={() => trackDelivery(data.tracking_no, data.delivery_code)}
                    >
                      배송조회
                    </button>
                  )}
                </>
              ) : data.status === "0" ? (
                <button
                  type="button"
                  className="btn btn-primary btn-block btn_event_gift_confirm"
                  onClick={() => claimKey(data.idx)}
                >
                  키수령
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-block btn_event_gift_licence"
                  onClick={() => openLicence(data.ordno, data.reserve_id)}
                >
                  키확인
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 배송지 입력 모달 (legacy giftModal) */}
      {addressModal.open && (
        <>
          <div
            className="modal fade dialogbox show d-block"
            id="giftModal"
            tabIndex={-1}
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border border-3 border-start border-end-0 border-top-0 border-bottom-0 border-primary mw-100">
                <div className="modal-header justify-content-between">
                  <h4 className="modal-title">사은품 배송지 입력</h4>
                </div>
                <form
                  className="form-horizontal"
                  name="giftFrm"
                  id="giftFrm"
                  onSubmit={submitAddress}
                >
                  <div className="modal-body text-start">
                    <div id="gift_result">
                      <div id="gift_add" className="mb-3">
                        <div className="form-group">
                          <div className="col-sm-12">
                            <h4>
                              * 배송지 정보 <small>사은품을 배송받을 정보를 입력해 주세요.</small>
                            </h4>
                          </div>
                        </div>
                        <div className="form-group mb-1">
                          <div className="input-wrapper">
                            <label htmlFor="name" className="form-label">
                              이름
                            </label>
                            <div className="">
                              <input
                                type="text"
                                className="form-control"
                                name="name"
                                id="name"
                                value={addr.name}
                                onChange={(e) => setAddr((p) => ({ ...p, name: e.target.value }))}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="form-group mb-1">
                          <div className="input-wrapper">
                            <label htmlFor="address" className="form-label">
                              주소
                            </label>
                            <div className="">
                              <div className="input-group mb-1">
                                <input
                                  type="text"
                                  className="form-control"
                                  name="zipcode"
                                  id="zipcode"
                                  placeholder="우편번호"
                                  maxLength={5}
                                  readOnly
                                  value={addr.zipcode}
                                />
                                <button
                                  className="btn btn-secondary"
                                  type="button"
                                  id="btn_zipcode"
                                  onClick={findZipcode}
                                >
                                  우편번호 찾기
                                </button>
                              </div>
                              <input
                                type="text"
                                className="form-control mb-1"
                                name="address"
                                id="address"
                                placeholder="주소"
                                readOnly
                                value={addr.address}
                              />
                              <input
                                type="text"
                                className="form-control"
                                name="address_detail"
                                id="address_detail"
                                placeholder="상세주소"
                                value={addr.address_detail}
                                onChange={(e) =>
                                  setAddr((p) => ({ ...p, address_detail: e.target.value }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <div className="form-group mb-1">
                          <div className="input-wrapper">
                            <label htmlFor="tel" className="form-label">
                              연락처
                            </label>
                            <div className="">
                              <input
                                type="text"
                                className="form-control"
                                name="tel"
                                id="tel"
                                value={addr.tel}
                                onChange={(e) => setAddr((p) => ({ ...p, tel: e.target.value }))}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer text-start">
                    <div className="btn-inline">
                      <button
                        type="button"
                        className="btn btn-text-secondary"
                        onClick={closeAddress}
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        id="btn_order_gift_confirm"
                        disabled={submitting}
                      >
                        등록
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* 제품키 모달 (legacy licenceModal) */}
      {licence.open && (
        <>
          <div
            className="modal fade dialogbox show d-block"
            id="licenceModal"
            tabIndex={-1}
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border border-3 border-start border-end-0 border-top-0 border-bottom-0 border-primary mw-100">
                <div className="modal-header justify-content-between">
                  <h4 className="modal-title">
                    주문번호 <span id="ordno"></span>의 제품키
                  </h4>
                </div>
                <div className="modal-body">
                  <div id="licence_result" dangerouslySetInnerHTML={{ __html: licence.html }} />
                </div>
                <div className="modal-footer text-start">
                  <div className="btn-inline">
                    <button type="button" className="btn btn-text-secondary" onClick={closeLicence}>
                      닫기
                    </button>
                  </div>
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
