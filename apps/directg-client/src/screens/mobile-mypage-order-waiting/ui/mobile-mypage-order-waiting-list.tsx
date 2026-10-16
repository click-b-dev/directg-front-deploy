"use client";

import { useState, useTransition } from "react";

import { loadMoreWaiting } from "../api/load-more-waiting";
import type { MobileWaitingCard } from "../lib/flatten-waiting";

interface MobileMypageOrderWaitingListProps {
  initialList: MobileWaitingCard[];
  totalPages: number;
}

/** shipment_status → 배송상태 라벨(legacy Order::getShipmentStatus). 미해당 빈 문자열. */
function shipmentStatusLabel(shipmentStatus: string | null): string {
  switch (shipmentStatus) {
    case "2":
      return "배송대기";
    case "3":
      return "배송준비";
    case "4":
      return "배송중";
    case "5":
      return "배송완료";
    case "6":
      return "구매확정";
    default:
      return "";
  }
}

/**
 * 모바일 입금대기 카드 목록 + "더보기" 증분 (legacy `mypage_order_wating.html` #order_list + #btn_paging).
 * delivery_type==1 → deposit_status 입금대기(warning)/입금마감(danger). ≠1 → 배송상태 배지(bg-secondary).
 * total==page 시 alert "마지막페이지입니다"(legacy).
 */
export function MobileMypageOrderWaitingList({
  initialList,
  totalPages,
}: MobileMypageOrderWaitingListProps) {
  const [items, setItems] = useState<MobileWaitingCard[]>(initialList);
  const [dataPage, setDataPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const handleMore = () => {
    if (totalPages === dataPage) {
      window.alert("마지막페이지입니다");
      return;
    }
    const nextPage = dataPage + 1;
    startTransition(async () => {
      const more = await loadMoreWaiting(nextPage);
      setItems((prev) => [...prev, ...more]);
      setDataPage(nextPage);
    });
  };

  return (
    <>
      <div className="section mt-2" id="order_list">
        {items.map((data, index) => {
          const isCode = data.delivery_type === "1";
          const depositClosed = data.deposit_status === "closed";
          const showTracking =
            data.shipment_status === "4" ||
            data.shipment_status === "5" ||
            data.shipment_status === "6";
          return (
            <div className="card mb-2" key={index}>
              <div className="card-header">
                <div className="d-flex justify-content-between">
                  <div>{data.order_date.substring(0, 10)}</div>
                  <div className="in">
                    <a
                      href={`/mypage/mypage_order_wating_view?settle_no=${data.settle_no}`}
                      className="item"
                    >
                      상세보기
                    </a>
                  </div>
                </div>
              </div>
              <div className="card-body p-2" style={{ background: "#191919" }}>
                {isCode && (
                  <span className={`badge ${depositClosed ? "bg-danger" : "bg-warning"}`}>
                    {depositClosed ? "입금마감" : "입금대기"}
                  </span>
                )}
                {!isCode && (
                  <span className="badge bg-secondary">
                    {shipmentStatusLabel(data.shipment_status)}
                  </span>
                )}
                <p className="mt-2 card-text">{data.product_name}</p>
                <p className="card-text">
                  <span className="num">{data.price.toLocaleString()}</span> 원{" "}
                </p>
              </div>
              {showTracking && (
                <div className="card-footer">
                  <button type="button" className="btn btn-primary btn-block">
                    배송조회
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="wide-block pt-2 pb-2 border-0 dg_bg">
        <button
          type="button"
          className="btn btn-secondary btn-block"
          data-page={dataPage}
          data-total={totalPages}
          id="btn_paging"
          onClick={handleMore}
          disabled={isPending}
        >
          ({" "}
          <span className="px-1" id="current_page">
            {dataPage}
          </span>{" "}
          /{" "}
          <span className="px-1" id="total_page">
            {totalPages}
          </span>{" "}
          ) 더보기
        </button>
      </div>
    </>
  );
}
