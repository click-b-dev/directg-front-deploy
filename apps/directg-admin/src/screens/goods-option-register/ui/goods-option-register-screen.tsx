import { useEffect, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  useCreateOption,
  useNewOption,
  useOption,
  useUpdateOption,
  type GoodsOption,
  type SaveGoodsOptionRequest,
} from "@entities/goods-option";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type GoodsOptionRegisterScreenProps = { productCode: string };

// legacy goods/goods_option_register.php — 옵션상품 등록/수정(product_code 유무로 mode 결정).
export const GoodsOptionRegisterScreen = ({ productCode }: GoodsOptionRegisterScreenProps) => {
  useEffect(() => {
    document.title = "옵션상품 등록";
  }, []);

  if (productCode) {
    return <ModifyLoader productCode={productCode} />;
  }
  return <RegisterLoader />;
};

const RegisterLoader = () => {
  const { data } = useNewOption();
  if (!data) {
    return null;
  }
  return <OptionForm mode="register" initial={emptyOption(data.product_code, data.goods_sku)} />;
};

const ModifyLoader = ({ productCode }: { productCode: string }) => {
  const { data } = useOption(productCode);
  if (!data) {
    return null;
  }
  // legacy: modify 시 option_type을 selected 처리하지 않음(항상 미선택) — 그대로 재현.
  return <OptionForm mode="modify" initial={{ ...data, option_type: "" }} />;
};

const emptyOption = (productCode: string, goodsSku: string): GoodsOption => ({
  product_code: productCode,
  goods_sku: goodsSku,
  product_name: "",
  product_name_en: "",
  keyword: "",
  model_code: "",
  model_name: "",
  product_platform: "",
  option_type: "",
  game_type: "",
  display_type: "",
  spoken_korean: "",
  interface_korean: "",
  subtitle_korean: "",
  exclusive_korean: "",
  steam_appid: "",
  packageid: "",
  bundleid: "",
});

const PLATFORMS = [
  ["1", "Steam"],
  ["34", "Epic"],
  ["30", "Ubisoft Connect"],
  ["35", "Rockstar Games Launcher"],
  ["33", "Bethesda"],
  ["3", "Origin"],
  ["51", "홀로모델"],
  ["32", "기타"],
];
const OPTION_TYPES = [
  ["digital", "디지털상품"],
  ["retail", "실물상품"],
];
const GAME_TYPES = [
  ["game", "게임"],
  ["dlc", "DLC"],
  ["music", "사운드트랙"],
  ["bundle", "번들"],
  ["randombox", "랜덤박스"],
  ["timedeal", "타임딜"],
  ["accessories", "악세사리"],
  ["holomodels", "홀로모델"],
];
const DISPLAY_TYPES = [
  ["basic", "기본게임"],
  ["edition", "에디션"],
  ["multi", "멀티팩"],
  ["dlc", "DLC"],
  ["game_bundle", "기본게임번들"],
  ["dlc_bundle", "DLC번들"],
  ["etc_bundle", "기타번들"],
  ["timedeal", "타임딜"],
  ["holomodels", "홀로모델"],
  ["holomodelsdlc", "홀로모델 DLC"],
  ["holomodelsedition", "홀로모델 에디션"],
];

