"use client";

import { useState, useTransition, type FormEvent } from "react";

import {
  postCouponRegister,
  type MypageCouponList,
  type MypageCouponRow,
} from "@entities/mypage-coupon";

import { loadMoreCoupons } from "../api/load-more-coupons";

/** legacy `mypage_coupon.html` head `<style>`(₩ 접두). */
const COUPON_CSS = `
.won::before {
	content: "\\20a9";
}
`;

/**
 * 모바일 마이페이지 - 쿠폰 내역 (legacy `mobile/mypage/mypage_coupon.html`).
 * 커스텀 bg-primary 헤더 + 쿠폰등록 폼(regex+AJAX, 성공 시 reload) + 쿠폰내역 표 + "더보기" 증분.
 * 세션 가드·초기 조회는 라우트. getMypageCoupons·postCouponRegister 재사용.
 */
export function MobileMypageCouponScreen({ data }: { data: MypageCouponList }) {
  const [items, setItems] = useState<MypageCouponRow[]>(data.list);
  const [dataPage, setDataPage] = useState(1);
  const [couponNumber, setCouponNumber] = useState("");
  const [isPending, startTransition] = useTransition();

  const isLast = dataPage >= data.totalPages;

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = couponNumber.trim();
    // legacy regex(A-z 오타 quirk) verbatim.
    const couponCheck = new RegExp(/^(([a-zA-z0-9]{4})-?){4}$/gm);
    if (!couponCheck.test(value)) {
      window.alert("인증번호의 길이를 확인해주세요.");
      return;
    }
    try {
      const res = await postCouponRegister(value);
      if (res.result === "성공") {
        window.alert(
          "포인트가 지급되었습니다. 자세한 내역은 마이페이지 > 포인트 에서 확인 가능합니다.",
        );
        window.location.reload();
      } else {
        window.alert(res.result);
      }
    } catch {
      window.alert("오류");
    }
  };

  const handleMore = () => {
    const nextPage = dataPage + 1;
    startTransition(async () => {
      const more = await loadMoreCoupons(nextPage);
      setItems((prev) => [...prev, ...more]);
      setDataPage(nextPage);
    });
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: COUPON_CSS }} />
      <div className="appHeader bg-primary text-light">
        <div className="left">
          <a
            href="#"
            className="headerButton goBack"
            onClick={(e) => {
              e.preventDefault();
              handleGoBack();
            }}
          >
            <ion-icon name="chevron-back-outline"></ion-icon>
          </a>
        </div>
        <div className="pageTitle">쿠폰 내역</div>
        <div className="right"></div>
      </div>
      <div id="appCapsuleSub">
        <div className="section pt-2 full">
          <div className="section-title">쿠폰등록</div>
          <div className="wide-block pb-1 pt-0">
            <form
              method="post"
              className=""
              id="coupon_form"
              name="coupon_form"
              action="mypage_coupon_proc.php"
              onSubmit={handleRegister}
            >
              <div className="form-group boxed">
                <div className="input-wrapper">
                  <label htmlFor="coupon_number" className="form-label">
                    쿠폰번호
                  </label>
                  <input
                    type="text"
                    id="coupon_number"
                    name="coupon_number"
                    className="form-control"
                    value={couponNumber}
                    onChange={(e) => setCouponNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  id="coupon_submit"
                  name="coupon_submit"
                >
                  쿠폰등록
                </button>
              </div>
            </form>
          </div>
          <div className="section-title">쿠폰내역</div>
          <div className="wide-block pb-1 pt-2">
            <table className="table table-light table-bordered table-centered mb-1 text-center align-middle">
              <thead className="align-middle table-dark">
                <tr>
                  <th>등록일</th>
                  <th className="w-50">사유</th>
                  <th>포인트</th>
                </tr>
              </thead>
              <tbody id="coupon_table_body">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      쿠폰 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  items.map((row, index) => (
                    <tr key={index}>
                      <td>{row.regdt}</td>
                      <td className="text-start">{row.coupon_name}</td>
                      <td>
                        <div className="d-flex justify-content-between">
                          <span className="won font-13"></span>
                          <span className="amount text-nowrap font-13">
                            {row.coupon_price.toLocaleString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="col-12">
            <input
              type="button"
              className={`btn ${isLast ? "btn-secondary" : "btn-primary"} btn-lg btn-block`}
              value={isLast ? "마지막 페이지" : "더보기"}
              name="btn_more"
              id="btn_more"
              data-page={dataPage}
              onClick={handleMore}
              disabled={isPending}
            />
          </div>
        </div>
      </div>
    </>
  );
}
