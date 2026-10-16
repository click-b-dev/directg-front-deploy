import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  usePromotionSeasonDetail,
  useCreatePromotionSeason,
  useUpdatePromotionSeason,
  type PromotionSeasonRegisterSearch,
  type PromotionSeasonDetail,
  type PromotionSeasonSaveRequest,
} from "@entities/promotion";
import { DATETIME_MASK, applyMask } from "@shared/lib/input-mask";

// 6 카테고리(라벨/필드prefix/개수/컬럼/항목라벨). legacy label for quirk 포함.
const CATEGORIES = [
  {
    key: "recommand" as const,
    label: "* 대규모 프로모션 추천게임",
    htmlFor: "promotion_season_banner_mobile",
    labelExtra: "",
    namePrefix: "promotion_season_recommand",
    count: 4,
    colClass: "col-md-3",
    itemLabel: "추천게임",
  },
  {
    key: "best" as const,
    label: "* 대규모 프로모션 인기게임",
    htmlFor: "promotion_season_banner_mobile",
    labelExtra: " align-middle",
    namePrefix: "promotion_season_best",
    count: 10,
    colClass: "col-md-2",
    itemLabel: "인기게임",
  },
  {
    key: "max_discount" as const,
    label: "* 역대 최대할인 설정",
    htmlFor: "promotion_max_discount",
    labelExtra: "",
    namePrefix: "promotion_max_discount",
    count: 3,
    colClass: "col-md-2",
    itemLabel: "역대 최대할인",
  },
  {
    key: "add_repay" as const,
    label: "* 추가 포인트 적립",
    htmlFor: "promotion_add_repay",
    labelExtra: "",
    namePrefix: "promotion_add_repay",
    count: 3,
    colClass: "col-md-2",
    itemLabel: "추가 포인트 적립",
  },
  {
    key: "price_5000" as const,
    label: "* 대규모 프로모션 5천원 미만 게임",
    htmlFor: "promotion_price_5000",
    labelExtra: "",
    namePrefix: "promotion_price_5000",
    count: 5,
    colClass: "col-md-2",
    itemLabel: "5천원 미만 게임",
  },
  {
    key: "price_10000" as const,
    label: "* 대규모 프로모션 1만원 미만 게임",
    htmlFor: "promotion_price_10000",
    labelExtra: "",
    namePrefix: "promotion_price_10000",
    count: 5,
    colClass: "col-md-2",
    itemLabel: "1만원 미만 게임",
  },
];

const chunk5 = (n: number): number[][] => {
  const rows: number[][] = [];
  for (let i = 1; i <= n; i += 5) {
    rows.push(Array.from({ length: Math.min(5, n - i + 1) }, (_, k) => i + k));
  }
  return rows;
};

// legacy promotion/promotion_season_register.php — 대규모 프로모션 등록/수정 겸용.
export const PromotionSeasonRegisterScreen = ({ idx }: PromotionSeasonRegisterSearch) => {
  const isModify = idx > 0;
  const { data } = usePromotionSeasonDetail(idx, { enabled: isModify });

  if (isModify && !data) {
    return null;
  }

  return <PromotionSeasonForm isModify={isModify} idx={idx} detail={isModify ? data : undefined} />;
};

const LabelInput = ({
  label,
  htmlFor,
  id,
  name,
  defaultValue,
  required,
}: {
  label: ReactNode;
  htmlFor: string;
  id?: string;
  name: string;
  defaultValue: string;
  required?: boolean;
}) => (
  <div className="mb-2 row">
    <label htmlFor={htmlFor} className="col-sm-2 col-form-label bg-secondary text-white">
      {label}
    </label>
    <div className="col-sm-10">
      <input
        type="text"
        className="form-control"
        id={id ?? name}
        name={name}
        defaultValue={defaultValue}
        required={required}
      />
    </div>
  </div>
);

