import {
  buildKcpGoodInfo,
  getSettleKindMapping,
  type OrderItem,
  type SettleInit,
} from "@entities/order";
import { FooterBannerSection } from "@widgets/footer-banner-section";

import { SettleCheckout, type SettleContext } from "./settle-checkout";

const sellPrice = (item: OrderItem) =>
  item.promotion && item.promotion.sale_price > 0 ? item.promotion.sale_price : item.price;

export interface SettleQuery {
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

/** SettleContext 조립 (legacy settle.html 서버 블록 — 매핑/settle_no/파생값). */
function buildContext(query: SettleQuery, init: SettleInit): SettleContext {
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

  // legacy: use_emoney>0 && (total_price - use_emoney)==0 → "전액할인" (total_price는 이미 차감된 값, verbatim)
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
 * 결제하기 (legacy `pc/order/settle.html`). step nav(03) + 유의사항 + checkoutFrm/order_info(SettleCheckout) + footer_banner.
 * 파일럿: 0원·KCP. 로그인·항목0 가드는 route.
 */
export function OrderSettleScreen({ query, init }: { query: SettleQuery; init: SettleInit }) {
  const ctx = buildContext(query, init);

  return (
    <>
      {/* legacy settle.html 인라인 style. wrapper/header/footer는 (pc) 레이아웃 소유. */}
      <style>{`#price-summary{top:480px;}.bg-table-head{background:#303D4E;}`}</style>
      <main className="mb-5">
        <div className="container">
          <div className="row g-2 my-3">
            <div className="col-12">
              <div className="mb-3">
                <ul className="nav nav-pills nav-fill">
                  <li className="nav-item rounded-0 border-start border-top border-bottom py-4">
                    <h4 className="list-group-item-heading fw-bold mb-0">01 장바구니</h4>
                  </li>
                  <li className="nav-item rounded-0 border-start border-top border-bottom py-4">
                    <h4 className="list-group-item-heading mb-0">02 주문하기</h4>
                  </li>
                  <li className="nav-item rounded-0 border-primary bg-primary py-4">
                    <h4 className="list-group-item-heading mb-0">03 결제하기</h4>
                  </li>
                  <li className="nav-item rounded-0 border-start border-top border-bottom border-end py-4">
                    <h4 className="list-group-item-heading mb-0">04 주문완료</h4>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="order_msg">
                <div className="alert alert-light font-15 bg-body rounded-0 border-0" role="alert">
                  <ul className="list-group list-group-flush p-0">
                    <li className="list-group-item border-0">
                      <span className="text-warning">
                        <i className="fa-solid fa-triangle-exclamation"></i> 주문자의 의한
                        주문실수는 환불사유에 해당되지 않습니다. 선택하신 상품의 이름, 플랫폼, 가격,
                        지역, 중복구매여부 등의 정보를 다시 한 번 확인해 주시기 바랍니다.
                      </span>
                    </li>
                    <li className="list-group-item border-0">
                      <span className="text-danger">
                        <i className="fa-solid fa-triangle-exclamation"></i> 다이렉트 게임즈에서는
                        제품코드(키)를 활성화하지 않은 주문건에 한하여, 주문일로부터 7일 이내에
                        취소가 가능합니다. 자세한 사항은{" "}
                        <a href="/service/refund_policy" target="_blank">
                          [환불정책]
                        </a>
                        을 확인해 주시기 바랍니다.
                      </span>
                    </li>
                    <li className="list-group-item border-0">
                      <span className="text-warning">
                        <i className="fa-solid fa-triangle-exclamation"></i> 다이렉트 게임즈에서는
                        공급수량 및 시스템 안정을 위해 계정당 최대 주문수량을 제한하고 있습니다.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <SettleCheckout ctx={ctx} />

          {/* 기획 고정 배너2 */}
          <FooterBannerSection />
        </div>
      </main>
    </>
  );
}
