import {
  useMemberSnsList,
  getMemberAge,
  SNS_FLAG_LABEL,
  type SnsProvider,
  type MemberSnsListSearch,
  type MemberSnsItem,
} from "@entities/member";
import { ServerPagination } from "@shared/ui";
import "./member-sns.css";

const BASE_PATH: Record<SnsProvider, string> = {
  NAVER: "/member/member_naver_list",
  KAKAO: "/member/member_kakao_list",
  PAYCO: "/member/member_payco_list",
};

const nf = (n: number) => n.toLocaleString("en-US");

type MemberSnsScreenProps = MemberSnsListSearch & { provider: SnsProvider };

// legacy member_{naver|kakao|payco}_list.php — 간편로그인 연동현황(provider별 동일 화면).
export const MemberSnsScreen = ({ provider, ...search }: MemberSnsScreenProps) => {
  const { data } = useMemberSnsList(provider, search);
  const baseUrl = BASE_PATH[provider];
  const pageTitle = `간편로그인 연동현황(${provider})`;

  const paginationParams: Record<string, string> = {};
  if (search.search_type !== "") paginationParams.search_type = search.search_type;
  if (search.search_value !== "") paginationParams.search_value = search.search_value;
  if (search.sns_flag !== "" && search.sns_flag !== "all")
    paginationParams.sns_flag = search.sns_flag;

  if (!data) {
    return null;
  }

  const { items, pagination, total_all } = data;
  // legacy 버그: $num++ 가 foreach 밖 → num 항상 0. 게다가 페이징 30/page인데 ×20(불일치). 그대로 재현.
  const rowNo = pagination.total_results - (pagination.current_page - 1) * 20;
  const snsFlagValue = search.sns_flag || "all";

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
                    회원
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    회원관리
                  </a>
                </li>
                <li className="breadcrumb-item active">{pageTitle}</li>
              </ol>
            </div>
            <h4 className="page-title">{pageTitle}</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body py-2">
            <form className="form-horizontal" method="get" action={baseUrl}>
              <div className="row mb-2">
                <div className="col-lg-6">
                  <div className="input-group row">
                    <label className="col-sm-3 col-form-label bg-light border">검색어</label>
                    <div className="col-sm-3">
                      <select
                        className="form-control"
                        name="search_type"
                        id="search_type"
                        defaultValue={search.search_type || "m_id"}
                      >
                        <option value="m_id">아이디</option>
                        <option value="name">이름</option>
                        <option value="nickname">닉네임</option>
                        <option value="ip">접속IP</option>
                      </select>
                    </div>
                    <div className="col-sm-6">
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
                  <div className="input-group row">
                    <label className="col-sm-3 col-form-label bg-light border">연결구분</label>
                    <div className="col-sm-6 mt-1">
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="sns_flag1"
                          name="sns_flag"
                          className="form-check-input"
                          value="all"
                          defaultChecked={snsFlagValue === "all"}
                        />
                        <label className="form-check-label" htmlFor="sns_flag1">
                          전체
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="sns_flag2"
                          name="sns_flag"
                          className="form-check-input"
                          value="N"
                          defaultChecked={snsFlagValue === "N"}
                        />
                        <label className="form-check-label" htmlFor="sns_flag2">
                          신규가입
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="sns_flag3"
                          name="sns_flag"
                          className="form-check-input"
                          value="C"
                          defaultChecked={snsFlagValue === "C"}
                        />
                        <label className="form-check-label" htmlFor="sns_flag3">
                          계정연결
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      회원 검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">
          검색 : {nf(pagination.total_results)} 명 / 전체 : {nf(total_all)} 명
        </div>
      </div>

      <div className="row member-sns-table">
        <div className="col-12 table-responsive">
          <table className="table table-centered w-100  nowrap table-sm table-bordered border-light">
            <thead className="table-light font-13">
              <tr>
                <th className="text-center">번호</th>
                <th className="text-center">
                  아이디
                  <br />
                  (이메일)
                </th>
                <th className="text-center">
                  이름
                  <br />
                  (닉네임)
                </th>
                <th className="text-center">
                  생년월일
                  <br />
                  (나이)
                </th>
                <th className="text-center">
                  IP
                  <br />
                  (country)
                </th>
                <th className="text-center">방문횟수</th>
                <th className="text-center">연결구분</th>
                <th className="text-center">가입일</th>
                <th className="text-center">간편로그인 연결일자</th>
              </tr>
            </thead>
            <tbody className="font-12 bg-white">
              {items.map((item) => (
                <MemberSnsRow key={item.m_no} item={item} rowNo={rowNo} />
              ))}
            </tbody>
          </table>
          <div className="text-center mt-3">
            <ServerPagination
              page={pagination.current_page}
              totalPages={pagination.total_pages}
              baseUrl={baseUrl}
              params={paginationParams}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const MemberSnsRow = ({ item, rowNo }: { item: MemberSnsItem; rowNo: number }) => (
  <tr>
    <td className="text-center">{rowNo}</td>
    <td className="text-center">
      <a href={`/member/member_view?m_no=${item.m_no}`}>{item.m_id}</a>
      {item.email && (
        <>
          <br />({item.email})
        </>
      )}
    </td>
    <td className="text-center">
      {item.name}
      <br />({item.nickname})
    </td>
    <td className="text-center">
      {item.birth_day}
      {item.birth_day && (
        <>
          <br />({getMemberAge(item.birth_day)})
        </>
      )}
    </td>
    <td className="text-center">
      {item.ip}
      <br />({item.country})
    </td>
    <td className="text-center">{item.visited}</td>
    <td className="text-center">{SNS_FLAG_LABEL[item.flag] ?? ""}</td>
    <td className="text-center">{item.reg_date}</td>
    <td className="text-center">{item.sns_connect_date}</td>
  </tr>
);
