import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import ReactMarkdown from 'react-markdown';
import { PulsingBorder } from '@paper-design/shaders-react';

const FONT = "'AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif";
const FONT_MEDIUM = "'AlibabaPuHuiTi_2_65_Medium','Alibaba_PuHuiTi_2.0',system-ui,sans-serif";

const ALLOWED_EXTS = ['.txt', '.md', '.pdf', '.docx'];

const MOCK_SCRIPT_MARKDOWN = `# 两只老虎的青枫奇遇

## 第一集：陌生的邻居

**场景1：青枫林·晨光草地（0:00-1:30）**

【镜头1】俯拍：青枫林被晨雾笼罩，金黄的枫叶落在草地上，露珠折射阳光。背景音乐：轻快的森林鸟鸣声，轻柔的钢琴旋律。

【镜头2】近景：橙色皮毛的小老虎乐乐，额头上的"王"字歪歪扭扭，尾巴翘得老高，正追着一只蝴蝶跑，爪子偶尔扒拉一下地上的枫叶。

乐乐（活泼大喊，耳朵抖动）：别跑呀！陪我玩一会儿～

【镜头3】特写：蝴蝶停在一片枫叶上，乐乐猛地扑过去，摔了个四脚朝天，肚皮露在外面，一脸懊恼。

乐乐（揉着鼻子，小声嘟囔）：哼，居然敢耍我！

**场景2：青枫林·枫树下（1:30-4:00）**

【镜头1】侧拍：一棵粗壮的枫树下，白色皮毛的小老虎安安正安静地趴在石头上，闭着眼睛晒太阳，耳朵时不时动一下，警惕周围的动静。它的"王"字整齐端正，眼神沉稳。

【镜头2】全景：乐乐摔疼后，抬头看到安安，眼睛一亮，尾巴甩得更欢，踮着脚尖跑过去。

乐乐（凑到安安身边，小声试探）：喂！你是谁呀？怎么和我长得不一样？你也是老虎吗？

【镜头3】特写：安安缓缓睁开眼睛，眼神冷淡，瞥了乐乐一眼，没有说话，只是往石头里面挪了挪，避开乐乐。

乐乐（不气馁，凑得更近，鼻子快碰到安安的皮毛）：我叫乐乐！我住在这片林子的东边，你住在这里吗？我们一起玩好不好？

【镜头4】中景：安安猛地站起身，耳朵竖起来，对着乐乐低吼了一声，转身跳进枫树林深处，只留下一个白色的背影。

乐乐（被吓了一跳，往后退了两步，挠了挠头）：奇怪，它怎么不理我呀？

**场景3：青枫林·小溪边（4:00-6:00）**

【镜头1】中景：乐乐跟着安安的脚印，走到小溪边，看到安安正低头喝水，动作优雅，尾巴轻轻搭在地上。

【镜头2】近景：乐乐小心翼翼地走过去，蹲在小溪另一边，也低下头喝水，时不时偷偷瞥向安安。

乐乐（小声说）：我知道啦，你是不是不喜欢热闹？我不吵你，我们一起喝水好不好？

【镜头3】特写：安安喝水的动作顿了一下，没有回头，也没有回应，但尾巴轻轻动了一下，没有再赶走乐乐。

【镜头4】全景：阳光穿透枫叶，洒在两只老虎身上，小溪潺潺流淌，画面安静又温暖。

【音效】轻微的水流声，远处的鸟鸣声，背景音乐渐弱。

**【结尾字幕】** 下集预告：意外降临，乐乐陷入麻烦，安安会出手相助吗？`;

