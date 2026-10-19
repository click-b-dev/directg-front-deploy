import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  SNS_TYPE_BADGE,
  useLeaveMember,
  useMemberView,
  type MemberViewInfo,
} from "@entities/member";
import {
  isEmailVerified,
  useApproveMember,
  useMemberStatuses,
} from "@/renewal/entities/member-approval";
import { useMemberLock, useSetMemberLock } from "@/renewal/entities/member-lock";
import { MEMBER_LEVEL_LABELS } from "@/renewal/entities/member-level";
import iconBack from "@/renewal/assets/icon-back.svg";
import iconArrowRight from "@/renewal/assets/icon-arrow-right.svg";
import {
  Button,
  Card,
  ConfirmModal,
  CardTitle,
  DropdownMenu,
  FormField,
  FormRow,
  FormTable,
  InfoTip,
  LineTabs,
  StatItem,
  Switch,
  Tag,
} from "@/renewal/shared/ui";
import { TABS, formatBirthDay, formatPrice, type DetailTab } from "../model/detail";
import { AccountMergeModal } from "./account-merge-modal";
import { LevelPanel } from "./level-panel";
import { OrdersPanel } from "./orders-panel";
import { ReviewsPanel } from "./reviews-panel";

const snsLabel = (member: MemberViewInfo) =>
  SNS_TYPE_BADGE[member.sns_type.toLowerCase()]?.label ?? "-";

type MemberDetailScreenProps = { m_no: string };

