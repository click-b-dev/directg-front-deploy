import { useEffect, useState } from "react";
import {
  useAssetCodeGroup,
  useModifyAssetCode,
  useDeleteAssetCode,
  type AssetCodeGroupItem,
} from "@entities/asset";

// legacy $code_groups (asset.md 3장) — 순서 고정, 첫 탭 active.
const CODE_GROUPS = [
  { gid: "PDTP", gname: "상품유형 (Product Type)" },
  { gid: "ASTP", gname: "상품형식 (Asset Type)" },
  { gid: "PLFM", gname: "플랫폼 (Platform)" },
  { gid: "PUBL", gname: "공급처 (Publisher)" },
] as const;

export const AssetCodeListScreen = () => {
  useEffect(() => {
    document.title = "Asset Code 현황";
  }, []);

  const [group, setGroup] = useState<string>("PDTP");
  const { data } = useAssetCodeGroup(group);
  const modifyMutation = useModifyAssetCode();
  const deleteMutation = useDeleteAssetCode();

  // 수정 모달(BS JS 미로드 → React 제어).
  const [modalCode, setModalCode] = useState<{ code_id: string } | null>(null);
  const [nameInput, setNameInput] = useState("");

  const content = data?.content ?? [];

  const openModifyModal = (code: string, name: string) => {
    setModalCode({ code_id: code });
    setNameInput(name);
  };

  const handleModifySubmit = () => {
    if (!modalCode) return;
    const name = nameInput.trim();
    if (name === "") {
      window.alert("코드명을 입력하세요.");
      return;
    }
    modifyMutation.mutate(
      { code_id: modalCode.code_id, name },
      {
        onSuccess: (res) => {
          if (res.id) {
            setModalCode(null);
            window.alert("코드 수정 완료");
          } else {
            window.alert(res.message ? res.message : "처리에 실패했습니다.");
          }
        },
      },
    );
  };

  const handleDelete = (code: string, name: string) => {
    if (!window.confirm(`코드 [${code}] ${name} 을(를) 삭제하시겠습니까?`)) return;
    deleteMutation.mutate(code, {
      onSuccess: (res) => {
        if (res.id) {
          window.alert("코드 삭제 완료");
        } else {
          window.alert(res.message ? res.message : "처리에 실패했습니다.");
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
                <li className="breadcrumb-item active">Asset Code 현황</li>
              </ol>
            </div>
            <h4 className="page-title">Asset Code 현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="alert alert-secondary py-2 mb-2 font-13">
            Asset 서버에서 실시간 조회한 코드 그룹별 현황입니다. 그룹 탭을 선택하세요.
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {/* 그룹 탭 */}
              <ul
                className="nav nav-tabs nav-bordered nav-justified mb-3 fs-6"
                id="codeTab"
                role="tablist"
              >
                {CODE_GROUPS.map((g) => (
                  <li key={g.gid} className="nav-item">
                    <a
                      className={`nav-link ${group === g.gid ? "active" : ""}`}
                      data-group={g.gid}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setGroup(g.gid);
                      }}
                    >
                      <span className="font-12">{g.gname}</span>
                    </a>
                  </li>
                ))}
              </ul>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  총{" "}
                  <strong id="total" className="text-danger">
                    {content.length}
                  </strong>{" "}
                  개
                </div>
                <div className="text-muted font-12">
                  현재 그룹: <strong id="cur_group">{group}</strong>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-centered table-sm table-bordered mb-0" id="code_list">
                  <thead className="table-dark font-13">
                    <tr>
                      <th className="text-center text-nowrap">번호</th>
                      <th className="text-center text-nowrap">코드(ID)</th>
                      <th className="text-center text-nowrap">그룹</th>
                      <th className="text-center text-nowrap">시퀀스</th>
                      <th className="text-start w-100">코드명</th>
                      <th className="text-center text-nowrap">관리</th>
                    </tr>
                  </thead>
                  <tbody className="font-12">
                    {content.length > 0 ? (
                      content.map((item: AssetCodeGroupItem, i) => {
                        const grp = item.groupId || (item.id ? item.id.substring(0, 4) : "");
                        const seq = item.subId || (item.id ? item.id.substring(4) : "");
                        const name = item.name || "";
                        return (
                          <tr key={item.id}>
                            <td className="text-center text-nowrap">{i + 1}</td>
                            <td className="text-center text-nowrap">
                              <span className="eng">{item.id}</span>
                            </td>
                            <td className="text-center text-nowrap">
                              <span className="eng">{grp}</span>
                            </td>
                            <td className="text-center text-nowrap">
                              <span className="eng">{seq}</span>
                            </td>
                            <td className="text-start w-100">{name}</td>
                            <td className="text-center text-nowrap">
                              <button
                                type="button"
                                className="btn btn-outline-warning btn-sm me-1 btn_code_modify"
                                data-code={item.id}
                                data-name={name}
                                onClick={() => openModifyModal(item.id, name)}
                              >
                                수정
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm btn_code_delete"
                                data-code={item.id}
                                data-name={name}
                                onClick={() => handleDelete(item.id, name)}
                              >
                                삭제
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-3">
                          조회된 코드가 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 코드 수정 모달 (React 제어 — BS JS 미로드) */}
      {modalCode && (
        <>
          <div
            className="modal fade show"
            id="codeModifyModal"
            tabIndex={-1}
            style={{ display: "block" }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5">Asset Code 수정</h1>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setModalCode(null)}
                  />
                </div>
                <div className="modal-body">
                  <form name="codeFrm" id="codeFrm">
                    <input type="hidden" name="mode" value="asset_code_modify" readOnly />
                    <div className="mb-3">
                      <label htmlFor="modify_code_id" className="col-form-label">
                        코드(ID)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="modify_code_id"
                        name="code_id"
                        value={modalCode.code_id}
                        readOnly
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="modify_code_name" className="col-form-label">
                        코드명
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="modify_code_name"
                        name="name"
                        required
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                      />
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary shadow-none"
                    onClick={() => setModalCode(null)}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary shadow-none"
                    id="btn_code_modify_submit"
                    onClick={handleModifySubmit}
                  >
                    수정
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
