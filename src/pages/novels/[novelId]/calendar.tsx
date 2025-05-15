import Calendar from '@/components/Calendar';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Novel } from '@/types/novel';
import { WritingReminder } from '@/lib/calendar-service';

const NovelCalendarPage = () => {
  const router = useRouter();
  const { novelId } = router.query;
  const [reminders, setReminders] = useState<WritingReminder[]>([]);
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
            console.error('Failed to fetch novel');
            setNovel(null);
          }

          const remindersRes = await fetch(`/api/novels/${validNovelId}/calendar`);
          if (remindersRes.ok) {
            const remindersData = await remindersRes.json();
            setReminders(remindersData);
          } else {
            console.error('Failed to fetch reminders');
            setReminders([]);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          setNovel(null);
          setReminders([]);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [novelId]);

  const handleAddReminder = async (reminder: Omit<WritingReminder, 'id'>) => {
    const validNovelId = typeof novelId === 'string' ? novelId : undefined;
    if (validNovelId && novel) {
      try {
        const response = await fetch(`/api/novels/${validNovelId}/calendar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reminder),
        });
        if (response.ok) {
          const newReminder = await response.json();
          setReminders((prev) => [...prev, newReminder]);
        } else {
          console.error('Failed to add reminder');
        }
      } catch (error) {
        console.error('Error adding reminder:', error);
      }
    }
  };

  const handleUpdateReminder = async (reminder: WritingReminder) => {
    const validNovelId = typeof novelId === 'string' ? novelId : undefined;
    if (validNovelId) {
      try {
        const response = await fetch(`/api/novels/${validNovelId}/calendar/${reminder.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reminder),
        });
        if (response.ok) {
          const updatedReminder = await response.json();
          setReminders((prev) =>
            prev.map((r) => (r.id === updatedReminder.id ? updatedReminder : r))
          );
        } else {
          console.error('Failed to update reminder');
        }
      } catch (error) {
        console.error('Error updating reminder:', error);
      }
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    const validNovelId = typeof novelId === 'string' ? novelId : undefined;
    if (validNovelId) {
      try {
        const response = await fetch(`/api/novels/${validNovelId}/calendar/${reminderId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setReminders((prev) => prev.filter((r) => r.id !== reminderId));
        } else {
          console.error('Failed to delete reminder');
        }
      } catch (error) {
        console.error('Error deleting reminder:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading calendar...</div>;
  }

  if (!novel) {
    return <div>Novel not found or error loading novel data. Please check the novel ID or try again later.</div>;
  }

  return (
    <div>
      <h1>Calendar for {novel.title}</h1>
      <Calendar
        novel={novel}
        reminders={reminders}
        onAddReminder={handleAddReminder}
        onUpdateReminder={handleUpdateReminder}
        onDeleteReminder={handleDeleteReminder}
      />
    </div>
  );
};

export default NovelCalendarPage; 