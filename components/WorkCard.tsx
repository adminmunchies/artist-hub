'use client';
type Work = {
  id: string; title: string | null; year: number | null;
  medium: string | null; dimensions: string | null;
  image_url: string | null; is_active: boolean;
};
export default function WorkCard({
  work, onToggle, onDelete,
}: {
  work: Work;
  onToggle: (id: string, next: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border p-3 space-y-2">
      <a href={`/w/${work.id}`} title="Work-Detail öffnen">
        {work.image_url && (
          <img
            src={`${work.image_url}?width=600&quality=80&resize=cover`}
            alt={work.title ?? ''}
            className="w-full aspect-[4/3] object-cover rounded-lg"
          />
        )}
      </a>
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <a className="underline" href={`/w/${work.id}`}>
            {work.title ?? 'Untitled'} {work.year ? `(${work.year})` : ''}
          </a>
          {(work.medium || work.dimensions) && (
            <div className="opacity-70">{[work.medium, work.dimensions].filter(Boolean).join(' · ')}</div>
          )}
          <div className="text-[11px] opacity-60 select-all">ID: {work.id}</div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs">
            Sichtbar
            <input
              type="checkbox"
              className="ml-1"
              checked={work.is_active}
              onChange={(e) => onToggle(work.id, e.target.checked)}
            />
          </label>
          <button
            onClick={() => onDelete(work.id)}
            className="text-xs rounded-lg border px-2 py-1 hover:bg-red-50"
            aria-label="Work löschen"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}
