import {
  Box,
  VStack,
  Heading,
  Text,
  Progress,
  List,
  ListItem,
  Badge,
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
  HStack,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { WorldBibleService, WorldBibleQuest } from '@/lib/world-bible-service';
import { CalendarService, WritingReminder } from '@/lib/calendar-service';
import { Novel } from '@/types/novel';
import QuestEditForm from './QuestEditForm';

interface WorldBiblePanelProps {
  novel: Novel;
  accessToken: string;
}

export default function WorldBiblePanel({ novel, accessToken }: WorldBiblePanelProps) {
  const [quests, setQuests] = useState<WorldBibleQuest[]>([]);
  const [reminders, setReminders] = useState<WritingReminder[]>([]);
  const [progress, setProgress] = useState({
    characters: 0,
    worldElements: 0,
    plotPoints: 0,
    researchItems: 0,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedQuest, setSelectedQuest] = useState<WorldBibleQuest | null>(null);
  const calendarService = new CalendarService(accessToken);

  useEffect(() => {
    loadQuests();
    loadReminders();
    loadProgress();
  }, [novel.id]);

  const loadQuests = async () => {
    try {
      const worldBibleQuests = await WorldBibleService.generateWorldBibleQuests(novel.id);
      setQuests(worldBibleQuests);
    } catch (error) {
      console.error('Error loading quests:', error);
    }
  };

  const loadReminders = async () => {
    try {
      const upcomingReminders = await calendarService.getUpcomingReminders(novel.userId);
      setReminders(upcomingReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const loadProgress = async () => {
    try {
      const worldBibleProgress = await WorldBibleService.getWorldBibleProgress(novel.id);
      setProgress(worldBibleProgress);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleCreateReminder = async (quest: WorldBibleQuest) => {
    try {
      const reminder = await calendarService.createWritingReminder(novel.userId, novel.id, {
        title: quest.title,
        description: quest.description,
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        recurring: false,
      });
      setReminders([...reminders, reminder]);
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      await calendarService.deleteReminder(reminderId);
      setReminders(reminders.filter(r => r.id !== reminderId));
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const handleEditQuest = async (updatedQuest: WorldBibleQuest) => {
    try {
      await WorldBibleService.updateQuest(updatedQuest);
      setQuests(quests.map(q => q.id === updatedQuest.id ? updatedQuest : q));
      onClose();
    } catch (error) {
      console.error('Error updating quest:', error);
    }
  };

  return (
    <Box p={4} borderWidth={1} borderRadius="lg">
      <VStack spacing={6} align="stretch">
        <Heading size="md">World Bible Progress</Heading>
        
        <Box>
          <Text mb={2}>Characters</Text>
          <Progress value={(progress.characters / 3) * 100} colorScheme="blue" mb={4} />
          
          <Text mb={2}>World Elements</Text>
          <Progress value={(progress.worldElements / 5) * 100} colorScheme="green" mb={4} />
          
          <Text mb={2}>Plot Points</Text>
          <Progress value={(progress.plotPoints / 1) * 100} colorScheme="purple" mb={4} />
          
          <Text mb={2}>Research</Text>
          <Progress value={(progress.researchItems / 3) * 100} colorScheme="orange" />
        </Box>

        <Tabs>
          <TabList>
            <Tab>Quests</Tab>
            <Tab>Reminders</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <List spacing={3}>
                {quests.map((quest) => (
                  <ListItem
                    key={quest.id}
                    p={3}
                    borderWidth={1}
                    borderRadius="md"
                    _hover={{ bg: 'gray.50' }}
                  >
                    <HStack justify="space-between">
                      <Box>
                        <Heading size="sm">{quest.title}</Heading>
                        <Text fontSize="sm" color="gray.600">
                          {quest.description}
                        </Text>
                        <HStack mt={2}>
                          <Badge colorScheme={quest.completed ? 'green' : 'blue'}>
                            {quest.type}
                          </Badge>
                          <Text fontSize="sm">Reward: {quest.reward} points</Text>
                        </HStack>
                      </Box>
                      <HStack>
                        <Tooltip label="Add to Calendar">
                          <IconButton
                            aria-label="Add to calendar"
                            icon={<FiCalendar />}
                            size="sm"
                            onClick={() => handleCreateReminder(quest)}
                          />
                        </Tooltip>
                        <Tooltip label="Edit Quest">
                          <IconButton
                            aria-label="Edit quest"
                            icon={<FiEdit2 />}
                            size="sm"
                            onClick={() => {
                              setSelectedQuest(quest);
                              onOpen();
                            }}
                          />
                        </Tooltip>
                      </HStack>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </TabPanel>

            <TabPanel>
              <List spacing={3}>
                {reminders.map((reminder) => (
                  <ListItem
                    key={reminder.id}
                    p={3}
                    borderWidth={1}
                    borderRadius="md"
                  >
                    <HStack justify="space-between">
                      <Box>
                        <Heading size="sm">{reminder.title}</Heading>
                        <Text fontSize="sm" color="gray.600">
                          {reminder.description}
                        </Text>
                        <Text fontSize="sm" mt={2}>
                          {new Date(reminder.startTime).toLocaleString()}
                        </Text>
                      </Box>
                      <IconButton
                        aria-label="Delete reminder"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteReminder(reminder.id)}
                      />
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Quest</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedQuest && (
              <QuestEditForm
                quest={selectedQuest}
                onSubmit={handleEditQuest}
                onCancel={onClose}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
} 