import { useRef, useState } from "react";
import {
  usePointNexusCatalogueSyncStats,
  runPointNexusCatalogueSyncBatch,
  PnModeSelect,
  type PnMode,
} from "@entities/pointnexus";

const BASE_URL = "/goods/pointnexus/pointnexus_catalogue_sync";

const SYNC_LOG_STYLE: React.CSSProperties = {
  maxHeight: "480px",
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

type LogLine = { text: string; cls: string };

// legacy pointnexus_catalogue_sync.php — PointNexus 카탈로그 동기화.
export const PointNexusCatalogueSyncScreen = ({ mode, limit }: { mode: PnMode; limit: number }) => {
  const { data: stats } = usePointNexusCatalogueSyncStats(mode);

  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([
    { text: '동기화를 시작하려면 위의 "동기화 시작" 버튼을 눌러주세요.', cls: "row-info" },
  ]);
  const [curOffset, setCurOffset] = useState(0);
  const [curBatches, setCurBatches] = useState(0);
  const [curOk, setCurOk] = useState(0);
  const [curFail, setCurFail] = useState(0);

  const stopRef = useRef(false);
  const logBoxRef = useRef<HTMLDivElement>(null);

  const appendLog = (text: string, cls: string) => {
    setLogs((prev) => [...prev, { text, cls }]);
    // 다음 tick에 스크롤 최하단
    requestAnimationFrame(() => {
      if (logBoxRef.current) {
        logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
      }
    });
  };

  const onStop = () => {
    stopRef.current = true;
    appendLog("▶ 중단 요청 — 현재 배치 완료 후 정지합니다.", "row-info");
  };

  const onStart = async () => {
    if (running) {
      return;
    }
    setLogs([]);
    appendLog(`▶ 동기화 시작 — mode=${mode}, limit=${limit}`, "row-batch");
    stopRef.current = false;
    setRunning(true);

    let offset = 0;
    let totalBatches = 0;
    let totalOk = 0;
    let totalFail = 0;

    try {
      while (true) {
        if (stopRef.current) {
          appendLog("▶ 사용자 중단", "row-info");
          break;
        }

        let json;
        try {
          json = await runPointNexusCatalogueSyncBatch({ mode, offset, limit });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          appendLog(`✘ 네트워크 오류 — ${msg} (offset=${offset})`, "row-fail");
          break;
        }

        if (!json.success) {
          appendLog(
            `✘ batch 실패 — ${json.error || "알 수 없는 오류"} (offset=${offset})`,
            "row-fail",
          );
          break;
        }

        totalBatches++;
        totalOk += json.synced_ok || 0;
        totalFail += json.synced_fail || 0;

        appendLog(
          `✓ batch #${totalBatches} offset=${offset} / 응답=${json.count} / 성공=${json.synced_ok} / 실패=${json.synced_fail}${json.has_more ? " / 다음 페이지 있음" : " / 마지막 페이지"}`,
          "row-batch",
        );

        if (json.items && json.items.length) {
          json.items.forEach((it) => {
            if (it.error) {
              appendLog(`  ✘ ${it.id} / ${it.name || ""} — ${it.error}`, "row-fail");
            } else {
              appendLog(`  · ${it.id} / ${it.name || ""}`, "row-ok");
            }
          });
        }

        setCurOffset(offset + json.count);
        setCurBatches(totalBatches);
        setCurOk(totalOk);
        setCurFail(totalFail);

        if (!json.has_more) {
          appendLog(
            `▶ 동기화 완료 — 총 ${totalOk + totalFail}건 (성공 ${totalOk} / 실패 ${totalFail})`,
            "row-batch",
          );
          break;
        }

        offset += json.count;
      }
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
                <li className="breadcrumb-item active">PointNexus 카탈로그 동기화</li>
              </ol>
            </div>
            <h4 className="page-title">
              PointNexus 카탈로그 동기화{" "}
              <small className="text-muted">GET /product → pointnexus_catalogue</small>
            </h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="card stat-card">
            <div className="card-body">
              <div className="text-muted">DB 적재 카탈로그 (전체)</div>
              <div className="stat-value" style={{ fontSize: "22px", fontWeight: 600 }}>
                {(stats?.db_count_total ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card">
            <div className="card-body">
              <div className="text-muted">현재 mode ({mode}) 적재 건수</div>
              <div className="stat-value" style={{ fontSize: "22px", fontWeight: 600 }}>
                {(stats?.db_count_mode ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card">
            <div className="card-body">
              <div className="text-muted">최근 동기화 시각</div>
              <div className="stat-value" style={{ fontSize: "16px", fontWeight: 600 }}>
                {stats?.last_batch_at ? stats.last_batch_at : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 동기화 설정 */}
      <div className="row g-0">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">동기화 설정</h5>
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
                <div className="col-3">
                  <div className="row g-2">
                    <label
                      htmlFor="limit"
                      className="col-4 col-form-label col-form-label-sm bg-light border"
                    >
                      배치 크기
                    </label>
                    <div className="col-8">
                      <select
                        className="form-control form-control-sm"
                        id="limit"
                        name="limit"
                        defaultValue={String(limit)}
                        onChange={(e) => e.currentTarget.form?.submit()}
                      >
                        <option value="10">10</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="alert alert-info py-2 mb-3" style={{ fontSize: "13px" }}>
              <i className="mdi mdi-information" />{" "}
              <strong>{mode === "test" ? "Sandbox(test)" : "Production(prod)"}</strong> 환경의
              PointNexus <code>/product</code> 응답을 <code>pointnexus_catalogue</code> 테이블에
              INSERT 또는 UPDATE 합니다 (productID 기준 ON DUPLICATE KEY UPDATE). 배치 크기{" "}
              <strong>{limit}</strong>개씩 offset을 증가시키며 반복 호출합니다.
            </div>

            <div className="text-end">
              <button
                type="button"
                className="btn btn-primary btn-sm shadow-none"
                disabled={running}
                onClick={onStart}
              >
                <i className="mdi mdi-cloud-download" /> 동기화 시작
              </button>{" "}
              <button
                type="button"
                className="btn btn-outline-danger btn-sm shadow-none"
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
        <div className="col-md-3">
          <div className="card stat-card">
            <div className="card-body">
              <div className="text-muted">현재 offset</div>
              <div className="stat-value" style={{ fontSize: "22px", fontWeight: 600 }}>
                {curOffset.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card">
            <div className="card-body">
              <div className="text-muted">처리된 배치</div>
              <div className="stat-value" style={{ fontSize: "22px", fontWeight: 600 }}>
                {curBatches.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card">
            <div className="card-body">
              <div className="text-muted">동기화 성공 (누적)</div>
              <div
                className="stat-value text-success"
                style={{ fontSize: "22px", fontWeight: 600 }}
              >
                {curOk.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card">
            <div className="card-body">
              <div className="text-muted">실패 (누적)</div>
              <div className="stat-value text-danger" style={{ fontSize: "22px", fontWeight: 600 }}>
                {curFail.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-light">진행 로그</h5>
            <div className="card-body">
              <div className="sync-log" style={SYNC_LOG_STYLE} ref={logBoxRef}>
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
