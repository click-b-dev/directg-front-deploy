import { useEffect, type FormEvent } from "react";
import {
  useAttributeSet,
  useUpdateAttributeSet,
  useUpdateTradeTerms,
  type AttributeSet,
  type AttributeSetRequest,
  type TitleAttributeSet,
  type TradeTermsRequest,
} from "@entities/goods-title";
import { TitleSubNav } from "@widgets/title-sub-nav";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type TitleAttributeSetScreenProps = { titleId: number };

// legacy goods/title_attribute_set_register.php — 상품정보 제공고시 + 거래조건 설정.
export const TitleAttributeSetScreen = ({ titleId }: TitleAttributeSetScreenProps) => {
  const { data } = useAttributeSet(titleId);

  useEffect(() => {
    document.title = "대표상품 상품정보 제공고시 설정";
  }, []);

  if (!data) {
    return null;
  }
  return <AttributeSetForms data={data} />;
};

// legacy col-sm-3 라벨 / col-sm-9 입력 행.
const FieldRow = ({
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
    <div className="col-sm-9">
      <input type="text" className="form-control" id={id} name={id} defaultValue={defaultValue} />
    </div>
  </div>
);

// 제공고시 폼 필드셋: 현재 title_code에 없는 값은 ""로 전송(legacy filter_input null).
const emptyAttributeRequest = (): AttributeSetRequest => ({
  model_name: "",
  product_name: "",
  kc_safety_infomartion: "",
  rated_voltage: "",
  power: "",
  manufacturing_date: "",
  manufacturer: "",
  manufacture_country: "",
  size: "",
  weight: "",
  main_requirements: "",
  warranty_service: "",
  as_information: "",
  terms_use: "",
  applicable_period: "",
  product_supply_method: "",
  cancel_right: "",
});

// legacy card-footer(제공고시 저장). title_code에 따라 body 안/밖 위치가 달라진다.
// legacy: product_viewer면 저장 버튼 숨김.
const AttributeSaveFooter = ({ productViewer }: { productViewer: boolean }) => (
  <div className="card-footer">
    <div className="text-end">
      {!productViewer && (
        <button type="submit" className="btn btn-primary shadow-none">
          상품 정보 제공 고시 저장
        </button>
      )}
    </div>
  </div>
);

const AttributeSetForms = ({ data }: { data: TitleAttributeSet }) => {
  const attr = data.attribute;
  const updateAttribute = useUpdateAttributeSet();
  const updateTrade = useUpdateTradeTerms();
  const productViewer = useProductViewer();

  const handleAttributeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const get = (name: string) => String(fd.get(name) ?? "");
    const payload: AttributeSetRequest = {
      ...emptyAttributeRequest(),
      model_name: get("model_name"),
      product_name: get("product_name"),
      kc_safety_infomartion: get("kc_safety_infomartion"),
      rated_voltage: get("rated_voltage"),
      power: get("power"),
      manufacturing_date: get("manufacturing_date"),
      manufacturer: get("manufacturer"),
      manufacture_country: get("manufacture_country"),
      size: get("size"),
      weight: get("weight"),
      main_requirements: get("main_requirements"),
      warranty_service: get("warranty_service"),
      as_information: get("as_information"),
      terms_use: get("terms_use"),
      applicable_period: get("applicable_period"),
      product_supply_method: get("product_supply_method"),
      cancel_right: get("cancel_right"),
    };
    updateAttribute.mutate({ titleId: data.title_id, payload });
  };

  const handleTradeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const payload: TradeTermsRequest = {
      delivery_method_info: String(fd.get("delivery_method_info") ?? ""),
      as_information2: String(fd.get("as_information2") ?? ""),
    };
    updateTrade.mutate({ titleId: data.title_id, payload });
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
                <li className="breadcrumb-item active">상품정보 제공고시 설정</li>
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
          <TitleSubNav titleId={data.title_id} titleCode={data.title_code} active="attribute_set" />
        </div>
        <div className="col-10">
          {/* 폼1: 품목별 재화 등에 관한 정보 (title_code 분기) */}
          <form
            id="frm2"
            name="frm2"
            className="form-horizontal"
            encType="multipart/form-data"
            onSubmit={handleAttributeSubmit}
          >
            <div className="card">
              <div className="card-header bg-secondary text-white fw-bold font-15">
                품목별 재화 등에 관한 정보 (상품 정보 제공 고시)
              </div>
              {/* legacy: title_code==12만 card-body를 닫고 footer를 형제로 둠. 33/그 외는
                  card-body를 안 닫아 footer가 body 안에 중첩(버튼이 body 패딩 안쪽으로 들여쓰기). 그대로 재현. */}
              {data.title_code === "12" ? (
                <>
                  <div className="card-body">
                    <ElectronicsFields attr={attr} />
                  </div>
                  <AttributeSaveFooter productViewer={productViewer} />
                </>
              ) : (
                <div className="card-body">
                  {data.title_code === "33" && <DigitalFields attr={attr} />}
                  <AttributeSaveFooter productViewer={productViewer} />
                </div>
              )}
            </div>
          </form>

          {/* 폼2: 거래조건에 관한 정보 (title_code 무관) */}
          <form id="frm3" name="frm3" className="form-horizontal" onSubmit={handleTradeSubmit}>
            <div className="card">
              <div className="card-header bg-secondary text-white fw-bold font-15">
                거래조건에 관한 정보
              </div>
              <div className="card-body">
                <FieldRow
                  id="delivery_method_info"
                  label="* 재화 등의 배송방법에 관한 정보"
                  defaultValue={attr.delivery_method_info}
                />
                <FieldRow
                  id="as_information2"
                  label="* 재화 등의 A/S 관련 전화번호"
                  defaultValue={attr.as_information2}
                />
              </div>
              <div className="card-footer">
                <div className="text-end">
                  {!productViewer && (
                    <button type="submit" className="btn btn-primary shadow-none">
                      거래조건에 관한 정보 저장
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

// legacy case "33": 디지털 콘텐츠(게임)
const DigitalFields = ({ attr }: { attr: AttributeSet }) => (
  <>
    <FieldRow id="manufacturer" label="* 제작자/공급자" defaultValue={attr.manufacturer} />
    <FieldRow id="terms_use" label="* 이용조건" defaultValue={attr.terms_use} />
    <FieldRow id="applicable_period" label="* 이용기간" defaultValue={attr.applicable_period} />
    <FieldRow
      id="product_supply_method"
      label="* 상품 제공 방식"
      defaultValue={attr.product_supply_method}
    />
    <FieldRow
      id="main_requirements"
      label="* 최소 시스템 사양, 필수 소프트웨어"
      defaultValue={attr.main_requirements}
    />
    <FieldRow
      id="cancel_right"
      label="* 청약철회 또는 계약의 해제/해지에 따른 효과"
      defaultValue={attr.cancel_right}
    />
    <FieldRow
      id="as_information"
      label="* 소비자 상담 관련 전화번호"
      defaultValue={attr.as_information}
    />
  </>
);

// legacy case "12": 소형전자
const ElectronicsFields = ({ attr }: { attr: AttributeSet }) => (
  <>
    <FieldRow id="model_name" label="* 모델명" defaultValue={attr.model_name} />
    <FieldRow id="product_name" label="*  품명" defaultValue={attr.product_name} />
    <FieldRow
      id="kc_safety_infomartion"
      label="* KC 인증정보"
      defaultValue={attr.kc_safety_infomartion}
    />
    <FieldRow id="rated_voltage" label="* 정격전압" defaultValue={attr.rated_voltage} />
    <FieldRow id="power" label="* 소비전력" defaultValue={attr.power} />
    <FieldRow id="size" label="* 크기(mm)" defaultValue={attr.size} />
    <FieldRow id="weight" label="* 무게(kg)" defaultValue={attr.weight} />
    <FieldRow
      id="manufacturing_date"
      label="* 동일모델의 출시년월"
      defaultValue={attr.manufacturing_date}
    />
    <FieldRow id="manufacturer" label="* 제조자/수입자" defaultValue={attr.manufacturer} />
    <FieldRow id="manufacture_country" label="* 제조국" defaultValue={attr.manufacture_country} />
    <FieldRow id="main_requirements" label="* 주요사양" defaultValue={attr.main_requirements} />
    <FieldRow id="warranty_service" label="* 품질보증기준" defaultValue={attr.warranty_service} />
    <FieldRow
      id="as_information"
      label="* A/S 책임자(전화번호)"
      defaultValue={attr.as_information}
    />
  </>
);
