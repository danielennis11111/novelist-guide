'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Textarea,
  VStack,
  useToast,
  IconButton,
  ButtonGroup,
  Tooltip,
  Progress,
  Text,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  List,
  ListItem,
  HStack,
} from '@chakra-ui/react';
import {
  FiBold,
  FiItalic,
  FiList,
  FiAlignLeft,
  FiAlignCenter,
  FiSave,
  FiUpload,
  FiClock,
  FiAward,
  FiGitBranch,
  FiBook,
  FiCalendar,
} from 'react-icons/fi';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Novel, Chapter } from '@/types/novel';
import { useSession } from 'next-auth/react';
import { getNovelSyncService, NovelSyncService } from '@/lib/novel-sync-service-loader';
import { GamificationService, WritingQuest, WritingStats } from '@/lib/gamification-service';
import { useRouter } from 'next/router';

interface NovelEditorProps {
  novelId?: string;
}

export default function NovelEditor({ novelId }: NovelEditorProps) {
  const { data: session } = useSession();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [writingStats, setWritingStats] = useState<WritingStats | null>(null);
  const [dailyQuests, setDailyQuests] = useState<WritingQuest[]>([]);
  const [versions, setVersions] = useState<{ id: string; name: string; createdAt: Date }[]>([]);
  const toast = useToast();
  const syncServiceRef = useRef<NovelSyncService | null>(null);
  const { isOpen: isVersionsOpen, onOpen: onVersionsOpen, onClose: onVersionsClose } = useDisclosure();
  const { isOpen: isQuestsOpen, onOpen: onQuestsOpen, onClose: onQuestsClose } = useDisclosure();
  const router = useRouter();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your novel...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: novel?.chapters[0]?.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      const text = editor.getText();
      const words = text.trim().split(/\s+/).length;
      setWordCount(words);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (novelId && session?.accessToken) {
      loadNovel();
      syncServiceRef.current = getNovelSyncService(session.accessToken, novelId);
      loadVersions();
      loadWritingStats();
      loadDailyQuests();
    }
  }, [novelId, session]);

  useEffect(() => {
    if (syncServiceRef.current && content && title && description) {
      syncServiceRef.current.startAutoSave(content, title, description, (success) => {
        if (success) {
          toast({
            title: 'Auto-saved',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
        }
      });
    }

    return () => {
      syncServiceRef.current?.stopAutoSave();
    };
  }, [content, title, description]);

  const loadNovel = async () => {
    try {
      const response = await fetch(`/api/novels/${novelId}`);
      const data = await response.json();
      setNovel(data);
      setTitle(data.title);
      setDescription(data.description);
      editor?.commands.setContent(data.chapters[0]?.content || '');
    } catch (error) {
      console.error('Error loading novel:', error);
      toast({
        title: 'Error loading novel',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const loadVersions = async () => {
    if (!syncServiceRef.current) return;
    try {
      const versions = await syncServiceRef.current.getVersions();
      setVersions(versions);
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const loadWritingStats = async () => {
    if (!session?.user?.id || !novelId) return;
    try {
      const stats = await GamificationService.getWritingStats(session.user.id, novelId);
      setWritingStats(stats);
    } catch (error) {
      console.error('Error loading writing stats:', error);
    }
  };

  const loadDailyQuests = async () => {
    if (!session?.user?.id || !novelId) return;
    try {
      const quests = await GamificationService.generateDailyQuests(session.user.id, novelId);
      setDailyQuests(quests);
    } catch (error) {
      console.error('Error loading daily quests:', error);
    }
  };

  const handleSave = async () => {
    if (!editor) return;

    if (!title.trim()) {
      toast({
        title: 'Title is required',
        description: 'Please enter a title for your novel',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    try {
      const content = editor.getHTML();
      const method = novelId ? 'PUT' : 'POST';
      const url = novelId ? `/api/novels/${novelId}` : '/api/novels';

      const requestBody = novelId 
        ? {
            id: novelId,
            title,
            description,
            chapters: [
              {
                id: novel?.chapters[0]?.id || 'new',
                title: 'Chapter 1',
                content,
                order: 1,
                wordCount,
              },
            ],
          }
        : {
            title,
            description,
            chapters: [
              {
                title: 'Chapter 1',
                content,
                order: 1,
                wordCount,
              },
            ],
          };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save novel');
      }

      const savedNovel = await response.json();
      setNovel(savedNovel);

      // Update writing stats
      if (session?.user?.id && novelId) {
        const stats = await GamificationService.updateWritingStats(
          session.user.id,
          novelId,
          wordCount
        );
        setWritingStats(stats);

        // Check quest completion
        for (const quest of dailyQuests) {
          if (quest.type === 'daily' && quest.title === 'Daily Word Goal') {
            await GamificationService.checkQuestCompletion(
              session.user.id,
              novelId,
              quest.id,
              wordCount
            );
          }
        }
        loadDailyQuests();
      }

      toast({
        title: 'Novel saved successfully',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error saving novel:', error);
      toast({
        title: 'Error saving novel',
        description: error instanceof Error ? error.message : 'Failed to save novel',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!syncServiceRef.current) return;
    try {
      const content = await syncServiceRef.current.restoreVersion(versionId);
      editor?.commands.setContent(content);
      onVersionsClose();
      toast({
        title: 'Version restored',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error restoring version:', error);
      toast({
        title: 'Error restoring version',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      editor?.commands.setContent(content);
    };
    reader.readAsText(file);
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Box flex={1}>
            <Input
              id="novel-title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Novel Title"
              size="lg"
              variant="flushed"
              fontSize="2xl"
              mb={2}
            />
            <Textarea
              id="novel-description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of your novel..."
              size="sm"
              resize="none"
              rows={2}
            />
          </Box>
          <ButtonGroup>
            <Tooltip label="View Versions">
              <IconButton
                aria-label="View versions"
                icon={<FiGitBranch />}
                onClick={onVersionsOpen}
              />
            </Tooltip>
            <Tooltip label="View Quests">
              <IconButton
                aria-label="View quests"
                icon={<FiAward />}
                onClick={onQuestsOpen}
              />
            </Tooltip>
            <Tooltip label="Upload existing work">
              <IconButton
                aria-label="Upload file"
                icon={<FiUpload />}
                onClick={() => document.getElementById('file-upload')?.click()}
              />
            </Tooltip>
            <Tooltip label="View world bible">
              <IconButton
                aria-label="View world bible"
                icon={<FiBook />}
                onClick={() => router.push(`/novels/${novel?.id}/world-bible`)}
              />
            </Tooltip>
            <Tooltip label="View calendar">
              <IconButton
                aria-label="View calendar"
                icon={<FiCalendar />}
                onClick={() => router.push(`/novels/${novel?.id}/calendar`)}
              />
            </Tooltip>
            <input
              id="file-upload"
              type="file"
              accept=".txt,.md,.doc,.docx"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <Button
              leftIcon={<FiSave />}
              colorScheme="blue"
              onClick={handleSave}
              isLoading={isSaving}
            >
              Save
            </Button>
          </ButtonGroup>
        </Flex>

        {writingStats && (
          <Box p={4} borderWidth={1} borderRadius="lg">
            <Flex justify="space-between" align="center" mb={2}>
              <Text>Writing Progress</Text>
              <Badge colorScheme="blue">{wordCount} words</Badge>
            </Flex>
            <Progress value={(wordCount / 500) * 100} colorScheme="blue" mb={2} />
            <Flex justify="space-between" align="center">
              <HStack>
                <FiClock />
                <Text>Streak: {writingStats.currentStreak} days</Text>
              </HStack>
              <Text>Points: {writingStats.totalPoints}</Text>
            </Flex>
          </Box>
        )}

        <Box borderWidth={1} borderRadius="lg" p={4}>
          <ButtonGroup spacing={2} mb={4}>
            <IconButton
              aria-label="Bold"
              icon={<FiBold />}
              onClick={() => editor?.chain().focus().toggleBold().run()}
              isActive={editor?.isActive('bold')}
            />
            <IconButton
              aria-label="Italic"
              icon={<FiItalic />}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              isActive={editor?.isActive('italic')}
            />
            <IconButton
              aria-label="List"
              icon={<FiList />}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              isActive={editor?.isActive('bulletList')}
            />
            <IconButton
              aria-label="Align Left"
              icon={<FiAlignLeft />}
              onClick={() => editor?.chain().focus().setTextAlign('left').run()}
              isActive={editor?.isActive({ textAlign: 'left' })}
            />
            <IconButton
              aria-label="Align Center"
              icon={<FiAlignCenter />}
              onClick={() => editor?.chain().focus().setTextAlign('center').run()}
              isActive={editor?.isActive({ textAlign: 'center' })}
            />
          </ButtonGroup>
          <EditorContent editor={editor} />
        </Box>
      </VStack>

      <Modal isOpen={isVersionsOpen} onClose={onVersionsClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Version History</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <List spacing={3}>
              {versions.map((version) => (
                <ListItem
                  key={version.id}
                  p={2}
                  borderWidth={1}
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => handleRestoreVersion(version.id)}
                >
                  <Text fontWeight="bold">{version.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(version.createdAt).toLocaleString()}
                  </Text>
                </ListItem>
              ))}
            </List>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isQuestsOpen} onClose={onQuestsClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Daily Quests</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <List spacing={3}>
              {dailyQuests.map((quest) => (
                <ListItem
                  key={quest.id}
                  p={2}
                  borderWidth={1}
                  borderRadius="md"
                >
                  <Text fontWeight="bold">{quest.title}</Text>
                  <Text fontSize="sm">{quest.description}</Text>
                  <Progress
                    value={(wordCount / quest.target) * 100}
                    colorScheme={quest.completed ? 'green' : 'blue'}
                    mt={2}
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Reward: {quest.reward} points
                  </Text>
                </ListItem>
              ))}
            </List>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
} 