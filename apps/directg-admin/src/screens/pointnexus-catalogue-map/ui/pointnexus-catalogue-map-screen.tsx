import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  usePointNexusCatalogueMap,
  usePointNexusCatalogueMapAction,
  searchPointNexusCatalogueMapItems,
  type PnMode,
  type PnCatalogueMapSearchItem,
} from "@entities/pointnexus";

const CATALOGUE_URL = "/goods/pointnexus/pointnexus_catalogue";

const PRODUCT_ID_STYLE: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "12px",
  color: "#6c757d",
  wordBreak: "break-all",
};

type Flash = { message: string; type: string };

// legacy: 자사 옵션상품 status badge.
const StatusBadge = ({ status }: { status?: string }) => {
  if (status === "0") {
    return <span className="badge bg-success">판매중</span>;
  }
  if (status === "1") {
    return <span className="badge bg-warning text-dark">판매중지</span>;
  }
  if (status === "3") {
    return <span className="badge bg-secondary">삭제</span>;
  }
  if (status === "9") {
    return <span className="badge bg-info">승인대기</span>;
  }
  return <span className="badge bg-light text-dark border">{status}</span>;
};

// legacy pointnexus_catalogue_map.php — PointNexus 카탈로그 매핑.
export const PointNexusCatalogueMapScreen = ({
  mode,
  productID,
}: {
  mode: PnMode;
  productID: string;
}) => {
  const { data } = usePointNexusCatalogueMap(mode, productID);
  const action = usePointNexusCatalogueMapAction();
  const [flash, setFlash] = useState<Flash | null>(null);

  // 검색 모달 상태
  const [keyword, setKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalShown, setModalShown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchItems, setSearchItems] = useState<PnCatalogueMapSearchItem[] | null>(null);

  useEffect(() => {
    if (!modalOpen) {
      return;
    }
    const id = requestAnimationFrame(() => setModalShown(true));
    return () => cancelAnimationFrame(id);
  }, [modalOpen]);

  if (!data) {
    return null;
  }

  const { pn_info, is_discontinued, max_update, mapped_list } = data;

  const closeModal = () => {
    setModalShown(false);
    setModalOpen(false);
  };

  const doSearch = async () => {
    const kw = keyword.trim();
    if (kw === "") {
      window.alert("검색어를 입력하세요.");
      return;
    }
    setSearching(true);
    setSearchItems(null);
    setModalOpen(true);
    try {
      const res = await searchPointNexusCatalogueMapItems(mode, productID, kw);
      setSearchItems(res.items || []);
    } catch {
      window.alert("검색 중 오류가 발생했습니다.");
      closeModal();
    } finally {
      setSearching(false);
    }
  };

  const onUnmap = (productCode: string) => {
    if (!window.confirm("매핑을 해제하시겠습니까?")) {
      return;
    }
    action.mutate(
      { action: "unmap", product_code: productCode, productID, mode },
      { onSuccess: (res) => setFlash({ message: res.message, type: res.flash_type || "info" }) },
    );
  };

  const onMap = (productCode: string) => {
    action.mutate(
      { action: "map", product_code: productCode, productID, mode },
      {
        onSuccess: (res) => {
          setFlash({ message: res.message, type: res.flash_type || "info" });
          closeModal();
        },
      },
    );
  };

  return (
    <>
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
                  <a href={CATALOGUE_URL}>PointNexus 카탈로그</a>
                </li>
                <li className="breadcrumb-item active">매핑</li>
              </ol>
            </div>
            <h4 className="page-title">
              PointNexus 카탈로그 매핑{" "}
              <small className="text-muted">PointNexus 상품 ↔ 자사 옵션상품 연결</small>
            </h4>
          </div>
        </div>
      </div>

      {flash && (
        <div className={`alert alert-${flash.type || "info"} alert-dismissible py-2`}>
          {flash.message}
          <button type="button" className="btn-close" onClick={() => setFlash(null)} />
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">PointNexus 상품 정보</h5>
            <div className="card-body">
              {pn_info ? (
                <>
                  {is_discontinued && (
                    <div className="alert alert-danger py-2 mb-2" style={{ fontSize: "13px" }}>
                      <i className="mdi mdi-alert" /> <strong>단종 의심 상품</strong> — 마지막
                      동기화 회차에 누락되었습니다(PointNexus 카탈로그에서 제외 추정). 매핑된
                      자사상품이 있으면 결제 시 발급 실패 위험이 있으니 매핑 해제를 검토하세요.
                    </div>
                  )}
                  <table className="table table-sm info-table mb-0">
                    <tbody>
                      <tr>
                        <th style={{ width: "140px", background: "#f8f9fa", fontWeight: 500 }}>
                          productID
                        </th>
                        <td style={PRODUCT_ID_STYLE}>
                          {pn_info.productID}
                          {is_discontinued && (
                            <span className="badge bg-danger ms-1">단종 의심</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ width: "140px", background: "#f8f9fa", fontWeight: 500 }}>
                          상품명
                        </th>
                        <td className="fw-semibold">{pn_info.genericName}</td>
                      </tr>
                      <tr>
                        <th style={{ width: "140px", background: "#f8f9fa", fontWeight: 500 }}>
                          edition
                        </th>
                        <td>{pn_info.edition || "—"}</td>
                      </tr>
                      <tr>
                        <th style={{ width: "140px", background: "#f8f9fa", fontWeight: 500 }}>
                          플랫폼
                        </th>
                        <td>
                          <span className="badge bg-info">{pn_info.platform}</span>
                        </td>
                      </tr>
                      <tr>
                        <th style={{ width: "140px", background: "#f8f9fa", fontWeight: 500 }}>
                          퍼블리셔
                        </th>
                        <td>{pn_info.publisher || "—"}</td>
                      </tr>
                      <tr>
                        <th style={{ width: "140px", background: "#f8f9fa", fontWeight: 500 }}>
                          타입
                        </th>
                        <td>
                          <span className="badge bg-secondary">{pn_info.type || "—"}</span>
                        </td>
                      </tr>
                      <tr>
                        <th style={{ width: "140px", background: "#f8f9fa", fontWeight: 500 }}>
                          프리오더
                        </th>
                        <td>
                          {pn_info.isPreOrder ? (
                            <span className="badge bg-warning text-dark">프리오더</span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ width: "140px", background: "#f8f9fa", fontWeight: 500 }}>
                          출시일
                        </th>
                        <td>
                          {pn_info.releaseDate ? String(pn_info.releaseDate).slice(0, 10) : "—"}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ width: "140px", background: "#f8f9fa", fontWeight: 500 }}>
                          mode
                        </th>
                        <td>{pn_info.mode}</td>
                      </tr>
                      <tr>
                        <th style={{ width: "140px", background: "#f8f9fa", fontWeight: 500 }}>
                          마지막 동기화
                        </th>
                        <td>
                          {pn_info.update_date || "—"}
                          {is_discontinued && (
                            <small className="text-danger"> (최신 회차 {max_update} 누락)</small>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="alert alert-warning mb-0">
                  해당 productID를 pointnexus_catalogue에서 찾을 수 없습니다. (mode={mode})
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <h5 className="card-header bg-success text-white">
              현재 매핑 ({mapped_list.length}건)
            </h5>
            <div className="card-body">
              {mapped_list.length === 0 ? (
                <div className="text-muted">매핑된 자사 상품이 없습니다.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="text-center">product_code</th>
                        <th>상품명</th>
                        <th>플랫폼</th>
                        <th className="text-center" style={{ width: "80px" }}>
                          관리
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mapped_list.map((m) => (
                        <tr key={m.product_code}>
                          <td className="text-center" style={PRODUCT_ID_STYLE}>
                            {m.product_code}
                          </td>
                          <td>{m.product_name || "—"}</td>
                          <td>{m.product_platform_label || "—"}</td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger shadow-none"
                              disabled={action.isPending}
                              onClick={() => onUnmap(m.product_code || "")}
                            >
                              해제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-primary text-white">자사 상품 검색 후 매핑</h5>
            <div className="card-body">
              <div className="input-group input-group-sm" style={{ maxWidth: "480px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="product_code 또는 상품명으로 검색"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      doSearch();
                    }
                  }}
                />
                <button type="button" className="btn btn-primary shadow-none" onClick={doSearch}>
                  검색
                </button>
              </div>
              <div className="text-muted mt-2" style={{ fontSize: "12px" }}>
                검색 결과는 팝업으로 표시됩니다. (Enter 키로도 검색)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 mb-3">
        <a
          href={`${CATALOGUE_URL}?mode=${encodeURIComponent(mode)}`}
          className="btn btn-secondary btn-sm shadow-none"
        >
          <i className="mdi mdi-arrow-left" /> 카탈로그 목록으로
        </a>
      </div>

      {modalOpen &&
        createPortal(
          <>
            <div
              className={`modal fade${modalShown ? " show" : ""}`}
              tabIndex={-1}
              role="dialog"
              style={{ display: "block" }}
            >
              <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header bg-primary">
                    <h5 className="modal-title text-white">자사 상품 검색 결과</h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={closeModal}
                    />
                  </div>
                  <div className="modal-body p-0">
                    <table className="table table-sm table-bordered table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="text-center" style={{ width: "120px" }}>
                            product_code
                          </th>
                          <th>상품명</th>
                          <th className="text-center" style={{ width: "80px" }}>
                            플랫폼
                          </th>
                          <th className="text-center" style={{ width: "80px" }}>
                            옵션타입
                          </th>
                          <th className="text-center" style={{ width: "60px" }}>
                            상태
                          </th>
                          <th className="text-center" style={{ width: "100px" }}>
                            매핑
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {searching ? (
                          <tr>
                            <td colSpan={6} className="text-center text-muted py-3">
                              검색 중...
                            </td>
                          </tr>
                        ) : searchItems && searchItems.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center text-muted py-3">
                              검색 결과가 없습니다.
                            </td>
                          </tr>
                        ) : (
                          (searchItems || []).map((it) => (
                            <tr key={it.product_code}>
                              <td className="text-center" style={PRODUCT_ID_STYLE}>
                                {it.product_code}
                              </td>
                              <td>{it.product_name}</td>
                              <td className="text-center">{it.product_platform_label || "—"}</td>
                              <td className="text-center">{it.option_type || "—"}</td>
                              <td className="text-center">
                                <StatusBadge status={it.status} />
                              </td>
                              <td className="text-center">
                                {it.already ? (
                                  <span className="badge bg-success">매핑됨</span>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary shadow-none"
                                    disabled={action.isPending}
                                    onClick={() => onMap(it.product_code)}
                                  >
                                    매핑
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`modal-backdrop fade${modalShown ? " show" : ""}`}
              onClick={closeModal}
            />
          </>,
          document.body,
        )}
    </>
  );
};
