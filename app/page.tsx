"use client";
import { useAnimeBoard } from "./hooks/useAnimeBoard";
import { Board } from "./components/Board";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { CustomSelect } from "./components/CustomSelect";
import { SelectedBrush } from "./components/SelectedBrush";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";

export default function Home() {
  const {
    boardRef, cells, handleMove, activeBrush, mouseButtons, setMouseButtons, spacePressed, boardTitle, rows, cols,
  } = useAnimeBoard();

  const board = useAnimeBoard();

  return (
    <main
      className={`relative w-screen h-screen overflow-hidden bg-[#0f0f0f] ${
        spacePressed ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"
      }`}
    >
      <Navbar {...board}/>
      <Sidebar {...board}/>

      <div className="fixed top-20 left-0 right-0 z-40 flex flex-col items-center pointer-events-none"></div>

      <TransformWrapper
        panning={{
          disabled: !(spacePressed || mouseButtons.mmb),
          allowLeftClickPan: true,
          allowMiddleClickPan: true,
          excluded: ["input", "button", "select", "textarea"],
          velocityDisabled: true,
        }}
        onWheelStart={() => {}}
        initialScale={0.6}
        centerOnInit={true}
        minScale={0.2}
        maxScale={1.5}
        limitToBounds={false}
        smooth={false}
        wheel={{ step: 0.1 }}
      >
        <TransformComponent wrapperClass="!w-screen !h-screen">
          <Board
            boardRef={boardRef}
            cells={cells}
            rows={rows}
            cols={cols}
            spacePressed={spacePressed}
            handleMove={handleMove}
            boardTitle={boardTitle}
            mouseButtons={mouseButtons}
            setMouseButtons={setMouseButtons}
          />
        </TransformComponent>
      </TransformWrapper>


      <SelectedBrush activeBrush={activeBrush}/>
    </main>
  );
}
