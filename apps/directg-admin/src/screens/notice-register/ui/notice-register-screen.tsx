import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  useNoticeDetail,
  useCreateNotice,
  useUpdateNotice,
  type NoticeDetail,
  type NoticeSaveRequest,
} from "@entities/notice";
import { MarkdownEditor } from "@shared/ui";
import { DATETIME_MASK, applyMask } from "@shared/lib/input-mask";

export type NoticeRegisterSearch = {
  mode: string; // legacy GET mode — idx>0면 무시(modify 강제), 아니면 regitster
  idx: number;
};

const NOTICE_TYPES: { value: string; label: string }[] = [
  { value: "1", label: "제품코드(키) 발송" },
  { value: "2", label: "프로모션" },
  { value: "3", label: "상품 출시/판매" },
  { value: "4", label: "기타" },
];

// legacy board/notice_register.php — 공지사항 등록/수정 겸용 폼.
export const NoticeRegisterScreen = ({ idx }: NoticeRegisterSearch) => {
  const isModify = idx > 0; // legacy: if($idx>0){ $mode="modify"; }
  const { data } = useNoticeDetail(idx, { enabled: isModify });

  useEffect(() => {
    // legacy $page_title="공지사항 등록"(modify도 동일)
    document.title = "공지사항 등록";
  }, []);

  if (isModify && !data) {
    return null;
  }

  return <NoticeForm isModify={isModify} idx={idx} detail={isModify ? data : undefined} />;
};

const NoticeForm = ({
  isModify,
  idx,
  detail,
}: {
  isModify: boolean;
  idx: number;
  detail?: NoticeDetail;
}) => {
  const navigate = useNavigate();
  const createMutation = useCreateNotice();
  const updateMutation = useUpdateNotice();

  // MarkdownEditor(easymde)·input-mask는 상태로 관리(FormData 미포함).
  const [contents, setContents] = useState(detail?.contents ?? "");
  const [deployDate, setDeployDate] = useState(detail?.deploy_date ?? "");

  // legacy: register는 mode="regitster"(오타), modify는 "modify".
  const mode = isModify ? "modify" : "regitster";
  // legacy: register 기본 구분=1 checked. modify는 저장값.
  const noticeTypeChecked = detail?.notice_type ?? "1";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const get = (name: string) => String(fd.get(name) ?? "");
    const payload: NoticeSaveRequest = {
      notice_type: get("notice_type"),
      subject: get("subject"),
      contents,
      is_notice: get("is_notice"),
      is_view: get("is_view"),
      deploy_date: deployDate,
    };
    // legacy: 저장 → go("notice_list.php") (쿼리 없음 = page 1, 필터 없음)
    const onSuccess = () =>
      navigate({
        to: "/board/notice_list",
        search: { page: 1, search_title: "", search_notice_type: "" },
      });
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
                {/* legacy 오타 "공시사항 관리" 원문 유지 */}
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    공시사항 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">공지사항 등록</li>
              </ol>
            </div>
            <h4 className="page-title">공지사항 등록</h4>
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
            <input type="hidden" name="mode" value={mode} />
            <input type="hidden" name="idx" value={isModify ? idx : ""} />
            <div className="card">
              <div className="card-body p-0">
                <div className="row g-0 mb-2 border">
                  <label
                    htmlFor="notice_type"
                    className="col-sm-2 col-form-label bg-secondary text-white ps-2"
                  >
                    * 공지사항 구분
                  </label>
                  <div className="col-sm-10 p-2">
                    {NOTICE_TYPES.map((t) => (
                      <div className="form-check form-check-inline" key={t.value}>
                        <input
                          type="radio"
                          id={`notice_type${t.value}`}
                          name="notice_type"
                          className="form-check-input"
                          value={t.value}
                          defaultChecked={noticeTypeChecked === t.value}
                        />
                        <label className="form-check-label" htmlFor={`notice_type${t.value}`}>
                          {t.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="row g-0 mb-2 border-0">
                  <label
                    htmlFor="subject"
                    className="col-sm-2 col-form-label bg-secondary text-white ps-2"
                  >
                    * 공지사항 제목
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control rounded-0"
                      id="subject"
                      name="subject"
                      defaultValue={detail?.subject ?? ""}
                    />
                  </div>
                </div>

                <div className="row g-0 mb-2 border-0">
                  <label
                    htmlFor="contents"
                    className="col-sm-2 col-form-label bg-secondary text-white ps-2"
                  >
                    * 공지사항 내용
                  </label>
                  <div className="col-sm-10 px-2">
                    <MarkdownEditor value={contents} onChange={setContents} />
                  </div>
                </div>

                <div className="row g-0 mb-2 border">
                  <label
                    htmlFor="is_notice"
                    className="col-sm-2 col-form-label bg-secondary text-white ps-2"
                  >
                    * 고정 여부
                  </label>
                  <div className="col-sm-10 p-2">
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="is_notice_y"
                        name="is_notice"
                        className="form-check-input"
                        value="Y"
                        defaultChecked={detail?.is_notice === "Y"}
                      />
                      <label className="form-check-label" htmlFor="is_notice_y">
                        예
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="is_notice_n"
                        name="is_notice"
                        className="form-check-input"
                        value="N"
                        defaultChecked={detail?.is_notice === "N"}
                      />
                      <label className="form-check-label" htmlFor="is_notice_n">
                        아니오
                      </label>
                    </div>
                  </div>
                </div>

                <div className="row g-0 mb-2 border">
                  <label
                    htmlFor="is_view"
                    className="col-sm-2 col-form-label bg-secondary text-white ps-2"
                  >
                    * 노출 여부
                  </label>
                  <div className="col-sm-10 p-2">
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

                <div className="row g-0 mb-2 border-0 ">
                  <label
                    htmlFor="deploy_date"
                    className="col-sm-2 col-form-label bg-secondary text-white ps-2"
                  >
                    * 배포일자
                  </label>
                  <div className="col-sm-3 px-2">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control rounded-0 date"
                        id="deploy_date"
                        name="deploy_date"
                        placeholder="배포일자 예)YYYY-MM-DD H:i:s"
                        data-mask-format="0000-00-00 00:00:00"
                        value={deployDate}
                        onChange={(e) => setDeployDate(applyMask(e.target.value, DATETIME_MASK))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="text-end">
                <button type="submit" className="btn btn-primary shadow-none">
                  공지사항 저장
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
