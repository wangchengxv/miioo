import { useState, useEffect, useRef } from 'react';

const FONT = "'AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif";
const FONT_MEDIUM = "'AlibabaPuHuiTi_2_65_Medium','Alibaba_PuHuiTi_2.0',system-ui,sans-serif";
const ACCENT_BUTTON_GRADIENT =
  'linear-gradient(in oklab 107.50999999999999deg, oklab(84.6% -0.114 0.031 / 30%) 8.14%, oklab(84.6% -0.114 0.031 / 0%) 54.48%)';

const MODEL_OPTIONS = [
  { label: 'seedream', value: 'seedream' },
  { label: 'Kling', value: 'kling' },
  { label: 'Vidu', value: 'vidu' },
];

const RATIO_OPTIONS = [
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
  { label: '1:1', value: '1:1' },
];

const RESOLUTION_OPTIONS = [
  { label: '1K', value: '1k' },
  { label: '2K', value: '2k' },
  { label: '4K', value: '4k' },
];

const GENERATION_MODES = [
  { label: '主视图', value: 'main' },
  { label: '多视图', value: 'multi' },
];

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M2.667 2.667L13.333 13.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.667 13.333L13.333 2.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M12 6.333L8 10.333L4 6.333H12Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1.333" strokeLinejoin="round" />
    </svg>
  );
}

function SelectField({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const triggerStyle = open
    ? { borderColor: '#2DC3E1', backgroundColor: '#1D1E1E', boxShadow: '0px 0px 10px rgba(45,195,225,0.3)', mixBlendMode: 'lighten' }
    : {};

  return (
    <div className="flex flex-col gap-[8px] self-stretch">
      <div className="text-sm/[18px] text-[#FFFFFF99]" style={{ fontFamily: FONT }}>
        {label}
      </div>
      <div ref={containerRef} className="relative self-stretch">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center h-[36px] w-full rounded-lg px-[12px] gap-[8px] shrink-0 bg-[#1D1E1E] border border-solid border-[#FFFFFF14] outline outline-1 outline-[#00000080] transition-[border-color,background-color] hover:border-[#FFFFFF33] hover:bg-[#222323] active:bg-[#1A1B1B]"
          style={triggerStyle}
          aria-expanded={open}
        >
          <div className="flex-1 text-left text-sm/[18px] text-white" style={{ fontFamily: FONT }}>
            {selected?.label ?? '请选择'}
          </div>
          <ChevronDownIcon />
        </button>

        {open && (
          <div
            className="absolute top-[calc(100%+4px)] left-0 z-10 w-full flex flex-col rounded-lg border border-solid border-[#FFFFFF14] bg-[#1D1E1E] p-[4px]"
            style={{ boxShadow: '0px 4px 16px rgba(0,0,0,0.6)' }}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`flex w-full items-center rounded-md px-[12px] py-[8px] text-left text-sm/[18px] transition-colors ${
                    isSelected
                      ? 'bg-[#FFFFFF14] text-white'
                      : 'text-[#FFFFFFCC] hover:bg-[#FFFFFF0D] hover:text-white active:bg-[#FFFFFF14]'
                  }`}
                  style={{ fontFamily: FONT }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function RadioGroup({ label, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-[8px] self-stretch">
      <div className="text-sm/[18px] text-[#FFFFFF99]" style={{ fontFamily: FONT }}>
        {label}
      </div>
      <div className="flex gap-[24px] self-stretch items-center">
        {options.map((opt) => {
          const checked = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="flex items-center gap-[8px] p-0 bg-transparent border-0 cursor-pointer"
            >
              <div className="shrink-0 relative w-[16px] h-[16px]">
                <div
                  className="rounded-full border border-solid outline outline-1 outline-[#00000080] w-[16px] h-[16px] transition-colors"
                  style={{ backgroundColor: checked ? '#2DC3E1' : '#090909', borderColor: '#FFFFFF33' }}
                />
                {checked && (
                  <div
                    className="absolute rounded-full bg-[#0A0A0A] w-[6px] h-[6px]"
                    style={{ left: '50%', top: '50%', translate: '-50% -50%' }}
                  />
                )}
              </div>
              <span
                className="text-sm/[18px] transition-colors"
                style={{ fontFamily: FONT, color: checked ? '#FFFFFF' : '#FFFFFF99' }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function BatchGenerateModal({ open, onClose, onConfirm }) {
  const [model, setModel] = useState('seedream');
  const [ratio, setRatio] = useState('16:9');
  const [resolution, setResolution] = useState('1k');
  const [mode, setMode] = useState('main');

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm?.({ model, ratio, resolution, mode });
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000066] backdrop-blur-[4px]"
      onClick={onClose}
    >
      <div
        className="[font-synthesis:none] flex flex-col items-start antialiased text-xs/4 w-[400px] rounded-2xl overflow-hidden"
        style={{ boxShadow: '0px 8px 32px rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-[16px] justify-between w-full py-[16px] bg-[#161616] rounded-t-2xl px-[24px]">
          <div className="flex-1 text-base/5 font-medium text-white" style={{ fontFamily: FONT_MEDIUM }}>
            批量生成
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center transition-opacity hover:opacity-70 active:opacity-40"
            aria-label="关闭"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col items-start gap-[16px] py-[8px] w-full px-[24px] bg-[#161616]">
          <SelectField label="选择模型" value={model} options={MODEL_OPTIONS} onChange={setModel} />
          <SelectField label="比例" value={ratio} options={RATIO_OPTIONS} onChange={setRatio} />
          <SelectField label="分辨率" value={resolution} options={RESOLUTION_OPTIONS} onChange={setResolution} />
          <RadioGroup label="生成方式" value={mode} options={GENERATION_MODES} onChange={setMode} />
        </div>

        {/* Footer */}
        <div className="flex items-center gap-[16px] justify-end w-full bg-[#161616] py-[16px] px-[24px] rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center h-[36px] shrink-0 rounded-lg px-[16px] gap-[4px] bg-[#161616] border border-solid border-[#FFFFFF0D] outline outline-1 outline-[#00000080] transition-colors hover:bg-[#1D1E1E] active:bg-[#111111]"
            style={{ boxShadow: '#00000066 3px 3px 8px' }}
          >
            <span className="text-sm/[18px] text-[#FFFFFF99]" style={{ fontFamily: FONT }}>取消</span>
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center h-[36px] shrink-0 rounded-lg px-[16px] gap-[4px] bg-[#2DC3E1] bg-origin-border border border-solid border-[#FFFFFF33] outline outline-1 outline-[#00000080] transition-colors hover:bg-[#53D3ED] active:bg-[#139EBA]"
            style={{ backgroundImage: ACCENT_BUTTON_GRADIENT }}
          >
            <span className="text-sm/[18px] font-medium text-[#090909]" style={{ fontFamily: FONT_MEDIUM }}>开始生成</span>
          </button>
        </div>
      </div>
    </div>
  );
}
