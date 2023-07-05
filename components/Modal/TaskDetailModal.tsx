import { useBoards } from "context";
import EditButton from "components/shared/EditButton";
import StatusDropdown from "components/shared/StatusDropdown";
import { TaskWithTodos } from "context/type";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Transformer } from "markmap-lib";
import TaskComments from "components/Task/TaskComments";
// import Editor, { OnMount } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import * as Y from "yjs";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { MonacoBinding } from "lib/yjs/y-monaco";
import SupabaseProvider from "lib/yjs/y-supabase";
import supabaseClient from "supabase/client";
// import MonacoMarkdown from "monaco-markdown";
import { useEditor, EditorContent, Editor, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";

const TaskDetailModal = ({
  data,
  completedSubtasks,
  switchToUpdate,
  switchToDelete,
}: {
  data: TaskWithTodos;
  completedSubtasks: number;
  switchToUpdate: () => void;
  switchToDelete: () => void;
}) => {
  const { updateTodo, currentBoard } = useBoards();

  // const editorRef = useRef<any>(null);

  // useEffect(() => {
  //   const doc = new Y.Doc();
  //   const provider = new SupabaseProvider(doc, supabaseClient, {
  //     channel: "task" + data.id.toString(),
  //     id: data.id,
  //     tableName: "Task",
  //     columnName: "content",
  //   });
  //   const editor = new Editor({
  //     extensions: [
  //       TaskList,
  //       TaskItem.configure({
  //         nested: true,
  //       }),
  //       StarterKit.configure({
  //         // The Collaboration extension comes with its own history handling
  //         history: false,
  //       }),
  //       Collaboration.configure({
  //         document: doc,
  //       }),
  //       // Register the collaboration cursor extension
  //       CollaborationCursor.configure({
  //         provider: provider,
  //         user: {
  //           name: Math.random().toString(36).substring(2, 7),
  //           color: Math.floor(Math.random() * 16777215).toString(16),
  //         },
  //       }),
  //     ],
  //   });
  //   editorRef.current = editor;

  //   return () => {
  //     editor.destroy();
  //     provider.destroy();
  //     doc.destroy();
  //   };
  // }, [data.id]);

  // const handelEditorDidMount: OnMount = (editor, monaco) => {
  //   // var extension = new MonacoMarkdown.MonacoMarkdownExtension();
  //   // extension.activate(editor);

  //   editorRef.current = editor;
  //   const doc = new Y.Doc();
  //   const provider = new SupabaseProvider(doc, supabaseClient, {
  //     channel: "task" + data.id.toString(),
  //     id: data.id,
  //     tableName: "Task",
  //     columnName: "content",
  //   });
  //   const type = doc.getText("monaco");
  //   const monacoBinding = new MonacoBinding(
  //     type,
  //     editor!.getModel(),
  //     new Set([editor]),
  //     provider.awareness,
  //     monaco
  //   );
  // };

  return (
    <div className="w-full min-w-[50vw]  h-[80vh] p-6 mx-auto bg-white rounded-md dark:bg-darkGrey md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="heading-lg">{data.title}</h1>
        <EditButton
          switchToUpdate={switchToUpdate}
          switchToDelete={switchToDelete}
          type="Task"
          onConfirm={() => {}}
          className=""
        />
      </div>
      <div className="flex items-start w-full h-full gap-x-2 ">
        <div className="w-full flex-[2]">
          description
          <ReactMarkdown className="w-full prose border lg:prose-xl body-lg text-mediumGrey dark:text-white">
            {data.content}
          </ReactMarkdown>
          <TaskComments
            taskId={data.id}
            boardTitle={currentBoard?.title!}
            taskTitle={data.title}
          />
        </div>
        {/* <div className="w-full h-[95%]">
          {editorRef.current && (
            <BubbleMenu
              className="flex gap-2"
              editor={editorRef.current}
              tippyOptions={{ duration: 100 }}
            >
              <button
                onClick={() =>
                  editorRef.current.chain().focus().toggleTaskList().run()
                }
                className={
                  editorRef.current.isActive("taskList") ? "is-active" : ""
                }
              >
                toggleTaskList
              </button>
              <button
                onClick={() =>
                  editorRef.current.chain().focus().toggleBold().run()
                }
                className={
                  editorRef.current.isActive("bold") ? "is-active" : ""
                }
              >
                bold
              </button>
              <button
                onClick={() =>
                  editorRef.current.chain().focus().toggleItalic().run()
                }
                className={
                  editorRef.current.isActive("italic") ? "is-active" : ""
                }
              >
                italic
              </button>
              <button
                onClick={() =>
                  editorRef.current.chain().focus().toggleStrike().run()
                }
                className={
                  editorRef.current.isActive("strike") ? "is-active" : ""
                }
              >
                strike
              </button>
            </BubbleMenu>
          )}
          {editorRef.current && (
            <EditorContent className="border" editor={editorRef.current} />
          )}
        </div> */}

        <div className="flex-1">
          <h3 className="mb-4 body-md text-mediumGrey dark:text-white">
            Subtasks ({completedSubtasks} of {data.todos.length})
          </h3>
          {data.todos.map((subtask, i) => (
            <label
              key={i}
              htmlFor={`${subtask}-${i}`}
              className={`body-md p-3 mb-2 inline-flex w-full rounded transition bg-lightGrey cursor-pointer hover:bg-mainPurple hover:bg-opacity-25 dark:text-white dark:bg-veryDarkGrey dark:hover:bg-mainPurple dark:hover:bg-opacity-25`}
            >
              <input
                id={`${subtask}-${i}`}
                type="checkbox"
                checked={subtask.isDone}
                className="mr-3 accent-mainPurple"
                onChange={() =>
                  updateTodo?.({
                    id: subtask.id,
                    isDone: !subtask.isDone,
                  })
                }
              />
              <span
                className={`${
                  subtask.isDone ? "opacity-50 line-through" : "opacity-100"
                } transition`}
              >
                {subtask.content}
              </span>
            </label>
          ))}

          <StatusDropdown label="Current Status" data={data} />
        </div>
      </div>
    </div>
  );
};
export default TaskDetailModal;
