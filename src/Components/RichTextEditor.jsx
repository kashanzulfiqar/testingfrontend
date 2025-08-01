import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { MentionExtension } from './MentionExtension';

const RichTextEditor = ({ content, onChange, teamMembers = [] }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      MentionExtension.configure({
        teamMembers: teamMembers,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          <i className="fa fa-bold"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          <i className="fa fa-italic"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        >
          <i className="fa fa-list-ul"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
        >
          <i className="fa fa-list-ol"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          <i className="fa fa-header"></i>
        </button>
      </div>
      <EditorContent editor={editor} />
      <style jsx="true">{`
        .rich-text-editor {
          border: 1px solid #e0e0e0;
          border-radius: 4px;
        }
        .editor-toolbar {
          border-bottom: 1px solid #e0e0e0;
          padding: 8px;
          display: flex;
          gap: 8px;
        }
        .editor-toolbar button {
          border: none;
          background: none;
          padding: 4px 8px;
          cursor: pointer;
          border-radius: 4px;
        }
        .editor-toolbar button:hover {
          background-color: #f0f0f0;
        }
        .editor-toolbar button.is-active {
          background-color: #e6f7ff;
          color: #1890ff;
        }
        .ProseMirror {
          padding: 12px;
          min-height: 150px;
          outline: none;
        }
        .ProseMirror p {
          margin: 0 0 0.5em 0;
        }
        .mention {
          background-color: #e6f7ff;
          color: #1890ff;
          padding: 2px 4px;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
        }
        .mention:hover {
          background-color: #bae7ff;
        }
        .mention-highlight {
          background-color: #e6f7ff;
          color: #1890ff;
          padding: 2px 4px;
          border-radius: 4px;
          font-weight: 500;
        }
        .mention-suggestions {
          position: absolute;
          z-index: 1000;
        }
        .mention-list {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          max-height: 200px;
          overflow-y: auto;
          min-width: 150px;
        }
        .mention-item {
          padding: 8px 12px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mention-item:hover {
          background-color: #f0f0f0;
        }
        .mention-item:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
