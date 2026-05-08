"use client";
import { useAnimeBoard } from "./hooks/useAnimeBoard";
import { Board } from "./components/Board";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function Home() {
  const {
    boardRef,
    cells,
    query,
    setQuery,
    results,
    setResults,
    activeBrush,
    setActiveBrush,
    mouseButtons,
    setMouseButtons,
    spacePressed,
    setSpacePressed,
    boardTitle,
    setBoardTitle,
    handleMove,
    downloadBoard,
  } = useAnimeBoard();

  return (
    <main
      className={`relative w-screen h-screen overflow-hidden bg-[#0f0f0f] ${
        spacePressed ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"
      }`}
    >
      <nav className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-gray-800 z-50 flex items-center justify-between px-8">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-bold">Kiyo :3</h1>
        </div>

        <input
          placeholder="Board title..."
          value={boardTitle}
          onChange={(e) => {
            setBoardTitle(e.target.value);
            if (e.target.value.trim() === "") setBoardTitle("");
          }}
          className="pointer-events-auto text-white text-center p-2 rounded-full border-2 w-64 bg-transparent outline-none border-gray-600 focus:border-blue-400 transition-all"
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            downloadBoard();
            (e.target as HTMLButtonElement).blur();
          }}
          className="text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-full transition-all active:scale-95 font-medium"
        >
          Download
        </button>
      </nav>

      <aside className="fixed top-16 left-0 w-96 h-[calc(100vh-4rem)] bg-black/90 border-r border-gray-800 z-30 overflow-y-auto p-4">
        <div className="items-center p-4 flex flex-col gap-4 border-2 rounded-xl border-gray-700">
          <input
            className="pointer-events-auto text-white text-center p-2 rounded-full border-2 w-64 bg-transparent outline-none border-gray-600 focus:border-blue-400 transition-all"
            placeholder="=ω="
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim() === "") setResults([]);
            }}
          />

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

      <div className="fixed top-20 left-0 right-0 z-40 flex flex-col items-center pointer-events-none"></div>

      <TransformWrapper
        panning={{
          disabled: !(spacePressed || mouseButtons.mmb),
          allowLeftClickPan: true,
          allowMiddleClickPan: true,
          excluded: ["input", "button"],
          velocityDisabled: true,
        }}
        onWheelStart={() => {}}
        initialScale={0.6}
        centerOnInit={true}
        minScale={0.5}
        maxScale={2}
        limitToBounds={false}
        smooth={false}
        wheel={{ step: 0.1 }}
      >
        <TransformComponent wrapperClass="!w-screen !h-screen">
          <Board
            boardRef={boardRef}
            cells={cells}
            rows={5}
            cols={5}
            spacePressed={spacePressed}
            handleMove={handleMove}
            boardTitle={boardTitle}
            mouseButtons={mouseButtons}
            setMouseButtons={setMouseButtons}
          />
        </TransformComponent>
      </TransformWrapper>

      {activeBrush && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Selected
          </p>
          <div className="bg-black/90 border-2 border-blue-500 rounded-xl overflow-hidden w-32 shadow-2xl shadow-indigo-500/20">
            <img
              src={activeBrush.image.large}
              alt={activeBrush.name.full}
              className="w-full h-40 object-cover"
            />
            <div className="p-2 bg-blue-500">
              <p className="text-[10px] text-white font-bold text-center truncate">
                {activeBrush.name.full}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
