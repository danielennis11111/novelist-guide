'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import {
  Box,
  ButtonGroup,
  IconButton,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiBold,
  FiItalic,
  FiList,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiType,
} from 'react-icons/fi';
import { useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Highlight,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      debouncedOnChange(html);
    },
  });

  const debouncedOnChange = useCallback(
    debounce((html: string) => {
      onChange(html);
    }, 1000),
    [onChange]
  );

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (!editor) {
    return null;
  }

  return (
    <Box border="1px" borderColor={borderColor} borderRadius="md" bg={bgColor}>
      <ButtonGroup spacing={1} p={2} borderBottom="1px" borderColor={borderColor}>
        <Tooltip label="Bold">
          <IconButton
            aria-label="Bold"
            icon={<FiBold />}
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
        <Tooltip label="Italic">
          <IconButton
            aria-label="Italic"
            icon={<FiItalic />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
        <Tooltip label="Bullet List">
          <IconButton
            aria-label="Bullet List"
            icon={<FiList />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
        <Tooltip label="Heading">
          <IconButton
            aria-label="Heading"
            icon={<FiType />}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading')}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
        <Tooltip label="Align Left">
          <IconButton
            aria-label="Align Left"
            icon={<FiAlignLeft />}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
        <Tooltip label="Align Center">
          <IconButton
            aria-label="Align Center"
            icon={<FiAlignCenter />}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
        <Tooltip label="Align Right">
          <IconButton
            aria-label="Align Right"
            icon={<FiAlignRight />}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
      </ButtonGroup>
      <Box p={4}>
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
} 