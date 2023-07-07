import TaskComments from "components/Task/TaskComments";
import TipTapEditor from "components/TipTapEditor/TipTapEditor";
import EditButton from "components/shared/EditButton";
import StatusDropdown from "components/shared/StatusDropdown";
import { useBoards } from "context";
import { TaskWithTodos } from "context/type";
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
  const { updateTodo, currentBoard, updateTask } = useBoards();

  return (
    <div className="w-full min-w-[50vw]  h-[80vh] p-6 mx-auto bg-white rounded-md dark:bg-darkGrey md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="heading-lg">{data.title}</h1>
        <EditButton
          switchToUpdate={switchToUpdate}
          switchToDelete={switchToDelete}
          type="Task"
          onConfirm={() => {}}
          className=""
        />
      </div>
      <div className="flex items-start w-full h-full gap-x-2 ">
        <div className="w-full flex-[2]">
          description
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
            <div className="max-h-[500px] w-full overflow-y-auto">
              <ReactMarkdown className="w-full h-full overflow-y-auto prose border lg:prose-xl body-lg text-mediumGrey dark:text-white">
                {data.content}
              </ReactMarkdown>
            </div>
          )}
          <TaskComments
            taskId={data.id}
            boardTitle={currentBoard?.title!}
            taskTitle={data.title}
          />
        </div>

        <div className="flex-1">
          <h3 className="mb-4 body-md text-mediumGrey dark:text-white">
            Subtasks ({completedSubtasks} of {data.todos.length})
          </h3>
          {data.todos.map((subtask, i) => (
            <label
              key={i}
              htmlFor={`${subtask}-${i}`}
              className={`body-md p-3 mb-2 inline-flex w-full rounded transition bg-lightGrey cursor-pointer hover:bg-mainPurple hover:bg-opacity-25 dark:text-white dark:bg-veryDarkGrey dark:hover:bg-mainPurple dark:hover:bg-opacity-25`}
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
                  subtask.isDone ? "opacity-50 line-through" : "opacity-100"
                } transition`}
              >
                {subtask.content}
              </span>
            </label>
          ))}

          <StatusDropdown label="Current Status" data={data} />
        </div>
      </div>
    </div>
  );
};
export default TaskDetailModal;