export const MemberDetailScreen = ({ m_no }: MemberDetailScreenProps) => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useMemberView(m_no);
  const leaveMember = useLeaveMember();
  const [tab, setTab] = useState<DetailTab>("orders");
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [lockOpen, setLockOpen] = useState(false);
  const lock = useMemberLock(m_no);
  const setLock = useSetMemberLock(m_no);
  const statuses = useMemberStatuses(Number(m_no) ? [Number(m_no)] : []);
  const approveMember = useApproveMember();

  if (!data) {
    return (
      <Card>
        <p className="rn:text-body2 rn:text-ink-2">
          {isLoading
            ? "불러오는 중..."
            : isError
              ? "회원 정보를 불러오지 못했습니다."
              : "회원 정보가 없습니다."}
        </p>
      </Card>
    );
  }

  const { member, order_stats: stats } = data;
  const memberStatus = statuses.data?.[String(member.m_no)];

  // legacy member_proc.php mode=leave — 성공하면 목록으로 돌아간다.
  const handleLeave = () => {
    leaveMember.mutate(member.m_no, {
      onSuccess: () => void navigate({ to: "/renewal/member/list" }),
    });
  };

  return (
    <div className="rn:flex rn:flex-col rn:gap-16">
      <Card>
        <div className="rn:flex rn:items-center rn:gap-8">
          <Link
            to="/renewal/member/list"
            aria-label="회원 내역으로 돌아가기"
            className="rn:flex rn:size-24 rn:items-center rn:justify-center"
          >
            <img src={iconBack} alt="" width={24} height={24} />
          </Link>
          <p className="rn:text-body1 rn:font-semibold rn:text-ink">{member.name}</p>
          <Tag tone="info">{MEMBER_LEVEL_LABELS[member.mem_level] ?? ""}</Tag>
          <div className="rn:flex rn:flex-1 rn:items-center rn:justify-end rn:gap-8">
            <Button tone="inverse" variant="outline" size="S">
              APP 알림 발송
            </Button>
            <Button tone="inverse" variant="outline" size="S">
              이메일 발송
            </Button>
            <DropdownMenu
              trigger={{ label: "혜택 지급", tone: "inverse", variant: "outline", size: "S" }}
              items={[
                {
                  id: "point",
                  label: "포인트 적립",
                  // 리뉴얼 포인트 화면 구현 전까지 legacy 포인트 지급 화면으로 이동한다.
                  onSelect: () =>
                    void navigate({
                      to: "/member/member_point_form",
                      search: { search_type: "m_id", search_value: member.m_id },
                    }),
                },
                { id: "coupon", label: "쿠폰 발급", disabled: true },
              ]}
            />
            <Button tone="error" variant="outline" size="S" onClick={() => setLeaveOpen(true)}>
              회원 탈퇴
            </Button>
          </div>
        </div>
        <div className="rn:flex rn:gap-16">
          <StatItem label="누적 주문 금액" value={formatPrice(stats.step2_price)} />
          <StatItem label="누적 주문 완료" value={`${stats.success_cnt}건`} />
          <StatItem label="누적 주문 취소" value={`${stats.cancel_cnt}건`} />
          <StatItem label="보유 포인트" value={`${member.point.toLocaleString("ko-KR")}P`} />
        </div>
      </Card>

      <Card>
        <div className="rn:flex rn:items-center rn:justify-between">
          <CardTitle>계정 정보</CardTitle>
          <div className="rn:flex rn:items-center rn:gap-4">
            <span className="rn:text-body2 rn:font-regular rn:text-ink-2">계정 잠금</span>
            <InfoTip label="계정 잠금 안내">
              계정 잠금 처리 시 잠금을 해제하기
              <br />
              전까지 회원이 로그인 할 수 없습니다.
            </InfoTip>
            {/* 잠금: 확인 알럿 후 적용. 해제는 디자인에 알럿이 없어 바로 적용한다. */}
            <Switch
              aria-label="계정 잠금"
              checked={lock.data?.locked ?? false}
              disabled={lock.isLoading || setLock.isPending}
              onCheckedChange={(checked) => (checked ? setLockOpen(true) : setLock.mutate(false))}
            />
          </div>
        </div>
        <FormTable>
          <FormRow>
            <FormField label="회원 이름">{member.name}</FormField>
            <FormField label="가입일">{member.reg_date}</FormField>
          </FormRow>
          <FormRow>
            <FormField label="생년월일">{formatBirthDay(member.birth_day)}</FormField>
            <FormField label="성별">-</FormField>
          </FormRow>
          <FormRow>
            <FormField label="휴대폰 번호">
              {member.hp}
              <Tag tone={member.is_auth === "Y" ? "success" : "error"}>
                {member.is_auth === "Y" ? "인증완료" : "미인증"}
              </Tag>
            </FormField>
            <FormField label="이메일">
              {member.email}
              {memberStatus !== undefined && (
                <Tag tone={isEmailVerified(memberStatus) ? "success" : "error"}>
                  {isEmailVerified(memberStatus) ? "인증완료" : "미인증"}
                </Tag>
              )}
              {/* 기획: 미인증일 때만 노출. 누르면 사용자가 직접 인증하지 않아도 인증완료로 바뀐다. */}
              {memberStatus !== undefined && !isEmailVerified(memberStatus) && (
                <Button
                  variant="outline"
                  size="S"
                  disabled={approveMember.isPending}
                  onClick={() => approveMember.mutate(member.m_no)}
                >
                  수동승인
                </Button>
              )}
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="소셜 연동">{snsLabel(member)}</FormField>
            <FormField label="Steam 연동">-</FormField>
          </FormRow>
          <FormRow>
            <FormField label="최근 접속일">{member.log_date}</FormField>
            <FormField label="계정 통합">
              -
              <button
                type="button"
                onClick={() => setMergeOpen(true)}
                className="rn:inline-flex rn:items-center rn:gap-2 rn:rounded-circle rn:text-body3 rn:font-medium rn:text-ink-2"
              >
                계정 통합 상세
                <img src={iconArrowRight} alt="" width={20} height={20} />
              </button>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="정책 동의">-</FormField>
          </FormRow>
        </FormTable>
      </Card>

      <Card>
        <LineTabs
          aria-label="회원 상세 탭"
          items={TABS}
          value={tab}
          onValueChange={(value) => setTab(value as DetailTab)}
        />
        {tab === "orders" && <OrdersPanel orders={data.orders.items} email={member.email} />}
        {tab === "level" && <LevelPanel history={data.level_history} email={member.email} />}
        {tab === "review" && <ReviewsPanel m_no={m_no} />}
      </Card>

      <ConfirmModal
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        message="회원을 탈퇴 처리할까요?"
        onConfirm={handleLeave}
        pending={leaveMember.isPending}
      />
      <ConfirmModal
        open={lockOpen}
        onOpenChange={setLockOpen}
        message="해당 회원의 계정 잠금 처리 시 회원이 로그인 할 수 없게 됩니다."
        pending={setLock.isPending}
        onConfirm={() => setLock.mutate(true, { onSuccess: () => setLockOpen(false) })}
      />
      {/* 계정 통합 API가 없어 상세 데이터는 비어 있다(AccountMergeDetail 계약 참조). */}
      <AccountMergeModal open={mergeOpen} onOpenChange={setMergeOpen} />
    </div>
  );
};
