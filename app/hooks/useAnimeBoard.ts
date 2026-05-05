import { useState, useEffect, useRef } from "react";
import { domToJpeg } from "modern-screenshot/dist/index.cjs";

export function useAnimeBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [cells, setCells] = useState(Array(25).fill({ name: "", image: "" }));
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [lmb, setLMB] = useState(false);
  const [rmb, setRMB] = useState(false);
  const [mmb, setMMB] = useState(false);
  const [activeBrush, setActiveBrush] = useState<any | null>(null);
  const [spacePressed, setSpacePressed] = useState(false);

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
    if (spacePressed) return;
    if (mmb) return;
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
  
    const dataUrl = await domToJpeg(boardRef.current, {
      quality: 0.9,
      scale: 2,
      
      width: boardRef.current.offsetWidth,
      height: boardRef.current.offsetHeight,
      
      onCloneNode: (node) => {
        const el = node as HTMLElement;
  
        el.style.transform = 'none';
        el.style.margin = '0';
        el.style.padding = '1';
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
  
        const titleDiv = el.children[0] as HTMLElement;
        if (titleDiv) {
          titleDiv.style.marginTop = '0px'; 
        }

        const titleText = titleDiv.children[0] as HTMLElement;
        if (titleText) {
          titleText.style.marginTop = '1px';
        }
  
        const gridDiv = el.querySelector('.grid') as HTMLElement;
        if (gridDiv) {
          gridDiv.style.transform = 'none';
          gridDiv.style.marginTop = '0px'; 
        }
      },
    });
  
    const link = document.createElement("a");
    link.download = "anime-board.jpg";
    link.href = dataUrl;
    link.click();
  }

  useEffect(() => {
    if (query.trim().length === 0) return;
    const delayDebounceFn = setTimeout(() => { searchCharacters(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    const handleMouseUp = () => {
      setLMB(false);
      setRMB(false);
      setMMB(false);
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      if (e.key === " " && (e.target as HTMLElement).tagName !== "INPUT") {
        setSpacePressed(true);
      }
    };
    const handleUp = (e: KeyboardEvent) => {
      if (e.key === " ") setSpacePressed(false);
    }

    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    }
    
  }, [])

  return {
    boardRef, cells,
    query, setQuery,
    results, setResults,
    activeBrush, setActiveBrush,
    lmb, setLMB,
    rmb, setRMB,
    mmb, setMMB,
    spacePressed, setSpacePressed,
    handleMove, downloadBoard
  };
}
