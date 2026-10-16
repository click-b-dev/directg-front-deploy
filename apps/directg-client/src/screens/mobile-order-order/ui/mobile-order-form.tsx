"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import type { OrderItem } from "@entities/order";
import { openDaumPostcode } from "@shared/lib/daum-postcode";

const nf = (value: number) => value.toLocaleString("en-US");

/** 프로모션 우선 판매가 — legacy `.price[data]` 값. */
const sellPrice = (item: OrderItem) =>
  item.promotion && item.promotion.sale_price > 0 ? item.promotion.sale_price : item.price;

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

/** 결제수단 라이브 목록(legacy 주석 제외 toss/naverpay/payco/SC0060/SC0040). set_real_settle_price 가격대 사다리 동치 임계값. */
const SETTLE_MIN: Record<string, number> = {
  toss: 300,
  naverpay: 100,
  payco: 100,
  SC0060: 350,
  SC0040: 10000,
};

interface MobileOrderFormProps {
  items: OrderItem[];
  memberEmoney: number;
  isDeliveryAddress: boolean;
  /** legacy hidden delivery_type = 마지막 항목 delivery_type(제출 시 배송지 필수 판정). */
  deliveryType: string;
  /** 기간게이트 2026-03-19~2026-11-30 → toss event.svg(서버 평가). */
  showTossEvent: boolean;
  /** 기간게이트 2025-11-14~2025-12-03 → naverpay 이벤트 배너(서버 평가, 현재 만료). */
  showNaverEvent: boolean;
  /** 기획 고정배너2(footer_banner, 서버 컴포넌트 슬롯 — toss 섹션 내부). */
  footerBanner: ReactNode;
}

/**
 * 모바일 주문서 폼 (legacy `mobile/order/order.html` — 상품/포인트/결제수단/배송지/요약 + settle.html POST).
 * 포인트 재계산·결제수단 최소금액 disable·우편번호(daum)·전화포맷·제출검증 재현. 실제 PG는 settle(다음 하드 게이트).
 * PC `order-form`과 데이터/로직 동일(`entities/order` 재사용, 증분 0), 마크업만 모바일(카드형·POST·포인트 항상표시).
 */
