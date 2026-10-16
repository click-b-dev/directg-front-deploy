import { useEffect } from "react";
import { useAssetCodes, useCreateAsset, type AssetCodeOption } from "@entities/asset";

const CodeSelect = ({
  name,
  placeholder,
  options,
  required,
}: {
  name: string;
  placeholder: string;
  options: AssetCodeOption[];
  required?: boolean;
}) => (
  <select className="form-select" name={name} id={name} required={required} defaultValue="">
    <option value="">{placeholder}</option>
    {options.map((opt) => (
      <option key={opt.code_id} value={opt.code_id}>
        {opt.name}
      </option>
    ))}
  </select>
);

export const AssetRegisterScreen = () => {
  useEffect(() => {
    document.title = "Asset 등록";
  }, []);

  const { data: codes } = useAssetCodes();
  const createMutation = useCreateAsset();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const payload = {
      asset_name: String(fd.get("asset_name") ?? ""),
      productTypeCd: String(fd.get("productTypeCd") ?? ""),
      assetTypeCd: String(fd.get("assetTypeCd") ?? ""),
      platformCd: String(fd.get("platformCd") ?? ""),
      publisherCd: String(fd.get("publisherCd") ?? ""),
    };
    createMutation.mutate(payload, {
      onSuccess: (res) => {
        if (res.id) {
          window.alert(`Asset 등록 완료 (ID: ${res.id})`);
          window.location.href = "/goods/asset/asset_list";
        } else {
          window.alert(
            `Asset 등록 실패: ${res.message ?? "등록에 실패했습니다. (이름 중복 또는 필수값 누락 확인)"}`,
          );
        }
      },
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
                    재고
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Asset 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Asset 등록</li>
              </ol>
            </div>
            <h4 className="page-title">Asset 등록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-6">
          <div className="card">
            <div className="card-body">
              <form className="form-horizontal" onSubmit={handleSubmit}>
                <input type="hidden" name="mode" id="mode" value="asset_register" readOnly />
                <div className="row mb-3">
                  <label htmlFor="asset_name" className="col-3 col-form-label">
                    *Asset 명
                  </label>
                  <div className="col-9">
                    <input
                      type="text"
                      className="form-control"
                      id="asset_name"
                      name="asset_name"
                      placeholder=""
                      required
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <label htmlFor="productTypeCd" className="col-3 col-form-label">
                    *Asset 유형
                  </label>
                  <div className="col-9">
                    <CodeSelect
                      name="productTypeCd"
                      placeholder="::: Asset 유형 선택 :::"
                      options={codes?.product_type ?? []}
                      required
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <label htmlFor="assetTypeCd" className="col-3 col-form-label">
                    *Asset 형식
                  </label>
                  <div className="col-9">
                    <CodeSelect
                      name="assetTypeCd"
                      placeholder="::: Asset 형식 선택 :::"
                      options={codes?.asset_type ?? []}
                      required
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <label htmlFor="platformCd" className="col-3 col-form-label">
                    *Asset 플랫폼
                  </label>
                  <div className="col-9">
                    <CodeSelect
                      name="platformCd"
                      placeholder="::: Asset 플랫폼 선택 :::"
                      options={codes?.platform ?? []}
                      required
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <label htmlFor="publisherCd" className="col-3 col-form-label">
                    Asset 공급처
                  </label>
                  <div className="col-9">
                    <CodeSelect
                      name="publisherCd"
                      placeholder="::: Asset 공급처 선택 :::"
                      options={codes?.publisher ?? []}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-12">
                    <div className="text-end">
                      <button type="submit" className="btn btn-primary shadow-none">
                        Asset 등록
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
