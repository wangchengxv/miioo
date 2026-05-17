import { useState, useRef } from 'react';
import ScriptPage from './ScriptPage';

const FONT = "'AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif";
const FONT_MEDIUM = "'AlibabaPuHuiTi_2_65_Medium','Alibaba_PuHuiTi_2.0',system-ui,sans-serif";

// ── Stat card ──────────────────────────────────────────────────────────────

function StatCard({ label, count, images = [], onClick }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const isClickable = !!onClick;

  return (
    <div
      onMouseEnter={() => isClickable && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => isClickable && setPressed(true)}
      onMouseUp={() => isClickable && setPressed(false)}
      onClick={onClick}
      style={{
        height: '200px',
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        borderRadius: '8px',
        padding: '12px 16px',
        position: 'relative',
        background: pressed ? '#252525' : hovered ? '#222222' : '#1D1E1E',
        border: `1px solid ${hovered ? '#FFFFFF26' : '#FFFFFF14'}`,
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'background 0.15s, border-color 0.15s',
        overflow: 'hidden',
      }}
    >
      {[0, 1, 2].map((i) =>
        images[i] ? (
          <img
            key={i}
            src={images[i]}
            alt=""
            style={{ borderRadius: '6px', flex: 1, alignSelf: 'stretch', objectFit: 'cover', minWidth: 0 }}
          />
        ) : (
          <div key={i} style={{ borderRadius: '6px', flex: 1, alignSelf: 'stretch', background: '#DDDDDD1A' }} />
        )
      )}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: -1,
          paddingTop: '18px',
          paddingBottom: '12px',
          paddingLeft: '16px',
          paddingRight: '16px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '4px',
          justifyContent: 'space-between',
          borderRadius: '0 0 8px 8px',
          backgroundImage: 'linear-gradient(in oklab 180deg, oklab(0% 0 0 / 0%) 0%, oklab(0% 0 0 / 60%) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'space-between' }}>
          <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '16px', color: '#FFFFFF' }}>{label}</span>
          <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '16px', color: '#FFFFFF99' }}>{count ?? 0}</span>
        </div>
      </div>
      {/* hover arrow hint */}
      {isClickable && hovered && (
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '20px', height: '20px', borderRadius: '9999px',
          background: '#FFFFFF14',
        }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12L12 4M12 4H6M12 4V10" stroke="#FFFFFF99" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ── Text input ─────────────────────────────────────────────────────────────

function TextInput({ value, onChange, placeholder, maxLength }) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        height: '36px',
        width: '100%',
        borderRadius: '8px',
        paddingLeft: '12px',
        paddingRight: '6px',
        background: focused ? '#252525' : hovered ? '#222222' : '#1D1E1E',
        border: `1px solid ${focused ? '#FFFFFF33' : '#FFFFFF14'}`,
        outline: focused ? '1px solid #2DC3E180' : '1px solid #00000080',
        boxSizing: 'border-box',
        transition: 'background 0.2s, border-color 0.2s, outline 0.2s',
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="placeholder:text-[#FFFFFF66]"
        style={{
          flex: 1,
          minWidth: 0,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontFamily: FONT,
          fontSize: '14px',
          lineHeight: '18px',
          color: '#FFFFFF',
        }}
      />
      {maxLength !== undefined && (
        <span
          style={{
            fontFamily: FONT,
            fontSize: '14px',
            lineHeight: '18px',
            color: '#FFFFFF66',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

// ── Textarea ───────────────────────────────────────────────────────────────

function TextArea({ value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        height: '72px',
        width: '100%',
        borderRadius: '8px',
        padding: '9px 12px',
        background: focused ? '#252525' : hovered ? '#222222' : '#1D1E1E',
        border: `1px solid ${focused ? '#FFFFFF33' : '#FFFFFF14'}`,
        outline: focused ? '1px solid #2DC3E180' : '1px solid #00000080',
        fontFamily: FONT,
        fontSize: '14px',
        lineHeight: '18px',
        color: value ? '#FFFFFF' : '#FFFFFF66',
        resize: 'none',
        boxSizing: 'border-box',
        transition: 'background 0.2s, border-color 0.2s, outline 0.2s',
      }}
    />
  );
}

// ── Cover upload ───────────────────────────────────────────────────────────

function CoverUpload({ coverUrl, onUpload }) {
  const [hovered, setHovered] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUpload(url);
    e.target.value = '';
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        borderRadius: '8px',
        gap: '8px',
        alignSelf: 'stretch',
        flexShrink: 0,
        background: coverUrl ? 'transparent' : '#1D1E1E',
        border: coverUrl ? 'none' : `1.5px dashed ${hovered ? '#FFFFFF33' : '#FFFFFF1A'}`,
        cursor: 'pointer',
        overflow: 'hidden',
        position: 'relative',
        transition: 'border-color 0.2s',
      }}
    >
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      {coverUrl ? (
        <>
          <img src={coverUrl} alt="项目封面" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {hovered && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: '8px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="#FFFFFF99" strokeWidth="1.5" />
                <circle cx="8.5" cy="8.5" r="1.5" stroke="#FFFFFF99" strokeWidth="1.5" />
                <path d="M3 15l5-5 4 4 3-3 6 6" stroke="#FFFFFF99" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: FONT, fontSize: '13px', lineHeight: '18px', color: '#FFFFFF99' }}>点击更换封面</span>
            </div>
          )}
        </>
      ) : (
        <>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <rect x="3" y="3" width="18" height="18" rx="3" stroke={hovered ? '#FFFFFF66' : '#FFFFFF33'} strokeWidth="1.5" style={{ transition: 'stroke 0.2s' }} />
            <circle cx="8.5" cy="8.5" r="1.5" stroke={hovered ? '#FFFFFF66' : '#FFFFFF33'} strokeWidth="1.5" style={{ transition: 'stroke 0.2s' }} />
            <path d="M3 15l5-5 4 4 3-3 6 6" stroke={hovered ? '#FFFFFF66' : '#FFFFFF33'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.2s' }} />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <span style={{ fontFamily: FONT, fontSize: '13px', lineHeight: '18px', color: hovered ? '#FFFFFF99' : '#FFFFFF66', transition: 'color 0.2s' }}>点击上传封面图片</span>
            <span style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '16px', color: '#FFFFFF33' }}>支持 JPG、PNG，建议尺寸 16:9</span>
          </div>
        </>
      )}
    </div>
  );
}