function parseScriptOutline(markdown) {
  if (!markdown) return [];

  const entries = [];
  let offset = 0;

  markdown.split('\n').forEach((line) => {
    if (/^#\s/.test(line)) {
      entries.push({
        title: line.replace(/^#\s+/, '').trim(),
        level: 1,
        offset,
      });
    } else if (/^##\s/.test(line)) {
      entries.push({
        title: line.replace(/^##\s+/, '').trim(),
        level: 2,
        offset,
      });
    }

    offset += line.length + 1;
  });

  return entries;
}

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

const ROTATE_STYLE_ID = 'chatbox-rotate-keyframe';
function ensureRotateKeyframe() {
  if (document.getElementById(ROTATE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = ROTATE_STYLE_ID;
  style.textContent = `
    @property --chatbox-angle {
      syntax: '<angle>';
      initial-value: 161.1deg;
      inherits: false;
    }
    @keyframes chatbox-spin {
      from { --chatbox-angle: 161.1deg; }
      to { --chatbox-angle: 521.1deg; }
    }
  `;
  document.head.appendChild(style);
}

const THINKING_STYLE_ID = 'script-thinking-style';
function ensureThinkingStyle() {
  if (document.getElementById(THINKING_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = THINKING_STYLE_ID;
  style.textContent = `
    @keyframes thinking-dot {
      0%, 60%, 100% { opacity: 0.2; transform: translateY(0px); }
      30% { opacity: 1; transform: translateY(-4px); }
    }
    @keyframes thinking-label-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0px); }
    }
    @keyframes thinking-label-out {
      from { opacity: 1; transform: translateY(0px); }
      to { opacity: 0; transform: translateY(-6px); }
    }
    .thinking-dot { animation: thinking-dot 1.4s ease-in-out infinite; }
    .thinking-dot:nth-child(1) { animation-delay: 0s; }
    .thinking-dot:nth-child(2) { animation-delay: 0.2s; }
    .thinking-dot:nth-child(3) { animation-delay: 0.4s; }
    .thinking-label-in { animation: thinking-label-in 0.35s cubic-bezier(0.4,0,0.2,1) forwards; }
    .thinking-label-out { animation: thinking-label-out 0.25s cubic-bezier(0.4,0,0.2,1) forwards; }
  `;
  document.head.appendChild(style);
}

const SCROLLBAR_STYLE_ID = 'script-scrollbar-style';
function ensureScrollbarStyle() {
  if (document.getElementById(SCROLLBAR_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = SCROLLBAR_STYLE_ID;
  style.textContent = `
    .script-scroll::-webkit-scrollbar { width: 4px; }
    .script-scroll::-webkit-scrollbar-track { background: transparent; }
    .script-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 9999px; transition: background 0.2s; }
    .script-scroll:hover::-webkit-scrollbar-thumb { background: #FFFFFF0D; }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    .ai-text--typing::after { content: '|'; display: inline; opacity: 1; animation: blink 1s step-end infinite; color: #FFFFFFCC; margin-left: 1px; }
  `;
  document.head.appendChild(style);
}

const EDITOR_STYLE_ID = 'script-editor-style';
function ensureEditorStyle() {
  if (document.getElementById(EDITOR_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = EDITOR_STYLE_ID;
  style.textContent = `
    .tiptap-editor .ProseMirror {
      outline: none;
      caret-color: #2DC3E1;
    }
    .tiptap-editor .ProseMirror h1 {
      color: #FFFFFF;
      font-family: 'AlibabaPuHuiTi_2_85_Bold', 'Alibaba_PuHuiTi_2.0', system-ui, sans-serif;
      font-size: 20px;
      line-height: 24px;
      font-weight: bold;
      margin: 0 0 8px;
    }
    .tiptap-editor .ProseMirror h2 {
      color: #FFFFFF;
      font-family: 'AlibabaPuHuiTi_2_85_Bold', 'Alibaba_PuHuiTi_2.0', system-ui, sans-serif;
      font-size: 16px;
      line-height: 20px;
      font-weight: bold;
      margin: 12px 0 6px;
    }
    .tiptap-editor .ProseMirror p {
      color: #FFFFFFCC;
      font-family: 'AlibabaPuHuiTi_2_55_Regular', 'Alibaba_PuHuiTi_2.0', system-ui, sans-serif;
      font-size: 14px;
      line-height: 150%;
      margin: 4px 0;
    }
    .tiptap-editor .ProseMirror strong {
      color: #FFFFFF;
      font-family: 'AlibabaPuHuiTi_2_65_Medium', 'Alibaba_PuHuiTi_2.0', system-ui, sans-serif;
    }
    .tiptap-editor .ProseMirror ul,
    .tiptap-editor .ProseMirror ol {
      padding-left: 20px;
      color: #FFFFFFCC;
      font-family: 'AlibabaPuHuiTi_2_55_Regular', 'Alibaba_PuHuiTi_2.0', system-ui, sans-serif;
      font-size: 14px;
      line-height: 150%;
      margin: 4px 0;
    }
    .tiptap-editor .ProseMirror li { margin: 2px 0; }
    .tiptap-editor .ProseMirror li p { margin: 0; }
    .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
      color: #FFFFFF33;
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }
    .script-md {
      min-height: 0;
      height: 100%;
      overflow-y: auto;
      padding-right: 4px;
      scroll-behavior: smooth;
    }
    .script-md h1 {
      color: #FFFFFF;
      font-family: 'AlibabaPuHuiTi_2_85_Bold', 'Alibaba_PuHuiTi_2.0', system-ui, sans-serif;
      font-size: 20px;
      line-height: 24px;
      font-weight: bold;
      margin: 0 0 8px;
    }
    .script-md h2 {
      color: #FFFFFF;
      font-family: 'AlibabaPuHuiTi_2_85_Bold', 'Alibaba_PuHuiTi_2.0', system-ui, sans-serif;
      font-size: 16px;
      line-height: 20px;
      font-weight: bold;
      margin: 12px 0 6px;
      scroll-margin-top: 20px;
    }
    .script-md p {
      color: #FFFFFFCC;
      font-family: 'AlibabaPuHuiTi_2_55_Regular', 'Alibaba_PuHuiTi_2.0', system-ui, sans-serif;
      font-size: 14px;
      line-height: 150%;
      margin: 4px 0;
    }
    .script-md strong {
      color: #FFFFFF;
      font-family: 'AlibabaPuHuiTi_2_65_Medium', 'Alibaba_PuHuiTi_2.0', system-ui, sans-serif;
    }
    .script-md ul,
    .script-md ol {
      padding-left: 20px;
      color: #FFFFFFCC;
      font-family: 'AlibabaPuHuiTi_2_55_Regular', 'Alibaba_PuHuiTi_2.0', system-ui, sans-serif;
      font-size: 14px;
      line-height: 150%;
      margin: 4px 0;
    }
    .script-md li { margin: 2px 0; }
  `;
  document.head.appendChild(style);
}

function UploadPlaceholder({ onFileSelect, disabled = false }) {
  const [hovered, setHovered] = useState(false);
  const fileInputRef = useRef(null);

  const defaultBack = { opacity: 0.6, bg: '#FFFFFF14', rotate: '0deg' };
  const defaultFront = { bg: '#262626', rotate: '345deg', tx: 'calc(-50% - 7.015px)', ty: 'calc(-50% + 6.717px)' };
  const defaultIcon = { stroke: '#FFFFFF33', tx: 'calc(-50% - 1.349px)', ty: 'calc(-50% + 1.757px)', rotate: '345deg' };

  const hoverBack = { opacity: 0.6, bg: '#FFFFFF3D', rotate: '5deg' };
  const hoverFront = { bg: '#3D3D3D', rotate: '351deg', tx: 'calc(-50% - 4.422px)', ty: 'calc(-50% + 3.811px)' };
  const hoverIcon = { stroke: '#FFFFFF80', tx: 'calc(-50% - 0.865px)', ty: 'calc(-50% + 1.012px)', rotate: '351deg' };

  const back = hovered ? hoverBack : defaultBack;
  const front = hovered ? hoverFront : defaultFront;
  const icon = hovered ? hoverIcon : defaultIcon;
  const transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';

  const handleChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    const invalid = selected.filter((file) => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      return !ALLOWED_EXTS.includes(ext);
    });
    if (invalid.length) {
      alert('仅支持 txt、md、pdf、docx 格式的文件');
      e.target.value = '';
      return;
    }
    onFileSelect?.(selected);
    e.target.value = '';
  };

  return (
    <button
      type="button"
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !disabled && fileInputRef.current?.click()}
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
        outlineOffset: '0px',
        borderRadius: '8px',
      }}
    >
      <input ref={fileInputRef} type="file" multiple accept=".txt,.md,.pdf,.docx" className="hidden" onChange={handleChange} />
      <div
        style={{
          width: '44px',
          height: '60px',
          borderRadius: '4px',
          flexShrink: 0,
          boxShadow: '#FFFFFF14 0px 0px 0px 0.5px inset',
          opacity: back.opacity,
          background: back.bg,
          rotate: back.rotate,
          transition,
        }}
      />
      <div
        style={{
          width: '44px',
          height: '60px',
          borderRadius: '4px',
          position: 'absolute',
          boxShadow: '#FFFFFF14 0px 0px 0px 0.5px inset',
          transformOrigin: 'top left',
          background: front.bg,
          rotate: front.rotate,
          left: '50%',
          top: '50%',
          translate: `${front.tx} ${front.ty}`,
          transition,
        }}
      />
      <svg
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          translate: `${icon.tx} ${icon.ty}`,
          rotate: icon.rotate,
          transformOrigin: '0% 0%',
          transition,
        }}
      >
        <path d="M8 3v10M3 8h10" stroke={icon.stroke} strokeWidth="1.5" strokeLinecap="round" style={{ transition }} />
      </svg>
    </button>
  );
}

const MODEL_OPTIONS_1 = ['Doubao-Seed-2.0-Pro', 'Doubao-Seed-1.6', 'Claude Sonnet 4.6', 'GPT-4o'];
const MODEL_OPTIONS_2 = ['集数：自动适应', '集数：1集', '集数：3集', '集数：5集', '集数：10集'];

function ModelSelector({ label, options, width, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(label);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const isActive = open || hovered;

  return (
    <div ref={ref} style={{ position: 'relative', width }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((value) => !value)}
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
          width: '100%',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: open ? '#252525' : isActive ? '#222222' : '#1D1E1E',
          borderColor: open ? '#FFFFFF33' : '#FFFFFF14',
          outline: focused || open ? '1px solid #2DC3E180' : '1px solid #00000080',
          transition: 'background 0.2s, border-color 0.2s, outline 0.2s, opacity 0.2s',
          opacity: disabled ? 0.45 : 1,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: '12px',
            lineHeight: '16px',
            color: '#FFFFFFCC',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {selected}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            flexShrink: 0,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <path d="M12 6.333L8 10.333L4 6.333H12Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1.333" strokeLinejoin="round" />
        </svg>
      </button>

      {open && !disabled && (
        <div
          style={{
            position: 'absolute',
            zIndex: 50,
            left: 0,
            marginBottom: '4px',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#1D1E1E',
            border: '1px solid #FFFFFF14',
            outline: '1px solid #00000080',
            minWidth: '100%',
            boxShadow: '0 -8px 24px #00000066',
            bottom: '100%',
          }}
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setSelected(option);
                setOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
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
                color: option === selected ? '#FFFFFF' : '#FFFFFFCC',
                background: option === selected ? '#FFFFFF14' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(event) => {
                if (option !== selected) event.currentTarget.style.background = '#FFFFFF0A';
              }}
              onMouseLeave={(event) => {
                if (option !== selected) event.currentTarget.style.background = 'transparent';
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
        gap: '0px',
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
          {[0, 1, 2].map((index) => (
            <div key={index} className="thinking-dot" style={{ width: '4px', height: '4px', borderRadius: '9999px', background: '#FFFFFF' }} />
          ))}
        </div>
      ) : (
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%' }}>
          <path d="M8.003 4.7V14" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 8.667L8 4.667L12 8.667" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 2H12" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function FileCard({ file, onRemove, disabled = false }) {
  const [hovered, setHovered] = useState(false);

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
      <div
        style={{
          fontFamily: FONT,
          fontSize: '14px',
          lineHeight: '150%',
          alignSelf: 'stretch',
          flex: 1,
          overflow: 'hidden',
          color: '#FFFFFF',
        }}
      >
        {truncateFileName(file.name)}
      </div>
      <div style={{ fontFamily: FONT, fontSize: '12px', lineHeight: '150%', alignSelf: 'stretch', color: '#FFFFFF66' }}>
        {formatFileSize(file.size)}
      </div>
      {hovered && !disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            top: '-5px',
            right: '-5px',
            width: '16px',
            height: '16px',
            borderRadius: '9999px',
            background: '#505151',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
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

function InputCard({ onSend, width = '700px', disabled = false }) {
  const [text, setText] = useState('');
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    ensureRotateKeyframe();
    ensureThinkingStyle();
  }, []);

  const handleFileSelect = (newFiles) => setFiles((prev) => [...prev, ...newFiles]);
  const handleRemoveFile = (index) => setFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index));

  const canSend = !disabled && (text.trim() || files.length > 0);

  const handleSend = () => {
    if (!canSend) return;
    onSend(text.trim(), files);
    setText('');
    setFiles([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isTyping = focused || text.length > 0;
  const hoverBg = 'conic-gradient(from var(--chatbox-angle), oklab(86.8% -0.081 -0.057 / 30%) 0%, oklab(75.5% -0.102 -0.072 / 25%) 15%, oklab(75.5% -0.102 -0.072 / 0%) 50%, oklab(100% 0 0 / 5%) 55%, oklab(86.8% -0.081 -0.057 / 30%) 100%)';
  const idleBg = 'linear-gradient(in oklab 161.1deg, oklab(86.8% -0.081 -0.057 / 30%) 9.06%, oklab(75.5% -0.102 -0.072 / 25%) 15.35%, oklab(75.5% -0.102 -0.072 / 0%) 52.98%, oklab(100% 0 0 / 5%) 56.39%)';

  const wrapperStyle = (() => {
    if (isTyping) return { background: '#2DC3E1', animation: 'none' };
    if (hovered) return { backgroundImage: hoverBg, animation: 'chatbox-spin 4s linear infinite' };
    return { backgroundImage: idleBg, animation: 'none' };
  })();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0px',
        borderRadius: '20px',
        justifyContent: 'flex-end',
        flexShrink: 0,
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
          <UploadPlaceholder onFileSelect={handleFileSelect} disabled={disabled} />
          <textarea
            disabled={disabled}
            className="placeholder:text-[#FFFFFF66]"
            style={{
              flex: 1,
              alignSelf: 'stretch',
              resize: 'none',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: FONT,
              fontSize: '14px',
              lineHeight: '18px',
              color: text ? '#FFFFFFCC' : '#FFFFFF66',
            }}
            placeholder="告诉导演你想拍什么或者直接上传剧本"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0px', justifyContent: 'space-between', alignSelf: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: 0 }}>
            <ModelSelector label="Doubao-Seed-2.0-Pro" options={MODEL_OPTIONS_1} width="180px" disabled={disabled} />
            <ModelSelector label="集数：自动适应" options={MODEL_OPTIONS_2} width="140px" disabled={disabled} />
          </div>
          <SendButton onClick={handleSend} disabled={!canSend} loading={disabled} />
        </div>
      </div>
    </div>
  );
}

function ScriptEmptyState({ onSend }) {
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
        paddingBottom: '24px',
      }}
    >
      <InputCard onSend={onSend} width="700px" />
    </div>
  );
}

function EpisodeItem({ title, level, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        height: '36px',
        paddingLeft: '16px',
        paddingRight: '16px',
        borderRadius: '8px',
        alignSelf: 'stretch',
        flexShrink: 0,
        cursor: 'pointer',
        backgroundColor: isSelected ? '#FFFFFF0D' : hovered ? '#FFFFFF0A' : 'transparent',
        transition: 'background-color 0.15s',
        border: 'none',
        outline: 'none',
        textAlign: 'left',
      }}
    >
      <span
        style={{
          fontFamily: FONT,
          fontSize: '14px',
          lineHeight: '18px',
          color: isSelected ? '#FFFFFF' : '#FFFFFF99',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
          transition: 'color 0.15s',
          paddingLeft: level === 2 ? '16px' : '0px',
        }}
      >
        {title}
      </span>
    </button>
  );
}

function EpisodeList({ outline, selectedIndex, onSelect, loading = false }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '16px',
        width: '216px',
        minWidth: '216px',
        alignSelf: 'stretch',
        flexShrink: 0,
      }}
    >
      <div style={{ fontFamily: FONT_MEDIUM, fontSize: '16px', lineHeight: '20px', color: '#FFFFFF', alignSelf: 'stretch' }}>
        剧集结构
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'stretch', gap: '4px' }}>
        {outline.length > 0 ? (
          outline.map((item, index) => (
            <EpisodeItem key={`${item.level}-${item.offset}-${index}`} title={item.title} level={item.level} isSelected={index === selectedIndex} onClick={() => onSelect(index)} />
          ))
        ) : loading ? (
          [0, 1, 2].map((index) => (
            <div
              key={index}
              style={{
                height: '36px',
                borderRadius: '8px',
                alignSelf: 'stretch',
                background: index === 0 ? '#FFFFFF0A' : 'transparent',
                paddingLeft: '16px',
                paddingRight: '16px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: index === 0 ? '96px' : index === 1 ? '120px' : '88px',
                  height: '10px',
                  borderRadius: '9999px',
                  background: '#FFFFFF12',
                }}
              />
            </div>
          ))
        ) : (
          <div style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px' }}>
            <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFF4D' }}>
              等待剧本生成
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const THINKING_LABELS = ['分析剧情结构', '构建人物关系', '生成剧本内容', '润色台词细节'];

function AiThinkingMessage() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('in');

  useEffect(() => {
    ensureThinkingStyle();
  }, []);

  useEffect(() => {
    const outTimer = setTimeout(() => setPhase('out'), 1500);
    const switchTimer = setTimeout(() => {
      setIdx((value) => (value + 1) % THINKING_LABELS.length);
      setPhase('in');
    }, 1800);

    return () => {
      clearTimeout(outTimer);
      clearTimeout(switchTimer);
    };
  }, [idx]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', alignSelf: 'stretch', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '20px' }}>
        {[0, 1, 2].map((index) => (
          <div key={index} className="thinking-dot" style={{ width: '5px', height: '5px', borderRadius: '9999px', flexShrink: 0, background: '#2DC3E1' }} />
        ))}
      </div>
      <div style={{ position: 'relative', height: '20px', minWidth: '120px', overflow: 'hidden' }}>
        <span
          key={idx}
          className={phase === 'in' ? 'thinking-label-in' : 'thinking-label-out'}
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            translate: '0 -50%',
            fontFamily: FONT,
            fontSize: '13px',
            lineHeight: '20px',
            color: '#FFFFFF66',
            whiteSpace: 'nowrap',
          }}
        >
          {THINKING_LABELS[idx]}
        </span>
      </div>
    </div>
  );
}