export function MobileOrderForm({
  items,
  memberEmoney,
  isDeliveryAddress,
  deliveryType,
  showTossEvent,
  showNaverEvent,
  footerBanner,
}: MobileOrderFormProps) {
  const useEmoneyRef = useRef<HTMLInputElement>(null);

  const totalGoodsPrice = items.reduce((s, it) => s + it.consumer_price, 0);
  const totalPrice = items.reduce((s, it) => s + sellPrice(it), 0);

  const [appliedEmoney, setAppliedEmoney] = useState(0);
  const [useEmoneyInput, setUseEmoneyInput] = useState("");
  const [emoneyReadonly, setEmoneyReadonly] = useState(false);
  const [emoneyChk, setEmoneyChk] = useState("N"); // legacy hidden emoney_chk 초기값 N
  const [selectedSettle, setSelectedSettle] = useState("");
  const [isAgree, setIsAgree] = useState(false);

  // 배송지 (모바일은 prefill 없음 — getMemberAddress 미조회)
  const [zipcode, setZipcode] = useState("");
  const [address, setAddress] = useState("");
  const [address2, setAddress2] = useState("");
  const [buyrName, setBuyrName] = useState("");
  const [buyrTel2, setBuyrTel2] = useState("");
  const [msg, setMsg] = useState("");

  const realSettle = totalPrice - appliedEmoney;
  const totalDiscount = totalGoodsPrice - totalPrice;

  // legacy: 청약 popover 초기화(new bootstrap.Popover)
  useEffect(() => {
    const bs = (window as unknown as { bootstrap?: { Popover: new (el: Element) => unknown } })
      .bootstrap;
    if (!bs) return;
    document.querySelectorAll('[data-bs-toggle="popover"]').forEach((el) => new bs.Popover(el));
  }, []);

  // 포인트 사용(btn_emoney_use) — legacy 검증 순서 그대로.
  const applyPoint = () => {
    if (useEmoneyInput === "0" || useEmoneyInput === "") {
      alert("사용할 포인트(원)을 입력해주세요.");
      return;
    }
    setEmoneyChk("Y"); // legacy: 검증 전 Y 세팅(실패 분기에서도 유지)
    let checkEmoney = Math.floor(parseInt(useEmoneyInput) / 100) * 100;
    if (memberEmoney < 1000) {
      alert("보유한 포인트가 1000원 이상시 사용가능합니다.");
      setUseEmoneyInput("0");
      return;
    }
    if (totalPrice < checkEmoney) checkEmoney = totalPrice; // 결제금액 초과 → 결제금액으로 cap
    if (checkEmoney > memberEmoney) {
      alert("보유포인트보다 많은 포인트을 사용하실 수 없습니다.");
      setUseEmoneyInput("0");
      return;
    }
    setUseEmoneyInput(String(checkEmoney));
    setEmoneyReadonly(true);
    setAppliedEmoney(checkEmoney);
    setSelectedSettle(""); // set_real_settle_price: 결제수단 uncheck
  };

  // 포인트 사용취소(btn_emoney_cancel)
  const cancelPoint = () => {
    setEmoneyChk("N");
    if (parseInt(useEmoneyInput || "0") > 0) {
      setUseEmoneyInput("0");
      setEmoneyReadonly(false);
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
    // legacy: emoney_chk=="N"이면 use_emoney 강제 0 (POST 직전 DOM 반영)
    if (emoneyChk === "N") {
      if (useEmoneyRef.current) useEmoneyRef.current.value = "0";
      setUseEmoneyInput("0");
    }

    const totalAmount = realSettle;
    // legacy: $('settle_kind:checked:not(:disabled)').length==0
    const noneSelected =
      selectedSettle === "" || realSettle < (SETTLE_MIN[selectedSettle] ?? Infinity);
    if (noneSelected && totalAmount !== 0) {
      e.preventDefault();
      alert("결제수단을 선택해주세요.");
      return;
    }

    if (deliveryType !== "1") {
      if (zipcode === "") {
        e.preventDefault();
        alert("우편번호를 입력해주세요.");
        return;
      }
      if (address === "") {
        e.preventDefault();
        alert("주소를 입력해주세요.");
        return;
      }
      if (address2 === "") {
        e.preventDefault();
        alert("상세주소를 입력해주세요.");
        return;
      }
      if (buyrName === "") {
        e.preventDefault();
        alert("주문자 이름을 입력해주세요.");
        return;
      }
      if (buyrTel2 === "") {
        e.preventDefault();
        alert("휴대폰번호를 입력해주세요.");
        return;
      }
      if (msg === "") {
        e.preventDefault();
        alert("배송요청메세지를 입력해주세요.");
        return;
      }
    }

    if (!isAgree) {
      e.preventDefault();
      alert("결제진행을 위해선 청약의사 관련 내용에 동의가 필요합니다.");
      return;
    }
    // 통과 → settle.html native POST
  };

  return (
    <form
      className="form-horizontal"
      name="orderFrm"
      id="orderFrm"
      method="get"
      action="settle"
      onSubmit={handleSubmit}
    >
      <style>{`
        .popover-header{ background:#303D4E; font-size:14px; }
        .popover-body{ font-size:12px; }
      `}</style>
      <input type="hidden" name="emoney_chk" id="emoney_chk" value={emoneyChk} readOnly />
      <input type="hidden" name="delivery_type" id="delivery_type" value={deliveryType} readOnly />

      {/* 주문상품정보 */}
      <div className="section full px-3 pt-2">
        <div className="section-title">주문상품정보</div>
        {items.map((item) => (
          <div className="card cart-item mb-2 rounded-0" key={item.goods_sku}>
            <img
              src={`/upload/product/${item.product_code}/header/header.jpg`}
              alt="product"
              className="card-img-top rounded-0"
            />
            <div className="card-body">
              <h5 className="card-title fs-4 mb-2">{item.product_name}</h5>
              <p className="card-text">
                {item.promotion ? (
                  <>
                    <span className="badge bg-danger align-self-center px-3 py-3 font-16 num fw-bold rounded-2 minus">
                      {item.promotion.discount_rate} %
                    </span>
                    <strong className="ms-1 font-16 num fw-bold price text-white won">
                      {" "}
                      {nf(item.promotion.sale_price)}
                    </strong>
                    <s className="ms-1 font-12 num consumer_price won">
                      {" "}
                      {nf(item.consumer_price)}
                    </s>
                  </>
                ) : (
                  <>
                    <span className="badge bg-primary align-self-center px-3 py-3 font-16 num fw-bold rounded-2 minus">
                      {item.discount} %
                    </span>
                    <strong className="ms-1 font-16 num fw-bold price text-white won">
                      {" "}
                      {nf(item.price)}
                    </strong>
                    <s className="ms-1 font-12 num consumer_price won">
                      {" "}
                      {nf(item.consumer_price)}
                    </s>
                  </>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 다이렉트 게임즈 포인트 사용 (모바일은 항상 노출) */}
      <div className="section full px-3 mb-2">
        <div className="section-title">다이렉트 게임즈 포인트 사용</div>
        <div className="wide-block pt-2 pb-1">
          <div className="row">
            <label htmlFor="use_emoney" className="col-3 form-label text-nowrap">
              포인트
            </label>
            <div className="col-5">
              <button
                type="button"
                className="btn btn-light btn-sm shadow-none"
                id="btn_emoney_use"
                onClick={applyPoint}
              >
                사용
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm shadow-none"
                id="btn_emoney_cancel"
                onClick={cancelPoint}
              >
                취소
              </button>
            </div>
            <div className="col-4">
              <div className="input-group">
                <div className="input-group-text border-none">-</div>
                <input
                  ref={useEmoneyRef}
                  type="number"
                  className="form-control font-14 text-end rounded-1 shadow-none"
                  id="use_emoney"
                  name="use_emoney"
                  placeholder="0"
                  step="100"
                  value={useEmoneyInput}
                  readOnly={emoneyReadonly}
                  onChange={(e) => setUseEmoneyInput(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 text-end">
              <span className="d-block font-14">
                잔여 포인트: <span className="num font-14">{nf(memberEmoney)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 결제수단 */}
      <div className="section full px-3 mb-2">
        <div className="section-title">결제수단</div>
        <div className="wide-block p-0">
          <div className="input-list">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="settle_kind"
                id="settle_kind_toss"
                value="toss"
                disabled={realSettle < SETTLE_MIN.toss}
                checked={selectedSettle === "toss"}
                onChange={() => setSelectedSettle("toss")}
              />
              <label
                className="form-check-label py-2 text-black bg-white"
                htmlFor="settle_kind_toss"
              >
                <div className="p-0 fw-bold">
                  <span>일반결제 수단</span>
                  {showTossEvent && (
                    <img
                      src="/mobile-assets/images/order/event.svg"
                      className="ms-1 position-absolute top-50"
                      style={{ transform: "translateY(-50%)" }}
                      alt=""
                    />
                  )}
                </div>
                <div className="p-0">
                  <img
                    src="/mobile-assets/images/order/toss_logo.svg"
                    className="align-bottom"
                    style={{ height: "16px" }}
                    alt=""
                  />
                </div>
              </label>

              {/* 기획 고정 배너2 (footer_banner) */}
              {footerBanner}

              <div className="wide-block py-2">
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

            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="settle_kind"
                id="settle_kind_naverpay"
                value="naverpay"
                disabled={realSettle < SETTLE_MIN.naverpay}
                checked={selectedSettle === "naverpay"}
                onChange={() => setSelectedSettle("naverpay")}
              />
              <label
                className="form-check-label py-2"
                htmlFor="settle_kind_naverpay"
                style={{ background: "#00DE5A" }}
              >
                <img
                  src="/mobile-assets/images/order/logo_npaybk_small.svg"
                  style={{ height: "32px" }}
                  alt=""
                />
              </label>

              {showNaverEvent && (
                <div className="wide-block px-2">
                  <a href="/board/notice_view?idx=141">
                    <img
                      src="https://image.directg.net/h84zMsiamj"
                      className="img-fluid"
                      alt="네이버페이로 5만원이상 결제시 3천원 즉시 할인"
                    />
                  </a>
                </div>
              )}

              <div className="wide-block py-2">
                <span className="d-block small text-danger font-12">
                  ※ 100원 이상 결제 시 이용 가능합니다.
                </span>
              </div>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="settle_kind"
                id="settle_kind_payco"
                value="payco"
                disabled={realSettle < SETTLE_MIN.payco}
                checked={selectedSettle === "payco"}
                onChange={() => setSelectedSettle("payco")}
              />
              <label
                className="form-check-label py-2"
                htmlFor="settle_kind_payco"
                style={{ background: "#ffffff" }}
              >
                <img
                  src="/mobile-assets/images/order/PAYCO_Logo_Basic.svg"
                  style={{ height: "24px" }}
                  alt=""
                />
              </label>
              <div className="wide-block py-2">
                <span className="d-block small text-danger font-12">
                  ※ 100원 이상 결제 시 이용 가능합니다.
                </span>
              </div>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="settle_kind"
                id="settle_kind_SC0060"
                value="SC0060"
                disabled={realSettle < SETTLE_MIN.SC0060}
                checked={selectedSettle === "SC0060"}
                onChange={() => setSelectedSettle("SC0060")}
              />
              <label className="form-check-label font-14" htmlFor="settle_kind_SC0060">
                휴대폰 결제
              </label>
              <div className="wide-block py-2">
                <span className="d-block small text-danger font-12">
                  ※ 350원 이상 결제 시 이용 가능합니다.
                  <br />※ 부분/이월 환불이 불가하며, 다이렉트 게임즈 포인트로 제공됩니다. 자세한
                  사항은 <a href="/service/refund_policy">[환불정책]</a>을 확인해 주시기 바랍니다.
                </span>
              </div>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="settle_kind"
                id="settle_kind_SC0040"
                value="SC0040"
                disabled={realSettle < SETTLE_MIN.SC0040}
                checked={selectedSettle === "SC0040"}
                onChange={() => setSelectedSettle("SC0040")}
              />
              <label className="form-check-label font-14" htmlFor="settle_kind_SC0040">
                가상계좌 결제
              </label>
              <div className="wide-block py-2">
                <span className="d-block small text-danger font-12">
                  ※ 10,000원 이상 결제 시 이용 가능합니다.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 배송지 (실물 포함 시) */}
      {isDeliveryAddress && (
        <div className="section full px-3 mb-2">
          <div className="section-title">배송지</div>
          <div className="wide-block p-2">
            <div className="row g-2 mb-2">
              <label htmlFor="zipcode" className="col-3 form-label font-14">
                우편번호
              </label>
              <div className="col-4">
                <input
                  type="text"
                  className="form-control font-14 rounded-1 shadow-none"
                  id="zipcode"
                  name="zipcode"
                  value={zipcode}
                  readOnly
                  required
                />
              </div>
              <div className="col-4">
                <button
                  type="button"
                  className="btn btn-primary btn-sm shadow-none text-nowrap"
                  id="btn_zipcode"
                  onClick={searchZipcode}
                >
                  우편번호 검색
                </button>
              </div>
            </div>
            <div className="row g-2 mb-2">
              <label htmlFor="address" className="col-3 form-label font-14">
                주소
              </label>
              <div className="col-9">
                <input
                  type="text"
                  className="form-control font-14 rounded-1 shadow-none"
                  id="address"
                  name="address"
                  value={address}
                  readOnly
                  required
                />
              </div>
            </div>
            <div className="row g-2 mb-2">
              <label htmlFor="address2" className="col-3 form-label font-14">
                상세주소
              </label>
              <div className="col-9">
                <input
                  type="text"
                  className="form-control font-14 rounded-1 shadow-none"
                  id="address2"
                  name="address2"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="row g-2 mb-2">
              <label htmlFor="buyr_name" className="col-3 form-label font-14">
                주문자 이름
              </label>
              <div className="col-9">
                <input
                  type="text"
                  className="form-control font-14 rounded-1 shadow-none"
                  id="buyr_name"
                  name="buyr_name"
                  maxLength={20}
                  value={buyrName}
                  onChange={(e) => setBuyrName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="row g-2 mb-2">
              <label htmlFor="buyr_tel2" className="col-3 form-label font-14">
                휴대폰번호
              </label>
              <div className="col-9">
                <input
                  type="text"
                  className="form-control font-14 rounded-1 shadow-none"
                  id="buyr_tel2"
                  name="buyr_tel2"
                  maxLength={13}
                  value={buyrTel2}
                  onChange={(e) => setBuyrTel2(formatPhone(e.target.value))}
                  required
                />
              </div>
            </div>
            <div className="row g-2 mb-2">
              <label htmlFor="msg" className="col-3 form-label font-14">
                배송 요청메세지
              </label>
              <div className="col-9">
                <textarea
                  className="form-control font-14 rounded-1 shadow-none"
                  id="msg"
                  name="msg"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 최종 결제 금액 */}
      <div className="section full px-3 mb-2">
        <div className="section-title">최종 결제 금액</div>
        <div className="card">
          <ul className="listview flush transparent">
            <li className="d-flex">
              총 상품 가격
              <span id="total_goods_price" className="num won">
                {" "}
                {nf(totalGoodsPrice)}
              </span>
            </li>
            <li className="d-flex text-danger">
              총 할인{" "}
              <span id="total_discount_price" className="num text-danger m-won">
                {" "}
                {nf(totalDiscount)}
              </span>
            </li>
            <li
              className={`text-info ${appliedEmoney > 0 ? "d-flex" : "d-none"}`}
              id="emoney_display"
            >
              포인트 사용{" "}
              <span className="num text-info m-won" id="used_emoney_display">
                {" "}
                {nf(appliedEmoney)}
              </span>
            </li>
            <li className="d-flex text-primary fw-bold">
              총 결제 금액{" "}
              <span id="total_price" className="num fs-4 fw-bold won" data-total={totalPrice}>
                {" "}
                {nf(realSettle)}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* 청약의사 재확인 */}
      <div className="section full px-3 mb-2">
        <div className="section-title">
          청약의사 재확인{" "}
          <button
            type="button"
            className="btn btn-sm btn-link"
            data-bs-toggle="popover"
            data-bs-placement="bottom"
            data-bs-html="true"
            title="전자상거래법 제8조 제2항"
            data-bs-content="<strong>제8조(전자적 대금 지급의 신뢰확보)</strong><br/>② 사업자와 전자결제업자등은 전자적 대금지급이 이루어지는 경우 소비자가 입력한 정보가 소비자의 진정 의사 표시에 의한 것인지를 확인함에 있어 주의를 다하여야 한다."
          >
            <ion-icon name="information-circle" role="img" className="md hydrated"></ion-icon>
          </button>
        </div>
        <div className="wide-block py-2">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              name="is_agree"
              id="is_agree"
              value="Y"
              checked={isAgree}
              onChange={(e) => setIsAgree(e.target.checked)}
            />
            <label className="form-check-label font-14 fw-normal" htmlFor="is_agree">
              상품의 이름, 플랫폼, 정보, 가격, 결제방법 등의 주문내용을 모두 확인하였으며, 관련
              내용에 동의합니다.
            </label>
          </div>
        </div>
      </div>

      <div className="section mb-2">
        <button type="submit" className="btn btn-primary btn-lg btn-block" id="btn_order">
          결제하기
        </button>
      </div>
    </form>
  );
}
