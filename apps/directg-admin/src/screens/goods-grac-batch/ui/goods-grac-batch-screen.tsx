import { useGracEntnameList, useSyncGracBatch, type GracEntnameItem } from "@entities/grac";

// legacy grac/grac_batch.php — 심의정보 동기화.
export const GoodsGracBatchScreen = () => {
  const { data } = useGracEntnameList();

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
                    상품관리
                  </a>
                </li>
                <li className="breadcrumb-item active">심의정보 동기화</li>
              </ol>
            </div>
            <h4 className="page-title">심의정보 동기화</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-centered w-100 nowrap table-sm table-bordered" id="">
                  <thead className="table-light">
                    <tr>
                      <th className="text-center">번호</th>
                      <th className="text-center">심의업체명</th>
                      <th className="text-center">게임수</th>
                      <th className="text-center">동기화일자</th>
                      <th className="text-center" style={{ width: "250px" }}>
                        비고
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item, index) => (
                      <GracEntnameRow key={item.entname} item={item} num={index + 1} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-center mt-3"></div>
            </div>
            {/* end card-body */}
          </div>
          {/* end card */}
        </div>
        {/* end col */}
      </div>
      {/* end row */}
    </>
  );
};

// legacy: 모든 행 "심의정보 동기화" 버튼 → grac_ps.php grac_batch → location.reload().
const GracEntnameRow = ({ item, num }: { item: GracEntnameItem; num: number }) => {
  const syncBatch = useSyncGracBatch();

  return (
    <tr>
      <td className="text-center">{num}</td>
      <td>{item.entname}</td>
      <td className="text-end">{item.tcount}</td>
      <td className="text-center">{item.batch_date}</td>
      <td className="text-center table-action">
        <button
          type="button"
          className="btn btn-sm btn-secondary btn_grac_batch"
          data-entname={item.entname}
          onClick={() => syncBatch.mutate({ entname: item.entname })}
        >
          심의정보 동기화
        </button>
      </td>
    </tr>
  );
};
