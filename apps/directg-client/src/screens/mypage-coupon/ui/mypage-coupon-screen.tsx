import type { MypageCouponList } from "@entities/mypage-coupon";
import { CouponRegisterForm } from "@features/coupon-register";
import { MypageAside } from "@widgets/mypage-aside";
import { ServerPagination } from "@shared/ui/server-pagination";

interface MypageCouponScreenProps {
  data: MypageCouponList;
}

const nf = (value: number) => value.toLocaleString("en-US");

/** 마이페이지 — 쿠폰 내역 (legacy `pc/mypage/mypage_coupon.html`). 목록/페이지네이션은 서버, 등록 폼만 client. */
export function MypageCouponScreen({ data }: MypageCouponScreenProps) {
  const { list, page, totalPages } = data;

  return (
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <MypageAside active="coupon" />
        <section id="content" className="content rounded-0 font-14">
          <CouponRegisterForm />
          <div className="col-12">
            <table className="table table-bordered table-centered mb-0 text-center align-middle text-nowrap">
              <thead className="align-middle">
                <tr>
                  <th>등록일</th>
                  <th className="w-50">사유</th>
                  <th>포인트</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center">
                      쿠폰 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  list.map((value, index) => (
                    <tr key={value.regdt + index}>
                      <td>{value.regdt}</td>
                      <td className="text-start">{value.coupon_name}</td>
                      <td className="text-end won"> {nf(value.coupon_price)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div id="pagination" className="mt-4">
            <ServerPagination page={page} totalPages={totalPages} baseUrl="/mypage/mypage_coupon" />
          </div>
        </section>
      </main>
    </div>
  );
}
