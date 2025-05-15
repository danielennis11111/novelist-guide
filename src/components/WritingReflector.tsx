'use client'

import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Avatar,
  useColorModeValue,
  Divider,
  Badge,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { FiSend, FiClock, FiBookOpen, FiMapPin, FiBox } from 'react-icons/fi'
import { ChatMessage, novelStorage } from '../world-bible/storage'

interface WritingReflectorProps {
  novelId: string;
  currentText?: string;
  onInsightGenerated?: (insight: string) => void;
}

export default function WritingReflector({
  novelId,
  currentText,
  onInsightGenerated,
}: WritingReflectorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    setIsLoading(true)

    // Create the user's question
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      content: input,
      type: 'question',
      relatedElements: {},
    }

    // Find related content based on the question
    const relatedContent = novelStorage.findRelatedContent(novelId, input)

    // Create context from related content
    const context = buildContext(relatedContent)

    // Create the AI's response
    const aiMessage: ChatMessage = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      content: await generateReflection(input, context, currentText),
      type: 'reflection',
      relatedElements: {
        characters: relatedContent.characters.map(c => c.id),
        scenes: relatedContent.scenes.map(s => s.id),
        locations: relatedContent.locations.map(l => l.id),
        props: relatedContent.props.map(p => p.id),
      },
      context: {
        beforeText: context.beforeText,
        afterText: context.afterText,
      },
    }

    // Add messages to storage and state
    novelStorage.addChatMessage(novelId, userMessage)
    novelStorage.addChatMessage(novelId, aiMessage)
    setMessages(prev => [...prev, userMessage, aiMessage])

    // Notify parent of any insights
    if (onInsightGenerated) {
      onInsightGenerated(aiMessage.content)
    }

    setInput('')
    setIsLoading(false)
  }

  const buildContext = (relatedContent: ReturnType<typeof novelStorage.findRelatedContent>) => {
    return {
      beforeText: relatedContent.scenes
        .map(scene => scene.summary)
        .join('\n'),
      afterText: relatedContent.chatMessages
        .map(msg => msg.content)
        .join('\n'),
      characters: relatedContent.characters,
      locations: relatedContent.locations,
      props: relatedContent.props,
    }
  }

  const generateReflection = async (
    question: string,
    context: ReturnType<typeof buildContext>,
    currentText?: string,
  ): Promise<string> => {
    // This is where you'd integrate with an AI service
    // For now, we'll return a placeholder response
    return `Based on the context and your question "${question}", here's a reflection on your writing:
    
${context.characters.map(char => char.name).join(', ')} appear in this section.
The scenes take place in ${context.locations.map(loc => loc.name).join(', ')}.
Key props involved: ${context.props.map(prop => prop.name).join(', ')}.

Consider how these elements work together to create the atmosphere and advance the plot.
Would you approach this differently now? How has your writing style evolved?`
  }

  return (
    <Box
      borderWidth={1}
      borderRadius="lg"
      p={4}
      bg={bgColor}
      height="600px"
      display="flex"
      flexDirection="column"
    >
      <VStack flex={1} spacing={4} overflowY="auto" alignItems="stretch">
        {messages.map((message) => (
          <Box
            key={message.id}
            alignSelf={message.type === 'question' ? 'flex-end' : 'flex-start'}
            maxW="80%"
          >
            <HStack spacing={2} mb={1}>
              <Avatar
                size="sm"
                name={message.type === 'question' ? 'You' : 'AI'}
                bg={message.type === 'question' ? 'blue.500' : 'green.500'}
              />
              <Text fontSize="sm" color="gray.500">
                {new Date(message.timestamp).toLocaleTimeString()}
              </Text>
            </HStack>
            <Box
              bg={message.type === 'question' ? 'blue.500' : 'green.500'}
              color="white"
              borderRadius="lg"
              p={3}
            >
              <Text>{message.content}</Text>
            </Box>
            {message.relatedElements && (
              <HStack mt={2} spacing={2}>
                {message.relatedElements.characters?.length && (
                  <Tooltip label="Related Characters">
                    <Badge colorScheme="blue">
                      <HStack spacing={1}>
                        <FiBookOpen />
                        <Text>{message.relatedElements.characters.length}</Text>
                      </HStack>
                    </Badge>
                  </Tooltip>
                )}
                {message.relatedElements.locations?.length && (
                  <Tooltip label="Related Locations">
                    <Badge colorScheme="green">
                      <HStack spacing={1}>
                        <FiMapPin />
                        <Text>{message.relatedElements.locations.length}</Text>
                      </HStack>
                    </Badge>
                  </Tooltip>
                )}
                {message.relatedElements.props?.length && (
                  <Tooltip label="Related Props">
                    <Badge colorScheme="orange">
                      <HStack spacing={1}>
                        <FiBox />
                        <Text>{message.relatedElements.props.length}</Text>
                      </HStack>
                    </Badge>
                  </Tooltip>
                )}
              </HStack>
            )}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </VStack>

      <Divider my={4} />

      <HStack>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your writing decisions..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <IconButton
          aria-label="Send message"
          icon={isLoading ? <FiClock /> : <FiSend />}
          onClick={handleSendMessage}
          isLoading={isLoading}
          colorScheme="blue"
        />
      </HStack>
    </Box>
  )
} 