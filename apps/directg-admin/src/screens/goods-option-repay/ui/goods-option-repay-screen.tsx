import { useEffect, useState, type FormEvent } from "react";
import {
  useOptionRepay,
  useSaveRepay,
  useAddRepay,
  type OptionRepayData,
} from "@entities/goods-option";
import { OptionSubNav } from "@widgets/option-sub-nav";
import { applyMask } from "@shared/lib/input-mask";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type GoodsOptionRepayScreenProps = { productCode: string };

// legacy goods/goods_option_repay_register.php — 옵션상품 포인트 설정.
export const GoodsOptionRepayScreen = ({ productCode }: GoodsOptionRepayScreenProps) => {
  const { data, dataUpdatedAt } = useOptionRepay(productCode);

  useEffect(() => {
    document.title = "포인트 설정";
  }, []);

  if (!data) {
    return null;
  }
  return <RepayForms key={dataUpdatedAt} productCode={productCode} data={data} />;
};

const DATE_MASK = "0000-00-00 00:00";
const won = (n: number) => n.toLocaleString("ko-KR");

const RepayForms = ({ productCode, data }: { productCode: string; data: OptionRepayData }) => {
  const productViewer = useProductViewer();
  const [isRepay, setIsRepay] = useState(data.is_repay);
  const [addRepayVal, setAddRepayVal] = useState("");
  const [repayType, setRepayType] = useState("%");
  const [startDt, setStartDt] = useState("");
  const [endDt, setEndDt] = useState("");

  const saveRepay = useSaveRepay(productCode);
  const addRepay = useAddRepay(productCode);

  const onSaveRepay = (e: FormEvent) => {
    e.preventDefault();
    saveRepay.mutate({ is_repay: isRepay });
  };
  const onAddRepay = (e: FormEvent) => {
    e.preventDefault();
    addRepay.mutate({
      add_repay: addRepayVal,
      repay_type: repayType,
      start_dt: startDt,
      end_dt: endDt,
    });
  };

  return (
    <>
      {/* start page title */}
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
                    옵션상품 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">포인트 설정</li>
              </ol>
            </div>
            <h4 className="page-title">
              {data.product.product_name}({data.product.product_name_en})
            </h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-2 mb-2 mb-sm-0">
          <OptionSubNav productCode={productCode} active="repay" gameType="" />
        </div>
        <div className="col-10">
          {/* 기본 포인트 설정 */}
          <form
            id="repay_frm"
            name="repay_frm"
            method="post"
            className="form-horizontal"
            onSubmit={onSaveRepay}
          >
            <div className="card">
              <div className="card-header bg-secondary text-white fw-bold font-15">
                기본 포인트 설정
              </div>
              <div className="card-body">
                <div className="mb-2 row">
                  <label htmlFor="is_repay" className="col-sm-2 col-form-label bg-light">
                    * 포인트 지급여부
                  </label>
                  <div className="col-9">
                    <div className="form-check form-check-inline mt-2">
                      <input
                        type="radio"
                        id="is_repay_y"
                        name="is_repay"
                        className="form-check-input"
                        value="Y"
                        checked={isRepay === "Y"}
                        onChange={() => setIsRepay("Y")}
                      />
                      <label className="form-check-label" htmlFor="is_repay_y">
                        지급
                      </label>
                    </div>
                    <div className="form-check form-check-inline mt-2">
                      <input
                        type="radio"
                        id="is_repay_n"
                        name="is_repay"
                        className="form-check-input"
                        value="N"
                        checked={isRepay === "N"}
                        onChange={() => setIsRepay("N")}
                      />
                      <label className="form-check-label" htmlFor="is_repay_n">
                        미지급
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mb-2 row">
                  <label htmlFor="repay_type" className="col-sm-2 col-form-label bg-light">
                    포인트 지급방법
                  </label>
                  <div className="col-9">
                    <input
                      type="text"
                      readOnly
                      className="form-control-plaintext"
                      id="repay_type"
                      value="회원등급별 차등 지급"
                    />
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <div className="text-end">
                  {!productViewer && (
                    <button type="submit" className="btn btn-primary shadow-none">
                      포인트 설정저장
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>

          {/* 추가 포인트 설정 */}
          <form
            id="add_repay_frm"
            name="add_repay_frm"
            method="post"
            className="form-horizontal"
            onSubmit={onAddRepay}
          >
            <div className="card">
              <div className="card-header bg-secondary text-white fw-bold font-15">
                추가 포인트 설정
              </div>
              <div className="card-body">
                <div className="mb-2 row">
                  <label htmlFor="add_repay" className="col-sm-2 col-form-label bg-light">
                    추가 포인트
                  </label>
                  <div className="col-10">
                    <div className="input-group">
                      <label className="input-group-text" htmlFor="add_repay">
                        주문금액의
                      </label>
                      <div className="col-2">
                        <input
                          className="form-control"
                          id="add_repay"
                          type="number"
                          name="add_repay"
                          value={addRepayVal}
                          onChange={(e) => setAddRepayVal(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-1">
                        <select
                          name="repay_type"
                          id="repay_type_select"
                          className="form-select"
                          value={repayType}
                          onChange={(e) => setRepayType(e.target.value)}
                          required
                        >
                          <option value="%">%</option>
                          <option value="원">원</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-2 row">
                  <label htmlFor="start_dt" className="col-sm-2 col-form-label bg-light">
                    추가 포인트 지급기간
                  </label>
                  <div className="col-6">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="start_dt"
                        name="start_dt"
                        placeholder="추가 포인트 지급 시작일"
                        value={startDt}
                        onChange={(e) => setStartDt(applyMask(e.target.value, DATE_MASK))}
                        required
                      />
                      <span className="input-group-text">~</span>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="end_dt"
                        name="end_dt"
                        placeholder="추가 포인트 지급 종료일"
                        value={endDt}
                        onChange={(e) => setEndDt(applyMask(e.target.value, DATE_MASK))}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <div className="text-end">
                  {!productViewer && (
                    <button type="submit" className="btn btn-primary shadow-none">
                      추가 포인트 설정
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>

          {/* 추가 포인트 진행이력 */}
          <div className="card">
            <div className="card-header bg-secondary text-white fw-bold font-15">
              추가 포인트 진행이력
            </div>
            <div className="card-body">
              <table className="table table-centered table-sm table-bordered mb-0">
                <thead className="bg-light font-13">
                  <tr>
                    <th className="text-center">추가 포인트</th>
                    <th className="text-center">추가 포인트 지급기간</th>
                    <th className="text-center">추가 포인트 지급여부</th>
                    <th className="text-center">비고</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {data.add_repay_history.map((h, i) => (
                    <tr key={`${h.start_dt}-${i}`}>
                      <td className="text-center">
                        {h.repay_type === "%"
                          ? `주문금액의 ${h.repay_point} ${h.repay_type}`
                          : `${won(h.repay_point)} ${h.repay_type}`}
                      </td>
                      <td className="text-center">
                        {h.start_dt} ~ {h.end_dt}
                      </td>
                      <td className="text-center">{h.repay_flag}</td>
                      <td className="text-center" />
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
