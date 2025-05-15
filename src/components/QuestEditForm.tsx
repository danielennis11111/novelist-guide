import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  VStack,
  Switch,
  FormHelperText,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { WorldBibleQuest } from '@/lib/world-bible-service';

interface QuestEditFormProps {
  quest: WorldBibleQuest;
  onSubmit: (quest: WorldBibleQuest) => void;
  onCancel: () => void;
}

export default function QuestEditForm({ quest, onSubmit, onCancel }: QuestEditFormProps) {
  const [formData, setFormData] = useState<WorldBibleQuest>(quest);

  useEffect(() => {
    setFormData(quest);
  }, [quest]);

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

  const handleNumberChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value, 10),
    }));
  };

  const handleSwitchChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.checked,
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
            placeholder="Enter quest title"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter quest description"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Type</FormLabel>
          <Select name="type" value={formData.type} onChange={handleChange}>
            <option value="character">Character Development</option>
            <option value="world">World Building</option>
            <option value="plot">Plot Structure</option>
            <option value="research">Research</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Target</FormLabel>
          <NumberInput
            value={formData.target}
            onChange={(value) => handleNumberChange('target', value)}
            min={1}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormHelperText>
            {formData.type === 'character' && 'Number of characters to develop'}
            {formData.type === 'world' && 'Number of world elements to create'}
            {formData.type === 'plot' && 'Number of plot points to outline'}
            {formData.type === 'research' && 'Number of research items to complete'}
          </FormHelperText>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Reward Points</FormLabel>
          <NumberInput
            value={formData.reward}
            onChange={(value) => handleNumberChange('reward', value)}
            min={1}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Due Date</FormLabel>
          <Input
            type="datetime-local"
            name="dueDate"
            value={formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 16) : ''}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Completed</FormLabel>
          <Switch
            isChecked={formData.completed}
            onChange={handleSwitchChange('completed')}
          />
        </FormControl>

        <Button type="submit" colorScheme="blue">
          Save Changes
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </VStack>
    </form>
  );
} 