"use client";

import { type FormEvent } from "react";

import { postMypageQnaRegister } from "@entities/mypage-qna";

/** 문의 구분 옵션 (legacy select 순서 그대로 — 1/2/5/7/6/4/8/9/3). */
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
 * 모바일 문의하기 폼 (legacy `mobile/mypage/mypage_qna_register.html`).
 * multipart 제출 → 성공 alert(error_msg) + reload / 오류 console.log(legacy: alert 주석처리).
 * legacy에 LoadingOverlay·제출 disabled 없음 → 재현하지 않는다(무가드 제출).
 */
export function MobileQnaRegisterForm() {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const data = await postMypageQnaRegister(formData);
      alert(data.error_msg);
      window.location.reload();
    } catch (error) {
      // legacy: error 콜백은 console.log(data)만 (alert 주석처리).
      console.log(error);
    }
  };

  return (
    <form encType="multipart/form-data" id="frm" name="frm" method="post" onSubmit={handleSubmit}>
      <div className="form-group boxed">
        <div className="input-wrapper">
          <label htmlFor="gubun" className="form-label">
            문의구분
          </label>
          <select name="gubun" id="gubun" className="form-control form-select" required>
            <option value="">:::선택:::</option>
            {GUBUN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group boxed">
        <div className="input-wrapper">
          <label htmlFor="subject" className="form-label">
            제목
          </label>
          <input className="form-control" type="text" name="subject" required />
        </div>
      </div>
      <div className="form-group boxed">
        <div className="input-wrapper">
          <label htmlFor="contents" className="form-label">
            문의내용
          </label>
          <textarea
            id="contents"
            name="contents"
            rows={4}
            className="form-control"
            placeholder="내용"
            required
          ></textarea>
          <i className="clear-input">
            <ion-icon name="close-circle" role="img" className="md hydrated"></ion-icon>
          </i>
        </div>
      </div>
      <div className="form-group boxed">
        <div className="input-wrapper">
          <label htmlFor="upload_file" className="form-label">
            첨부파일
          </label>
          <input type="file" className="form-control" id="upload_file" name="upload_file[]" />
        </div>
      </div>
      <div className="mt-1">
        <button type="submit" className="btn btn-primary btn-lg btn-block">
          문의하기
        </button>
      </div>
    </form>
  );
}
