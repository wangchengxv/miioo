import { useRef, useState } from 'react';

const FONT = "'AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif";
const FONT_MEDIUM = "'AlibabaPuHuiTi_2_65_Medium','Alibaba_PuHuiTi_2.0',system-ui,sans-serif";

// coverImg: 前端写死的封面占位图路径，后期替换为真实图片资源
// prompt: 传给后端的风格提示词，后端接入时直接读取此字段
const VISUAL_STYLES = [
  { value: 'realistic', label: '写实',    coverImg: null, prompt: 'photorealistic, cinematic lighting, high detail, 8k' },
  { value: 'anime',     label: '动漫',    coverImg: null, prompt: 'anime style, cel shading, vibrant colors, studio ghibli' },
  { value: 'ink',       label: '水墨',    coverImg: null, prompt: 'Chinese ink wash painting, monochrome, brush strokes, traditional' },
  { value: 'cyber',     label: '赛博朋克', coverImg: null, prompt: 'cyberpunk, neon lights, rain, dark city, futuristic' },
  { value: 'retro',     label: '复古胶片', coverImg: null, prompt: 'vintage film, grain, warm tones, 35mm, nostalgic' },
  { value: 'custom',    label: '自定义',   coverImg: null, prompt: null },
];

const PRIMARY_BTN_GRADIENT =
  'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 30%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, #FFFFFF14, #FFFFFF14)';

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2.667 2.667L13.333 13.333" stroke="#FFFFFF66" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2.667 13.333L13.333 2.667" stroke="#FFFFFF66" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="#FFFFFF33" strokeWidth="1.5" />
      <circle cx="8.5" cy="8.5" r="1.5" stroke="#FFFFFF33" strokeWidth="1.5" />
      <path d="M3 15l5-5 4 4 3-3 6 6" stroke="#FFFFFF33" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <line x1="10" y1="4" x2="10" y2="16" stroke="#FFFFFF33" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4" y1="10" x2="16" y2="10" stroke="#FFFFFF33" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 占位图背景色，后期 coverImg 有值时直接渲染 <img>
const STYLE_PLACEHOLDER_BG = {
  realistic: 'linear-gradient(135deg, #3a3a3a 0%, #1a1a1a 100%)',
  anime:     'linear-gradient(135deg, #2d3a4a 0%, #1a2030 100%)',
  ink:       'linear-gradient(135deg, #252525 0%, #111111 100%)',
  cyber:     'linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 100%)',
  retro:     'linear-gradient(135deg, #2e2416 0%, #1a1208 100%)',
};

function StyleCard({ item, selected, customDesc, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const isCustom = item.value === 'custom';
  const placeholderBg = STYLE_PLACEHOLDER_BG[item.value];

  // 自定义卡片无描述时不显示实线外框，有描述后与其他卡片一致
  const hasCustomContent = isCustom && customDesc;
  const showSolidBorder = !isCustom || hasCustomContent;

  let borderColor;
  if (selected) borderColor = '#2DC3E1';
  else if (!showSolidBorder) borderColor = 'transparent';
  else if (hovered) borderColor = '#FFFFFF33';
  else borderColor = '#FFFFFF14';

  const labelColor = selected ? 'text-text-accent' : isCustom && !customDesc ? 'text-text-disabled' : 'text-text-secondary';

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className="flex flex-col items-center gap-[6px] flex-1 bg-transparent border-0 p-0 cursor-pointer"
      style={{
        transform: pressed ? 'scale(0.96)' : hovered && !selected ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 150ms cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <div
        className="w-full h-[88px] rounded-md overflow-hidden relative shrink-0"
        style={{
          border: `1.5px solid ${borderColor}`,
          transition: 'border-color 150ms ease',
          boxShadow: selected ? '0 0 8px rgba(45,195,225,0.25)' : hovered ? '0 0 6px rgba(255,255,255,0.06)' : 'none',
        }}
      >
        {isCustom ? (
          // 自定义：有描述时显示文字预览，否则显示加号
          customDesc ? (
            <div className="absolute inset-0 bg-input-bg-normal flex items-center justify-center p-[8px]">
              <span className="text-text-secondary text-font-size-12 text-center line-clamp-3" style={{ fontFamily: FONT }}>
                {customDesc}
              </span>
            </div>
          ) : (
            <div className="absolute inset-0 bg-input-bg-normal flex items-center justify-center" style={{ border: '1px dashed #FFFFFF33' }}>
              <PlusIcon />
            </div>
          )
        ) : item.coverImg ? (
          // 有真实封面图时渲染图片（后期替换 coverImg 路径即可）
          <img src={item.coverImg} alt={item.label} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          // 占位渐变背景
          <div className="absolute inset-0" style={{ background: placeholderBg }} />
        )}

        {/* hover 时叠加高亮遮罩（非选中态） */}
        {hovered && !selected && !isCustom && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.06)', transition: 'opacity 150ms ease' }}
          />
        )}
      </div>
      <span className={`text-font-size-12 ${labelColor}`} style={{ fontFamily: FONT }}>
        {item.label}
      </span>
    </button>
  );
}

