import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import { generatedMembers, isFullFieldMember } from "@shared/mocks/db/member-seed";
import type { AccountMergeDetail, MemberProfile } from "@/renewal/entities/member-profile";

// 회원 프로필(성별/소셜/Steam/계정 통합/정책 동의) mock.
// 전체 필드 계정(앞 20명)은 모든 값이 채워져 있고, 나머지는 일부만 있거나 비어 있다.
const SOCIAL_NAMES = ["네이버", "카카오", "페이코"];
const SNS_LABEL: Record<string, string> = { naver: "네이버", kakao: "카카오", payco: "페이코" };
const LEVEL_NAME = ["일반회원", "정회원", "VIP"];

const dotted = (value: string) => value.slice(0, 10).replaceAll("-", ".");

const birthDot = (birth: string) => {
  if (birth.length === 8) return `${birth.slice(0, 4)}.${birth.slice(4, 6)}.${birth.slice(6, 8)}`;
  if (birth.length === 6) {
    const yy = Number(birth.slice(0, 2));
    return `${yy > 26 ? 1900 + yy : 2000 + yy}.${birth.slice(2, 4)}.${birth.slice(4, 6)}`;
  }
  return "";
};

const profileFor = (m_no: number): MemberProfile => {
  const index = generatedMembers.findIndex((member) => member.m_no === m_no);
  if (index < 0) {
    return { gender: null, socials: [], steam_linked: null, merge: null, policies: null };
  }
  const member = generatedMembers[index];

  if (!isFullFieldMember(m_no)) {
    return {
      gender: index % 3 === 0 ? null : index % 2 === 0 ? "여성" : "남성",
      socials: SNS_LABEL[member.sns_type] ? [SNS_LABEL[member.sns_type]] : [],
      steam_linked: null,
      merge: null,
      policies: null,
    };
  }

  const socials = Array.from(
    { length: (index % 3) + 1 },
    (_, k) => SOCIAL_NAMES[(index + k) % SOCIAL_NAMES.length],
  );
  const level = LEVEL_NAME[member.mem_level - 1];
  const other = generatedMembers[(index + 7) % generatedMembers.length];

  const detail: AccountMergeDetail = {
    result: {
      name: member.name,
      phone: member.hp,
      birthDay: birthDot(member.birth_day),
      joinedAt: dotted(member.reg_date),
      coupons: 2 + (index % 4),
      purchases: 40 + index,
      level,
      social: socials.join(", "),
      email: member.email,
      point: 10500 + index * 100,
      mergedAt: "2026.09.30 14:00:00",
      agreedAt: "2026.09.30 14:00:00",
    },
    sources: [
      {
        email: member.email,
        phone: member.hp,
        name: member.name,
        birthDay: birthDot(member.birth_day),
        point: 10000 + index * 100,
        coupons: 2,
        purchases: 38 + index,
        level,
        social: socials[0],
        joinedAt: dotted(member.reg_date),
      },
      {
        email: other.email || `old${index}@example.com`,
        phone: other.hp || "010-2222-2222",
        name: member.name,
        birthDay: birthDot(member.birth_day),
        point: 500,
        coupons: 0,
        purchases: 2 + (index % 5),
        level: "일반회원",
        social: socials[socials.length - 1],
        joinedAt: dotted(other.reg_date),
      },
    ],
  };

  return {
    gender: index % 2 === 0 ? "여성" : "남성",
    socials,
    steam_linked: index % 3 !== 2,
    // 전체 필드 계정 중 짝수 번째는 계정 통합 이력이 있다.
    merge: index % 2 === 0 ? { merged_at: "2026.09.30 14:00:00", detail } : null,
    policies: { terms: true, privacy: true, marketing: member.mailling === "Y" },
  };
};

export const memberProfileHandlers = [
  http.get(`${env.apiBaseUrl}/admin/member/profile`, ({ request }) => {
    const m_no = Number(new URL(request.url).searchParams.get("m_no"));
    return HttpResponse.json(profileFor(m_no));
  }),
];
