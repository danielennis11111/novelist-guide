'use client';

import {
  Box,
  Button,
  Container,
  Grid,
  Heading,
  Text,
  VStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Novel } from '@/world-bible/types';
import NovelEditor from '@/components/NovelEditor';

export default function NovelsPage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovelId, setSelectedNovelId] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    loadNovels();
  }, []);

  const loadNovels = async () => {
    try {
      const response = await fetch('/api/novels');
      const data = await response.json();
      setNovels(data);
    } catch (error) {
      console.error('Error loading novels:', error);
    }
  };

  const handleCreateNew = () => {
    setSelectedNovelId(null);
    onOpen();
  };

  const handleEditNovel = (novelId: string) => {
    setSelectedNovelId(novelId);
    onOpen();
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={4}>My Novels</Heading>
          <Button colorScheme="blue" onClick={handleCreateNew}>
            Create New Novel
          </Button>
        </Box>

        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {novels.map((novel) => (
            <Box
              key={novel.id}
              p={6}
              borderWidth={1}
              borderRadius="lg"
              cursor="pointer"
              onClick={() => handleEditNovel(novel.id)}
              _hover={{ shadow: 'md' }}
            >
              <Heading size="md" mb={2}>
                {novel.title}
              </Heading>
              <Text noOfLines={3}>{novel.description}</Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                Last updated: {new Date(novel.updatedAt).toLocaleDateString()}
              </Text>
            </Box>
          ))}
        </Grid>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedNovelId ? 'Edit Novel' : 'Create New Novel'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <NovelEditor novelId={selectedNovelId || undefined} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
} 