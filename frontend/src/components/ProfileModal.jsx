import { useState } from 'react';

const FONT_MEDIUM = "'AlibabaPuHuiTi_2_65_Medium','Alibaba_PuHuiTi_2.0',system-ui,sans-serif";
const FONT_REGULAR = "'AlibabaPuHuiTi 2_55 Regular','Alibaba PuHuiTi 2.0',system-ui,sans-serif";

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4L4 12M4 4L12 12" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Avatar({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 'calc(infinity * 1px)', flexShrink: 0 }}>
      <rect width="28" height="28" rx="14" fill="#2DC3E1" />
      <rect x="0.5" y="0.5" width="27" height="27" rx="13.5" stroke="#FFFFFF80" />
      <path d="M16.028 20.344C16.028 21.48 15.12 22.4 14 22.4C12.88 22.4 11.973 21.48 11.973 20.344C11.973 19.209 12.88 18.288 14 18.288C15.12 18.288 16.028 19.209 16.028 20.344Z" fill="#FFFFFF" />
      <path d="M5.6 5.6C5.612 7.379 6.161 9.028 7.092 10.389C7.96 11.658 8.728 13.064 8.728 14.601V20.836C8.728 21.7 8.028 22.4 7.164 22.4C6.3 22.4 5.6 21.7 5.6 20.836V5.6Z" fill="#191919" />
      <path d="M22.4 20.836C22.4 21.7 21.699 22.4 20.836 22.4C19.972 22.4 19.271 21.7 19.271 20.836V14.601C19.271 13.064 20.04 11.658 20.907 10.389C21.838 9.028 22.387 7.379 22.399 5.6V20.836Z" fill="#191919" />
      <path d="M21.818 8.66C21.937 8.354 22.399 8.385 22.399 8.713C22.399 13.418 18.639 17.231 13.999 17.231C9.36 17.231 5.6 13.418 5.6 8.713C5.6 8.385 6.062 8.354 6.18 8.66C7.408 11.821 10.446 14.059 13.999 14.059C17.553 14.059 20.591 11.821 21.818 8.66Z" fill="#191919" />
    </svg>
  );
}

