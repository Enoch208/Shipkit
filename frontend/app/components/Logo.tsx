type Props = {
  /** Height in px. Width is computed from the rocket's aspect ratio (~0.436). */
  size?: number;
  className?: string;
};

const ASPECT = 260 / 596;

export function Logo({ size = 24, className = "" }: Props) {
  const width = Math.round(size * ASPECT);
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/logo-mark.png"
      alt="ShipKit"
      width={width}
      height={size}
      className={`select-none ${className}`}
      draggable={false}
    />
  );
}
