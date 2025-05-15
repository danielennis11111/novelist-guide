import { db } from './firebase';
import { 
  doc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  addDoc, 
  getDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { WritingStats, WritingQuest } from '@/types/firestore';

export class GamificationService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async updateWordCount(wordCount: number): Promise<void> {
    const statsRef = collection(db, 'writingStats');
    const q = query(statsRef, where('userId', '==', this.userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Create new stats document
      await addDoc(statsRef, {
        userId: this.userId,
        totalWords: wordCount,
        dailyGoal: 500, // Default daily goal
        currentStreak: 1,
        longestStreak: 1,
        points: wordCount, // Initial points equal to words written
        lastWritingDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const statsDoc = snapshot.docs[0];
      const stats = statsDoc.data() as WritingStats;
      
      // Update existing stats
      await updateDoc(doc(db, 'writingStats', statsDoc.id), {
        totalWords: stats.totalWords + wordCount,
        points: stats.points + wordCount, // Add points for new words
        updatedAt: serverTimestamp(),
      });
    }
  }

  async updateStreak(): Promise<void> {
    const statsRef = collection(db, 'writingStats');
    const q = query(statsRef, where('userId', '==', this.userId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const statsDoc = snapshot.docs[0];
      const stats = statsDoc.data() as WritingStats;
      const lastWritingDate = stats.lastWritingDate.toDate();
      const today = new Date();
      
      // Check if the last writing was yesterday
      const isConsecutiveDay = 
        lastWritingDate.getDate() === today.getDate() - 1 &&
        lastWritingDate.getMonth() === today.getMonth() &&
        lastWritingDate.getFullYear() === today.getFullYear();

      if (isConsecutiveDay) {
        const newStreak = stats.currentStreak + 1;
        await updateDoc(doc(db, 'writingStats', statsDoc.id), {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, stats.longestStreak),
          lastWritingDate: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }
  }

  async resetStreak(): Promise<void> {
    const statsRef = collection(db, 'writingStats');
    const q = query(statsRef, where('userId', '==', this.userId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const statsDoc = snapshot.docs[0];
      await updateDoc(doc(db, 'writingStats', statsDoc.id), {
        currentStreak: 0,
        lastWritingDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }

  async getStats(): Promise<WritingStats | null> {
    const statsRef = collection(db, 'writingStats');
    const q = query(statsRef, where('userId', '==', this.userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;
    const statsDoc = snapshot.docs[0];
    return {
      ...statsDoc.data() as Omit<WritingStats, 'id'>,
      id: statsDoc.id,
    };
  }

  async checkQuestCompletion(): Promise<number> {
    const questsRef = collection(db, 'writingQuests');
    const q = query(
      questsRef,
      where('userId', '==', this.userId),
      where('status', '==', 'completed')
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  async generateDailyQuests(): Promise<void> {
    const questsRef = collection(db, 'writingQuests');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const q = query(
      questsRef,
      where('userId', '==', this.userId),
      where('createdAt', '>=', Timestamp.fromDate(today))
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const quests = [
        {
          title: 'Daily Writing Goal',
          description: 'Write 500 words today',
          type: 'daily',
          status: 'active',
          reward: 50,
          userId: this.userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        {
          title: 'Character Development',
          description: 'Add a new character trait or backstory element',
          type: 'daily',
          status: 'active',
          reward: 30,
          userId: this.userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        {
          title: 'World Building',
          description: 'Create a new world element or expand an existing one',
          type: 'daily',
          status: 'active',
          reward: 40,
          userId: this.userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      ];

      // Create all quests
      await Promise.all(quests.map(quest => addDoc(questsRef, quest)));
    }
  }

  async completeQuest(questId: string): Promise<void> {
    const questRef = doc(db, 'writingQuests', questId);
    const snapshot = await getDoc(questRef);

    if (!snapshot.exists()) {
      throw new Error('Quest not found');
    }

    const quest = snapshot.data() as WritingQuest;
    
    // Update quest status
    await updateDoc(questRef, {
      status: 'completed',
      updatedAt: serverTimestamp(),
    });

    // Update user stats with reward
    const statsRef = collection(db, 'writingStats');
    const q = query(statsRef, where('userId', '==', this.userId));
    const statsSnapshot = await getDocs(q);

    if (!statsSnapshot.empty) {
      const statsDoc = statsSnapshot.docs[0];
      const stats = statsDoc.data() as WritingStats;
      await updateDoc(doc(db, 'writingStats', statsDoc.id), {
        points: stats.points + quest.reward,
        updatedAt: serverTimestamp(),
      });
    }
  }

  async getActiveQuests(): Promise<WritingQuest[]> {
    const questsRef = collection(db, 'writingQuests');
    const q = query(
      questsRef,
      where('userId', '==', this.userId),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...doc.data() as Omit<WritingQuest, 'id'>,
      id: doc.id,
    }));
  }
} 