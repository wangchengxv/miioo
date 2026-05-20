import { useState, useRef, useEffect } from 'react';
import BatchGenerateModal from '../components/BatchGenerateModal';
import AssetPickerModal from '../components/AssetPickerModal';
import { apiCreateSubject, apiUpdateSubject, apiDeleteSubject, apiGenerateSubjectImage, apiBatchGenerate, apiGetEpisodes, apiGetModels } from '../api/subject';

const FONT = "'AlibabaPuHuiTi_2_55_Regular','Alibaba PuHuiTi 2.0',system-ui,sans-serif";
const FONT_MEDIUM = "'AlibabaPuHuiTi_2_65_Medium','Alibaba PuHuiTi 2.0',system-ui,sans-serif";

// ── Ghost button (添加角色 / 批量生成角色) ─────────────────────────────────

function GhostButton({ icon, label, fontSize = 14, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex flex-col shrink-0 rounded-[8px] cursor-pointer"
      style={{
        height: '36px',
        padding: '1px',
        backgroundImage: hovered
          ? 'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 45%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, #FFFFFF1E, #FFFFFF1E)'
          : 'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 30%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, #FFFFFF14, #FFFFFF14)',
        boxShadow: '#00000066 3px 3px 8px',
        outline: '1px solid #00000080',
        transition: 'background-image 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div
        className="flex items-center flex-1 self-stretch rounded-[7px] gap-[4px] px-[15px]"
        style={{ backgroundColor: hovered ? '#1C1C1C' : '#161616' }}
      >
        {icon}
        <span
          className="inline-block w-max shrink-0 text-white"
          style={{ fontFamily: FONT, fontSize: `${fontSize}px`, lineHeight: '18px' }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// ── Primary button (开始智能分镜) ──────────────────────────────────────────

function PrimaryButton({ icon, label, onClick }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      className="flex items-center shrink-0 rounded-[8px] gap-[4px] px-[16px] cursor-pointer border border-solid border-[#FFFFFF33] bg-origin-border [outline:1px_solid_#00000080]"
      style={{
        height: '36px',
        backgroundColor: pressed ? '#1E9BB5' : '#2DC3E1',
        backgroundImage: 'linear-gradient(in oklab 107.51deg, oklab(84.6% -0.114 0.031 / 30%) 8.14%, oklab(84.6% -0.114 0.031 / 0%) 54.48%)',
        transition: 'background-color 0.1s',
      }}
      onMouseEnter={(e) => { if (!pressed) e.currentTarget.style.backgroundColor = '#52D4ED'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = pressed ? '#1E9BB5' : '#2DC3E1'; setPressed(false); }}
      onMouseDown={(e) => { setPressed(true); e.currentTarget.style.backgroundColor = '#1E9BB5'; }}
      onMouseUp={(e) => { setPressed(false); e.currentTarget.style.backgroundColor = '#52D4ED'; }}
      onClick={onClick}
    >
      {icon}
      <span
        className="inline-block w-max shrink-0 font-medium"
        style={{ fontFamily: FONT_MEDIUM, fontSize: '14px', lineHeight: '18px', color: '#090909' }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Episode selector (breadcrumb dropdown) ────────────────────────────────

const ITEM_HEIGHT = 36; // px per option row (py-[8px] * 2 + 20px line-height)
const MAX_VISIBLE = 10;

function EpisodeSelector({ episodes, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const dropdownMaxH = ITEM_HEIGHT * MAX_VISIBLE + 8; // 8px = 2 * p-[4px]

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      {open ? (
        /* ── Input trigger (open state) ── */
        <div
          className="flex items-center gap-[6px] h-[28px] pl-[10px] pr-[6px] rounded-[6px] cursor-pointer border border-solid bg-input-bg-normal border-input-border-focus [outline:1px_solid_var(--color-stroke-outline)]"
          style={{ boxShadow: '0px 0px 10px var(--color-glow)', minWidth: '80px' }}
          onClick={() => setOpen(false)}
        >
          <span
            className="flex-1 text-input-text-content text-font-size-14 shrink-0"
            style={{ fontFamily: FONT_MEDIUM, fontWeight: 500, lineHeight: '20px' }}
          >
            {value}
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <path d="M10.5 5.833L7 9.333L3.5 5.833H10.5Z" fill="#FFFFFF99" stroke="#FFFFFF99" strokeWidth="1.167" strokeLinejoin="round" />
          </svg>
        </div>
      ) : (
        /* ── Breadcrumb label (closed state) ── */
        <div
          className="flex items-center rounded-[6px] cursor-pointer"
          style={{
            height: '28px',
            padding: '0 6px',
            backgroundColor: hovered ? '#FFFFFF0F' : 'transparent',
            transition: 'background-color 0.12s',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setOpen(true)}
        >
          <span style={{ fontFamily: FONT_MEDIUM, fontSize: '14px', lineHeight: '20px', color: '#FFFFFFD9', fontWeight: 500 }}>
            {value}
          </span>
        </div>
      )}

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          className="flex flex-col rounded-medium bg-select-bg border border-select-border absolute z-50"
          style={{
            top: 'calc(100% + 4px)',
            left: 0,
            minWidth: '100%',
            padding: '4px',
            boxShadow: '0px 4px 16px var(--color-select-shadow)',
            maxHeight: `${dropdownMaxH}px`,
            overflowY: episodes.length > MAX_VISIBLE ? 'auto' : 'visible',
          }}
        >
          {episodes.map((ep, i) => {
            const isActive = ep === value;
            const isHov = hoveredIdx === i;
            return (
              <div
                key={ep}
                className="flex items-center px-[12px] rounded-md shrink-0"
                style={{
                  height: `${ITEM_HEIGHT}px`,
                  cursor: 'pointer',
                  backgroundColor: isActive
                    ? 'var(--color-select-item-bg-active)'
                    : isHov
                    ? 'var(--color-select-item-bg-hover)'
                    : 'transparent',
                  color: isActive || isHov
                    ? 'var(--color-select-item-text-hover)'
                    : 'var(--color-select-item-text-normal)',
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => { onChange(ep); setOpen(false); }}
              >
                <span
                  className="w-fit shrink-0 text-font-size-14 font-font-weight-regular"
                  style={{ fontFamily: FONT }}
                >
                  {ep}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Toolbar ────────────────────────────────────────────────────────────────

function Toolbar({ projectName, onBack, onAddChar, onBatchGen, onStartStoryboard, addLabel = '添加角色', tabLabel = '角色' }) {
  const [arrowHovered, setArrowHovered] = useState(false);
  return (
    <div className="flex items-center justify-between self-stretch shrink-0">
      {/* breadcrumb */}
      <div className="flex items-center gap-[6px]">
        <svg
          width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0, cursor: 'pointer', opacity: arrowHovered ? 1 : 0.7, transition: 'opacity 0.15s' }}
          onMouseEnter={() => setArrowHovered(true)}
          onMouseLeave={() => setArrowHovered(false)}
          onClick={onBack}
        >
          <path d="M15 5L9 12L15 19" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontFamily: FONT_MEDIUM, fontSize: '16px', lineHeight: '22px', color: '#FFFFFF', fontWeight: 500 }}>
          {projectName}
        </span>
      </div>

      {/* actions */}
      <div className="flex items-center gap-[8px]">
        <GhostButton
          label={addLabel}
          onClick={onAddChar}
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M8 3v10M3 8h10" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        />
        <GhostButton
          label={`批量生成${tabLabel}`}
          fontSize={13}
          onClick={onBatchGen}
          icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <rect x="2" y="3" width="4" height="5" rx="1" stroke="#FFFFFF" strokeWidth="1.2" />
              <rect x="8" y="3" width="4" height="5" rx="1" stroke="#FFFFFF" strokeWidth="1.2" />
              <path d="M2 10.5H12" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          }
        />
        <PrimaryButton
          label="开始智能分镜"
          onClick={onStartStoryboard}
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M5.333 2H2.667C2.298 2 2 2.298 2 2.667V5.333" stroke="#090909" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.333 14H2.667C2.298 14 2 13.701 2 13.333V10.667" stroke="#090909" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.667 14H13.333C13.701 14 14 13.701 14 13.333V10.667" stroke="#090909" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.667 2H13.333C13.701 2 14 2.298 14 2.667V5.333" stroke="#090909" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11.333 8C11.333 6.159 9.841 4.667 8 4.667C6.159 4.667 4.667 6.159 4.667 8C4.667 9.841 6.159 11.333 8 11.333C9.841 11.333 11.333 9.841 11.333 8Z" stroke="#090909" strokeWidth="1.3" />
              <path d="M8 9C7.448 9 7 8.552 7 8C7 7.448 7.448 7 8 7C8.552 7 9 7.448 9 8C9 8.552 8.552 9 8 9Z" fill="#090909" />
            </svg>
          }
        />
      </div>
    </div>
  );
}

// ── Tab nav ────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'char', label: '角色' },
  { key: 'scene', label: '场景' },
  { key: 'prop', label: '道具' },
];

function TabNav({ activeTab, counts, onChange }) {
  return (
    <div className="flex items-center self-stretch shrink-0" style={{ marginTop: '16px', marginBottom: '4px' }}>
      <div className="flex items-start gap-[24px]">
        {TABS.map(({ key, label }) => {
          const isActive = activeTab === key;
          return (
            <div
              key={key}
              className="flex flex-col items-center gap-[4px] cursor-pointer"
              onClick={() => onChange(key)}
            >
              <div className="flex items-center gap-[4px]">
                <span
                  style={{
                    fontFamily: isActive ? FONT_MEDIUM : FONT,
                    fontWeight: isActive ? 500 : 400,
                    fontSize: '14px',
                    lineHeight: '18px',
                    color: isActive ? '#FFFFFF' : '#FFFFFF99',
                    width: 'fit-content',
                    flexShrink: 0,
                  }}
                >
                  {label}
                </span>
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    minWidth: '18px',
                    width: '16px',
                    height: '16px',
                    borderRadius: 'calc(infinity * 1px)',
                    paddingInline: '5px',
                    backgroundColor: isActive ? '#2DC3E1' : '#FFFFFF1A',
                  }}
                >
                  <span
                    style={{
                      fontFamily: isActive ? FONT_MEDIUM : FONT,
                      fontWeight: isActive ? 500 : 400,
                      fontSize: '11px',
                      lineHeight: '100%',
                      color: isActive ? '#000000BF' : '#FFFFFF66',
                    }}
                  >
                    {counts[key] ?? 0}
                  </span>
                </div>
              </div>
              {isActive && (
                <div className="self-stretch shrink-0" style={{ height: '2px', backgroundColor: '#DDDDDD' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Voice select modal ─────────────────────────────────────────────────────

const VOICE_OPTIONS = ['霸气威武', '高冷御姐', '温柔甜美', '活泼少年', '沉稳大叔', '清新少女', '磁性男声', '俏皮萝莉'];

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M12 6.333L8 10.333L4 6.333H12Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1.333" strokeLinejoin="round" />
  </svg>
);

const HeadphoneIcon = ({ color = '#2DC3E1' }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M3.333 12V8C3.333 5.423 5.423 3.333 8 3.333C10.577 3.333 12.667 5.423 12.667 8V12M3.333 8.667H2C1.632 8.667 1.333 8.965 1.333 9.333V12C1.333 12.368 1.632 12.667 2 12.667H3.333V8.667ZM12.667 8.667H14C14.368 8.667 14.667 8.965 14.667 9.333V12C14.667 12.368 14.368 12.667 14 12.667H12.667V8.667Z" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.333 10.667H6.667L7.333 8.667L8.667 12.667L9.333 10.667H10.667" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlayingWaveIcon = ({ color = '#2DC3E1', size = 16 }) => (
  <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', flexShrink: 0 }}>
    {[
      { anim: 'voice-bar-1 0.8s ease-in-out infinite', h: 4 },
      { anim: 'voice-bar-2 0.8s ease-in-out infinite 0.15s', h: 8 },
      { anim: 'voice-bar-3 0.8s ease-in-out infinite 0.3s', h: 5 },
      { anim: 'voice-bar-4 0.8s ease-in-out infinite 0.45s', h: 10 },
    ].map((bar, i) => (
      <div
        key={i}
        style={{
          width: '2px', height: `${bar.h}px`, borderRadius: '1px',
          backgroundColor: color, animation: bar.anim,
        }}
      />
    ))}
  </div>
);

function SelectField({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
      <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF99' }}>{label}</span>
      <div
        style={{
          display: 'flex', alignItems: 'center', height: '36px', width: '100%',
          borderRadius: '8px', padding: '0 12px', gap: '8px',
          background: '#1D1E1E', border: '1px solid #FFFFFF14', outline: '1px solid #00000080',
        }}
      >
        <span style={{ flex: 1, fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF' }}>{value}</span>
        <ChevronDownIcon />
      </div>
    </div>
  );
}

function VoiceCard({ label, active, onClick }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '6px', borderRadius: '8px', padding: '8px', cursor: 'pointer',
        background: '#1D1E1E',
        border: `1px solid ${active ? '#2DC3E1' : '#FFFFFF14'}`,
        transition: 'border-color 0.12s',
      }}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setPlaying((v) => !v); }}
        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {playing
          ? <PlayingWaveIcon color="#2DC3E1" size={16} />
          : <HeadphoneIcon color="#2DC3E1" />
        }
      </button>
      <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '17px', color: active ? '#2DC3E1' : '#FFFFFF99', textAlign: 'center' }}>
        {label}
      </span>
    </div>
  );
}

function VoiceSelectModal({ open, onClose, onConfirm, currentVoice }) {
  const [selected, setSelected] = useState(currentVoice || VOICE_OPTIONS[0]);

  if (!open) return null;

  const rows = [];
  for (let i = 0; i < VOICE_OPTIONS.length; i += 4) {
    rows.push(VOICE_OPTIONS.slice(i, i + 4));
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 110,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '400px', background: '#161616',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: '#161616' }}>
          <span style={{ fontFamily: FONT_MEDIUM, fontWeight: 500, fontSize: '16px', lineHeight: '20px', color: '#FFFFFF', flex: 1 }}>
            选择音色
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.667 2.667L13.333 13.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.667 13.333L13.333 2.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 24px', background: '#161616' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <SelectField label="性别" value="不限" />
            <SelectField label="年龄" value="不限" />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <SelectField label="情感" value="不限" />
            <SelectField label="语种" value="中文" />
          </div>

          {/* voice grid */}
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: '14px' }}>
              {row.map((v) => (
                <VoiceCard key={v} label={v} active={selected === v} onClick={() => setSelected(v)} />
              ))}
            </div>
          ))}
        </div>

        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', padding: '16px 24px', background: '#161616' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              height: '36px', borderRadius: '8px', padding: '0 16px',
              background: '#161616', border: '1px solid #FFFFFF0D',
              boxShadow: '#00000066 3px 3px 8px', outline: '1px solid #00000080',
              cursor: 'pointer', fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF99',
            }}
          >
            取消
          </button>
          <div
            style={{
              height: '36px', borderRadius: '8px', padding: '1px',
              backgroundImage: 'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 30%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, #FFFFFF14, #FFFFFF14)',
              boxShadow: '#00000066 3px 3px 8px', outline: '1px solid #00000080',
              cursor: 'pointer', display: 'flex',
            }}
            onClick={() => { onConfirm?.(selected); onClose(); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, borderRadius: '7px', padding: '0 15px', background: '#161616' }}>
              <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>确认</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirm modal ───────────────────────────────────────────────────

function DeleteConfirmModal({ onCancel, onConfirm }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: '360px',
          background: '#161616',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '#00000099 0px 8px 32px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontFamily: FONT_MEDIUM, fontWeight: 500, fontSize: '16px', lineHeight: '20px', color: '#FFFFFF' }}>
              确定要删除吗？
            </span>
            <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: 'rgba(255,255,255,0.6)' }}>
              删除后，该主体相关数据将被清除且不可恢复。
            </span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px', padding: 0, flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <path d="M2.667 2.667L13.333 13.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.667 13.333L13.333 2.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '36px',
              flexShrink: 0,
              borderRadius: '8px',
              paddingLeft: '16px',
              paddingRight: '16px',
              boxShadow: '#00000066 3px 3px 8px',
              backgroundColor: '#161616',
              border: '1px solid #FFFFFF14',
              outline: '1px solid #00000080',
              cursor: 'pointer',
              fontFamily: FONT,
              fontSize: '14px',
              lineHeight: '18px',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '36px',
              flexShrink: 0,
              borderRadius: '8px',
              paddingLeft: '16px',
              paddingRight: '16px',
              backgroundColor: '#D13B3B',
              border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              fontFamily: FONT_MEDIUM,
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '18px',
              color: '#FFFFFF',
            }}
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Character card ─────────────────────────────────────────────────────────

function MoreMenu({ onDownload, onDelete }) {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hovIdx, setHovIdx] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const items = [
    {
      label: '下载',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <path d="M2.667 11.333V13.333H13.333V11.333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 2.667V10.667" stroke="currentColor" strokeLinecap="round" />
          <path d="M5 7.667L8 10.667L11 7.667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      action: () => { onDownload?.(); setOpen(false); },
      danger: false,
    },
    {
      label: '删除',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <path d="M3 3.333V14.667H13V3.333H3Z" stroke="currentColor" strokeLinejoin="round" />
          <path d="M6.667 6.667V11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.333 6.667V11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1.333 3.333H14.667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.333 3.333L6.43 1.333H9.592L10.667 3.333H5.333Z" stroke="currentColor" strokeLinejoin="round" />
        </svg>
      ),
      action: () => { setOpen(false); setShowConfirm(true); },
      danger: true,
    },
  ];

  return (
    <>
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          type="button"
          className="flex items-center justify-center shrink-0 rounded-md cursor-pointer border-0"
          style={{
            width: '24px',
            height: '24px',
            backgroundColor: open ? '#FFFFFF26' : '#00000080',
            transition: 'background-color 0.12s',
          }}
          onMouseEnter={(e) => { if (!open) e.currentTarget.style.backgroundColor = '#FFFFFF1A'; }}
          onMouseLeave={(e) => { if (!open) e.currentTarget.style.backgroundColor = '#00000080'; }}
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <path d="M8 5C8.552 5 9 4.552 9 4C9 3.448 8.552 3 8 3C7.448 3 7 3.448 7 4C7 4.552 7.448 5 8 5Z" fill="#FFFFFF" />
            <path d="M8 9C8.552 9 9 8.552 9 8C9 7.448 8.552 7 8 7C7.448 7 7 7.448 7 8C7 8.552 7.448 9 8 9Z" fill="#FFFFFF" />
            <path d="M8 12.667C8.552 12.667 9 12.219 9 11.667C9 11.114 8.552 10.667 8 10.667C7.448 10.667 7 11.114 7 11.667C7 12.219 7.448 12.667 8 12.667Z" fill="#FFFFFF" />
          </svg>
        </button>

        {open && (
          <div
            className="absolute z-50 flex flex-col rounded-medium bg-select-bg border border-select-border"
            style={{
              top: 'calc(100% + 4px)',
              right: 0,
              minWidth: '100px',
              padding: '4px',
              boxShadow: '0px 4px 16px var(--color-select-shadow)',
            }}
          >
            {items.map((item, i) => (
              <div
                key={item.label}
                className="flex items-center gap-[4px] px-[12px] rounded-md shrink-0 cursor-pointer"
                style={{
                  height: '36px',
                  color: item.danger
                    ? (hovIdx === i ? '#F75F5F' : '#FF7A7A99')
                    : (hovIdx === i ? 'var(--color-select-item-text-hover)' : 'var(--color-select-item-text-normal)'),
                  backgroundColor: hovIdx === i ? 'var(--color-select-item-bg-hover)' : 'transparent',
                  transition: 'background-color 0.1s, color 0.1s',
                }}
                onMouseEnter={() => setHovIdx(i)}
                onMouseLeave={() => setHovIdx(null)}
                onClick={(e) => { e.stopPropagation(); item.action?.(); }}
              >
                {item.icon}
                <span
                  className="w-fit shrink-0 text-font-size-14 font-font-weight-regular"
                  style={{ fontFamily: FONT }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showConfirm && (
        <DeleteConfirmModal
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => { setShowConfirm(false); onDelete?.(); }}
        />
      )}
    </>
  );
}

function CharCard({ name, desc, imageUrl, voice, onVoiceClick, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);

  return (
    <div
      className="[font-synthesis:none] flex flex-col w-50 rounded-xl overflow-clip relative shrink-0 bg-[#1A1A1A] border border-solid border-[#FFFFFF14] antialiased cursor-pointer"
      style={{ height: '246px', outline: hovered ? '1px solid #FFFFFF26' : '1px solid transparent', transition: 'outline-color 0.15s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* image area */}
      <div
        className="flex items-center justify-center flex-1 self-stretch relative"
        style={{
          minHeight: '148px',
          backgroundImage: imageUrl
            ? `url(${imageUrl})`
            : 'linear-gradient(in oklab 145deg, oklab(27.6% -0.014 -0.012) 0%, oklab(23.8% -0.010 -0.019) 100%)',
          backgroundSize: 'cover',
          backgroundPosition: '50%',
        }}
      >
        {!imageUrl && (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <circle cx="20" cy="20" r="20" fill="#FFFFFF0A" />
            <path d="M20 12C16.69 12 14 14.69 14 18C14 20.48 15.43 22.63 17.5 23.65V26C17.5 26.55 17.95 27 18.5 27H21.5C22.05 27 22.5 26.55 22.5 26V23.65C24.57 22.63 26 20.48 26 18C26 14.69 23.31 12 20 12Z" fill="#FFFFFF26" />
          </svg>
        )}
        {/* top-right actions */}
        <div
          className="absolute flex gap-[4px]"
          style={{ top: '8px', right: '8px', opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreMenu onDownload={() => {}} onDelete={() => {}} />
        </div>
      </div>

      {/* info overlay */}
      <div
        className="flex flex-col gap-1.5 absolute left-0 -bottom-px bg-[#161616F2] p-3"
        style={{ width: '100%' }}
      >
        <div
          className="inline-block font-medium text-[#FFFFFFE6] text-sm/5"
          style={{ fontFamily: FONT_MEDIUM }}
        >
          {name}
        </div>
        <div
          className="text-[#FFFFFF66] line-clamp-2"
          style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '17px' }}
        >
          {desc}
        </div>
        {/* voice row — characters only */}
        {onVoiceClick !== undefined && <div
          className="flex items-center justify-between"
          style={{ gap: '6px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '17px', color: '#FFFFFF66', flexShrink: 0 }}>
            选择音色：
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onVoiceClick?.(); }}
              style={{
                background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                fontFamily: FONT, fontSize: '12px', lineHeight: '17px', color: '#FFFFFF',
              }}
            >
              {voice || '未选择'}
            </button>
            {/* headphone preview icon */}
            <button
              type="button"
              title={!voice ? '请先选择音色' : voicePlaying ? '停止试听' : '试听'}
              disabled={!voice}
              onClick={(e) => { e.stopPropagation(); if (voice) setVoicePlaying((v) => !v); }}
              style={{ background: 'transparent', border: 'none', padding: 0, cursor: voice ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center' }}
            >
              {voicePlaying && voice
                ? <PlayingWaveIcon color="#2DC3E1" size={16} />
                : <HeadphoneIcon color={voice ? '#2DC3E1' : '#FFFFFF26'} />
              }
            </button>
          </div>
        </div>}
      </div>
    </div>
  );
}

function AddCard({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="[font-synthesis:none] flex flex-col items-center justify-center w-50 rounded-xl shrink-0 cursor-pointer border border-dashed"
      style={{
        height: '246px',
        borderColor: hovered ? '#FFFFFF40' : '#FFFFFF26',
        backgroundColor: hovered ? '#FFFFFF05' : 'transparent',
        gap: '6px',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M10 4V16M4 10H16" stroke={hovered ? '#FFFFFF66' : '#FFFFFF33'} strokeWidth="1.5" strokeLinecap="round" style={{ transition: 'stroke 0.15s' }} />
      </svg>
      <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: hovered ? '#FFFFFF66' : '#FFFFFF33', transition: 'color 0.15s' }}>
        新增
      </span>
    </div>
  );
}

// ── Mock data ──────────────────────────────────────────────────────────────

const INITIAL_CHARS = [
  { id: 1, name: '虎大', desc: '森林里最年长的老虎，性格沉稳，是两兄弟中的大哥，负责保护弟弟虎二。', imageUrl: null, voice: '霸气威武' },
  { id: 2, name: '虎二', desc: '活泼好动的小老虎，总是惹麻烦，但心地善良，对哥哥虎大十分依赖。', imageUrl: null, voice: '霸气威武' },
  { id: 3, name: '狐狸阿九', desc: '狡猾却重情义的狐狸，表面上爱耍小聪明，关键时刻总会挺身而出。', imageUrl: null, voice: '霸气威武' },
  { id: 4, name: '老猫头鹰', desc: '森林里的智者，见过无数风雨，总在两只老虎迷路时给出关键指引。', imageUrl: null, voice: '霸气威武' },
  { id: 5, name: '小松鼠', desc: '话多又热心的小松鼠，是森林里的消息灵通人士，喜欢收集各种坚果和秘密。', imageUrl: null, voice: '霸气威武' },
  { id: 6, name: '大灰狼', desc: '看似凶猛的反派，实则只是想找人一起玩，孤独是他最大的秘密。', imageUrl: null, voice: '霸气威武' },
];

const MOCK_PROPS = [];

// ── Edit subject panel ─────────────────────────────────────────────────────

// Checkbox component per design-system spec
function Checkbox({ checked, onChange }) {
  const [hovered, setHovered] = useState(false);
  const bgClass = checked ? 'bg-checkbox-bg-active' : hovered ? 'bg-checkbox-bg-hover' : 'bg-checkbox-bg-normal';
  const borderClass = checked ? 'border-checkbox-border-active' : 'border-checkbox-border-normal';
  return (
    <div
      className={`flex items-center cursor-pointer ${bgClass} border border-solid ${borderClass} rounded-sm [outline:1px_solid_var(--color-stroke-outline)] outline-offset-0 relative shrink-0`}
      style={{ width: '14px', height: '14px', padding: '2px', boxSizing: 'border-box' }}
      onClick={onChange}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {checked && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%' }}>
          <path d="M3.333 8L6.667 11.333L13.333 4.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

// Icon button with hover/press states for image overlays
function IconBtn({ children, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setHovered(true)}
      style={{
        width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
        background: pressed ? 'rgba(255,255,255,0.18)' : hovered ? 'rgba(255,255,255,0.12)' : 'transparent',
        transition: 'background 100ms',
      }}
    >
      {children}
    </div>
  );
}

// Upload button with hover/press states
function UploadBtn({ label, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setHovered(true)}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px', padding: '0 6px', borderRadius: '6px', cursor: 'pointer',
        background: pressed ? '#222222' : hovered ? '#1A1A1A' : '#161616',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
        outline: '1px solid #00000080',
        transition: 'background 100ms, border-color 100ms',
      }}
    >
      <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: hovered ? 'rgba(255,255,255,0.8)' : '#FFFFFF66' }}>{label}</span>
    </div>
  );
}

// Upload card — only item shown by default; hover state on card

function ImageItemUpload({ onUpload }) {
  const [hovered, setHovered] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const fileInputRef = useRef(null);
  return (
    <>
      <AssetPickerModal
        accept="image"
        open={assetPickerOpen}
        onClose={() => setAssetPickerOpen(false)}
        onConfirm={(ids) => { if (ids.length > 0) onUpload?.(ids[0]); }}
      />
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          height: '144px', borderRadius: '6px', flexShrink: 0,
          border: `1px dashed ${hovered ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
          background: hovered ? '#222222' : '#1D1E1E',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
          transition: 'background 120ms, border-color 120ms',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => { if (e.target.files?.[0]) onUpload?.(e.target.files[0]); e.target.value = ''; }}
        />
        <UploadBtn label="本地上传" onClick={() => fileInputRef.current?.click()} />
        <UploadBtn label="从资产库选择" onClick={() => setAssetPickerOpen(true)} />
      </div>
    </>
  );
}

// Modal for viewing an uploaded image full-size
function ImageViewModal({ open, imageUrl, onClose }) {
  const [closeHovered, setCloseHovered] = useState(false);
  const [doneHovered, setDoneHovered] = useState(false);
  const [donePressed, setDonePressed] = useState(false);
  if (!open) return null;
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        style={{ display: 'flex', flexDirection: 'column', width: '800px', borderRadius: '16px', overflow: 'hidden', height: '600px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: '#161616', borderRadius: '16px 16px 0 0', flexShrink: 0 }}>
          <span style={{ fontFamily: FONT_MEDIUM, fontSize: '16px', lineHeight: '20px', color: '#FFFFFF' }}>查看</span>
          <div
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '6px', background: closeHovered ? '#FFFFFF14' : 'transparent', transition: 'background 120ms' }}
            onClick={onClose}
            onMouseEnter={() => setCloseHovered(true)}
            onMouseLeave={() => setCloseHovered(false)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M12 4L4 12M4 4l8 8" stroke={closeHovered ? '#FFFFFF' : '#FFFFFFCC'} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        {/* image area */}
        <div style={{ flex: 1, display: 'flex', padding: '8px 24px', overflow: 'hidden', gap: '12px', flexDirection: 'column', background: '#161616', minHeight: 0 }}>
          {imageUrl
            ? <img src={imageUrl} alt="" style={{ width: '100%', flex: 1, borderRadius: '8px', objectFit: 'contain', minHeight: 0 }} />
            : <div style={{ width: '100%', flex: 1, borderRadius: '8px', background: '#FFFFFF14' }} />
          }
        </div>
        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-end', background: '#161616', borderRadius: '0 0 16px 16px', padding: '16px 24px', flexShrink: 0 }}>
          <div
            className="flex flex-col shrink-0 rounded-[8px] cursor-pointer"
            style={{ height: '36px', padding: '1px', backgroundImage: doneHovered ? 'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 45%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, #FFFFFF1E, #FFFFFF1E)' : 'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 30%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, #FFFFFF14, #FFFFFF14)', boxShadow: '#00000066 3px 3px 8px', outline: '1px solid #00000080', transition: 'background-image 0.15s' }}
            onClick={onClose}
            onMouseEnter={() => setDoneHovered(true)}
            onMouseLeave={() => { setDoneHovered(false); setDonePressed(false); }}
            onMouseDown={() => setDonePressed(true)}
            onMouseUp={() => setDonePressed(false)}
          >
            <div className="flex items-center flex-1 self-stretch rounded-[7px] gap-[4px] px-[15px]" style={{ backgroundColor: donePressed ? '#222222' : doneHovered ? '#1C1C1C' : '#161616', transition: 'background-color 0.1s' }}>
              <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF' }}>完成</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Uploaded image card — interactive: hover highlights border, click toggles settled
function ImageItem({ settled, imageUrl, onView, onSettledChange }) {
  const [hovered, setHovered] = useState(false);

  const borderColor = settled ? '#2DC3E1' : hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSettledChange?.(!settled)}
      style={{
        height: '144px', borderRadius: '6px', flexShrink: 0,
        border: `1px solid ${borderColor}`,
        background: '#FFFFFF14', overflow: 'clip', position: 'relative', cursor: 'pointer',
        transition: 'border-color 120ms',
      }}
    >
      {/* placeholder / real image */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {imageUrl
          ? <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '93px', height: '144px', background: '#FFFFFF14', borderRadius: '4px' }} />
        }
      </div>

      {/* top overlay: settled checkbox */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '8px 10px', backgroundImage: 'linear-gradient(in oklab 180deg, oklab(0% 0 0 / 60%) 0%, oklab(0% 0 0 / 0%) 100%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Checkbox checked={settled} onChange={(e) => { e.stopPropagation(); onSettledChange?.(!settled); }} />
        <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: settled ? '#2DC3E1' : '#FFFFFF66' }}>定稿</span>
      </div>

      {/* bottom overlay: fullscreen + download — only on hover */}
      {hovered && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 8px', backgroundImage: 'linear-gradient(in oklab 0deg, oklab(0% 0 0 / 60%) 0%, oklab(0% 0 0 / 0%) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
          <IconBtn onClick={(e) => { e.stopPropagation(); onView?.(imageUrl); }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.333 2H2.667C2.298 2 2 2.298 2 2.667V5.333" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.333 14H2.667C2.298 14 2 13.701 2 13.333V10.667" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.667 14H13.333C13.701 14 14 13.701 14 13.333V10.667" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.667 2H13.333C13.701 2 14 2.298 14 2.667V5.333" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconBtn>
          <IconBtn onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2.667V10" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.333 7.333L8 10L10.667 7.333" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.667 12H13.333" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconBtn>
        </div>
      )}
    </div>
  );
}

// Interactive radio option
function RadioOption({ label, checked, onChange }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
      onClick={onChange}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ position: 'relative', width: '16px', height: '16px', flexShrink: 0 }}>
        <div style={{
          borderRadius: '50%',
          background: checked ? '#2DC3E1' : hovered ? '#1A1A1A' : '#090909',
          border: `1px solid ${checked ? 'rgba(255,255,255,0.2)' : hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.2)'}`,
          outline: '1px solid #00000080',
          width: '16px', height: '16px',
          transition: 'background 100ms',
        }} />
        {checked && <div style={{ position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%', borderRadius: '50%', background: '#0A0A0A', width: '6px', height: '6px' }} />}
      </div>
      <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: checked ? '#FFFFFF' : hovered ? '#FFFFFFCC' : '#FFFFFF99', transition: 'color 100ms' }}>{label}</span>
    </div>
  );
}

// Per-model upload limits
const MODEL_MAX_IMAGES = {
  'Doubao-Seed-2.0-Pro': 3,
  'Doubao-Seed-1.6': 2,
  'FLUX.1-dev': 1,
  'Stable Diffusion XL': 1,
};

function RefImageItem({ url, onRemove }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', position: 'relative', flexShrink: 0,
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
        transition: 'border-color 120ms', cursor: 'pointer',
      }}
    >
      <img src={url} alt="参考图" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      {hovered && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px', height: '24px', borderRadius: '6px', padding: '0 8px',
              background: 'rgba(247,95,95,0.15)', border: '1px solid rgba(247,95,95,0.3)',
              outline: '1px solid #00000080', cursor: 'pointer',
              fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#F75F5F',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(247,95,95,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(247,95,95,0.15)'; }}
          >
            移除
          </button>
        </div>
      )}
    </div>
  );
}

