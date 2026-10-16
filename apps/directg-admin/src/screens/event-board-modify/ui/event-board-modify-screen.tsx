import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "@tanstack/react-router";
import {
  useEventBoardDetail,
  useUpdateEventBoard,
  useEventGoods,
  useAddEventGoods,
  useDeleteEventGoods,
  useAddEventGroupItems,
  searchEventGoodsOption,
  searchEventGroup,
  type EventBoardDetail,
  type EventBoardSaveRequest,
  type EventOptionSearchRow,
} from "@entities/event";
import { MarkdownEditor } from "@shared/ui";

// legacy 이벤트 구분 radio 순서(1/2/3/4/6/5/9).
const GUBUN_OPTIONS: { value: string; label: string }[] = [
  { value: "1", label: "예약구매" },
  { value: "2", label: "네이버페이 즉시할인" },
  { value: "3", label: "토스 즉시할인" },
  { value: "4", label: "네이버페이 포인트 쿠폰" },
  { value: "6", label: "DGKR 포인트" },
  { value: "5", label: "당첨자발표" },
  { value: "9", label: "기타" },
];

const fmtUnixMinute = (unix: number) => {
  const d = new Date(unix * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(
    d.getUTCHours(),
  )}:${p(d.getUTCMinutes())}`;
};

// legacy 판매상태 라벨/행 색상.
const statusLabel = (status: string) =>
  ({ "0": "판매중", "1": "판매중지", "3": "판매종료", "9": "승인대기" })[status] ?? "";
const rowClass = (status: string) => (status === "3" ? "bg-danger bg-opacity-50" : "bg-white");

// legacy event_board_modify.php — 이벤트 게시판 수정 + 이벤트 상품 관리.
export const EventBoardModifyScreen = ({ idx }: { idx: number }) => {
  const { data: detail } = useEventBoardDetail(idx, { enabled: idx > 0 });
  if (!detail) {
    return null;
  }
  return <ModifyBody idx={idx} detail={detail} />;
};

const ModifyBody = ({ idx, detail }: { idx: number; detail: EventBoardDetail }) => {
  const navigate = useNavigate();
  const updateMutation = useUpdateEventBoard();
  const { data: goodsData } = useEventGoods(idx, { enabled: idx > 0 });
  const addGoods = useAddEventGoods();
  const deleteGoods = useDeleteEventGoods(idx);
  const addGroupItems = useAddEventGroupItems();

  const [contents, setContents] = useState(detail.contents ?? "");
  const [eventNotes, setEventNotes] = useState(detail.event_notes ?? "");

  // 검색 모달 상태
  const [optionKeyword, setOptionKeyword] = useState("");
  const [groupKeyword, setGroupKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalShown, setModalShown] = useState(false);
  const [rows, setRows] = useState<EventOptionSearchRow[]>([]);
  // 그룹 검색이면 전체추가용 group_code, 옵션 검색이면 null.
  const [groupCode, setGroupCode] = useState<string | null>(null);

  useEffect(() => {
    if (!modalOpen) {
      return;
    }
    const id = requestAnimationFrame(() => setModalShown(true));
    return () => cancelAnimationFrame(id);
  }, [modalOpen]);

  const goodsItems = goodsData?.items ?? [];

  const closeModal = () => {
    setModalShown(false);
    setModalOpen(false);
  };

  const onOptionSearch = async () => {
    if (optionKeyword.trim() === "") {
      window.alert("검색할 옵션상품명이나 옵션상품코드를 입력해주세요.");
      return;
    }
    const res = await searchEventGoodsOption(optionKeyword, idx);
    setRows(res.items || []);
    setGroupCode(null);
    setModalOpen(true);
  };

  const onGroupSearch = async () => {
    if (groupKeyword.trim() === "") {
      window.alert("검색할 그룹코드를 입력해주세요.");
      return;
    }
    const res = await searchEventGroup(groupKeyword, idx);
    setRows(res.items || []);
    setGroupCode(res.group_code);
    setModalOpen(true);
  };

  const onAddOption = (row: EventOptionSearchRow) => {
    addGoods.mutate(
      { event_no: idx, product_code: row.product_code, product_name: row.product_name },
      { onSuccess: () => closeModal() },
    );
  };

  const onAddGroupAll = () => {
    if (groupCode == null) {
      return;
    }
    // legacy: 성공 시 모달만 닫고 재조회 없음(location.reload 주석처리 quirk).
    addGroupItems.mutate({ eventNo: idx, groupCode }, { onSuccess: () => closeModal() });
  };

  const onDeleteGoods = (goodsIdx: number) => {
    if (window.confirm("해당 이벤트 옵션상품을 삭제하시겠습니까?")) {
      deleteGoods.mutate(goodsIdx);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const get = (name: string) => String(fd.get(name) ?? "");
    const payload: EventBoardSaveRequest = {
      gubun: get("gubun"),
      subject: get("subject"),
      contents,
      event_notes: eventNotes,
      start_date: get("start_date"),
      end_date: get("end_date"),
      event_banner: get("event_banner"),
      event_link_target: get("event_link_target"),
      event_link_url: get("event_link_url"),
      is_view: get("is_view"),
      show_promotion: get("show_promotion"),
    };
    updateMutation.mutate(
      { idx, payload },
      {
        onSuccess: () =>
          navigate({ to: "/event/event_board_list", search: { page: 1, is_view: "" } }),
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
                    이벤트 게시판 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">이벤트 게시판 수정</li>
              </ol>
            </div>
            <h4 className="page-title">이벤트 게시판 수정</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-8">
          <form
            id="frm"
            name="frm"
            method="post"
            className="form-horizontal"
            onSubmit={handleSubmit}
          >
            <input type="hidden" name="mode" value="modify" />
            <input type="hidden" name="idx" value={idx} />
            <div className="card">
              <div className="card-body">
                {/* 이벤트 구분 */}
                <div className="mb-2 row">
                  <label className="col-sm-2 col-form-label bg-secondary text-white">
                    * 이벤트 구분
                  </label>
                  <div className="col-sm-10 border p-2">
                    {GUBUN_OPTIONS.map((g) => (
                      <div className="form-check form-check-inline" key={g.value}>
                        <input
                          type="radio"
                          id={`gubun${g.value}`}
                          name="gubun"
                          className="form-check-input"
                          value={g.value}
                          defaultChecked={detail.event_gubun === g.value}
                        />
                        <label className="form-check-label" htmlFor={`gubun${g.value}`}>
                          {g.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 이벤트 기간 */}
                <div className="mb-2 row">
                  <label className="col-sm-2 col-form-label bg-secondary text-white">
                    * 이벤트 기간
                  </label>
                  <div className="col-sm-6">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="start_date"
                        name="start_date"
                        placeholder="이벤트시작일"
                        defaultValue={fmtUnixMinute(detail.start_date)}
                      />
                      <span className="input-group-text">~</span>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="end_date"
                        name="end_date"
                        placeholder="이벤트종료일"
                        defaultValue={fmtUnixMinute(detail.end_date)}
                      />
                    </div>
                  </div>
                </div>

                {/* 이벤트 제목 */}
                <div className="mb-2 row">
                  <label
                    htmlFor="subject"
                    className="col-sm-2 col-form-label bg-secondary text-white"
                  >
                    * 이벤트 제목
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control"
                      id="subject"
                      name="subject"
                      defaultValue={detail.subject}
                    />
                  </div>
                </div>

                {/* 이벤트 내용 */}
                <div className="mb-2 row">
                  <label
                    htmlFor="contents"
                    className="col-sm-2 col-form-label bg-secondary text-white"
                  >
                    * 이벤트 내용
                  </label>
                  <div className="col-sm-10">
                    <MarkdownEditor value={contents} onChange={setContents} />
                  </div>
                </div>

                {/* 이벤트 유의사항 */}
                <div className="mb-2 row">
                  <label
                    htmlFor="event_notes"
                    className="col-sm-2 col-form-label bg-secondary text-white"
                  >
                    * 이벤트 유의사항
                  </label>
                  <div className="col-sm-10">
                    <MarkdownEditor value={eventNotes} onChange={setEventNotes} />
                  </div>
                </div>

                {/* 이벤트 배너 URL */}
                <div className="mb-2 row">
                  <label
                    htmlFor="event_banner"
                    className="col-sm-2 col-form-label bg-secondary text-white"
                  >
                    * 이벤트 배너 URL
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control"
                      id="event_banner"
                      name="event_banner"
                      defaultValue={detail.event_banner}
                      required
                    />
                  </div>
                </div>

                {/* 이벤트 링크 URL */}
                <div className="mb-2 row">
                  <label className="col-sm-2 col-form-label bg-secondary text-white">
                    * 이벤트 링크 URL
                  </label>
                  <div className="col-sm-10">
                    <div className="input-group">
                      <div className="col-sm-2 me-2">
                        <select
                          id="event_link_target"
                          name="event_link_target"
                          className="form-select"
                          defaultValue={detail.event_link_target || "_self"}
                        >
                          <option value="_self">현재창</option>
                          <option value="_blank">새창</option>
                        </select>
                      </div>
                      <div className="col-sm-9">
                        <input
                          type="text"
                          className="form-control"
                          id="event_link_url"
                          name="event_link_url"
                          placeholder="도메인 제외입력"
                          defaultValue={detail.event_link_url}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 이벤트 노출 여부 */}
                <div className="mb-2 row">
                  <label className="col-sm-2 col-form-label bg-secondary text-white">
                    * 이벤트 노출 여부
                  </label>
                  <div className="col-sm-10 border p-2">
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="is_view_y"
                        name="is_view"
                        className="form-check-input"
                        value="Y"
                        defaultChecked={detail.is_view === "Y"}
                      />
                      <label className="form-check-label" htmlFor="is_view_y">
                        예
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="is_view_n"
                        name="is_view"
                        className="form-check-input"
                        value="N"
                        defaultChecked={detail.is_view === "N"}
                      />
                      <label className="form-check-label" htmlFor="is_view_n">
                        아니오
                      </label>
                    </div>
                  </div>
                </div>

                {/* 프로모션 노출 여부 (modify.php는 프리필함) */}
                <div className="mb-2 row">
                  <label className="col-sm-2 col-form-label bg-secondary text-white">
                    * 프로모션 노출 여부
                  </label>
                  <div className="col-sm-10 border p-2">
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="show_promotion_y"
                        name="show_promotion"
                        className="form-check-input"
                        value="Y"
                        defaultChecked={detail.show_promotion === "Y"}
                      />
                      <label className="form-check-label" htmlFor="show_promotion_y">
                        예
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="show_promotion_n"
                        name="show_promotion"
                        className="form-check-input"
                        value="N"
                        defaultChecked={detail.show_promotion === "N"}
                      />
                      <label className="form-check-label" htmlFor="show_promotion_n">
                        아니오
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-2 row">
                  <div className="text-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      이벤트 저장
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="col-4">
          {/* 이벤트 배너 */}
          <div className="card">
            <div className="card-header bg-secondary text-white fw-bold font-14">이벤트 배너</div>
            <img src={detail.event_banner} className="img-fluid" />
          </div>

          {/* 이벤트 상품 */}
          <div className="card">
            <div className="card-header bg-secondary text-white fw-bold font-14">이벤트 상품</div>
            <div className="card-body p-0 font-12">
              <ul className="list-group">
                {goodsItems.map((g) => (
                  <li
                    key={g.idx}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      {g.product_code} / {g.product_name}
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn_event_goods_delete"
                      onClick={() => onDeleteGoods(g.idx)}
                    >
                      <i className="mdi mdi-delete font-16"></i>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-footer px-1">
              <div className="d-flex flex-row">
                <div className="input-group">
                  <input
                    type="text"
                    name="search_value"
                    id="search_value"
                    className="form-control form-control-sm"
                    placeholder="검색할 옵션상품명이나 옵션상품코드를 입력해 주세요"
                    value={optionKeyword}
                    onChange={(e) => setOptionKeyword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm shadow-none"
                    id="btn_option_find"
                    onClick={onOptionSearch}
                  >
                    옵션상품 검색
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 그룹상품 가져오기 */}
          <div className="card">
            <div className="card-header bg-secondary text-white fw-bold font-14">
              그룹상품 가져오기
            </div>
            <div className="card-footer px-1">
              <div className="d-flex flex-row">
                <div className="input-group">
                  <input
                    type="text"
                    name="search_group_code"
                    id="search_group_code"
                    className="form-control form-control-sm"
                    placeholder="검색할 그룹코드를 입력해 주세요"
                    value={groupKeyword}
                    onChange={(e) => setGroupKeyword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm shadow-none"
                    id="btn_group_find"
                    onClick={onGroupSearch}
                  >
                    그룹 검색
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 옵션상품 검색 팝업 */}
      {modalOpen &&
        createPortal(
          <>
            <div
              className={`modal fade${modalShown ? " show" : ""}`}
              tabIndex={-1}
              role="dialog"
              style={{ display: "block" }}
            >
              <div className="modal-dialog modal-lg" style={{ maxWidth: "1100px" }}>
                <div className="modal-content">
                  <div className="modal-header modal-colored-header bg-primary">
                    <h4 className="modal-title">옵션상품 검색결과</h4>
                    <button type="button" className="btn-close" onClick={closeModal} />
                  </div>
                  <div className="modal-body p-0">
                    <table className="table table-border mb-0 table-sm">
                      <thead className="table-dark font-14">
                        <tr>
                          <th className="text-center" style={{ width: "80px" }}>
                            옵션상품
                            <br />
                            번호
                          </th>
                          <th className="text-center" style={{ width: "350px" }}>
                            옵션상품명
                            <br />
                            (영문명)
                          </th>
                          <th className="text-center" style={{ width: "100px" }}>
                            플랫폼
                          </th>
                          <th className="text-center" style={{ width: "150px" }}>
                            퍼블리셔
                          </th>
                          <th className="text-center" style={{ width: "150px" }}>
                            게임옵션
                            <br />
                            (번들옵션)
                          </th>
                          <th className="text-center" style={{ width: "100px" }}>
                            판매상태
                          </th>
                          <th className="text-center" style={{ width: "100px" }}>
                            비고
                          </th>
                        </tr>
                      </thead>
                      <tbody className="font-13">
                        {groupCode != null && (
                          <tr>
                            <td colSpan={6}></td>
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary btn_option_add_all"
                                onClick={onAddGroupAll}
                              >
                                전체추가
                              </button>
                            </td>
                          </tr>
                        )}
                        {rows.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center">
                              검색된 옵션상품이 없습니다
                            </td>
                          </tr>
                        ) : (
                          rows.map((row) => (
                            <tr key={row.product_code} className={rowClass(row.status)}>
                              <td className="text-center">{row.product_code}</td>
                              <td className="text-start">
                                {row.product_name}
                                <br />({row.product_name_en})
                              </td>
                              <td className="text-center">{row.platform_name}</td>
                              <td className="text-center">{row.publisher_name}</td>
                              <td className="text-center">{row.game_type_name}</td>
                              <td className="text-center">{statusLabel(row.status)}</td>
                              <td className="text-center">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary btn_option_add"
                                  onClick={() => onAddOption(row)}
                                >
                                  옵션추가
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`modal-backdrop fade${modalShown ? " show" : ""}`}
              onClick={closeModal}
            />
          </>,
          document.body,
        )}
    </>
  );
};
