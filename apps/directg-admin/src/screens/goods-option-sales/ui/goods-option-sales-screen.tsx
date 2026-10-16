import { useState, type FormEvent } from "react";
import {
  useOptionSales,
  useSaveOptionSales,
  useSaveOptionPrice,
  useSaveOptionSupplier,
  useDeleteSalesDeliveryItem,
  type OptionSalesData,
  type OptionSalesSettings,
  type OptionPriceSettings,
  type OptionSupplierSettings,
} from "@entities/goods-option";
import { OptionSubNav } from "@widgets/option-sub-nav";
import { DeliverySearchPanel } from "@features/option-delivery-search";
import { OptionTimedeal } from "@features/option-timedeal";
import { applyMask } from "@shared/lib/input-mask";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type GoodsOptionSalesScreenProps = { productCode: string };

// legacy goods/goods_option_sales_register.php — 옵션상품 판매 설정(핵심: 판매/가격/공급처 + 배송아이템 목록·삭제).
export const GoodsOptionSalesScreen = ({ productCode }: GoodsOptionSalesScreenProps) => {
  const { data, dataUpdatedAt } = useOptionSales(productCode);
  if (!data) {
    return null;
  }
  // 각 저장 self 리다이렉트(reload) → refetch 시 key 변경으로 폼 remount.
  return <SalesForms key={dataUpdatedAt} productCode={productCode} data={data} />;
};

const DATE_MASK = "0000-00-00 00:00";

type RadioOption = { value: string; label: string };
const RadioField = ({
  label,
  name,
  value,
  onChange,
  options,
  colClass = "col-3",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: RadioOption[];
  colClass?: string;
}) => (
  <div className="row mb-2 border">
    <label className="col-sm-3 col-form-label bg-light">{label}</label>
    <div className={`${colClass} mt-1`}>
      {options.map((o) => (
        <div className="form-check form-radio-dark form-check-inline" key={o.value}>
          <input
            type="radio"
            id={`${name}_${o.value}`}
            name={name}
            className="form-check-input"
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          <label className="form-check-label" htmlFor={`${name}_${o.value}`}>
            {o.label}
          </label>
        </div>
      ))}
    </div>
  </div>
);

const YN: RadioOption[] = [
  { value: "Y", label: "예" },
  { value: "N", label: "아니오" },
];

