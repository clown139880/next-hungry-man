import { motion } from "framer-motion";
import { useBoards } from "context";
import { useState } from "react";
import { Column, Task, TaskWithTodos, Todo } from "context/type";

const StatusDropdown = ({
  label = "Status",
  data,
  columnId,
  setColumnId,
}: {
  label?: string;
  data?: TaskWithTodos;
  columnId?: Column["id"];
  setColumnId?: (id: Column["id"]) => void;
}) => {
  const { currentBoard, updateTask } = useBoards();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <h3 className="mt-6 mb-2 body-md text-mediumGrey dark:text-white">
        {label}
      </h3>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          type="button"
          className="inline-flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-black bg-white rounded-md shadow-sm outline outline-1 outline-lightGreyLine focus:outline-mainPurple dark:bg-darkGrey dark:text-white dark:outline-darkGreyLine"
          id="menu-button"
          aria-expanded="true"
          aria-haspopup="true"
        >
          {
            currentBoard?.columns.find(
              (c) => c.id == (columnId || data?.columnId)
            )?.title
          }
          <svg
            className="w-5 h-5 ml-2 -mr-1 fill-mainPurple"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <motion.div
          className="absolute right-0 w-full mt-2 origin-top-right bg-white rounded-md shadow-lg focus:outline-none dark:bg-veryDarkGrey"
          variants={{
            closed: {
              opacity: 0,
              y: -10,
              pointerEvents: "none",
            },
            open: {
              opacity: 1,
              y: 0,
              pointerEvents: "auto",
            },
          }}
          initial="closed"
          animate={showMenu ? "open" : "closed"}
        >
          <div className="py-1">
            {currentBoard?.columns.map((column, i) => (
              <a
                onClick={() => {
                  if (columnId) {
                    setColumnId?.(column.id);
                  } else {
                    updateTask?.({
                      ...data!,
                      columnId: column.id,
                    });
                  }
                  setShowMenu(false);
                }}
                key={i}
                href="#"
                className="block px-4 py-2 text-sm text-mediumGrey hover:text-mainPurple hover:bg-mainPurple dark:hover:bg-white hover:bg-opacity-10 dark:hover:bg-opacity-10"
              >
                {column.title}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
};
export default StatusDropdown;
