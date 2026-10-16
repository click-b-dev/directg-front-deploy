import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  useDataroomDetail,
  useCreateDataroom,
  useUpdateDataroom,
  type DataroomDetail,
  type DataroomSaveRequest,
} from "@entities/dataroom";
import { MarkdownEditor } from "@shared/ui";
import { applyMask } from "@shared/lib/input-mask";

export type DataroomRegisterSearch = {
  mode: string;
  idx: number;
};

const DATE_MASK = "0000-00-00"; // legacy data-mask-format(날짜만)

// legacy board/dataroom_register.php — 자료실 파일 등록/수정 겸용.
export const DataroomRegisterScreen = ({ mode, idx }: DataroomRegisterSearch) => {
  const isModify = mode === "modify" && idx > 0;
  const { data } = useDataroomDetail(idx, { enabled: isModify });

  useEffect(() => {
    document.title = "자료실 파일 등록";
  }, []);

  if (isModify && !data) {
    return null;
  }

  return (
    <DataroomForm
      isModify={isModify}
      idx={idx}
      mode={isModify ? "modify" : "register"}
      detail={isModify ? data : undefined}
    />
  );
};

const RADIO = (name: string, checked: boolean, value: string, id: string, label: string) => (
  <div className="form-check form-check-inline" key={id}>
    <input
      type="radio"
      id={id}
      name={name}
      className="form-check-input"
      value={value}
      defaultChecked={checked}
    />
    <label className="form-check-label" htmlFor={id}>
      {label}
    </label>
  </div>
);

