import { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Toggle from './Toggle';
import { apiTestConnection, apiSaveApiConfig, apiGetApiConfig } from '../api/config';

const FONT = "'AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif";
const FONT_MEDIUM = "'AlibabaPuHuiTi_2_65_Medium','Alibaba_PuHuiTi_2.0',system-ui,sans-serif";
const INSET_BORDER_CLASS = 'shadow-[inset_0px_0px_0px_1px_var(--color-white-8)]';
const BUTTON_SHADOW_CLASS = 'shadow-[3px_3px_8px_var(--color-black-40)]';
const ACCENT_BUTTON_GRADIENT =
  'linear-gradient(in oklab 107.50999999999999deg, oklab(84.6% -0.114 0.031 / 30%) 8.14%, oklab(84.6% -0.114 0.031 / 0%) 54.48%)';
const PRIMARY_BUTTON_GRADIENT =
  'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 30%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, #FFFFFF14, #FFFFFF14)';
const RECOMMENDATION_GRADIENT =
  'linear-gradient(in oklab 180deg, oklab(75.5% -0.102 -0.072 / 10%) 0%, oklab(23.4% -0.001 -.0004) 100%)';
const MODEL_DESCRIPTION = 'GPT-5.2 是 GPT-5 系列最新一代旗舰级智能模型，在架构设计、推理能力和应用性能上实现重大突破。相比 GPT-5.1…';
const DEFAULT_PROVIDER_NAME = 'API服务商';
const MODEL_TABS = ['对话模型', '图片模型', '视频模型', '配音模型'];
const TAB_SLIDE_DURATION = 220;
const MAX_PROVIDER_CARDS = 9;
const MAX_CUSTOM_PROVIDERS = MAX_PROVIDER_CARDS - 1;
const PROVIDER_OPTIONS = [
  { label: 'OpenAI Compatible', value: 'openai-compatible' },
  { label: 'SiliconFlow', value: 'siliconflow' },
  { label: 'Volcengine', value: 'volcengine' },
];

function createEmptyModelDraft() {
  return { name: '', identifier: '', note: '' };
}

function createCustomProviderDraft() {
  return { name: '', vendor: '', baseUrl: '', apiKey: '', models: [] };
}

function sortModels(models) {
  return [...models].sort((a, b) => {
    if (a.enabled && !b.enabled) return -1;
    if (!a.enabled && b.enabled) return 1;
    if (a.enabled && b.enabled) {
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
    }
    if (!a.enabled && !b.enabled) {
      if (a.justDisabled && !b.justDisabled) return -1;
      if (!a.justDisabled && b.justDisabled) return 1;
    }
    return 0;
  });
}

function createEmptyModelsByTab() {
  return Object.fromEntries(MODEL_TABS.map((tab) => [tab, []]));
}

function createDefaultState() {
  return {
    mainConfigured: false,
    childView: null,
    onelinkEnabled: false,
    activeModelTab: '对话模型',
    activeCustomProviderId: null,
    onelinkApiKey: '',
    customProviders: [],
    customProviderDraft: createCustomProviderDraft(),
    onelinkModelsByTab: {
      '对话模型': [],
      '图片模型': [],
      '视频模型': [],
      '配音模型': [],
    },
    onelinkModelDraft: createEmptyModelDraft(),
    customProviderModelDraft: createEmptyModelDraft(),
  };
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <circle cx="8" cy="8" r="7" stroke="#52BF92" strokeWidth="1.333" />
      <path d="M4.667 8L7 10.333L11.333 6" stroke="#52BF92" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <circle cx="8" cy="8" r="7" stroke="#D13A3B" strokeWidth="1.333" />
      <path d="M8 5v3.333" stroke="#D13A3B" strokeWidth="1.333" strokeLinecap="round" />
      <circle cx="8" cy="11" r="0.667" fill="#D13A3B" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-text-primary">
      <path d="M2.667 2.667L13.333 13.333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.667 13.333L13.333 2.667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon({ className = 'h-[16px] w-[16px] text-white-80' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-text-primary">
      <path d="M12 6.333L8 10.333L4 6.333H12Z" fill="currentColor" stroke="currentColor" strokeWidth="1.333" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon({ stroke = '#D13A3B' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: '0' }}>
      <path d="M3 3.333V14.667H13V3.333H3Z" stroke={stroke} strokeLinejoin="round" />
      <path d="M6.667 6.667V11" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.333 6.667V11" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1.333 3.333H14.667" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.333 3.333L6.43 1.333H9.592L10.667 3.333H5.333Z" stroke={stroke} strokeLinejoin="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: '0' }}>
      <path d="M14 8.667V13.333C14 13.701 13.701 14 13.333 14H2.667C2.298 14 2 13.701 2 13.333V2.667C2 2.298 2.298 2 2.667 2H7.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.667 8.907V11.333H7.106L14 4.436L11.565 2L4.667 8.907Z" stroke="#FFFFFF" strokeLinejoin="round" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: '0' }}>
      <path d="M6.333 1.333H12.333L8.667 6H13.667L5.667 14.667L7.333 8.333H2.667L6.333 1.333Z" stroke="#FFFFFF" strokeLinejoin="round" />
    </svg>
  );
}

function SecondaryButton({ children, className = '', onClick, type = 'button', icon = null, textClassName = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex shrink-0 items-center justify-center gap-[4px] rounded-lg border border-solid border-btn-primary-border bg-btn-primary-bg-normal px-[16px] outline outline-1 outline-stroke-outline transition-colors hover:bg-btn-primary-bg-hover active:bg-btn-primary-bg-active ${BUTTON_SHADOW_CLASS} ${className}`}
    >
      {icon}
      <div className={`shrink-0 text-sm/4.5 text-text-secondary ${textClassName}`} style={{ fontFamily: FONT }}>
        {children}
      </div>
    </button>
  );
}

function PrimaryButton({ children, className = '', innerClassName = '', onClick, type = 'button', textClassName = '', disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group flex shrink-0 rounded-lg p-[1px] outline outline-1 outline-stroke-outline ${BUTTON_SHADOW_CLASS} ${className} disabled:opacity-40 disabled:pointer-events-none`}
      style={{ backgroundImage: PRIMARY_BUTTON_GRADIENT }}
    >
      <div className={`flex grow items-center justify-center gap-[4px] rounded-[7px] bg-btn-primary-bg-normal transition-colors group-hover:bg-btn-primary-bg-hover group-active:bg-btn-primary-bg-active ${innerClassName}`}>
        <div className={`shrink-0 text-sm/4.5 text-text-primary ${textClassName}`} style={{ fontFamily: FONT }}>
          {children}
        </div>
      </div>
    </button>
  );
}

