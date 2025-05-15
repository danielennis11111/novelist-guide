'use client'

import {
  Box,
  Button,
  Container,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Textarea,
  VStack,
  Text,
  List,
  ListItem,
  Badge,
  useToast,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { TextAnalyzer as TextAnalyzerUtil } from '../world-bible/textAnalyzer'
import { Character, Scene, Location, Prop } from '../world-bible/types'
import { ContentLoader } from '../world-bible/contentLoader'
import CharacterAnalysis from './CharacterAnalysis'

export default function TextAnalyzer() {
  const [text, setText] = useState('')
  const [characterName, setCharacterName] = useState('')
  const [analysis, setAnalysis] = useState<{
    character?: Partial<Character>
    scene?: Partial<Scene>
    locations?: Partial<Location>[]
    props?: Partial<Prop>[]
  }>({})
  const [relatedScenes, setRelatedScenes] = useState<{
    title: string
    emotionalTone: string
    keyDialogue: Array<{ quote: string; significance: string }>
  }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (analysis.character?.name) {
      loadRelatedContent()
    }
  }, [analysis.character?.name])

  const loadRelatedContent = async () => {
    try {
      const response = await fetch(`/api/content?query=${encodeURIComponent(analysis.character?.name || '')}`);
      const content = await response.json();
      const scenes = content.scenes.map((scene: Scene) => ({
        title: scene.title,
        emotionalTone: scene.emotionalTone,
        keyDialogue: scene.keyDialogue.filter((d: { characterId: string; quote: string; significance: string }) => 
          d.characterId === analysis.character?.id
        ),
      }));
      setRelatedScenes(scenes);
    } catch (error) {
      console.error('Error loading related content:', error);
    }
  }

  const handleAnalyze = async () => {
    if (!text) return;

    setIsLoading(true);
    try {
      const character = characterName
        ? TextAnalyzerUtil.analyzeCharacterTraits(text, characterName)
        : undefined;
      const scene = TextAnalyzerUtil.analyzeScene(text);
      const locations = TextAnalyzerUtil.analyzeLocation(text);
      const props = TextAnalyzerUtil.analyzeProps(text);

      setAnalysis({ character, scene, locations, props });

      // Save the analysis results
      if (character) {
        const characterData = {
          ...character,
          id: crypto.randomUUID(),
          role: 'SUPPORTING',
          firstAppearance: text.substring(0, 100),
          physicalDescription: '',
          motivation: '',
          backstory: '',
          relationships: [],
          arc: {
            startingState: '',
            keyChanges: [],
            endingState: '',
          },
          notes: [],
        } as Character;

        const response = await fetch('/api/content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            character: characterData,
            saveVersion: true
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save character analysis');
        }

        toast({
          title: 'Analysis saved',
          description: 'Character analysis has been saved to your world bible.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error during analysis:', error);
      toast({
        title: 'Analysis error',
        description: 'There was an error analyzing the text.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl">
          Novel Text Analyzer
        </Heading>

        <Box>
          <Text mb={2}>Paste your text here:</Text>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            height="200px"
            placeholder="Paste a scene or chapter from your novel here..."
          />
        </Box>

        <Box>
          <Text mb={2}>Character to analyze (optional):</Text>
          <Textarea
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Enter a character name to analyze their traits..."
            size="sm"
          />
        </Box>

        <Button
          colorScheme="blue"
          onClick={handleAnalyze}
          isLoading={isLoading}
        >
          Analyze Text
        </Button>

        {Object.keys(analysis).length > 0 && (
          <Tabs>
            <TabList>
              {analysis.character && <Tab>Character Analysis</Tab>}
              {analysis.scene && <Tab>Scene Analysis</Tab>}
              {analysis.locations?.length && <Tab>Locations</Tab>}
              {analysis.props?.length && <Tab>Props</Tab>}
            </TabList>

            <TabPanels>
              {analysis.character && (
                <TabPanel>
                  <CharacterAnalysis
                    character={analysis.character}
                    relatedScenes={relatedScenes}
                  />
                </TabPanel>
              )}

              {analysis.scene && (
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text fontWeight="bold">Characters Present:</Text>
                      <List>
                        {analysis.scene.charactersPresent?.map((char, i) => (
                          <ListItem key={i}>
                            <Badge colorScheme="blue">{char}</Badge>
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    <Box>
                      <Text fontWeight="bold">Key Dialogue:</Text>
                      <List>
                        {analysis.scene.keyDialogue?.map((dialogue, i) => (
                          <ListItem key={i}>
                            <Text>
                              <Badge colorScheme="green">{dialogue.characterId}</Badge>: "{dialogue.quote}"
                            </Text>
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    <Box>
                      <Text fontWeight="bold">Emotional Tone:</Text>
                      <Badge colorScheme="purple">{analysis.scene.emotionalTone}</Badge>
                    </Box>

                    <Box>
                      <Text fontWeight="bold">Props Used:</Text>
                      <List>
                        {analysis.scene.props?.map((prop, i) => (
                          <ListItem key={i}>
                            <Badge colorScheme="orange">{prop}</Badge>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </VStack>
                </TabPanel>
              )}

              {analysis.locations?.length && (
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    {analysis.locations.map((location, i) => (
                      <Box key={i} p={4} borderWidth={1} borderRadius="md">
                        <Heading size="sm">{location.name}</Heading>
                        <Text mt={2}>{location.description?.visual}</Text>
                        <Badge mt={2} colorScheme="purple">
                          Atmosphere: {location.atmosphere}
                        </Badge>
                      </Box>
                    ))}
                  </VStack>
                </TabPanel>
              )}

              {analysis.props?.length && (
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    {analysis.props.map((prop, i) => (
                      <Box key={i} p={4} borderWidth={1} borderRadius="md">
                        <Heading size="sm">{prop.name}</Heading>
                        <Badge colorScheme="orange">{prop.type}</Badge>
                        <Text mt={2}>{prop.description}</Text>
                      </Box>
                    ))}
                  </VStack>
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        )}
      </VStack>
    </Container>
  )
} 