import { useState } from "react";
import {
  usePointNexusBookConfirm,
  usePointNexusBookAction,
  PnPagination,
  type PnBookConfirmSearch,
  type PnBookRow,
} from "@entities/pointnexus";

const BASE_URL = "/goods/pointnexus/pointnexus_book_confirm";
const PAGE_SIZE = 30;

const UUID_STYLE: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "11px",
  color: "#6c757d",
  wordBreak: "break-all",
};
const OPID_STYLE: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "11px",
  color: "#0a8a8a",
  wordBreak: "break-all",
};
const ORDNO_STYLE: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "11px",
  wordBreak: "break-all",
};

type Flash = { message: string; type: string };

// legacy pointnexus_book_confirm.php — PointNexus Book Confirm.
export const PointNexusBookConfirmScreen = (search: PnBookConfirmSearch) => {
  const { data } = usePointNexusBookConfirm(search);
  const action = usePointNexusBookAction();
  const [flash, setFlash] = useState<Flash | null>(null);

  if (!data) {
    return null;
  }

  const { items, total } = data;
  const { mode, page } = search;
  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;

  const pgParams: Record<string, string> = {};
  if (search.mode) {
    pgParams.mode = search.mode;
  }
  if (search.ordno) {
    pgParams.ordno = search.ordno;
  }
  if (search.m_id) {
    pgParams.m_id = search.m_id;
  }

  const onAction = (act: "confirm" | "cancel", row: PnBookRow) => {
    const rowMode = row.mode === "prod" ? "prod" : "test";
    const msg =
      act === "confirm"
        ? `이 주문 행을 Confirm 하시겠습니까?\nidx=${row.idx}\nordno=${row.ordno ?? ""}\nmode=${rowMode}`
        : `이 예약을 취소(Cancel) 하시겠습니까?\nidx=${row.idx}\nordno=${row.ordno ?? ""}\n키 재고가 PointNexus 측으로 반납됩니다.`;
    if (!window.confirm(msg)) {
      return;
    }
    action.mutate(
      { action: act, idx: row.idx },
      {
        onSuccess: (res) => setFlash({ message: res.message, type: res.flash_type || "info" }),
      },
    );
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
                <li className="breadcrumb-item active">PointNexus Book Confirm</li>
              </ol>
            </div>
            <h4 className="page-title">
              PointNexus Book Confirm{" "}
              <small className="text-muted">
                tbl_order_item_pointnexus where status=&apos;booked&apos; / POST /book/{"{id}"}
                /confirm · /book/{"{id}"}/cancel
              </small>
            </h4>
          </div>
        </div>
      </div>

      {flash && (
        <div className={`alert alert-${flash.type || "info"} alert-dismissible py-2`}>
          {flash.message}
          <button type="button" className="btn-close" onClick={() => setFlash(null)} />
        </div>
      )}

      <div className="row g-0">
        <div className="card">
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row g-2">
                <div className="col-2">
                  <div className="row g-2">
                    <label
                      htmlFor="mode"
                      className="col-3 col-form-label col-form-label-sm bg-light border"
                    >
                      환경
                    </label>
                    <div className="col-9">
                      <select
                        className="form-control form-control-sm"
                        id="mode"
                        name="mode"
                        defaultValue={mode}
                      >
                        <option value="">전체</option>
                        <option value="test">Sandbox(test)</option>
                        <option value="prod">Production(prod)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-3">
                  <div className="row g-2">
                    <label
                      htmlFor="ordno"
                      className="col-3 col-form-label col-form-label-sm bg-light border"
                    >
                      ordno
                    </label>
                    <div className="col-9">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="ordno"
                        name="ordno"
                        defaultValue={search.ordno}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-3">
                  <div className="row g-2">
                    <label
                      htmlFor="m_id"
                      className="col-3 col-form-label col-form-label-sm bg-light border"
                    >
                      m_id
                    </label>
                    <div className="col-9">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="m_id"
                        name="m_id"
                        defaultValue={search.m_id}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-2 text-end">
                  <button type="submit" className="btn btn-primary btn-sm shadow-none">
                    검색
                  </button>{" "}
                  <a href={BASE_URL} className="btn btn-secondary btn-sm shadow-none">
                    초기화
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="card mt-2">
        <div className="card-body">
          <div className="d-flex align-items-center mb-2">
            <div>
              <strong>booked 상태 {total.toLocaleString()}건</strong>
              <small className="text-muted ms-2">
                (KCP 가상계좌 입금대기·미통보 분 + 기타 book 미확정)
              </small>
            </div>
            <div className="ms-auto">
              <small className="text-muted">
                page {page.toLocaleString()} / {totalPages.toLocaleString()}
              </small>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-muted py-3 text-center">조회된 booked 행이 없습니다.</div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-sm table-bordered table-hover mb-0 tbl-bc">
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: "60px" }}>
                        idx
                      </th>
                      <th style={{ width: "140px" }}>m_no / m_id</th>
                      <th style={{ width: "170px" }}>ordno</th>
                      <th>productID</th>
                      <th>operationID</th>
                      <th className="text-end" style={{ width: "90px" }}>
                        price
                      </th>
                      <th className="text-center" style={{ width: "70px" }}>
                        mode
                      </th>
                      <th style={{ width: "140px" }}>reg_date</th>
                      <th className="text-center" style={{ width: "170px" }}>
                        처리
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((r) => (
                      <BookRow key={r.idx} row={r} onAction={onAction} pending={action.isPending} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 d-flex justify-content-center">
                <PnPagination
                  page={page}
                  totalPages={totalPages}
                  baseUrl={BASE_URL}
                  baseParams={pgParams}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card mt-2">
        <div className="card-body py-2">
          <small className="text-muted">
            <i className="mdi mdi-information-outline" /> 일반적인 KCP 가상계좌 흐름은 입금완료
            webhook(<code>pc/order/kcp/webhook.php</code>)에서 자동으로 confirm 됩니다. 이 화면은{" "}
            <strong>webhook 누락·실패·테스트 등으로 booked 가 잔존하는 경우의 수동 처리용</strong>
            입니다. Confirm 성공 시 라이선스 키가 발급되고 새 confirm row
            (action=&apos;confirm&apos;, status=&apos;confirmed&apos;) 가 추가됩니다. Cancel 시 키
            재고가 반납되며 새 bookCancel row (action=&apos;bookCancel&apos;,
            status=&apos;canceled&apos;) 가 추가됩니다.
          </small>
        </div>
      </div>
    </>
  );
};

