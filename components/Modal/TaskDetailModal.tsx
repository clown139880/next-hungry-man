import TaskComments from "components/Task/TaskComments";
import TipTapEditor from "components/TipTapEditor/TipTapEditor";
import EditButton from "components/shared/EditButton";
import StatusDropdown from "components/shared/StatusDropdown";
import { useBoards } from "context";
import { TaskWithTodos, Todo } from "context/type";
import { useEffect } from "react";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

const TaskDetailModal = ({
  data,
  completedSubtasks,
  switchToUpdate,
  switchToDelete,
}: {
  data: TaskWithTodos;
  completedSubtasks: number;
  switchToUpdate: () => void;
  switchToDelete: () => void;
}) => {
  const { updateTodo, currentBoard, updateTask, onOpenTask, createTask } =
    useBoards();

  useEffect(() => {
    onOpenTask?.(data.id);
  }, [data.updatedAt]);

  return (
    <div className="w-full min-w-[50vw]  h-[80vh]  overflow-y-auto p-6 mx-auto bg-white rounded-md dark:bg-darkGrey md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="heading-lg">{data.title}</h1>

        <span
          onClick={() => switchToUpdate()}
          className="underline cursor-pointer"
        >
          edit
        </span>
        <StatusDropdown label="Status" data={data} />
      </div>
      <div className="flex items-start w-full h-full gap-x-2 ">
        {data.content && (
          <div className="w-full flex-[1]  max-w-[50%] ">
            <h3 className="mb-4 body-md text-mediumGrey dark:text-white">
              Description
            </h3>
            {data.id == 44 ? (
              <TipTapEditor
                uniqueId={"task-" + data.id}
                content={data.content}
                onUpdate={(content) =>
                  content != data.content
                    ? updateTask?.({
                        ...data,
                        content,
                      }) ?? Promise.resolve()
                    : Promise.resolve()
                }
              />
            ) : (
              <div className="w-full h-full">
                <ReactMarkdown className="w-full h-full prose border lg:prose-xl body-lg text-mediumGrey dark:text-white">
                  {data.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
        <div className="flex-1 ">
          {data.todos.length > 0 && (
            <>
              <h3 className="mb-4 body-md text-mediumGrey dark:text-white">
                Subtasks ({completedSubtasks} of {data.todos.length})
              </h3>
              <div className="max-h-[300px] overflow-y-auto">
                {data.todos
                  .sort((a, b) => a.id - b.id)
                  .map((s, i) => ({
                    ...s,
                    index: i,
                  }))
                  .sort((a, b) => {
                    if (a.isDone && !b.isDone) return 1;
                    if (!a.isDone && b.isDone) return -1;
                    return a.index - b.index;
                  })
                  .map(({ index: i, ...subtask }) => (
                    <label
                      key={i}
                      htmlFor={`${subtask}-${i}`}
                      className={`body-md p-3 mb-2 group inline-flex items-center w-full rounded transition bg-lightGrey cursor-pointer hover:bg-mainPurple hover:bg-opacity-25 dark:text-white dark:bg-veryDarkGrey dark:hover:bg-mainPurple dark:hover:bg-opacity-25`}
                    >
                      <input
                        id={`${subtask}-${i}`}
                        type="checkbox"
                        checked={subtask.isDone}
                        className="mr-3 accent-mainPurple"
                        onChange={() =>
                          updateTodo?.({
                            id: subtask.id,
                            isDone: !subtask.isDone,
                          })
                        }
                      />
                      <span
                        className={`${
                          subtask.isDone
                            ? "opacity-50 line-through"
                            : "opacity-100"
                        } transition`}
                      >
                        {i + 1}. {subtask.content}
                      </span>
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          createTask?.({
                            title: subtask.content,
                            columnId: data.boardId,
                            todos: [
                              {
                                content: subtask.content,
                              },
                            ] as Todo[],
                            description: data.content,
                          });
                          updateTodo?.({
                            id: subtask.id,
                            content: "[MoveToTask]" + subtask.content,
                            isDone: !subtask.isDone,
                          });
                        }}
                        className="relative hidden h-full p-2 ml-auto rounded-sm hover:bg-blue-500 group-hover:block"
                      >
                        create new task
                      </span>
                    </label>
                  ))}
              </div>
            </>
          )}
          <TaskComments
            taskId={data.id}
            boardTitle={currentBoard?.title!}
            taskTitle={data.title}
          />
        </div>
      </div>
    </div>
  );
};
export default TaskDetailModal;
