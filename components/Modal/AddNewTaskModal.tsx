import Button from "components/shared/Button";
import { useBoards } from "context";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import { useEffect, useRef, useState } from "react";
import StatusDropdown from "components/shared/StatusDropdown";
import TextInput from "components/shared/TextInput";
import InputArray from "components/shared/InputArray";
import supabaseClient from "supabase/client";
import { v4 as uuidv4 } from "uuid";
import Vditor from "vditor";
import "vditor/dist/index.css";

const AddNewTaskModal = ({ onClose }: { onClose: () => void }) => {
  const { createTask, currentBoard } = useBoards();
  const [columnId, setColumnId] = useState(currentBoard?.columns?.[0].id);

  useEffect(() => {
    if (!columnId && currentBoard?.columns?.length) {
      setColumnId(currentBoard?.columns?.[0].id);
    }
  }, [currentBoard, columnId]);

  const validate = Yup.object({
    title: Yup.string().required("Can't be empty"),
    subtasks: Yup.array().of(
      Yup.object({
        title: Yup.string().required("Can't be empty"),
      })
    ),
  });

  const editorRef = useRef<any>(null);

  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!editorRef.current) {
      const vditor = new Vditor("vditor-new", {
        // outline: {
        //   enable: true,
        //   position: "left",
        // },
        after: () => {
          editorRef.current = vditor;
        },
        minHeight: 400,
        value: description,
        // theme: "dark",
        upload: {
          async handler(files) {
            const file = files?.[0];

            if (file) {
              const key = `${currentBoard!.id}/${uuidv4()}/${file.name}`;
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
        title: "",
        description: "",
        todos: [],
        columnId: columnId!,
      }}
      validationSchema={validate}
      onSubmit={(values) => {
        createTask?.({
          ...values,
          description,
          columnId: columnId!,
        });
        onClose();
      }}
    >
      {(formik) => (
        <div className="w-full min-w-[50vw] p-6 mx-auto bg-white rounded-md dark:bg-darkGrey md:p-8">
          <h1 className="mb-6 heading-lg">Add New Task</h1>

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
                  <div id="vditor-new" className="vditor dark:!text-white" />
                </div>
              </div>
              <div className="flex-1">
                <InputArray label="todos" array={formik.values.todos} />

                <StatusDropdown
                  columnId={columnId ?? 0}
                  setColumnId={setColumnId}
                />

                <button
                  type="submit"
                  className="w-full p-2 mt-6 text-base text-white transition duration-200 rounded-full bg-mainPurple hover:bg-mainPurpleHover"
                >
                  + Add New Task
                </button>
              </div>
            </div>
          </Form>
        </div>
      )}
    </Formik>
  );
};
export default AddNewTaskModal;