const BookRow = ({
  row,
  onAction,
  pending,
}: {
  row: PnBookRow;
  onAction: (act: "confirm" | "cancel", row: PnBookRow) => void;
  pending: boolean;
}) => {
  const rowMode = row.mode === "prod" ? "prod" : "test";
  const productHref = `/goods/pointnexus/pointnexus_product_view?mode=${encodeURIComponent(rowMode)}&id=${encodeURIComponent(row.productID ?? "")}`;
  const operationHref = `/goods/pointnexus/pointnexus_operation?mode=${encodeURIComponent(rowMode)}&id=${encodeURIComponent(row.operationID ?? "")}`;

  return (
    <tr>
      <td className="text-center">{row.idx}</td>
      <td>
        <div>{row.m_id}</div>
        <small className="text-muted">no.{row.m_no ?? 0}</small>
      </td>
      <td style={ORDNO_STYLE}>
        {row.settle_no ? (
          <a
            href={`/_Admin_/order/order_view.php?settle_no=${encodeURIComponent(row.settle_no)}`}
            target="_blank"
            rel="noreferrer"
            className="text-decoration-none"
          >
            {row.ordno} <i className="mdi mdi-open-in-new" />
          </a>
        ) : (
          <>
            {row.ordno}
            <div className="text-muted" style={{ fontSize: "10px" }}>
              tbl_order_item 매칭 없음
            </div>
          </>
        )}
      </td>
      <td style={UUID_STYLE}>
        <a
          href={productHref}
          target="_blank"
          rel="noreferrer"
          className="text-info text-decoration-none"
        >
          {row.productID}
        </a>
        {row.license_platform && (
          <span className="badge bg-light text-dark border ms-1">{row.license_platform}</span>
        )}
      </td>
      <td style={OPID_STYLE}>
        <a href={operationHref} target="_blank" rel="noreferrer" className="text-decoration-none">
          {row.operationID}
        </a>
        {row.clientRequestID && (
          <div className="text-muted" style={{ fontSize: "10px" }}>
            req: {row.clientRequestID}
          </div>
        )}
      </td>
      <td className="text-end">
        {Math.trunc(Number(row.price) || 0).toLocaleString()}{" "}
        <small className="text-muted">{row.currency}</small>
      </td>
      <td className="text-center">
        {row.mode === "prod" ? (
          <span className="badge bg-danger">prod</span>
        ) : (
          <span className="badge bg-warning text-dark">test</span>
        )}
      </td>
      <td>{row.reg_date}</td>
      <td className="text-center">
        <button
          type="button"
          className="btn btn-sm btn-success shadow-none"
          disabled={pending}
          onClick={() => onAction("confirm", row)}
        >
          <i className="mdi mdi-check" /> Confirm
        </button>{" "}
        <button
          type="button"
          className="btn btn-sm btn-outline-danger shadow-none"
          disabled={pending}
          onClick={() => onAction("cancel", row)}
        >
          <i className="mdi mdi-close" /> Cancel
        </button>
      </td>
    </tr>
  );
};
