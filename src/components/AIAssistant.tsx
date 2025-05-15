'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  useToast,
  Avatar,
  HStack,
  Divider,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { Novel, AIPersona } from '@/types/novel';

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  novel: Novel;
  onSuggestion: (suggestion: {
    type: 'character' | 'plot' | 'worldbuilding' | 'style';
    content: string;
  }) => void;
}

export default function AIAssistant({ novel, onSuggestion }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [persona, setPersona] = useState<AIPersona>({
    name: 'Young Writer',
    age: 15,
    favoriteBooks: [
      'The Hobbit',
      'Ender\'s Game',
      'The Giver',
      'A Wrinkle in Time',
    ],
    writingStyle: 'Imaginative and curious',
    personalityTraits: [
      'Enthusiastic',
      'Creative',
      'Analytical',
      'Supportive',
    ],
    relationshipToUser: 'Your younger self, eager to help you write and explore stories',
  });
  const toast = useToast();

  useEffect(() => {
    // Add initial message
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hey! I'm your younger self from when you first started writing. 
            I loved ${persona.favoriteBooks[0]} and ${persona.favoriteBooks[1]}, 
            and I'm here to help you stay true to your creative vision while improving your craft. 
            What would you like to explore in your story?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          novelContext: {
            title: novel.title,
            characters: novel.characters,
            worldBuilding: novel.worldBuilding,
          },
          persona,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        },
      ]);

      if (data.suggestion) {
        onSuggestion(data.suggestion);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack h="full" spacing={4}>
      <Card w="full">
        <CardBody>
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">{persona.name}</Text>
            <Text fontSize="sm">Age: {persona.age}</Text>
            <Text fontSize="sm">
              Favorite Books: {persona.favoriteBooks.join(', ')}
            </Text>
            <Text fontSize="sm">Writing Style: {persona.writingStyle}</Text>
          </VStack>
        </CardBody>
      </Card>

      <Box
        flex={1}
        w="full"
        overflowY="auto"
        borderWidth={1}
        borderRadius="md"
        p={4}
      >
        {messages.map((message, index) => (
          <HStack
            key={index}
            spacing={4}
            mb={4}
            justify={message.role === 'user' ? 'flex-end' : 'flex-start'}
          >
            {message.role === 'assistant' && (
              <Avatar size="sm" name={persona.name} />
            )}
            <Box
              maxW="80%"
              bg={message.role === 'user' ? 'blue.500' : 'gray.100'}
              color={message.role === 'user' ? 'white' : 'black'}
              p={3}
              borderRadius="lg"
            >
              <Text>{message.content}</Text>
              <Text fontSize="xs" color={message.role === 'user' ? 'white' : 'gray.500'}>
                {message.timestamp.toLocaleTimeString()}
              </Text>
            </Box>
            {message.role === 'user' && (
              <Avatar size="sm" name="You" />
            )}
          </HStack>
        ))}
      </Box>

      <HStack w="full">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about your story..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <Button
          colorScheme="blue"
          onClick={handleSendMessage}
          isLoading={isLoading}
        >
          Send
        </Button>
      </HStack>
    </VStack>
  );
} 