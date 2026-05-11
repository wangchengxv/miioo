import { useEffect, useRef, useState } from 'react';
import { PulsingBorder } from '@paper-design/shaders-react';
import bgImage from '../assets/home-bg.png';
import PrimaryNav from '../components/PrimaryNav';
import LoginModal from '../components/LoginModal';
import ApiConfigModal from '../components/ApiConfigModal';

const ICON_STYLE = { flexShrink: '0' };

const MAX_NOTIFICATION_ITEMS = 5;

const NOTIFICATION_ITEMS = [
  {
    id: 'n1',
    title: '系统通知',
    content: '你的项目《海上残响》已完成自动保存，可以继续编辑。',
    time: '3小时前',
    unread: true,
  },
  {
    id: 'n2',
    title: '创作提醒',
    content: '分镜草稿已生成完成，去时间轴里继续细化镜头。',
    time: '昨天',
    unread: true,
  },
  {
    id: 'n3',
    title: '协作动态',
    content: '林渡在《晨雾码头》里留下了 2 条批注。',
    time: '昨天',
    unread: false,
  },
  {
    id: 'n4',
    title: '系统通知',
    content: '你收藏的参考镜头包已同步到资产中心。',
    time: '2天前',
    unread: false,
  },
  {
    id: 'n5',
    title: '创作提醒',
    content: '角色设定页检测到可复用的风格提示词。',
    time: '2天前',
    unread: false,
  },
  {
    id: 'n6',
    title: '系统通知',
    content: '新一轮模型能力更新已开放体验。',
    time: '3天前',
    unread: false,
  },
];

