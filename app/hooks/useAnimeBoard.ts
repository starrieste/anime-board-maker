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
  const [boardTitle, setBoardTitle] = useState("");

  const stateRef = useRef({ activeBrush, spacePressed, mmb });
  useEffect(() => {
    stateRef.current = { activeBrush, spacePressed, mmb };
  }, [activeBrush, spacePressed, mmb]);

  const eraseCell = (index: number) => {
    setCells(prev => {
      const newCells = [...prev];
      newCells[index] = { name: "", image: "" };
      return newCells;
    });
  };

  const paintCell = (index: number) => {
    const currentBrush = stateRef.current.activeBrush;
    if (!currentBrush) return;
    setCells(prev => {
      const newCells = [...prev];
      newCells[index] = { name: currentBrush.name.full, image: currentBrush.image.large };
      return newCells;
    });
  };

  const handleMove = (clientX: number, clientY: number, isLMB: boolean, isRMB: boolean) => {
    if (stateRef.current.spacePressed || stateRef.current.mmb) return;
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " && (e.target as HTMLElement).tagName !== "INPUT") {
        setSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") setSpacePressed(false);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      
      if (e.button === 0 && !spacePressed) setLMB(true);
      if (e.button === 1) setMMB(true);
      if (e.button === 2) setRMB(true);

      handleMove(e.clientX, e.clientY, e.button === 0, e.button === 2);
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      setLMB(false);
      setRMB(false);
      setMMB(false);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      setLMB(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("dragstart", handleDragStart);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  useEffect(() => {
    if (query.trim().length === 0) return;
    const delayDebounceFn = setTimeout(() => { searchCharacters(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return {
    boardRef, cells,
    query, setQuery,
    results, setResults,
    activeBrush, setActiveBrush,
    lmb, setLMB,
    rmb, setRMB,
    mmb, setMMB,
    boardTitle, setBoardTitle,
    spacePressed, setSpacePressed,
    handleMove, downloadBoard
  };
}
