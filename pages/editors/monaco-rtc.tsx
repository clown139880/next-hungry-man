import { Editor, OnMount } from "@monaco-editor/react";
import supabaseClient from "supabase/client";
import { MonacoBinding } from "lib/yjs/y-monaco";
import SupabaseProvider from "lib/yjs/y-supabase";
import { useRef } from "react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";

export default function Monaco() {
  const editorRef = useRef<any>(null);

  const handelEditorDidMount: OnMount = (editor, monaco) => {
    // var extension = new MonacoMarkdown.MonacoMarkdownExtension();
    // extension.activate(editor);

    editorRef.current = editor;
    const doc = new Y.Doc();
    const provider = new WebrtcProvider("hungryman-41", doc, {
      password: "optional-room-password",
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
