export default function BrandMark({ size = 38, fontSize = 17 }: { size?: number; fontSize?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg"
      style={{
        width: size,
        height: size,
        background: '#210b2c',
        fontSize,
        fontWeight: 800,
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      <span style={{ color: '#f7d9c4', transform: 'translateY(-1px)' }}>ƒ</span>
    </div>
  );
}
