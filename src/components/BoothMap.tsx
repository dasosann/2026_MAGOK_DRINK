"use client";

import { useId, useRef, useState, useMemo, useEffect, useCallback } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import rawMapData from "@/data/booth-map-data.json";

export interface BoothMember {
  id: string;
  name: string;
}

export interface Booth {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  members: BoothMember[];
}

interface Shape {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

interface TextLabel {
  x: number;
  y: number;
  size: number;
  text: string;
  fill: string;
}

interface MapData {
  viewBox: [number, number, number, number];
  shapes: Shape[];
  texts: TextLabel[];
  booths: Booth[];
}

const mapData = rawMapData as unknown as MapData;

import boothCategoriesRaw from "@/data/booth-categories.json";
const boothCategories = boothCategoriesRaw as Record<string, string>;

// 품목 카테고리 태그
const CATEGORY_TAGS = [
  { label: "전체 품목", key: "ALL" },
  { label: "전통주", key: "전통주" },
  { label: "증류주/고량주", key: "증류주/고량주" },
  { label: "수입 와인", key: "수입 와인" },
  { label: "한국와인/과실주", key: "한국와인/과실주" },
  { label: "맥주", key: "맥주" },
  { label: "사케", key: "사케" },
  { label: "리큐르/종합", key: "리큐르/종합" },
  { label: "안주/식품", key: "안주/식품" },
  { label: "기타", key: "기타" },
];

// 🎨 카테고리별 고유 색상
const CATEGORY_COLOR: Record<string, { fill: string; stroke: string; dot: string }> = {
  "전통주":       { fill: "#FDE68A", stroke: "#D97706", dot: "#B45309" },
  "증류주/고량주": { fill: "#FED7AA", stroke: "#EA580C", dot: "#C2410C" },
  "수입 와인":    { fill: "#FECDD3", stroke: "#E11D48", dot: "#BE123C" },
  "한국와인/과실주":{ fill: "#F0ABFC", stroke: "#A21CAF", dot: "#86198F" },
  "맥주":        { fill: "#BAE6FD", stroke: "#0284C7", dot: "#0369A1" },
  "사케":        { fill: "#BBF7D0", stroke: "#16A34A", dot: "#15803D" },
  "리큐르/종합":  { fill: "#DDD6FE", stroke: "#7C3AED", dot: "#6D28D9" },
  "안주/식품":   { fill: "#FEF08A", stroke: "#CA8A04", dot: "#A16207" },
  "편의 시설":   { fill: "#E2E8F0", stroke: "#64748B", dot: "#475569" },
  "기타":        { fill: "#F5F5F4", stroke: "#A8A29E", dot: "#78716C" },
};
type Props = {
  onBoothSelect?: (booth: Booth) => void;
};

// 🎨 구역별 고유 색상 팔레트 정의 (도면 배경에서 처음부터 구분 표시)
export const ZONE_CONFIG: Record<
  string,
  {
    name: string;
    fill: string;
    stroke: string;
    badgeBg: string;
    badgeText: string;
    dotColor: string;
  }
> = {
  A: {
    name: "A구역 (편의/지원)",
    fill: "#E0E7FF",
    stroke: "#A5B4FC",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-900",
    dotColor: "#6366F1",
  },
  B: {
    name: "B구역",
    fill: "#D1FAE5",
    stroke: "#6EE7B7",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-900",
    dotColor: "#10B981",
  },
  C: {
    name: "C구역",
    fill: "#DBEAFE",
    stroke: "#93C5FD",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-900",
    dotColor: "#3B82F6",
  },
  D: {
    name: "D구역",
    fill: "#E0F2FE",
    stroke: "#7DD3FC",
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-900",
    dotColor: "#0EA5E9",
  },
  E: {
    name: "E구역 (해외/식품)",
    fill: "#FEF3C7",
    stroke: "#FCD34D",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-900",
    dotColor: "#F59E0B",
  },
  F: {
    name: "F구역",
    fill: "#FCE7F3",
    stroke: "#F9A8D4",
    badgeBg: "bg-pink-100",
    badgeText: "text-pink-900",
    dotColor: "#EC4899",
  },
  G: {
    name: "G구역",
    fill: "#DCFCE7",
    stroke: "#86EFAC",
    badgeBg: "bg-green-100",
    badgeText: "text-green-900",
    dotColor: "#22C55E",
  },
  H: {
    name: "H구역",
    fill: "#F3E8FF",
    stroke: "#D8B4FE",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-900",
    dotColor: "#A855F7",
  },
  J: {
    name: "J구역",
    fill: "#FFEDD5",
    stroke: "#FDBA74",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-900",
    dotColor: "#F97316",
  },
  K: {
    name: "K구역",
    fill: "#FFE4E6",
    stroke: "#FDA4AF",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-900",
    dotColor: "#F43F5E",
  },
  L: {
    name: "L구역",
    fill: "#CCFBF1",
    stroke: "#5EEAD4",
    badgeBg: "bg-teal-100",
    badgeText: "text-teal-900",
    dotColor: "#14B8A6",
  },
  N: {
    name: "N구역 (운영/의무)",
    fill: "#F1F5F9",
    stroke: "#CBD5E1",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-800",
    dotColor: "#64748B",
  },
  S: {
    name: "S구역",
    fill: "#FEF9C3",
    stroke: "#FDE047",
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-900",
    dotColor: "#EAB308",
  },
};

const DEFAULT_ZONE_STYLE = {
  name: "기타",
  fill: "#F5F5F4",
  stroke: "#D6D3D1",
  badgeBg: "bg-stone-100",
  badgeText: "text-stone-800",
  dotColor: "#78716C",
};

export const getZoneConfig = (boothId: string) => {
  const prefix = boothId.charAt(0).toUpperCase();
  return ZONE_CONFIG[prefix] || DEFAULT_ZONE_STYLE;
};

const normalize = (value: string) => value.toLocaleLowerCase().replace(/[\s-]/g, "");

const matches = (booth: Booth, query: string) => {
  const q = normalize(query);
  const target = normalize(
    [booth.id, booth.name, ...booth.members.flatMap((m) => [m.id, m.name])].join(" ")
  );
  return target.includes(q);
};

// 상단 필터용 탭 목록
const ZONE_TAGS = [
  { label: "전체 구역", key: "ALL", dot: "#862572" },
  { label: "편의시설", key: "FACILITY", dot: "#64748B" },
  { label: "A (편의)", key: "A", dot: ZONE_CONFIG.A.dotColor },
  { label: "B", key: "B", dot: ZONE_CONFIG.B.dotColor },
  { label: "C", key: "C", dot: ZONE_CONFIG.C.dotColor },
  { label: "D", key: "D", dot: ZONE_CONFIG.D.dotColor },
  { label: "E (해외/식품)", key: "E", dot: ZONE_CONFIG.E.dotColor },
  { label: "F", key: "F", dot: ZONE_CONFIG.F.dotColor },
  { label: "G", key: "G", dot: ZONE_CONFIG.G.dotColor },
  { label: "H", key: "H", dot: ZONE_CONFIG.H.dotColor },
  { label: "J", key: "J", dot: ZONE_CONFIG.J.dotColor },
  { label: "K", key: "K", dot: ZONE_CONFIG.K.dotColor },
  { label: "L", key: "L", dot: ZONE_CONFIG.L.dotColor },
  { label: "N (운영)", key: "N", dot: ZONE_CONFIG.N.dotColor },
];

export default function BoothMap({ onBoothSelect }: Props) {
  const uid = useId();
  const [query, setQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<Booth | null>(null);
  const [hoveredBooth, setHoveredBooth] = useState<Booth | null>(null);
  const [copied, setCopied] = useState(false);

  // ⭐ 즐겨찾기 (Set of booth IDs) — localStorage 연동
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem("booth-favorites");
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  // ✅ 방문 완료 (Set of booth IDs) — localStorage 연동
  const [visited, setVisited] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem("booth-visited");
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  // localStorage 동기화
  useEffect(() => {
    localStorage.setItem("booth-favorites", JSON.stringify([...favorites]));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("booth-visited", JSON.stringify([...visited]));
  }, [visited]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleVisited = useCallback((id: string) => {
    setVisited((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<SVGSVGElement>(null);

  // 드래그(Pan) 핸들러 상태
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number }>({
    x: 0,
    y: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  // 검색 결과
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return mapData.booths.filter((b) => matches(b, query));
  }, [query]);

  // 구역 필터링 부스
  const zoneBooths = useMemo(() => {
    if (selectedZone === "ALL") return [];
    return mapData.booths.filter((b) => b.id.startsWith(selectedZone));
  }, [selectedZone]);

  // 시설명 텍스트만 분리 (부스 ID는 사각형 중앙 렌더링으로 일원화)
  const facilityTexts = useMemo(() => {
    const boothIdRegex = /^[A-Z]-\d{2}(?:\s*~\s*\d{2})?$/;
    return mapData.texts.filter((t) => !boothIdRegex.test(t.text.trim()));
  }, []);

  // 부스 선택 및 포커싱 이동
  const select = useCallback(
    (booth: Booth, reveal = false) => {
      setSelected(booth);
      onBoothSelect?.(booth);

      if (reveal && containerRef.current && mapRef.current) {
        const [vx, vy, vw, vh] = mapData.viewBox;
        const rect = mapRef.current.getBoundingClientRect();
        const scaleX = rect.width / vw;
        const scaleY = rect.height / vh;

        const targetX = (booth.x + booth.width / 2 - vx) * scaleX;
        const targetY = (booth.y + booth.height / 2 - vy) * scaleY;

        containerRef.current.scrollTo({
          left: targetX - containerRef.current.clientWidth / 2,
          top: targetY - containerRef.current.clientHeight / 2,
          behavior: "smooth",
        });
      }
    },
    [onBoothSelect]
  );

  // 정보 복사
  const copyBoothInfo = (booth: Booth) => {
    const text = `${booth.id} ${booth.name}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 마우스 드래그 패닝 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === "rect") return;
    if (!containerRef.current) return;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !containerRef.current) return;
    e.preventDefault();
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    containerRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
    containerRef.current.scrollTop = panStartRef.current.scrollTop - dy;
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  useEffect(() => {
    const upHandler = () => setIsPanning(false);
    window.addEventListener("mouseup", upHandler);
    return () => window.removeEventListener("mouseup", upHandler);
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-stone-100 font-sans text-stone-900 select-none">
      {/* 📱 모바일 최적화 상단 앱바 */}
      <header className="shrink-0 bg-gradient-to-r from-[#862572] via-[#94277e] to-[#711e60] px-4 py-3 text-white shadow-md sm:px-6 sm:py-3.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg">🍷</span>
              <h1 className="text-base font-bold tracking-tight truncate sm:text-xl">
                2026 서울국제주류&와인박람회 마곡
              </h1>
            </div>
            <p className="hidden text-xs text-fuchsia-200 sm:block sm:mt-0.5">
              구역별 색상 구분 배치도 · 부스를 탭하면 상세 참가업체 및 품목 정보를 확인할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs text-fuchsia-100 border border-white/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              총 {mapData.booths.length}개 부스
            </span>
          </div>
        </div>
      </header>

      {/* 🔍 검색 바 & 구역 선택 필터 */}
      <div className="shrink-0 border-b border-stone-200 bg-white px-3 py-2 sm:px-6 sm:py-2.5 shadow-2xs">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* 검색창 */}
            <div className="relative flex-1">
              <input
                id={`${uid}-search`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="부스 번호(예: H-06, E-13) 또는 업체명(와인, 양조장, 막걸리) 검색"
                className="w-full rounded-lg border border-stone-300 bg-stone-50 pl-9 pr-8 py-2 text-xs sm:text-sm outline-none focus:bg-white focus:border-fuchsia-700 focus:ring-2 focus:ring-fuchsia-700/20 transition placeholder:text-stone-400"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs sm:text-sm">
                🔍
              </span>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 줌 컨트롤 (PC/태블릿) */}
            <div className="hidden sm:flex items-center gap-1 bg-stone-50 p-1 rounded-lg border border-stone-200 shrink-0">
              <button
                type="button"
                aria-label="축소"
                disabled={zoom <= 1}
                onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
                className="h-7 w-7 flex items-center justify-center rounded border border-stone-300 bg-white text-xs font-bold disabled:opacity-30 hover:bg-stone-100"
              >
                −
              </button>
              <output className="w-12 text-center text-xs font-semibold">{Math.round(zoom * 100)}%</output>
              <button
                type="button"
                aria-label="확대"
                disabled={zoom >= 3.5}
                onClick={() => setZoom((z) => Math.min(3.5, +(z + 0.25).toFixed(2)))}
                className="h-7 w-7 flex items-center justify-center rounded border border-stone-300 bg-white text-xs font-bold disabled:opacity-30 hover:bg-stone-100"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="px-2 h-7 text-xs text-stone-600 hover:text-stone-900 rounded"
              >
                초기화
              </button>
            </div>
          </div>

          {/* 구역 빠른 필터 스크롤 (구역 고유 컬러 도트 표시) */}
          <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <span className="text-[11px] font-semibold text-stone-400 shrink-0 mr-0.5">구역:</span>
            {ZONE_TAGS.map((z) => (
              <button
                key={z.key}
                type="button"
                onClick={() => {
                  setSelectedZone(z.key);
                  setSelectedCategory("ALL"); // 구역 선택 시 품목 필터 초기화
                  if (z.key !== "ALL") {
                    const targetPrefix = z.key === "FACILITY" ? "A" : z.key;
                    const firstBooth = mapData.booths.find((b) => b.id.startsWith(targetPrefix));
                    if (firstBooth && containerRef.current && mapRef.current) {
                      const [vx, vy, vw, vh] = mapData.viewBox;
                      const rect = mapRef.current.getBoundingClientRect();
                      const scaleX = rect.width / vw;
                      const scaleY = rect.height / vh;
                      const targetX = (firstBooth.x + firstBooth.width / 2 - vx) * scaleX;
                      const targetY = (firstBooth.y + firstBooth.height / 2 - vy) * scaleY;
                      containerRef.current.scrollTo({
                         left: targetX - containerRef.current.clientWidth / 2,
                         top: targetY - containerRef.current.clientHeight / 2,
                         behavior: "smooth",
                      });
                    }
                  }
                }}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 text-[11px] sm:text-xs rounded-full border transition active:scale-95 ${
                  selectedZone === z.key
                    ? "bg-[#862572] text-white border-[#862572] font-bold shadow-2xs"
                    : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: z.dot }}
                ></span>
                {z.label}
              </button>
            ))}
          </div>

          {/* 품목 카테고리 필터 스크롤 */}
          <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[11px] font-semibold text-stone-400 shrink-0 mr-0.5">품목:</span>
            {CATEGORY_TAGS.map((c) => {
              const catDot = CATEGORY_COLOR[c.key]?.dot;
              const isActive = selectedCategory === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(c.key);
                    setSelectedZone("ALL"); // 품목 선택 시 구역 필터 초기화
                  }}
                  className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 text-[11px] sm:text-xs rounded-full border transition active:scale-95 ${
                    isActive
                      ? "bg-[#862572] text-white border-[#862572] font-bold shadow-2xs"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {catDot && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: isActive ? "#fff" : catDot }}
                    />
                  )}
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🗺️ 메인 지도 뷰어 + 우측 사이드바(PC) */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* 부스배치도 SVG 뷰어 컨테이너 */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`h-full w-full overflow-auto bg-stone-200/50 p-2 sm:p-4 touch-pan-x touch-pan-y ${
            isPanning ? "cursor-grabbing" : "cursor-grab"
          }`}
          tabIndex={0}
        >
          <div
            style={{
              width: `${zoom * 100}%`,
              minWidth: "760px",
              transition: isPanning ? "none" : "width 0.15s ease-out",
            }}
            className="mx-auto relative bg-white rounded-xl shadow-sm overflow-hidden border border-stone-200"
          >
            <svg
              ref={mapRef}
              viewBox={mapData.viewBox.join(" ")}
              className="block h-auto w-full"
              role="group"
            >
              {/* 정적 도면 도형 (벽면, 기둥, 소화전 등) */}
              <g aria-hidden="true" pointerEvents="none">
                {mapData.shapes.map((shape, i) => (
                  <path
                    key={`shape-${i}`}
                    d={shape.d}
                    fill={shape.fill || "none"}
                    stroke={shape.stroke || "none"}
                    strokeWidth={shape.strokeWidth ?? 0}
                  />
                ))}

                {/* 도면 주요 시설 한글 라벨 (편의시설 필터가 선택되었을 때만 표시하여 맵 깔끔하게 유지) */}
                {(selectedZone === "FACILITY" || selectedCategory === "편의 시설") && facilityTexts.map((label, i) => (
                  <text
                    key={`text-${i}`}
                    x={label.x}
                    y={label.y}
                    fontSize={label.size * 1.25}
                    fill={label.fill}
                    fontFamily="Pretendard, system-ui, -apple-system, 'Noto Sans KR', sans-serif"
                    fontWeight="800"
                    letterSpacing="-0.02em"
                    paintOrder="stroke fill"
                    stroke="#ffffff"
                    strokeWidth={4.0}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  >
                    {label.text}
                  </text>
                ))}
              </g>

              {/* 🎨 인터랙티브 부스 레이어 (부스 사각형 + 정중앙 정렬 부스 번호) */}
              <g>
                {mapData.booths.map((booth) => {
                  const isSelected = selected?.id === booth.id;
                  const isHit = Boolean(query.trim()) && matches(booth, query);
                  const isHovered = hoveredBooth?.id === booth.id;

                  const zoneCfg = getZoneConfig(booth.id);
                  const isFacilityZone = booth.id.startsWith("A") || booth.id.startsWith("N");
                  const boothCategory = boothCategories[booth.id] || "기타";
                  
                  const isZoneActive = selectedZone === "ALL" || booth.id.startsWith(selectedZone) || (selectedZone === "FACILITY" && isFacilityZone);
                  const isCategoryActive = selectedCategory === "ALL" || boothCategory === selectedCategory;

                  const isDefaultView = selectedZone === "ALL" && selectedCategory === "ALL";
                  const isTarget = isZoneActive && isCategoryActive && !isDefaultView;

                  let fillColor = "transparent";
                  let fillOpacity = 0;
                  let strokeColor = zoneCfg.stroke;
                  let strokeWidth = 1.8;

                  // 카테고리 필터가 활성화된 경우 카테고리 색상 우선 사용
                  const catColor = CATEGORY_COLOR[boothCategory] ?? CATEGORY_COLOR["기타"];
                  const isCategoryFiltered = selectedCategory !== "ALL";
                  // 카테고리 필터 활성 시 각 부스는 자신의 카테고리 색으로 표시 (전체 다 보임)
                  const activeFill = isCategoryFiltered ? catColor.fill : zoneCfg.fill;
                  const activeStroke = isCategoryFiltered ? catColor.stroke : zoneCfg.dotColor;

                  if (isDefaultView) {
                    // 1. 기본 화면: 구역 테두리 색 구분
                    fillColor = "#FFFFFF";
                    fillOpacity = 0.5;
                    strokeColor = zoneCfg.dotColor;
                    strokeWidth = 2.0;

                    if (isHovered) {
                      fillColor = zoneCfg.fill;
                      fillOpacity = 0.85;
                      strokeWidth = 3.0;
                    }
                  } else {
                    // 2. 필터링 상태
                    if (isTarget) {
                      fillColor = activeFill;
                      fillOpacity = 0.92;
                      strokeColor = activeStroke;
                      strokeWidth = 3.2;
                    } else {
                      fillColor = "#F5F5F4";
                      fillOpacity = 0.2;
                      strokeColor = "#D6D3D1";
                      strokeWidth = 1.0;
                    }

                    if (isHovered && isTarget) {
                      fillOpacity = 1;
                      strokeWidth = 4.0;
                    }
                  }

                  // 3. 검색 일치 상태 (골드 옐로우 하이라이트)
                  if (isHit) {
                    fillColor = "#FEF08A";
                    fillOpacity = 0.95;
                    strokeColor = "#CA8A04";
                    strokeWidth = 3.8;
                  }

                  // 4. 부스 선택 상태 (안정적인 박람회 시그니처 마젠타 강조 - 무한 반복 애니메이션 제거)
                  if (isSelected) {
                    fillColor = "#A21CAF";
                    fillOpacity = 0.45;
                    strokeColor = "#86198F";
                    strokeWidth = 5.5;
                  }

                  const isFavorite = favorites.has(booth.id);
                  const isVisited = visited.has(booth.id);

                  const centerX = booth.x + booth.width / 2;
                  const centerY = booth.y + booth.height / 2;

                  return (
                    <g key={booth.id}>
                      <rect
                        data-booth={booth.id}
                        x={booth.x + 1}
                        y={booth.y + 1}
                        width={Math.max(0, booth.width - 2)}
                        height={Math.max(0, booth.height - 2)}
                        rx={3}
                        fill={fillColor}
                        fillOpacity={fillOpacity}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        role="button"
                        className="cursor-pointer transition-all duration-100 hover:filter hover:brightness-95"
                        onClick={(e) => {
                          e.stopPropagation();
                          select(booth);
                        }}
                        onMouseEnter={() => setHoveredBooth(booth)}
                        onMouseLeave={() => setHoveredBooth(null)}
                      >
                        <title>
                          {booth.id}: {booth.name}
                        </title>
                      </rect>

                      {/* 🎯 부스 번호 라벨: 사각형 정중앙 완벽 정렬 + 굵은 가독성 + 흰색 후광 */}
                      <text
                        x={centerX}
                        y={centerY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={
                          booth.id.length > 7
                            ? 17
                            : booth.width > 120
                            ? 25
                            : 21
                        }
                        fill="#0C0A09"
                        fontFamily="Pretendard, system-ui, -apple-system, sans-serif"
                        fontWeight="800"
                        letterSpacing="-0.03em"
                        paintOrder="stroke fill"
                        stroke="#FFFFFF"
                        strokeWidth={3.8}
                        strokeLinejoin="round"
                        pointerEvents="none"
                      >
                        {booth.id}
                      </text>

                      {/* ⭐ 즐겨찾기 별 아이콘 (우상단) */}
                      {isFavorite && (
                        <text
                          x={booth.x + booth.width - 4}
                          y={booth.y + 4}
                          textAnchor="end"
                          dominantBaseline="hanging"
                          fontSize={Math.min(booth.width, booth.height) * 0.35}
                          pointerEvents="none"
                        >
                          ⭐
                        </text>
                      )}

                      {/* ✅ 방문 완료 체크 아이콘 (좌상단) */}
                      {isVisited && (
                        <text
                          x={booth.x + 4}
                          y={booth.y + 4}
                          textAnchor="start"
                          dominantBaseline="hanging"
                          fontSize={Math.min(booth.width, booth.height) * 0.35}
                          pointerEvents="none"
                        >
                          ✅
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* 📱 모바일 플로팅 줌 컨트롤러 (우측 하단) */}
        <div className="absolute right-4 bottom-20 sm:bottom-6 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-stone-200">
          <button
            type="button"
            aria-label="확대"
            disabled={zoom >= 3.5}
            onClick={() => setZoom((z) => Math.min(3.5, +(z + 0.3).toFixed(2)))}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-100 text-stone-800 text-lg font-bold hover:bg-stone-200 active:scale-90 transition disabled:opacity-30"
          >
            +
          </button>
          <div className="text-[10px] text-center font-bold text-stone-600 select-none">
            {Math.round(zoom * 100)}%
          </div>
          <button
            type="button"
            aria-label="축소"
            disabled={zoom <= 1}
            onClick={() => setZoom((z) => Math.max(1, +(z - 0.3).toFixed(2)))}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-100 text-stone-800 text-lg font-bold hover:bg-stone-200 active:scale-90 transition disabled:opacity-30"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="w-10 h-8 flex items-center justify-center rounded-xl text-[10px] font-semibold text-fuchsia-800 hover:bg-fuchsia-50 active:scale-90 transition"
          >
            맞춤
          </button>
        </div>

        {/* 💻 PC 전용 우측 사이드바 (xl 이상에서 항상 표시) */}
        <aside className="hidden xl:flex w-84 flex-col border-l border-stone-200 bg-white p-4 overflow-y-auto shrink-0 shadow-xs">
          <div className="space-y-4">
            {/* 즐겨찾기/방문 요약 */}
            <div className="flex gap-2 text-xs">
              <div className="flex-1 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 flex items-center gap-2">
                <span className="text-base">⭐</span>
                <div>
                  <div className="font-bold text-amber-800">{favorites.size}개</div>
                  <div className="text-amber-600 text-[10px]">즐겨찾기</div>
                </div>
              </div>
              <div className="flex-1 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 flex items-center gap-2">
                <span className="text-base">✅</span>
                <div>
                  <div className="font-bold text-emerald-800">{visited.size}개</div>
                  <div className="text-emerald-600 text-[10px]">방문 완료</div>
                </div>
              </div>
            </div>

            {/* 선택 부스 정보 카드 */}
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs font-bold text-stone-500 uppercase">선택한 부스</span>
                {selected && (
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="text-xs text-stone-400 hover:text-stone-700 underline"
                  >
                    해제
                  </button>
                )}
              </div>

              {selected ? (
                <div className="mt-3 space-y-3">
                  <div>
                    {(() => {
                      const cfg = getZoneConfig(selected.id);
                      const bCat = boothCategories[selected.id] || "기타";
                      return (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-base font-extrabold ${cfg.badgeBg} ${cfg.badgeText}`}
                          >
                            {selected.id}
                          </span>
                          <span className="text-[11px] font-semibold text-stone-500">
                            {cfg.name}
                          </span>
                          <span className="text-[10px] font-bold text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200 px-1.5 py-0.5 rounded-full ml-1">
                            {bCat}
                          </span>
                        </div>
                      );
                    })()}
                    <h3 className="mt-2 text-base font-bold text-stone-900 leading-snug break-keep">
                      {selected.name}
                    </h3>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => copyBoothInfo(selected)}
                      className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-stone-300 bg-white hover:bg-stone-100 transition"
                    >
                      {copied ? "✓ 복사됨" : "📋 번호 복사"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (zoom < 1.75) setZoom(1.75);
                        setTimeout(() => select(selected, true), 100);
                      }}
                      className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-[#862572] text-white hover:bg-[#711e60] transition"
                    >
                      🎯 화면 맞춤
                    </button>
                  </div>

                  {/* ⭐ 즐겨찾기 / ✅ 방문 토글 버튼 */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(selected.id)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition ${
                        favorites.has(selected.id)
                          ? "bg-amber-50 border-amber-400 text-amber-700 hover:bg-amber-100"
                          : "bg-white border-stone-300 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      {favorites.has(selected.id) ? "⭐ 즐겨찾기 해제" : "☆ 즐겨찾기"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleVisited(selected.id)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition ${
                        visited.has(selected.id)
                          ? "bg-emerald-50 border-emerald-400 text-emerald-700 hover:bg-emerald-100"
                          : "bg-white border-stone-300 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      {visited.has(selected.id) ? "✅ 방문 완료" : "☐ 방문 표시"}
                    </button>
                  </div>

                  {selected.members && selected.members.length > 0 && (
                    <div className="rounded-lg bg-white p-2.5 border border-stone-200 text-xs">
                      <p className="font-bold text-stone-600 mb-1.5">
                        공동 참가사 ({selected.members.length}개)
                      </p>
                      <ul className="space-y-1">
                        {selected.members.map((m) => (
                          <li key={m.id} className="flex gap-1.5 text-stone-700">
                            <span className="font-bold text-fuchsia-700 shrink-0">{m.id}</span>
                            <span className="break-keep">{m.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-stone-400">
                  지도에서 부스를 탭해주세요.
                </div>
              )}
            </div>

            {/* 검색 결과 목록 */}
            {query.trim() && (
              <div className="rounded-xl border border-stone-200 bg-white p-3">
                <p className="text-xs font-bold text-stone-600 mb-2">
                  검색 결과 ({results.length}건)
                </p>
                <ul className="max-h-72 overflow-y-auto space-y-1.5 text-xs">
                  {results.map((b) => {
                    const cfg = getZoneConfig(b.id);
                    return (
                      <li key={b.id}>
                        <button
                          type="button"
                          onClick={() => {
                            if (zoom < 1.5) setZoom(1.5);
                            setTimeout(() => select(b, true), 80);
                          }}
                          className="w-full text-left p-2 rounded border border-stone-100 bg-stone-50 hover:bg-fuchsia-50 hover:border-fuchsia-300 transition"
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${cfg.badgeBg} ${cfg.badgeText}`}>
                              {b.id}
                            </span>
                            <span className="text-[9px] font-bold text-fuchsia-600 bg-white border border-fuchsia-200 px-1 py-0.5 rounded-sm">
                              {boothCategories[b.id] || "기타"}
                            </span>
                          </div>
                          <div className="text-stone-800 break-keep font-medium leading-snug">{b.name}</div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </aside>

        {/* 📱 모바일 부스 상세 — shadcn Drawer */}
        <Drawer modal={false} open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
          <DrawerContent className="xl:hidden px-4 pb-6 pointer-events-auto shadow-2xl">
            {selected && (() => {
              const cfg = getZoneConfig(selected.id);
              const bCat = boothCategories[selected.id] || "기타";
              return (
                <>
                  <DrawerHeader className="text-left px-0 pt-2 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-extrabold ${cfg.badgeBg} ${cfg.badgeText}`}>
                            {selected.id}
                          </span>
                          <span className="text-[11px] font-semibold text-stone-500">{cfg.name}</span>
                          <span className="text-[10px] font-bold text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200 px-1.5 py-0.5 rounded-full">
                            {bCat}
                          </span>
                        </div>
                        <DrawerTitle className="text-base font-bold text-stone-900 leading-snug break-keep">
                          {selected.name}
                        </DrawerTitle>
                        <DrawerDescription className="sr-only">부스 상세 정보</DrawerDescription>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelected(null)}
                        className="rounded-full bg-stone-100 p-1.5 text-stone-400 hover:text-stone-700 shrink-0"
                        aria-label="닫기"
                      >
                        ✕
                      </button>
                    </div>
                  </DrawerHeader>

                  {/* 공동 참가업체 */}
                  {selected.members && selected.members.length > 0 && (
                    <div className="mb-3 max-h-28 overflow-y-auto rounded-lg bg-stone-50 p-2 text-xs border border-stone-200">
                      <p className="font-bold text-stone-600 mb-1">공동 참가업체 ({selected.members.length}개)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {selected.members.map((m) => (
                          <div key={m.id} className="flex gap-1.5 text-stone-700 bg-white p-1.5 rounded">
                            <span className="font-bold text-fuchsia-800">{m.id}</span>
                            <span className="truncate">{m.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 즐겨찾기 / 방문 */}
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(selected.id)}
                      className={`flex-1 rounded-xl border py-2.5 text-sm font-bold transition active:scale-95 ${
                        favorites.has(selected.id)
                          ? "bg-amber-50 border-amber-400 text-amber-700"
                          : "bg-stone-50 border-stone-300 text-stone-600"
                      }`}
                    >
                      {favorites.has(selected.id) ? "⭐ 즐겨찾기 해제" : "☆ 즐겨찾기"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleVisited(selected.id)}
                      className={`flex-1 rounded-xl border py-2.5 text-sm font-bold transition active:scale-95 ${
                        visited.has(selected.id)
                          ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                          : "bg-stone-50 border-stone-300 text-stone-600"
                      }`}
                    >
                      {visited.has(selected.id) ? "✅ 방문 완료" : "☐ 방문 표시"}
                    </button>
                  </div>

                  {/* 지도 이동 */}
                  <button
                    type="button"
                    onClick={() => {
                      if (zoom < 1.75) setZoom(1.75);
                      setTimeout(() => select(selected, true), 100);
                    }}
                    className="w-full rounded-xl bg-[#862572] py-2.5 text-xs font-bold text-white active:bg-[#711e60] transition"
                  >
                    🎯 지도에서 부스 찾기
                  </button>
                </>
              );
            })()}
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
