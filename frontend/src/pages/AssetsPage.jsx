import { useState, useRef, useEffect } from 'react';
import { apiGetAssetDetail, apiGetShotDetail, apiGetShotVideoDetail, apiGetCreativeDays, apiGetProjectAssets } from '../api/assets';
import { apiGetProjects } from '../api/project';
import ImageDetailModal from '../components/ImageDetailModal';

const FONT = "'AlibabaPuHuiTi_2_55_Regular','Alibaba PuHuiTi 2.0',system-ui,sans-serif";
const FONT_MEDIUM = "'AlibabaPuHuiTi_2_65_Medium','Alibaba PuHuiTi 2.0',system-ui,sans-serif";

function DownloadIcon({ color = 'currentColor' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2.667 11.333V13.333H13.333V11.333" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 2.667V10.667" stroke={color} strokeLinecap="round" />
      <path d="M5 7.667L8 10.667L11 7.667" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon({ color = 'currentColor' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M3 3.333V14.667H13V3.333H3Z" stroke={color} strokeLinejoin="round" />
      <path d="M6.667 6.667V11" stroke={color} strokeLinecap="round" />
      <path d="M9.333 6.667V11" stroke={color} strokeLinecap="round" />
      <path d="M1.333 3.333H14.667" stroke={color} strokeLinecap="round" />
      <path d="M5.333 3.333L6.43 1.333H9.592L10.667 3.333H5.333Z" stroke={color} strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ filled = false }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M7 1.5l1.545 3.13 3.455.503-2.5 2.436.59 3.44L7 9.369l-3.09 1.64.59-3.44L2 5.133l3.455-.503L7 1.5z"
        fill={filled ? '#F0B429' : 'none'}
        stroke={filled ? '#F0B429' : 'rgba(255,255,255,0.6)'}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// GhostButton — matches design system ghost button style
function GhostButton({ children, onClick, danger }) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type="button"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '36px',
        flexShrink: 0,
        borderRadius: '8px',
        padding: '1px',
        boxShadow: '#00000066 3px 3px 8px',
        backgroundImage: 'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 30%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, #FFFFFF14, #FFFFFF14)',
        outline: '1px solid #00000080',
        border: 'none',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onClick={onClick}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: '0%',
          borderRadius: '7px',
          padding: '0 15px',
          gap: '4px',
          backgroundColor: pressed ? '#252525' : hov ? '#1D1E1E' : '#161616',
          transition: 'background-color 0.12s',
        }}
      >
        {children}
      </div>
    </button>
  );
}

function GhostBtn({ children, onClick }) {
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

function PlainBtn({ children, onClick, danger }) {
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
              删除后，该资产将被清除且不可恢复。
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

function MoreMenu({ onDownload, onDelete }) {
  const [open, setOpen] = useState(false);
  const [hovIdx, setHovIdx] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
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
    { label: '下载', icon: <DownloadIcon />, action: () => { onDownload?.(); setOpen(false); }, danger: false },
    { label: '删除', icon: <TrashIcon />, action: () => { setOpen(false); setShowConfirm(true); }, danger: true },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: open ? 'rgba(255,255,255,0.15)' : '#00000080',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.12s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.backgroundColor = '#FFFFFF1A'; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.backgroundColor = '#00000080'; }}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-label="更多操作"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="8" cy="4" r="1" fill="#fff" />
          <circle cx="8" cy="8" r="1" fill="#fff" />
          <circle cx="8" cy="12" r="1" fill="#fff" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            zIndex: 50,
            minWidth: '100px',
            padding: '4px',
            borderRadius: '8px',
            backgroundColor: '#1C1C1C',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0px 4px 16px rgba(0,0,0,0.5)',
          }}
        >
          {items.map((item, i) => (
            <button
              key={item.label}
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: 'none',
                background: hovIdx === i ? 'rgba(255,255,255,0.08)' : 'transparent',
                cursor: 'pointer',
                fontFamily: FONT,
                fontSize: '14px',
                lineHeight: '18px',
                color: item.danger ? '#FF6B6B' : 'rgba(255,255,255,0.8)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={() => setHovIdx(i)}
              onMouseLeave={() => setHovIdx(null)}
              onClick={(e) => { e.stopPropagation(); item.action(); }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}

      {showConfirm && (
        <DeleteConfirmModal
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => { setShowConfirm(false); onDelete?.(); }}
        />
      )}
    </div>
  );
}

function WaveformBars({ playing }) {
  const bars = [3, 6, 10, 7, 14, 9, 5, 12, 8, 4, 11, 7, 6, 13, 9, 5, 10, 7, 4, 8, 12, 6, 9, 5, 11, 7, 3, 10, 8, 6];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '24px' }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: '2px',
            height: `${h}px`,
            borderRadius: '1px',
            backgroundColor: playing ? '#2DC3E1' : '#FFFFFF33',
            transition: 'background-color 0.2s',
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

