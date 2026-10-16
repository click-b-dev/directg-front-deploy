import { useEffect } from "react";
import { useRegisterAssetCode } from "@entities/asset";

// legacy $code_groups (asset.md 3장) — 옵션 "gid / gname".
const CODE_GROUPS = [
  { gid: "PDTP", gname: "상품유형 (Product Type)" },
  { gid: "ASTP", gname: "상품형식 (Asset Type)" },
  { gid: "PLFM", gname: "플랫폼 (Platform)" },
  { gid: "PUBL", gname: "공급처 (Publisher)" },
] as const;

export const AssetCodeRegisterScreen = () => {
  useEffect(() => {
    document.title = "Asset Code 등록";
  }, []);

  const registerMutation = useRegisterAssetCode();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const payload = {
      group_id: String(fd.get("group_id") ?? ""),
      name: String(fd.get("name") ?? ""),
    };
    registerMutation.mutate(payload, {
      onSuccess: (res) => {
        if (res.id) {
          window.alert(`코드 등록 완료 (${res.id})`);
          window.location.href = "/goods/asset/asset_code_list";
        } else {
          window.alert(`코드 등록 실패: ${res.message ?? "등록에 실패했습니다."}`);
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
                <li className="breadcrumb-item active">Asset Code 등록</li>
              </ol>
            </div>
            <h4 className="page-title">Asset Code 등록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-6">
          <div className="card">
            <div className="card-body">
              <form className="form-horizontal" onSubmit={handleSubmit}>
                <input type="hidden" name="mode" id="mode" value="asset_code_register" readOnly />
                <div className="row mb-3">
                  <label htmlFor="group_id" className="col-3 col-form-label">
                    *코드 그룹
                  </label>
                  <div className="col-9">
                    <select
                      className="form-select"
                      name="group_id"
                      id="group_id"
                      required
                      defaultValue=""
                    >
                      <option value="">::: 코드 그룹 선택 :::</option>
                      {CODE_GROUPS.map((g) => (
                        <option key={g.gid} value={g.gid}>
                          {g.gid} / {g.gname}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="row mb-3">
                  <label htmlFor="name" className="col-3 col-form-label">
                    *코드명
                  </label>
                  <div className="col-9">
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      maxLength={64}
                      placeholder="코드명 (최대 64자)"
                      required
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-12">
                    <div className="d-flex justify-content-between">
                      <a href="/goods/asset/asset_code_list" className="btn btn-light shadow-none">
                        ← 코드 현황
                      </a>
                      <button type="submit" className="btn btn-primary shadow-none">
                        코드 등록
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
