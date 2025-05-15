'use client';

import {
  VStack,
  Heading,
  Button,
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
  Select,
  Textarea,
  Box,
  Text,
  IconButton,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useState } from 'react';
import { WorldBuildingElement } from '@/types/novel';

interface WorldBuildingPanelProps {
  worldElements: WorldBuildingElement[];
  onUpdate: (elements: WorldBuildingElement[]) => void;
}

export default function WorldBuildingPanel({
  worldElements,
  onUpdate,
}: WorldBuildingPanelProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingElement, setEditingElement] = useState<WorldBuildingElement | null>(
    null
  );
  const [newElement, setNewElement] = useState<Partial<WorldBuildingElement>>({
    type: 'location',
    name: '',
    description: '',
    connections: [],
  });
  const toast = useToast();

  const handleSave = () => {
    if (!newElement.name || !newElement.description) {
      toast({
        title: 'Required Fields Missing',
        description: 'Please fill in all required fields.',
        status: 'error',
      });
      return;
    }

    const element: WorldBuildingElement = {
      id: editingElement?.id || Date.now().toString(),
      type: newElement.type as 'location' | 'event' | 'item' | 'concept',
      name: newElement.name,
      description: newElement.description,
      connections: newElement.connections || [],
      createdAt: editingElement?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (editingElement) {
      onUpdate(
        worldElements.map((e) => (e.id === editingElement.id ? element : e))
      );
    } else {
      onUpdate([...worldElements, element]);
    }

    setNewElement({
      type: 'location',
      name: '',
      description: '',
      connections: [],
    });
    setEditingElement(null);
    onClose();
  };

  const handleEdit = (element: WorldBuildingElement) => {
    setEditingElement(element);
    setNewElement(element);
    onOpen();
  };

  const handleDelete = (id: string) => {
    onUpdate(worldElements.filter((e) => e.id !== id));
  };

  const handleAddConnection = (connection: string) => {
    if (connection && !newElement.connections?.includes(connection)) {
      setNewElement({
        ...newElement,
        connections: [...(newElement.connections || []), connection],
      });
    }
  };

  const handleRemoveConnection = (connection: string) => {
    setNewElement({
      ...newElement,
      connections: newElement.connections?.filter((c) => c !== connection) || [],
    });
  };

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Heading size="md">World Building</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="blue"
          onClick={() => {
            setEditingElement(null);
            setNewElement({
              type: 'location',
              name: '',
              description: '',
              connections: [],
            });
            onOpen();
          }}
        >
          Add Element
        </Button>
      </HStack>

      <VStack spacing={4} align="stretch">
        {worldElements.map((element) => (
          <Box
            key={element.id}
            p={4}
            borderWidth={1}
            borderRadius="md"
            position="relative"
          >
            <HStack justify="space-between" mb={2}>
              <Heading size="sm">{element.name}</Heading>
              <HStack>
                <IconButton
                  aria-label="Edit"
                  icon={<FiEdit2 />}
                  size="sm"
                  onClick={() => handleEdit(element)}
                />
                <IconButton
                  aria-label="Delete"
                  icon={<FiTrash2 />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleDelete(element.id)}
                />
              </HStack>
            </HStack>
            <Tag size="sm" colorScheme="blue" mb={2}>
              {element.type}
            </Tag>
            <Text mb={2}>{element.description}</Text>
            {element.connections.length > 0 && (
              <Box>
                <Text fontWeight="bold" mb={1}>
                  Connections:
                </Text>
                <HStack wrap="wrap" spacing={2}>
                  {element.connections.map((connection) => (
                    <Tag key={connection} size="sm">
                      <TagLabel>{connection}</TagLabel>
                    </Tag>
                  ))}
                </HStack>
              </Box>
            )}
          </Box>
        ))}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingElement ? 'Edit Element' : 'Add New Element'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Select
                  value={newElement.type}
                  onChange={(e) =>
                    setNewElement({ ...newElement, type: e.target.value as any })
                  }
                >
                  <option value="location">Location</option>
                  <option value="event">Event</option>
                  <option value="item">Item</option>
                  <option value="concept">Concept</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={newElement.name}
                  onChange={(e) =>
                    setNewElement({ ...newElement, name: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={newElement.description}
                  onChange={(e) =>
                    setNewElement({ ...newElement, description: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Connections</FormLabel>
                <HStack mb={2}>
                  <Input
                    placeholder="Add connection"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddConnection(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </HStack>
                <HStack wrap="wrap" spacing={2}>
                  {newElement.connections?.map((connection) => (
                    <Tag key={connection} size="sm">
                      <TagLabel>{connection}</TagLabel>
                      <TagCloseButton
                        onClick={() => handleRemoveConnection(connection)}
                      />
                    </Tag>
                  ))}
                </HStack>
              </FormControl>

              <Button colorScheme="blue" onClick={handleSave} width="full">
                Save
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
} 