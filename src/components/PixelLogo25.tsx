function Cell({ on, size, color }: { on: number; size: number; color: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: on ? color : "transparent",
      }}
    />
  );
}

function Grid({ grid, size, color }: { grid: number[][]; size: number; color: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(5, ${size}px)`,
        gap: 2,
      }}
    >
      {grid.flat().map((c, i) => (
        <Cell key={i} on={c} size={size} color={color} />
      ))}
    </div>
  );
}

export default function PixelLogo25({
  size = 14,
  color = "#009444",
  label = true,
}: {
  size?: number;
  color?: string;
  label?: boolean;
}) {
  const two = [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ];
  const five = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ];
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-end gap-1.5">
        <Grid grid={two} size={size} color={color} />
        <Grid grid={five} size={size} color={color} />
      </div>
      {label && (
        <div
          className="font-display mt-1 text-center"
          style={{
            fontSize: size * 0.85,
            letterSpacing: "0.4em",
            color,
          }}
        >
          —BITS—
        </div>
      )}
    </div>
  );
}
