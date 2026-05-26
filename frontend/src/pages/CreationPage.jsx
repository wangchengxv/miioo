import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PulsingBorder } from '@paper-design/shaders-react';
import { apiGenerateCreation, apiGetCreationModels, apiGetCreationParams, apiSaveCreationAsset } from '../api/creation';
import AssetPickerModal from '../components/AssetPickerModal';

const FONT = "'AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif";
const FONT_MEDIUM = "'AlibabaPuHuiTi_2_65_Medium','Alibaba_PuHuiTi_2.0',system-ui,sans-serif";

// Matches AssetsPage StarIcon — golden fill when starred, configurable stroke otherwise
function StarIcon({ filled = false, strokeColor = '#FFFFFF' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M7 1.5l1.545 3.13 3.455.503-2.5 2.436.59 3.44L7 9.369l-3.09 1.64.59-3.44L2 5.133l3.455-.503L7 1.5z"
        fill={filled ? '#F0B429' : 'none'}
        stroke={filled ? '#F0B429' : strokeColor}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

async function downloadImage(url) {
  if (!url) return;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objUrl;
    a.download = 'creation.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objUrl);
  } catch {
    window.open(url, '_blank');
  }
}

const ALLOWED_EXTS = ['.txt', '.md', '.pdf', '.docx'];
const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif', '.heic', '.heif'];

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function truncateFileName(name) {
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex === -1) return name;
  const base = name.slice(0, dotIndex);
  const ext = name.slice(dotIndex);
  const maxBase = 12;
  if (base.length <= maxBase) return name;
  return base.slice(0, maxBase) + '… ' + ext;
}

const ROTATE_STYLE_ID = 'creation-chatbox-rotate-style';
const THINKING_STYLE_ID = 'creation-thinking-style';
const SHIMMER_STYLE_ID = 'creation-shimmer-style';