function RefImageUploadCard({ onLocalUpload, onAssetPick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '120px', height: '120px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', borderRadius: '8px',
        background: hovered ? '#222222' : '#1D1E1E',
        border: `1px dashed ${hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
        gap: '8px', transition: 'background 120ms, border-color 120ms',
      }}
    >
      <UploadBtn label="本地上传" onClick={onLocalUpload} />
      <UploadBtn label="从资产库选择" onClick={onAssetPick} />
    </div>
  );
}

function RefImageField({ maxImages = 3 }) {
  const fileInputRef = useRef(null);
  const [refImages, setRefImages] = useState([]);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);

  const canAddMore = refImages.length < maxImages;

  const handleFile = (file) => {
    const url = URL.createObjectURL(file);
    setRefImages((prev) => [...prev, url].slice(0, maxImages));
  };

  const handleAssetConfirm = (ids) => {
    // ids are real asset IDs — URL resolution handled by the data layer when integrated
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <AssetPickerModal
        accept="image"
        open={assetPickerOpen}
        onClose={() => setAssetPickerOpen(false)}
        onConfirm={handleAssetConfirm}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ''; }}
      />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <span style={{ flex: 1, fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF99' }}>参考图</span>
        <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF66' }}>{refImages.length}/{maxImages}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-start' }}>
        {refImages.map((url, i) => (
          <RefImageItem
            key={url + i}
            url={url}
            onRemove={() => setRefImages((prev) => prev.filter((_, idx) => idx !== i))}
          />
        ))}
        {canAddMore && (
          <RefImageUploadCard
            onLocalUpload={() => fileInputRef.current?.click()}
            onAssetPick={() => setAssetPickerOpen(true)}
          />
        )}
      </div>
    </div>
  );
}

function EditSubjectPanel({ char, tabLabel = '角色', onClose, onCommit, onCoverChange }) {
  const [closeHovered, setCloseHovered] = useState(false);
  const [genHovered, setGenHovered] = useState(false);
  const [genPressed, setGenPressed] = useState(false);
  const [promptFocused, setPromptFocused] = useState(false);
  const [promptHovered, setPromptHovered] = useState(false);
  const [promptText, setPromptText] = useState('一只雄性成年孟加拉虎，大型健壮体型，肩背宽厚，四肢粗壮，橘黄色短毛，黑色条纹较粗且分布稳定，右眼上方有一道浅色旧疤，颈部一圈深棕色较长鬃毛，头部较大，口鼻宽，尾巴中等长度，站姿平稳，角色设定图。');
  const [modelHovered, setModelHovered] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Doubao-Seed-2.0-Pro');
  const [ratioHovered, setRatioHovered] = useState(false);
  const [ratioOpen, setRatioOpen] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState('2:1');
  const [qualityHovered, setQualityHovered] = useState(false);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('1K');
  const [genMode, setGenMode] = useState('main');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [viewImageUrl, setViewImageUrl] = useState(null);
  const [charName, setCharName] = useState(char?.name ?? '');
  const [charDesc, setCharDesc] = useState(char?.desc ?? '');
  const [nameFocused, setNameFocused] = useState(false);
  const [nameHovered, setNameHovered] = useState(false);
  const [descFocused, setDescFocused] = useState(false);
  const [descHovered, setDescHovered] = useState(false);

  if (!char) return null;

  const selectStyle = (hovered) => ({
    display: 'flex', alignItems: 'center', height: '36px', borderRadius: '8px', padding: '0 12px', gap: '8px',
    background: hovered ? '#222222' : '#1D1E1E',
    border: `1px solid ${hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
    outline: '1px solid #00000080', cursor: 'pointer',
    transition: 'background 100ms, border-color 100ms',
  });

  return (
    <div
      style={{
        position: 'fixed', top: '60px', right: '24px', bottom: '24px',
        width: '600px', zIndex: 50,
        display: 'flex', flexDirection: 'column',
        background: '#161616', border: '1px solid #FFFFFF14',
        borderRadius: '16px', boxShadow: '#00000099 0px 24px 64px',
        overflow: 'hidden',
      }}
    >
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBlock: '20px', paddingInline: '24px', background: '#161616', flexShrink: 0 }}>
        <span style={{ fontFamily: FONT_MEDIUM, fontWeight: 500, fontSize: '16px', lineHeight: '20px', color: '#FFFFFF' }}>编辑{tabLabel}</span>
        <button
          type="button"
          onClick={onClose}
          onMouseEnter={() => setCloseHovered(true)}
          onMouseLeave={() => setCloseHovered(false)}
          style={{
            width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: closeHovered ? 'rgba(255,255,255,0.08)' : 'transparent',
            border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, borderRadius: '6px',
            transition: 'background 100ms',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="2" y1="2" x2="14" y2="14" stroke={closeHovered ? 'rgba(255,255,255,0.8)' : '#FFFFFF66'} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="14" y1="2" x2="2" y2="14" stroke={closeHovered ? 'rgba(255,255,255,0.8)' : '#FFFFFF66'} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* two-column body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', overflow: 'hidden' }}>
        {/* left: form */}
        <div style={{ width: 'round(70%, 1px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '24px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', background: '#161616', height: '100%', boxSizing: 'border-box' }}>
          {/* name + desc — editable */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF99' }}>角色名称</span>
            <div
              onMouseEnter={() => setNameHovered(true)}
              onMouseLeave={() => setNameHovered(false)}
              style={{
                display: 'flex', alignItems: 'center', height: '36px', borderRadius: '8px', padding: '0 12px',
                background: nameFocused ? 'rgba(45,195,225,0.04)' : nameHovered ? '#222222' : '#1D1E1E',
                border: `1px solid ${nameFocused ? 'rgba(45,195,225,0.6)' : nameHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                outline: nameFocused ? '3px solid rgba(45,195,225,0.08)' : '1px solid #00000080',
                transition: 'border-color 120ms, background 120ms',
              }}
            >
              <input
                value={charName}
                onChange={(e) => setCharName(e.target.value)}
                onFocus={() => setNameFocused(true)}
                onBlur={() => { setNameFocused(false); onCommit?.(charName, charDesc); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.target.blur(); } }}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: FONT_MEDIUM, fontWeight: 500, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF99' }}>描述</span>
            <div
              onMouseEnter={() => setDescHovered(true)}
              onMouseLeave={() => setDescHovered(false)}
              style={{
                display: 'flex', flexDirection: 'column', height: '120px', borderRadius: '8px', padding: '9px 12px',
                background: descFocused ? 'rgba(45,195,225,0.04)' : descHovered ? '#222222' : '#1D1E1E',
                border: `1px solid ${descFocused ? 'rgba(45,195,225,0.6)' : descHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                outline: descFocused ? '3px solid rgba(45,195,225,0.08)' : '1px solid #00000080',
                transition: 'border-color 120ms, background 120ms',
              }}
            >
              <textarea
                value={charDesc}
                onChange={(e) => setCharDesc(e.target.value)}
                onFocus={() => setDescFocused(true)}
                onBlur={() => { setDescFocused(false); onCommit?.(charName, charDesc); }}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontFamily: FONT, fontSize: '14px', lineHeight: '150%', color: '#FFFFFF' }}
              />
              <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '18px', color: charDesc.length > 300 ? '#F75F5F' : '#FFFFFF66', textAlign: 'right' }}>{charDesc.length}/300</span>
            </div>
          </div>

          {/* prompt textarea */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF99' }}>提示词</span>
            <div
              onMouseEnter={() => setPromptHovered(true)}
              onMouseLeave={() => setPromptHovered(false)}
              style={{
                display: 'flex', flexDirection: 'column', height: '120px', borderRadius: '8px', padding: '9px 12px',
                background: promptFocused ? 'rgba(45,195,225,0.04)' : promptHovered ? '#222222' : '#1D1E1E',
                border: `1px solid ${promptFocused ? 'rgba(45,195,225,0.6)' : promptHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                outline: promptFocused ? '3px solid rgba(45,195,225,0.08)' : '1px solid #00000080',
                transition: 'border-color 120ms, background 120ms',
              }}
            >
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onFocus={() => setPromptFocused(true)}
                onBlur={() => setPromptFocused(false)}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontFamily: FONT, fontSize: '14px', lineHeight: '150%', color: '#FFFFFF' }}
              />
              <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '18px', color: promptText.length > 300 ? '#F75F5F' : '#FFFFFF66', textAlign: 'right' }}>{promptText.length}/300</span>
            </div>
          </div>

          {/* model select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
            <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF99' }}>选择模型</span>
            <div
              style={{ ...selectStyle(modelHovered || modelOpen), border: `1px solid ${modelOpen ? 'rgba(45,195,225,0.6)' : modelHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}` }}
              onMouseEnter={() => setModelHovered(true)}
              onMouseLeave={() => setModelHovered(false)}
              onClick={() => setModelOpen((v) => !v)}
            >
              <span style={{ flex: 1, fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF' }}>{selectedModel}</span>
              <ChevronDownIcon />
            </div>
            {modelOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 60, background: '#1D1E1E', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                {['Doubao-Seed-2.0-Pro', 'Doubao-Seed-1.6', 'FLUX.1-dev', 'Stable Diffusion XL'].map((opt) => (
                  <div
                    key={opt}
                    onClick={() => { setSelectedModel(opt); setModelOpen(false); }}
                    style={{
                      padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontFamily: FONT, fontSize: '14px', lineHeight: '18px',
                      color: selectedModel === opt ? '#2DC3E1' : '#FFFFFFCC',
                      background: selectedModel === opt ? 'rgba(45,195,225,0.08)' : 'transparent',
                      transition: 'background 80ms',
                    }}
                    onMouseEnter={(e) => { if (selectedModel !== opt) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = selectedModel === opt ? 'rgba(45,195,225,0.08)' : 'transparent'; }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ratio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
            <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF99' }}>选择画面比例</span>
            <div
              style={{ ...selectStyle(ratioHovered || ratioOpen), border: `1px solid ${ratioOpen ? 'rgba(45,195,225,0.6)' : ratioHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}` }}
              onMouseEnter={() => setRatioHovered(true)}
              onMouseLeave={() => setRatioHovered(false)}
              onClick={() => setRatioOpen((v) => !v)}
            >
              <span style={{ flex: 1, fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF' }}>{selectedRatio}</span>
              <ChevronDownIcon />
            </div>
            {ratioOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 60, background: '#1D1E1E', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                {['1:1', '2:1', '16:9', '4:3', '3:4', '9:16'].map((opt) => (
                  <div
                    key={opt}
                    onClick={() => { setSelectedRatio(opt); setRatioOpen(false); }}
                    style={{
                      padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontFamily: FONT, fontSize: '14px', lineHeight: '18px',
                      color: selectedRatio === opt ? '#2DC3E1' : '#FFFFFFCC',
                      background: selectedRatio === opt ? 'rgba(45,195,225,0.08)' : 'transparent',
                      transition: 'background 80ms',
                    }}
                    onMouseEnter={(e) => { if (selectedRatio !== opt) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = selectedRatio === opt ? 'rgba(45,195,225,0.08)' : 'transparent'; }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* quality */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
            <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF99' }}>质量</span>
            <div
              style={{ ...selectStyle(qualityHovered || qualityOpen), border: `1px solid ${qualityOpen ? 'rgba(45,195,225,0.6)' : qualityHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}` }}
              onMouseEnter={() => setQualityHovered(true)}
              onMouseLeave={() => setQualityHovered(false)}
              onClick={() => setQualityOpen((v) => !v)}
            >
              <span style={{ flex: 1, fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF' }}>{selectedQuality}</span>
              <ChevronDownIcon />
            </div>
            {qualityOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 60, background: '#1D1E1E', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                {['720P', '1K', '2K', '4K'].map((opt) => (
                  <div
                    key={opt}
                    onClick={() => { setSelectedQuality(opt); setQualityOpen(false); }}
                    style={{
                      padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontFamily: FONT, fontSize: '14px', lineHeight: '18px',
                      color: selectedQuality === opt ? '#2DC3E1' : '#FFFFFFCC',
                      background: selectedQuality === opt ? 'rgba(45,195,225,0.08)' : 'transparent',
                      transition: 'background 80ms',
                    }}
                    onMouseEnter={(e) => { if (selectedQuality !== opt) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = selectedQuality === opt ? 'rgba(45,195,225,0.08)' : 'transparent'; }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ref image */}
          <RefImageField maxImages={MODEL_MAX_IMAGES[selectedModel] ?? 3} />

          {/* generation mode radio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF99' }}>生成方式</span>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              {[{ key: 'main', label: '主视图' }, { key: 'multi', label: '多视图' }].map(({ key, label }) => {
                const active = genMode === key;
                return (
                  <RadioOption key={key} label={label} checked={active} onChange={() => setGenMode(key)} />
                );
              })}
            </div>
          </div>

          {/* generate button — follows content, not fixed to bottom */}
          <div style={{ paddingBottom: '8px' }}>
            <button
              type="button"
              onMouseEnter={() => setGenHovered(true)}
              onMouseLeave={() => { setGenHovered(false); setGenPressed(false); }}
              onMouseDown={() => setGenPressed(true)}
              onMouseUp={() => setGenHovered(true)}
              onClick={async () => {
                const placeholder = `generated-${Date.now()}`;
                setGeneratedImages((prev) => [{ url: null, settled: false, id: placeholder }, ...prev]);
                const { imageUrl } = await apiGenerateSubjectImage(char.id, { model: selectedModel, referenceImages });
                setGeneratedImages((prev) => prev.map((img) => img.id === placeholder ? { ...img, url: imageUrl, settled: true } : img));
              }}
              style={{
                display: 'flex', alignItems: 'center', height: '36px', borderRadius: '8px', padding: '0 16px', gap: '4px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)',
                background: genPressed ? '#28AFCA' : genHovered ? '#35D4F5' : '#2DC3E1',
                outline: '1px solid #00000080',
                backgroundImage: 'linear-gradient(in oklab 107.51deg, oklab(84.6% -0.114 0.031 / 30%) 8.14%, oklab(84.6% -0.114 0.031 / 0%) 54.48%)',
                transition: 'background 100ms',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <path d="M3 5V3.188C3 2.891 3.029 2.783 3.083 2.674C3.138 2.566 3.218 2.481 3.32 2.422C3.422 2.364 3.523 2.333 3.801 2.333H12.199C12.477 2.333 12.578 2.364 12.68 2.422C12.782 2.481 12.862 2.566 12.916 2.674C12.971 2.783 13 2.891 13 3.188V5" stroke="#090909" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1.667 5H14.333V13.667H1.667V5Z" stroke="#090909" strokeLinejoin="round" />
                <path fillRule="evenodd" clipRule="evenodd" d="M4.333 8.667C4.886 8.667 5.333 8.219 5.333 7.667C5.333 7.114 4.886 6.667 4.333 6.667C3.781 6.667 3.333 7.114 3.333 7.667C3.333 8.219 3.781 8.667 4.333 8.667Z" fill="#090909" />
                <path d="M1.856 13.463L5 10L6.667 11.333L8.667 9L14.131 13.463" stroke="#090909" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: FONT_MEDIUM, fontWeight: 500, fontSize: '14px', lineHeight: '18px', color: '#090909', whiteSpace: 'nowrap' }}>生成图片</span>
            </button>
          </div>
        </div>

        {/* right: image list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '12px', paddingRight: '24px', paddingTop: '8px', paddingBottom: '8px', background: '#161616', height: '100%', boxSizing: 'border-box' }}>
          <ImageViewModal open={!!viewImageUrl} imageUrl={viewImageUrl} onClose={() => setViewImageUrl(null)} />
          {/* upload card always first */}
          <ImageItemUpload
            onUpload={(fileOrId) => {
              if (typeof fileOrId !== 'string') {
                const url = URL.createObjectURL(fileOrId);
                setGeneratedImages((prev) => [{ url, settled: false, id: url }, ...prev]);
              }
            }}
          />
          {generatedImages.map((img, i) => (
            <ImageItem
              key={img.id ?? img.url + i}
              imageUrl={img.url}
              settled={img.settled}
              onView={setViewImageUrl}
              onSettledChange={(newSettled) => {
                setGeneratedImages((prev) => {
                  const next = prev.map((item, idx) =>
                    idx === i
                      ? { ...item, settled: newSettled }
                      : { ...item, settled: newSettled ? false : item.settled }
                  );
                  const settledImg = next.find((item) => item.settled);
                  onCoverChange?.(settledImg?.url ?? null);
                  return next;
                });
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

export default function SubjectPage({ projectName = '两只老虎的奇遇', onBack, onUnlockStep, onStartStoryboard, initialTab = 'char', chars: externalChars, onCharsChange, scenes: externalScenes, onScenesChange, props: externalProps, onPropsChange }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [episodes, setEpisodes] = useState([]);
  const [activeEpisode, setActiveEpisode] = useState('');
  const [batchGenOpen, setBatchGenOpen] = useState(false);
  const [selectedChar, setSelectedChar] = useState(null);
  const [selectedScene, setSelectedScene] = useState(null);
  const [selectedProp, setSelectedProp] = useState(null);
  const [voiceModalChar, setVoiceModalChar] = useState(null);
  const [internalChars, setInternalChars] = useState(INITIAL_CHARS);
  const chars = (externalChars !== undefined && externalChars !== null) ? externalChars : internalChars;
  function setChars(updater) {
    const next = typeof updater === 'function' ? updater(chars) : updater;
    setInternalChars(next);
    onCharsChange?.(next);
  }
  const [internalScenes, setInternalScenes] = useState([]);
  const scenes = (externalScenes !== undefined && externalScenes !== null) ? externalScenes : internalScenes;
  function setScenes(updater) {
    const next = typeof updater === 'function' ? updater(scenes) : updater;
    setInternalScenes(next);
    onScenesChange?.(next);
  }
  const [internalProps, setInternalProps] = useState([]);
  const props = (externalProps !== undefined && externalProps !== null) ? externalProps : internalProps;
  function setProps(updater) {
    const next = typeof updater === 'function' ? updater(props) : updater;
    setInternalProps(next);
    onPropsChange?.(next);
  }
  const [charVoices, setCharVoices] = useState(() =>
    Object.fromEntries(INITIAL_CHARS.map((c) => [c.id, c.voice]))
  );

  useEffect(() => {
    apiGetEpisodes().then((list) => {
      setEpisodes(list);
      setActiveEpisode((prev) => prev || list[0] || '');
    });
  }, []);

  // 初始化时把内部默认数据同步给父组件（仅当父组件尚未持有数据时）
  useEffect(() => {
    if (externalChars === null || externalChars === undefined) onCharsChange?.(INITIAL_CHARS);
    if (externalScenes === null || externalScenes === undefined) onScenesChange?.([]);
    if (externalProps === null || externalProps === undefined) onPropsChange?.([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = {
    char: chars.length,
    scene: scenes.length,
    prop: props.length,
  };

  const handleAdd = async () => {
    const type = activeTab; // 'char' | 'scene' | 'prop'
    const { id } = await apiCreateSubject(type, { name: '待定', desc: '待定' });
    if (activeTab === 'char') {
      setChars((prev) => [...prev, { id, name: '待定', desc: '待定', imageUrl: null, voice: null }]);
    } else if (activeTab === 'scene') {
      setScenes((prev) => [...prev, { id, name: '待定', desc: '待定', imageUrl: null }]);
    } else if (activeTab === 'prop') {
      setProps((prev) => [...prev, { id, name: '待定', desc: '待定', imageUrl: null }]);
    }
  };

  useEffect(() => {
    if (chars.length > 0) onUnlockStep?.('subject');
  }, [chars.length]);

  return (
    <div
      className="bg-neutral-200 rounded-[16px] border border-solid border-[#FFFFFF14] overflow-hidden"
      style={{
        position: 'absolute',
        inset: 0,
        marginBottom: '24px',
        marginRight: '32px',
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Toolbar
        projectName={projectName}
        onBack={onBack}
        addLabel={`添加${TABS.find((t) => t.key === activeTab)?.label ?? '主体'}`}
        onAddChar={handleAdd}
        onBatchGen={() => setBatchGenOpen(true)}
        onStartStoryboard={onStartStoryboard}
        tabLabel={TABS.find((t) => t.key === activeTab)?.label ?? '主体'}
      />

      <TabNav
        activeTab={activeTab}
        counts={counts}
        onChange={(tab) => {
          setActiveTab(tab);
          setSelectedChar(null);
          setSelectedScene(null);
          setSelectedProp(null);
        }}
      />

      {/* card grid */}
      <div
        className="flex flex-wrap content-start gap-[16px] flex-1 self-stretch overflow-auto min-h-0"
        style={{ paddingTop: '16px' }}
      >
        {activeTab === 'char' && chars.map((char) => (
          <CharCard
            key={char.id}
            name={char.name}
            desc={char.desc}
            imageUrl={char.imageUrl}
            voice={charVoices[char.id]}
            onVoiceClick={() => setVoiceModalChar(char)}
            onClick={() => setSelectedChar(char)}
          />
        ))}
        {activeTab === 'char' && <AddCard onClick={handleAdd} />}
        {activeTab === 'scene' && scenes.map((scene) => (
          <CharCard
            key={scene.id}
            name={scene.name}
            desc={scene.desc}
            imageUrl={scene.imageUrl}
            onClick={() => setSelectedScene(scene)}
          />
        ))}
        {activeTab === 'scene' && <AddCard onClick={handleAdd} />}
        {activeTab === 'prop' && props.map((prop) => (
          <CharCard
            key={prop.id}
            name={prop.name}
            desc={prop.desc}
            imageUrl={prop.imageUrl}
            onClick={() => setSelectedProp(prop)}
          />
        ))}
        {activeTab === 'prop' && <AddCard onClick={handleAdd} />}
      </div>

      {/* edit panel */}
      {selectedChar && (
        <EditSubjectPanel
          key={selectedChar.id}
          char={selectedChar}
          tabLabel="角色"
          onClose={() => setSelectedChar(null)}
          onCommit={(name, desc) => {
            setChars((prev) => prev.map((c) => c.id === selectedChar.id ? { ...c, name, desc } : c));
            setSelectedChar((prev) => ({ ...prev, name, desc }));
            apiUpdateSubject(selectedChar.id, { name, desc });
          }}
          onCoverChange={(imageUrl) => {
            setChars((prev) => prev.map((c) => c.id === selectedChar.id ? { ...c, imageUrl } : c));
            apiUpdateSubject(selectedChar.id, { imageUrl });
          }}
        />
      )}
      {selectedScene && (
        <EditSubjectPanel
          key={selectedScene.id}
          char={selectedScene}
          tabLabel="场景"
          onClose={() => setSelectedScene(null)}
          onCommit={(name, desc) => {
            setScenes((prev) => prev.map((s) => s.id === selectedScene.id ? { ...s, name, desc } : s));
            setSelectedScene((prev) => ({ ...prev, name, desc }));
            apiUpdateSubject(selectedScene.id, { name, desc });
          }}
          onCoverChange={(imageUrl) => {
            setScenes((prev) => prev.map((s) => s.id === selectedScene.id ? { ...s, imageUrl } : s));
            apiUpdateSubject(selectedScene.id, { imageUrl });
          }}
        />
      )}
      {selectedProp && (
        <EditSubjectPanel
          key={selectedProp.id}
          char={selectedProp}
          tabLabel="道具"
          onClose={() => setSelectedProp(null)}
          onCommit={(name, desc) => {
            setProps((prev) => prev.map((p) => p.id === selectedProp.id ? { ...p, name, desc } : p));
            setSelectedProp((prev) => ({ ...prev, name, desc }));
            apiUpdateSubject(selectedProp.id, { name, desc });
          }}
          onCoverChange={(imageUrl) => {
            setProps((prev) => prev.map((p) => p.id === selectedProp.id ? { ...p, imageUrl } : p));
            apiUpdateSubject(selectedProp.id, { imageUrl });
          }}
        />
      )}

      {/* voice select modal */}
      {voiceModalChar && (
        <VoiceSelectModal
          open
          currentVoice={charVoices[voiceModalChar.id]}
          onClose={() => setVoiceModalChar(null)}
          onConfirm={(v) => {
            setCharVoices((prev) => ({ ...prev, [voiceModalChar.id]: v }));
            setVoiceModalChar(null);
          }}
        />
      )}

      <BatchGenerateModal
        open={batchGenOpen}
        onClose={() => setBatchGenOpen(false)}
        onConfirm={(params) => apiBatchGenerate(params)}
      />
    </div>
  );
}
