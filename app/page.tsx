"use client";
import { useAnimeBoard } from "./hooks/useAnimeBoard";
import { Board } from "./components/Board";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { SelectedBrush } from "./components/SelectedBrush";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";

export default function Home() {
  const board = useAnimeBoard();

  return (
    <main
      className={`relative w-screen h-screen overflow-hidden bg-[#0f0f0f] ${
        board.spacePressed ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"
      }`}
    >
      <Navbar {...board}/>
      <Sidebar {...board}/>

      <TransformWrapper
        panning={{
          disabled: !(board.spacePressed || board.mouseButtons.mmb),
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
          <Board {...board} />
        </TransformComponent>
      </TransformWrapper>


      <SelectedBrush activeBrush={board.activeBrush}/>
    </main>
  );
}