function ensureRotateKeyframe() {
  if (document.getElementById(ROTATE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = ROTATE_STYLE_ID;
  style.textContent = `
    @property --creation-chatbox-angle {
      syntax: '<angle>';
      initial-value: 161.1deg;
      inherits: false;
    }
    @keyframes creation-chatbox-spin {
      from { --creation-chatbox-angle: 161.1deg; }
      to { --creation-chatbox-angle: 521.1deg; }
    }
  `;
  document.head.appendChild(style);
}

function ensureThinkingStyle() {
  if (document.getElementById(THINKING_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = THINKING_STYLE_ID;
  style.textContent = `
    @keyframes creation-thinking-dot {
      0%, 60%, 100% { opacity: 0.2; transform: translateY(0px); }
      30% { opacity: 1; transform: translateY(-4px); }
    }
    .creation-thinking-dot { animation: creation-thinking-dot 1.4s ease-in-out infinite; }
    .creation-thinking-dot:nth-child(1) { animation-delay: 0s; }
    .creation-thinking-dot:nth-child(2) { animation-delay: 0.2s; }
    .creation-thinking-dot:nth-child(3) { animation-delay: 0.4s; }
  `;
  document.head.appendChild(style);
}

function ensureShimmerStyle() {
  if (document.getElementById(SHIMMER_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = SHIMMER_STYLE_ID;
  style.textContent = `
    @keyframes creation-shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .creation-shimmer {
      background: linear-gradient(90deg, #FFFFFF08 25%, #FFFFFF14 50%, #FFFFFF08 75%);
      background-size: 800px 100%;
      animation: creation-shimmer 1.6s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

// ─── Generation type options (backend-driven in production) ───────────────────
const GEN_TYPE_OPTIONS = [
  { value: 'image', label: '图片生成',
    iconSelected: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M3 5V3.188C3 2.891 3.029 2.783 3.083 2.674C3.138 2.566 3.218 2.481 3.32 2.422C3.422 2.364 3.523 2.333 3.801 2.333H12.199C12.477 2.333 12.578 2.364 12.68 2.422C12.782 2.481 12.862 2.566 12.916 2.674C12.971 2.783 13 2.891 13 3.188V5" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1.667 5H14.333V13.667H1.667V5Z" stroke="#FFFFFF" strokeLinejoin="round" />
        <path fillRule="evenodd" clipRule="evenodd" d="M4.333 8.667C4.886 8.667 5.333 8.219 5.333 7.667C5.333 7.114 4.886 6.667 4.333 6.667C3.781 6.667 3.333 7.114 3.333 7.667C3.333 8.219 3.781 8.667 4.333 8.667Z" fill="#FFFFFF" />
        <path d="M1.856 13.463L5 10L6.667 11.333L8.667 9L14.131 13.463" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    iconDefault: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M3 5V3.188C3 2.891 3.029 2.783 3.083 2.674C3.138 2.566 3.218 2.481 3.32 2.422C3.422 2.364 3.523 2.333 3.801 2.333H12.199C12.477 2.333 12.578 2.364 12.68 2.422C12.782 2.481 12.862 2.566 12.916 2.674C12.971 2.783 13 2.891 13 3.188V5" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1.667 5H14.333V13.667H1.667V5Z" stroke="#FFFFFF99" strokeLinejoin="round" />
        <path fillRule="evenodd" clipRule="evenodd" d="M4.333 8.667C4.886 8.667 5.333 8.219 5.333 7.667C5.333 7.114 4.886 6.667 4.333 6.667C3.781 6.667 3.333 7.114 3.333 7.667C3.333 8.219 3.781 8.667 4.333 8.667Z" fill="#FFFFFF99" />
        <path d="M1.856 13.463L5 10L6.667 11.333L8.667 9L14.131 13.463" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    triggerIcon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M3 5V3.188C3 2.891 3.029 2.783 3.083 2.674C3.138 2.566 3.218 2.481 3.32 2.422C3.422 2.364 3.523 2.333 3.801 2.333H12.199C12.477 2.333 12.578 2.364 12.68 2.422C12.782 2.481 12.862 2.566 12.916 2.674C12.971 2.783 13 2.891 13 3.188V5" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1.667 5H14.333V13.667H1.667V5Z" stroke="#FFFFFFCC" strokeLinejoin="round" />
        <path fillRule="evenodd" clipRule="evenodd" d="M4.333 8.667C4.886 8.667 5.333 8.219 5.333 7.667C5.333 7.114 4.886 6.667 4.333 6.667C3.781 6.667 3.333 7.114 3.333 7.667C3.333 8.219 3.781 8.667 4.333 8.667Z" fill="#FFFFFFCC" />
        <path d="M1.856 13.463L5 10L6.667 11.333L8.667 9L14.131 13.463" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  { value: 'video', label: '视频生成',
    iconSelected: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M13 2H3C2.448 2 2 2.448 2 3V13C2 13.552 2.448 14 3 14H13C13.552 14 14 13.552 14 13V3C14 2.448 13.552 2 13 2Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.833 9.333V7.313L8.583 8.323L10.333 9.333L8.583 10.344L6.833 11.354V9.333Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 5H14" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 2L9 5" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 2L5 5" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    iconDefault: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M13 2H3C2.448 2 2 2.448 2 3V13C2 13.552 2.448 14 3 14H13C13.552 14 14 13.552 14 13V3C14 2.448 13.552 2 13 2Z" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.833 9.333V7.313L8.583 8.323L10.333 9.333L8.583 10.344L6.833 11.354V9.333Z" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 5H14" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 2L9 5" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 2L5 5" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    triggerIcon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M13 2H3C2.448 2 2 2.448 2 3V13C2 13.552 2.448 14 3 14H13C13.552 14 14 13.552 14 13V3C14 2.448 13.552 2 13 2Z" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.833 9.333V7.313L8.583 8.323L10.333 9.333L8.583 10.344L6.833 11.354V9.333Z" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 5H14" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 2L9 5" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 2L5 5" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  { value: 'dubbing', label: '配音生成',
    iconSelected: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M8 2V11.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.333 12.013C3.333 11.085 4.086 10.333 5.013 10.333H8V12.32C8 13.248 7.248 14 6.32 14H5.013C4.086 14 3.333 13.248 3.333 12.32V12.013Z" stroke="#FFFFFF" strokeLinejoin="round" />
        <path fillRule="evenodd" clipRule="evenodd" d="M8 4.689L12.294 5.707V3.004L8 2V4.689Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    iconDefault: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M8 2V11.667" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.333 12.013C3.333 11.085 4.086 10.333 5.013 10.333H8V12.32C8 13.248 7.248 14 6.32 14H5.013C4.086 14 3.333 13.248 3.333 12.32V12.013Z" stroke="#FFFFFF99" strokeLinejoin="round" />
        <path fillRule="evenodd" clipRule="evenodd" d="M8 4.689L12.294 5.707V3.004L8 2V4.689Z" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    triggerIcon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M8 2V11.667" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.333 12.013C3.333 11.085 4.086 10.333 5.013 10.333H8V12.32C8 13.248 7.248 14 6.32 14H5.013C4.086 14 3.333 13.248 3.333 12.32V12.013Z" stroke="#FFFFFFCC" strokeLinejoin="round" />
        <path fillRule="evenodd" clipRule="evenodd" d="M8 4.689L12.294 5.707V3.004L8 2V4.689Z" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

// Model/params options are backend-driven; see apiGetCreationModels / apiGetCreationParams in src/api/creation.js

// ─── Upload placeholder ───────────────────────────────────────────────────────
function UploadPlaceholder({ onFileSelect, onAssetPick, disabled = false, allowedExts = ALLOWED_EXTS, acceptAttr = '.txt,.md,.pdf,.docx' }) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const defaultBack = { opacity: 0.6, bg: '#FFFFFF14', rotate: '0deg' };
  const defaultFront = { bg: '#262626', rotate: '345deg', tx: 'calc(-50% - 7.015px)', ty: 'calc(-50% + 6.717px)' };
  const defaultIcon = { stroke: '#FFFFFF33', tx: 'calc(-50% - 1.349px)', ty: 'calc(-50% + 1.757px)', rotate: '345deg' };

  const hoverBack = { opacity: 0.6, bg: '#FFFFFF3D', rotate: '5deg' };
  const hoverFront = { bg: '#3D3D3D', rotate: '351deg', tx: 'calc(-50% - 4.422px)', ty: 'calc(-50% + 3.811px)' };
  const hoverIcon = { stroke: '#FFFFFF80', tx: 'calc(-50% - 0.865px)', ty: 'calc(-50% + 1.012px)', rotate: '351deg' };

  const isActive = hovered || menuOpen;
  const back = isActive ? hoverBack : defaultBack;
  const front = isActive ? hoverFront : defaultFront;
  const icon = isActive ? hoverIcon : defaultIcon;
  const transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';

  const handleChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    const invalid = selected.filter((file) => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      return !allowedExts.includes(ext);
    });
    if (invalid.length) {
      alert(`仅支持 ${allowedExts.join('、')} 格式的文件`);
      e.target.value = '';
      return;
    }
    onFileSelect?.(selected);
    e.target.value = '';
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onMouseEnter={() => !disabled && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => { if (!disabled) setMenuOpen((v) => !v); }}
        disabled={disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0px',
          position: 'relative',
          padding: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: 'transparent',
          border: 'none',
          opacity: disabled ? 0.45 : 1,
          outline: 'none',
          borderRadius: '8px',
          flexShrink: 0,
        }}
      >
        <input ref={fileInputRef} type="file" multiple accept={acceptAttr} className="hidden" onChange={handleChange} onClick={(e) => e.stopPropagation()} />
        <div style={{ width: '44px', height: '60px', borderRadius: '4px', flexShrink: 0, boxShadow: '#FFFFFF14 0px 0px 0px 0.5px inset', opacity: back.opacity, background: back.bg, rotate: back.rotate, transition }} />
        <div style={{ width: '44px', height: '60px', borderRadius: '4px', position: 'absolute', boxShadow: '#FFFFFF14 0px 0px 0px 0.5px inset', transformOrigin: 'top left', background: front.bg, rotate: front.rotate, left: '50%', top: '50%', translate: `${front.tx} ${front.ty}`, transition }} />
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', left: '50%', top: '50%', translate: `${icon.tx} ${icon.ty}`, rotate: icon.rotate, transformOrigin: '0% 0%', transition }}>
          <path d="M8 3v10M3 8h10" stroke={icon.stroke} strokeWidth="1.5" strokeLinecap="round" style={{ transition }} />
        </svg>
      </button>

      {menuOpen && (
        <div style={{
          position: 'absolute',
          zIndex: 50,
          left: 0,
          bottom: 'calc(100% + 8px)',
          borderRadius: '8px',
          background: '#1D1E1E',
          border: '1px solid #FFFFFF0D',
          boxShadow: '0px 4px 16px #00000066',
          padding: '4px',
          minWidth: '140px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <UploadMenuItem
            label="从资产库选择"
            icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <path d="M1.66663 2.66667C1.66663 2.29848 1.9651 2 2.33329 2H6.33329L7.99996 4H13.6666C14.0348 4 14.3333 4.29847 14.3333 4.66667V13.3333C14.3333 13.7015 14.0348 14 13.6666 14H2.33329C1.9651 14 1.66663 13.7015 1.66663 13.3333V2.66667Z" stroke="#FFFFFFCC" strokeLinejoin="round" />
                <path d="M8.00003 6.66663L8.7477 8.30423L10.5362 8.50926L9.20977 9.72636L9.56747 11.4907L8.00003 10.6053L6.4326 11.4907L6.7903 9.72636L5.46387 8.50926L7.25237 8.30423L8.00003 6.66663Z" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            onClick={() => { setMenuOpen(false); onAssetPick?.(); }}
          />
          <UploadMenuItem
            label="从本地上传"
            icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <path d="M8 10.667V3.333" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.333 6L8 3.333L10.667 6" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.667 12H13.333" stroke="#FFFFFFCC" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            onClick={() => { setMenuOpen(false); fileInputRef.current?.click(); }}
          />
        </div>
      )}
    </div>
  );
}

function UploadMenuItem({ label, icon, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        height: '32px',
        paddingLeft: '10px',
        paddingRight: '10px',
        borderRadius: '6px',
        cursor: 'pointer',
        border: 'none',
        textAlign: 'left',
        fontFamily: FONT,
        fontSize: '12px',
        lineHeight: '16px',
        color: '#FFFFFFCC',
        background: hovered ? '#FFFFFF0A' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Image view modal ─────────────────────────────────────────────────────────
function ImageViewModal({ imageUrl, onClose }) {
  const [closeHovered, setCloseHovered] = useState(false);
  const [doneHovered, setDoneHovered] = useState(false);
  const [donePressed, setDonePressed] = useState(false);
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        style={{ display: 'flex', flexDirection: 'column', width: '800px', borderRadius: '16px', overflow: 'hidden', height: '600px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: '#161616', borderRadius: '16px 16px 0 0', flexShrink: 0 }}>
          <span style={{ fontFamily: FONT_MEDIUM, fontSize: '16px', lineHeight: '20px', color: '#FFFFFF' }}>查看</span>
          <div
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '6px', background: closeHovered ? '#FFFFFF14' : 'transparent', transition: 'background 120ms' }}
            onClick={onClose}
            onMouseEnter={() => setCloseHovered(true)}
            onMouseLeave={() => setCloseHovered(false)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke={closeHovered ? '#FFFFFF' : '#FFFFFFCC'} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', padding: '8px 24px', overflow: 'hidden', gap: '12px', flexDirection: 'column', background: '#161616', minHeight: 0 }}>
          <img src={imageUrl} alt="" style={{ width: '100%', flex: 1, borderRadius: '8px', objectFit: 'contain', minHeight: 0 }} />
        </div>
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

// ─── File card ────────────────────────────────────────────────────────────────
const IMAGE_EXTS_SET = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif', '.heic', '.heif']);

function isImageFile(file) {
  if (file.isAsset && file.url) {
    if (/\.(jpg|jpeg|png|webp|gif|bmp|tiff?|heic|heif)$/i.test(file.url)) return true;
    // URL has no extension (e.g. picsum.photos) — fall through to check file.name
  }
  const ext = '.' + (file.name || '').split('.').pop().toLowerCase();
  return IMAGE_EXTS_SET.has(ext);
}

function FileCard({ file, onRemove, disabled = false }) {
  const [hovered, setHovered] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const isImage = isImageFile(file);

  useEffect(() => {
    if (!isImage) return;
    if (file.isAsset && file.url) {
      setPreviewUrl(file.url);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);

  if (isImage) {
    return (
      <>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '2px',
            borderRadius: '8px',
            width: '100px',
            height: '100px',
            justifyContent: 'space-between',
            flexShrink: 0,
            position: 'relative',
            background: '#1D1E1E',
            border: '1px solid #FFFFFF14',
            overflow: 'visible',
            opacity: disabled ? 0.45 : 1,
            cursor: disabled ? 'default' : 'pointer',
          }}
          onMouseEnter={() => !disabled && setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => { if (!disabled && previewUrl) setViewOpen(true); }}
        >
          <div
            style={{
              flex: 1,
              borderRadius: '7px',
              alignSelf: 'stretch',
              ...(previewUrl
                ? { backgroundImage: `url(${previewUrl})`, backgroundSize: 'cover', backgroundPosition: '50%' }
                : { background: '#FFFFFF14' }),
            }}
          />
          {hovered && !disabled && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', top: '-7px', right: '-7px', width: '16px', height: '16px', borderRadius: '9999px', background: '#505151', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4.667 4.667L11.333 11.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4.667 11.333L11.333 4.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
        {viewOpen && previewUrl && createPortal(
          <ImageViewModal imageUrl={previewUrl} onClose={() => setViewOpen(false)} />,
          document.body
        )}
      </>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '2px',
        paddingLeft: '8px',
        paddingRight: '8px',
        paddingTop: '6px',
        paddingBottom: '6px',
        borderRadius: '8px',
        width: '100px',
        height: '100px',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'relative',
        background: '#1D1E1E',
        border: `1px solid ${hovered ? '#FFFFFF33' : '#FFFFFF14'}`,
        transition: 'border-color 0.15s',
        opacity: disabled ? 0.45 : 1,
      }}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '150%', alignSelf: 'stretch', flex: 1, overflow: 'hidden', color: '#FFFFFF' }}>
        {truncateFileName(file.name)}
      </div>
      <div style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '150%', alignSelf: 'stretch', color: '#FFFFFF66' }}>
        {file.isAsset ? '资产库' : formatFileSize(file.size)}
      </div>
      {hovered && !disabled && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', top: '-5px', right: '-5px', width: '16px', height: '16px', borderRadius: '9999px', background: '#505151', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4.667 4.667L11.333 11.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.667 11.333L11.333 4.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────
function Dropdown({ trigger, children, open, onClose, dropUp = true }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {trigger}
      {open && (
        <div
          style={{
            position: 'absolute',
            zIndex: 50,
            left: 0,
            [dropUp ? 'bottom' : 'top']: 'calc(100% + 4px)',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#1D1E1E',
            border: '1px solid #FFFFFF0D',
            boxShadow: '0px 4px 16px #00000066',
            minWidth: '112px',
            padding: '4px',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function GenTypeDropdownItem({ label, iconSelected, iconDefault, selected, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        width: '100%',
        paddingLeft: '12px',
        paddingRight: '12px',
        paddingTop: '8px',
        paddingBottom: '8px',
        borderRadius: '6px',
        cursor: 'pointer',
        border: 'none',
        textAlign: 'left',
        fontFamily: FONT,
        fontSize: '14px',
        lineHeight: '18px',
        color: selected ? '#FFFFFF' : '#FFFFFF99',
        background: selected ? '#FFFFFF0D' : hovered ? '#FFFFFF0A' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      {selected ? iconSelected : iconDefault}
      {label}
    </button>
  );
}

function DropdownItem({ label, selected, onClick, icon }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        height: '32px',
        paddingLeft: '12px',
        paddingRight: '12px',
        cursor: 'pointer',
        border: 'none',
        textAlign: 'left',
        fontFamily: FONT,
        fontSize: '12px',
        lineHeight: '16px',
        color: selected ? '#FFFFFF' : '#FFFFFFCC',
        background: selected ? '#FFFFFF14' : hovered ? '#FFFFFF0A' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      {icon && icon}
      {label}
    </button>
  );
}

// ─── Generation type selector ─────────────────────────────────────────────────
function GenTypeSelector({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const selected = GEN_TYPE_OPTIONS.find((o) => o.value === value) ?? GEN_TYPE_OPTIONS[0];
  const isActive = open || hovered;

  return (
    <Dropdown
      open={open}
      onClose={() => setOpen(false)}
      trigger={
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
          onMouseEnter={() => !disabled && setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: '32px',
            paddingLeft: '12px',
            paddingRight: '6px',
            borderRadius: '8px',
            justifyContent: 'space-between',
            flexShrink: 0,
            border: '1px solid',
            cursor: disabled ? 'not-allowed' : 'pointer',
            background: open ? '#252525' : isActive ? '#222222' : '#1D1E1E',
            borderColor: open ? '#2DC3E199' : '#FFFFFF14',
            outline: open ? '1px solid #00000080' : '1px solid #00000080',
            boxShadow: open ? '#2DC3E11A 0px 0px 10px' : 'none',
            transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
            opacity: disabled ? 0.45 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {selected.triggerIcon}
            <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFFCC' }}>
              {selected.label}
            </span>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <path d="M12 6.333L8 10.333L4 6.333H12Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1.333" strokeLinejoin="round" />
          </svg>
        </button>
      }
    >
      {GEN_TYPE_OPTIONS.map((opt) => (
        <GenTypeDropdownItem
          key={opt.value}
          label={opt.label}
          iconSelected={opt.iconSelected}
          iconDefault={opt.iconDefault}
          selected={opt.value === value}
          onClick={() => { onChange(opt.value); setOpen(false); }}
        />
      ))}
    </Dropdown>
  );
}

// ─── Model selector ───────────────────────────────────────────────────────────
function ModelSelector({ value, onChange, options = [], disabled }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const isActive = open || hovered;

  return (
    <Dropdown
      open={open}
      onClose={() => setOpen(false)}
      trigger={
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
          onMouseEnter={() => !disabled && setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: '32px',
            width: '180px',
            paddingLeft: '12px',
            paddingRight: '6px',
            borderRadius: '8px',
            justifyContent: 'space-between',
            flexShrink: 0,
            border: '1px solid',
            cursor: disabled ? 'not-allowed' : 'pointer',
            background: open ? '#252525' : isActive ? '#222222' : '#1D1E1E',
            borderColor: open ? '#FFFFFF33' : '#FFFFFF14',
            outline: focused || open ? '1px solid #2DC3E180' : '1px solid #00000080',
            transition: 'background 0.2s, border-color 0.2s, outline 0.2s',
            opacity: disabled ? 0.45 : 1,
          }}
        >
          <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFFCC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>
            {value}
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <path d="M12 6.333L8 10.333L4 6.333H12Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1.333" strokeLinejoin="round" />
          </svg>
        </button>
      }
    >
      {options.map((opt) => (
        <DropdownItem key={opt.value} label={opt.label} selected={opt.value === value} onClick={() => { onChange(opt.value); setOpen(false); }} />
      ))}
    </Dropdown>
  );
}

// ─── Ratio icon ───────────────────────────────────────────────────────────────
function RatioIcon({ rw = 16, rh = 9, selected = false }) {
  const maxW = 16, maxH = 12;
  const scale = Math.min(maxW / rw, maxH / rh);
  const w = Math.round(rw * scale);
  const h = Math.round(rh * scale);
  return (
    <div style={{
      width: `${w}px`,
      height: `${h}px`,
      borderRadius: '2px',
      flexShrink: 0,
      boxShadow: selected ? '#FFFFFF 0px 0px 0px 1px inset' : '#FFFFFF66 0px 0px 0px 1px inset',
    }} />
  );
}

// ─── Params selector (ratio + resolution + count) ─────────────────────────────
function ParamsSelector({ ratio, resolution, count, onRatioChange, onResolutionChange, onCountChange, disabled,
  ratioOptions = [], resolutionOptions = [], countOptions = [] }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const isActive = open || hovered;

  const dropdownRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const cellStyle = (selected) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    paddingLeft: '12px',
    paddingRight: '12px',
    paddingTop: '8px',
    paddingBottom: '8px',
    borderRadius: '4px',
    width: 'calc(25% - 3px)',
    cursor: 'pointer',
    border: 'none',
    fontFamily: FONT,
    fontSize: '12px',
    lineHeight: '16px',
    color: selected ? '#FFFFFF' : '#FFFFFF66',
    background: selected ? '#FFFFFF14' : '#FFFFFF0D',
    boxShadow: selected ? '#FFFFFF33 0px 0px 0px 1px inset' : 'none',
    transition: 'background 0.15s, box-shadow 0.15s',
    flexShrink: 0,
  });

  const simpleCellStyle = (selected) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    paddingLeft: '12px',
    paddingRight: '12px',
    paddingTop: '8px',
    paddingBottom: '8px',
    borderRadius: '4px',
    width: 'calc(25% - 3px)',
    cursor: 'pointer',
    border: 'none',
    fontFamily: FONT,
    fontSize: '12px',
    lineHeight: '16px',
    color: selected ? '#FFFFFF' : '#FFFFFF66',
    background: selected ? '#FFFFFF14' : '#FFFFFF0D',
    boxShadow: selected ? '#FFFFFF33 0px 0px 0px 1px inset' : 'none',
    transition: 'background 0.15s, box-shadow 0.15s',
    flexShrink: 0,
  });

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        onMouseEnter={() => !disabled && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '36px',
          paddingLeft: '12px',
          paddingRight: '6px',
          borderRadius: '8px',
          justifyContent: 'space-between',
          flexShrink: 0,
          border: '1px solid',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: open ? '#252525' : isActive ? '#222222' : '#1D1E1E',
          borderColor: open ? '#2DC3E199' : '#FFFFFF14',
          outline: open ? '1px solid #00000080' : '1px solid #00000080',
          boxShadow: open ? '#2DC3E11A 0px 0px 10px' : 'none',
          transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
          opacity: disabled ? 0.45 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <RatioIcon rw={ratioOptions.find((r) => r.value === ratio)?.w ?? 16} rh={ratioOptions.find((r) => r.value === ratio)?.h ?? 9} selected />
          <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFFCC' }}>{ratio}</span>
        </div>
        <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFFCC' }}>{resolution}</span>
        <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFFCC' }}>{count}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M12 6.333L8 10.333L4 6.333H12Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1.333" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          zIndex: 50,
          left: 0,
          bottom: 'calc(100% + 4px)',
          borderRadius: '8px',
          background: '#1D1E1E',
          border: '1px solid #FFFFFF0D',
          boxShadow: '0px 4px 16px #00000066',
          width: '320px',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {/* 比例 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFF66' }}>比例</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {ratioOptions.map((opt) => {
                const sel = opt.value === ratio;
                return (
                  <button key={opt.value} type="button" style={cellStyle(sel)}
                    onClick={() => { onRatioChange(opt.value); }}
                    onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = '#FFFFFF14'; }}
                    onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = '#FFFFFF0D'; }}
                  >
                    <RatioIcon rw={opt.w} rh={opt.h} selected={sel} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 分辨率 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFF66' }}>分辨率</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {resolutionOptions.map((opt) => {
                const sel = opt === resolution;
                return (
                  <button key={opt} type="button" style={simpleCellStyle(sel)}
                    onClick={() => { onResolutionChange(opt); }}
                    onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = '#FFFFFF14'; }}
                    onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = '#FFFFFF0D'; }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 数量 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFF66' }}>数量</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {countOptions.map((opt) => {
                const sel = opt === count;
                return (
                  <button key={opt} type="button" style={simpleCellStyle(sel)}
                    onClick={() => { onCountChange(opt); }}
                    onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = '#FFFFFF14'; }}
                    onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = '#FFFFFF0D'; }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reference mode options ───────────────────────────────────────────────────
const REF_MODE_ICON_ALL_SELECTED = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M12.619 6.667V8V9.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.155 12.667L10.309 12L11.464 11.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.845 12.667L5.69 12L4.536 11.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.381 6.667V8V9.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.536 4.667L5.69 4L6.845 3.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.155 3.333L10.309 4L11.464 4.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 14.667C8.736 14.667 9.333 14.07 9.333 13.333C9.333 12.597 8.736 12 8 12C7.264 12 6.667 12.597 6.667 13.333C6.667 14.07 7.264 14.667 8 14.667Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 4C8.736 4 9.333 3.403 9.333 2.667C9.333 1.93 8.736 1.333 8 1.333C7.264 1.333 6.667 1.93 6.667 2.667C6.667 3.403 7.264 4 8 4Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 9.333C8.736 9.333 9.333 8.736 9.333 8C9.333 7.264 8.736 6.667 8 6.667C7.264 6.667 6.667 7.264 6.667 8C6.667 8.736 7.264 9.333 8 9.333Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.667 6.667C13.403 6.667 14 6.07 14 5.333C14 4.597 13.403 4 12.667 4C11.93 4 11.333 4.597 11.333 5.333C11.333 6.07 11.93 6.667 12.667 6.667Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.667 12C13.403 12 14 11.403 14 10.667C14 9.93 13.403 9.333 12.667 9.333C11.93 9.333 11.333 9.93 11.333 10.667C11.333 11.403 11.93 12 12.667 12Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.333 6.667C4.07 6.667 4.667 6.07 4.667 5.333C4.667 4.597 4.07 4 3.333 4C2.597 4 2 4.597 2 5.333C2 6.07 2.597 6.667 3.333 6.667Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.333 12C4.07 12 4.667 11.403 4.667 10.667C4.667 9.93 4.07 9.333 3.333 9.333C2.597 9.333 2 9.93 2 10.667C2 11.403 2.597 12 3.333 12Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const REF_MODE_ICON_ALL_DEFAULT = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M12.619 6.667V8V9.333" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.155 12.667L10.309 12L11.464 11.333" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.845 12.667L5.69 12L4.536 11.333" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.381 6.667V8V9.333" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.536 4.667L5.69 4L6.845 3.333" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.155 3.333L10.309 4L11.464 4.667" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 14.667C8.736 14.667 9.333 14.07 9.333 13.333C9.333 12.597 8.736 12 8 12C7.264 12 6.667 12.597 6.667 13.333C6.667 14.07 7.264 14.667 8 14.667Z" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 4C8.736 4 9.333 3.403 9.333 2.667C9.333 1.93 8.736 1.333 8 1.333C7.264 1.333 6.667 1.93 6.667 2.667C6.667 3.403 7.264 4 8 4Z" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 9.333C8.736 9.333 9.333 8.736 9.333 8C9.333 7.264 8.736 6.667 8 6.667C7.264 6.667 6.667 7.264 6.667 8C6.667 8.736 7.264 9.333 8 9.333Z" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.667 6.667C13.403 6.667 14 6.07 14 5.333C14 4.597 13.403 4 12.667 4C11.93 4 11.333 4.597 11.333 5.333C11.333 6.07 11.93 6.667 12.667 6.667Z" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.667 12C13.403 12 14 11.403 14 10.667C14 9.93 13.403 9.333 12.667 9.333C11.93 9.333 11.333 9.93 11.333 10.667C11.333 11.403 11.93 12 12.667 12Z" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.333 6.667C4.07 6.667 4.667 6.07 4.667 5.333C4.667 4.597 4.07 4 3.333 4C2.597 4 2 4.597 2 5.333C2 6.07 2.597 6.667 3.333 6.667Z" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.333 12C4.07 12 4.667 11.403 4.667 10.667C4.667 9.93 4.07 9.333 3.333 9.333C2.597 9.333 2 9.93 2 10.667C2 11.403 2.597 12 3.333 12Z" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const REF_MODE_ICON_FRAME_DEFAULT = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '16px', height: '16px', flexShrink: 0 }}>
    <path d="M9.446 1.733C9.888 1.733 10.246 2.092 10.246 2.533V21.855C10.246 22.297 9.888 22.655 9.447 22.655C9.005 22.655 8.646 22.297 8.646 21.855V2.533C8.646 2.092 9.005 1.733 9.447 1.733H9.446Z" fill="#FFFFFF99" />
    <path d="M9.194 3.483V5.083H4.706C4.411 5.083 4.172 5.322 4.172 5.617V18.946C4.172 19.241 4.411 19.479 4.706 19.479H9.194V21.079H4.706C3.527 21.079 2.572 20.124 2.572 18.946V5.617C2.572 4.438 3.527 3.483 4.706 3.483H9.194Z" fill="#FFFFFF99" />
    <path d="M3.814 8.787H9.446V7.187H3.814V8.787ZM3.814 17.402H9.446V15.802H3.814V17.402ZM14.706 1.733C14.264 1.733 13.906 2.092 13.906 2.533V21.855C13.906 22.297 14.264 22.655 14.706 22.655C15.148 22.655 15.506 22.297 15.506 21.855V2.533C15.506 2.092 15.148 1.733 14.706 1.733Z" fill="#FFFFFF99" />
    <path d="M14.957 3.483V5.083H19.446C19.74 5.083 19.979 5.322 19.979 5.617V18.946C19.979 19.241 19.74 19.479 19.446 19.479H14.957V21.079H19.446C20.624 21.079 21.579 20.124 21.579 18.946V5.617C21.579 4.438 20.624 3.483 19.446 3.483H14.957Z" fill="#FFFFFF99" />
    <path d="M20.339 8.787H14.707V7.187H20.339V8.787ZM20.339 17.402H14.707V15.802H20.339V17.402Z" fill="#FFFFFF99" />
  </svg>
);
const REF_MODE_ICON_FRAME_SELECTED = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '16px', height: '16px', flexShrink: 0 }}>
    <path d="M9.446 1.733C9.888 1.733 10.246 2.092 10.246 2.533V21.855C10.246 22.297 9.888 22.655 9.447 22.655C9.005 22.655 8.646 22.297 8.646 21.855V2.533C8.646 2.092 9.005 1.733 9.447 1.733H9.446Z" fill="#FFFFFF" />
    <path d="M9.194 3.483V5.083H4.706C4.411 5.083 4.172 5.322 4.172 5.617V18.946C4.172 19.241 4.411 19.479 4.706 19.479H9.194V21.079H4.706C3.527 21.079 2.572 20.124 2.572 18.946V5.617C2.572 4.438 3.527 3.483 4.706 3.483H9.194Z" fill="#FFFFFF" />
    <path d="M3.814 8.787H9.446V7.187H3.814V8.787ZM3.814 17.402H9.446V15.802H3.814V17.402ZM14.706 1.733C14.264 1.733 13.906 2.092 13.906 2.533V21.855C13.906 22.297 14.264 22.655 14.706 22.655C15.148 22.655 15.506 22.297 15.506 21.855V2.533C15.506 2.092 15.148 1.733 14.706 1.733Z" fill="#FFFFFF" />
    <path d="M14.957 3.483V5.083H19.446C19.74 5.083 19.979 5.322 19.979 5.617V18.946C19.979 19.241 19.74 19.479 19.446 19.479H14.957V21.079H19.446C20.624 21.079 21.579 20.124 21.579 18.946V5.617C21.579 4.438 20.624 3.483 19.446 3.483H14.957Z" fill="#FFFFFF" />
    <path d="M20.339 8.787H14.707V7.187H20.339V8.787ZM20.339 17.402H14.707V15.802H20.339V17.402Z" fill="#FFFFFF" />
  </svg>
);
const REF_MODE_ICON_MULTI_DEFAULT = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M8 8V4M8 8L4.5 10.021M8 8L11.5 10.021" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.667 5.333C4.667 6.07 4.07 6.667 3.333 6.667C2.597 6.667 2 6.07 2 5.333C2 4.597 2.597 4 3.333 4C4.07 4 4.667 4.597 4.667 5.333Z" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.667 10.667C4.667 11.403 4.07 12 3.333 12C2.597 12 2 11.403 2 10.667C2 9.93 2.597 9.333 3.333 9.333C4.07 9.333 4.667 9.93 4.667 10.667Z" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.333 13.333C9.333 14.07 8.736 14.667 8 14.667C7.264 14.667 6.667 14.07 6.667 13.333C6.667 12.597 7.264 12 8 12C8.736 12 9.333 12.597 9.333 13.333Z" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 10.667C14 11.403 13.403 12 12.667 12C11.93 12 11.333 11.403 11.333 10.667C11.333 9.93 11.93 9.333 12.667 9.333C13.403 9.333 14 9.93 14 10.667Z" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 5.333C14 6.07 13.403 6.667 12.667 6.667C11.93 6.667 11.333 6.07 11.333 5.333C11.333 4.597 11.93 4 12.667 4C13.403 4 14 4.597 14 5.333Z" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.333 2.667C9.333 3.403 8.736 4 8 4C7.264 4 6.667 3.403 6.667 2.667C6.667 1.93 7.264 1.333 8 1.333C8.736 1.333 9.333 1.93 9.333 2.667Z" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const REF_MODE_ICON_MULTI_SELECTED = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M8 8V4M8 8L4.5 10.021M8 8L11.5 10.021" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.667 5.333C4.667 6.07 4.07 6.667 3.333 6.667C2.597 6.667 2 6.07 2 5.333C2 4.597 2.597 4 3.333 4C4.07 4 4.667 4.597 4.667 5.333Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.667 10.667C4.667 11.403 4.07 12 3.333 12C2.597 12 2 11.403 2 10.667C2 9.93 2.597 9.333 3.333 9.333C4.07 9.333 4.667 9.93 4.667 10.667Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.333 13.333C9.333 14.07 8.736 14.667 8 14.667C7.264 14.667 6.667 14.07 6.667 13.333C6.667 12.597 7.264 12 8 12C8.736 12 9.333 12.597 9.333 13.333Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 10.667C14 11.403 13.403 12 12.667 12C11.93 12 11.333 11.403 11.333 10.667C11.333 9.93 11.93 9.333 12.667 9.333C13.403 9.333 14 9.93 14 10.667Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 5.333C14 6.07 13.403 6.667 12.667 6.667C11.93 6.667 11.333 6.07 11.333 5.333C11.333 4.597 11.93 4 12.667 4C13.403 4 14 4.597 14 5.333Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.333 2.667C9.333 3.403 8.736 4 8 4C7.264 4 6.667 3.403 6.667 2.667C6.667 1.93 7.264 1.333 8 1.333C8.736 1.333 9.333 1.93 9.333 2.667Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Icon map for ref modes — icons are static frontend assets, not from backend
const REF_MODE_ICON_MAP = {
  all:   { iconSelected: REF_MODE_ICON_ALL_SELECTED,    iconDefault: REF_MODE_ICON_ALL_DEFAULT,    triggerIcon: REF_MODE_ICON_ALL_SELECTED    },
  frame: { iconSelected: REF_MODE_ICON_FRAME_SELECTED,  iconDefault: REF_MODE_ICON_FRAME_DEFAULT,  triggerIcon: REF_MODE_ICON_FRAME_SELECTED  },
  multi: { iconSelected: REF_MODE_ICON_MULTI_SELECTED,  iconDefault: REF_MODE_ICON_MULTI_DEFAULT,  triggerIcon: REF_MODE_ICON_MULTI_SELECTED  },
};

// ─── Reference mode selector ──────────────────────────────────────────────────
function RefModeSelector({ value, onChange, disabled, options = [] }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOpt = options.find((o) => o.value === value) ?? options[0];
  const selectedIcons = REF_MODE_ICON_MAP[selectedOpt?.value] ?? REF_MODE_ICON_MAP.all;
  const isActive = open || hovered;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        onMouseEnter={() => !disabled && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '32px',
          paddingLeft: '12px',
          paddingRight: '6px',
          borderRadius: '8px',
          justifyContent: 'space-between',
          flexShrink: 0,
          border: '1px solid',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: open ? '#252525' : isActive ? '#222222' : '#1D1E1E',
          borderColor: open ? '#2DC3E199' : '#FFFFFF14',
          outline: '1px solid #00000080',
          boxShadow: open ? '#2DC3E11A 0px 0px 10px' : 'none',
          transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
          opacity: disabled ? 0.45 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {selectedIcons.triggerIcon}
          <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFFCC' }}>
            {selectedOpt?.label}
          </span>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M12 6.333L8 10.333L4 6.333H12Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1.333" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          zIndex: 50,
          left: 0,
          bottom: 'calc(100% + 4px)',
          borderRadius: '8px',
          background: '#1D1E1E',
          border: '1px solid #FFFFFF0D',
          boxShadow: '0px 4px 16px #00000066',
          width: '112px',
          padding: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0px',
        }}>
          {options.map((opt) => {
            const sel = opt.value === value;
            const icons = REF_MODE_ICON_MAP[opt.value] ?? REF_MODE_ICON_MAP.all;
            return (
              <RefModeDropdownItem
                key={opt.value}
                label={opt.label}
                icon={sel ? icons.iconSelected : icons.iconDefault}
                selected={sel}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function RefModeDropdownItem({ label, icon, selected, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        width: '100%',
        paddingLeft: '12px',
        paddingRight: '12px',
        paddingTop: '8px',
        paddingBottom: '8px',
        borderRadius: '6px',
        cursor: 'pointer',
        border: 'none',
        textAlign: 'left',
        fontFamily: FONT,
        fontSize: '14px',
        lineHeight: '18px',
        color: selected ? '#FFFFFFCC' : '#FFFFFF99',
        background: selected ? '#FFFFFF0D' : hovered ? '#FFFFFF0A' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      {icon}
      <span style={{ flex: 1 }}>{label}</span>
    </button>
  );
}

// ─── Video params selector (ratio + resolution + duration) ────────────────────
function VideoParamsSelector({ ratio, resolution, duration, onRatioChange, onResolutionChange, onDurationChange, disabled,
  ratioOptions = [], resolutionOptions = [], durationOptions = [] }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isActive = open || hovered;

  const dropdownRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const cellStyle = (selected) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    paddingLeft: '12px',
    paddingRight: '12px',
    paddingTop: '8px',
    paddingBottom: '8px',
    borderRadius: '4px',
    width: 'calc(25% - 3px)',
    cursor: 'pointer',
    border: 'none',
    fontFamily: FONT,
    fontSize: '12px',
    lineHeight: '16px',
    color: selected ? '#FFFFFF' : '#FFFFFF66',
    background: selected ? '#FFFFFF14' : '#FFFFFF0D',
    boxShadow: selected ? '#FFFFFF33 0px 0px 0px 1px inset' : 'none',
    transition: 'background 0.15s, box-shadow 0.15s',
    flexShrink: 0,
  });

  const simpleCellStyle = (selected) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    paddingLeft: '12px',
    paddingRight: '12px',
    paddingTop: '8px',
    paddingBottom: '8px',
    borderRadius: '4px',
    width: 'calc(25% - 3px)',
    cursor: 'pointer',
    border: 'none',
    fontFamily: FONT,
    fontSize: '12px',
    lineHeight: '16px',
    color: selected ? '#FFFFFF' : '#FFFFFF66',
    background: selected ? '#FFFFFF14' : '#FFFFFF0D',
    boxShadow: selected ? '#FFFFFF33 0px 0px 0px 1px inset' : 'none',
    transition: 'background 0.15s, box-shadow 0.15s',
    flexShrink: 0,
  });

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        onMouseEnter={() => !disabled && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '32px',
          paddingLeft: '12px',
          paddingRight: '6px',
          borderRadius: '8px',
          justifyContent: 'space-between',
          flexShrink: 0,
          border: '1px solid',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: open ? '#252525' : isActive ? '#222222' : '#1D1E1E',
          borderColor: open ? '#2DC3E199' : '#FFFFFF14',
          outline: '1px solid #00000080',
          boxShadow: open ? '#2DC3E11A 0px 0px 10px' : 'none',
          transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
          opacity: disabled ? 0.45 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <RatioIcon rw={ratioOptions.find((r) => r.value === ratio)?.w ?? 16} rh={ratioOptions.find((r) => r.value === ratio)?.h ?? 9} selected />
          <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFFCC' }}>{ratio}</span>
        </div>
        <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFFCC' }}>{resolution}</span>
        <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFFCC' }}>{duration}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M12 6.333L8 10.333L4 6.333H12Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1.333" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          zIndex: 50,
          left: 0,
          bottom: 'calc(100% + 4px)',
          borderRadius: '8px',
          background: '#1D1E1E',
          border: '1px solid #FFFFFF0D',
          boxShadow: '0px 4px 16px #00000066',
          width: '320px',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {/* 比例 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFF66' }}>比例</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {ratioOptions.map((opt) => {
                const sel = opt.value === ratio;
                return (
                  <button key={opt.value} type="button" style={cellStyle(sel)}
                    onClick={() => { onRatioChange(opt.value); }}
                    onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = '#FFFFFF14'; }}
                    onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = '#FFFFFF0D'; }}
                  >
                    <RatioIcon rw={opt.w} rh={opt.h} selected={sel} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 分辨率 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFF66' }}>分辨率</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {resolutionOptions.map((opt) => {
                const sel = opt === resolution;
                return (
                  <button key={opt} type="button" style={simpleCellStyle(sel)}
                    onClick={() => { onResolutionChange(opt); }}
                    onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = '#FFFFFF14'; }}
                    onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = '#FFFFFF0D'; }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 时长 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFF66' }}>时长</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {durationOptions.map((opt) => {
                const sel = opt === duration;
                return (
                  <button key={opt} type="button" style={simpleCellStyle(sel)}
                    onClick={() => { onDurationChange(opt); }}
                    onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = '#FFFFFF14'; }}
                    onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = '#FFFFFF0D'; }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sound toggle ─────────────────────────────────────────────────────────────
function SoundToggle({ enabled, onChange, disabled }) {
  const [hovered, setHovered] = useState(false);
  const isActive = hovered && !disabled;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!enabled)}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        height: '32px',
        paddingLeft: '12px',
        paddingRight: '6px',
        borderRadius: '8px',
        justifyContent: 'space-between',
        flexShrink: 0,
        border: '1px solid #FFFFFF14',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: isActive ? '#222222' : '#1D1E1E',
        outline: '1px solid #00000080',
        transition: 'background 0.2s',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFFCC' }}>声音</span>
      <div style={{
        width: '36px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '10px',
        padding: '2px',
        justifyContent: enabled ? 'flex-end' : 'flex-start',
        flexShrink: 0,
        background: enabled ? '#39BA69' : '#FFFFFF33',
        transition: 'background 0.2s, justify-content 0.2s',
      }}>
        <div style={{ flexShrink: 0, borderRadius: '50%', background: 'white', width: '16px', height: '16px' }} />
      </div>
    </button>
  );
}

// ─── Send button ──────────────────────────────────────────────────────────────
function SendButton({ onClick, disabled = false, loading = false }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  const scale = pressed ? 'scale(0.9)' : hovered ? 'scale(1.1)' : 'scale(1)';

  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onClick={disabled ? undefined : onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '9999px',
        position: 'relative',
        flexShrink: 0,
        boxShadow: '#2DC3E133 0px 0px 12px',
        width: '40px',
        height: '40px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transform: disabled ? 'scale(1)' : scale,
        transition: 'transform 0.15s cubic-bezier(0.4,0,0.2,1), opacity 0.15s',
        opacity: disabled ? 0.45 : 1,
        background: 'transparent',
        border: 'none',
        outline: focused ? '1px solid #2DC3E180' : 'none',
        outlineOffset: '4px',
        padding: 0,
      }}
    >
      <PulsingBorder
        speed={loading ? 1.3 : 1}
        roundness={1}
        thickness={0.41}
        softness={1}
        intensity={0.4}
        bloom={0.68}
        spots={4}
        spotSize={0.42}
        pulse={0.37}
        smoke={0.55}
        smokeSize={0.18}
        scale={0.94}
        rotation={0}
        aspectRatio="square"
        frame={34362983.25087259}
        colors={['#0DC1FDB3', '#E1F5FF', '#73FFE1']}
        colorBack="#00000000"
        className="rounded-full flex-1 w-full [box-shadow:#34DDFFB3_0px_0px_4px_2px_inset] bg-neutral-300"
      />
      {loading ? (
        <div style={{ position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%', display: 'flex', alignItems: 'center', gap: '3px' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="creation-thinking-dot" style={{ width: '4px', height: '4px', borderRadius: '9999px', background: '#FFFFFF' }} />
          ))}
        </div>
      ) : (
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%' }}>
          <path d="M8.003 4.7V14" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 8.667L8 4.667L12 8.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 2H12" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

// ─── InputCard ────────────────────────────────────────────────────────────────
function formatMentionLabel(name) {
  const dotIdx = name.lastIndexOf('.');
  if (dotIdx === -1) return name.length > 9 ? name.slice(0, 9) + '…' : name;
  const base = name.slice(0, dotIdx);
  const ext = name.slice(dotIdx);
  const truncBase = base.length > 9 ? base.slice(0, 9) + '…' : base;
  return truncBase + ext;
}

function InputCard({ onGenerate, width = '800px', disabled = false, genType, onGenTypeChange,
  model, onModelChange, modelOptions = [], creationParams, prefillVersion = 0, prefillData = null }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [ratio, setRatio] = useState('');
  const [resolution, setResolution] = useState('');
  const [count, setCount] = useState('');
  const [refMode, setRefMode] = useState('');
  const [videoRatio, setVideoRatio] = useState('');
  const [videoResolution, setVideoResolution] = useState('');
  const [videoDuration, setVideoDuration] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [files, setFiles] = useState([]);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPos, setMentionPos] = useState({ top: 0, left: 0 });
  const [mentionAnchorRange, setMentionAnchorRange] = useState(null);
  const editorRef = useRef(null);
  const mentionFromTagRef = useRef(false);

  // Reset param selections when creationParams changes (model or genType changed)
  useEffect(() => {
    if (!creationParams) return;
    if (genType === 'image') {
      setRatio(creationParams.ratios?.[0]?.value ?? '');
      setResolution(creationParams.resolutions?.[0] ?? '');
      setCount(creationParams.counts?.[0] ?? '');
    } else {
      setVideoRatio(creationParams.ratios?.[0]?.value ?? '');
      setVideoResolution(creationParams.resolutions?.[0] ?? '');
      setVideoDuration(creationParams.durations?.[0] ?? '');
      setRefMode(creationParams.refModes?.[0]?.value ?? '');
    }
  }, [creationParams, genType]);

  useEffect(() => {
    setFiles([]);
  }, [genType]);

  useEffect(() => {
    setFiles([]);
  }, [genType]);

  useEffect(() => {
    ensureRotateKeyframe();
    ensureThinkingStyle();
  }, []);

  // Apply prefill when version bumps (re-edit or use-as-ref)
  useEffect(() => {
    if (!prefillVersion || !prefillData) return;
    if (prefillData.prompt !== undefined && editorRef.current) {
      editorRef.current.innerHTML = '';
      if (prefillData.prompt) {
        editorRef.current.textContent = prefillData.prompt;
      }
      setHasContent((prefillData.prompt || '').trim().length > 0);
    }
    if (prefillData.files !== undefined) setFiles(prefillData.files);
    if (prefillData.ratio !== undefined) setRatio(prefillData.ratio);
    if (prefillData.resolution !== undefined) setResolution(prefillData.resolution);
    if (prefillData.count !== undefined) setCount(prefillData.count);
  }, [prefillVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const mentionMenuRef = useRef(null);
  useEffect(() => {
    if (!mentionOpen) return;
    const handleOutside = (e) => {
      if (mentionMenuRef.current && mentionMenuRef.current.contains(e.target)) return;
      if (editorRef.current && editorRef.current.contains(e.target)) return;
      setMentionOpen(false);
      setMentionTargetTag(null);
      mentionFromTagRef.current = false;
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [mentionOpen]);

  const isImageGen = genType === 'image';
  const uploadAllowedExts = isImageGen ? ALLOWED_IMAGE_EXTS : ALLOWED_EXTS;
  const uploadAcceptAttr = isImageGen
    ? '.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.tif,.heic,.heif'
    : '.txt,.md,.pdf,.docx';

  const handleFileSelect = (newFiles) => {
    const enriched = newFiles.map((f) => {
      if (isImageFile(f)) {
        const previewUrl = URL.createObjectURL(f);
        Object.defineProperty(f, 'previewUrl', { value: previewUrl, writable: true });
      }
      return f;
    });
    setFiles((prev) => [...prev, ...enriched]);
  };
  const handleRemoveFile = (index) => {
    setFiles((prev) => {
      const file = prev[index];
      if (file && editorRef.current) {
        const tags = editorRef.current.querySelectorAll('[data-file-ref]');
        tags.forEach((tag) => {
          if (tag.dataset.fileRef === file.name) tag.remove();
        });
        const content = editorRef.current.innerText ?? '';
        setHasContent(content.trim().length > 0);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAssetConfirm = (selectedAssets) => {
    setAssetPickerOpen(false);
    const assetFiles = selectedAssets.map((asset) => ({
      name: asset.name || asset.id,
      size: 0,
      url: asset.url,
      isAsset: true,
    }));
    setFiles((prev) => [...prev, ...assetFiles]);
  };

  const [mentionTargetTag, setMentionTargetTag] = useState(null);

  const buildTagElement = (file) => {
    const tag = document.createElement('span');
    tag.contentEditable = 'false';
    tag.dataset.fileRef = file.name;
    tag.style.cssText = 'display:inline-flex;align-items:center;background:rgba(45,195,225,0.10);color:#2DC3E1;border-radius:6px;padding:0 4px;font-size:14px;line-height:22px;height:22px;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.08);user-select:none;cursor:pointer;white-space:nowrap;font-family:' + FONT + ';';

    const label = document.createElement('span');
    label.textContent = formatMentionLabel(file.name);
    label.style.cssText = 'pointer-events:none;';
    tag.appendChild(label);

    const closeBtn = document.createElement('span');
    closeBtn.style.cssText = 'display:none;width:12px;height:12px;margin-left:3px;border-radius:50%;background:rgba(255,255,255,0.15);align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;';
    closeBtn.innerHTML = '<svg width="7" height="7" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" stroke="#FFFFFFCC" stroke-width="1.2" stroke-linecap="round"/></svg>';
    closeBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      tag.remove();
      const content = editorRef.current?.innerText ?? '';
      setHasContent(content.trim().length > 0);
    });
    tag.appendChild(closeBtn);

    tag.addEventListener('mouseenter', () => {
      closeBtn.style.display = 'inline-flex';
    });
    tag.addEventListener('mouseleave', () => {
      closeBtn.style.display = 'none';
    });

    return tag;
  };

  const insertMention = (file) => {
    setMentionOpen(false);
    const targetTag = mentionTargetTag;
    if (targetTag) {
      // replacing an existing tag via click
      const newTag = buildTagElement(file);
      newTag.addEventListener('click', (e) => handleTagClick(e, newTag));
      targetTag.replaceWith(newTag);
      setMentionTargetTag(null);
      editorRef.current.focus();
      setHasContent(true);
      return;
    }
    const savedRange = mentionAnchorRange;
    if (!savedRange) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
    const range = sel.getRangeAt(0);
    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) return;
    const textBefore = textNode.textContent.slice(0, range.startOffset);
    const atIdx = textBefore.lastIndexOf('@');
    if (atIdx === -1) return;
    const deleteRange = document.createRange();
    deleteRange.setStart(textNode, atIdx);
    deleteRange.setEnd(textNode, range.startOffset);
    deleteRange.deleteContents();
    const tag = buildTagElement(file);
    tag.addEventListener('click', (e) => handleTagClick(e, tag));
    deleteRange.insertNode(tag);
    const afterRange = document.createRange();
    afterRange.setStartAfter(tag);
    afterRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(afterRange);
    editorRef.current.focus();
    setHasContent(true);
  };

  const handleTagClick = (e, tagEl) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    mentionFromTagRef.current = true;
    setMentionTargetTag(tagEl);
    setMentionQuery('');
    setMentionAnchorRange(null);
    const rect = tagEl.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();
    setMentionPos({ top: rect.bottom - editorRect.top + 4, left: Math.max(0, rect.left - editorRect.left) });
    setMentionOpen(true);
  };

  const handleInput = () => {
    const content = editorRef.current?.innerText ?? '';
    setHasContent(content.trim().length > 0);
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) { setMentionOpen(false); return; }
    const range = sel.getRangeAt(0);
    if (range.startContainer.nodeType !== Node.TEXT_NODE) { setMentionOpen(false); return; }
    const textBefore = range.startContainer.textContent.slice(0, range.startOffset);
    const atIdx = textBefore.lastIndexOf('@');
    if (atIdx !== -1) {
      const query = textBefore.slice(atIdx + 1);
      if (!query.includes(' ') && !query.includes('\n')) {
        setMentionQuery(query);
        setMentionOpen(true);
        const rect = range.getBoundingClientRect();
        const editorRect = editorRef.current.getBoundingClientRect();
        setMentionPos({ top: rect.bottom - editorRect.top + 4, left: Math.max(0, rect.left - editorRect.left) });
        setMentionAnchorRange(range.cloneRange());
        return;
      }
    }
    setMentionOpen(false);
  };

  const canSend = !disabled && (hasContent || files.length > 0);

  const handleSend = () => {
    if (!canSend) return;
    const currentText = editorRef.current?.innerText?.trim() ?? '';
    onGenerate?.({
      prompt: currentText,
      genType,
      model,
      ...(genType === 'image' ? { ratio, resolution, count } : {}),
      ...(genType === 'video' ? { refMode, videoRatio, videoResolution, videoDuration, soundEnabled } : {}),
      files,
    });
    if (editorRef.current) editorRef.current.innerHTML = '';
    setHasContent(false);
    setFiles([]);
  };

  const handleKeyDown = (e) => {
    if (mentionOpen && e.key === 'Escape') {
      e.preventDefault();
      setMentionOpen(false);
      return;
    }
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      if (!range.collapsed) return; // 有选区时让浏览器默认处理
      let tagToRemove = null;
      if (e.key === 'Backspace') {
        // 光标前一个节点是 tag
        const { startContainer, startOffset } = range;
        if (startOffset === 0 && startContainer.previousSibling?.dataset?.fileRef) {
          tagToRemove = startContainer.previousSibling;
        } else if (startContainer.nodeType === Node.TEXT_NODE && startOffset === 0) {
          const prev = startContainer.previousSibling;
          if (prev?.dataset?.fileRef) tagToRemove = prev;
        }
      } else {
        // Delete：光标后一个节点是 tag
        const { startContainer, startOffset } = range;
        if (startContainer.nodeType === Node.TEXT_NODE && startOffset === startContainer.textContent.length) {
          const next = startContainer.nextSibling;
          if (next?.dataset?.fileRef) tagToRemove = next;
        } else if (startContainer.nextSibling?.dataset?.fileRef) {
          tagToRemove = startContainer.nextSibling;
        }
      }
      if (tagToRemove) {
        e.preventDefault();
        tagToRemove.remove();
        const content = editorRef.current?.innerText ?? '';
        setHasContent(content.trim().length > 0);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isTyping = focused;
  const hoverBg = 'conic-gradient(from var(--creation-chatbox-angle), oklab(86.8% -0.081 -0.057 / 30%) 0%, oklab(75.5% -0.102 -0.072 / 25%) 15%, oklab(75.5% -0.102 -0.072 / 0%) 50%, oklab(100% 0 0 / 5%) 55%, oklab(86.8% -0.081 -0.057 / 30%) 100%)';
  const idleBg = 'linear-gradient(in oklab 161.1deg, oklab(86.8% -0.081 -0.057 / 30%) 9.06%, oklab(75.5% -0.102 -0.072 / 25%) 15.35%, oklab(75.5% -0.102 -0.072 / 0%) 52.98%, oklab(100% 0 0 / 5%) 56.39%)';

  const wrapperStyle = (() => {
    if (isTyping) return { background: '#2DC3E1', animation: 'none' };
    if (hovered) return { backgroundImage: hoverBg, animation: 'creation-chatbox-spin 4s linear infinite' };
    return { backgroundImage: idleBg, animation: 'none' };
  })();

  const assetPickerAccept = genType === 'image' ? 'image' : genType === 'video' ? 'video' : genType === 'dubbing' ? 'audio' : 'all';

  return (
    <>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0px',
        borderRadius: '20px',
        justifyContent: 'flex-end',
        padding: '1px',
        width,
        ...wrapperStyle,
        boxShadow: '-5px -10px 50px #2DC3E11F',
        opacity: disabled ? 0.72 : 1,
        overflow: 'visible',
      }}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '0px',
          borderRadius: '19px',
          paddingTop: '16px',
          paddingBottom: '12px',
          flex: 1,
          alignSelf: 'stretch',
          background: '#131313',
          paddingLeft: '16px',
          paddingRight: '16px',
          overflow: 'visible',
        }}
      >
        {/* Textarea row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            alignSelf: 'stretch',
            height: '110px',
            flexShrink: 0,
            padding: 0,
            position: 'relative',
            overflow: 'visible',
          }}
        >
          {files.length > 0 && (
            <div style={{ position: 'absolute', left: 0, display: 'flex', alignItems: 'flex-start', gap: '8px', bottom: 'calc(100% + 24px)' }}>
              {files.map((file, index) => (
                <FileCard key={index} file={file} onRemove={() => handleRemoveFile(index)} disabled={disabled} />
              ))}
            </div>
          )}
          <UploadPlaceholder onFileSelect={handleFileSelect} onAssetPick={() => setAssetPickerOpen(true)} disabled={disabled} allowedExts={uploadAllowedExts} acceptAttr={uploadAcceptAttr} />
          <div style={{ flex: 1, alignSelf: 'stretch', position: 'relative' }}>
            {!hasContent && (
              <span style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF66', userSelect: 'none' }}>
                描述你想生成的内容
              </span>
            )}
            <div
              ref={editorRef}
              contentEditable={!disabled}
              suppressContentEditableWarning
              style={{
                width: '100%',
                height: '100%',
                resize: 'none',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: FONT,
                fontSize: '14px',
                lineHeight: '18px',
                color: '#FFFFFFCC',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                cursor: disabled ? 'not-allowed' : 'text',
              }}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                if (mentionFromTagRef.current) {
                  mentionFromTagRef.current = false;
                } else {
                  setMentionOpen(false);
                  setMentionTargetTag(null);
                }
              }}
            />
            {mentionOpen && files.length > 0 && (() => {
              const mentionFiles = files.filter(f =>
                mentionQuery === '' || f.name.toLowerCase().includes(mentionQuery.toLowerCase())
              );
              if (mentionFiles.length === 0) return null;
              return (
                <div ref={mentionMenuRef} style={{
                  position: 'absolute',
                  top: mentionPos.top,
                  left: mentionPos.left,
                  zIndex: 100,
                  width: '200px',
                  borderRadius: '8px',
                  boxShadow: '#00000066 0px 4px 16px',
                  background: '#1D1E1E',
                  border: '1px solid #FFFFFF0D',
                  padding: '4px',
                }}>
                  {mentionFiles.map((file, i) => (
                    <div
                      key={i}
                      onMouseDown={(e) => { e.preventDefault(); insertMention(file); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: i === 0 ? '#FFFFFF0D' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        flexShrink: 0,
                        background: (file.previewUrl || file.url) ? 'transparent' : '#FFFFFF14',
                        backgroundImage: (file.previewUrl || file.url) ? `url(${file.previewUrl || file.url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }} />
                      <span style={{
                        flex: 1,
                        fontFamily: FONT,
                        fontSize: '14px',
                        lineHeight: '18px',
                        color: i === 0 ? '#FFFFFF' : '#FFFFFF99',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {file.name}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
        {/* Bottom controls */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0px', justifyContent: 'space-between', alignSelf: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: 0 }}>
            <GenTypeSelector value={genType} onChange={onGenTypeChange} disabled={disabled} />
            <ModelSelector value={model} onChange={onModelChange} options={modelOptions} disabled={disabled} />
            {genType === 'image' && (
              <ParamsSelector
                ratio={ratio}
                resolution={resolution}
                count={count}
                onRatioChange={setRatio}
                onResolutionChange={setResolution}
                onCountChange={setCount}
                disabled={disabled}
                ratioOptions={creationParams?.ratios ?? []}
                resolutionOptions={creationParams?.resolutions ?? []}
                countOptions={creationParams?.counts ?? []}
              />
            )}
            {genType === 'video' && (
              <>
                <RefModeSelector value={refMode} onChange={setRefMode} disabled={disabled} options={creationParams?.refModes ?? []} />
                <VideoParamsSelector
                  ratio={videoRatio}
                  resolution={videoResolution}
                  duration={videoDuration}
                  onRatioChange={setVideoRatio}
                  onResolutionChange={setVideoResolution}
                  onDurationChange={setVideoDuration}
                  disabled={disabled}
                  ratioOptions={creationParams?.ratios ?? []}
                  resolutionOptions={creationParams?.resolutions ?? []}
                  durationOptions={creationParams?.durations ?? []}
                />
                <SoundToggle enabled={soundEnabled} onChange={setSoundEnabled} disabled={disabled} />
              </>
            )}
          </div>
          <SendButton onClick={handleSend} disabled={!canSend} loading={disabled} />
        </div>
      </div>
    </div>
    <AssetPickerModal
      open={assetPickerOpen}
      onClose={() => setAssetPickerOpen(false)}
      onConfirm={handleAssetConfirm}
      accept={assetPickerAccept}
    />
    </>
  );
}

// ─── Empty state icons ────────────────────────────────────────────────────────
function EmptyIconShell({ children }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="cei-bg" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.12" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="cei-stroke" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.24" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="cei-icon" x1="18" y1="20" x2="46" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#B7C0CC" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="28" fill="url(#cei-bg)" />
      <rect x="4.5" y="4.5" width="55" height="55" rx="27.5" stroke="url(#cei-stroke)" />
      {children}
    </svg>
  );
}

function CreationEmptyIconImage() {
  return (
    <EmptyIconShell>
      {/* 图片边框 */}
      <rect x="17" y="21" width="30" height="23" rx="2.5"
        stroke="url(#cei-icon)" strokeWidth="1.5" strokeOpacity="0.9" />
      {/* 太阳 */}
      <circle cx="23.5" cy="27.5" r="2.5"
        stroke="url(#cei-icon)" strokeWidth="1.5" strokeOpacity="0.9" />
      {/* 山形折线 */}
      <path d="M17 38 L24 31 L29 36 L34 29 L47 40"
        stroke="url(#cei-icon)" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
      {/* Sparkle */}
      <path d="M42 20L42.8 22.2L45 23L42.8 23.8L42 26L41.2 23.8L39 23L41.2 22.2L42 20Z"
        fill="#2DC3E1" fillOpacity="0.85" />
    </EmptyIconShell>
  );
}

function CreationEmptyIconVideo() {
  return (
    <EmptyIconShell>
      {/* 胶片外框 */}
      <rect x="17" y="22" width="30" height="21" rx="2.5"
        stroke="url(#cei-icon)" strokeWidth="1.5" strokeOpacity="0.9" />
      {/* 顶部胶片孔横线 */}
      <line x1="17" y1="27" x2="47" y2="27"
        stroke="url(#cei-icon)" strokeWidth="1.5" strokeOpacity="0.6" />
      {/* 底部胶片孔横线 */}
      <line x1="17" y1="38" x2="47" y2="38"
        stroke="url(#cei-icon)" strokeWidth="1.5" strokeOpacity="0.6" />
      {/* 胶片孔 top */}
      <line x1="22" y1="22" x2="22" y2="27" stroke="url(#cei-icon)" strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1="28" y1="22" x2="28" y2="27" stroke="url(#cei-icon)" strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1="36" y1="22" x2="36" y2="27" stroke="url(#cei-icon)" strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1="42" y1="22" x2="42" y2="27" stroke="url(#cei-icon)" strokeWidth="1.5" strokeOpacity="0.6" />
      {/* 胶片孔 bottom */}
      <line x1="22" y1="38" x2="22" y2="43" stroke="url(#cei-icon)" strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1="28" y1="38" x2="28" y2="43" stroke="url(#cei-icon)" strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1="36" y1="38" x2="36" y2="43" stroke="url(#cei-icon)" strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1="42" y1="38" x2="42" y2="43" stroke="url(#cei-icon)" strokeWidth="1.5" strokeOpacity="0.6" />
      {/* 播放三角 */}
      <path d="M28.5 29.5 L28.5 35.5 L34.5 32.5 Z"
        stroke="url(#cei-icon)" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
      {/* Sparkle */}
      <path d="M42 20L42.8 22.2L45 23L42.8 23.8L42 26L41.2 23.8L39 23L41.2 22.2L42 20Z"
        fill="#2DC3E1" fillOpacity="0.85" />
    </EmptyIconShell>
  );
}

function CreationEmptyIconDubbing() {
  return (
    <EmptyIconShell>
      {/* 麦克风主体 */}
      <rect x="27" y="18" width="10" height="16" rx="5"
        stroke="url(#cei-icon)" strokeWidth="1.5" strokeOpacity="0.9" />
      {/* 麦克风支架弧线 */}
      <path d="M22 31 C22 37 42 37 42 31"
        stroke="url(#cei-icon)" strokeWidth="1.5"
        strokeLinecap="round" strokeOpacity="0.9" />
      {/* 支架竖线 */}
      <line x1="32" y1="37" x2="32" y2="43"
        stroke="url(#cei-icon)" strokeWidth="1.5"
        strokeLinecap="round" strokeOpacity="0.9" />
      {/* 底座横线 */}
      <line x1="27" y1="43" x2="37" y2="43"
        stroke="url(#cei-icon)" strokeWidth="1.5"
        strokeLinecap="round" strokeOpacity="0.9" />
      {/* Sparkle */}
      <path d="M42 20L42.8 22.2L45 23L42.8 23.8L42 26L41.2 23.8L39 23L41.2 22.2L42 20Z"
        fill="#2DC3E1" fillOpacity="0.85" />
    </EmptyIconShell>
  );
}

const EMPTY_ICON_MAP = {
  image: CreationEmptyIconImage,
  video: CreationEmptyIconVideo,
  dubbing: CreationEmptyIconDubbing,
};

// ─── Confirm delete modal ────────────────────────────────────────────────────
function ConfirmDeleteModal({ onConfirm, onCancel }) {
  const [confirmHov, setConfirmHov] = useState(false);
  const [cancelHov, setCancelHov] = useState(false);
  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={onCancel}
    >
      <div
        style={{ width: '320px', borderRadius: '12px', border: '1px solid #FFFFFF14', backgroundColor: '#161616', padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '#00000099 0px 8px 32px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontFamily: FONT_MEDIUM, fontSize: '16px', lineHeight: '20px', color: '#FFFFFF' }}>确认删除</div>
        <div style={{ fontFamily: FONT, fontSize: '13px', lineHeight: '20px', color: '#FFFFFF99' }}>
          删除后无法恢复，确定要删除这张图片吗？
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '4px' }}>
          <button
            type="button"
            onClick={onCancel}
            onMouseEnter={() => setCancelHov(true)}
            onMouseLeave={() => setCancelHov(false)}
            style={{ height: '32px', padding: '0 16px', borderRadius: '8px', border: '1px solid #FFFFFF14', backgroundColor: cancelHov ? '#FFFFFF14' : '#FFFFFF0A', color: '#FFFFFFCC', fontFamily: FONT, fontSize: '13px', cursor: 'pointer', transition: 'background-color 0.15s' }}
          >取消</button>
          <button
            type="button"
            onClick={onConfirm}
            onMouseEnter={() => setConfirmHov(true)}
            onMouseLeave={() => setConfirmHov(false)}
            style={{ height: '32px', padding: '0 16px', borderRadius: '8px', border: 'none', backgroundColor: confirmHov ? '#E53E3E' : '#C53030', color: '#FFFFFF', fontFamily: FONT, fontSize: '13px', cursor: 'pointer', transition: 'background-color 0.15s' }}
          >删除</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Card action button with tooltip ─────────────────────────────────────────
function CardActionBtn({ icon, tooltip, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {hovered && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 4px)',
          left: '50%',
          translate: '-50% 0',
          backgroundColor: '#111111',
          borderRadius: '4px',
          padding: '2px 8px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 10,
        }}>
          <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFF' }}>{tooltip}</span>
        </div>
      )}
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: hovered ? '#000000B3' : '#00000080',
          border: 'none',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background-color 0.15s',
        }}
      >
        {icon}
      </button>
    </div>
  );
}

// ─── Image detail modal ───────────────────────────────────────────────────────
function formatCreationDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function ModalActionBtn({ icon, label, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        borderRadius: '8px',
        border: '1px solid #FFFFFF1F',
        backgroundColor: hovered ? '#FFFFFF1F' : '#FFFFFF14',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
      }}
    >
      {icon}
      <span style={{ fontFamily: FONT, fontSize: '13px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF99' }}>{label}</span>
    </button>
  );
}

