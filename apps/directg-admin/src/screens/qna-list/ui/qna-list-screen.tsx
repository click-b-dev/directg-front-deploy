import { useEffect, useState } from "react";
import { useQnaList, useDeleteQnas, type QnaListSearch, type QnaListItem } from "@entities/qna";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/board/qna_list";
const QNA_READ_KEY = "qna_read_ids";

// legacy $gubun_array — select/셀 라벨(표시 순서 유지).
const GUBUN_ORDER: { value: string; label: string }[] = [
  { value: "1", label: "게임 설치, 플레이" },
  { value: "2", label: "주문, 결제" },
  { value: "5", label: "제품 코드(키) 오류" },
  { value: "7", label: "한글, 제공 콘텐츠" },
  { value: "6", label: "계정, 회원, 인증" },
  { value: "4", label: "취소, 환불" },
  { value: "8", label: "할인, 가격" },
  { value: "9", label: "이용방법" },
  { value: "3", label: "기타" },
];
const GUBUN_LABELS: Record<string, string> = Object.fromEntries(
  GUBUN_ORDER.map((g) => [g.value, g.label]),
);

const SEARCH_TYPES: { value: string; label: string }[] = [
  { value: "subject", label: " 제목" },
  { value: "user_id", label: "작성자" },
  { value: "contents", label: "내용" },
  { value: "subject_contents", label: "제목+내용" },
];

