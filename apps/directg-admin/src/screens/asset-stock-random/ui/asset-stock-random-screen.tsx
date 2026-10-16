import { useEffect } from "react";
import {
  useAssetStockRandomList,
  useCheckAssetStockRandom,
  type AssetCodeOption,
  type AssetStockRandomItem,
} from "@entities/asset-stock-random";
import { ServerPagination, LoadingOverlay } from "@shared/ui";

export type AssetStockRandomSearchProps = {
  page: number;
  asset_id: string;
  asset_name: string;
  publisherCd: string;
  productTypeCd: string;
  platformCd: string;
};

const BASE_URL = "/goods/stock/asset_stock_random";

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

export const AssetStockRandomScreen = (search: AssetStockRandomSearchProps) => {
  useEffect(() => {
    document.title = "Asset 랜덤박스 재고현황";
  }, []);

  const { data } = useAssetStockRandomList(search);
  const checkMutation = useCheckAssetStockRandom();

  const items = data?.items ?? [];
  const totalResults = data?.pagination.total_results ?? 0;
  const totalPages = data?.pagination.total_pages ?? 0;
  const codes = data?.codes;

  return (
    <>
      <LoadingOverlay show={checkMutation.isPending} />

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
                <li className="breadcrumb-item active">Asset 랜덤박스 재고현황</li>
              </ol>
            </div>
            <h4 className="page-title">Asset 랜덤박스 재고현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">Asset 검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <input type="hidden" id="page" name="page" value={search.page} readOnly />
              <div className="row mb-2">
                <div className="col-lg-2">
                  <div className="row">
                    <label htmlFor="asset_id" className="col-sm-4 col-form-label bg-light border">
                      Asset ID
                    </label>
                    <div className="col-sm-8">
                      <input
                        type="text"
                        className="form-control"
                        id="asset_id"
                        name="asset_id"
                        placeholder="Asset ID"
                        defaultValue={search.asset_id}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="row">
                    <label htmlFor="asset_name" className="col-sm-2 col-form-label bg-light border">
                      Asset 이름
                    </label>
                    <div className="col-sm-10">
                      <input
                        type="text"
                        className="form-control"
                        id="asset_name"
                        name="asset_name"
                        placeholder="Asset 이름"
                        defaultValue={search.asset_name}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
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
              </div>

              <div className="row mb-2">
                <div className="col-lg-4">
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
                <div className="col-lg-4">
                  <div className="row">
                    <label htmlFor="platformCd" className="col-sm-4 col-form-label bg-light border">
                      Asset 플랫폼
                    </label>
                    <div className="col-sm-8">
                      <CodeSelect
                        name="platformCd"
                        placeholder="::: Asset 플랫폼 선택 :::"
                        options={codes?.platform ?? []}
                        selected={search.platformCd}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary">
                      Asset 검색
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
          * 에셋 서버 실시간이 아닌 <strong>동기화된 재고</strong>입니다. (assetType='랜덤박스'
          자산만 표시)
        </div>
      </div>

      <div className="row">
        <div className="col-12 mb-2">
          총{" "}
          <strong id="total" className="text-danger">
            {totalResults.toLocaleString()}
          </strong>{" "}
          개
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <table className="table table-sm table-centered table-bordered mb-0">
            <thead className="table-dark font-13">
              <tr>
                <th className="text-center">Asset ID</th>
                <th className="text-center">Asset 이름</th>
                <th className="text-center">Asset 유형</th>
                <th className="text-center">Asset 형식</th>
                <th className="text-center">Asset 플랫폼</th>
                <th className="text-center">Asset 공급처</th>
                <th className="text-center">재고수량</th>
                <th className="text-center">업데이트 일자</th>
                <th className="text-center">비고</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {items.map((item: AssetStockRandomItem) => (
                <tr key={item.asset_id}>
                  <td className="text-center">{item.asset_id}</td>
                  <td>{item.asset_name}</td>
                  <td className="text-center">{item.productType}</td>
                  <td className="text-center">{item.assetType}</td>
                  <td className="text-center">{item.platform}</td>
                  <td className="text-center">{item.publisher}</td>
                  <td className="text-end">{item.stock.toLocaleString()}</td>
                  <td className="text-center">{item.update_dt}</td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-outline-dark btn-sm btn_stock_chk"
                      data-idx={item.asset_id}
                      onClick={() => checkMutation.mutate(item.asset_id)}
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
                asset_id: search.asset_id,
                asset_name: search.asset_name,
                publisherCd: search.publisherCd,
                productTypeCd: search.productTypeCd,
                platformCd: search.platformCd,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
