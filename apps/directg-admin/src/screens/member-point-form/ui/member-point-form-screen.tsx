import { useRef, useState } from "react";
import { useMemberPointTarget, useSubmitMemberPoint, MEMBER_LEVEL_LABEL } from "@entities/member";
import "./member-point-form.css";

const BASE_URL = "/member/member_point_form";

type MemberPointFormSearch = { search_type: string; search_value: string };

// legacy member_point_form.php memo_type select 옵션(12).
const MEMO_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "=지급/차감사유 선택=" },
  { value: "discount", label: "상품구매 시 포인트 사용" },
  { value: "repay", label: "상품구매 시 포인트 지급" },
  { value: "refound", label: "상품주문 취소시 사용포인트 환불" },
  { value: "add_member_level", label: "회원등급에 따른 추가포인트 지급" },
  { value: "renewal", label: "리뉴얼 기념 포인트 지급" },
  { value: "change", label: "차액보정" },
  { value: "reward", label: "스펠포스 3 소울 하베스트 출시 기념" },
  { value: "reward2", label: "시스템 장애로 인한 주문 오류 보상 지급" },
  { value: "reward3", label: "이스 9: 몬스트룸 녹스 차액 보정" },
  { value: "mobile_refund1", label: "휴대폰결제 부분취소" },
  { value: "mobile_refund2", label: "휴대폰결제 익월취소" },
  { value: "etc", label: "기타" },
];

// legacy member/member_point_form.php — 포인트 지급/차감(대상 검색 + 폼 mutation).
export const MemberPointFormScreen = ({ search_type, search_value }: MemberPointFormSearch) => {
  const { data } = useMemberPointTarget(search_value);
  const submitMutation = useSubmitMemberPoint();

  const [pointType, setPointType] = useState<"" | "add" | "sub">("");
  const [point, setPoint] = useState("");
  const [memoType, setMemoType] = useState("");
  const [memo, setMemo] = useState("기타");
  const pointRef = useRef<HTMLInputElement>(null);
  const memoRef = useRef<HTMLInputElement>(null);

  const member = data?.member ?? null;

  const handleSubmit = () => {
    if (!pointType) {
      window.alert("지급/차감 여부를 체크해주세요.");
      return;
    }
    if (!point) {
      window.alert("금액을 입력해주세요.");
      pointRef.current?.focus();
      return;
    }
    if (member && pointType === "sub" && member.point < Number(point)) {
      window.alert("대상회원의 포인트보다 차감할 금액이 큽니다.");
      return;
    }
    if (!memoType) {
      window.alert("지급/차감사유를 선택해주세요.");
      return;
    }
    if (memoType === "etc" && !memo) {
      window.alert("기타 사유를 작성해주세요.");
      memoRef.current?.focus();
      return;
    }
    if (!member) {
      return;
    }
    submitMutation.mutate(
      { m_no: member.m_no, point_type: pointType, point: Number(point), memo_type: memoType, memo },
      {
        onSuccess: (result) => {
          if (result.success) window.alert(result.message);
        },
      },
    );
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
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    회원
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    회원관리
                  </a>
                </li>
                <li className="breadcrumb-item active">포인트 지급/차감</li>
              </ol>
            </div>
            <h4 className="page-title">포인트 지급/차감</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 대상회원 검색 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">대상회원 검색</h5>
          <div className="card-body py-2">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row mb-2">
                <div className="col-lg-6">
                  <div className="input-group row">
                    <label className="col-sm-3 col-form-label bg-light border">검색어</label>
                    <div className="col-sm-3">
                      <select
                        className="form-control"
                        name="search_type"
                        id="search_type"
                        defaultValue={search_type || "tm.m_id"}
                      >
                        <option value="tm.m_id">아이디</option>
                      </select>
                    </div>
                    <div className="col-sm-6">
                      <input
                        type="text"
                        className="form-control"
                        id="search_value"
                        name="search_value"
                        placeholder="검색어"
                        defaultValue={search_value}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="row member-point-form-table">
        <div className="col-12 table-responsive">
          <table className="table table-centered w-100  nowrap table-sm table-bordered border-light">
            <thead className="table-light font-13">
              <tr>
                <th className="text-center">아이디</th>
                <th className="text-center">닉네임</th>
                <th className="text-center">이름</th>
                <th className="text-center">회원등급</th>
                <th className="text-center">포인트</th>
                <th className="text-center">회원가입일</th>
                <th className="text-center">최종로그인</th>
              </tr>
            </thead>
            <tbody className="font-12 bg-white">
              {member ? (
                <tr>
                  <td className="text-center">
                    <a href={`/member/member_view?m_no=${member.m_no}`}>{member.m_id}</a>
                  </td>
                  <td className="text-center">{member.nickname}</td>
                  <td className="text-center">{member.name}</td>
                  <td className="text-center">{MEMBER_LEVEL_LABEL[member.mem_level] ?? ""}</td>
                  <td className="text-center">{member.point}</td>
                  <td className="text-center">{member.reg_date}</td>
                  <td className="text-center">{member.log_date}</td>
                </tr>
              ) : (
                <tr>
                  <td className="text-center" colSpan={8}>
                    대상회원을 검색 후 이용해주세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {member && (
          <div id="point_form">
            <div className="card">
              <div className="card-body py-2">
                <div className="row mb-2">
                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label className="col-sm-2 col-form-label bg-light border">대상회원</label>
                      <div className="col-sm-5">
                        <input className="form-control" type="text" readOnly value={member.m_id} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label className="col-sm-2 col-form-label bg-light border">
                        지급/차감 여부
                      </label>
                      <div className="col-sm-6 mt-1">
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            id="point_type1"
                            type="radio"
                            name="point_type"
                            value="add"
                            checked={pointType === "add"}
                            onChange={() => setPointType("add")}
                          />
                          <label className="form-check-label" htmlFor="point_type1">
                            지급
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            id="point_type2"
                            type="radio"
                            name="point_type"
                            value="sub"
                            checked={pointType === "sub"}
                            onChange={() => setPointType("sub")}
                          />
                          <label className="form-check-label" htmlFor="point_type2">
                            차감
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label className="col-sm-2 col-form-label bg-light border">금액</label>
                      <div className="col-sm-3">
                        <input
                          className="form-control"
                          type="number"
                          name="point"
                          min={1}
                          style={{ width: "80%", display: "inline-block" }}
                          value={point}
                          onChange={(e) => setPoint(e.target.value)}
                          ref={pointRef}
                        />
                        <span> 원</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label className="col-sm-2 col-form-label bg-light border">
                        지급/차감사유
                      </label>
                      <div className="col-sm-5">
                        <select
                          className="form-control "
                          id="memo_type"
                          name="memo_type"
                          value={memoType}
                          onChange={(e) => setMemoType(e.target.value)}
                        >
                          {MEMO_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-sm-3">
                        <input
                          id="etc_text"
                          className="form-control"
                          name="memo"
                          value={memo}
                          onChange={(e) => setMemo(e.target.value)}
                          style={{ display: memoType === "etc" ? undefined : "none" }}
                          ref={memoRef}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12">
                    <button
                      type="button"
                      className="btn btn-primary shadow-none"
                      onClick={handleSubmit}
                    >
                      포인트 지급/차감
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
