import { useState, type FormEvent } from "react";
import {
  useOrderAssetKeyBulk,
  ORDER_ASSET_KEY_BULK_MAX,
  type OrderAssetKeyBulkRow,
} from "@entities/order";

const nf = (n: number) => n.toLocaleString("en-US");

// legacy: 줄바꿈/공백/콤마 구분 + 중복 제거(입력 순서 유지) + 20 상한.
const parseOrdnos = (raw: string): { list: string[]; inputCount: number; capped: boolean } => {
  const parts = raw.trim().split(/[\s,]+/);
  const list: string[] = [];
  for (const p of parts) {
    const t = p.trim();
    if (t !== "" && !list.includes(t)) list.push(t);
  }
  const inputCount = list.length;
  const capped = inputCount > ORDER_ASSET_KEY_BULK_MAX;
  return { list: capped ? list.slice(0, ORDER_ASSET_KEY_BULK_MAX) : list, inputCount, capped };
};

// legacy pc/_Admin_/order/order_asset_key_bulk.php — Asset 주문 키 일괄 조회(여러 ordno, 최대 20).
export const OrderAssetKeyBulkScreen = () => {
  const [ordnos, setOrdnos] = useState("");
  const [inputCount, setInputCount] = useState(0);
  const [capped, setCapped] = useState(false);
  const bulkMutation = useOrderAssetKeyBulk();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const { list, inputCount: count, capped: isCapped } = parseOrdnos(ordnos);
    setInputCount(count);
    setCapped(isCapped);
    if (list.length === 0) return;
    bulkMutation.mutate(list);
  };

  const result = bulkMutation.data;
  const searched = bulkMutation.isSuccess && result !== undefined;

  return (
    <>
      {/* start page title (breadcrumb 없음, h4만) */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <h4 className="page-title">Asset 주문 키 일괄 조회</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <p className="font-12 mb-2">
            주문번호(ordno)를 여러 개 입력하면 각 주문의 Asset 키를 한 번에
            조회합니다(줄바꿈·공백·콤마 구분). 관리자(A) 권한 조회라{" "}
            <strong>키가 활성화되지 않습니다.</strong> 한 번에 최대{" "}
            <strong>{nf(ORDER_ASSET_KEY_BULK_MAX)}</strong>건.
          </p>
        </div>
      </div>

      {/* 입력 */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body py-2">
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <textarea
                    className="form-control"
                    name="ordnos"
                    rows={6}
                    placeholder="주문번호(ordno)를 줄바꿈으로 입력하세요"
                    required
                    value={ordnos}
                    onChange={(e) => setOrdnos(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary shadow-none">
                  키 일괄 조회
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {searched && (
        <>
          <div className="row">
            <div className="col-12 mb-2">
              입력 <strong>{nf(inputCount)}</strong>건 · 키 매칭 주문{" "}
              <strong className="text-success">{nf(result.matched_ordno_count)}</strong>건 · 총 키{" "}
              <strong className="text-primary">{nf(result.key_count)}</strong>건{" "}
              {capped && (
                <span className="text-danger">
                  (상한 초과 — 앞 {nf(ORDER_ASSET_KEY_BULK_MAX)}건만 조회)
                </span>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body p-0">
                  <table className="table table-sm table-centered table-bordered mb-0">
                    <thead className="table-dark font-13">
                      <tr>
                        <th className="text-center text-nowrap">주문번호(ordno)</th>
                        <th className="text-start">키</th>
                      </tr>
                    </thead>
                    <tbody className="font-12">
                      {result.result_rows.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="text-center py-3">
                            조회 결과가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        result.result_rows.map((row, idx) => (
                          <OrderAssetKeyBulkRowView key={`${row.ordno}-${idx}`} row={row} />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

const OrderAssetKeyBulkRowView = ({ row }: { row: OrderAssetKeyBulkRow }) => {
  if (!row.found) {
    return (
      <tr>
        <td className="text-center text-nowrap">{row.ordno}</td>
        <td className="text-danger">발급된 Asset 키 없음</td>
      </tr>
    );
  }
  return (
    <tr>
      <td className="text-center text-nowrap">{row.ordno}</td>
      <td className="text-start">
        {row.key !== null ? (
          <span className="eng">{row.key}</span>
        ) : (
          <span className="text-danger">조회 실패</span>
        )}
      </td>
    </tr>
  );
};
