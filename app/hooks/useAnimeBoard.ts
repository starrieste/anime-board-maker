import { useState, useEffect, useRef } from "react";
import { domToJpeg } from "modern-screenshot/dist/index.cjs";

export function useAnimeBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [cells, setCells] = useState(Array(rows*cols).fill({ name: "", image: "" }));
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [mouseButtons, setMouseButtons] = useState({
    lmb: false,
    rmb: false,
    mmb: false,
  });
  const [activeBrush, setActiveBrush] = useState<any | null>(null);
  const [spacePressed, setSpacePressed] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  
  const [source, setSource] = useState("AL");
  const [category, setCategory] = useState("Characters");
  
  const STORAGE_KEY = "kiyo-anime-board-state";

  // Load from local storage
  useEffect(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setRows(parsed.rows || 5);
          setCols(parsed.cols || 5);
          setCells(parsed.cells || []);
          setBoardTitle(parsed.boardTitle || "");
        } catch (e) {
          console.error("Failed to load board state", e);
        }
      } else {
        setCells(Array(5 * 5).fill({ name: "", image: "" }));
      }
    }, []);

  // Save to local storage
  useEffect(() => {
      if (cells.length === 0) return;
  
      const stateToSave = {
        rows,
        cols,
        cells,
        boardTitle
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [rows, cols, cells, boardTitle]);

  const stateRef = useRef({ activeBrush, spacePressed, mouseButtons });
  useEffect(() => {
    stateRef.current = { activeBrush, spacePressed, mouseButtons };
  }, [activeBrush, spacePressed, mouseButtons]);
  
  // Don't wipe cells unnecessarily
  useEffect(() => {
      setCells((prev) => {
        const newSize = rows * cols;
        if (prev.length === newSize) return prev;
        
        const newCells = Array(newSize).fill(null).map((_, i) => 
          prev[i] || { name: "", image: "" }
        );
        return newCells;
      });
    }, [rows, cols]);


  const eraseCell = (index: number) => {
    setCells((prev) => {
      const newCells = [...prev];
      newCells[index] = { name: "", image: "" };
      return newCells;
    });
  };

  const paintCell = (index: number) => {
    const currentBrush = stateRef.current.activeBrush;
    if (!currentBrush) return;
    setCells((prev) => {
      const newCells = [...prev];
      newCells[index] = {
        name: currentBrush.name.full,
        image: currentBrush.image.large,
      };
      return newCells;
    });
  };

  const handleMove = (clientX: number, clientY: number, buttons: any) => {
    const { lmb, rmb } = buttons;

    if (stateRef.current.spacePressed || stateRef.current.mouseButtons.mmb)
      return;
    if (!lmb && !rmb) return;

    const target = document.elementFromPoint(clientX, clientY) as HTMLElement;
    const cellIndex = target
      ?.closest("[data-index]")
      ?.getAttribute("data-index");
    if (cellIndex !== null && cellIndex !== undefined) {
      const idx = Number(cellIndex);
      if (lmb) paintCell(idx);
      else if (rmb) eraseCell(idx);
    }
  };

  const fillEarliest = (character: any) => {
    setCells((prev) => {
      const firstEmpty = prev.findIndex((cell) => !cell.image);

      if (firstEmpty === -1) return prev; 

      const newCells = [...prev];
      newCells[firstEmpty] = {
        name: character.name.full,
        image: character.image.large
      }
      
      return newCells;
    })
  };

  const preloadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const QUERY_CONFIGS: Record<string, any> = {
    Characters: {
      field: "characters",
      query: `query ($search: String) { Page(perPage: 15) { characters(search: $search) { name { full native } image { large } } } }`
    },
    Anime: {
      field: "media",
      query: `query ($search: String) { Page(perPage: 15) { media(search: $search, type: ANIME) { title { english romaji } coverImage { large } } } }`
    },
    Manga: {
      field: "media",
      query: `query ($search: String) { Page(perPage: 15) { media(search: $search, type: MANGA) { title { english romaji } coverImage { large } } } }`
    },
    Staff: {
      field: "staff",
      query: `query ($search: String) { Page(perPage: 15) { staff(search: $search) { name { full native } image { large } } } }`
    }
  };

  async function search() {
    if (!query) return;

    const config = QUERY_CONFIGS[category];

    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: config.query,
        variables: { search: query },
      }),
    });
    
    const result = await response.json();
    const rawData = result.data.Page[config.field];

    const normalized = rawData.map((item: any) => {
      const isMedia = category === "Anime" || category === "Manga";
      return {
        name: {
          full: isMedia ? (item.title.english || item.title.romaji) : item.name.full,
        },
        image: {
          large: isMedia ? item.coverImage.large : item.image.large,
        }
      }
    });

    const newUrls = new Set(normalized.map((c: any) => c.image.large));
    for (const [url] of preloadedImagesRef.current) {
      if (!newUrls.has(url)) preloadedImagesRef.current.delete(url);
    }

    for (const char of normalized) {
      if (!preloadedImagesRef.current.has(char.image.large)) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = char.image.large;
        preloadedImagesRef.current.set(char.image.large, img);
      }
    }

    setResults(normalized);
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

        el.style.transform = "none";
        el.style.margin = "0";
        el.style.padding = "1";
        el.style.display = "flex";
        el.style.flexDirection = "column";

        const titleDiv = el.children[0] as HTMLElement;
        if (titleDiv) {
          titleDiv.style.marginTop = "0px";
        }

        const titleText = titleDiv.children[0] as HTMLElement;
        if (titleText) {
          titleText.style.marginTop = "1px";
        }

        const gridDiv = el.querySelector(".grid") as HTMLElement;
        if (gridDiv) {
          gridDiv.style.transform = "none";
          gridDiv.style.marginTop = "0px";
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

      setMouseButtons((prev) => ({
        ...prev,
        lmb: e.button === 0,
        mmb: e.button === 1,
        rmb: e.button === 2,
      }));
      handleMove(e.clientX, e.clientY, {
        lmb: e.button === 0,
        rmb: e.button === 2,
      });
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
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      search();
    }, 500);
    
    return () => clearTimeout(delayDebounceFn);
  }, [query, category]);

  return {
    boardRef,
    cells,
    query, setQuery,
    results, setResults,
    handleMove,
    downloadBoard,
    fillEarliest,
    activeBrush, setActiveBrush,
    mouseButtons, setMouseButtons,
    boardTitle, setBoardTitle,
    spacePressed, setSpacePressed,
    rows, setRows,
    cols, setCols,
    source, setSource,
    category, setCategory
  };
}
