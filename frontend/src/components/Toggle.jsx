export default function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: '36px', height: '20px', borderRadius: '10px', padding: '2px',
        backgroundColor: value ? '#4ADE80' : 'rgba(255,255,255,0.12)',
        border: `1px solid ${value ? '#4ADE80' : 'rgba(255,255,255,0.15)'}`,
        display: 'flex', alignItems: 'center',
        justifyContent: value ? 'flex-end' : 'flex-start',
        cursor: 'pointer', flexShrink: 0,
        transition: 'background-color 0.15s, border-color 0.15s',
      }}
    >
      <div style={{
        width: '16px', height: '16px', borderRadius: '50%',
        backgroundColor: value ? '#FFFFFF' : 'rgba(255,255,255,0.35)',
        flexShrink: 0,
        transition: 'background-color 0.15s',
      }} />
    </div>
  );
}
