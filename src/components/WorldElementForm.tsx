import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  VStack,
  HStack,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { WorldElement } from '@/types/novel';

interface WorldElementFormProps {
  element: WorldElement | null;
  onSubmit: (element: Omit<WorldElement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  existingElements: WorldElement[];
}

export default function WorldElementForm({
  element,
  onSubmit,
  onCancel,
  existingElements,
}: WorldElementFormProps) {
  const [formData, setFormData] = useState<Omit<WorldElement, 'id' | 'createdAt' | 'updatedAt'>>({
    type: 'location',
    name: '',
    description: '',
    connections: [],
  });

  useEffect(() => {
    if (element) {
      setFormData({
        type: element.type,
        name: element.name,
        description: element.description,
        connections: element.connections,
      });
    }
  }, [element]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddConnection = () => {
    setFormData((prev) => ({
      ...prev,
      connections: [
        ...prev.connections,
        {
          elementId: '',
          relationship: '',
        },
      ],
    }));
  };

  const handleRemoveConnection = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      connections: prev.connections.filter((_, i) => i !== index),
    }));
  };

  const handleConnectionChange = (index: number, field: 'elementId' | 'relationship', value: string) => {
    setFormData((prev) => ({
      ...prev,
      connections: prev.connections.map((conn, i) =>
        i === index ? { ...conn, [field]: value } : conn
      ),
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Type</FormLabel>
          <Select name="type" value={formData.type} onChange={handleChange}>
            <option value="location">Location</option>
            <option value="item">Item</option>
            <option value="concept">Concept</option>
            <option value="event">Event</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter element name"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter element description"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Connections</FormLabel>
          <VStack spacing={2} align="stretch">
            {formData.connections.map((connection, index) => (
              <HStack key={index}>
                <Select
                  value={connection.elementId}
                  onChange={(e) => handleConnectionChange(index, 'elementId', e.target.value)}
                  placeholder="Select connected element"
                >
                  {existingElements
                    .filter((e) => e.id !== element?.id)
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                </Select>
                <Input
                  value={connection.relationship}
                  onChange={(e) => handleConnectionChange(index, 'relationship', e.target.value)}
                  placeholder="Relationship type"
                />
                <IconButton
                  aria-label="Remove connection"
                  icon={<FiTrash2 />}
                  onClick={() => handleRemoveConnection(index)}
                />
              </HStack>
            ))}
            <Button
              leftIcon={<FiPlus />}
              onClick={handleAddConnection}
              size="sm"
              variant="outline"
            >
              Add Connection
            </Button>
          </VStack>
        </FormControl>

        <HStack justify="flex-end" spacing={4}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" colorScheme="blue">
            {element ? 'Save Changes' : 'Create Element'}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
} 