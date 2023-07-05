import { Editor, OnMount } from "@monaco-editor/react";
import supabaseClient from "supabase/client";
import { MonacoBinding } from "lib/yjs/y-monaco";
import SupabaseProvider from "lib/yjs/y-supabase";
import { useRef } from "react";
import * as Y from "yjs";

export default function Monaco() {
  const editorRef = useRef<any>(null);

  const handelEditorDidMount: OnMount = (editor, monaco) => {
    // var extension = new MonacoMarkdown.MonacoMarkdownExtension();
    // extension.activate(editor);

    editorRef.current = editor;
    const doc = new Y.Doc();
    const provider = new SupabaseProvider(doc, supabaseClient, {
      channel: "test",
      id: 41,
      tableName: "Task",
      columnName: "content",
    });
    const type = doc.getText("monaco");
    const monacoBinding = new MonacoBinding(
      type,
      editor!.getModel(),
      new Set([editor]),
      provider.awareness,
      monaco
    );
  };
  return (
    <div>
      <Editor height={"100vh"} theme="vs-dark" onMount={handelEditorDidMount} />
    </div>
  );
}
