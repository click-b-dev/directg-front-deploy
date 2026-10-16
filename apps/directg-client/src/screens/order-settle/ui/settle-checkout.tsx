"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

import { postFullDiscount, postKcpReserve, type OrderItem } from "@entities/order";

const nf = (value: number) => value.toLocaleString("en-US");

function gtag(...args: unknown[]) {
  (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.(...args);
}

/** 타입 badge (legacy settle.html — basic→info/edition→primary, cart식). */
function typeBadge(item: OrderItem): { text: string; className: string } | null {
  const { game_type, display_type } = item;
  if (game_type === "game") {
    if (display_type === "basic")
      return { text: "기본게임", className: "bg-info rounded-0 font-12 py-2" };
    if (display_type === "edition")
      return { text: "에디션", className: "bg-primary rounded-0 font-12 py-2" };
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

/** 플랫폼 아이콘 (legacy settle.html — PNG 로고 w-50). */
function platformIcon(platform: string) {
  const map: Record<string, string> = {
    "1": "/assets/images/platform/Platform_logo_steam.png",
    "34": "/assets/images/platform/Platform_logo_epic.png",
    "35": "/assets/images/platform/Platform_logo_rockstar.png",
    "51": "/assets/images/platform/holomodels.svg",
  };
  const src = map[platform];
  if (!src) return null;
  return (
    <div className="text-center mt-3">
      <img className="mx-auto d-block w-50" src={src} alt="" />
    </div>
  );
}

export interface SettleContext {
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

/**
 * 결제하기 폼 + 오케스트레이션 (legacy `settle.html` checkoutFrm + order_info + PG SDK).
 * 파일럿: 0원(full-discount)·KCP(reserve→가상계좌 confirm/KCP_Pay_Execute_Web). toss/naverpay/payco 후속.
 * 구조 parity — 실제 결제는 백엔드 reserve/승인 + KCP merchant 필요.
 */
export function SettleCheckout({ ctx }: { ctx: SettleContext }) {
  const orderInfoRef = useRef<HTMLFormElement>(null);
  const isVbank = ctx.settle_kind === "SC0040";

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
      <form
        id="checkoutFrm"
        method="post"
        className="row mb-5"
        onSubmit={(e) => e.preventDefault()}
      >
        <input type="hidden" name="settle_no" value={ctx.settle_no} readOnly />
        <input type="hidden" name="settlekind" value={ctx.settle_kind} readOnly />
        <input type="hidden" name="pg_provider" value={ctx.pg_provider} readOnly />
        <input type="hidden" name="use_emoney" value={ctx.use_emoney} readOnly />
        <input type="hidden" name="zipcode" value={ctx.zipcode} readOnly />
        <input type="hidden" name="address" value={ctx.address} readOnly />
        <input type="hidden" name="address2" value={ctx.address2} readOnly />
        <input type="hidden" name="buyr_name" value={ctx.buyr_name} readOnly />
        <input type="hidden" name="buyr_tel2" value={ctx.buyr_tel2} readOnly />
        <input type="hidden" name="msg" value={ctx.msg} readOnly />

        <div className="col-12">
          <h3>주문상품정보</h3>
          <table
            className="table table-bordered table-centered caption-top mb-4 shadow-none"
            id="order_table"
            cellSpacing={0}
          >
            <caption className="font-14 text-white">상품수 ( 총 {ctx.items.length} 개 )</caption>
            <thead className="table-light font-14">
              <tr>
                <th scope="col" className="text-center fw-500">
                  상품정보
                </th>
                <th scope="col" className="text-center fw-500" style={{ width: "180px" }}>
                  가격정보
                </th>
              </tr>
            </thead>
            <tbody className="table-dark">
              {ctx.items.map((item) => {
                const badge = typeBadge(item);
                return (
                  <tr key={item.goods_sku}>
                    <td className="p-0">
                      <input type="hidden" name="goods_sku[]" value={item.goods_sku} />
                      <div className="card rounded-0 border-0 bg-table-dark">
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
                          <div className="col-md-9">
                            <div className="row g-0 overflow-hidden flex-md-row shadow-sm position-relative">
                              <div className="p-2 d-flex flex-column position-static align-content-start">
                                <div className="mb-2">
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
                            {item.promotion ? (
                              <>
                                <span className="badge bg-danger align-self-center px-3 py-2 font-14 num minus">
                                  {item.promotion.discount_rate} %
                                </span>
                                <div className="d-flex flex-column align-items-end">
                                  <s className="text-muted font-11 num won">
                                    {" "}
                                    {nf(item.consumer_price)}
                                  </s>
                                  <span className="text-white fw-bold font-14 num won">
                                    {" "}
                                    {nf(item.promotion.sale_price)}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                {item.discount > 0 ? (
                                  <span className="badge bg-primary align-self-center px-3 py-2 font-14 num minus">
                                    {item.discount} %
                                  </span>
                                ) : (
                                  <span></span>
                                )}
                                <div className="d-flex flex-column align-items-end">
                                  <s className="text-muted font-11 num won">
                                    {" "}
                                    {nf(item.consumer_price)}
                                  </s>
                                  <span className="text-white fw-bold font-14 num won">
                                    {" "}
                                    {nf(item.price)}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <input type="hidden" name="total_price" value={ctx.total_price} readOnly />
            </tbody>
          </table>
        </div>

        <div className="col-8">
          {ctx.zipcode && (
            <>
              <h3>배송지</h3>
              <div className="card rounded-0 bg-table-dark mb-5">
                <div className="card-body">
                  <p className="card-text">우편번호: {ctx.zipcode}</p>
                  <p className="card-text">
                    주소: {ctx.address} {ctx.address2}
                  </p>
                  <p className="card-text">주문자 이름: {ctx.buyr_name}</p>
                  <p className="card-text">주문자 휴대폰번호: {ctx.buyr_tel2}</p>
                  <p className="card-text">배송요청 메세지: {ctx.msg}</p>
                </div>
              </div>
            </>
          )}

          <div className="card rounded-0 bg-table-dark mb-5">
            <div className="card-header">
              <h5 className="card-title">결제수단</h5>
            </div>
            <div className="card-body">
              <p className="card-text">{ctx.settle_kind_label}</p>
            </div>
            {isVbank && (
              <div className="card-footer row">
                <div className="col-2 mb-2">입금자명</div>
                <div className="col-10 mb-2">
                  <input
                    type="text"
                    className="form-control"
                    name="va_name"
                    value={vaName}
                    onChange={(e) => setVaName(e.target.value)}
                  />
                </div>
                <div className="col-2 mb-2">은행</div>
                <div className="col-10 mb-2">
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
                </div>
                <div className="col-2 mb-2">현금영수증 구분</div>
                <div className="col-10 mb-2">
                  <select
                    name="va_receipt_gubn"
                    className="form-select"
                    id="va_receipt_gubn"
                    value={vaReceiptGubn}
                    onChange={(e) => setVaReceiptGubn(e.target.value)}
                  >
                    <option value="">미발급</option>
                    <option value="0">소득공제용 (개인)</option>
                    <option value="1">지출증빙용 (사업자)</option>
                  </select>
                </div>
                <div className="col-2">
                  <span id="va_taxn_type">현금영수증 식별번호</span>
                </div>
                <div className="col-10">
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
          </div>

          {ctx.use_emoney > 0 && (
            <div className="card rounded-0 bg-table-dark">
              <div className="card-header">
                <h5 className="card-title">포인트 사용</h5>
              </div>
              <div className="card-body">
                <p className="card-text">{nf(ctx.use_emoney)} 원</p>
              </div>
            </div>
          )}
        </div>

        <div className="col-4">
          <div className="border border-2 border-primary px-3 py-2 rounded-0 bg-light">
            <h3 className="header-title font-16 py-3">최종 결제 금액</h3>
            <hr />
            <div className="list-group border-0 mb-2 rounded-0">
              <div className="list-group-item py-3 bg-light">
                <div className="d-flex w-100 justify-content-between">
                  <span className="font-14">총 주문 금액 </span>
                  <span className="num font-14 won"> {nf(ctx.total_order_price)}</span>
                </div>
              </div>
              {ctx.use_emoney > 0 && (
                <div className="list-group-item py-3 bg-light">
                  <div className="d-flex w-100 justify-content-between">
                    <span className="font-14">포인트 할인 </span>
                    <span className="num font-14 text-danger">
                      - <span className="won"> {nf(ctx.use_emoney)} </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
            <hr />
            <div className="w-100 text-end mb-3 px-3 text-primary">
              <div className="d-flex w-100 justify-content-between">
                <strong className="font-16">총 결제금액 </strong>
                <span className="num font-16 fw-bold">
                  {" "}
                  <span id="total_amount" className="won" data-total={ctx.total_price}>
                    {" "}
                    {nf(ctx.total_price)}
                  </span>
                </span>
              </div>
            </div>
            <hr />
            <div className="d-grid">
              <button
                type="button"
                className="btn btn-lg btn-primary shadow-none"
                id="btn_checkout"
                onClick={onCheckout}
              >
                결제하기
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* KCP 승인 폼 (legacy order_info → /order/<pg>/kcp_api_pay.php). 구조 재현 — 실제 승인은 백엔드/KCP. */}
      <form
        name="order_info"
        ref={orderInfoRef}
        method="post"
        action={`/order/${ctx.pg_provider}/kcp_api_pay.php`}
      >
        <input type="hidden" name="site_cd" value={ctx.site_cd} />
        <input type="hidden" name="site_name" value="direct games" />
        <input type="hidden" name="pay_method" value={ctx.pay_method} />
        <input type="hidden" name="ordr_idxx" value={ctx.settle_no} />
        <input type="hidden" name="good_mny" value={ctx.total_price} />
        <input type="hidden" name="good_cd" value={ctx.good_cd} />
        <input type="hidden" name="good_name" value={ctx.good_name} />
        <input type="hidden" name="currency" value="KRW" />
        <input type="hidden" name="escw_used" value={ctx.escw_used} />
        <input type="hidden" name="pay_mod" value={ctx.escw_used} />
        <input type="hidden" name="shop_user_id" value={ctx.shop_user_id} />
        <input type="hidden" name="buyr_name" value={ctx.buyr_name} />
        <input type="hidden" name="buyr_tel2" value={ctx.buyr_tel2} />
        <input type="hidden" name="buyr_mail" value={ctx.shop_user_id} />
        <input type="hidden" name="rcvr_name" value={ctx.buyr_name} />
        <input type="hidden" name="rcvr_tel1" value={ctx.buyr_tel2} />
        <input type="hidden" name="rcvr_tel2" value="" />
        <input type="hidden" name="rcvr_mail" value={ctx.shop_user_id} />
        <input type="hidden" name="rcvr_zipx" value={ctx.zipcode} />
        <input type="hidden" name="rcvr_add1" value={ctx.address} />
        <input type="hidden" name="rcvr_add2" value={ctx.address2} />
        <input type="hidden" name="bask_cntx" value={ctx.items.length} />
        <input type="hidden" name="good_info" value={ctx.good_info} />
        <input type="hidden" name="res_cd" value="" />
        <input type="hidden" name="res_msg" value="" />
        <input type="hidden" name="enc_info" value="" />
        <input type="hidden" name="enc_data" value="" />
        <input type="hidden" name="ret_pay_method" value="" />
        <input type="hidden" name="tran_cd" value="" />
        <input type="hidden" name="use_pay_method" value="" />
        <input type="hidden" name="ordr_chk" value="" />
        <input type="hidden" name="cash_yn" value="" />
        <input type="hidden" name="cash_tr_code" value="" />
        <input type="hidden" name="cash_id_info" value="" />
        <input type="hidden" name="va_bankcode" value="" />
        <input type="hidden" name="va_receipt_gubn" value="" />
        <input type="hidden" name="va_taxno" value="" />
        <input type="hidden" name="va_name" value="" />
        {ctx.escw_used === "Y" && <input type="hidden" name="deli_term" value={ctx.deli_term} />}
        {ctx.settle_kind === "SC0010" && (
          <>
            <input type="hidden" name="used_card_YN" value="Y" />
            <input
              type="hidden"
              name="used_card"
              value="CCLG:CCDI:CCLO:CCKE:CCSS:CCKM:CCBC:CCNH:CCHN:CCCT:CCWR:BC81:CCKK:CCKJ:CCSU:CCCJ:CCKD:CCSB:CCCU:CCPB:CCSM:CCKA"
            />
          </>
        )}
        {ctx.settle_kind === "SC0040" && <input type="hidden" name="vcnt_expire_term" value="" />}
        <input type="hidden" name="param_opt_1" value={ctx.m_no} />
        <input type="hidden" name="param_opt_2" value={ctx.use_emoney} />
        <input type="hidden" name="param_opt_3" value="" />
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
