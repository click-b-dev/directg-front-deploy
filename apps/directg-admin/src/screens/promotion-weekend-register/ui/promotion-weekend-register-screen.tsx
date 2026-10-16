import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  usePromotionWeekendDetail,
  useCreatePromotionWeekend,
  useUpdatePromotionWeekend,
  type PromotionWeekendRegisterSearch,
  type PromotionWeekendDetail,
  type PromotionWeekendSaveRequest,
} from "@entities/promotion";
import { DATETIME_MASK, applyMask } from "@shared/lib/input-mask";

const RECOMMAND_COUNT = 4;
const BEST_COUNT = 10;

// legacy promotion/promotion_weekend_register.php — 주말특가 등록/수정 겸용.
export const PromotionWeekendRegisterScreen = ({ idx }: PromotionWeekendRegisterSearch) => {
  const isModify = idx > 0; // legacy: if($idx>0){ $mode="modify"; }
  const { data } = usePromotionWeekendDetail(idx, { enabled: isModify });

  if (isModify && !data) {
    return null;
  }

  return (
    <PromotionWeekendForm isModify={isModify} idx={idx} detail={isModify ? data : undefined} />
  );
};

const PromotionWeekendForm = ({
  isModify,
  idx,
  detail,
}: {
  isModify: boolean;
  idx: number;
  detail?: PromotionWeekendDetail;
}) => {
  const navigate = useNavigate();
  const createMutation = useCreatePromotionWeekend();
  const updateMutation = useUpdatePromotionWeekend();

  // 기간은 input-mask 상태 관리(FormData 별도).
  const [start, setStart] = useState(detail?.promotion_week_start ?? "");
  const [end, setEnd] = useState(detail?.promotion_week_end ?? "");

  const mode = isModify ? "modify" : "register";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const get = (name: string) => String(fd.get(name) ?? "");
    const payload: PromotionWeekendSaveRequest = {
      promotion_week_name: get("promotion_week_name"),
      promotion_week_start: start,
      promotion_week_end: end,
      promotion_week_banner_link: get("promotion_week_banner_link"),
      recommand: Array.from({ length: RECOMMAND_COUNT }, (_, i) =>
        get(`promotion_week_recommand_${i + 1}`),
      ),
      best: Array.from({ length: BEST_COUNT }, (_, i) => get(`promotion_week_best_${i + 1}`)),
      is_view: get("is_view"),
    };
    // legacy: 저장 → go("promotion_weekend.php") (쿼리 없음 = page 1)
    const onSuccess = () =>
      navigate({
        to: "/promotion/promotion_weekend",
        search: { page: 1, search_key: "", search_value: "" },
      });
    if (isModify) {
      updateMutation.mutate({ idx, payload }, { onSuccess });
    } else {
      createMutation.mutate(payload, { onSuccess });
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
                    프로모션
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    주말특가 프로모션 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">주말특가 프로모션 등록</li>
              </ol>
            </div>
            <h4 className="page-title">주말특가 프로모션 등록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-9">
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
              <div className="card-body">
                <div className="mb-2 row">
                  <label
                    htmlFor="promotion_week_name"
                    className="col-sm-2 col-form-label bg-secondary text-white"
                  >
                    * 주말 프로모션 이름
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control"
                      id="promotion_week_name"
                      name="promotion_week_name"
                      defaultValue={detail?.promotion_week_name ?? ""}
                      required
                    />
                  </div>
                </div>

                <div className="mb-2 row">
                  <label
                    htmlFor="promotion_week_date"
                    className="col-sm-2 col-form-label bg-secondary text-white"
                  >
                    * 주말 프로모션 기간
                  </label>
                  <div className="col-sm-6">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="promotion_week_start"
                        name="promotion_week_start"
                        placeholder="주말 프로모션 시작일"
                        value={start}
                        onChange={(e) => setStart(applyMask(e.target.value, DATETIME_MASK))}
                        required
                      />
                      <span className="input-group-text">~</span>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="promotion_week_end"
                        name="promotion_week_end"
                        placeholder="주말 프로모션 종료일"
                        value={end}
                        onChange={(e) => setEnd(applyMask(e.target.value, DATETIME_MASK))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-2 row">
                  <label
                    htmlFor="promotion_week_banner_link"
                    className="col-sm-2 col-form-label bg-secondary text-white"
                  >
                    * 배너 링크 URL
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control"
                      id="promotion_week_banner_link"
                      name="promotion_week_banner_link"
                      defaultValue={detail?.promotion_week_banner_link ?? ""}
                      required
                    />
                  </div>
                </div>

                {/* 추천게임 4칸. legacy label for="promotion_week_banner_mobile"(복붙 quirk) 유지 */}
                <div className="mb-2 row">
                  <label
                    htmlFor="promotion_week_banner_mobile"
                    className="col-sm-2 col-form-label bg-secondary text-white"
                  >
                    * 추천게임
                  </label>
                  <div className="col-sm-10">
                    <div className="row g-3">
                      {Array.from({ length: RECOMMAND_COUNT }, (_, i) => i + 1).map((n) => (
                        <div className="col-md-3 text-center" key={n}>
                          <label htmlFor={`promotion_week_recommand_${n}`} className="form-label">
                            추천게임 {n}
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id={`promotion_week_recommand_${n}`}
                            name={`promotion_week_recommand_${n}`}
                            defaultValue={detail?.recommand[n - 1] ?? ""}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 인기게임 10칸(5+5). legacy label for="promotion_week_banner_mobile"(복붙 quirk) 유지 */}
                <div className="mb-2 row">
                  <label
                    htmlFor="promotion_week_banner_mobile"
                    className="col-sm-2 col-form-label bg-secondary text-white align-middle"
                  >
                    * 인기게임
                  </label>
                  <div className="col-sm-10">
                    <div className="row g-3">
                      {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                        <BestInput key={n} n={n} detail={detail} />
                      ))}
                    </div>
                    <div className="row g-3">
                      {Array.from({ length: 5 }, (_, i) => i + 6).map((n) => (
                        <BestInput key={n} n={n} detail={detail} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 정적 URL 표시(입력 아님). legacy label for="event_link" quirk */}
                <div className="mb-2 row">
                  <label
                    htmlFor="event_link"
                    className="col-sm-2 col-form-label bg-secondary text-white"
                  >
                    * 주말 프로모션 URL
                  </label>
                  <div className="col-sm-10">
                    <span className="form-control-plaintext">
                      /promotion/promotion_weekend.html
                    </span>
                  </div>
                </div>

                <div className="mb-2 row">
                  <label
                    htmlFor="is_view"
                    className="col-sm-2 col-form-label bg-secondary text-white"
                  >
                    * 주말 프로모션 노출여부
                  </label>
                  <div className="col-sm-10 border p-2">
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="is_view_y"
                        name="is_view"
                        className="form-check-input"
                        value="Y"
                        defaultChecked={detail?.is_view === "Y"}
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
                        defaultChecked={detail?.is_view === "N"}
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
                      주말 프로모션 저장
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

const BestInput = ({ n, detail }: { n: number; detail?: PromotionWeekendDetail }) => (
  <div className="col-md-2 text-center">
    <label htmlFor={`promotion_week_best_${n}`} className="form-label">
      인기게임 {n}
    </label>
    <input
      type="text"
      className="form-control"
      id={`promotion_week_best_${n}`}
      name={`promotion_week_best_${n}`}
      defaultValue={detail?.best[n - 1] ?? ""}
      required
    />
  </div>
);
