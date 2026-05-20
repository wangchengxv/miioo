import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const FONT = "'AlibabaPuHuiTi_2_55_Regular','Alibaba PuHuiTi 2.0',system-ui,sans-serif";
const FONT_MEDIUM = "'AlibabaPuHuiTi_2_65_Medium','Alibaba PuHuiTi 2.0',system-ui,sans-serif";

// accept='image' → 只允许图片类资产；'video' → 只允许视频类资产；'audio' → 只允许音频类资产；'all' → 不限制
const PROJECT_SUB_TABS_ALL = ['角色', '场景', '道具', '分镜图', '分镜视频'];
const PROJECT_SUB_TABS_IMAGE = ['角色', '场景', '道具', '分镜图'];
const PROJECT_SUB_TABS_VIDEO = ['分镜视频'];
const PROJECT_SUB_TABS_AUDIO = ['音频'];
const CREATIVE_SUB_TABS_ALL = ['图片', '视频'];
const CREATIVE_SUB_TABS_IMAGE = ['图片'];
const CREATIVE_SUB_TABS_VIDEO = ['视频'];
const CREATIVE_SUB_TABS_AUDIO = ['配音'];

// ── Mock 数据（接口接入前使用）────────────────────────────────────────────────
const MOCK_PROJECTS = [
  { id: 'p1', name: '星际迷途' },
  { id: 'p2', name: '暗夜追踪' },
  { id: 'p3', name: '光影之间' },
  { id: 'p4', name: '未来边界' },
];

const MOCK_PROJECT_ASSETS_MAP = {
  p1: {
    chars: [
      { id: 'c1', name: '老虎主角', bgColor: '#252525' },
      { id: 'c2', name: '老虎姈姈', bgColor: '#1F2320' },
      { id: 'c3', name: '老虎弟弟', bgColor: '#20201F' },
      { id: 'c4', name: '老虎妹妹', bgColor: '#202024' },
      { id: 'c5', name: '小老虎 A', bgColor: '#1F2020' },
      { id: 'c6', name: '反派狼', bgColor: '#1D2020' },
    ],
    scenes: [
      { id: 's1', name: '森林入口', bgColor: '#1A2018' },
      { id: 's2', name: '老虎洞穴', bgColor: '#1E2020' },
      { id: 's3', name: '山顶瞭望台', bgColor: '#1C1E1A' },
    ],
    props: [
      { id: 'pr1', name: '猎人陷阱', bgColor: '#201E1A' },
      { id: 'pr2', name: '老虎项圈', bgColor: '#1E1E22' },
    ],
    storyboard_img: [
      { id: 'si1', name: '第1集_镜头01', bgColor: '#1E2022' },
      { id: 'si2', name: '第1集_镜头02', bgColor: '#201E22' },
      { id: 'si3', name: '第1集_镜头03', bgColor: '#1E2020' },
    ],
    storyboard_video: [
      { id: 'sv1', name: '第1集_预览', bgColor: '#1A1E24' },
      { id: 'sv2', name: '第2集_预览', bgColor: '#1E1A24' },
    ],
    audio: [
      { id: 'au1', name: '背景音乐_森林.mp3', bgColor: '#1E2022', type: 'audio' },
      { id: 'au2', name: '音效_风声.wav', bgColor: '#201E22', type: 'audio' },
      { id: 'au3', name: '配乐_主题曲.mp3', bgColor: '#1E2020', type: 'audio' },
    ],
  },
  p2: {
    chars: [
      { id: 'p2c1', name: '侦探主角', bgColor: '#1E2022' },
      { id: 'p2c2', name: '神秘女人', bgColor: '#201E22' },
    ],
    scenes: [
      { id: 'p2s1', name: '夜晚街道', bgColor: '#1A1A20' },
      { id: 'p2s2', name: '废弃仓库', bgColor: '#1E1A1A' },
    ],
    props: [
      { id: 'p2pr1', name: '线索笔记本', bgColor: '#201E1A' },
    ],
    storyboard_img: [
      { id: 'p2si1', name: '第1集_镜头01', bgColor: '#1E2022' },
    ],
    storyboard_video: [],
    audio: [
      { id: 'p2au1', name: '悬疑背景音.mp3', bgColor: '#1A1A20', type: 'audio' },
    ],
  },
  p3: {
    chars: [
      { id: 'p3c1', name: '摄影师', bgColor: '#1E2020' },
    ],
    scenes: [
      { id: 'p3s1', name: '摄影棚', bgColor: '#201E20' },
      { id: 'p3s2', name: '城市天台', bgColor: '#1E2022' },
    ],
    props: [],
    storyboard_img: [
      { id: 'p3si1', name: '第1集_镜头01', bgColor: '#1E2022' },
      { id: 'p3si2', name: '第1集_镜头02', bgColor: '#201E22' },
    ],
    storyboard_video: [
      { id: 'p3sv1', name: '第1集_预览', bgColor: '#1A1E24' },
    ],
    audio: [],
  },
  p4: {
    chars: [],
    scenes: [
      { id: 'p4s1', name: '未来城市', bgColor: '#1A1E24' },
    ],
    props: [
      { id: 'p4pr1', name: '飞行器', bgColor: '#1E1A24' },
    ],
    storyboard_img: [],
    storyboard_video: [],
    audio: [
      { id: 'p4au1', name: '科幻音效.wav', bgColor: '#1E1A24', type: 'audio' },
    ],
  },
};

