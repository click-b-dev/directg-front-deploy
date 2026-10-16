import type { FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCreateGrac, type GracRegisterRequest } from "@entities/grac";

// legacy grac/grac_register.php — 심의정보 등록.
// legacy quirk: ?rateno= 있으면 mode=modify로 조회하나 폼에 미반영(항상 blank). mode만 반영.
type GoodsGracRegisterProps = { rateno: string };

const ORGNAME_OPTIONS = ["게임물관리위원회", "게임콘텐츠등급분류위원회", "자체등급분류사업자"];

// legacy id 비연속(entname3,4,7,8,9,10) 유지, value≠label.
const ENTNAME_OPTIONS = [
  {
    id: "entname3",
    value: "소니인터렉티브엔터테인먼트코리아",
    label: "㈜소니인터랙티브엔터테인먼트코리아",
  },
  { id: "entname4", value: "한국마이크로소프트", label: "한국마이크로소프트 유한회사" },
  { id: "entname7", value: "오큘러스", label: "오큘러스브이알코리아 유한회사" },
  { id: "entname8", value: "에픽게임즈코리아", label: "에픽게임즈코리아 유한회사" },
  { id: "entname9", value: "한국닌텐도", label: "한국닌텐도주식회사" },
  { id: "entname10", value: "스마일게이트홀딩스", label: "스마일게이트홀딩스" },
];

const GIVENRATE_OPTIONS = [
  "전체이용가",
  "12세이용가",
  "15세이용가",
  "청소년이용불가",
  "등급거부",
  "등급취소",
];

const DESCRIPTOR_OPTIONS = ["선정성", "폭력성", "공포", "언어의부적절성", "약물", "범죄", "사행성"];

export const GoodsGracRegisterScreen = ({ rateno }: GoodsGracRegisterProps) => {
  const navigate = useNavigate();
  const createMutation = useCreateGrac();

  // legacy: rateno 유무로 mode 결정(폼은 항상 blank).
  const mode = rateno ? "modify" : "register";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const get = (name: string) => String(fd.get(name) ?? "");
    const payload: GracRegisterRequest = {
      mode,
      rateno: get("rateno"),
      gametitle: get("gametitle"),
      rateddate: get("rateddate"),
      orgname: get("orgname"),
      entname: get("entname"),
      platform: get("platform"),
      givenrate: get("givenrate"),
      descriptors: fd.getAll("descriptors").map((v) => String(v)),
    };
    // legacy: register 성공 → grac_list.php 리다이렉트.
    createMutation.mutate(payload, {
      onSuccess: () =>
        navigate({
          to: "/goods/grac/grac_list",
          search: {
            page: 1,
            search_rateno: "",
            search_gametitle: "",
            search_entname: "",
            search_orgname: "",
            search_givenrate: "",
            search_platform: "",
          },
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
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    상품
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    심의정보 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">심의정보 등록</li>
              </ol>
            </div>
            <h4 className="page-title">심의정보 등록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <form id="frm" name="frm" method="post" onSubmit={handleSubmit}>
        <input type="hidden" name="mode" value={mode} />
        <input type="hidden" name="idx" value="" />
        <div className="row">
          <div className="col-8">
            <div className="card">
              <div className="card-body">
                <div className="row mb-3">
                  <label htmlFor="rateno" className="col-2 col-form-label bg-light">
                    등급분류번호
                  </label>
                  <div className="col-4">
                    <input type="text" className="form-control" id="rateno" name="rateno" />
                  </div>
                </div>
                <div className="row mb-3">
                  <label htmlFor="gametitle" className="col-2 col-form-label bg-light">
                    게임물명
                  </label>
                  <div className="col-10">
                    <input type="text" className="form-control" id="gametitle" name="gametitle" />
                  </div>
                </div>
                <div className="row mb-3">
                  <label htmlFor="rateddate" className="col-2 col-form-label bg-light">
                    등급분류일자
                  </label>
                  <div className="col-4">
                    <input type="text" className="form-control" id="rateddate" name="rateddate" />
                  </div>
                </div>
                <div className="row mb-3">
                  <label htmlFor="orgname" className="col-2 col-form-label bg-light">
                    등급분류기관
                  </label>
                  <div className="col-10">
                    {ORGNAME_OPTIONS.map((org, index) => (
                      <div key={org} className="form-check form-check-inline mt-1">
                        <input
                          type="radio"
                          id={`orgname_${index + 1}`}
                          name="orgname"
                          className="form-check-input"
                          value={org}
                          defaultChecked={org === "자체등급분류사업자"}
                        />
                        <label className="form-check-label" htmlFor={`orgname_${index + 1}`}>
                          {org}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="row mb-3">
                  <label htmlFor="entname" className="col-2 col-form-label bg-light">
                    심의업체명
                  </label>
                  <div className="col-10">
                    {ENTNAME_OPTIONS.map((ent) => (
                      <div key={ent.id} className="form-check form-check-inline">
                        <input
                          type="radio"
                          id={ent.id}
                          name="entname"
                          className="form-check-input"
                          value={ent.value}
                        />
                        <label className="form-check-label" htmlFor={ent.id}>
                          {ent.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="row mb-3">
                  <label htmlFor="platform" className="col-2 col-form-label bg-light">
                    게임플랫폼
                  </label>
                  <div className="col-10">
                    <div className="form-check form-check-inline mt-1">
                      <input
                        type="radio"
                        id="platform"
                        name="platform"
                        className="form-check-input"
                        value="PC/온라인 게임"
                        defaultChecked
                      />
                      <label className="form-check-label" htmlFor="platform">
                        PC/온라인 게임
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <label htmlFor="givenrate" className="col-2 col-form-label bg-light">
                    결정등급
                  </label>
                  <div className="col-10">
                    {GIVENRATE_OPTIONS.map((rate, index) => (
                      <div key={rate} className="form-check form-check-inline mt-1">
                        <input
                          type="radio"
                          id={`givenrate${index + 1}`}
                          name="givenrate"
                          className="form-check-input"
                          value={rate}
                        />
                        <label className="form-check-label" htmlFor={`givenrate${index + 1}`}>
                          {rate}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="row mb-3">
                  <label htmlFor="special_asset_id" className="col-2 col-form-label bg-light">
                    내용정보표시
                  </label>
                  <div className="col-10">
                    {DESCRIPTOR_OPTIONS.map((desc, index) => (
                      <div key={desc} className="form-check form-check-inline mt-1">
                        <input
                          type="checkbox"
                          id={`descriptors${index + 1}`}
                          name="descriptors"
                          className="form-check-input"
                          value={desc}
                        />
                        <label className="form-check-label" htmlFor={`descriptors${index + 1}`}>
                          {desc}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* end card-body */}
              <div className="card-footer">
                <div className="float-end">
                  <button type="submit" className="btn btn-primary">
                    저장
                  </button>
                </div>
              </div>
            </div>
            {/* end card */}
          </div>
        </div>
      </form>
      {/* end row */}
    </>
  );
};
