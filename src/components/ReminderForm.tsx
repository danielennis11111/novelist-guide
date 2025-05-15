import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  HStack,
  Switch,
  FormHelperText,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { WritingReminder } from '@/lib/calendar-service';

interface ReminderFormProps {
  reminder: WritingReminder | null;
  onSubmit: (reminder: Omit<WritingReminder, 'id'>) => void;
  onCancel: () => void;
}

export default function ReminderForm({ reminder, onSubmit, onCancel }: ReminderFormProps) {
  const [formData, setFormData] = useState<Omit<WritingReminder, 'id'>>({
    title: '',
    description: '',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    recurring: false,
    recurrenceRule: '',
  });

  useEffect(() => {
    if (reminder) {
      setFormData({
        title: reminder.title,
        description: reminder.description,
        startTime: reminder.startTime,
        endTime: reminder.endTime,
        recurring: reminder.recurring,
        recurrenceRule: reminder.recurrenceRule || '',
      });
    }
  }, [reminder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      recurring: e.target.checked,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Title</FormLabel>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter reminder title"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter reminder description"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Start Time</FormLabel>
          <Input
            type="datetime-local"
            name="startTime"
            value={formData.startTime.slice(0, 16)}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>End Time</FormLabel>
          <Input
            type="datetime-local"
            name="endTime"
            value={formData.endTime.slice(0, 16)}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Recurring</FormLabel>
          <Switch
            isChecked={formData.recurring}
            onChange={handleSwitchChange}
          />
        </FormControl>

        {formData.recurring && (
          <FormControl>
            <FormLabel>Recurrence Rule</FormLabel>
            <Input
              name="recurrenceRule"
              value={formData.recurrenceRule}
              onChange={handleChange}
              placeholder="FREQ=WEEKLY;BYDAY=MO,WE,FR"
            />
            <FormHelperText>
              Use iCalendar recurrence rule format (e.g., FREQ=WEEKLY;BYDAY=MO,WE,FR)
            </FormHelperText>
          </FormControl>
        )}

        <HStack justify="flex-end" spacing={4}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" colorScheme="blue">
            {reminder ? 'Save Changes' : 'Create Reminder'}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
} 