const DataroomForm = ({
  isModify,
  idx,
  mode,
  detail,
}: {
  isModify: boolean;
  idx: number;
  mode: string;
  detail?: DataroomDetail;
}) => {
  const navigate = useNavigate();
  const createMutation = useCreateDataroom();
  const updateMutation = useUpdateDataroom();

  const [contents, setContents] = useState(detail?.contents ?? "");
  const [deployDate, setDeployDate] = useState(detail?.deploy_date ?? "");
  const thumbnailRef = useRef<HTMLInputElement>(null);

  // register 기본: 노출여부 N(숨김). modify는 저장값.
  const isViewChecked = (value: string) => (detail ? detail.is_view === value : value === "N");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const get = (name: string) => String(fd.get(name) ?? "");
    const payload: DataroomSaveRequest = {
      file_type: get("file_type"),
      file_name: get("file_name"),
      file_url: get("file_url"),
      is_encode: get("is_encode"),
      encode_type: get("encode_type"),
      is_free: get("is_free"),
      is_view: get("is_view"),
      deploy_date: deployDate,
      contents,
      thumbnail: thumbnailRef.current?.files?.[0]?.name ?? "",
    };
    if (isModify) {
      // legacy: go("dataroom_view.php?idx="). #123 미이관 시 404(정상).
      updateMutation.mutate(
        { idx, payload },
        { onSuccess: () => window.location.assign(`/board/dataroom_view?idx=${idx}`) },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate({ to: "/board/dataroom_file", search: { page: 1 } }),
      });
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
                    자료실 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">자료실 파일 등록</li>
              </ol>
            </div>
            <h4 className="page-title">자료실 파일 등록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-8">
          <form
            encType="multipart/form-data"
            id="frm"
            name="frm"
            method="post"
            className="form-horizontal"
            onSubmit={handleSubmit}
          >
            {/* legacy: mode/idx가 type="text"(visible quirk) */}
            <input type="text" name="mode" defaultValue={mode} />
            <input type="text" name="idx" defaultValue={isModify ? idx : ""} />
            <div className="card">
              <div className="card-body p-2">
                <div className="row g-0 mb-2 border">
                  <label className="col-sm-2 col-form-label bg-secondary text-white ps-2">
                    * 파일유형
                  </label>
                  <div className="col-sm-10 p-2">
                    {RADIO("file_type", detail?.file_type === "P", "P", "file_type1", "한글패치")}
                    {RADIO("file_type", detail?.file_type === "C", "C", "file_type2", "컨텐츠")}
                  </div>
                </div>

                <div className="row g-0 mb-2 border-0">
                  <label
                    htmlFor="file_name"
                    className="col-sm-2 col-form-label bg-secondary text-white ps-2"
                  >
                    * 제공 파일명
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control rounded-0"
                      id="file_name"
                      name="file_name"
                      defaultValue={detail?.file_name ?? ""}
                    />
                  </div>
                </div>

                <div className="row g-0 mb-2 border-0">
                  <label
                    htmlFor="file_url"
                    className="col-sm-2 col-form-label bg-secondary text-white ps-2"
                  >
                    * 제공 파일 URL
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control rounded-0"
                      id="file_url"
                      name="file_url"
                      defaultValue={detail?.file_url ?? ""}
                    />
                  </div>
                </div>

                <div className="row g-0 mb-2 border">
                  <label className="col-sm-2 col-form-label bg-secondary text-white ps-2">
                    * 암호화 여부
                  </label>
                  <div className="col-sm-10 p-2">
                    {RADIO("is_encode", detail?.is_encode === "Y", "Y", "is_encode_y", "Y")}
                    {RADIO("is_encode", detail?.is_encode === "N", "N", "is_encode_n", "N")}
                  </div>
                </div>

                <div className="row g-0 mb-2 border">
                  <label className="col-sm-2 col-form-label bg-secondary text-white ps-2">
                    * 암호화 방식
                  </label>
                  <div className="col-sm-10 p-2">
                    {RADIO(
                      "encode_type",
                      detail?.encode_type === "base64",
                      "base64",
                      "encode_type_1",
                      "base64",
                    )}
                    {RADIO(
                      "encode_type",
                      detail?.encode_type === "md5",
                      "md5",
                      "encode_type_2",
                      "md5",
                    )}
                    {RADIO(
                      "encode_type",
                      detail?.encode_type === "N",
                      "N",
                      "encode_type_3",
                      "없음",
                    )}
                  </div>
                </div>

                <div className="row g-0 mb-2 border">
                  <label className="col-sm-2 col-form-label bg-secondary text-white ps-2">
                    * 제공조건
                  </label>
                  <div className="col-sm-10 p-2">
                    {RADIO("is_free", detail?.is_free === "Y", "Y", "is_free_y", "무료")}
                    {RADIO("is_free", detail?.is_free === "N", "N", "is_free_n", "유료")}
                  </div>
                </div>

                <div className="row g-0 mb-2 border">
                  <label className="col-sm-2 col-form-label bg-secondary text-white ps-2">
                    * 노출여부
                  </label>
                  <div className="col-sm-10 p-2">
                    {RADIO("is_view", isViewChecked("Y"), "Y", "is_view_y", "노출")}
                    {RADIO("is_view", isViewChecked("N"), "N", "is_view_n", "숨김")}
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
                        placeholder="예)YYYY-MM-DD"
                        data-mask-format="0000-00-00"
                        value={deployDate}
                        onChange={(e) => setDeployDate(applyMask(e.target.value, DATE_MASK))}
                      />
                    </div>
                  </div>
                </div>

                <div className="row g-0 mb-2 border-0">
                  <label
                    htmlFor="thumbnail"
                    className="col-sm-2 col-form-label bg-secondary text-white ps-2"
                  >
                    썸네일
                  </label>
                  <div className="col-sm-10">
                    <input
                      ref={thumbnailRef}
                      type="file"
                      className="form-control rounded-0"
                      id="thumbnail"
                      name="thumbnail"
                    />
                  </div>
                  {isModify && detail?.thumbnail && (
                    <div className="col-sm-12 mt-2 text-center">
                      <img src={`/upload/dataroom/${detail.thumbnail}`} />
                      <br />
                      {detail.thumbnail}
                    </div>
                  )}
                </div>

                <div className="row g-0 mb-2 border-0">
                  <label className="col-sm-2 col-form-label bg-secondary text-white ps-2">
                    설명
                  </label>
                  <div className="col-sm-10">
                    <MarkdownEditor value={contents} onChange={setContents} />
                  </div>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="text-end">
                <button type="submit" className="btn btn-primary shadow-none">
                  자료실 파일 저장
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
