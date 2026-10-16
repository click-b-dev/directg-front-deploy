import { useRef } from "react";
import {
  useMemberList,
  useLeaveMember,
  getMemberAge,
  MEMBER_LEVEL_LABEL,
  MEMBER_TYPE_LABEL,
  type MemberListSearch,
  type MemberListItem,
} from "@entities/member";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/member/member_list";
const PER_PAGE = 30;

const nf = (n: number) => n.toLocaleString("en-US");

// legacy member/member_list.php — 회원 리스트(9종 필터 + 정렬 + 페이지네이션 + 탈퇴).
export const MemberListScreen = (search: MemberListSearch) => {
  const { data } = useMemberList(search);
  const leaveMutation = useLeaveMember();

  const startRegRef = useRef<HTMLInputElement>(null);
  const endRegRef = useRef<HTMLInputElement>(null);
  const startLogRef = useRef<HTMLInputElement>(null);
  const endLogRef = useRef<HTMLInputElement>(null);

  // 정렬 링크용 필터 유지(page/sort/dir 제외 non-empty). legacy $sort_param.
  const filterEntries: [string, string][] = [];
  const pushF = (key: string, value: string) => {
    if (value !== "") filterEntries.push([key, value]);
  };
  pushF("search_type", search.search_type);
  pushF("search_value", search.search_value);
  if (search.member_level > 0) filterEntries.push(["member_level", String(search.member_level)]);
  pushF("old_login", search.old_login);
  pushF("mailling", search.mailling);
  pushF("is_auth", search.is_auth);
  pushF("mem_type", search.mem_type);
  pushF("start_reg_date", search.start_reg_date);
  pushF("end_reg_date", search.end_reg_date);
  pushF("start_log_date", search.start_log_date);
  pushF("end_log_date", search.end_log_date);
  const sortParam = filterEntries
    .map(([k, v]) => `&${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("");

  // 페이지네이션은 정렬(sort/dir)까지 유지. legacy $param.
  const paginationParams: Record<string, string> = Object.fromEntries(filterEntries);
  if (search.sort !== "") paginationParams.sort = search.sort;
  if (search.dir !== "") paginationParams.dir = search.dir;

  // 헤더 정렬 화살표/토글 — 현재 적용중인 정렬(기본값 포함).
  const sortInMap = search.sort === "reg_date" || search.sort === "log_date";
  const effSort = sortInMap ? search.sort : search.mem_type === "R" ? "log_date" : "reg_date";
  const effDir = sortInMap ? (search.dir.toLowerCase() === "asc" ? "ASC" : "DESC") : "DESC";
  const sortHref = (col: "reg_date" | "log_date") => {
    const nextDir = effSort === col && effDir === "DESC" ? "asc" : "desc";
    return `${BASE_URL}?sort=${col}&dir=${nextDir}${sortParam}`;
  };
  const sortArrow = (col: "reg_date" | "log_date") =>
    effSort === col ? (effDir === "DESC" ? " ▼" : " ▲") : "";

  const handleLeave = (m_id: string, m_no: number) => {
    if (window.confirm(`${m_id} 회원을 탈퇴처리 하시겠습니까?`)) {
      leaveMutation.mutate(m_no, {
        onSuccess: (result) => {
          if (result.success) window.alert("회원탈퇴완료");
        },
      });
    }
  };

  if (!data) {
    return null;
  }

  const { items, pagination, total_all } = data;

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
                <li className="breadcrumb-item active">회원 리스트</li>
              </ol>
            </div>
            <h4 className="page-title">회원 리스트</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body py-2">
            <form className="form-horizontal" method="get" action={BASE_URL}>
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
                        <option value="hp">휴대폰</option>
                        <option value="ip">접속IP</option>
                        <option value="m_no">고유번호</option>
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
                    <label className="col-sm-3 col-form-label bg-light border">회원등급</label>
                    <div className="col-sm-3">
                      <select
                        className="form-control"
                        name="member_level"
                        id="member_level"
                        defaultValue={String(search.member_level)}
                      >
                        <option value="0">전체</option>
                        <option value="1">일반</option>
                        <option value="2">정회원</option>
                        <option value="3">VIP</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-lg-6">
                  <div className="input-group row">
                    <label className="col-sm-3 col-form-label bg-light border">회원가입일</label>
                    <div className="col-sm-6">
                      <div className="input-group">
                        <input
                          type="date"
                          className="form-control"
                          id="start_reg_date"
                          name="start_reg_date"
                          placeholder="시작일자"
                          defaultValue={search.start_reg_date}
                          ref={startRegRef}
                        />
                        <span className="input-group-text">~</span>
                        <input
                          type="date"
                          className="form-control"
                          id="end_reg_date"
                          name="end_reg_date"
                          placeholder="종료일자"
                          defaultValue={search.end_reg_date}
                          ref={endRegRef}
                        />
                        <button
                          type="button"
                          style={{ border: 0, backgroundColor: "white" }}
                          onClick={() => {
                            if (startRegRef.current) startRegRef.current.value = "";
                            if (endRegRef.current) endRegRef.current.value = "";
                          }}
                        >
                          <i className="mdi mdi-delete-outline" style={{ fontSize: "20px" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="input-group row">
                    <label className="col-sm-3 col-form-label bg-light border">최종로그인일</label>
                    <div className="col-sm-6">
                      <div className="input-group">
                        <input
                          type="date"
                          className="form-control"
                          id="start_log_date"
                          name="start_log_date"
                          placeholder="시작일자"
                          defaultValue={search.start_log_date}
                          ref={startLogRef}
                        />
                        <span className="input-group-text">~</span>
                        <input
                          type="date"
                          className="form-control"
                          id="end_log_date"
                          name="end_log_date"
                          placeholder="종료일자"
                          defaultValue={search.end_log_date}
                          ref={endLogRef}
                        />
                        <button
                          type="button"
                          style={{ border: 0, backgroundColor: "white" }}
                          onClick={() => {
                            if (startLogRef.current) startLogRef.current.value = "";
                            if (endLogRef.current) endLogRef.current.value = "";
                          }}
                        >
                          <i className="mdi mdi-delete-outline" style={{ fontSize: "20px" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-lg-6">
                  <div className="input-group row">
                    <label className="col-sm-3 col-form-label bg-light border">장기 미로그인</label>
                    <div className="col-sm-3">
                      <input
                        className="form-control"
                        type="text"
                        name="old_login"
                        defaultValue={search.old_login}
                      />
                    </div>
                    <div className="col-sm-4 mt-1">일 이상 로그인하지 않은 회원</div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="input-group row">
                    <label className="col-sm-3 col-form-label bg-light border">메일수신동의</label>
                    <div className="col-sm-6 mt-1">
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="mailling1"
                          name="mailling"
                          className="form-check-input"
                          value="all"
                          defaultChecked={(search.mailling || "all") === "all"}
                        />
                        <label className="form-check-label" htmlFor="mailling1">
                          전체
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="mailling2"
                          name="mailling"
                          className="form-check-input"
                          value="Y"
                          defaultChecked={search.mailling === "Y"}
                        />
                        <label className="form-check-label" htmlFor="mailling2">
                          수신
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="mailling3"
                          name="mailling"
                          className="form-check-input"
                          value="N"
                          defaultChecked={search.mailling === "N"}
                        />
                        <label className="form-check-label" htmlFor="mailling3">
                          수신거부
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-lg-6">
                  <div className="input-group row">
                    <label className="col-sm-3 col-form-label bg-light border">본인인증여부</label>
                    <div className="col-sm-6 mt-1">
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="is_auth1"
                          name="is_auth"
                          className="form-check-input"
                          value="all"
                          defaultChecked={(search.is_auth || "all") === "all"}
                        />
                        <label className="form-check-label" htmlFor="is_auth1">
                          전체
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="is_auth2"
                          name="is_auth"
                          className="form-check-input"
                          value="Y"
                          defaultChecked={search.is_auth === "Y"}
                        />
                        <label className="form-check-label" htmlFor="is_auth2">
                          인증
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="is_auth3"
                          name="is_auth"
                          className="form-check-input"
                          value="N"
                          defaultChecked={search.is_auth === "N"}
                        />
                        <label className="form-check-label" htmlFor="is_auth3">
                          미인증
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="input-group row">
                    <label className="col-sm-3 col-form-label bg-light border">회원분류</label>
                    <div className="col-sm-8 mt-1">
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="mem_type1"
                          name="mem_type"
                          className="form-check-input"
                          value="all"
                          defaultChecked={(search.mem_type || "all") === "all"}
                        />
                        <label className="form-check-label" htmlFor="mem_type1">
                          전체
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="mem_type2"
                          name="mem_type"
                          className="form-check-input"
                          value="P"
                          defaultChecked={search.mem_type === "P"}
                        />
                        <label className="form-check-label" htmlFor="mem_type2">
                          일반
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="mem_type3"
                          name="mem_type"
                          className="form-check-input"
                          value="R"
                          defaultChecked={search.mem_type === "R"}
                        />
                        <label className="form-check-label" htmlFor="mem_type3">
                          리셀러
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="mem_type4"
                          name="mem_type"
                          className="form-check-input"
                          value="S"
                          defaultChecked={search.mem_type === "S"}
                        />
                        <label className="form-check-label" htmlFor="mem_type4">
                          휴면
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="mem_type5"
                          name="mem_type"
                          className="form-check-input"
                          value="E"
                          defaultChecked={search.mem_type === "E"}
                        />
                        <label className="form-check-label" htmlFor="mem_type5">
                          이벤트
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

      <div className="row">
        <div className="col-12 table-responsive">
          <table className="table table-centered w-100  nowrap table-sm table-bordered border-light">
            <thead className="table-light font-13">
              <tr>
                <th className="text-center">번호</th>
                <th className="text-center">회원고유번호</th>
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
                <th className="text-center">휴대폰</th>
                <th className="text-center">회원등급</th>
                <th className="text-center" style={{ cursor: "pointer" }}>
                  <a href={sortHref("reg_date")} className="text-reset text-decoration-none">
                    회원가입일{sortArrow("reg_date")}
                  </a>
                </th>
                <th className="text-center" style={{ cursor: "pointer" }}>
                  <a href={sortHref("log_date")} className="text-reset text-decoration-none">
                    최종로그인{sortArrow("log_date")}
                    <br />
                    (접속IP)
                  </a>
                </th>
                <th className="text-center">방문횟수</th>
                <th className="text-center">가입방법</th>
                <th className="text-center">회원분류</th>
                <th className="text-center"></th>
              </tr>
            </thead>
            <tbody className="font-12 bg-white">
              {items.map((item, num) => (
                <MemberRow
                  key={item.m_no}
                  item={item}
                  rowNo={
                    pagination.total_results - (num + (pagination.current_page - 1) * PER_PAGE)
                  }
                  onLeave={handleLeave}
                />
              ))}
            </tbody>
          </table>
          <div className="text-center mt-3">
            <ServerPagination
              page={pagination.current_page}
              totalPages={pagination.total_pages}
              baseUrl={BASE_URL}
              params={paginationParams}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const MemberRow = ({
  item,
  rowNo,
  onLeave,
}: {
  item: MemberListItem;
  rowNo: number;
  onLeave: (m_id: string, m_no: number) => void;
}) => (
  <tr>
    <td className="text-center">{rowNo}</td>
    <td className="text-center">{item.m_no}</td>
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
    <td className="text-center">{item.hp}</td>
    <td className="text-center">{MEMBER_LEVEL_LABEL[item.mem_level] ?? ""}</td>
    <td className="text-center">{item.reg_date}</td>
    <td className="text-center">
      {item.log_date}
      <br />
      {item.ip}
    </td>
    <td className="text-center">{item.visited}</td>
    <td className="text-center">{item.sns_type.toUpperCase()}</td>
    <td className="text-center">{MEMBER_TYPE_LABEL[item.mem_type] ?? ""}</td>
    <td className="text-center">
      <button
        className="btn btn-danger shadow-none"
        type="button"
        style={{ fontSize: "12px" }}
        onClick={() => onLeave(item.m_id, item.m_no)}
      >
        탈퇴
      </button>
    </td>
  </tr>
);
