import type { GiftListResponse } from "@entities/mypage-gift";
import { MypageAside } from "@widgets/mypage-aside";

import { GiftList } from "./gift-list";

interface MypageGiftScreenProps {
  data: GiftListResponse;
}

/**
 * 사은품 내역 (legacy `pc/mypage/mypage_gift.html`). 세션. aside + 안내 + 사은품 표(client GiftList).
 * 가드는 route. 표/모달/Daum/배송조회는 GiftList(client)가 담당.
 */
export function MypageGiftScreen({ data }: MypageGiftScreenProps) {
  return (
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <MypageAside active="gift" />
        <section id="content" className="content rounded-0 font-14">
          <div className="col-12 mb-5">
            <div className="card shadow-none rounded-0">
              <div className="card-body p-3 overflow-auto">
                <p>※ 이벤트에 당첨된 내역과 사은품 확인이 가능합니다.</p>
                <p>※ 사전에 안내 된 기간 내에 수령하지 않은 사은품 내역은 삭제됩니다.</p>
                <p>※ 입력기한 내에 `배송주소입력`을 클릭하여 배송정보를 입력해주시기 바랍니다.</p>
              </div>
            </div>
          </div>

          <GiftList items={data.list} />
        </section>
      </main>
    </div>
  );
}
