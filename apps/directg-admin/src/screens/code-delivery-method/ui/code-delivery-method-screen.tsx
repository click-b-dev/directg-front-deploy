import { useDeliveryMethodList } from "@entities/code";

const won = (n: number) => n.toLocaleString();

// legacy code/delivery_method.php — 배송방법 설정.
export const CodeDeliveryMethodScreen = () => {
  const { data } = useDeliveryMethodList();
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
                    코드 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">배송방법 설정</li>
              </ol>
            </div>
            <h4 className="page-title">배송방법 설정</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <table className="table table-centered mb-0 table-sm table-bordered">
            <thead className="table-dark font-13">
              <tr>
                <th className="text-center">배송방법코드</th>
                <th className="text-center">배송방법명</th>
                <th className="text-center">배송유형</th>
                <th className="text-center">기본 배송비</th>
                <th className="text-center">무료배송 조건금액</th>
                <th className="text-center">추적 가능 여부</th>
                <th className="text-center">평균 소요 기간</th>
                <th className="text-center">당일 발송 마감시간</th>
                <th className="text-center">도서산간 추가비 여부</th>
                <th className="text-center">반품 배송비</th>
                <th className="text-center">사용 여부</th>
              </tr>
            </thead>
            <tbody className="font-12 bg-white">
              {data.items.map((item) => (
                <tr key={item.DELIVERY_METHOD_ID}>
                  <td className="text-center">{item.DELIVERY_METHOD_ID}</td>
                  <td>{item.METHOD_NAME}</td>
                  <td className="text-center">{item.DELIVERY_TYPE}</td>
                  <td className="text-end">{won(item.BASE_FEE)}원</td>
                  <td className="text-end">{won(item.FREE_THRESHOLD)} 원</td>
                  <td className="text-center">{item.IS_TRACKABLE}</td>
                  <td className="text-center">{item.EXPECTED_DAYS} 일</td>
                  <td className="text-center">{item.CUT_OFF_TIME}</td>
                  <td className="text-center">{item.AREA_SURCHARGE_YN}</td>
                  <td className="text-end">{won(item.RETURN_FEE)} 원</td>
                  <td className="text-center">{item.USE_YN}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
