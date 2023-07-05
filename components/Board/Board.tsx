import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useBoards } from "context";
import Column from "./Column";
import Task from "./Task";
import EmptyBoard from "./EmptyBoard";
import NewColumn from "./NewColumn";
import NoBoardsFound from "./NoBoardsFound";

const Board = () => {
  const { currentBoard, boards, dragTask, columnTasksMap } = useBoards();

  if (!boards?.length) return <NoBoardsFound />;
  if (!currentBoard?.columns.length) return <EmptyBoard />;

  return (
    <main className="flex flex-1 p-4 space-x-4 overflow-y-hidden scrollbar-thin scrollbar-thumb-mainPurple scrollbar-track-transparent bg-lightGrey dark:bg-veryDarkGrey">
      {dragTask && (
        <DragDropContext onDragEnd={dragTask}>
          {currentBoard.columns.map((column, i) => (
            <Column
              column={column}
              key={column.id}
              taskCount={columnTasksMap.get(column)?.length ?? 0}
            >
              {columnTasksMap.get(column)?.map((task, j) => {
                return <Task task={task} index={j} key={task.id} />;
              })}
            </Column>
          ))}
        </DragDropContext>
      )}
      <NewColumn />
    </main>
  );
};
export default Board;
