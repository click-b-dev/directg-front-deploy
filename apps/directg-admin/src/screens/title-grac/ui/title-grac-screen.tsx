import { useEffect, type FormEvent } from "react";
import { useGrac, useUpdateGrac, type GracRequest, type TitleGrac } from "@entities/goods-title";
import { TitleSubNav } from "@widgets/title-sub-nav";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type TitleGracScreenProps = { titleId: number };

// legacy goods/title_grac_register.php — 대표상품 심의정보 설정.
export const TitleGracScreen = ({ titleId }: TitleGracScreenProps) => {
  const { data } = useGrac(titleId);

  useEffect(() => {
    document.title = "대표상품 심의정보 설정";
  }, []);

  if (!data) {
    return null;
  }
  return <GracForm data={data} />;
};

// legacy 내용정보표시 체크박스(폼 순서 = game_rate 비트 순서, 선정성64…사행성1).
const DESCRIPTORS = [
  { id: "game_rate64", value: 64, label: "선정성" },
  { id: "game_rate32", value: 32, label: "폭력성" },
  { id: "game_rate16", value: 16, label: "공포" },
  { id: "game_rate8", value: 8, label: "언어의부적절성" },
  { id: "game_rate4", value: 4, label: "약물" },
  { id: "game_rate2", value: 2, label: "범죄" },
  { id: "game_rate1", value: 1, label: "사행성" },
];

const AGE_LIMITS = [
  { value: "10", label: "전체 이용가" },
  { value: "12", label: "12세이용가" },
  { value: "15", label: "15세이용가" },
  { value: "19", label: "청소년이용불가" },
];

const GracForm = ({ data }: { data: TitleGrac }) => {
  const updateGrac = useUpdateGrac();
  const productViewer = useProductViewer();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    // legacy JS: 체크된 game_rate[] 값 합 → dec.toString(2)
    const dec = fd.getAll("game_rate[]").reduce((sum, v) => sum + Number(v), 0);
    const payload: GracRequest = {
      rateno: String(fd.get("rateno") ?? ""),
      age_limit: String(fd.get("age_limit") ?? ""),
      game_rate_text: dec.toString(2),
      // legacy: 폼에 orgname 입력 없음 → 빈값(저장 시 덮임)
      orgname: "",
    };
    updateGrac.mutate({ titleId: data.title_id, payload });
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
                    상품
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    대표상품 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">심의정보 설정</li>
              </ol>
            </div>
            <h4 className="page-title">
              {data.title_name} <small>({data.title_name_en})</small>
            </h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-2 mb-2 mb-sm-0">
          <TitleSubNav titleId={data.title_id} titleCode="33" active="grac" />
        </div>
        <div className="col-10">
          <form
            id="frm"
            name="frm"
            className="form-horizontal"
            encType="multipart/form-data"
            onSubmit={handleSubmit}
          >
            <div className="card">
              <h5 className="card-header bg-secondary text-white">대표상품 심의정보</h5>
              <div className="card-body font-13">
                <div className="row mb-2">
                  <label htmlFor="rateno" className="col-2 col-form-label bg-light border">
                    * 등급분류번호
                  </label>
                  <div className="col-6">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        id="rateno"
                        name="rateno"
                        placeholder="등급분류번호"
                        aria-label="등급분류번호"
                        defaultValue={data.rateno}
                      />
                      {/* legacy: 심의정보검색 버튼 핸들러 없음(no-op) */}
                      <button className="btn btn-sm btn-dark shadow-none" type="button">
                        심의정보검색
                      </button>
                    </div>
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="age_limit" className="col-2 col-form-label bg-light border">
                    * 결정등급
                  </label>
                  <div className="col-10">
                    {AGE_LIMITS.map((age) => (
                      <div className="form-check form-check-inline mt-1" key={age.value}>
                        <input
                          type="radio"
                          id={`age_limit${age.value}`}
                          name="age_limit"
                          className="form-check-input"
                          value={age.value}
                          defaultChecked={data.age_limit === age.value}
                        />
                        <label className="form-check-label" htmlFor={`age_limit${age.value}`}>
                          {age.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="row">
                  <label className="col-2 col-form-label bg-light border"> 내용정보표시</label>
                  <div className="col-10">
                    {DESCRIPTORS.map((desc, index) => (
                      <div className="form-check form-check-inline mt-1" key={desc.id}>
                        <input
                          type="checkbox"
                          id={desc.id}
                          name="game_rate[]"
                          className="form-check-input"
                          value={desc.value}
                          defaultChecked={data.game_rate.charAt(index) === "1"}
                        />
                        <label className="form-check-label" htmlFor={desc.id}>
                          {desc.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card-footer p-1">
                <div className="text-end">
                  {/* legacy: product_viewer면 저장 숨김. */}
                  {!productViewer && (
                    <button
                      type="submit"
                      className="btn btn-secondary btn-sm shadow-none"
                      id="btn_grac_save"
                    >
                      <i className="mdi mdi-content-save font-16" /> 대표상품 심의정보 저장
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
