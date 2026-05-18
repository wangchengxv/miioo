import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import BatchDownloadModal from '../components/BatchDownloadModal';
import ShotViewerModal from '../components/ShotViewerModal';
import Toggle from '../components/Toggle';

// ── API stubs (TODO: 替换为真实接口) ──────────────────────────────────────

async function apiUploadFile(file) {
  // TODO: POST /upload  body: FormData { file }
  // returns: { url }
  console.log('[mock] upload file', file.name);
  return { url: URL.createObjectURL(file) };
}

async function apiGenerateImage(shotId, params) {
  // TODO: POST /shots/:shotId/generate-image  body: params
  // returns: { jobId, imageUrl }
  console.log('[mock] generate image for shot', shotId, params);
  return { jobId: `job-${Date.now()}`, imageUrl: null };
}

async function apiGenerateVideo(shotId, params) {
  // TODO: POST /shots/:shotId/generate-video  body: params
  // returns: { jobId, videoUrl }
  console.log('[mock] generate video for shot', shotId, params);
  return { jobId: `job-${Date.now()}`, videoUrl: null };
}

async function apiCreateShot(episodeId, data) {
  // TODO: POST /episodes/:episodeId/shots  body: data
  console.log('[mock] create shot', episodeId, data);
  return { id: `shot-${Date.now()}-${Math.random()}` };
}

async function apiUpdateShot(shotId, data) {
  // TODO: PATCH /shots/:shotId  body: data
  console.log('[mock] update shot', shotId, data);
}

async function apiDeleteShot(shotId) {
  // TODO: DELETE /shots/:shotId
  console.log('[mock] delete shot', shotId);
}

async function apiReorderShots(episodeId, orderedIds) {
  // TODO: PATCH /episodes/:episodeId/shots/reorder  body: { orderedIds }
  console.log('[mock] reorder shots', episodeId, orderedIds);
}

// ─────────────────────────────────────────────────────────────────────────────

const FONT = "'AlibabaPuHuiTi_2_55_Regular','Alibaba PuHuiTi 2.0',system-ui,sans-serif";
const FONT_MEDIUM = "'AlibabaPuHuiTi_2_65_Medium','Alibaba PuHuiTi 2.0',system-ui,sans-serif";

// ─── 集数选择器（面包屑下拉）─────────────────────────────────────────────────

const EPISODE_ITEM_H = 36;
const EPISODE_MAX_VISIBLE = 10;

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

  const dropdownMaxH = EPISODE_ITEM_H * EPISODE_MAX_VISIBLE + 8;

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      {open ? (
        <div
          className="flex items-center gap-[6px] h-[28px] pl-[10px] pr-[6px] rounded-[6px] cursor-pointer border border-solid bg-input-bg-normal border-input-border-focus [outline:1px_solid_var(--color-stroke-outline)]"
          style={{ boxShadow: '0px 0px 10px var(--color-glow)', minWidth: '80px' }}
          onClick={() => setOpen(false)}
        >
          <span className="flex-1 text-input-text-content text-font-size-14 shrink-0" style={{ fontFamily: FONT_MEDIUM, fontWeight: 500, lineHeight: '20px' }}>
            {value}
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <path d="M10.5 5.833L7 9.333L3.5 5.833H10.5Z" fill="#FFFFFF99" stroke="#FFFFFF99" strokeWidth="1.167" strokeLinejoin="round" />
          </svg>
        </div>
      ) : (
        <div
          className="flex items-center rounded-[6px] cursor-pointer"
          style={{ height: '28px', padding: '0 6px', backgroundColor: hovered ? '#FFFFFF0F' : 'transparent', transition: 'background-color 0.12s' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setOpen(true)}
        >
          <span style={{ fontFamily: FONT_MEDIUM, fontSize: '14px', lineHeight: '20px', color: '#FFFFFFD9', fontWeight: 500 }}>
            {value}
          </span>
        </div>
      )}
      {open && (
        <div
          className="flex flex-col rounded-medium bg-select-bg border border-select-border absolute z-50"
          style={{ top: 'calc(100% + 4px)', left: 0, minWidth: '100%', padding: '4px', boxShadow: '0px 4px 16px var(--color-select-shadow)', maxHeight: `${dropdownMaxH}px`, overflowY: episodes.length > EPISODE_MAX_VISIBLE ? 'auto' : 'visible' }}
        >
          {episodes.map((ep, i) => {
            const isActive = ep === value;
            const isHov = hoveredIdx === i;
            return (
              <div
                key={ep}
                className="flex items-center px-[12px] rounded-[6px] shrink-0"
                style={{ height: `${EPISODE_ITEM_H}px`, cursor: 'pointer', backgroundColor: isActive ? 'var(--color-select-item-bg-active)' : isHov ? 'var(--color-select-item-bg-hover)' : 'transparent', color: isActive || isHov ? 'var(--color-select-item-text-hover)' : 'var(--color-select-item-text-normal)' }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => { onChange(ep); setOpen(false); }}
              >
                <span className="w-fit shrink-0 text-font-size-14 font-font-weight-regular" style={{ fontFamily: FONT }}>{ep}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── 工具栏按钮 ───────────────────────────────────────────────────────────────

function SpinnerIcon({ color = '#FFFFFF' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, animation: 'spin 0.8s linear infinite' }}>
      <circle cx="7" cy="7" r="5.5" stroke={color} strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GhostBtn({ icon, children, onClick, disabled, loading }) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '36px',
        flexShrink: 0,
        borderRadius: '8px',
        padding: '1px',
        boxShadow: 'rgba(0,0,0,0.40) 3px 3px 8px',
        backgroundImage:
          'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 30%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, #FFFFFF14, #FFFFFF14)',
        outline: '1px solid #00000080',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.12s',
      }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          borderRadius: '7px',
          paddingInline: '15px',
          gap: '4px',
          backgroundColor: pressed ? '#1a1a1a' : hov ? '#1e1e1e' : '#161616',
          transition: 'background-color 0.10s',
        }}
      >
        {loading ? <SpinnerIcon color="#FFFFFF" /> : (icon && <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</span>)}
        <span style={{ fontSize: '14px', lineHeight: '18px', color: '#FFFFFF', whiteSpace: 'nowrap', fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif' }}>
          {children}
        </span>
      </div>
    </div>
  );
}

function PrimaryBtn({ icon, children, onClick, disabled, loading }) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '36px',
        flexShrink: 0,
        borderRadius: '8px',
        paddingInline: '16px',
        gap: '4px',
        backgroundColor: pressed ? '#28b0cc' : hov ? '#32cde8' : '#2DC3E1',
        backgroundImage: 'linear-gradient(in oklab 107.5deg, oklab(84.6% -0.114 0.031 / 30%) 8.14%, oklab(84.6% -0.114 0.031 / 0%) 54.48%)',
        backgroundOrigin: 'border-box',
        border: '1px solid #FFFFFF33',
        outline: '1px solid #00000080',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.10s, opacity 0.12s',
      }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {loading ? <SpinnerIcon color="#090909" /> : (icon && <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</span>)}
      <span style={{ fontSize: '14px', lineHeight: '18px', color: '#090909', fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif' }}>
        {children}
      </span>
    </div>
  );
}

// ─── 弹窗通用背景 ─────────────────────────────────────────────────────────────

function ModalOverlay({ onClose, children }) {
  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.60)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>,
    document.body
  );
}

// 弹窗内小按钮
function ModalGhostBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', height: '36px', flexShrink: 0,
        borderRadius: '8px', paddingInline: '16px', gap: '4px',
        boxShadow: 'rgba(0,0,0,0.40) 3px 3px 8px',
        backgroundColor: pressed ? '#1a1a1a' : hov ? '#1e1e1e' : '#161616',
        border: '1px solid rgba(255,255,255,0.05)',
        outline: '1px solid #00000080',
        cursor: 'pointer',
        transition: 'background-color 0.10s',
      }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      <span style={{ fontSize: '14px', lineHeight: '18px', color: 'rgba(255,255,255,0.60)', whiteSpace: 'nowrap', fontFamily: FONT }}>
        {children}
      </span>
    </div>
  );
}

function ModalPrimaryBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', height: '36px', flexShrink: 0,
        borderRadius: '8px', paddingInline: '16px', gap: '4px',
        backgroundColor: pressed ? '#28b0cc' : hov ? '#32cde8' : '#2DC3E1',
        backgroundImage: 'linear-gradient(in oklab 107.5deg, oklab(84.6% -0.114 0.031 / 30%) 8.14%, oklab(84.6% -0.114 0.031 / 0%) 54.48%)',
        backgroundOrigin: 'border-box',
        border: '1px solid #FFFFFF33',
        outline: '1px solid #00000080',
        cursor: 'pointer',
        transition: 'background-color 0.10s',
      }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      <span style={{ fontSize: '14px', lineHeight: '18px', color: '#090909', fontFamily: FONT_MEDIUM, fontWeight: 500, whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </div>
  );
}

