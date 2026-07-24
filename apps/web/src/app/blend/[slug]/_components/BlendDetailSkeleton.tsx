export default function BlendDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 mt-8 mb-16 space-y-8 animate-pulse">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-2.5 w-16 bg-[var(--bg-hover)] rounded" />
              <div className="h-6 w-48 bg-[var(--bg-input)] rounded" />
            </div>
            <div className="h-9 w-24 bg-[var(--bg-hover)] rounded-md" />
          </div>
          <div className="h-20 w-full bg-[var(--bg-input)] rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
          <div className="h-64 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]" />
          <div className="h-64 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]" />
        </div>
      </div>
    </div>
  );
}