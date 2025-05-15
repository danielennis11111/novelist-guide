import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  useColorModeValue,
  Button,
  VStack,
  HStack,
  IconButton,
  Tooltip,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useState } from 'react';
import { Novel } from '@/types/novel';
import { WritingReminder } from '@/lib/calendar-service';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ReminderForm from './ReminderForm';

const localizer = momentLocalizer(moment);

interface CalendarProps {
  novel: Novel;
  reminders: WritingReminder[];
  onAddReminder: (reminder: Omit<WritingReminder, 'id'>) => Promise<void>;
  onUpdateReminder: (reminder: WritingReminder) => Promise<void>;
  onDeleteReminder: (reminderId: string) => Promise<void>;
}

export default function Calendar({
  novel,
  reminders,
  onAddReminder,
  onUpdateReminder,
  onDeleteReminder,
}: CalendarProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedReminder, setSelectedReminder] = useState<WritingReminder | null>(null);

  const events = reminders.map((reminder) => ({
    id: reminder.id,
    title: reminder.title,
    start: new Date(reminder.startTime),
    end: new Date(reminder.endTime),
    desc: reminder.description,
  }));

  const handleSelectEvent = (event: any) => {
    const reminder = reminders.find((r) => r.id === event.id);
    if (reminder) {
      setSelectedReminder(reminder);
      onOpen();
    }
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedReminder(null);
    onOpen();
  };

  const handleUpdateReminder = async (reminder: Omit<WritingReminder, 'id'>) => {
    if (!selectedReminder) return;
    try {
      await onUpdateReminder({
        ...reminder,
        id: selectedReminder.id,
      });
      onClose();
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading size="lg" mb={2}>
          Writing Calendar
        </Heading>
        <Text color="gray.600">
          Schedule your writing sessions and track your progress
        </Text>
      </Box>

      <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={8}>
        <GridItem>
          <Box
            bg={bgColor}
            borderWidth={1}
            borderColor={borderColor}
            borderRadius="lg"
            p={6}
            h="600px"
          >
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
            />
          </Box>
        </GridItem>

        <GridItem>
          <Box
            bg={bgColor}
            borderWidth={1}
            borderColor={borderColor}
            borderRadius="lg"
            p={6}
          >
            <VStack spacing={4} align="stretch">
              <Heading size="md">Upcoming Sessions</Heading>
              {reminders
                .filter((reminder) => new Date(reminder.startTime) > new Date())
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map((reminder) => (
                  <Box
                    key={reminder.id}
                    p={3}
                    borderWidth={1}
                    borderRadius="md"
                    _hover={{ bg: 'gray.50' }}
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
                      <HStack>
                        <Tooltip label="Edit Reminder">
                          <IconButton
                            aria-label="Edit reminder"
                            icon={<FiEdit2 />}
                            size="sm"
                            onClick={() => {
                              setSelectedReminder(reminder);
                              onOpen();
                            }}
                          />
                        </Tooltip>
                        <Tooltip label="Delete Reminder">
                          <IconButton
                            aria-label="Delete reminder"
                            icon={<FiTrash2 />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => onDeleteReminder(reminder.id)}
                          />
                        </Tooltip>
                      </HStack>
                    </HStack>
                  </Box>
                ))}
            </VStack>
          </Box>
        </GridItem>
      </Grid>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedReminder ? 'Edit Reminder' : 'Add Reminder'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ReminderForm
              reminder={selectedReminder}
              onSubmit={selectedReminder ? handleUpdateReminder : onAddReminder}
              onCancel={onClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
} 