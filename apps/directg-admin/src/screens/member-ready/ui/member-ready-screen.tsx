import {
  useMemberReadyList,
  useApplyMember,
  useDeleteMember,
  type MemberReadyListSearch,
  type MemberReadyItem,
} from "@entities/member";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/member/member_list_ready";
const PER_PAGE = 30;

const nf = (n: number) => n.toLocaleString("en-US");

// legacy member/member_list_ready.php — 승인대기 리스트(검색 + 정적 안내 + 가입승인/삭제).
export const MemberReadyScreen = (search: MemberReadyListSearch) => {
  const { data } = useMemberReadyList(search);
  const applyMutation = useApplyMember();
  const deleteMutation = useDeleteMember();

  const paginationParams: Record<string, string> = {};
  if (search.search_type !== "") paginationParams.search_type = search.search_type;
  if (search.search_value !== "") paginationParams.search_value = search.search_value;

  const handleProc = (m_id: string, m_no: number, mode: "apply" | "delete") => {
    const msg = mode === "delete" ? "삭제" : "가입승인";
    if (window.confirm(`${m_id} 회원을 ${msg}처리 하시겠습니까?`)) {
      const mutation = mode === "delete" ? deleteMutation : applyMutation;
      mutation.mutate(m_no, {
        onSuccess: (result) => {
          if (result.success) window.alert(`회원${msg}완료`);
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
                <li className="breadcrumb-item active">승인대기 리스트</li>
              </ol>
            </div>
            <h4 className="page-title">승인대기 리스트</h4>
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

      <div style={{ borderBottom: "1px solid #dee2e6", marginBottom: "10px" }}>
        <p>
          <strong className="text-danger">
            * 다이렉트게임즈 로그인 불가능 국가 : <br />
            RU(러시아),RO(루마니아),BR(브라질),FR(프랑스),VN(베트남),DE(덴마크),PH(필리핀),AT(오스트리아),NZ(뉴질랜드),MY(말레이시아),NL(네덜란드),PL(폴란드),GB(영국),AE(아랍에미리트),IT(이탈리아),SG(싱가포르)
          </strong>
          <br />- 금지된 사유는 지난 2016년 12월 15일 ~ 23일까지 발생된 계정도용사건으로 인해서
          그기간내 사용된 ip 국가들은 더이상 로그인 할 수 없도록 조치함.
        </p>
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
                <th className="text-center">아이디</th>
                <th className="text-center">
                  이름
                  <br />
                  (닉네임)
                </th>
                <th className="text-center">IP</th>
                <th className="text-center">country</th>
                <th className="text-center">회원가입일</th>
                <th className="text-center">가입채널</th>
                <th className="text-center"></th>
              </tr>
            </thead>
            <tbody className="font-12 bg-white">
              {items.map((item, num) => (
                <MemberReadyRow
                  key={item.m_no}
                  item={item}
                  rowNo={
                    pagination.total_results - (num + (pagination.current_page - 1) * PER_PAGE)
                  }
                  onProc={handleProc}
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

const MemberReadyRow = ({
  item,
  rowNo,
  onProc,
}: {
  item: MemberReadyItem;
  rowNo: number;
  onProc: (m_id: string, m_no: number, mode: "apply" | "delete") => void;
}) => (
  <tr>
    <td className="text-center">{rowNo}</td>
    <td className="text-center">
      <a href={`/member/member_view?m_no=${item.m_no}`}>{item.m_id}</a>
    </td>
    <td className="text-center">
      {item.name}
      <br />({item.nickname})
    </td>
    <td className="text-center">{item.ip}</td>
    <td className="text-center">{item.country}</td>
    <td className="text-center">{item.reg_date}</td>
    <td className="text-center">{item.channel}</td>
    <td className="text-center">
      <button
        className="btn btn-primary shadow-none"
        type="button"
        style={{ fontSize: "12px" }}
        onClick={() => onProc(item.m_id, item.m_no, "apply")}
      >
        가입승인
      </button>{" "}
      <button
        className="btn btn-danger shadow-none"
        type="button"
        style={{ fontSize: "12px" }}
        onClick={() => onProc(item.m_id, item.m_no, "delete")}
      >
        삭제
      </button>
    </td>
  </tr>
);
