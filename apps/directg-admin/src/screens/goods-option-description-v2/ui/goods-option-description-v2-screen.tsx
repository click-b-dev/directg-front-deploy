import { useEffect, useRef, useState } from "react";
import {
  useOptionDescriptionV2,
  useSaveOptionDescriptionField,
  useSaveOptionDescriptionV2,
  useSyncOptionDescription,
  useSyncOptionDescriptionV2,
  type OptionDescriptionFieldKey,
  type OptionDescriptionV2,
} from "@entities/goods-option";
import { OptionSubNav } from "@widgets/option-sub-nav";
import { MarkdownEditor, SmartEditor, type SmartEditorHandle } from "@shared/ui";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type GoodsOptionDescriptionV2ScreenProps = { productCode: string };

// legacy(운영) goods/goods_option_description_register_v2.php — 옵션상품 상세설명 설정(병합 페이지).
// 운영에선 v1/v2 메뉴가 단일 "상세설명 설정"으로 통합: 상세설명(SE2) + 시스템요구사항/권리표기(마크다운) + 짧은설명/지역제한(textarea).
export const GoodsOptionDescriptionV2Screen = ({
  productCode,
}: GoodsOptionDescriptionV2ScreenProps) => {
  const { data, dataUpdatedAt } = useOptionDescriptionV2(productCode);

  useEffect(() => {
    document.title = "옵션상품 상세설명 등록/수정";
  }, []);

  if (!data) {
    return null;
  }
  // sync 후 refetch되면 key 변경 → 에디터(EasyMDE/SmartEditor2) remount(legacy location.reload와 동일).
  return <DescriptionForm key={dataUpdatedAt} productCode={productCode} data={data} />;
};

const DescriptionForm = ({
  productCode,
  data,
}: {
  productCode: string;
  data: OptionDescriptionV2;
}) => {
  const editorRef = useRef<SmartEditorHandle>(null);
  const [fields, setFields] = useState<Record<OptionDescriptionFieldKey, string>>({
    requirements: data.requirements,
    legal_text: data.legal_text,
    short_description: data.short_description,
    region_msg: data.region_msg,
  });
  const saveV2 = useSaveOptionDescriptionV2(productCode);
  const saveField = useSaveOptionDescriptionField(productCode);
  const syncV2 = useSyncOptionDescriptionV2(productCode);
  const syncRequirements = useSyncOptionDescription(productCode);
  const productViewer = useProductViewer();

  const setField = (key: OptionDescriptionFieldKey, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));
  // legacy: 각 필드 alert-only(미리로드).
  const onSaveField = (field: OptionDescriptionFieldKey) =>
    saveField.mutate({ field, value: fields[field] });
  const onSaveV2 = () =>
    saveV2.mutate({ value: editorRef.current?.getContent() ?? data.description_v2 });

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
                    옵션상품 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">상세설명 설정</li>
              </ol>
            </div>
            {/* legacy: page-title 클래스 아님(빈 class). 뱃지 3개 + sku small. */}
            <h4 className="">
              {data.product_name} <span className="badge bg-dark">{data.platform_name}</span>{" "}
              <span className="badge bg-dark">{data.game_type}</span>{" "}
              <span className="badge bg-dark">{data.display_type}</span>
            </h4>
            <small>sku: {data.goods_sku}</small>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-2 mb-2 mb-sm-0">
          <OptionSubNav productCode={productCode} active="description" gameType={data.game_type} />
        </div>
        <div className="col-10">
          <div className="row">
            {/* col-8: 상세설명(ver2) / 시스템요구사항 / 권리표기 */}
            <div className="col-8">
              {/* 옵션상품 상세설명 (ver2) — SmartEditor2 */}
              <div className="card">
                <h5 className="card-header bg-secondary text-white">옵션상품 상세설명 (ver2)</h5>
                <div className="card-body p-2">
                  <SmartEditor ref={editorRef} initialValue={data.description_v2} />
                  <div className="row justify-content-between">
                    <div className="col-4">
                      {/* legacy: product_viewer면 sync/저장 숨김. */}
                      {!productViewer && (
                        <button
                          type="button"
                          className="btn btn-info shadow-none btn_steam_sync"
                          onClick={() => syncV2.mutate()}
                        >
                          <i className="uil uil-refresh" />
                        </button>
                      )}
                    </div>
                    <div className="offset-md-4 col-4">
                      <div className="text-end">
                        {!productViewer && (
                          <button
                            type="button"
                            className="btn btn-primary shadow-none"
                            onClick={onSaveV2}
                          >
                            상세설명 저장
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 옵션상품 시스템 요구사항 — 마크다운 */}
              <div className="card">
                <h5 className="card-header bg-secondary text-white">옵션상품 시스템 요구사항</h5>
                <div className="card-body p-2">
                  <MarkdownEditor
                    value={fields.requirements}
                    onChange={(v) => setField("requirements", v)}
                  />
                  <div className="row justify-content-between">
                    <div className="col-4">
                      {!productViewer && (
                        <button
                          type="button"
                          className="btn btn-info shadow-none btn_steam_sync_system"
                          onClick={() => syncRequirements.mutate({ target: "requirements" })}
                        >
                          <i className="uil uil-refresh" />
                        </button>
                      )}
                    </div>
                    <div className="offset-md-4 col-4">
                      <div className="text-end">
                        {!productViewer && (
                          <button
                            type="button"
                            className="btn btn-primary shadow-none"
                            onClick={() => onSaveField("requirements")}
                          >
                            시스템 요구사항 저장
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 권리표기 — 마크다운 */}
              <div className="card">
                <h5 className="card-header bg-secondary text-white">권리표기</h5>
                <div className="card-body p-2 font-14">
                  <MarkdownEditor
                    value={fields.legal_text}
                    onChange={(v) => setField("legal_text", v)}
                  />
                  <div className="text-end">
                    {!productViewer && (
                      <button
                        type="button"
                        className="btn btn-primary mt-2 shadow-none"
                        onClick={() => onSaveField("legal_text")}
                      >
                        권리표기 저장
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* col-4: 짧은설명 / 지역제한 안내문구 */}
            <div className="col-4">
              <div className="card">
                <h5 className="card-header bg-secondary text-white">옵션상품 짧은설명</h5>
                <div className="card-body p-2">
                  <textarea
                    id="short_description"
                    name="short_description"
                    className="form-control font-14"
                    rows={8}
                    value={fields.short_description}
                    onChange={(e) => setField("short_description", e.target.value)}
                  />
                  <div className="row justify-content-between mt-2">
                    <div className="col-12">
                      <div className="text-end">
                        {!productViewer && (
                          <button
                            type="button"
                            className="btn btn-primary shadow-none"
                            onClick={() => onSaveField("short_description")}
                          >
                            짧은설명 저장
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h5 className="card-header bg-secondary text-white">지역제한 안내문구</h5>
                <div className="card-body p-2">
                  <textarea
                    id="region_msg"
                    name="region_msg"
                    className="form-control font-14"
                    rows={8}
                    value={fields.region_msg}
                    onChange={(e) => setField("region_msg", e.target.value)}
                  />
                  <div className="row justify-content-between mt-2">
                    <div className="col-12">
                      <div className="text-end">
                        {!productViewer && (
                          <button
                            type="button"
                            className="btn btn-primary shadow-none"
                            onClick={() => onSaveField("region_msg")}
                          >
                            지역제한 안내문구
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* end row */}
        </div>
      </div>
    </>
  );
};
