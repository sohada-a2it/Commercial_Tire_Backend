'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Link } from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import { useState, useEffect } from 'react';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaHeading,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaLink as FaLinkIcon,
  FaImage as FaImageIcon,
  FaUndo,
  FaRedo,
  FaPalette,
  FaHighlighter,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaCode,
  FaTable as FaTableIcon,
  FaTimes,
} from 'react-icons/fa';

// Initialize lowlight with common languages
const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('css', css);
lowlight.register('html', xml);

// Custom Image Extension with Resize Support
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      align: {
        default: 'center',
        parseHTML: element => {
          const align = element.getAttribute('data-align');
          return align || 'center';
        },
        renderHTML: attributes => {
          return {
            'data-align': attributes.align,
            style: `display: block; margin: 0 auto;`,
          };
        },
      },
    };
  },
});

// Image Resize Menu Component
const ImageResizeMenu = ({ editor }) => {
  const [selectedSize, setSelectedSize] = useState('medium');

  if (!editor) return null;
  if (!editor.isActive('image')) return null;

  const getCurrentImageSize = () => {
    const { state } = editor;
    const { selection } = state;
    const node = selection.node;
    
    if (node && node.type.name === 'image') {
      const width = node.attrs.width || 'auto';
      if (width === '100%' || width === '800px') setSelectedSize('full');
      else if (width === '50%' || width === '400px') setSelectedSize('medium');
      else if (width === '30%' || width === '250px') setSelectedSize('small');
      else setSelectedSize('custom');
    }
  };

  const resizeImage = (width) => {
    const node = editor.state.selection.node;
    if (!node || node.type.name !== 'image') return;
    
    editor.chain().focus().setImage({
      src: node.attrs.src,
      alt: node.attrs.alt,
      width: width,
    }).run();
    getCurrentImageSize();
  };

  const presetSizes = [
    { name: 'Small', width: '30%', label: 'S' },
    { name: 'Medium', width: '50%', label: 'M' },
    { name: 'Large', width: '70%', label: 'L' },
    { name: 'Full', width: '100%', label: 'F' },
  ];

  return (
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-2 z-50">
      {presetSizes.map((size) => (
        <button
          key={size.name}
          type="button"
          onClick={() => resizeImage(size.width)}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            selectedSize === size.name.toLowerCase()
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={`${size.name}`}
        >
          {size.label}
        </button>
      ))}
      <div className="w-px h-6 bg-gray-200 mx-1" />
      <button
        type="button"
        onClick={() => resizeImage('auto')}
        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded transition"
        title="Auto Size"
      >
        Auto
      </button>
    </div>
  );
};