const DETAIL_PANEL_DIVIDER = (
  <div style={{ height: '1px', backgroundColor: '#FFFFFF0A', marginLeft: '20px', marginRight: '20px', flexShrink: 0 }} />
);

function ImageDetailModal({ card, onClose, onDelete, favorited, onToggleFavorite }) {
  const [starAnim, setStarAnim] = useState(false);
  const [closeHovered, setCloseHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleStarClick() {
    setStarAnim(true);
    setTimeout(() => setStarAnim(false), 300);
    onToggleFavorite?.();
  }

  return (
    <>
      {createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          onClick={onClose}
        >
          <div
            style={{ width: '960px', borderRadius: '16px', border: '1px solid #FFFFFF14', backgroundColor: '#161616', boxShadow: '#00000099 -10px 24px 64px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', backgroundColor: '#161616', flexShrink: 0 }}>
              <span style={{ fontFamily: FONT_MEDIUM, fontSize: '16px', fontWeight: 500, lineHeight: '20px', letterSpacing: '0.01em', color: '#FFFFFF' }}>查看详情</span>
              <div
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '6px', background: closeHovered ? '#FFFFFF14' : 'transparent', transition: 'background 120ms' }}
                onClick={onClose}
                onMouseEnter={() => setCloseHovered(true)}
                onMouseLeave={() => setCloseHovered(false)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4L12 12" stroke={closeHovered ? '#FFFFFF' : '#FFFFFF99'} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Body */}
            <div style={{ display: 'flex', height: '540px' }}>
              {/* Left: image viewer */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0A0A', position: 'relative', overflow: 'hidden' }}>
                {card.imageUrl && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: '70%',
                    backgroundImage: `url(${card.imageUrl})`,
                    backgroundSize: 'contain',
                    backgroundPosition: '50%',
                    backgroundRepeat: 'no-repeat',
                  }} />
                )}
              </div>

              {/* Right: info panel */}
              <div style={{ width: '280px', flexShrink: 0, backgroundColor: '#161616', borderLeft: '1px solid #FFFFFF0F', display: 'flex', flexDirection: 'column', height: '540px', overflowY: 'auto' }}>
                {DETAIL_PANEL_DIVIDER}

                {/* 提示词 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px 20px', flexShrink: 0 }}>
                  <div style={{ fontFamily: FONT, fontSize: '11px', lineHeight: '14px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF99' }}>提示词</div>
                  <div style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '20px', letterSpacing: '0.01em', color: '#FFFFFFCC' }}>{card.prompt || '—'}</div>
                </div>

                {/* 参考图 */}
                {card.refImages && card.refImages.length > 0 && (
                  <>
                    {DETAIL_PANEL_DIVIDER}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 20px', flexShrink: 0 }}>
                      <div style={{ fontFamily: FONT, fontSize: '11px', lineHeight: '14px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF99' }}>参考图</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {card.refImages.map((img, i) => {
                          const imgUrl = img.url || img.previewUrl || '';
                          return (
                            <div key={i} style={{
                              width: 'calc(50% - 6px)',
                              height: '84px',
                              borderRadius: '6px',
                              border: '1px solid #FFFFFF14',
                              backgroundColor: '#FFFFFF14',
                              overflow: 'hidden',
                              flexShrink: 0,
                              backgroundImage: imgUrl ? `url(${imgUrl})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }} />
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {DETAIL_PANEL_DIVIDER}

                {/* 生成参数 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 20px', flexShrink: 0 }}>
                  <div style={{ fontFamily: FONT, fontSize: '11px', lineHeight: '14px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF99' }}>生成参数</div>
                  {card.model && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF99' }}>模型</span>
                      <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFFCC' }}>{card.model}</span>
                    </div>
                  )}
                  {card.ratio && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF99' }}>画面比例</span>
                      <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFFCC' }}>{card.ratio}</span>
                    </div>
                  )}
                  {card.resolution && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF99' }}>分辨率</span>
                      <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFFCC' }}>{card.resolution}</span>
                    </div>
                  )}
                </div>

                {DETAIL_PANEL_DIVIDER}

                {/* AI生成时间 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px 20px', flexShrink: 0 }}>
                  <div style={{ fontFamily: FONT, fontSize: '11px', lineHeight: '14px', letterSpacing: '0.66px', textTransform: 'uppercase', color: '#FFFFFF99' }}>AI 生成时间</div>
                  <div style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.12px', color: '#FFFFFF66' }}>{formatCreationDate(card.createdAt)}</div>
                </div>

                {DETAIL_PANEL_DIVIDER}

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Bottom actions */}
                <div style={{ display: 'flex', gap: '8px', padding: '16px 20px 20px', flexShrink: 0 }}>
                  <ModalActionBtn
                    label="收藏"
                    onClick={handleStarClick}
                    icon={
                      <div style={{ transform: starAnim ? 'scale(1.4)' : 'scale(1)', transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)', display: 'flex' }}>
                        <StarIcon filled={favorited} strokeColor="rgba(255,255,255,0.6)" />
                      </div>
                    }
                  />
                  <ModalActionBtn
                    label="下载"
                    onClick={() => downloadImage(card.imageUrl)}
                    icon={
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8.003 11.3V2" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 7.333L8 11.333L12 7.333" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 14H12" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    }
                  />
                  <ModalActionBtn
                    label="删除"
                    onClick={() => setConfirmDelete(true)}
                    icon={
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 3.333V14.667H13V3.333H3Z" stroke="#FFFFFF99" strokeLinejoin="round" />
                        <path d="M6.667 6.667V11" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9.333 6.667V11" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M1.333 3.333H14.667" stroke="#FFFFFF99" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5.333 3.333L6.43 1.333H9.592L10.667 3.333H5.333Z" stroke="#FFFFFF99" strokeLinejoin="round" />
                      </svg>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      {confirmDelete && (
        <ConfirmDeleteModal
          onConfirm={() => { setConfirmDelete(false); onDelete?.(); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}

// ─── Result state ─────────────────────────────────────────────────────────────
function ImageResultCard({ status, imageUrl, prompt, model, ratio, resolution, refImages, createdAt, onReEdit, onUseAsRef, onDelete, onSave, batchMode = false, isSelected = false, onToggleSelect }) {
  const [hovered, setHovered] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [starAnim, setStarAnim] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => { ensureShimmerStyle(); }, []);

  const isDone = status === 'done' && imageUrl;

  function handleStarClick(e) {
    e.stopPropagation();
    setStarAnim(true);
    setTimeout(() => setStarAnim(false), 300);
    setFavorited((v) => !v);
  }

  return (
    <>
      <div
        style={{
          width: '320px',
          height: '180px',
          flexShrink: 0,
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#1A1A1A',
          position: 'relative',
          cursor: isDone ? 'pointer' : 'default',
          outline: isSelected ? '2px solid #2DC3E1' : 'none',
          outlineOffset: '-2px',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => {
          if (batchMode && isDone) { onToggleSelect?.(); return; }
          if (isDone) setDetailOpen(true);
        }}
      >
        {status === 'loading' ? (
          <div className="creation-shimmer" style={{ width: '100%', height: '100%' }} />
        ) : isDone ? (
          <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#FFFFFF33', fontSize: '12px', fontFamily: FONT }}>生成失败</span>
          </div>
        )}

        {/* Batch mode: checkbox overlay */}
        {batchMode && isDone && (
          <div style={{
            position: 'absolute', top: '8px', right: '8px',
            width: '18px', height: '18px', borderRadius: '4px', zIndex: 1,
            border: isSelected ? '1px solid #2DC3E1' : '1px solid rgba(255,255,255,0.5)',
            backgroundColor: isSelected ? '#2DC3E1' : 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {isSelected && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        )}

        {/* Hover overlays */}
        {hovered && isDone && !batchMode && (
          <>
            {/* Top-right: favorite */}
            <button
              type="button"
              onClick={handleStarClick}
              style={{
                position: 'absolute', top: '8px', right: '8px',
                width: '24px', height: '24px', borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#00000080', border: 'none', cursor: 'pointer',
                transform: starAnim ? 'scale(1.4)' : 'scale(1)',
                transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <StarIcon filled={favorited} />
            </button>

            {/* Bottom-right: action buttons */}
            <div
              style={{ position: 'absolute', bottom: '8px', right: '8px', display: 'flex', gap: '4px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <CardActionBtn
                tooltip="重新编辑"
                onClick={() => onReEdit?.()}
                icon={
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2.333 14H14.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3.667 8.907V11.333H6.106L13 4.436L10.565 2L3.667 8.907Z" stroke="#FFFFFF" strokeLinejoin="round" />
                  </svg>
                }
              />
              <CardActionBtn
                tooltip="用作参考图"
                onClick={() => onUseAsRef?.()}
                icon={
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12.667 7V13.333C12.667 13.702 12.368 14 12 14H2.667C2.298 14 2 13.702 2 13.333V4C2 3.632 2.298 3.333 2.667 3.333H8.788" stroke="#FFFFFF" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 10.344L6 7.667L7 8.667L8.167 6.833L10.667 10.344H4Z" stroke="#FFFFFF" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M11.334 3.333H14.001" stroke="#FFFFFF" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12.664 1.932V4.598" stroke="#FFFFFF" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              />
              <CardActionBtn
                tooltip="下载"
                onClick={() => downloadImage(imageUrl)}
                icon={
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8.003 11.3V2" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 7.333L8 11.333L12 7.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 14H12" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              />
              <CardActionBtn
                tooltip="删除"
                onClick={() => setConfirmDelete(true)}
                icon={
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 3.333V14.667H13V3.333H3Z" stroke="#FFFFFF" strokeLinejoin="round" />
                    <path d="M6.667 6.667V11" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.333 6.667V11" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1.333 3.333H14.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5.333 3.333L6.43 1.333H9.592L10.667 3.333H5.333Z" stroke="#FFFFFF" strokeLinejoin="round" />
                  </svg>
                }
              />
            </div>
          </>
        )}
      </div>

      {detailOpen && (
        <ImageDetailModal
          card={{ imageUrl, prompt, model, ratio, resolution, refImages, createdAt }}
          onClose={() => setDetailOpen(false)}
          onDelete={() => { setDetailOpen(false); onDelete?.(); }}
          favorited={favorited}
          onToggleFavorite={() => { setStarAnim(true); setTimeout(() => setStarAnim(false), 300); setFavorited((v) => !v); }}
        />
      )}

      {confirmDelete && createPortal(
        <ConfirmDeleteModal
          onConfirm={() => { setConfirmDelete(false); onDelete?.(); }}
          onCancel={() => setConfirmDelete(false)}
        />,
        document.body
      )}
    </>
  );
}

function CreationResultState({ generations, onGenerate, genType, onGenTypeChange, model, onModelChange, modelOptions, creationParams, onDeleteCard, batchMode = false, selected, onToggleSelect }) {
  const scrollRef = useRef(null);
  const [prefillVersion, setPrefillVersion] = useState(0);
  const [prefillData, setPrefillData] = useState(null);

  // Newest generation first — index 0 is the most recently generated image
  const allCards = [...generations].reverse().flatMap((gen) =>
    gen.cards.map((card, i) => ({
      ...card,
      key: `${gen.id}-${i}`,
      genId: gen.id,
      cardIndex: i,
      prompt: gen.prompt,
      model: gen.model,
      ratio: gen.ratio,
      resolution: gen.resolution,
      refImages: gen.refImages,
      createdAt: gen.createdAt,
    }))
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [generations.length]);

  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        minHeight: 0,
        alignSelf: 'stretch',
        overflow: 'hidden',
      }}
    >
      {/* Image grid: absolutely fills the container, scrolls internally */}
      <div
        ref={scrollRef}
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: 'auto',
          paddingTop: '16px',
          paddingLeft: '32px',
          paddingRight: '32px',
          paddingBottom: '220px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignContent: 'flex-start',
          }}
        >
          {allCards.map((card) => (
            <ImageResultCard
              key={card.key}
              {...card}
              batchMode={batchMode}
              isSelected={batchMode && selected?.has(card.key)}
              onToggleSelect={() => onToggleSelect?.(card.key)}
              onReEdit={() => {
                setPrefillData({
                  prompt: card.prompt,
                  files: (card.refImages || []).map((img) => ({
                    name: img.name || 'ref.png',
                    url: img.url || img.previewUrl || '',
                    previewUrl: img.url || img.previewUrl || '',
                    isAsset: true,
                    size: 0,
                  })),
                  ratio: card.ratio,
                  resolution: card.resolution,
                  count: undefined,
                });
                setPrefillVersion((v) => v + 1);
              }}
              onUseAsRef={() => {
                setPrefillData({
                  files: [{ name: 'creation.png', url: card.imageUrl, previewUrl: card.imageUrl, isAsset: true, size: 0 }],
                });
                setPrefillVersion((v) => v + 1);
              }}
              onDelete={() => onDeleteCard?.(card.genId, card.cardIndex)}
            />
          ))}
        </div>
      </div>

      {/* Gradient fade: bridges images and InputCard, does not intercept clicks */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(to bottom, transparent, #161616)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* InputCard: floating above the gradient */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          paddingLeft: '32px',
          paddingRight: '32px',
          paddingBottom: '16px',
          paddingTop: '8px',
          zIndex: 2,
        }}
      >
        <div style={{ width: 'min(800px, 100%)' }}>
          <InputCard onGenerate={onGenerate} width="100%" genType={genType} onGenTypeChange={onGenTypeChange}
            model={model} onModelChange={onModelChange} modelOptions={modelOptions} creationParams={creationParams}
            prefillVersion={prefillVersion} prefillData={prefillData} />
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function CreationEmptyState({ onGenerate, genType, onGenTypeChange, model, onModelChange, modelOptions, creationParams }) {
  const EmptyIcon = EMPTY_ICON_MAP[genType] ?? CreationEmptyIconImage;
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        alignSelf: 'stretch',
        gap: '0px',
        position: 'relative',
      }}
    >
      {/* Center hint — fixed, centered in the space above InputCard */}
      <div
        style={{
          position: 'fixed',
          top: 'calc(50vh - 58px)',
          left: '50%',
          translate: '-50% -50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.5,
        }}
      >
        <EmptyIcon />
      </div>
      {/* InputCard: absolute, centered horizontally, 16px from bottom */}
      <div style={{ position: 'absolute', left: '50%', bottom: '16px', translate: '-50% 0', width: 'min(800px, 100%)' }}>
        <InputCard onGenerate={onGenerate} width="100%" genType={genType} onGenTypeChange={onGenTypeChange}
          model={model} onModelChange={onModelChange} modelOptions={modelOptions} creationParams={creationParams} />
      </div>
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────
const CREATION_TABS = [
  { key: 'image', label: '图片' },
  { key: 'video', label: '视频' },
  { key: 'dubbing', label: '配音' },
];

function CreationTabBar({ activeTab, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '24px', paddingTop: '16px', paddingLeft: '32px', flex: 1, alignSelf: 'stretch' }}>
      {CREATION_TABS.map(({ key, label }) => {
        const isActive = key === activeTab;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: 0,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <span
              style={{
                fontFamily: isActive ? FONT_MEDIUM : FONT,
                fontWeight: isActive ? 500 : 400,
                fontSize: '16px',
                lineHeight: isActive ? '20px' : '18px',
                color: isActive ? '#FFFFFF' : '#FFFFFF99',
                transition: 'color 0.2s, font-weight 0.2s',
                whiteSpace: 'pre',
              }}
            >
              {label}
            </span>
            {isActive && (
              <div style={{ height: '2px', alignSelf: 'stretch', backgroundColor: '#DDDDDD', borderRadius: '1px' }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Batch operation button ───────────────────────────────────────────────────
function BatchButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '36px',
        flexShrink: 0,
        borderRadius: '8px',
        padding: '1px',
        boxShadow: '#00000066 3px 3px 8px',
        backgroundImage: pressed
          ? 'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 50%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, #FFFFFF1E, #FFFFFF1E)'
          : hovered
          ? 'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 40%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, #FFFFFF1A, #FFFFFF1A)'
          : 'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 30%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, #FFFFFF14, #FFFFFF14)',
        outline: '1px solid #00000080',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-image 0.15s, transform 0.1s',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          borderRadius: '7px',
          paddingLeft: '15px',
          paddingRight: '15px',
          gap: '4px',
          backgroundColor: pressed ? '#1A1A1A' : hovered ? '#1C1C1C' : '#161616',
          transition: 'background-color 0.15s',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <path d="M11.333 1.667H2.667C2.114 1.667 1.667 2.114 1.667 2.667V11.333C1.667 11.886 2.114 12.333 2.667 12.333H11.333C11.886 12.333 12.333 11.886 12.333 11.333V2.667C12.333 2.114 11.886 1.667 11.333 1.667Z" stroke="#FFFFFF" strokeLinejoin="round" />
          <path d="M14.667 4.334V14C14.667 14.368 14.368 14.667 14 14.667H4.334" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.333 6.829L6.333 8.67L9.667 5.24" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>
          批量操作
        </span>
      </div>
    </button>
  );
}

// ─── Batch action buttons ─────────────────────────────────────────────────────
function CreationGhostBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      style={{ display: 'flex', flexDirection: 'column', height: '36px', flexShrink: 0, borderRadius: '8px', padding: '1px', boxShadow: '#00000066 3px 3px 8px', backgroundImage: 'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 30%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, #FFFFFF14, #FFFFFF14)', outline: '1px solid #00000080', border: 'none', cursor: 'pointer', opacity: pressed ? 0.75 : 1, transition: 'opacity 0.1s' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, flexShrink: 1, flexBasis: '0%', borderRadius: '7px', paddingLeft: '15px', paddingRight: '15px', gap: '4px', backgroundColor: pressed ? '#252525' : hov ? '#1D1E1E' : '#161616', transition: 'background-color 0.12s' }}>
        {children}
      </div>
    </div>
  );
}

function CreationPlainBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      style={{ display: 'flex', alignItems: 'center', height: '36px', flexShrink: 0, borderRadius: '8px', paddingLeft: '16px', paddingRight: '16px', gap: '4px', boxShadow: '#00000066 3px 3px 8px', backgroundColor: pressed ? '#252525' : hov ? '#1D1E1E' : '#161616', border: '1px solid #FFFFFF0D', outline: '1px solid #00000080', cursor: 'pointer', transition: 'background-color 0.12s', opacity: pressed ? 0.8 : 1 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CreationPage() {
  const [activeTab, setActiveTab] = useState('image');
  const [genType, setGenType] = useState('image');
  const [generating, setGenerating] = useState(false);
  const [generationsByTab, setGenerationsByTab] = useState({ image: [], video: [], dubbing: [] });
  const generations = generationsByTab[activeTab] ?? [];

  // Models and params are backend-driven; loaded on genType change and model change
  const [modelOptions, setModelOptions] = useState([]);
  const [model, setModel] = useState('');
  const [creationParams, setCreationParams] = useState(null); // { ratios, resolutions, counts/durations, refModes? }

  const [batchMode, setBatchMode] = useState(false);
  const [selected, setSelected] = useState(new Set());

  // Load model list when genType changes; reset model to first option
  useEffect(() => {
    let cancelled = false;
    apiGetCreationModels(genType).then((list) => {
      if (cancelled) return;
      setModelOptions(list);
      setModel(list[0]?.value ?? '');
    });
    return () => { cancelled = true; };
  }, [genType]);

  // Load params when model changes (model is bound to genType)
  useEffect(() => {
    if (!model) return;
    let cancelled = false;
    apiGetCreationParams(genType, model).then((params) => {
      if (cancelled) return;
      setCreationParams(params);
    });
    return () => { cancelled = true; };
  }, [genType, model]);

  // Tab 和 genType 完全对应，切一个另一个跟着变
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setGenType(tab);
    setBatchMode(false);
    setSelected(new Set());
  };
  const handleGenTypeChange = (type) => {
    setGenType(type);
    setActiveTab(type);
    setBatchMode(false);
    setSelected(new Set());
  };

  function exitBatch() {
    setBatchMode(false);
    setSelected(new Set());
  }

  function selectAll() {
    const allDoneKeys = [...generations].reverse().flatMap((gen) =>
      gen.cards.map((card, i) => ({ key: `${gen.id}-${i}`, isDone: card.status === 'done' && !!card.imageUrl }))
    ).filter(({ isDone }) => isDone).map(({ key }) => key);
    const isAllSelected = allDoneKeys.length > 0 && allDoneKeys.every((k) => selected.has(k));
    setSelected(isAllSelected ? new Set() : new Set(allDoneKeys));
  }

  function deleteSelected() {
    const toDelete = {};
    selected.forEach((key) => {
      const lastDash = key.lastIndexOf('-');
      const genId = key.slice(0, lastDash);
      const cardIdx = parseInt(key.slice(lastDash + 1));
      if (!toDelete[genId]) toDelete[genId] = new Set();
      toDelete[genId].add(cardIdx);
    });
    setGenerationsByTab((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab]
        .map((gen) => {
          if (!toDelete[gen.id]) return gen;
          const indicesToDelete = toDelete[gen.id];
          return { ...gen, cards: gen.cards.filter((_, i) => !indicesToDelete.has(i)) };
        }).filter((gen) => gen.cards.length > 0),
    }));
    setSelected(new Set());
  }

  function downloadSelected() {
    [...generations].reverse().forEach((gen) => {
      gen.cards.forEach((card, i) => {
        const key = `${gen.id}-${i}`;
        if (selected.has(key) && card.imageUrl) downloadImage(card.imageUrl);
      });
    });
  }

  function toggleSelect(key) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  const handleDeleteCard = (genId, cardIdx) => {
    setGenerationsByTab((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab]
        .map((gen) => {
          if (gen.id !== genId) return gen;
          const newCards = gen.cards.filter((_, i) => i !== cardIdx);
          return { ...gen, cards: newCards };
        }).filter((gen) => gen.cards.length > 0),
    }));
  };

  const handleGenerate = async (params) => {
    setGenerating(true);
    // Parse count: '2张' → 2, fallback to 1
    const countNum = parseInt(params.count) || 1;
    const genId = `gen-${Date.now()}`;
    const currentTab = activeTab;
    // Immediately add loading placeholders
    setGenerationsByTab((prev) => ({
      ...prev,
      [currentTab]: [
        ...prev[currentTab],
        {
          id: genId,
          ratio: params.ratio || '16:9',
          resolution: params.resolution || '',
          model: params.model || '',
          prompt: params.prompt || '',
          refImages: (params.files || []).filter((f) => isImageFile(f)),
          createdAt: new Date().toISOString(),
          cards: Array.from({ length: countNum }, () => ({ status: 'loading', imageUrl: null })),
        },
      ],
    }));
    try {
      const result = await apiGenerateCreation(params);
      const images = result.images ?? [];
      const genMeta = {
        prompt: params.prompt || '',
        model: params.model || '',
        ratio: params.ratio || '16:9',
        resolution: params.resolution || '',
        createdAt: new Date().toISOString(),
        genType: params.genType || 'image',
      };
      setGenerationsByTab((prev) => ({
        ...prev,
        [currentTab]: prev[currentTab].map((gen) => {
          if (gen.id !== genId) return gen;
          return {
            ...gen,
            cards: gen.cards.map((_, i) => ({
              status: images[i] ? 'done' : 'error',
              imageUrl: images[i] ?? null,
            })),
          };
        }),
      }));
      // Auto-save each successfully generated image to the asset library
      images.forEach((imageUrl) => {
        if (imageUrl) {
          apiSaveCreationAsset({ ...genMeta, imageUrl }).catch(() => {});
        }
      });
    } catch {
      setGenerationsByTab((prev) => ({
        ...prev,
        [currentTab]: prev[currentTab].map((gen) => {
          if (gen.id !== genId) return gen;
          return { ...gen, cards: gen.cards.map(() => ({ status: 'error', imageUrl: null })) };
        }),
      }));
    } finally {
      setGenerating(false);
    }
  };

  return (
    /*
     * ┌─ Home.jsx 右侧内容区 ──────────────────────────────────────────────────┐
     * │  flex:1, overflow:hidden, position:relative                           │
     * │                                                                        │
     * │  ┌─ CreationPage 最外层 ──────────────────────────────────────────────┐│
     * │  │  flex column, flex:1, overflow:clip, pb:24px pr:24px              ││
     * │  │                                                                    ││
     * │  │  ┌─ rounded card ───────────────────────────────────────────────┐ ││
     * │  │  │  flex column, flex:1, borderRadius:16px, overflow:clip       │ ││
     * │  │  │                                                               │ ││
     * │  │  │  ┌─ top bar (tabs + batch btn) ──────────────────────────┐   │ ││
     * │  │  │  │  flex row, flex-shrink:0, alignSelf:stretch           │   │ ││
     * │  │  │  └───────────────────────────────────────────────────────┘   │ ││
     * │  │  │                                                               │ ││
     * │  │  │  ┌─ content area ────────────────────────────────────────┐   │ ││
     * │  │  │  │  flex column, flex:1, overflow:clip                   │   │ ││
     * │  │  │  │                                                        │   │ ││
     * │  │  │  │  ┌─ CreationResultState / CreationEmptyState ───────┐ │   │ ││
     * │  │  │  │  │  flex column, flex:1, minHeight:0                │ │   │ ││
     * │  │  │  │  │                                                   │ │   │ ││
     * │  │  │  │  │  ┌─ 图片滚动区 ──────────────────────────────┐   │ │   │ ││
     * │  │  │  │  │  │  flex:1, minHeight:0, overflowY:auto      │   │ │   │ ││
     * │  │  │  │  │  │  图片超出时在此区域内向上滚动              │   │ │   │ ││
     * │  │  │  │  │  └───────────────────────────────────────────┘   │ │   │ ││
     * │  │  │  │  │                                                   │ │   │ ││
     * │  │  │  │  │  ┌─ InputCard ───────────────────────────────┐   │ │   │ ││
     * │  │  │  │  │  │  flexShrink:0，flow 布局，始终在底部       │   │ │   │ ││
     * │  │  │  │  │  └───────────────────────────────────────────┘   │ │   │ ││
     * │  │  │  │  └─────────────────────────────────────────────────┘ │   │ ││
     * │  │  │  └───────────────────────────────────────────────────────┘   │ ││
     * │  │  └─────────────────────────────────────────────────────────────┘ ││
     * │  └────────────────────────────────────────────────────────────────────┘│
     * └────────────────────────────────────────────────────────────────────────┘
     */
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '0%',
        minHeight: 0,
        height: '100%',
        overflow: 'clip',
        alignSelf: 'stretch',
        paddingBottom: '24px',
        paddingRight: '24px',
        fontSize: '12px',
        lineHeight: '16px',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* rounded card */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          flex: 1,
          minHeight: 0,
          borderRadius: '16px',
          overflow: 'clip',
          alignSelf: 'stretch',
          backgroundColor: '#161616',
          border: '1px solid #FFFFFF14',
        }}
      >
        {/* top bar: tabs + batch button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'stretch', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CreationTabBar activeTab={activeTab} onChange={handleTabChange} />
            {batchMode ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingLeft: '24px', paddingRight: '32px', gap: '16px', flex: 1, paddingTop: '6px', paddingBottom: '6px' }}>
                <span style={{ fontFamily: FONT, fontSize: '14px', color: '#FFFFFF99' }}>已选 {selected.size} 项</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreationGhostBtn onClick={selectAll}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M14 6.667V13C14 13.552 13.552 14 13 14H3C2.448 14 2 13.552 2 13V3C2 2.448 2.448 2 3 2H10" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5.333 6.667L8.667 9.333L13.667 2.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontFamily: FONT, fontSize: '14px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>全选</span>
                  </CreationGhostBtn>
                  <CreationGhostBtn onClick={downloadSelected}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, rotate: '180deg', transformOrigin: '50% 50%' }}>
                      <path d="M8.003 4.7V14" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4 8.667L8 4.667L12 8.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4 2H12" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontFamily: FONT, fontSize: '14px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>下载</span>
                  </CreationGhostBtn>
                  <CreationPlainBtn onClick={deleteSelected}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M3 3.333V14.667H13V3.333H3Z" stroke="#F75F5F" strokeLinejoin="round" />
                      <path d="M6.667 6.667V11" stroke="#F75F5F" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9.333 6.667V11" stroke="#F75F5F" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M1.333 3.333H14.667" stroke="#F75F5F" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5.333 3.333L6.43 1.333H9.592L10.667 3.333H5.333Z" stroke="#F75F5F" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontFamily: FONT, fontSize: '14px', color: '#F75F5F', whiteSpace: 'nowrap' }}>删除</span>
                  </CreationPlainBtn>
                  <CreationPlainBtn onClick={exitBatch}>
                    <span style={{ fontFamily: FONT, fontSize: '14px', color: '#FFFFFFCC', whiteSpace: 'nowrap' }}>取消</span>
                  </CreationPlainBtn>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, justifyContent: 'flex-end', paddingRight: '32px', paddingTop: '6px', paddingBottom: '6px' }}>
                <BatchButton onClick={() => setBatchMode(true)} />
              </div>
            )}
          </div>
        </div>

        {/* content area */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 0%',
            minHeight: 0,
            padding: '0px',
            overflow: 'clip',
            alignSelf: 'stretch',
            position: 'relative',
          }}
        >
          {generations.length > 0 ? (
            <CreationResultState
              generations={generations}
              onGenerate={handleGenerate}
              genType={genType}
              onGenTypeChange={handleGenTypeChange}
              model={model}
              onModelChange={setModel}
              modelOptions={modelOptions}
              creationParams={creationParams}
              onDeleteCard={handleDeleteCard}
              batchMode={batchMode}
              selected={selected}
              onToggleSelect={toggleSelect}
            />
          ) : (
            <CreationEmptyState onGenerate={handleGenerate} genType={genType} onGenTypeChange={handleGenTypeChange}
              model={model} onModelChange={setModel} modelOptions={modelOptions} creationParams={creationParams} />
          )}
        </div>
      </div>
    </div>
  );
}
