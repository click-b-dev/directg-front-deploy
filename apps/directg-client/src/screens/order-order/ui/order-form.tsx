"use client";

import { useEffect, useRef, useState } from "react";

import type { OrderItem, OrderCheckout } from "@entities/order";
import { openDaumPostcode } from "@shared/lib/daum-postcode";

const nf = (value: number) => value.toLocaleString("en-US");

/** 프로모션 우선 판매가. */
const sellPrice = (item: OrderItem) =>
  item.promotion && item.promotion.sale_price > 0 ? item.promotion.sale_price : item.price;

/** 상품카드 좌하단 타입 badge (legacy order.html — basic→primary/edition→info, cart와 색 다름). */
function typeBadge(item: OrderItem): { text: string; className: string } | null {
  const { game_type, display_type } = item;
  if (game_type === "game") {
    if (display_type === "basic")
      return { text: "기본게임", className: "bg-primary rounded-0 font-12 py-2" };
    if (display_type === "edition")
      return { text: "에디션", className: "bg-info rounded-0 font-12 py-2" };
    if (display_type === "multi")
      return { text: "멀티팩", className: "bg-warning rounded-0 font-12 py-2" };
    return null;
  }
  if (game_type === "dlc") return { text: "DLC", className: "bg-content rounded-0 font-12 py-2" };
  if (game_type === "music")
    return { text: "Music", className: "bg-content rounded-0 font-12 py-2" };
  if (game_type === "bundle")
    return { text: "번들", className: "bg-success rounded-0 font-12 py-2" };
  if (game_type === "holomodels") {
    if (display_type === "holomodels")
      return { text: "본체", className: "bg-success rounded-0 font-12 fw-bold" };
    if (display_type === "holomodelsdlc")
      return { text: "DLC", className: "bg-content rounded-0 font-12 fw-bold" };
    if (display_type === "holomodelsedition")
      return { text: "에디션", className: "bg-primary rounded-0 font-12 fw-bold" };
  }
  return null;
}

/** 플랫폼 아이콘 (legacy order.html — PNG 로고 w-50, cart의 svg와 다름). */
function platformIcon(platform: string) {
  switch (platform) {
    case "1":
      return (
        <div className="text-center mt-3">
          <img
            className="mx-auto d-block w-50"
            src="/assets/images/platform/Platform_logo_steam.png"
            alt=""
          />
        </div>
      );
    case "34":
      return (
        <div className="text-center mt-3">
          <img
            className="mx-auto d-block w-50"
            src="/assets/images/platform/Platform_logo_epic.png"
            alt=""
          />
        </div>
      );
    case "35":
      return (
        <div className="text-center mt-3">
          <img
            className="mx-auto d-block w-50"
            src="/assets/images/platform/Platform_logo_rockstar.png"
            alt=""
          />
        </div>
      );
    case "51":
      return (
        <div className="text-center mt-3">
          <img
            className="mx-auto d-block w-50"
            src="/assets/images/platform/holomodels.svg"
            alt=""
          />
        </div>
      );
    default:
      return null;
  }
}

