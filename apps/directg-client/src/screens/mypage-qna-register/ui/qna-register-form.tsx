"use client";

import { useState, type FormEvent } from "react";

import { postMypageQnaRegister } from "@entities/mypage-qna";

/** 문의 구분 옵션 (legacy select 순서 그대로). */
const GUBUN_OPTIONS: { value: string; label: string }[] = [
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

/**
 * 문의 등록 폼 (legacy `pc/mypage/mypage_qna_register.html`).
 * multipart 제출 → alert(error_msg) + reload. `$.LoadingOverlay`는 제출 중 버튼 disabled로 재현.
 */
export function QnaRegisterForm() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const data = await postMypageQnaRegister(formData);
      alert(data.error_msg);
      window.location.reload();
    } catch (error) {
      setSubmitting(false);
      alert("고객문의 등록 중 오류가 발생했습니다. " + String(error));
    }
  };

  return (
    <div className="col-12">
      <form id="frm" name="frm" onSubmit={handleSubmit}>
        <div className="card mb-0 shadow-none rounded-0">
          <div className="card-body">
            <div className="row mb-3">
              <label htmlFor="gubun" className="col-2 align-content-center text-center">
                문의 구분
              </label>
              <div className="col-10 p-2">
                <select name="gubun" id="gubun" className="form-control rounded-0 font-14" required>
                  <option value="">:::선택:::</option>
                  {GUBUN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row mb-3">
              <label htmlFor="subject" className="col-2 align-content-center text-center">
                제목
              </label>
              <div className="col-10">
                <input
                  type="text"
                  className="form-control rounded-0 font-14"
                  id="subject"
                  name="subject"
                  required
                />
              </div>
            </div>

            <div className="row mb-3">
              <label htmlFor="contents" className="col-2 align-content-center text-center">
                내용
              </label>
              <div className="col-10">
                <textarea
                  id="contents"
                  name="contents"
                  className="form-control rounded-0 font-14"
                  rows={10}
                ></textarea>
              </div>
            </div>

            {[1, 2, 3].map((i) => (
              <div className="row mb-3" key={i}>
                <label
                  htmlFor={`upload_file_${i}`}
                  className="col-2 align-content-center text-center"
                >
                  첨부파일 {i}
                </label>
                <div className="col-10">
                  <input
                    type="file"
                    className="form-control rounded-0 font-14"
                    id={`upload_file_${i}`}
                    name="upload_file[]"
                  />
                  첨부파일은 최대 2MB입니다. (사용가능 파일 형식 - jpg / gif / png )
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="row">
          <div className="text-center">
            <button
              type="submit"
              className="btn btn-primary btn-lg shadow-none m-3"
              disabled={submitting}
            >
              확인
            </button>
            <a href="./mypage_qna" className="btn btn-danger btn-lg shadow-none m-3">
              취소
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
