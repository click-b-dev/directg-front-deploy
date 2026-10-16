import type { WishlistResponse } from "@entities/mypage-wishlist";
import { MypageAside } from "@widgets/mypage-aside";
import { FooterBannerSection } from "@widgets/footer-banner-section";

import { WishlistTable } from "./wishlist-table";

interface MypageWishlistScreenProps {
  data: WishlistResponse;
}

/**
 * 위시리스트 (legacy `pc/mypage/mypage_wishlist.html`). 세션 목록 + 체크박스/삭제/장바구니이동(client).
 * legacy: main 뒤 footer_banner 포함. 가드는 route.
 */
export function MypageWishlistScreen({ data }: MypageWishlistScreenProps) {
  return (
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <MypageAside active="wishlist" />
        <section id="content" className="content rounded-0 font-14">
          <WishlistTable items={data.list} page={data.page} totalPages={data.totalPages} />
        </section>
      </main>
      <FooterBannerSection />
    </div>
  );
}
