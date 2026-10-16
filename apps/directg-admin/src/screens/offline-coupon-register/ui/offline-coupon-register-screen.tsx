import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  useOfflineCouponDetail,
  useCreateOfflineCoupon,
  useUpdateOfflineCoupon,
  type OfflineCouponRegisterSearch,
  type OfflineCouponDetail,
  type OfflineCouponSaveRequest,
} from "@entities/promotion";

// legacy promotion/offline_coupon_register.php — 오프라인 쿠폰 등록/수정 겸용.
export const OfflineCouponRegisterScreen = ({ mode, sno }: OfflineCouponRegisterSearch) => {
  const isUpdate = mode === "update";
  const { data } = useOfflineCouponDetail(sno, { enabled: isUpdate && sno > 0 });

  if (isUpdate && !data) {
    return null;
  }

  return <OfflineCouponForm isUpdate={isUpdate} sno={sno} detail={isUpdate ? data : undefined} />;
};

const OfflineCouponForm = ({
  isUpdate,
  sno,
  detail,
}: {
  isUpdate: boolean;
  sno: number;
  detail?: OfflineCouponDetail;
}) => {
  const navigate = useNavigate();
  const createMutation = useCreateOfflineCoupon();
  const updateMutation = useUpdateOfflineCoupon();

  const action = isUpdate ? "수정" : "등록";
  const mode = isUpdate ? "update" : "register";

  // legacy 기본: code_type DYNAMIC, issuePerPersonLimitYn "N"(제한, value=""), 기간 삭제버튼용 state.
  const [codeType, setCodeType] = useState(detail?.code_type ?? "DYNAMIC");
  const [limitYn, setLimitYn] = useState(detail?.issuePerPersonLimitYn === "Y" ? "Y" : "");
  const [sdate, setSdate] = useState(detail?.sdate ?? "");
  const [edate, setEdate] = useState(detail?.edate ?? "");

  const isStatic = codeType === "STATIC";
  const isLimited = limitYn === ""; // 발급 제한

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const get = (name: string) => String(fd.get(name) ?? "");
    const payload: OfflineCouponSaveRequest = {
      coupon_name: get("coupon_name"),
      reason: get("reason"),
      issueLimitCnt: Number(get("issueLimitCnt")),
      sdate,
      edate,
      partner: get("partner"),
      code_type: codeType,
      coupon_price: Number(get("coupon_price")),
      promotion_code: get("promotion_code"),
      issuePerPersonLimitYn: limitYn,
      issuePerPersonLimitCnt: Number(get("issuePerPersonLimitCnt")),
      dailyIssuePerPersonLimitCnt: Number(get("dailyIssuePerPersonLimitCnt")),
    };
    // legacy: 저장 → alert → go(HTTP_REFERER)(목록)
    const onSuccess = () => {
      window.alert(isUpdate ? "수정되었습니다." : "저장되었습니다.");
      navigate({
        to: "/promotion/offline_coupon_list",
        search: { page: 1, search_type: "", search_value: "" },
      });
    };
    if (isUpdate) {
      updateMutation.mutate({ sno, payload }, { onSuccess });
    } else {
      createMutation.mutate(payload, { onSuccess });
    }
  };

  const goList = () =>
    navigate({
      to: "/promotion/offline_coupon_list",
      search: { page: 1, search_type: "", search_value: "" },
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
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    프로모션
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    오프라인 쿠폰 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">오프라인 쿠폰 {action}</li>
              </ol>
            </div>
            <h4 className="page-title">오프라인 쿠폰 {action}</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <form id="frm" name="frm" method="POST" className="form-horizontal" onSubmit={handleSubmit}>
        <input type="hidden" name="mode" value={mode} />
        <input type="hidden" name="sno" value={isUpdate ? sno : ""} />

        <div className="row">
          <div className="col-8">
            <div className="card border border-1">
              {/* 기본정보 */}
              <div className="card-header bg-secondary text-white fw-bold font-15">
                오프라인 쿠폰 기본정보
              </div>
              <div className="card-body">
                <div className="mb-2 row">
                  <label htmlFor="coupon_name" className="col-sm-2 col-form-label bg-light">
                    * 쿠폰명
                  </label>
                  <div className="col-sm-6">
                    <input
                      type="text"
                      id="coupon_name"
                      name="coupon_name"
                      className="form-control"
                      defaultValue={detail?.coupon_name ?? ""}
                      required
                    />
                  </div>
                </div>
                <div className="mb-2 row">
                  <label htmlFor="reason" className="col-sm-2 col-form-label bg-light">
                    * 쿠폰 사유
                  </label>
                  <div className="col-sm-6">
                    <input
                      type="text"
                      id="reason"
                      name="reason"
                      className="form-control"
                      defaultValue={detail?.reason ?? ""}
                      required
                    />
                  </div>
                </div>
                <div className="mb-2 row">
                  <label htmlFor="issueLimitCnt" className="col-sm-2 col-form-label bg-light">
                    * 쿠폰 발행 수량
                  </label>
                  <div className="col-sm-2">
                    <input
                      type="number"
                      id="issueLimitCnt"
                      name="issueLimitCnt"
                      className="form-control"
                      defaultValue={detail?.issueLimitCnt ?? ""}
                      required
                    />
                  </div>
                  <div className="col-sm-2 px-0 d-flex align-items-center">
                    <span className="text-center">장</span>
                  </div>
                </div>
                <div className="mb-2 row">
                  <label htmlFor="sdate" className="col-sm-2 col-form-label bg-light">
                    * 쿠폰 사용기간
                  </label>
                  <div className="col-sm-6">
                    <div className="input-group">
                      <input
                        type="datetime-local"
                        id="sdate"
                        name="sdate"
                        className="form-control"
                        value={sdate}
                        onChange={(e) => setSdate(e.target.value)}
                        required
                      />
                      <span className="input-group-text">~</span>
                      <input
                        type="datetime-local"
                        id="edate"
                        name="edate"
                        className="form-control"
                        value={edate}
                        onChange={(e) => setEdate(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="bg-transparent border-0"
                        onClick={() => {
                          setSdate("");
                          setEdate("");
                        }}
                      >
                        <i className="mdi mdi-delete-outline fs-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mb-2 row">
                  <label htmlFor="partner" className="col-sm-2 col-form-label bg-light">
                    * 쿠폰 사용처
                  </label>
                  <div className="col-sm-6">
                    <input
                      type="text"
                      id="partner"
                      name="partner"
                      className="form-control"
                      defaultValue={detail?.partner ?? ""}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 발급정보 */}
              <div className="card-header bg-secondary text-white fw-bold font-15">
                오프라인 쿠폰 발급정보
              </div>
              <div className="card-body">
                <div className="mb-2 row">
                  <label className="col-sm-2 col-form-label bg-light">* 발급 유형</label>
                  <div className="col-sm-6 mt-1">
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="code_type2"
                        name="code_type"
                        className="form-check-input"
                        value="STATIC"
                        checked={codeType === "STATIC"}
                        onChange={(e) => setCodeType(e.target.value)}
                        required
                        disabled={isUpdate}
                      />
                      <label className="form-check-label" htmlFor="code_type2">
                        지정코드 발급
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="code_type3"
                        name="code_type"
                        className="form-check-input"
                        value="DYNAMIC"
                        checked={codeType === "DYNAMIC"}
                        onChange={(e) => setCodeType(e.target.value)}
                        required
                        disabled={isUpdate}
                      />
                      <label className="form-check-label" htmlFor="code_type3">
                        난수코드 발급
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mb-2 row">
                  <label htmlFor="promotion_code" className="col-sm-2 col-form-label bg-light">
                    <span id="req_mark">{isStatic ? "*" : ""}</span> 프로모션코드
                  </label>
                  <div className="col-sm-6">
                    <input
                      type="text"
                      id="promotion_code"
                      name="promotion_code"
                      className="form-control"
                      defaultValue={detail?.promotion_code ?? ""}
                      required={isStatic}
                    />
                  </div>
                </div>
                <div className="mb-2 row">
                  <label className="col-sm-2 col-form-label bg-light">* 인당 발급 제한</label>
                  <div className="col-sm-6 mt-1">
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="issuePerPersonLimitYn2"
                        name="issuePerPersonLimitYn"
                        className="form-check-input limit-radio"
                        value="Y"
                        checked={limitYn === "Y"}
                        onChange={() => setLimitYn("Y")}
                        required
                      />
                      <label className="form-check-label" htmlFor="issuePerPersonLimitYn2">
                        발급 무제한
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="issuePerPersonLimitYn3"
                        name="issuePerPersonLimitYn"
                        className="form-check-input limit-radio"
                        value=""
                        checked={limitYn === ""}
                        onChange={() => setLimitYn("")}
                        required
                      />
                      <label className="form-check-label" htmlFor="issuePerPersonLimitYn3">
                        발급 제한
                      </label>
                    </div>
                  </div>
                </div>
                {isLimited && (
                  <>
                    <div className="mb-2 row limit-fields">
                      <label
                        htmlFor="issuePerPersonLimitCnt"
                        className="col-sm-2 col-form-label bg-light"
                      >
                        기간전체 발급제한
                      </label>
                      <div className="col-sm-2">
                        <input
                          type="number"
                          id="issuePerPersonLimitCnt"
                          name="issuePerPersonLimitCnt"
                          className="form-control"
                          defaultValue={detail?.issuePerPersonLimitCnt || 1}
                          min={1}
                        />
                      </div>
                      <div className="col-sm-2 px-0 d-flex align-items-center">
                        <span className="text-center">장</span>
                      </div>
                    </div>
                    <div className="mb-2 row limit-fields">
                      <label
                        htmlFor="dailyIssuePerPersonLimitCnt"
                        className="col-sm-2 col-form-label bg-light"
                      >
                        1일 발급제한
                      </label>
                      <div className="col-sm-2">
                        <input
                          type="number"
                          id="dailyIssuePerPersonLimitCnt"
                          name="dailyIssuePerPersonLimitCnt"
                          className="form-control"
                          defaultValue={detail?.dailyIssuePerPersonLimitCnt ?? ""}
                        />
                      </div>
                      <div className="col-sm-2 px-0 d-flex align-items-center">
                        <span className="text-center">장</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 포인트설정 */}
              <div className="card-header bg-secondary text-white fw-bold font-15">
                오프라인 쿠폰 포인트설정
              </div>
              <div className="card-body">
                <div className="mb-2 row">
                  <label htmlFor="coupon_price" className="col-sm-2 col-form-label bg-light">
                    * 포인트
                  </label>
                  <div className="col-sm-2">
                    <input
                      type="number"
                      id="coupon_price"
                      name="coupon_price"
                      className="form-control"
                      defaultValue={detail?.coupon_price ?? ""}
                      required
                    />
                  </div>
                  <div className="col-sm-2 px-0 d-flex align-items-center">
                    <span className="text-center">원</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-2 mx-auto mb-2">
              <button type="button" className="btn btn-secondary shadow-none" onClick={goList}>
                목록
              </button>{" "}
              <button type="submit" className="btn btn-primary shadow-none">
                {action}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};
