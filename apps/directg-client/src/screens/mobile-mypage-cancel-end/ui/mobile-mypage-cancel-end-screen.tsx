import type { CancelEndItem } from "@entities/mypage-order";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

/**
 * 모바일 마이페이지 - 취소완료 내역 (legacy `mobile/mypage/mypage_cancel_end.html`).
 * 검색폼/더보기/페이지네이션/빈메시지·인터랙션 없음. status 9 카드 목록만.
 * 배지는 하드코딩 "취소완료"(getOrderStatus 미사용), 상세보기는 order_view(PC의 cancel_view와 다름).
 */
export function MobileMypageCancelEndScreen({ list }: { list: CancelEndItem[] }) {
  return (
    <>
      <MobileSubHeader pageTitle="취소 완료 내역" />
      <div id="appCapsuleSub">
        {list.map((data, index) => (
          <div className="section mt-2" key={index}>
            <div className="card">
              <div className="card-header">
                <div className="d-flex justify-content-between">
                  <div>{data.order_date.substring(0, 10)}</div>
                  <div className="in">
                    <a
                      href={`/mypage/mypage_order_view?settle_no=${data.settle_no}`}
                      className="item"
                    >
                      상세보기
                    </a>
                  </div>
                </div>
              </div>
              <div className="card-body py-2">
                <div className="mb-1">
                  <span className="badge bg-danger">취소완료</span>
                </div>
                <p className="card-text">{data.product_name}</p>
                <p className="card-text">
                  <span className="num">{data.price.toLocaleString()}</span> 원{" "}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
