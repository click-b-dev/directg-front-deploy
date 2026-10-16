import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  searchBannerLink,
  useCreateMainBanner,
  type BannerFlag,
  type CreateMainBannerRequest,
} from "@entities/main-banner";
import { DATETIME_MASK, applyMask } from "@shared/lib/input-mask";

// legacy banner_register.php — 메인배너 등록 폼.
export const BannerRegisterScreen = () => {
  const navigate = useNavigate();
  const createMutation = useCreateMainBanner();

  // legacy: bannerPeriodOutputFl 기본 Y(기간노출). N이면 날짜 숨김.
  const [period, setPeriod] = useState<BannerFlag>("Y");
  // legacy 버그 이식: 날짜 required는 초기엔 미설정(HTML에 required 없음), 라디오 change 후에만 설정.
  const [periodTouched, setPeriodTouched] = useState(false);
  // legacy input-mask("0000-00-00 00:00:00") 재현 — 입력 시 자동 포맷.
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const productCodeRef = useRef<HTMLInputElement>(null);
  const bannerLinkRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "메인배너 등록";
  }, []);

  const handlePeriodChange = (value: BannerFlag) => {
    setPeriod(value);
    setPeriodTouched(true);
  };

  // legacy #btn_banner_link_auto: 빈 코드 alert, 아니면 링크 자동생성 → banner_link에 반영.
  const handleLinkAuto = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const productCode = productCodeRef.current?.value ?? "";
    if (productCode === "") {
      window.alert("옵션상품코드를 입력해 주세요");
      return;
    }
    const { banner_link } = await searchBannerLink(productCode);
    if (bannerLinkRef.current) {
      bannerLinkRef.current.value = banner_link;
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const get = (name: string) => String(fd.get(name) ?? "");
    const payload: CreateMainBannerRequest = {
      banner_title: get("banner_title"),
      banner_pc: get("banner_pc"),
      banner_mobile: get("banner_mobile"),
      product_code: get("product_code"),
      banner_publisher: get("banner_publisher"),
      banner_link: get("banner_link"),
      banner_target: get("banner_target"),
      banner_start: get("banner_start"),
      banner_end: get("banner_end"),
      banner_sort: get("banner_sort"),
      flag: get("flag") === "Y" ? "Y" : "N",
      bannerPeriodOutputFl: get("bannerPeriodOutputFl") === "N" ? "N" : "Y",
      show_prod_info: get("show_prod_info"),
      show_sale_info: get("show_sale_info"),
    };
    // legacy: register 성공 → banner_list.php 리다이렉트(쿼리 없음 = page 1, 필터 없음).
    createMutation.mutate(payload, {
      onSuccess: () =>
        navigate({
          to: "/site/banner_list",
          search: { page: 1, search_banner_title: "", search_flag: "" },
        }),
    });
  };

  const dateRequired = periodTouched && period === "Y";

  return (
    <>
      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                {/* legacy: href="javascript: void(0);" (비동작) → 관례상 preventDefault */}
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    사이트
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    사이트 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">메인배너 등록</li>
              </ol>
            </div>
            <h4 className="page-title">메인배너 등록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-9">
          <div className="card">
            <div className="card-body">
              <form id="bannerFrm" name="bannerFrm" onSubmit={handleSubmit}>
                <input type="hidden" name="mode" value="register" />
                <div className="mb-2 row">
                  <label htmlFor="banner_title" className="col-sm-2 col-form-label bg-light">
                    * 메인배너 제목
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      id="banner_title"
                      name="banner_title"
                      className="form-control"
                      placeholder="메인배너 제목"
                      required
                    />
                  </div>
                </div>
                <div className="mb-2 row">
                  <label htmlFor="banner_pc" className="col-sm-2 col-form-label bg-light">
                    * 메인배너 PC URL
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      id="banner_pc"
                      name="banner_pc"
                      className="form-control"
                      placeholder="디스크엔 이미지 URL"
                      required
                    />
                  </div>
                </div>
                <div className="mb-2 row">
                  <label htmlFor="banner_mobile" className="col-sm-2 col-form-label bg-light">
                    * 메인배너 모바일 URL
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      id="banner_mobile"
                      name="banner_mobile"
                      className="form-control"
                      placeholder="디스크엔 이미지 URL"
                      required
                    />
                  </div>
                </div>

                <div className="mb-2 row">
                  <label htmlFor="product_code" className="col-sm-2 col-form-label bg-light">
                    옵션상품코드
                  </label>
                  <div className="col-sm-10">
                    <div className="row">
                      <div className="col-sm-4">
                        <input
                          ref={productCodeRef}
                          type="text"
                          id="product_code"
                          name="product_code"
                          className="form-control"
                          placeholder="옵션상품코드"
                          maxLength={8}
                        />
                      </div>
                      <div className="col-sm-3">
                        <button
                          type="button"
                          className="btn btn-light shadow-none border"
                          id="btn_banner_link_auto"
                          onClick={handleLinkAuto}
                        >
                          링크 URL 자동생성
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-2 row">
                  <label htmlFor="banner_link" className="col-sm-2 col-form-label bg-light">
                    * 메인배너 링크 URL
                  </label>
                  <div className="col-sm-10">
                    <div className="row">
                      <div className="input-group">
                        <div className="col-sm-10">
                          <input
                            ref={bannerLinkRef}
                            type="text"
                            id="banner_link"
                            name="banner_link"
                            className="form-control"
                            placeholder="메인배너 링크 URL"
                            required
                          />
                        </div>
                        <div className="col-sm-2">
                          <select
                            id="banner_target"
                            name="banner_target"
                            className="form-select"
                            defaultValue=""
                            required
                          >
                            <option value="">:::타겟선택:::</option>
                            <option value="_self">현재창</option>
                            <option value="_blank">새창</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-2 row">
                  <label htmlFor="banner_publisher" className="col-sm-2 col-form-label bg-light">
                    * 메인배너 퍼블리셔
                  </label>
                  <div className="col-sm-6">
                    <input
                      type="text"
                      id="banner_publisher"
                      name="banner_publisher"
                      className="form-control"
                      placeholder="메인배너 퍼블리셔"
                      required
                    />
                  </div>
                </div>

                <div className="mb-2 row">
                  <label htmlFor="flag" className="col-sm-2 col-form-label bg-light">
                    * 메인배너 노출여부
                  </label>
                  <div className="col-sm-6">
                    <div className="form-check form-check-inline mt-1">
                      <input
                        type="radio"
                        id="flag_y"
                        name="flag"
                        className="form-check-input"
                        value="Y"
                      />
                      <label className="form-check-label" htmlFor="flag_y">
                        예
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="flag_n"
                        name="flag"
                        className="form-check-input"
                        value="N"
                        defaultChecked
                      />
                      <label className="form-check-label" htmlFor="flag_n">
                        아니오
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-2 row">
                  <label htmlFor="banner_date" className="col-sm-2 col-form-label bg-light">
                    * 메인배너 기간
                  </label>
                  <div className="col-sm-6">
                    <div className="row mb-2">
                      <div className="col-sm-12">
                        <div className="form-check form-check-inline mt-1">
                          <input
                            type="radio"
                            id="bannerPeriodOutputFl_n"
                            name="bannerPeriodOutputFl"
                            className="form-check-input"
                            value="N"
                            checked={period === "N"}
                            onChange={() => handlePeriodChange("N")}
                          />
                          <label className="form-check-label" htmlFor="bannerPeriodOutputFl_n">
                            상시노출
                          </label>
                        </div>
                        <div className="form-check form-check-inline mt-1">
                          <input
                            type="radio"
                            id="bannerPeriodOutputFl_y"
                            name="bannerPeriodOutputFl"
                            className="form-check-input"
                            value="Y"
                            checked={period === "Y"}
                            onChange={() => handlePeriodChange("Y")}
                          />
                          <label className="form-check-label" htmlFor="bannerPeriodOutputFl_y">
                            기간노출
                          </label>
                        </div>
                      </div>
                    </div>
                    <div
                      className="row"
                      id="bannerPeriodDate"
                      style={{ display: period === "N" ? "none" : undefined }}
                    >
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          id="banner_start"
                          name="banner_start"
                          placeholder="메인배너 시작일자"
                          data-toggle="input-mask"
                          data-mask-format="0000-00-00 00:00:00"
                          value={startDate}
                          onChange={(event) =>
                            setStartDate(applyMask(event.target.value, DATETIME_MASK))
                          }
                          required={dateRequired}
                        />
                        <span className="input-group-text">~</span>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          id="banner_end"
                          name="banner_end"
                          placeholder="메인배너 종료일자"
                          data-toggle="input-mask"
                          data-mask-format="0000-00-00 00:00:00"
                          value={endDate}
                          onChange={(event) =>
                            setEndDate(applyMask(event.target.value, DATETIME_MASK))
                          }
                          required={dateRequired}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-2 row">
                  <label htmlFor="banner_sort" className="col-sm-2 col-form-label bg-light">
                    * 메인배너 순서
                  </label>
                  <div className="col-sm-2">
                    <input
                      type="text"
                      id="banner_sort"
                      name="banner_sort"
                      className="form-control"
                      placeholder="메인배너 순서"
                      required
                    />
                  </div>
                </div>

                <div className="mb-2 row">
                  <label htmlFor="show_prod_info" className="col-sm-2 col-form-label bg-light">
                    * 상품정보 노출여부
                    <br />
                    <small className="text-muted">(라벨, 상품명)</small>
                  </label>
                  <div className="col-sm-6">
                    <div className="form-check form-check-inline mt-1">
                      <input
                        type="radio"
                        id="show_prod_info1"
                        name="show_prod_info"
                        className="form-check-input"
                        value="Y"
                      />
                      <label className="form-check-label" htmlFor="show_prod_info1">
                        예
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="show_prod_info2"
                        name="show_prod_info"
                        className="form-check-input"
                        value="N"
                      />
                      <label className="form-check-label" htmlFor="show_prod_info2">
                        아니오
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-2 row">
                  <label htmlFor="show_sale_info" className="col-sm-2 col-form-label bg-light">
                    * 판매정보 노출여부
                    <br />
                    <small className="text-muted">(퍼블리셔, 가격, 출시일)</small>
                  </label>
                  <div className="col-sm-6">
                    <div className="form-check form-check-inline mt-1">
                      <input
                        type="radio"
                        id="show_sale_info1"
                        name="show_sale_info"
                        className="form-check-input"
                        value="Y"
                      />
                      <label className="form-check-label" htmlFor="show_sale_info1">
                        예
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="show_sale_info2"
                        name="show_sale_info"
                        className="form-check-input"
                        value="N"
                      />
                      <label className="form-check-label" htmlFor="show_sale_info2">
                        아니오
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-2 row">
                  <div className="text-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      메인배너 저장
                    </button>
                  </div>
                </div>
              </form>
            </div>
            {/* end card-body */}
          </div>
          {/* end card */}
        </div>
        {/* end col */}
      </div>
    </>
  );
};
