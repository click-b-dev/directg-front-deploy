/** 회원가입 5단계 (legacy join_step1~5 공통 progress nav). */
const JOIN_STEPS = [
  { n: 1, label: "가입방법 선택" },
  { n: 2, label: "약관동의" },
  { n: 3, label: "정보입력" },
  { n: 4, label: "인증대기" },
  { n: 5, label: "가입완료" },
] as const;

interface JoinStepNavProps {
  current: 1 | 2 | 3 | 4 | 5;
  /** 비활성 단계 링크. legacy step1·2는 전부 `#`(false), step4·5는 실제 라우트(true). */
  linked?: boolean;
}

/**
 * 회원가입 진행 단계 표시 (legacy `nav nav-pills nav-fill`).
 * 활성 단계는 `border-primary` + `nav-link active`(text-white 없음), 나머지는 `text-white`.
 */
export function JoinStepNav({ current, linked = false }: JoinStepNavProps) {
  return (
    <div className="row g-0 form-group mb-5">
      <div className="col-12">
        <ul className="nav nav-pills nav-fill">
          {JOIN_STEPS.map(({ n, label }) => {
            const active = n === current;
            const liClass =
              "nav-item rounded-0" +
              (active ? " border-primary" : "") +
              " border-start" +
              (n === 5 ? " border-end" : "") +
              " border-top border-bottom";
            // legacy linked(step4·5): step1은 항상 `#`, step2~5 비활성만 라우트 링크.
            const href = !active && linked && n !== 1 ? `/member/join_step${n}.html` : "#";
            return (
              <li key={n} className={liClass}>
                <a
                  href={href}
                  className={active ? "nav-link active rounded-0" : "nav-link rounded-0 text-white"}
                >
                  <h4 className="list-group-item-heading my-2 fw-bold">Step {n}</h4>
                  <p className="list-group-item-text font-16">{label}</p>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
