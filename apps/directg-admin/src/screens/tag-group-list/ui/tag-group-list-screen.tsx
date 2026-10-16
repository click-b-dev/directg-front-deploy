import { useState } from "react";
import { useTagGroupTree, type TagTopGroup, type TagSubGroup } from "@entities/tag";

// legacy tag/tag_group_list.php — TAG 그룹현황.
export const TagGroupListScreen = () => {
  const { data } = useTagGroupTree();
  if (!data) {
    return null;
  }

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
                    TAG 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">TAG 그룹현황</li>
              </ol>
            </div>
            <h4 className="page-title">TAG 그룹현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <table className="table table-bordered">
            <colgroup>
              <col width="10%" />
              <col width="*" />
            </colgroup>
            <tbody>
              {data.groups.map((group) => (
                <TopGroupRow key={group.idx} group={group} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// depth1 그룹 1행 = th(코드/명칭/idx) + td(depth2 아코디언 그리드).
const TopGroupRow = ({ group }: { group: TagTopGroup }) => (
  <tr>
    <th className="table-active text-center border">
      [{group.tags_group_code}]
      <br />
      {group.tags_group_name}
      <br />
      {group.idx}
    </th>
    <td className="p-2">
      <div className="row g-2">
        {group.subgroups.map((sub) => (
          <div className="col-3" key={sub.idx}>
            <SubGroupAccordion sub={sub} />
          </div>
        ))}
      </div>
    </td>
  </tr>
);

// depth2 아코디언 — Bootstrap JS 미로드라 React state로 collapse 재현.
const SubGroupAccordion = ({ sub }: { sub: TagSubGroup }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="accordion" id={`category_${sub.idx}`}>
      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className={`accordion-button${open ? "" : " collapsed"}`}
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            [{sub.tags_group_code}] {sub.tags_group_name}
          </button>
        </h2>
        <div className={`accordion-collapse collapse${open ? " show" : ""}`}>
          <div className="accordion-body p-0">
            <ul className="list-group">
              {sub.tags.map((tag) => (
                <li
                  className="list-group-item d-flex justify-content-between align-items-center"
                  key={tag.tag_code}
                >
                  [{tag.tag_code}] {tag.tag_name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
