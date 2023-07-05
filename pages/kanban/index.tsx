import { Badge } from "@chakra-ui/react";
import Board from "components/Board";
import Cursor from "components/Cursor";
import Header from "components/Header";
import Modal from "components/Modal";
import LoginModal from "components/Modal/LoginModal";
import Sidebar from "components/Sidebar";
import { useBoards } from "context";
import { getRandomColor } from "lib/RandomColor";
import useMultiPlayer from "lib/hooks/useMultiPlayer";
import { ReactElement, useEffect, useState } from "react";

export default function Home() {
  const localColorBackup = getRandomColor();
  const { currentBoard, currentUser } = useBoards();

  const { isTyping, isCancelled, mousePosition, latency, users } =
    useMultiPlayer(currentBoard?.id?.toString(), currentUser?.name?.toString());
  const [showSidebar, setShowSidebar] = useState(true);

  const [loginModal, setLoginModal] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setLoginModal(true);
    } else {
      setLoginModal(false);
    }
  }, [currentUser]);

  return (
    <div className="h-screen">
      <Header />
      <div className="flex board-height">
        <Sidebar
          users={users}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />
        <Board />
      </div>
      <Badge>Latency: {latency.toFixed(1)}ms</Badge>

      <Modal show={loginModal} onClose={() => setLoginModal(!loginModal)}>
        <LoginModal onClose={() => setLoginModal(!loginModal)} />
      </Modal>

      {Object.entries(users).reduce((acc, [userId, data]) => {
        const { x, y, color, message, isTyping, hue } = data;
        if (x && y) {
          acc.push(
            <Cursor
              key={userId}
              name={userId}
              x={x}
              y={y}
              color={"red"}
              hue={hue}
              message={message || ""}
              isTyping={isTyping || false}
            />
          );
        }
        return acc;
      }, [] as ReactElement[])}

      {/* Cursor for local client: Shouldn't show the cursor itself, only the text bubble */}
      {currentUser &&
        Number.isInteger(mousePosition?.x) &&
        Number.isInteger(mousePosition?.y) && (
          <Cursor
            name=""
            isLocalClient
            x={mousePosition?.x}
            y={mousePosition?.y}
            color={users[currentUser?.id]?.color ?? localColorBackup.bg}
            hue={users[currentUser?.id]?.hue ?? localColorBackup.hue}
            isTyping={isTyping}
            isCancelled={isCancelled}
            message=""
            // message={message}
            // onUpdateMessage={setMessage}
          />
        )}
    </div>
  );
}
