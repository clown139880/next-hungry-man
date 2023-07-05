import { Form, Formik } from "formik";
import * as Yup from "yup";
import Button from "components/shared/Button";
import TextInput from "components/shared/TextInput";
import { useBoards } from "context";

const AddNewColumnModal = ({ onClose }: { onClose: () => void }) => {
  const { login } = useBoards();

  const validate = Yup.object({
    name: Yup.string().required("Can't be empty"),
  });

  return (
    <Formik
      initialValues={{
        name: "",
      }}
      validationSchema={validate}
      onSubmit={(values) => {
        login?.(values);
        onClose();
      }}
    >
      {(formik) => (
        <div className="w-full p-6 mx-auto bg-white rounded-md dark:bg-darkGrey md:p-8">
          <h1 className="mb-6 heading-lg">Login</h1>
          <Form>
            <TextInput
              label="Name"
              name="name"
              type="text"
              placeholder="e.g. Joker"
            />
          </Form>
        </div>
      )}
    </Formik>
  );
};
export default AddNewColumnModal;
