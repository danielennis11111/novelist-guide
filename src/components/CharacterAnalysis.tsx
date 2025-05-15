'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Progress,
  SimpleGrid,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  Icon,
} from '@chakra-ui/react'
import {
  FiUser,
  FiMessageCircle,
  FiHeart,
  FiTarget,
  FiAlertCircle,
  FiSmile,
  FiClock,
} from 'react-icons/fi'
import { Character } from '@/world-bible/types'

interface EmotionScore {
  emotion: string
  score: number
  color: string
}

interface CharacterAnalysisProps {
  character: Partial<Character>
  relatedScenes?: {
    title: string
    emotionalTone: string
    keyDialogue: Array<{ quote: string; significance: string }>
  }[]
}

export default function CharacterAnalysis({
  character,
  relatedScenes = [],
}: CharacterAnalysisProps) {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const emotionScores: EmotionScore[] = [
    { emotion: 'Happy', score: 0.8, color: 'green.400' },
    { emotion: 'Angry', score: 0.3, color: 'red.400' },
    { emotion: 'Sad', score: 0.5, color: 'blue.400' },
    { emotion: 'Afraid', score: 0.2, color: 'purple.400' },
    { emotion: 'Neutral', score: 0.4, color: 'gray.400' },
  ]

  return (
    <Box
      borderWidth={1}
      borderRadius="lg"
      p={6}
      bg={bgColor}
      borderColor={borderColor}
    >
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack spacing={4}>
          <Icon as={FiUser} boxSize={8} color="blue.500" />
          <Box>
            <Heading size="lg">{character.name}</Heading>
            <Badge colorScheme="blue">{character.role}</Badge>
          </Box>
        </HStack>

        {/* Personality Traits */}
        <Box>
          <Heading size="md" mb={4}>
            <HStack>
              <Icon as={FiSmile} />
              <Text>Personality Profile</Text>
            </HStack>
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {character.personality?.traits.map((trait, index) => (
              <HStack key={index} spacing={2}>
                <Badge colorScheme="blue" px={2} py={1}>
                  {trait}
                </Badge>
                <Progress
                  value={Math.random() * 100}
                  size="sm"
                  colorScheme="blue"
                  flex={1}
                />
              </HStack>
            ))}
          </SimpleGrid>
        </Box>

        {/* Emotional Analysis */}
        <Box>
          <Heading size="md" mb={4}>
            <HStack>
              <Icon as={FiHeart} />
              <Text>Emotional Analysis</Text>
            </HStack>
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {emotionScores.map((emotion, index) => (
              <Box key={index}>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="sm">{emotion.emotion}</Text>
                  <Text fontSize="sm">{(emotion.score * 100).toFixed(0)}%</Text>
                </HStack>
                <Progress
                  value={emotion.score * 100}
                  size="sm"
                  colorScheme={emotion.color.split('.')[0]}
                />
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Dialogue Patterns */}
        <Accordion allowMultiple>
          <AccordionItem>
            <AccordionButton>
              <HStack flex={1}>
                <Icon as={FiMessageCircle} />
                <Text fontWeight="bold">Dialogue Patterns</Text>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Common Phrases
                  </Text>
                  <List spacing={2}>
                    {character.dialogueStyle?.commonPhrases.map((phrase, index) => (
                      <ListItem key={index}>
                        <Badge colorScheme="green" mr={2}>
                          {index + 1}
                        </Badge>
                        "{phrase}"
                      </ListItem>
                    ))}
                  </List>
                </Box>
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Speech Patterns
                  </Text>
                  <HStack wrap="wrap" spacing={2}>
                    {character.dialogueStyle?.speechPatterns.map((pattern, index) => (
                      <Badge key={index} colorScheme="purple">
                        {pattern}
                      </Badge>
                    ))}
                  </HStack>
                </Box>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Character Development */}
          <AccordionItem>
            <AccordionButton>
              <HStack flex={1}>
                <Icon as={FiTarget} />
                <Text fontWeight="bold">Character Development</Text>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Motivation
                  </Text>
                  <Text>{character.motivation}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Character Arc
                  </Text>
                  <List spacing={2}>
                    {character.arc?.keyChanges.map((change, index) => (
                      <ListItem key={index}>
                        <HStack>
                          <Icon as={FiClock} />
                          <Box>
                            <Text fontWeight="bold">{change.trigger}</Text>
                            <Text fontSize="sm">{change.change}</Text>
                          </Box>
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Scene Appearances */}
          <AccordionItem>
            <AccordionButton>
              <HStack flex={1}>
                <Icon as={FiAlertCircle} />
                <Text fontWeight="bold">Scene Appearances</Text>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <List spacing={4}>
                {relatedScenes.map((scene, index) => (
                  <ListItem key={index}>
                    <Box
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      borderColor={borderColor}
                    >
                      <Heading size="sm" mb={2}>
                        {scene.title}
                      </Heading>
                      <Badge colorScheme="purple" mb={2}>
                        {scene.emotionalTone}
                      </Badge>
                      <List spacing={2}>
                        {scene.keyDialogue.map((dialogue, dIndex) => (
                          <ListItem key={dIndex}>
                            <Text fontSize="sm">"{dialogue.quote}"</Text>
                            <Text fontSize="xs" color="gray.500">
                              {dialogue.significance}
                            </Text>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    </Box>
  )
} 