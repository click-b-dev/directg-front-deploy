import { useEffect } from "react";
import { useOrderDashboard } from "@entities/order-dashboard";
import type { OrderDashboard } from "@entities/order-dashboard";

// legacy pc/_Admin_/order/yjs_dashboard_order.php — "처리 필요" 6카드 모니터링 대시보드.
// (라이브 dashboard_order.php는 정적 껍데기였으나 개발자 지시로 yjs_ 변형본 채택.)
// docs/migration/admin/order/order-dashboard.md

// 연동없음(#5) 링크: order_success 기본 기간이 "오늘"이라 전체를 보도록 2020-01-01~오늘을 명시.
// legacy는 date('Y-m-d')(서버 로컬)로 오늘을 계산 — 렌더 시점 로컬 날짜로 재현.
const pad = (n: number) => String(n).padStart(2, "0");
const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const noneLink = () =>
  `/order/order_success?order_system=none&search_start_date=2020-01-01&search_end_date=${todayLocal()}`;

type CardDef = {
  key: keyof OrderDashboard;
  label: string;
  desc: string;
  url: string;
  icon: string;
};

// legacy $action_cards 순서 고정.
const cardDefs = (): CardDef[] => [
  {
    key: "key_fail",
    label: "키발급 실패",
    desc: "결제완료인데 키 미발급",
    url: "/order/order_ready",
    icon: "uil-exclamation-octagon",
  },
  {
    key: "cancel_req",
    label: "취소요청",
    desc: "취소요청 상태 대기",
    url: "/order/order_cancel_request",
    icon: "uil-history",
  },
  {
    key: "vbank",
    label: "가상계좌 입금대기",
    desc: "가상계좌 발급 후 미입금",
    url: "/order/order_vbank",
    icon: "uil-clock",
  },
  {
    key: "ship_pending",
    label: "실물 배송대기",
    desc: "배송 시작 전",
    url: "/order/order_shipment_pending",
    icon: "uil-truck",
  },
  {
    key: "no_system",
    label: "연동없음 의심",
    desc: "코드발송인데 연동시스템 없음",
    url: noneLink(),
    icon: "uil-question-circle",
  },
  {
    key: "pn_book",
    label: "PointNexus 미confirm",
    desc: "가상계좌 book 입금확인 대기",
    url: "/goods/pointnexus/pointnexus_book_confirm",
    icon: "uil-key-skeleton",
  },
];

// legacy 색상 규칙(124~133행): null=집계실패(경고) / >0=강조(빨강) / 0=정상(회색).
const cardStyle = (count: number | null) => {
  if (count === null) {
    return { border: "border-warning", num: "text-warning", text: "-" };
  }
  if (count > 0) {
    return { border: "border-danger", num: "text-danger", text: count.toLocaleString() };
  }
  return { border: "border-light", num: "text-muted", text: "0" };
};

export const OrderDashboardScreen = () => {
  useEffect(() => {
    document.title = "주문 대시보드";
  }, []);

  const { data } = useOrderDashboard();

  if (!data) {
    return null;
  }

  return (
    <>
      {/* page title (breadcrumb 없음) */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={() => window.location.reload()}
              >
                <i className="uil-sync" /> 새로고침
              </button>
            </div>
            <h4 className="page-title">주문 대시보드</h4>
          </div>
        </div>
      </div>

      {/* 처리 필요(Action Required) */}
      <div className="row">
        <div className="col-12">
          <h5 className="mb-2">
            <i className="uil-bolt-alt text-danger" /> 처리 필요
          </h5>
        </div>
      </div>
      <div className="row">
        {cardDefs().map((card) => {
          const style = cardStyle(data[card.key]);
          return (
            <div key={card.key} className="col-xl-2 col-md-4 col-6 mb-2">
              <a href={card.url} className="text-reset text-decoration-none">
                <div className={`card h-100 border ${style.border}`}>
                  <div className="card-body p-2 text-center">
                    <i className={`${card.icon} font-20 ${style.num}`} />
                    <h2 className={`my-1 ${style.num}`}>{style.text}</h2>
                    <p className="mb-0 fw-bold">{card.label}</p>
                    <p className="mb-0 text-muted font-12">{card.desc}</p>
                  </div>
                </div>
              </a>
            </div>
          );
        })}
      </div>
      <div className="row">
        <div className="col-12">
          <p className="text-muted font-12 mt-1">
            ※ 각 건수는 해당 리스트 페이지와 동일 기준으로 집계됩니다. 카드를 클릭하면 상세 리스트로
            이동합니다.
          </p>
        </div>
      </div>
    </>
  );
};
