import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Box, Spinner, Center } from '@chakra-ui/react';
import WorldBiblePage from '@/components/WorldBiblePage';
import { Novel } from '@/types/novel';

const WorldBiblePagePlaceholder = () => {
  const router = useRouter();
  const { novelId } = router.query;
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validNovelId = typeof novelId === 'string' ? novelId : undefined;
    if (validNovelId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const novelRes = await fetch(`/api/novels/${validNovelId}`);
          if (novelRes.ok) {
            const novelData = await novelRes.json();
            setNovel(novelData);
          } else {
            console.error('Failed to fetch novel data for world bible page');
            setNovel(null);
          }
        } catch (error) {
          console.error('Error fetching novel data:', error);
          setNovel(null);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [novelId]);

  if (loading) {
    return <div>Loading world bible information...</div>;
  }

  if (!novel) {
    return <div>Could not load novel information for the world bible.</div>;
  }

  return (
    <div>
      <h1>World Bible for: {novel.title}</h1>
      <p>World bible content and manager will be implemented here.</p>
      {/* 
        When WorldBibleManager component is ready, it will be used like this:
        <WorldBibleManager entries={entries} quests={quests} ... /> 
      */}
    </div>
  );
};

export default WorldBiblePagePlaceholder; 