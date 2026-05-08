"use client";

interface SelectedBrushProps {
  activeBrush: {
    image: { large: string };
    name: { full: string };
  } | null;
}

export function SelectedBrush({ activeBrush }: SelectedBrushProps) {
  if (!activeBrush) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
        Selected
      </p>
      <div className="bg-black/90 border-2 border-blue-500 rounded-xl overflow-hidden w-32 shadow-2xl shadow-indigo-500/20">
        <img
          src={activeBrush.image.large}
          alt={activeBrush.name.full}
          className="w-full h-40 object-cover"
        />
        <div className="p-2 bg-blue-500">
          <p className="text-[10px] text-white font-bold text-center truncate">
            {activeBrush.name.full}
          </p>
        </div>
      </div>
    </div>
  );
}