function ProfileField({ label, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="flex items-center w-full rounded-[8px]"
      style={{ padding: '10px 16px', gap: '0' }}
    >
      <span
        className="flex-shrink-0"
        style={{
          fontFamily: FONT_REGULAR,
          fontSize: '14px',
          lineHeight: '20px',
          color: 'rgba(255,255,255,0.4)',
          width: '80px',
          textAlign: 'left',
        }}
      >
        {label}
      </span>
      <div
        className="flex-1 flex items-center rounded-[6px]"
        style={{
          border: `1px solid ${focused ? 'rgba(45,195,225,0.6)' : 'rgba(255,255,255,0.1)'}`,
          background: focused ? 'rgba(45,195,225,0.04)' : 'rgba(255,255,255,0.04)',
          padding: '5px 10px',
          transition: 'border-color 120ms, background 120ms',
          boxShadow: focused ? '0 0 0 3px rgba(45,195,225,0.08)' : 'none',
        }}
      >
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent border-0 outline-none placeholder:text-[rgba(255,255,255,0.2)]"
          style={{
            fontFamily: FONT_REGULAR,
            fontSize: '14px',
            lineHeight: '20px',
            color: 'rgba(255,255,255,0.85)',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </div>
  );
}

function DangerRow({ label, value, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      className="flex items-center w-full border-0 cursor-pointer rounded-[8px]"
      style={{
        padding: '12px 16px',
        background: hovered ? 'rgba(247,95,95,0.06)' : 'transparent',
        transition: 'background 120ms',
        gap: '0',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <span
        className="flex-shrink-0"
        style={{
          fontFamily: FONT_REGULAR,
          fontSize: '14px',
          lineHeight: '20px',
          color: 'rgba(247,95,95,0.7)',
          width: '80px',
          textAlign: 'left',
        }}
      >
        {label}
      </span>
      <span
        className="flex-1 text-left truncate"
        style={{
          fontFamily: FONT_REGULAR,
          fontSize: '14px',
          lineHeight: '20px',
          color: 'rgba(247,95,95,1)',
        }}
      >
        {value}
      </span>
    </button>
  );
}

function DeleteConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
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
          width: '320px',
          background: '#1D1E1E',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '24px 24px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontFamily: FONT_MEDIUM, fontWeight: 500, fontSize: '16px', lineHeight: '24px', color: '#FFFFFF' }}>
            确认注销账号？
          </span>
          <button
            type="button"
            onClick={onCancel}
            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '6px', padding: 0, flexShrink: 0 }}
          >
            <CloseIcon />
          </button>
        </div>
        <span style={{ fontFamily: FONT_REGULAR, fontSize: '14px', lineHeight: '20px', color: 'rgba(255,255,255,0.5)' }}>
          注销后账号及所有数据将被永久删除，无法恢复。
        </span>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              height: '36px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: FONT_REGULAR,
              fontSize: '14px',
              lineHeight: '20px',
              color: 'rgba(255,255,255,0.7)',
              transition: 'background 120ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              height: '36px',
              borderRadius: '8px',
              border: '1px solid rgba(247,95,95,0.3)',
              background: 'rgba(247,95,95,0.12)',
              cursor: 'pointer',
              fontFamily: FONT_REGULAR,
              fontSize: '14px',
              lineHeight: '20px',
              color: 'rgba(247,95,95,1)',
              transition: 'background 120ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(247,95,95,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(247,95,95,0.12)'; }}
          >
            确认注销
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfileModal({ open, onClose, userId, phone, wechat, userName }) {
  const [nameVal, setNameVal] = useState(userName || '');
  const [phoneVal, setPhoneVal] = useState(phone || '');
  const [wechatVal, setWechatVal] = useState(wechat || '');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '400px',
          background: '#1D1E1E',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 20px 0 20px',
          }}
        >
          <span style={{ fontFamily: FONT_MEDIUM, fontWeight: 500, fontSize: '16px', lineHeight: '24px', color: 'rgba(255,255,255,1)' }}>
            个人信息
          </span>
          <button
            type="button"
            className="flex items-center justify-center border-0 cursor-pointer rounded-[6px]"
            style={{ width: '28px', height: '28px', background: 'transparent', padding: 0 }}
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Avatar section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 20px 20px 20px',
            gap: '8px',
          }}
        >
          <AvatarEditButton />
          <span style={{ fontFamily: FONT_MEDIUM, fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: 'rgba(255,255,255,0.85)' }}>
            {userName}
          </span>
          <span style={{ fontFamily: FONT_REGULAR, fontSize: '12px', lineHeight: '16px', color: 'rgba(255,255,255,0.3)' }}>
            ID：{userId}
          </span>
        </div>

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 8px 12px 8px' }}>
          <ProfileField label="用户名" value={nameVal} onChange={(e) => setNameVal(e.target.value)} placeholder="请输入用户名" />
          <ProfileField label="手机号" value={phoneVal} onChange={(e) => setPhoneVal(e.target.value)} placeholder="请输入手机号" />
          <ProfileField label="微信" value={wechatVal} onChange={(e) => setWechatVal(e.target.value)} placeholder="未绑定，点击绑定" />
          <div style={{ height: '20px' }} />
          <DangerRow label="注销账号" value="永久删除账号及所有数据" onClick={() => setDeleteConfirm(true)} />
        </div>
      </div>
      {deleteConfirm && (
        <DeleteConfirmDialog
          onConfirm={() => { setDeleteConfirm(false); onClose?.(); }}
          onCancel={() => setDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

function AvatarEditButton() {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      className="relative border-0 cursor-pointer"
      style={{ padding: 0, background: 'transparent', borderRadius: 'calc(infinity * 1px)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onClick={() => {}}
    >
      <div style={{ position: 'relative', width: '64px', height: '64px' }}>
        <Avatar size={64} />
        {/* Hover overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'calc(infinity * 1px)',
            background: pressed ? 'rgba(0,0,0,0.45)' : hovered ? 'rgba(0,0,0,0.3)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 120ms',
          }}
        >
          {hovered && (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.5 3.5L16.5 6.5L7 16H4V13L13.5 3.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