// 弹窗内 Select 行
function ModalSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const [hov, setHov] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignSelf: 'stretch' }}>
      <span style={{ fontSize: '14px', lineHeight: '18px', color: 'rgba(255,255,255,0.60)', fontFamily: FONT }}>{label}</span>
      <div ref={ref} style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', height: '36px', width: '100%',
            borderRadius: '8px', paddingInline: '12px', gap: '8px', flexShrink: 0,
            backgroundColor: hov ? '#222323' : '#1D1E1E',
            border: open ? '1px solid rgba(255,255,255,0.20)' : '1px solid rgba(255,255,255,0.08)',
            outline: '1px solid #00000080',
            cursor: 'pointer',
            transition: 'background-color 0.10s, border-color 0.10s',
            boxSizing: 'border-box',
          }}
          onClick={() => setOpen((v) => !v)}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
        >
          <span style={{ flex: 1, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF', fontFamily: FONT }}>{value}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
            <path d="M12 6.333L8 10.333L4 6.333H12Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1.333" strokeLinejoin="round" />
          </svg>
        </div>
        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            backgroundColor: '#1D1E1E', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '8px', padding: '4px', zIndex: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,0.40)',
          }}>
            {options.map((opt) => (
              <ModalSelectItem key={opt} label={opt} active={opt === value} onSelect={() => { onChange(opt); setOpen(false); }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ModalSelectItem({ label, active, onSelect }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', height: '36px', paddingInline: '12px',
        borderRadius: '6px', cursor: 'pointer',
        backgroundColor: active ? 'rgba(255,255,255,0.08)' : hov ? 'rgba(255,255,255,0.05)' : 'transparent',
        color: active || hov ? '#FFFFFF' : 'rgba(255,255,255,0.60)',
        fontSize: '14px', lineHeight: '18px', fontFamily: FONT,
        transition: 'background-color 0.08s',
      }}
      onClick={onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {label}
    </div>
  );
}

// ModalToggle → 统一使用共享 Toggle 组件
const ModalToggle = Toggle;

// ─── 批量生成分镜图弹窗 ───────────────────────────────────────────────────────

function BatchImageModal({ shotCount, onClose, onConfirm }) {
  const [model, setModel] = useState('Seedance 2.0-pro');
  const [resolution, setResolution] = useState('1K');
  return (
    <ModalOverlay onClose={onClose}>
      <div style={{
        display: 'flex', flexDirection: 'column', width: '400px',
        backgroundColor: '#161616', borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.60)',
      }}>
        {/* 头部 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between', padding: '16px 24px' }}>
          <span style={{ flex: 1, fontSize: '16px', lineHeight: '20px', color: '#FFFFFF', fontFamily: FONT_MEDIUM, fontWeight: 500 }}>批量生成分镜图</span>
          <ModalCloseBtn onClick={onClose} />
        </div>
        {/* 内容 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 24px' }}>
          <div style={{ display: 'flex', gap: '8px', alignSelf: 'stretch', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', lineHeight: '18px', color: 'rgba(255,255,255,0.60)', fontFamily: FONT, flexShrink: 0 }}>待生成的分镜图数量</span>
            <span style={{ fontSize: '14px', lineHeight: '18px', color: '#FFFFFF', fontFamily: FONT, flexShrink: 0 }}>{shotCount}个</span>
          </div>
          <ModalSelect label="选择模型" value={model} options={['Seedance 2.0-pro', 'Seedance 2.0-lite', 'Flux 1.1 Pro']} onChange={setModel} />
          <ModalSelect label="分辨率" value={resolution} options={['1K', '2K', '4K']} onChange={setResolution} />
        </div>
        {/* 底部 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', padding: '16px 24px' }}>
          <ModalGhostBtn onClick={onClose}>取消</ModalGhostBtn>
          <ModalPrimaryBtn onClick={() => { onConfirm({ model, resolution }); onClose(); }}>开始生成</ModalPrimaryBtn>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ─── 批量生成分镜视频弹窗 ─────────────────────────────────────────────────────

function BatchVideoModal({ shotCount, onClose, onConfirm }) {
  const [model, setModel] = useState('Seedance 2.0-pro');
  const [quality, setQuality] = useState('720P');
  const [sound, setSound] = useState(true);
  return (
    <ModalOverlay onClose={onClose}>
      <div style={{
        display: 'flex', flexDirection: 'column', width: '400px',
        backgroundColor: '#161616', borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.60)',
      }}>
        {/* 头部 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between', padding: '16px 24px' }}>
          <span style={{ flex: 1, fontSize: '16px', lineHeight: '20px', color: '#FFFFFF', fontFamily: FONT_MEDIUM, fontWeight: 500 }}>批量生成分镜视频</span>
          <ModalCloseBtn onClick={onClose} />
        </div>
        {/* 内容 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 24px' }}>
          <div style={{ display: 'flex', gap: '8px', alignSelf: 'stretch', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', lineHeight: '18px', color: 'rgba(255,255,255,0.60)', fontFamily: FONT, flexShrink: 0 }}>待生成的分镜视频数量</span>
            <span style={{ fontSize: '14px', lineHeight: '18px', color: '#FFFFFF', fontFamily: FONT, flexShrink: 0 }}>{shotCount}个</span>
          </div>
          <ModalSelect label="选择模型" value={model} options={['Seedance 2.0-pro', 'Seedance 2.0-lite', 'Kling 2.0']} onChange={setModel} />
          {/* 时长（只读） */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignSelf: 'stretch' }}>
            <span style={{ fontSize: '14px', lineHeight: '18px', color: 'rgba(255,255,255,0.60)', fontFamily: FONT }}>时长</span>
            <div style={{
              display: 'flex', alignItems: 'center', height: '36px', width: '100%',
              borderRadius: '8px', paddingInline: '12px', gap: '8px',
              backgroundColor: '#131313', outline: '1px solid #00000080',
              boxSizing: 'border-box',
            }}>
              <span style={{ flex: 1, fontSize: '14px', lineHeight: '18px', color: 'rgba(255,255,255,0.40)', fontFamily: FONT }}>自动匹配</span>
            </div>
          </div>
          <ModalSelect label="清晰度" value={quality} options={['720P', '1080P', '4K']} onChange={setQuality} />
          {/* 音效 toggle */}
          <div style={{ display: 'flex', gap: '8px', alignSelf: 'stretch', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', lineHeight: '18px', color: 'rgba(255,255,255,0.60)', fontFamily: FONT, flexShrink: 0 }}>音效</span>
            <ModalToggle value={sound} onChange={setSound} />
          </div>
        </div>
        {/* 底部 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', padding: '16px 24px' }}>
          <ModalGhostBtn onClick={onClose}>取消</ModalGhostBtn>
          <ModalPrimaryBtn onClick={() => { onConfirm({ model, quality, sound }); onClose(); }}>开始生成</ModalPrimaryBtn>
        </div>
      </div>
    </ModalOverlay>
  );
}

function ModalCloseBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{
        width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '6px', cursor: 'pointer', flexShrink: 0,
        backgroundColor: hov ? 'rgba(255,255,255,0.08)' : 'transparent',
        transition: 'background-color 0.10s',
      }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2.667 2.667L13.333 13.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.667 13.333L13.333 2.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─── 图片列表辅助组件 ─────────────────────────────────────────────────────────

function ImgCheckbox({ checked, onChange }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`flex items-center cursor-pointer border border-solid rounded-sm [outline:1px_solid_var(--color-stroke-outline)] outline-offset-0 relative shrink-0 ${checked ? 'bg-checkbox-bg-active border-checkbox-border-active' : hovered ? 'bg-checkbox-bg-hover border-checkbox-border-normal' : 'bg-checkbox-bg-normal border-checkbox-border-normal'}`}
      style={{ width: '14px', height: '14px', padding: '2px', boxSizing: 'border-box' }}
      onClick={onChange}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {checked && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%' }}>
          <path d="M3.333 8L6.667 11.333L13.333 4.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

function ImgIconBtn({ children, onClick }) {
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

function ImgUploadBtn({ label, onClick }) {
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

// 上传占位卡
function ImgUploadCard({ onUpload }) {
  const [hovered, setHovered] = useState(false);
  const fileInputRef = useRef(null);
  return (
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
      <ImgUploadBtn label="本地上传" onClick={() => fileInputRef.current?.click()} />
      <ImgUploadBtn label="从资产库选择" onClick={() => {}} />
    </div>
  );
}

// 已生成图片卡
function ImgItem({ settled, imageUrl, onView, onSettledChange }) {
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
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {imageUrl
          ? <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <SpinnerIcon color="rgba(255,255,255,0.30)" />
        }
      </div>
      {/* 顶部定稿 checkbox */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '8px 10px', backgroundImage: 'linear-gradient(in oklab 180deg, oklab(0% 0 0 / 60%) 0%, oklab(0% 0 0 / 0%) 100%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <ImgCheckbox checked={settled} onChange={(e) => { e.stopPropagation(); onSettledChange?.(!settled); }} />
        <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: settled ? '#2DC3E1' : '#FFFFFF66' }}>定稿</span>
      </div>
      {/* 底部悬停按钮 */}
      {hovered && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 8px', backgroundImage: 'linear-gradient(in oklab 0deg, oklab(0% 0 0 / 60%) 0%, oklab(0% 0 0 / 0%) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
          <ImgIconBtn onClick={(e) => { e.stopPropagation(); onView?.(imageUrl); }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5.333 2H2.667C2.298 2 2 2.298 2 2.667V5.333" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.333 14H2.667C2.298 14 2 13.701 2 13.333V10.667" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.667 14H13.333C13.701 14 14 13.701 14 13.333V10.667" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.667 2H13.333C13.701 2 14 2.298 14 2.667V5.333" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </ImgIconBtn>
          <ImgIconBtn onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2.667V10" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.333 7.333L8 10L10.667 7.333" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.667 12H13.333" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </ImgIconBtn>
        </div>
      )}
    </div>
  );
}

// ─── 面板表单内 Select ────────────────────────────────────────────────────────

function PanelSelect({ label, value, options, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [hov, setHov] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDown, true);
    return () => document.removeEventListener('mousedown', onDown, true);
  }, [open]);
  const borderColor = open ? 'rgba(45,195,225,0.60)' : hov ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.08)';
  const outlineColor = open ? 'rgba(45,195,225,0.12)' : '#00000080';
  const outlineWidth = open ? '3px' : '1px';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignSelf: 'stretch' }}>
      {label && <span style={{ fontSize: '14px', lineHeight: '18px', color: 'rgba(255,255,255,0.60)', fontFamily: FONT }}>{label}</span>}
      <div ref={ref} style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', height: '36px', width: '100%',
            borderRadius: '8px', paddingInline: '12px', gap: '8px', flexShrink: 0,
            backgroundColor: disabled ? '#131313' : hov ? '#222323' : '#1D1E1E',
            border: `1px solid ${disabled ? 'rgba(255,255,255,0.06)' : borderColor}`,
            outline: `${outlineWidth} solid ${disabled ? '#00000080' : outlineColor}`,
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.10s, border-color 0.10s',
            boxSizing: 'border-box',
            opacity: disabled ? 0.5 : 1,
          }}
          onClick={() => { if (!disabled) setOpen((v) => !v); }}
          onMouseEnter={() => { if (!disabled) setHov(true); }}
          onMouseLeave={() => setHov(false)}
        >
          <span style={{ flex: 1, fontSize: '14px', lineHeight: '18px', color: disabled ? 'rgba(255,255,255,0.40)' : '#FFFFFF', fontFamily: FONT }}>{value}</span>
          {!disabled && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
              <path d="M12 6.333L8 10.333L4 6.333H12Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1.333" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            backgroundColor: '#1D1E1E', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '8px', padding: '4px', zIndex: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,0.40)',
          }}>
            {options.map((opt) => (
              <ModalSelectItem key={opt} label={opt} active={opt === value} onSelect={() => { onChange(opt); setOpen(false); }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 面板上传区（虚线框）────────────────────────────────────────────────────────

function PanelUploadSlot({ label, onUpload, media, onRemove, accept = 'image/*' }) {
  const fileRef = useRef(null);
  const [hov, setHov] = useState(false);
  const [btn1Hov, setBtn1Hov] = useState(false);
  const [btn1Pressed, setBtn1Pressed] = useState(false);
  const [btn2Hov, setBtn2Hov] = useState(false);
  const [btn2Pressed, setBtn2Pressed] = useState(false);
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUpload?.({ id: url, url, name: file.name, type: file.type });
    e.target.value = '';
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignSelf: 'stretch' }}>
      {label && <span style={{ fontSize: '14px', lineHeight: '18px', color: 'rgba(255,255,255,0.60)', fontFamily: FONT }}>{label}</span>}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input ref={fileRef} type="file" accept={accept} style={{ display: 'none' }} onChange={handleFile} />
        {media ? (
          <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.12)' }}>
            {media.type?.startsWith('video') ? (
              <video src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
            ) : (
              <img src={media.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            <div
              onClick={onRemove}
              style={{ position: 'absolute', top: '4px', right: '4px', width: '18px', height: '18px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.70)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2L8 8M8 2L2 8" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </div>
          </div>
        ) : (
          <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
              width: '120px', height: '120px', borderRadius: '6px', flexShrink: 0,
              border: `1px dashed ${hov ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.08)'}`,
              backgroundColor: '#1D1E1E',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'border-color 0.12s',
            }}
          >
            <div
              onClick={() => fileRef.current?.click()}
              onMouseEnter={() => setBtn1Hov(true)}
              onMouseLeave={() => { setBtn1Hov(false); setBtn1Pressed(false); }}
              onMouseDown={() => setBtn1Pressed(true)}
              onMouseUp={() => setBtn1Pressed(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px', paddingInline: '6px', borderRadius: '6px',
                backgroundColor: btn1Pressed ? '#1a1a1a' : btn1Hov ? '#222323' : '#161616',
                border: '1px solid rgba(255,255,255,0.08)', outline: '1px solid #00000080',
                cursor: 'pointer', fontSize: '12px', color: btn1Hov ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.40)',
                fontFamily: FONT, whiteSpace: 'nowrap', transition: 'background-color 0.10s, color 0.10s',
              }}
            >
              本地上传
            </div>
            <div
              onMouseEnter={() => setBtn2Hov(true)}
              onMouseLeave={() => { setBtn2Hov(false); setBtn2Pressed(false); }}
              onMouseDown={() => setBtn2Pressed(true)}
              onMouseUp={() => setBtn2Pressed(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px', paddingInline: '6px', borderRadius: '6px',
                backgroundColor: btn2Pressed ? '#1a1a1a' : btn2Hov ? '#222323' : '#161616',
                border: '1px solid rgba(255,255,255,0.08)', outline: '1px solid #00000080',
                cursor: 'pointer', fontSize: '12px', color: btn2Hov ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.40)',
                fontFamily: FONT, whiteSpace: 'nowrap', transition: 'background-color 0.10s, color 0.10s',
              }}
            >
              从资产库选择
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 面板内提示词输入框 ────────────────────────────────────────────────────────

const MAX_PROMPT_LEN = 300;

// ── DOM helpers for atomic mention editing ────────────────────────────────────

function buildMentionPattern(allSubjects) {
  const names = allSubjects.map((s) => s.name).filter(Boolean);
  if (names.length === 0) return null;
  return new RegExp(
    `@(${names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'g'
  );
}

function parseSegments(text, allSubjects) {
  const pattern = buildMentionPattern(allSubjects);
  if (!pattern) return [{ kind: 'text', text }];
  const segments = [];
  let last = 0;
  let m;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) segments.push({ kind: 'text', text: text.slice(last, m.index) });
    const subject = allSubjects.find((s) => s.name === m[1]);
    segments.push({ kind: 'mention', name: m[1], type: subject?._type ?? 'char' });
    last = m.index + m[0].length;
  }
  if (last < text.length) segments.push({ kind: 'text', text: text.slice(last) });
  return segments;
}

function serializeEditor(el) {
  let out = '';
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.dataset?.mention) out += `@${node.dataset.mention}`;
      else if (node.tagName === 'BR') out += '\n';
      else out += node.textContent;
    }
  }
  return out;
}

function rebuildEditorDOM(el, text, allSubjects) {
  const segs = parseSegments(text, allSubjects);
  el.innerHTML = '';
  for (const seg of segs) {
    if (seg.kind === 'text') {
      if (seg.text) el.appendChild(document.createTextNode(seg.text));
    } else {
      const color = SUBJECT_TYPE_COLOR[seg.type] ?? '#E2E24B';
      const span = document.createElement('span');
      span.dataset.mention = seg.name;
      span.contentEditable = 'false';
      span.textContent = `@${seg.name}`;
      span.style.cssText = [
        'display:inline-flex', 'align-items:center', 'padding:0 4px',
        'border-radius:4px', 'font-size:14px', 'line-height:21px',
        `background:${color}26`, `color:${color}`,
        `box-shadow:inset 0 0 0 1px ${color}33`,
        'vertical-align:middle', 'user-select:none', 'cursor:default',
      ].join(';');
      el.appendChild(span);
    }
  }
  if (!el.lastChild || el.lastChild.nodeType !== Node.TEXT_NODE) {
    el.appendChild(document.createTextNode(''));
  }
}

function getCaretOffset(el) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 0;
  const range = sel.getRangeAt(0);
  let offset = 0;
  for (const node of el.childNodes) {
    if (node === range.startContainer || node.contains?.(range.startContainer)) {
      if (node.nodeType === Node.TEXT_NODE) offset += range.startOffset;
      else if (node.dataset?.mention) offset += node.dataset.mention.length + 1;
      break;
    }
    if (node.nodeType === Node.TEXT_NODE) offset += node.textContent.length;
    else if (node.dataset?.mention) offset += node.dataset.mention.length + 1;
    else offset += node.textContent.length;
  }
  return offset;
}

function setCaretOffset(el, targetOffset) {
  let remaining = targetOffset;
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const len = node.textContent.length;
      if (remaining <= len) {
        const range = document.createRange();
        range.setStart(node, remaining);
        range.collapse(true);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
      remaining -= len;
    } else if (node.dataset?.mention) {
      const len = node.dataset.mention.length + 1;
      if (remaining < len) {
        const range = document.createRange();
        range.setStartAfter(node);
        range.collapse(true);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
      remaining -= len;
    } else {
      const len = node.textContent.length;
      if (remaining <= len) {
        const range = document.createRange();
        range.setStart(node, 0);
        range.collapse(true);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
      remaining -= len;
    }
  }
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function PanelPromptInput({ value, onChange, chars = [], scenes = [], props = [] }) {
  const [focused, setFocused] = useState(false);
  const [hov, setHov] = useState(false);
  const [mentionQuery, setMentionQuery] = useState(null);
  const editorRef = useRef(null);
  const wrapRef = useRef(null);
  const composingRef = useRef(false);
  const suppressSyncRef = useRef(false);

  const borderColor = focused ? 'rgba(45,195,225,0.60)' : hov ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.08)';
  const outlineColor = focused ? 'rgba(45,195,225,0.12)' : '#00000080';
  const outlineWidth = focused ? '3px' : '1px';

  const allSubjects = [
    ...chars.map((c) => ({ ...c, _type: 'char' })),
    ...scenes.map((s) => ({ ...s, _type: 'scene' })),
    ...props.map((p) => ({ ...p, _type: 'prop' })),
  ];

  function syncToValue(el) {
    if (suppressSyncRef.current) { suppressSyncRef.current = false; return; }
    const caretOffset = getCaretOffset(el);
    const raw = serializeEditor(el);
    const clamped = raw.slice(0, MAX_PROMPT_LEN);
    onChange(clamped);
    rebuildEditorDOM(el, clamped, allSubjects);
    setCaretOffset(el, caretOffset);
    const textBefore = clamped.slice(0, caretOffset);
    const atIdx = textBefore.lastIndexOf('@');
    if (atIdx !== -1) {
      const fragment = textBefore.slice(atIdx + 1);
      if (!fragment.includes(' ') && !fragment.includes('\n')) {
        setMentionQuery(fragment);
        return;
      }
    }
    setMentionQuery(null);
  }

  useEffect(() => {
    if (focused && editorRef.current) {
      rebuildEditorDOM(editorRef.current, value, allSubjects);
      setCaretOffset(editorRef.current, value.length);
    }
  }, [focused]); // eslint-disable-line react-hooks/exhaustive-deps

  // 原生 beforeinput 监听：React 合成 onBeforeInput 无法 preventDefault，必须用原生事件
  useEffect(() => {
    if (!focused) return;
    const el = editorRef.current;
    if (!el) return;
    function nativeBeforeInput(e) {
      if (composingRef.current) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      for (const node of el.childNodes) {
        if (!node.dataset?.mention) continue;
        const nodeRange = document.createRange();
        nodeRange.selectNode(node);
        if (
          range.compareBoundaryPoints(Range.START_TO_END, nodeRange) > 0 &&
          range.compareBoundaryPoints(Range.END_TO_START, nodeRange) < 0
        ) {
          e.preventDefault();
          return;
        }
      }
    }
    el.addEventListener('beforeinput', nativeBeforeInput);
    return () => el.removeEventListener('beforeinput', nativeBeforeInput);
  }, [focused]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleKeyDown(e) {
    if (e.key === 'Escape') { setMentionQuery(null); return; }
    const el = editorRef.current;
    if (!el) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    if (e.key === 'Backspace' || e.key === 'Delete') {
      for (const node of el.childNodes) {
        if (!node.dataset?.mention) continue;
        const nodeRange = document.createRange();
        nodeRange.selectNode(node);
        const collapsed = range.collapsed;

        if (collapsed && e.key === 'Backspace') {
          const afterRange = document.createRange();
          afterRange.setStartAfter(node);
          afterRange.collapse(true);
          if (range.compareBoundaryPoints(Range.START_TO_START, afterRange) === 0) {
            e.preventDefault();
            const caretOffset = getCaretOffset(el) - (node.dataset.mention.length + 1);
            node.remove();
            const raw = serializeEditor(el);
            onChange(raw.slice(0, MAX_PROMPT_LEN));
            rebuildEditorDOM(el, raw.slice(0, MAX_PROMPT_LEN), allSubjects);
            setCaretOffset(el, Math.max(0, caretOffset));
            setMentionQuery(null);
            return;
          }
        }
        if (collapsed && e.key === 'Delete') {
          const beforeRange = document.createRange();
          beforeRange.setStartBefore(node);
          beforeRange.collapse(true);
          if (range.compareBoundaryPoints(Range.START_TO_START, beforeRange) === 0) {
            e.preventDefault();
            const caretOffset = getCaretOffset(el);
            node.remove();
            const raw = serializeEditor(el);
            onChange(raw.slice(0, MAX_PROMPT_LEN));
            rebuildEditorDOM(el, raw.slice(0, MAX_PROMPT_LEN), allSubjects);
            setCaretOffset(el, caretOffset);
            setMentionQuery(null);
            return;
          }
        }
        if (!collapsed) {
          const inside =
            range.compareBoundaryPoints(Range.START_TO_END, nodeRange) > 0 &&
            range.compareBoundaryPoints(Range.END_TO_START, nodeRange) < 0;
          if (inside) {
            e.preventDefault();
            const caretOffset = getCaretOffset(el);
            range.deleteContents();
            const raw = serializeEditor(el);
            onChange(raw.slice(0, MAX_PROMPT_LEN));
            rebuildEditorDOM(el, raw.slice(0, MAX_PROMPT_LEN), allSubjects);
            setCaretOffset(el, Math.max(0, caretOffset));
            setMentionQuery(null);
            return;
          }
        }
      }
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      for (const node of el.childNodes) {
        if (!node.dataset?.mention) continue;
        if (e.key === 'ArrowLeft') {
          const afterRange = document.createRange();
          afterRange.setStartAfter(node);
          afterRange.collapse(true);
          if (range.collapsed && range.compareBoundaryPoints(Range.START_TO_START, afterRange) === 0) {
            e.preventDefault();
            const r = document.createRange();
            r.setStartBefore(node);
            r.collapse(true);
            sel.removeAllRanges();
            sel.addRange(r);
            return;
          }
        } else {
          const beforeRange = document.createRange();
          beforeRange.setStartBefore(node);
          beforeRange.collapse(true);
          if (range.collapsed && range.compareBoundaryPoints(Range.START_TO_START, beforeRange) === 0) {
            e.preventDefault();
            const r = document.createRange();
            r.setStartAfter(node);
            r.collapse(true);
            sel.removeAllRanges();
            sel.addRange(r);
            return;
          }
        }
      }
    }
  }

  function handleInput() {
    if (composingRef.current) return;
    const el = editorRef.current;
    if (el) syncToValue(el);
  }

  function handleCompositionStart() { composingRef.current = true; }
  function handleCompositionEnd() {
    composingRef.current = false;
    const el = editorRef.current;
    if (el) syncToValue(el);
  }

  function handleSelectMention(name) {
    const el = editorRef.current;
    if (!el) return;
    const caretOffset = getCaretOffset(el);
    const textBefore = value.slice(0, caretOffset);
    const atIdx = textBefore.lastIndexOf('@');
    const before = value.slice(0, atIdx);
    const after = value.slice(caretOffset);
    const newVal = `${before}@${name} ${after}`.slice(0, MAX_PROMPT_LEN);
    onChange(newVal);
    setMentionQuery(null);
    suppressSyncRef.current = true;
    requestAnimationFrame(() => {
      if (!editorRef.current) return;
      rebuildEditorDOM(editorRef.current, newVal, allSubjects);
      setCaretOffset(editorRef.current, atIdx + name.length + 2);
    });
  }

  const segments = parseSegments(value, allSubjects);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignSelf: 'stretch' }}>
      <span style={{ fontSize: '14px', lineHeight: '18px', color: 'rgba(255,255,255,0.60)', fontFamily: FONT }}>提示词</span>
      <div
        ref={wrapRef}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: 'flex', flexDirection: 'column',
          backgroundColor: '#1D1E1E', borderRadius: '8px',
          border: `1px solid ${borderColor}`, outline: `${outlineWidth} solid ${outlineColor}`,
          padding: '9px 12px', height: '120px', boxSizing: 'border-box',
          transition: 'border-color 0.10s',
          position: 'relative',
        }}
      >
        {focused ? (
          /* 编辑态：contenteditable，mention span 为 contentEditable=false 原子 */
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); setMentionQuery(null); }}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            data-placeholder="描述画面内容、风格、镜头… 输入 @ 引入角色/场景/道具"
            style={{
              flex: 1, outline: 'none', background: 'transparent',
              fontSize: '14px', lineHeight: '21px', color: '#FFFFFF', caretColor: '#2DC3E1',
              fontFamily: FONT, wordBreak: 'break-all', whiteSpace: 'pre-wrap',
              overflowY: 'auto', boxSizing: 'border-box',
            }}
            className="[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-[rgba(255,255,255,0.30)] [&:empty]:before:pointer-events-none"
          />
        ) : (
          /* 展示态：带高亮 tag 的 read-only 视图，点击进入编辑 */
          <div
            onClick={() => setFocused(true)}
            style={{
              flex: 1, overflow: 'hidden',
              fontSize: '14px', lineHeight: '21px', fontFamily: FONT,
              wordBreak: 'break-all', whiteSpace: 'pre-wrap',
              cursor: 'text',
              color: value ? '#FFFFFF' : 'rgba(255,255,255,0.30)',
            }}
          >
            {value === '' ? '描述画面内容、风格、镜头… 输入 @ 引入角色/场景/道具' : segments.map((seg, i) =>
              seg.kind === 'mention'
                ? <SubjectTag key={i} name={seg.name} type={seg.type} />
                : <span key={i}>{seg.text}</span>
            )}
          </div>
        )}
        <div style={{ alignSelf: 'stretch', textAlign: 'right', fontSize: '12px', lineHeight: '18px', color: 'rgba(255,255,255,0.40)', fontFamily: FONT, flexShrink: 0 }}>
          {value.length}/{MAX_PROMPT_LEN}
        </div>
      </div>
      {mentionQuery !== null && (
        <SubjectMentionDropdown
          chars={chars}
          scenes={scenes}
          props={props}
          query={mentionQuery}
          onSelect={handleSelectMention}
          onClose={() => setMentionQuery(null)}
          triggerRef={wrapRef}
        />
      )}
    </div>
  );
}

// ─── 生成分镜图面板 ────────────────────────────────────────────────────────────

function GenerateImagePanel({ shot, chars = [], scenes = [], props = [], onClose, onGenerate }) {
  const [model, setModel] = useState('Doubao-Seed-2.0-Pro');
  const [resolution, setResolution] = useState('2K');
  const [prompt, setPrompt] = useState(shot?.description || '');
  const [refMedia, setRefMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [btnHov, setBtnHov] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [viewImageUrl, setViewImageUrl] = useState(null);

  async function handleGenerate() {
    if (loading) return;
    setLoading(true);
    const placeholder = `pending-${Date.now()}`;
    setGeneratedImages((prev) => [{ url: null, settled: false, id: placeholder }, ...prev]);
    const result = await onGenerate?.({ model, resolution, prompt });
    setGeneratedImages((prev) =>
      prev.map((item) => item.id === placeholder ? { ...item, url: result?.url ?? null } : item)
    );
    setLoading(false);
  }

  const btnBg = loading ? 'rgba(45,195,225,0.60)' : btnPressed ? '#28b0cc' : btnHov ? '#32cde8' : '#2DC3E1';

  return createPortal(
    <>
      {/* 点击空白关闭 */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 900, pointerEvents: 'auto' }}
        onMouseDown={onClose}
      />
      <div
        style={{
          position: 'fixed', right: '24px', top: '60px', bottom: '24px',
          width: '600px', zIndex: 901,
          display: 'flex', flexDirection: 'column',
          backgroundColor: '#161616',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '-10px 24px 64px rgba(0,0,0,0.60)',
          animation: 'slideInRight 220ms cubic-bezier(0.22,1,0.36,1) forwards',
          overflow: 'hidden',
          pointerEvents: 'auto',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', flexShrink: 0 }}>
          <span style={{ fontSize: '16px', lineHeight: '20px', color: '#FFFFFF', fontFamily: FONT_MEDIUM, fontWeight: 500 }}>生成分镜图</span>
          <ModalCloseBtn onClick={onClose} />
        </div>

        {/* 内容区：左表单 + 右预览 */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* 左侧表单 */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '419px', flexShrink: 0, padding: '8px 12px 8px 24px', gap: '20px', overflowY: 'auto' }}>
            {/* 分镜编号 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
              <span style={{ fontSize: '14px', lineHeight: '18px', color: 'rgba(255,255,255,0.60)', fontFamily: FONT, flexShrink: 0 }}>分镜编号</span>
              <span style={{ fontSize: '14px', lineHeight: '20px', color: '#FFFFFF', fontFamily: FONT, flexShrink: 0 }}>{String(shot?.number ?? 1).padStart(2, '0')}</span>
            </div>

            <PanelPromptInput value={prompt} onChange={setPrompt} chars={chars} scenes={scenes} props={props} />
            <PanelSelect label="选择模型" value={model} options={['Doubao-Seed-2.0-Pro', 'Doubao-Seed-2.0-Lite', 'Flux 1.1 Pro']} onChange={setModel} />
            <PanelUploadSlot label="参考主体" accept="image/*" media={refMedia} onUpload={setRefMedia} onRemove={() => setRefMedia(null)} />
            <PanelSelect label="分辨率" value={resolution} options={['1K', '2K', '4K']} onChange={setResolution} />

            {/* 生成按钮 */}
            <div style={{ flexShrink: 0 }}>
              <div
                onClick={loading ? undefined : handleGenerate}
                onMouseEnter={() => !loading && setBtnHov(true)}
                onMouseLeave={() => { setBtnHov(false); setBtnPressed(false); }}
                onMouseDown={() => !loading && setBtnPressed(true)}
                onMouseUp={() => setBtnPressed(false)}
                style={{
                  display: 'inline-flex', alignItems: 'center', height: '36px', borderRadius: '8px', paddingInline: '16px', gap: '4px',
                  backgroundColor: btnBg,
                  backgroundImage: 'linear-gradient(in oklab 107.5deg, oklab(84.6% -0.114 0.031 / 30%) 8.14%, oklab(84.6% -0.114 0.031 / 0%) 54.48%)',
                  backgroundOrigin: 'border-box',
                  border: '1px solid #FFFFFF33', outline: '1px solid #00000080',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.10s',
                  flexShrink: 0,
                }}
              >
                {loading ? (
                  <SpinnerIcon color="#090909" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M3 5V3.188C3 2.891 3.029 2.783 3.083 2.674C3.138 2.566 3.218 2.481 3.32 2.422C3.422 2.364 3.523 2.333 3.801 2.333H12.199C12.477 2.333 12.578 2.364 12.68 2.422C12.782 2.481 12.862 2.566 12.916 2.674C12.971 2.783 13 2.891 13 3.188V5" stroke="#090909" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1.667 5H14.333V13.667H1.667V5Z" stroke="#090909" strokeLinejoin="round" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.333 8.667C4.886 8.667 5.333 8.219 5.333 7.667C5.333 7.114 4.886 6.667 4.333 6.667C3.781 6.667 3.333 7.114 3.333 7.667C3.333 8.219 3.781 8.667 4.333 8.667Z" fill="#090909" />
                    <path d="M1.856 13.463L5 10L6.667 11.333L8.667 9L14.131 13.463" stroke="#090909" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span style={{ fontSize: '14px', lineHeight: '18px', color: '#090909', fontFamily: FONT_MEDIUM, fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {loading ? '生成中…' : '生成分镜图'}
                </span>
              </div>
            </div>
          </div>

          {/* 右侧图片列表 */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '12px', paddingRight: '24px', paddingTop: '8px', paddingBottom: '8px', background: '#161616', height: '100%', boxSizing: 'border-box' }}>
            <ImgUploadCard
              onUpload={(file) => {
                const url = URL.createObjectURL(file);
                setGeneratedImages((prev) => [{ url, settled: false, id: url }, ...prev]);
              }}
            />
            {generatedImages.map((img, i) => (
              <ImgItem
                key={img.id ?? img.url + i}
                imageUrl={img.url}
                settled={img.settled}
                onView={setViewImageUrl}
                onSettledChange={(newSettled) => {
                  setGeneratedImages((prev) =>
                    prev.map((item, idx) =>
                      idx === i ? { ...item, settled: newSettled } : { ...item, settled: newSettled ? false : item.settled }
                    )
                  );
                }}
              />
            ))}
          </div>
        </div>
      </div>
      {viewImageUrl && <MediaViewModal url={viewImageUrl} onClose={() => setViewImageUrl(null)} />}
    </>,
    document.body
  );
}

function GenerateVideoPanel({ shot, chars = [], scenes = [], props = [], onClose, onGenerate }) {
  const [tab, setTab] = useState('first-last'); // 'first-last' | 'multi'
  const [model, setModel] = useState('Doubao-Seed-2.0-Pro');
  const [resolution, setResolution] = useState('720P');
  const [duration, setDuration] = useState('自动匹配');
  const [sound, setSound] = useState(true);
  const [prompt, setPrompt] = useState(shot?.description || '');
  const [refSubject, setRefSubject] = useState(null);
  const [refImage, setRefImage] = useState(null);
  const [refVideo, setRefVideo] = useState(null);
  const [refFirstFrame, setRefFirstFrame] = useState(null);
  const [refLastFrame, setRefLastFrame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [btnHov, setBtnHov] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [viewerShot, setViewerShot] = useState(null);

  async function handleGenerate() {
    if (loading) return;
    setLoading(true);
    const placeholder = `pending-${Date.now()}`;
    setGeneratedVideos((prev) => [{ url: null, settled: false, id: placeholder }, ...prev]);
    const result = await onGenerate?.({ model, resolution, duration, sound, prompt });
    setGeneratedVideos((prev) =>
      prev.map((item) => item.id === placeholder ? { ...item, url: result?.url ?? null } : item)
    );
    setLoading(false);
  }

  const btnBg = loading ? 'rgba(45,195,225,0.60)' : btnPressed ? '#28b0cc' : btnHov ? '#32cde8' : '#2DC3E1';

  return createPortal(
    <>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 900, pointerEvents: 'auto' }}
        onMouseDown={onClose}
      />
      <div
        style={{
          position: 'fixed', right: '24px', top: '60px', bottom: '24px',
          width: '600px', zIndex: 901,
          display: 'flex', flexDirection: 'column',
          backgroundColor: '#161616',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '-10px 24px 64px rgba(0,0,0,0.60)',
          animation: 'slideInRight 220ms cubic-bezier(0.22,1,0.36,1) forwards',
          overflow: 'hidden',
          pointerEvents: 'auto',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', flexShrink: 0 }}>
          <span style={{ fontSize: '16px', lineHeight: '20px', color: '#FFFFFF', fontFamily: FONT_MEDIUM, fontWeight: 500 }}>生成分镜视频</span>
          <ModalCloseBtn onClick={onClose} />
        </div>

        {/* 内容区 */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* 左侧表单 */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '419px', flexShrink: 0, padding: '8px 12px 8px 24px', gap: '20px', overflowY: 'auto' }}>
            {/* 分镜编号 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
              <span style={{ fontSize: '14px', lineHeight: '18px', color: 'rgba(255,255,255,0.60)', fontFamily: FONT, flexShrink: 0 }}>分镜编号</span>
              <span style={{ fontSize: '14px', lineHeight: '20px', color: '#FFFFFF', fontFamily: FONT, flexShrink: 0 }}>{String(shot?.number ?? 1).padStart(2, '0')}</span>
            </div>

            {/* Tab 切换 */}
            <div style={{ display: 'flex', gap: '24px' }}>
              {[{ key: 'first-last', label: '首尾帧生视频' }, { key: 'multi', label: '多参生视频' }].map(({ key, label }) => (
                <div
                  key={key}
                  onClick={() => setTab(key)}
                  style={{ display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}
                >
                  <span style={{ fontSize: '14px', lineHeight: '18px', color: tab === key ? '#FFFFFF' : 'rgba(255,255,255,0.60)', fontFamily: tab === key ? FONT_MEDIUM : FONT, fontWeight: tab === key ? 500 : 400, transition: 'color 0.12s' }}>
                    {label}
                  </span>
                  {tab === key && <div style={{ height: '2px', backgroundColor: '#DDDDDD', borderRadius: '1px' }} />}
                </div>
              ))}
            </div>

            <PanelPromptInput value={prompt} onChange={setPrompt} chars={chars} scenes={scenes} props={props} />
            <PanelSelect label="选择模型" value={model} options={['Doubao-Seed-2.0-Pro', 'Doubao-Seed-2.0-Lite', 'Kling 2.0']} onChange={setModel} />

            {/* Tab 对应的上传字段 */}
            {tab === 'first-last' ? (
              <>
                <PanelUploadSlot label="首帧图" accept="image/*" media={refFirstFrame} onUpload={setRefFirstFrame} onRemove={() => setRefFirstFrame(null)} />
                <PanelUploadSlot label="尾帧图" accept="image/*" media={refLastFrame} onUpload={setRefLastFrame} onRemove={() => setRefLastFrame(null)} />
              </>
            ) : (
              <>
                <PanelUploadSlot label="参考主体" accept="image/*" media={refSubject} onUpload={setRefSubject} onRemove={() => setRefSubject(null)} />
                <PanelUploadSlot label="参考图" accept="image/*" media={refImage} onUpload={setRefImage} onRemove={() => setRefImage(null)} />
                <PanelUploadSlot label="参考视频" accept="video/*" media={refVideo} onUpload={setRefVideo} onRemove={() => setRefVideo(null)} />
              </>
            )}

            <PanelSelect label="时长" value={duration} options={['自动匹配', '1s', '2s', '3s', '5s', '8s', '10s']} onChange={setDuration} />
            <PanelSelect label="分辨率" value={resolution} options={['720P', '1080P', '4K']} onChange={setResolution} />

            {/* 音效 toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ fontSize: '14px', lineHeight: '18px', color: 'rgba(255,255,255,0.60)', fontFamily: FONT, flexShrink: 0 }}>音效</span>
              <ModalToggle value={sound} onChange={setSound} />
            </div>

            {/* 生成按钮 */}
            <div style={{ flexShrink: 0 }}>
              <div
                onClick={loading ? undefined : handleGenerate}
                onMouseEnter={() => !loading && setBtnHov(true)}
                onMouseLeave={() => { setBtnHov(false); setBtnPressed(false); }}
                onMouseDown={() => !loading && setBtnPressed(true)}
                onMouseUp={() => setBtnPressed(false)}
                style={{
                  display: 'inline-flex', alignItems: 'center', height: '36px', borderRadius: '8px', paddingInline: '16px', gap: '4px',
                  backgroundColor: btnBg,
                  backgroundImage: 'linear-gradient(in oklab 107.5deg, oklab(84.6% -0.114 0.031 / 30%) 8.14%, oklab(84.6% -0.114 0.031 / 0%) 54.48%)',
                  backgroundOrigin: 'border-box',
                  border: '1px solid #FFFFFF33', outline: '1px solid #00000080',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.10s',
                  flexShrink: 0,
                }}
              >
                {loading ? (
                  <SpinnerIcon color="#090909" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M12.333 2.333H3.667V13.667H12.333V2.333Z" stroke="#090909" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3.667 3.667H1.333V12.333H3.667V3.667Z" stroke="#090909" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14.667 3.667H12.333V12.333H14.667V3.667Z" stroke="#090909" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7.333 6.667L9.333 8L7.333 9.333V6.667Z" fill="#090909" stroke="#090909" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span style={{ fontSize: '14px', lineHeight: '18px', color: '#090909', fontFamily: FONT_MEDIUM, fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {loading ? '生成中…' : '生成分镜视频'}
                </span>
              </div>
            </div>
          </div>

          {/* 右侧视频列表 */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '12px', paddingRight: '24px', paddingTop: '8px', paddingBottom: '8px', background: '#161616', height: '100%', boxSizing: 'border-box' }}>
            <VideoUploadCard
              onUpload={(file) => {
                const url = URL.createObjectURL(file);
                setGeneratedVideos((prev) => [{ url, settled: false, id: url }, ...prev]);
              }}
            />
            {generatedVideos.map((vid, i) => (
              <VideoItem
                key={vid.id ?? vid.url + i}
                videoUrl={vid.url}
                settled={vid.settled}
                onSettledChange={(newSettled) => {
                  setGeneratedVideos((prev) =>
                    prev.map((item, idx) =>
                      idx === i ? { ...item, settled: newSettled } : { ...item, settled: newSettled ? false : item.settled }
                    )
                  );
                }}
                onView={(url) => setViewerShot({
                  videoUrl: url,
                  filename: vid.name,
                  label: `镜头 ${String(shot?.number ?? 1).padStart(2, '0')}`,
                  prompt,
                  model,
                  resolution,
                  duration: undefined,
                  aspectRatio: '16:9',
                  finalized: vid.settled,
                })}
              />
            ))}
          </div>
        </div>
      </div>
      {viewerShot && <ShotViewerModal shot={viewerShot} onClose={() => setViewerShot(null)} />}
    </>,
    document.body
  );
}

// 视频上传占位卡
function VideoUploadCard({ onUpload }) {
  const [hovered, setHovered] = useState(false);
  const fileInputRef = useRef(null);
  return (
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
        accept="video/*"
        style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files?.[0]) onUpload?.(e.target.files[0]); e.target.value = ''; }}
      />
      <ImgUploadBtn label="本地上传" onClick={() => fileInputRef.current?.click()} />
      <ImgUploadBtn label="从资产库选择" onClick={() => {}} />
    </div>
  );
}

// 已生成视频卡
function VideoItem({ settled, videoUrl, onSettledChange, onView }) {
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
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {videoUrl
          ? <video src={videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
          : <SpinnerIcon color="rgba(255,255,255,0.30)" />
        }
      </div>
      {/* 顶部定稿 checkbox */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '8px 10px', backgroundImage: 'linear-gradient(in oklab 180deg, oklab(0% 0 0 / 60%) 0%, oklab(0% 0 0 / 0%) 100%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <ImgCheckbox checked={settled} onChange={(e) => { e.stopPropagation(); onSettledChange?.(!settled); }} />
        <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: settled ? '#2DC3E1' : '#FFFFFF66' }}>定稿</span>
      </div>
      {/* 底部悬停按钮 */}
      {hovered && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 8px', backgroundImage: 'linear-gradient(in oklab 0deg, oklab(0% 0 0 / 60%) 0%, oklab(0% 0 0 / 0%) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
          {videoUrl && (
            <ImgIconBtn onClick={(e) => { e.stopPropagation(); onView?.(videoUrl); }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M5.333 2H2.667C2.298 2 2 2.298 2 2.667V5.333" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.333 14H2.667C2.298 14 2 13.701 2 13.333V10.667" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.667 14H13.333C13.701 14 14 13.701 14 13.333V10.667" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.667 2H13.333C13.701 2 14 2.298 14 2.667V5.333" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </ImgIconBtn>
          )}
          <ImgIconBtn onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2.667V10" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.333 7.333L8 10L10.667 7.333" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.667 12H13.333" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </ImgIconBtn>
        </div>
      )}
    </div>
  );
}

// ─── SVG 图标 ─────────────────────────────────────────────────────────────────

const IconBatchImage = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0}}>
    <path d="M3 5V3.188C3 2.891 3.029 2.783 3.083 2.674C3.138 2.566 3.218 2.481 3.32 2.422C3.422 2.364 3.523 2.333 3.801 2.333H12.199C12.477 2.333 12.578 2.364 12.68 2.422C12.782 2.481 12.862 2.566 12.916 2.674C12.971 2.783 13 2.891 13 3.188V5" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1.667 5H14.333V13.667H1.667V5Z" stroke="#FFFFFF" strokeLinejoin="round" />
    <path fillRule="evenodd" clipRule="evenodd" d="M4.333 8.667C4.886 8.667 5.333 8.219 5.333 7.667C5.333 7.114 4.886 6.667 4.333 6.667C3.781 6.667 3.333 7.114 3.333 7.667C3.333 8.219 3.781 8.667 4.333 8.667Z" fill="#FFFFFF" />
    <path d="M1.856 13.463L5 10L6.667 11.333L8.667 9L14.131 13.463" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconBatchVideo = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0}}>
    <path d="M12.333 2.333H3.667V13.667H12.333V2.333Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.667 3.667H1.333V12.333H3.667V3.667Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.667 3.667H12.333V12.333H14.667V3.667Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.333 6.667L9.333 8L7.333 9.333V6.667Z" fill="#FFFFFF" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0}}>
    <path d="M8.003 11.3V2" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 7.333L8 11.333L12 7.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 14H12" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0}}>
    <path d="M14.333 5.667V3H11.333M14.333 5.667V10.333M14.333 5.667H11.333M11.333 3V5.667M11.333 3H10M14.333 10.333V13H11.333M14.333 10.333H11.333M11.333 5.667H10M1.667 5.667V3H4.667M1.667 5.667V10.333M1.667 5.667H4.667M4.667 3V5.667M4.667 3H6M1.667 10.333V13H4.667M1.667 10.333H4.667M4.667 5.667H6M4.667 13V10.333M4.667 13H6M4.667 10.333H6M11.333 13V10.333M11.333 13H10M11.333 10.333H10" stroke="#090909" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 2.333V3.667" stroke="#090909" strokeLinecap="round" />
    <path d="M8 5.667V7" stroke="#090909" strokeLinecap="round" />
    <path d="M8 9V10.333" stroke="#090909" strokeLinecap="round" />
    <path d="M8 12.333V13.667" stroke="#090909" strokeLinecap="round" />
  </svg>
);

const IconDrag = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M6.333 3.333C6.333 4.07 5.736 4.667 5 4.667C4.264 4.667 3.667 4.07 3.667 3.333C3.667 2.597 4.264 2 5 2C5.736 2 6.333 2.597 6.333 3.333ZM5 9.333C5.736 9.333 6.333 8.736 6.333 8C6.333 7.264 5.736 6.667 5 6.667C4.264 6.667 3.667 7.264 3.667 8C3.667 8.736 4.264 9.333 5 9.333ZM5 14C5.736 14 6.333 13.403 6.333 12.667C6.333 11.93 5.736 11.333 5 11.333C4.264 11.333 3.667 11.93 3.667 12.667C3.667 13.403 4.264 14 5 14Z" fill="#FFFFFF"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M12.333 3.333C12.333 4.07 11.736 4.667 11 4.667C10.264 4.667 9.667 4.07 9.667 3.333C9.667 2.597 10.264 2 11 2C11.736 2 12.333 2.597 12.333 3.333ZM11 9.333C11.736 9.333 12.333 8.736 12.333 8C12.333 7.264 11.736 6.667 11 6.667C10.264 6.667 9.667 7.264 9.667 8C9.667 8.736 10.264 9.333 11 9.333ZM11 14C11.736 14 12.333 13.403 12.333 12.667C12.333 11.93 11.736 11.333 11 11.333C10.264 11.333 9.667 11.93 9.667 12.667C9.667 13.403 10.264 14 11 14Z" fill="#FFFFFF"/>
  </svg>
);

const IconAdd = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 10.667V5.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 9V7" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 9V7" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.667 2H2.667C2.298 2 2 2.298 2 2.667V4.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.333 2H13.333C13.702 2 14 2.298 14 2.667V4.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.333 14H13.333C13.702 14 14 13.702 14 13.333V11.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.667 14H2.667C2.298 14 2 13.702 2 13.333V11.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 2H7" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.667 8H5.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 14H7" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCopy = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4.333 4.144V2.604C4.333 2.086 4.753 1.667 5.271 1.667H13.396C13.914 1.667 14.333 2.086 14.333 2.604V10.729C14.333 11.247 13.914 11.667 13.396 11.667H11.839" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.729 4.333H2.604C2.086 4.333 1.667 4.753 1.667 5.271V13.396C1.667 13.914 2.086 14.333 2.604 14.333H10.729C11.247 14.333 11.667 13.914 11.667 13.396V5.271C11.667 4.753 11.247 4.333 10.729 4.333Z" stroke="#FFFFFF" strokeLinejoin="round"/>
  </svg>
);

const IconDelete = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 3.333V14.667H13V3.333H3Z" stroke="#FFFFFF" strokeLinejoin="round"/>
    <path d="M6.667 6.667V11" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.333 6.667V11" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1.333 3.333H14.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.333 3.333L6.43 1.333H9.592L10.667 3.333H5.333Z" stroke="#FFFFFF" strokeLinejoin="round"/>
  </svg>
);

const IconPlus = ({ color = '#FFFFFF40' }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 2V12M2 7H12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 4L12 12M12 4L4 12" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IconImagePlaceholder = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="10" rx="2" stroke="#848484" strokeWidth="1.2"/>
    <circle cx="5.5" cy="6.5" r="1.5" stroke="#848484" strokeWidth="1.2"/>
    <path d="M2 11L5 8L7.5 10.5L10 8L14 11" stroke="#848484" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconVideoPlaceholder = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="9" height="10" rx="2" stroke="#848484" strokeWidth="1.2"/>
    <path d="M11 6.5L14 5V11L11 9.5V6.5Z" stroke="#848484" strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
);

// ─── 删除确认弹窗 ─────────────────────────────────────────────────────────────

function DeleteConfirmModal({ shotNumber, onConfirm, onCancel }) {
  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={onCancel}
    >
      <div
        style={{ width: '360px', borderRadius: '16px', backgroundColor: '#161616', boxShadow: '#00000099 0px 8px 32px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', fontFamily: FONT_MEDIUM, lineHeight: '20px' }}>
              确定要删除吗？
            </span>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', fontFamily: FONT, lineHeight: '18px' }}>
              此操作不可撤销，镜头 {String(shotNumber).padStart(2, '0')} 将被永久删除。
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
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '36px', flexShrink: 0, borderRadius: '8px', paddingLeft: '16px', paddingRight: '16px', boxShadow: '#00000066 3px 3px 8px', backgroundColor: '#161616', border: '1px solid #FFFFFF14', outline: '1px solid #00000080', cursor: 'pointer', fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: 'rgba(255,255,255,0.6)' }}
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '36px', flexShrink: 0, borderRadius: '8px', paddingLeft: '16px', paddingRight: '16px', backgroundColor: '#D13B3B', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontFamily: FONT_MEDIUM, fontWeight: 500, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF' }}
          >
            删除
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── 参数下拉选择器 ───────────────────────────────────────────────────────────

const PARAM_OPTIONS = {
  framing: ['远景', '全景', '中景', '近景', '特写', '大特写'],
  cameraMotion: ['固定', '缓慢拉近', '缓慢推远', '横移', '跟随', '俯拍', '仰拍'],
  angle: ['平视', '俯视', '仰视', '侧面', '背面'],
  composition: ['三分线构图', '中心构图', '对角线构图', '框架构图', '引导线构图'],
  duration: ['1s', '2s', '3s', '5s', '8s', '10s'],
};

const PARAM_LABELS = {
  framing: '景别',
  cameraMotion: '运镜',
  angle: '拍摄角度',
  composition: '构图',
  duration: '时长',
};

function ParamSelect({ field, value, onChange, onClose, triggerRef }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, visibility: 'hidden' });

  // Runs after every render so ref.current.offsetHeight is available
  useEffect(() => {
    if (!triggerRef?.current || !ref.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuH = ref.current.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow >= menuH + 4 ? rect.bottom + 4 : rect.top - menuH - 4;
    setPos((prev) => {
      if (prev.top === top && prev.left === rect.left && prev.visibility === 'visible') return prev;
      return { top, left: rect.left, visibility: 'visible' };
    });
  });

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target) && triggerRef?.current && !triggerRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose, triggerRef]);

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        visibility: pos.visibility,
        zIndex: 9999,
        backgroundColor: '#1D1E1E',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '4px',
        boxShadow: '0px 4px 16px rgba(0,0,0,0.40)',
        minWidth: '100px',
      }}
    >
      {(PARAM_OPTIONS[field] || []).map((opt) => (
        <div
          key={opt}
          onMouseDown={(e) => { e.preventDefault(); onChange(opt); onClose(); }}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            lineHeight: '18px',
            color: opt === value ? '#FFFFFF' : 'rgba(255,255,255,0.60)',
            backgroundColor: opt === value ? '#161616' : 'transparent',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
          }}
          onMouseEnter={(e) => { if (opt !== value) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={(e) => { if (opt !== value) e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          {opt}
        </div>
      ))}
    </div>,
    document.body
  );
}

// ─── 可编辑文本 ───────────────────────────────────────────────────────────────

function EditableText({ value, onChange, placeholder = '点击编辑…', style = {} }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const taRef = useRef(null);

  useEffect(() => { setDraft(value); }, [value]);

  function activate() { setEditing(true); setDraft(value); }

  function commit() {
    setEditing(false);
    if (draft !== value) onChange(draft);
  }

  if (editing) {
    return (
      <textarea
        ref={taRef}
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Escape') { setEditing(false); setDraft(value); } }}
        style={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          resize: 'none',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(45,195,225,0.60)',
          borderRadius: '4px',
          padding: '4px 6px',
          fontSize: '14px',
          lineHeight: '20px',
          color: 'rgba(255,255,255,0.80)',
          outline: 'none',
          fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
          boxSizing: 'border-box',
          ...style,
        }}
      />
    );
  }

  return (
    <div
      onClick={activate}
      style={{
        flex: 1,
        minHeight: 0,
        fontSize: '14px',
        lineHeight: '20px',
        color: value ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.30)',
        cursor: 'text',
        wordBreak: 'break-all',
        overflowY: 'auto',
        fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
        ...style,
      }}
    >
      {value || placeholder}
    </div>
  );
}

// ─── 角色 @ 下拉 ──────────────────────────────────────────────────────────────

function CharMentionDropdown({ chars, query, onSelect, onClose, triggerRef }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, visibility: 'hidden' });
  const filtered = chars.filter((c) => c.name.includes(query));

  // Position above the textarea after every render
  useEffect(() => {
    if (!triggerRef?.current || !ref.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuH = ref.current.offsetHeight;
    setPos((prev) => {
      const next = { top: rect.top - menuH - 4, left: rect.left, width: rect.width, visibility: 'visible' };
      if (prev.top === next.top && prev.left === next.left && prev.visibility === 'visible') return prev;
      return next;
    });
  });

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  if (filtered.length === 0) return null;

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        minWidth: Math.max(pos.width, 120),
        visibility: pos.visibility,
        zIndex: 9999,
        backgroundColor: '#1D1E1E',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '4px',
        boxShadow: '0px 4px 16px rgba(0,0,0,0.40)',
        maxHeight: '160px',
        overflowY: 'auto',
      }}
    >
      {filtered.map((c) => (
        <div
          key={c.id}
          onMouseDown={(e) => { e.preventDefault(); onSelect(c.name); }}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            lineHeight: '18px',
            color: 'rgba(255,255,255,0.80)',
            cursor: 'pointer',
            fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          {c.name}
        </div>
      ))}
    </div>,
    document.body
  );
}

// ─── 主体 @ 下拉（角色/场景/道具，用于提示词输入框）─────────────────────────────

const SUBJECT_TYPE_LABEL = { char: '角色', scene: '场景', prop: '道具' };
const SUBJECT_TYPE_COLOR = { char: '#E2E24B', scene: '#4BE2C3', prop: '#E28B4B' };

function SubjectMentionDropdown({ chars, scenes, props, query, onSelect, onClose, triggerRef }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, visibility: 'hidden' });

  const allItems = [
    ...chars.map((c) => ({ ...c, _type: 'char' })),
    ...scenes.map((s) => ({ ...s, _type: 'scene' })),
    ...props.map((p) => ({ ...p, _type: 'prop' })),
  ].filter((item) => item.name.includes(query));

  useEffect(() => {
    if (!triggerRef?.current || !ref.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuH = ref.current.offsetHeight;
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceAbove >= menuH + 4 ? rect.top - menuH - 4 : rect.bottom + 4;
    setPos((prev) => {
      const next = { top, left: rect.left, width: rect.width, visibility: 'visible' };
      if (prev.top === next.top && prev.left === next.left && prev.visibility === 'visible') return prev;
      return next;
    });
  });

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  if (allItems.length === 0) return null;

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        minWidth: Math.max(pos.width, 160),
        visibility: pos.visibility,
        zIndex: 9999,
        backgroundColor: '#1D1E1E',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '4px',
        boxShadow: '0px 4px 16px rgba(0,0,0,0.40)',
        maxHeight: '200px',
        overflowY: 'auto',
      }}
    >
      {allItems.map((item) => (
        <div
          key={`${item._type}-${item.id}`}
          onMouseDown={(e) => { e.preventDefault(); onSelect(item.name); }}
          style={{
            padding: '7px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            lineHeight: '18px',
            color: 'rgba(255,255,255,0.80)',
            cursor: 'pointer',
            fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <span style={{
            fontSize: '11px',
            lineHeight: '16px',
            padding: '0 5px',
            borderRadius: '3px',
            backgroundColor: `${SUBJECT_TYPE_COLOR[item._type]}22`,
            color: SUBJECT_TYPE_COLOR[item._type],
            flexShrink: 0,
            fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
          }}>
            {SUBJECT_TYPE_LABEL[item._type]}
          </span>
          {item.name}
        </div>
      ))}
    </div>,
    document.body
  );
}

// ─── 主体 Tag（提示词展示用）─────────────────────────────────────────────────────

function SubjectTag({ name, type }) {
  const color = SUBJECT_TYPE_COLOR[type] ?? '#E2E24B';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        paddingInline: '4px',
        borderRadius: '4px',
        fontSize: '14px',
        lineHeight: '21px',
        backgroundColor: `${color}26`,
        color,
        boxShadow: `inset 0 0 0 1px ${color}33`,
        fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
        flexShrink: 0,
        verticalAlign: 'middle',
      }}
    >
      {name}
    </span>
  );
}

// ─── 角色替换下拉（点击 label 后弹出）────────────────────────────────────────

function CharReplaceDropdown({ chars, current, onSelect, onClose, triggerRef }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, visibility: 'hidden' });

  useEffect(() => {
    if (!triggerRef?.current || !ref.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuH = ref.current.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow >= menuH + 4 ? rect.bottom + 4 : rect.top - menuH - 4;
    setPos((prev) => {
      const next = { top, left: rect.left, visibility: 'visible' };
      if (prev.top === next.top && prev.left === next.left && prev.visibility === 'visible') return prev;
      return next;
    });
  });

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target) && triggerRef?.current && !triggerRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose, triggerRef]);

  if (chars.length === 0) return null;

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        visibility: pos.visibility,
        zIndex: 9999,
        backgroundColor: '#1D1E1E',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '4px',
        boxShadow: '0px 4px 16px rgba(0,0,0,0.40)',
        minWidth: '100px',
        maxHeight: '160px',
        overflowY: 'auto',
      }}
    >
      {chars.map((c) => (
        <div
          key={c.id}
          onMouseDown={(e) => { e.preventDefault(); onSelect(c.name); }}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            lineHeight: '18px',
            color: c.name === current ? '#FFFFFF' : 'rgba(255,255,255,0.60)',
            backgroundColor: c.name === current ? 'rgba(255,255,255,0.08)' : 'transparent',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
          }}
          onMouseEnter={(e) => { if (c.name !== current) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={(e) => { if (c.name !== current) e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          {c.name}
        </div>
      ))}
    </div>,
    document.body
  );
}

// ─── 角色 Tag ─────────────────────────────────────────────────────────────────

function CharTag({ name, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        paddingInline: '4px',
        borderRadius: '4px',
        fontSize: '14px',
        lineHeight: '18px',
        backgroundColor: hov ? 'rgba(226,226,75,0.25)' : 'rgba(226,226,75,0.15)',
        color: '#E2E24B',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
        fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.12s',
      }}
    >
      {name}
    </span>
  );
}

// ─── 通用虚线添加格 ───────────────────────────────────────────────────────────

function AddSlotBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        backgroundColor: pressed ? 'rgba(255,255,255,0.08)' : hov ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px dashed ${hov ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.12)'}`,
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background-color 0.12s, border-color 0.12s',
      }}
    >
      <IconPlus color={hov ? 'rgba(255,255,255,0.70)' : undefined} />
    </div>
  );
}

// ─── 旁白配音列 ───────────────────────────────────────────────────────────────

function NarrationCol({ segments, onChange, chars }) {
  const [editing, setEditing] = useState(false);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [replacingIdx, setReplacingIdx] = useState(null);
  const editorRef = useRef(null);
  const wrapRef = useRef(null);
  const labelRefs = useRef({});
  const composingRef = useRef(false);
  const suppressSyncRef = useRef(false);

  // chars 作为 allSubjects（只有 char 类型）
  const charSubjects = chars.map((c) => ({ ...c, _type: 'char' }));

  function segmentsToText(segs) {
    return segs.map((s) => (s.type === 'char' ? `@${s.value}` : s.value)).join('');
  }

  function textToSegments(text) {
    const parts = text.split(/(@[一-龥a-zA-Z0-9_]+)/g);
    return parts
      .filter((p) => p.length > 0)
      .map((p) => {
        if (p.startsWith('@')) return { type: 'char', value: p.slice(1) };
        return { type: 'text', value: p };
      });
  }

  function getCurrentText() {
    const el = editorRef.current;
    return el ? serializeEditor(el) : '';
  }

  function activate() {
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    setMentionQuery(null);
    const text = getCurrentText();
    onChange(textToSegments(text));
  }

  // 编辑态挂载后初始化 DOM
  useEffect(() => {
    if (editing && editorRef.current) {
      const initText = segmentsToText(segments);
      rebuildEditorDOM(editorRef.current, initText, charSubjects);
      setCaretOffset(editorRef.current, initText.length);
      editorRef.current.focus();
    }
  }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

  // 原生 beforeinput：阻止在 mention span 内输入
  useEffect(() => {
    if (!editing) return;
    const el = editorRef.current;
    if (!el) return;
    function nativeBeforeInput(e) {
      if (composingRef.current) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      for (const node of el.childNodes) {
        if (!node.dataset?.mention) continue;
        const nodeRange = document.createRange();
        nodeRange.selectNode(node);
        if (
          range.compareBoundaryPoints(Range.START_TO_END, nodeRange) > 0 &&
          range.compareBoundaryPoints(Range.END_TO_START, nodeRange) < 0
        ) {
          e.preventDefault();
          return;
        }
      }
    }
    el.addEventListener('beforeinput', nativeBeforeInput);
    return () => el.removeEventListener('beforeinput', nativeBeforeInput);
  }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

  function syncToValue(el) {
    if (suppressSyncRef.current) { suppressSyncRef.current = false; return; }
    const caretOffset = getCaretOffset(el);
    const raw = serializeEditor(el);
    rebuildEditorDOM(el, raw, charSubjects);
    setCaretOffset(el, caretOffset);
    const textBefore = raw.slice(0, caretOffset);
    const atIdx = textBefore.lastIndexOf('@');
    if (atIdx !== -1) {
      const fragment = textBefore.slice(atIdx + 1);
      if (!fragment.includes(' ') && !fragment.includes('\n')) {
        setMentionQuery(fragment);
        return;
      }
    }
    setMentionQuery(null);
  }

  function handleInput() {
    if (composingRef.current) return;
    const el = editorRef.current;
    if (el) syncToValue(el);
  }

  function handleCompositionStart() { composingRef.current = true; }
  function handleCompositionEnd() {
    composingRef.current = false;
    const el = editorRef.current;
    if (el) syncToValue(el);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') { commit(); return; }
    const el = editorRef.current;
    if (!el) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    if (e.key === 'Backspace' || e.key === 'Delete') {
      for (const node of el.childNodes) {
        if (!node.dataset?.mention) continue;
        const nodeRange = document.createRange();
        nodeRange.selectNode(node);
        const collapsed = range.collapsed;

        if (collapsed && e.key === 'Backspace') {
          const afterRange = document.createRange();
          afterRange.setStartAfter(node);
          afterRange.collapse(true);
          if (range.compareBoundaryPoints(Range.START_TO_START, afterRange) === 0) {
            e.preventDefault();
            const caretOffset = getCaretOffset(el) - (node.dataset.mention.length + 1);
            node.remove();
            const raw = serializeEditor(el);
            rebuildEditorDOM(el, raw, charSubjects);
            setCaretOffset(el, Math.max(0, caretOffset));
            setMentionQuery(null);
            return;
          }
        }
        if (collapsed && e.key === 'Delete') {
          const beforeRange = document.createRange();
          beforeRange.setStartBefore(node);
          beforeRange.collapse(true);
          if (range.compareBoundaryPoints(Range.START_TO_START, beforeRange) === 0) {
            e.preventDefault();
            const caretOffset = getCaretOffset(el);
            node.remove();
            const raw = serializeEditor(el);
            rebuildEditorDOM(el, raw, charSubjects);
            setCaretOffset(el, caretOffset);
            setMentionQuery(null);
            return;
          }
        }
        if (!collapsed) {
          const inside =
            range.compareBoundaryPoints(Range.START_TO_END, nodeRange) > 0 &&
            range.compareBoundaryPoints(Range.END_TO_START, nodeRange) < 0;
          if (inside) {
            e.preventDefault();
            const caretOffset = getCaretOffset(el);
            range.deleteContents();
            const raw = serializeEditor(el);
            rebuildEditorDOM(el, raw, charSubjects);
            setCaretOffset(el, Math.max(0, caretOffset));
            setMentionQuery(null);
            return;
          }
        }
      }
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      for (const node of el.childNodes) {
        if (!node.dataset?.mention) continue;
        if (e.key === 'ArrowLeft') {
          const afterRange = document.createRange();
          afterRange.setStartAfter(node);
          afterRange.collapse(true);
          if (range.collapsed && range.compareBoundaryPoints(Range.START_TO_START, afterRange) === 0) {
            e.preventDefault();
            const r = document.createRange();
            r.setStartBefore(node);
            r.collapse(true);
            sel.removeAllRanges();
            sel.addRange(r);
            return;
          }
        } else {
          const beforeRange = document.createRange();
          beforeRange.setStartBefore(node);
          beforeRange.collapse(true);
          if (range.collapsed && range.compareBoundaryPoints(Range.START_TO_START, beforeRange) === 0) {
            e.preventDefault();
            const r = document.createRange();
            r.setStartAfter(node);
            r.collapse(true);
            sel.removeAllRanges();
            sel.addRange(r);
            return;
          }
        }
      }
    }
  }

  function insertChar(name) {
    const el = editorRef.current;
    if (!el) return;
    const caretOffset = getCaretOffset(el);
    const raw = serializeEditor(el);
    const textBefore = raw.slice(0, caretOffset);
    const atIdx = textBefore.lastIndexOf('@');
    const before = raw.slice(0, atIdx);
    const after = raw.slice(caretOffset);
    const newVal = `${before}@${name} ${after}`;
    setMentionQuery(null);
    suppressSyncRef.current = true;
    requestAnimationFrame(() => {
      if (!editorRef.current) return;
      rebuildEditorDOM(editorRef.current, newVal, charSubjects);
      setCaretOffset(editorRef.current, atIdx + name.length + 2);
    });
  }

  function replaceChar(segIdx, newName) {
    const next = segments.map((s, i) =>
      i === segIdx ? { type: 'char', value: newName } : s
    );
    onChange(next);
    setReplacingIdx(null);
  }

  const hasContent = segments.length > 0 && segments.some((s) => s.value.trim());

  if (editing) {
    return (
      <div ref={wrapRef} style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {mentionQuery !== null && (
          <CharMentionDropdown
            chars={chars}
            query={mentionQuery}
            onSelect={insertChar}
            onClose={() => setMentionQuery(null)}
            triggerRef={wrapRef}
          />
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={commit}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          data-placeholder="输入台词，@ 指定角色…"
          style={{
            width: '100%',
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(45,195,225,0.60)',
            borderRadius: '4px',
            padding: '4px 6px',
            fontSize: '14px',
            lineHeight: '20px',
            color: 'rgba(255,255,255,0.80)',
            caretColor: 'rgba(255,255,255,0.80)',
            outline: 'none',
            fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
            minHeight: '44px',
            boxSizing: 'border-box',
            wordBreak: 'break-all',
            whiteSpace: 'pre-wrap',
            overflowY: 'auto',
          }}
          className="[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-[rgba(255,255,255,0.30)] [&:empty]:before:pointer-events-none"
        />
      </div>
    );
  }

  if (!hasContent) {
    return (
      <AddSlotBtn onClick={activate} />
    );
  }

  return (
    <div
      onClick={activate}
      style={{
        flex: 1,
        fontSize: '14px',
        lineHeight: '20px',
        fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
        cursor: 'text',
        wordBreak: 'break-all',
        overflowY: 'auto',
        minHeight: 0,
      }}
    >
      {segments.map((seg, i) =>
        seg.type === 'char' ? (
          <span key={i} ref={(el) => { labelRefs.current[i] = el; }} style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}>
            <CharTag
              name={seg.value}
              onClick={(e) => { e.stopPropagation(); setReplacingIdx(replacingIdx === i ? null : i); }}
            />
            {replacingIdx === i && (
              <CharReplaceDropdown
                chars={chars}
                current={seg.value}
                onSelect={(name) => replaceChar(i, name)}
                onClose={() => setReplacingIdx(null)}
                triggerRef={{ current: labelRefs.current[i] }}
              />
            )}
          </span>
        ) : (
          <span key={i} style={{ color: 'rgba(255,255,255,0.80)' }}>{seg.value}</span>
        )
      )}
    </div>
  );
}

// ─── 资产库选择弹窗（复用自主体页）─────────────────────────────────────────────

function AssetPickerModal({ open, onClose, onConfirm, assets = [] }) {
  const [selected, setSelected] = useState(new Set());
  const [starOnly, setStarOnly] = useState(false);
  const [closeHovered, setCloseHovered] = useState(false);
  const [cancelHovered, setCancelHovered] = useState(false);
  const [cancelPressed, setCancelPressed] = useState(false);
  const [confirmHovered, setConfirmHovered] = useState(false);
  const [confirmPressed, setConfirmPressed] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

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

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        style={{ width: '800px', height: '600px', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: '#161616', flexShrink: 0 }}>
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

        {/* toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 24px', gap: '12px', justifyContent: 'space-between', background: '#161616', flexShrink: 0 }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}
            onClick={() => setStarOnly((v) => !v)}
          >
            <div style={{ position: 'relative', width: '14px', height: '14px', borderRadius: '3px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.2)', outline: '1px solid var(--color-stroke-outline)', background: starOnly ? 'var(--color-checkbox-bg-active)' : 'var(--color-checkbox-bg-normal)', transition: 'background 100ms' }}>
              {starOnly && (
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%' }}>
                  <path d="M3.333 8L6.667 11.333L13.333 4.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{ fontFamily: FONT, fontSize: '13px', lineHeight: '18px', color: '#FFFFFF66', whiteSpace: 'nowrap' }}>仅显示星标资产</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', height: '36px', width: '232px', paddingLeft: '12px', paddingRight: '6px', borderRadius: '8px', justifyContent: 'space-between', flexShrink: 0, background: searchFocused ? 'rgba(45,195,225,0.04)' : '#1D1E1E', border: `1px solid ${searchFocused ? 'rgba(45,195,225,0.6)' : 'rgba(255,255,255,0.08)'}`, outline: searchFocused ? '3px solid rgba(45,195,225,0.08)' : '1px solid #00000080', transition: 'border-color 120ms, background 120ms' }}>
            <input
              placeholder="搜索资产"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF', caretColor: '#2DC3E1' }}
              className="placeholder:text-[rgba(255,255,255,0.4)]"
            />
            <div style={{ display: 'flex', alignItems: 'center', height: '24px', borderRadius: '6px', padding: '0 8px', gap: '4px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M7 12.667C10.13 12.667 12.667 10.13 12.667 7C12.667 3.87 10.13 1.333 7 1.333C3.87 1.333 1.333 3.87 1.333 7C1.333 10.13 3.87 12.667 7 12.667Z" stroke={searchFocused ? '#FFFFFF' : '#FFFFFF99'} strokeLinejoin="round" />
                <path d="M11.074 11.074L13.902 13.902" stroke={searchFocused ? '#FFFFFF' : '#FFFFFF99'} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* grid / empty state */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#161616' }}>
          {assets.length === 0 ? (
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
          ) : (
            Array.from({ length: Math.ceil(assets.length / 4) }, (_, rowIdx) => (
              <div key={rowIdx} style={{ display: 'flex', gap: '12px' }}>
                {assets.slice(rowIdx * 4, rowIdx * 4 + 4).map((asset) => {
                  const isSelected = selected.has(asset.id);
                  const isHovered = hoveredCard === asset.id;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => toggle(asset.id)}
                      onMouseEnter={() => setHoveredCard(asset.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{ flex: 1, height: '124px', borderRadius: '8px', overflow: 'hidden', position: 'relative', cursor: 'pointer', border: `1px solid ${isSelected ? '#2EC2E1' : isHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}`, transition: 'border-color 100ms' }}
                    >
                      <div style={{ backgroundImage: `url(${asset.url})`, backgroundSize: 'cover', backgroundPosition: '50%', width: '100%', height: '100%', transition: 'opacity 100ms', opacity: isHovered && !isSelected ? 0.85 : 1 }} />
                      <div style={{ position: 'absolute', top: '6px', right: '6px', padding: '2px' }}>
                        <div style={{ position: 'relative', width: '14px', height: '14px', borderRadius: '3px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.2)', outline: '1px solid var(--color-stroke-outline)', background: isSelected ? 'var(--color-checkbox-bg-active)' : 'var(--color-checkbox-bg-normal)', transition: 'background 100ms' }}>
                          {isSelected && (
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%' }}>
                              <path d="M3.333 8L6.667 11.333L13.333 4.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-end', padding: '16px 24px', background: '#161616', flexShrink: 0, borderRadius: '0 0 16px 16px' }}>
          <button
            type="button"
            onClick={onClose}
            onMouseEnter={() => setCancelHovered(true)}
            onMouseLeave={() => { setCancelHovered(false); setCancelPressed(false); }}
            onMouseDown={() => setCancelPressed(true)}
            onMouseUp={() => setCancelHovered(true)}
            style={{ display: 'flex', alignItems: 'center', height: '36px', borderRadius: '8px', padding: '0 16px', cursor: 'pointer', background: cancelPressed ? '#1A1A1A' : cancelHovered ? '#1D1D1D' : '#161616', border: '1px solid rgba(255,255,255,0.05)', outline: '1px solid #00000080', boxShadow: 'rgba(0,0,0,0.4) 3px 3px 8px', transition: 'background 100ms' }}
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
            style={{ display: 'flex', flexDirection: 'column', height: '36px', borderRadius: '8px', outline: '1px solid #00000080', boxShadow: 'rgba(0,0,0,0.4) 3px 3px 8px', padding: '1px', backgroundImage: 'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 30%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.08))', cursor: 'pointer', border: 'none', transition: 'opacity 100ms', opacity: confirmPressed ? 0.75 : 1 }}
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

// ─── 主体参考列 ───────────────────────────────────────────────────────────────

function MainRefCol({ refs, onChange, chars }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [pendingSlot, setPendingSlot] = useState(null);

  function handleDelete(idx) {
    onChange(refs.filter((_, i) => i !== idx));
  }

  function handleAssetConfirm(ids) {
    // ids are asset IDs — URL resolution handled by data layer when integrated
  }

  const slots = [0, 1, 2, 3];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '92px', flexShrink: 0 }}>
      <AssetPickerModal
        open={assetPickerOpen}
        onClose={() => setAssetPickerOpen(false)}
        onConfirm={handleAssetConfirm}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {[0, 1].map((row) => (
          <div key={row} style={{ display: 'flex', gap: '4px' }}>
            {[0, 1].map((col) => {
              const idx = row * 2 + col;
              const img = refs[idx];
              const isOverflow = refs.length >= 4 && idx === 3;

              if (isOverflow) {
                return (
                  <div
                    key={idx}
                    onClick={() => setModalOpen(true)}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '4px',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      flexShrink: 0,
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <img src={refs[3].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundColor: 'rgba(0,0,0,0.50)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 700, fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif' }}>
                        {refs.length > 4 ? `${refs.length - 3}+` : `${refs.length}+`}
                      </span>
                    </div>
                  </div>
                );
              }

              if (img) {
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '4px',
                      position: 'relative',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: hoveredIdx === idx ? '1px solid #2DC3E1' : '1px solid rgba(255,255,255,0.06)',
                      transition: 'border-color 150ms',
                    }}
                  >
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {hoveredIdx === idx && (
                      <div
                        onClick={() => handleDelete(idx)}
                        style={{
                          position: 'absolute', top: '2px', right: '2px',
                          width: '16px', height: '16px',
                          backgroundColor: 'rgba(0,0,0,0.70)',
                          borderRadius: '3px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 2L8 8M8 2L2 8" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                );
              }

              if (idx === refs.length && refs.length < 4) {
                return (
                  <AddSlotBtn
                    key={idx}
                    onClick={() => setAssetPickerOpen(true)}
                  />
                );
              }

              return null;
            })}
          </div>
        ))}
      </div>

      {modalOpen && (
        <MainRefModal
          refs={refs}
          onChange={onChange}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

// ─── 主体参考弹窗 ─────────────────────────────────────────────────────────────

function MainRefModal({ refs, onChange, onClose }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);

  function handleAssetConfirm(ids) {
    // ids are asset IDs — URL resolution handled by data layer when integrated
  }

  function handleDelete(idx) {
    onChange(refs.filter((_, i) => i !== idx));
  }

  return (
    <>
      <AssetPickerModal
        open={assetPickerOpen}
        onClose={() => setAssetPickerOpen(false)}
        onConfirm={handleAssetConfirm}
      />
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          backgroundColor: 'rgba(0,0,0,0.50)',
          backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onClick={onClose}
      >
        <div
          style={{
            width: '800px',
            maxHeight: '600px',
            backgroundColor: '#161616',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px' }}>
            <span style={{ fontSize: '16px', fontWeight: 500, color: '#FFFFFF', fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif' }}>
              主体参考
            </span>
            <div onClick={onClose} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
              <IconClose />
            </div>
          </div>

          {/* content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 16px' }}>
            {refs.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'rgba(255,255,255,0.30)', fontSize: '14px', fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif' }}>
                暂无图片
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {refs.map((img, idx) => (
                  <div
                    key={img.id}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{
                      width: '160px',
                      height: '120px',
                      borderRadius: '8px',
                      position: 'relative',
                      overflow: 'hidden',
                      border: hoveredIdx === idx ? '1px solid #2DC3E1' : '1px solid rgba(255,255,255,0.06)',
                      transition: 'border-color 150ms',
                    }}
                  >
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {hoveredIdx === idx && (
                      <div
                        onClick={() => handleDelete(idx)}
                        style={{
                          position: 'absolute', top: '6px', right: '6px',
                          width: '24px', height: '24px',
                          backgroundColor: 'rgba(0,0,0,0.70)',
                          borderRadius: '4px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <IconClose />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px 20px' }}>
            <div
              onClick={() => setAssetPickerOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '36px',
                paddingInline: '16px',
                gap: '4px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.12)',
                backgroundColor: 'rgba(255,255,255,0.04)',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.80)',
                fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
              }}
            >
              从资产库添加
            </div>
            <div
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '36px',
                paddingInline: '16px',
                borderRadius: '8px',
                backgroundColor: '#2DC3E1',
                border: '1px solid #FFFFFF33',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#090909',
                fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
              }}
            >
              完成
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── 媒体列（分镜图 / 分镜视频）────────────────────────────────────────────────

function MediaViewModal({ url, onClose }) {
  const [closeHov, setCloseHov] = useState(false);
  const [doneHov, setDoneHov] = useState(false);
  const [donePressed, setDonePressed] = useState(false);
  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        style={{ display: 'flex', flexDirection: 'column', width: '800px', height: '600px', borderRadius: '16px', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: '#161616', borderRadius: '16px 16px 0 0', flexShrink: 0 }}>
          <span style={{ fontFamily: FONT_MEDIUM, fontSize: '16px', lineHeight: '20px', color: '#FFFFFF' }}>查看</span>
          <div
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '6px', background: closeHov ? '#FFFFFF14' : 'transparent', transition: 'background 120ms' }}
            onClick={onClose}
            onMouseEnter={() => setCloseHov(true)}
            onMouseLeave={() => setCloseHov(false)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke={closeHov ? '#FFFFFF' : '#FFFFFFCC'} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        {/* image area */}
        <div style={{ flex: 1, display: 'flex', padding: '8px 24px', overflow: 'hidden', flexDirection: 'column', background: '#161616', minHeight: 0 }}>
          <img src={url} alt="" style={{ width: '100%', flex: 1, borderRadius: '8px', objectFit: 'contain', minHeight: 0 }} />
        </div>
        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', background: '#161616', borderRadius: '0 0 16px 16px', padding: '16px 24px', flexShrink: 0 }}>
          <div
            style={{ display: 'flex', flexDirection: 'column', height: '36px', flexShrink: 0, borderRadius: '8px', padding: '1px', backgroundImage: doneHov ? 'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 45%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, #FFFFFF1E, #FFFFFF1E)' : 'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 30%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, #FFFFFF14, #FFFFFF14)', boxShadow: '#00000066 3px 3px 8px', outline: '1px solid #00000080', cursor: 'pointer', transition: 'background-image 0.15s' }}
            onClick={onClose}
            onMouseEnter={() => setDoneHov(true)}
            onMouseLeave={() => { setDoneHov(false); setDonePressed(false); }}
            onMouseDown={() => setDonePressed(true)}
            onMouseUp={() => setDonePressed(false)}
          >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, alignSelf: 'stretch', borderRadius: '7px', gap: '4px', paddingInline: '15px', backgroundColor: donePressed ? '#222222' : doneHov ? '#1C1C1C' : '#161616', transition: 'background-color 0.1s' }}>
              <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF' }}>完成</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function MediaIconBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '24px', height: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '4px',
        backgroundColor: hov ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.50)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background-color 0.10s',
      }}
    >
      {children}
    </div>
  );
}

function MediaCol({ media, onUpload, accept, isVideo, label, onAIGenerate, shotMeta }) {
  const [hovered, setHovered] = useState(false);
  const [viewUrl, setViewUrl] = useState(null);
  const [viewerShot, setViewerShot] = useState(null);
  const fileInputRef = useRef(null);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUpload({ id: url, url, name: file.name, type: file.type });
    e.target.value = '';
  }

  const isEmpty = !media;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignSelf: 'stretch', flex: 1 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => { if (!isEmpty) onAIGenerate?.(); }}
        style={{
          flex: 1,
          minHeight: 0,
          alignSelf: 'stretch',
          borderRadius: '6px',
          position: 'relative',
          overflow: 'hidden',
          cursor: isEmpty ? 'default' : 'pointer',
          ...(isEmpty ? {
            backgroundColor: '#1D1E1E',
            border: '1px dashed rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          } : {
            border: `1px solid ${hovered ? 'rgba(45,195,225,0.50)' : 'rgba(255,255,255,0.06)'}`,
            transition: 'border-color 150ms',
          }),
        }}
      >
        {/* 有内容时展示 */}
        {!isEmpty && (
          isVideo ? (
            <video
              src={media.url}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              muted
              playsInline
            />
          ) : (
            <img src={media.url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          )
        )}

        {/* 有内容时 hover 右下角操作按钮 */}
        {!isEmpty && hovered && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '6px 6px',
            backgroundImage: 'linear-gradient(in oklab 0deg, oklab(0% 0 0 / 60%) 0%, oklab(0% 0 0 / 0%) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px',
          }}>
            <MediaIconBtn onClick={(e) => { e.stopPropagation(); if (media?.url) {
              if (isVideo) {
                setViewerShot({ videoUrl: media.url, filename: media.name, label: shotMeta?.label, prompt: shotMeta?.prompt, model: shotMeta?.model, resolution: shotMeta?.resolution, duration: shotMeta?.duration, aspectRatio: shotMeta?.aspectRatio, finalized: shotMeta?.finalized });
              } else {
                setViewUrl(media.url);
              }
            }; }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.333 2H2.667C2.298 2 2 2.298 2 2.667V5.333" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.333 14H2.667C2.298 14 2 13.701 2 13.333V10.667" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.667 14H13.333C13.701 14 14 13.701 14 13.333V10.667" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.667 2H13.333C13.701 2 14 2.298 14 2.667V5.333" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </MediaIconBtn>
            <MediaIconBtn onClick={(e) => { e.stopPropagation(); if (media?.url) { const a = document.createElement('a'); a.href = media.url; a.download = media.name || 'download'; a.click(); } }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2.667V10" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.333 7.333L8 10L10.667 7.333" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.667 12H13.333" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </MediaIconBtn>
          </div>
        )}

        {/* 空状态默认图标 */}
        {isEmpty && !hovered && (
          <div style={{
            width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {isVideo ? <IconVideoPlaceholder /> : <IconImagePlaceholder />}
          </div>
        )}

        {/* hover 时弹出按钮（仅空白虚线区域） */}
        {isEmpty && hovered && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div
              onMouseDown={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '24px',
                paddingInline: '6px',
                borderRadius: '6px',
                backgroundColor: '#161616',
                border: '1px solid rgba(255,255,255,0.08)',
                outline: '1px solid rgba(0,0,0,0.50)',
                cursor: 'pointer',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.60)',
                fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
                animation: 'slideUpBounce 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                animationDelay: '50ms',
                opacity: 0,
              }}
            >
              本地上传
            </div>
            <div
              onMouseDown={(e) => { e.stopPropagation(); onAIGenerate?.(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '24px',
                width: '62px',
                borderRadius: '6px',
                backgroundColor: '#2DC3E1',
                border: '1px solid #FFFFFF33',
                outline: '1px solid rgba(0,0,0,0.50)',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#090909',
                fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
                animation: 'slideUpBounce 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                animationDelay: '0ms',
                opacity: 0,
              }}
            >
              AI生成
            </div>
          </div>
        )}
      </div>
      {viewUrl && <MediaViewModal url={viewUrl} onClose={() => setViewUrl(null)} />}
      {viewerShot && <ShotViewerModal shot={viewerShot} onClose={() => setViewerShot(null)} />}
    </div>
  );
}

// ─── 镜头编号列 ───────────────────────────────────────────────────────────────

const NUMBER_BTNS = [
  { key: 'drag', icon: <IconDrag />, label: '拖拽移动卡片顺序' },
  { key: 'add', icon: <IconAdd />, label: '下方添加空分镜' },
  { key: 'copy', icon: <IconCopy />, label: '复制当前分镜' },
  { key: 'delete', icon: <IconDelete />, label: '删除分镜' },
];

function CardActionBtn({ btn, index, onAdd, onCopy, onDeleteRequest, onDragStart }) {
  const [hov, setHov] = useState(false);
  const [tooltipPos, setTooltipPos] = useState(null);
  const btnRef = useRef(null);

  function handleMouseEnter() {
    setHov(true);
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 6 });
    }
  }

  function handleMouseLeave() {
    setHov(false);
    setTooltipPos(null);
  }

  return (
    <>
      <div
        ref={btnRef}
        draggable={btn.key === 'drag'}
        onDragStart={btn.key === 'drag' ? onDragStart : undefined}
        onClick={() => {
          if (btn.key === 'add') onAdd?.();
          if (btn.key === 'copy') onCopy?.();
          if (btn.key === 'delete') onDeleteRequest?.();
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          cursor: btn.key === 'drag' ? 'grab' : 'pointer',
          backgroundColor: hov ? 'rgba(255,255,255,0.08)' : 'transparent',
          animation: 'slideDownBounce 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          animationDelay: `${index * 50}ms`,
          opacity: 0,
          transition: 'background-color 0.10s',
        }}
      >
        {btn.icon}
      </div>
      {hov && tooltipPos && createPortal(
        <div
          style={{
            position: 'fixed',
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: 'translateY(-50%)',
            zIndex: 9999,
            pointerEvents: 'none',
            backgroundColor: '#090909',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '4px',
            padding: '5px 8px',
            fontSize: '12px',
            lineHeight: '16px',
            color: 'rgba(255,255,255,0.60)',
            fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 24px var(--color-shadow)',
          }}
        >
          {btn.label}
        </div>,
        document.body
      )}
    </>
  );
}

function NumberCol({ number, isHovered, onAdd, onCopy, onDeleteRequest, onDragStart }) {
  return (
    <div
      style={{
        width: '40px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isHovered ? 'flex-start' : 'center',
        paddingTop: isHovered ? '12px' : 0,
        paddingBottom: isHovered ? '12px' : 0,
        gap: '6px',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: isHovered ? '#111111' : 'transparent',
        borderTopLeftRadius: '12px',
        borderBottomLeftRadius: '12px',
        transition: 'background-color 150ms',
        overflow: 'hidden',
      }}
    >
      {!isHovered && (
        <span style={{
          fontSize: '14px',
          fontWeight: 700,
          color: '#FFFFFF',
          fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
        }}>
          {String(number).padStart(2, '0')}
        </span>
      )}
      {isHovered && NUMBER_BTNS.map((btn, i) => (
        <CardActionBtn
          key={btn.key}
          btn={btn}
          index={i}
          onAdd={onAdd}
          onCopy={onCopy}
          onDeleteRequest={onDeleteRequest}
          onDragStart={onDragStart}
        />
      ))}
    </div>
  );
}

// ─── 画面描述列 ───────────────────────────────────────────────────────────────

function DescriptionCol({ shot, onChange }) {
  const [activeParam, setActiveParam] = useState(null);
  const triggerRefs = useRef({});

  function updateParam(field, val) {
    onChange({ ...shot, params: { ...shot.params, [field]: val } });
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
      alignSelf: 'stretch',
    }}>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.60)', fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif', flexShrink: 0 }}>
        画面描述
      </span>
      <EditableText
        value={shot.description}
        onChange={(v) => onChange({ ...shot, description: v })}
        placeholder="描述画面内容…"
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', flexShrink: 0 }}>
        {Object.entries(PARAM_LABELS).map(([field, label]) => (
          <div key={field} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span
              ref={(el) => { triggerRefs.current[field] = el; }}
              onClick={() => setActiveParam(activeParam === field ? null : field)}
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.60)',
                cursor: 'pointer',
                fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
              }}
            >
              {label}：
            </span>
            <span
              onClick={() => setActiveParam(activeParam === field ? null : field)}
              style={{
                fontSize: '12px',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
              }}
            >
              {shot.params[field] || '—'}
            </span>
            {activeParam === field && (
              <ParamSelect
                field={field}
                value={shot.params[field]}
                onChange={(v) => updateParam(field, v)}
                onClose={() => setActiveParam(null)}
                triggerRef={{ current: triggerRefs.current[field] }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 文本编辑列（光影 / 环境音）──────────────────────────────────────────────

function TextEditCol({ label, value, onChange, isLast = false }) {
  return (
    <div style={{
      width: 'calc(5.695% - 1px)',
      minWidth: '80px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      borderRight: isLast ? 'none' : '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
      alignSelf: 'stretch',
    }}>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.60)', fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif', flexShrink: 0 }}>
        {label}
      </span>
      <EditableText value={value} onChange={onChange} placeholder="点击编辑…" />
    </div>
  );
}

// ─── 旁白配音列容器 ───────────────────────────────────────────────────────────

function NarrationColWrapper({ shot, onChange, chars }) {
  return (
    <div style={{
      width: 'calc(10% - 1px)',
      minWidth: '120px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
      alignSelf: 'stretch',
    }}>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.60)', fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif', flexShrink: 0 }}>
        旁白配音
      </span>
      <NarrationCol
        segments={shot.narration.segments}
        onChange={(segs) => onChange({ ...shot, narration: { segments: segs } })}
        chars={chars}
      />
    </div>
  );
}

// ─── 主体参考列容器 ───────────────────────────────────────────────────────────

function MainRefColWrapper({ shot, onChange, chars }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      alignItems: 'flex-start',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.60)', fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif' }}>
        主体参考
      </span>
      <MainRefCol
        refs={shot.mainRefs}
        onChange={(refs) => onChange({ ...shot, mainRefs: refs })}
        chars={chars}
      />
    </div>
  );
}

// ─── 媒体列容器 ───────────────────────────────────────────────────────────────

function MediaColWrapper({ label, media, onUpload, accept, isVideo, isLast = false, onAIGenerate, shotMeta }) {
  return (
    <div style={{
      width: 'calc(15% - 1px)',
      minWidth: '160px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      borderRight: isLast ? 'none' : '1px solid rgba(255,255,255,0.08)',
      alignSelf: 'stretch',
    }}>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.60)', fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif', flexShrink: 0 }}>
        {label}
      </span>
      <MediaCol
        media={media}
        onUpload={onUpload}
        accept={accept}
        isVideo={isVideo}
        label={label}
        onAIGenerate={onAIGenerate}
        shotMeta={shotMeta}
      />
    </div>
  );
}

