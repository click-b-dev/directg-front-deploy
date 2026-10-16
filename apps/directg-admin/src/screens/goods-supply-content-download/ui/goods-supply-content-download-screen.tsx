import {
  usePatchDownloadLog,
  type PatchDownloadSearch,
  type PatchDownloadItem,
} from "@entities/supply-content";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/goods/supply_content_download";
const PER_PAGE = 50;

// legacy supply_content_download.php — 제공컨텐츠 다운로드 현황.
export const GoodsSupplyContentDownloadScreen = (search: PatchDownloadSearch) => {
  const { data } = usePatchDownloadLog(search);
  if (!data) {
    return null;
  }

  const total = data.pagination.total_results;
  const page = data.pagination.current_page;

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
                    상품
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    제공컨텐츠 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">제공컨텐츠 다운로드 현황</li>
              </ol>
            </div>
            <h4 className="page-title">제공컨텐츠 다운로드 현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 회원검색 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">회원검색</h5>
          <div className="card-body py-2">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row mb-2">
                <div className="col-lg-6">
                  <div className="input-group row">
                    <select
                      className="form-select col-sm-3"
                      name="search_key"
                      id="search_key"
                      defaultValue={search.search_key || "search_m_id"}
                    >
                      <option value="search_m_id">회원아이디</option>
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
                <div className="col-lg-6">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      회원 조회
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">제공컨텐츠 다운로드 이력</h5>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-centered w-100 nowrap table-sm table-bordered">
                  <thead className="table-light font-13">
                    <tr>
                      <th className="text-center">번호</th>
                      <th className="text-center">회원아이디</th>
                      <th className="text-center">제공컨텐츠명</th>
                      <th className="text-center">다운로드클릭횟수</th>
                      <th className="text-center">ip</th>
                      <th className="text-center">다운로드일자</th>
                      <th className="text-center">마지막다운로드일자</th>
                    </tr>
                  </thead>
                  <tbody className="font-12">
                    {data.items.map((item, i) => (
                      <DownloadLogRow
                        key={item.idx}
                        item={item}
                        rowNo={total - ((page - 1) * PER_PAGE + i)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="text-center mt-3">
              <ServerPagination
                page={page}
                totalPages={data.pagination.total_pages}
                baseUrl={BASE_URL}
                params={{
                  search_key: search.search_key,
                  search_value: search.search_value,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const DownloadLogRow = ({ item, rowNo }: { item: PatchDownloadItem; rowNo: number }) => (
  <tr>
    <td className="text-center">{rowNo}</td>
    <td className="text-center">{item.m_id}</td>
    <td className="text-start">{item.patch_name}</td>
    <td className="text-center">{item.count}</td>
    <td className="text-center">{item.ip}</td>
    <td className="text-center">{item.reg_date}</td>
    <td className="text-center">{item.last_download}</td>
  </tr>
);
