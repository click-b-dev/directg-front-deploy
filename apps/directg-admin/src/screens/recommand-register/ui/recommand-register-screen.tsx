import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCreateMainRecommand, type CreateMainRecommandRequest } from "@entities/main-recommand";
import { DATETIME_MASK, applyMask } from "@shared/lib/input-mask";

// legacy main_recommand_register.php (register 모드) — 추천/특집 등록 폼.
export const RecommandRegisterScreen = () => {
  const navigate = useNavigate();
  const createMutation = useCreateMainRecommand();

  // legacy input-mask("0000-00-00 00:00:00") 재현 — 입력 시 자동 포맷.
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    document.title = "추천 및 특집 등록";
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const get = (name: string) => String(fd.get(name) ?? "");
    const payload: CreateMainRecommandRequest = {
      recommand_name: get("recommand_name"),
      recommand_start: get("recommand_start"),
      recommand_end: get("recommand_end"),
      recommand_banner: get("recommand_banner"),
      recommand_banner_link: get("recommand_banner_link"),
      recommand_banner_target: get("recommand_banner_target"),
      recommand_goods_1: get("recommand_goods_1"),
      recommand_goods_2: get("recommand_goods_2"),
      recommand_goods_3: get("recommand_goods_3"),
      recommand_goods_4: get("recommand_goods_4"),
      is_view: get("is_view") === "Y" ? "Y" : "N",
    };
    // legacy: register 성공 → main_recommand.php 리다이렉트(쿼리 없음).
    createMutation.mutate(payload, {
      onSuccess: () =>
        navigate({
          to: "/site/main_recommand",
          search: { page: 1, search_recommand_name: "" },
        }),
    });
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
                    추천 및 특집 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">추천 및 특집 등록</li>
              </ol>
            </div>
            <h4 className="page-title">추천 및 특집 등록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-9">
          <form id="frm" name="frm" className="form-horizontal" onSubmit={handleSubmit}>
            <input type="hidden" name="mode" value="register" />
            <input type="hidden" name="idx" value="" />
            <div className="card">
              <div className="card-body">
                <div className="mb-2 row">
                  <label
                    htmlFor="recommand_name"
                    className="col-sm-2 col-form-label bg-secondary text-white"
                  >
                    * 추천 및 특집 제목
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control"
                      id="recommand_name"
                      name="recommand_name"
                      required
                    />
                  </div>
                </div>

                <div className="mb-2 row">
                  <label
                    htmlFor="recommand_date"
                    className="col-sm-2 col-form-label bg-secondary text-white"
                  >
                    * 추천 및 특집 기간
                  </label>
                  <div className="col-sm-6">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="recommand_start"
                        name="recommand_start"
                        placeholder="추천 및 특집 시작일"
                        data-toggle="input-mask"
                        data-mask-format="0000-00-00 00:00:00"
                        value={startDate}
                        onChange={(event) =>
                          setStartDate(applyMask(event.target.value, DATETIME_MASK))
                        }
                        required
                      />
                      <span className="input-group-text">~</span>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="recommand_end"
                        name="recommand_end"
                        placeholder="추천 및 특집 종료일"
                        data-toggle="input-mask"
                        data-mask-format="0000-00-00 00:00:00"
                        value={endDate}
                        onChange={(event) =>
                          setEndDate(applyMask(event.target.value, DATETIME_MASK))
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-2 row">
                  <label
                    htmlFor="recommand_banner"
                    className="col-sm-2 col-form-label bg-secondary text-white"
                  >
                    * 추천 및 특집 배너
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control"
                      id="recommand_banner"
                      name="recommand_banner"
                      placeholder="디스크엔 URL"
                      required
                    />
                  </div>
                </div>

                <div className="mb-2 row">
                  <label
                    htmlFor="recommand_banner_link"
                    className="col-sm-2 col-form-label bg-secondary text-white"
                  >
                    * 추천 및 특집 링크 URL
                  </label>
                  <div className="col-sm-10">
                    <div className="row">
                      <div className="input-group">
                        <div className="col-sm-10">
                          <input
                            type="text"
                            id="recommand_banner_link"
                            name="recommand_banner_link"
                            className="form-control"
                            placeholder="추천 및 특집 배너 링크 URL"
                            required
                          />
                        </div>
                        <div className="col-sm-2">
                          <select
                            id="recommand_banner_target"
                            name="recommand_banner_target"
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
                  <label
                    htmlFor="recommand_goods"
                    className="col-sm-2 col-form-label bg-secondary text-white"
                  >
                    * 추천 및 특집 상품
                  </label>
                  <div className="col-sm-10">
                    <div className="row g-3">
                      {[1, 2, 3, 4].map((slot) => (
                        <div key={slot} className="col-md-3 text-center">
                          <label htmlFor={`recommand_goods_${slot}`} className="form-label">
                            상품 {slot}
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id={`recommand_goods_${slot}`}
                            name={`recommand_goods_${slot}`}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-2 row">
                  <label
                    htmlFor="is_view"
                    className="col-sm-2 col-form-label bg-secondary text-white"
                  >
                    * 추천 및 특집 노출여부
                  </label>
                  <div className="col-sm-10 border p-2">
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="is_view_y"
                        name="is_view"
                        className="form-check-input"
                        value="Y"
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
                      />
                      <label className="form-check-label" htmlFor="is_view_n">
                        아니오
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-2 row">
                  <div className="text-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      추천 및 특집 저장
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
