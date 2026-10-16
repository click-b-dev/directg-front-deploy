import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQnaDetail, useSubmitQnaAnswer } from "@entities/qna";
import { SmartEditor, type SmartEditorHandle } from "@shared/ui";

export type QnaRegisterSearch = {
  idx: number;
  searchType: string;
  searchTitle: string;
  searchGubun: string;
  is_answer: string;
  replyStatus: string;
  email_flag: string;
};

// legacy q_string — idx 제외 비어있지 않은 필터를 링크에 유지.
const buildQString = (search: QnaRegisterSearch): string => {
  const parts: string[] = [];
  const add = (key: string, value: string) => {
    if (value !== "") {
      parts.push(`${key}=${encodeURIComponent(value)}`);
    }
  };
  add("searchType", search.searchType);
  add("searchTitle", search.searchTitle);
  add("searchGubun", search.searchGubun);
  add("is_answer", search.is_answer);
  add("replyStatus", search.replyStatus);
  add("email_flag", search.email_flag);
  return parts.join("&");
};

// legacy board/qna_register.php — 문의하기 답변 작성(SmartEditor2).
export const QnaRegisterScreen = (search: QnaRegisterSearch) => {
  const { data } = useQnaDetail(search.idx);
  const answerMutation = useSubmitQnaAnswer();
  const editorRef = useRef<SmartEditorHandle>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // legacy $page_title="고객문의"(h4 문의하기 답변과 상이 quirk)
    document.title = "고객문의";
  }, []);

  if (!data) {
    return null;
  }

  const qString = buildQString(search);
  const listLink = qString ? `/board/qna_list?${qString}` : "/board/qna_list";

  const handleSave = () => {
    // legacy btn_answer_save: SE2 getIR() → answer → submit → qna_ps update.
    const answer = editorRef.current?.getContent() ?? "";
    answerMutation.mutate(
      { idx: data.idx, payload: { answer } },
      {
        onSuccess: () => {
          window.alert("저장되었습니다.");
          // legacy go(HTTP_REFERER) → 상세로 복귀(갱신된 답변 확인)
          navigate({
            to: "/board/qna_view",
            search: {
              idx: data.idx,
              searchType: search.searchType,
              searchTitle: search.searchTitle,
              searchGubun: search.searchGubun,
              is_answer: search.is_answer,
              replyStatus: search.replyStatus,
              email_flag: search.email_flag,
            },
          });
        },
      },
    );
  };

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
                    게시판
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    문의하기 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">문의하기 답변</li>
              </ol>
            </div>
            <h4 className="page-title">문의하기 답변</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <table
            className="table table-bordered table-centered table-sm"
            style={{ border: "1px solid #dbe0e5" }}
          >
            <tbody className="bg-white font-14">
              <tr>
                <th className="table-light" scope="row">
                  작성자
                </th>
                <td className="">{data.user_id}</td>
                <th className="table-light" scope="row">
                  작성일
                </th>
                <td>{data.reg_date}</td>
              </tr>
              <tr>
                <th className="table-light" scope="row">
                  제목
                </th>
                <td colSpan={3}>{data.subject}</td>
              </tr>
              <tr>
                <th className="table-light" scope="row">
                  내용
                </th>
                <td colSpan={3} dangerouslySetInnerHTML={{ __html: data.contents_html }} />
              </tr>
              <tr>
                <th className="table-light" scope="row">
                  첨부파일
                </th>
                <td colSpan={3}>
                  {data.files.map((file, i) => (
                    <ul className="pdl0" id="uploadBox" key={`${file.filename}-${i}`}>
                      <li className="form-inline mgb5" style={{ width: "100%" }}>
                        <img
                          src={`${file.reg_date > "2025-08-19 00:00:00" ? "https://directg.net" : ""}/upload/qna/${file.filename}`}
                          style={{ maxWidth: "1280px" }}
                        />
                      </li>
                    </ul>
                  ))}
                </td>
              </tr>
              <tr>
                <th className="table-light" scope="row">
                  답변
                </th>
                <td colSpan={3}>
                  <SmartEditor ref={editorRef} initialValue={data.answer} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center">
        <a href={listLink} className="btn btn-primary">
          목록가기
        </a>{" "}
        <button
          type="button"
          id="btn_answer_save"
          className="btn btn-primary shadow-none"
          onClick={handleSave}
        >
          답변하기
        </button>
      </div>
    </>
  );
};
