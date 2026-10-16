import {
  usePartnerMemberList,
  type PartnerMemberListSearch,
  type PartnerMemberItem,
} from "@entities/partner";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/partner/partner_list";
// legacy 행 번호 오프셋 계수: 실제 페이지 크기는 50이나 번호 계산은 20을 사용(원문 버그 그대로 이식).
const ROW_NO_OFFSET = 20;

const nf = (n: number) => n.toLocaleString("en-US");

// legacy pc/_Admin_/partner/partner_list.php — 파트너 계정 관리(퍼블리셔 포털 로그인 계정 목록).
// 검색 폼은 렌더링되지 않음(파라미터는 URL 전용). getSupplierList()는 dead fetch로 화면 미사용.
export const PartnerMemberListScreen = (search: PartnerMemberListSearch) => {
  const { data } = usePartnerMemberList(search);

  if (!data) {
    return null;
  }

  const { items, pagination } = data;

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
                    파트너
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    파트너 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">파트너 계정 관리</li>
              </ol>
            </div>
            <h4 className="page-title">파트너 계정 관리</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{nf(pagination.total_results)} 개</div>
        <div className="float-end">
          {/* legacy partner_member_register.php — 미이관 링크 */}
          <a href="partner_member_register.php" className="btn btn-danger shadow-none">
            파트너 계정 등록
          </a>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <table
            className="table table-centered w-100  nowrap table-sm table-bordered border-light"
            cellPadding={0}
          >
            <thead className="table-light">
              <tr>
                <th className="text-center">번호</th>
                <th className="text-center">파트너</th>
                <th className="text-center">파트너 담당자</th>
                <th className="text-center">파트너 담당자 계정</th>
                <th className="text-center">계정상태</th>
                <th className="text-center">정보수정</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {items.map((item, num) => (
                <PartnerMemberRow
                  key={item.idx}
                  item={item}
                  rowNo={
                    pagination.total_results - (num + (pagination.current_page - 1) * ROW_NO_OFFSET)
                  }
                />
              ))}
            </tbody>
          </table>
          <div className="text-center mt-3 fs-5">
            <ServerPagination
              page={pagination.current_page}
              totalPages={pagination.total_pages}
              baseUrl={BASE_URL}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const PartnerMemberRow = ({ item, rowNo }: { item: PartnerMemberItem; rowNo: number }) => (
  <tr>
    <td className="text-center">{rowNo}</td>
    <td className="text-start">{item.publisher_name}</td>
    <td className="text-center">{item.name}</td>
    <td className="text-center">
      {/* legacy partner_member_view.php?idx= — 미이관 링크 */}
      <a href={`partner_member_view.php?idx=${item.idx}`}>{item.id}</a>
    </td>
    <td className="text-center">{item.flag === "Y" ? "접속가능" : "접속불가"}</td>
    <td className="text-center"></td>
  </tr>
);