const PromotionSeasonForm = ({
  isModify,
  idx,
  detail,
}: {
  isModify: boolean;
  idx: number;
  detail?: PromotionSeasonDetail;
}) => {
  const navigate = useNavigate();
  const createMutation = useCreatePromotionSeason();
  const updateMutation = useUpdatePromotionSeason();

  const [start, setStart] = useState(detail?.promotion_season_start ?? "");
  const [end, setEnd] = useState(detail?.promotion_season_end ?? "");

  const mode = isModify ? "modify" : "register";
  const pageTitle = isModify ? "대규모 프로모션 수정" : "대규모 프로모션 등록";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const get = (name: string) => String(fd.get(name) ?? "");
    const arr = (prefix: string, count: number) =>
      Array.from({ length: count }, (_, i) => get(`${prefix}_${i + 1}`));
    const payload: PromotionSeasonSaveRequest = {
      promotion_season_name: get("promotion_season_name"),
      promotion_season_start: start,
      promotion_season_end: end,
      promotion_season_banner_pc: get("promotion_season_banner_pc"),
      promotion_season_banner_mobile: get("promotion_season_banner_mobile"),
      promotion_season_banner_link: get("promotion_season_banner_link"),
      promotion_season_recommand_banner: get("promotion_season_recommand_banner"),
      recommand: arr("promotion_season_recommand", 4),
      best: arr("promotion_season_best", 10),
      max_discount: arr("promotion_max_discount", 3),
      add_repay: arr("promotion_add_repay", 3),
      price_5000: arr("promotion_price_5000", 5),
      price_10000: arr("promotion_price_10000", 5),
      max_discount_link: get("promotion_max_discount_link"),
      add_repay_link: get("promotion_add_repay_link"),
      is_view: get("is_view"),
      notice_title: get("notice_title"),
      notice_btn_title: get("notice_btn_title"),
      notice_btn_url: get("notice_btn_url"),
      notice_view: get("notice_view"),
    };
    const onSuccess = () =>
      navigate({
        to: "/promotion/promotion_season",
        search: { page: 1, search_key: "", search_value: "" },
      });
    if (isModify) {
      updateMutation.mutate({ idx, payload }, { onSuccess });
    } else {
      createMutation.mutate(payload, { onSuccess });
    }
  };

  const catValues: Record<string, string[]> = {
    recommand: detail?.recommand ?? [],
    best: detail?.best ?? [],
    max_discount: detail?.max_discount ?? [],
    add_repay: detail?.add_repay ?? [],
    price_5000: detail?.price_5000 ?? [],
    price_10000: detail?.price_10000 ?? [],
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
                    대규모 프로모션 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">{pageTitle}</li>
              </ol>
            </div>
            <h4 className="page-title">{pageTitle}</h4>
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
              <div className="card-body">
                <LabelInput
                  label="* 대규모 프로모션 이름"
                  htmlFor="promotion_season_name"
                  name="promotion_season_name"
                  defaultValue={detail?.promotion_season_name ?? ""}
                  required
                />

                <div className="mb-2 row">
                  <label
                    htmlFor="promotion_season_date"
                    className="col-sm-2 col-form-label bg-secondary text-white"
                  >
                    * 대규모 프로모션 기간
                  </label>
                  <div className="col-sm-6">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="promotion_season_start"
                        name="promotion_season_start"
                        placeholder="대규모 프로모션 시작일"
                        value={start}
                        onChange={(e) => setStart(applyMask(e.target.value, DATETIME_MASK))}
                        required
                      />
                      <span className="input-group-text">~</span>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="promotion_season_end"
                        name="promotion_season_end"
                        placeholder="대규모 프로모션 종료일"
                        value={end}
                        onChange={(e) => setEnd(applyMask(e.target.value, DATETIME_MASK))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <LabelInput
                  label={
                    <>
                      * PC 배너 URL
                      <br />
                      (1296 * 500)
                    </>
                  }
                  htmlFor="promotion_season_banner_pc"
                  name="promotion_season_banner_pc"
                  defaultValue={detail?.promotion_season_banner_pc ?? ""}
                  required
                />
                <LabelInput
                  label={
                    <>
                      * 모바일 배너 URL
                      <br />
                      (720 * 720)
                    </>
                  }
                  htmlFor="promotion_season_banner_mobile"
                  name="promotion_season_banner_mobile"
                  defaultValue={detail?.promotion_season_banner_mobile ?? ""}
                  required
                />
                <LabelInput
                  label="* 배너 링크 URL"
                  htmlFor="promotion_season_banner_link"
                  name="promotion_season_banner_link"
                  defaultValue={detail?.promotion_season_banner_link ?? ""}
                  required
                />
                <LabelInput
                  label={
                    <>
                      * 추천 및 특집 배너 URL
                      <br />
                      (640 * 573)
                    </>
                  }
                  htmlFor="promotion_season_recommand_banner"
                  name="promotion_season_recommand_banner"
                  defaultValue={detail?.promotion_season_recommand_banner ?? ""}
                  required
                />

                {/* 추천게임 / 인기게임 (배너링크 앞) */}
                {CATEGORIES.slice(0, 2).map((cat) => (
                  <CategoryField key={cat.key} cat={cat} values={catValues[cat.key]} />
                ))}

                {/* 역대 최대할인 + 링크 */}
                <CategoryField cat={CATEGORIES[2]} values={catValues.max_discount} />
                <LabelInput
                  label="* 역대 최대할인 배너 링크 URL"
                  htmlFor="promotion_max_discount_link"
                  name="promotion_max_discount_link"
                  defaultValue={detail?.max_discount_link ?? ""}
                  required
                />

                {/* 추가 포인트 적립 + 링크 */}
                <CategoryField cat={CATEGORIES[3]} values={catValues.add_repay} />
                <LabelInput
                  label="* 추가 포인트 적립 배너 링크 URL"
                  htmlFor="promotion_add_repay_link"
                  name="promotion_add_repay_link"
                  defaultValue={detail?.add_repay_link ?? ""}
                  required
                />

                {/* 5천원 미만 / 1만원 미만 */}
                {CATEGORIES.slice(4).map((cat) => (
                  <CategoryField key={cat.key} cat={cat} values={catValues[cat.key]} />
                ))}

                {/* 정적 URL. legacy label for="event_link" quirk */}
                <div className="mb-2 row">
                  <label
                    htmlFor="event_link"
                    className="col-sm-2 col-form-label bg-secondary text-white"
                  >
                    * 대규모 프로모션 URL
                  </label>
                  <div className="col-sm-10">
                    <span className="form-control-plaintext">/promotion/promotion_season.html</span>
                  </div>
                </div>

                {/* 공지(non-required). notice_title input id="notice" quirk */}
                <LabelInput
                  label="프로모션 공지 제목"
                  htmlFor="notice_title"
                  id="notice"
                  name="notice_title"
                  defaultValue={detail?.notice_title ?? ""}
                />
                <LabelInput
                  label="프로모션 공지 버튼명"
                  htmlFor="notice_btn_title"
                  name="notice_btn_title"
                  defaultValue={detail?.notice_btn_title ?? ""}
                />
                <LabelInput
                  label="프로모션 공지 버튼 URL"
                  htmlFor="notice_btn_url"
                  name="notice_btn_url"
                  defaultValue={detail?.notice_btn_url ?? ""}
                />

                <RadioRow
                  label="프로모션 공지 영역 노출여부"
                  name="notice_view"
                  checked={detail?.notice_view}
                />
                <RadioRow
                  label="* 대규모 프로모션 노출여부"
                  name="is_view"
                  checked={detail?.is_view}
                />

                <div className="mb-2 row">
                  <div className="text-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      대규모 프로모션 저장
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

const CategoryField = ({ cat, values }: { cat: (typeof CATEGORIES)[number]; values: string[] }) => (
  <div className="mb-2 row">
    <label
      htmlFor={cat.htmlFor}
      className={`col-sm-2 col-form-label bg-secondary text-white${cat.labelExtra}`}
    >
      {cat.label}
    </label>
    <div className="col-sm-10">
      {chunk5(cat.count).map((rowNums, ri) => (
        <div className="row g-3" key={ri}>
          {rowNums.map((n) => (
            <div className={`${cat.colClass} text-center`} key={n}>
              <label htmlFor={`${cat.namePrefix}_${n}`} className="form-label">
                {cat.itemLabel} {n}
              </label>
              <input
                type="text"
                className="form-control"
                id={`${cat.namePrefix}_${n}`}
                name={`${cat.namePrefix}_${n}`}
                defaultValue={values[n - 1] ?? ""}
                required
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const RadioRow = ({ label, name, checked }: { label: string; name: string; checked?: string }) => (
  <div className="mb-2 row">
    <label htmlFor={`${name}_y`} className="col-sm-2 col-form-label bg-secondary text-white">
      {label}
    </label>
    <div className="col-sm-10 border p-2">
      <div className="form-check form-check-inline">
        <input
          type="radio"
          id={`${name}_y`}
          name={name}
          className="form-check-input"
          value="Y"
          defaultChecked={checked === "Y"}
        />
        <label className="form-check-label" htmlFor={`${name}_y`}>
          예
        </label>
      </div>
      <div className="form-check form-check-inline">
        <input
          type="radio"
          id={`${name}_n`}
          name={name}
          className="form-check-input"
          value="N"
          defaultChecked={checked === "N"}
        />
        <label className="form-check-label" htmlFor={`${name}_n`}>
          아니오
        </label>
      </div>
    </div>
  </div>
);