const NAV_ITEMS = [
  {
    key: 'home',
    label: '首页',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={ICON_STYLE}>
        <path d="M3 6V14H13V6L8 2L3 6Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.333 9.667V14H9.667V9.667H6.333Z" stroke="#FFFFFF" strokeLinejoin="round" />
        <path d="M3 14H13" stroke="#FFFFFF" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'project',
    label: '项目',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={ICON_STYLE}>
        <path d="M1.667 3C1.667 2.632 1.965 2.333 2.333 2.333H6.333L8 4.333H13.666C14.035 4.333 14.333 4.632 14.333 5V13.667C14.333 14.035 14.035 14.333 13.666 14.333H2.333C1.965 14.333 1.667 14.035 1.667 13.667V3Z" stroke="#FFFFFF" strokeLinejoin="round" />
        <path d="M5.983 9.333H9.983" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'create',
    label: '创作',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={ICON_STYLE}>
        <g clipPath="url(#clip0_1037_281)">
          <path d="M5.86347 1.33264L9.56947 4.62603L13.7004 2.20108L11.6275 6.68533L15.3335 9.97995L10.3922 9.56735L8.5392 13.6859L7.51017 9.15599L2.56885 8.74462L6.89621 6.12943L5.86347 1.33264Z" stroke="white" strokeWidth="1.23533" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1.3335 15.3413L7.51015 9.15601" stroke="white" strokeWidth="1.23533" strokeLinecap="round" />
        </g>
        <defs>
          <clipPath id="clip0_1037_281">
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    key: 'assets',
    label: '资产',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={ICON_STYLE}>
        <path d="M1.667 2.667C1.667 2.298 1.965 2 2.333 2H6.333L8 4H13.667C14.035 4 14.333 4.298 14.333 4.667V13.333C14.333 13.701 14.035 14 13.667 14H2.333C1.965 14 1.667 13.701 1.667 13.333V2.667Z" stroke="#FFFFFF" strokeLinejoin="round" />
        <path d="M8 6.667L8.748 8.304L10.536 8.509L9.21 9.726L9.567 11.491L8 10.605L6.433 11.491L6.79 9.726L5.464 8.509L7.252 8.304L8 6.667Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function MenuPopupItem({ label }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      className="flex items-center gap-1 w-full rounded-md border-0 bg-transparent text-left cursor-pointer"
      style={{
        padding: '8px 12px',
        backgroundColor: pressed ? '#FFFFFF14' : hovered ? '#FFFFFF0D' : 'transparent',
        transition: 'background-color 120ms ease, color 120ms ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      <div
        className="w-fit shrink-0 font-['AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] text-sm/4.5"
        style={{ color: pressed || hovered ? '#FFFFFF' : '#FFFFFF99' }}
      >
        {label}
      </div>
    </button>
  );
}

const COMMUNITY_QR_CODE_URL = 'https://app.paper.design/file-assets/01KQYRKV5GAPKWF7X9K33912CS/01KR8EAVS6CW9V257SBVP40T1A.png';

function QRCodePopup({ anchorLeft }) {
  return (
    <div className="qr-popup" style={{ left: anchorLeft ?? 40, bottom: 24, translate: '0 -50%' }} role="dialog" aria-label="官方社群二维码">
      <div className="qr-popup-code" style={{ backgroundImage: `url(${COMMUNITY_QR_CODE_URL})` }} />
      <div className="qr-popup-caption font-['AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif]">
        扫码加入官方社群
      </div>
    </div>
  );
}

function NotificationEmptyIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="6" y="6" width="44" height="44" rx="22" fill="url(#notification-empty-bg)" />
      <rect x="6.5" y="6.5" width="43" height="43" rx="21.5" stroke="url(#notification-empty-stroke)" />
      <path d="M20.667 29.667H20V30.333H20.667V29.667ZM35.333 29.667V30.333H36V29.667H35.333ZM17.5 29C17.132 29 16.833 29.298 16.833 29.667C16.833 30.035 17.132 30.333 17.5 30.333V29ZM38.5 30.333C38.868 30.333 39.167 30.035 39.167 29.667C39.167 29.298 38.868 29 38.5 29V30.333ZM30.667 29.667H31.333C31.333 29.298 31.035 29 30.667 29V29.667ZM25.333 29.667V29C24.965 29 24.667 29.298 24.667 29.667H25.333ZM28 12.333V11.667C23.4 11.667 19.667 15.4 19.667 20H20.333H21C21 16.136 24.136 13 28 13V12.333ZM20.333 20H19.667V29.667H20.333H21V20H20.333ZM20.333 29.667V30.333H35.333V29.667V29H20.333V29.667ZM35.333 29.667H36V20H35.333H34.667V29.667H35.333ZM35.333 20H36C36 15.4 32.6 11.667 28 11.667V12.333V13C31.864 13 34.667 16.136 34.667 20H35.333ZM17.5 29.667V30.333H38.5V29.667V29H17.5V29.667ZM28 33V33.667C29.841 33.667 31.333 32.174 31.333 30.333H30.667H30C30 31.438 29.105 32.333 28 32.333V33ZM30.667 30.333H31.333V29.667H30.667H30V30.333H30.667ZM30.667 29.667V29H25.333V29.667V30.333H30.667V29.667ZM25.333 29.667H24.667V30.333H25.333H26V29.667H25.333ZM25.333 30.333H24.667C24.667 32.174 26.159 33.667 28 33.667V33V32.333C26.895 32.333 26 31.438 26 30.333H25.333Z" fill="url(#notification-empty-bell)" fillOpacity="0.92" />
      <circle cx="35" cy="17" r="3" fill="#7AE5B9" fillOpacity="0.9" />
      <defs>
        <linearGradient id="notification-empty-bg" x1="10" y1="10" x2="46" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.12" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="notification-empty-stroke" x1="10" y1="10" x2="46" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.24" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="notification-empty-bell" x1="28" y1="11.667" x2="28" y2="33.667" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#B7C0CC" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function NotificationEmptyState() {
  return (
    <div className="notification-empty-state">
      <div className="notification-empty-icon-wrap">
        <NotificationEmptyIcon />
      </div>
      <div className="font-['AlibabaPuHuiTi_2_65_Medium','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] font-medium text-base/5 text-white">
        暂无通知
      </div>
      <div className="max-w-[220px] text-center font-['AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] text-sm/5 text-[#FFFFFF99]">
        新的系统消息和创作提醒会显示在这里
      </div>
    </div>
  );
}

function NotificationCard({ item, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      className="notification-card"
      data-hovered={hovered}
      data-pressed={pressed}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      <div className="flex items-start gap-3 self-stretch">
        <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 w-full min-w-0">
            <div className="truncate font-['AlibabaPuHuiTi_2_65_Medium','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] font-medium text-sm/4.5 text-white">
              {item.title}
            </div>
            {item.unread && <span className="notification-card-dot" aria-hidden="true" />}
          </div>
          <div className="notification-card-content font-['AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] text-sm/5 text-[#FFFFFF99]">
            {item.content}
          </div>
        </div>
        <div className="shrink-0 font-['AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] text-xs/4 text-[#FFFFFF66]">
          {item.time}
        </div>
      </div>
    </button>
  );
}

function NotificationPopup({ items, onClose, anchorLeft }) {
  const [closeHovered, setCloseHovered] = useState(false);
  const [closePressed, setClosePressed] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollEndTimerRef = useRef(null);
  const visibleItems = items.slice(0, MAX_NOTIFICATION_ITEMS);
  const isEmpty = visibleItems.length === 0;

  useEffect(() => () => {
    if (scrollEndTimerRef.current) {
      window.clearTimeout(scrollEndTimerRef.current);
    }
  }, []);

  const handleListScroll = () => {
    setIsScrolling(true);
    if (scrollEndTimerRef.current) {
      window.clearTimeout(scrollEndTimerRef.current);
    }
    scrollEndTimerRef.current = window.setTimeout(() => {
      setIsScrolling(false);
      scrollEndTimerRef.current = null;
    }, 480);
  };

  return (
    <div className="notification-popup" style={{ left: anchorLeft ?? 40, bottom: 24 }} role="dialog" aria-label="消息中心">
      <div className="notification-popup-header">
        <div className="font-['AlibabaPuHuiTi_2_65_Medium','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] font-medium text-base/5 text-white">
          消息中心
        </div>
        <button
          type="button"
          className="notification-close"
          data-hovered={closeHovered}
          data-pressed={closePressed}
          onClick={onClose}
          onMouseEnter={() => setCloseHovered(true)}
          onMouseLeave={() => {
            setCloseHovered(false);
            setClosePressed(false);
          }}
          onMouseDown={() => setClosePressed(true)}
          onMouseUp={() => setClosePressed(false)}
          aria-label="关闭消息中心"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M10.5 3.5L3.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {isEmpty ? (
        <NotificationEmptyState />
      ) : (
        <div className="notification-popup-list" data-scrolling={isScrolling} onScroll={handleListScroll} role="list">
          {visibleItems.map((item) => (
            <NotificationCard key={item.id} item={item} onClick={onClose} />
          ))}
        </div>
      )}
    </div>
  );
}

const BOTTOM_NAV_ITEMS = [
  {
    key: 'apps',
    label: '应用',
    tooltip: '官方社群',
    popup: ({ anchorLeft }) => <QRCodePopup anchorLeft={anchorLeft} />,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={ICON_STYLE}>
        <path d="M14 2H10.667V5.333H14V2Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 10.667H10.667V14H14V10.667Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.333 10.667H2V14H5.333V10.667Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.333 2H2V5.333H5.333V2Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.667 8H10" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.667 8H13.334" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 12.333V13" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 5.667V10.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 2.667V3.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'notifications',
    label: '通知',
    tooltip: '通知',
    popup: ({ close, anchorLeft }) => <NotificationPopup items={NOTIFICATION_ITEMS} onClose={close} anchorLeft={anchorLeft} />,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={ICON_STYLE}>
        <path d="M3.8 12.2H3.3V12.7H3.8V12.2ZM12.2 12.2V12.7H12.7V12.2H12.2ZM2 11.7C1.724 11.7 1.5 11.924 1.5 12.2C1.5 12.476 1.724 12.7 2 12.7V12.2V11.7ZM14 12.7C14.276 12.7 14.5 12.476 14.5 12.2C14.5 11.924 14.276 11.7 14 11.7V12.2V12.7ZM9.5 12.2H10C10 11.924 9.776 11.7 9.5 11.7V12.2ZM6.5 12.2V11.7C6.224 11.7 6 11.924 6 12.2H6.5ZM8 2V1.5C5.404 1.5 3.3 3.604 3.3 6.2H3.8H4.3C4.3 4.157 5.957 2.5 8 2.5V2ZM3.8 6.2H3.3V12.2H3.8H4.3V6.2H3.8ZM3.8 12.2V12.7H12.2V12.2V11.7H3.8V12.2ZM12.2 12.2H12.7V6.2H12.2H11.7V12.2H12.2ZM12.2 6.2H12.7C12.7 3.604 10.596 1.5 8 1.5V2V2.5C10.043 2.5 11.7 4.157 11.7 6.2H12.2ZM2 12.2V12.7H14V12.2V11.7H2V12.2ZM8 14V14.5C9.105 14.5 10 13.605 10 12.5H9.5H9C9 13.052 8.552 13.5 8 13.5V14ZM9.5 12.5H10V12.2H9.5H9V12.5H9.5ZM9.5 12.2V11.7H6.5V12.2V12.7H9.5V12.2ZM6.5 12.2H6V12.5H6.5H7V12.2H6.5ZM6.5 12.5H6C6 13.605 6.895 14.5 8 14.5V14V13.5C7.448 13.5 7 13.052 7 12.5H6.5Z" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    key: 'api',
    label: 'API',
    tooltip: '配置API',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={ICON_STYLE}>
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="#FFFFFF" />
        <path d="M4.98 6.364L4.452 8.248C4.448 8.26 4.45 8.272 4.458 8.284C4.466 8.296 4.476 8.302 4.488 8.302H5.484C5.496 8.302 5.506 8.296 5.514 8.284C5.522 8.272 5.524 8.26 5.52 8.248L4.992 6.364C4.992 6.36 4.99 6.358 4.986 6.358C4.982 6.358 4.98 6.36 4.98 6.364ZM3.426 10C3.342 10 3.276 9.966 3.228 9.898C3.18 9.83 3.17 9.756 3.198 9.676L4.44 5.944C4.476 5.848 4.534 5.77 4.614 5.71C4.698 5.65 4.79 5.62 4.89 5.62H5.106C5.21 5.62 5.302 5.65 5.382 5.71C5.466 5.77 5.524 5.848 5.556 5.944L6.798 9.676C6.826 9.756 6.816 9.83 6.768 9.898C6.72 9.966 6.654 10 6.57 10H6.354C6.258 10 6.168 9.97 6.084 9.91C6.004 9.846 5.95 9.766 5.922 9.67L5.73 8.992C5.726 8.96 5.704 8.944 5.664 8.944H4.308C4.272 8.944 4.25 8.96 4.242 8.992L4.05 9.67C4.026 9.766 3.972 9.846 3.888 9.91C3.808 9.97 3.718 10 3.618 10H3.426ZM8.222 6.304V7.75C8.222 7.778 8.238 7.796 8.27 7.804C8.422 7.824 8.57 7.834 8.714 7.834C9.038 7.834 9.284 7.764 9.452 7.624C9.624 7.48 9.71 7.276 9.71 7.012C9.71 6.48 9.378 6.214 8.714 6.214C8.57 6.214 8.422 6.224 8.27 6.244C8.238 6.252 8.222 6.272 8.222 6.304ZM7.73 10C7.638 10 7.558 9.966 7.49 9.898C7.426 9.83 7.394 9.75 7.394 9.658V5.992C7.394 5.896 7.426 5.81 7.49 5.734C7.554 5.658 7.634 5.616 7.73 5.608C8.07 5.576 8.398 5.56 8.714 5.56C9.314 5.56 9.764 5.68 10.064 5.92C10.364 6.156 10.514 6.5 10.514 6.952C10.514 7.452 10.368 7.83 10.076 8.086C9.788 8.342 9.36 8.47 8.792 8.47C8.66 8.47 8.486 8.462 8.27 8.446C8.238 8.446 8.222 8.462 8.222 8.494V9.658C8.222 9.75 8.188 9.83 8.12 9.898C8.052 9.966 7.972 10 7.88 10H7.73ZM11.623 10C11.531 10 11.451 9.966 11.383 9.898C11.316 9.83 11.281 9.75 11.281 9.658V5.962C11.281 5.87 11.316 5.79 11.383 5.722C11.451 5.654 11.531 5.62 11.623 5.62H11.864C11.956 5.62 12.036 5.654 12.104 5.722C12.171 5.79 12.206 5.87 12.206 5.962V9.658C12.206 9.75 12.171 9.83 12.104 9.898C12.036 9.966 11.956 10 11.864 10H11.623Z" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    key: 'menu',
    label: '菜单',
    tooltip: '更多选项',
    popup: (
      <div className="flex flex-col items-start w-max rounded-lg absolute left-10 bottom-0 [box-shadow:#00000066_0px_4px_16px] bg-[#161616] border border-solid border-[#FFFFFF0D] p-1" style={{ zIndex: 50 }}>
        {['操作手册', '更新日志', '用户协议', '隐私政策'].map((label) => (
          <MenuPopupItem key={label} label={label} />
        ))}
      </div>
    ),
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={ICON_STYLE}>
        <path d="M2.65 3.983H13.317" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.65 7.983H13.317" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.65 11.983H13.317" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const BG_URL = bgImage;

const CMB_ICON_DEFAULT = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: '0' }}>
    <path d="M3.33329 14.6667H12.6666C13.0348 14.6667 13.3333 14.3682 13.3333 14V4.66671H9.99996V1.33337H3.33329C2.9651 1.33337 2.66663 1.63185 2.66663 2.00004V14C2.66663 14.3682 2.9651 14.6667 3.33329 14.6667Z" fill="#2DC3E1" stroke="#2DC3E1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 1.33337L13.3333 4.66671" stroke="#2DC3E1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.67439 7.93831C8.72969 7.77042 8.75735 7.68696 8.80278 7.67166C8.82264 7.66496 8.84415 7.66496 8.86401 7.67166C8.90944 7.68696 8.9371 7.77042 8.9924 7.93831C9.22252 8.63952 9.33807 8.99012 9.55534 9.26763C9.65558 9.39553 9.77113 9.51108 9.89903 9.61132C10.1765 9.8286 10.5271 9.94414 11.2284 10.1743C11.3962 10.2296 11.4797 10.2572 11.495 10.3026C11.5017 10.3225 11.5017 10.344 11.495 10.3639C11.4797 10.4093 11.3962 10.437 11.2284 10.4923C10.5271 10.7224 10.1765 10.8379 9.89903 11.0552C9.77064 11.1554 9.65559 11.271 9.55534 11.3989C9.33806 11.6769 9.22252 12.0275 8.9924 12.7282C8.9371 12.8961 8.90945 12.9796 8.86401 12.9949C8.84415 13.0015 8.82265 13.0015 8.80278 12.9949C8.75735 12.9796 8.72969 12.8961 8.67439 12.7282C8.44428 12.027 8.32872 11.6764 8.11146 11.3989C8.01117 11.271 7.89576 11.1558 7.76776 11.0557C7.48975 10.8379 7.13915 10.7224 6.43795 10.4918C6.27055 10.437 6.1871 10.4093 6.1713 10.3634C6.16475 10.3437 6.16475 10.3224 6.1713 10.3026C6.1871 10.2572 6.27055 10.2296 6.43795 10.1743C7.13915 9.94414 7.48976 9.82859 7.76776 9.61132C7.89566 9.51109 8.01072 9.39553 8.11095 9.26763C8.32823 8.98962 8.44428 8.63952 8.67439 7.93831ZM5.17233 6.51418C5.20887 6.40258 5.22714 6.34678 5.25775 6.33641C5.2709 6.33204 5.2851 6.33204 5.29824 6.33641C5.32886 6.34678 5.34713 6.40258 5.38367 6.51418C5.53724 6.98181 5.61427 7.21538 5.75896 7.40055C5.82612 7.48598 5.90315 7.56302 5.98859 7.62968C6.17377 7.77486 6.40733 7.85189 6.87447 8.00497C6.98607 8.04201 7.04236 8.06028 7.05224 8.0909C7.05661 8.10404 7.05661 8.11824 7.05224 8.13139C7.04236 8.162 6.98656 8.18027 6.87447 8.21681C6.40733 8.37088 6.17326 8.44742 5.98859 8.59211C5.90322 8.65911 5.82628 8.73621 5.75946 8.82173C5.61428 9.00691 5.53725 9.24047 5.38417 9.7081C5.34713 9.8197 5.32886 9.8755 5.29824 9.88587C5.2851 9.89024 5.2709 9.89024 5.25775 9.88587C5.22714 9.8755 5.20887 9.8197 5.17233 9.7081C5.01826 9.24047 4.94172 9.0069 4.79654 8.82173C4.72969 8.73639 4.65276 8.65945 4.56742 8.59261C4.38224 8.44743 4.14868 8.3704 3.68104 8.21731C3.56944 8.18027 3.51365 8.16201 3.50328 8.13139C3.49891 8.11824 3.49891 8.10404 3.50328 8.0909C3.51365 8.06028 3.56944 8.04201 3.68104 8.00547C4.14868 7.8514 4.38225 7.77487 4.56742 7.62968C4.65284 7.56302 4.72988 7.48599 4.79654 7.40056C4.94172 7.21538 5.01875 6.98182 5.17184 6.51419L5.17233 6.51418ZM7.65616 5.11325C7.67937 5.04363 7.69073 5.00856 7.70949 5.00214C7.71781 4.99929 7.72685 4.99929 7.73517 5.00214C7.75393 5.00856 7.76578 5.04363 7.7885 5.11325C7.88479 5.40558 7.93269 5.55126 8.02355 5.6673C8.06503 5.72063 8.11292 5.76853 8.16675 5.81051C8.2823 5.90087 8.42847 5.94877 8.72031 6.04506C8.78993 6.06827 8.825 6.07963 8.83142 6.09839C8.83424 6.10672 8.83424 6.11574 8.83142 6.12407C8.825 6.14283 8.78993 6.15419 8.72031 6.1774C8.42847 6.27369 8.2823 6.32159 8.16626 6.41196C8.11293 6.45375 8.06485 6.50183 8.02305 6.55516C7.93269 6.67121 7.88479 6.81688 7.7885 7.10921C7.76578 7.17883 7.75393 7.2139 7.73517 7.22032C7.72685 7.22318 7.71781 7.22318 7.70949 7.22032C7.69073 7.2139 7.67937 7.17883 7.65616 7.10921C7.56037 6.81688 7.51197 6.67121 7.42161 6.55516C7.37982 6.50182 7.33174 6.45374 7.2784 6.41196C7.16285 6.32159 7.01668 6.27369 6.72435 6.1774C6.65473 6.15419 6.61966 6.14283 6.61324 6.12407C6.61042 6.11574 6.61042 6.10672 6.61324 6.09839C6.61966 6.07963 6.65473 6.06827 6.72435 6.04506C7.01668 5.94927 7.16285 5.90087 7.2784 5.81051C7.33174 5.76873 7.37982 5.72064 7.42161 5.6673C7.51197 5.55126 7.55987 5.40558 7.65616 5.11325Z" fill="white"/>
  </svg>
);

