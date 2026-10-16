import { useEffect } from "react";
import { useAssetItemList, useCancelAssetReserve, type AssetItem } from "@entities/asset";
import { Pagination } from "@shared/ui";

export type AssetItemSearchProps = {
  page: number;
  asset_id: string;
};

const BASE_URL = "/goods/asset/asset_item_list";
const ASSET_LIST_URL = "/goods/asset/asset_list";

export const AssetItemListScreen = (search: AssetItemSearchProps) => {
  useEffect(() => {
    document.title = "Asset Item(키) 현황";
  }, []);

  // 진입 검증: asset_id 없으면 목록으로.
  useEffect(() => {
    if (search.asset_id === "") {
      window.alert("잘못된 접근입니다. (asset_id 없음)");
      window.location.href = ASSET_LIST_URL;
    }
  }, [search.asset_id]);

  const { data } = useAssetItemList(search);
  const cancelMutation = useCancelAssetReserve();

  const content = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const handleCancel = (reserveId: string) => {
    if (!window.confirm("이 예약(키 할당)을 취소하시겠습니까?")) return;
    cancelMutation.mutate(reserveId, {
      onSuccess: (res) => {
        if (res.id) {
          window.alert("예약취소 완료");
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
                  <a href={ASSET_LIST_URL}>Asset 현황</a>
                </li>
                <li className="breadcrumb-item active">Asset Item(키) 현황</li>
              </ol>
            </div>
            <h4 className="page-title">Asset Item(키) 현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* Asset 컨텍스트 헤더 */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-end mb-2">
            <table className="table table-sm table-bordered mb-0 w-auto">
              <tbody>
                <tr>
                  <th className="bg-light text-center">Asset ID</th>
                  <td className="text-center">{search.asset_id}</td>
                  <th className="bg-light text-center">이름</th>
                  <td className="eng">{data?.asset_name ?? ""}</td>
                  <th className="bg-light text-center">플랫폼</th>
                  <td className="eng text-center">{data?.platform ?? ""}</td>
                  <th className="bg-light text-center">공급처</th>
                  <td className="eng text-center">{data?.publisher ?? ""}</td>
                </tr>
              </tbody>
            </table>
            <a href={ASSET_LIST_URL} className="btn btn-sm btn-light">
              ← Asset 현황
            </a>
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
              <table
                className="table table-centered nowrap table-sm table-bordered"
                id="asset_item_list"
              >
                <thead className="table-dark font-13">
                  <tr>
                    <th className="text-center">Item ID</th>
                    <th className="text-center">Asset 이름</th>
                    <th className="text-center">등록일시</th>
                    <th className="text-center">소유자</th>
                    <th className="text-center">주문번호(po)</th>
                    <th className="text-center">예약할당</th>
                    <th className="text-center">활성화</th>
                    <th className="text-center">키(치환명)</th>
                    <th className="text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {content.length > 0 ? (
                    content.map((item: AssetItem) => (
                      <tr key={item.id}>
                        <td className="text-center">
                          <span className="num">{item.id}</span>
                        </td>
                        <td className="text-start">
                          <span className="eng font-12">{item.title}</span>
                        </td>
                        <td className="text-center">
                          <span className="num">{item.regDt}</span>
                        </td>
                        <td className="text-center">
                          <span className="num">{item.owner}</span>
                        </td>
                        <td className="text-center">
                          <span className="eng font-12">{item.po}</span>
                        </td>
                        <td className="text-center">
                          {item.reserved ? (
                            <>
                              예약
                              <br />
                              <span className="num">{item.reserveDt}</span>
                            </>
                          ) : (
                            <span className="text-muted">미예약</span>
                          )}
                        </td>
                        <td className="text-center">
                          {item.activated ? (
                            <>
                              <span className="text-success">활성</span>
                              <br />
                              <span className="num">{item.activatedDt}</span>
                            </>
                          ) : (
                            <span className="text-muted">미활성</span>
                          )}
                        </td>
                        <td className="text-start">
                          <span className="eng font-12">{item.key}</span>
                        </td>
                        <td className="text-center text-nowrap">
                          {item.reserved && !item.activated && item.reserveId && (
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm btn_item_cancel"
                              data-reserveid={item.reserveId}
                              onClick={() => handleCancel(item.reserveId)}
                            >
                              예약취소
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center text-muted py-3">
                        등록된 키가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div id="paging" className="text-center mt-3">
                <Pagination
                  page={search.page}
                  totalPages={totalPages}
                  baseUrl={BASE_URL}
                  params={{ asset_id: search.asset_id }}
                  perBlock={20}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
