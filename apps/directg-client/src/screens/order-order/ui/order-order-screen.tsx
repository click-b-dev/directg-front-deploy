import type { OrderCheckout } from "@entities/order";
import { FooterBannerSection } from "@widgets/footer-banner-section";

import { OrderForm } from "./order-form";

/** legacy toss 결제 이미지 기간게이트: 2026-03-19 00:00 ~ 2026-11-30 23:59:59 → settle_event.svg. */
const isTossEventOpen = (now: Date) =>
  now >= new Date("2026-03-19T00:00:00") && now < new Date("2026-11-30T23:59:59");

/**
 * 주문서 (legacy `pc/order/order.html`). step nav(02 active) + 유의사항 + OrderForm + footer_banner.
 * 항목/배송지/포인트/결제수단/제출은 OrderForm(client). 로그인·항목0 가드는 route.
 */
export function OrderOrderScreen({ checkout }: { checkout: OrderCheckout }) {
  return (
    <div className="container">
      {/* legacy order.html 인라인 style */}
      <style>{`#price-summary{top:480px;}.bg-table-head{background:#303D4E;}`}</style>
      <main className="mb-5">
        <div className="row g-0 my-3">
          <div className="col-12">
            {/* 주문하기 step */}
            <div className="mb-4">
              <ul className="nav nav-pills nav-fill">
                <li className="nav-item rounded-0 border-start border-top border-bottom py-4">
                  <h4 className="list-group-item-heading mb-0">01 장바구니</h4>
                </li>
                <li className="nav-item rounded-0 border-primary bg-primary py-4">
                  <h4 className="list-group-item-heading fw-bold mb-0">02 주문하기</h4>
                </li>
                <li className="nav-item rounded-0 border-start border-top border-bottom py-4">
                  <h4 className="list-group-item-heading mb-0">03 결제하기</h4>
                </li>
                <li className="nav-item rounded-0 border-start border-top border-bottom border-end py-4">
                  <h4 className="list-group-item-heading mb-0">04 주문완료</h4>
                </li>
              </ul>
            </div>

            <div className="cart_msg mb-4">
              <div className="alert alert-light font-15 rounded-0" role="alert">
                <ul className="list-group list-group-flush p-0 bg-light">
                  <li className="list-group-item border-0 bg-light">
                    <span className="text-warning">
                      <i className="fa-solid fa-triangle-exclamation"></i> 주문자에 의한 주문실수는
                      환불사유에 해당되지 않습니다. 선택하신 상품의 이름, 플랫폼, 가격, 지역,
                      중복구매여부 등의 정보를 다시 한 번 확인해 주시기 바랍니다.
                    </span>
                  </li>
                  <li className="list-group-item border-0 bg-light">
                    <span className="text-danger">
                      <i className="fa-solid fa-triangle-exclamation"></i> 다이렉트 게임즈에서는
                      제품코드(키)를 활성화하지 않은 주문건에 한하여, 주문일로부터 7일 이내에 취소가
                      가능합니다. 자세한 사항은{" "}
                      <a href="/service/refund_policy" target="_blank">
                        [환불정책]
                      </a>
                      을 확인해 주시기 바랍니다.
                    </span>
                  </li>
                  <li className="list-group-item border-0 bg-light">
                    <span className="text-warning">
                      <i className="fa-solid fa-triangle-exclamation"></i> 다이렉트 게임즈에서는
                      공급수량 및 시스템 안정을 위해 계정당 최대 주문수량을 제한하고 있습니다.
                    </span>
                  </li>
                  <li className="list-group-item border-0 bg-light">
                    <span className="text-warning">
                      <i className="fa-solid fa-triangle-exclamation"></i> 다이렉트 게임즈 포인트는
                      총 주문금액이 3,000원 이상일 때 100원 단위로 사용이 가능합니다.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <OrderForm
              items={checkout.items}
              member_emoney={checkout.member_emoney}
              member_address={checkout.member_address}
              is_delivery_address={checkout.is_delivery_address}
              showTossEvent={isTossEventOpen(new Date())}
            />
          </div>
        </div>

        {/* 기획 고정 배너2 */}
        <FooterBannerSection />
      </main>
    </div>
  );
}
