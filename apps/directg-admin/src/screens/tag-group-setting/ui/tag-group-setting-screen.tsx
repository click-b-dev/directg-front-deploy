import { useState } from "react";
import { useTagGroupNonList, useAssignTagGroup, type TagGroupNonItem } from "@entities/tag";

// legacy 하드코딩 태그그룹 옵션(순서 그대로).
const TAG_GROUP_OPTIONS: { value: string; label: string }[] = [
  { value: "G0", label: "게임장르" },
  { value: "GT001", label: "게임장르 > 액션 태그" },
  { value: "GT002", label: "게임장르 > 어드벤처 태그" },
  { value: "GT003", label: "게임장르 > RPG 태그" },
  { value: "GT004", label: "게임장르 > 전략 태그" },
  { value: "GT005", label: "게임장르 > 시뮬레이션 태그" },
  { value: "GT006", label: "게임장르 > 스포츠 태그" },
  { value: "GT007", label: "게임장르 > 캐주얼 태그" },
  { value: "GT009", label: "게임장르 > 레이싱 태그" },
  { value: "GT008", label: "게임장르 > 인디 태그" },
  { value: "C0001", label: "게임카테고리 > 플레이어 수" },
  { value: "C0002", label: "게임카테고리 > 화면 및 디스플레이" },
  { value: "C0003", label: "게임카테고리 > VR 및 컨트롤러 지원" },
  { value: "C0004", label: "게임카테고리 > 게임 서비스 및 기능" },
  { value: "C0005", label: "게임카테고리 > 접근성 기능" },
  { value: "T0001", label: "게임태그 > 그래픽 스타일" },
  { value: "T0002", label: "게임태그 > 게임 시점" },
  { value: "T0003", label: "게임태그 > 게임 테마" },
  { value: "T0004", label: "게임태그 > 게임 기능/특징" },
  { value: "T0005", label: "게임태그 > 플레이 방식" },
  { value: "T0006", label: "게임태그 > 평가" },
  { value: "P0001", label: "PlayStation > VR 장비 및 액세서리" },
  { value: "P0002", label: "PlayStation > 디스플레이 연동 장비" },
  { value: "P0003", label: "PlayStation > 입력 및 제어 장비" },
  { value: "P0004", label: "PlayStation > 오디오 및 커뮤니케이션 장비" },
  { value: "P0005", label: "PlayStation > 충전 및 거치 장비" },
];

// legacy tag/tag_group_setting.php — TAG 그룹설정.
export const TagGroupSettingScreen = () => {
  const { data } = useTagGroupNonList();
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
                    TAG 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">TAG 그룹설정</li>
              </ol>
            </div>
            <h4 className="page-title">TAG 그룹설정</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-8">
          <div className="card">
            <div className="table-responsive">
              <form className="form-horizontal">
                <table className="table table-centered w-100 table-bordered nowrap table-sm">
                  <thead className="table-light">
                    <tr>
                      <th className="text-center">번호</th>
                      <th className="text-center">태그명(국문)</th>
                      <th className="text-center">태그명(영문)</th>
                      <th className="text-center">태그그룹</th>
                      <th className="text-center">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item, i) => (
                      <TagGroupSettingRow key={item.idx} item={item} rowNo={i + 1} />
                    ))}
                  </tbody>
                </table>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const TagGroupSettingRow = ({ item, rowNo }: { item: TagGroupNonItem; rowNo: number }) => {
  // legacy $selected 미채움 → 사전선택 없음(빈값 시작).
  const [code, setCode] = useState("");
  const assign = useAssignTagGroup();

  return (
    <tr>
      <td className="text-center">{rowNo}</td>
      <td>{item.tag_name}</td>
      <td>{item.tag_name_en}</td>
      <td>
        <select
          name="tag_group_code[]"
          className="form-select"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        >
          <option value="">:::TAG 그룹 선택:::</option>
          {TAG_GROUP_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </td>
      <td className="text-center">
        <button
          className="btn btn-secondary btn-sm shadow-none btn_tag_group"
          type="button"
          data-num={item.idx}
          data-mode="tag_group_config"
          disabled={assign.isPending}
          onClick={() => assign.mutate({ idx: item.idx, tag_group_code: code })}
        >
          TAG 그룹설정
        </button>
      </td>
    </tr>
  );
};
