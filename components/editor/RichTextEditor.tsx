"use client";

import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import HardBreak from "@tiptap/extension-hard-break";


export default function RichTextEditor({
  valueHtml,
  onChangeHtml,
}: {
  valueHtml: string;
  onChangeHtml: (html: string) => void;
}) {
  const editor = useEditor({
    // ✅ Fix for Next.js hydration: tell TipTap not to render immediately during SSR/prerender
    immediatelyRender: false,

    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      HardBreak.extend({
        addKeyboardShortcuts() {
          return {
            "Shift-Enter": () => this.editor.commands.setHardBreak(),
          };
        },
      }).configure({
        keepMarks: true,
      }),   
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],

    content: valueHtml || "",

    onUpdate: ({ editor }) => {
      onChangeHtml(editor.getHTML());
    },

    editorProps: {
      attributes: {
        class:
          "min-h-[180px] w-full rounded-b-xl border border-t-0 bg-white p-3 text-sm leading-6 outline-none",
      },
      handleKeyDown(view, event) {
        // Optional fallback: Enter always creates paragraph,
        // Shift+Enter creates visible line break
        if (event.key === "Enter" && event.shiftKey) {
          event.preventDefault();
          return view.dispatch(view.state.tr.insertText("\n"));
        }
        return false;
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-2 rounded-t-xl border-b bg-slate-50 p-2">
        <Btn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          B
        </Btn>
        <Btn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          I
        </Btn>
        <Btn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          U
        </Btn>

        <div className="mx-1 h-5 w-px bg-slate-200" />

        <Btn active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </Btn>
        <Btn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </Btn>
        <Btn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </Btn>

        <div className="mx-1 h-5 w-px bg-slate-200" />

        <Btn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </Btn>
        <Btn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </Btn>
        <Btn onClick={() => editor.chain().focus().sinkListItem("listItem").run()}>Indent</Btn>
        <Btn onClick={() => editor.chain().focus().liftListItem("listItem").run()}>Outdent</Btn>

        <div className="mx-1 h-5 w-px bg-slate-200" />

        <label className="flex items-center gap-2 rounded border bg-white px-2 py-1 text-xs">
          Color
          <input
            type="color"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            value={editor.getAttributes("textStyle")?.color ?? "#111827"}
          />
        </label>

        <Btn
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight({ color: "#FDE68A" }).run()}
        >
          Highlight
        </Btn>

        <div className="mx-1 h-5 w-px bg-slate-200" />

        <Btn onClick={() => editor.chain().focus().undo().run()}>Undo</Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()}>Redo</Btn>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

function Btn({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded border px-2 py-1 text-xs",
        active ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
