import BrandLogo from "@/components/BrandLogo";
import SearchInput from "@/components/SearchInput";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-950 text-white">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <BrandLogo size="lg" link={false} alwaysShowText />

        <p className="text-zinc-400 text-center text-lg max-w-md animate-fade-in">
          Stream your favorite videos through Nexora!
        </p>

        <SearchInput size="lg" placeholder="Search or paste YouTube URL..." />
      </div>
    </main>
  );
}
