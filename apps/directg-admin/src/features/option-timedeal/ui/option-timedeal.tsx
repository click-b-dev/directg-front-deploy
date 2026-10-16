import { useState, type FormEvent } from "react";
import {
  useOptionTimedeal,
  useSaveOptionTimedeal,
  type OptionTimedealConfig,
  type OptionTimedealData,
} from "@entities/goods-option";

type OptionTimedealProps = { productCode: string };

// legacy goods_option_sales_register.php timedeal 블록 — display_type==timedeal일 때만 렌더.
export const OptionTimedeal = ({ productCode }: OptionTimedealProps) => {
  const { data, dataUpdatedAt } = useOptionTimedeal(productCode, true);
  if (!data) {
    return null;
  }
  // 저장(INSERT) 후 refetch 시 key 변경으로 폼 remount.
  return <TimedealForm key={dataUpdatedAt} productCode={productCode} data={data} />;
};

const won = (n: number) => n.toLocaleString("ko-KR");

const TimedealForm = ({ productCode, data }: { productCode: string; data: OptionTimedealData }) => {
  const [config, setConfig] = useState<OptionTimedealConfig>(data.config);
  const saveTimedeal = useSaveOptionTimedeal(productCode);

  const set = (key: keyof OptionTimedealConfig, value: string) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveTimedeal.mutate({
      timedeal_start_date: config.timedeal_start_date,
      timedeal_end_date: config.timedeal_end_date,
      product_srp: config.product_srp,
      product_ppr: config.product_ppr,
      timedeal_price: config.timedeal_price,
      timedeal_stock: config.timedeal_stock,
      timedeal_confirm: config.timedeal_confirm,
    });
  };

  return (
    <>
      {/* 옵션상품 타임딜 설정 */}
      <form
        id="timedeal_frm"
        name="timedeal_frm"
        method="post"
        className="form-horizontal"
        onSubmit={onSubmit}
      >
        <div className="card border border-1">
          <div className="card-header bg-secondary text-white fw-bold font-15">타임딜 설정</div>
          <div className="card-body">
            <div className="mb-2 row">
              <label htmlFor="timedeal_start_date" className="col-sm-2 col-form-label bg-light">
                * 타일딜 진행기간
              </label>
              <div className="col-6 mt-1">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="timedeal_start_date"
                    name="timedeal_start_date"
                    placeholder="타임딜 시작일자"
                    value={config.timedeal_start_date}
                    onChange={(e) => set("timedeal_start_date", e.target.value)}
                    required
                  />
                  <span className="input-group-text">~</span>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="timedeal_end_date"
                    name="timedeal_end_date"
                    placeholder="타임딜 종료일자"
                    value={config.timedeal_end_date}
                    onChange={(e) => set("timedeal_end_date", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <label htmlFor="product_srp" className="col-2 col-form-label bg-light">
                퍼블리셔 SRP
              </label>
              <div className="col-3">
                <div className="input-group">
                  <div className="input-group-text" style={{ fontFamily: "dotum" }}>
                    {"\\"}
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    id="product_srp"
                    name="product_srp"
                    value={config.product_srp}
                    onChange={(e) => set("product_srp", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <label htmlFor="product_ppr" className="col-2 col-form-label bg-light">
                퍼블리셔 PPR
              </label>
              <div className="col-3">
                <div className="input-group">
                  <div className="input-group-text" style={{ fontFamily: "dotum" }}>
                    {"\\"}
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    id="product_ppr"
                    name="product_ppr"
                    value={config.product_ppr}
                    onChange={(e) => set("product_ppr", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <label htmlFor="timedeal_price" className="col-2 col-form-label bg-light">
                타임딜 판매가
              </label>
              <div className="col-3">
                <div className="input-group">
                  <div className="input-group-text" style={{ fontFamily: "dotum" }}>
                    {"\\"}
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    id="timedeal_price"
                    name="timedeal_price"
                    value={config.timedeal_price}
                    onChange={(e) => set("timedeal_price", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <label htmlFor="timedeal_stock" className="col-2 col-form-label bg-light">
                타임딜 진행수량
              </label>
              <div className="col-3">
                <input
                  type="text"
                  className="form-control"
                  id="timedeal_stock"
                  name="timedeal_stock"
                  value={config.timedeal_stock}
                  onChange={(e) => set("timedeal_stock", e.target.value)}
                />
              </div>
            </div>
            <div className="row mb-2">
              <label htmlFor="timedeal_confirm" className="col-2 col-form-label bg-light">
                타임딜 승인여부
              </label>
              <div className="col-10 mt-1">
                <div className="form-check form-radio-dark form-check-inline">
                  <input
                    type="radio"
                    id="timedeal_confirm_y"
                    name="timedeal_confirm"
                    className="form-check-input"
                    value="Y"
                    checked={config.timedeal_confirm === "Y"}
                    onChange={() => set("timedeal_confirm", "Y")}
                  />
                  <label className="form-check-label" htmlFor="timedeal_confirm_y">
                    Y
                  </label>
                </div>
                <div className="form-check form-radio-dark form-check-inline">
                  <input
                    type="radio"
                    id="timedeal_confirm_n"
                    name="timedeal_confirm"
                    className="form-check-input"
                    value="N"
                    checked={config.timedeal_confirm === "N"}
                    onChange={() => set("timedeal_confirm", "N")}
                  />
                  <label className="form-check-label" htmlFor="timedeal_confirm_n">
                    N
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="card-footer">
            <div className="text-end">
              <button type="submit" className="btn btn-primary shadow-none">
                타임딜 설정 저장
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* 옵션상품 타임딜 진행이력 */}
      <div className="card">
        <div className="card-header bg-secondary text-white fw-bold font-15">타임딜 진행이력</div>
        <div className="card-body p-0">
          <table className="table table-bordered table-centered mb-0 table-sm">
            <thead className="table-light font-13">
              <tr>
                <th className="text-center">타임딜 회차</th>
                <th className="text-center">타임딜 진행기간</th>
                <th className="text-center">타임딜 진행수량</th>
                <th className="text-center">퍼블리셔 SRP</th>
                <th className="text-center">퍼블리셔 PRR</th>
                <th className="text-center">타임딜 판매가</th>
                <th className="text-center">타임딜 판매수량</th>
                <th className="text-center">타임딜 진행상태</th>
              </tr>
            </thead>
            <tbody>
              {data.history.map((h, i) => (
                <tr key={`${h.timedeal_start}-${i}`}>
                  <td className="text-center">{i + 1}</td>
                  <td className="text-center">
                    {h.timedeal_start} ~ {h.timedeal_end}
                  </td>
                  <td className="text-end">{won(h.timedeal_stock)}</td>
                  <td className="text-end">{won(h.timedeal_srp)}</td>
                  <td className="text-end">{won(h.timedeal_ppr)}</td>
                  <td className="text-end">{won(h.timedeal_price)}</td>
                  <td className="text-end">{won(h.timedeal_order)}</td>
                  <td className="text-center">{h.timedeal_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
