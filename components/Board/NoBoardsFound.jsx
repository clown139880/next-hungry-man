import Modal from "components/Modal";
import AddNewBoardModal from "components/Modal/AddNewBoardModal";
import React from "react";
const NoBoardsFound = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-lightGrey dark:bg-veryDarkGrey">
        <h2 className="text-center heading-lg text-mediumGrey">No Boards Found</h2>
      <button onClick={() => {
        setOpen(true)
      }} className="mt-6 btn btn__primary btn-lg">Create a Board</button>
              <Modal show={open} onClose={() => setOpen(false)}>
            <AddNewBoardModal onClose={() => setOpen(false)} />
        </Modal>
    </div>
  )
}
export default NoBoardsFound
