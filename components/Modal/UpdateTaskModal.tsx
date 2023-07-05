import StatusDropdown from "components/shared/StatusDropdown";
import TextInput from "components/shared/TextInput";
import { useBoards } from "context";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useEffect, useRef, useState } from "react";
import InputArray from "components/shared/InputArray";
import { TaskWithTodos } from "context/type";
import supabaseClient from "supabase/client";
import Vditor from "vditor";
import "vditor/dist/index.css";
import { v4 as uuidv4 } from "uuid";

const UpdateTaskModal = ({
  task,
  close,
}: {
  task: TaskWithTodos;
  close: () => void;
}) => {
  const { updateTask } = useBoards();
  const [columnId, setColumnId] = useState(task.columnId);

  const validate = Yup.object({
    title: Yup.string().required("Can't be empty"),
    content: Yup.string().required("Can't be empty"),
    todos: Yup.array().of(
      Yup.object({
        content: Yup.string().required("Can't be empty"),
      })
    ),
  });

  const editorRef = useRef<any>(null);

  const [description, setDescription] = useState(task.content);

  useEffect(() => {
    if (!editorRef.current) {
      const vditor = new Vditor("vditor", {
        // outline: {
        //   enable: true,
        //   position: "left",
        // },
        after: () => {
          editorRef.current = vditor;
        },
        height: 600,
        value: description,
        // theme: "dark",
        upload: {
          async handler(files) {
            const file = files?.[0];

            if (file) {
              const key = `${task!.boardId}/${uuidv4()}/${file.name}`;
              const { data, error } = await supabaseClient.storage
                .from("issues")
                .upload(key, file, {
                  cacheControl: "3600",
                  upsert: false,
                });

              if (error) {
                return error.message;
              } else {
                const url = supabaseClient.storage
                  .from("issues")
                  .getPublicUrl(key).data.publicUrl;

                vditor.insertValue(`![${file.name}](${url})`);

                return "";
              }
            }
            return "";
          },
        },
        input(value) {
          setDescription(value);
        },
      });
    }

    return () => {
      editorRef.current?.destroy();
    };
  }, []);

  return (
    <Formik
      initialValues={{
        ...task,
      }}
      validationSchema={validate}
      onSubmit={(values) => {
        console.log("onsubmit");
        updateTask?.({
          ...values,
          content: description,
          columnId,
        });
        close();
      }}
    >
      {(formik) => (
        <div className="w-full min-w-[75vw] p-6 mx-auto bg-white rounded-md dark:bg-darkGrey md:p-8">
          <h1 className="mb-6 heading-lg">Edit Task</h1>
          <Form>
            <div className="flex items-start justify-between w-full gap-x-3">
              <div className="flex-[2]">
                <TextInput
                  label="Title"
                  name="title"
                  type="text"
                  placeholder="e.g. Take coffee break"
                />
                <div className="mt-6 dark:!text-white">
                  <label
                    className="block mb-3 body-md text-mediumGrey dark:text-white"
                    htmlFor={"description"}
                  >
                    description
                  </label>
                  <div id="vditor" className="vditor dark:!text-white" />
                </div>
              </div>
              <div className="flex-1">
                <InputArray label="todos" array={formik.values.todos} />

                <StatusDropdown columnId={columnId} setColumnId={setColumnId} />

                <button
                  onClick={() => {
                    console.log("submit");
                    updateTask?.({
                      ...formik.values,
                      content: description,
                      columnId,
                    });
                    close();
                  }}
                  type="submit"
                  className="w-full p-2 mt-6 text-base text-white transition duration-200 rounded-full bg-mainPurple hover:bg-mainPurpleHover"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </Form>
        </div>
      )}
    </Formik>
  );
};
export default UpdateTaskModal;
