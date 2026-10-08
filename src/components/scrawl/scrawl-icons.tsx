import type { SVGProps } from "react";

export type IconName =
  | "pencil"
  | "ruler"
  | "download"
  | "grid"
  | "sliders"
  | "eye"
  | "text"
  | "caret-left"
  | "caret-right"
  | "eraser"
  | "undo"
  | "trash"
  | "arrow-up-right"
  | "plus"
  | "folder";

const PATHS: Record<IconName, string> = {
  pencil: "M10.5 2.5l3 3L5 14H2v-3l8.5-8.5zM8.5 4.5l3 3",
  ruler: "M1.5 10.5l9-9 4 4-9 9-4-4zM4 8l1.5 1.5M6 6l2 2M8 4l1.5 1.5",
  download: "M8 2v8M4.5 6.5L8 10l3.5-3.5M2 10.5V14h12v-3.5",
  grid: "M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z",
  sliders: "M2 4.5h7M12 4.5h2M2 11.5h2M7 11.5h7M10.5 3v3M5.5 10v3",
  eye: "M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8zM8 10a2 2 0 100-4 2 2 0 000 4z",
  text: "M3 3.5h10M8 3.5V13M6 13h4",
  "caret-left": "M10 3L5 8l5 5",
  "caret-right": "M6 3l5 5-5 5",
  eraser: "M6 14h8M2.5 9.5l6-6 4 4-6 6H5l-2.5-2.5v-1.5zM5.5 6.5l4 4",
  undo: "M5 6.5H11a3 3 0 010 6H8M5 6.5l2.5-2.5M5 6.5L7.5 9",
  trash: "M2.5 4h11M6 4V2.5h4V4M4 4l.75 9.5h6.5L12 4M6.75 6.5v4.5M9.25 6.5v4.5",
  "arrow-up-right": "M5 11l6-6M6 5h5v5",
  plus: "M8 3v10M3 8h10",
  folder: "M1.5 4V13h13V5.5H7.5L6 4h-4.5z",
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 14, className = "", ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`shrink-0 ${className}`}
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
