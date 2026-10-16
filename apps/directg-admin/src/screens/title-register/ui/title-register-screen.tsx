import { useEffect, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  useCreateTitle,
  useNewTitle,
  type CreateTitleRequest,
  type NewTitleResponse,
} from "@entities/goods-title";
import { BootstrapDatepicker } from "@shared/ui";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type TitleRegisterScreenProps = { productCode: string };

// legacy goods/title_register.php — 대표상품 등록 폼(로드 시 title_id/sku 채번 + product_code prefill).
export const TitleRegisterScreen = ({ productCode }: TitleRegisterScreenProps) => {
  const { data } = useNewTitle(productCode);

  useEffect(() => {
    document.title = "대표상품 등록";
  }, []);

  if (!data) {
    return null;
  }
  return <TitleRegisterForm data={data} />;
};

const TitleRegisterForm = ({ data }: { data: NewTitleResponse }) => {
  const navigate = useNavigate();
  const createMutation = useCreateTitle();
  const productViewer = useProductViewer();
  const prefill = data.prefill;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const get = (name: string) => String(fd.get(name) ?? "");
    const payload: CreateTitleRequest = {
      title_id: data.title_id,
      sku: data.sku,
      title_name: get("title_name"),
      title_name_en: get("title_name_en"),
      coming_soon: get("coming_soon") === "N" ? "N" : "Y",
      coming_soon_date: get("coming_soon_date"),
      release_date: get("release_date"),
      title_code: get("title_code") === "12" ? "12" : "33",
      is_view: get("is_view") === "Y" ? "Y" : "N",
      sales_status: (["C", "S", "E"].includes(get("sales_status")) ? get("sales_status") : "C") as
        | "C"
        | "S"
        | "E",
      publisher: get("publisher"),
      developer: get("developer"),
      steam_appid: get("steam_appid"),
      // legacy: game_rate[] 체크박스 없음 → "0"
      game_rate_text: "0",
    };
    createMutation.mutate(payload, {
      onSuccess: () =>
        navigate({
          to: "/goods/title_list",
          search: {
            page: 1,
            search_key: "search_title_id",
            search_value: String(data.title_id),
            search_is_view: "",
            search_sales_status: "",
            search_age_limit: "",
            search_interface_korean: "",
            search_subtitle_korean: "",
            search_spoken_korean: "",
            search_exclusive_korean: "",
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
                <li className="breadcrumb-item active">대표상품 등록</li>
              </ol>
            </div>
            <h4 className="page-title">대표상품 등록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <form
        id="frm"
        name="frm"
        className="form-horizontal"
        encType="multipart/form-data"
        onSubmit={handleSubmit}
      >
        <div className="row mb-2">
          <div className="text-end">
            {/* legacy: product_viewer면 submit 숨김. */}
            {!productViewer && (
              <button type="submit" className="btn btn-primary shadow-none">
                <i className="mdi mdi-content-save font-16" /> 대표상품 등록
              </button>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-8">
            <div className="card">
              <h5 className="card-header bg-secondary text-white">
                <span className="text-danger">(필수)</span> 대표상품 기본정보
              </h5>
              <div className="card-body">
                <div className="row mb-2">
                  <label htmlFor="title_id" className="col-3 col-form-label bg-light border">
                    * 대표상품코드
                  </label>
                  <div className="col-9">
                    <input
                      type="text"
                      className="form-control-plaintext"
                      id="title_id"
                      name="title_id"
                      defaultValue={data.title_id}
                      readOnly
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="sku" className="col-3 col-form-label bg-light border">
                    * 대표상품SKU
                  </label>
                  <div className="col-9">
                    <input
                      type="text"
                      className="form-control-plaintext"
                      id="sku"
                      name="sku"
                      defaultValue={data.sku}
                      readOnly
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="title_name" className="col-3 col-form-label bg-light border">
                    * 대표상품명(국문)
                  </label>
                  <div className="col-9">
                    <input
                      type="text"
                      className="form-control"
                      id="title_name"
                      name="title_name"
                      defaultValue={prefill?.title_name ?? ""}
                      required
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="title_name_en" className="col-3 col-form-label bg-light border">
                    * 대표상품명(영문)
                  </label>
                  <div className="col-9">
                    <input
                      type="text"
                      className="form-control"
                      id="title_name_en"
                      name="title_name_en"
                      defaultValue={prefill?.title_name_en ?? ""}
                      required
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="coming_soon" className="col-3 col-form-label bg-light border">
                    * 출시여부
                  </label>
                  <div className="col-9 border-bottom border-end border-top py-1">
                    <div className="row g-3 align-items-center">
                      <div className="col-auto">
                        <div className="form-check">
                          <input
                            type="radio"
                            id="coming_soon_c"
                            name="coming_soon"
                            className="form-check-input"
                            value="Y"
                            defaultChecked
                          />
                          <label className="form-check-label" htmlFor="coming_soon_c">
                            출시예정
                          </label>
                        </div>
                      </div>
                      <div className="col-auto">
                        <input
                          type="text"
                          className="form-control"
                          id="coming_soon_date"
                          name="coming_soon_date"
                          placeholder="출시일 미정시 입력"
                        />
                      </div>
                      <div className="col-auto">
                        <div className="form-check">
                          <input
                            type="radio"
                            id="coming_soon_n"
                            name="coming_soon"
                            className="form-check-input"
                            value="N"
                          />
                          <label className="form-check-label" htmlFor="coming_soon_n">
                            출시확정
                          </label>
                        </div>
                      </div>
                      <div className="col-auto">
                        <BootstrapDatepicker
                          id="release_date"
                          name="release_date"
                          defaultValue={prefill?.release_date ?? ""}
                          placeholder="출시일"
                          containerId="datepicker1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="title_code" className="col-3 col-form-label bg-light border">
                    * 상품정보 제공고시 품목 구분
                  </label>
                  <div className="col-9 border-bottom border-end border-top">
                    <div className="form-check form-check-inline mt-1">
                      <input
                        type="radio"
                        id="title_code_33"
                        name="title_code"
                        className="form-check-input"
                        value="33"
                        defaultChecked
                      />
                      <label className="form-check-label" htmlFor="title_code_33">
                        (33) 디지털 콘텐츠(게임)
                      </label>
                    </div>
                    <div className="form-check form-check-inline mt-1">
                      <input
                        type="radio"
                        id="title_code_12"
                        name="title_code"
                        className="form-check-input"
                        value="12"
                      />
                      <label className="form-check-label" htmlFor="title_code_12">
                        (12) 소형전자
                      </label>
                    </div>
                  </div>
                </div>

                <div className="row mb-2">
                  <label className="col-3 col-form-label bg-light border">
                    * 대표상품 페이지 노출
                  </label>
                  <div className="col-9">
                    <div className="form-check form-check-inline mt-1">
                      <input
                        type="radio"
                        id="is_view_1"
                        name="is_view"
                        className="form-check-input"
                        value="Y"
                      />
                      <label className="form-check-label" htmlFor="is_view_1">
                        진열함
                      </label>
                    </div>
                    <div className="form-check form-check-inline mt-1">
                      <input
                        type="radio"
                        id="is_view_2"
                        name="is_view"
                        className="form-check-input"
                        value="N"
                        defaultChecked
                      />
                      <label className="form-check-label" htmlFor="is_view_2">
                        진열안함
                      </label>
                    </div>
                  </div>
                </div>

                <div className="row mb-2">
                  <label className="col-3 col-form-label bg-light border">
                    * 대표상품 판매상태
                  </label>
                  <div className="col-9">
                    <div className="form-check form-check-inline mt-1">
                      <input
                        type="radio"
                        id="sales_status_c"
                        name="sales_status"
                        className="form-check-input"
                        value="C"
                        defaultChecked
                      />
                      <label className="form-check-label" htmlFor="sales_status_c">
                        판매예정
                      </label>
                    </div>
                    <div className="form-check form-check-inline mt-1">
                      <input
                        type="radio"
                        id="sales_status_s"
                        name="sales_status"
                        className="form-check-input"
                        value="S"
                      />
                      <label className="form-check-label" htmlFor="sales_status_s">
                        판매중
                      </label>
                    </div>
                    <div className="form-check form-check-inline mt-1">
                      <input
                        type="radio"
                        id="sales_status_e"
                        name="sales_status"
                        className="form-check-input"
                        value="E"
                      />
                      <label className="form-check-label" htmlFor="sales_status_e">
                        판매종료
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h5 className="card-header bg-secondary text-white">대표상품 부가정보</h5>
              <div className="card-body">
                <div className="row mb-2">
                  <label htmlFor="publisher" className="col-3 col-form-label bg-light border">
                    퍼블리셔
                  </label>
                  <div className="col-9">
                    <input
                      type="text"
                      className="form-control"
                      id="publisher"
                      name="publisher"
                      placeholder="표기용 퍼블리셔"
                      defaultValue={prefill?.publisher ?? ""}
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="developer" className="col-3 col-form-label bg-light border">
                    개발사/제조사
                  </label>
                  <div className="col-9">
                    <input
                      type="text"
                      className="form-control"
                      id="developer"
                      name="developer"
                      placeholder="개발사/제조사"
                      defaultValue={prefill?.developer ?? ""}
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="steam_appid" className="col-3 col-form-label bg-light border">
                    Steam AppID
                  </label>
                  <div className="col-3">
                    <input
                      type="text"
                      className="form-control"
                      id="steam_appid"
                      name="steam_appid"
                      defaultValue={prefill?.steam_appid ?? ""}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};
