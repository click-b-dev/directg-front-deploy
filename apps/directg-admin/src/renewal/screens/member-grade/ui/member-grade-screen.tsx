import { useState } from "react";
import {
  useDeleteMemberGrade,
  useMemberGrades,
  type MemberGrade,
} from "@/renewal/entities/member-grade";
import {
  Button,
  Card,
  CardTitle,
  ConfirmModal,
  DataTable,
  Tag,
  type DataTableColumn,
} from "@/renewal/shared/ui";
import { BENEFIT_TONE, NOTICES, formatAmountRange } from "../model/grade";

export const MemberGradeScreen = () => {
  const { data, isLoading, isError } = useMemberGrades();
  const deleteGrade = useDeleteMemberGrade();
  const [deleting, setDeleting] = useState<MemberGrade | null>(null);

  const columns: DataTableColumn<MemberGrade>[] = [
    {
      key: "rank",
      header: "No",
      width: "rn:w-80",
      cell: (grade) => <span className="rn:text-ink-2">{grade.rank}</span>,
    },
    { key: "name", header: "등급", width: "rn:w-240", cell: (grade) => grade.name },
    {
      key: "amount",
      header: "구매 총액",
      width: "rn:w-320",
      cell: (grade) => formatAmountRange(grade),
    },
    {
      key: "benefits",
      header: "혜택",
      align: "left",
      minWidth: 480,
      cell: (grade) => (
        <div className="rn:flex rn:flex-col rn:gap-12 rn:py-16">
          {grade.benefits.length === 0 && <p>혜택 없음</p>}
          {grade.benefits.map((benefit, index) => (
            <div key={`${benefit.label}-${index}`} className="rn:flex rn:items-start rn:gap-12">
              <div className="rn:flex rn:min-h-24 rn:w-96 rn:shrink-0 rn:items-center">
                <Tag tone={BENEFIT_TONE[benefit.kind]}>{benefit.label}</Tag>
              </div>
              <div className="rn:flex rn:min-w-0 rn:flex-1 rn:flex-col rn:gap-2 rn:pt-2">
                <p>{benefit.description}</p>
                {benefit.detail && (
                  <p className="rn:text-detail rn:whitespace-pre-wrap rn:text-ink-2">
                    {benefit.detail}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "manage",
      header: "관리",
      width: "rn:w-240",
      cell: (grade) => (
        <span className="rn:inline-flex rn:items-center rn:gap-8">
          {/* 등급 수정 화면(모달) 디자인은 아직 없어 동작을 연결하지 않았다. */}
          <Button tone="inverse" variant="outline" size="S" weight="semibold">
            수정
          </Button>
          <Button tone="error" variant="outline" size="S" onClick={() => setDeleting(grade)}>
            삭제
          </Button>
        </span>
      ),
    },
  ];

  const handleDelete = () => {
    if (!deleting) return;
    deleteGrade.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
  };

  return (
    <Card className="rn:gap-32">
      <div className="rn:flex rn:items-start rn:gap-8">
        <div className="rn:flex rn:flex-col rn:gap-8">
          <div className="rn:flex rn:min-h-38 rn:items-center">
            <CardTitle>회원 등급 설정</CardTitle>
          </div>
          <div className="rn:flex rn:flex-col rn:gap-4 rn:text-body3">
            {NOTICES.map((notice) => (
              <p key={notice.text} className={notice.emphasis ? "rn:text-error" : "rn:text-ink-2"}>
                {notice.text}
              </p>
            ))}
          </div>
        </div>
        <div className="rn:flex rn:flex-1 rn:items-center rn:justify-end rn:gap-6">
          <div className="rn:flex rn:items-center rn:gap-8 rn:px-12 rn:py-8 rn:text-body3 rn:whitespace-nowrap">
            <span className="rn:font-regular rn:text-ink-2">다음 산정일</span>
            <span className="rn:font-medium rn:text-ink">{data?.next_calc_date ?? "-"}</span>
          </div>
          {/* 등급 추가 모달 디자인(회원_회원등급설정_등급추가_모달)은 아직 연결하지 않았다. */}
          <Button variant="outline" size="S">
            등급추가
          </Button>
        </div>
      </div>

      <div className="rn:flex rn:flex-col rn:gap-12">
        <h3 className="rn:text-body2 rn:font-medium rn:text-ink">등급 및 혜택</h3>
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          getRowKey={(grade) => grade.id}
          rowHeight="rn:h-65"
          emptyText={
            isLoading
              ? "불러오는 중..."
              : isError
                ? "등급 정보를 불러오지 못했습니다."
                : "등록된 등급이 없습니다."
          }
        />
      </div>

      <ConfirmModal
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        message={`[${deleting?.name ?? ""}] 등급을 삭제할까요?`}
        pending={deleteGrade.isPending}
        onConfirm={handleDelete}
      />
    </Card>
  );
};