const CMB_ICON_HOVER = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: '0' }}>
    <defs>
      <linearGradient id="cmb-h0" x1="8" y1="0.833" x2="8" y2="15.166" gradientUnits="userSpaceOnUse"><stop stopColor="#7AE5B9"/><stop offset="1" stopColor="#2DC3E1"/></linearGradient>
      <linearGradient id="cmb-h1" x1="8" y1="0.833" x2="8" y2="15.166" gradientUnits="userSpaceOnUse"><stop stopColor="#7AE5B9"/><stop offset="1" stopColor="#2DC3E1"/></linearGradient>
      <linearGradient id="cmb-h2" x1="8" y1="1.333" x2="8" y2="14.667" gradientUnits="userSpaceOnUse"><stop stopColor="#7AE5B9"/><stop offset="1" stopColor="#2DC3E1"/></linearGradient>
      <linearGradient id="cmb-h3" x1="8" y1="0.833" x2="8" y2="15.166" gradientUnits="userSpaceOnUse"><stop stopColor="#7AE5B9"/><stop offset="1" stopColor="#2DC3E1"/></linearGradient>
      <linearGradient id="cmb-h4" x1="8" y1="1.333" x2="8" y2="14.667" gradientUnits="userSpaceOnUse"><stop stopColor="#7AE5B9"/><stop offset="1" stopColor="#2DC3E1"/></linearGradient>
    </defs>
    <path d="M9.64644 0.979858C9.84171 0.784596 10.1582 0.784596 10.3535 0.979858L13.6865 4.31287C13.8817 4.50813 13.8817 4.82464 13.6865 5.0199C13.4912 5.21516 13.1747 5.21516 12.9795 5.0199L9.64644 1.68689C9.45118 1.49163 9.45118 1.17512 9.64644 0.979858Z" fill="url(#cmb-h0)"/>
    <path d="M3.33329 14.6667H12.6666C13.0348 14.6667 13.3333 14.3682 13.3333 14V4.66671H9.99996V1.33337H3.33329C2.9651 1.33337 2.66663 1.63185 2.66663 2.00004V14C2.66663 14.3682 2.9651 14.6667 3.33329 14.6667Z" fill="url(#cmb-h1)"/>
    <path d="M3.33329 14.6667H12.6666C13.0348 14.6667 13.3333 14.3682 13.3333 14V4.66671H9.99996V1.33337H3.33329C2.9651 1.33337 2.66663 1.63185 2.66663 2.00004V14C2.66663 14.3682 2.9651 14.6667 3.33329 14.6667Z" fill="url(#cmb-h2)"/>
    <path d="M2.16663 14.0004V2.00037C2.16663 1.35603 2.68929 0.833374 3.33362 0.833374H9.99963C10.2758 0.833374 10.4996 1.05723 10.4996 1.33337V4.16638H13.3336C13.6095 4.16656 13.8334 4.3905 13.8336 4.66638V14.0004C13.8334 14.6446 13.3109 15.1664 12.6666 15.1664H3.33362C2.6894 15.1664 2.1668 14.6446 2.16663 14.0004ZM3.16663 14.0004C3.1668 14.0923 3.24167 14.1664 3.33362 14.1664H12.6666C12.7586 14.1664 12.8334 14.0923 12.8336 14.0004V5.16638H9.99963C9.72364 5.16621 9.49963 4.94242 9.49963 4.66638V1.83337H3.33362C3.24157 1.83337 3.16663 1.90832 3.16663 2.00037V14.0004Z" fill="url(#cmb-h3)"/>
    <path d="M2.16663 14.0004V2.00037C2.16663 1.35603 2.68929 0.833374 3.33362 0.833374H9.99963C10.2758 0.833374 10.4996 1.05723 10.4996 1.33337V4.16638H13.3336C13.6095 4.16656 13.8334 4.3905 13.8336 4.66638V14.0004C13.8334 14.6446 13.3109 15.1664 12.6666 15.1664H3.33362C2.6894 15.1664 2.1668 14.6446 2.16663 14.0004ZM3.16663 14.0004C3.1668 14.0923 3.24167 14.1664 3.33362 14.1664H12.6666C12.7586 14.1664 12.8334 14.0923 12.8336 14.0004V5.16638H9.99963C9.72364 5.16621 9.49963 4.94242 9.49963 4.66638V1.83337H3.33362C3.24157 1.83337 3.16663 1.90832 3.16663 2.00037V14.0004Z" fill="url(#cmb-h4)"/>
    <path d="M8.67439 7.93831C8.72969 7.77042 8.75735 7.68696 8.80278 7.67166C8.82264 7.66496 8.84415 7.66496 8.86401 7.67166C8.90944 7.68696 8.9371 7.77042 8.9924 7.93831C9.22252 8.63952 9.33807 8.99012 9.55534 9.26763C9.65558 9.39553 9.77113 9.51108 9.89903 9.61132C10.1765 9.8286 10.5271 9.94414 11.2284 10.1743C11.3962 10.2296 11.4797 10.2572 11.495 10.3026C11.5017 10.3225 11.5017 10.344 11.495 10.3639C11.4797 10.4093 11.3962 10.437 11.2284 10.4923C10.5271 10.7224 10.1765 10.8379 9.89903 11.0552C9.77064 11.1554 9.65559 11.271 9.55534 11.3989C9.33806 11.6769 9.22252 12.0275 8.9924 12.7282C8.9371 12.8961 8.90945 12.9796 8.86401 12.9949C8.84415 13.0015 8.82265 13.0015 8.80278 12.9949C8.75735 12.9796 8.72969 12.8961 8.67439 12.7282C8.44428 12.027 8.32872 11.6764 8.11146 11.3989C8.01117 11.271 7.89576 11.1558 7.76776 11.0557C7.48975 10.8379 7.13915 10.7224 6.43795 10.4918C6.27055 10.437 6.1871 10.4093 6.1713 10.3634C6.16475 10.3437 6.16475 10.3224 6.1713 10.3026C6.1871 10.2572 6.27055 10.2296 6.43795 10.1743C7.13915 9.94414 7.48976 9.82859 7.76776 9.61132C7.89566 9.51109 8.01072 9.39553 8.11095 9.26763C8.32823 8.98962 8.44428 8.63952 8.67439 7.93831ZM5.17233 6.51418C5.20887 6.40258 5.22714 6.34678 5.25775 6.33641C5.2709 6.33204 5.2851 6.33204 5.29824 6.33641C5.32886 6.34678 5.34713 6.40258 5.38367 6.51418C5.53724 6.98181 5.61427 7.21538 5.75896 7.40055C5.82612 7.48598 5.90315 7.56302 5.98859 7.62968C6.17377 7.77486 6.40733 7.85189 6.87447 8.00497C6.98607 8.04201 7.04236 8.06028 7.05224 8.0909C7.05661 8.10404 7.05661 8.11824 7.05224 8.13139C7.04236 8.162 6.98656 8.18027 6.87447 8.21681C6.40733 8.37088 6.17326 8.44742 5.98859 8.59211C5.90322 8.65911 5.82628 8.73621 5.75946 8.82173C5.61428 9.00691 5.53725 9.24047 5.38417 9.7081C5.34713 9.8197 5.32886 9.8755 5.29824 9.88587C5.2851 9.89024 5.2709 9.89024 5.25775 9.88587C5.22714 9.8755 5.20887 9.8197 5.17233 9.7081C5.01826 9.24047 4.94172 9.0069 4.79654 8.82173C4.72969 8.73639 4.65276 8.65945 4.56742 8.59261C4.38224 8.44743 4.14868 8.3704 3.68104 8.21731C3.56944 8.18027 3.51365 8.16201 3.50328 8.13139C3.49891 8.11824 3.49891 8.10404 3.50328 8.0909C3.51365 8.06028 3.56944 8.04201 3.68104 8.00547C4.14868 7.8514 4.38225 7.77487 4.56742 7.62968C4.65284 7.56302 4.72988 7.48599 4.79654 7.40056C4.94172 7.21538 5.01875 6.98182 5.17184 6.51419L5.17233 6.51418ZM7.65616 5.11325C7.67937 5.04363 7.69073 5.00856 7.70949 5.00214C7.71781 4.99929 7.72685 4.99929 7.73517 5.00214C7.75393 5.00856 7.76578 5.04363 7.7885 5.11325C7.88479 5.40558 7.93269 5.55126 8.02355 5.6673C8.06503 5.72063 8.11292 5.76853 8.16675 5.81051C8.2823 5.90087 8.42847 5.94877 8.72031 6.04506C8.78993 6.06827 8.825 6.07963 8.83142 6.09839C8.83424 6.10672 8.83424 6.11574 8.83142 6.12407C8.825 6.14283 8.78993 6.15419 8.72031 6.1774C8.42847 6.27369 8.2823 6.32159 8.16626 6.41196C8.11293 6.45375 8.06485 6.50183 8.02305 6.55516C7.93269 6.67121 7.88479 6.81688 7.7885 7.10921C7.76578 7.17883 7.75393 7.2139 7.73517 7.22032C7.72685 7.22318 7.71781 7.22318 7.70949 7.22032C7.69073 7.2139 7.67937 7.17883 7.65616 7.10921C7.56037 6.81688 7.51197 6.67121 7.42161 6.55516C7.37982 6.50182 7.33174 6.45374 7.2784 6.41196C7.16285 6.32159 7.01668 6.27369 6.72435 6.1774C6.65473 6.15419 6.61966 6.14283 6.61324 6.12407C6.61042 6.11574 6.61042 6.10672 6.61324 6.09839C6.61966 6.07963 6.65473 6.06827 6.72435 6.04506C7.01668 5.94927 7.16285 5.90087 7.2784 5.81051C7.33174 5.76873 7.37982 5.72064 7.42161 5.6673C7.51197 5.55126 7.55987 5.40558 7.65616 5.11325Z" fill="white"/>
  </svg>
);

