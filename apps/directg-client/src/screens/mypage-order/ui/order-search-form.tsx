"use client";

import { Fragment } from "react";

interface OrderSearchFormProps {
  /** 상품명 검색어(legacy `$search_product_name`) — input value 유지. */
  searchProductName: string;
  /** 기간 코드 "0"~"6"(legacy `$search_date`, 기본 "0"). active 버튼 표기용. */
  searchDate: string;
  /** 라디오 라벨 연도 계산 기준(서버 `date('Y')`). */
  currentYear: number;
}

/**
 * 주문 내역 검색 폼 (legacy `#orderFrm`, method=GET). 상품명 input + 기간 라디오 7개.
 * 라디오는 `checked` 없이 label class로만 active 표기(legacy quirk). 클릭 시 폼 submit(legacy jQuery bind).
 */
export function OrderSearchForm({
  searchProductName,
  searchDate,
  currentYear,
}: OrderSearchFormProps) {
  // value 0="최근 6개월", value 1~6=현재년~5년전(legacy: date('Y', -i year), i=0..5).
  const dateOptions = [
    { value: "0", id: "search_date1", label: "최근 6개월" },
    ...Array.from({ length: 6 }, (_, i) => ({
      value: String(i + 1),
      id: `search_date${i + 2}`,
      label: `${currentYear - i}년`,
    })),
  ];

  const submitOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <form id="orderFrm" name="orderFrm" method="GET" className="row mb-3">
      <div className="col-12 mb-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control form-control-lg border-0 rounded-pill shadow-none"
            name="search_product_name"
            id="search_product_name"
            defaultValue={searchProductName}
            placeholder="주문한 상품명을 입력해 주세요."
            autoComplete="off"
          />
          <div className="input-group-append">
            <button className="btn btn-lg shadow-none" type="submit">
              <i className="fa fa-search"></i>
            </button>
          </div>
        </div>
      </div>
      <div className="col-12 mb-3">
        {dateOptions.map((option) => (
          <Fragment key={option.id}>
            <input
              type="radio"
              className="btn-check"
              name="search_date"
              id={option.id}
              value={option.value}
              autoComplete="off"
              onChange={submitOnChange}
            />
            <label
              className={`btn ${searchDate === option.value ? "btn-primary" : "btn-secondary"}`}
              htmlFor={option.id}
            >
              {option.label}
            </label>
          </Fragment>
        ))}
      </div>
    </form>
  );
}
