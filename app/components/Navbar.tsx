"use client";
import { useState, useEffect } from "react";

interface NavbarProps {
  boardTitle: string;
  setBoardTitle: (val: string) => void;
  rows: number;
  setRows: (val: number) => void;
  cols: number;
  setCols: (val: number) => void;
  downloadBoard: () => void;
  cellWidth: number;
  setCellWidth: (val: number) => void;
  cellHeight: number;
  setCellHeight: (val: number) => void;
  
}

export function Navbar({
  boardTitle,
  setBoardTitle,
  rows,
  setRows,
  cols,
  setCols,
  downloadBoard,
  cellWidth, setCellWidth,
  cellHeight, setCellHeight
}: NavbarProps) {
  const [tempW, setTempW] = useState(cellWidth.toString());
  const [tempH, setTempH] = useState(cellHeight.toString());

  useEffect(() => {
    setTempW(cellWidth.toString());
  }, [cellWidth]);
  
  useEffect(() => {
    setTempH(cellHeight.toString());
  }, [cellHeight]);
  
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-gray-800 z-50 flex items-center justify-between px-8">
      <div className="flex items-baseline gap-2">
        <h1 className="text-2xl font-bold">Kiyo :3</h1>
      </div>
    
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
        <textarea
          placeholder="Board title..."
          value={boardTitle}
          onChange={(e) => {
            setBoardTitle(e.target.value);
            if (e.target.value.trim() === "") setBoardTitle("");
          }}
          className="pointer-events-auto text-white bg-gray-900 text-center p-2 rounded-full border-2 w-64 outline-none border-gray-600 focus:border-blue-400 transition-all resize-none h-10 overflow-hidden"
        />
        
        <div className="flex items-center bg-gray-900 border-2 border-gray-700 rounded-full px-3 py-1 gap-2">
          <input
            type="number"
            value={rows === 0 ? "0" : rows.toString()}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (isNaN(val)) {
                setRows(0);
              } else {
                setRows(Math.min(20, val));
              }
            }}
            className="w-8 bg-transparent text-center outline-none font-bold"
          />
          <span className="text-gray-500 text-xs font-bold">×</span>
          <input
              type="number"
              value={cols === 0 ? "0" : cols.toString()}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (isNaN(val)) {
                  setCols(0);
                } else {
                  setCols(Math.min(20, val));
                }
              }}
              className="w-8 bg-transparent text-center outline-none font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
        </div>

        <div className="flex items-center bg-gray-900 border-2 border-gray-700 rounded-full px-3 py-1 gap-2">
          <input
            type="number"
            value={tempW}
            onFocus={(e) => e.target.select()}
            onChange={(e) => { setTempW(e.target.value) }}
            onBlur={(e) => {
              const val = parseInt(tempW, 10);
              const clamped = isNaN(val) ? 100 : Math.min(400, Math.max(100, val));
              setCellWidth(clamped);
              setTempW(clamped.toString());
            }}
            className="w-10 bg-transparent text-center outline-none font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-gray-500 text-xs font-bold">×</span>
          <input
            type="number"
            value={tempH}
            onFocus={(e) => e.target.select()}
            onChange={(e) => { setTempH(e.target.value) }}
            onBlur={(e) => {
              const val = parseInt(tempH, 10);
              const clamped = isNaN(val) ? 100 : Math.min(400, Math.max(100, val));
              setCellHeight(clamped);
              setTempH(clamped.toString());
            }}
            className="w-10 bg-transparent text-center outline-none font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
    
      <button
        onClick={(e) => {
          e.stopPropagation();
          downloadBoard();
          (e.target as HTMLButtonElement).blur();
        }}
        className="text-sm bg-blue-500 border-2 border-transparent hover:border-blue-300 px-4 py-2 rounded-full transition-all active:scale-95 font-medium"
      >
        Download
      </button>
    </nav>
  )
}
