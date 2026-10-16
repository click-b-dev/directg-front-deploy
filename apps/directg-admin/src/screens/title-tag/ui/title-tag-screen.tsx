import { Fragment, useEffect, type FormEvent } from "react";
import {
  useTags,
  useUpdateTags,
  type TagGroup,
  type TagsRequest,
  type TitleTags,
} from "@entities/goods-title";
import { TitleSubNav } from "@widgets/title-sub-nav";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type TitleTagScreenProps = { titleId: number };

// legacy goods/title_tag_register.php — 대표상품 태그정보 설정.
export const TitleTagScreen = ({ titleId }: TitleTagScreenProps) => {
  const { data } = useTags(titleId);

  useEffect(() => {
    document.title = "대표상품 태그정보 설정";
  }, []);

  if (!data) {
    return null;
  }
  return <TagForm data={data} />;
};

// legacy: 그룹 접두어로 섹션 카드 분류. genre[] = G0*·HG*, category[] = C*·HC*·P*·R*.
const startsWith = (prefix: string) => (group: TagGroup) => group.group_code.startsWith(prefix);

// 한 섹션 카드(여러 그룹: 라벨 + inline checkbox).
const TagSection = ({
  title,
  groups,
  field,
}: {
  title: string;
  groups: TagGroup[];
  field: "genre" | "category";
}) => (
  <div className="card">
    <h5 className="card-header bg-secondary text-white">{title}</h5>
    <div className="card-body px-3 py-2 font-13">
      <div className="row mb-2 border-top">
        {groups.map((group) => (
          <Fragment key={group.group_code}>
            <label className="col-sm-2 col-form-label bg-light border">{group.group_name}</label>
            <div className="col-sm-10 pt-2 pb-1 border-bottom border-end">
              {group.tags.map((tag) => (
                <div className="form-check form-check-inline pb-1" key={tag.tag_code}>
                  <input
                    type="checkbox"
                    id={`${field}${tag.tag_code}`}
                    name={`${field}[]`}
                    className="form-check-input"
                    value={tag.tag_code}
                    defaultChecked={tag.checked}
                  />
                  <label className="form-check-label" htmlFor={`${field}${tag.tag_code}`}>
                    {tag.tag_name}
                  </label>
                </div>
              ))}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  </div>
);

const TagForm = ({ data }: { data: TitleTags }) => {
  const updateTags = useUpdateTags();
  const productViewer = useProductViewer();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const payload: TagsRequest = {
      genre: fd.getAll("genre[]").map(String),
      category: fd.getAll("category[]").map(String),
    };
    updateTags.mutate({ titleId: data.title_id, payload });
  };

  const groups = data.groups;

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
                <li className="breadcrumb-item active">태그정보 설정</li>
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
          <TitleSubNav titleId={data.title_id} titleCode={data.title_code} active="tag" />
        </div>
        <div className="col-10">
          <form id="frm" name="frm" className="form-horizontal" onSubmit={handleSubmit}>
            <div className="row mb-2">
              <div className="text-end">
                {/* legacy: product_viewer면 저장 숨김. */}
                {!productViewer && (
                  <button type="submit" className="btn btn-primary shadow-none">
                    <i className="mdi mdi-content-save font-16" /> 대표상품 태그저장
                  </button>
                )}
              </div>
            </div>

            <div className="row g-2">
              <div className="col-12">
                {data.title_code === "33" && (
                  <>
                    <TagSection
                      title="디지털상품 장르 정보"
                      groups={groups.filter(startsWith("G0"))}
                      field="genre"
                    />
                    <TagSection
                      title="디지털상품 카테고리 정보"
                      groups={groups.filter(startsWith("C"))}
                      field="category"
                    />
                    <TagSection
                      title="홀로모델 장르 정보"
                      groups={groups.filter(startsWith("HG"))}
                      field="genre"
                    />
                    <TagSection
                      title="홀로모델 카테고리 정보"
                      groups={groups.filter(startsWith("HC"))}
                      field="category"
                    />
                  </>
                )}
                {data.title_code === "12" && (
                  <>
                    <TagSection
                      title="PS액세서리 카테고리"
                      groups={groups.filter(startsWith("P"))}
                      field="category"
                    />
                    <TagSection
                      title="Razer (레이저) 카테고리"
                      groups={groups.filter(startsWith("R"))}
                      field="category"
                    />
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
