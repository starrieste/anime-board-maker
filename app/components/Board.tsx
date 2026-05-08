interface BoardProps {
  boardRef: React.RefObject<HTMLDivElement | null>;
  cells: any[];
  rows: number;
  cols: number;
  boardTitle: string;
  spacePressed: boolean;
  mouseButtons: { lmb: boolean; rmb: boolean; mmb: boolean };
  setMouseButtons: (val: { lmb: boolean; mmb: boolean; rmb: boolean }) => void;
  handleMove: (
    x: number,
    y: number,
    buttons: { lmb: boolean; rmb: boolean },
  ) => void;
}

export function Board({
  boardRef,
  cells,
  rows,
  cols,
  handleMove,
  boardTitle,
  spacePressed,
  mouseButtons, setMouseButtons,
}: BoardProps) {
  const cellWidth = 160;
  const cellHeight = 230;
  const gap = 8;

  const totalWidth = cols * cellWidth + (cols - 1) * gap;
  const totalHeight = rows * cellHeight + (rows - 1) * gap;
  console.log(totalWidth);

  return (
    <div
      ref={boardRef}
      className="bg-black p-2 w-fit mx-auto border-4 border-white"
    >
      <div className="bg-white">
        <h1 className="text-4xl text-center text-black p-2">
          {boardTitle || "My Anime Board"}
        </h1>
      </div>
      <div
        className="grid bg-black grid-cols-5 pt-2 gap-2 mx-auto select-none"
        style={{
          width: `${totalWidth}px`,
          gridAutoRows: "min-content",
        }}
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={(e) => {
          const isLMB = e.button === 0 && !spacePressed;
          const isRMB = e.button === 2;

          setMouseButtons({ ...mouseButtons, lmb: isLMB, rmb: isRMB });
          handleMove(e.clientX, e.clientY, { lmb: isLMB, rmb: isRMB });
        }}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY, mouseButtons)}
      >
        {cells.map((cell, index) => (
          <div
            key={index}
            data-index={index}
            className="w-40 h-50 bg-white cursor-crosshair transition-all hover:border-blue-300"
          >
            {cell.image && (
              <img
                src={cell.image || ""}
                alt={cell.name}
                crossOrigin="anonymous"
                className="w-full h-full object-cover pointer-events-none"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