// ── Project name heading (editable inline) ─────────────────────────────────

function ProjectNameHeading({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef(null);

  const startEdit = () => {
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const stopEdit = () => setEditing(false);

  return editing ? (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={stopEdit}
      onKeyDown={(e) => { if (e.key === 'Enter') stopEdit(); }}
      style={{
        fontFamily: FONT_MEDIUM,
        fontWeight: 500,
        fontSize: '20px',
        lineHeight: '24px',
        color: '#FFFFFF',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        borderBottom: '1px solid #FFFFFF33',
        padding: '0 2px',
        minWidth: '120px',
      }}
      autoFocus
    />
  ) : (
    <div
      style={{
        fontFamily: FONT_MEDIUM,
        fontWeight: 500,
        fontSize: '20px',
        lineHeight: '24px',
        color: '#FFFFFF',
        cursor: 'text',
        borderBottom: hovered ? '1px solid #FFFFFF33' : '1px solid transparent',
        padding: '0 2px',
        transition: 'border-color 0.15s',
      }}
      onClick={startEdit}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {value || '项目名称'}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function GlobalSettings({ projectName = '这里是项目名称', onBack, activeStep, onStepChange, onGoToSubject, chars = [], scenes = [], props = [] }) {
  const [name, setName] = useState(projectName);
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  if (activeStep === 'script') {
    return (
      <div
        style={{
          flex: '1 1 0%',
          overflow: 'hidden',
          padding: '0px 24px 24px 0px',
          height: '100%',
          minHeight: 0,
          boxSizing: 'border-box',
          display: 'flex',
        }}
      >
        <ScriptPage onGoToSubject={() => onStepChange?.('subject')} />
      </div>
    );
  }

  return (
    <div
      style={{
        flex: '1 1 0%',
        overflow: 'auto',
        padding: '0px 24px 24px 0px',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          borderRadius: '16px',
          padding: '16px 24px',
          background: '#161616',
          border: '1px solid #FFFFFF14',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header row: project name + search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', alignSelf: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <svg
              width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0, rotate: '90deg', transformOrigin: '50% 50%', cursor: 'pointer' }}
              onClick={onBack}
            >
              <path d="M12 6L8 10L4 6" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <ProjectNameHeading value={name} onChange={setName} />
          </div>
          {/* Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '36px',
              width: '232px',
              paddingLeft: '12px',
              paddingRight: '6px',
              borderRadius: '8px',
              justifyContent: 'space-between',
              flexShrink: 0,
              background: '#1D1E1E',
              border: '1px solid #FFFFFF14',
              outline: '1px solid #00000080',
              boxSizing: 'border-box',
            }}
          >
            <span style={{ flex: 1, fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF66' }}>搜索项目</span>
            <div style={{ display: 'flex', alignItems: 'center', height: '24px', borderRadius: '6px', padding: '0 8px', gap: '4px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <path d="M7 12.667C10.13 12.667 12.667 10.13 12.667 7C12.667 3.87 10.13 1.333 7 1.333C3.87 1.333 1.333 3.87 1.333 7C1.333 10.13 3.87 12.667 7 12.667Z" stroke="#FFFFFF" strokeLinejoin="round" />
                <path d="M11.074 11.074L13.902 13.902" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Asset overview */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px', alignSelf: 'stretch' }}>
          <span style={{ fontFamily: FONT_MEDIUM, fontWeight: 500, fontSize: '16px', lineHeight: '20px', color: '#FFFFFF' }}>资产概况</span>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', alignSelf: 'stretch' }}>
            {[
              { label: '角色', tab: 'char', count: chars.length },
              { label: '场景', tab: 'scene', count: scenes.length },
              { label: '道具', tab: 'prop', count: props.length },
              { label: '剧集结构', tab: null, count: null },
            ].map(({ label, tab, count }) => (
              <StatCard
                key={label}
                label={label}
                count={count}
                onClick={tab ? () => onGoToSubject?.(tab) : undefined}
              />
            ))}
          </div>
        </div>

        {/* Project info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignSelf: 'stretch' }}>
          <span style={{ fontFamily: FONT_MEDIUM, fontWeight: 500, fontSize: '16px', lineHeight: '20px', color: '#FFFFFF' }}>项目信息</span>
          {/* Row 1: 项目名称 + 画面比例 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', width: '50%' }}>
            {/* 项目名称 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF99' }}>项目名称</span>
              <TextInput value={name} onChange={setName} placeholder="输入项目名称" maxLength={50} />
            </div>
            {/* 画面比例 — 只读展示 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF99' }}>画面比例</span>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', height: '36px', flexShrink: 0 }}>
                {/* 16:9 selected */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <div style={{ borderRadius: '9999px', flexShrink: 0, background: '#2DC3E133', border: '1px solid #FFFFFF1A', outline: '1px solid #00000080', width: '16px', height: '16px' }} />
                      <div style={{ borderRadius: '9999px', position: 'absolute', left: '50%', top: '50%', background: '#0A0A0A', width: '6px', height: '6px', translate: '-50% -50%' }} />
                    </div>
                    <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF' }}>16:9</span>
                    <div style={{ marginLeft: 'auto', width: '28px', height: '18px', borderRadius: '3px', flexShrink: 0, borderWidth: '1.5px', borderStyle: 'solid', borderColor: '#FFFFFF33' }} />
                  </div>
                </div>
                {/* 9:16 unselected */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ borderRadius: '9999px', flexShrink: 0, background: '#090909', border: '1px solid transparent', outline: '1px solid #00000080', width: '16px', height: '16px' }} />
                  <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF66' }}>9:16</span>
                  <div style={{ marginLeft: 'auto', width: '18px', height: '28px', borderRadius: '3px', flexShrink: 0, borderWidth: '1.5px', borderStyle: 'solid', borderColor: '#FFFFFF33' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: 项目描述 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '50%' }}>
            <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF99' }}>项目描述</span>
            <TextArea value={description} onChange={setDescription} placeholder="简单描述一下这个项目…" />
          </div>

          {/* Row 3: 视觉风格 + 项目封面 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', width: '50%' }}>
            {/* 视觉风格 — 只读展示 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF99' }}>视觉风格</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                  <div style={{ height: '200px', borderRadius: '6px', overflow: 'hidden', alignSelf: 'stretch', position: 'relative', flexShrink: 0, background: '#2A2A2A' }}>
                    <div
                      style={{
                        position: 'absolute', left: 0, right: 0, bottom: -1,
                        paddingTop: '18px', paddingBottom: '12px', paddingLeft: '16px', paddingRight: '16px',
                        display: 'flex', alignItems: 'flex-end', gap: '4px', justifyContent: 'space-between',
                        borderRadius: '0 0 6px 6px',
                        backgroundImage: 'linear-gradient(in oklab 180deg, oklab(0% 0 0 / 0%) 0%, oklab(0% 0 0 / 60%) 100%)',
                      }}
                    >
                      <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '16px', color: '#FFFFFF' }}>写实</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* 项目封面 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF99' }}>项目封面</span>
              <CoverUpload coverUrl={coverUrl} onUpload={setCoverUrl} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