const SalesForms = ({ productCode, data }: { productCode: string; data: OptionSalesData }) => {
  const productViewer = useProductViewer();
  const [sales, setSales] = useState<OptionSalesSettings>(data.sales);
  const [price, setPrice] = useState<OptionPriceSettings>(data.price);
  const [supplier, setSupplier] = useState<OptionSupplierSettings>(data.supplier);

  const saveSales = useSaveOptionSales(productCode);
  const savePrice = useSaveOptionPrice(productCode);
  const saveSupplier = useSaveOptionSupplier(productCode);
  const deleteDelivery = useDeleteSalesDeliveryItem(productCode);

  const setS = (key: keyof OptionSalesSettings, value: string) =>
    setSales((prev) => ({ ...prev, [key]: value }));
  const setP = (key: keyof OptionPriceSettings, value: string) =>
    setPrice((prev) => ({ ...prev, [key]: value }));
  const setSup = (key: keyof OptionSupplierSettings, value: string) =>
    setSupplier((prev) => ({ ...prev, [key]: value }));

  const onSaveSales = (e: FormEvent) => {
    e.preventDefault();
    saveSales.mutate(sales);
  };
  const onSavePrice = (e: FormEvent) => {
    e.preventDefault();
    savePrice.mutate(price);
  };
  const onSaveSupplier = (e: FormEvent) => {
    e.preventDefault();
    saveSupplier.mutate(supplier);
  };
  const onDeleteDelivery = (item_id: string, order_system: string) => {
    if (window.confirm("삭제하시겠습니까?")) {
      deleteDelivery.mutate({ item_id, order_system });
    }
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
                <li className="breadcrumb-item active">옵션상품 판매 설정</li>
              </ol>
            </div>
            <h4 className="page-title">
              {data.product.product_name}{" "}
              <span className="badge bg-dark">{data.product.platform_name}</span>{" "}
              <span className="badge bg-dark">{data.product.game_type}</span>{" "}
              <span className="badge bg-dark">{data.product.display_type}</span>
            </h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-2 mb-2 mb-sm-0">
          <OptionSubNav
            productCode={productCode}
            active="sales"
            gameType={data.product.game_type}
          />
        </div>
        <div className="col-10">
          <div className="row">
            {/* col-8 판매설정 */}
            <div className="col-8">
              <form
                id="frm"
                name="frm"
                method="post"
                className="form-horizontal"
                onSubmit={onSaveSales}
              >
                <div className="card border">
                  <div className="card-header bg-secondary text-white fw-bold font-15">
                    옵션상품 판매 설정
                  </div>
                  <div className="card-body">
                    <RadioField
                      label="* 진열상태"
                      name="is_view"
                      value={sales.is_view}
                      onChange={(v) => setS("is_view", v)}
                      colClass="col-9"
                      options={[
                        { value: "Y", label: "진열함" },
                        { value: "N", label: "진열안함" },
                      ]}
                    />
                    <RadioField
                      label="* 판매상태"
                      name="status"
                      value={sales.status}
                      onChange={(v) => setS("status", v)}
                      colClass="col-9"
                      options={[
                        { value: "9", label: "승인대기" },
                        { value: "0", label: "판매중" },
                        { value: "1", label: "판매중지" },
                        { value: "3", label: "판매종료" },
                      ]}
                    />
                    <RadioField
                      label="* 구매수량 제한여부"
                      name="purchase_limit_yn"
                      value={sales.purchase_limit_yn}
                      onChange={(v) => setS("purchase_limit_yn", v)}
                      options={YN}
                    />
                    <div className="row mb-2">
                      <label htmlFor="purchase_limit" className="col-sm-3 col-form-label bg-light">
                        * 구매수량제한
                      </label>
                      <div className="col-1 mt-1">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          id="purchase_limit"
                          name="purchase_limit"
                          placeholder="구매가능수량"
                          value={sales.purchase_limit}
                          onChange={(e) => setS("purchase_limit", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row mb-2">
                      <label htmlFor="release_date" className="col-sm-3 col-form-label bg-light">
                        * 출시일
                      </label>
                      <div className="col-3">
                        <div className="position-relative">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            id="release_date"
                            name="release_date"
                            value={sales.release_date}
                            onChange={(e) =>
                              setS("release_date", applyMask(e.target.value, DATE_MASK))
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row mb-2">
                      <label htmlFor="delivery_date" className="col-sm-3 col-form-label bg-light">
                        * 수령가능일자
                      </label>
                      <div className="col-3 mt-1">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          id="delivery_date"
                          name="delivery_date"
                          placeholder="수령가능일자"
                          value={sales.delivery_date}
                          onChange={(e) =>
                            setS("delivery_date", applyMask(e.target.value, DATE_MASK))
                          }
                          required
                        />
                      </div>
                    </div>
                    <RadioField
                      label="* 예약판매여부"
                      name="is_preorder"
                      value={sales.is_preorder}
                      onChange={(v) => setS("is_preorder", v)}
                      options={YN}
                    />
                    <RadioField
                      label="* 품절여부"
                      name="soldout"
                      value={sales.soldout}
                      onChange={(v) => setS("soldout", v)}
                      options={YN}
                    />
                    <RadioField
                      label="* 본인인증 필수"
                      name="is_auth"
                      value={sales.is_auth}
                      onChange={(v) => setS("is_auth", v)}
                      options={YN}
                    />
                    <RadioField
                      label="* 구매특전 제공여부"
                      name="is_bonus"
                      value={sales.is_bonus}
                      onChange={(v) => setS("is_bonus", v)}
                      options={YN}
                    />
                    <RadioField
                      label="* 네이버페이 포인트 쿠폰 제공"
                      name="is_naverpay_coupon"
                      value={sales.is_naverpay_coupon}
                      onChange={(v) => setS("is_naverpay_coupon", v)}
                      options={YN}
                    />
                    <RadioField
                      label="* 배송유형"
                      name="delivery_type"
                      value={sales.delivery_type}
                      onChange={(v) => setS("delivery_type", v)}
                      colClass="col-6"
                      options={[
                        { value: "1", label: "코드발송" },
                        { value: "2", label: "실물배송" },
                        { value: "3", label: "코드발송 + 실물배송" },
                      ]}
                    />
                  </div>
                  <div className="card-footer">
                    <div className="text-end">
                      {!productViewer && (
                        <button type="submit" className="btn btn-primary shadow-none">
                          판매설정 저장
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* col-4 가격설정 + 공급처설정 */}
            <div className="col-4">
              <form
                id="price_frm"
                name="price_frm"
                method="post"
                className="form-horizontal"
                onSubmit={onSavePrice}
              >
                <div className="card border">
                  <div className="card-header bg-secondary text-white fw-bold font-15">
                    옵션상품 가격설정
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-12">
                        <PriceRow
                          label="* 소비자가"
                          id="consumer_price"
                          prefix="\"
                          value={price.consumer_price}
                          onChange={(v) => setP("consumer_price", v)}
                        />
                        <PriceRow
                          label="* DGKR 판매가"
                          id="price"
                          prefix="\"
                          value={price.price}
                          onChange={(v) => setP("price", v)}
                        />
                        <PriceRow
                          label="할인률"
                          id="discount"
                          suffix="%"
                          maxLength={2}
                          value={price.discount}
                          onChange={(v) => setP("discount", v)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="text-end">
                      {!productViewer && (
                        <button type="submit" className="btn btn-primary shadow-none">
                          가격 설정 저장
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>

              <form
                id="supplier_frm"
                name="supplier_frm"
                method="post"
                className="form-horizontal"
                onSubmit={onSaveSupplier}
              >
                <div className="card border">
                  <div className="card-header bg-secondary text-white fw-bold font-15">
                    옵션상품 공급처 설정
                  </div>
                  <div className="card-body">
                    <div className="mb-2 row">
                      <label htmlFor="supplier_code" className="col-sm-4 col-form-label bg-light">
                        * 공급처
                      </label>
                      <div className="col-sm-8">
                        <select
                          id="supplier_code"
                          name="supplier_code"
                          className="form-select"
                          value={supplier.supplier_code}
                          onChange={(e) => setSup("supplier_code", e.target.value)}
                          required
                        >
                          <option value="">:::선택:::</option>
                          {data.publishers.map((p) => (
                            <option key={p.publisher_code} value={p.publisher_code}>
                              {p.publisher_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <PriceRow
                      label="* 공급처 SRP"
                      id="product_srp"
                      prefix="\"
                      labelCol="col-sm-4"
                      value={supplier.product_srp}
                      onChange={(v) => setSup("product_srp", v)}
                    />
                    <PriceRow
                      label="공급처 PPR"
                      id="product_ppr"
                      prefix="\"
                      labelCol="col-sm-4"
                      value={supplier.product_ppr}
                      onChange={(v) => setSup("product_ppr", v)}
                    />
                    <PriceRow
                      label="공급처 RS"
                      id="product_rs"
                      suffix="%"
                      maxLength={2}
                      labelCol="col-sm-4"
                      value={supplier.product_rs}
                      onChange={(v) => setSup("product_rs", v)}
                    />
                  </div>
                  <div className="card-footer">
                    <div className="text-end">
                      {!productViewer && (
                        <button type="submit" className="btn btn-primary shadow-none">
                          공급처 설정 저장
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* 배송아이템 설정 — 목록·삭제 (검색/추가 tfoot는 분리 단위) */}
          <div className="card">
            <h5 className="card-header bg-secondary text-white">옵션상품 배송아이템 설정</h5>
            <div className="card-body p-2">
              <table className="table table-bordered table-centered mb-0 table-sm caption-top">
                <caption className="py-1">배송아이템 세부정보</caption>
                <thead className="table-light font-13">
                  <tr>
                    <th className="text-center">연동시스템</th>
                    <th className="text-center">플랫폼</th>
                    <th className="text-center">아이템 유형</th>
                    <th className="text-center">아이템 정보</th>
                    <th className="text-center">공급처</th>
                    <th className="text-center">비고</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {data.deliveries.map((d) => (
                    <tr key={`${d.order_system}-${d.item_id}`}>
                      <td className="text-center">{d.order_system_name}</td>
                      <td className="text-center">{d.item_platform}</td>
                      <td className="text-center">{d.item_type}</td>
                      <td>
                        {d.item_name}
                        <br />({d.item_id})
                      </td>
                      <td className="text-center">{d.item_publisher}</td>
                      <td className="text-center">
                        {!productViewer && (
                          <button
                            className="btn btn_link"
                            type="button"
                            onClick={() => onDeleteDelivery(d.item_id, d.order_system)}
                          >
                            <i className="mdi mdi-18px mdi-delete email-action-icons-item" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* tfoot: 연동시스템 검색·추가(5종) */}
                <tfoot>
                  <DeliverySearchPanel productCode={productCode} productViewer={productViewer} />
                </tfoot>
              </table>
            </div>
          </div>

          {/* 타임딜 설정·이력 — display_type==timedeal일 때만 */}
          {data.product.display_type === "timedeal" && <OptionTimedeal productCode={productCode} />}
        </div>
      </div>
    </>
  );
};

// 가격/공급처 공통 금액·비율 입력 행(input-group prefix/suffix).
const PriceRow = ({
  label,
  id,
  value,
  onChange,
  prefix,
  suffix,
  maxLength,
  labelCol = "col-sm-4",
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  maxLength?: number;
  labelCol?: string;
}) => (
  <div className="row mb-2">
    <label htmlFor={id} className={`${labelCol} col-form-label bg-light`}>
      {label}
    </label>
    <div className="col-8">
      <div className="input-group">
        {prefix && (
          <div className="input-group-text" style={{ fontFamily: "dotum" }}>
            {prefix}
          </div>
        )}
        <input
          type="text"
          className="form-control"
          id={id}
          name={id}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && (
          <div className="input-group-text" style={{ fontFamily: "dotum" }}>
            {suffix}
          </div>
        )}
      </div>
    </div>
  </div>
);
