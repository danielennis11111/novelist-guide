import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Progress,
  useToast,
  Icon,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
  Radio,
  RadioGroup,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
} from '@chakra-ui/react';
import { FiCheck, FiCloud, FiKey, FiLock } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { SetupStatus } from '@/types/user-settings';

const steps = [
  { title: 'Google Sign In', description: 'Connect with your Google account' },
  { title: 'Project Setup', description: 'Create a Google Cloud project' },
  { title: 'API Configuration', description: 'Enable necessary APIs' },
  { title: 'LLM Setup', description: 'Configure your AI assistant' },
  { title: 'Verification', description: 'Verify setup and access' },
];

export default function SetupWizard() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [llmType, setLLMType] = useState<'openai' | 'gemini'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [setupStatus, setSetupStatus] = useState<SetupStatus>({
    google: {
      isAuthenticated: false,
      hasProjectSetup: false,
      hasAPIEnabled: false,
      hasDriveAccess: false,
    },
    llm: {
      type: null,
      hasValidKey: false,
      isConfigured: false,
    },
  });
  const toast = useToast();
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  const handleGoogleSetup = async () => {
    if (!session?.accessToken) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in with Google first',
        status: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create Google Cloud project
      const createProjectResponse = await fetch('/api/google/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createProject',
          accessToken: session.accessToken,
          projectName: `Novelist-${session.user.name}`,
        }),
      });

      if (!createProjectResponse.ok) {
        throw new Error('Failed to create Google Cloud project');
      }

      const { projectId } = await createProjectResponse.json();
      setSetupStatus((prev) => ({
        ...prev,
        google: { ...prev.google, hasProjectSetup: true },
      }));
      setActiveStep(1);

      // Enable required APIs
      const enableAPIsResponse = await fetch('/api/google/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enableAPIs',
          accessToken: session.accessToken,
          projectId,
        }),
      });

      if (!enableAPIsResponse.ok) {
        throw new Error('Failed to enable required APIs');
      }

      setSetupStatus((prev) => ({
        ...prev,
        google: { ...prev.google, hasAPIEnabled: true },
      }));
      setActiveStep(2);

      // Create OAuth credentials
      const createCredentialsResponse = await fetch('/api/google/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createCredentials',
          accessToken: session.accessToken,
          projectId,
        }),
      });

      if (!createCredentialsResponse.ok) {
        throw new Error('Failed to create OAuth credentials');
      }

      // Validate setup
      const validateResponse = await fetch('/api/google/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validateSetup',
          accessToken: session.accessToken,
          projectId,
        }),
      });

      if (!validateResponse.ok) {
        throw new Error('Failed to validate setup');
      }

      const { validation } = await validateResponse.json();

      if (validation.hasRequiredAPIs) {
        setSetupStatus((prev) => ({
          ...prev,
          google: { ...prev.google, hasDriveAccess: true },
        }));
        setActiveStep(3);

        toast({
          title: 'Google Setup Complete',
          description: 'Now let\'s configure your AI assistant',
          status: 'success',
        });
      }
    } catch (error) {
      console.error('Setup error:', error);
      toast({
        title: 'Setup Failed',
        description: error instanceof Error ? error.message : 'An error occurred during setup',
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLLMSetup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/llm/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: llmType,
          apiKey,
          projectId: llmType === 'gemini' ? projectId : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate LLM configuration');
      }

      if (llmType === 'openai' && data.isValid) {
        setAvailableModels(data.models);
        setSetupStatus((prev) => ({
          ...prev,
          llm: {
            type: 'openai',
            hasValidKey: true,
            isConfigured: true,
          },
        }));
        setActiveStep(4);
        toast({
          title: 'OpenAI Setup Complete',
          description: 'Your OpenAI API key has been validated',
          status: 'success',
        });
      } else if (llmType === 'gemini' && data.isValid) {
        setSetupStatus((prev) => ({
          ...prev,
          llm: {
            type: 'gemini',
            hasValidKey: true,
            isConfigured: true,
          },
        }));
        setActiveStep(4);
        toast({
          title: 'Gemini Setup Complete',
          description: 'Your Gemini API key has been validated',
          status: 'success',
        });
      } else {
        throw new Error(`Invalid ${llmType === 'openai' ? 'OpenAI' : 'Gemini'} configuration`);
      }
    } catch (error) {
      console.error('LLM setup error:', error);
      toast({
        title: 'LLM Setup Failed',
        description: error instanceof Error ? error.message : 'Failed to configure AI assistant',
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" mb={2}>
            Welcome to Novelist Guide
          </Heading>
          <Text>Let's set up your writing environment</Text>
        </Box>

        <Stepper index={activeStep} orientation="vertical" height="400px">
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box flexShrink="0">
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </Box>

              <StepSeparator />
            </Step>
          ))}
        </Stepper>

        {activeStep === 3 ? (
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Choose your AI Assistant</FormLabel>
              <RadioGroup value={llmType} onChange={(value: 'openai' | 'gemini') => setLLMType(value)}>
                <VStack align="start">
                  <Radio value="openai">OpenAI (GPT-3.5/4)</Radio>
                  <Radio value="gemini">Google Gemini</Radio>
                </VStack>
              </RadioGroup>
            </FormControl>

            <FormControl>
              <FormLabel>API Key</FormLabel>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${llmType === 'openai' ? 'OpenAI' : 'Gemini'} API key`}
              />
              <FormHelperText>
                Your API key will be stored securely and used only for your account
              </FormHelperText>
            </FormControl>

            {llmType === 'gemini' && (
              <FormControl>
                <FormLabel>Project ID</FormLabel>
                <Input
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="Enter your Google Cloud Project ID"
                />
              </FormControl>
            )}

            {llmType === 'openai' && availableModels.length > 0 && (
              <FormControl>
                <FormLabel>Model</FormLabel>
                <Select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                  {availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button
              colorScheme="blue"
              onClick={handleLLMSetup}
              isLoading={isLoading}
              leftIcon={<Icon as={FiKey} />}
            >
              Configure AI Assistant
            </Button>
          </VStack>
        ) : (
          <Box>
            <Button
              colorScheme="blue"
              isLoading={isLoading}
              onClick={handleGoogleSetup}
              leftIcon={<Icon as={FiCloud} />}
              isDisabled={!session || activeStep > 2}
              width="full"
            >
              {isLoading ? 'Setting up...' : 'Start Setup'}
            </Button>
          </Box>
        )}

        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Text>Google Cloud Setup</Text>
            <Icon
              as={FiCheck}
              color={setupStatus.google.hasDriveAccess ? 'green.500' : 'gray.300'}
            />
          </HStack>
          <Progress
            value={
              Object.values(setupStatus.google).filter(Boolean).length * 25
            }
            size="sm"
            colorScheme="blue"
          />

          <HStack justify="space-between">
            <Text>AI Assistant Setup</Text>
            <Icon
              as={FiCheck}
              color={setupStatus.llm.isConfigured ? 'green.500' : 'gray.300'}
            />
          </HStack>
          <Progress
            value={
              setupStatus.llm.isConfigured ? 100 : 0
            }
            size="sm"
            colorScheme="blue"
          />
        </VStack>
      </VStack>
    </Container>
  );
} 