import { useEffect, useState } from "react";
import { useQnaDetail, useSendQnaMail, type QnaHistoryItem } from "@entities/qna";

export type QnaViewSearch = {
  idx: number;
  searchType: string;
  searchTitle: string;
  searchGubun: string;
  is_answer: string;
  replyStatus: string;
  email_flag: string;
};

// legacy qna_view.php 전용 gubun_array — 목록/상세와 순서·일부 라벨 다름(4=주문취소 및 환불).
const GUBUN_LABELS: Record<string, string> = {
  "6": "계정, 회원, 인증",
  "7": "한글, 제공 콘텐츠",
  "1": "게임 설치, 플레이",
  "2": "주문, 결제",
  "4": "주문취소 및 환불",
  "3": "기타",
  "5": "제품 코드(키) 오류",
  "8": "할인, 가격",
  "9": "이용방법",
};

// legacy q_string — idx 제외 비어있지 않은 필터를 링크에 유지.
const buildQString = (search: QnaViewSearch): string => {
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

// legacy board/qna_view.php — 문의하기 상세(+메일발송).
export const QnaViewScreen = (search: QnaViewSearch) => {
  const { data } = useQnaDetail(search.idx);
  const mailMutation = useSendQnaMail();

  useEffect(() => {
    // legacy $page_title="고객문의"(h4 문의하기 상세와 상이 quirk)
    document.title = "고객문의";
  }, []);

  if (!data) {
    return null;
  }

  const qString = buildQString(search);
  const link = (base: string, idx: number) =>
    qString ? `${base}?${qString}&idx=${idx}` : `${base}?idx=${idx}`;
  const listLink = qString ? `/board/qna_list?${qString}` : "/board/qna_list";
  // legacy: 회원 email 없으면 user_id를 메일 발송 대상으로 사용(폴백).
  const mailEmail = data.member.email || data.user_id;

  const handleMail = () => {
    if (window.confirm(`${mailEmail} 회원 에게 문의답변 메일을 발송하시겠습니까?`)) {
      mailMutation.mutate(
        { idx: data.idx, payload: { email: mailEmail } },
        {
          onSuccess: (result) => window.alert(result.message),
        },
      );
    }
  };

  return (
    <>
      <style>{`dt { font-weight: 500; } label { font-weight: 500; } blockquote { margin: 0 0 1rem; } #list-table tr:hover { background-color: #FFF0F0; } .image-group { position: relative; display: block; width: fit-content; margin: 0 0 30px 0; } .target-img { max-width: 600px; height: auto; display: block; transition: all 0.3s ease; cursor: pointer; } .target-img.full-size { max-width: 100% !important; } .zoom-btn { position: absolute; top: 10px; right: 10px; z-index: 10; padding: 8px 12px; background-color: rgba(0, 0, 0, 0.6); color: white; border: none; border-radius: 4px; cursor: pointer; } .zoom-btn:hover { background-color: rgba(0, 0, 0, 0.8); }`}</style>

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
                <li className="breadcrumb-item active">문의하기 상세</li>
              </ol>
            </div>
            <h4 className="page-title">문의하기 상세</h4>
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
                <td className="">
                  {data.user_id}
                  {data.member.email && (
                    <>
                      <br />({data.member.email})
                    </>
                  )}
                </td>
                <td>
                  <div>
                    <a
                      href={`/member/member_view?m_no=${data.member.m_no}`}
                      className="btn btn-primary shadow-none"
                      target="_blank"
                      rel="noreferrer"
                    >
                      회원정보보기
                    </a>{" "}
                    <a
                      href={`/order/order_all?search_key=search_m_id&search_value=${encodeURIComponent(data.user_id)}`}
                      className="btn btn-primary shadow-none"
                      target="_blank"
                      rel="noreferrer"
                    >
                      주문내역보기
                    </a>{" "}
                    <a
                      href={`/order/order_old_list?search_key=search_m_id&search_value=${encodeURIComponent(data.user_id)}&search_year=2017`}
                      className="btn btn-primary shadow-none"
                      target="_blank"
                      rel="noreferrer"
                    >
                      (과거)주문내역보기
                    </a>{" "}
                    <a
                      href={`/order/order_cancel_request?search_key=search_m_id&search_value=${encodeURIComponent(data.user_id)}`}
                      className="btn btn-primary shadow-none"
                      target="_blank"
                      rel="noreferrer"
                    >
                      취소요청내역보기
                    </a>
                  </div>
                </td>
                <th className="table-light" scope="row">
                  작성일
                </th>
                <td colSpan={3}>{data.reg_date}</td>
              </tr>
              <tr>
                <th className="table-light" scope="row">
                  제목
                </th>
                <td colSpan={2}>{data.subject}</td>
                <th className="table-light" scope="row">
                  고객 답변 확인 여부
                </th>
                <td>{data.replyStatus === "1" ? "확인" : "미확인"}</td>
                <th className="table-light" scope="row">
                  메일발송여부
                </th>
                <td>{data.email_flag === "Y" ? "발송" : "미발송"}</td>
              </tr>
              <tr>
                <th className="table-light" scope="row">
                  내용
                </th>
                <td colSpan={6} dangerouslySetInnerHTML={{ __html: data.contents_html }} />
              </tr>
              {data.files.length > 0 && (
                <tr>
                  <th className="table-light" scope="row">
                    첨부파일
                  </th>
                  <td colSpan={6}>
                    {data.files.map((file, i) => (
                      <ZoomImage
                        key={`${file.filename}-${i}`}
                        src={`${file.reg_date > "2025-08-19 00:00:00" ? "https://directg.net" : ""}/upload/qna/${file.filename}`}
                      />
                    ))}
                  </td>
                </tr>
              )}
              <tr>
                <th className="table-light" scope="row">
                  답변
                </th>
                <td colSpan={6} dangerouslySetInnerHTML={{ __html: data.answer_html }} />
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: "20px" }}>
          <table className="table table-bordered table-centered table-sm" id="list-table">
            <thead className="table-light font-13">
              <tr>
                <th className="text-center" style={{ width: "70px" }}>
                  번호
                </th>
                <th className="text-center">구분</th>
                <th className="text-center">제목</th>
                <th className="text-center">작성자</th>
                <th className="text-center">작성일</th>
                <th className="text-center">답변상태</th>
              </tr>
            </thead>
            <tbody>
              {data.history.map((item, i) => (
                <HistoryRow
                  key={item.idx}
                  item={item}
                  num={data.history.length - i}
                  href={link("/board/qna_view", item.idx)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center">
        <a href={listLink} className="btn btn-primary">
          목록가기
        </a>{" "}
        <a className="btn btn-primary shadow-none" href={link("/board/qna_register", data.idx)}>
          답변하기
        </a>{" "}
        {data.is_answer === "Y" && (
          <button type="button" className="btn btn-warning" onClick={handleMail}>
            메일발송
          </button>
        )}
      </div>
    </>
  );
};

const ZoomImage = ({ src }: { src: string }) => {
  const [full, setFull] = useState(false);
  return (
    <div className="image-group">
      <img
        className={`target-img${full ? " full-size" : ""}`}
        src={src}
        onClick={() => setFull((v) => !v)}
      />
      <button
        className="zoom-btn"
        onClick={(e) => {
          e.stopPropagation();
          setFull((v) => !v);
        }}
      >
        {full ? "축소하기" : "크게 보기"}
      </button>
    </div>
  );
};

const HistoryRow = ({ item, num, href }: { item: QnaHistoryItem; num: number; href: string }) => (
  <tr>
    <td className="text-center">{num}</td>
    <td className="text-center">{GUBUN_LABELS[item.gubun]}</td>
    <td className="text-left">
      <a href={href}>{item.subject}</a>
    </td>
    <td className="text-center">{item.user_id}</td>
    <td className="text-center">{item.reg_date}</td>
    <td className="text-center">
      {item.is_answer}
      <br />({item.admin_id})
    </td>
  </tr>
);
