"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

import { postFullDiscount, postKcpReserve, type OrderItem } from "@entities/order";

const nf = (value: number) => value.toLocaleString("en-US");

/** GA4 gtag 안전 호출 (app/m/layout gtag 전역). */
function gtag(...args: unknown[]) {
  (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.(...args);
}

/** SettleContext — legacy settle.html 서버 블록 파생값(모바일 screen buildContext 조립). PC와 동일 shape. */
export interface MobileSettleContext {
  settle_no: string;
  settle_kind: string;
  pg_provider: string;
  pay_method: string;
  site_cd: string;
  escw_used: string;
  deli_term: string;
  settle_kind_label: string;
  items: OrderItem[];
  use_emoney: number;
  zipcode: string;
  address: string;
  address2: string;
  buyr_name: string;
  buyr_tel2: string;
  msg: string;
  total_order_price: number;
  total_goods_price: number;
  total_price: number;
  good_name: string;
  good_cd: string;
  good_info: string;
  shop_user_id: string;
  m_no: string;
}

/** legacy 가상계좌 은행 목록(SC0040 va_bankcode). */
const VA_BANKS: [string, string][] = [
  ["BK03", "기업은행"],
  ["BK31", "iM뱅크"],
  ["BK04", "국민은행"],
  ["BK32", "부산은행"],
  ["BK07", "수협"],
  ["BK34", "광주은행"],
  ["BK11", "NH농협"],
  ["BK39", "경남은행"],
  ["BK20", "우리은행"],
  ["BK71", "우체국"],
  ["BK23", "SC제일은행"],
  ["BK81", "KEB하나은행"],
  ["BK26", "신한은행"],
];

/** 주문상품 가격 셀 (legacy settle.html — cart식: 정가 stray `</s>` 무효 등가). */
function ItemPrice({ item }: { item: OrderItem }) {
  if (item.promotion) {
    return (
      <p className="card-text">
        <span className="badge bg-danger align-self-center px-3 py-3 font-16 num fw-bold rounded-2 minus">
          {item.promotion.discount_rate} %
        </span>
        <strong className="ms-1 font-16 num fw-bold price won">
          {" "}
          {nf(item.promotion.sale_price)}
        </strong>
        <s className="ms-1 font-12 num consumer_price won"> {nf(item.consumer_price)}</s>
      </p>
    );
  }
  return (
    <p className="card-text">
      {item.discount > 0 && (
        <span className="badge bg-primary align-self-center px-3 py-3 font-16 num fw-bold rounded-2 minus">
          {item.discount} %
        </span>
      )}
      <strong className="ms-1 font-16 num fw-bold price won"> {nf(item.price)}</strong>
      {item.discount > 0 && (
        <s className="ms-1 font-12 num consumer_price won"> {nf(item.consumer_price)}</s>
      )}
    </p>
  );
}

/**
 * 모바일 결제하기 폼 + 오케스트레이션 (legacy `mobile/order/settle.html` checkoutFrm + order_info + PG SDK).
 * 파일럿: 0원(full-discount)·KCP(reserve→가상계좌 confirm/KCP_Pay_Execute_Web). toss/naverpay/payco 후속.
 * 구조 parity — 실제 결제는 백엔드 reserve/승인 + KCP merchant 필요. PC `SettleCheckout`과 로직 동일(마크업만 모바일).
 */
export function MobileSettleCheckout({ ctx }: { ctx: MobileSettleContext }) {
  const orderInfoRef = useRef<HTMLFormElement>(null);
  const isVbank = ctx.settle_kind === "SC0040";
  const isDelivery = ctx.items.some((it) => it.delivery_type === "2" || it.delivery_type === "3");
  const totalDiscount = ctx.total_goods_price - ctx.total_order_price;

  // 가상계좌 입력(SC0040)
  const [vaName, setVaName] = useState(ctx.buyr_name);
  const [vaBankcode, setVaBankcode] = useState(VA_BANKS[0][0]);
  const [vaReceiptGubn, setVaReceiptGubn] = useState("");
  const [vaTaxno, setVaTaxno] = useState("");

  // legacy: m_Completepayment 전역(kcp_spay_hub.js보다 먼저). KCP 인증완료 콜백.
  useEffect(() => {
    const w = window as unknown as {
      m_Completepayment?: (formOrJson: unknown, closeEvent: () => void) => void;
      GetField?: (form: HTMLFormElement, formOrJson: unknown) => void;
    };
    w.m_Completepayment = (formOrJson, closeEvent) => {
      const frm = orderInfoRef.current;
      if (!frm) return;
      w.GetField?.(frm, formOrJson);
      const resCd = (frm.elements.namedItem("res_cd") as HTMLInputElement | null)?.value;
      if (resCd === "0000") {
        frm.submit();
      } else {
        const resMsg = (frm.elements.namedItem("res_msg") as HTMLInputElement | null)?.value;
        alert(`[${resCd}] ${resMsg}`);
        closeEvent();
      }
    };
  }, []);

  const buildPayload = (): Record<string, string> => ({
    settle_no: ctx.settle_no,
    settlekind: ctx.settle_kind,
    pg_provider: ctx.pg_provider,
    use_emoney: String(ctx.use_emoney),
    zipcode: ctx.zipcode,
    address: ctx.address,
    address2: ctx.address2,
    buyr_name: ctx.buyr_name,
    buyr_tel2: ctx.buyr_tel2,
    msg: ctx.msg,
    total_price: String(ctx.total_price),
    va_bankcode: vaBankcode,
    va_name: vaName,
    va_receipt_gubn: vaReceiptGubn,
    va_taxno: vaTaxno,
  });

  const setOrderInfoField = (name: string, value: string) => {
    const el = orderInfoRef.current?.elements.namedItem(name) as HTMLInputElement | null;
    if (el) el.value = value;
  };

  const onCheckout = async () => {
    gtag("event", "add_payment_info", {
      currency: "KRW",
      value: ctx.total_price,
      payment_type: ctx.settle_kind_label,
      items: ctx.items.map((it) => ({ item_id: it.goods_sku, item_name: it.product_name })),
    });

    if (ctx.total_price === 0) {
      // 0원 전액할인 (legacy order_full_discount.php → 반환 URL 이동)
      const url = await postFullDiscount(buildPayload());
      window.location.href = url;
      return;
    }

    switch (ctx.pg_provider) {
      case "kcp": {
        const data = await postKcpReserve(buildPayload());
        if (data.code === "NG") {
          alert("로그인 해 주세요");
          location.reload();
        } else if (data.code === "NG_POINT") {
          alert("보유한 포인트보다 많은 포인트는 사용하실 수 없습니다.");
          location.href =
            "/order/order_fail?msg=보유한 포인트보다 많은 포인트는 사용하실 수 없습니다.";
        } else if (data.code === "1") {
          if (confirm("가상계좌로 주문하시겠습니까?")) {
            setOrderInfoField("res_cd", data.res_cd ?? "");
            setOrderInfoField("res_msg", data.res_msg ?? "");
            setOrderInfoField("use_pay_method", data.use_pay_method ?? "");
            setOrderInfoField("va_bankcode", vaBankcode);
            setOrderInfoField("va_name", vaName);
            setOrderInfoField("va_receipt_gubn", vaReceiptGubn);
            setOrderInfoField("va_taxno", vaTaxno);
            orderInfoRef.current?.submit();
          }
        } else if (data.code === "0") {
          // KCP 결제창 호출 (SDK)
          const w = window as unknown as { KCP_Pay_Execute_Web?: (form: HTMLFormElement) => void };
          try {
            if (orderInfoRef.current) w.KCP_Pay_Execute_Web?.(orderInfoRef.current);
          } catch {
            /* IE 정상종료 throw 무시 (legacy 동일) */
          }
        }
        break;
      }
      // toss/naverpay/payco: 후속 단위 (미배선)
      default:
        break;
    }
  };

  return (
    <>
      <form id="checkoutFrm" method="post" onSubmit={(e) => e.preventDefault()}>
        <input type="hidden" name="settlekind" value={ctx.settle_kind} readOnly />
        <input type="hidden" name="pg_provider" value={ctx.pg_provider} readOnly />
        <input type="hidden" name="use_emoney" value={ctx.use_emoney} readOnly />
        <input type="hidden" name="zipcode" value={ctx.zipcode} readOnly />
        <input type="hidden" name="address" value={ctx.address} readOnly />
        <input type="hidden" name="address2" value={ctx.address2} readOnly />
        <input type="hidden" name="buyr_name" value={ctx.buyr_name} readOnly />
        <input type="hidden" name="buyr_tel2" value={ctx.buyr_tel2} readOnly />
        <input type="hidden" name="msg" value={ctx.msg} readOnly />

        {/* 주문상품정보 */}
        <div className="section full px-3 pt-2">
          <div className="section-title">주문상품정보</div>
          {ctx.items.map((item) => (
            <div className="card cart-item mb-2 rounded-0" key={item.goods_sku}>
              <input type="hidden" name="goods_sku[]" value={item.goods_sku} />
              <img
                src={`/upload/product/${item.product_code}/header/header.jpg`}
                alt="product"
                className="card-img-top rounded-0"
              />
              <div className="card-body">
                <h5 className="card-title fs-4 mb-2">{item.product_name}</h5>
                <ItemPrice item={item} />
              </div>
            </div>
          ))}
        </div>

        {/* 배송지 (실물 시) */}
        {isDelivery && (
          <div className="section full px-3 mb-2">
            <div className="section-title">배송지</div>
            <div className="wide-block px-0">
              <ul className="listview flush transparent">
                <li>우편번호: {ctx.zipcode}</li>
                <li>
                  주소: {ctx.address} {ctx.address2}
                </li>
                <li>주문자 이름: {ctx.buyr_name}</li>
                <li>휴대폰번호: {ctx.buyr_tel2}</li>
                <li>배송요청 메시지: {ctx.msg}</li>
              </ul>
            </div>
          </div>
        )}

        {/* 결제수단 */}
        <div className="section full px-3 mb-2">
          <div className="section-title">결제수단</div>
          <div className="wide-block p-2">{ctx.settle_kind_label}</div>
        </div>

        {/* SC0040 가상계좌 필드 */}
        {isVbank && (
          <div className="section full px-3 mb-2">
            <div className="wide-block p-2">
              <label htmlFor="va_name">입금자명</label>
              <input
                type="text"
                className="form-control"
                name="va_name"
                value={vaName}
                onChange={(e) => setVaName(e.target.value)}
              />
              <label htmlFor="va_bankcode">은행</label>
              <select
                name="va_bankcode"
                className="form-select"
                value={vaBankcode}
                onChange={(e) => setVaBankcode(e.target.value)}
              >
                {VA_BANKS.map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
              <label htmlFor="va_receipt_gubn">현금영수증 구분</label>
              <select
                name="va_receipt_gubn"
                className="form-select"
                id="va_receipt_gubn"
                value={vaReceiptGubn}
                onChange={(e) => setVaReceiptGubn(e.target.value)}
              >
                <option value="">미발급</option>
                <option value="1">소득공제용 (개인)</option>
                <option value="2">지출증빙용 (사업자)</option>
              </select>
              <label htmlFor="va_taxno">현금영수증 식별번호</label>
              <input
                type="number"
                className="form-control"
                name="va_taxno"
                id="va_taxno"
                value={vaTaxno}
                onChange={(e) => setVaTaxno(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* 최종 결제 금액 */}
        <div className="section full px-3 mb-2">
          <div className="section-title">최종 결제 금액</div>
          <div className="card">
            <ul className="listview flush transparent">
              <li className="d-flex">
                총 상품 가격{" "}
                <span className="num won" id="total_goods_price">
                  {" "}
                  {nf(ctx.total_goods_price)}
                </span>
              </li>
              <li className="d-flex text-danger">
                총 할인{" "}
                <span className="num text-danger m-won" id="total_discount_price">
                  {" "}
                  {nf(totalDiscount)}
                </span>
              </li>
              {ctx.use_emoney > 0 && (
                <li className="d-flex text-danger">
                  포인트 할인{" "}
                  <span className="num text-danger m-won" id="total_point">
                    {" "}
                    {nf(ctx.use_emoney)}
                  </span>
                </li>
              )}
              <li className="d-flex text-primary fw-bold">
                총 결제 금액{" "}
                <span className="num fw-bold won" id="total_price" data-total={ctx.total_price}>
                  {" "}
                  {nf(ctx.total_price)}
                </span>
              </li>
            </ul>
          </div>
        </div>
        <input type="hidden" name="total_price" value={ctx.total_price} readOnly />

        <div className="section mb-2">
          <button
            type="button"
            className="btn btn-primary btn-lg btn-block"
            id="btn_checkout"
            onClick={onCheckout}
          >
            결제하기
          </button>
        </div>
      </form>

      {/* KCP 승인 폼 (legacy order_info → /order/<pg>/kcp_api_pay.php). 구조 재현 — 실제 승인은 백엔드/KCP. */}
      <form
        name="order_info"
        ref={orderInfoRef}
        method="post"
        action={`/order/${ctx.pg_provider}/kcp_api_pay.php`}
      >
        <input type="hidden" name="req_tx" value="pay" />
        <input type="hidden" name="shop_name" value="direct games" />
        <input type="hidden" name="site_cd" value={ctx.site_cd} />
        <input type="hidden" name="currency" value="410" />
        <input type="hidden" name="ordr_idxx" value={ctx.settle_no} />
        <input type="hidden" name="good_mny" value={ctx.total_price} />
        <input type="hidden" name="good_cd" value={ctx.good_cd} />
        <input type="hidden" name="good_name" value={ctx.good_name} />
        <input type="hidden" name="shop_user_id" value={ctx.shop_user_id} />
        <input type="hidden" name="buyr_name" value={ctx.buyr_name} />
        <input type="hidden" name="buyr_tel2" value="010-0000-0000" />
        <input type="hidden" name="buyr_mail" value={ctx.shop_user_id} />
        <input type="hidden" name="res_cd" value="" />
        <input type="hidden" name="res_msg" value="" />
        <input type="hidden" name="enc_info" value="" />
        <input type="hidden" name="enc_data" value="" />
        <input type="hidden" name="escw_used" value={ctx.escw_used} />
        <input type="hidden" name="pay_method" value="" />
        <input type="hidden" name="use_pay_method" value="" />
        <input type="hidden" name="van_code" value="" />
        {ctx.escw_used === "Y" && (
          <>
            <input type="hidden" name="bask_cntx" value={ctx.items.length} />
            <input type="hidden" name="good_info" value={ctx.good_info} />
            <input type="hidden" name="pay_mod" value="Y" />
            <input type="hidden" name="deli_term" value="3" />
            <input type="hidden" name="rcvr_name" value={ctx.buyr_name} />
            <input type="hidden" name="rcvr_tel1" value={ctx.buyr_tel2} />
            <input type="hidden" name="rcvr_tel2" value="" />
            <input type="hidden" name="rcvr_mail" value={ctx.shop_user_id} />
            <input type="hidden" name="rcvr_zipx" value={ctx.zipcode} />
            <input type="hidden" name="rcvr_add1" value={ctx.address} />
            <input type="hidden" name="rcvr_add2" value={ctx.address2} />
          </>
        )}
        <input type="hidden" name="quotaopt" value="12" />
        <input type="hidden" name="tablet_size" value="1.0 " />
        <input type="hidden" name="param_opt_1" value={ctx.m_no} />
        <input type="hidden" name="param_opt_2" value={ctx.use_emoney} />
        <input type="hidden" name="param_opt_3" value="" />
        <input type="hidden" name="approval_key" id="approval" value="" />
        <input type="hidden" name="traceNo" value="" />
        <input type="hidden" name="PayUrl" value="" />
        <input type="hidden" name="encoding_trans" value="UTF-8" />
        {isVbank && (
          <>
            <input type="hidden" name="va_bankcode" value="" />
            <input type="hidden" name="va_receipt_gubn" value="" />
            <input type="hidden" name="va_taxno" value="" />
            <input type="hidden" name="va_name" value="" />
          </>
        )}
      </form>

      {/* PG SDK (legacy): payco.js 항상, kcp_spay_hub.js는 pg=kcp. 구조 재현. */}
      <Script
        src="https://static-bill.nhnent.com/payco/checkout/js/payco.js"
        strategy="afterInteractive"
      />
      {ctx.pg_provider === "kcp" && (
        <Script src="https://spay.kcp.co.kr/plugin/kcp_spay_hub.js" strategy="afterInteractive" />
      )}
    </>
  );
}
