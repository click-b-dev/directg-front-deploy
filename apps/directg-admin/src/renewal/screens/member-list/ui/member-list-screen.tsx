import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMemberList, type MemberListItem, type MemberListSearch } from "@entities/member";
import {
  isEmailVerified,
  useApproveMember,
  useMemberStatuses,
  type MemberStatus,
} from "@/renewal/entities/member-approval";
import { MEMBER_LEVEL_LABELS, MEMBER_LEVEL_OPTIONS } from "@/renewal/entities/member-level";
import iconOpenInNew from "@/renewal/assets/icon-open-in-new.svg";
import {
  Button,
  Card,
  CardTitle,
  Chip,
  DataTable,
  type DataTableColumn,
  DateInput,
  FormField,
  FormRow,
  FormTable,
  Pagination,
  RadioGroup,
  Select,
  Tag,
  TextInput,
} from "@/renewal/shared/ui";
import {
  DATE_TYPE_OPTIONS,
  EMPTY_SEARCH,
  IS_AUTH_OPTIONS,
  OLD_LOGIN_OPTIONS,
  PAGE_SIZE,
  QUICK_PERIODS,
  SEARCH_TYPE_OPTIONS,
  fromSearch,
  getQuickPeriod,
  toSearch,
  type DateType,
  type FilterForm,
} from "../model/filters";

// 목록 응답에는 이메일 인증 여부가 아직 없다(docs/renewal/AD-Member-List-01.md 참조) — 있으면 표시한다.
type MemberRow = MemberListItem & { is_auth?: "Y" | "N" };

const formatMinutes = (value: string) => value.slice(0, 16);

// Figma `table`: 이름 열만 남는 폭을 차지하고 나머지는 고정 너비다.
type ColumnContext = {
  statuses: Record<string, MemberStatus> | undefined;
  approving: boolean;
  onApprove: (m_no: number) => void;
};

const getColumns = ({
  statuses,
  approving,
  onApprove,
}: ColumnContext): DataTableColumn<MemberRow>[] => [
  {
    key: "name",
    header: "회원 이름 (닉네임)",
    align: "left",
    cell: (member) => (
      <>
        <p>{member.name}</p>
        <p className="rn:text-detail rn:text-ink-2">{member.nickname}</p>
      </>
    ),
  },
  { key: "hp", header: "휴대폰 번호", width: "rn:w-180", cell: (member) => member.hp },
  {
    key: "email",
    header: "이메일",
    width: "rn:w-200",
    align: "left",
    cell: (member) => member.email,
  },
  {
    key: "level",
    header: "회원 등급",
    width: "rn:w-140",
    cell: (member) => MEMBER_LEVEL_LABELS[member.mem_level] ?? "",
  },
  {
    key: "reg",
    header: "가입일",
    width: "rn:w-200",
    cell: (member) => formatMinutes(member.reg_date),
  },
  {
    key: "log",
    header: "최근 접속일",
    width: "rn:w-200",
    cell: (member) => formatMinutes(member.log_date),
  },
  {
    key: "auth",
    header: "이메일 인증",
    width: "rn:w-240",
    cell: (member) => {
      const status = statuses?.[String(member.m_no)];
      if (status === undefined) return "-";
      return (
        <span className="rn:inline-flex rn:items-center rn:gap-8">
          <Tag tone={isEmailVerified(status) ? "success" : "error"}>
            {isEmailVerified(status) ? "인증완료" : "미인증"}
          </Tag>
          {/* 기획: 미인증일 때만 수동승인 노출(상세 화면과 같은 기준·같은 API). */}
          {!isEmailVerified(status) && (
            <Button
              variant="outline"
              size="S"
              disabled={approving}
              onClick={() => onApprove(member.m_no)}
            >
              수동승인
            </Button>
          )}
        </span>
      );
    },
  },
  {
    key: "manage",
    header: "관리",
    width: "rn:w-120",
    cell: (member) => (
      <Link
        to="/renewal/member/detail"
        search={{ m_no: String(member.m_no) }}
        className="rn:inline-flex rn:items-center rn:gap-2 rn:text-body3 rn:font-medium rn:text-ink"
      >
        상세
        <img src={iconOpenInNew} alt="" width={20} height={20} />
      </Link>
    ),
  },
];

type MemberListScreenProps = { search: MemberListSearch };