function AudioCard({ name, duration = '0:00', starred = false, selected = false, batchMode = false, onDownload, onDelete, onStar, onSelect }) {
  const [hov, setHov] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [starAnim, setStarAnim] = useState(false);

  function handleStar(e) {
    e.stopPropagation();
    setStarAnim(true);
    setTimeout(() => setStarAnim(false), 300);
    onStar?.();
  }

  function handlePlay(e) {
    e.stopPropagation();
    setPlaying((p) => !p);
  }

  return (
    <div
      style={{
        width: '100%',
        borderRadius: '10px',
        backgroundColor: '#1C1C1C',
        border: selected ? '1px solid #2DC3E1' : hov ? '1px solid #FFFFFF33' : '1px solid #FFFFFF0F',
        overflow: 'hidden',
        flexShrink: 0,
        transition: 'border-color 0.15s',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        paddingTop: '14px',
        paddingBottom: '14px',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => { if (batchMode) onSelect?.(); }}
    >
      {batchMode ? (
        <div style={{
          width: '18px',
          height: '18px',
          borderRadius: '4px',
          border: selected ? '1px solid #2DC3E1' : '1px solid rgba(255,255,255,0.5)',
          backgroundColor: selected ? '#2DC3E1' : 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {selected && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      ) : (
        <button
          type="button"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: playing ? '#2DC3E1' : '#FFFFFF14',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background-color 0.15s',
          }}
          onClick={handlePlay}
        >
          {playing ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="2" y="1.5" width="3" height="9" rx="1" fill={playing ? '#000' : '#FFF'} />
              <rect x="7" y="1.5" width="3" height="9" rx="1" fill={playing ? '#000' : '#FFF'} />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 2L10 6L3 10V2Z" fill="#FFFFFF" />
            </svg>
          )}
        </button>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
        <span style={{
          fontFamily: FONT,
          fontSize: '14px',
          color: '#FFFFFF',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>{name}</span>
        <WaveformBars playing={playing} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <span style={{ fontFamily: FONT, fontSize: '12px', color: '#FFFFFF66', letterSpacing: '0.02em' }}>{duration}</span>
        {!batchMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: hov ? 1 : 0, transition: 'opacity 0.15s' }}>
            <button
              type="button"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transform: starAnim ? 'scale(1.4)' : 'scale(1)',
                transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              onClick={handleStar}
            >
              <StarIcon filled={starred} />
            </button>
            <button
              type="button"
              style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              onClick={(e) => { e.stopPropagation(); onDownload?.(); }}
            >
              <DownloadIcon color="#FFFFFF99" />
            </button>
            <button
              type="button"
              style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            >
              <TrashIcon color="#FFFFFF66" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const MOCK_DETAIL = {
  name: '小虎',
  description: '一只雄性成年孟加拉虎，大型健壮体型，肩背宽厚，四肢粗壮，橘黄色短毛，黑色条纹较粗且分布稳定，右眼上方有一道浅色旧疤，颈部一圈深棕色较长鬃毛，头部较大，口鼻宽，尾巴中等长度，站姿平稳。',
  prompt: 'A lone detective walks through a rain-soaked alley at night, neon reflections shimmering on wet cobblestones, cinematic wide shot, shallow depth of field, moody noir atmosphere',
  model: 'Kling 2.1 Pro',
  ratio: '16:9',
  resolution: '1920 × 1080',
  generatedAt: '2026-04-21 15:30:09',
  // index 0 is the finalized image
  images: [
    { id: 'i1', src: 'https://app.paper.design/static/flowers.webp', finalized: true },
    { id: 'i2', src: 'https://app.paper.design/static/flowers.webp', finalized: false },
    { id: 'i3', src: 'https://app.paper.design/static/flowers.webp', finalized: false },
  ],
};

const MOCK_SHOT_DETAIL = {
  shotNumber: '01',
  prompt: 'A lone detective walks through a rain-soaked alley at night, neon reflections shimmering on wet cobblestones, cinematic wide shot, shallow depth of field, moody noir atmosphere',
  model: 'Kling 2.1 Pro',
  resolution: '1920 × 1080',
  generatedAt: '2026-04-21 15:30:09',
  images: [
    { id: 's1', src: 'https://app.paper.design/static/flowers.webp', finalized: true },
    { id: 's2', src: 'https://app.paper.design/static/flowers.webp', finalized: false },
    { id: 's3', src: 'https://app.paper.design/static/flowers.webp', finalized: false },
  ],
};

const MOCK_SHOT_VIDEO_DETAIL = {
  shotNumber: '03',
  prompt: 'A lone detective walks through a rain-soaked alley at night, neon reflections shimmering on wet cobblestones, cinematic wide shot, shallow depth of field, moody noir atmosphere',
  model: 'Kling 2.1 Pro',
  resolution: '1920 × 1080',
  duration: '0:24',
  ratio: '16:9',
  generatedAt: '2026-04-21 15:30:09',
  videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
  frames: [
    { id: 'v1', src: 'https://app.paper.design/static/flowers.webp', finalized: true },
    { id: 'v2', src: 'https://app.paper.design/static/flowers.webp', finalized: false },
    { id: 'v3', src: 'https://app.paper.design/static/flowers.webp', finalized: false },
  ],
};

// Props: name, description, prompt, model, ratio, resolution, images (array of {id, src, finalized})
// images[0] should be the finalized image; default activeImg = index of first finalized image
function AssetDetailModal({ onClose, onDownload, name, description, prompt, model, ratio, resolution, generatedAt, images }) {
  const imgs = images ?? MOCK_DETAIL.images;
  const defaultIdx = imgs.findIndex((img) => img.finalized);
  const [activeImg, setActiveImg] = useState(defaultIdx >= 0 ? defaultIdx : 0);
  const [hovClose, setHovClose] = useState(false);
  const [hovDownload, setHovDownload] = useState(false);
  const [hovThumb, setHovThumb] = useState(null);

  const currentImg = imgs[activeImg];
  const isFinalized = currentImg?.finalized ?? false;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '960px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '#00000099 -10px 24px 64px',
          backgroundColor: '#161616',
          border: '1px solid #FFFFFF14',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          paddingTop: '20px',
          paddingBottom: '20px',
          paddingLeft: '24px',
          paddingRight: '24px',
          backgroundColor: '#161616',
        }}>
          <span style={{ fontFamily: FONT_MEDIUM, fontWeight: 500, fontSize: '16px', lineHeight: '20px', letterSpacing: '0.01em', color: '#FFFFFF' }}>查看详情</span>
          <button
            type="button"
            style={{
              width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: hovClose ? '#FFFFFF14' : 'transparent', border: 'none', cursor: 'pointer',
              borderRadius: '6px', padding: 0, flexShrink: 0, transition: 'background 0.12s',
            }}
            onMouseEnter={() => setHovClose(true)}
            onMouseLeave={() => setHovClose(false)}
            onClick={onClose}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <path d="M12 4L4 12M4 4L12 12" stroke="#FFFFFF99" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', height: '540px' }}>
          {/* Left: preview */}
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, flexShrink: 1, flexBasis: '0%', minWidth: 0, minHeight: 0, backgroundColor: '#0D0D0D' }}>
            {/* Main image */}
            <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: '0%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, position: 'relative', backgroundColor: '#0A0A0A' }}>
              <div style={{
                position: 'absolute',
                top: '35px', bottom: '35px', left: 0, right: 0,
                backgroundImage: `url(${currentImg?.src ?? 'https://app.paper.design/static/flowers.webp'})`,
                backgroundSize: 'cover',
                backgroundPosition: '50%',
                transition: 'background-image 0.15s',
              }} />
            </div>
            {/* Thumbnails strip */}
            <div style={{
              flexShrink: 0,
              paddingTop: '14px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px',
              backgroundColor: '#111111',
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                {imgs.map((img, idx) => {
                  const isActive = activeImg === idx;
                  const isHov = hovThumb === idx;
                  return (
                    <div
                      key={img.id}
                      style={{
                        borderRadius: '6px', overflow: 'hidden',
                        width: '120px', height: '84px', flexShrink: 0,
                        boxShadow: isActive ? '#2DC3E166 0px 0px 10px 1px' : 'none',
                        backgroundColor: '#FFFFFF14',
                        border: isActive ? '1px solid #2DC3E1' : '1px solid #FFFFFF33',
                        cursor: 'pointer', position: 'relative',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      onClick={() => setActiveImg(idx)}
                      onMouseEnter={() => setHovThumb(idx)}
                      onMouseLeave={() => setHovThumb(null)}
                    >
                      <div style={{
                        width: '100%', height: '100%',
                        backgroundImage: `url(${img.src ?? 'https://app.paper.design/static/flowers.webp'})`,
                        backgroundSize: 'cover', backgroundPosition: '50%',
                      }} />
                      {/* Hover overlay: show "放大查看" icon in bottom-right */}
                      {isHov && (
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          paddingTop: '8px', paddingBottom: '4px', paddingLeft: '4px', paddingRight: '4px',
                          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px',
                          backgroundImage: 'linear-gradient(in oklab 180deg, oklab(0% 0 0 / 0%) 0%, oklab(0% 0 0 / 80%) 100%)',
                        }}>
                          <div
                            style={{ display: 'flex', alignItems: 'center', padding: '2px', cursor: 'pointer' }}
                            onClick={(e) => { e.stopPropagation(); setActiveImg(idx); }}
                            title="放大查看"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                              <path d="M5.333 2H2.667C2.298 2 2 2.298 2 2.667V5.333" stroke="#FFFFFF" strokeLinejoin="round" />
                              <path d="M5.333 14H2.667C2.298 14 2 13.701 2 13.333V10.667" stroke="#FFFFFF" strokeLinejoin="round" />
                              <path d="M10.667 14H13.333C13.701 14 14 13.701 14 13.333V10.667" stroke="#FFFFFF" strokeLinejoin="round" />
                              <path d="M10.667 2H13.333C13.701 2 14 2.298 14 2.667V5.333" stroke="#FFFFFF" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: info panel — scrollable content + sticky download */}
          <div style={{
            width: '280px', display: 'flex', flexDirection: 'column',
            height: '540px', flexShrink: 0,
            backgroundColor: '#161616', borderLeft: '1px solid #FFFFFF0F',
          }}>
            {/* Scrollable content */}
            <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: '0%', overflowY: 'auto', minHeight: 0 }}>
              {/* Finalized status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px' }}>
                <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF99' }}>是否定稿</span>
                {isFinalized ? (
                  <div style={{
                    paddingLeft: '8px', paddingRight: '8px', paddingTop: '2px', paddingBottom: '2px',
                    borderRadius: '4px', boxShadow: '#FFFFFF14 0px 0px 0px 1px inset', backgroundColor: '#7AE5B91A',
                  }}>
                    <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#7AE5B9' }}>定稿</span>
                  </div>
                ) : (
                  <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFF66' }}>否</span>
                )}
              </div>

              <div style={{ height: '1px', backgroundColor: '#FFFFFF0A', marginLeft: '20px', marginRight: '20px' }} />

              {/* Name + description */}
              <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px', gap: '8px' }}>
                <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '20px', letterSpacing: '0.01em', color: '#FFFFFF' }}>{name ?? MOCK_DETAIL.name}</span>
                <p style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '20px', letterSpacing: '0.01em', color: '#FFFFFFCC', margin: 0 }}>{description ?? MOCK_DETAIL.description}</p>
              </div>

              {/* Prompt */}
              <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px', gap: '10px' }}>
                <span style={{ fontFamily: FONT, fontSize: '11px', lineHeight: '14px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF99' }}>提示词</span>
                <p style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '20px', letterSpacing: '0.01em', color: '#FFFFFFCC', margin: 0 }}>{prompt ?? MOCK_DETAIL.prompt}</p>
              </div>

              <div style={{ height: '1px', backgroundColor: '#FFFFFF0A', marginLeft: '20px', marginRight: '20px' }} />

              {/* Generation params */}
              <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px', gap: '12px' }}>
                <span style={{ fontFamily: FONT, fontSize: '11px', lineHeight: '14px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF99' }}>生成参数</span>
                {[
                  { label: '模型', value: model ?? MOCK_DETAIL.model },
                  { label: '画面比例', value: ratio ?? MOCK_DETAIL.ratio },
                  { label: '分辨率', value: resolution ?? MOCK_DETAIL.resolution },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF99' }}>{label}</span>
                    <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFFCC' }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ height: '1px', backgroundColor: '#FFFFFF0A', marginLeft: '20px', marginRight: '20px' }} />

              {/* AI generated time */}
              <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px', gap: '4px' }}>
                <span style={{ fontFamily: FONT, fontSize: '11px', lineHeight: '14px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF99' }}>AI 生成时间</span>
                <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF66' }}>{generatedAt ?? MOCK_DETAIL.generatedAt}</span>
              </div>
            </div>

            {/* Sticky download button */}
            <div style={{ flexShrink: 0, paddingTop: '12px', paddingBottom: '20px', paddingLeft: '20px', paddingRight: '20px', borderTop: '1px solid #FFFFFF0A' }}>
              <button
                type="button"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', height: '40px', borderRadius: '8px', gap: '8px',
                  backgroundColor: hovDownload ? '#FFFFFF1F' : '#FFFFFF14',
                  border: '1px solid #FFFFFF1F', cursor: 'pointer', transition: 'background-color 0.12s',
                }}
                onMouseEnter={() => setHovDownload(true)}
                onMouseLeave={() => setHovDownload(false)}
                onClick={onDownload}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M7 2V9M7 9L4 6.5M7 9L10 6.5M2 11H12" stroke="#FFFFFF99" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: FONT, fontSize: '13px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF99' }}>下载</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Props: shotNumber, prompt, model, resolution, images (array of {id, src, finalized})
function ShotDetailModal({ onClose, onDownload, shotNumber, prompt, model, resolution, generatedAt, images }) {
  const imgs = images ?? MOCK_SHOT_DETAIL.images;
  const defaultIdx = imgs.findIndex((img) => img.finalized);
  const [activeImg, setActiveImg] = useState(defaultIdx >= 0 ? defaultIdx : 0);
  const [hovClose, setHovClose] = useState(false);
  const [hovDownload, setHovDownload] = useState(false);
  const [hovThumb, setHovThumb] = useState(null);

  const currentImg = imgs[activeImg];
  const isFinalized = currentImg?.finalized ?? false;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '960px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '#00000099 -10px 24px 64px',
          backgroundColor: '#161616',
          border: '1px solid #FFFFFF14',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          paddingTop: '20px',
          paddingBottom: '20px',
          paddingLeft: '24px',
          paddingRight: '24px',
          backgroundColor: '#161616',
        }}>
          <span style={{ fontFamily: FONT_MEDIUM, fontWeight: 500, fontSize: '16px', lineHeight: '20px', letterSpacing: '0.01em', color: '#FFFFFF' }}>查看详情</span>
          <button
            type="button"
            style={{
              width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: hovClose ? '#FFFFFF14' : 'transparent', border: 'none', cursor: 'pointer',
              borderRadius: '6px', padding: 0, flexShrink: 0, transition: 'background 0.12s',
            }}
            onMouseEnter={() => setHovClose(true)}
            onMouseLeave={() => setHovClose(false)}
            onClick={onClose}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <path d="M12 4L4 12M4 4L12 12" stroke="#FFFFFF99" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', height: '540px' }}>
          {/* Left: preview */}
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, flexShrink: 1, flexBasis: '0%', minWidth: 0, minHeight: 0, backgroundColor: '#0D0D0D' }}>
            {/* Main image */}
            <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: '0%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, position: 'relative', backgroundColor: '#0A0A0A' }}>
              <div style={{
                position: 'absolute',
                top: '35px', bottom: '35px', left: 0, right: 0,
                backgroundImage: `url(${currentImg?.src ?? 'https://app.paper.design/static/flowers.webp'})`,
                backgroundSize: 'cover',
                backgroundPosition: '50%',
                transition: 'background-image 0.15s',
              }} />
            </div>
            {/* Thumbnails strip */}
            <div style={{
              flexShrink: 0,
              paddingTop: '14px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px',
              backgroundColor: '#111111',
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                {imgs.map((img, idx) => {
                  const isActive = activeImg === idx;
                  const isHov = hovThumb === idx;
                  return (
                    <div
                      key={img.id}
                      style={{
                        borderRadius: '6px', overflow: 'hidden',
                        width: '120px', height: '84px', flexShrink: 0,
                        boxShadow: isActive ? '#2DC3E166 0px 0px 10px 1px' : 'none',
                        backgroundColor: '#FFFFFF14',
                        border: isActive ? '1px solid #2DC3E1' : '1px solid #FFFFFF33',
                        cursor: 'pointer', position: 'relative',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      onClick={() => setActiveImg(idx)}
                      onMouseEnter={() => setHovThumb(idx)}
                      onMouseLeave={() => setHovThumb(null)}
                    >
                      <div style={{
                        width: '100%', height: '100%',
                        backgroundImage: `url(${img.src ?? 'https://app.paper.design/static/flowers.webp'})`,
                        backgroundSize: 'cover', backgroundPosition: '50%',
                      }} />
                      {isHov && (
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          paddingTop: '8px', paddingBottom: '4px', paddingLeft: '4px', paddingRight: '4px',
                          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px',
                          backgroundImage: 'linear-gradient(in oklab 180deg, oklab(0% 0 0 / 0%) 0%, oklab(0% 0 0 / 80%) 100%)',
                        }}>
                          <div
                            style={{ display: 'flex', alignItems: 'center', padding: '2px', cursor: 'pointer' }}
                            onClick={(e) => { e.stopPropagation(); setActiveImg(idx); }}
                            title="放大查看"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                              <path d="M5.333 2H2.667C2.298 2 2 2.298 2 2.667V5.333" stroke="#FFFFFF" strokeLinejoin="round" />
                              <path d="M5.333 14H2.667C2.298 14 2 13.701 2 13.333V10.667" stroke="#FFFFFF" strokeLinejoin="round" />
                              <path d="M10.667 14H13.333C13.701 14 14 13.701 14 13.333V10.667" stroke="#FFFFFF" strokeLinejoin="round" />
                              <path d="M10.667 2H13.333C13.701 2 14 2.298 14 2.667V5.333" stroke="#FFFFFF" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: info panel — scrollable content + sticky download */}
          <div style={{
            width: '280px', display: 'flex', flexDirection: 'column',
            height: '540px', flexShrink: 0,
            backgroundColor: '#161616', borderLeft: '1px solid #FFFFFF0F',
          }}>
            {/* Scrollable content */}
            <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: '0%', overflowY: 'auto', minHeight: 0 }}>
              {/* Finalized status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px' }}>
                <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF99' }}>是否定稿</span>
                {isFinalized ? (
                  <div style={{
                    paddingLeft: '8px', paddingRight: '8px', paddingTop: '2px', paddingBottom: '2px',
                    borderRadius: '4px', boxShadow: '#FFFFFF14 0px 0px 0px 1px inset', backgroundColor: '#7AE5B91A',
                  }}>
                    <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#7AE5B9' }}>定稿</span>
                  </div>
                ) : (
                  <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFF66' }}>否</span>
                )}
              </div>

              <div style={{ height: '1px', backgroundColor: '#FFFFFF0A', marginLeft: '20px', marginRight: '20px' }} />

              {/* Shot number */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px', gap: '10px' }}>
                <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF99' }}>分镜编号</span>
                <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFFCC' }}>{shotNumber ?? MOCK_SHOT_DETAIL.shotNumber}</span>
              </div>

              <div style={{ height: '1px', backgroundColor: '#FFFFFF0A', marginLeft: '20px', marginRight: '20px' }} />

              {/* Prompt */}
              <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px', gap: '10px' }}>
                <span style={{ fontFamily: FONT, fontSize: '11px', lineHeight: '14px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF99' }}>提示词</span>
                <p style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '20px', letterSpacing: '0.01em', color: '#FFFFFFCC', margin: 0 }}>{prompt ?? MOCK_SHOT_DETAIL.prompt}</p>
              </div>

              <div style={{ height: '1px', backgroundColor: '#FFFFFF0A', marginLeft: '20px', marginRight: '20px' }} />

              {/* Generation params */}
              <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px', gap: '12px' }}>
                <span style={{ fontFamily: FONT, fontSize: '11px', lineHeight: '14px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF99' }}>生成参数</span>
                {[
                  { label: '模型', value: model ?? MOCK_SHOT_DETAIL.model },
                  { label: '分辨率', value: resolution ?? MOCK_SHOT_DETAIL.resolution },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF99' }}>{label}</span>
                    <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFFCC' }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ height: '1px', backgroundColor: '#FFFFFF0A', marginLeft: '20px', marginRight: '20px' }} />

              {/* AI generated time */}
              <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px', gap: '4px' }}>
                <span style={{ fontFamily: FONT, fontSize: '11px', lineHeight: '14px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF99' }}>AI 生成时间</span>
                <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF66' }}>{generatedAt ?? MOCK_SHOT_DETAIL.generatedAt}</span>
              </div>
            </div>

            {/* Sticky download button */}
            <div style={{ flexShrink: 0, paddingTop: '12px', paddingBottom: '20px', paddingLeft: '20px', paddingRight: '20px', borderTop: '1px solid #FFFFFF0A' }}>
              <button
                type="button"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', height: '40px', borderRadius: '8px', gap: '8px',
                  backgroundColor: hovDownload ? '#FFFFFF1F' : '#FFFFFF14',
                  border: '1px solid #FFFFFF1F', cursor: 'pointer', transition: 'background-color 0.12s',
                }}
                onMouseEnter={() => setHovDownload(true)}
                onMouseLeave={() => setHovDownload(false)}
                onClick={onDownload}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M7 2V9M7 9L4 6.5M7 9L10 6.5M2 11H12" stroke="#FFFFFF99" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: FONT, fontSize: '13px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF99' }}>下载</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShotVideoDetailModal({ onClose, onDownload, shotNumber, prompt, model, resolution, duration, ratio, generatedAt, frames, videoSrc }) {
  const frms = frames ?? MOCK_SHOT_VIDEO_DETAIL.frames;
  const defaultIdx = frms.findIndex((f) => f.finalized);
  const [activeFrame, setActiveFrame] = useState(defaultIdx >= 0 ? defaultIdx : 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [hovClose, setHovClose] = useState(false);
  const [hovDownload, setHovDownload] = useState(false);
  const [hovThumb, setHovThumb] = useState(null);
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  const isDraggingRef = useRef(false);

  const currentFrame = frms[activeFrame];
  const isFinalized = currentFrame?.finalized ?? false;
  const sn = shotNumber ?? MOCK_SHOT_VIDEO_DETAIL.shotNumber;
  const src = videoSrc ?? MOCK_SHOT_VIDEO_DETAIL.videoSrc;

  function fmtTime(secs) {
    if (!isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onTimeUpdate = () => setCurrentTime(vid.currentTime);
    const onLoaded = () => { setVideoDuration(vid.duration); vid.volume = volume; };
    const onEnded = () => setIsPlaying(false);
    vid.addEventListener('timeupdate', onTimeUpdate);
    vid.addEventListener('loadedmetadata', onLoaded);
    vid.addEventListener('ended', onEnded);
    return () => {
      vid.removeEventListener('timeupdate', onTimeUpdate);
      vid.removeEventListener('loadedmetadata', onLoaded);
      vid.removeEventListener('ended', onEnded);
    };
  }, []);

  function togglePlay() {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) { vid.play(); setIsPlaying(true); }
    else { vid.pause(); setIsPlaying(false); }
  }

  function seekFromEvent(e, bar) {
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const vid = videoRef.current;
    if (vid && isFinite(vid.duration)) {
      vid.currentTime = ratio * vid.duration;
      setCurrentTime(vid.currentTime);
    }
  }

  function handleProgressMouseDown(e) {
    isDraggingRef.current = true;
    seekFromEvent(e, progressBarRef.current);
    const onMove = (ev) => { if (isDraggingRef.current) seekFromEvent(ev, progressBarRef.current); };
    const onUp = () => { isDraggingRef.current = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function handleVolumeClick(e) {
    const rect = volumeBarRef.current.getBoundingClientRect();
    const v = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
  }

  const progressPct = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          display: 'flex', flexDirection: 'column', width: '960px',
          borderRadius: '16px', overflow: 'hidden',
          boxShadow: '#00000099 -10px 24px 64px',
          backgroundColor: '#161616', border: '1px solid #FFFFFF14',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, paddingTop: '20px', paddingBottom: '20px',
          paddingLeft: '24px', paddingRight: '24px', backgroundColor: '#161616',
        }}>
          <span style={{ fontFamily: FONT_MEDIUM, fontWeight: 500, fontSize: '16px', lineHeight: '20px', letterSpacing: '0.01em', color: '#FFFFFF' }}>查看详情</span>
          <button
            type="button"
            style={{
              width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: hovClose ? '#FFFFFF14' : 'transparent', border: 'none', cursor: 'pointer',
              borderRadius: '6px', padding: 0, flexShrink: 0, transition: 'background 0.12s',
            }}
            onMouseEnter={() => setHovClose(true)}
            onMouseLeave={() => setHovClose(false)}
            onClick={onClose}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <path d="M12 4L4 12M4 4L12 12" stroke="#FFFFFF99" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', height: '540px' }}>
          {/* Left: video player */}
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, flexShrink: 1, flexBasis: '0%', minWidth: 0, minHeight: 0, backgroundColor: '#0D0D0D' }}>
            {/* Main video preview */}
            <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: '0%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, backgroundColor: '#0A0A0A' }}>
              <div style={{
                width: '100%', aspectRatio: '16/9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', alignSelf: 'stretch', position: 'relative',
                backgroundColor: '#111111',
              }}>
                {/* Real video element */}
                <video
                  ref={videoRef}
                  src={src}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                  preload="metadata"
                />
                {/* Bottom gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'linear-gradient(in oklab 180deg, oklab(0% 0 0 / 0%) 40%, oklab(0% 0 0 / 40%) 100%)',
                  pointerEvents: 'none',
                }} />
                {/* Play/pause button */}
                <button
                  type="button"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', position: 'relative', flexShrink: 0,
                    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                    backgroundColor: '#FFFFFF1F', border: '1px solid #FFFFFF33',
                    width: '56px', height: '56px', cursor: 'pointer',
                  }}
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                      <rect x="4" y="4" width="4" height="12" rx="1" fill="#FFFFFF" />
                      <rect x="12" y="4" width="4" height="12" rx="1" fill="#FFFFFF" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M7 5L16 10L7 15V5Z" fill="#FFFFFF" />
                    </svg>
                  )}
                </button>
                {/* Shot label */}
                <div style={{
                  position: 'absolute', top: '12px', left: '12px',
                  borderRadius: '6px', paddingTop: '4px', paddingBottom: '4px',
                  paddingLeft: '8px', paddingRight: '8px',
                  backgroundColor: '#00000080',
                }}>
                  <span style={{ fontFamily: FONT, fontSize: '11px', lineHeight: '14px', letterSpacing: '0.02em', color: '#FFFFFF99' }}>镜头 {sn}</span>
                </div>
              </div>
            </div>

            {/* Controls bar */}
            <div style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: '14px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px',
              gap: '10px', backgroundColor: '#111111',
            }}>
              {/* Play/pause small */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  type="button"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', flexShrink: 0,
                    backgroundColor: '#FFFFFF1A', border: '1px solid #FFFFFF26',
                    width: '32px', height: '32px', cursor: 'pointer',
                  }}
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                      <rect x="2.5" y="2.5" width="3" height="9" rx="0.75" fill="#FFFFFF" />
                      <rect x="8.5" y="2.5" width="3" height="9" rx="0.75" fill="#FFFFFF" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M5 3L12 7L5 11V3Z" fill="#FFFFFF" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Progress */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF99', flexShrink: 0, width: '36px' }}>{fmtTime(currentTime)}</span>
                <div
                  ref={progressBarRef}
                  style={{ flexGrow: 1, height: '12px', display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
                  onMouseDown={handleProgressMouseDown}
                >
                  <div style={{ width: '100%', height: '3px', borderRadius: '2px', backgroundColor: '#FFFFFF1F', position: 'relative' }}>
                    <div style={{ width: `${progressPct}%`, height: '100%', borderRadius: '2px', backgroundColor: '#FFFFFFB3', position: 'relative' }}>
                      <div style={{
                        position: 'absolute', right: '-5px', top: '50%',
                        width: '10px', height: '10px', borderRadius: '50%',
                        boxShadow: '#00000080 0px 0px 4px', backgroundColor: '#FFFFFF',
                        transform: 'translateY(-50%)',
                      }} />
                    </div>
                  </div>
                </div>
                <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF40', flexShrink: 0, width: '36px', textAlign: 'right' }}>{fmtTime(videoDuration)}</span>
              </div>
              {/* Volume */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.4, flexShrink: 0 }}>
                  <path d="M3 6H1V10H3L7 13V3L3 6Z" fill="#FFFFFF" />
                  <path d="M10 5C11.1 6.1 11.1 9.9 10 11M12.5 3C14.7 5.2 14.7 10.8 12.5 13" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <div
                  ref={volumeBarRef}
                  style={{ width: '60px', height: '12px', display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
                  onClick={handleVolumeClick}
                >
                  <div style={{ width: '100%', height: '3px', borderRadius: '2px', backgroundColor: '#FFFFFF1F' }}>
                    <div style={{ width: `${volume * 100}%`, height: '100%', borderRadius: '2px', backgroundColor: '#FFFFFF99' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnails strip */}
            <div style={{
              flexShrink: 0,
              paddingTop: '12px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px',
              backgroundColor: '#111111', borderTop: '1px solid #FFFFFF14',
            }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                {frms.map((frm, idx) => {
                  const isActive = activeFrame === idx;
                  const isHov = hovThumb === idx;
                  return (
                    <div
                      key={frm.id}
                      style={{
                        borderRadius: '6px', overflow: 'hidden',
                        width: '120px', height: '84px', flexShrink: 0,
                        boxShadow: isActive ? '#2DC3E166 0px 0px 10px 1px' : 'none',
                        backgroundColor: '#FFFFFF14',
                        border: isActive ? '1px solid #2DC3E1' : '1px solid #FFFFFF33',
                        cursor: 'pointer', position: 'relative',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      onClick={() => setActiveFrame(idx)}
                      onMouseEnter={() => setHovThumb(idx)}
                      onMouseLeave={() => setHovThumb(null)}
                    >
                      <div style={{
                        width: '100%', height: '100%',
                        backgroundImage: `url(${frm.src ?? 'https://app.paper.design/static/flowers.webp'})`,
                        backgroundSize: 'cover', backgroundPosition: '50%',
                      }} />
                      {isHov && (
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          paddingTop: '8px', paddingBottom: '4px', paddingLeft: '4px', paddingRight: '4px',
                          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px',
                          backgroundImage: 'linear-gradient(in oklab 180deg, oklab(0% 0 0 / 0%) 0%, oklab(0% 0 0 / 80%) 100%)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', padding: '2px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setActiveFrame(idx); }} title="放大查看">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                              <path d="M5.333 2H2.667C2.298 2 2 2.298 2 2.667V5.333" stroke="#FFFFFF" strokeLinejoin="round" />
                              <path d="M5.333 14H2.667C2.298 14 2 13.701 2 13.333V10.667" stroke="#FFFFFF" strokeLinejoin="round" />
                              <path d="M10.667 14H13.333C13.701 14 14 13.701 14 13.333V10.667" stroke="#FFFFFF" strokeLinejoin="round" />
                              <path d="M10.667 2H13.333C13.701 2 14 2.298 14 2.667V5.333" stroke="#FFFFFF" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', padding: '2px', cursor: 'pointer' }} title="下载">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ width: '16px', height: '16px', rotate: '180deg', flexShrink: 0, transformOrigin: '50% 50%' }}>
                              <path d="M8.003 4.7V14" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M4 8.667L8 4.667L12 8.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M4 2H12" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: info panel */}
          <div style={{
            width: '280px', display: 'flex', flexDirection: 'column',
            height: '540px', flexShrink: 0,
            backgroundColor: '#161616', borderLeft: '1px solid #FFFFFF0F',
          }}>
            <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: '0%', overflowY: 'auto', minHeight: 0 }}>
              {/* Finalized status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
                <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF99' }}>是否定稿</span>
                {isFinalized ? (
                  <div style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '2px', paddingBottom: '2px', borderRadius: '4px', boxShadow: '#FFFFFF14 0px 0px 0px 1px inset', backgroundColor: '#7AE5B91A' }}>
                    <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#7AE5B9' }}>定稿</span>
                  </div>
                ) : (
                  <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFF66' }}>否</span>
                )}
              </div>

              {/* Shot number — no divider above */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px', gap: '10px' }}>
                <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF99' }}>分镜编号</span>
                <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFFCC' }}>{sn}</span>
              </div>

              <div style={{ height: '1px', backgroundColor: '#FFFFFF0A', marginLeft: '20px', marginRight: '20px' }} />

              {/* AI Prompt */}
              <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px', gap: '10px' }}>
                <span style={{ fontFamily: FONT, fontSize: '11px', lineHeight: '14px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF99' }}>AI 提示词</span>
                <p style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '20px', letterSpacing: '0.01em', color: '#FFFFFFCC', margin: 0 }}>{prompt ?? MOCK_SHOT_VIDEO_DETAIL.prompt}</p>
              </div>

              <div style={{ height: '1px', backgroundColor: '#FFFFFF0A', marginLeft: '20px', marginRight: '20px' }} />

              {/* Generation params */}
              <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px', gap: '12px' }}>
                <span style={{ fontFamily: FONT, fontSize: '11px', lineHeight: '14px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF99' }}>生成参数</span>
                {[
                  { label: '模型', value: model ?? MOCK_SHOT_VIDEO_DETAIL.model },
                  { label: '分辨率', value: resolution ?? MOCK_SHOT_VIDEO_DETAIL.resolution },
                  { label: '时长', value: duration ?? MOCK_SHOT_VIDEO_DETAIL.duration },
                  { label: '比例', value: ratio ?? MOCK_SHOT_VIDEO_DETAIL.ratio },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF99' }}>{label}</span>
                    <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFFCC' }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ height: '1px', backgroundColor: '#FFFFFF0A', marginLeft: '20px', marginRight: '20px' }} />

              {/* AI generated time */}
              <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px', gap: '4px' }}>
                <span style={{ fontFamily: FONT, fontSize: '11px', lineHeight: '14px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF99' }}>AI 生成时间</span>
                <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF66' }}>{generatedAt ?? MOCK_SHOT_VIDEO_DETAIL.generatedAt}</span>
              </div>

              <div style={{ flexGrow: 1 }} />
            </div>

            {/* Sticky download button */}
            <div style={{ flexShrink: 0, paddingTop: '16px', paddingBottom: '20px', paddingLeft: '20px', paddingRight: '20px' }}>
              <button
                type="button"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', height: '40px', borderRadius: '8px', gap: '8px',
                  backgroundColor: hovDownload ? '#FFFFFF1F' : '#FFFFFF14',
                  border: '1px solid #FFFFFF1F', cursor: 'pointer', transition: 'background-color 0.12s',
                }}
                onMouseEnter={() => setHovDownload(true)}
                onMouseLeave={() => setHovDownload(false)}
                onClick={onDownload}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M7 2V9M7 9L4 6.5M7 9L10 6.5M2 11H12" stroke="#FFFFFF99" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: FONT, fontSize: '13px', lineHeight: '16px', letterSpacing: '0.01em', color: '#FFFFFF99' }}>下载视频</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssetCard({ name, bgColor = '#252525', url = null, starred = false, selected = false, batchMode = false, showStar = false, assetType = 'asset', onDownload, onDelete, onStar, onSelect, asset = {} }) {
  const [hov, setHov] = useState(false);
  const [starAnim, setStarAnim] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [favorited, setFavorited] = useState(starred);

  function handleOpen() {
    if (batchMode) { onSelect?.(); return; }
    const id = asset.id;
    if (assetType === 'shot_video') {
      apiGetShotVideoDetail(id).then((d) => { setDetailData(d); setDetailOpen(true); });
    } else if (assetType === 'shot') {
      apiGetShotDetail(id).then((d) => { setDetailData(d); setDetailOpen(true); });
    } else {
      apiGetAssetDetail(id).then((d) => { setDetailData(d); setDetailOpen(true); });
    }
  }

  function handleStar(e) {
    e.stopPropagation();
    setStarAnim(true);
    setTimeout(() => setStarAnim(false), 300);
    onStar?.();
  }

  return (
    <>
    <div
      style={{
        width: '320px',
        height: '180px',
        borderRadius: '10px',
        backgroundColor: '#1C1C1C',
        border: selected ? '1px solid #2DC3E1' : hov ? '1px solid #FFFFFF33' : '1px solid #FFFFFF0F',
        overflow: 'hidden',
        flexShrink: 0,
        transition: 'border-color 0.15s',
        cursor: 'pointer',
        position: 'relative',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => { if (batchMode) onSelect?.(); else handleOpen(); }}
    >
      <div style={{ width: '100%', height: '100%', backgroundColor: url ? 'transparent' : bgColor, position: 'relative' }}>
        {url && (
          <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
        {batchMode ? (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            border: selected ? '1px solid #2DC3E1' : '1px solid rgba(255,255,255,0.5)',
            backgroundColor: selected ? '#2DC3E1' : 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {selected && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ) : hov && (
          <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
            <MoreMenu onDownload={onDownload} onDelete={onDelete} />
          </div>
        )}
        {showStar && !batchMode && (
          <button
            type="button"
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: hov || starred ? 'flex' : 'none',
              transform: starAnim ? 'scale(1.4)' : 'scale(1)',
              transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            onClick={handleStar}
          >
            <StarIcon filled={starred} />
          </button>
        )}
      </div>
    </div>
    {detailOpen && assetType === 'shot_video' && (
      <ShotVideoDetailModal onClose={() => setDetailOpen(false)} onDownload={onDownload}
        shotNumber={detailData?.shotNumber} prompt={detailData?.prompt} model={detailData?.model}
        resolution={detailData?.resolution} duration={detailData?.duration} ratio={detailData?.ratio}
        generatedAt={detailData?.generatedAt} frames={detailData?.frames} videoSrc={detailData?.videoSrc}
      />
    )}
    {detailOpen && assetType === 'shot' && (
      <ShotDetailModal onClose={() => setDetailOpen(false)} onDownload={onDownload}
        shotNumber={detailData?.shotNumber} prompt={detailData?.prompt} model={detailData?.model}
        resolution={detailData?.resolution} generatedAt={detailData?.generatedAt} images={detailData?.images}
      />
    )}
    {detailOpen && assetType !== 'shot' && assetType !== 'shot_video' && showStar && (
      <ImageDetailModal
        card={{
          imageUrl: url || detailData?.url,
          prompt: detailData?.prompt,
          model: detailData?.model,
          ratio: detailData?.ratio,
          resolution: detailData?.resolution,
          refImages: detailData?.refImages,
          generatedAt: detailData?.generatedAt,
        }}
        onClose={() => setDetailOpen(false)}
        onDelete={() => { setDetailOpen(false); onDelete?.(); }}
        favorited={favorited}
        onToggleFavorite={() => { setFavorited((v) => !v); onStar?.(); }}
      />
    )}
    {detailOpen && assetType !== 'shot' && assetType !== 'shot_video' && !showStar && (
      <AssetDetailModal onClose={() => setDetailOpen(false)} onDownload={onDownload}
        name={detailData?.name ?? name} description={detailData?.description} prompt={detailData?.prompt} model={detailData?.model}
        ratio={detailData?.ratio} resolution={detailData?.resolution} generatedAt={detailData?.generatedAt} images={detailData?.images}
      />
    )}
    </>
  );
}

function BatchActionBtn({ children, onClick }) {
  return (
    <GhostButton onClick={onClick}>
      <span style={{ fontFamily: FONT, fontSize: '14px', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </GhostButton>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: '24px',
      paddingTop: '16px',
      paddingLeft: '24px',
      paddingRight: '24px',
      height: '48px',
    }}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: isActive ? FONT_MEDIUM : FONT,
              fontSize: '14px',
              lineHeight: '18px',
              color: isActive ? '#FFFFFF' : '#FFFFFF99',
              transition: 'color 0.12s',
            }}
            onClick={() => onChange(tab.key)}
          >
            <span>{tab.label}</span>
            {isActive && (
              <div style={{ height: '2px', alignSelf: 'stretch', flexShrink: 0, backgroundColor: '#DDDDDD' }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

function ModuleTabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      paddingLeft: '24px',
      paddingRight: '24px',
      gap: '24px',
      borderBottom: '1px solid #FFFFFF14',
    }}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            style={{
              background: 'none',
              border: 'none',
              borderBottom: isActive ? '2px solid #2DC3E1' : '2px solid transparent',
              paddingTop: '12px',
              paddingBottom: '6px',
              cursor: 'pointer',
              fontFamily: isActive ? FONT_MEDIUM : FONT,
              fontSize: '16px',
              color: isActive ? '#2DC3E1' : '#FFFFFF99',
              transition: 'color 0.12s',
            }}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

const MOCK_PROJECTS = [
  { id: 'p1', name: '星际迷途', count: 24 },
  { id: 'p2', name: '暗夜追踪', count: 18 },
  { id: 'p3', name: '光影之间', count: 31 },
  { id: 'p4', name: '未来边界', count: 9 },
];

const PROJECT_CATEGORY_TABS = [
  { key: 'chars', label: '角色' },
  { key: 'scenes', label: '场景' },
  { key: 'props', label: '道具' },
  { key: 'storyboard_img', label: '分镜图' },
  { key: 'storyboard_video', label: '分镜视频' },
  { key: 'audio', label: '音频' },
  { key: 'final', label: '成片' },
];

const CREATIVE_TYPE_TABS = [
  { key: 'image', label: '图片' },
  { key: 'video', label: '视频' },
  { key: 'dubbing', label: '配音' },
];

const CREATIVE_DAYS = {
  image: [
    {
      date: '今天',
      cards: [
        { id: 'img1', name: '镜头_001.jpg' },
        { id: 'img2', name: '场景草图.png' },
        { id: 'img3', name: '角色设定.jpg' },
        { id: 'img4', name: '道具参考.png' },
      ],
    },
    {
      date: '昨天',
      cards: [
        { id: 'img5', name: '分镜_A01.jpg' },
        { id: 'img6', name: '背景板.png' },
      ],
    },
  ],
  video: [
    {
      date: '今天',
      cards: [
        { id: 'vid1', name: '第1集_预览.mp4' },
        { id: 'vid2', name: '第2集_预览.mp4' },
      ],
    },
    {
      date: '昨天',
      cards: [
        { id: 'vid3', name: '片头动画.mp4' },
      ],
    },
  ],
  dubbing: [
    {
      date: '今天',
      cards: [
        { id: 'dub1', name: '主角旁白_01', duration: '0:32' },
        { id: 'dub2', name: '主角旁白_02', duration: '0:45' },
        { id: 'dub3', name: '反派台词', duration: '1:08' },
      ],
    },
  ],
};

const MOCK_PROJECT_ASSETS = {
  chars: [
    { id: 'c1', name: '老虎主角', starred: true, bgColor: '#252525' },
    { id: 'c2', name: '老虎姈姈', starred: false, bgColor: '#1F2320' },
    { id: 'c3', name: '老虎弟弟', starred: false, bgColor: '#20201F' },
    { id: 'c4', name: '老虎妹妹', starred: false, bgColor: '#202024' },
    { id: 'c5', name: '小老虎 A', starred: false, bgColor: '#1F2020' },
    { id: 'c6', name: '反派狼', starred: false, bgColor: '#1D2020' },
    { id: 'c7', name: '猎人爷爷', starred: false, bgColor: '#21201D' },
    { id: 'c8', name: '神秘猫咪', starred: false, bgColor: '#1E1E22' },
  ],
  scenes: [
    { id: 's1', name: '森林入口', starred: false, bgColor: '#1A2018' },
    { id: 's2', name: '老虎洞穴', starred: true, bgColor: '#1E2020' },
    { id: 's3', name: '山顶瞭望台', starred: false, bgColor: '#1C1E1A' },
    { id: 's4', name: '村庄广场', starred: false, bgColor: '#201E1A' },
  ],
  props: [
    { id: 'p1', name: '猎人陷阱', starred: false, bgColor: '#201E1A' },
    { id: 'p2', name: '老虎项圈', starred: true, bgColor: '#1E1E22' },
    { id: 'p3', name: '神秘宝箱', starred: false, bgColor: '#1A1E20' },
  ],
  storyboard_img: [
    { id: 'si1', name: '第1集_镜头01', starred: false, bgColor: '#1E2022' },
    { id: 'si2', name: '第1集_镜头02', starred: false, bgColor: '#201E22' },
    { id: 'si3', name: '第1集_镜头03', starred: true, bgColor: '#1E2020' },
    { id: 'si4', name: '第2集_镜头01', starred: false, bgColor: '#22201E' },
    { id: 'si5', name: '第2集_镜头02', starred: false, bgColor: '#1E2220' },
  ],
  storyboard_video: [
    { id: 'sv1', name: '第1集_预览', starred: false, bgColor: '#1A1E24' },
    { id: 'sv2', name: '第2集_预览', starred: false, bgColor: '#1E1A24' },
  ],
  audio: [
    { id: 'au1', name: '主题曲_片头', starred: true, duration: '2:34' },
    { id: 'au2', name: '背景音乐_森林', starred: false, duration: '4:12' },
    { id: 'au3', name: '音效_老虎吼叫', starred: false, duration: '0:08' },
  ],
  final: [
    { id: 'f1', name: '第1集_成片', starred: true, bgColor: '#1A1E22' },
    { id: 'f2', name: '第2集_成片', starred: false, bgColor: '#1E1A22' },
  ],
};

function FavFilterCheckbox({ checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
      <div
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '4px',
          border: checked ? '1px solid #2DC3E1' : '1px solid rgba(255,255,255,0.3)',
          backgroundColor: checked ? '#2DC3E1' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.12s',
        }}
        onClick={onChange}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ fontFamily: FONT, fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>只看收藏</span>
    </label>
  );
}

function ProjectListItem({ project, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        paddingTop: '10px',
        paddingBottom: '10px',
        paddingLeft: '12px',
        paddingRight: '12px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: active ? '#FFFFFF0F' : hov ? '#FFFFFF08' : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 0.12s',
        textAlign: 'left',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
    >
      <span style={{
        flex: 1,
        fontFamily: active ? FONT_MEDIUM : FONT,
        fontWeight: active ? 500 : 400,
        fontSize: '14px',
        color: active ? '#FFFFFF' : '#FFFFFF99',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>{project.name}</span>
      <span style={{
        fontFamily: FONT,
        fontSize: '12px',
        color: '#FFFFFF99',
        flexShrink: 0,
      }}>{project.count}</span>
    </button>
  );
}

function ProjectAssetsPanel() {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [activeCategory, setActiveCategory] = useState('chars');
  const [batchMode, setBatchMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [favOnly, setFavOnly] = useState(false);
  const [assetsMap, setAssetsMap] = useState({});

  useEffect(() => {
    apiGetProjects().then((list) => {
      setProjects(list);
      setActiveProject((prev) => prev ?? list[0]?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (activeProject == null) return;
    apiGetProjectAssets(activeProject).then(setAssetsMap);
  }, [activeProject]);

  const categoryAssets = assetsMap[activeCategory] || [];
  const filtered = favOnly ? categoryAssets.filter((a) => a.starred) : categoryAssets;

  function toggleStar(id) {
    setAssetsMap((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory].map((a) => a.id === id ? { ...a, starred: !a.starred } : a),
    }));
  }

  function deleteAsset(id) {
    setAssetsMap((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory].filter((a) => a.id !== id),
    }));
  }

  function deleteSelected() {
    const ids = selected;
    setAssetsMap((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory].filter((a) => !ids.has(a.id)),
    }));
    setSelected(new Set());
  }

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAll() {
    const allIds = filtered.map((a) => a.id);
    const isAllSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
    setSelected(isAllSelected ? new Set() : new Set(allIds));
  }

  function exitBatch() {
    setBatchMode(false);
    setSelected(new Set());
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div style={{
        width: '220px',
        flexShrink: 0,
        paddingTop: '16px',
        paddingBottom: '16px',
        paddingLeft: '12px',
        paddingRight: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        borderRight: '1px solid #FFFFFF14',
        overflowY: 'auto',
      }}>
        <div style={{
          padding: '4px 8px 8px 8px',
          fontFamily: FONT,
          fontSize: '14px',
          color: '#FFFFFF99',
          letterSpacing: '0.02em',
        }}>项目列表</div>
        {projects.map((p) => (
          <ProjectListItem
            key={p.id}
            project={p}
            active={activeProject === p.id}
            onClick={() => { setActiveProject(p.id); exitBatch(); }}
          />
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <TabBar tabs={PROJECT_CATEGORY_TABS} active={activeCategory} onChange={(k) => { setActiveCategory(k); setFavOnly(false); exitBatch(); }} />
          {batchMode ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingLeft: '24px', paddingRight: '24px', gap: '16px', flex: 1, height: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: FONT, fontSize: '14px', color: '#FFFFFF99' }}>已选 {selected.size} 项</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GhostBtn onClick={selectAll}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M14 6.667V13C14 13.552 13.552 14 13 14H3C2.448 14 2 13.552 2 13V3C2 2.448 2.448 2 3 2H10" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5.333 6.667L8.667 9.333L13.667 2.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontFamily: FONT, fontSize: '14px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>全选</span>
                </GhostBtn>
                <GhostBtn onClick={() => {}}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, rotate: '180deg', transformOrigin: '50% 50%' }}>
                    <path d="M8.003 4.7V14" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 8.667L8 4.667L12 8.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 2H12" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontFamily: FONT, fontSize: '14px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>下载</span>
                </GhostBtn>
                <PlainBtn onClick={deleteSelected} danger>
                  <TrashIcon color="#F75F5F" />
                  <span style={{ fontFamily: FONT, fontSize: '14px', color: '#F75F5F', whiteSpace: 'nowrap' }}>删除</span>
                </PlainBtn>
                <PlainBtn onClick={exitBatch}>
                  <span style={{ fontFamily: FONT, fontSize: '14px', color: '#FFFFFFCC', whiteSpace: 'nowrap' }}>取消</span>
                </PlainBtn>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: '24px', paddingRight: '24px', height: '48px', flexShrink: 0 }}>
              <GhostBtn onClick={() => setBatchMode(true)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M11.333 1.667H2.667C2.114 1.667 1.667 2.114 1.667 2.667V11.333C1.667 11.886 2.114 12.333 2.667 12.333H11.333C11.886 12.333 12.333 11.886 12.333 11.333V2.667C12.333 2.114 11.886 1.667 11.333 1.667Z" stroke="#FFFFFF" strokeLinejoin="round" />
                  <path d="M14.667 4.334V14C14.667 14.368 14.368 14.667 14 14.667H4.334" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.333 6.829L6.333 8.67L9.667 5.24" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: FONT, fontSize: '14px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>批量操作</span>
              </GhostBtn>
            </div>
          )}
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingTop: '16px',
          paddingBottom: '24px',
          paddingLeft: '24px',
          paddingRight: '24px',
          display: 'flex',
          flexDirection: activeCategory === 'audio' ? 'column' : 'row',
          flexWrap: activeCategory === 'audio' ? 'nowrap' : 'wrap',
          gap: '8px',
          alignContent: 'flex-start',
        }}>
          {filtered.map((asset) => (
            activeCategory === 'audio' ? (
              <AudioCard
                key={asset.id}
                name={asset.name}
                duration={asset.duration}
                starred={asset.starred}
                selected={batchMode && selected.has(asset.id)}
                batchMode={batchMode}
                onSelect={() => toggleSelect(asset.id)}
                onStar={() => toggleStar(asset.id)}
                onDownload={() => {}}
                onDelete={() => deleteAsset(asset.id)}
              />
            ) : (
              <AssetCard
                key={asset.id}
                name={asset.name}
                bgColor={asset.bgColor || '#252525'}
                url={asset.url || null}
                starred={asset.starred}
                selected={batchMode && selected.has(asset.id)}
                batchMode={batchMode}
                assetType={activeCategory === 'storyboard_img' ? 'shot' : activeCategory === 'storyboard_video' ? 'shot_video' : 'asset'}
                onSelect={() => toggleSelect(asset.id)}
                onStar={() => toggleStar(asset.id)}
                onDownload={() => {}}
                onDelete={() => deleteAsset(asset.id)}
                asset={asset}
              />
            )
          ))}
        </div>
      </div>
    </div>
  );
}

function CreativeAssetsPanel() {
  const [activeType, setActiveType] = useState('image');
  const [batchMode, setBatchMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [allDays, setAllDays] = useState({});
  const days = allDays[activeType] ?? [];

  useEffect(() => {
    apiGetCreativeDays().then(setAllDays);
  }, []);

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAll() {
    const allIds = days.flatMap((d) => d.cards.map((c) => c.id));
    const isAllSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
    setSelected(isAllSelected ? new Set() : new Set(allIds));
  }

  function deleteSelected() {
    const ids = selected;
    setAllDays((prev) => ({
      ...prev,
      [activeType]: prev[activeType].map((d) => ({ ...d, cards: d.cards.filter((c) => !ids.has(c.id)) })).filter((d) => d.cards.length > 0),
    }));
    setSelected(new Set());
  }

  function toggleStar(id) {
    setAllDays((prev) => ({
      ...prev,
      [activeType]: prev[activeType].map((d) => ({ ...d, cards: d.cards.map((c) => c.id === id ? { ...c, starred: !c.starred } : c) })),
    }));
  }

  function exitBatch() {
    setBatchMode(false);
    setSelected(new Set());
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <TabBar tabs={CREATIVE_TYPE_TABS} active={activeType} onChange={(k) => { setActiveType(k); exitBatch(); }} />
        {batchMode ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingLeft: '24px', paddingRight: '24px', gap: '16px', flex: 1, height: '48px' }}>
            <span style={{ fontFamily: FONT, fontSize: '14px', color: '#FFFFFF99' }}>已选 {selected.size} 项</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GhostBtn onClick={selectAll}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M14 6.667V13C14 13.552 13.552 14 13 14H3C2.448 14 2 13.552 2 13V3C2 2.448 2.448 2 3 2H10" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5.333 6.667L8.667 9.333L13.667 2.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: FONT, fontSize: '14px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>全选</span>
              </GhostBtn>
              <GhostBtn onClick={() => {}}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, rotate: '180deg', transformOrigin: '50% 50%' }}>
                  <path d="M8.003 4.7V14" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 8.667L8 4.667L12 8.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 2H12" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: FONT, fontSize: '14px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>下载</span>
              </GhostBtn>
              <PlainBtn onClick={deleteSelected} danger>
                <TrashIcon color="#F75F5F" />
                <span style={{ fontFamily: FONT, fontSize: '14px', color: '#F75F5F', whiteSpace: 'nowrap' }}>删除</span>
              </PlainBtn>
              <PlainBtn onClick={exitBatch}>
                <span style={{ fontFamily: FONT, fontSize: '14px', color: '#FFFFFFCC', whiteSpace: 'nowrap' }}>取消</span>
              </PlainBtn>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: '24px', paddingRight: '24px', height: '48px', flexShrink: 0 }}>
            <GhostBtn onClick={() => setBatchMode(true)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M11.333 1.667H2.667C2.114 1.667 1.667 2.114 1.667 2.667V11.333C1.667 11.886 2.114 12.333 2.667 12.333H11.333C11.886 12.333 12.333 11.886 12.333 11.333V2.667C12.333 2.114 11.886 1.667 11.333 1.667Z" stroke="#FFFFFF" strokeLinejoin="round" />
                <path d="M14.667 4.334V14C14.667 14.368 14.368 14.667 14 14.667H4.334" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4.333 6.829L6.333 8.67L9.667 5.24" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: FONT, fontSize: '14px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>批量操作</span>
            </GhostBtn>
          </div>
        )}
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingTop: '16px',
        paddingBottom: '16px',
        paddingLeft: '32px',
        paddingRight: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}>
        {days.map((day) => (
          <div key={day.date} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontFamily: FONT, fontSize: '14px', color: '#FFFFFF99', flexShrink: 0 }}>{day.date}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: activeType === 'dubbing' ? 'column' : 'row', flexWrap: activeType === 'dubbing' ? 'nowrap' : 'wrap', gap: activeType === 'dubbing' ? '8px' : '16px' }}>
              {day.cards.map((card) => (
                activeType === 'dubbing' ? (
                  <AudioCard
                    key={card.id}
                    name={card.name}
                    duration={card.duration}
                    starred={card.starred || false}
                    selected={batchMode && selected.has(card.id)}
                    batchMode={batchMode}
                    onSelect={() => toggleSelect(card.id)}
                    onStar={() => toggleStar(card.id)}
                    onDownload={() => {}}
                    onDelete={() => {}}
                  />
                ) : (
                  <AssetCard
                    key={card.id}
                    name={card.name}
                    bgColor="#1F2324"
                    url={card.url || null}
                    starred={card.starred || false}
                    selected={batchMode && selected.has(card.id)}
                    batchMode={batchMode}
                    showStar
                    onSelect={() => toggleSelect(card.id)}
                    onStar={() => toggleStar(card.id)}
                    onDownload={() => {}}
                    onDelete={() => {}}
                    asset={card}
                  />
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const MODULE_TABS = [
  { key: 'project', label: '项目资产' },
  { key: 'creative', label: '创作资产' },
];

export default function AssetsPage() {
  const [activeModule, setActiveModule] = useState('project');

  return (
    <div style={{
      flex: '1 1 0%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%',
      paddingBottom: '24px',
      paddingRight: '24px',
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: '1px solid #FFFFFF14',
        backgroundColor: '#161616',
        overflow: 'hidden',
      }}>
        <ModuleTabBar tabs={MODULE_TABS} active={activeModule} onChange={setActiveModule} />
        {activeModule === 'project' ? <ProjectAssetsPanel /> : <CreativeAssetsPanel />}
      </div>
    </div>
  );
}