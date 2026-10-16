import { useGracList, type GracListSearch, type GracListItem } from "@entities/grac";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/goods/grac/grac_list";

const ORGNAMES = ["게임물관리위원회", "게임콘텐츠등급분류위원회", "자체등급분류사업자"];

const GIVENRATES: { value: string; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "전체이용가", label: "전체이용가" },
  { value: "12세이용가", label: "12세이용가" },
  { value: "15세이용가", label: "15세이용가" },
  { value: "청소년이용불가", label: "청소년이용불가" },
  { value: "등급거부", label: "등급거부" },
];

const PLATFORMS: { value: string; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "PC/온라인 게임", label: "PC/온라인 게임" },
  { value: "비디오 게임", label: "비디오 게임" },
  { value: "모바일 게임", label: "모바일 게임" },
  { value: "아케이드 게임", label: "아케이드 게임" },
];

// legacy grac/grac_list.php — 심의정보 현황.
export const GoodsGracListScreen = (search: GracListSearch) => {
  const { data } = useGracList(search);
  if (!data) {
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
                    상품관리
                  </a>
                </li>
                <li className="breadcrumb-item active">심의정보 리스트</li>
              </ol>
            </div>
            <h4 className="page-title">심의정보 리스트</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 심의정보 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">심의정보 검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row mb-2">
                <div className="col-lg-3">
                  <div className="row">
                    <label
                      htmlFor="search_rateno"
                      className="col-sm-4 col-form-label bg-light border"
                    >
                      등급분류번호
                    </label>
                    <div className="col-sm-8">
                      <input
                        type="text"
                        className="form-control"
                        id="search_rateno"
                        name="search_rateno"
                        placeholder="등급분류번호"
                        defaultValue={search.search_rateno}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-5">
                  <div className="row">
                    <label
                      htmlFor="search_gametitle"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      게임물명
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_gametitle"
                        name="search_gametitle"
                        placeholder="게임물명"
                        defaultValue={search.search_gametitle}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="row">
                    <label
                      htmlFor="search_entname"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      신청자(업체)명
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_entname"
                        name="search_entname"
                        placeholder="신청자(업체)명"
                        defaultValue={search.search_entname}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-lg-12">
                  <div className="row">
                    <label
                      htmlFor="search_orgname"
                      className="col-sm-1 col-form-label bg-light border"
                    >
                      등급분류기관
                    </label>
                    <div className="col-sm-11 mt-1">
                      {ORGNAMES.map((org, i) => (
                        <div className="form-check form-check-inline" key={org}>
                          <input
                            type="radio"
                            id={`search_orgname_${i + 1}`}
                            name="search_orgname"
                            className="form-check-input"
                            value={org}
                            defaultChecked={search.search_orgname === org}
                          />
                          <label className="form-check-label" htmlFor={`search_orgname_${i + 1}`}>
                            {org}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-lg-12">
                  <div className="row">
                    <label
                      htmlFor="search_givenrate"
                      className="col-sm-1 col-form-label bg-light border"
                    >
                      결정등급
                    </label>
                    <div className="col-sm-11 mt-1">
                      {GIVENRATES.map((g, i) => (
                        <div className="form-check form-check-inline" key={g.value}>
                          <input
                            type="radio"
                            id={`search_givenrate_${i === 0 ? "all" : i}`}
                            name="search_givenrate"
                            className="form-check-input"
                            value={g.value}
                            defaultChecked={search.search_givenrate === g.value}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`search_givenrate_${i === 0 ? "all" : i}`}
                          >
                            {g.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-lg-12">
                  <div className="row">
                    <label
                      htmlFor="search_platform"
                      className="col-sm-1 col-form-label bg-light border"
                    >
                      플랫폼
                    </label>
                    <div className="col-sm-11 mt-1">
                      {PLATFORMS.map((p, i) => (
                        <div className="form-check form-check-inline" key={p.value}>
                          <input
                            type="radio"
                            id={`search_platform_${i === 0 ? "all" : i}`}
                            name="search_platform"
                            className="form-check-input"
                            value={p.value}
                            defaultChecked={search.search_platform === p.value}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`search_platform_${i === 0 ? "all" : i}`}
                          >
                            {p.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary">
                      심의 검색
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
            <div className="card-body">
              {data.pagination.total_results.toLocaleString()} 개
              <div className="table-responsive">
                <table className="table table-centered w-100 table-sm table-bordered">
                  <thead className="table-light font-14">
                    <tr>
                      <th className="text-center" style={{ width: "150px" }}>
                        등급분류번호
                      </th>
                      <th className="text-center">게임물명</th>
                      <th className="text-center" style={{ width: "160px" }}>
                        등급분류기관
                      </th>
                      <th className="text-center" style={{ width: "230px" }}>
                        심의업체명
                      </th>
                      <th className="text-center" style={{ width: "110px" }}>
                        결정등급
                      </th>
                      <th className="text-center" style={{ width: "100px" }}>
                        등급분류일자
                      </th>
                      <th className="text-center" style={{ width: "80px" }}>
                        비고
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item, i) => (
                      <GracRows key={`${item.rateno}-${i}`} item={item} />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-center mt-3">
                <ServerPagination
                  page={data.pagination.current_page}
                  totalPages={data.pagination.total_pages}
                  baseUrl={BASE_URL}
                  params={{
                    search_rateno: search.search_rateno,
                    search_gametitle: search.search_gametitle,
                    search_entname: search.search_entname,
                    search_orgname: search.search_orgname,
                    search_givenrate: search.search_givenrate,
                    search_platform: search.search_platform,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// 심의건별 2행: 요약행 + 내용정보/플랫폼/등록일자 행.
const GracRows = ({ item }: { item: GracListItem }) => (
  <>
    <tr>
      <td className="text-center p-0 font-13">{item.rateno}</td>
      <td className="font-13">{item.gametitle}</td>
      <td className="text-center p-0 font-13">{item.orgname}</td>
      <td className="text-center p-0 font-13">{item.entname}</td>
      <td className="text-center font-13">{item.givenrate}</td>
      <td className="text-center font-13">{item.rateddate}</td>
      <td className="text-center table-action" />
    </tr>
    <tr>
      <th className="text-center bg-light">내용정보표시</th>
      <td>{item.descriptors}</td>
      <th className="text-center bg-light">게임플랫폼</th>
      <td>{item.platform}</td>
      <td colSpan={3} className="text-center">
        {item.reg_date}
      </td>
    </tr>
  </>
);
