import { useRef, useState } from "react";
import {
  usePointNexusCancelVerifyStats,
  runPointNexusCancelVerifyBatch,
  PnModeSelect,
  type PnMode,
  type PnCancelVerifyItem,
} from "@entities/pointnexus";

const BASE_URL = "/goods/pointnexus/pointnexus_cancel_verify";
const ORDER_VIEW = "/_Admin_/order/order_view.php";

const RESULT_BADGE: Record<string, string> = {
  ok: "bg-success",
  fail: "bg-danger",
  pending: "bg-secondary",
  preview: "bg-light text-dark",
};

const RUN_LOG_STYLE: React.CSSProperties = {
  maxHeight: "320px",
  overflowY: "auto",
  background: "#f8f9fa",
  border: "1px solid #dee2e6",
  borderRadius: "4px",
  padding: "8px",
  fontFamily: "monospace",
  fontSize: "12px",
};
const LOG_COLORS: Record<string, string> = {
  "row-ok": "#198754",
  "row-fail": "#dc3545",
  "row-info": "#6c757d",
  "row-batch": "#0d6efd",
};

type ListState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "loaded"; items: PnCancelVerifyItem[]; count: number; hasMore: boolean };

type LogLine = { text: string; cls: string };

// legacy pointnexus_cancel_verify.php — PointNexus 취소 검증 (cancel_pending).
export const PointNexusCancelVerifyScreen = ({ mode }: { mode: PnMode }) => {
  const { data: stats } = usePointNexusCancelVerifyStats(mode);
  const [list, setList] = useState<ListState>({ kind: "idle" });
  const [targetCnt, setTargetCnt] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);

  const stopRef = useRef(false);
  const logBoxRef = useRef<HTMLDivElement>(null);

  const cnt = targetCnt ?? stats?.target_cnt ?? 0;

  const appendLog = (text: string, cls: string) => {
    setLogs((prev) => [...prev, { text, cls }]);
    requestAnimationFrame(() => {
      if (logBoxRef.current) {
        logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
      }
    });
  };

  const onPreview = async () => {
    setList({ kind: "loading" });
    try {
      const json = await runPointNexusCancelVerifyBatch(mode, true);
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

  const onStop = () => {
    stopRef.current = true;
    appendLog("▶ 중단 요청 — 현재 배치 완료 후 정지합니다.", "row-info");
  };

  const onRun = async () => {
    if (running) {
      return;
    }
    if (
      !window.confirm(
        `cancel_pending 항목을 GET /operation 으로 검증해 canceled/cancel_failed 로 확정합니다.\n(새 취소를 발행하지 않는 비파괴 작업) 진행할까요? mode=${mode}`,
      )
    ) {
      return;
    }
    setLogs([]);
    appendLog(`▶ 검증 실행 — mode=${mode}`, "row-batch");
    stopRef.current = false;
    setRunning(true);

    let totalRows = 0;
    let totalOk = 0;
    let totalFail = 0;
    let totalPending = 0;
    let batchNo = 0;

    try {
      while (true) {
        if (stopRef.current) {
          appendLog("▶ 사용자 중단", "row-info");
          break;
        }
        let json;
        try {
          json = await runPointNexusCancelVerifyBatch(mode, false);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          appendLog(`✘ 네트워크 오류 — ${msg}`, "row-fail");
          break;
        }
        if (!json.success) {
          appendLog(`✘ batch 실패 — ${json.error || "알 수 없는 오류"}`, "row-fail");
          break;
        }
        if (json.count === 0) {
          appendLog("▶ 검증 완료 — 대기 항목 없음", "row-batch");
          break;
        }
        batchNo++;
        totalRows += json.count;
        totalOk += json.resolved_ok || 0;
        totalFail += json.resolved_fail || 0;
        totalPending += json.still_pending || 0;
        appendLog(
          `✓ batch #${batchNo} / 검사=${json.count} / canceled=${json.resolved_ok} / cancel_failed=${json.resolved_fail} / 보류=${json.still_pending}`,
          "row-batch",
        );
        (json.items || []).forEach((it) => {
          const line = `  · ${it.settle_no || it.ordno} / ${it.name || ""} [state=${it.state || "-"}]`;
          const cls =
            it.result === "ok" ? "row-ok" : it.result === "fail" ? "row-fail" : "row-info";
          appendLog(`${line} — ${it.message}`, cls);
        });
        // 보류만 남고 확정 없으면 종료(무한루프 방지)
        if ((json.resolved_ok || 0) === 0 && (json.resolved_fail || 0) === 0) {
          appendLog("▶ 남은 항목은 아직 처리중(보류) — 잠시 후 다시 실행하세요.", "row-info");
          break;
        }
        if (!json.has_more) {
          break;
        }
      }
      appendLog(
        `▶ 종료 — 검사 ${totalRows} / canceled ${totalOk} / cancel_failed ${totalFail} / 보류 ${totalPending}`,
        "row-batch",
      );
    } finally {
      setRunning(false);
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
                <li className="breadcrumb-item active">PointNexus 취소 검증 (cancel_pending)</li>
              </ol>
            </div>
            <h4 className="page-title">
              PointNexus 취소 검증 (cancel_pending){" "}
              <small className="text-muted">
                operationCancel 비동기 결과 → GET /operation 으로 확정
              </small>
            </h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card stat-card">
            <div className="card-body">
              <div className="text-muted">검증 대기(cancel_pending) 항목 ({mode})</div>
              <div
                className="stat-value text-warning"
                style={{ fontSize: "22px", fontWeight: 600 }}
              >
                {cnt.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card stat-card">
            <div className="card-body">
              <div className="text-muted">현재 시각</div>
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

            <div className="alert alert-info py-2 mb-3" style={{ fontSize: "13px" }}>
              <i className="mdi mdi-information" />{" "}
              <strong>{mode === "test" ? "Sandbox(test)" : "Production(prod)"}</strong> 환경 —
              어드민 취소/VCNT 배치가 <code>runOperationCancel</code>(비동기)로 접수한 건은 status{" "}
              <code>cancel_pending</code>으로 남습니다. <strong>검증 실행</strong>은{" "}
              <code>GET /operation</code>으로 최종 상태를 읽어 <code>done</code>이면{" "}
              <code>canceled</code>(+주문상품 취소완료), <code>error</code>면{" "}
              <code>cancel_failed</code>(수동확인)로 확정합니다.{" "}
              <strong>새로운 취소를 발행하지 않는 비파괴 작업</strong>입니다.
            </div>

            <div className="text-end">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm shadow-none"
                disabled={list.kind === "loading" || running}
                onClick={onPreview}
              >
                <i className="mdi mdi-eye" /> 대기 항목 조회
              </button>{" "}
              <button
                type="button"
                className="btn btn-primary btn-sm shadow-none"
                disabled={running}
                onClick={onRun}
              >
                <i className="mdi mdi-check-decagram" /> 검증 실행
              </button>{" "}
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm shadow-none"
                disabled={!running}
                onClick={onStop}
              >
                <i className="mdi mdi-stop" /> 중단
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-light">
              검증 대기 목록{" "}
              <small className="text-muted">
                {list.kind === "loaded"
                  ? `(${list.items.length}개${list.hasMore ? ", 1000건 초과분 제외" : ""})`
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
                    <th className="text-center">결제번호</th>
                    <th className="text-center">상품명</th>
                    <th className="text-center">productID</th>
                    <th className="text-center">operationID</th>
                    <th className="text-center">state</th>
                    <th className="text-center">결과</th>
                    <th className="text-center">메시지</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {list.kind === "idle" && (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-3">
                        &quot;대기 항목 조회&quot;를 눌러주세요.
                      </td>
                    </tr>
                  )}
                  {list.kind === "loading" && (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-3">
                        조회 중...
                      </td>
                    </tr>
                  )}
                  {list.kind === "error" && (
                    <tr>
                      <td colSpan={7} className="text-center text-danger py-3">
                        조회 실패 — {list.message}
                      </td>
                    </tr>
                  )}
                  {list.kind === "loaded" && list.items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-3">
                        검증 대기 항목이 없습니다.
                      </td>
                    </tr>
                  )}
                  {list.kind === "loaded" &&
                    list.items.map((it, i) => (
                      <tr key={i}>
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
                        <td>{it.name}</td>
                        <td className="text-center">{it.productID}</td>
                        <td className="text-center">{it.operationID}</td>
                        <td className="text-center">{it.state}</td>
                        <td className="text-center">
                          <span
                            className={`badge ${RESULT_BADGE[it.result ?? ""] || "bg-light text-dark"}`}
                          >
                            {it.result}
                          </span>
                        </td>
                        <td>{it.message}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-light">실행 로그</h5>
            <div className="card-body">
              <div className="run-log" style={RUN_LOG_STYLE} ref={logBoxRef}>
                {logs.map((l, i) => (
                  <div key={i} style={{ color: LOG_COLORS[l.cls] }}>
                    {l.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
