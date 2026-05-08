import { useState, useRef, useEffect } from "react";

export function CustomSelect({ options, value, onChange }: {
  options: string[];
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-1">
      <button
        onMouseDown={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="w-full bg-gray-900 text-white text-xs border-2 border-gray-600 rounded-full px-2 py-2 outline-none hover:border-blue-400 transition-all text-center"
      >
        {value}
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 w-full bg-gray-900 border-2 border-gray-600 rounded-xl z-[9999] overflow-hidden shadow-xl">
          {options.map((opt) => (
            <button
              key={opt}
              onMouseDown={(e) => {
                e.stopPropagation();
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-xs px-3 py-2 text-left hover:bg-gray-700 transition-colors ${
                opt === value ? "text-blue-400 font-bold" : "text-white"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
