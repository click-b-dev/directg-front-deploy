import { useGracChkList, type GracChkSearch, type GracChkListItem } from "@entities/goods-title";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/goods/title_grac_chk";

const AGE_LIMITS: { value: string; label: string; badge: string }[] = [
  { value: "10", label: "전체이용가", badge: "bg-success" },
  { value: "12", label: "12세이용가", badge: "bg-primary" },
  { value: "15", label: "15세이용가", badge: "bg-warning" },
  { value: "18", label: "청소년이용불가", badge: "bg-danger" },
  { value: "0", label: "미등록", badge: "bg-secondary" },
];

// legacy title_grac_chk.php — 대표상품 심의정보 설정확인(age_limit is null).
export const GoodsTitleGracChkScreen = (search: GracChkSearch) => {
  const { data } = useGracChkList(search);
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
                    상품
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    대표상품 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">대표상품 심의정보 설정확인</li>
              </ol>
            </div>
            <h4 className="page-title">대표상품 심의정보 설정확인</h4>
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
              <div className="row">
                <div className="col-6 mb-2">
                  <div className="row">
                    <label className="col-sm-2 col-form-label col-form-label-sm bg-light border">
                      결정등급
                    </label>
                    <div className="col-sm-10 mt-1">
                      {AGE_LIMITS.map((a) => (
                        <div className="form-check form-check-inline" key={a.value}>
                          <input
                            type="radio"
                            id={`search_age_limit_${a.value}`}
                            name="search_age_limit"
                            className="form-check-input"
                            value={a.value}
                            defaultChecked={search.search_age_limit === a.value}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`search_age_limit_${a.value}`}
                          >
                            <span className={`badge ${a.badge} font-13 fw-normal`}>{a.label}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-2 mb-2">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="float-end">
                        <button type="submit" className="btn btn-primary shadow-none">
                          대표상품 검색
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="mb-3">{data.pagination.total_results.toLocaleString()} 개</div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-centered nowrap table-sm table-bordered">
                  {/* legacy는 colgroup/th width 없이 auto-layout — 빈 등급 셀+헤더 폭 기준으로 잔여 폭이
                      전 컬럼에 비례 분배되어 대표상품명만 넓고 나머지는 고르게 분포. 그대로 재현. */}
                  <thead className="table-dark font-13">
                    <tr>
                      <th className="text-center">
                        대표상품
                        <br />
                        코드
                      </th>
                      <th className="text-center">대표상품명</th>
                      <th className="text-center">출시일</th>
                      <th className="text-center">등급분류번호</th>
                      <th className="text-center">등급분류기관</th>
                      <th className="text-center">신청업체명</th>
                      <th className="text-center">결정등급</th>
                      <th className="text-center">등급분류일자</th>
                      <th className="text-center">비고</th>
                    </tr>
                  </thead>
                  <tbody className="font-13">
                    {data.items.map((item) => (
                      <GracRow key={item.title_id} item={item} />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-center mt-3">
                <ServerPagination
                  page={data.pagination.current_page}
                  totalPages={data.pagination.total_pages}
                  baseUrl={BASE_URL}
                  params={{ search_age_limit: search.search_age_limit }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// legacy: 결정등급 열=grac.rateddate, 등급분류일자 열=grac.givenrate (헤더-값 매핑 어긋남 그대로).
const GracRow = ({ item }: { item: GracChkListItem }) => (
  <tr>
    <td className="text-center">{item.title_id}</td>
    <td>
      {item.title_name}
      <br />
      <small>{item.title_name_en}</small>
    </td>
    <td className="text-center">{item.release_date}</td>
    <td className="text-center">{item.rateno}</td>
    <td className="text-center">{item.grac?.orgname}</td>
    <td className="text-center">{item.grac?.entname}</td>
    <td className="text-center">{item.grac?.rateddate}</td>
    <td className="text-center">{item.grac?.givenrate}</td>
    <td className="text-center">
      <a href={`/goods/title_grac_register?title_id=${item.title_id}`} className="btn btn-light">
        심의정보 설정
      </a>
    </td>
  </tr>
);
