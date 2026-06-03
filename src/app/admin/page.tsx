import PageHeader from "@/components/PageHeader";
import DriveVideoForm from "@/components/DriveVideoForm";

export const metadata = {
  title: "Add video — Nexora",
  description: "Add videos from Google Drive links.",
};

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="Add video"
        description="Paste a public Google Drive link. No sign-in or Supabase upload required."
      />
      <DriveVideoForm />
    </main>
  );
}