const MOCK_CREATIVE_ASSETS = {
  images: [
    { id: 'img1', name: '镜头_001.jpg', bgColor: '#1E2022', starred: true },
    { id: 'img2', name: '场景草图.png', bgColor: '#201E22', starred: false },
    { id: 'img3', name: '角色设定.jpg', bgColor: '#1E2020', starred: true },
    { id: 'img4', name: '道具参考.png', bgColor: '#202024', starred: false },
    { id: 'img5', name: '分镜_A01.jpg', bgColor: '#1F2020', starred: false },
    { id: 'img6', name: '背景板.png', bgColor: '#1D2020', starred: false },
  ],
  videos: [
    { id: 'vid1', name: '第1集_预览.mp4', bgColor: '#1A1E24', starred: true },
    { id: 'vid2', name: '第2集_预览.mp4', bgColor: '#1E1A24', starred: false },
    { id: 'vid3', name: '片头动画.mp4', bgColor: '#1A1A20', starred: false },
  ],
  dubbing: [
    { id: 'dub1', name: '旁白_第1集.mp3', bgColor: '#1E2022', starred: true, type: 'audio' },
    { id: 'dub2', name: '角色配音_主角.wav', bgColor: '#201E22', starred: false, type: 'audio' },
    { id: 'dub3', name: '旁白_第2集.mp3', bgColor: '#1E2020', starred: false, type: 'audio' },
    { id: 'dub4', name: '角色配音_反派.wav', bgColor: '#1A1A20', starred: true, type: 'audio' },
  ],
};

// 子 Tab → projectAssetsMap 的 key
const SUB_TAB_KEY_MAP = {
  '角色': 'chars',
  '场景': 'scenes',
  '道具': 'props',
  '分镜图': 'storyboard_img',
  '分镜视频': 'storyboard_video',
  '音频': 'audio',
  '图片': 'images',
  '视频': 'videos',
  '配音': 'dubbing',
};