const CHAR_INTERVAL = 20;

function AiStreamingContent({ content, onDone }) {
  const allChars = useMemo(() => [...content], [content]);
  const [index, setIndex] = useState(0);
  const containerRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);

  useEffect(() => {
    if (index >= allChars.length) {
      onDone?.();
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setIndex((value) => value + 1);
    }, CHAR_INTERVAL);

    return () => window.clearTimeout(timer);
  }, [allChars.length, index, onDone]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !shouldStickToBottomRef.current) return;
    container.scrollTop = container.scrollHeight;
  }, [index]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldStickToBottomRef.current = distanceToBottom <= 24;
  }, []);

  const displayed = allChars.slice(0, index).join('');
  const done = index >= allChars.length;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={done ? 'script-md script-scroll' : 'script-md script-scroll ai-text--typing'}
      style={{
        alignSelf: 'stretch',
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
      }}
    >
      <ReactMarkdown
        components={{
          h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
          h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
        }}
      >
        {displayed}
      </ReactMarkdown>
    </div>
  );
}

function ScriptRendered({ content, contentRef, onActiveIndexChange }) {
  const handleScroll = useCallback(() => {
    const container = contentRef?.current;
    if (!container) return;
    const containerTop = container.getBoundingClientRect().top;
    const headings = container.querySelectorAll('h2');
    let activeIndex = 0;
    for (let i = headings.length - 1; i >= 0; i--) {
      const rect = headings[i].getBoundingClientRect();
      if (rect.top - containerTop <= 24) {
        activeIndex = i;
        break;
      }
    }
    onActiveIndexChange?.(activeIndex);
  }, [contentRef, onActiveIndexChange]);

  return (
    <div
      ref={contentRef}
      className="script-md"
      style={{ alignSelf: 'stretch', flex: 1, minHeight: 0, overflowY: 'auto' }}
      onScroll={handleScroll}
    >
      <ReactMarkdown
        components={{
          h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
          h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function ToolbarBtn({ onClick, children, title }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        height: '26px',
        minWidth: '26px',
        paddingLeft: '8px',
        paddingRight: '8px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        fontFamily: FONT_MEDIUM,
        fontSize: '12px',
        lineHeight: '16px',
        background: pressed ? '#2DC3E1' : hovered ? '#FFFFFF14' : 'transparent',
        color: pressed ? '#090909' : '#FFFFFFCC',
        transition: 'background 0.15s, color 0.15s',
        transform: pressed ? 'scale(0.93)' : 'scale(1)',
        outline: 'none',
      }}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor }) {
  if (!editor) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        paddingBottom: '12px',
        borderBottom: '1px solid #FFFFFF14',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 1,
        background: '#161616',
      }}
    >
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="一级标题">
        H1
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="二级标题">
        H2
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setParagraph().run()} title="正文">
        正文
      </ToolbarBtn>

      <div style={{ width: '1px', height: '16px', background: '#FFFFFF14', margin: '0px 2px', flexShrink: 0 }} />

      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} title="加粗">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 6h4a2 2 0 0 0 0-4H3v4zm0 0h4.5a2.5 2.5 0 0 1 0 5H3V6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ToolbarBtn>

      <div style={{ width: '1px', height: '16px', background: '#FFFFFF14', margin: '0px 2px', flexShrink: 0 }} />

      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} title="无序列表">
        <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
          <circle cx="1.5" cy="2" r="1.2" fill="currentColor" />
          <circle cx="1.5" cy="6" r="1.2" fill="currentColor" />
          <circle cx="1.5" cy="10" r="1.2" fill="currentColor" />
          <path d="M5 2h8M5 6h8M5 10h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} title="有序列表">
        <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
          <text x="0" y="3.5" fontSize="4" fill="currentColor" fontFamily="monospace">1.</text>
          <text x="0" y="7.5" fontSize="4" fill="currentColor" fontFamily="monospace">2.</text>
          <text x="0" y="11.5" fontSize="4" fill="currentColor" fontFamily="monospace">3.</text>
          <path d="M5 2h8M5 6h8M5 10h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </ToolbarBtn>
    </div>
  );
}