// MenuBar as a separate component with proper hook ordering
const MenuBar = ({ editor }) => {
  // ✅ All hooks at the top level - before any conditional returns
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageResizeMenu, setShowImageResizeMenu] = useState(false);
  const [imagePosition, setImagePosition] = useState({ top: 0, left: 0 });

  // ✅ useEffect at top level
  useEffect(() => {
    if (!editor) return;
    
    const handleSelectionUpdate = () => {
      try {
        if (editor.isActive('image')) {
          const { state } = editor;
          const { selection } = state;
          const node = selection.node;
          
          if (node && node.type.name === 'image') {
            const view = editor.view;
            const domPos = view.nodeDOM(selection.from);
            if (domPos && domPos.getBoundingClientRect) {
              const rect = domPos.getBoundingClientRect();
              setImagePosition({
                top: rect.top - 50,
                left: rect.left + (rect.width / 2),
              });
              setShowImageResizeMenu(true);
            }
          } else {
            setShowImageResizeMenu(false);
          }
        } else {
          setShowImageResizeMenu(false);
        }
      } catch (error) {
        console.error('Error in selection update:', error);
        setShowImageResizeMenu(false);
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor]);

  // Function definitions
  const addLink = () => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkModal(false);
    }
  };

  const addImage = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageModal(false);
    }
  };

  const addImageFromFile = (e) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = (event) => {
        editor.chain().focus().setImage({ src: event.target?.result }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const insertTable = () => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  };

  const textColors = [
    '#000000', '#FFFFFF', '#EF4444', '#F97316', '#EAB308', '#22C55E',
    '#06B6D4', '#0EA5E9', '#6366F1', '#A855F7', '#EC4899', '#8B5CF6'
  ];

  const highlightColors = [
    '#FEF08A', '#FED7AA', '#FECACA', '#D1FAE5', '#CFFAFE', '#DDD6FE', '#F3E8FF'
  ];

  // ✅ Conditional return AFTER all hooks
  if (!editor) {
    return (
      <div className="border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg">
        <div className="text-gray-400 text-sm">Loading editor...</div>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg space-y-2">
        {/* First Row - Text Formatting */}
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('bold') ? 'bg-teal-200' : ''}`}
            title="Bold (Ctrl+B)"
          >
            <FaBold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('italic') ? 'bg-teal-200' : ''}`}
            title="Italic (Ctrl+I)"
          >
            <FaItalic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('underline') ? 'bg-teal-200' : ''}`}
            title="Underline"
          >
            <FaUnderline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('strike') ? 'bg-teal-200' : ''}`}
            title="Strikethrough"
          >
            <FaStrikethrough className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Text Color */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded hover:bg-gray-200 transition flex items-center gap-1"
              title="Text Color"
            >
              <FaPalette className="w-4 h-4" />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg p-2 shadow-lg z-10 grid grid-cols-6 gap-1">
                {textColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setColor(color).run();
                      setShowColorPicker(false);
                    }}
                    className="w-6 h-6 rounded border border-gray-300 hover:border-gray-400"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Highlight Color */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHighlightPicker(!showHighlightPicker)}
              className="p-2 rounded hover:bg-gray-200 transition flex items-center gap-1"
              title="Text Background"
            >
              <FaHighlighter className="w-4 h-4" />
            </button>
            {showHighlightPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg p-2 shadow-lg z-10 grid grid-cols-7 gap-1">
                {highlightColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().toggleHighlight({ color }).run();
                      setShowHighlightPicker(false);
                    }}
                    className="w-6 h-6 rounded border border-gray-300 hover:border-gray-400"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-200 transition flex items-center gap-1 ${editor.isActive('heading', { level: 1 }) ? 'bg-teal-200' : ''}`}
            title="Heading 1"
          >
            <FaHeading className="w-4 h-4" />
            <span className="text-xs font-bold">1</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-200 transition flex items-center gap-1 ${editor.isActive('heading', { level: 2 }) ? 'bg-teal-200' : ''}`}
            title="Heading 2"
          >
            <FaHeading className="w-4 h-4" />
            <span className="text-xs font-bold">2</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-200 transition flex items-center gap-1 ${editor.isActive('heading', { level: 3 }) ? 'bg-teal-200' : ''}`}
            title="Heading 3"
          >
            <FaHeading className="w-4 h-4" />
            <span className="text-xs font-bold">3</span>
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('bulletList') ? 'bg-teal-200' : ''}`}
            title="Bullet List"
          >
            <FaListUl className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('orderedList') ? 'bg-teal-200' : ''}`}
            title="Numbered List"
          >
            <FaListOl className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Text Alignment */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive({ textAlign: 'left' }) ? 'bg-teal-200' : ''}`}
            title="Align Left"
          >
            <FaAlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive({ textAlign: 'center' }) ? 'bg-teal-200' : ''}`}
            title="Align Center"
          >
            <FaAlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive({ textAlign: 'right' }) ? 'bg-teal-200' : ''}`}
            title="Align Right"
          >
            <FaAlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive({ textAlign: 'justify' }) ? 'bg-teal-200' : ''}`}
            title="Justify"
          >
            <FaAlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Second Row - Media & Special */}
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('blockquote') ? 'bg-teal-200' : ''}`}
            title="Quote"
          >
            <FaQuoteLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('codeBlock') ? 'bg-teal-200' : ''}`}
            title="Code Block"
          >
            <FaCode className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Image Upload */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={addImageFromFile}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="p-2 rounded hover:bg-gray-200 transition cursor-pointer flex items-center gap-1"
              title="Upload Image"
            >
              <FaImageIcon className="w-4 h-4" />
              <span className="text-xs">Upload</span>
            </label>
          </div> 

          {/* Link */}
          <button
            type="button"
            onClick={() => setShowLinkModal(true)}
            className={`p-2 rounded hover:bg-gray-200 transition flex items-center gap-1 ${editor.isActive('link') ? 'bg-teal-200' : ''}`}
            title="Add Link"
          >
            <FaLinkIcon className="w-4 h-4" />
          </button> 

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Undo/Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-gray-200 transition disabled:opacity-50"
            title="Undo (Ctrl+Z)"
          >
            <FaUndo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-gray-200 transition disabled:opacity-50"
            title="Redo (Ctrl+Y)"
          >
            <FaRedo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image Resize Menu */}
      {showImageResizeMenu && editor && (
        <div 
          className="fixed z-50"
          style={{ top: imagePosition.top, left: imagePosition.left }}
        >
          <ImageResizeMenu editor={editor} />
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
              onKeyPress={(e) => e.key === 'Enter' && addLink()}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addLink}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image URL Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Image URL</h3>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
              onKeyPress={(e) => e.key === 'Enter' && addImage()}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                Add Image
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Main RichTextEditor Component
export default function RichTextEditor({ value, onChange, placeholder = "Write your blog content here..." }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'text-blue-600 hover:underline underline',
        },
      }),
      ResizableImage.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full rounded-lg shadow-md my-2 cursor-pointer',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4 cursor-text',
      },
    },
    immediatelyRender: false,
  });

  // Focus the editor when component mounts
  useEffect(() => {
    if (editor) {
      editor.commands.focus();
    }
  }, [editor]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      
      <div className="text-xs text-gray-400 text-center py-2 border-t border-gray-100 bg-gray-50">
        💡 Tip: Click on any image to resize it using the floating menu
      </div>
    </div>
  );
}