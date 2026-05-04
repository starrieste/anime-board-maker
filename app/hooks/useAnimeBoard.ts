import { useState, useEffect, useRef } from "react";
import { domToPng } from 'modern-screenshot';

export function useAnimeBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [cells, setCells] = useState(Array(25).fill({ name: "", image: "" }));
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [lmb, setLMB] = useState(false);
  const [rmb, setRMB] = useState(false);
  const [activeBrush, setActiveBrush] = useState<any | null>(null);

  const eraseCell = (index: number) => {
    const newCells = [...cells];
    newCells[index] = { name: "", image: "" };
    setCells(newCells);
  };

  const paintCell = (index: number) => {
    if (!activeBrush) return;
    const newCells = [...cells];
    newCells[index] = {
      name: activeBrush.name.full,
      image: activeBrush.image.large
    };
    setCells(newCells);
  };

  const handleMove = (clientX: number, clientY: number, isLMB: boolean, isRMB: boolean) => {
    if (!isLMB && !isRMB) return;
    const target = document.elementFromPoint(clientX, clientY) as HTMLElement;
    const cellIndex = target?.closest('[data-index]')?.getAttribute('data-index');
    if (cellIndex !== null && cellIndex !== undefined) {
      const idx = Number(cellIndex);
      if (isLMB) paintCell(idx);
      else if (isRMB) eraseCell(idx);
    }
  };

  async function searchCharacters() {
    if (!query) return;
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query ($search: String) { Page(perPage: 15) { characters(search: $search) { name { full native } image { large } } } }`,
        variables: { search: query }
      })
    });
    const data = await response.json();
    setResults(data.data.Page.characters);
  }

  async function downloadBoard() {
    if (!boardRef.current) return;
    const dataUrl = await domToPng(boardRef.current, { quality: 1, scale: 2 });
    const link = document.createElement("a");
    link.download = "anime-board.png";
    link.href = dataUrl;
    link.click();
  }

  useEffect(() => {
    if (query.trim().length === 0) return;
    const delayDebounceFn = setTimeout(() => { searchCharacters(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    const handleMouseUp = () => { setLMB(false); setRMB(false); };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return {
    boardRef, cells, query, setQuery, results, setResults,
    activeBrush, setActiveBrush, lmb, setLMB, rmb, setRMB,
    handleMove, downloadBoard
  };
}
