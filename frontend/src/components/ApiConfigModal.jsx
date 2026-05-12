import { useEffect, useMemo, useRef, useState } from 'react';

const FONT = "'AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif";
const FONT_MEDIUM = "'AlibabaPuHuiTi_2_65_Medium','Alibaba_PuHuiTi_2.0',system-ui,sans-serif";
const INSET_BORDER_CLASS = 'shadow-[inset_0px_0px_0px_1px_var(--color-white-8)]';
const BUTTON_SHADOW_CLASS = 'shadow-[3px_3px_8px_var(--color-black-40)]';
const ACCENT_BUTTON_GRADIENT =
  'linear-gradient(in oklab 107.50999999999999deg, oklab(84.6% -0.114 0.031 / 30%) 8.14%, oklab(84.6% -0.114 0.031 / 0%) 54.48%)';
const PRIMARY_BUTTON_GRADIENT =
  'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 30%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, var(--color-white-8), var(--color-white-8))';
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
  return {
    name: '',
    identifier: '',
    note: '',
  };
}

function createCustomProviderDraft() {
  return {
    name: '',
    vendor: '',
    baseUrl: '',
    apiKey: '',
    models: [],
  };
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
    onelinkModels: [
      { id: 'onelink-1', name: 'GPT5.1', description: MODEL_DESCRIPTION, enabled: true },
      { id: 'onelink-2', name: 'GPT5.1', description: MODEL_DESCRIPTION, enabled: true },
    ],
    onelinkModelDraft: createEmptyModelDraft(),
    customProviderModelDraft: createEmptyModelDraft(),
  };
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 text-text-primary"
    >
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

