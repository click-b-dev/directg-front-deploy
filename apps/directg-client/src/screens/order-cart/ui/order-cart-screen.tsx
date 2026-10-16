import type { CartItem } from "@entities/cart";
import { FooterBannerSection } from "@widgets/footer-banner-section";

import { CartContent } from "./cart-content";

/**
 * 장바구니 (legacy `pc/order/cart.html`). 주문 step nav(01 active) + 유의사항 + 목록/합계/버튼 + footer_banner.
 * 목록/합계/삭제/주문submit은 CartContent(client). 로그인 가드는 route(`requireMemberSession`).
 */
export function OrderCartScreen({ items }: { items: CartItem[] }) {
  return (
    <div className="container">
      <main className="mb-5">
        <div className="row g-0 my-3">
          <div className="col-12">
            {/* 주문하기 step */}
            <div className="mb-4">
              <ul className="nav nav-pills nav-fill">
                <li className="nav-item rounded-0 border-primary bg-primary py-4">
                  <h4 className="list-group-item-heading fw-bold mb-0">01 장바구니</h4>
                </li>
                <li className="nav-item rounded-0 border-start border-top border-bottom py-4">
                  <h4 className="list-group-item-heading mb-0">02 주문하기</h4>
                </li>
                <li className="nav-item rounded-0 border-start border-top border-bottom py-4">
                  <h4 className="list-group-item-heading mb-0">03 결제하기</h4>
                </li>
                <li className="nav-item rounded-0 border-start border-top border-bottom border-end py-4">
                  <h4 className="list-group-item-heading mb-0">04 주문완료</h4>
                </li>
              </ul>
            </div>

            <div className="cart_msg bg-alert mb-4">
              <div className="alert font-14 rounded-0" role="alert">
                <ul className="list-group list-group-flush p-0">
                  <li className="list-group-item border-0 bg-alert">
                    <span className="text-warning">
                      <i className="fa-solid fa-triangle-exclamation"></i> 주문자의 의한 주문실수는
                      환불사유에 해당되지 않습니다. 선택하신 상품의 이름, 플랫폼, 가격, 지역,
                      중복구매여부 등의 정보를 다시 한 번 확인해 주시기 바랍니다.
                    </span>
                  </li>
                  <li className="list-group-item border-0 bg-alert">
                    <span className="text-warning">
                      <i className="fa-solid fa-triangle-exclamation"></i> 장바구니에 담긴 이후 상품
                      가격, 재고, 프로모션 여부, 특전제공 여부 등은 변경될 수 있습니다. 주문 전 다시
                      한 번 확인해 주시기 바랍니다.
                    </span>
                  </li>
                  <li className="list-group-item border-0 bg-alert">
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
                  <li className="list-group-item border-0 bg-alert">
                    <span className="text-warning">
                      <i className="fa-solid fa-triangle-exclamation"></i> 다이렉트 게임즈에서는
                      공급수량 및 시스템 안정을 위해 계정당 최대 주문수량을 제한하고 있습니다.
                    </span>
                  </li>
                  <li className="list-group-item border-0 bg-alert">
                    <span className="text-warning">
                      <i className="fa-solid fa-triangle-exclamation"></i> 랜덤박스 같은
                      이벤트상품과 예약상품은 단품 주문만 가능하며, 장바구니 주문은 지원하지
                      않습니다.
                    </span>
                  </li>
                  <li className="list-group-item border-0 bg-alert">
                    <span className="text-warning">
                      <i className="fa-solid fa-triangle-exclamation"></i> 장바구니에는 상품별로
                      1개씩, 최대 20개의 상품을 담을 수 있습니다.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <CartContent items={items} />
          </div>
        </div>

        {/* 기획 고정 배너2 */}
        <FooterBannerSection />
      </main>
    </div>
  );
}
