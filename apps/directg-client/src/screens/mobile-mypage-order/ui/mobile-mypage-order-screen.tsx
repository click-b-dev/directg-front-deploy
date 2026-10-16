import type { MypageOrderListResponse } from "@entities/mypage-order";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobileMypageOrderList } from "./mobile-mypage-order-list";

/** legacy `mypage_order.html` head `<style>`(searchbox dark). */
const ORDER_CSS = `
body.dark-mode-active .searchbox .form-control{
	color:#dee2e6;
}
`;

interface MobileMypageOrderScreenProps {
  data: MypageOrderListResponse;
  searchGoodsName: string;
}

/**
 * 모바일 마이페이지 - 주문완료 내역 (legacy `mobile/mypage/mypage_order.html`).
 * MobileSubHeader + 검색폼(native GET search_goods_name) + 주문 카드/더보기(client). 세션 가드·조회는 라우트.
 * 날짜/연도 radio는 legacy 주석처리 → 미이관.
 */
export function MobileMypageOrderScreen({ data, searchGoodsName }: MobileMypageOrderScreenProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ORDER_CSS }} />
      <MobileSubHeader pageTitle="주문완료 내역" />
      <div id="appCapsuleSub">
        <div className="section full py-2">
          <div className="wide-block">
            <form className="search-form" id="search-form" method="GET">
              <div className="form-group searchbox text-white mb-2">
                <input
                  type="text"
                  className="form-control"
                  name="search_goods_name"
                  defaultValue={searchGoodsName}
                  placeholder="검색어를 입력해 주세요."
                />
                <i className="input-icon">
                  <ion-icon name="search-outline" role="img" className="md hydrated"></ion-icon>
                </i>
              </div>
            </form>
          </div>
        </div>

        <MobileMypageOrderList
          initialList={data.list}
          totalPages={data.totalPages}
          searchProductName={searchGoodsName}
        />
      </div>
    </>
  );
}
