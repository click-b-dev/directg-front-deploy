"use client";

import { useState, type FormEvent } from "react";

import { postCouponRegister } from "@entities/mypage-coupon";

/**
 * 쿠폰 등록 폼 (legacy `pc/mypage/mypage_coupon.html` coupon_form).
 * 정규식 검증 후 AJAX 등록. 성공 시 alert + reload.
 */
export function CouponRegisterForm() {
  const [couponNumber, setCouponNumber] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = couponNumber.trim();
    const couponCheck = /^(([a-zA-z0-9]{4})-?){4}$/gm;
    if (!couponCheck.test(value)) {
      window.alert("인증번호의 길이를 확인해주세요.");
      return;
    }
    try {
      const data = await postCouponRegister(value);
      if (data.result === "성공") {
        window.alert(
          "포인트가 지급되었습니다. 자세한 내역은 마이페이지 > 포인트 에서 확인 가능합니다.",
        );
        window.location.reload();
      } else {
        window.alert(data.result);
      }
    } catch {
      window.alert("오류");
    }
  };

  return (
    <div className="col-12 mb-5">
      <div className="card shadow-none rounded-0">
        <div className="card-header font-16 bg-card py-3">쿠폰등록</div>
        <div className="card-body p-3 overflow-auto">
          <form
            name="coupon_form"
            id="coupon_form"
            method="post"
            action="mypage_coupon_proc.php"
            onSubmit={handleSubmit}
          >
            <div className="input-group mb-3 input-group-lg">
              <span className="input-group-text rounded-0" id="coupon_num">
                쿠폰번호
              </span>
              <input
                type="text"
                name="coupon_number"
                id="coupon_number"
                className="form-control"
                aria-describedby="coupon_num"
                value={couponNumber}
                onChange={(e) => setCouponNumber(e.target.value)}
              />
              <button className="btn btn-dark rounded-0" type="submit" id="coupon_submit">
                쿠폰등록
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