/** legacy buyr_tel2 전화번호 포맷(02/지역/휴대폰 하이픈). */
function formatPhone(value: string): string {
  const v = value.replace(/[^0-9]/g, "");
  if (v.startsWith("02")) {
    if (v.length < 6) return v.replace(/(\d{2})(\d{0,3})/, "$1-$2");
    if (v.length < 10) return v.replace(/(\d{2})(\d{3})(\d{0,4})/, "$1-$2-$3");
    return v.slice(0, 10).replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  if (v.startsWith("0")) {
    if (v.length < 7) return v.replace(/(\d{3})(\d{0,3})/, "$1-$2");
    if (v.length < 11) return v.replace(/(\d{3})(\d{3})(\d{0,4})/, "$1-$2-$3");
    return v.slice(0, 11).replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  return v;
}

/** 주문상품 가격 셀. */
function ItemPriceCell({ item }: { item: OrderItem }) {
  return (
    <td className="text-center align-middle px-2">
      <div className="d-flex">
        <div className="d-grid grid-2 col-12">
          <div className="d-flex flex-row justify-content-between mb-2">
            {item.promotion ? (
              <>
                <span className="badge bg-danger align-self-center px-2 py-2 font-14 num minus">
                  {item.promotion.discount_rate} %
                </span>
                <div className="d-flex flex-column align-items-end">
                  <s className="text-muted font-11 num won"> {nf(item.consumer_price)}</s>
                  <span className="text-white fw-bold font-14 num won">
                    {" "}
                    {nf(item.promotion.sale_price)}
                  </span>
                </div>
              </>
            ) : (
              <>
                {item.discount > 0 ? (
                  <span className="badge bg-primary align-self-center px-2 py-2 font-14 num minus">
                    {item.discount} %
                  </span>
                ) : (
                  <span></span>
                )}
                <div className="d-flex flex-column align-items-end">
                  <s className="text-muted font-11 num won"> {nf(item.consumer_price)}</s>
                  <span className="text-white fw-bold font-14 num won"> {nf(item.price)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </td>
  );
}

/** 결제수단 라이브 목록(legacy 주석 제외). disabled 임계값은 set_real_settle_price 가격대 사다리 동치. */
const SETTLE_MIN: Record<string, number> = {
  toss: 300,
  naverpay: 100,
  payco: 100,
  SC0060: 350,
  SC0040: 10000,
};

/**
 * 주문서 폼 (legacy `pc/order/order.html` — 항목/배송지/포인트/결제수단/요약 + settle.html POST).
 * 포인트 재계산·결제수단 disable·우편번호(daum)·전화포맷·제출검증 재현. 실제 PG는 settle(다음 단위).
 */
export function OrderForm({
  items,
  member_emoney,
  member_address,
  is_delivery_address,
  showTossEvent,
}: OrderCheckout & { showTossEvent: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const zipcodeRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  const totalGoodsPrice = items.reduce((s, it) => s + it.consumer_price, 0);
  const totalPrice = items.reduce((s, it) => s + sellPrice(it), 0);

  const [appliedEmoney, setAppliedEmoney] = useState(0);
  const [useEmoneyInput, setUseEmoneyInput] = useState("");
  const [emoneyReadonly, setEmoneyReadonly] = useState(false);
  const [emoneyChk, setEmoneyChk] = useState("");
  const [selectedSettle, setSelectedSettle] = useState("");

  // 배송지 (prefill)
  const [zipcode, setZipcode] = useState(member_address.zipcode ?? "");
  const [address, setAddress] = useState(member_address.address ?? "");
  const [address2, setAddress2] = useState(member_address.address_detail ?? "");
  const [buyrName, setBuyrName] = useState(member_address.name ?? "");
  const [buyrTel2, setBuyrTel2] = useState(member_address.phone ?? "");
  const [msg, setMsg] = useState(member_address.message ?? "");

  const realSettle = totalPrice - appliedEmoney;

  // legacy: 청약 popover 초기화
  useEffect(() => {
    const bs = (window as unknown as { bootstrap?: { Popover: new (el: Element) => unknown } })
      .bootstrap;
    if (!bs) return;
    document.querySelectorAll('[data-bs-toggle="popover"]').forEach((el) => new bs.Popover(el));
  }, []);

  const applyPoint = () => {
    if (useEmoneyInput === "0" || useEmoneyInput === "") {
      alert("사용할 포인트를 입력해주세요.");
      return;
    }
    if (member_emoney < 1000) {
      alert("보유한 포인트가 1000원 이상시 사용가능합니다.");
      setUseEmoneyInput("0");
      setEmoneyChk("N");
      return;
    }
    let checkEmoney = Math.floor(parseInt(useEmoneyInput) / 100) * 100;
    if (totalPrice < checkEmoney) checkEmoney = totalPrice; // 결제금액 초과 → 결제금액으로 cap
    if (checkEmoney > member_emoney) {
      alert("보유포인트보다 많은 포인트을 사용하실 수 없습니다.");
      setUseEmoneyInput("0");
      setEmoneyChk("N");
      return;
    }
    setEmoneyChk("Y");
    setUseEmoneyInput(String(checkEmoney));
    setEmoneyReadonly(true);
    setAppliedEmoney(checkEmoney);
    setSelectedSettle(""); // set_real_settle_price: 결제수단 uncheck
  };

  const cancelPoint = () => {
    setEmoneyChk("N");
    const had = appliedEmoney > 0;
    setUseEmoneyInput("0");
    setEmoneyReadonly(false);
    if (had) {
      setAppliedEmoney(0);
      setSelectedSettle("");
    }
  };

  const searchZipcode = async () => {
    const result = await openDaumPostcode();
    setZipcode(result.zonecode);
    setAddress(result.address);
    document.getElementById("address2")?.focus();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (is_delivery_address) {
      if (zipcode === "") {
        e.preventDefault();
        alert("주소를 입력하셔야 합니다.");
        zipcodeRef.current?.focus();
        return;
      }
      if (address === "") {
        e.preventDefault();
        alert("주소를 입력하셔야 합니다.");
        addressRef.current?.focus();
        return;
      }
    }
    // 통과 → settle.html native POST
  };

  return (
    <form
      ref={formRef}
      id="orderFrm"
      method="get"
      action="settle"
      className="row mb-5"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="enc_str" id="enc_str" value="" readOnly />
      <input type="hidden" name="member_emoney" id="member_emoney" value={member_emoney} readOnly />
      <input type="hidden" name="emoney_chk" id="emoney_chk" value={emoneyChk} readOnly />
      <hr className="my-2" />

      <div className="col-12">
        <h3 className="pt-2">주문상품정보</h3>
        <table
          className="table table-bordered table-centered caption-top mb-4 shadow-none"
          id="order_table"
          cellSpacing={0}
        >
          <caption className="font-14 text-white">상품수 ( 총 {items.length} 개 )</caption>
          <thead className="table-light font-14">
            <tr>
              <th scope="col" className="text-center fw-500">
                상품정보
              </th>
              <th scope="col" className="text-center fw-500" style={{ width: "150px" }}>
                가격정보
              </th>
            </tr>
          </thead>
          <tbody className="table-dark">
            {items.map((item) => {
              const badge = typeBadge(item);
              return (
                <tr key={item.goods_sku}>
                  <td className="p-0">
                    <input type="hidden" name="goods_sku[]" value={item.goods_sku} />
                    <div className="card rounded-0 border-0 table-dark">
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
                                <span className={`badge ${badge.className}`}>{badge.text}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-1">{platformIcon(item.product_platform)}</div>
                        <div className="col-md-8">
                          <div className="row g-0 overflow-hidden flex-md-row shadow-sm position-relative">
                            <div className="p-2 d-flex flex-column position-static align-content-start">
                              <div className="mb-2 text-body-secondary">
                                {item.delivery_type === "1" && (
                                  <span className="badge rounded-2 badge-outline-success font-11 fw-500">
                                    코드발송
                                  </span>
                                )}
                                {item.delivery_type === "2" && (
                                  <span className="badge rounded-2 badge-outline-post font-11 fw-500">
                                    택배발송
                                  </span>
                                )}
                                {item.delivery_type === "3" && (
                                  <span className="badge rounded-2 badge-outline-code-post font-11 fw-500">
                                    코드+택배발송
                                  </span>
                                )}
                              </div>
                              <h5 className="mb-2">{item.product_name}</h5>
                              <div className="text-body-secondary">
                                {item.spoken_korean === "Y" && (
                                  <span className="badge rounded-2 badge-outline-secondary font-11 fw-500">
                                    음성 한국어
                                  </span>
                                )}
                                {item.promotion && (
                                  <span className="badge rounded-2 badge-outline-danger font-11 fw-500">
                                    프로모션
                                  </span>
                                )}
                                {item.is_preorder === "Y" && (
                                  <span className="badge rounded-2 badge-outline-warning font-11 fw-500">
                                    예약구매
                                  </span>
                                )}
                                {item.is_bonus === "Y" && (
                                  <span className="badge rounded-2 badge-outline-info font-11 fw-500">
                                    특전
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <ItemPriceCell item={item} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="col-8">
        {is_delivery_address && (
          <>
            <h3 className="mb-2 py-3 border-top">배송지</h3>
            <div>
              <div className="mb-3 row">
                <label htmlFor="zipcode" className="col-sm-2 col-form-label font-14">
                  우편번호
                </label>
                <div className="col-sm-2">
                  <input
                    ref={zipcodeRef}
                    type="text"
                    className="form-control"
                    id="zipcode"
                    name="zipcode"
                    value={zipcode}
                    readOnly
                  />
                </div>
                <div className="col-sm-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    id="btn_zipcode"
                    onClick={searchZipcode}
                  >
                    우편번호 검색
                  </button>
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="address" className="col-sm-2 col-form-label font-14">
                  주소
                </label>
                <div className="col-sm-10">
                  <input
                    ref={addressRef}
                    type="text"
                    className="form-control"
                    id="address"
                    name="address"
                    value={address}
                    readOnly
                  />
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="address2" className="col-sm-2 col-form-label font-14">
                  상세주소
                </label>
                <div className="col-sm-10">
                  <input
                    type="text"
                    className="form-control"
                    id="address2"
                    name="address2"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="buyr_name" className="col-sm-2 col-form-label font-14">
                  주문자 이름
                </label>
                <div className="col-sm-3">
                  <input
                    type="text"
                    className="form-control"
                    id="buyr_name"
                    name="buyr_name"
                    maxLength={20}
                    value={buyrName}
                    onChange={(e) => setBuyrName(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="buyr_tel2" className="col-sm-2 col-form-label font-14">
                  주문자 휴대폰번호
                </label>
                <div className="col-sm-3">
                  <input
                    type="text"
                    className="form-control"
                    id="buyr_tel2"
                    name="buyr_tel2"
                    maxLength={20}
                    value={buyrTel2}
                    onChange={(e) => setBuyrTel2(formatPhone(e.target.value))}
                  />
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="msg" className="col-sm-2 col-form-label font-14">
                  배송 요청메세지
                </label>
                <div className="col-sm-10">
                  <textarea
                    name="msg"
                    id="msg"
                    className="form-control"
                    rows={3}
                    maxLength={120}
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <hr className="my-3" />
          </>
        )}

        {totalPrice >= 3000 && (
          <>
            <h3 className="mb-2 py-3">다이렉트 게임즈 포인트 사용</h3>
            <div className="row row-cols-lg-auto g-3 align-items-center">
              <div className="col-12">
                <label htmlFor="use_emoney" className="col-form-label font-14">
                  사용포인트
                </label>
              </div>
              <div className="col-12">
                <input
                  type="text"
                  className="form-control"
                  id="use_emoney"
                  name="use_emoney"
                  placeholder="사용포인트 입력"
                  value={useEmoneyInput}
                  readOnly={emoneyReadonly}
                  onChange={(e) => setUseEmoneyInput(e.target.value)}
                />
              </div>
              <div className="col-12">
                <button
                  type="button"
                  className="btn btn-primary shadow-none me-2"
                  id="btn_point_use"
                  onClick={applyPoint}
                >
                  사용
                </button>
                <button
                  type="button"
                  className="btn btn-dark shadow-none me-2"
                  id="btn_point_cancel"
                  onClick={cancelPoint}
                >
                  사용안함
                </button>
              </div>
              <div className="col-12">
                <span className="bg-light d-block py-1 px-2 font-14 border-top border-2 border-primary">
                  보유 포인트 <span className="num">{nf(member_emoney)}</span>
                </span>
              </div>
            </div>
            <hr className="my-3" />
          </>
        )}

        <h3 className="mb-3 py-3">결제수단</h3>
        <div>
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="radio"
              name="settle_kind"
              id="settle_kind_toss"
              value="toss"
              required
              disabled={realSettle < SETTLE_MIN.toss}
              checked={selectedSettle === "toss"}
              onChange={() => setSelectedSettle("toss")}
            />
            <label className="form-check-label font-14 ms-3" htmlFor="settle_kind_toss">
              {/* legacy 기간게이트 2026-03-19~2026-11-30 → settle_event.svg, else settle_toss.svg (서버 평가) */}
              {showTossEvent ? (
                <img src="/assets/images/order/settle_event.svg" alt="" />
              ) : (
                <img src="/assets/images/order/settle_toss.svg" alt="" />
              )}
            </label>
            <div className="">
              <span className="d-block small text-danger font-12">
                ※ 300원 이상 결제 시 이용 가능합니다.
              </span>
              <span className="d-block small text-danger font-12">
                ※ 신용∙체크카드, 퀵계좌이체, 토스페이 등의 결제수단이 포함됩니다.
              </span>
              <span className="d-block small text-danger font-12">
                ※ 부분취소는 결제일로부터 4일 이후 가능합니다.
              </span>
            </div>
          </div>
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="radio"
              name="settle_kind"
              value="naverpay"
              id="settle_kind_naverpay"
              required
              disabled={realSettle < SETTLE_MIN.naverpay}
              checked={selectedSettle === "naverpay"}
              onChange={() => setSelectedSettle("naverpay")}
            />
            <label className="form-check-label ms-3" htmlFor="settle_kind_naverpay">
              <img src="/assets/images/order/btn_npaygr.svg" alt="" />
            </label>
            <div className="">
              <span className="d-block small text-danger font-12">
                ※ 100원 이상 결제 시 이용 가능합니다.
              </span>
            </div>
          </div>
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="radio"
              name="settle_kind"
              id="settle_kind_payco"
              value="payco"
              required
              disabled={realSettle < SETTLE_MIN.payco}
              checked={selectedSettle === "payco"}
              onChange={() => setSelectedSettle("payco")}
            />
            <label
              className="form-check-label rounded-2 ms-3 py-1"
              htmlFor="settle_kind_payco"
              style={{ background: "#ffffff" }}
            >
              <img
                src="/assets/images/logo/PAYCO_Logo_Basic.svg"
                style={{ width: "200px", height: "38px" }}
                className="px-5 py-3"
                alt=""
              />
            </label>
            <div className="">
              <span className="d-block small text-danger font-12">
                ※ 100원 이상 결제 시 이용 가능합니다.
              </span>
            </div>
          </div>
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="radio"
              name="settle_kind"
              id="settle_kind_SC0060"
              value="SC0060"
              required
              disabled={realSettle < SETTLE_MIN.SC0060}
              checked={selectedSettle === "SC0060"}
              onChange={() => setSelectedSettle("SC0060")}
            />
            <label className="form-check-label font-14 ms-3" htmlFor="settle_kind_SC0060">
              휴대폰 결제
            </label>
            <div className="">
              <span className="d-block small text-danger font-12">
                ※ 350원 이상 결제 시 이용 가능합니다.
                <br />※ 부분/이월 환불이 불가하며, 다이렉트 게임즈 포인트로 제공됩니다. 자세한
                사항은 환불정책을 확인해 주시기 바랍니다.
              </span>
            </div>
          </div>
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="radio"
              name="settle_kind"
              id="settle_kind_SC0040"
              value="SC0040"
              required
              disabled={realSettle < SETTLE_MIN.SC0040}
              checked={selectedSettle === "SC0040"}
              onChange={() => setSelectedSettle("SC0040")}
            />
            <label className="form-check-label font-14 ms-3" htmlFor="settle_kind_SC0040">
              가상계좌
            </label>
            <div className="">
              <span className="d-block small text-danger font-12">
                ※ 10,000원 이상 결제 시 이용 가능합니다.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="col-4">
        <div className="position-sticky" id="price-summary">
          <div className="border border-2 border-primary px-3 py-2 rounded-0 bg-card">
            <h3 className="header-title font-16 py-3">최종 결제 금액</h3>
            <hr />
            <div className="list-group border-0 mb-2">
              <div className="list-group-item bg-card py-3">
                <div className="d-flex w-100 justify-content-between">
                  <span className="font-14">총 상품 가격 </span>
                  <span className="num font-14 won"> {nf(totalGoodsPrice)}</span>
                </div>
              </div>
              <div className="list-group-item bg-card py-3 text-info">
                <div className="d-flex w-100 justify-content-between">
                  <span className="font-14">총 할인 </span>
                  <span className="num font-14">
                    - <span className="won"> {nf(totalGoodsPrice - totalPrice)}</span>
                  </span>
                </div>
              </div>
              <div
                className="list-group-item bg-card py-3 text-info"
                id="emoney_display"
                style={{ display: appliedEmoney > 0 ? "" : "none" }}
              >
                <div className="d-flex w-100 justify-content-between">
                  <span className="font-14">포인트 사용 </span>
                  <span className="num font-14">
                    -{" "}
                    <span className="won" id="used_emoney_display">
                      {" "}
                      {nf(appliedEmoney)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <hr />
            <div className="w-100 text-end px-3 text-white mt-3">
              <div className="d-flex w-100 justify-content-between">
                <strong className="font-16">총 결제금액 </strong>
                <span className="num font-16 fw-bold won">
                  {" "}
                  <span id="total_amount" data-total={totalPrice}>
                    {nf(realSettle)}
                  </span>
                </span>
              </div>
            </div>
            <hr />
            <p className="font-14">
              청약의사 재확인{" "}
              <button
                type="button"
                className="btn btn-sm btn-link"
                data-bs-container="body"
                data-bs-toggle="popover"
                data-bs-placement="right"
                title="전자상거래법 제8조 제2항"
                data-bs-content="<strong>제8조(전자적 대금 지급의 신뢰확보)</strong><br/>② 사업자와 전자결제업자등은 전자적 대금지급이 이루어지는 경우 소비자가 입력한 정보가 소비자의 진정 의사 표시에 의한 것인지를 확인함에 있어 주의를 다하여야 한다."
                data-bs-html="true"
                data-bs-sanitize="false"
              >
                <i className="fa-solid fa-circle-info"></i>
              </button>
            </p>
            <div className="form-check mb-2">
              <input
                type="checkbox"
                className="form-check-input font-16"
                name="is_agree"
                id="is_agree"
                value="Y"
                required
              />
              <label className="form-check-label font-14 fw-normal" htmlFor="is_agree">
                상품의 이름, 플랫폼, 정보, 가격, 결제방법 등의 주문내용을 모두 확인하였으며, 관련
                내용에 동의합니다.
              </label>
            </div>
            <div className="d-grid my-3">
              <button type="submit" className="btn btn-lg btn-primary shadow-none">
                주문하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