function CreationManualButton() {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const showDefault = !hovered || pressed;

  return (
    <button
      type="button"
      className="flex items-center rounded-[7px] gap-1 h-9 py-0 bg-transparent border-0 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {showDefault ? CMB_ICON_DEFAULT : CMB_ICON_HOVER}
      {showDefault ? (
        <div className="inline-block w-max shrink-0 font-['AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] text-[#2DC3E1] text-sm/4.5">
          创作手册
        </div>
      ) : (
        <div className="inline-block w-max shrink-0 font-['AlibabaPuHuiTi_2_65_Medium','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] font-medium text-transparent bg-clip-text text-sm/4.5" style={{ backgroundImage: 'linear-gradient(in oklab 180deg, oklab(84.6% -0.114 0.031) 0%, oklab(75.5% -0.102 -0.072) 100%)' }}>
          创作手册
        </div>
      )}
    </button>
  );
}

function LoginButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      className="flex flex-col h-[36px] shrink-0 rounded-full p-px relative overflow-hidden cursor-pointer border-0 bg-transparent"
      style={{
        boxShadow: pressed ? 'none' : '#00000066 3px 3px 8px',
        transition: 'box-shadow 120ms ease',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {/* outer gradient layers */}
      <span className="absolute inset-0 rounded-full" style={{ backgroundImage: 'linear-gradient(in oklab 148.76deg, oklab(100% 0 0 / 70%) 3.64%, oklab(56.7% 0 0 / 30%) 42.81%)', opacity: pressed ? 0 : hovered ? 0 : 1, transition: 'opacity 150ms ease' }} />
      <span className="absolute inset-0 rounded-full" style={{ backgroundImage: 'linear-gradient(in oklab 183.38deg, oklab(100% 0 0 / 90%) -10.72%, oklab(56.7% 0 0 / 30%) 41.97%)', opacity: hovered && !pressed ? 1 : 0, transition: 'opacity 150ms ease' }} />
      <span className="absolute inset-0 rounded-full" style={{ backgroundImage: 'linear-gradient(in oklab 228.51deg, oklab(100% 0 0 / 40%) 11.17%, oklab(56.7% 0 0 / 30%) 45.43%)', opacity: pressed ? 1 : 0, transition: 'opacity 150ms ease' }} />

      {/* inner fill */}
      <div className="flex items-center grow shrink basis-[0%] rounded-full px-20 gap-4 self-stretch relative overflow-hidden">
        <span className="absolute inset-0 rounded-full" style={{ backgroundImage: 'linear-gradient(in oklab 180deg, oklab(23.1% 0 0) 0%, oklab(0% 0 0) 100%)', opacity: pressed ? 0 : hovered ? 0 : 1, transition: 'opacity 150ms ease' }} />
        <span className="absolute inset-0 rounded-full" style={{ backgroundImage: 'linear-gradient(in oklab 183.84deg, oklab(38% 0 0) 5.46%, oklab(0% 0 0) 108.34%)', opacity: hovered && !pressed ? 1 : 0, transition: 'opacity 150ms ease' }} />
        <span className="absolute inset-0 rounded-full" style={{ backgroundImage: 'linear-gradient(in oklab 183.84deg, oklab(9.1% 0 0) 5.46%, oklab(0% 0 0) 108.34%)', opacity: pressed ? 1 : 0, transition: 'opacity 150ms ease' }} />
        <span className="inline-block w-max shrink-0 font-['AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] text-white text-sm/4.5 relative">登录</span>
      </div>
    </button>
  );
}

