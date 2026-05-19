import { useState } from 'react';
import { createPortal } from 'react-dom';

const FONT = "'AlibabaPuHuiTi_2_55_Regular','Alibaba PuHuiTi 2.0',system-ui,sans-serif";
const FONT_MEDIUM = "'AlibabaPuHuiTi_2_65_Medium','Alibaba PuHuiTi 2.0',system-ui,sans-serif";

const PROJECT_SUB_TABS = ['角色', '场景', '道具', '分镜图', '分镜视频'];
const CREATIVE_SUB_TABS = ['图片', '视频'];

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
        background: asset.url ? 'transparent' : '#252525',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {asset.url ? (
          <img src={asset.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isHovered && !isSelected ? 0.85 : 1, transition: 'opacity 100ms' }} />
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

export default function AssetPickerModal({ open, onClose, onConfirm, assets = [], creativeAssets = [] }) {
  const [activeTab, setActiveTab] = useState('project');
  const [projectSubTab, setProjectSubTab] = useState('角色');
  const [creativeSubTab, setCreativeSubTab] = useState('图片');
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

  if (!open) return null;

  const toggle = (id) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleConfirm = () => {
    onConfirm?.(Array.from(selected));
    onClose?.();
  };

  const currentAssets = activeTab === 'project' ? assets : creativeAssets;
  const filteredAssets = currentAssets.filter(a => !search || (a.name || '').includes(search));

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
              {/* 项目名称下拉（仅 UI） */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0', height: '32px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '8px', background: '#FFFFFF0D', cursor: 'pointer', flexShrink: 0 }}>
                <span style={{ fontFamily: FONT_MEDIUM, fontWeight: 500, fontSize: '14px', lineHeight: '18px', color: '#FFFFFFCC', whiteSpace: 'nowrap' }}>这是项目名称</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginLeft: '0' }}>
                  <path d="M12 6.333L8 10.333L4 6.333H12Z" fill="#FFFFFFCC" stroke="#FFFFFFCC" strokeWidth="1.333" strokeLinejoin="round" />
                </svg>
              </div>
              {/* 子 Tab */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                {PROJECT_SUB_TABS.map((tab) => {
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
              {CREATIVE_SUB_TABS.map((tab) => {
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