// 自定义风格二级弹窗
function CustomStyleModal({ open, onClose, onConfirm, initialDesc = '' }) {
  const [styleDesc, setStyleDesc] = useState(initialDesc);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm(styleDesc);
    onClose();
  };

  const handleClose = () => {
    setStyleDesc(initialDesc);
    onClose();
  };

  const borderClass = focused
    ? 'border-input-border-focus'
    : hovered
    ? 'border-input-border-hover'
    : 'border-input-border-normal';
  const glowStyle = focused
    ? { boxShadow: '0px 0px 10px var(--color-glow)', mixBlendMode: 'lighten' }
    : {};

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-surface-overlay backdrop-blur-[20px]"
      onClick={handleClose}
    >
      <div
        className="w-[400px] flex flex-col rounded-large bg-surface-modal overflow-hidden [font-synthesis:none] antialiased"
        style={{ boxShadow: '0px 24px 64px rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[16px] bg-surface-modal shrink-0">
          <span className="text-text-primary text-font-size-16 font-font-weight-medium" style={{ fontFamily: FONT_MEDIUM }}>
            自定义风格
          </span>
          <button type="button" onClick={handleClose} className="cursor-pointer bg-transparent border-0 p-0">
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-[8px] px-[24px] py-[8px] bg-surface-modal">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-font-size-14" style={{ fontFamily: FONT }}>
              风格描述
            </span>
            <span className="text-text-disabled text-font-size-12" style={{ fontFamily: FONT }}>
              {styleDesc.length}/300
            </span>
          </div>
          <textarea
            value={styleDesc}
            placeholder="描述你想要的视觉风格，例如：赛博朋克风格，霓虹灯光，雨夜街道…"
            maxLength={300}
            onChange={(e) => setStyleDesc(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`h-[120px] w-full px-[12px] py-[9px] rounded-medium resize-none bg-input-bg-normal border border-solid ${borderClass} [outline:1px_solid_var(--color-stroke-outline)] outline-offset-0 text-font-size-14 text-input-text-content placeholder:text-input-text-hint antialiased transition-[border-color] duration-150`}
            style={{ fontFamily: FONT, ...glowStyle }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[12px] px-[24px] py-[16px] bg-surface-modal rounded-b-large">
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center h-9 shrink-0 rounded-medium px-[20px] bg-btn-primary-bg-normal border border-btn-primary-border [outline:1px_solid_var(--color-stroke-outline)] outline-offset-0 [box-shadow:var(--color-shadow)_3px_3px_8px] hover:bg-btn-primary-bg-hover active:bg-btn-primary-bg-active cursor-pointer"
          >
            <span className="text-btn-primary-text text-font-size-14" style={{ fontFamily: FONT }}>取消</span>
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex flex-col h-9 shrink-0 rounded-medium p-px [outline:1px_solid_var(--color-stroke-outline)] outline-offset-0 [box-shadow:var(--color-shadow)_3px_3px_8px] cursor-pointer"
            style={{ backgroundImage: PRIMARY_BTN_GRADIENT }}
          >
            <div className="flex items-center grow shrink basis-[0%] rounded-[7px] px-[20px] gap-[4px] bg-btn-primary-bg-normal hover:bg-btn-primary-bg-hover active:bg-btn-primary-bg-active">
              <span className="text-text-primary text-font-size-14" style={{ fontFamily: FONT }}>确定</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewProjectModal({ open, onClose, onConfirm }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [ratio, setRatio] = useState('16:9');
  const [style, setStyle] = useState('realistic');
  const [customStyleDesc, setCustomStyleDesc] = useState('');
  const [customStyleOpen, setCustomStyleOpen] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [nameFocused, setNameFocused] = useState(false);
  const [nameHovered, setNameHovered] = useState(false);
  const [descFocused, setDescFocused] = useState(false);
  const [descHovered, setDescHovered] = useState(false);
  const [coverHovered, setCoverHovered] = useState(false);
  const [coverPressed, setCoverPressed] = useState(false);
  const [nameError, setNameError] = useState(false);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleConfirm = () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    onConfirm?.({ name: name.trim(), desc, ratio, style, customStyleDesc, coverFile });
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDesc('');
    setRatio('16:9');
    setStyle('realistic');
    setCustomStyleDesc('');
    setCoverFile(null);
    setCoverPreview(null);
    setNameError(false);
    onClose?.();
  };

  const handleStyleClick = (s) => {
    if (s.value === 'custom') {
      setCustomStyleOpen(true);
    } else {
      setStyle(s.value);
    }
  };

  const nameBorderClass = nameError
    ? 'border-input-border-wrong'
    : nameFocused
    ? 'border-input-border-focus'
    : nameHovered
    ? 'border-input-border-hover'
    : 'border-input-border-normal';

  const nameGlowStyle = nameFocused && !nameError
    ? { boxShadow: '0px 0px 10px var(--color-glow)', mixBlendMode: 'lighten' }
    : {};

  const descBorderClass = descFocused
    ? 'border-input-border-focus'
    : descHovered
    ? 'border-input-border-hover'
    : 'border-input-border-normal';

  const descGlowStyle = descFocused
    ? { boxShadow: '0px 0px 10px var(--color-glow)', mixBlendMode: 'lighten' }
    : {};

  const styleRows = [VISUAL_STYLES.slice(0, 3), VISUAL_STYLES.slice(3)];

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay backdrop-blur-[20px]"
        onClick={handleClose}
      >
        <div
          className="w-[400px] h-[600px] flex flex-col rounded-large bg-surface-modal overflow-hidden relative [font-synthesis:none] antialiased"
          style={{ boxShadow: '0px 24px 64px rgba(0,0,0,0.6)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-[24px] py-[20px] bg-surface-modal shrink-0">
            <span className="text-text-primary text-font-size-16 font-font-weight-medium" style={{ fontFamily: FONT_MEDIUM }}>
              新建项目
            </span>
            <button type="button" onClick={handleClose} className="cursor-pointer bg-transparent border-0 p-0">
              <CloseIcon />
            </button>
          </div>

          {/* Body */}
          <div
            className="flex flex-col gap-[20px] px-[24px] py-[8px] bg-surface-modal overflow-y-auto flex-1"
            style={{ paddingBottom: '84px' }}
          >
            {/* 项目名称 */}
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center gap-[4px]">
                <span className="text-text-secondary text-font-size-14" style={{ fontFamily: FONT }}>项目名称</span>
                <span className="text-text-accent text-font-size-14" style={{ fontFamily: FONT }}>*</span>
              </div>
              <input
                type="text"
                value={name}
                placeholder="请输入项目名称"
                maxLength={50}
                onChange={(e) => { setName(e.target.value); if (e.target.value.trim()) setNameError(false); }}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                onMouseEnter={() => setNameHovered(true)}
                onMouseLeave={() => setNameHovered(false)}
                className={`h-[36px] w-full px-[12px] rounded-medium bg-input-bg-normal border border-solid ${nameBorderClass} [outline:1px_solid_var(--color-stroke-outline)] outline-offset-0 text-font-size-14 text-input-text-content placeholder:text-input-text-hint antialiased transition-[border-color] duration-150`}
                style={{ fontFamily: FONT, ...nameGlowStyle }}
              />
              {nameError && (
                <span className="text-status-wrong text-font-size-12 px-[12px]" style={{ fontFamily: FONT }}>
                  项目名称不能为空
                </span>
              )}
            </div>

            {/* 项目描述 */}
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center gap-[4px]">
                <span className="text-text-secondary text-font-size-14" style={{ fontFamily: FONT }}>项目描述</span>
                <span className="text-text-disabled text-font-size-12" style={{ fontFamily: FONT }}>选填</span>
              </div>
              <textarea
                value={desc}
                placeholder="简单描述一下这个项目…"
                maxLength={200}
                onChange={(e) => setDesc(e.target.value)}
                onFocus={() => setDescFocused(true)}
                onBlur={() => setDescFocused(false)}
                onMouseEnter={() => setDescHovered(true)}
                onMouseLeave={() => setDescHovered(false)}
                className={`h-[72px] w-full px-[12px] py-[9px] rounded-medium resize-none bg-input-bg-normal border border-solid ${descBorderClass} [outline:1px_solid_var(--color-stroke-outline)] outline-offset-0 text-font-size-14 text-input-text-content placeholder:text-input-text-hint antialiased transition-[border-color] duration-150`}
                style={{ fontFamily: FONT, ...descGlowStyle }}
              />
            </div>

            {/* 选择画面比例 */}
            <div className="[font-synthesis:none] flex flex-col gap-[8px] antialiased">
              <div className="inline-block font-['AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] text-[#FFFFFF99] text-[14px] leading-[18px]">
                选择画面比例
              </div>
              <div className="flex gap-[24px] self-stretch items-center">
                {/* 16:9 */}
                <button
                  type="button"
                  onClick={() => setRatio('16:9')}
                  className="flex items-start gap-[8px] p-0 bg-transparent border-0 cursor-pointer"
                >
                  <div className="shrink-0 relative w-[16px] h-[16px]">
                    <div className={`rounded-[50%] border border-solid [outline:1px_solid_#00000080] w-[16px] h-[16px] ${ratio === '16:9' ? 'bg-[#2DC3E1] border-[#FFFFFF33]' : 'bg-[#090909] border-[#FFFFFF33]'}`} />
                    {ratio === '16:9' && (
                      <div className="absolute left-[50%] top-[50%] rounded-[50%] bg-[#0A0A0A] w-[6px] h-[6px]" style={{ translate: '-50% -50%' }} />
                    )}
                  </div>
                  <div className={`inline-block h-fit font-['AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] text-[14px] leading-[18px] ${ratio === '16:9' ? 'text-white' : 'text-[#FFFFFF99]'}`}>
                    16:9
                  </div>
                  <div className="ml-auto w-[28px] h-[18px] rounded-[3px] shrink-0 [border-width:1.5px] border-solid border-[#FFFFFF33]" />
                </button>
                {/* 9:16 */}
                <button
                  type="button"
                  onClick={() => setRatio('9:16')}
                  className="flex items-center gap-[8px] p-0 bg-transparent border-0 cursor-pointer"
                >
                  <div className="shrink-0 relative w-[16px] h-[16px]">
                    <div className={`rounded-[50%] border border-solid [outline:1px_solid_#00000080] w-[16px] h-[16px] ${ratio === '9:16' ? 'bg-[#2DC3E1] border-[#FFFFFF33]' : 'bg-[#090909] border-[#FFFFFF33]'}`} />
                    {ratio === '9:16' && (
                      <div className="absolute left-[50%] top-[50%] rounded-[50%] bg-[#0A0A0A] w-[6px] h-[6px]" style={{ translate: '-50% -50%' }} />
                    )}
                  </div>
                  <div className={`inline-block h-fit font-['AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] text-[14px] leading-[18px] ${ratio === '9:16' ? 'text-white' : 'text-[#FFFFFF99]'}`}>
                    9:16
                  </div>
                  <div className="ml-auto w-[18px] h-[28px] rounded-[3px] shrink-0 [border-width:1.5px] border-solid border-[#FFFFFF33]" />
                </button>
              </div>
            </div>

            {/* 视觉风格 */}
            <div className="flex flex-col gap-[8px]">
              <span className="text-text-secondary text-font-size-14" style={{ fontFamily: FONT }}>视觉风格</span>
              <div className="flex flex-col gap-[8px]">
                {styleRows.map((row, ri) => (
                  <div key={ri} className="flex gap-[8px]">
                    {row.map((s) => (
                      <StyleCard
                        key={s.value}
                        item={s}
                        selected={style === s.value}
                        customDesc={s.value === 'custom' ? customStyleDesc : ''}
                        onClick={() => handleStyleClick(s)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* 项目封面 */}
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center gap-[4px]">
                <span className="text-text-secondary text-font-size-14" style={{ fontFamily: FONT }}>项目封面</span>
                <span className="text-text-disabled text-font-size-12" style={{ fontFamily: FONT }}>选填</span>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onMouseEnter={() => setCoverHovered(true)}
                onMouseLeave={() => { setCoverHovered(false); setCoverPressed(false); }}
                onMouseDown={() => setCoverPressed(true)}
                onMouseUp={() => setCoverPressed(false)}
                className="flex flex-col items-center justify-center gap-[8px] h-[96px] w-full rounded-medium bg-input-bg-normal border border-dashed cursor-pointer overflow-hidden transition-[border-color,transform] duration-150"
                style={{
                  borderColor: coverHovered ? '#FFFFFF33' : '#FFFFFF1A',
                  transform: coverPressed ? 'scale(0.98)' : 'scale(1)',
                }}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="封面预览" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <UploadIcon />
                    <div className="flex flex-col items-center gap-[2px]">
                      <span className="text-text-secondary text-font-size-12" style={{ fontFamily: FONT }}>点击上传封面图片</span>
                      <span className="text-text-disabled text-font-size-12" style={{ fontFamily: FONT }}>支持 JPG、PNG，建议尺寸 16:9</span>
                    </div>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleCoverChange}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="absolute left-0 right-0 bottom-0 flex items-center justify-end gap-[12px] px-[24px] py-[16px] bg-surface-modal rounded-b-large">
            <button
              type="button"
              onClick={handleClose}
              className="flex items-center h-9 shrink-0 rounded-medium px-[20px] bg-btn-primary-bg-normal border border-btn-primary-border [outline:1px_solid_var(--color-stroke-outline)] outline-offset-0 [box-shadow:var(--color-shadow)_3px_3px_8px] hover:bg-btn-primary-bg-hover active:bg-btn-primary-bg-active cursor-pointer"
            >
              <span className="text-btn-primary-text text-font-size-14" style={{ fontFamily: FONT }}>取消</span>
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex flex-col h-9 shrink-0 rounded-medium p-px [outline:1px_solid_var(--color-stroke-outline)] outline-offset-0 [box-shadow:var(--color-shadow)_3px_3px_8px] cursor-pointer"
              style={{ backgroundImage: PRIMARY_BTN_GRADIENT }}
            >
              <div className="flex items-center grow shrink basis-[0%] rounded-[7px] px-[20px] gap-[4px] bg-btn-primary-bg-normal hover:bg-btn-primary-bg-hover active:bg-btn-primary-bg-active">
                <span className="text-text-primary text-font-size-14" style={{ fontFamily: FONT }}>确定</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <CustomStyleModal
        open={customStyleOpen}
        onClose={() => setCustomStyleOpen(false)}
        onConfirm={(desc) => {
          setCustomStyleDesc(desc);
          setStyle('custom');
        }}
        initialDesc={customStyleDesc}
      />
    </>
  );
}