function ScriptEditor({ initialContent, onContentChange, containerRef }) {
  useEffect(() => {
    ensureEditorStyle();
  }, []);

  const onContentChangeRef = useRef(onContentChange);
  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2] } }),
      Markdown.configure({ html: false, transformCopiedText: true, transformPastedText: true }),
    ],
    content: initialContent || '',
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onContentChangeRef.current?.(currentEditor.storage.markdown.getMarkdown());
    },
  });

  return (
    <div style={{ alignSelf: 'stretch', display: 'flex', flex: 1, minHeight: 0, flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
      <EditorToolbar editor={editor} />
      <div
        ref={containerRef}
        className="tiptap-editor"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '4px' }}
      >
        <EditorContent editor={editor} style={{ width: '100%' }} />
      </div>
    </div>
  );
}

function SecondaryBtn({ onClick, children, disabled = false }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);

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
        flexShrink: 0,
        borderRadius: '8px',
        height: '36px',
        padding: '1px',
        backgroundImage: 'linear-gradient(in oklab 148.76deg, oklab(94.7% -0.078 -0.022 / 30%) 3.64%, oklab(75.5% -0.102 -0.072 / 0%) 42.81%), linear-gradient(in oklab 180deg, #FFFFFF14, #FFFFFF14)',
        boxShadow: '#00000066 3px 3px 8px',
        outline: focused ? '1px solid #2DC3E180' : '1px solid #00000080',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.15s, transform 0.15s',
        opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
        transform: pressed ? 'scale(0.96)' : 'scale(1)',
        border: 'none',
        backgroundColor: 'transparent',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          borderRadius: '7px',
          gap: '4px',
          paddingLeft: '15px',
          paddingRight: '15px',
          background: disabled ? '#121212' : hovered ? '#1A1A1A' : '#161616',
          transition: 'background 0.15s',
        }}
      >
        {children}
      </div>
    </button>
  );
}

