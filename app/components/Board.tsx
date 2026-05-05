interface BoardProps {
  boardRef: React.RefObject<HTMLDivElement | null>;
  cells: any[];
  rows: number;
  cols: number;
  lmb: boolean;
  rmb: boolean;
  mmb: boolean;
  spacePressed: boolean;
  setLMB: (val: boolean) => void;
  setRMB: (val: boolean) => void;
  setMMB: (val: boolean) => void;
  handleMove: (x: number, y: number, l: boolean, r: boolean) => void;
}

export function Board({ boardRef, cells, rows, cols, lmb, rmb, setLMB, setRMB, setMMB, handleMove, spacePressed }: BoardProps) {
  const cellWidth = 160;
  const cellHeight = 230;
  const gap = 8;

  const totalWidth = (cols * cellWidth) + ((cols - 1) * gap);
  const totalHeight = (rows * cellHeight) + ((rows - 1) * gap);
  console.log(totalWidth);
  
  return (
    <div ref={boardRef} className="bg-black p-2 w-fit mx-auto border-4 border-white">
      <div className="bg-white">
        <h1 className="text-4xl text-center text-black p-2">My Anime Board</h1>
      </div>
      <div 
        className="grid bg-black grid-cols-5 pt-2 gap-2 mx-auto select-none"
        style={{
          width: `${totalWidth}px`,
          gridAutoRows: 'min-content'
        }}
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={(e) => {
          if (e.button === 1) {
            e.preventDefault();
            setMMB(true);
            return;
          }
          
          const isLMB = e.button === 0;
          const isRMB = e.button === 2;
          
          if (isLMB && !spacePressed) {
            setLMB(true);
            handleMove(e.clientX, e.clientY, true, false);
          }
          else if (isRMB) {
            setRMB(true);
            handleMove(e.clientX, e.clientY, false, true);
          }
        }}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY, lmb, rmb)}
      >
        {cells.map((cell, index) => (
          <div key={index} data-index={index} className="w-40 h-50 bg-white cursor-crosshair transition-all hover:border-blue-300">
            {cell.image && (
              <img src={cell.image} alt={cell.name} crossOrigin="anonymous" className="w-full h-full object-cover pointer-events-none"/>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
