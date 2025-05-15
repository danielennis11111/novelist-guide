'use client';

import {
  Box,
  Heading,
  HStack,
  Tag,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Select,
  useToast,
  Text,
} from '@chakra-ui/react';
import { FiEdit2, FiSave } from 'react-icons/fi';
import { useState } from 'react';
import { Novel } from '@/types/novel';

interface NovelHeaderProps {
  novel: Novel;
}

export default function NovelHeader({ novel }: NovelHeaderProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [editedNovel, setEditedNovel] = useState(novel);
  const toast = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/novels/${novel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedNovel),
      });

      if (!response.ok) {
        throw new Error('Failed to update novel');
      }

      toast({
        title: 'Novel Updated',
        description: 'Your changes have been saved.',
        status: 'success',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save changes',
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGenre = (genre: string) => {
    if (genre && !editedNovel.genre.includes(genre)) {
      setEditedNovel({
        ...editedNovel,
        genre: [...editedNovel.genre, genre],
      });
    }
  };

  const handleRemoveGenre = (genre: string) => {
    setEditedNovel({
      ...editedNovel,
      genre: editedNovel.genre.filter((g) => g !== genre),
    });
  };

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <VStack align="start" spacing={2}>
          <Heading size="lg">{novel.title}</Heading>
          <HStack wrap="wrap" spacing={2}>
            {novel.genre.map((genre) => (
              <Tag key={genre} size="sm" colorScheme="blue">
                {genre}
              </Tag>
            ))}
            <Tag size="sm" colorScheme="green">
              {novel.status}
            </Tag>
          </HStack>
          <Text color="gray.500" fontSize="sm">
            Target Audience: {novel.targetAudience}
          </Text>
        </VStack>
        <IconButton
          aria-label="Edit Novel"
          icon={<FiEdit2 />}
          onClick={onOpen}
        />
      </HStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Novel Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  value={editedNovel.title}
                  onChange={(e) =>
                    setEditedNovel({ ...editedNovel, title: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  value={editedNovel.description}
                  onChange={(e) =>
                    setEditedNovel({
                      ...editedNovel,
                      description: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={editedNovel.status}
                  onChange={(e) =>
                    setEditedNovel({
                      ...editedNovel,
                      status: e.target.value as Novel['status'],
                    })
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="in_progress">In Progress</option>
                  <option value="revision">Revision</option>
                  <option value="complete">Complete</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Target Audience</FormLabel>
                <Select
                  value={editedNovel.targetAudience}
                  onChange={(e) =>
                    setEditedNovel({
                      ...editedNovel,
                      targetAudience: e.target.value,
                    })
                  }
                >
                  <option value="children">Children</option>
                  <option value="middle-grade">Middle Grade</option>
                  <option value="young-adult">Young Adult</option>
                  <option value="adult">Adult</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Genres</FormLabel>
                <HStack mb={2}>
                  <Select
                    placeholder="Add genre"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddGenre(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="fantasy">Fantasy</option>
                    <option value="science-fiction">Science Fiction</option>
                    <option value="mystery">Mystery</option>
                    <option value="romance">Romance</option>
                    <option value="thriller">Thriller</option>
                    <option value="horror">Horror</option>
                    <option value="literary">Literary Fiction</option>
                    <option value="historical">Historical Fiction</option>
                  </Select>
                </HStack>
                <HStack wrap="wrap" spacing={2}>
                  {editedNovel.genre.map((genre) => (
                    <Tag
                      key={genre}
                      size="sm"
                      variant="solid"
                      colorScheme="blue"
                    >
                      {genre}
                      <IconButton
                        aria-label="Remove genre"
                        icon={<FiEdit2 />}
                        size="xs"
                        ml={1}
                        onClick={() => handleRemoveGenre(genre)}
                      />
                    </Tag>
                  ))}
                </HStack>
              </FormControl>

              <Button
                colorScheme="blue"
                onClick={handleSave}
                isLoading={isLoading}
                leftIcon={<FiSave />}
                width="full"
              >
                Save Changes
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
} 