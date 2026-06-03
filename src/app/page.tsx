import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";
import { Library } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-5.5rem)] flex-col items-center justify-center p-6">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        <BrandLogo size="lg" link={false} alwaysShowText />

        <p className="max-w-md text-center text-lg text-zinc-400">
          Watch your video library from Google Drive — no sign-in required.
        </p>

        <Link
          href="/library"
          className="flex w-full max-w-md items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-5 py-4 text-sm font-medium text-zinc-200 shadow-lg shadow-black/20 transition hover:border-violet-500/40 hover:bg-zinc-900 hover:text-white"
        >
          <Library className="h-5 w-5 text-violet-400" />
          Open library
        </Link>
      </div>
    </main>
  );
}
