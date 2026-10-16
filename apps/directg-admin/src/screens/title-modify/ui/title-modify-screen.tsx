import { useEffect, type FormEvent } from "react";
import {
  useTitleDetail,
  useUpdateTitle,
  type GoodsTitleDetail,
  type UpdateTitleRequest,
} from "@entities/goods-title";
import { TitleSubNav } from "@widgets/title-sub-nav";
import { BootstrapDatepicker } from "@shared/ui";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type TitleModifyScreenProps = { titleId: number };

// legacy goods/title_modify.php — 대표상품 기본정보 설정(로드값 기준 수정 폼).
export const TitleModifyScreen = ({ titleId }: TitleModifyScreenProps) => {
  const { data } = useTitleDetail(titleId);

  useEffect(() => {
    document.title = "대표상품 기본정보 설정";
  }, []);

  if (!data) {
    return null;
  }
  return <TitleModifyForm data={data} />;
};

const TitleModifyForm = ({ data }: { data: GoodsTitleDetail }) => {
  const updateMutation = useUpdateTitle();
  const productViewer = useProductViewer();
  // legacy: title_code==33 조건부 블록은 로드 시점 값 기준(라디오 실시간 반영 아님).
  const isDigital = data.title_code === "33";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const get = (name: string) => String(fd.get(name) ?? "");
    const payload: UpdateTitleRequest = {
      title_name: get("title_name"),
      title_name_en: get("title_name_en"),
      is_view: get("is_view"), // 서버가 빈값 → "N"
      sales_status: (["C", "S", "E"].includes(get("sales_status")) ? get("sales_status") : "") as
        | "C"
        | "S"
        | "E"
        | "",
      release_date: get("release_date"),
      developer: get("developer"),
      steam_appid: get("steam_appid"),
      publisher: get("publisher"),
      // 미체크 체크박스는 FormData에서 빠짐 → "" (legacy 동작)
      interface_korean: get("interface_korean"),
      spoken_korean: get("spoken_korean"),
      exclusive_korean: get("exclusive_korean"),
      subtitle_korean: get("subtitle_korean"),
      coming_soon: get("coming_soon") === "N" ? "N" : "Y",
      coming_soon_date: get("coming_soon_date"),
      title_code: get("title_code") === "12" ? "12" : "33",
      // legacy: 폼에 model_name 입력 없음 → 빈값 전송(저장 시 덮임)
      model_name: "",
    };
    updateMutation.mutate({ titleId: data.title_id, payload });
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
                <li className="breadcrumb-item active">기본정보 설정</li>
              </ol>
            </div>
          </div>
          <h4 className="page-title">{data.title_name}</h4>
          <small>({data.title_name_en})</small>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-2 mb-2 mb-sm-0">
          <TitleSubNav titleId={data.title_id} titleCode={data.title_code} active="modify" />
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
              <h5 className="card-header bg-secondary text-white">대표상품 기본정보</h5>
              <div className="card-body py-2 font-14">
                <div className="row mb-2">
                  <label htmlFor="title_id" className="col-2 col-form-label bg-light border">
                    * 대표상품코드
                  </label>
                  <div className="col-10 border-bottom border-end border-top">
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
                  <label htmlFor="sku" className="col-2 col-form-label bg-light border">
                    * 대표상품 SKU
                  </label>
                  <div className="col-10 border-bottom border-end border-top">
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
                  <label htmlFor="title_name" className="col-2 col-form-label bg-light border">
                    * 대표상품명(국문)
                  </label>
                  <div className="col-10 pe-0">
                    <input
                      type="text"
                      className="form-control"
                      id="title_name"
                      name="title_name"
                      defaultValue={data.title_name}
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="title_name_en" className="col-2 col-form-label bg-light border">
                    * 대표상품명(영문)
                  </label>
                  <div className="col-10 pe-0">
                    <input
                      type="text"
                      className="form-control"
                      id="title_name_en"
                      name="title_name_en"
                      defaultValue={data.title_name_en}
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="publisher" className="col-2 col-form-label bg-light border">
                    * 퍼블리셔
                  </label>
                  <div className="col-10 pe-0">
                    <input
                      type="text"
                      className="form-control"
                      id="publisher"
                      name="publisher"
                      placeholder="표기용 퍼블리셔"
                      defaultValue={data.publisher}
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="developer" className="col-2 col-form-label bg-light border">
                    * 개발사/제조사
                  </label>
                  <div className="col-10 pe-0">
                    <input
                      type="text"
                      className="form-control"
                      id="developer"
                      name="developer"
                      placeholder="개발사"
                      defaultValue={data.developer}
                    />
                  </div>
                </div>

                {isDigital && (
                  <>
                    <div className="row mb-2">
                      <label
                        htmlFor="spoken_korean"
                        className="col-2 col-form-label bg-light border"
                      >
                        * 음성 한국어 지원
                      </label>
                      <div className="col-4">
                        <div className="mt-1">
                          <input
                            type="checkbox"
                            id="spoken_korean"
                            name="spoken_korean"
                            value="Y"
                            data-switch="success"
                            defaultChecked={data.spoken_korean === "Y"}
                          />
                          <label
                            htmlFor="spoken_korean"
                            data-on-label="Y"
                            data-off-label="N"
                            className="mb-0 d-block"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-2">
                      <label
                        htmlFor="interface_korean"
                        className="col-2 col-form-label bg-light border"
                      >
                        * 인터페이스 한국어 지원
                      </label>
                      <div className="col-4">
                        <div className="mt-1">
                          <input
                            type="checkbox"
                            id="interface_korean"
                            name="interface_korean"
                            value="Y"
                            data-switch="success"
                            defaultChecked={data.interface_korean === "Y"}
                          />
                          <label
                            htmlFor="interface_korean"
                            data-on-label="Y"
                            data-off-label="N"
                            className="mb-0 d-block"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-2">
                      <label
                        htmlFor="subtitle_korean"
                        className="col-2 col-form-label bg-light border"
                      >
                        * 자막 한국어 지원
                      </label>
                      <div className="col-4">
                        <div className="mt-1">
                          <input
                            type="checkbox"
                            id="subtitle_korean"
                            name="subtitle_korean"
                            value="Y"
                            data-switch="success"
                            defaultChecked={data.subtitle_korean === "Y"}
                          />
                          <label
                            htmlFor="subtitle_korean"
                            data-on-label="Y"
                            data-off-label="N"
                            className="mb-0 d-block"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-2">
                      <label
                        htmlFor="exclusive_korean"
                        className="col-2 col-form-label bg-light border"
                      >
                        * 독점 한국어 지원
                      </label>
                      <div className="col-4">
                        <div className="mt-1">
                          <input
                            type="checkbox"
                            id="exclusive_korean"
                            name="exclusive_korean"
                            value="Y"
                            data-switch="success"
                            defaultChecked={data.exclusive_korean === "Y"}
                          />
                          <label
                            htmlFor="exclusive_korean"
                            data-on-label="Y"
                            data-off-label="N"
                            className="mb-0 d-block"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="row mb-2">
                  <label htmlFor="is_view" className="col-2 col-form-label bg-light border">
                    * 대표상품 페이지 노출
                  </label>
                  <div className="col-10 border-bottom border-end border-top">
                    <div className="form-check form-check-inline mt-1">
                      <input
                        type="radio"
                        id="is_view_1"
                        name="is_view"
                        className="form-check-input"
                        value="Y"
                        defaultChecked={data.is_view === "Y"}
                      />
                      <label className="form-check-label" htmlFor="is_view_1">
                        노출함
                      </label>
                    </div>
                    <div className="form-check form-check-inline mt-1">
                      <input
                        type="radio"
                        id="is_view_2"
                        name="is_view"
                        className="form-check-input"
                        value="N"
                        defaultChecked={data.is_view !== "Y"}
                      />
                      <label className="form-check-label" htmlFor="is_view_2">
                        노출안함
                      </label>
                    </div>
                  </div>
                </div>

                <div className="row mb-2">
                  <label htmlFor="sales_status" className="col-2 col-form-label bg-light border">
                    * 대표상품 판매상태
                  </label>
                  <div className="col-10 border-bottom border-end border-top">
                    <div className="form-check form-check-inline mt-1">
                      <input
                        type="radio"
                        id="sales_status_c"
                        name="sales_status"
                        className="form-check-input"
                        value="C"
                        defaultChecked={data.sales_status === "C"}
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
                        defaultChecked={data.sales_status === "S"}
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
                        defaultChecked={data.sales_status === "E"}
                      />
                      <label className="form-check-label" htmlFor="sales_status_e">
                        판매종료
                      </label>
                    </div>
                  </div>
                </div>

                <div className="row mb-2">
                  <label htmlFor="coming_soon" className="col-2 col-form-label bg-light border">
                    * 출시여부
                  </label>
                  <div className="col-10 mt-1">
                    <div className="row gy-0 gx-2 align-items-center">
                      <div className="col-auto">
                        <div className="form-check">
                          <input
                            type="radio"
                            id="coming_soon_c"
                            name="coming_soon"
                            className="form-check-input"
                            value="Y"
                            defaultChecked={data.coming_soon === "Y"}
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
                          defaultValue={data.coming_soon_date}
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
                            defaultChecked={data.coming_soon !== "Y"}
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
                          defaultValue={data.release_date}
                          placeholder="출시일"
                          containerId="datepicker1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="title_code" className="col-2 col-form-label bg-light border">
                    * 상품정보 제공고시 품목 구분
                  </label>
                  <div className="col-10 border-bottom border-end border-top">
                    <div className="form-check form-check-inline mt-1">
                      <input
                        type="radio"
                        id="title_code_33"
                        name="title_code"
                        className="form-check-input"
                        value="33"
                        defaultChecked={data.title_code === "33"}
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
                        defaultChecked={data.title_code === "12"}
                      />
                      <label className="form-check-label" htmlFor="title_code_12">
                        (12) 소형전자
                      </label>
                    </div>
                  </div>
                </div>
                {isDigital && (
                  <div className="row mb-2">
                    <label htmlFor="steam_appid" className="col-2 col-form-label bg-light border">
                      Steam AppID
                    </label>
                    <div className="col-3">
                      <input
                        type="text"
                        className="form-control"
                        id="steam_appid"
                        name="steam_appid"
                        defaultValue={data.steam_appid}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="card-footer p-1">
                <div className="text-end">
                  {/* legacy: product_viewer면 submit 숨김. */}
                  {!productViewer && (
                    <button type="submit" className="btn btn-primary btn-sm shadow-none">
                      <i className="mdi mdi-content-save font-16" /> 대표상품 기본정보 저장
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
