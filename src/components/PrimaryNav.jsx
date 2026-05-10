import { useState, useRef, useLayoutEffect, useCallback, useEffect } from 'react';

/**
 * 主导航 · 液态切换 indicator
 * - items: [{ key, label?, icon }]
 * - activeKey: 当前激活项（可为 null 表示无选中）
 * - onChange: 点击切换回调
 * - variant: 'expanded' (默认，带文字) | 'compact' (只图标，32x32) | 'vertical'
 *
 * 交互：
 * 1) activeKey 变化时 indicator 流动 / 出现 / 消失
 * 2) 点击瞬间：源按钮液态挤压，目标按钮液态放大过冲
 * 3) activeKey = null 时不渲染 indicator（toggle 行为由外层控制）
 */
export default function PrimaryNav({ items, activeKey = null, onChange, variant = 'expanded' }) {
  const containerRef = useRef(null);
  const itemRefs = useRef(new Map());
  const innerRef = useRef(null);

  const [rect, setRect] = useState(null);
  const [prevKey, setPrevKey] = useState(activeKey);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (activeKey == null) {
      setRect(null);
      return;
    }
    const target = itemRefs.current.get(activeKey);
    if (!container || !target) return;
    const c = container.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    setRect({
      top: t.top - c.top,
      left: t.left - c.left,
      width: t.width,
      height: t.height,
    });
  }, [activeKey]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measure]);

  useLayoutEffect(() => {
    if (activeKey == null) return;
    const el = innerRef.current;
    if (!el) return;
    el.classList.remove('primary-nav-squish');
    void el.offsetWidth;
    el.classList.add('primary-nav-squish');
  }, [activeKey]);

  useEffect(() => {
    if (prevKey === activeKey) return;
    const fromEl = prevKey != null ? itemRefs.current.get(prevKey) : null;
    const toEl = activeKey != null ? itemRefs.current.get(activeKey) : null;
    const clear = (el) => el && el.classList.remove('primary-nav-item-shrink', 'primary-nav-item-pop');
    clear(fromEl);
    clear(toEl);
    if (fromEl) {
      void fromEl.offsetWidth;
      fromEl.classList.add('primary-nav-item-shrink');
    }
    if (toEl) {
      void toEl.offsetWidth;
      toEl.classList.add('primary-nav-item-pop');
    }
    setPrevKey(activeKey);
  }, [activeKey, prevKey]);

  const registerItem = (key) => (el) => {
    if (el) itemRefs.current.set(key, el);
    else itemRefs.current.delete(key);
  };

  const isCompact = variant === 'compact';
  const isVertical = variant === 'vertical';
  const containerCls = isCompact
    ? 'primary-nav flex flex-col items-center gap-8 self-stretch'
    : isVertical
    ? 'primary-nav flex flex-col items-start gap-8 flex-1'
    : 'primary-nav flex flex-col items-start gap-12';
  const itemCls = isCompact
    ? 'primary-nav-item flex items-center justify-center rounded-full size-[32px]'
    : isVertical
    ? 'primary-nav-item flex flex-col items-center justify-center gap-4 rounded-[16px] size-[56px]'
    : 'primary-nav-item flex items-center gap-8 px-20 py-12 rounded-full';

  return (
    <div ref={containerRef} className={containerCls} style={isVertical ? { '--primary-nav-indicator-radius': '16px' } : undefined}>
      {rect && (
        <div
          className="primary-nav-indicator"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
        >
          <div ref={innerRef} className="primary-nav-indicator-inner fluid-glass" />
        </div>
      )}

      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <button
            key={item.key}
            ref={registerItem(item.key)}
            type="button"
            className={itemCls}
            style={isVertical ? { borderRadius: '16px', flexDirection: 'column' } : undefined}
            onClick={() => onChange?.(item.key)}
            aria-label={item.label}
          >
            {item.icon}
            {!isCompact && item.label && (
              <span
                className={`w-fit shrink-0 ${isVertical ? 'text-xs/4' : 'text-base/5'} ${
                  isActive
                    ? "font-['AlibabaPuHuiTi_2_65_Medium','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] font-medium"
                    : "font-['AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif]"
                }`}
                style={isVertical ? { fontSize: '12px', lineHeight: '16px' } : undefined}
              >
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
