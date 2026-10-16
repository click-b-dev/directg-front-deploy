import { Fragment, useEffect, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  useOptionCategory,
  useUpdateOptionCategory,
  type OptionCategoryData,
  type OptionTagGroup,
} from "@entities/goods-option";
import { OptionSubNav } from "@widgets/option-sub-nav";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type GoodsOptionCategoryScreenProps = { productCode: string };

// legacy goods/goods_option_category_register.php — 옵션상품 카테고리 설정.
export const GoodsOptionCategoryScreen = ({ productCode }: GoodsOptionCategoryScreenProps) => {
  const { data } = useOptionCategory(productCode);

  useEffect(() => {
    document.title = "옵션상품 카테고리 설정";
  }, []);

  if (!data) {
    return null;
  }
  return <CategoryForm productCode={productCode} data={data} />;
};

// legacy 카드별 접두어 분류: C(게임), HC(홀로모델), P(PS), R(Razer).
const isGameCat = (g: OptionTagGroup) => g.group_code.startsWith("C");
const isHoloCat = (g: OptionTagGroup) => g.group_code.startsWith("HC");
const isPsCat = (g: OptionTagGroup) => g.group_code.startsWith("P");
const isRazerCat = (g: OptionTagGroup) => g.group_code.startsWith("R");

const CategoryForm = ({ productCode, data }: { productCode: string; data: OptionCategoryData }) => {
  const navigate = useNavigate();
  const updateCategory = useUpdateOptionCategory(productCode);
  const productViewer = useProductViewer();
  const selected = new Set(data.selected);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const category = fd.getAll("category[]").map((v) => String(v));
    // legacy: 저장 후 goods_option_category_register.php?product_code= 로 리다이렉트(self).
    updateCategory.mutate(
      { category },
      {
        onSuccess: () =>
          navigate({
            to: "/goods/goods_option_category_register",
            search: { product_code: productCode },
          }),
      },
    );
  };

  const game = data.groups.filter(isGameCat);
  const holo = data.groups.filter(isHoloCat);
  const ps = data.groups.filter(isPsCat);
  const razer = data.groups.filter(isRazerCat);

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
                <li className="breadcrumb-item active">옵션상품 카테고리 설정</li>
              </ol>
            </div>
            <h4 className="page-title">
              {data.product.product_name}({data.product.product_name_en})
            </h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-2 mb-2 mb-sm-0">
          <OptionSubNav productCode={productCode} active="category" gameType="" />
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
                    <i className="mdi mdi-content-save font-16" /> 옵션상품 카테고리저장
                  </button>
                )}
              </div>
            </div>

            <CategoryCard title="게임 카테고리" groups={game} selected={selected} />
            <CategoryCard title="홀로모델 카테고리" groups={holo} selected={selected} />
            <CategoryCard title="PS액세서리 카테고리" groups={ps} selected={selected} compact />
            <CategoryCard
              title="Razer (레이저) 카테고리"
              groups={razer}
              selected={selected}
              compact
            />
          </form>
        </div>
      </div>
    </>
  );
};

const CategoryCard = ({
  title,
  groups,
  selected,
  compact,
}: {
  title: string;
  groups: OptionTagGroup[];
  selected: Set<string>;
  compact?: boolean;
}) => (
  <div className="row">
    <div className="col-12">
      <div className="card">
        <h5 className="card-header bg-secondary text-white">{title}</h5>
        <div className={compact ? "card-body px-3 py-2 font-13" : "card-body"}>
          <div className="row mb-2 border-top">
            {groups.map((group) => (
              <Fragment key={group.group_code}>
                <label className="col-sm-2 col-form-label bg-light border">
                  {group.group_name}
                </label>
                <div className="col-sm-10 pt-2 pb-1 border-bottom border-end">
                  {group.tags.map((tag) => (
                    <div className="form-check form-check-inline pb-1" key={tag.tag_code}>
                      <input
                        type="checkbox"
                        id={`category${tag.tag_code}`}
                        name="category[]"
                        className="form-check-input"
                        value={tag.tag_code}
                        defaultChecked={selected.has(tag.tag_code)}
                      />
                      <label className="form-check-label" htmlFor={`category${tag.tag_code}`}>
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
    </div>
  </div>
);
