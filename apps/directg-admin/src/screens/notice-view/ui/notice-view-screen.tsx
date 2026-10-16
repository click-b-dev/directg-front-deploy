import { useEffect } from "react";
import { useNoticeDetail } from "@entities/notice";

export type NoticeViewSearch = { idx: number };

// legacy notice_view.php 구분 라벨($gubun_array — 목록과 동일, 2=프로모션/이벤트).
const GUBUN_LABELS: Record<string, string> = {
  "1": "제품코드(키) 발송",
  "2": "프로모션/이벤트",
  "3": "상품 출시/판매",
  "4": "기타",
};

// legacy board/notice_view.php — 공지사항 미리보기(read-only).
export const NoticeViewScreen = ({ idx }: NoticeViewSearch) => {
  const { data } = useNoticeDetail(idx);

  useEffect(() => {
    // legacy $page_title="공지사항 등록"(h4 "공지사항 미리보기"와 상이, quirk)
    document.title = "공지사항 등록";
  }, []);

  if (!data) {
    return null;
  }

  return (
    <>
      {/* legacy 페이지 <style> 그대로 이식 */}
      <style>{`dt { font-weight: 500; } label { font-weight: 500; } blockquote { margin: 0 0 1rem; } #content img { width: 100%; }`}</style>

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
                    게시판
                  </a>
                </li>
                {/* legacy 오타 "공시사항 관리" 원문 유지 */}
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    공시사항 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">공지사항 미리보기</li>
              </ol>
            </div>
            <h4 className="page-title">공지사항 미리보기</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-8">
          <table className="table table-bordered table-centered table-sm">
            <tbody className="bg-white font-14">
              <tr>
                <th className="table-active" scope="row">
                  구분
                </th>
                <td className="">{GUBUN_LABELS[data.notice_type]}</td>
              </tr>
              <tr>
                <th className="table-active" scope="row">
                  제목
                </th>
                <td>{data.subject}</td>
              </tr>
              <tr>
                <th className="table-active" scope="row">
                  내용
                </th>
                <td>
                  <div
                    className="p-2"
                    id="content"
                    dangerouslySetInnerHTML={{ __html: data.contents_html }}
                  />
                </td>
              </tr>
              <tr>
                <th className="table-active w-20" scope="row" style={{ width: "10%" }}>
                  고정 여부
                </th>
                <td>{data.is_notice}</td>
              </tr>
              <tr>
                <th className="table-active" scope="row">
                  작성일자
                </th>
                <td>
                  {data.reg_date} ({data.admin_id})
                </td>
              </tr>
              <tr>
                <th className="table-active" scope="row">
                  노출여부
                </th>
                <td>{data.is_view}</td>
              </tr>
              <tr>
                <th className="table-active" scope="row">
                  배포일자
                </th>
                <td>{data.deploy_date}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
