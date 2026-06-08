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
  const Cell = ({ on }: { on: number }) => (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: on ? color : "transparent",
      }}
    />
  );
  const Grid = ({ grid }: { grid: number[][] }) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(5, ${size}px)`,
        gap: 2,
      }}
    >
      {grid.flat().map((c, i) => (
        <Cell key={i} on={c} />
      ))}
    </div>
  );
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-end gap-1.5">
        <Grid grid={two} />
        <Grid grid={five} />
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
