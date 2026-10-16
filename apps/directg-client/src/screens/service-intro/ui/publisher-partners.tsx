"use client";

import { useState } from "react";

/**
 * legacy `$publisher_array` (code → name). 75개 리터럴, 키 "53" 중복(Aspyr→Atari).
 * PHP 연관배열 last-wins 재현: 아래 순서대로 Map에 넣어 53=Atari, Aspyr 제외(74개).
 */
const PUBLISHER_ENTRIES: [number, string][] = [
  [90, "WiredProductions"],
  [135, "10Chambers"],
  [11, "11bitstudios"],
  [71, "Fulqrum-Publishing"],
  [12, "2K"],
  [85, "34BigThingssrl"],
  [46, "505Games"],
  [70, "AmanitaDesign"],
  [47, "ArcSystemWorks"],
  [53, "Aspyr"],
  [62, "Badland"],
  [133, "BehaviourInteractive"],
  [38, "BethesdaSoftworks"],
  [34, "Capcom"],
  [66, "CFK"],
  [1, "Cigames"],
  [114, "CITYCONNECTION"],
  [132, "CloudedLeopard"],
  [87, "CurveGames"],
  [73, "D3PUBLISHER"],
  [59, "DefiantDevelopment"],
  [115, "Digicon"],
  [96, "Dotemu"],
  [22, "Focus"],
  [81, "Funcom"],
  [163, "Gearbox"],
  [140, "Graffiti-Games"],
  [43, "GreyBox"],
  [48, "Haemimont"],
  [88, "HandyGames"],
  [154, "HatinhInteractive"],
  [98, "HeadupGmbH"],
  [136, "HitGrab"],
  [99, "IcebergInteractive"],
  [40, "InXileEntertainment"],
  [6, "KalypsoMedia"],
  [75, "Konami"],
  [49, "LeagueofGeeks"],
  [45, "LevelUpLabs"],
  [126, "Lightning"],
  [120, "Mantisco"],
  [143, "MapleWhispering"],
  [130, "Merge"],
  [63, "Microids"],
  [91, "Milestone"],
  [109, "MIXTVISION"],
  [100, "Modus"],
  [84, "Nacon"],
  [117, "NEOWIZ"],
  [72, "NISAmerica"],
  [30, "Paradox"],
  [119, "Pieplus"],
  [25, "PlugInDigital"],
  [78, "PridefulSloth"],
  [86, "PrivateDivision"],
  [134, "RedHookStudio"],
  [14, "Rockstar"],
  [97, "SamuraiPunk"],
  [93, "SEGA"],
  [89, "Shiro"],
  [74, "SNK"],
  [58, "Team17"],
  [23, "THQNordic"],
  [52, "Ubisoft"],
  [128, "UnitedLabel"],
  [80, "Versus"],
  [3, "WarnerBros"],
  [112, "WayForward"],
  [53, "Atari"],
];

/** code 중복 last-wins dedup(53=Atari) 후 이름 ASC(코드유닛=PHP SORT_REGULAR strcmp) 정렬. */
const PUBLISHERS: string[] = Array.from(
  PUBLISHER_ENTRIES.reduce(
    (map, [code, name]) => map.set(code, name),
    new Map<number, string>(),
  ).values(),
).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

/**
 * 세계 유수의 파트너 퍼블리셔 로고 그리드 (legacy `section_item3` + jQuery hover 스왑).
 * hover 시 이미지 `_0`→`_1`, 부모 배경 #fff / 벗어나면 `_0`·#131B26 복원.
 */
export function PublisherPartners() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="section_content">
      <div className="section_container">
        {PUBLISHERS.map((name) => {
          const isHovered = hovered === name;
          const suffix = isHovered ? "1" : "0";
          return (
            <div
              key={name}
              className="section_item3"
              style={{ background: isHovered ? "#ffffff" : "#131B26" }}
              onMouseOver={() => setHovered(name)}
              onMouseOut={() => setHovered(null)}
            >
              <img
                src={`/assets/images/service/v4/${name}_partners_contents_${suffix}.png?4`}
                alt={name}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
