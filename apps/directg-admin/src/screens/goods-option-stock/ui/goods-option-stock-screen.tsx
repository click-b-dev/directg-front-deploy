import { useEffect } from "react";
import {
  useGoodsOptionStockList,
  useCheckGoodsOptionStock,
  useCheckGoodsOptionStockBatch,
  type AssetCodeOption,
  type GoodsOptionStockItem,
} from "@entities/goods-option-stock";
import { ServerPagination, LoadingOverlay, ProductStatusBadge } from "@shared/ui";
import { env } from "@shared/config/env";

export type GoodsOptionStockSearchProps = {
  page: number;
  search_key: string;
  search_value: string;
  publisherCd: string;
  productTypeCd: string;
  assetTypeCd: string;
  platformCd: string;
};

const BASE_URL = "/goods/stock/goods_option_stock";

const goodsOptionViewLink = (code: string) =>
  `/goods/goods_option_view?product_code=${encodeURIComponent(code)}`;

// legacy btn_goods_option_stock_download — 동적 form POST(공급처별 재고 xls 다운로드).
const downloadStock = (publisherCd: string) => {
  const form = document.createElement("form");
  form.action = `${env.apiBaseUrl}/admin/goods/stock/goods-option/download`;
  form.method = "post";
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "publisherCd";
  input.value = publisherCd;
  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

const CodeSelect = ({
  name,
  placeholder,
  options,
  selected,
  className = "form-select",
}: {
  name: string;
  placeholder: string;
  options: AssetCodeOption[];
  selected: string;
  className?: string;
}) => (
  <select className={className} name={name} id={name} defaultValue={selected}>
    <option value="">{placeholder}</option>
    {options.map((opt) => (
      <option key={opt.code_id} value={opt.code_id}>
        {opt.name}
      </option>
    ))}
  </select>
);

export const GoodsOptionStockScreen = (search: GoodsOptionStockSearchProps) => {
  useEffect(() => {
    document.title = "옵션상품 재고현황";
  }, []);

  const { data } = useGoodsOptionStockList(search);
  const checkMutation = useCheckGoodsOptionStock();
  const batchMutation = useCheckGoodsOptionStockBatch();

  const items = data?.items ?? [];
  const totalResults = data?.pagination.total_results ?? 0;
  const totalPages = data?.pagination.total_pages ?? 0;
  const codes = data?.codes;

  const overlay = checkMutation.isPending || batchMutation.isPending;

  return (
    <>
      <LoadingOverlay show={overlay} />

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
                    재고
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    재고관리
                  </a>
                </li>
                <li className="breadcrumb-item active">옵션상품 재고현황</li>
              </ol>
            </div>
            <h4 className="page-title">옵션상품 재고현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">옵션상품 검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <input type="hidden" id="page" name="page" value={search.page} readOnly />
              <div className="row mb-2">
                <div className="col-lg-6">
                  <div className="input-group row">
                    <select
                      className="form-select col-sm-3"
                      name="search_key"
                      id="search_key"
                      defaultValue={search.search_key || "search_name"}
                    >
                      <option value="search_name">옵션상품명</option>
                      <option value="search_product_code">옵션상품명코드</option>
                      <option value="search_asset_id">Asset ID</option>
                      <option value="search_asset_name">Asset 이름</option>
                    </select>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_value"
                        name="search_value"
                        placeholder="검색어"
                        defaultValue={search.search_value}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="row">
                    <label
                      htmlFor="publisherCd"
                      className="col-sm-4 col-form-label bg-light border"
                    >
                      Asset 공급처
                    </label>
                    <div className="col-sm-8">
                      <CodeSelect
                        name="publisherCd"
                        className="form-select select2"
                        placeholder="::: Asset 공급처 선택 :::"
                        options={codes?.publisher ?? []}
                        selected={search.publisherCd}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="row">
                    <label
                      htmlFor="productTypeCd"
                      className="col-sm-4 col-form-label bg-light border"
                    >
                      Asset 유형
                    </label>
                    <div className="col-sm-8">
                      <CodeSelect
                        name="productTypeCd"
                        placeholder="::: Asset 유형 선택 :::"
                        options={codes?.product_type ?? []}
                        selected={search.productTypeCd}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="text-center">
                    <button type="submit" className="btn btn-primary shadow-none">
                      옵션상품 검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 mb-1 font-12">
          * 에셋 서버 실시간이 아닌 <strong>동기화된 재고</strong>입니다. [저재고 동기화]는 재고 30
          미만 품목만 갱신합니다.
        </div>
      </div>

      <div className="row">
        <div className="col-12 mb-2">
          <div className="float-start">
            총{" "}
            <strong id="total" className="text-danger">
              {totalResults.toLocaleString()}
            </strong>{" "}
            개
          </div>
          <div className="float-end">
            <button
              type="button"
              className="btn btn-danger btn-sm shadow-none me-2"
              id="btn_stock_batch"
              title="재고 30 미만(저재고) 품목만 에셋 서버와 동기화합니다."
              onClick={() => batchMutation.mutate()}
            >
              저재고 동기화
            </button>
            {search.publisherCd && (
              <button
                type="button"
                className="btn btn-success btn-sm shadow-none"
                id="btn_goods_option_stock_download"
                data-publisher={search.publisherCd}
                onClick={() => downloadStock(search.publisherCd)}
              >
                재고현황 다운로드
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <table className="table table-sm table-centered table-bordered mb-0">
            <colgroup>
              <col width="5%" />
              <col width="15%" />
              <col width="7%" />
              <col width="20%" />
              <col width="8%" />
              <col width="8%" />
              <col width="15%" />
              <col width="6%" />
              <col width="12%" />
            </colgroup>
            <thead className="table-dark font-13">
              <tr>
                <th className="text-center">옵션상품코드</th>
                <th className="text-center">옵션상품명</th>
                <th className="text-center">Asset ID</th>
                <th className="text-center">Asset 이름</th>
                <th className="text-center">Asset 유형</th>
                <th className="text-center">Asset 플랫폼</th>
                <th className="text-center">Asset 공급처</th>
                <th className="text-center">재고</th>
                <th className="text-center">비고</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {items.map((item: GoodsOptionStockItem) => (
                <tr
                  key={`${item.product_code}-${item.item_id}`}
                  className={item.stock === 0 && item.soldout !== "Y" ? "table-danger" : undefined}
                >
                  <td className="text-center">
                    <a
                      href={goodsOptionViewLink(item.product_code)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.product_code}
                    </a>
                  </td>
                  <td>
                    {item.product_name} <ProductStatusBadge status={item.status} />{" "}
                    <span className="badge bg-success font-11">
                      {item.soldout === "Y" ? "품절" : ""}
                    </span>
                  </td>
                  <td className="text-center">{item.item_id}</td>
                  <td className="text-start">{item.item_name}</td>
                  <td className="text-center">{item.item_type}</td>
                  <td className="text-center">{item.item_platform}</td>
                  <td className="text-center">{item.item_publisher}</td>
                  <td className="text-end">{item.stock.toLocaleString()}</td>
                  <td className="text-center">
                    {item.update_date}
                    <br />
                    <button
                      type="button"
                      className="btn btn-outline-dark btn-sm btn_stock_chk"
                      data-idx={item.item_id}
                      onClick={() => checkMutation.mutate(item.item_id)}
                    >
                      재고확인
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-center mt-3">
            <ServerPagination
              page={search.page}
              totalPages={totalPages}
              baseUrl={BASE_URL}
              params={{
                search_key: search.search_key,
                search_value: search.search_value,
                publisherCd: search.publisherCd,
                productTypeCd: search.productTypeCd,
                assetTypeCd: search.assetTypeCd,
                platformCd: search.platformCd,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
