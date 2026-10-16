"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { postMemberAddress, type MemberAddress } from "@entities/mypage-address";
import { openDaumPostcode } from "@shared/lib/daum-postcode";

interface AddressFormProps {
  data: MemberAddress;
}

/** 연락처 자동 하이픈 포맷 (legacy phone input 이벤트 로직 그대로). */
function formatPhone(raw: string): string {
  const value = raw.replace(/[^0-9]/g, "");
  if (value.startsWith("02")) {
    if (value.length < 6) return value.replace(/(\d{2})(\d{0,3})/, "$1-$2");
    if (value.length < 10) return value.replace(/(\d{2})(\d{3})(\d{0,4})/, "$1-$2-$3");
    return value.slice(0, 10).replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  if (value.startsWith("0")) {
    if (value.length < 7) return value.replace(/(\d{3})(\d{0,3})/, "$1-$2");
    if (value.length < 11) return value.replace(/(\d{3})(\d{3})(\d{0,4})/, "$1-$2-$3");
    return value.slice(0, 11).replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  return value;
}

/**
 * 배송지 폼 (legacy `pc/mypage/mypage_address.html`). getMemberAddress 프리필.
 * 우편번호 찾기(Daum Postcode) + 전화 자동포맷 + 저장(alert만, 새로고침 없음 — legacy reload 주석).
 * 돌아가기는 legacy에서 핸들러 없음(무동작). LoadingOverlay는 제출 중 버튼 disabled로 대체.
 */
export function AddressForm({ data }: AddressFormProps) {
  const [form, setForm] = useState<MemberAddress>(data);
  const [submitting, setSubmitting] = useState(false);
  const addressDetailRef = useRef<HTMLInputElement>(null);

  const setField = (key: keyof MemberAddress, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleFindZipcode = async () => {
    const result = await openDaumPostcode();
    setForm((prev) => ({ ...prev, zipcode: result.zonecode, address: result.address }));
    addressDetailRef.current?.focus();
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) =>
    setField("phone", formatPhone(e.target.value));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.zipcode === "") {
      alert("주소를 입력하셔야 합니다.");
      return;
    }
    if (form.address === "") {
      alert("주소를 입력하셔야 합니다.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await postMemberAddress(form);
      alert(res.error_msg);
    } catch {
      alert("주소 변경 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form name="addressFrm" id="addressFrm" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name" className="col-form-label">
          수령인
        </label>
        <div className="">
          <input
            type="text"
            className="form-control"
            name="name"
            id="name"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="address" className="control-label">
          주소
        </label>
        <div className="">
          <div className="form-inline">
            <input
              type="text"
              className="form-control"
              name="zipcode"
              id="zipcode"
              placeholder="우편번호"
              maxLength={5}
              readOnly
              value={form.zipcode}
            />
            <button
              type="button"
              className="btn btn-primary"
              id="btn_zipcode"
              onClick={handleFindZipcode}
            >
              우편번호 찾기
            </button>
          </div>
          <br />
          <input
            type="text"
            className="form-control"
            name="address"
            id="address"
            placeholder="주소"
            readOnly
            value={form.address}
          />
          <br />
          <input
            type="text"
            className="form-control"
            name="address_detail"
            id="address_detail"
            placeholder="상세주소"
            ref={addressDetailRef}
            value={form.address_detail}
            onChange={(e) => setField("address_detail", e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="phone" className="control-label">
          연락처
        </label>
        <div className="">
          <input
            type="text"
            className="form-control"
            name="phone"
            id="phone"
            value={form.phone}
            onChange={handlePhoneChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="message" className="control-label">
          배송메세지
        </label>
        <div className="">
          <input
            type="text"
            className="form-control"
            name="message"
            id="message"
            value={form.message}
            onChange={(e) => setField("message", e.target.value)}
          />
        </div>
      </div>

      <div className="form-group form-actions" style={{ background: "none" }}>
        <div className="col-sm-1" style={{ margin: "0px", padding: "0px" }}>
          <button type="button" className="btn btn btn-danger" id="btn_cancel">
            돌아가기
          </button>
        </div>
        <div className="col-sm-11 text-center">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            정보 수정
          </button>
        </div>
      </div>
    </form>
  );
}