function PrimaryBtn({ onClick, children, disabled = false }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: '8px',
        gap: '4px',
        border: '1px solid #FFFFFF33',
        outline: focused ? '1px solid #2DC3E180' : '1px solid #00000080',
        cursor: disabled ? 'not-allowed' : 'pointer',
        height: '36px',
        paddingLeft: '16px',
        paddingRight: '16px',
        backgroundColor: '#2DC3E1',
        backgroundImage: 'linear-gradient(in oklab 107.51deg, oklab(84.6% -0.114 0.031 / 30%) 8.14%, oklab(84.6% -0.114 0.031 / 0%) 54.48%)',
        backgroundOrigin: 'border-box',
        opacity: disabled ? 0.45 : pressed ? 0.75 : hovered ? 0.88 : 1,
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'opacity 0.15s, transform 0.1s',
      }}
    >
      {children}
    </button>
  );
}

function ScriptPanel({
  phase,
  scriptContent,
  draftContent,
  onDraftChange,
  onEdit,
  onSave,
  onCancelEdit,
  onGoToSubject,
  onStreamingDone,
  onActiveIndexChange,
  renderedContentRef,
  editorContentRef,
}) {
  const isThinking = phase === 'thinking';
  const isStreaming = phase === 'streaming';
  const isEditing = phase === 'edit';
  const hasScript = Boolean(scriptContent);
  const displayContent = isEditing ? draftContent : scriptContent;
  const showActions = phase === 'view' || phase === 'edit';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignSelf: 'stretch', minHeight: 0, flex: 1 }}>
      <div
        style={{
          background: '#161616',
          border: `1px solid ${isEditing ? '#2DC3E1' : '#FFFFFF14'}`,
          borderRadius: '16px',
          paddingTop: '16px',
          paddingBottom: '16px',
          paddingLeft: '12px',
          paddingRight: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignSelf: 'stretch',
          overflow: 'hidden',
          transition: 'border-color 0.2s',
          flex: 1,
          minHeight: '0px',
        }}
      >
        {isThinking ? (
          <div style={{ display: 'flex', flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center' }}>
            <AiThinkingMessage />
          </div>
        ) : isStreaming ? (
          <AiStreamingContent key={scriptContent} content={scriptContent} onDone={onStreamingDone} />
        ) : isEditing ? (
          <ScriptEditor initialContent={draftContent} onContentChange={onDraftChange} containerRef={editorContentRef} />
        ) : (
          <ScriptRendered content={displayContent} contentRef={renderedContentRef} onActiveIndexChange={onActiveIndexChange} />
        )}
      </div>

      {showActions && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            alignSelf: 'stretch',
            minHeight: '36px',
            flexShrink: 0,
          }}
        >
          {isEditing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SecondaryBtn onClick={onSave}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13 4.5L6 11.5L3 8.5" stroke="#FFFFFF" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFFCC' }}>定稿</span>
              </SecondaryBtn>
              <SecondaryBtn onClick={onCancelEdit}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4.667 4.667L11.333 11.333" stroke="#FFFFFF" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.667 11.333L11.333 4.667" stroke="#FFFFFF" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFFCC' }}>取消</span>
              </SecondaryBtn>
            </div>
          ) : (
            <SecondaryBtn onClick={onEdit} disabled={!hasScript}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L4.667 14H2v-2.667L11.333 2z" stroke="#FFFFFF" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: FONT, fontSize: '14px', lineHeight: '18px', color: '#FFFFFFCC' }}>编辑</span>
            </SecondaryBtn>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PrimaryBtn onClick={onGoToSubject} disabled={!scriptContent}>
              <span style={{ fontFamily: FONT_MEDIUM, fontSize: '14px', lineHeight: '18px', color: '#090909', whiteSpace: 'nowrap' }}>
                开始提取主体
              </span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 8H2" stroke="#090909" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 4L14 8L10 12" stroke="#090909" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </PrimaryBtn>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScriptPage({ onGoToSubject }) {
  const [phase, setPhase] = useState('initial');
  const [hasStarted, setHasStarted] = useState(false);
  const [scriptContent, setScriptContent] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState(0);
  const renderedContentRef = useRef(null);
  const editorContentRef = useRef(null);

  useEffect(() => {
    ensureScrollbarStyle();
    ensureEditorStyle();
    ensureThinkingStyle();
  }, []);

  const visibleContent = phase === 'edit' ? draftContent : scriptContent;
  const outline = useMemo(() => parseScriptOutline(visibleContent).filter((item) => item.level === 2), [visibleContent]);
  const episodeRailLoading = hasStarted && (phase === 'thinking' || phase === 'streaming');
  const safeSelectedEpisode = outline.length > 0 ? Math.min(selectedEpisode, outline.length - 1) : 0;

  const handleSend = (text, files) => {
    if (!text && files.length === 0) return;

    setHasStarted(true);
    setPhase('thinking');
    setScriptContent('');
    setDraftContent('');
    setSelectedEpisode(0);

    setTimeout(() => {
      setScriptContent(MOCK_SCRIPT_MARKDOWN);
      setPhase('streaming');
    }, 3000);
  };

  const handleStreamingDone = useCallback(() => {
    setPhase('view');
  }, []);

  const handleEdit = () => {
    setDraftContent(scriptContent);
    setPhase('edit');
  };

  const handleSave = () => {
    if (!draftContent) return;
    setScriptContent(draftContent);
    setPhase('view');
  };

  const handleCancelEdit = () => {
    setDraftContent(scriptContent);
    setPhase('view');
  };

  const handleSelectEpisode = useCallback(
    (index) => {
      setSelectedEpisode(index);
      requestAnimationFrame(() => {
        const item = outline[index];
        if (!item) return;
        const container = phase === 'edit'
          ? editorContentRef.current
          : renderedContentRef.current;
        if (!container) return;
        const headings = container.querySelectorAll('h2');
        const heading = Array.from(headings).find((el) => el.textContent.trim() === item.title.trim());
        if (!heading) return;
        const containerTop = container.getBoundingClientRect().top;
        const headingTop = heading.getBoundingClientRect().top;
        container.scrollTop += headingTop - containerTop - 20;
      });
    },
    [outline, phase],
  );

  return (
    <div
      style={{
        display: 'flex',
        minHeight: 0,
        flex: 1,
        alignItems: 'stretch',
        gap: '24px',
        alignSelf: 'stretch',
        borderRadius: '16px',
        paddingTop: '16px',
        paddingBottom: '16px',
        paddingLeft: '24px',
        paddingRight: '24px',
        background: '#161616',
        border: '1px solid #FFFFFF14',
        overflow: 'hidden',
      }}
    >
      {!hasStarted ? (
        <ScriptEmptyState onSend={handleSend} />
      ) : (
        <div style={{ display: 'flex', minHeight: 0, flex: 1, alignItems: 'stretch', gap: '24px', alignSelf: 'stretch' }}>
          <EpisodeList outline={outline} selectedIndex={safeSelectedEpisode} onSelect={handleSelectEpisode} loading={episodeRailLoading} />

          <div style={{ display: 'flex', minHeight: 0, flex: 1, flexDirection: 'column', alignItems: 'stretch', justifyContent: 'space-between', gap: '24px', alignSelf: 'stretch', overflow: 'hidden' }}>
            <div style={{ display: 'flex', flex: 1, minHeight: 0, justifyContent: 'center', alignItems: 'stretch', overflow: 'hidden' }}>
              <div style={{ display: 'flex', width: '80%', maxWidth: '80%', minWidth: '0px', minHeight: 0, flexDirection: 'column', alignSelf: 'stretch' }}>
                <ScriptPanel
                  phase={phase}
                  scriptContent={scriptContent}
                  draftContent={draftContent}
                  onDraftChange={setDraftContent}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onCancelEdit={handleCancelEdit}
                  onGoToSubject={onGoToSubject}
                  onStreamingDone={handleStreamingDone}
                  onActiveIndexChange={setSelectedEpisode}
                  renderedContentRef={renderedContentRef}
                  editorContentRef={editorContentRef}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignSelf: 'stretch', paddingTop: '8px', overflow: 'visible', flexShrink: 0 }}>
              <InputCard onSend={handleSend} width="700px" disabled={phase === 'thinking' || phase === 'streaming'} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
