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
  Textarea,
  Box,
  Text,
  IconButton,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Select,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import { useState } from 'react';
import { Character, CharacterRelationship } from '@/types/novel';

interface CharacterPanelProps {
  characters: Character[];
  onUpdate: (characters: Character[]) => void;
}

export default function CharacterPanel({
  characters,
  onUpdate,
}: CharacterPanelProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [newCharacter, setNewCharacter] = useState<Partial<Character>>({
    name: '',
    description: '',
    traits: [],
    relationships: [],
    arc: '',
    backstory: '',
  });
  const toast = useToast();

  const handleSave = () => {
    if (!newCharacter.name || !newCharacter.description) {
      toast({
        title: 'Required Fields Missing',
        description: 'Please fill in all required fields.',
        status: 'error',
      });
      return;
    }

    const character: Character = {
      id: editingCharacter?.id || Date.now().toString(),
      name: newCharacter.name!,
      description: newCharacter.description!,
      traits: newCharacter.traits || [],
      relationships: newCharacter.relationships || [],
      arc: newCharacter.arc || '',
      backstory: newCharacter.backstory || '',
      createdAt: editingCharacter?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (editingCharacter) {
      onUpdate(
        characters.map((c) => (c.id === editingCharacter.id ? character : c))
      );
    } else {
      onUpdate([...characters, character]);
    }

    setNewCharacter({
      name: '',
      description: '',
      traits: [],
      relationships: [],
      arc: '',
      backstory: '',
    });
    setEditingCharacter(null);
    onClose();
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setNewCharacter(character);
    onOpen();
  };

  const handleDelete = (id: string) => {
    onUpdate(characters.filter((c) => c.id !== id));
  };

  const handleAddTrait = (trait: string) => {
    if (trait && !newCharacter.traits?.includes(trait)) {
      setNewCharacter({
        ...newCharacter,
        traits: [...(newCharacter.traits || []), trait],
      });
    }
  };

  const handleRemoveTrait = (trait: string) => {
    setNewCharacter({
      ...newCharacter,
      traits: newCharacter.traits?.filter((t) => t !== trait) || [],
    });
  };

  const handleAddRelationship = (relationship: CharacterRelationship) => {
    setNewCharacter({
      ...newCharacter,
      relationships: [...(newCharacter.relationships || []), relationship],
    });
  };

  const handleRemoveRelationship = (characterId: string) => {
    setNewCharacter({
      ...newCharacter,
      relationships:
        newCharacter.relationships?.filter((r) => r.characterId !== characterId) ||
        [],
    });
  };

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Heading size="md">Characters</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="blue"
          onClick={() => {
            setEditingCharacter(null);
            setNewCharacter({
              name: '',
              description: '',
              traits: [],
              relationships: [],
              arc: '',
              backstory: '',
            });
            onOpen();
          }}
        >
          Add Character
        </Button>
      </HStack>

      <Accordion allowMultiple>
        {characters.map((character) => (
          <AccordionItem key={character.id}>
            <AccordionButton>
              <Box flex="1">
                <HStack justify="space-between">
                  <Heading size="sm">{character.name}</Heading>
                  <HStack>
                    <IconButton
                      aria-label="Edit"
                      icon={<FiEdit2 />}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(character);
                      }}
                    />
                    <IconButton
                      aria-label="Delete"
                      icon={<FiTrash2 />}
                      size="sm"
                      colorScheme="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(character.id);
                      }}
                    />
                    <AccordionIcon />
                  </HStack>
                </HStack>
              </Box>
            </AccordionButton>
            <AccordionPanel>
              <VStack align="start" spacing={3}>
                <Text>{character.description}</Text>

                <Box>
                  <Text fontWeight="bold" mb={1}>
                    Traits:
                  </Text>
                  <HStack wrap="wrap" spacing={2}>
                    {character.traits.map((trait) => (
                      <Tag key={trait} size="sm">
                        <TagLabel>{trait}</TagLabel>
                      </Tag>
                    ))}
                  </HStack>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={1}>
                    Character Arc:
                  </Text>
                  <Text>{character.arc}</Text>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={1}>
                    Backstory:
                  </Text>
                  <Text>{character.backstory}</Text>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={1}>
                    Relationships:
                  </Text>
                  <VStack align="start" spacing={2}>
                    {character.relationships.map((rel) => {
                      const relatedCharacter = characters.find(
                        (c) => c.id === rel.relatedCharacterId
                      );
                      return (
                        <HStack key={rel.relatedCharacterId}>
                          <FiUsers />
                          <Text>
                            {relatedCharacter?.name} - {rel.type}:{' '}
                            {rel.description}
                          </Text>
                        </HStack>
                      );
                    })}
                  </VStack>
                </Box>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingCharacter ? 'Edit Character' : 'Add New Character'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={newCharacter.name}
                  onChange={(e) =>
                    setNewCharacter({ ...newCharacter, name: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={newCharacter.description}
                  onChange={(e) =>
                    setNewCharacter({
                      ...newCharacter,
                      description: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Character Arc</FormLabel>
                <Textarea
                  value={newCharacter.arc}
                  onChange={(e) =>
                    setNewCharacter({ ...newCharacter, arc: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Backstory</FormLabel>
                <Textarea
                  value={newCharacter.backstory}
                  onChange={(e) =>
                    setNewCharacter({
                      ...newCharacter,
                      backstory: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Traits</FormLabel>
                <HStack mb={2}>
                  <Input
                    placeholder="Add trait"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTrait(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </HStack>
                <HStack wrap="wrap" spacing={2}>
                  {newCharacter.traits?.map((trait) => (
                    <Tag key={trait} size="sm">
                      <TagLabel>{trait}</TagLabel>
                      <TagCloseButton
                        onClick={() => handleRemoveTrait(trait)}
                      />
                    </Tag>
                  ))}
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>Relationships</FormLabel>
                <VStack spacing={2} align="stretch">
                  {characters
                    .filter((c) => c.id !== editingCharacter?.id)
                    .map((character) => (
                      <HStack key={character.id}>
                        <Select
                          placeholder="Select relationship"
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddRelationship({
                                characterId: editingCharacter?.id || '',
                                relatedCharacterId: character.id,
                                type: e.target.value,
                                description: '',
                              });
                            }
                          }}
                        >
                          <option value="friend">Friend</option>
                          <option value="enemy">Enemy</option>
                          <option value="family">Family</option>
                          <option value="mentor">Mentor</option>
                          <option value="student">Student</option>
                          <option value="lover">Lover</option>
                          <option value="rival">Rival</option>
                        </Select>
                        <IconButton
                          aria-label="Remove relationship"
                          icon={<FiTrash2 />}
                          size="sm"
                          onClick={() => handleRemoveRelationship(character.id)}
                        />
                      </HStack>
                    ))}
                </VStack>
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