function Checkbox({ checked, hovered }) {
  return (
    <div style={{
      position: 'relative', width: '14px', height: '14px', borderRadius: '3px', flexShrink: 0,
      border: `1px solid ${hovered ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'}`,
      outline: '1px solid #00000080',
      background: checked ? '#2DC3E1' : '#090909',
      transition: 'background 100ms, border-color 100ms',
    }}>
      {checked && (
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%' }}>
          <path d="M3.333 8L6.667 11.333L13.333 4.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

function AssetCard({ asset, isSelected, isHovered, onMouseEnter, onMouseLeave, onClick }) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        width: '175px', height: '208px', borderRadius: '10px', overflow: 'hidden',
        flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: '#1C1C1C',
        border: `1px solid ${isSelected ? '#FFFFFF33' : isHovered ? 'rgba(255,255,255,0.2)' : '#FFFFFF0F'}`,
        cursor: 'pointer', transition: 'border-color 100ms',
      }}
    >
      {/* 图片区 */}
      <div style={{
        height: '168px', flexShrink: 0, position: 'relative',
        background: asset.url ? 'transparent' : (asset.bgColor || '#252525'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {asset.url ? (
          <img src={asset.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isHovered && !isSelected ? 0.85 : 1, transition: 'opacity 100ms' }} />
        ) : asset.type === 'audio' ? (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M12 26V8l16-3v18" stroke="#FFFFFF26" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8" cy="26" r="4" stroke="#FFFFFF26" strokeWidth="1.5"/>
            <circle cx="24" cy="23" r="4" stroke="#FFFFFF26" strokeWidth="1.5"/>
          </svg>
        ) : (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="3" y="6" width="26" height="20" rx="3" stroke="#FFFFFF26" strokeWidth="1.5" />
            <circle cx="11" cy="13" r="2.5" stroke="#FFFFFF26" strokeWidth="1.5" />
            <path d="M4 22L10 15L15 20L20 14L28 22" stroke="#FFFFFF26" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        )}
        {/* 复选框 */}
        <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
          <Checkbox checked={isSelected} hovered={isHovered} />
        </div>
        {/* 收藏图标（仅创作资产有 starred 字段时显示） */}
        {asset.starred && (
          <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5l1.545 3.13 3.455.503-2.5 2.436.59 3.44L7 9.369l-3.09 1.64.59-3.44L2 5.133l3.455-.503L7 1.5z" fill="#F0B429" stroke="#F0B429" strokeWidth="1.1" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
      {/* 底部标签 */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', background: '#1C1C1C', flex: 1 }}>
        <span style={{
          fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%',
        }}>{asset.name || '未命名'}</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="16" fill="#FFFFFF05" />
        <path d="M22 42C22 38.686 24.686 36 28 36H46L52 42H72C75.314 42 78 44.686 78 48V68C78 71.314 75.314 74 72 74H28C24.686 74 22 71.314 22 68V42Z" fill="#FFFFFF0A" stroke="#FFFFFF1A" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="34" y="50" width="32" height="16" rx="3" fill="#FFFFFF0D" stroke="#FFFFFF14" strokeWidth="1" />
        <path d="M34 66L42 56L48 62L54 55L66 66" stroke="#FFFFFF26" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="60" cy="54" r="2.5" stroke="#FFFFFF26" strokeWidth="1.5" />
      </svg>
      <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '20px', color: '#FFFFFF40' }}>资产库暂无资产</span>
    </div>
  );
}

export default function AssetPickerModal({
  open,
  onClose,
  onConfirm,
  // accept: 'image' | 'video' | 'all'  控制可选资产类型
  accept = 'all',
  // projects: [{ id, name }]  项目列表；未传时使用 mock 数据
  projects = MOCK_PROJECTS,
  // projectAssetsMap: { [projectId]: { chars, scenes, props, storyboard_img, storyboard_video } }；未传时使用 mock 数据
  projectAssetsMap = MOCK_PROJECT_ASSETS_MAP,
  // creativeAssets: { images: [], videos: [] }  创作资产；未传时使用 mock 数据
  creativeAssets = MOCK_CREATIVE_ASSETS,
}) {
  const projectSubTabsAvail = accept === 'video' ? PROJECT_SUB_TABS_VIDEO : accept === 'image' ? PROJECT_SUB_TABS_IMAGE : accept === 'audio' ? PROJECT_SUB_TABS_AUDIO : PROJECT_SUB_TABS_ALL;
  const creativeSubTabsAvail = accept === 'video' ? CREATIVE_SUB_TABS_VIDEO : accept === 'image' ? CREATIVE_SUB_TABS_IMAGE : accept === 'audio' ? CREATIVE_SUB_TABS_AUDIO : CREATIVE_SUB_TABS_ALL;

  const [activeTab, setActiveTab] = useState('project');
  const [projectSubTab, setProjectSubTab] = useState(projectSubTabsAvail[0]);
  const [creativeSubTab, setCreativeSubTab] = useState(creativeSubTabsAvail[0]);
  const [favOnly, setFavOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [searchFocused, setSearchFocused] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [closeHovered, setCloseHovered] = useState(false);
  const [cancelHovered, setCancelHovered] = useState(false);
  const [cancelPressed, setCancelPressed] = useState(false);
  const [confirmHovered, setConfirmHovered] = useState(false);
  const [confirmPressed, setConfirmPressed] = useState(false);
  const [favHovered, setFavHovered] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [projectHovIdx, setProjectHovIdx] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(projects[0]?.id ?? null);
  const projectBtnRef = useRef(null);

  // 当 projects 列表变化时，同步 activeProjectId
  useEffect(() => {
    if (projects.length > 0 && !projects.find(p => p.id === activeProjectId)) {
      setActiveProjectId(projects[0].id);
    }
  }, [projects]);

  // 当 accept 变化时，重置子 Tab 到第一个可用项
  useEffect(() => {
    setProjectSubTab(projectSubTabsAvail[0]);
    setCreativeSubTab(creativeSubTabsAvail[0]);
  }, [accept]);

  if (!open) return null;

  const activeProjectName = projects.find(p => p.id === activeProjectId)?.name ?? '选择项目';

  const toggle = (id) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleConfirm = () => {
    // 构建全量 id→asset map，供按 ID 查完整对象
    const allAssets = [
      ...Object.values(projectAssetsMap).flatMap(p => Object.values(p).flat()),
      ...Object.values(creativeAssets).flat(),
    ];
    const assetMap = Object.fromEntries(allAssets.map(a => [a.id, a]));
    const selectedAssets = Array.from(selected).map(id => assetMap[id]).filter(Boolean);
    onConfirm?.(selectedAssets);
    onClose?.();
  };

  const handleSelectProject = (p) => {
    setActiveProjectId(p.id);
    setProjectOpen(false);
    setProjectHovIdx(null);
  };

  const getProjectBtnRect = () => projectBtnRef.current?.getBoundingClientRect() ?? null;

  // 获取当前内容区资产列表
  const getCurrentAssets = () => {
    if (activeTab === 'project') {
      const projectData = projectAssetsMap[activeProjectId] ?? {};
      const key = SUB_TAB_KEY_MAP[projectSubTab];
      return projectData[key] ?? [];
    } else {
      const key = SUB_TAB_KEY_MAP[creativeSubTab];
      return creativeAssets[key] ?? [];
    }
  };

  const rawAssets = getCurrentAssets();
  const filteredAssets = rawAssets.filter(a => {
    if (favOnly && !a.starred) return false;
    if (search && !(a.name || '').includes(search)) return false;
    return true;
  });

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        style={{ width: '800px', height: '600px', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#161616', border: '1px solid #FFFFFF14' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', flexShrink: 0 }}>
          <span style={{ fontFamily: FONT_MEDIUM, fontWeight: 500, fontSize: '16px', lineHeight: '20px', color: '#FFFFFF' }}>从资产中选择</span>
          <button
            type="button"
            onClick={onClose}
            onMouseEnter={() => setCloseHovered(true)}
            onMouseLeave={() => setCloseHovered(false)}
            style={{ background: closeHovered ? 'rgba(255,255,255,0.08)' : 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', transition: 'background 100ms', flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke={closeHovered ? 'rgba(255,255,255,0.8)' : '#FFFFFF66'} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ── 顶部大 Tab + 搜索框 ── */}
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '24px', paddingRight: '24px', gap: '24px', flexShrink: 0 }}>
          {['project', 'creative'].map((tab) => {
            const label = tab === 'project' ? '项目资产' : '创作资产';
            const isActive = activeTab === tab;
            return (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  paddingTop: '12px', paddingBottom: '6px',
                  borderBottom: `2px solid ${isActive ? '#2DC3E1' : 'transparent'}`,
                  cursor: 'pointer', flexShrink: 0, transition: 'border-color 100ms',
                }}
              >
                <span style={{
                  fontFamily: isActive ? FONT_MEDIUM : FONT,
                  fontWeight: isActive ? 500 : 400,
                  fontSize: '14px', lineHeight: '20px',
                  color: isActive ? '#2DC3E1' : '#FFFFFF99',
                  transition: 'color 100ms',
                }}>{label}</span>
              </div>
            );
          })}
          {/* 右侧：创作资产有收藏过滤，项目资产无 */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', height: '48px' }}>
            {activeTab === 'creative' && (
              <div
                onClick={() => setFavOnly(v => !v)}
                onMouseEnter={() => setFavHovered(true)}
                onMouseLeave={() => setFavHovered(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}
              >
                <Checkbox checked={favOnly} hovered={favHovered} />
                <span style={{ fontFamily: FONT, fontSize: '13px', lineHeight: '18px', color: '#FFFFFF66', whiteSpace: 'nowrap' }}>仅显示收藏</span>
              </div>
            )}
            {/* 搜索框 */}
            <div style={{
              display: 'flex', alignItems: 'center', height: '36px', width: '232px',
              paddingLeft: '12px', paddingRight: '6px', borderRadius: '8px',
              justifyContent: 'space-between', flexShrink: 0,
              background: searchFocused ? 'rgba(45,195,225,0.04)' : '#1D1E1E',
              border: `1px solid ${searchFocused ? 'rgba(45,195,225,0.6)' : '#FFFFFF14'}`,
              outline: searchFocused ? '3px solid rgba(45,195,225,0.08)' : '1px solid #00000080',
              transition: 'border-color 120ms, background 120ms',
            }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索资产"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF', caretColor: '#2DC3E1' }}
                className="placeholder:text-[rgba(255,255,255,0.4)]"
              />
              <div style={{ display: 'flex', alignItems: 'center', height: '24px', borderRadius: '6px', padding: '0 8px' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M7 12.667C10.13 12.667 12.667 10.13 12.667 7C12.667 3.87 10.13 1.333 7 1.333C3.87 1.333 1.333 3.87 1.333 7C1.333 10.13 3.87 12.667 7 12.667Z" stroke={searchFocused ? '#FFFFFF' : '#FFFFFF99'} strokeLinejoin="round" />
                  <path d="M11.074 11.074L13.902 13.902" stroke={searchFocused ? '#FFFFFF' : '#FFFFFF99'} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ── 子 Tab 栏 ── */}
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '24px', paddingRight: '24px', paddingTop: '12px', gap: '24px', flexShrink: 0 }}>
          {activeTab === 'project' && (
            <>
              {/* 项目名称下拉 */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  ref={projectBtnRef}
                  onClick={() => setProjectOpen(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0', height: '32px', paddingLeft: '16px', paddingRight: '8px', borderRadius: '8px', background: projectOpen ? '#FFFFFF1A' : '#FFFFFF0D', cursor: 'pointer', flexShrink: 0, transition: 'background 100ms' }}
                >
                  <span style={{ fontFamily: FONT_MEDIUM, fontWeight: 500, fontSize: '14px', lineHeight: '18px', color: '#FFFFFFCC', whiteSpace: 'nowrap' }}>{activeProjectName}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, transition: 'transform 150ms', transform: projectOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <path d="M12 6.333L8 10.333L4 6.333H12Z" fill="#FFFFFFCC" stroke="#FFFFFFCC" strokeWidth="1.333" strokeLinejoin="round" />
                  </svg>
                </div>
                {projectOpen && projects.length > 0 && (() => {
                  const rect = getProjectBtnRect();
                  return createPortal(
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 1200 }} onClick={() => { setProjectOpen(false); setProjectHovIdx(null); }} />
                      <div
                        style={{
                          position: 'fixed',
                          top: rect ? rect.bottom + 4 : 0,
                          left: rect ? rect.left : 0,
                          zIndex: 1201,
                          minWidth: rect ? rect.width : 120,
                          background: '#1C1C1C',
                          border: '1px solid #FFFFFF14',
                          borderRadius: '10px',
                          padding: '4px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0',
                        }}
                      >
                        {projects.map((p, i) => (
                          <div
                            key={p.id}
                            onClick={() => handleSelectProject(p)}
                            onMouseEnter={() => setProjectHovIdx(i)}
                            onMouseLeave={() => setProjectHovIdx(null)}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              height: '32px', paddingLeft: '12px', paddingRight: '12px', borderRadius: '7px',
                              cursor: 'pointer',
                              background: projectHovIdx === i ? '#FFFFFF0F' : 'transparent',
                              transition: 'background 80ms',
                            }}
                          >
                            <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: activeProjectId === p.id ? '#FFFFFF' : '#FFFFFFB3', whiteSpace: 'nowrap' }}>{p.name}</span>
                            {activeProjectId === p.id && (
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginLeft: '8px' }}>
                                <path d="M3.333 8L6.667 11.333L13.333 4.667" stroke="#2DC3E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    </>,
                    document.body
                  );
                })()}
              </div>
              {/* 子 Tab */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                {projectSubTabsAvail.map((tab) => {
                  const isActive = projectSubTab === tab;
                  return (
                    <div
                      key={tab}
                      onClick={() => setProjectSubTab(tab)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <span style={{ fontFamily: isActive ? FONT_MEDIUM : FONT, fontWeight: isActive ? 500 : 400, fontSize: '14px', lineHeight: '18px', color: isActive ? '#FFFFFF' : '#FFFFFF99', transition: 'color 100ms', whiteSpace: 'nowrap' }}>{tab}</span>
                      <div style={{ height: '2px', alignSelf: 'stretch', background: isActive ? '#DDDDDD' : 'transparent', borderRadius: '1px', transition: 'background 100ms' }} />
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {activeTab === 'creative' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
              {creativeSubTabsAvail.map((tab) => {
                const isActive = creativeSubTab === tab;
                return (
                  <div
                    key={tab}
                    onClick={() => setCreativeSubTab(tab)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  >
                    <span style={{ fontFamily: isActive ? FONT_MEDIUM : FONT, fontWeight: isActive ? 500 : 400, fontSize: '14px', lineHeight: '18px', color: isActive ? '#FFFFFF' : '#FFFFFF99', transition: 'color 100ms', whiteSpace: 'nowrap' }}>{tab}</span>
                    <div style={{ height: '2px', alignSelf: 'stretch', background: isActive ? '#DDDDDD' : 'transparent', borderRadius: '1px', transition: 'background 100ms' }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 内容区（可滚动） ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px', display: 'flex', flexDirection: 'column' }}>
          {filteredAssets.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', paddingTop: '8px', paddingBottom: '8px', alignContent: 'flex-start' }}>
              {filteredAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  isSelected={selected.has(asset.id)}
                  isHovered={hoveredCard === asset.id}
                  onMouseEnter={() => setHoveredCard(asset.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => toggle(asset.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-end', padding: '16px 24px', flexShrink: 0, borderRadius: '0 0 16px 16px' }}>
          <button
            type="button"
            onClick={onClose}
            onMouseEnter={() => setCancelHovered(true)}
            onMouseLeave={() => { setCancelHovered(false); setCancelPressed(false); }}
            onMouseDown={() => setCancelPressed(true)}
            onMouseUp={() => setCancelHovered(true)}
            style={{ display: 'flex', alignItems: 'center', height: '36px', borderRadius: '8px', padding: '0 16px', cursor: 'pointer', background: cancelPressed ? '#1A1A1A' : cancelHovered ? '#1D1D1D' : '#161616', border: '1px solid #FFFFFF0D', outline: '1px solid #00000080', boxShadow: '#00000066 3px 3px 8px', transition: 'background 100ms' }}
          >
            <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: cancelHovered ? '#FFFFFFCC' : '#FFFFFF99', whiteSpace: 'nowrap', transition: 'color 100ms' }}>取消</span>
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            onMouseEnter={() => setConfirmHovered(true)}
            onMouseLeave={() => { setConfirmHovered(false); setConfirmPressed(false); }}
            onMouseDown={() => setConfirmPressed(true)}
            onMouseUp={() => setConfirmHovered(true)}
            style={{ display: 'flex', flexDirection: 'column', height: '36px', borderRadius: '8px', outline: '1px solid #00000080', boxShadow: '#00000066 3px 3px 8px', padding: '1px', backgroundImage: 'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 30%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.08))', cursor: 'pointer', border: 'none', transition: 'opacity 100ms', opacity: confirmPressed ? 0.75 : 1 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, borderRadius: '7px', padding: '0 15px', background: confirmPressed ? '#111111' : confirmHovered ? '#1A1A1A' : '#161616', transition: 'background 100ms' }}>
              <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>确定</span>
            </div>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
