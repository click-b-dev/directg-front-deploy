import { useEffect, useState } from "react";
import {
  useAssetCodes,
  useAssetList,
  useDeleteAsset,
  useRegisterAssetInventory,
  useRegisterAssetKeys,
  type AssetCodeOption,
  type AssetListItem,
} from "@entities/asset";
import { Pagination } from "@shared/ui";

export type AssetSearchProps = {
  page: number;
  searchValue: string;
  searchID: string;
  publisherCd: string;
  productTypeCd: string;
  assetTypeCd: string;
  platformCd: string;
};

const BASE_URL = "/goods/asset/asset_list";

const CodeSelect = ({
  name,
  placeholder,
  options,
  selected,
}: {
  name: string;
  placeholder: string;
  options: AssetCodeOption[];
  selected: string;
}) => (
  <select className="form-select" name={name} id={name} defaultValue={selected}>
    <option value="">{placeholder}</option>
    {options.map((opt) => (
      <option key={opt.code_id} value={opt.code_id}>
        {opt.name}
      </option>
    ))}
  </select>
);

export const AssetListScreen = (search: AssetSearchProps) => {
  useEffect(() => {
    document.title = "Asset 현황";
  }, []);

  const { data } = useAssetList(search);
  const { data: codes } = useAssetCodes();
  const deleteMutation = useDeleteAsset();
  const inventoryMutation = useRegisterAssetInventory();
  const keysMutation = useRegisterAssetKeys();

  // 키 등록 모달(Bootstrap JS 미로드 → React 제어).
  const [modalAsset, setModalAsset] = useState<{ id: string; title: string } | null>(null);
  const [keyText, setKeyText] = useState("");

  const content = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const openKeyModal = (asset: AssetListItem) => {
    setModalAsset({ id: asset.id, title: asset.title });
    setKeyText(""); // 다른 Asset로 열 때 이전 키 잔존 방지
  };

  const handleDelete = (assetId: string) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    deleteMutation.mutate(assetId, {
      onSuccess: (res) => window.alert(res.message),
    });
  };

  const handleBasicRegister = (assetId: string, regDt: string) => {
    inventoryMutation.mutate({ asset_id: assetId, reg_date: regDt });
  };

  const handleKeySubmit = () => {
    if (!modalAsset) return;
    keysMutation.mutate(
      { asset_id: modalAsset.id, asset_item: keyText },
      {
        onSuccess: (res) => {
          // 등록 후 새로고침하지 않음 — 입력한 키를 모달에 유지(의도)
          if (res.count > 0) {
            window.alert(`${res.count}개 등록 완료`);
          } else {
            window.alert("등록오류 (등록된 키 없음)");
          }
        },
      },
    );
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
                    재고
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Asset 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Asset 현황</li>
              </ol>
            </div>
            <h4 className="page-title">Asset 현황</h4>
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
              {/* 검색 제출 시 항상 1페이지부터 */}
              <input type="hidden" id="page" name="page" value="1" readOnly />
              <div className="row mb-2">
                <div className="col-lg-4">
                  <div className="row">
                    <label
                      htmlFor="searchValue"
                      className="col-sm-4 col-form-label bg-light border"
                    >
                      Asset 이름
                    </label>
                    <div className="col-sm-8">
                      <input
                        type="text"
                        className="form-control"
                        id="searchValue"
                        name="searchValue"
                        placeholder="Asset 이름"
                        defaultValue={search.searchValue}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="row">
                    <label htmlFor="searchID" className="col-sm-4 col-form-label bg-light border">
                      Asset ID
                    </label>
                    <div className="col-sm-8">
                      <input
                        type="text"
                        className="form-control"
                        id="searchID"
                        name="searchID"
                        placeholder="Asset ID"
                        defaultValue={search.searchID}
                      />
                    </div>
                    <span className="text-danger">※ AssetID를 이름보다 우선검색</span>
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
                    <label
                      htmlFor="assetTypeCd"
                      className="col-sm-4 col-form-label bg-light border"
                    >
                      Asset 형식
                    </label>
                    <div className="col-sm-8">
                      <CodeSelect
                        name="assetTypeCd"
                        placeholder="::: Asset 형식 선택 :::"
                        options={codes?.asset_type ?? []}
                        selected={search.assetTypeCd}
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
                    <button type="submit" className="btn btn-primary shadow-none">
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
        <div className="col-12 mb-1 font-12 text-muted">
          * 동기화 DB가 아닌 <strong>에셋 서버 실시간(API)</strong> 데이터입니다. 재고 수량은 [재고
          관리(DB) &gt; Asset 재고현황]에서 확인하세요.
        </div>
      </div>

      <div className="row">
        <div className="col-12 mb-2">
          총{" "}
          <strong id="total" className="text-danger">
            {totalElements.toLocaleString()}
          </strong>{" "}
          개
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              <table
                className="table table-centered nowrap table-sm table-bordered"
                id="asset_list"
              >
                <thead className="table-dark font-13">
                  <tr>
                    <th className="text-center" style={{ width: "4%" }}>
                      Asset
                      <br />
                      ID
                    </th>
                    <th className="text-center" style={{ width: "25%" }}>
                      Asset 이름
                    </th>
                    <th className="text-center" style={{ width: "6%" }}>
                      Asset
                      <br />
                      유형
                    </th>
                    <th className="text-center" style={{ width: "6%" }}>
                      Asset
                      <br />
                      형식
                    </th>
                    <th className="text-center" style={{ width: "7%" }}>
                      Asset
                      <br />
                      플랫폼
                    </th>
                    <th className="text-center" style={{ width: "9%" }}>
                      Asset
                      <br />
                      공급처
                    </th>
                    <th className="text-center" style={{ width: "7%" }}>
                      Asset
                      <br />
                      수정
                    </th>
                    <th className="text-center" style={{ width: "7%" }}>
                      Asset
                      <br />
                      삭제
                    </th>
                    <th className="text-center" style={{ width: "9%" }}>
                      Asset 키
                      <br />
                      사용현황
                    </th>
                    <th className="text-center" style={{ width: "8%" }}>
                      Asset 키
                      <br />
                      등록
                    </th>
                    <th className="text-center" style={{ width: "8%" }}>
                      기초정보 등록
                    </th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {content.map((item: AssetListItem) => (
                    <tr key={item.id}>
                      <td className="text-center">{item.id}</td>
                      <td className="text-start">
                        <span className="eng font-12">{item.title}</span>
                      </td>
                      <td className="text-center">{item.productType}</td>
                      <td className="text-center">{item.assetType}</td>
                      <td className="text-center">
                        <span className="eng font-12">{item.platform}</span>
                      </td>
                      <td className="text-center">
                        <span className="eng font-12">{item.publisher}</span>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-outline-warning btn-sm btn_asset_modify"
                          data-idx={item.id}
                          onClick={() => {
                            window.location.href = `/goods/asset/asset_modify?asset_id=${encodeURIComponent(item.id)}`;
                          }}
                        >
                          Asset 수정
                        </button>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm btn_asset_delete"
                          data-idx={item.id}
                          onClick={() => handleDelete(item.id)}
                        >
                          Asset 삭제
                        </button>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-outline-info btn-sm btn_asset_item"
                          data-idx={item.id}
                          onClick={() => {
                            window.location.href = `/goods/asset/asset_item_list?asset_id=${encodeURIComponent(item.id)}`;
                          }}
                        >
                          키 사용현황
                        </button>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-outline-warning btn-sm btn_asset_item_register"
                          data-idx={item.id}
                          data-title={item.title}
                          onClick={() => openKeyModal(item)}
                        >
                          키 등록
                        </button>
                      </td>
                      {item.is_registered ? (
                        <td className="text-center">등록완료</td>
                      ) : (
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-outline-dark btn-sm btn_stock_basic"
                            data-idx={item.id}
                            data-regdt={item.regDt}
                            onClick={() => handleBasicRegister(item.id, item.regDt)}
                          >
                            기초정보등록
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div id="paging" className="text-center mt-3">
                <Pagination
                  page={search.page}
                  totalPages={totalPages}
                  baseUrl={BASE_URL}
                  params={{
                    searchValue: search.searchValue,
                    publisherCd: search.publisherCd,
                    productTypeCd: search.productTypeCd,
                    assetTypeCd: search.assetTypeCd,
                    platformCd: search.platformCd,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asset 키 등록 모달 (React 제어 — BS JS 미로드) */}
      {modalAsset && (
        <>
          <div
            className="modal fade show"
            id="exampleModal"
            tabIndex={-1}
            style={{ display: "block" }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5">{modalAsset.title}</h1>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setModalAsset(null)}
                  />
                </div>
                <div className="modal-body">
                  <form name="assetFrm" id="assetFrm" method="post" action="asset_ps.php">
                    <input type="hidden" name="mode" value="asset_item_register" />
                    <div className="mb-3">
                      <label htmlFor="asset_id" className="col-form-label">
                        Asset ID
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="asset_id"
                        name="asset_id"
                        value={modalAsset.id}
                        readOnly
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="asset_item" className="col-form-label">
                        Asset 키
                      </label>
                      <textarea
                        className="form-control"
                        id="asset_item"
                        name="asset_item"
                        rows={20}
                        required
                        value={keyText}
                        onChange={(e) => setKeyText(e.target.value)}
                      />
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-primary shadow-none"
                    id="btn_asset_item_register"
                    onClick={handleKeySubmit}
                  >
                    키 등록
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </>
  );
};
