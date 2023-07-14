import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";

import Modal from "components/Modal";
import TaskDetailModal from "components/Modal/TaskDetailModal";
import UpdateTaskModal from "components/Modal/UpdateTaskModal";
import DeleteTaskModal from "components/Modal/DeleteTaskModal";
import { useBoards } from "context";
import { Task, Todo } from "context/type";

const Task = ({
  task,
  index,
  isUpdated,
}: {
  isUpdated: boolean;
  task: Task & {
    todos: Todo[];
  };
  index: number;
}) => {
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const { deleteTask } = useBoards();

  //number of completed subtasks
  const completedSubtasks = task.todos?.reduce(
    (acc, subtask) => (subtask.isDone ? acc + 1 : acc),
    0
  );

  if (!task.id) {
    return null;
  }

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided) => (
        <>
          <li
            className={`px-4 py-6 text-black ${
              isUpdated ? "bg-white" : "bg-white/30"
            } rounded-lg cursor-pointer select-none group shadow-main dark:bg-darkGrey dark:text-white`}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            onClick={() => setOpenTaskModal(true)}
          >
            <h4 className="mb-2 heading-md group-hover:text-mainPurple">
              {task.title}
            </h4>
            <p className="body-md text-mediumGrey">
              {completedSubtasks} of {task.todos?.length} subtasks
            </p>
          </li>
          <Modal show={openTaskModal} onClose={() => setOpenTaskModal(false)}>
            <TaskDetailModal
              data={task}
              completedSubtasks={completedSubtasks}
              switchToUpdate={() => {
                setOpenTaskModal(false);
                setUpdateModal(true);
              }}
              switchToDelete={() => {
                setOpenTaskModal(false);
                setDeleteModal(true);
              }}
            />
          </Modal>
          <Modal show={updateModal} onClose={() => {}}>
            <UpdateTaskModal
              task={task}
              close={() => {
                setUpdateModal(false);
                setOpenTaskModal(true);
              }}
            />
          </Modal>
          <Modal
            show={deleteModal}
            onClose={() => setDeleteModal(!deleteModal)}
          >
            <DeleteTaskModal
              title={task.title}
              onClose={() => {
                setDeleteModal(false);
                setOpenTaskModal(true);
              }}
              onConfirm={() => {
                deleteTask?.(task.id);
                setDeleteModal(false);
              }}
            />
          </Modal>
        </>
      )}
    </Draggable>
  );
};
export default Task;
