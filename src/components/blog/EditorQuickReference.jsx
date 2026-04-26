'use client';

import { useState } from 'react';
import { FaTimes, FaChevronDown } from 'react-icons/fa';

export default function EditorQuickReference() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: 'Ctrl+B', action: 'Bold' },
    { key: 'Ctrl+I', action: 'Italic' },
    { key: 'Ctrl+U', action: 'Underline' },
  ];

  const tools = [
    { name: 'Text Color', description: 'Change text color from 12 presets' },
    { name: 'Highlight', description: 'Add background color to text' },
    { name: 'Headings', description: 'Use H1, H2, H3 for structure' },
    { name: 'Lists', description: 'Create bullet or numbered lists' },
    { name: 'Alignment', description: 'Align text left, center, right, or justify' },
    { name: 'Images', description: 'Upload or add images by URL' },
    { name: 'Links', description: 'Create hyperlinks to URLs' },
    { name: 'Tables', description: 'Insert and edit data tables' },
    { name: 'Code', description: 'Add syntax-highlighted code blocks' },
    { name: 'Quote', description: 'Create blockquotes' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-3 shadow-lg transition-all hover:scale-110 z-50"
        title="Editor Quick Reference"
      >
        <span className="text-lg">?</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md max-h-96 overflow-y-auto z-50">
      <div className="sticky top-0 bg-teal-600 text-white p-4 flex items-center justify-between">
        <h3 className="font-semibold">Editor Quick Reference</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-teal-700 rounded transition-colors"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Shortcuts */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">⌨️ Keyboard Shortcuts</h4>
          <div className="space-y-1">
            {shortcuts.map((shortcut, idx) => (
              <div key={idx} className="flex justify-between text-xs p-2 bg-gray-50 rounded border border-gray-200">
                <span className="font-mono bg-gray-200 px-2 py-1 rounded">{shortcut.key}</span>
                <span className="text-gray-700">{shortcut.action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">🛠️ Available Tools</h4>
          <div className="grid grid-cols-2 gap-2">
            {tools.map((tool, idx) => (
              <div key={idx} className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                <p className="font-semibold text-blue-900">{tool.name}</p>
                <p className="text-blue-700 text-xs mt-1">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded p-3">
          <h4 className="font-semibold text-amber-900 mb-2 text-sm">💡 Pro Tips</h4>
          <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
            <li>Use Headings (H1, H2, H3) for proper content structure</li>
            <li>Highlight important text with colors for emphasis</li>
            <li>Add images inline for better visual flow</li>
            <li>Use tables to compare data or products</li>
            <li>Code blocks support syntax highlighting</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
