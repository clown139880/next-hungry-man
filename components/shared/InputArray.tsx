import { FieldArray } from "formik";
import Button from "./Button";
import TextInput from "./TextInput";
import { Todo } from "context/type";

const InputArray = ({
  label,
  array,
  ...props
}: {
  label: string;
  array: Todo[];
  props?: any;
}) => {
  return (
    <>
      <label className="block capitalize body-md text-mediumGrey dark:text-white">
        {label}
      </label>

      <FieldArray
        name={label}
        render={(arrayHelpers) => (
          <div>
            {array.map((_, i) => (
              <div key={i} className="flex">
                <TextInput
                  label={undefined}
                  name={`${label}[${i}].content`}
                  type="text"
                  placeholder="e.g. Take a break"
                />
                <Button
                  loading={undefined}
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
              </div>
            ))}
            <Button
              loading={undefined}
              type="button"
              onClick={() => arrayHelpers.push({ content: "" })}
              className="w-full p-2 pt-3 mt-3 transition duration-200 rounded-full bg-mainPurple bg-opacity-10 text-mainPurple bold hover:bg-opacity-25 dark:bg-opacity-100 dark:bg-white"
            >
              + Add New Subtask
            </Button>
          </div>
        )}
      />
    </>
  );
};
export default InputArray;
