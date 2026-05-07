import { useState, useEffect, useRef } from "react";
import { domToJpeg } from "modern-screenshot/dist/index.cjs";

export function useAnimeBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [cells, setCells] = useState(Array(25).fill({ name: "", image: "" }));
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [mouseButtons, setMouseButtons] = useState({ lmb: false, rmb: false, mmb: false });
  const [activeBrush, setActiveBrush] = useState<any | null>(null);
  const [spacePressed, setSpacePressed] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");

  const stateRef = useRef({ activeBrush, spacePressed, mouseButtons });
  useEffect(() => {
    stateRef.current = { activeBrush, spacePressed, mouseButtons };
  }, [activeBrush, spacePressed, mouseButtons]);

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

  const handleMove = (clientX: number, clientY: number, buttons: any) => {
    const { lmb, rmb } = buttons;
    
    if (stateRef.current.spacePressed || stateRef.current.mouseButtons.mmb) return;
    if (!lmb && !rmb) return;
  
    const target = document.elementFromPoint(clientX, clientY) as HTMLElement;
    const cellIndex = target?.closest('[data-index]')?.getAttribute('data-index');
    if (cellIndex !== null && cellIndex !== undefined) {
      const idx = Number(cellIndex);
      if (lmb) paintCell(idx);
      else if (rmb) eraseCell(idx);
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

      setMouseButtons(prev => ({ ...prev, lmb: e.button === 0, mmb: e.button === 1, rmb: e.button === 2 }));
      handleMove(e.clientX, e.clientY, { lmb: e.button === 0, rmb: e.button === 2 });
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      setMouseButtons({ lmb: false, mmb: false, rmb: false });
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      setMouseButtons({ lmb: false, rmb: false, mmb: false });
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
    mouseButtons, setMouseButtons,
    boardTitle, setBoardTitle,
    spacePressed, setSpacePressed,
    handleMove, downloadBoard
  };
}
