import {
  buildKcpGoodInfo,
  getSettleKindMapping,
  type OrderItem,
  type SettleInit,
} from "@entities/order";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobileSettleCheckout, type MobileSettleContext } from "./mobile-settle-checkout";

const sellPrice = (item: OrderItem) =>
  item.promotion && item.promotion.sale_price > 0 ? item.promotion.sale_price : item.price;

export interface MobileSettleQuery {
  settle_kind: string;
  use_emoney: string;
  emoney_chk: string;
  zipcode: string;
  address: string;
  address2: string;
  buyr_name: string;
  buyr_tel2: string;
  msg: string;
}

/**
 * SettleContext 조립 (legacy settle.html 서버 블록 — 매핑/settle_no/파생값).
 * PC `order-settle-screen`의 buildContext와 동일 로직(엔티티 헬퍼 공유, FSD상 조립부만 복제).
 */
function buildContext(query: MobileSettleQuery, init: SettleInit): MobileSettleContext {
  const useEmoney = query.emoney_chk === "Y" ? Number(query.use_emoney) || 0 : 0;
  const mapping = getSettleKindMapping(query.settle_kind);
  const hasPg = mapping.pg_provider !== "";
  // legacy: settle_no="" → DG+time, settle_kind=DG0000, label 전액할인
  const settleNo = hasPg ? mapping.prefix + init.settle_no_seq : `DG${Date.now()}`;
  const settleKind = hasPg ? query.settle_kind : "DG0000";
  const baseLabel = hasPg ? mapping.label : "전액할인";

  const buyrName = query.buyr_name || init.buyr_name_fallback;
  const items = init.items;

  const totalOrderPrice = items.reduce((s, it) => s + sellPrice(it), 0);
  const totalGoodsPrice = items.reduce((s, it) => s + it.consumer_price, 0);
  const totalPrice = totalOrderPrice - useEmoney;

  // legacy: use_emoney>0 && (total_price - use_emoney)==0 → "전액할인" (verbatim)
  const settleKindLabel = useEmoney > 0 && totalPrice - useEmoney === 0 ? "전액할인" : baseLabel;

  const suffix = items.length > 1 ? ` 외 ${items.length - 1}개` : "";
  const goodName = (items[0]?.product_name ?? "") + suffix;
  const goodCd = (items[0]?.goods_sku ?? "") + suffix;
  const goodInfo = buildKcpGoodInfo(items, settleNo);

  return {
    settle_no: settleNo,
    settle_kind: settleKind,
    pg_provider: mapping.pg_provider,
    pay_method: mapping.pay_method ?? "",
    site_cd: mapping.site_cd ?? "",
    escw_used: mapping.escw_used ?? "",
    deli_term: mapping.deli_term ?? "",
    settle_kind_label: settleKindLabel,
    items,
    use_emoney: useEmoney,
    zipcode: query.zipcode,
    address: query.address,
    address2: query.address2,
    buyr_name: buyrName,
    buyr_tel2: query.buyr_tel2,
    msg: query.msg,
    total_order_price: totalOrderPrice,
    total_goods_price: totalGoodsPrice,
    total_price: totalPrice,
    good_name: goodName,
    good_cd: goodCd,
    good_info: goodInfo,
    shop_user_id: init.shop_user_id,
    m_no: init.m_no,
  };
}

/**
 * 모바일 결제하기 (legacy `mobile/order/settle.html`).
 * 서버 셸: MobileSubHeader("결제하기") + `#appCapsuleSub.full-height` + buildContext + checkoutFrm/order_info(client).
 * 파일럿: 0원·KCP. 로그인·항목0 가드는 route.
 */
export function MobileOrderSettleScreen({
  query,
  init,
}: {
  query: MobileSettleQuery;
  init: SettleInit;
}) {
  const ctx = buildContext(query, init);

  return (
    <>
      <MobileSubHeader pageTitle="결제하기" />
      <div id="appCapsuleSub" className="full-height">
        <MobileSettleCheckout ctx={ctx} />
      </div>
    </>
  );
}
