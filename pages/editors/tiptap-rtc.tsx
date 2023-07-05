import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { BubbleMenu, Editor, EditorContent } from "@tiptap/react";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import StarterKit from "@tiptap/starter-kit";

export default function Monaco() {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (editorRef.current) return;
    const doc = new Y.Doc();
    const provider = new WebrtcProvider("hungryman-42", doc, {
      password: "optional-room-password",
    });
    const editor = new Editor({
      extensions: [
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        StarterKit.configure({
          // The Collaboration extension comes with its own history handling
          history: false,
        }),
        Collaboration.configure({
          document: doc,
        }),
        // Register the collaboration cursor extension
        CollaborationCursor.configure({
          provider: provider,
          user: {
            name: Math.random().toString(36).substring(2, 7),
            color: "#" + Math.floor(Math.random() * 16777215).toString(16),
          },
        }),
      ],
    });
    editorRef.current = editor;

    return () => {
      // editor.destroy();
      // provider.destroy();
      // doc.destroy();
    };
  }, []);
  return (
    <div className="w-screen h-full prose">
      {editorRef.current && (
        <BubbleMenu
          className="flex divide-x divide-gray-400 [&>*]:px-2 text-blue-400 bg-slate-300 rounded-md border"
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
            onClick={() => editorRef.current.chain().focus().toggleBold().run()}
            className={editorRef.current.isActive("bold") ? "is-active" : ""}
          >
            bold
          </button>
          <button
            onClick={() =>
              editorRef.current.chain().focus().toggleItalic().run()
            }
            className={editorRef.current.isActive("italic") ? "is-active" : ""}
          >
            italic
          </button>
          <button
            onClick={() =>
              editorRef.current.chain().focus().toggleStrike().run()
            }
            className={editorRef.current.isActive("strike") ? "is-active" : ""}
          >
            strike
          </button>
        </BubbleMenu>
      )}
      {editorRef.current && (
        <EditorContent className="border" editor={editorRef.current} />
      )}
    </div>
  );
}
