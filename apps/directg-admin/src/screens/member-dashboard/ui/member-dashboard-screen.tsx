import { useEffect, useState } from "react";
import { useMemberDashboard } from "@entities/member-dashboard";
import "./member-dashboard.css";

// legacy lib_func.php pct($n,$d) — 백분율(소수 1자리). d<=0이면 0.
const round1 = (v: number) => Math.round(v * 10) / 10;
const pct = (n: number, d: number) => (d > 0 ? round1((n / d) * 100) : 0);

// legacy number_format — 천단위 콤마.
const nf = (n: number) => n.toLocaleString("en-US");

// legacy date('H:i', cached_at)
const formatHm = (unixSeconds: number) => {
  const dt = new Date(unixSeconds * 1000);
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

// legacy $gubun_label 매핑. 미매핑은 raw, 빈값은 (미분류).
const GUBUN_LABEL: Record<string, string> = {
  join: "가입",
  password: "비밀번호",
  qna: "문의",
};
const mailLabel = (gubun: string) =>
  GUBUN_LABEL[gubun] ?? (gubun !== "" && gubun != null ? gubun : "(미분류)");

// legacy member/dashboard_crm.php — 회원 대시보드(실데이터 집계 스냅샷).
export const MemberDashboardScreen = () => {
  useEffect(() => {
    document.title = "회원 대시보드";
  }, []);

  // legacy ?refresh=1 — 초기 캐시 로드, 새로고침 시 강제 재집계.
  const [refresh, setRefresh] = useState(false);
  const { data, refetch } = useMemberDashboard(refresh);

  if (!data) {
    return null;
  }

  const { cached_at, summary, sns_rows, sns_total, mail_rows } = data;

  const total_d = summary.total > 0 ? summary.total : 1; // 분포 분모 = 전체회원
  const sns_max = Math.max(1, ...sns_rows.map((r) => r.cnt)); // SNS 막대 스케일용

  const levelRows: { label: string; cnt: number }[] = [
    { label: "일반", cnt: summary.lv1 },
    { label: "정회원", cnt: summary.lv2 },
    { label: "VIP", cnt: summary.lv3 },
  ];
  const typeRows: { label: string; cnt: number }[] = [
    { label: "일반(P)", cnt: summary.type_p },
    { label: "리셀러(R)", cnt: summary.type_r },
    { label: "휴면(S)", cnt: summary.type_s },
  ];

  const mail_total = mail_rows.reduce((acc, m) => acc + m.cnt, 0);
  const mail_fail = mail_rows.reduce((acc, m) => acc + m.fail, 0);

  const onRefresh = () => {
    if (refresh) {
      void refetch();
    } else {
      setRefresh(true);
    }
  };

  return (
    <>
      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <span className="font-12 text-muted me-2">기준 {formatHm(cached_at)}</span>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary shadow-none"
                onClick={onRefresh}
              >
                새로고침
              </button>
            </div>
            <h4 className="page-title">회원 대시보드</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* ============ 1. 회원 현황 ============ */}
      <div className="row">
        <div className="col-12">
          <h5 className="mb-1">
            <i className="mdi mdi-account-group" /> 회원 현황
          </h5>
        </div>
        <div className="col-lg-3 col-6">
          <div className="card border">
            <div className="card-body py-2 text-center">
              <div className="font-12 text-muted">총 회원</div>
              <h3 className="mb-0">{nf(summary.total)}</h3>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-6">
          <div className="card border-success">
            <div className="card-body py-2 text-center">
              <div className="font-12 text-muted">회원</div>
              <h3 className="mb-0 text-success">{nf(summary.active_all)}</h3>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-6">
          <div className="card border-info">
            <div className="card-body py-2 text-center">
              <div className="font-12 text-muted">리셀러</div>
              <h3 className="mb-0 text-info">{nf(summary.type_r)}</h3>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-6">
          <div className="card border-warning">
            <div className="card-body py-2 text-center">
              <div className="font-12 text-muted">승인대기</div>
              <h3 className="mb-0 text-warning">{nf(summary.pending)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ============ 2. 신규가입 / 분포 / SNS ============ */}
      <div className="row">
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header bg-primary text-white py-2">
              <h5 className="card-title mb-0">신규가입</h5>
            </div>
            <div className="card-body py-2">
              <table className="table table-sm table-bordered mb-0 text-center">
                <thead className="table-light font-12">
                  <tr>
                    <th className="text-start">기간</th>
                    <th>신규가입</th>
                    <th>승인대기</th>
                  </tr>
                </thead>
                <tbody className="font-13">
                  <tr>
                    <td className="text-start fw-bold">오늘</td>
                    <td>
                      <h5 className="mb-0">{nf(summary.join_today)}</h5>
                    </td>
                    <td className="text-warning fw-bold">{nf(summary.pending_today)}</td>
                  </tr>
                  <tr>
                    <td className="text-start fw-bold">이번주</td>
                    <td>
                      <h5 className="mb-0">{nf(summary.join_week)}</h5>
                    </td>
                    <td className="text-warning fw-bold">{nf(summary.pending_week)}</td>
                  </tr>
                  <tr>
                    <td className="text-start fw-bold">이번달</td>
                    <td>
                      <h5 className="mb-0">{nf(summary.join_month)}</h5>
                    </td>
                    <td className="text-warning fw-bold">{nf(summary.pending_month)}</td>
                  </tr>
                </tbody>
              </table>
              <p className="font-11 text-muted mb-0 mt-2">
                승인대기 = 해당 기간 가입자 중 status=5
              </p>
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="row g-2">
            <div className="col-lg-6">
              <div className="card h-100 mb-0">
                <div className="card-header py-2">
                  <h5 className="card-title mb-0">
                    회원 등급 분포{" "}
                    <span className="font-12 text-muted fw-normal">(전체회원 기준)</span>
                  </h5>
                </div>
                <div className="card-body py-2">
                  {levelRows.map((row) => {
                    const p = pct(row.cnt, total_d);
                    return (
                      <div className="mb-2" key={row.label}>
                        <div className="d-flex justify-content-between font-13">
                          <span>{row.label}</span>
                          <span className="fw-bold">
                            {nf(row.cnt)} <span className="text-muted fw-normal">({p}%)</span>
                          </span>
                        </div>
                        <div className="crm-dist-bar" style={{ width: `${p}%` }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card h-100 mb-0">
                <div className="card-header py-2">
                  <h5 className="card-title mb-0">
                    회원 유형 분포{" "}
                    <span className="font-12 text-muted fw-normal">(전체회원 기준)</span>
                  </h5>
                </div>
                <div className="card-body py-2">
                  {typeRows.map((row) => {
                    const p = pct(row.cnt, total_d);
                    return (
                      <div className="mb-2" key={row.label}>
                        <div className="d-flex justify-content-between font-13">
                          <span>{row.label}</span>
                          <span className="fw-bold">
                            {nf(row.cnt)} <span className="text-muted fw-normal">({p}%)</span>
                          </span>
                        </div>
                        <div className="crm-dist-bar" style={{ width: `${p}%` }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card mb-0">
                <div className="card-header py-2 d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">SNS 연동 회원</h5>
                  <span className="font-12">
                    연동 회원 <b>{nf(sns_total)}</b>명{" "}
                    <span className="text-muted">(전체의 {pct(sns_total, total_d)}%)</span>
                  </span>
                </div>
                <div className="card-body py-2">
                  {sns_rows.length > 0 ? (
                    sns_rows.map((s) => {
                      const w = pct(s.cnt, sns_max);
                      return (
                        <div className="mb-2" key={s.sns_type}>
                          <div className="d-flex justify-content-between font-13">
                            <span>{s.sns_type}</span>
                            <span className="fw-bold">
                              {nf(s.cnt)}{" "}
                              <span className="text-muted fw-normal">
                                (전체 {pct(s.cnt, total_d)}%)
                              </span>
                            </span>
                          </div>
                          <div className="crm-dist-bar" style={{ width: `${w}%` }} />
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted mb-0 py-2">SNS 연동 데이터가 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ 4. 활동성 ============ */}
      <div className="row">
        <div className="col-12">
          <h5 className="mb-1">
            <i className="mdi mdi-clock-outline" /> 활동성{" "}
            <span className="font-12 text-muted fw-normal">
              (최근 접속 log_date 기준 · 전체회원)
            </span>
          </h5>
        </div>
        <div className="col-lg col-6">
          <div className="card border">
            <div className="card-body py-2 text-center">
              <div className="font-12 text-muted">최근 7일 접속</div>
              <h4 className="mb-0 text-success">{nf(summary.login_7)}</h4>
            </div>
          </div>
        </div>
        <div className="col-lg col-6">
          <div className="card border">
            <div className="card-body py-2 text-center">
              <div className="font-12 text-muted">최근 30일 접속</div>
              <h4 className="mb-0">{nf(summary.login_30)}</h4>
            </div>
          </div>
        </div>
        <div className="col-lg col-6">
          <div className="card border">
            <div className="card-body py-2 text-center">
              <div className="font-12 text-muted">최근 90일 접속</div>
              <h4 className="mb-0">{nf(summary.login_90)}</h4>
            </div>
          </div>
        </div>
        <div className="col-lg col-6">
          <div className="card border-warning">
            <div className="card-body py-2 text-center">
              <div className="font-12 text-muted">1년+ 미접속</div>
              <h4 className="mb-0 text-warning">{nf(summary.login_1y)}</h4>
            </div>
          </div>
        </div>
        <div className="col-lg col-6">
          <div className="card border">
            <div className="card-body py-2 text-center">
              <div className="font-12 text-muted">접속기록 없음</div>
              <h4 className="mb-0 text-muted">{nf(summary.login_never)}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* ============ 6. 자동메일 현황 (최근 30일) ============ */}
      <div className="row">
        <div className="col-12">
          <h5 className="mb-1">
            <i className="mdi mdi-email-outline" /> 자동메일 현황{" "}
            <span className="font-12 text-muted fw-normal">(어제부터 · tbl_email_api)</span>
          </h5>
        </div>
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-body py-2">
              <div className="row text-center g-2">
                <div className="col-4">
                  <div className="border rounded py-2">
                    <div className="font-12 text-muted">발송</div>
                    <h4 className="mb-0">{nf(mail_total)}</h4>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border rounded py-2">
                    <div className="font-12 text-muted">성공</div>
                    <h4 className="mb-0 text-success">{nf(mail_total - mail_fail)}</h4>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border rounded py-2">
                    <div className="font-12 text-muted">실패</div>
                    <h4 className="mb-0 text-danger">{nf(mail_fail)}</h4>
                  </div>
                </div>
              </div>
              <p className="font-11 text-muted mb-0 mt-2">
                실패율 {pct(mail_fail, mail_total > 0 ? mail_total : 1)}% (failed IN 1,4)
              </p>
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card h-100">
            <div className="card-header py-2 d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">구분별 발송</h5>
              <a
                href="/member/directsend_mail_log"
                className="btn btn-sm btn-outline-secondary shadow-none"
              >
                발송로그
              </a>
            </div>
            <div className="card-body p-1">
              <table className="table table-sm table-bordered mb-0">
                <thead className="table-light font-12">
                  <tr>
                    <th>구분</th>
                    <th className="text-end">발송</th>
                    <th className="text-end">성공</th>
                    <th className="text-end">실패</th>
                    <th className="text-end">실패율</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {mail_rows.length > 0 ? (
                    mail_rows.map((m) => (
                      <tr key={m.gubun}>
                        <td>{mailLabel(m.gubun)}</td>
                        <td className="text-end">{nf(m.cnt)}</td>
                        <td className="text-end text-success">{nf(m.cnt - m.fail)}</td>
                        <td className="text-end text-danger">{nf(m.fail)}</td>
                        <td className="text-end">{pct(m.fail, m.cnt > 0 ? m.cnt : 1)}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-2">
                        최근 30일 발송 내역 없음
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