function PrimaryButton({ children, className = '', innerClassName = '', onClick, type = 'button', textClassName = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`group flex shrink-0 rounded-lg p-[1px] outline outline-1 outline-stroke-outline ${BUTTON_SHADOW_CLASS} ${className}`}
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

function StatusSwitch({ on, onClick, onLabel = '开启', offLabel = '关闭' }) {
  if (on) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group [font-synthesis:none] flex w-14 shrink-0 items-center justify-between gap-[2px] rounded-full bg-[#090909] p-[4px] antialiased transition-colors hover:bg-[#111111] active:bg-[#090909] [box-shadow:#FFFFFF14_0px_0px_0px_1px_inset]"
      >
        <div className="flex-1 text-center text-xs/4 text-[#52BF92]" style={{ fontFamily: FONT }}>
          {onLabel}
        </div>
        <div className="h-[16px] w-[16px] grow-0 shrink basis-auto self-auto rounded-full border border-solid border-[#FFFFFF33] bg-[#52BF92] transition-colors group-hover:bg-[#7AE5B9] group-active:bg-[#52BF92] [outline:1px_solid_#00000080]" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group [font-synthesis:none] flex w-14 shrink-0 items-center gap-[0px] rounded-full bg-[#090909] p-[4px] antialiased transition-colors hover:bg-[#111111] active:bg-[#090909] [box-shadow:#FFFFFF14_0px_0px_0px_1px_inset]"
    >
      <div className="h-[16px] w-[16px] grow-0 shrink basis-auto self-auto rounded-full bg-[#FFFFFF14] transition-colors group-hover:bg-[#FFFFFF29] group-active:bg-[#FFFFFF14]" />
      <div className="flex-1 text-center text-xs/4 text-[#FFFFFF66]" style={{ fontFamily: FONT }}>
        {offLabel}
      </div>
    </button>
  );
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
      <div className="shrink-0 text-sm/4.5 text-text-secondary" style={{ fontFamily: FONT }}>
        {label}
      </div>
      <div className="shrink-0 text-sm/4.5 text-text-primary" style={{ fontFamily: FONT }}>
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
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
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
        <div
          className={`flex-1 text-left text-sm/4.5 ${selectedOption ? 'text-input-text-content' : 'text-input-text-hint'}`}
          style={{ fontFamily: FONT }}
        >
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
              onSelect={(nextValue) => {
                onChange(nextValue);
                setOpen(false);
              }}
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
            <div className="text-[14px] leading-[150%] text-text-secondary" style={{ fontFamily: FONT }}>
              OneLinkAI平台支持
            </div>
            <Tag>Seedance2.0</Tag>
            <Tag>Kling</Tag>
            <Tag>Vidu</Tag>
            <div className="text-[14px] leading-[150%] text-text-secondary" style={{ fontFamily: FONT }}>
              等多种模型，价格优惠，连接稳定。
            </div>
          </div>
          <div className="flex items-center gap-[2px] self-stretch">
            <div className="text-[14px] leading-[150%] text-text-secondary" style={{ fontFamily: FONT }}>
              新用户注册赠送
            </div>
            <Tag roundedClassName="rounded-md">50元</Tag>
            <div className="text-[14px] leading-[150%] text-text-secondary" style={{ fontFamily: FONT }}>
              算力金。
            </div>
          </div>
        </div>
      </div>
      <div className="[font-synthesis:none] flex items-end gap-[8px] self-stretch antialiased text-xs/4">
        <button
          type="button"
          className="flex h-[32px] items-center gap-[4px] rounded-lg border border-solid border-[#FFFFFF0D] bg-[#161616] px-[16px] [box-shadow:#00000066_3px_3px_8px] [outline:1px_solid_#00000080] transition-colors hover:bg-[#1D1E1E] active:bg-[#161616]"
        >
          <div className="inline-block w-max shrink-0 text-sm/4.5 text-[#FFFFFF99]" style={{ fontFamily: FONT }}>
            教程
          </div>
        </button>
        <button
          type="button"
          className="flex h-[32px] items-center gap-[4px] rounded-lg border border-solid border-[#FFFFFF33] bg-[#2DC3E1] bg-origin-border px-[16px] [outline:1px_solid_#00000080] transition-colors hover:bg-[#53D3ED] active:bg-[#139EBA]"
          style={{ backgroundImage: ACCENT_BUTTON_GRADIENT }}
        >
          <div className="inline-block w-max text-center text-sm/4.5 font-medium text-[#090909]" style={{ fontFamily: FONT_MEDIUM }}>
            获取
          </div>
        </button>
      </div>
    </div>
  );
}

function ProviderCardPlaceholder() {
  return (
    <div className="flex h-50 flex-1 rounded-lg border border-solid border-stroke-normal bg-input-bg-normal opacity-0 outline outline-1 outline-stroke-outline outline-offset-1" />
  );
}

function InitialProviderCard({ onConfigure, onToggle }) {
  return (
    <div className="flex h-50 flex-1 flex-col items-center justify-center gap-[12px] rounded-lg border border-solid border-stroke-normal bg-input-bg-normal px-[16px] py-[12px] outline outline-1 outline-stroke-outline outline-offset-1">
      <div className="flex items-center justify-between gap-[12px] self-stretch">
        <div className="flex-1 text-base/5 font-medium text-text-primary" style={{ fontFamily: FONT_MEDIUM }}>
          OneLinkAI
        </div>
        <StatusSwitch on={false} onClick={onToggle} />
      </div>
      <div className="flex flex-1 items-center justify-center self-stretch">
        <AccentButton className="h-9" onClick={onConfigure} textClassName="text-center">
          开始配置API
        </AccentButton>
      </div>
    </div>
  );
}

function ConfiguredProviderCard({ title, modelCount, date, enabled, onEdit, onTest, onToggle }) {
  return (
    <div className="flex h-50 flex-1 flex-col gap-[12px] rounded-lg border border-solid border-stroke-normal bg-input-bg-normal px-[16px] py-[12px] outline outline-1 outline-stroke-outline outline-offset-1">
      <div className="flex items-center justify-between gap-[12px] self-stretch">
        <div className="flex-1 text-base/5 font-medium text-text-primary" style={{ fontFamily: FONT_MEDIUM }}>
          {title}
        </div>
        <StatusSwitch on={enabled} onClick={onToggle} />
      </div>
      <div className="flex flex-1 flex-col items-start gap-[12px] self-stretch">
        <InfoRow label="已配置模型" value={`${modelCount}个`} />
        <InfoRow label="添加时间" value={date} />
      </div>
      <div className="flex h-9 items-center justify-between gap-[16px] self-stretch">
        <SecondaryButton className="h-9" onClick={onEdit}>
          编辑配置
        </SecondaryButton>
        <AccentButton className="h-9" onClick={onTest} textClassName="w-14 text-center">
          测试连接
        </AccentButton>
      </div>
    </div>
  );
}

function CustomProviderCard({ configured, enabled, modelCount, providerName, onConfigure, onEdit, onToggle }) {
  if (configured) {
    return (
      <ConfiguredProviderCard
        title={providerName}
        modelCount={modelCount}
        date="2026-01-01"
        enabled={enabled}
        onEdit={onEdit}
        onTest={() => undefined}
        onToggle={onToggle}
      />
    );
  }

  return (
    <div className="flex h-50 flex-1 flex-col items-center justify-center gap-[12px] rounded-lg border border-solid border-stroke-normal bg-input-bg-normal px-[16px] py-[12px] outline outline-1 outline-stroke-outline outline-offset-1">
      <div className="self-stretch text-center text-base/5 font-medium text-text-primary opacity-0" style={{ fontFamily: FONT_MEDIUM }}>
        OneLinkAI
      </div>
      <div className="flex flex-1 items-center justify-center self-stretch">
        <SecondaryButton
          className="h-9"
          icon={<PlusIcon className="h-[16px] w-[16px] grow-0 shrink basis-auto self-auto text-white-80" />}
          onClick={onConfigure}
          textClassName="text-white-80"
        >
          自定义服务商
        </SecondaryButton>
      </div>
      <div className="flex items-center justify-between self-stretch opacity-0">
        <div className="text-sm/4.5 text-text-secondary" style={{ fontFamily: FONT }}>
          状态
        </div>
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
                  onTest={() => undefined}
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
                  modelCount={provider.models.length}
                  providerName={provider.name || DEFAULT_PROVIDER_NAME}
                  onConfigure={onOpenCustomProvider}
                  onEdit={() => onEditCustomProvider(provider.id)}
                  onToggle={() => onToggleCustomProvider(provider.id)}
                />
              </div>
            ))}

            {canAddCustomProvider ? (
              <div className="w-[calc((100%-32px)/3)]">
                <CustomProviderCard configured={false} enabled={false} modelCount={0} providerName={DEFAULT_PROVIDER_NAME} onConfigure={onOpenCustomProvider} onEdit={() => undefined} onToggle={() => undefined} />
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
            <span className="text-text-accent">获取API</span>
            后即可开始使用
            <br />
            您也可以使用其他API服务，添加自定义模型，
            <span className="text-text-accent">查看教程</span>
            <br />
            为保证安全，您的API配置仅保存在本地浏览器，不会上传到云端
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-[16px] rounded-b-2xl bg-surface-modal px-[24px] py-[16px]">
        <div className="flex flex-1 items-center justify-end gap-[16px]">
          <SecondaryButton className="h-9" onClick={onClose}>
            取消
          </SecondaryButton>
          <PrimaryButton className="h-9" innerClassName="px-[15px]" onClick={onComplete}>
            完成
          </PrimaryButton>
        </div>
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
      <div className="flex items-center justify-between gap-[16px] rounded-b-2xl bg-surface-modal px-[24px] py-[16px]">
        <div className="flex flex-1 items-center justify-end gap-[16px]">{footer}</div>
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
            className={`flex flex-col items-center gap-[4px] transition-opacity hover:opacity-80 active:opacity-60 ${active ? '' : ''}`}
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

function ModelCard({ model, onToggle }) {
  return (
    <div className="flex flex-col items-start justify-center gap-[6px] self-stretch rounded-lg bg-input-bg-normal px-[12px] py-[8px]">
      <div className="flex items-center justify-between gap-[6px] self-stretch">
        <div className="shrink-0 text-sm/4.5 font-medium text-text-primary" style={{ fontFamily: FONT_MEDIUM }}>
          {model.name}
        </div>
        <StatusSwitch on={model.enabled} onClick={onToggle} onLabel="启用" />
      </div>
      <div className="self-stretch text-xs/4 text-text-secondary" style={{ fontFamily: FONT }}>
        {model.description}
      </div>
    </div>
  );
}

function ConfigModelModal({
  title,
  apiValue,
  apiPlaceholder,
  onApiChange,
  activeTab,
  onChangeTab,
  models,
  onAddModel,
  onCancel,
  onSave,
  onToggleModel,
}) {
  const activeTabIndex = Math.max(MODEL_TABS.indexOf(activeTab), 0);

  return (
    <NestedModal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <SecondaryButton className="h-9" onClick={onCancel}>
            取消
          </SecondaryButton>
          <PrimaryButton className="h-9" innerClassName="px-[15px]" onClick={onSave}>
            保存
          </PrimaryButton>
        </>
      }
    >
      <div className="flex flex-col items-start gap-[8px] self-stretch">
        <div className="self-stretch text-sm/4.5 text-text-primary" style={{ fontFamily: FONT }}>
          全局API
        </div>
        <div className="flex items-start gap-[8px] self-stretch">
          <TextInput
            value={apiValue}
            onChange={onApiChange}
            placeholder={apiPlaceholder}
            readOnly={Boolean(apiValue && apiValue.includes('自动代入'))}
          />
          <AccentButton className="h-9" textClassName="text-center">
            测试连接
          </AccentButton>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-start gap-[12px] self-stretch overflow-hidden">
        <ModelTabs activeTab={activeTab} onChange={onChangeTab} />
        <div className="w-full overflow-hidden">
          <div
            className="flex will-change-transform"
            style={{
              width: `${MODEL_TABS.length * 100}%`,
              transform: `translateX(-${activeTabIndex * (100 / MODEL_TABS.length)}%)`,
              transition: `transform ${TAB_SLIDE_DURATION}ms ease`,
            }}
          >
            {MODEL_TABS.map((tab) => (
              <div key={tab} className="flex shrink-0 flex-col items-start gap-[12px]" style={{ width: `${100 / MODEL_TABS.length}%` }}>
                {models.map((model) => (
                  <ModelCard key={`${tab}-${model.id}`} model={model} onToggle={() => onToggleModel(model.id)} />
                ))}
                <SecondaryButton
                  className="h-9 w-full justify-center"
                  icon={<PlusIcon className="h-[16px] w-[16px] text-text-secondary" />}
                  onClick={onAddModel}
                  textClassName="text-center"
                >
                  添加模型
                </SecondaryButton>
              </div>
            ))}
          </div>
        </div>
      </div>
    </NestedModal>
  );
}

function EditModelModal({ draft, onChange, onCancel, onSave, title = '添加模型' }) {
  return (
    <NestedModal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <SecondaryButton className="h-9" onClick={onCancel}>
            取消
          </SecondaryButton>
          <PrimaryButton className="h-9" innerClassName="px-[15px]" onClick={onSave}>
            添加并启用
          </PrimaryButton>
        </>
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
  return (
    <NestedModal
      title="自定义API服务商"
      onClose={onCancel}
      footer={
        <>
          <SecondaryButton className="h-9" onClick={onCancel}>
            取消
          </SecondaryButton>
          <PrimaryButton className="h-9" innerClassName="px-[15px]" onClick={onAdd}>
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

export default function ApiConfigModal({ open, onClose }) {
  const [state, setState] = useState(createDefaultState);

  function resetState() {
    setState(createDefaultState);
  }

  function closeMain() {
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
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') {
        return;
      }

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
  const maskedCustomApiKey = useMemo(() => {
    const apiKey = activeCustomProvider?.apiKey ?? '';
    if (!apiKey) return '******（自动代入）';
    return `${'*'.repeat(Math.max(6, apiKey.length))}（自动代入）`;
  }, [activeCustomProvider]);
  const canAddCustomProvider = state.customProviders.length < MAX_CUSTOM_PROVIDERS;

  if (!open) return null;

  const updateState = (key, value) => {
    setState((current) => ({ ...current, [key]: value }));
  };

  const updateDraft = (draftKey, field, value) => {
    setState((current) => ({
      ...current,
      [draftKey]: {
        ...current[draftKey],
        [field]: value,
      },
    }));
  };

  const updateCustomProviderDraft = (field, value) => {
    setState((current) => ({
      ...current,
      customProviderDraft: {
        ...current.customProviderDraft,
        [field]: value,
      },
    }));
  };

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
    setState((current) => ({
      ...current,
      mainConfigured: true,
      onelinkEnabled: true,
      childView: null,
    }));
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
  };

  const addCustomProvider = () => {
    setState((current) => {
      if (current.customProviders.length >= MAX_CUSTOM_PROVIDERS) {
        return current;
      }

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
          {
            id: providerId,
            configured: false,
            enabled: false,
            name: draft.name,
            vendor: draft.vendor,
            baseUrl: draft.baseUrl,
            apiKey: draft.apiKey,
            models: [],
          },
        ],
      };
    });
  };

  const addOnelinkModel = () => {
    setState((current) => {
      const draft = current.onelinkModelDraft;
      const nextModel = {
        id: `onelinkModels-${Date.now()}`,
        name: draft.name || 'GPT5.1',
        description: draft.note || MODEL_DESCRIPTION,
        enabled: true,
      };

      return {
        ...current,
        onelinkModels: [...current.onelinkModels, nextModel],
        onelinkModelDraft: createEmptyModelDraft(),
        childView: 'onelink-config',
      };
    });
  };

  const addCustomProviderModel = () => {
    setState((current) => {
      const draft = current.customProviderModelDraft;
      const nextModel = {
        id: `customProviderModels-${Date.now()}`,
        name: draft.name || 'GPT5.1',
        description: draft.note || MODEL_DESCRIPTION,
        enabled: true,
      };

      return {
        ...current,
        customProviderModelDraft: createEmptyModelDraft(),
        childView: 'custom-provider-model-config',
        customProviders: current.customProviders.map((provider) =>
          provider.id === current.activeCustomProviderId ? { ...provider, models: [...provider.models, nextModel] } : provider,
        ),
      };
    });
  };

  const toggleOnelinkModel = (modelId) => {
    setState((current) => ({
      ...current,
      onelinkModels: current.onelinkModels.map((model) => (model.id === modelId ? { ...model, enabled: !model.enabled } : model)),
    }));
  };

  const toggleCustomProviderModel = (modelId) => {
    setState((current) => ({
      ...current,
      customProviders: current.customProviders.map((provider) =>
        provider.id === current.activeCustomProviderId
          ? {
              ...provider,
              models: provider.models.map((model) => (model.id === modelId ? { ...model, enabled: !model.enabled } : model)),
            }
          : provider,
      ),
    }));
  };

  const toggleCustomProvider = (providerId) => {
    setState((current) => ({
      ...current,
      customProviders: current.customProviders.map((provider) =>
        provider.id === providerId && provider.configured ? { ...provider, enabled: !provider.enabled } : provider,
      ),
    }));
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
            models={state.onelinkModels}
            onAddModel={() => updateState('childView', 'edit-onelink-model')}
            onCancel={closeChild}
            onSave={saveOneLinkConfig}
            onToggleModel={toggleOnelinkModel}
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
            apiValue={maskedCustomApiKey}
            apiPlaceholder="******（自动代入）"
            activeTab={state.activeModelTab}
            onChangeTab={(tab) => updateState('activeModelTab', tab)}
            models={activeCustomProvider?.models ?? []}
            onAddModel={() => updateState('childView', 'edit-custom-model')}
            onCancel={closeChild}
            onSave={saveCustomProviderModelConfig}
            onToggleModel={toggleCustomProviderModel}
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
              if (!current.mainConfigured) {
                return { ...current, childView: 'onelink-config' };
              }
              return { ...current, onelinkEnabled: !current.onelinkEnabled };
            })
          }
          customProviders={state.customProviders}
          canAddCustomProvider={canAddCustomProvider}
          onEditCustomProvider={openCustomProviderConfig}
          onToggleCustomProvider={toggleCustomProvider}
        />

        {state.childView ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-surface-overlay/60 backdrop-blur-[4px]" onClick={closeChild}>
            {renderChildModal()}
          </div>
        ) : null}
      </div>
    </div>
  );
}
