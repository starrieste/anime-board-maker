"use client";
import { useAnimeBoard } from "./hooks/useAnimeBoard";
import { Board } from "./components/Board";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function Home() {
  const { 
    boardRef, cells, query, setQuery, results, setResults, 
    setActiveBrush, lmb, setLMB, rmb, setRMB, handleMove, downloadBoard 
  } = useAnimeBoard();

  return (
    <main
      className="relative w-screen h-screen overflow-hidden bg-[#0f0f0f]"
    >
      
      <nav className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-gray-800 z-50 flex items-center justify-between px-8">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-bold">Kuwa :3</h1>
        </div>

        <button 
          onClick={downloadBoard} 
          className="text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-full transition-all active:scale-95 font-medium"
        >
          Download
        </button>
      </nav>

      <div className="fixed top-20 left-0 right-0 z-40 flex flex-col items-center pointer-events-none">
        <input 
        className="pointer-events-auto text-white p-2 rounded-full border-2 w-64 bg-transparent outline-none border-gray-600 focus:border-blue-400 transition-all"
        placeholder="Search..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value.trim() === "") setResults([]);
        }}
        />

        <div className="flex gap-4 p-4 overflow-x-auto pb-4 w-full max-w-4xl custom-scrollbar">
          {results.map((char, i) => (
            <button
              key={i}
              onClick={() => setActiveBrush(char)}
              className="pointer-events-auto flex-none w-32 group flex flex-col items-center gap-2 transition-transform hover:scale-105"
            >
              <div className="w-full h-44 overflow-hidden rounded-lg border-2 border-gray-700 group-hover:border-blue-400 transition-colors">
                <img src={char.image.large} alt={char.name.full} className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-center font-medium truncate w-full">{char.name.full}</p>
            </button>
          ))}
        </div>
      </div>
      
      <TransformWrapper
        panning={{ activationKeys: [" "] }}
        initialScale={0.8}
        centerOnInit={true}
        minScale={0.2}
        maxScale={8}
        limitToBounds={true}
        zoomAnimation={{ disabled: true }}
      >
        <TransformComponent wrapperClass="!w-screen !h-screen">
          <div className="p-[1000px]">
            <Board 
            boardRef={boardRef} 
            cells={cells} 
            lmb={lmb} setLMB={setLMB} 
            rmb={rmb} setRMB={setRMB} 
            handleMove={handleMove} 
            />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </main>
  );
}