// ─── 分镜行 ───────────────────────────────────────────────────────────────────

function ShotRow({ shot, onChange, onAdd, onCopy, onDelete, chars, isDragging, onDragStart, onDragOver, onDrop, insertBefore, insertAfter, onGenerateImage, onGenerateVideo }) {
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      {/* insertion line above */}
      {insertBefore && (
        <div style={{ height: '2px', borderRadius: '1px', backgroundColor: '#2DC3E1', flexShrink: 0, marginBlock: '-4px', zIndex: 10 }} />
      )}
      <div
        draggable
        onDragStart={onDragStart}
        onDragOver={(e) => { e.preventDefault(); onDragOver?.(); }}
        onDrop={(e) => { e.preventDefault(); onDrop?.(); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          minHeight: '140px',
          height: '140px',
          borderRadius: '12px',
          backgroundColor: '#1D1E1E',
          border: `1px solid ${hovered ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: hovered ? 'rgba(0,0,0,0.50) 0px 0px 30px' : 'none',
          flexShrink: 0,
          transition: 'border-color 150ms, box-shadow 150ms, opacity 150ms',
          overflow: 'hidden',
          opacity: isDragging ? 0.40 : 1,
        }}
      >
        <NumberCol
          number={shot.number}
          isHovered={hovered}
          onAdd={onAdd}
          onCopy={onCopy}
          onDeleteRequest={() => setConfirmDelete(true)}
          onDragStart={onDragStart}
        />
        <DescriptionCol shot={shot} onChange={onChange} />
        <TextEditCol
          label="光影"
          value={shot.lightShadow}
          onChange={(v) => onChange({ ...shot, lightShadow: v })}
        />
        <TextEditCol
          label="环境音"
          value={shot.ambientSound}
          onChange={(v) => onChange({ ...shot, ambientSound: v })}
        />
        <NarrationColWrapper shot={shot} onChange={onChange} chars={chars} />
        <MainRefColWrapper shot={shot} onChange={onChange} chars={chars} />
        <MediaColWrapper
          label="分镜图"
          media={shot.storyboardImage}
          onUpload={(m) => onChange({ ...shot, storyboardImage: m })}
          accept=".jpg,.jpeg,.png,.webp,.gif,.bmp,.svg"
          isVideo={false}
          onAIGenerate={onGenerateImage}
        />
        <MediaColWrapper
          label="分镜视频"
          media={shot.storyboardVideo}
          onUpload={(m) => onChange({ ...shot, storyboardVideo: m })}
          accept=".mp4,.webm,.mov,.avi,.mkv"
          isVideo={true}
          isLast={true}
          onAIGenerate={onGenerateVideo}
          shotMeta={{
            label: `镜头 ${String(shot.number).padStart(2, '0')}`,
            prompt: shot.description,
            model: shot.storyboardVideo?.model ?? '—',
            resolution: shot.storyboardVideo?.resolution ?? '—',
            duration: shot.params?.duration ? parseFloat(shot.params.duration) : undefined,
            aspectRatio: '16:9',
            finalized: shot.storyboardVideo?.finalized ?? false,
          }}
        />
      </div>
      {confirmDelete && (
        <DeleteConfirmModal
          shotNumber={shot.number}
          onConfirm={() => { setConfirmDelete(false); onDelete?.(); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
      {/* insertion line below */}
      {insertAfter && (
        <div style={{ height: '2px', borderRadius: '1px', backgroundColor: '#2DC3E1', flexShrink: 0, marginBlock: '-4px', zIndex: 10 }} />
      )}
    </>
  );
}

// ─── 默认数据 ─────────────────────────────────────────────────────────────────

function makeShot(number, overrides = {}) {
  return {
    id: `shot-${number}-${Date.now()}-${Math.random()}`,
    number,
    description: '',
    params: { framing: '远景', cameraMotion: '固定', angle: '平视', composition: '三分线构图', duration: '3s' },
    lightShadow: '',
    ambientSound: '',
    narration: { segments: [] },
    mainRefs: [],
    storyboardImage: null,
    storyboardVideo: null,
    ...overrides,
  };
}

const INITIAL_SHOTS = [
  makeShot(1, {
    description: '夜晚，城市街道，霓虹灯闪烁。主角独自走在雨中，雨水打湿了他的外套，他停下脚步，抬头望向远处的高楼大厦，若有所思。',
    params: { framing: '远景', cameraMotion: '缓慢拉近', angle: '平视', composition: '三分线构图', duration: '3s' },
    lightShadow: '全局柔光，阳光穿过树叶缝隙',
    ambientSound: '微微的风声',
  }),
  makeShot(2, {
    description: '室内，咖啡馆，午后阳光斜射进来。女主角坐在窗边，手捧咖啡，目光落在窗外的行人身上，嘴角微微上扬。',
    params: { framing: '中景', cameraMotion: '固定', angle: '平视', composition: '三分线构图', duration: '3s' },
    lightShadow: '全局柔光，阳光穿过树叶缝隙',
    ambientSound: '微微的风声',
  }),
  makeShot(3, {
    description: '黄昏，公园小径，落叶飘零。两人并肩而行，偶尔对视，空气中弥漫着淡淡的暧昧与不舍。',
    params: { framing: '全景', cameraMotion: '跟随', angle: '平视', composition: '三分线构图', duration: '3s' },
    lightShadow: '黄昏暖光',
    ambientSound: '微微的风声',
  }),
];

// ─── 主页面 ───────────────────────────────────────────────────────────────────

const EPISODES = ['第一集', '第二集', '第三集', '第四集', '第五集', '第六集'];

export default function StoryboardPage({ projectName = '两只老虎的奇遇', chars = [], scenes = [], props = [], episodes = EPISODES, onUnlockStep, onVideoGenerated }) {
  const activeEpisodes = episodes.length > 0 ? episodes : EPISODES;
  const [shots, setShots] = useState(INITIAL_SHOTS);
  const [episode, setEpisode] = useState(() => activeEpisodes[0] ?? '第一集');
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [generatingVideos, setGeneratingVideos] = useState(false);
  const [toast, setToast] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  // 单镜头生成面板
  const [imagePanel, setImagePanel] = useState(null); // { shot }
  const [videoPanel, setVideoPanel] = useState(null); // { shot }

  useEffect(() => {
    if (activeEpisodes.length > 0 && !activeEpisodes.includes(episode)) {
      setEpisode(activeEpisodes[0]);
    }
  }, [activeEpisodes]);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  async function startBatchGenImages() {
    if (generatingImages) return;
    setGeneratingImages(true);
    const ids = shots.map((s) => s.id);
    for (const id of ids) {
      await new Promise((r) => setTimeout(r, 800));
      const mockUrl = `https://picsum.photos/seed/${id}/400/225`;
      setShots((prev) =>
        prev.map((s) =>
          s.id === id && !s.storyboardImage
            ? { ...s, storyboardImage: { id: mockUrl, url: mockUrl, name: 'generated.jpg', type: 'image/jpeg' } }
            : s
        )
      );
    }
    setGeneratingImages(false);
    showToast('分镜图生成完成');
  }

  async function startBatchGenVideos() {
    if (generatingVideos) return;
    setGeneratingVideos(true);
    const ids = shots.map((s) => s.id);
    for (const id of ids) {
      await new Promise((r) => setTimeout(r, 1200));
      setShots((prev) =>
        prev.map((s) =>
          s.id === id && !s.storyboardVideo
            ? { ...s, storyboardVideo: { id: `vid-${id}`, url: '', name: 'generated.mp4', type: 'video/mp4', pending: true } }
            : s
        )
      );
    }
    setGeneratingVideos(false);
    onVideoGenerated?.(activeEpisodes.indexOf(episode));
    showToast('分镜视频生成完成');
  }

  function handleBatchDownload() {
    const assets = shots.flatMap((s) => {
      const items = [];
      if (s.storyboardImage?.url) items.push({ url: s.storyboardImage.url, name: `shot-${s.number}-image.jpg` });
      if (s.storyboardVideo?.url) items.push({ url: s.storyboardVideo.url, name: `shot-${s.number}-video.mp4` });
      return items;
    });
    if (assets.length === 0) { showToast('暂无可下载的素材', 'warning'); return; }
    assets.forEach(({ url, name }) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
    showToast(`已下载 ${assets.length} 个素材`, 'success');
  }

  function handleStartEdit() {
    showToast('剪辑功能即将上线', 'warning');
  }

  useEffect(() => {
    if (shots.length > 0) onUnlockStep?.('storyboard');
  }, [shots.length]);

  function updateShot(id, next) {
    setShots((prev) => prev.map((s) => (s.id === id ? next : s)));
    // TODO: apiUpdateShot(id, next)
  }

  function addShotAfter(id) {
    setShots((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      const newShot = makeShot(0);
      const next = [...prev.slice(0, idx + 1), newShot, ...prev.slice(idx + 1)];
      // TODO: apiCreateShot(episodeId, newShot)
      return next.map((s, i) => ({ ...s, number: i + 1 }));
    });
  }

  function copyShot(id) {
    setShots((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      const copy = { ...prev[idx], id: `shot-copy-${Date.now()}` };
      const next = [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)];
      // TODO: apiCreateShot(episodeId, copy)
      return next.map((s, i) => ({ ...s, number: i + 1 }));
    });
  }

  function deleteShot(id) {
    // TODO: apiDeleteShot(id)
    setShots((prev) => {
      const next = prev.filter((s) => s.id !== id);
      return next.map((s, i) => ({ ...s, number: i + 1 }));
    });
  }

  function addNewShot() {
    setShots((prev) => {
      const newShot = makeShot(prev.length + 1);
      // TODO: apiCreateShot(episodeId, newShot)
      return [...prev, newShot];
    });
  }

  function handleDrop(targetId) {
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); return; }
    setShots((prev) => {
      const dragIdx = prev.findIndex((s) => s.id === dragId);
      if (dragIdx === -1) return prev;
      const next = [...prev];
      const [dragged] = next.splice(dragIdx, 1);
      if (targetId === '__before_first') {
        next.unshift(dragged);
      } else if (targetId === '__after_last') {
        next.push(dragged);
      } else {
        const targetIdx = next.findIndex((s) => s.id === targetId);
        if (targetIdx === -1) return prev;
        next.splice(targetIdx, 0, dragged);
      }
      return next.map((s, i) => ({ ...s, number: i + 1 }));
    });
    setDragId(null);
    setOverId(null);
  }

  return (
    <>
    <div style={{
      position: 'absolute',
      inset: 0,
      marginBottom: '24px',
      marginRight: '32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      backgroundColor: '#161616',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.08)',
      padding: '24px',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', fontFamily: FONT }}>
            {projectName}
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <path d="M5.5 3.5L9 7L5.5 10.5" stroke="#FFFFFF40" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <EpisodeSelector episodes={activeEpisodes} value={episode} onChange={setEpisode} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GhostBtn icon={<IconBatchImage />} onClick={() => setShowImageModal(true)} loading={generatingImages} disabled={generatingImages || generatingVideos}>批量生成分镜图</GhostBtn>
          <GhostBtn icon={<IconBatchVideo />} onClick={() => setShowVideoModal(true)} loading={generatingVideos} disabled={generatingImages || generatingVideos}>批量生成分镜视频</GhostBtn>
          <GhostBtn icon={<IconDownload />} onClick={() => setShowDownloadModal(true)} disabled={generatingImages || generatingVideos}>批量下载素材</GhostBtn>
          <PrimaryBtn icon={<IconEdit />} onClick={handleStartEdit}>开始剪辑</PrimaryBtn>
        </div>
      </div>

      {/* 分镜标题 + 镜头数 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        <span style={{ fontFamily: FONT_MEDIUM, fontSize: '16px', lineHeight: '20px', color: '#FFFFFF', fontWeight: 500 }}>
          分镜
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '18px', height: '16px', borderRadius: '999px', padding: '0 5px', backgroundColor: 'rgba(255,255,255,0.10)' }}>
          <span style={{ fontSize: '11px', lineHeight: '100%', color: 'rgba(255,255,255,0.60)', fontFamily: FONT }}>{shots.length}</span>
        </div>
      </div>

      {/* 分镜列表 */}
      <div
        style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}
        onDragEnd={() => { setDragId(null); setOverId(null); }}
      >
        {/* top sentinel — drop zone for placing before the first card */}
        {dragId && (
          <div
            style={{ height: '8px', flexShrink: 0, marginBottom: '-8px' }}
            onDragOver={(e) => { e.preventDefault(); setOverId('__before_first'); }}
            onDrop={(e) => { e.preventDefault(); handleDrop('__before_first'); }}
          />
        )}
        {shots.map((shot, idx) => (
          <ShotRow
            key={shot.id}
            shot={shot}
            onChange={(next) => updateShot(shot.id, next)}
            onAdd={() => addShotAfter(shot.id)}
            onCopy={() => copyShot(shot.id)}
            onDelete={() => deleteShot(shot.id)}
            chars={chars}
            isDragging={dragId === shot.id}
            insertBefore={(overId === shot.id || (overId === '__before_first' && idx === 0)) && dragId !== shot.id}
            insertAfter={overId === '__after_last' && idx === shots.length - 1 && dragId !== shot.id}
            onDragStart={() => setDragId(shot.id)}
            onDragOver={() => { if (dragId && dragId !== shot.id) setOverId(shot.id); }}
            onDrop={() => handleDrop(shot.id)}
            onGenerateImage={() => setImagePanel({ shot })}
            onGenerateVideo={() => setVideoPanel({ shot })}
          />
        ))}
        {/* bottom sentinel — drop zone for placing after the last card */}
        {dragId && (
          <div
            style={{ height: '40px', flexShrink: 0 }}
            onDragOver={(e) => { e.preventDefault(); setOverId('__after_last'); }}
            onDrop={(e) => { e.preventDefault(); handleDrop('__after_last'); }}
          />
        )}

        {/* 新增行按钮 */}
        <div
          onClick={addNewShot}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '40px',
            borderRadius: '12px',
            border: '1px dashed rgba(255,255,255,0.12)',
            cursor: 'pointer',
            flexShrink: 0,
            gap: '6px',
            color: 'rgba(255,255,255,0.40)',
            fontSize: '14px',
            fontFamily: '"Alibaba PuHuiTi 2.0", system-ui, sans-serif',
            transition: 'border-color 150ms, color 150ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.70)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.40)';
          }}
        >
          <IconPlus color="currentColor" />
          添加镜头
        </div>
      </div>
    </div>
    {showImageModal && (
      <BatchImageModal
        shotCount={shots.length}
        onClose={() => setShowImageModal(false)}
        onConfirm={() => startBatchGenImages()}
      />
    )}
    {showVideoModal && (
      <BatchVideoModal
        shotCount={shots.length}
        onClose={() => setShowVideoModal(false)}
        onConfirm={() => startBatchGenVideos()}
      />
    )}
    {showDownloadModal && (
      <BatchDownloadModal
        shots={shots}
        onClose={() => setShowDownloadModal(false)}
        onConfirm={(items) => {
          items.forEach(({ url, name }) => {
            const a = document.createElement('a');
            a.href = url;
            a.download = name;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          });
          if (items.length > 0) showToast(`已下载 ${items.length} 个素材`, 'success');
        }}
      />
    )}
    {imagePanel && (
      <GenerateImagePanel
        shot={imagePanel.shot}
        chars={chars}
        scenes={scenes}
        props={props}
        onClose={() => setImagePanel(null)}
        onGenerate={async (params) => {
          const shot = imagePanel.shot;
          // TODO: 替换为真实接口 apiGenerateImage(shot.id, params)
          // const { imageUrl } = await apiGenerateImage(shot.id, params);
          await new Promise((r) => setTimeout(r, 1000));
          const mockUrl = `https://picsum.photos/seed/${shot.id}/400/225`;
          setShots((prev) => prev.map((s) => s.id === shot.id && !s.storyboardImage
            ? { ...s, storyboardImage: { id: mockUrl, url: mockUrl, name: 'generated.jpg', type: 'image/jpeg' } }
            : s
          ));
          showToast('分镜图生成完成');
          return { url: mockUrl };
        }}
      />
    )}
    {videoPanel && (
      <GenerateVideoPanel
        shot={videoPanel.shot}
        chars={chars}
        scenes={scenes}
        props={props}
        onClose={() => setVideoPanel(null)}
        onGenerate={async (params) => {
          const shot = videoPanel.shot;
          // TODO: 替换为真实接口 apiGenerateVideo(shot.id, params)
          // const { videoUrl } = await apiGenerateVideo(shot.id, params);
          await new Promise((r) => setTimeout(r, 1200));
          const mockUrl = `https://www.w3schools.com/html/mov_bbb.mp4`;
          setShots((prev) => prev.map((s) => s.id === shot.id && !s.storyboardVideo
            ? { ...s, storyboardVideo: { id: `vid-${shot.id}`, url: mockUrl, name: 'generated.mp4', type: 'video/mp4' } }
            : s
          ));
          showToast('分镜视频生成完成');
          onVideoGenerated?.(activeEpisodes.indexOf(episode));
          return { url: mockUrl };
        }}
      />
    )}
    {toast && createPortal(
      <div style={{
        position: 'fixed',
        top: '25vh',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        pointerEvents: 'none',
        animation: 'slideUpBounce 250ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }}>
        <div className="flex items-center gap-[8px] px-[16px] py-[8px] rounded-medium bg-toast-bg backdrop-blur-[20px]" style={{ whiteSpace: 'nowrap' }}>
          {toast.type === 'success' && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M8 14.667C9.841 14.667 11.508 13.921 12.714 12.714C13.921 11.508 14.667 9.841 14.667 8C14.667 6.159 13.921 4.492 12.714 3.286C11.508 2.08 9.841 1.333 8 1.333C6.159 1.333 4.492 2.08 3.286 3.286C2.08 4.492 1.333 6.159 1.333 8C1.333 9.841 2.08 11.508 3.286 12.714C4.492 13.921 6.159 14.667 8 14.667Z" fill="#52BF92" stroke="#52BF92" strokeWidth="1.333" strokeLinejoin="round" />
              <path d="M5.333 8L7.333 10L11.333 6" stroke="#FFFFFF" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {toast.type === 'warning' && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M8 14.667C9.841 14.667 11.508 13.921 12.714 12.714C13.921 11.508 14.667 9.841 14.667 8C14.667 6.159 13.921 4.492 12.714 3.286C11.508 2.08 9.841 1.333 8 1.333C6.159 1.333 4.492 2.08 3.286 3.286C2.08 4.492 1.333 6.159 1.333 8C1.333 9.841 2.08 11.508 3.286 12.714C4.492 13.921 6.159 14.667 8 14.667Z" fill="#EB8B14" stroke="#EB8B14" strokeWidth="1.333" strokeLinejoin="round" />
              <path fillRule="evenodd" clipRule="evenodd" d="M8 12.333C8.46 12.333 8.833 11.96 8.833 11.5C8.833 11.04 8.46 10.667 8 10.667C7.54 10.667 7.167 11.04 7.167 11.5C7.167 11.96 7.54 12.333 8 12.333Z" fill="#FFFFFF" />
              <path d="M8 4V9.333" stroke="#FFFFFF" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <span className="text-text-primary text-font-size-16 font-font-weight-regular" style={{ fontFamily: FONT }}>
            {toast.msg}
          </span>
        </div>
      </div>,
      document.body
    )}
  </>
  );
}
