import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  useEventBoardDetail,
  useCreateEventBoard,
  useUpdateEventBoard,
  type EventBoardDetail,
  type EventBoardSaveRequest,
} from "@entities/event";
import { MarkdownEditor } from "@shared/ui";

export type EventBoardRegisterSearch = {
  mode: string;
  idx: number;
};

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

// legacy date('Y-m-d H:i', $unix) — unix(초) → Y-m-d H:i (UTC 기준).
const fmtUnixMinute = (unix: number) => {
  const d = new Date(unix * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(
    d.getUTCHours(),
  )}:${p(d.getUTCMinutes())}`;
};

// legacy event_board_register.php — 이벤트 게시판 등록(idx>0면 프리필+modify).
export const EventBoardRegisterScreen = ({ idx }: EventBoardRegisterSearch) => {
  const isModify = idx > 0; // legacy: if($idx>0){ $mode="modify"; }
  const { data } = useEventBoardDetail(idx, { enabled: isModify });

  if (isModify && !data) {
    return null;
  }

  return <EventBoardForm isModify={isModify} idx={idx} detail={isModify ? data : undefined} />;
};

const EventBoardForm = ({
  isModify,
  idx,
  detail,
}: {
  isModify: boolean;
  idx: number;
  detail?: EventBoardDetail;
}) => {
  const navigate = useNavigate();
  const createMutation = useCreateEventBoard();
  const updateMutation = useUpdateEventBoard();

  // MarkdownEditor(easymde)는 상태 관리(FormData 미포함).
  const [contents, setContents] = useState(detail?.contents ?? "");
  const [eventNotes, setEventNotes] = useState(detail?.event_notes ?? "");

  const mode = isModify ? "modify" : "register";

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
    // legacy: 저장 → go("event_board_list.php") (page 1, 필터 없음)
    const onSuccess = () =>
      navigate({ to: "/event/event_board_list", search: { page: 1, is_view: "" } });
    if (isModify) {
      updateMutation.mutate({ idx, payload }, { onSuccess });
    } else {
      createMutation.mutate(payload, { onSuccess });
    }
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
                <li className="breadcrumb-item active">이벤트 게시판 등록</li>
              </ol>
            </div>
            <h4 className="page-title">이벤트 게시판 등록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-9">
          <form
            id="frm"
            name="frm"
            method="post"
            className="form-horizontal"
            onSubmit={handleSubmit}
          >
            <input type="hidden" name="mode" value={mode} />
            <input type="hidden" name="idx" value={isModify ? idx : ""} />
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
                          defaultChecked={detail?.event_gubun === g.value}
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
                        defaultValue={detail ? fmtUnixMinute(detail.start_date) : ""}
                      />
                      <span className="input-group-text">~</span>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="end_date"
                        name="end_date"
                        placeholder="이벤트종료일"
                        defaultValue={detail ? fmtUnixMinute(detail.end_date) : ""}
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
                      defaultValue={detail?.subject ?? ""}
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
                      defaultValue={detail?.event_banner ?? ""}
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
                          defaultValue={detail?.event_link_target ?? "_self"}
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
                          defaultValue={detail?.event_link_url ?? ""}
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
                        defaultChecked={detail?.is_view === "Y"}
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
                        defaultChecked={detail?.is_view === "N"}
                      />
                      <label className="form-check-label" htmlFor="is_view_n">
                        아니오
                      </label>
                    </div>
                  </div>
                </div>

                {/* 프로모션 노출 여부 — legacy register.php는 idx>0에도 프리필 안 함(quirk) */}
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
        <div className="col-3"></div>
      </div>
    </>
  );
};