const OptionForm = ({ mode, initial }: { mode: "register" | "modify"; initial: GoodsOption }) => {
  const navigate = useNavigate();
  const createOption = useCreateOption();
  const updateOption = useUpdateOption();
  const productViewer = useProductViewer();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const get = (name: string) => String(fd.get(name) ?? "");
    const payload: SaveGoodsOptionRequest = {
      product_code: get("product_code"),
      goods_sku: get("goods_sku"),
      product_name: get("product_name"),
      product_name_en: get("product_name_en"),
      // register 폼 미렌더 — legacy INSERT도 이 값들은 빈값.
      keyword: get("keyword"),
      model_code: get("model_code"),
      model_name: get("model_name"),
      product_platform: get("product_platform"),
      option_type: get("option_type"),
      game_type: get("game_type"),
      display_type: get("display_type"),
      spoken_korean: get("spoken_korean"),
      interface_korean: get("interface_korean"),
      subtitle_korean: get("subtitle_korean"),
      exclusive_korean: get("exclusive_korean"),
      steam_appid: get("steam_appid"),
      packageid: get("packageid"),
      bundleid: get("bundleid"),
    };
    // legacy 리다이렉트(goods_option_list/modify)는 미이관 → 저장 후 self(modify)로 이동.
    const toSelf = () =>
      navigate({
        to: "/goods/goods_option_register",
        search: { product_code: payload.product_code },
      });
    if (mode === "register") {
      createOption.mutate(payload, { onSuccess: toSelf });
    } else {
      updateOption.mutate({ productCode: initial.product_code, payload }, { onSuccess: toSelf });
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
                    옵션상품 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">옵션상품 등록</li>
              </ol>
            </div>
            <h4 className="page-title">옵션상품 등록</h4>
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
        <div className="row">
          {/* col-7: 기본정보 */}
          <div className="col-7">
            <div className="card border border-1">
              <div className="card-header bg-secondary text-white fw-bold font-15">
                옵션상품 기본정보
              </div>
              <div className="card-body">
                <TextRow
                  id="product_code"
                  label="* 옵션상품번호"
                  defaultValue={initial.product_code}
                  required
                />
                <TextRow
                  id="goods_sku"
                  label="* 옵션상품 sku"
                  defaultValue={initial.goods_sku}
                  readOnly
                />
                <TextRow
                  id="product_name"
                  label="* 옵션상품명(국문)"
                  defaultValue={initial.product_name}
                />
                <TextRow
                  id="product_name_en"
                  label="* 옵션상품명(영문)"
                  defaultValue={initial.product_name_en}
                />
                <SelectRow
                  id="product_platform"
                  label="* 게임플랫폼"
                  colClass="col-sm-6"
                  options={PLATFORMS}
                  defaultValue={initial.product_platform}
                  required
                />
                <SelectRow
                  id="option_type"
                  label="* 옵션상품 유형"
                  options={OPTION_TYPES}
                  defaultValue={initial.option_type}
                  required
                />
                <SelectRow
                  id="game_type"
                  label="* 옵션상품 구분"
                  options={GAME_TYPES}
                  defaultValue={initial.game_type}
                  required
                />
                <SelectRow
                  id="display_type"
                  label="* 진열그룹"
                  options={DISPLAY_TYPES}
                  defaultValue={initial.display_type}
                />
              </div>
            </div>
          </div>

          {/* col-5: 부가정보 */}
          <div className="col-5">
            <div className="card border">
              <div className="card-header bg-secondary text-white fw-bold font-15">
                옵션상품 부가정보
              </div>
              <div className="card-body">
                <SwitchRow
                  id="spoken_korean"
                  label=" 음성 한국어"
                  checked={initial.spoken_korean === "Y"}
                />
                <SwitchRow
                  id="interface_korean"
                  label=" 인터페이스 한국어"
                  checked={initial.interface_korean === "Y"}
                />
                <SwitchRow
                  id="subtitle_korean"
                  label=" 자막 한국어"
                  checked={initial.subtitle_korean === "Y"}
                />
                <SwitchRow
                  id="exclusive_korean"
                  label=" 독점 한국어"
                  checked={initial.exclusive_korean === "Y"}
                />
                <SteamRow
                  id="steam_appid"
                  label="Steam App ID"
                  defaultValue={initial.steam_appid}
                />
                <SteamRow
                  id="packageid"
                  label="Steam Package ID"
                  defaultValue={initial.packageid}
                />
                <SteamRow id="bundleid" label="Steam Bundle ID" defaultValue={initial.bundleid} />
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-2">
          <div className="text-end">
            {/* legacy: product_viewer면 저장 숨김. */}
            {!productViewer && (
              <button type="submit" className="btn btn-primary shadow-none">
                옵션상품 저장
              </button>
            )}
          </div>
        </div>
      </form>
    </>
  );
};

const TextRow = ({
  id,
  label,
  defaultValue,
  required,
  readOnly,
}: {
  id: string;
  label: string;
  defaultValue: string;
  required?: boolean;
  readOnly?: boolean;
}) => (
  <div className="mb-2 row">
    <label htmlFor={id} className="col-sm-3 col-form-label bg-light">
      {label}
    </label>
    <div className="col-sm-9">
      <input
        type="text"
        className="form-control"
        id={id}
        name={id}
        defaultValue={defaultValue}
        required={required}
        readOnly={readOnly}
      />
    </div>
  </div>
);

const SelectRow = ({
  id,
  label,
  options,
  defaultValue,
  required,
  colClass = "col-4",
}: {
  id: string;
  label: string;
  options: string[][];
  defaultValue: string;
  required?: boolean;
  colClass?: string;
}) => (
  <div className="row mb-2">
    <label htmlFor={id} className="col-sm-3 col-form-label bg-light">
      {label}
    </label>
    <div className={colClass}>
      <select
        id={id}
        name={id}
        className="form-select"
        defaultValue={defaultValue}
        required={required}
      >
        <option value="">:::선택:::</option>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const SwitchRow = ({ id, label, checked }: { id: string; label: string; checked: boolean }) => (
  <div className="row mb-2">
    <label htmlFor={id} className="col-3 col-form-label bg-light">
      {label}
    </label>
    <div className="col-4">
      <div className="mt-1">
        <input
          type="checkbox"
          id={id}
          name={id}
          value="Y"
          data-switch="success"
          defaultChecked={checked}
        />
        <label htmlFor={id} data-on-label="Y" data-off-label="N" className="mb-0 d-block" />
      </div>
    </div>
  </div>
);

const SteamRow = ({
  id,
  label,
  defaultValue,
}: {
  id: string;
  label: string;
  defaultValue: string;
}) => (
  <div className="row mb-2">
    <label htmlFor={id} className="col-sm-3 col-form-label bg-light">
      {label}
    </label>
    <div className="col-3">
      <input
        type="text"
        className="form-control"
        id={id}
        name={id}
        placeholder={label}
        defaultValue={defaultValue}
      />
    </div>
  </div>
);
