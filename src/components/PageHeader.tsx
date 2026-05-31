import BrandLogo from "@/components/BrandLogo";

export default function PageHeader({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <header className="mb-8 sm:mb-10">
      <BrandLogo size="md" />
      {title && (
        <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
      )}
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          {description}
        </p>
      )}
    </header>
  );
}
