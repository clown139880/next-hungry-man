import { Droppable } from "react-beautiful-dnd";
import { useEffect, useState } from "react";
import { Column } from "context/type";

export const useStrictDroppable = (loading: boolean) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let animation: any;

    if (!loading) {
      animation = requestAnimationFrame(() => setEnabled(true));
    }

    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, [loading]);

  return enabled;
};

const Column = ({
  column,
  children,
  taskCount,
}: {
  column: Column;
  children: React.ReactNode;
  taskCount: number;
}) => {
  const enabled = useStrictDroppable(!column.id);

  return (
    <div className="column w-[280px] shrink-0">
      <h3 className="mb-6 uppercase heading-sm">
        <span className="inline-block w-3 h-3 mr-3 rounded-full task-status"></span>
        {column.title} ({taskCount})
      </h3>
      {enabled ? (
        <Droppable droppableId={column.id.toString()} type="column">
          {(provided) => (
            <ul
              className="flex flex-col h-full gap-5 pb-12 overflow-y-scroll scrollbar-thin scrollbar-thumb-mainPurple scrollbar-track-transparent"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {children}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      ) : null}
    </div>
  );
};
export default Column;