function AccentButton({ children, className = '', onClick, type = 'button', textClassName = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex shrink-0 items-center justify-center gap-[4px] rounded-lg border border-solid border-stroke-accent bg-btn-accent-bg-normal bg-origin-border px-[16px] outline outline-1 outline-stroke-outline transition-colors hover:bg-btn-accent-bg-hover active:bg-btn-accent-bg-active ${className}`}
      style={{ backgroundImage: ACCENT_BUTTON_GRADIENT }}
    >
      <div className={`shrink-0 text-center text-sm/4.5 font-medium text-text-inverse ${textClassName}`} style={{ fontFamily: FONT_MEDIUM }}>
        {children}
      </div>
    </button>
  );
}

function Toast({ toasts }) {
  return (
    <div className="fixed top-[24px] left-1/2 z-[200] flex -translate-x-1/2 flex-col items-center gap-[8px] pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-[8px] rounded-lg px-[16px] py-[10px] text-sm/4.5"
          style={{
            background: '#1D1E1E',
            boxShadow: '0px 4px 16px rgba(0,0,0,0.6), inset 0px 0px 0px 1px rgba(255,255,255,0.08)',
            fontFamily: FONT,
            animation: 'toast-in 0.2s ease',
          }}
        >
          {toast.type === 'success' ? <CheckCircleIcon /> : <AlertCircleIcon />}
          <span className={toast.type === 'success' ? 'text-[#52BF92]' : 'text-[#D13A3B]'}>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

function ConfirmDeleteModal({ onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-surface-overlay/60 backdrop-blur-[4px]"
      onClick={onCancel}
    >
      <div
        className="[font-synthesis:none] flex w-[360px] flex-col gap-[24px] rounded-2xl bg-surface-modal p-[24px] antialiased"
        style={{ boxShadow: '0px 8px 32px rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-[8px]">
          <div className="flex flex-col gap-[8px]">
            <div className="text-base/5 font-medium text-text-primary" style={{ fontFamily: FONT_MEDIUM }}>
              确定要删除吗？
            </div>
            <div className="text-sm/4.5 text-text-secondary" style={{ fontFamily: FONT }}>
              此操作不可撤销，请谨慎操作！
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex shrink-0 items-center justify-center size-[28px] rounded-lg text-text-secondary transition-colors hover:text-text-primary hover:bg-white-8 active:bg-white-12"
            aria-label="关闭"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex items-center justify-end gap-[12px]">
          <SecondaryButton className="h-9" onClick={onCancel}>
            取消
          </SecondaryButton>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-9 shrink-0 items-center justify-center rounded-lg border border-solid border-[#FFFFFF33] bg-[#D13B3B] px-[16px] text-sm/4.5 font-medium text-white transition-colors hover:bg-[#E84545] active:bg-[#9B2929]"
            style={{ fontFamily: FONT_MEDIUM }}
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}

function CardIconButton({ icon, onClick, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group flex flex-col rounded-lg shrink-0 [box-shadow:#00000066_3px_3px_8px] [outline:1px_solid_#00000080] p-px size-[32px] disabled:opacity-40 disabled:pointer-events-none"
      style={{ backgroundImage: PRIMARY_BUTTON_GRADIENT }}
    >
      <div className="flex items-center grow shrink basis-[0%] rounded-[7px] gap-[4px] justify-center bg-[#161616] transition-colors group-hover:bg-btn-primary-bg-hover group-active:bg-btn-primary-bg-active">
        {icon}
      </div>
    </button>
  );
}

function CardTextButton({ icon, label, onClick, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group flex flex-col h-[32px] rounded-lg [box-shadow:#00000066_3px_3px_8px] [outline:1px_solid_#00000080] p-px disabled:opacity-40 disabled:pointer-events-none"
      style={{ backgroundImage: PRIMARY_BUTTON_GRADIENT }}
    >
      <div className="flex items-center grow shrink basis-[0%] rounded-[7px] px-[16px] gap-[4px] justify-center bg-[#161616] transition-colors group-hover:bg-btn-primary-bg-hover group-active:bg-btn-primary-bg-active">
        {icon}
        <div className="inline-block w-max shrink-0 text-[#FFFFFFCC] text-sm/4.5" style={{ fontFamily: FONT }}>
          {label}
        </div>
      </div>
    </button>
  );
}

function CardDeleteButton({ onClick, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="shrink-0 transition-opacity hover:opacity-70 active:opacity-40 disabled:pointer-events-none"
      aria-label="删除服务商"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: '0' }}>
        <path d="M3 3.333V14.667H13V3.333H3Z" stroke={disabled ? '#A5A5A5' : '#D13A3B'} strokeLinejoin="round" />
        <path d="M6.667 6.667V11" stroke={disabled ? '#A5A5A5' : '#D13A3B'} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.333 6.667V11" stroke={disabled ? '#A5A5A5' : '#D13A3B'} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1.333 3.333H14.667" stroke={disabled ? '#A5A5A5' : '#D13A3B'} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.333 3.333L6.43 1.333H9.592L10.667 3.333H5.333Z" stroke={disabled ? '#A5A5A5' : '#D13A3B'} strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// StatusSwitch → 统一使用共享 Toggle，适配 on/onClick 接口
function StatusSwitch({ on, onClick }) {
  return <Toggle value={on} onChange={onClick} />;
}

function Tag({ children, roundedClassName = 'rounded-sm' }) {
  return (
    <div className={`flex items-start bg-tag-bg-blue px-[4px] py-[0px] ${roundedClassName} ${INSET_BORDER_CLASS}`}>
      <div className="w-fit text-sm/4.5 text-tag-text-blue" style={{ fontFamily: FONT }}>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-[8px] self-stretch">
      <div className="shrink-0 text-sm/4.5 text-[#FFFFFF99]" style={{ fontFamily: FONT }}>
        {label}
      </div>
      <div className="shrink-0 text-sm/4.5 text-white" style={{ fontFamily: FONT }}>
        {value}
      </div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, readOnly = false, disabled = false }) {
  const baseClassName = disabled
    ? 'h-9 w-full rounded-lg bg-input-bg-disabled px-[12px] pr-[6px] text-sm/4.5 text-input-text-hint outline outline-1 outline-stroke-outline placeholder:text-input-text-hint'
    : readOnly
      ? 'h-9 w-full rounded-lg bg-neutral-300 px-[12px] pr-[6px] text-sm/4.5 text-text-hint outline outline-1 outline-stroke-outline transition-colors hover:outline-stroke-accent focus:outline-stroke-active'
      : 'h-9 w-full rounded-lg border border-solid border-input-border-normal bg-input-bg-normal px-[12px] pr-[6px] text-sm/4.5 text-input-text-content outline outline-1 outline-stroke-outline transition-colors placeholder:text-text-hint hover:border-input-border-hover hover:bg-input-bg-hover focus:border-input-border-focus focus:bg-input-bg-focus focus:[box-shadow:0px_0px_10px_var(--color-glow)] focus:[mix-blend-mode:lighten]';
  return (
    <input
      type="text"
      readOnly={readOnly}
      disabled={disabled}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={baseClassName}
      style={{ fontFamily: FONT }}
    />
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col items-start gap-[4px] self-stretch">
      <div className="self-stretch text-sm/4.5 text-text-secondary" style={{ fontFamily: FONT }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function SelectOption({ option, selected, onSelect }) {
  const stateClassName = option.disabled
    ? 'bg-select-item-bg-disabled text-select-item-text-disabled cursor-not-allowed'
    : selected
      ? 'bg-select-item-bg-active text-select-item-text-active'
      : 'bg-select-item-bg-normal text-select-item-text-normal hover:bg-select-item-bg-hover hover:text-select-item-text-hover active:bg-select-item-bg-active active:text-select-item-text-active cursor-pointer';

  return (
    <button
      type="button"
      disabled={option.disabled}
      onClick={() => onSelect(option.value)}
      className={`flex w-full items-center rounded-md px-[12px] py-[8px] text-left text-sm/4.5 transition-colors ${stateClassName}`}
      style={{ fontFamily: FONT }}
    >
      {option.label}
    </button>
  );
}

function ProviderSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedOption = PROVIDER_OPTIONS.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const triggerClassName = open
    ? 'border-input-border-focus bg-input-bg-focus [box-shadow:0px_0px_10px_var(--color-glow)] [mix-blend-mode:lighten]'
    : 'border-input-border-normal bg-input-bg-normal hover:border-input-border-hover hover:bg-input-bg-hover focus:border-input-border-focus focus:bg-input-bg-focus focus:[box-shadow:0px_0px_10px_var(--color-glow)] focus:[mix-blend-mode:lighten]';

  return (
    <div ref={containerRef} className="relative self-stretch">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex h-9 w-full items-center justify-between rounded-lg border border-solid px-[12px] pr-[6px] outline outline-1 outline-stroke-outline transition-colors ${triggerClassName}`}
        aria-expanded={open}
      >
        <div className={`flex-1 text-left text-sm/4.5 ${selectedOption ? 'text-input-text-content' : 'text-input-text-hint'}`} style={{ fontFamily: FONT }}>
          {selectedOption?.label ?? '请选择'}
        </div>
        <ChevronDownIcon />
      </button>
      {open ? (
        <div
          className="absolute top-[calc(100%+4px)] left-0 z-10 flex w-full flex-col rounded-lg border border-solid border-select-border bg-select-bg p-[4px]"
          style={{ boxShadow: '0px 4px 16px var(--color-select-shadow)' }}
        >
          {PROVIDER_OPTIONS.map((option) => (
            <SelectOption
              key={option.value}
              option={option}
              selected={option.value === value}
              onSelect={(nextValue) => { onChange(nextValue); setOpen(false); }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RecommendationBanner() {
  return (
    <div
      className={`flex items-start gap-[12px] self-stretch rounded-lg bg-input-bg-normal px-[16px] py-[12px] ${INSET_BORDER_CLASS}`}
      style={{ backgroundImage: RECOMMENDATION_GRADIENT }}
    >
      <div className="flex flex-1 flex-col items-start gap-[8px]">
        <div className="self-stretch text-base/5 font-medium text-text-primary" style={{ fontFamily: FONT_MEDIUM }}>
          推荐使用OneLinkAI API
        </div>
        <div className="flex flex-col items-start gap-[2px] self-stretch">
          <div className="flex items-center gap-[2px] self-stretch">
            <div className="text-[14px] leading-[150%] text-text-secondary" style={{ fontFamily: FONT }}>OneLinkAI平台支持</div>
            <Tag>Seedance2.0</Tag>
            <Tag>Kling</Tag>
            <Tag>Vidu</Tag>
            <div className="text-[14px] leading-[150%] text-text-secondary" style={{ fontFamily: FONT }}>等多种模型，价格优惠，连接稳定。</div>
          </div>
          <div className="flex items-center gap-[2px] self-stretch">
            <div className="text-[14px] leading-[150%] text-text-secondary" style={{ fontFamily: FONT }}>新用户注册赠送</div>
            <Tag roundedClassName="rounded-md">50元</Tag>
            <div className="text-[14px] leading-[150%] text-text-secondary" style={{ fontFamily: FONT }}>算力金。</div>
          </div>
        </div>
      </div>
      <div className="[font-synthesis:none] flex items-end gap-[8px] self-stretch antialiased text-xs/4">
        <button
          type="button"
          className="flex h-[32px] items-center gap-[4px] rounded-lg border border-solid border-[#FFFFFF0D] bg-[#161616] px-[16px] [box-shadow:#00000066_3px_3px_8px] [outline:1px_solid_#00000080] transition-colors hover:bg-[#1D1E1E] active:bg-[#161616]"
        >
          <div className="inline-block w-max shrink-0 text-sm/4.5 text-[#FFFFFF99]" style={{ fontFamily: FONT }}>教程</div>
        </button>
        <button
          type="button"
          className="flex h-[32px] items-center gap-[4px] rounded-lg border border-solid border-[#FFFFFF33] bg-[#2DC3E1] bg-origin-border px-[16px] [outline:1px_solid_#00000080] transition-colors hover:bg-[#53D3ED] active:bg-[#139EBA]"
          style={{ backgroundImage: ACCENT_BUTTON_GRADIENT }}
        >
          <div className="inline-block w-max text-center text-sm/4.5 font-medium text-[#090909]" style={{ fontFamily: FONT_MEDIUM }}>获取</div>
        </button>
      </div>
    </div>
  );
}

const CARD_BASE = 'flex flex-col items-center gap-3 px-[16px] py-3 flex-1 rounded-lg h-50 bg-[#1D1E1E] text-xs/4 cursor-pointer hover:bg-[#242525] active:bg-[#141414] transition-colors';

function InitialProviderCard({ onConfigure, onToggle }) {
  return (
    <div className={CARD_BASE} onClick={onConfigure}>
      <div className="flex items-center justify-between gap-3 self-stretch">
        <div className="flex-1 text-base/5 font-medium text-white" style={{ fontFamily: FONT_MEDIUM }}>
          OneLinkAI
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <StatusSwitch on={false} onClick={onToggle} />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center self-stretch">
        <AccentButton className="h-9" onClick={(e) => { e.stopPropagation(); onConfigure(); }} textClassName="text-center">
          开始配置API
        </AccentButton>
      </div>
    </div>
  );
}

function ConfiguredProviderCard({ title, modelCount, date, enabled, onEdit, onTest, onToggle, deletable = false, onDelete }) {
  return (
    <div className={CARD_BASE} onClick={onEdit}>
      <div className="flex items-center gap-3 self-stretch justify-between">
        <div className="flex-1 font-medium text-white text-base/5" style={{ fontFamily: FONT_MEDIUM }}>
          {title}
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <StatusSwitch on={enabled} onClick={onToggle} />
        </div>
      </div>
      <div className="flex flex-col items-start gap-3 self-stretch flex-1">
        <InfoRow label="已配置模型" value={`${modelCount}个`} />
        <InfoRow label="添加时间" value={date} />
      </div>
      <div
        className={`flex items-center self-stretch h-[32px] shrink-0 ${deletable ? 'justify-between gap-[16px]' : 'justify-end gap-[32px]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {deletable && <CardDeleteButton onClick={onDelete} disabled={enabled} />}
        <div className="flex items-start gap-[12px]">
          <CardIconButton icon={<EditIcon />} onClick={onEdit} />
          <CardTextButton icon={<BoltIcon />} label="测试" onClick={onTest} />
        </div>
      </div>
    </div>
  );
}

function CustomProviderCard({ configured, enabled, modelCount, providerName, onConfigure, onEdit, onToggle, onDelete, onTest }) {
  if (configured) {
    return (
      <ConfiguredProviderCard
        title={providerName}
        modelCount={modelCount}
        date="2026-01-01"
        enabled={enabled}
        onEdit={onEdit}
        onTest={onTest}
        onToggle={onToggle}
        deletable
        onDelete={onDelete}
      />
    );
  }

  return (
    <div className={CARD_BASE} onClick={onConfigure}>
      <div className="self-stretch text-center text-base/5 font-medium text-text-primary opacity-0" style={{ fontFamily: FONT_MEDIUM }}>
        OneLinkAI
      </div>
      <div className="flex flex-1 items-center justify-center self-stretch">
        <SecondaryButton
          className="h-9"
          icon={<PlusIcon className="h-[16px] w-[16px] grow-0 shrink basis-auto self-auto text-white-80" />}
          onClick={(e) => { e.stopPropagation(); onConfigure(); }}
          textClassName="text-white-80"
        >
          自定义服务商
        </SecondaryButton>
      </div>
      <div className="flex items-center justify-between self-stretch opacity-0">
        <div className="text-sm/4.5 text-text-secondary" style={{ fontFamily: FONT }}>状态</div>
        <div className="h-6 w-14" />
      </div>
    </div>
  );
}

function MainModal({
  configured,
  onelinkEnabled,
  onClose,
  onOpenOneLink,
  onOpenCustomProvider,
  onComplete,
  onEditOneLink,
  onToggleOneLink,
  customProviders,
  canAddCustomProvider,
  onEditCustomProvider,
  onToggleCustomProvider,
  onDeleteCustomProvider,
  onTestOneLink,
}) {
  return (
    <div className="[font-synthesis:none] flex h-[600px] w-[800px] max-w-[calc(100vw-48px)] flex-col overflow-hidden text-xs/4 antialiased">
      <div className="flex items-center justify-between gap-[16px] rounded-t-2xl bg-surface-modal px-[24px] py-[16px]">
        <div className="flex-1 text-base/5 font-medium text-text-primary" style={{ fontFamily: FONT_MEDIUM }}>
          API配置
        </div>
        <button type="button" onClick={onClose} className="flex shrink-0 items-center justify-center transition-opacity hover:opacity-80 active:opacity-60" aria-label="关闭API配置">
          <CloseIcon />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto bg-surface-modal px-[24px] py-[8px]">
        <RecommendationBanner />

        <div className="flex flex-col gap-[8px] self-stretch">
          <div className="self-stretch text-sm/4.5 font-medium text-text-primary" style={{ fontFamily: FONT_MEDIUM }}>
            API服务商
          </div>
          <div className="flex flex-wrap items-start gap-[16px] self-stretch">
            <div className="w-[calc((100%-32px)/3)]">
              {configured ? (
                <ConfiguredProviderCard
                  title="OneLinkAI"
                  modelCount={23}
                  date="2026-01-01"
                  enabled={onelinkEnabled}
                  onEdit={onEditOneLink}
                  onTest={onTestOneLink}
                  onToggle={onToggleOneLink}
                />
              ) : (
                <InitialProviderCard onConfigure={onOpenOneLink} onToggle={onOpenOneLink} />
              )}
            </div>

            {customProviders.map((provider) => (
              <div key={provider.id} className="w-[calc((100%-32px)/3)]">
                <CustomProviderCard
                  configured={provider.configured}
                  enabled={provider.enabled}
                  modelCount={Object.values(provider.modelsByTab ?? {}).reduce((sum, arr) => sum + arr.length, 0)}
                  providerName={provider.name || DEFAULT_PROVIDER_NAME}
                  onConfigure={onOpenCustomProvider}
                  onEdit={() => onEditCustomProvider(provider.id)}
                  onToggle={() => onToggleCustomProvider(provider.id)}
                  onDelete={() => onDeleteCustomProvider(provider.id)}
                  onTest={onTestOneLink}
                />
              </div>
            ))}

            {canAddCustomProvider ? (
              <div className="w-[calc((100%-32px)/3)]">
                <CustomProviderCard
                  configured={false}
                  enabled={false}
                  modelCount={0}
                  providerName={DEFAULT_PROVIDER_NAME}
                  onConfigure={onOpenCustomProvider}
                  onEdit={() => undefined}
                  onToggle={() => undefined}
                  onDelete={() => undefined}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-[8px] self-stretch">
          <div className="self-stretch text-sm/4.5 font-medium text-text-primary" style={{ fontFamily: FONT_MEDIUM }}>
            配置说明
          </div>
        <div className="whitespace-pre-wrap text-[14px] leading-[150%] text-text-secondary" style={{ fontFamily: FONT }}>
            我们已经为您配置好OneLink AI平台内的23个主流模型，前往官网
            <span
              className="cursor-pointer text-text-accent underline-offset-2 transition-all hover:underline hover:brightness-125 active:opacity-70"
            >获取API</span>
            后即可开始使用
            <br />
            您也可以使用其他API服务，添加自定义模型，
            <span
              className="cursor-pointer text-text-accent underline-offset-2 transition-all hover:underline hover:brightness-125 active:opacity-70"
            >查看教程</span>
            <br />
            为保证安全，您的API配置仅保存在本地浏览器，不会上传到云端
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-[16px] rounded-b-2xl bg-surface-modal px-[24px] py-[16px]">
        <PrimaryButton className="h-9" innerClassName="px-[15px]" onClick={onComplete}>
          完成
        </PrimaryButton>
      </div>
    </div>
  );
}

function NestedModal({ title, children, footer, onClose }) {
  return (
    <div className="[font-synthesis:none] flex h-[600px] w-[400px] max-w-[calc(100vw-80px)] flex-col overflow-hidden text-xs/4 antialiased" onClick={(event) => event.stopPropagation()}>
      <div className="flex items-center justify-between gap-[16px] rounded-t-2xl bg-surface-modal px-[24px] py-[16px]">
        <div className="flex-1 text-base/5 font-medium text-text-primary" style={{ fontFamily: FONT_MEDIUM }}>
          {title}
        </div>
        <button type="button" onClick={onClose} className="flex shrink-0 items-center justify-center transition-opacity hover:opacity-80 active:opacity-60">
          <CloseIcon />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto bg-surface-modal px-[24px] py-[8px]">{children}</div>
      <div className="flex items-center justify-end gap-[16px] rounded-b-2xl bg-surface-modal px-[24px] py-[16px]">
        {footer}
      </div>
    </div>
  );
}

function ModelTabs({ activeTab, onChange }) {
  return (
    <div className="flex items-start gap-[24px] self-stretch">
      {MODEL_TABS.map((tab) => {
        const active = tab === activeTab;
        return (
          <button
            key={tab}
            type="button"
            className="flex flex-col items-center gap-[4px] transition-opacity hover:opacity-80 active:opacity-60"
            onClick={() => onChange(tab)}
          >
            <div
              className={`w-fit text-sm/4.5 transition-colors ${active ? 'font-medium text-text-primary' : 'text-text-secondary hover:text-text-primary active:text-text-secondary'}`}
              style={{ fontFamily: active ? FONT_MEDIUM : FONT }}
            >
              {tab}
            </div>
            {active ? <div className="h-0.5 self-stretch bg-[#DDDDDD]" /> : null}
          </button>
        );
      })}
    </div>
  );
}

const ModelCard = forwardRef(function ModelCard({ model, onToggle, onDelete, animating = false }, ref) {
  return (
    <div
      ref={ref}
      className="flex items-start gap-1.5 px-3 rounded-lg flex-col justify-center self-stretch bg-[#1D1E1E]"
      style={animating ? { animation: 'model-card-disable 280ms ease' } : undefined}
    >
      <div className="flex items-center gap-1.5 justify-between self-stretch py-[8px]">
        <div className="w-fit shrink-0 font-medium text-white text-sm/4.5" style={{ fontFamily: FONT_MEDIUM }}>
          {model.name}
        </div>
        <div className="flex items-center gap-3 justify-end">
          <StatusSwitch on={model.enabled} onClick={onToggle} onLabel="启用" />
          {!model.enabled && (
            <button
              type="button"
              onClick={onDelete}
              className="transition-opacity hover:opacity-70 active:opacity-40"
              aria-label="删除模型"
            >
              <TrashIcon stroke="#D13A3B" />
            </button>
          )}
        </div>
      </div>
      <div className="self-stretch pb-[8px] text-[#FFFFFF99] text-xs/4" style={{ fontFamily: FONT }}>
        {model.description}
      </div>
    </div>
  );
});

function ConfigModelModal({
  title,
  apiValue,
  apiPlaceholder,
  onApiChange,
  apiDisabled = false,
  activeTab,
  onChangeTab,
  modelsByTab,
  onAddModel,
  onCancel,
  onSave,
  onToggleModel,
  onDeleteModel,
  onTest,
}) {
  const activeTabIndex = Math.max(MODEL_TABS.indexOf(activeTab), 0);
  const [disablingId, setDisablingId] = useState(null);
  const cardRefs = useRef({});
  const pendingFlip = useRef(false);
  const prevPositions = useRef({});

  const activeModels = modelsByTab[activeTab] ?? [];

  const snapshotPositions = useCallback(() => {
    prevPositions.current = {};
    for (const [id, el] of Object.entries(cardRefs.current)) {
      if (el) prevPositions.current[id] = el.getBoundingClientRect().top;
    }
  }, []);

  useLayoutEffect(() => {
    if (!pendingFlip.current) return;
    pendingFlip.current = false;
    for (const [id, el] of Object.entries(cardRefs.current)) {
      if (!el || prevPositions.current[id] == null) continue;
      const delta = prevPositions.current[id] - el.getBoundingClientRect().top;
      if (Math.abs(delta) < 1) continue;
      el.style.transition = 'none';
      el.style.transform = `translateY(${delta}px)`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = 'transform 320ms cubic-bezier(0.4, 0, 0.2, 1)';
          el.style.transform = 'translateY(0)';
        });
      });
    }
  }, [activeModels]);

  const handleToggleModel = useCallback((modelId) => {
    const model = activeModels.find((m) => m.id === modelId);
    if (model?.enabled) {
      snapshotPositions();
      setDisablingId(modelId);
      setTimeout(() => {
        pendingFlip.current = true;
        setDisablingId(null);
        onToggleModel(modelId);
      }, 260);
    } else {
      onToggleModel(modelId);
    }
  }, [activeModels, onToggleModel, snapshotPositions]);

  return (
    <NestedModal
      title={title}
      onClose={onCancel}
      footer={
        <PrimaryButton className="h-9" innerClassName="px-[15px]" onClick={onSave}>
          保存
        </PrimaryButton>
      }
    >
      <div className="flex flex-col items-start gap-[8px] self-stretch">
        <div className="self-stretch text-sm/4.5 text-text-primary" style={{ fontFamily: FONT }}>
          全局API
        </div>
        <div className="flex items-start gap-[8px] self-stretch">
          <TextInput
            value={apiValue}
            onChange={apiDisabled ? undefined : onApiChange}
            placeholder={apiPlaceholder}
            disabled={apiDisabled}
            readOnly={!apiDisabled && Boolean(apiValue && apiValue.includes('自动代入'))}
          />
          <AccentButton className="h-9" textClassName="text-center" onClick={onTest}>
            测试连接
          </AccentButton>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-start gap-[12px] self-stretch overflow-hidden min-h-0">
        <ModelTabs activeTab={activeTab} onChange={onChangeTab} />
        <div className="w-full flex-1 overflow-hidden min-h-0">
          <div
            className="flex h-full will-change-transform"
            style={{
              width: `${MODEL_TABS.length * 100}%`,
              transform: `translateX(-${activeTabIndex * (100 / MODEL_TABS.length)}%)`,
              transition: `transform ${TAB_SLIDE_DURATION}ms ease`,
            }}
          >
            {MODEL_TABS.map((tab) => {
              const tabModels = modelsByTab[tab] ?? [];
              return (
                <div key={tab} className="flex shrink-0 flex-col gap-[12px] overflow-y-auto pr-[2px]" style={{ width: `${100 / MODEL_TABS.length}%`, height: '100%' }}>
                  {tabModels.map((model) => (
                    <ModelCard
                      key={model.id}
                      ref={(el) => { if (tab === activeTab) cardRefs.current[model.id] = el; }}
                      model={model}
                      animating={tab === activeTab && disablingId === model.id}
                      onToggle={() => handleToggleModel(model.id)}
                      onDelete={() => onDeleteModel(model.id)}
                    />
                  ))}
                  {tabModels.length < 30 && (
                    <SecondaryButton
                      className="h-9 w-full justify-center shrink-0"
                      icon={<PlusIcon className="h-[16px] w-[16px] text-text-secondary" />}
                      onClick={onAddModel}
                      textClassName="text-center"
                    >
                      添加模型
                    </SecondaryButton>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </NestedModal>
  );
}

function EditModelModal({ draft, onChange, onCancel, onSave, title = '添加模型' }) {
  const canSave = draft.name.trim() !== '' && draft.identifier.trim() !== '' && draft.note.trim() !== '';
  return (
    <NestedModal
      title={title}
      onClose={onCancel}
      footer={
        <PrimaryButton className="h-9" innerClassName="px-[15px]" onClick={onSave} disabled={!canSave}>
          添加并启用
        </PrimaryButton>
      }
    >
      <Field label="名称">
        <TextInput value={draft.name} onChange={(event) => onChange('name', event.target.value)} placeholder="请输入" />
      </Field>
      <Field label="模型标识">
        <TextInput value={draft.identifier} onChange={(event) => onChange('identifier', event.target.value)} placeholder="请输入" />
      </Field>
      <Field label="关联链接">
        <TextInput value="自动获取，不可修改" onChange={() => undefined} disabled />
      </Field>
      <Field label="备注">
        <TextInput value={draft.note} onChange={(event) => onChange('note', event.target.value)} placeholder="请输入" />
      </Field>
    </NestedModal>
  );
}

function CustomProviderModal({ draft, onChange, onCancel, onAdd }) {
  const canAdd = draft.name.trim() !== '' && draft.vendor !== '' && draft.baseUrl.trim() !== '' && draft.apiKey.trim() !== '';
  return (
    <NestedModal
      title="自定义API服务商"
      onClose={onCancel}
      footer={
        <>
          <SecondaryButton className="h-9" onClick={onCancel}>
            取消
          </SecondaryButton>
          <PrimaryButton className="h-9" innerClassName="px-[15px]" onClick={onAdd} disabled={!canAdd}>
            添加
          </PrimaryButton>
        </>
      }
    >
      <Field label="名称">
        <TextInput value={draft.name} onChange={(event) => onChange('name', event.target.value)} placeholder="请输入" />
      </Field>
      <Field label="服务商">
        <ProviderSelect value={draft.vendor} onChange={(value) => onChange('vendor', value)} />
      </Field>
      <Field label="Base URL">
        <TextInput value={draft.baseUrl} onChange={(event) => onChange('baseUrl', event.target.value)} placeholder="请输入" />
      </Field>
      <Field label="API key">
        <TextInput value={draft.apiKey} onChange={(event) => onChange('apiKey', event.target.value)} placeholder="请输入" />
      </Field>
    </NestedModal>
  );
}

export default function ApiConfigModal({ open, onClose, onConfigured }) {
  const [state, setState] = useState(createDefaultState);
  const [toasts, setToasts] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = useCallback((type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const testConnection = useCallback(async () => {
    await apiTestConnection();
    showToast('success', '连接成功！');
  }, [showToast]);

  const requestDelete = useCallback((type, id) => {
    setConfirmDelete({ type, id });
  }, []);

  function resetState() {
    setState(createDefaultState);
  }

  function closeMain() {
    apiSaveApiConfig(state);
    resetState();
    onClose?.();
  }

  function closeChild() {
    setState((current) => {
      const activeProvider = current.customProviders.find((provider) => provider.id === current.activeCustomProviderId);
      const shouldRemovePendingProvider = current.childView?.startsWith('custom-provider') && activeProvider && !activeProvider.configured;

      return {
        ...current,
        childView: null,
        activeCustomProviderId: shouldRemovePendingProvider ? null : current.activeCustomProviderId,
        customProviderDraft: current.childView === 'custom-provider-form' ? createCustomProviderDraft() : current.customProviderDraft,
        customProviderModelDraft: current.childView?.startsWith('custom-provider') ? createEmptyModelDraft() : current.customProviderModelDraft,
        customProviders: shouldRemovePendingProvider
          ? current.customProviders.filter((provider) => provider.id !== current.activeCustomProviderId)
          : current.customProviders,
      };
    });
  }

  useEffect(() => {
    if (!open) return undefined;

    apiGetApiConfig().then((config) => {
      setState((current) => ({
        ...current,
        mainConfigured: config.mainConfigured ?? current.mainConfigured,
        onelinkEnabled: config.onelinkEnabled ?? current.onelinkEnabled,
        onelinkApiKey: config.onelinkApiKey ?? current.onelinkApiKey,
        onelinkModelsByTab: config.onelinkModelsByTab ?? current.onelinkModelsByTab,
        customProviders: config.customProviders ?? current.customProviders,
      }));
    });

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (state.childView) {
        closeChild();
        return;
      }
      setState(createDefaultState);
      onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, state.childView]);

  const activeCustomProvider = useMemo(
    () => state.customProviders.find((provider) => provider.id === state.activeCustomProviderId) ?? null,
    [state.customProviders, state.activeCustomProviderId],
  );
  const customApiKey = activeCustomProvider?.apiKey ?? '';
  const canAddCustomProvider = state.customProviders.length < MAX_CUSTOM_PROVIDERS;

  if (!open) return null;

  const updateState = (key, value) => setState((current) => ({ ...current, [key]: value }));

  const updateDraft = (draftKey, field, value) =>
    setState((current) => ({ ...current, [draftKey]: { ...current[draftKey], [field]: value } }));

  const updateCustomProviderDraft = (field, value) =>
    setState((current) => ({ ...current, customProviderDraft: { ...current.customProviderDraft, [field]: value } }));

  const openOneLinkConfig = () => setState((current) => ({ ...current, childView: 'onelink-config' }));
  const openCustomProviderForm = () =>
    setState((current) => ({
      ...current,
      childView: 'custom-provider-form',
      activeCustomProviderId: null,
      customProviderDraft: createCustomProviderDraft(),
      customProviderModelDraft: createEmptyModelDraft(),
      activeModelTab: '对话模型',
    }));
  const openCustomProviderConfig = (providerId) =>
    setState((current) => ({
      ...current,
      activeCustomProviderId: providerId,
      childView: 'custom-provider-model-config',
      customProviderModelDraft: createEmptyModelDraft(),
      activeModelTab: '对话模型',
    }));

  const saveOneLinkConfig = () => {
    setState((current) => ({ ...current, mainConfigured: true, onelinkEnabled: true, childView: null }));
    onConfigured?.();
  };

  const saveCustomProviderModelConfig = () => {
    setState((current) => ({
      ...current,
      childView: null,
      customProviderModelDraft: createEmptyModelDraft(),
      customProviders: current.customProviders.map((provider) =>
        provider.id === current.activeCustomProviderId ? { ...provider, configured: true, enabled: true } : provider,
      ),
    }));
    onConfigured?.();
  };

  const addCustomProvider = () =>
    setState((current) => {
      if (current.customProviders.length >= MAX_CUSTOM_PROVIDERS) return current;
      const providerId = `custom-provider-${Date.now()}`;
      const draft = current.customProviderDraft;
      return {
        ...current,
        activeCustomProviderId: providerId,
        childView: 'custom-provider-model-config',
        customProviderDraft: createCustomProviderDraft(),
        customProviderModelDraft: createEmptyModelDraft(),
        customProviders: [
          ...current.customProviders,
          { id: providerId, configured: false, enabled: false, name: draft.name, vendor: draft.vendor, baseUrl: draft.baseUrl, apiKey: draft.apiKey, modelsByTab: createEmptyModelsByTab() },
        ],
      };
    });

  const addOnelinkModel = () =>
    setState((current) => {
      const draft = current.onelinkModelDraft;
      const tab = current.activeModelTab;
      const newModel = { id: `onelinkModels-${Date.now()}`, name: draft.name || 'GPT5.1', description: draft.note || MODEL_DESCRIPTION, enabled: true, isNew: true };
      const sorted = sortModels([...(current.onelinkModelsByTab[tab] ?? []), newModel]);
      return {
        ...current,
        onelinkModelsByTab: { ...current.onelinkModelsByTab, [tab]: sorted },
        onelinkModelDraft: createEmptyModelDraft(),
        childView: 'onelink-config',
      };
    });

  const addCustomProviderModel = () =>
    setState((current) => {
      const draft = current.customProviderModelDraft;
      const tab = current.activeModelTab;
      const newModel = { id: `customProviderModels-${Date.now()}`, name: draft.name || 'GPT5.1', description: draft.note || MODEL_DESCRIPTION, enabled: true, isNew: true };
      return {
        ...current,
        customProviderModelDraft: createEmptyModelDraft(),
        childView: 'custom-provider-model-config',
        customProviders: current.customProviders.map((provider) =>
          provider.id === current.activeCustomProviderId
            ? {
                ...provider,
                modelsByTab: {
                  ...(provider.modelsByTab ?? createEmptyModelsByTab()),
                  [tab]: sortModels([...(provider.modelsByTab?.[tab] ?? []), newModel]),
                },
              }
            : provider,
        ),
      };
    });

  const deleteOnelinkModel = (modelId) =>
    setState((current) => {
      const tab = current.activeModelTab;
      return {
        ...current,
        onelinkModelsByTab: {
          ...current.onelinkModelsByTab,
          [tab]: (current.onelinkModelsByTab[tab] ?? []).filter((m) => m.id !== modelId),
        },
      };
    });

  const deleteCustomProviderModel = (modelId) =>
    setState((current) => {
      const tab = current.activeModelTab;
      return {
        ...current,
        customProviders: current.customProviders.map((provider) =>
          provider.id === current.activeCustomProviderId
            ? {
                ...provider,
                modelsByTab: {
                  ...(provider.modelsByTab ?? createEmptyModelsByTab()),
                  [tab]: (provider.modelsByTab?.[tab] ?? []).filter((m) => m.id !== modelId),
                },
              }
            : provider,
        ),
      };
    });

  const deleteCustomProvider = (providerId) =>
    setState((current) => ({ ...current, customProviders: current.customProviders.filter((provider) => provider.id !== providerId) }));

  const toggleOnelinkModel = (modelId) =>
    setState((current) => {
      const tab = current.activeModelTab;
      const updated = (current.onelinkModelsByTab[tab] ?? []).map((model) => {
        if (model.id !== modelId) return model;
        const nowEnabled = !model.enabled;
        return { ...model, enabled: nowEnabled, isNew: false, justDisabled: !nowEnabled };
      });
      return {
        ...current,
        onelinkModelsByTab: { ...current.onelinkModelsByTab, [tab]: sortModels(updated) },
      };
    });

  const toggleCustomProviderModel = (modelId) =>
    setState((current) => {
      const tab = current.activeModelTab;
      return {
        ...current,
        customProviders: current.customProviders.map((provider) =>
          provider.id === current.activeCustomProviderId
            ? {
                ...provider,
                modelsByTab: {
                  ...(provider.modelsByTab ?? createEmptyModelsByTab()),
                  [tab]: sortModels(
                    (provider.modelsByTab?.[tab] ?? []).map((model) => {
                      if (model.id !== modelId) return model;
                      const nowEnabled = !model.enabled;
                      return { ...model, enabled: nowEnabled, isNew: false, justDisabled: !nowEnabled };
                    }),
                  ),
                },
              }
            : provider,
        ),
      };
    });

  const toggleCustomProvider = (providerId) =>
    setState((current) => ({
      ...current,
      customProviders: current.customProviders.map((provider) =>
        provider.id === providerId && provider.configured ? { ...provider, enabled: !provider.enabled } : provider,
      ),
    }));

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    if (type === 'onelinkModel') deleteOnelinkModel(id);
    else if (type === 'customProviderModel') deleteCustomProviderModel(id);
    else if (type === 'customProvider') deleteCustomProvider(id);
    setConfirmDelete(null);
  };

  const renderChildModal = () => {
    switch (state.childView) {
      case 'onelink-config':
        return (
          <ConfigModelModal
            title="配置OneLinkAI API"
            apiValue={state.onelinkApiKey}
            apiPlaceholder="输入你的API"
            onApiChange={(event) => updateState('onelinkApiKey', event.target.value)}
            activeTab={state.activeModelTab}
            onChangeTab={(tab) => updateState('activeModelTab', tab)}
            modelsByTab={state.onelinkModelsByTab}
            onAddModel={() => updateState('childView', 'edit-onelink-model')}
            onCancel={closeChild}
            onSave={saveOneLinkConfig}
            onToggleModel={toggleOnelinkModel}
            onDeleteModel={(id) => requestDelete('onelinkModel', id)}
            onTest={testConnection}
          />
        );
      case 'edit-onelink-model':
        return (
          <EditModelModal
            draft={state.onelinkModelDraft}
            title="添加模型"
            onChange={(field, value) => updateDraft('onelinkModelDraft', field, value)}
            onCancel={() => updateState('childView', 'onelink-config')}
            onSave={addOnelinkModel}
          />
        );
      case 'custom-provider-form':
        return <CustomProviderModal draft={state.customProviderDraft} onChange={updateCustomProviderDraft} onCancel={closeChild} onAdd={addCustomProvider} />;
      case 'custom-provider-model-config':
        return (
          <ConfigModelModal
            title="配置自定义API"
            apiValue={customApiKey}
            apiPlaceholder=""
            apiDisabled
            activeTab={state.activeModelTab}
            onChangeTab={(tab) => updateState('activeModelTab', tab)}
            modelsByTab={activeCustomProvider?.modelsByTab ?? createEmptyModelsByTab()}
            onAddModel={() => updateState('childView', 'edit-custom-model')}
            onCancel={closeChild}
            onSave={saveCustomProviderModelConfig}
            onToggleModel={toggleCustomProviderModel}
            onDeleteModel={(id) => requestDelete('customProviderModel', id)}
            onTest={testConnection}
          />
        );
      case 'edit-custom-model':
        return (
          <EditModelModal
            draft={state.customProviderModelDraft}
            title="添加模型"
            onChange={(field, value) => updateDraft('customProviderModelDraft', field, value)}
            onCancel={() => updateState('childView', 'custom-provider-model-config')}
            onSave={addCustomProviderModel}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Toast toasts={toasts} />
      {confirmDelete && (
        <ConfirmDeleteModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-surface-overlay p-[24px] backdrop-blur-[20px]" onClick={closeMain}>
        <div className="relative overflow-hidden rounded-2xl" onClick={(event) => event.stopPropagation()}>
          <MainModal
            configured={state.mainConfigured}
            onelinkEnabled={state.onelinkEnabled}
            onClose={closeMain}
            onOpenOneLink={openOneLinkConfig}
            onOpenCustomProvider={openCustomProviderForm}
            onComplete={closeMain}
            onEditOneLink={openOneLinkConfig}
            onToggleOneLink={() =>
              setState((current) => {
                if (!current.mainConfigured) return { ...current, childView: 'onelink-config' };
                return { ...current, onelinkEnabled: !current.onelinkEnabled };
              })
            }
            customProviders={state.customProviders}
            canAddCustomProvider={canAddCustomProvider}
            onEditCustomProvider={openCustomProviderConfig}
            onToggleCustomProvider={toggleCustomProvider}
            onDeleteCustomProvider={(id) => requestDelete('customProvider', id)}
            onTestOneLink={testConnection}
          />

          {state.childView ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-surface-overlay/60 backdrop-blur-[4px]" onClick={closeChild}>
              {renderChildModal()}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
