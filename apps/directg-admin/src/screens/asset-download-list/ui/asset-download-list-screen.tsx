import { useEffect, useState } from "react";
import {
  useAssetDownloadList,
  useRegisterAssetDownload,
  useFinishAssetDownload,
  type AssetDownloadItem,
} from "@entities/asset";
import { Pagination } from "@shared/ui";
import { env } from "@shared/config/env";

export type AssetDownloadSearchProps = {
  page: number;
  owner: string;
  asset_id: string;
};

const BASE_URL = "/goods/asset/asset_download_list";

// legacy asset_download.php — PIN 암호화 zip 스트리밍 엔드포인트(백엔드). 브라우저 native 다운로드.
const downloadProxyLink = (po: string) =>
  `${env.apiBaseUrl}/admin/goods/asset/download?po=${encodeURIComponent(po)}`;

export const AssetDownloadListScreen = (search: AssetDownloadSearchProps) => {
  useEffect(() => {
    document.title = "Asset 다운로드(반품출고)";
  }, []);

  const { data } = useAssetDownloadList({ page: search.page, owner: search.owner });
  const registerMutation = useRegisterAssetDownload();
  const finishMutation = useFinishAssetDownload();

  // 목록 검색어(URL owner로 제출 시 유지).
  const [ownerInput, setOwnerInput] = useState(search.owner);

  const content = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const submitSearch = () => {
    const qs = ownerInput ? `?owner=${encodeURIComponent(ownerInput)}` : "";
    window.location.href = `${BASE_URL}${qs}`;
  };

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const payload = {
      asset_id: String(fd.get("asset_id") ?? ""),
      owner: String(fd.get("owner") ?? ""),
      qty: String(fd.get("qty") ?? ""),
      pin: String(fd.get("pin") ?? ""),
      download_limit: String(fd.get("download_limit") ?? ""),
      download_expired_day: String(fd.get("download_expired_day") ?? ""),
    };
    registerMutation.mutate(payload, {
      onSuccess: (res) => {
        if (res.po) {
          window.alert(`다운로드 등록 완료 (${res.count ?? payload.qty}개, PO: ${res.po})`);
          window.location.href = BASE_URL;
        } else {
          window.alert(
            `다운로드 등록 실패: ${res.message ?? "등록에 실패했습니다. (재고부족 등 확인)"}`,
          );
        }
      },
    });
  };

  const handleFinish = (po: string) => {
    if (
      !window.confirm(
        `PO ${po} 의 다운로드된 키를 Asset에서 삭제 처리합니다.\n되돌릴 수 없습니다. 진행하시겠습니까?`,
      )
    ) {
      return;
    }
    finishMutation.mutate(po, {
      onSuccess: (res) => {
        if (res.id) {
          window.alert(`삭제 완료 (삭제 키: ${res.count != null ? res.count : "-"}개)`);
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
                <li className="breadcrumb-item active">Asset 다운로드(반품출고)</li>
              </ol>
            </div>
            <h4 className="page-title">Asset 다운로드(반품출고)</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="alert alert-warning py-2 mb-3 font-13">
            Asset에 등록된 키 중 일정 수량을 <strong>반품출고(RETURN)</strong>로 묶어
            다운로드합니다. 다운로드 후 <strong>삭제</strong> 처리 시 해당 키는 Asset에서
            삭제됩니다.
          </div>
        </div>
      </div>

      {/* 등록 폼 */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">다운로드(반품출고) 등록</h5>
            <div className="card-body">
              <form className="form-horizontal" onSubmit={handleRegister}>
                <input type="hidden" name="mode" value="asset_download_register" readOnly />
                <div className="row g-2 mb-2">
                  <div className="col-lg-3">
                    <label htmlFor="asset_id" className="form-label mb-1">
                      *Asset ID
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="asset_id"
                      name="asset_id"
                      defaultValue={search.asset_id}
                      placeholder="Asset ID"
                      required
                    />
                  </div>
                  <div className="col-lg-3">
                    <label htmlFor="owner" className="form-label mb-1">
                      *소유자(owner)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="owner"
                      name="owner"
                      placeholder="담당자/업체명"
                      required
                    />
                  </div>
                  <div className="col-lg-2">
                    <label htmlFor="qty" className="form-label mb-1">
                      *수량 (≤1000)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="qty"
                      name="qty"
                      min={1}
                      max={1000}
                      placeholder="수량"
                      required
                    />
                  </div>
                  <div className="col-lg-2">
                    <label htmlFor="pin" className="form-label mb-1">
                      *PIN (zip 암호)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="pin"
                      name="pin"
                      placeholder="압축 암호"
                      required
                    />
                  </div>
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-lg-3">
                    <label htmlFor="download_limit" className="form-label mb-1">
                      *다운로드 제한횟수
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="download_limit"
                      name="download_limit"
                      min={1}
                      defaultValue={5}
                      required
                    />
                  </div>
                  <div className="col-lg-3">
                    <label htmlFor="download_expired_day" className="form-label mb-1">
                      *만료일(등록일+N일)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="download_expired_day"
                      name="download_expired_day"
                      min={1}
                      defaultValue={7}
                      required
                    />
                  </div>
                  <div className="col-lg-6 d-flex align-items-end justify-content-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      다운로드 등록
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 목록 검색 */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body py-2">
              <div className="row g-2">
                <div className="col-lg-4">
                  <div className="input-group">
                    <span className="input-group-text">소유자</span>
                    <input
                      type="text"
                      className="form-control"
                      id="search_owner"
                      placeholder="owner 검색"
                      value={ownerInput}
                      onChange={(e) => setOwnerInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submitSearch();
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary shadow-none"
                      id="btn_search"
                      onClick={submitSearch}
                    >
                      검색
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              <div className="table-responsive">
                <table
                  className="table table-centered table-sm table-bordered mb-0"
                  id="download_list"
                >
                  <thead className="table-dark font-13">
                    <tr>
                      <th className="text-center text-nowrap">번호</th>
                      <th className="text-center text-nowrap">PO</th>
                      <th className="text-center text-nowrap">Asset ID</th>
                      <th className="text-start w-100">Asset 이름</th>
                      <th className="text-center text-nowrap">소유자</th>
                      <th className="text-center text-nowrap">수량</th>
                      <th className="text-center text-nowrap">PIN</th>
                      <th className="text-center text-nowrap">남은횟수</th>
                      <th className="text-center text-nowrap">다운로드일시</th>
                      <th className="text-center text-nowrap">만료일시</th>
                      <th className="text-center text-nowrap">등록일시</th>
                      <th className="text-center text-nowrap">관리</th>
                    </tr>
                  </thead>
                  <tbody className="font-12">
                    {content.length > 0 ? (
                      content.map((item: AssetDownloadItem) => {
                        const finished = item.is_finish === "Y";
                        const remain = parseInt(item.downloadLimit, 10) || 0;
                        return (
                          <tr key={item.po} className={finished ? "text-muted" : undefined}>
                            <td className="text-center text-nowrap">{item.no}</td>
                            <td className="text-center text-nowrap">
                              <span className="eng font-11">{item.po}</span>
                            </td>
                            <td className="text-center text-nowrap">{item.asset_id}</td>
                            <td className="text-start w-100">
                              <span className="eng font-12">{item.asset_name}</span>
                            </td>
                            <td className="text-center text-nowrap">{item.owner}</td>
                            <td className="text-end text-nowrap">{item.qty}</td>
                            <td className="text-center text-nowrap">
                              <span className="eng">{item.pin}</span>
                            </td>
                            <td
                              className={`text-center text-nowrap${remain <= 0 ? " text-danger fw-bold" : ""}`}
                            >
                              {item.downloadLimit}
                            </td>
                            <td className="text-center text-nowrap">
                              {item.download_date ? (
                                <span className="num font-11">{item.download_date}</span>
                              ) : (
                                <span className="text-muted">미다운로드</span>
                              )}
                            </td>
                            <td className="text-center text-nowrap">
                              <span className="num font-11">{item.expired_dt}</span>
                            </td>
                            <td className="text-center text-nowrap">
                              <span className="num font-11">{item.reg_date}</span>
                            </td>
                            <td className="text-center text-nowrap">
                              {finished ? (
                                <>
                                  <span className="badge bg-secondary">삭제 완료</span>
                                  <br />
                                  <span className="num font-11">{item.finish_date}</span>
                                </>
                              ) : (
                                <>
                                  {remain > 0 ? (
                                    <a
                                      href={downloadProxyLink(item.po)}
                                      className="btn btn-outline-info btn-sm me-1 btn_dl"
                                      data-po={item.po}
                                    >
                                      다운로드
                                    </a>
                                  ) : (
                                    <span className="badge bg-warning text-dark me-1">
                                      다운로드 소진
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm btn_finish"
                                    data-po={item.po}
                                    onClick={() => handleFinish(item.po)}
                                  >
                                    삭제
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={12} className="text-center text-muted py-3">
                          등록된 다운로드 건이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div id="paging" className="text-center mt-3">
                <Pagination
                  page={search.page}
                  totalPages={totalPages}
                  baseUrl={BASE_URL}
                  params={{ owner: search.owner }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
