import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  List,
  ListItem,
  HStack,
  IconButton,
  Tooltip,
  Badge,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { WorldBibleService } from '@/lib/world-bible-service';
import { Novel } from '@/types/novel';
import WorldElementForm from './WorldElementForm';

interface WorldBibleElementsProps {
  novel: Novel;
}

interface WorldElement {
  id: string;
  type: 'location' | 'item' | 'concept' | 'event';
  name: string;
  description: string;
  connections: {
    elementId: string;
    relationship: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export default function WorldBibleElements({ novel }: WorldBibleElementsProps) {
  const [elements, setElements] = useState<WorldElement[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedElement, setSelectedElement] = useState<WorldElement | null>(null);
  const [activeTab, setActiveTab] = useState<'character' | 'location' | 'item' | 'concept'>('character');

  useEffect(() => {
    loadElements();
  }, [novel.id]);

  const loadElements = async () => {
    try {
      const worldElements = await WorldBibleService.getWorldElements(novel.id);
      setElements(worldElements);
    } catch (error) {
      console.error('Error loading world elements:', error);
    }
  };

  const handleCreateElement = async (element: Omit<WorldElement, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newElement = await WorldBibleService.createWorldElement(novel.id, element);
      setElements([...elements, newElement]);
      onClose();
    } catch (error) {
      console.error('Error creating world element:', error);
    }
  };

  const handleUpdateElement = async (element: Omit<WorldElement, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedElement) return;
    try {
      const updatedElement = await WorldBibleService.updateWorldElement({
        ...element,
        id: selectedElement.id,
      });
      setElements(elements.map(e => e.id === selectedElement.id ? updatedElement : e));
      onClose();
    } catch (error) {
      console.error('Error updating world element:', error);
    }
  };

  const handleDeleteElement = async (elementId: string) => {
    try {
      await WorldBibleService.deleteWorldElement(elementId);
      setElements(elements.filter(e => e.id !== elementId));
    } catch (error) {
      console.error('Error deleting world element:', error);
    }
  };

  const getElementTypeColor = (type: string) => {
    switch (type) {
      case 'character':
        return 'blue';
      case 'location':
        return 'green';
      case 'item':
        return 'purple';
      case 'concept':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <Box p={4} borderWidth={1} borderRadius="lg">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="md">World Bible Elements</Heading>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={() => {
              setSelectedElement(null);
              onOpen();
            }}
          >
            Add Element
          </Button>
        </HStack>

        <Tabs onChange={(index) => setActiveTab(['character', 'location', 'item', 'concept'][index] as any)}>
          <TabList>
            <Tab>Characters</Tab>
            <Tab>Locations</Tab>
            <Tab>Items</Tab>
            <Tab>Concepts</Tab>
          </TabList>

          <TabPanels>
            {(['character', 'location', 'item', 'concept'] as const).map((type) => (
              <TabPanel key={type}>
                <List spacing={3}>
                  {elements
                    .filter((element) => element.type === type)
                    .map((element) => (
                      <ListItem
                        key={element.id}
                        p={3}
                        borderWidth={1}
                        borderRadius="md"
                        _hover={{ bg: 'gray.50' }}
                      >
                        <HStack justify="space-between">
                          <Box>
                            <Heading size="sm">{element.name}</Heading>
                            <Text fontSize="sm" color="gray.600">
                              {element.description}
                            </Text>
                            <HStack mt={2} wrap="wrap" spacing={2}>
                              {element.connections.map((connection, index) => (
                                <Badge key={index} colorScheme={getElementTypeColor(type)}>
                                  {connection.relationship}
                                </Badge>
                              ))}
                            </HStack>
                          </Box>
                          <HStack>
                            <Tooltip label="Edit Element">
                              <IconButton
                                aria-label="Edit element"
                                icon={<FiEdit2 />}
                                size="sm"
                                onClick={() => {
                                  setSelectedElement(element);
                                  onOpen();
                                }}
                              />
                            </Tooltip>
                            <Tooltip label="Delete Element">
                              <IconButton
                                aria-label="Delete element"
                                icon={<FiTrash2 />}
                                size="sm"
                                colorScheme="red"
                                onClick={() => handleDeleteElement(element.id)}
                              />
                            </Tooltip>
                          </HStack>
                        </HStack>
                      </ListItem>
                    ))}
                </List>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedElement ? 'Edit Element' : 'Add Element'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <WorldElementForm
              element={selectedElement}
              onSubmit={selectedElement ? handleUpdateElement : handleCreateElement}
              onCancel={onClose}
              existingElements={elements}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
} 