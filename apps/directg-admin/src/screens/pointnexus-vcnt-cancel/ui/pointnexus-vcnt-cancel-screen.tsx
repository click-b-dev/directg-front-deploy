import { useState } from "react";
import {
  usePointNexusVcntCancelStats,
  previewPointNexusVcntCancel,
  PnModeSelect,
  type PnMode,
  type PnVcntCancelItem,
} from "@entities/pointnexus";

const BASE_URL = "/goods/pointnexus/pointnexus_vcnt_cancel";

const ORDER_VIEW = "/_Admin_/order/order_view.php";

const STATUS_BADGE: Record<string, string> = {
  booked: "bg-secondary",
  pending_reveal: "bg-warning text-dark",
  sold: "bg-info",
};

type ListState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "loaded"; items: PnVcntCancelItem[]; count: number; hasMore: boolean };

// legacy pointnexus_vcnt_cancel.php — PointNexus VCNT 미입금 만료 취소(취소 대상 조회).
export const PointNexusVcntCancelScreen = ({ mode }: { mode: PnMode }) => {
  const { data: stats } = usePointNexusVcntCancelStats(mode);
  const [list, setList] = useState<ListState>({ kind: "idle" });
  const [targetCnt, setTargetCnt] = useState<number | null>(null);

  const cnt = targetCnt ?? stats?.target_cnt ?? 0;

  const onPreview = async () => {
    setList({ kind: "loading" });
    try {
      const json = await previewPointNexusVcntCancel(mode);
      if (!json.success) {
        setList({ kind: "error", message: json.error || "알 수 없는 오류" });
        return;
      }
      setList({
        kind: "loaded",
        items: json.items || [],
        count: json.count,
        hasMore: json.has_more,
      });
      setTargetCnt(json.count);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setList({ kind: "error", message: `네트워크 오류 — ${msg}` });
    }
  };

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    상품
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    PointNexus 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">PointNexus VCNT 미입금 만료 취소</li>
              </ol>
            </div>
            <h4 className="page-title">
              PointNexus VCNT 미입금 만료 취소{" "}
              <small className="text-muted">
                VCNT 미입금 만료 → runBookCancel / runOperationCancel
              </small>
            </h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card stat-card">
            <div className="card-body">
              <div className="text-muted">현재 취소 대상 주문 ({mode} / 미입금 만료)</div>
              <div className="stat-value text-danger" style={{ fontSize: "22px", fontWeight: 600 }}>
                {cnt.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card stat-card">
            <div className="card-body">
              <div className="text-muted">기준 시각 (입금기한 만료 판정)</div>
              <div className="stat-value" style={{ fontSize: "16px", fontWeight: 600 }}>
                {stats?.now ?? "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 조회 설정 */}
      <div className="row g-0">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">조회 설정</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row g-2 mb-2">
                <div className="col-3">
                  <div className="row g-2">
                    <label
                      htmlFor="mode"
                      className="col-3 col-form-label col-form-label-sm bg-light border"
                    >
                      환경
                    </label>
                    <div className="col-9">
                      <PnModeSelect mode={mode} />
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="alert alert-warning py-2 mb-3" style={{ fontSize: "13px" }}>
              <i className="mdi mdi-alert" />{" "}
              <strong>{mode === "test" ? "Sandbox(test)" : "Production(prod)"}</strong> 환경 대상 —
              KCP 가상계좌(VCNT) 주문 중 <strong>입금기한(va_date) 만료 + 미입금(step=1)</strong>
              인데 PointNexus 예약/판매가 아직 활성으로 남은 건입니다. 결제번호를 클릭하면
              주문상세에서 취소할 수 있습니다 (<code>booked</code> → <code>runBookCancel</code>,{" "}
              <code>pending_reveal·sold</code> → <code>runOperationCancel</code>).
            </div>

            <div className="text-end">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm shadow-none"
                disabled={list.kind === "loading"}
                onClick={onPreview}
              >
                <i className="mdi mdi-eye" /> 취소 대상 조회
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-light">
              취소 대상 목록{" "}
              <small className="text-muted">
                {list.kind === "loaded"
                  ? `(주문 ${list.count}건 / 항목 ${list.items.length}개${list.hasMore ? ", 1000건 초과분 제외" : ""})`
                  : ""}
              </small>
            </h5>
            <div className="card-body">
              <table
                className="table table-centered table-sm table-bordered border-light w-100"
                id="targetTable"
              >
                <thead className="table-light">
                  <tr>
                    <th className="text-center">주문일자</th>
                    <th className="text-center">결제번호</th>
                    <th className="text-center">회원</th>
                    <th className="text-center">상품명</th>
                    <th className="text-center">주문금액</th>
                    <th className="text-center">상태</th>
                    <th className="text-center">취소방식</th>
                    <th className="text-center">마감시각(만료)</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {list.kind === "idle" && (
                    <tr>
                      <td colSpan={8} className="text-center text-muted py-3">
                        &quot;취소 대상 조회&quot;를 눌러주세요.
                      </td>
                    </tr>
                  )}
                  {list.kind === "loading" && (
                    <tr>
                      <td colSpan={8} className="text-center text-muted py-3">
                        조회 중...
                      </td>
                    </tr>
                  )}
                  {list.kind === "error" && (
                    <tr>
                      <td colSpan={8} className="text-center text-danger py-3">
                        조회 실패 — {list.message}
                      </td>
                    </tr>
                  )}
                  {list.kind === "loaded" && list.items.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center text-muted py-3">
                        취소 대상이 없습니다.
                      </td>
                    </tr>
                  )}
                  {list.kind === "loaded" &&
                    list.items.map((it, i) => (
                      <tr key={i}>
                        <td className="text-center">{it.reg_date}</td>
                        <td className="text-center">
                          {it.settle_no ? (
                            <a
                              href={`${ORDER_VIEW}?settle_no=${encodeURIComponent(it.settle_no)}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {it.settle_no}
                            </a>
                          ) : (
                            it.ordno || ""
                          )}
                        </td>
                        <td>{it.m_id}</td>
                        <td>{it.name}</td>
                        <td className="text-end">
                          {Math.trunc(Number(it.total_price) || 0).toLocaleString()}
                        </td>
                        <td className="text-center">
                          <span
                            className={`badge ${STATUS_BADGE[it.status ?? ""] || "bg-light text-dark"}`}
                          >
                            {it.status}
                          </span>
                        </td>
                        <td className="text-center">{it.action}</td>
                        <td className="text-center text-danger">{it.va_date}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
