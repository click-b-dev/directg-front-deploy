import { useEffect, useRef, useState } from "react";
import {
  useDescriptionV2,
  useSaveDescriptionField,
  useSaveDescriptionV2,
  useSyncDescription,
  useSyncDescriptionV2,
  type TitleDescriptionV2,
} from "@entities/goods-title";
import { TitleSubNav } from "@widgets/title-sub-nav";
import { MarkdownEditor, SmartEditor, type SmartEditorHandle } from "@shared/ui";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type TitleDescriptionV2ScreenProps = { titleId: number };

// legacy(운영) goods/title_description_register_v2.php — 상세설명 설정(병합 페이지).
// 운영에선 v1/v2 메뉴가 하나로 통합: 마크다운 필드 + 상세설명(SmartEditor2).
export const TitleDescriptionV2Screen = ({ titleId }: TitleDescriptionV2ScreenProps) => {
  const { data, dataUpdatedAt } = useDescriptionV2(titleId);

  useEffect(() => {
    document.title = "대표상품 상세설명 설정";
  }, []);

  if (!data) {
    return null;
  }
  // sync 후 refetch되면 key 변경 → 에디터(EasyMDE/SmartEditor2) remount(legacy reload와 동일).
  return <DescriptionForm key={dataUpdatedAt} data={data} />;
};

// 마크다운/텍스트 필드(독립 저장). 상세설명(ver2)만 SmartEditor2.
type PlainFieldKey =
  | "dgkr_description"
  | "requirements"
  | "legal_text"
  | "short_description"
  | "region_msg";

const DescriptionForm = ({ data }: { data: TitleDescriptionV2 }) => {
  const editorRef = useRef<SmartEditorHandle>(null);
  const [fields, setFields] = useState<Record<PlainFieldKey, string>>({
    dgkr_description: data.dgkr_description,
    requirements: data.requirements,
    legal_text: data.legal_text,
    short_description: data.short_description,
    region_msg: data.region_msg,
  });
  const saveField = useSaveDescriptionField();
  const saveV2 = useSaveDescriptionV2();
  const syncMd = useSyncDescription();
  const syncV2 = useSyncDescriptionV2();
  const productViewer = useProductViewer();

  const setField = (key: PlainFieldKey, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));
  const onSaveField = (field: PlainFieldKey) =>
    saveField.mutate({ titleId: data.title_id, payload: { field, value: fields[field] } });
  const onSaveV2 = () =>
    saveV2.mutate({
      titleId: data.title_id,
      payload: { value: editorRef.current?.getContent() ?? data.description_v2 },
    });

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
                <li className="breadcrumb-item active">상세설명 설정</li>
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
          <TitleSubNav titleId={data.title_id} titleCode="33" active="description" />
        </div>
        <div className="col-10">
          <div className="row">
            {/* col-8: 독점설명 / 상세설명(ver2) / 시스템요구사항 / 권리표기 */}
            <div className="col-8">
              <div className="card">
                <h5 className="card-header bg-secondary text-white">독점설명</h5>
                <div className="card-body">
                  <MarkdownEditor
                    value={fields.dgkr_description}
                    onChange={(v) => setField("dgkr_description", v)}
                  />
                </div>
                <div className="card-footer">
                  <div className="float-end">
                    {!productViewer && (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary shadow-none"
                        onClick={() => onSaveField("dgkr_description")}
                      >
                        독점 설명 저장
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 상세설명 (ver2) — SmartEditor2 */}
              <div className="card">
                <h5 className="card-header bg-secondary text-white">상세설명 (ver2)</h5>
                <div className="card-body p-2">
                  <SmartEditor ref={editorRef} initialValue={data.description_v2} />
                </div>
                <div className="card-footer">
                  {/* legacy: product_viewer면 sync/저장 모두 숨김. */}
                  {!productViewer && (
                    <>
                      <div className="float-start">
                        <button
                          type="button"
                          className="btn btn-info shadow-none btn_description_sync_v2"
                          onClick={() => syncV2.mutate(data.title_id)}
                        >
                          <i className="uil uil-refresh" />
                        </button>
                      </div>
                      <div className="float-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-primary shadow-none"
                          onClick={onSaveV2}
                        >
                          상세설명 (ver2) 저장
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="card">
                <h5 className="card-header bg-secondary text-white">시스템요구사항</h5>
                <div className="card-body">
                  <MarkdownEditor
                    value={fields.requirements}
                    onChange={(v) => setField("requirements", v)}
                  />
                </div>
                <div className="card-footer">
                  {!productViewer && (
                    <>
                      <button
                        type="button"
                        className="btn btn-info shadow-none"
                        onClick={() =>
                          syncMd.mutate({
                            titleId: data.title_id,
                            payload: { target: "requirements" },
                          })
                        }
                      >
                        <i className="uil uil-refresh" />
                      </button>
                      <div className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-primary shadow-none"
                          onClick={() => onSaveField("requirements")}
                        >
                          시스템요구사항 저장
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="card">
                <h5 className="card-header bg-secondary text-white">권리표기</h5>
                <div className="card-body font-14">
                  <MarkdownEditor
                    value={fields.legal_text}
                    onChange={(v) => setField("legal_text", v)}
                  />
                </div>
                <div className="card-footer">
                  <div className="text-end">
                    {!productViewer && (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary shadow-none"
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
                <h5 className="card-header bg-secondary text-white">짧은설명</h5>
                <div className="card-body p-2">
                  <textarea
                    id="short_description"
                    name="short_description"
                    className="form-control font-12"
                    rows={7}
                    value={fields.short_description}
                    onChange={(event) => setField("short_description", event.target.value)}
                  />
                </div>
                <div className="card-footer">
                  <div className="text-end">
                    {!productViewer && (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary shadow-none"
                        onClick={() => onSaveField("short_description")}
                      >
                        짧은설명 저장
                      </button>
                    )}
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
                    onChange={(event) => setField("region_msg", event.target.value)}
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
        </div>
      </div>
    </>
  );
};
