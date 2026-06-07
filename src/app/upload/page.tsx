import PageHeader from "@/components/PageHeader";
import DriveVideoForm from "@/components/DriveVideoForm";
import SeriesForm from "@/components/SeriesForm";

export const metadata = {
  title: "Add video — Nexora",
  description: "Add videos from Google Drive links.",
};

export default function UploadPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="Add content"
        description="Upload a video, movie, or series episode."
      />
      <div className="flex flex-col gap-6">
        <DriveVideoForm />
        <SeriesForm />
      </div>
    </main>
  );
}
