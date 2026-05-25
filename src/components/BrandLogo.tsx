import Link from "next/link";
import { PlaySquare } from "lucide-react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  link?: boolean;
  alwaysShowText?: boolean;
}

const sizes = {
  sm: { icon: "w-8 h-8", text: "text-xl" },
  md: { icon: "w-10 h-10", text: "text-2xl" },
  lg: { icon: "w-16 h-16", text: "text-4xl" },
};

export default function BrandLogo({
  size = "sm",
  showText = true,
  link = true,
  alwaysShowText = false,
}: BrandLogoProps) {
  const s = sizes[size];
  const content = (
    <>
      <PlaySquare className={`${s.icon} text-violet-500`} />
      {showText && (
        <span
          className={`${s.text} font-bold tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent ${alwaysShowText ? "" : "hidden sm:inline"}`}
        >
          Nexora
        </span>
      )}
    </>
  );

  if (link) {
    return (
      <Link href="/" className="flex items-center gap-2 flex-shrink-0">
        {content}
      </Link>
    );
  }

  return <div className="flex items-center gap-2">{content}</div>;
}