const SECONDARY_TEXT = 'rgba(255, 255, 255, 0.60)';

function StartCreationButton() {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const scale = pressed ? 1 : hovered ? 1.035 : 1;
  const contentColor = pressed ? SECONDARY_TEXT : '#FFFFFF';

  return (
    <div
      className="left-[50%] bottom-[80px] absolute w-[200px] h-[52px]"
      style={{
        translate: '-50%',
        transform: `scale(${scale})`,
        transformOrigin: '50% 50%',
        transition: 'transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      role="button"
      tabIndex={0}
    >
      {/* outer shader bloom — subtle 8px spill onto bg image on hover */}
      <div
        aria-hidden="true"
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: '-8px',
          opacity: hovered && !pressed ? 1 : 0,
          transition: 'opacity 220ms ease',
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(55% 70% at 18% 50%, rgba(0, 197, 239, 0.45) 0%, rgba(0, 197, 239, 0) 75%),' +
              'radial-gradient(55% 70% at 82% 50%, rgba(208, 78, 232, 0.4) 0%, rgba(208, 78, 232, 0) 75%),' +
              'radial-gradient(50% 60% at 50% 50%, rgba(255, 200, 22, 0.32) 0%, rgba(255, 200, 22, 0) 75%)',
            filter: 'blur(8px)',
          }}
        />
      </div>

      <PulsingBorder
        speed={1} roundness={1} thickness={1} softness={1}
        intensity={0.2} bloom={0.28} spots={4} spotSize={0.49}
        pulse={0.25} smoke={0.55} smokeSize={0.6}
        scale={1} rotation={0} aspectRatio="auto"
        colors={['#00C5EF', '#D04EE8', '#FFC816']}
        colorBack="#00000000"
        className="rounded-full absolute inset-0 bg-black"
      />
      <div
        className="flex absolute items-center gap-12 left-[50%] top-[50%] p-0"
        style={{
          translate: '-50% -50%',
          color: contentColor,
          transition: 'color 140ms ease',
        }}
      >
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" style={{ width: '20px', height: '20px', flexShrink: '0' }}>
          <path d="M643.346 393.248c6.186-18.779 9.279-28.114 14.361-29.826a10.715 10.715 0 0 1 6.849 0c5.081 1.712 8.175 11.047 14.361 29.826 25.739 78.432 38.664 117.648 62.966 148.689 11.212 14.306 24.137 27.23 38.443 38.443 31.041 24.303 70.257 37.227 148.689 62.966 18.779 6.186 28.114 9.279 29.826 14.361a10.771 10.771 0 0 1 0 6.849c-1.712 5.081-11.047 8.175-29.826 14.361-78.432 25.739-117.648 38.664-148.689 62.966-14.361 11.212-27.23 24.137-38.443 38.443-24.303 31.097-37.227 70.312-62.966 148.689-6.186 18.779-9.279 28.114-14.361 29.826a10.771 10.771 0 0 1-6.849 0c-5.081-1.712-8.175-11.047-14.361-29.826-25.739-78.432-38.664-117.648-62.966-148.689a225.077 225.077 0 0 0-38.443-38.387c-31.097-24.358-70.312-37.283-148.744-63.077-18.724-6.131-28.059-9.224-29.826-14.361a10.771 10.771 0 0 1 0-6.794c1.767-5.081 11.102-8.175 29.826-14.361 78.432-25.739 117.648-38.664 148.744-62.966 14.306-11.212 27.175-24.137 38.387-38.443 24.303-31.097 37.283-70.257 63.022-148.689zM251.629 233.954c4.087-12.483 6.131-18.724 9.555-19.884a7.18 7.18 0 0 1 4.529 0c3.424 1.16 5.468 7.401 9.555 19.884 17.178 52.306 25.794 78.432 41.978 99.144 7.512 9.555 16.128 18.172 25.684 25.628 20.713 16.239 46.838 24.855 99.089 41.978 12.483 4.143 18.779 6.186 19.884 9.611a7.18 7.18 0 0 1 0 4.529c-1.105 3.424-7.346 5.468-19.884 9.555-52.251 17.233-78.432 25.794-99.089 41.978a150.235 150.235 0 0 0-25.628 25.684c-16.239 20.713-24.855 46.838-41.978 99.144-4.143 12.483-6.186 18.724-9.611 19.884a7.18 7.18 0 0 1-4.529 0c-3.424-1.16-5.468-7.401-9.555-19.884-17.233-52.306-25.794-78.432-42.033-99.144a150.235 150.235 0 0 0-25.628-25.628c-20.713-16.239-46.838-24.855-99.144-41.978-12.483-4.143-18.724-6.186-19.884-9.611a7.18 7.18 0 0 1 0-4.529c1.16-3.424 7.401-5.468 19.884-9.555 52.306-17.233 78.432-25.794 99.144-42.033 9.555-7.457 18.172-16.073 25.628-25.628 16.239-20.713 24.855-46.838 41.978-99.144zM529.454 77.256c2.596-7.788 3.866-11.71 5.965-12.428a4.419 4.419 0 0 1 2.872 0c2.099 0.718 3.424 4.64 5.965 12.428 10.771 32.698 16.128 48.992 26.291 61.972 4.64 5.965 9.997 11.323 16.018 16.018 12.925 10.108 29.274 15.465 61.917 26.236 7.788 2.596 11.71 3.866 12.428 5.965a4.474 4.474 0 0 1 0 2.872c-0.718 2.099-4.64 3.369-12.428 5.965-32.643 10.771-48.992 16.128-61.972 26.236a94.063 94.063 0 0 0-16.018 16.018c-10.108 12.98-15.465 29.274-26.236 61.972-2.541 7.788-3.866 11.71-5.965 12.428a4.419 4.419 0 0 1-2.872 0c-2.099-0.718-3.369-4.64-5.965-12.428-10.715-32.698-16.128-48.992-26.236-61.972a93.897 93.897 0 0 0-16.018-16.018c-12.925-10.108-29.274-15.465-61.972-26.236-7.788-2.596-11.71-3.866-12.428-5.965a4.474 4.474 0 0 1 0-2.872c0.718-2.099 4.64-3.369 12.428-5.965 32.698-10.715 49.047-16.128 61.972-26.236a93.897 93.897 0 0 0 16.018-16.018c10.108-12.98 15.465-29.274 26.236-61.972z" fill="currentColor" />
        </svg>
        <span className="w-fit shrink-0 font-['AlibabaPuHuiTi_2_65_Medium','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] font-medium text-base/5" style={{ color: 'currentColor' }}>开始创作</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeKey, setActiveKey] = useState('home');
  const [bottomActiveKey, setBottomActiveKey] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [apiConfigOpen, setApiConfigOpen] = useState(false);

  const handleBottomNavChange = (key) => {
    if (key === 'api') {
      setBottomActiveKey(null);
      setApiConfigOpen(true);
      return;
    }

    setBottomActiveKey((prev) => (prev === key ? null : key));
  };

  return (
    <div className="[font-synthesis:none] overflow-clip w-screen h-screen relative bg-neutral-400 antialiased">
      <div className="absolute bg-cover bg-center inset-0" style={{ backgroundImage: `url(${BG_URL})` }} />
      <div
        className="flex flex-col items-start absolute inset-0"
        style={{ backgroundImage: 'linear-gradient(in oklab 180deg, oklab(0% 0 0 / 0%) 81.58%, oklab(0% 0 0) 100%), linear-gradient(in oklab 90deg, oklab(0% 0 0 / 60%) 0%, oklab(0% 0 0 / 0%) 9.99%)' }}
      >
        {/* headbar */}
        <div className="flex items-center px-32 py-12 justify-between gap-[37px] self-stretch">
          <svg width="80" height="24.15" viewBox="0 0 947 286" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-label="miioo">
            <path d="M335 86H389V286H335V86Z" fill="white"/>
            <path d="M425 86H479V286H425V86Z" fill="white"/>
            <path d="M180 251C180 270.33 164.33 286 145 286C125.67 286 110 270.33 110 251C110 231.67 125.67 216 145 216C164.33 216 180 231.67 180 251Z" fill="#00D4FF"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M0 286L0.00488281 39H0.667969H5.58887C13.9136 68.0675 31.0835 93.3978 54 111.894V286H0Z" fill="white"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M290 286H236V111.894C258.917 93.3978 276.086 68.0674 284.41 39H289.332H289.995L290 286Z" fill="white"/>
            <path d="M655 186C655 163.909 637.091 146 615 146C592.909 146 575 163.909 575 186C575 208.091 592.909 226 615 226V286C559.772 286 515 241.228 515 186C515 130.772 559.772 86 615 86C670.228 86 715 130.772 715 186C715 241.228 670.228 286 615 286V226C637.091 226 655 208.091 655 186Z" fill="white"/>
            <path d="M887 186C887 163.909 869.091 146 847 146C824.909 146 807 163.909 807 186C807 208.091 824.909 226 847 226V286C791.772 286 747 241.228 747 186C747 130.772 791.772 86 847 86C902.228 86 947 130.772 947 186C947 241.228 902.228 286 847 286V226C869.091 226 887 208.091 887 186Z" fill="white"/>
            <path opacity="0.4" d="M423 0C441.225 0 456 14.7746 456 33C456 51.2254 441.225 66 423 66C417.194 66 411.74 64.498 407 61.8652C417.138 56.2337 424 45.4193 424 33C424 20.5805 417.138 9.76525 407 4.13379C411.739 1.50119 417.194 0 423 0Z" fill="#00D4FF"/>
            <path opacity="0.2" d="M455 0C473.225 0 488 14.7746 488 33C488 51.2254 473.225 66 455 66C449.194 66 443.74 64.498 439 61.8652C449.138 56.2337 456 45.4193 456 33C456 20.5805 449.138 9.76525 439 4.13379C443.739 1.50119 449.194 0 455 0ZM423.951 34.7764C423.938 35.0196 423.923 35.2621 423.905 35.5039C423.923 35.2621 423.938 35.0196 423.951 34.7764Z" fill="#00D4FF"/>
            <path opacity="0.6" d="M424 33C424 51.2254 409.225 66 391 66C372.775 66 358 51.2254 358 33C358 14.7746 372.775 0 391 0C409.225 0 424 14.7746 424 33Z" fill="#00D4FF"/>
            <path d="M392 33C392 51.2254 377.225 66 359 66C340.775 66 326 51.2254 326 33C326 14.7746 340.775 0 359 0C377.225 0 392 14.7746 392 33Z" fill="#00D4FF"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M145 144C211.206 144 267.047 99.6278 284.41 39H289.332C289.773 43.6071 290 48.2771 290 53C290 133.081 225.081 198 145 198C64.9189 198 0 133.081 0 53C0 48.2772 0.226074 43.6072 0.667969 39H5.58887C22.9517 99.6278 78.7935 144 145 144Z" fill="white"/>
          </svg>
          <div className="flex items-center gap-16 p-0">
            <CreationManualButton />
            <LoginButton onClick={() => setLoginOpen(true)} />
          </div>
        </div>

        {/* primary navigation */}
        <div className="flex flex-col items-start gap-0 flex-1 p-0">
          <div className="flex flex-col items-start px-32 py-24 flex-1">
            <PrimaryNav items={NAV_ITEMS} activeKey={activeKey} onChange={setActiveKey} variant="vertical" />
          </div>

          {/* bottom icon group */}
          <div className="px-32 py-24 self-stretch">
            <PrimaryNav
              items={BOTTOM_NAV_ITEMS}
              activeKey={bottomActiveKey}
              onChange={handleBottomNavChange}
              variant="compact"
            />
          </div>
        </div>
      </div>

      {/* start button */}
      <StartCreationButton />

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <ApiConfigModal open={apiConfigOpen} onClose={() => setApiConfigOpen(false)} />
    </div>
  );
}
