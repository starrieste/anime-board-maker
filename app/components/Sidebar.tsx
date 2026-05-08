"use client";
import { CustomSelect } from "./CustomSelect";

interface SidebarProps {
  query: string;
  setQuery: (val: string) => void;
  results: any[];
  setResults: (val: any[]) => void;
  source: string;
  setSource: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  setActiveBrush: (char: any) => void;
  fillEarliest: (char: any) => void;
}

export function Sidebar({
  query,
  setQuery,
  results,
  setResults,
  source,
  setSource,
  category,
  setCategory,
  setActiveBrush,
  fillEarliest,
}: SidebarProps) { 
  return (
    <aside className="fixed top-16 left-0 w-96 h-[calc(100vh-4rem)] bg-black/90 border-r border-gray-800 z-30 overflow-y-auto p-4">
      <div className="items-center p-4 flex flex-col gap-4 border-2 rounded-xl border-gray-700">
        <div className="">
          <div
            className="flex gap-2 w-full p-2"
          >
            <CustomSelect options={["AL", "MAL"]} value={source} onChange={setSource} />
            <CustomSelect options={["Characters", "Anime", "Manga", "Staff"]} value={category} onChange={setCategory} />
          </div>
          
          <input
            className="pointer-events-auto text-white text-center p-2 rounded-full border-2 w-64 bg-gray-900 outline-none border-gray-600 focus:border-blue-400 transition-all"
            placeholder="=ω="
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim() === "") setResults([]);
            }}
          />
        </div>
    
        {results.length > 0 && (
          <div className="grid grid-cols-2 overflow-y-auto max-h-128 justify-items-center gap-4 p-4 pb-4 w-80 custom-scrollbar">
            {results.map((char, i) => (
              <button
                key={i}
                onClick={() => {
                  const img = new Image();
                  img.crossOrigin = "anonymous";
                  img.src = char.image.large;
                  setActiveBrush(char);
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  fillEarliest(char);
                }}
                className="flex flex-col pointer-events-auto w-full group items-center gap-2 transition-transform hover:scale-105"
              >
                <div className="w-full h-44 overflow-hidden rounded-lg border-2 border-gray-700 group-hover:border-blue-400 transition-colors">
                  <img
                    src={char.image.large}
                    alt={char.name.full}
                    className="w-full h-full object-cover"
                    draggable="false"
                  />
                </div>
                <p className="text-xs text-center font-medium truncate w-full">
                  {char.name.full}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
