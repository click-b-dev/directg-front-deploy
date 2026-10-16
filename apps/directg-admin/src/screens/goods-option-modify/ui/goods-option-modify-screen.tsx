import { useEffect, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  useOption,
  useUpdateOption,
  type GoodsOption,
  type SaveGoodsOptionRequest,
} from "@entities/goods-option";
import { OptionSubNav } from "@widgets/option-sub-nav";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type GoodsOptionModifyScreenProps = { productCode: string };

// legacy goods/goods_option_modify.php — 옵션상품 기본정보 설정(옵션 sub-nav + 단일 폼).
export const GoodsOptionModifyScreen = ({ productCode }: GoodsOptionModifyScreenProps) => {
  const { data } = useOption(productCode);

  useEffect(() => {
    document.title = "옵션상품 기본정보 설정";
  }, []);

  if (!data) {
    return null;
  }
  return <OptionModifyForm data={data} />;
};

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
// legacy modify 순서: timedeal 이 randombox 앞(register와 순서 다름).
const GAME_TYPES = [
  ["game", "게임"],
  ["dlc", "DLC"],
  ["music", "사운드트랙"],
  ["bundle", "번들"],
  ["timedeal", "타임딜"],
  ["randombox", "랜덤박스"],
  ["accessories", "악세사리"],
  ["holomodels", "홀로모델"],
];
const OPTION_TYPES = [
  ["digital", "디지털상품"],
  ["retail", "실물상품"],
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

const OptionModifyForm = ({ data }: { data: GoodsOption }) => {
  const navigate = useNavigate();
  const updateOption = useUpdateOption();
  const productViewer = useProductViewer();
  // legacy: model_code/model_name 필드는 로드 시점 option_type=='retail'에서만 렌더(라이브 반영 아님).
  const isRetail = data.option_type === "retail";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const get = (name: string) => String(fd.get(name) ?? "");
    const payload: SaveGoodsOptionRequest = {
      product_code: get("product_code"),
      goods_sku: get("goods_sku"),
      product_name: get("product_name"),
      product_name_en: get("product_name_en"),
      keyword: get("keyword"),
      // retail 미렌더 시 필드 없음 → "" (legacy UPDATE 동일).
      model_code: get("model_code"),
      model_name: get("model_name"),
      product_platform: get("product_platform"),
      option_type: get("option_type"),
      game_type: get("game_type"),
      display_type: get("display_type"),
      // 미체크 토글은 FormData에서 빠짐 → "" (legacy 동작).
      spoken_korean: get("spoken_korean"),
      interface_korean: get("interface_korean"),
      subtitle_korean: get("subtitle_korean"),
      exclusive_korean: get("exclusive_korean"),
      steam_appid: get("steam_appid"),
      packageid: get("packageid"),
      bundleid: get("bundleid"),
    };
    // legacy: 저장 후 goods_option_modify.php 로 리다이렉트 = self reload.
    updateOption.mutate(
      { productCode: data.product_code, payload },
      {
        onSuccess: () =>
          navigate({
            to: "/goods/goods_option_modify",
            search: { product_code: payload.product_code },
          }),
      },
    );
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
                <li className="breadcrumb-item active">옵션상품 기본정보 설정</li>
              </ol>
            </div>
            <h4 className="page-title">옵션상품 기본정보 설정</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-2 mb-2 mb-sm-0">
          <OptionSubNav productCode={data.product_code} active="modify" gameType={data.game_type} />
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
              <div className="card-header bg-secondary text-white fw-bold font-15">
                옵션상품 기본정보
              </div>
              <div className="card-body">
                <TextRow
                  id="product_code"
                  label="* 옵션상품번호"
                  defaultValue={data.product_code}
                  required
                />
                <TextRow
                  id="goods_sku"
                  label="* 옵션상품 sku"
                  defaultValue={data.goods_sku}
                  readOnly
                />
                <TextRow
                  id="product_name"
                  label="* 옵션상품명(국문)"
                  defaultValue={data.product_name}
                />
                <TextRow
                  id="product_name_en"
                  label="* 옵션상품명(영문)"
                  defaultValue={data.product_name_en}
                />
                <TextRow id="keyword" label="* 검색키워드" defaultValue={data.keyword} />
                {isRetail && (
                  <>
                    <TextRow
                      id="model_code"
                      label="* 실물상품 모델코드"
                      defaultValue={data.model_code}
                    />
                    <TextRow
                      id="model_name"
                      label="* 실물상품 모델명"
                      defaultValue={data.model_name}
                    />
                  </>
                )}
                <SelectRow
                  id="product_platform"
                  label="* 플랫폼"
                  colClass="col-sm-6"
                  options={PLATFORMS}
                  defaultValue={data.product_platform}
                  required
                />
                <SelectRow
                  id="option_type"
                  label="* 옵션상품 유형"
                  options={OPTION_TYPES}
                  defaultValue={data.option_type}
                  required
                />
                <SelectRow
                  id="game_type"
                  label="* 옵션상품 구분"
                  options={GAME_TYPES}
                  defaultValue={data.game_type}
                  required
                />
                <SelectRow
                  id="display_type"
                  label="* 진열그룹"
                  options={DISPLAY_TYPES}
                  defaultValue={data.display_type}
                />
                <SwitchRow
                  id="spoken_korean"
                  label=" 음성 한국어"
                  checked={data.spoken_korean === "Y"}
                />
                <SwitchRow
                  id="interface_korean"
                  label=" 인터페이스 한국어"
                  checked={data.interface_korean === "Y"}
                />
                <SwitchRow
                  id="subtitle_korean"
                  label=" 자막 한국어"
                  checked={data.subtitle_korean === "Y"}
                />
                <SwitchRow
                  id="exclusive_korean"
                  label=" 독점 한국어"
                  checked={data.exclusive_korean === "Y"}
                />
                <SteamRow id="steam_appid" label="Steam App ID" defaultValue={data.steam_appid} />
                <SteamRow id="packageid" label="Steam Package ID" defaultValue={data.packageid} />
                <SteamRow id="bundleid" label="Steam Bundle ID" defaultValue={data.bundleid} />
              </div>
              <div className="card-footer">
                <div className="text-end">
                  {/* legacy: product_viewer면 저장 숨김. */}
                  {!productViewer && (
                    <button type="submit" className="btn btn-primary shadow-none">
                      옵션상품 저장
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
    <label htmlFor={id} className="col-sm-3 col-form-label bg-light">
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
