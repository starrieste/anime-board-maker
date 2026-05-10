import { useState, useRef, useEffect } from "react";

export function CustomSelect({ options, value, onChange, className }: {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
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
    <div ref={ref} className={`relative flex-1 ${className ?? ""}`}>
      <button
        onMouseDown={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="w-full text-white text-xs px-2 py-2 outline-none transition-all text-center"
      >
        {value}
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 w-full border-2 border-gray-600 rounded-xl overflow-hidden shadow-xl">
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
