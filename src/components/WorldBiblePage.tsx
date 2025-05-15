import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Novel } from '@/types/novel';
import WorldBibleElements from './WorldBibleElements';
import WorldBiblePanel from './WorldBiblePanel';

interface WorldBiblePageProps {
  novel: Novel;
  accessToken: string;
}

export default function WorldBiblePage({ novel, accessToken }: WorldBiblePageProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading size="lg" mb={2}>
          World Bible
        </Heading>
        <Text color="gray.600">
          Manage your world building elements, characters, and writing quests
        </Text>
      </Box>

      <Grid
        templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
        gap={8}
        alignItems="start"
      >
        <GridItem>
          <Box
            bg={bgColor}
            borderWidth={1}
            borderColor={borderColor}
            borderRadius="lg"
            p={6}
          >
            <WorldBibleElements novel={novel} />
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
            <WorldBiblePanel novel={novel} accessToken={accessToken} />
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
} 