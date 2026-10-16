import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useFaqDetail, useUpdateFaq, type FaqDetail, type FaqSaveRequest } from "@entities/faq";
import { MarkdownEditor } from "@shared/ui";

export type FaqRegisterSearch = {
  mode: string; // legacy GET mode(register/modify). 사이드바 등록 링크는 mode 없음.
  idx: number;
};

// legacy faq_register.php 구분 btn-group — 목록(#116)과 다른 순서·구성(전체 없음, 16개).
const FAQ_TYPE_BUTTONS: { value: string; id: string; label: string }[] = [
  { value: "S01", id: "item_cd_1", label: "이용방법" },
  { value: "M01", id: "item_cd_2", label: "계정, 회원" },
  { value: "O01", id: "item_cd_3", label: "주문, 결제" },
  { value: "O03", id: "item_cd_4", label: "취소, 환불" },
  { value: "O02", id: "item_cd_5", label: "제품 코드(키)" },
  { value: "S02", id: "item_cd_6", label: "게임 등록" },
  { value: "G02", id: "item_cd_7", label: "구성, DLC" },
  { value: "G03", id: "item_cd_8", label: "특전" },
  { value: "S04", id: "item_cd_9", label: "게임 실행" },
  { value: "S03", id: "item_cd_10", label: "게임 설치" },
  { value: "G04", id: "item_cd_11", label: "한글" },
  { value: "O04", id: "item_cd_12", label: "가격" },
  { value: "G01", id: "item_cd_13", label: "상품" },
  { value: "O05", id: "item_cd_14", label: "할인" },
  { value: "E01", id: "item_cd_15", label: "기타" },
  { value: "M02", id: "item_cd_16", label: "포인트" },
];

// legacy board/faq_register.php — 자주묻는질문 등록(dead)/수정 겸용.
export const FaqRegisterScreen = ({ mode, idx }: FaqRegisterSearch) => {
  const isModify = mode === "modify" && idx > 0;
  const { data } = useFaqDetail(idx, { enabled: isModify });

  useEffect(() => {
    document.title = "자주묻는질문 등록";
  }, []);

  if (isModify && !data) {
    return null;
  }

  return <FaqForm isModify={isModify} idx={idx} mode={mode} detail={isModify ? data : undefined} />;
};

const FaqForm = ({
  isModify,
  idx,
  mode,
  detail,
}: {
  isModify: boolean;
  idx: number;
  mode: string;
  detail?: FaqDetail;
}) => {
  const navigate = useNavigate();
  const updateMutation = useUpdateFaq();

  // MarkdownEditor(easymde)는 상태로 관리(FormData 미포함).
  const [answer, setAnswer] = useState(detail?.answer ?? "");

  const faqTypeChecked = detail?.faq_type ?? "";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // legacy: register(mode 없음/register)는 faq_ps 빈 케이스 → no-op(저장·이동 없음). modify만 동작.
    if (!isModify) {
      return;
    }
    const fd = new FormData(event.currentTarget);
    const get = (name: string) => String(fd.get(name) ?? "");
    const payload: FaqSaveRequest = {
      faq_type: get("faq_type"),
      question: get("question"),
      answer,
    };
    updateMutation.mutate(
      { idx, payload },
      {
        onSuccess: () =>
          navigate({
            to: "/board/faq_list",
            search: { page: 1, search_item_cd: "", search_subject: "" },
          }),
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
                    자주묻는질문 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">자주묻는질문 등록</li>
              </ol>
            </div>
            <h4 className="page-title">자주묻는질문 등록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
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
              <div className="card-body p-2">
                <div className="mb-2 row">
                  <label
                    htmlFor="faq_type"
                    className="col-sm-1 col-form-label bg-secondary text-white"
                  >
                    * 구분
                  </label>
                  <div className="col-sm-11">
                    <div
                      className="btn-group"
                      role="group"
                      aria-label="Basic radio toggle button group"
                    >
                      {FAQ_TYPE_BUTTONS.map((b) => (
                        <FaqTypeButton key={b.id} button={b} selected={faqTypeChecked} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-2 row">
                  <label
                    htmlFor="question"
                    className="col-sm-1 col-form-label bg-secondary text-white"
                  >
                    * 질문
                  </label>
                  <div className="col-sm-11">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="question"
                      name="question"
                      defaultValue={detail?.question ?? ""}
                    />
                  </div>
                </div>

                <div className="mb-2 row">
                  <label
                    htmlFor="answer"
                    className="col-sm-1 col-form-label bg-secondary text-white"
                  >
                    * 답변
                  </label>
                  <div className="col-sm-11">
                    <MarkdownEditor value={answer} onChange={setAnswer} />
                  </div>
                </div>

                <div className="row mb-2">
                  <div className="text-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      자주묻는질문 저장
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const FaqTypeButton = ({
  button,
  selected,
}: {
  button: { value: string; id: string; label: string };
  selected: string;
}) => (
  <>
    <input
      type="radio"
      className="btn-check"
      name="faq_type"
      id={button.id}
      autoComplete="off"
      value={button.value}
      defaultChecked={selected === button.value}
    />
    <label className="btn btn-outline-primary" htmlFor={button.id}>
      {button.label}
    </label>
  </>
);
