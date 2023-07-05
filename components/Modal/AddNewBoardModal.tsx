import Button from "components/shared/Button";
import TextInput from "components/shared/TextInput";
import { useBoards } from "context";
import { FieldArray, Form, Formik } from "formik";
import * as Yup from "yup";

const AddNewBoardModal = ({ onClose }: { onClose: () => void }) => {
  const { createBoard } = useBoards();

  const validate = Yup.object({
    title: Yup.string().required("Can't be empty"),
    columns: Yup.array().of(Yup.string().required("Can't be empty")),
  });

  return (
    <Formik
      initialValues={{
        title: "",
        jiraId: undefined,
        columns: ["Todo", "Doing", "Deploy", "Testing", "Done"],
      }}
      validationSchema={validate}
      onSubmit={(values) => {
        createBoard?.(values);
        onClose();
      }}
    >
      {(formik) => (
        <div className="w-full p-6 mx-auto bg-white rounded-md dark:bg-darkGrey md:p-8">
          <h1 className="mb-6 heading-lg">Add New Board</h1>
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
                  {formik.values.columns.map((_, i) => (
                    <div key={i} className="flex">
                      <TextInput
                        name={`columns[${i}]`}
                        type="text"
                        placeholder="e.g. Archived"
                        label={null}
                      />
                      <button
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
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => arrayHelpers.push("")}
                    className="w-full p-2 pt-3 mt-3 transition duration-200 rounded-full bg-mainPurple bg-opacity-10 text-mainPurple bold hover:bg-opacity-25 dark:bg-opacity-100 dark:bg-white"
                  >
                    + Add New Column
                  </button>
                </div>
              )}
            />

            <button
              type="submit"
              className="w-full p-2 mt-6 text-base text-white transition duration-200 rounded-full bg-mainPurple hover:bg-mainPurpleHover"
            >
              Save Changes
            </button>
          </Form>
        </div>
      )}
    </Formik>
  );
};
export default AddNewBoardModal;
