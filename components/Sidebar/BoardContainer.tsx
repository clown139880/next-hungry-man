import { useBoards } from "context";
import AddNewBoard from "./AddNewBoard";
import { User } from "types";
import { AvatarGroup, Avatar } from "@chakra-ui/react";

const BoardContainer = ({
  users,
}: {
  users: {
    [key: string]: User;
  };
}) => {
  const { boards, currentBoard, setActiveBoard } = useBoards();

  return (
    <div className="flex-1 w-full">
      <h3 className="ml-6 uppercase heading-sm">
        All boards ({boards?.length})
      </h3>
      <div className="mt-8">
        {boards?.map((board, i) => (
          <div
            key={i}
            className={`group text-mediumGrey cursor-pointer flex space-x-3 items-center pl-6 w-11/12 transition duration-500 bg-opacity-0 bg-mainPurple dark:hover:bg-white rounded-r-full hover:bg-opacity-10 hover:text-mainPurple ${
              currentBoard?.id === boards[i]?.id && "active-board"
            }`}
            onClick={() => setActiveBoard?.(i)}
          >
            <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 2.889A2.889 2.889 0 0 1 2.889 0H13.11A2.889 2.889 0 0 1 16 2.889V13.11A2.888 2.888 0 0 1 13.111 16H2.89A2.889 2.889 0 0 1 0 13.111V2.89Zm1.333 5.555v4.667c0 .859.697 1.556 1.556 1.556h6.889V8.444H1.333Zm8.445-1.333V1.333h-6.89A1.556 1.556 0 0 0 1.334 2.89V7.11h8.445Zm4.889-1.333H11.11v4.444h3.556V5.778Zm0 5.778H11.11v3.11h2a1.556 1.556 0 0 0 1.556-1.555v-1.555Zm0-7.112V2.89a1.555 1.555 0 0 0-1.556-1.556h-2v3.111h3.556Z"
                fill="currentColor"
              />
            </svg>
            <h3
              key={i}
              className={`heading-m  font-bold text-mediumGrey py-3 group-hover:text-mainPurple ${
                currentBoard?.id === boards[i]?.id && "active-board"
              }`}
            >
              {board.title}
            </h3>
            <AvatarGroup size="sm" max={2}>
              {Object.entries(users)
                .filter(([userId, u]) => u.roomId == board.id.toString())
                .map(([userId]) => (
                  <Avatar key={userId} name={userId} />
                ))}
            </AvatarGroup>
          </div>
        ))}
        <AddNewBoard />
      </div>
    </div>
  );
};
export default BoardContainer;
