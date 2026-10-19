import { Button, FormField, FormRow, FormTable, Modal } from "@/renewal/shared/ui";
import type { AccountMergeDetail, MergedAccount } from "../model/merge";

const text = (value: string | number | undefined, suffix = "") =>
  value === undefined || value === ""
    ? "-"
    : `${typeof value === "number" ? value.toLocaleString("ko-KR") : value}${suffix}`;

// Figma `card`/`card-row`/`info-row`: 테두리 · radius 12 · p20 · 행 gap 8 · 라벨 w80 body3 Medium / 값 body3 Regular
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rn:flex rn:min-h-20 rn:min-w-0 rn:flex-1 rn:items-center rn:gap-8">
    <span className="rn:w-80 rn:shrink-0 rn:text-body3 rn:font-medium rn:text-ink-2">{label}</span>
    <span className="rn:min-w-0 rn:flex-1 rn:text-body3 rn:font-regular rn:text-ink">{value}</span>
  </div>
);

const SourceCard = ({ account }: { account: MergedAccount }) => (
  <div className="rn:flex rn:flex-col rn:gap-8 rn:rounded-12 rn:border rn:border-solid rn:border-line rn:bg-surface rn:p-20">
    <div className="rn:flex rn:gap-24">
      <InfoRow label="이메일" value={text(account.email)} />
      <InfoRow label="휴대폰 번호" value={text(account.phone)} />
    </div>
    <div className="rn:flex rn:gap-24">
      <InfoRow label="이름" value={text(account.name)} />
      <InfoRow label="생년월일" value={text(account.birthDay)} />
    </div>
    <div className="rn:flex rn:gap-24">
      <InfoRow label="보유 포인트" value={text(account.point, "P")} />
      <InfoRow label="보유 쿠폰" value={text(account.coupons, "개")} />
    </div>
    <div className="rn:flex rn:gap-24">
      <InfoRow label="구매 이력" value={text(account.purchases, "건")} />
      <InfoRow label="회원 등급" value={text(account.level)} />
    </div>
    <div className="rn:flex rn:gap-24">
      <InfoRow label="소셜 연동" value={text(account.social)} />
      <InfoRow label="가입일" value={text(account.joinedAt)} />
    </div>
  </div>
);

const SubTitle = ({ children }: { children: string }) => (
  <h3 className="rn:text-body2 rn:font-medium rn:text-ink">{children}</h3>
);

type AccountMergeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail?: AccountMergeDetail;
};

export const AccountMergeModal = ({ open, onOpenChange, detail }: AccountMergeModalProps) => {
  const result = detail?.result;
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="계정 통합 상세"
      footer={
        <Button
          tone="inverse"
          variant="outline"
          className="rn:w-full"
          onClick={() => onOpenChange(false)}
        >
          닫기
        </Button>
      }
    >
      <section className="rn:flex rn:flex-col rn:gap-12">
        <SubTitle>통합 결과</SubTitle>
        <FormTable>
          <FormRow>
            <FormField compact label="이름">
              {text(result?.name)}
            </FormField>
            <FormField compact label="휴대폰 번호">
              {text(result?.phone)}
            </FormField>
          </FormRow>
          <FormRow>
            <FormField compact label="생년월일">
              {text(result?.birthDay)}
            </FormField>
            <FormField compact label="가입일">
              {text(result?.joinedAt)}
            </FormField>
          </FormRow>
          <FormRow>
            <FormField compact label="보유 쿠폰">
              {text(result?.coupons, "개")}
            </FormField>
            <FormField compact label="구매 이력">
              {text(result?.purchases, "건")}
            </FormField>
          </FormRow>
          <FormRow>
            <FormField compact label="회원 등급">
              {text(result?.level)}
            </FormField>
            <FormField compact label="소셜 연동">
              {text(result?.social)}
            </FormField>
          </FormRow>
          <FormRow>
            <FormField compact label="이메일">
              {text(result?.email)}
            </FormField>
          </FormRow>
          <FormRow>
            <FormField compact label="보유 포인트">
              {text(result?.point, "P")}
            </FormField>
          </FormRow>
          <FormRow>
            <FormField compact label="계정 통합일">
              {text(result?.mergedAt)}
            </FormField>
          </FormRow>
          <FormRow>
            <FormField compact label="유의사항 동의">
              {text(result?.agreedAt)}
            </FormField>
          </FormRow>
        </FormTable>
      </section>
      <section className="rn:flex rn:flex-col rn:gap-12">
        <SubTitle>통합 상세</SubTitle>
        <div className="rn:flex rn:flex-col rn:gap-12">
          {(detail?.sources ?? []).map((account) => (
            <SourceCard key={account.email} account={account} />
          ))}
          {(detail?.sources.length ?? 0) === 0 && (
            <p className="rn:text-body3 rn:text-ink-2">통합 이력이 없습니다.</p>
          )}
        </div>
      </section>
    </Modal>
  );
};
