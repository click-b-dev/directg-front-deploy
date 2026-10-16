import { useGroupList, type GroupItem } from "@entities/goods-group";

const TYPE_LABEL: Record<string, string> = {
  "1": "프로모션",
  "2": "타임딜",
  "3": "프랜차이즈",
  "99": "기타",
};

const pad = (n: number) => String(n).padStart(2, "0");
// unix(초) → Y-m-d H:i:s
const fmtDateTime = (unix: number) => {
  const d = new Date(unix * 1000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// legacy goods/group/group_list.php — 그룹 현황(그룹 설정).
export const GoodsGroupListScreen = () => {
  const { data } = useGroupList();
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
                    그룹 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">그룹 설정</li>
              </ol>
            </div>
            <h4 className="page-title">그룹 설정</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row mb-2">
        <div className="col-12">
          <div className="float-start" />
          <div className="float-end">
            <a href="/goods/group/group_register" className="btn btn-primary shadow-none">
              그룹 등록
            </a>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">그룹 현황</h5>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-centered w-100 nowrap table-sm table-bordered">
                  <thead className="table-light font-14">
                    <tr>
                      <th className="text-center">번호</th>
                      <th className="text-center">구분</th>
                      <th className="text-center">그룹명</th>
                      <th className="text-center">시작</th>
                      <th className="text-center">종료</th>
                      <th className="text-center">사용여부</th>
                      <th className="text-center">PC배너</th>
                      <th className="text-center">모바일배너</th>
                      <th className="text-center">수정</th>
                    </tr>
                  </thead>
                  <tbody className="font-12">
                    {data.items.map((item) => (
                      <GroupRow key={item.idx} item={item} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const GroupRow = ({ item }: { item: GroupItem }) => {
  const now = Date.now() / 1000;
  const timeColor =
    now > item.start_date && now < item.end_date
      ? "text-primary"
      : now > item.end_date
        ? "text-danger"
        : "";

  return (
    <tr>
      <td className="text-center">{item.idx}</td>
      <td className="text-center">{TYPE_LABEL[item.type]}</td>
      <td className="text-center">
        <a href={`/goods/group/group_view?idx=${item.idx}`}>{item.subject}</a>
      </td>
      <td className={`text-center ${timeColor}`}>{fmtDateTime(item.start_date)}</td>
      <td className={`text-center ${timeColor}`}>{fmtDateTime(item.end_date)}</td>
      <td className="text-center">{item.use_flag}</td>
      <td className="text-center">
        {item.pc_banner_url ? (
          <a href={item.pc_banner_url} target="_blank" rel="noreferrer">
            링크
          </a>
        ) : (
          "미등록"
        )}
      </td>
      <td className="text-center">
        {item.banner_url ? (
          <a href={item.banner_url} target="_blank" rel="noreferrer">
            링크
          </a>
        ) : (
          "미등록"
        )}
      </td>
      <td className="text-center">
        <a href={`/goods/group/group_register?idx=${item.idx}`} className="btn btn-primary">
          수정
        </a>
      </td>
    </tr>
  );
};
