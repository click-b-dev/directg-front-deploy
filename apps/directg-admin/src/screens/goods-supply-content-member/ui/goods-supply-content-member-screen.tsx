import {
  useSupplyContentMember,
  type SupplyContentMemberSearch,
  type SupplyContentMemberItem,
} from "@entities/supply-content";

const BASE_URL = "/goods/supply_content_member";

// legacy supply_content_member.php — 회원별 제공컨텐츠 조회.
export const GoodsSupplyContentMemberScreen = (search: SupplyContentMemberSearch) => {
  const { data } = useSupplyContentMember(search);
  const items = data?.items ?? [];
  const memberId = data?.member_id ?? search.search_value;

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
                <li className="breadcrumb-item active">회원별 제공컨텐츠 조회</li>
              </ol>
            </div>
            <h4 className="page-title">회원별 제공컨텐츠 조회</h4>
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
            <h5 className="card-header bg-secondary text-white">제공컨텐츠 현황</h5>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-centered w-100 nowrap table-sm table-bordered">
                  <colgroup>
                    <col width="3%" />
                    <col width="5%" />
                    <col width="20%" />
                    <col width="*" />
                    <col width="5%" />
                    <col width="5%" />
                  </colgroup>
                  <thead className="table-light font-13">
                    <tr>
                      <th className="text-center">번호</th>
                      <th className="text-center">제공컨텐츠 유형</th>
                      <th className="text-center">제공 컨텐츠명</th>
                      <th className="text-center">제공 컨텐츠 URL</th>
                      <th className="text-center">암호화 여부</th>
                      <th className="text-center">암호화 방식</th>
                    </tr>
                  </thead>
                  <tbody className="font-12">
                    {items.map((item, i) => (
                      <MemberContentRows
                        key={item.idx}
                        item={item}
                        rowNo={i + 1}
                        memberId={memberId}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const MemberContentRows = ({
  item,
  rowNo,
  memberId,
}: {
  item: SupplyContentMemberItem;
  rowNo: number;
  memberId: string;
}) => (
  <>
    <tr>
      <td className="text-center">{rowNo}</td>
      <td className="text-center">{item.supply_content_type === "P" ? "한글패치" : "컨텐츠"}</td>
      <td>{item.supply_content}</td>
      <td>{item.supply_content_url}</td>
      <td className="text-center">{item.is_encode}</td>
      <td className="text-center">{item.encode_type}</td>
    </tr>
    {item.is_encode === "Y" && (
      <tr>
        <th className="text-center bg-light" colSpan={2}>
          한글패치 인증정보
        </th>
        <td colSpan={4}>
          <div className="d-flex flex-row align-items-center">
            <div className="me-2">
              <strong>아이디</strong>: {memberId}
            </div>
            <div className="me-2">
              <strong>비밀번호</strong>: <span>{item.patch_password}</span>
            </div>
            <div className="me-2">
              <button
                type="button"
                className="btn btn-secondary btn-sm btn_clipboard shadow-none"
                onClick={() => navigator.clipboard?.writeText(item.patch_password)}
              >
                비밀번호 복사
              </button>
            </div>
          </div>
        </td>
      </tr>
    )}
  </>
);
