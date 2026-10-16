import { useEffect, useState } from "react";
import {
  useDescription,
  useSaveDescriptionField,
  useSyncDescription,
  type DescriptionFieldKey,
  type DescriptionFields,
  type TitleDescription,
} from "@entities/goods-title";
import { TitleSubNav } from "@widgets/title-sub-nav";
import { useProductViewer } from "@shared/lib/use-product-viewer";
import { MarkdownEditor } from "@shared/ui";

type TitleDescriptionScreenProps = { titleId: number };

// legacy goods/title_description_register.php — 대표상품 상세설명 설정.
export const TitleDescriptionScreen = ({ titleId }: TitleDescriptionScreenProps) => {
  const { data, dataUpdatedAt } = useDescription(titleId);

  useEffect(() => {
    document.title = "대표상품 상세설명 설정";
  }, []);

  if (!data) {
    return null;
  }
  // sync 후 invalidate로 refetch되면 key 변경 → 에디터 remount(legacy reload와 동일).
  return <DescriptionForm key={dataUpdatedAt} data={data} />;
};

const DescriptionForm = ({ data }: { data: TitleDescription }) => {
  const [fields, setFields] = useState<DescriptionFields>(data.description);
  const saveField = useSaveDescriptionField();
  const syncMutation = useSyncDescription();
  const productViewer = useProductViewer();

  const setField = (key: DescriptionFieldKey, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));
  const onSave = (field: DescriptionFieldKey) => {
    saveField.mutate({ titleId: data.title_id, payload: { field, value: fields[field] } });
  };
  const onSync = (target: "description" | "requirements") => {
    syncMutation.mutate({ titleId: data.title_id, payload: { target } });
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
            {/* col-8: 독점설명/상세설명/시스템요구사항/권리표기 */}
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
                        onClick={() => onSave("dgkr_description")}
                      >
                        독점 설명 저장
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="card">
                <h5 className="card-header bg-secondary text-white">상세설명</h5>
                <div className="card-body">
                  <MarkdownEditor value={fields.detail} onChange={(v) => setField("detail", v)} />
                </div>
                <div className="card-footer">
                  {!productViewer && (
                    <>
                      <div className="float-start">
                        <button
                          type="button"
                          className="btn btn-info shadow-none btn_description_sync"
                          onClick={() => onSync("description")}
                        >
                          <i className="uil uil-refresh" />
                        </button>
                      </div>
                      <div className="float-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-primary shadow-none"
                          onClick={() => onSave("detail")}
                        >
                          상세설명 저장
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
                        onClick={() => onSync("requirements")}
                      >
                        <i className="uil uil-refresh" />
                      </button>
                      <div className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-primary shadow-none"
                          onClick={() => onSave("requirements")}
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
                        onClick={() => onSave("legal_text")}
                      >
                        권리표기 저장
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* col-4: 짧은설명/지역제한 안내문구 */}
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
                        onClick={() => onSave("short_description")}
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
                            onClick={() => onSave("region_msg")}
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
