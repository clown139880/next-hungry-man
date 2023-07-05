import { useBoards } from "context"

const DeleteBoardModal = ({onConfirm, onClose}) => {
    const {currentBoard } = useBoards();
  return (
    <div className="w-full p-6 mx-auto space-y-6 bg-white rounded-md dark:bg-darkGrey md:p-8">
        <h1 className="text-mainRed heading-lg">Delete this board?</h1>
        <p className="body-lg">Are you sure you want to delete the &apos;{currentBoard?.name}&apos; board? This action will remove all columns and tasks and cannot be reversed.</p>
        <div className="flex gap-4">

            <button className="flex-1 p-2 text-base text-white transition duration-200 rounded-full bg-mainRed hover:bg-mainRedHover" onClick={() => {
                onConfirm()
                onClose()
            }}>
                Delete
            </button>
            <button className="flex-1 p-2 text-base transition duration-200 rounded-full bg-mainPurple bg-opacity-10 text-mainPurple hover:bg-opacity-25 dark:bg-opacity-100 dark:bg-white" onClick={onClose}>
                Cancel
            </button>
        </div>
    </div>
  )
}
export default DeleteBoardModal
