import Button from "components/shared/Button";
import { useBoards } from "context";
import { FieldArray, Form, Formik } from "formik";
import * as Yup from "yup";
import TextInput from "components/shared/TextInput";
import { Column } from "context/type";

const UpdateBoardModal = ({ onConfirm }: { onConfirm: () => void }) => {
  const { updateBoard, currentBoard, columnTasksMap } = useBoards();

  const validate = Yup.object({
    title: Yup.string().required("Can't be empty"),
    columns: Yup.array().of(
      Yup.object({
        title: Yup.string().required("Can't be empty"),
      })
    ),
  });

  if (!currentBoard) {
    return null;
  }
  return (
    <Formik
      initialValues={currentBoard}
      validationSchema={validate}
      onSubmit={(values) => {
        updateBoard?.({
          ...values,
        });
        onConfirm();
      }}
    >
      {(formik) => (
        <div className="w-full p-6 mx-auto bg-white rounded-md dark:bg-darkGrey md:p-8">
          <h1 className="mb-6 heading-lg">Update Board</h1>
          <Form>
            <TextInput
              label="Board Name"
              name="title"
              type="text"
              placeholder="e.g. Web Design"
            />
            <TextInput
              label="JiraId"
              name="jiraId"
              type="text"
              placeholder="e.g. NM-842"
            />

            <label className="block mt-6 capitalize body-md text-mediumGrey dark:text-white">
              Board Columns
            </label>

            <FieldArray
              name="columns"
              render={(arrayHelpers) => (
                <div>
                  {formik.values.columns.map((c, i) => (
                    <div key={i} className="flex">
                      <TextInput
                        label={null}
                        name={`columns[${i}].title`}
                        type="text"
                        placeholder="e.g. Archived"
                      />

                      {columnTasksMap.get(c)?.length == 0 && (
                        <Button
                          loading={false}
                          onClick={() => arrayHelpers.remove(i)}
                          className="ml-4 text-mediumGrey hover:text-mainRed"
                        >
                          <svg
                            width="15"
                            height="15"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g fill="currentColor" fillRule="evenodd">
                              <path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z" />
                              <path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z" />
                            </g>
                          </svg>
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    loading={false}
                    onClick={() =>
                      arrayHelpers.push({
                        id: 0,
                        name: "",
                        boardId: currentBoard.id,
                        title: "",
                        createdAt: "",
                        updatedAt: "",
                      } as Column)
                    }
                    className="w-full p-2 pt-3 mt-3 transition duration-200 rounded-full bg-mainPurple bg-opacity-10 text-mainPurple bold hover:bg-opacity-25 dark:bg-opacity-100 dark:bg-white"
                  >
                    + Add New Column
                  </Button>
                  <Button
                    type="submit"
                    className="w-full p-2 mt-6 text-base text-white transition duration-200 rounded-full bg-mainPurple hover:bg-mainPurpleHover"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            />
          </Form>
        </div>
      )}
    </Formik>
  );
};
export default UpdateBoardModal;
