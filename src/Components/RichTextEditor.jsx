import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { MentionExtension } from './MentionExtension';
import './RichTextEditor.css';

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

  const handleBulletList = () => {
    try {
      console.log('Toggling bullet list...');
      const result = editor.chain().focus().toggleBulletList().run();
      console.log('Bullet list toggle result:', result);
      console.log('Editor HTML after toggle:', editor.getHTML());
    } catch (error) {
      console.error('Error toggling bullet list:', error);
    }
  };

  const handleOrderedList = () => {
    try {
      console.log('Toggling ordered list...');
      const result = editor.chain().focus().toggleOrderedList().run();
      console.log('Ordered list toggle result:', result);
      console.log('Editor HTML after toggle:', editor.getHTML());
    } catch (error) {
      console.error('Error toggling ordered list:', error);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="Bold"
        >
          <i className="fa fa-bold"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="Italic"
        >
          <i className="fa fa-italic"></i>
        </button>
        <button
          onClick={handleBulletList}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="Bullet List"
        >
          <i className="fa fa-list-ul"></i>
        </button>
        <button
          onClick={handleOrderedList}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="Numbered List"
        >
          <i className="fa fa-list-ol"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          title="Heading"
        >
          <i className="fa fa-header"></i>
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