// legacy q_string — page 제외 비어있지 않은 필터를 링크/페이징에 유지.
const buildQString = (search: QnaListSearch): string => {
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

// legacy board/qna_list.php — 문의하기 목록(+다중삭제·읽음표시).
export const QnaListScreen = (search: QnaListSearch) => {
  const { data } = useQnaList(search);
  const deleteMutation = useDeleteQnas();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);

  // legacy: localStorage qna_read_ids → 로드 시 .qna-read 적용.
  useEffect(() => {
    try {
      setReadIds(JSON.parse(localStorage.getItem(QNA_READ_KEY) || "[]"));
    } catch {
      setReadIds([]);
    }
  }, []);

  if (!data) {
    return null;
  }

  const items = data.items;
  const allChecked = items.length > 0 && selectedIds.length === items.length;

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? items.map((it) => it.idx) : []);
  };
  const toggleOne = (idx: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, idx] : prev.filter((v) => v !== idx)));
  };

  const handleDelete = () => {
    // legacy all-delete-btn
    if (selectedIds.length < 1) {
      window.alert("선택하신 글이 없습니다.");
      return;
    }
    if (window.confirm("선택한 글을 삭제하시겠습니까?\n\r영구 삭제되어 복원 불가능합니다.")) {
      deleteMutation.mutate(
        { idx: selectedIds },
        {
          onSuccess: (result) => {
            window.alert(`${result.deleted} 개 삭제되었습니다.`);
            setSelectedIds([]);
          },
        },
      );
    }
  };

  // legacy: 제목 클릭 시 idx를 localStorage에 저장 + 행 .qna-read.
  const markRead = (idx: number) => {
    const id = String(idx);
    setReadIds((prev) => {
      if (prev.includes(id)) {
        return prev;
      }
      const next = [...prev, id];
      if (next.length > 2000) {
        next.shift();
      }
      try {
        localStorage.setItem(QNA_READ_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const qString = buildQString(search);
  const linkQuery = (idx: number) => (qString ? `${qString}&idx=${idx}` : `idx=${idx}`);
  const baseNum = data.pagination.total_results - (data.pagination.current_page - 1) * 30;

  return (
    <>
      <style>{`tr.qna-read td { color: #888; } tr.qna-read a { color: #888; }`}</style>

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
                <li className="breadcrumb-item active">문의하기 목록</li>
              </ol>
            </div>
            <h4 className="page-title">문의하기 목록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">검색필터</h5>
            <div className="card-body">
              <form className="form-horizontal" method="get" action={BASE_URL}>
                <div className="row mb-2">
                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label
                        htmlFor="searchTitle"
                        className="col-sm-3 col-form-label bg-light border"
                      >
                        검색어
                      </label>
                      <div className="col-sm-3">
                        <select
                          className="form-control"
                          name="searchType"
                          defaultValue={search.searchType}
                        >
                          {SEARCH_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-sm-6">
                        <input
                          type="text"
                          className="form-control"
                          id="searchTitle"
                          name="searchTitle"
                          placeholder="제목검색"
                          defaultValue={search.searchTitle}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label htmlFor="" className="col-sm-3 col-form-label bg-light border">
                        구분
                      </label>
                      <div className="col-sm-3">
                        <select
                          name="searchGubun"
                          className="form-control"
                          defaultValue={search.searchGubun}
                        >
                          <option value="">전체</option>
                          {GUBUN_ORDER.map((g) => (
                            <option key={g.value} value={g.value}>
                              {g.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mb-2">
                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label htmlFor="" className="col-sm-3 col-form-label bg-light border">
                        답변상태
                      </label>
                      <div className="col-sm-6 mt-1">
                        <RadioInline
                          name="is_answer"
                          id="is_answer1"
                          value=""
                          label="전체"
                          current={search.is_answer}
                        />
                        <RadioInline
                          name="is_answer"
                          id="is_answer2"
                          value="N"
                          label="답변대기"
                          current={search.is_answer}
                        />
                        <RadioInline
                          name="is_answer"
                          id="is_answer3"
                          value="Y"
                          label="답변완료"
                          current={search.is_answer}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label htmlFor="" className="col-sm-3 col-form-label bg-light border">
                        고객 답변 확인 여부
                      </label>
                      <div className="col-sm-6 mt-1">
                        <RadioInline
                          name="replyStatus"
                          id="replyStatus1"
                          value=""
                          label="전체"
                          current={search.replyStatus}
                        />
                        <RadioInline
                          name="replyStatus"
                          id="replyStatus2"
                          value="1"
                          label="확인"
                          current={search.replyStatus}
                        />
                        <RadioInline
                          name="replyStatus"
                          id="replyStatus3"
                          value="0"
                          label="미확인"
                          current={search.replyStatus}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mb-2">
                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label htmlFor="" className="col-sm-3 col-form-label bg-light border">
                        메일발송
                      </label>
                      <div className="col-sm-6 mt-1">
                        <RadioInline
                          name="email_flag"
                          id="email_flag1"
                          value=""
                          label="전체"
                          current={search.email_flag}
                        />
                        <RadioInline
                          name="email_flag"
                          id="email_flag2"
                          value="Y"
                          label="발송"
                          current={search.email_flag}
                        />
                        <RadioInline
                          name="email_flag"
                          id="email_flag3"
                          value="N"
                          label="미발송"
                          current={search.email_flag}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-12">
                    <div className="float-end">
                      <button type="submit" className="btn btn-primary shadow-none">
                        검색
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="d-flex flex-row justify-content-between mb-2">
            <div className="float-start">{data.pagination.total_results.toLocaleString()} 개</div>
          </div>

          <div className="table-responsive">
            <table
              className="table table-hover table-centered w-100 dt-responsive nowrap table-sm table-bordered"
              id=""
            >
              <thead className="table-light font-13">
                <tr>
                  <th className="text-center all" style={{ width: "20px" }}>
                    <div className="form-check text-center">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="customCheck1"
                        checked={allChecked}
                        onChange={(e) => toggleAll(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="customCheck1">
                        &nbsp;
                      </label>
                    </div>
                  </th>
                  <th className="text-center" style={{ width: "70px" }}>
                    번호
                  </th>
                  <th className="text-center" style={{ width: "130px" }}>
                    구분
                  </th>
                  <th className="text-center">제목</th>
                  <th className="text-center" style={{ width: "150px" }}>
                    작성자
                  </th>
                  <th className="text-center" style={{ width: "150px" }}>
                    작성일
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    답변상태
                  </th>
                  <th className="text-center" style={{ width: "150px" }}>
                    고객 답변 확인 여부
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    메일발송
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    답변
                  </th>
                </tr>
              </thead>
              <tbody className="font-12 bg-white">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={10} height={50} className="no-data">
                      게시물이 없습니다.
                    </td>
                  </tr>
                ) : (
                  items.map((item, i) => (
                    <QnaRow
                      key={item.idx}
                      item={item}
                      num={baseNum - i}
                      checked={selectedIds.includes(item.idx)}
                      read={readIds.includes(String(item.idx))}
                      href={`/board/qna_view?${linkQuery(item.idx)}`}
                      editHref={`/board/qna_register?${linkQuery(item.idx)}`}
                      onCheck={(checked) => toggleOne(item.idx, checked)}
                      onOpen={() => markRead(item.idx)}
                    />
                  ))
                )}
                <tr>
                  <td colSpan={10}>
                    선택한 게시글{" "}
                    <button
                      id="all-delete-btn"
                      className="btn btn-warning"
                      type="button"
                      onClick={handleDelete}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-center mt-3">
            <ServerPagination
              page={data.pagination.current_page}
              totalPages={data.pagination.total_pages}
              baseUrl={BASE_URL}
              params={{
                searchType: search.searchType,
                searchTitle: search.searchTitle,
                searchGubun: search.searchGubun,
                is_answer: search.is_answer,
                replyStatus: search.replyStatus,
                email_flag: search.email_flag,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const RadioInline = ({
  name,
  id,
  value,
  label,
  current,
}: {
  name: string;
  id: string;
  value: string;
  label: string;
  current: string;
}) => (
  <div className="form-check form-check-inline">
    <input
      type="radio"
      id={id}
      name={name}
      className="form-check-input"
      value={value}
      defaultChecked={current === value}
    />
    <label className="form-check-label" htmlFor={id}>
      {label}
    </label>
  </div>
);

const QnaRow = ({
  item,
  num,
  checked,
  read,
  href,
  editHref,
  onCheck,
  onOpen,
}: {
  item: QnaListItem;
  num: number;
  checked: boolean;
  read: boolean;
  href: string;
  editHref: string;
  onCheck: (checked: boolean) => void;
  onOpen: () => void;
}) => (
  <tr data-qna-idx={item.idx} className={read ? "qna-read" : undefined}>
    <td className="text-center">
      <div className="form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id={String(item.idx)}
          name="idx[]"
          value={item.idx}
          checked={checked}
          onChange={(e) => onCheck(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="idx">
          &nbsp;
        </label>
      </div>
    </td>
    <td className="text-center px-1">{num}</td>
    <td className="text-center px-1">{GUBUN_LABELS[item.gubun]}</td>
    <td className="text-left px-1">
      <a href={href} onClick={onOpen}>
        {item.subject} {item.file_cnt > 0 && <i className="dripicons-photo" />}
      </a>
    </td>
    <td className="text-center px-1">{item.user_id}</td>
    <td className="text-center px-1">{item.reg_date}</td>
    <td className="text-center">
      {item.answer !== "" ? "O" : "X"}
      <br />({item.admin_id})
    </td>
    <td className="text-center">{item.replyStatus === "1" ? "확인" : ""}</td>
    <td className="text-center">{item.email_flag === "Y" ? "발송" : ""}</td>
    <td className="text-center">
      <a className="action-icon" href={editHref}>
        <i className="mdi mdi-square-edit-outline" />
      </a>
    </td>
  </tr>
);
