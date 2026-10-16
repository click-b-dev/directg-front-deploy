import { useEffect } from "react";
import {
  useAssetDetail,
  useAssetCodes,
  useModifyAsset,
  type AssetCodeOption,
} from "@entities/asset";

export type AssetModifySearchProps = {
  asset_id: string;
};

const ASSET_LIST_URL = "/goods/asset/asset_list";

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
  <select className="form-select" name={name} id={name} defaultValue={selected} key={selected}>
    <option value="">{placeholder}</option>
    {options.map((opt) => (
      <option key={opt.code_id} value={opt.code_id}>
        {opt.name}
      </option>
    ))}
  </select>
);

export const AssetModifyScreen = ({ asset_id }: AssetModifySearchProps) => {
  useEffect(() => {
    document.title = "Asset 수정";
  }, []);

  // 진입 검증: asset_id 없으면 목록으로.
  useEffect(() => {
    if (asset_id === "") {
      window.alert("잘못된 접근입니다. (asset_id 없음)");
      window.location.href = ASSET_LIST_URL;
    }
  }, [asset_id]);

  const { data: detail } = useAssetDetail(asset_id);
  const { data: codes } = useAssetCodes();
  const modifyMutation = useModifyAsset();

  // 조회 실패 시 목록으로.
  useEffect(() => {
    if (detail && !detail.found) {
      window.alert(`Asset 서버에서 정보를 불러오지 못했습니다. (id=${asset_id})`);
      window.location.href = ASSET_LIST_URL;
    }
  }, [detail, asset_id]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const payload = {
      asset_id,
      asset_name: String(fd.get("asset_name") ?? ""),
      productTypeCd: String(fd.get("productTypeCd") ?? ""),
      assetTypeCd: String(fd.get("assetTypeCd") ?? ""),
      platformCd: String(fd.get("platformCd") ?? ""),
      publisherCd: String(fd.get("publisherCd") ?? ""),
    };
    modifyMutation.mutate(payload, {
      onSuccess: (res) => {
        if (res.id) {
          window.alert("Asset 수정 완료");
          window.location.href = ASSET_LIST_URL;
        } else {
          window.alert(`Asset 수정 실패: ${res.message ?? "수정에 실패했습니다."}`);
        }
      },
    });
  };

  // 상세·코드 로딩 완료 후에만 폼 렌더(select 프리셀렉트 보장).
  if (!detail || !detail.found || !codes) {
    return null;
  }

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
                <li className="breadcrumb-item active">Asset 수정</li>
              </ol>
            </div>
            <h4 className="page-title">Asset 수정</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-6">
          <div className="card">
            <div className="card-body">
              <form className="form-horizontal" method="POST" onSubmit={handleSubmit}>
                <input type="hidden" name="mode" value="asset_modify" readOnly />
                <div className="mb-2 row">
                  <label htmlFor="asset_id" className="col-sm-3 col-form-label bg-light">
                    * Asset ID
                  </label>
                  <div className="col-sm-9">
                    <input
                      type="text"
                      id="asset_id"
                      name="asset_id"
                      className="form-control"
                      value={detail.asset_id}
                      readOnly
                    />
                  </div>
                </div>
                <div className="mb-2 row">
                  <label htmlFor="asset_name" className="col-sm-3 col-form-label bg-light">
                    * Asset 명
                  </label>
                  <div className="col-sm-9">
                    <input
                      type="text"
                      id="asset_name"
                      name="asset_name"
                      className="form-control"
                      defaultValue={detail.asset_name}
                      required
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="productTypeCd" className="col-3 col-form-label bg-light">
                    Asset 유형
                  </label>
                  <div className="col-9">
                    <CodeSelect
                      name="productTypeCd"
                      placeholder="::: Asset 유형 선택 :::"
                      options={codes?.product_type ?? []}
                      selected={detail.productTypeCd}
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="assetTypeCd" className="col-3 col-form-label bg-light">
                    Asset 형식
                  </label>
                  <div className="col-9">
                    <CodeSelect
                      name="assetTypeCd"
                      placeholder="::: Asset 형식 선택 :::"
                      options={codes?.asset_type ?? []}
                      selected={detail.assetTypeCd}
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="platformCd" className="col-3 col-form-label bg-light">
                    Asset 플랫폼
                  </label>
                  <div className="col-9">
                    <CodeSelect
                      name="platformCd"
                      placeholder="::: Asset 플랫폼 선택 :::"
                      options={codes?.platform ?? []}
                      selected={detail.platformCd}
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="publisherCd" className="col-3 col-form-label bg-light">
                    Asset 공급처
                  </label>
                  <div className="col-9">
                    <CodeSelect
                      name="publisherCd"
                      placeholder="::: Asset 공급처 선택 :::"
                      options={codes?.publisher ?? []}
                      selected={detail.publisherCd}
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-12">
                    <div className="text-end">
                      <button type="submit" className="btn btn-primary shadow-none">
                        Asset 저장
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
