import {
  useMemberView,
  useResetMemberAuth,
  getMemberAge,
  MEMBER_LEVEL_LABEL,
  MEMBER_TYPE_LABEL,
  SNS_TYPE_BADGE,
  QNA_GUBUN_LABEL,
} from "@entities/member";

type MemberViewSearch = { m_no: string };

const nf = (n: number) => n.toLocaleString("en-US");

// legacy member/member_view.php — 회원 상세보기(프로필 + 포인트 + 등급이력 + 주문/문의 요약 + 인증초기화).
export const MemberViewScreen = ({ m_no }: MemberViewSearch) => {
  const { data } = useMemberView(m_no);
  const resetMutation = useResetMemberAuth();

  const handleAuthReset = (targetNo: number) => {
    if (window.confirm("인증 초기화시 이름, 휴대폰, 생년월일 정보가 삭제됩니다.")) {
      resetMutation.mutate(targetNo, {
        onSuccess: (result) => {
          if (result.success) window.alert("초기화완료");
        },
      });
    }
  };

  if (!data) {
    return null;
  }

  const { member, level_history, level_history_total, order_stats, orders, qna } = data;
  const snsBadge = SNS_TYPE_BADGE[member.sns_type.toLowerCase()];

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
                <li className="breadcrumb-item active">회원 상세보기</li>
              </ol>
            </div>
            <h4 className="page-title">회원 상세보기</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-xl-4">
          {/* 회원 정보 */}
          <div className="card">
            <div className="card-body">
              <div>
                <table className="table table-bordered" style={{ marginBottom: "0px" }}>
                  <colgroup>
                    <col style={{ width: "30%", backgroundColor: "#f8f9fa" }} />
                    <col style={{ width: "70%" }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th className="text-center">회원고유번호</th>
                      <td>{member.m_no}</td>
                    </tr>
                    <tr>
                      <th className="text-center">
                        아이디
                        {member.email && (
                          <>
                            <br />
                            (이메일)
                          </>
                        )}
                      </th>
                      <td>
                        {member.m_id}
                        {member.email && (
                          <>
                            <br />({member.email})
                          </>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th className="text-center">
                        이름
                        <br />
                        (닉네임)
                      </th>
                      <td>
                        {member.name}
                        <br />({member.nickname})
                      </td>
                    </tr>
                    <tr>
                      <th className="text-center">
                        생년월일
                        <br />
                        (나이)
                      </th>
                      <td>
                        {member.birth_day}
                        <br />
                        {member.birth_day !== "" ? `(${getMemberAge(member.birth_day)})` : ""}
                      </td>
                    </tr>
                    <tr>
                      <th className="text-center">휴대폰</th>
                      <td>{member.hp}</td>
                    </tr>
                    <tr>
                      <th className="text-center">회원등급</th>
                      <td>
                        <span className="badge bg-primary">
                          {MEMBER_LEVEL_LABEL[member.mem_level] ?? ""}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th className="text-center">회원가입일</th>
                      <td>{member.reg_date}</td>
                    </tr>
                    <tr>
                      <th className="text-center">
                        최종로그인
                        <br />
                        (접속IP)
                      </th>
                      <td>
                        {member.log_date}
                        <br />({member.ip})
                      </td>
                    </tr>
                    <tr>
                      <th className="text-center">방문횟수</th>
                      <td>{nf(member.visited)} 회</td>
                    </tr>
                    <tr>
                      <th className="text-center">가입방법</th>
                      <td>
                        {snsBadge && (
                          <span className={`badge ${snsBadge.variant}`}>{snsBadge.label}</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th className="text-center">회원분류</th>
                      <td>{MEMBER_TYPE_LABEL[member.mem_type] ?? ""}</td>
                    </tr>
                    <tr>
                      <th className="text-center">포인트</th>
                      <td>
                        <span className="me-2">{nf(member.point)}</span>
                        <a
                          className="btn btn-sm btn-primary shadow-none"
                          href={`/member/member_point_list?search_type=tm.m_id&search_value=${member.m_id}&emoney_type=all`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          내역보기
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <th className="text-center">본인인증</th>
                      <td>
                        <span className="me-2">{member.is_auth === "Y" ? "인증" : "미인증"}</span>
                        {member.is_auth === "Y" && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleAuthReset(member.m_no)}
                          >
                            인증 초기화
                          </button>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 회원등급 변동이력 */}
          <div className="card">
            <div className="card-body">
              <h4 className="header-title mb-3">회원등급 변동이력</h4>
              <p>
                총 {nf(level_history_total)} 건 / <small className="text-muted">최근 5건</small>
              </p>
              <div className="table-responsive">
                <table className="table table-hover table-centered mb-0">
                  <thead>
                    <tr>
                      <th className="text-center">월</th>
                      <th className="text-center">등급</th>
                      <th className="text-center">대상금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {level_history.slice(0, 5).map((h, i) => (
                      <tr key={`${h.history_date}-${i}`}>
                        <th className="text-center">{h.history_date}</th>
                        <th className="text-center">{MEMBER_LEVEL_LABEL[h.mem_level] ?? ""}</th>
                        <th className="text-center">₩{nf(h.order_price)}</th>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-8">
          <div className="row">
            <div className="col-sm-3">
              <div className="card tilebox-one">
                <div className="card-body">
                  <i className="dripicons-box float-end text-muted" />
                  <h6 className="text-muted text-uppercase mt-0">결제완료 건수/금액</h6>
                  <h4 className="m-b-20">
                    {order_stats.step2_cnt}건 / ₩{nf(order_stats.step2_price)}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="card tilebox-one">
                <div className="card-body">
                  <i className="dripicons-box float-end text-muted" />
                  <h6 className="text-muted text-uppercase mt-0">주문완료 건수</h6>
                  <h4 className="m-b-20">{order_stats.success_cnt}건</h4>
                </div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="card tilebox-one">
                <div className="card-body">
                  <i className="dripicons-box float-end text-muted" />
                  <h6 className="text-muted text-uppercase mt-0">취소완료 건수</h6>
                  <h4 className="m-b-20">{order_stats.cancel_cnt}건</h4>
                </div>
              </div>
            </div>
          </div>

          {/* 회원 주문내역 */}
          <div className="card">
            <div className="card-body">
              <h4 className="header-title mb-3">
                회원 주문내역
                <a
                  href={`/order/order_all?search_key=search_m_id&search_value=${member.m_id}&search_year=2017`}
                  className="btn btn-primary shadow-none"
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginLeft: "10px" }}
                >
                  주문내역보기
                </a>{" "}
                <a
                  href={`/order/order_old_list?search_key=search_m_id&search_value=${member.m_id}&search_year=2017`}
                  className="btn btn-primary shadow-none"
                  target="_blank"
                  rel="noreferrer"
                >
                  (과거)주문내역보기
                </a>
              </h4>
              <p>
                총 {nf(orders.total_results)} 건 / <small className="text-muted">최근 5건</small>
              </p>
              <div className="table-responsive">
                <table className="table table-hover table-centered mb-0">
                  <thead>
                    <tr>
                      <th className="text-center">주문일자</th>
                      <th className="text-center">결제번호</th>
                      <th className="text-center">결제상태</th>
                      <th className="text-center">주문번호</th>
                      <th className="text-center">상품정보</th>
                      <th className="text-center">주문금액</th>
                      <th className="text-center">주문상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.items.slice(0, 5).map((o, i) => (
                      <tr key={`${o.settle_no}-${o.ordno}-${i}`}>
                        <td className="text-center">{o.order_date}</td>
                        <td className="text-center">
                          <a
                            href={`/order/order_view?settle_no=${o.settle_no}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {o.settle_no}
                          </a>
                        </td>
                        <td className="text-center">{o.step_label}</td>
                        <td className="text-center">{o.ordno}</td>
                        <td className="text-center">{o.product_name}</td>
                        <td className="text-center">{nf(o.price)}</td>
                        <td className="text-center">{o.status_label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 회원 문의내역 */}
          <div className="card">
            <div className="card-body">
              <h4 className="header-title mb-3">
                회원 문의내역
                <a
                  href={`/board/qna_list?searchGubun=&replyStatus=&searchType=user_id&searchTitle=${member.m_id}`}
                  className="btn btn-primary shadow-none"
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginLeft: "10px" }}
                >
                  전체보기
                </a>
              </h4>
              <p>
                총 {nf(qna.total_results)} 건 / <small className="text-muted">최근 5건</small>
              </p>
              <div className="table-responsive">
                <table className="table table-hover table-centered mb-0">
                  <thead>
                    <tr>
                      <th className="text-center">구분</th>
                      <th className="text-center">제목</th>
                      <th className="text-center">작성일</th>
                      <th className="text-center">답변상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qna.items.slice(0, 5).map((q) => (
                      <tr key={q.idx}>
                        <td className="text-center">{QNA_GUBUN_LABEL[q.gubun] ?? ""}</td>
                        <td className="text-center">
                          <a href={`/board/qna_view?idx=${q.idx}`} target="_blank" rel="noreferrer">
                            {q.subject}
                            {q.file_cnt ? <i className="dripicons-photo" /> : null}
                          </a>
                        </td>
                        <td className="text-center">{q.reg_date}</td>
                        <td className="text-center">
                          {q.answer !== "" ? "O" : "X"}
                          {q.admin_id !== "" && (
                            <>
                              <br />({q.admin_id})
                            </>
                          )}
                        </td>
                      </tr>
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
