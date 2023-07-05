import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { BubbleMenu, Editor, EditorContent } from "@tiptap/react";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import StarterKit from "@tiptap/starter-kit";
import { useBoards } from "context";

export default function TipTapEditor({
  uniqueId,
  content,
  onUpdate,
}: {
  uniqueId: string;
  content: string;
  onUpdate: (content: string) => Promise<any>;
}) {
  const editorRef = useRef<any>(null);

  const { currentUser } = useBoards();

  useEffect(() => {
    if (editorRef.current) return;
    const doc = new Y.Doc();

    console.log(content);

    Y.applyUpdateV2(doc, Uint8Array.from(content.split(",").map(Number)));

    const provider = new WebrtcProvider(`hungryman-room-${uniqueId}`, doc, {
      password: uniqueId,
    });
    const editor = new Editor({
      // content,
      // onUpdate: ({ editor }) => {
      //   console.log("editor", editor.getText());
      //   onUpdate(editor.getText());
      // },
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
            name: currentUser?.name,
            color: "#" + Math.floor(Math.random() * 16777215).toString(16),
          },
        }),
      ],
    });
    editorRef.current = editor;

    return () => {
      if (editorRef.current) {
        onUpdate(Array.from(Y.encodeStateAsUpdateV2(doc)).toString());
      }
      editorRef.current = null;

      editor.destroy();
      provider.destroy();
      doc.destroy();
    };
  }, [uniqueId]);
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
