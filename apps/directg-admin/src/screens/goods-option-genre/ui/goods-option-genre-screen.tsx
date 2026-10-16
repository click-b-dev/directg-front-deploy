import { Fragment, useEffect, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  useOptionGenre,
  useUpdateOptionGenre,
  type OptionGenreData,
  type OptionTagGroup,
} from "@entities/goods-option";
import { OptionSubNav } from "@widgets/option-sub-nav";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type GoodsOptionGenreScreenProps = { productCode: string };

// legacy goods/goods_option_genre_register.php — 옵션상품 장르 설정.
export const GoodsOptionGenreScreen = ({ productCode }: GoodsOptionGenreScreenProps) => {
  const { data } = useOptionGenre(productCode);

  useEffect(() => {
    document.title = "옵션상품 장르 설정";
  }, []);

  if (!data) {
    return null;
  }
  return <GenreForm productCode={productCode} data={data} />;
};

const PLATFORM_NAME: Record<string, string> = {
  "1": "Steam",
  "34": "Epic",
  "30": "Ubisoft Connect",
  "35": "Rockstar Games Launcher",
  "33": "Bethesda",
  "3": "Origin",
  "51": "홀로모델",
  "32": "기타",
};

// legacy: G0*=게임 장르 섹션, HG*=홀로모델 장르 섹션.
const isG0 = (g: OptionTagGroup) => g.group_code.startsWith("G0");
const isHG = (g: OptionTagGroup) => g.group_code.startsWith("HG");

const GenreForm = ({ productCode, data }: { productCode: string; data: OptionGenreData }) => {
  const navigate = useNavigate();
  const updateGenre = useUpdateOptionGenre(productCode);
  const productViewer = useProductViewer();
  const selected = new Set(data.selected);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const genre = fd.getAll("genre[]").map((v) => String(v));
    // legacy: 저장 후 goods_option_genre_register.php?product_code= 로 리다이렉트(self).
    updateGenre.mutate(
      { genre },
      {
        onSuccess: () =>
          navigate({
            to: "/goods/goods_option_genre_register",
            search: { product_code: productCode },
          }),
      },
    );
  };

  const g0 = data.groups.filter(isG0);
  const hg = data.groups.filter(isHG);

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
                {/* legacy 오타 그대로("태그 설정") */}
                <li className="breadcrumb-item active">옵션상품 태그 설정</li>
              </ol>
            </div>
            <h4 className="page-title">
              {data.product.product_name}{" "}
              <span className="badge bg-secondary">
                {PLATFORM_NAME[data.product.product_platform] ?? ""}
              </span>{" "}
              <span className="badge bg-dark">{data.product.game_type}</span>{" "}
              <span className="badge bg-dark">{data.product.display_type}</span>
            </h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-2 mb-2 mb-sm-0">
          <OptionSubNav
            productCode={productCode}
            active="genre"
            gameType={data.product.game_type}
          />
        </div>
        <div className="col-10">
          <form
            id="frm"
            name="frm"
            method="post"
            className="form-horizontal"
            onSubmit={handleSubmit}
          >
            <div className="row mb-2">
              <div className="text-end">
                {/* legacy: product_viewer면 저장 숨김. */}
                {!productViewer && (
                  <button type="submit" className="btn btn-primary shadow-none">
                    <i className="mdi mdi-content-save font-16" /> 옵션상품 장르저장
                  </button>
                )}
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="card">
                  <h5 className="card-header bg-secondary text-white">옵션상품 장르설정</h5>
                  <div className="card-body">
                    <div className="row mb-2 border-top">
                      <GroupCheckboxes groups={g0} selected={selected} />
                    </div>
                    <div className="row mb-2 border-top">
                      <GroupCheckboxes groups={hg} selected={selected} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const GroupCheckboxes = ({
  groups,
  selected,
}: {
  groups: OptionTagGroup[];
  selected: Set<string>;
}) => (
  <>
    {groups.map((group) => (
      <Fragment key={group.group_code}>
        <label className="col-sm-2 col-form-label bg-light border">{group.group_name}</label>
        <div className="col-sm-10 pt-2 pb-1 border-bottom border-end">
          {group.tags.map((tag) => (
            <div className="form-check form-check-inline pb-1" key={tag.tag_code}>
              <input
                type="checkbox"
                id={`genre${tag.tag_code}`}
                name="genre[]"
                className="form-check-input"
                value={tag.tag_code}
                defaultChecked={selected.has(tag.tag_code)}
              />
              <label className="form-check-label" htmlFor={`genre${tag.tag_code}`}>
                {tag.tag_name}
              </label>
            </div>
          ))}
        </div>
      </Fragment>
    ))}
  </>
);
