import { useEffect } from "react";
import {
  useGenbaAvailabilityLogList,
  type GenbaAvailabilityLogItem,
} from "@entities/genba-availability-log";
import { ServerPagination } from "@shared/ui";

export type GenbaAvaliabilitySearchProps = {
  page: number;
  search_key: string;
  search_value: string;
};

const BASE_URL = "/goods/stock/genba_avaliability";

export const GenbaAvaliabilityScreen = (search: GenbaAvaliabilitySearchProps) => {
  useEffect(() => {
    document.title = "Genba availability webhook log";
  }, []);

  const { data } = useGenbaAvailabilityLogList(search);

  const items = data?.items ?? [];
  const totalPages = data?.pagination.total_pages ?? 0;

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
                    Genba Webhok Log
                  </a>
                </li>
                <li className="breadcrumb-item active">Genba availability webhook log</li>
              </ol>
            </div>
            <h4 className="page-title">Genba availability webhook log</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <input type="hidden" id="page" name="page" value={search.page} readOnly />
              <div className="row mb-2">
                <div className="col-lg-6">
                  <div className="input-group row">
                    <select
                      className="form-select col-sm-3"
                      name="search_key"
                      id="search_key"
                      defaultValue={search.search_key || "search_sku"}
                    >
                      <option value="search_sku">sku</option>
                      <option value="search_name">name</option>
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
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <div className="text-center">
                    <button type="submit" className="btn btn-primary shadow-none">
                      {" "}
                      검색
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
          <table className="table table-sm table-centered table-bordered mb-0">
            <colgroup>
              <col width="15%" />
              <col width="15%" />
              <col width="20%" />
              <col width="8%" />
              <col width="15%" />
              <col width="10%" />
            </colgroup>
            <thead className="table-dark font-13">
              <tr>
                <th className="text-center">transactionid</th>
                <th className="text-center">sku</th>
                <th className="text-center">name</th>
                <th className="text-center">Status</th>
                <th className="text-center">Message</th>
                <th className="text-center">날짜</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {items.map((item: GenbaAvailabilityLogItem, i) => (
                <tr key={`${item.transactionid}-${i}`}>
                  <td className="text-center">{item.transactionid}</td>
                  <td className="text-center">{item.sku}</td>
                  <td className="text-start">{item.item_name}</td>
                  <td className="text-center">{item.status}</td>
                  <td className="text-center">{item.message}</td>
                  <td className="text-center">{item.reg_date}</td>
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
                search_key: search.search_key,
                search_value: search.search_value,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