export const MemberListScreen = ({ search }: MemberListScreenProps) => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FilterForm>(() => fromSearch(search));
  const { data, isLoading, isError } = useMemberList(search);

  const patch = (next: Partial<FilterForm>) => setForm((prev) => ({ ...prev, ...next }));

  const goTo = (next: MemberListSearch) => {
    void navigate({ to: "/renewal/member/list", search: next });
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    goTo(toSearch(form));
  };

  const handleReset = () => {
    setForm(fromSearch(EMPTY_SEARCH));
    goTo(EMPTY_SEARCH);
  };

  const rows = (data?.items ?? []) as MemberRow[];
  const statuses = useMemberStatuses(rows.map((member) => member.m_no));
  const approveMember = useApproveMember();
  const columns = getColumns({
    statuses: statuses.data,
    approving: approveMember.isPending,
    onApprove: (m_no) => approveMember.mutate(m_no),
  });
  const pagination = data?.pagination;

  return (
    <div className="rn:flex rn:flex-col rn:gap-16">
      <Card>
        <CardTitle>회원 내역</CardTitle>
        <form onSubmit={handleSearch} className="rn:flex rn:flex-col rn:gap-20">
          <FormTable>
            <FormRow>
              <FormField label="회원 검색">
                <Select
                  aria-label="검색 대상"
                  rootClassName="rn:w-140"
                  value={form.searchType}
                  options={SEARCH_TYPE_OPTIONS}
                  onValueChange={(next) => patch({ searchType: next })}
                />
                <TextInput
                  aria-label="검색어"
                  className="rn:w-280"
                  value={form.searchValue}
                  onChange={(event) => patch({ searchValue: event.target.value })}
                />
              </FormField>
              <FormField label="이메일 인증">
                <RadioGroup
                  aria-label="이메일 인증 여부"
                  options={IS_AUTH_OPTIONS}
                  value={form.isAuth}
                  onValueChange={(value) => patch({ isAuth: value })}
                />
              </FormField>
            </FormRow>
            <FormRow>
              <FormField label="회원 등급">
                <Select
                  aria-label="회원 등급"
                  rootClassName="rn:w-280"
                  value={form.level}
                  options={MEMBER_LEVEL_OPTIONS}
                  onValueChange={(next) => patch({ level: next })}
                />
              </FormField>
              <FormField label="장기 미접속">
                <Select
                  aria-label="장기 미접속"
                  rootClassName="rn:w-280"
                  value={form.oldLogin}
                  options={OLD_LOGIN_OPTIONS}
                  onValueChange={(next) => patch({ oldLogin: next })}
                />
              </FormField>
            </FormRow>
            <FormRow>
              <FormField label="기간 조회">
                <Select
                  aria-label="기간 기준"
                  rootClassName="rn:w-140"
                  value={form.dateType}
                  options={DATE_TYPE_OPTIONS}
                  onValueChange={(next) => patch({ dateType: next as DateType })}
                />
                <DateInput
                  aria-label="시작일"
                  className="rn:w-160"
                  value={form.startDate}
                  onValueChange={(startDate) => patch({ startDate })}
                />
                <span aria-hidden="true" className="rn:text-body3 rn:text-ink-2">
                  ~
                </span>
                <DateInput
                  aria-label="종료일"
                  className="rn:w-160"
                  value={form.endDate}
                  onValueChange={(endDate) => patch({ endDate })}
                />
                {QUICK_PERIODS.map((period) => {
                  const range = getQuickPeriod(period.days);
                  return (
                    <Chip
                      key={period.label}
                      selected={
                        form.startDate === range.startDate && form.endDate === range.endDate
                      }
                      onClick={() => patch(range)}
                    >
                      {period.label}
                    </Chip>
                  );
                })}
              </FormField>
            </FormRow>
          </FormTable>
          <div className="rn:flex rn:items-center rn:justify-end rn:gap-8">
            <Button type="button" tone="inverse" variant="outline" onClick={handleReset}>
              초기화
            </Button>
            <Button type="submit">조회</Button>
          </div>
        </form>
      </Card>

      <Card>
        <p className="rn:text-body2 rn:font-medium rn:text-ink">
          총 <span className="rn:text-brand">{pagination?.total_results ?? 0}</span>명
        </p>

        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(member) => String(member.m_no)}
          emptyText={
            isLoading
              ? "불러오는 중..."
              : isError
                ? "목록을 불러오지 못했습니다."
                : "조회된 회원이 없습니다."
          }
        />

        <div className="rn:flex rn:items-center">
          <div className="rn:flex-1" />
          {pagination && pagination.total_pages > 0 && (
            <Pagination
              page={pagination.current_page}
              totalPages={pagination.total_pages}
              pageSize={PAGE_SIZE}
              totalResults={pagination.total_results}
              onPageChange={(page) => goTo({ ...search, page })}
            />
          )}
          <div className="rn:flex rn:flex-1 rn:justify-end">
            {/* 페이지당 개수: 현재 API는 per_page 파라미터를 받지 않아 고정(20)이다. */}
            <Select
              aria-label="페이지당 개수"
              compact
              rootClassName="rn:w-100"
              value="20"
              options={[{ value: "20", label: "20개" }]}
              onValueChange={() => undefined}
              disabled
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
