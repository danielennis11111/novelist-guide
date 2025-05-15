import { google } from 'googleapis';
import { prisma } from './db';
import { Novel } from '@/types/novel';

export interface WritingReminder {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  recurring: boolean;
  recurrenceRule?: string;
  calendarEventId?: string;
}

export class CalendarService {
  private static readonly REMINDER_DURATION = 60; // minutes

  constructor(private accessToken: string) {
    this.calendar = google.calendar({ version: 'v3', auth: this.getAuth() });
  }

  private calendar: any;

  private getAuth() {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: this.accessToken });
    return auth;
  }

  async createWritingReminder(
    userId: string,
    novelId: string,
    reminder: Omit<WritingReminder, 'id' | 'calendarEventId'>
  ): Promise<WritingReminder> {
    // Create calendar event
    const event = await this.calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: reminder.title,
        description: reminder.description,
        start: {
          dateTime: reminder.startTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: reminder.endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
        recurrence: reminder.recurring ? [reminder.recurrenceRule] : undefined,
      },
    });

    // Save reminder to database
    const savedReminder = await prisma.writingReminder.create({
      data: {
        userId,
        novelId,
        title: reminder.title,
        description: reminder.description,
        startTime: reminder.startTime,
        endTime: reminder.endTime,
        recurring: reminder.recurring,
        recurrenceRule: reminder.recurrenceRule,
        calendarEventId: event.data.id,
      },
    });

    return savedReminder;
  }

  async getUpcomingReminders(userId: string): Promise<WritingReminder[]> {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + 7);

    return prisma.writingReminder.findMany({
      where: {
        userId,
        startTime: {
          gte: now,
          lte: endOfWeek,
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async updateReminder(
    reminderId: string,
    updates: Partial<WritingReminder>
  ): Promise<WritingReminder> {
    const reminder = await prisma.writingReminder.findUnique({
      where: { id: reminderId },
    });

    if (!reminder) throw new Error('Reminder not found');

    // Update calendar event if it exists
    if (reminder.calendarEventId) {
      await this.calendar.events.update({
        calendarId: 'primary',
        eventId: reminder.calendarEventId,
        requestBody: {
          summary: updates.title || reminder.title,
          description: updates.description || reminder.description,
          start: updates.startTime
            ? {
                dateTime: updates.startTime,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              }
            : undefined,
          end: updates.endTime
            ? {
                dateTime: updates.endTime,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              }
            : undefined,
          recurrence: updates.recurring ? [updates.recurrenceRule] : undefined,
        },
      });
    }

    // Update database record
    return prisma.writingReminder.update({
      where: { id: reminderId },
      data: updates,
    });
  }

  async deleteReminder(reminderId: string): Promise<void> {
    const reminder = await prisma.writingReminder.findUnique({
      where: { id: reminderId },
    });

    if (!reminder) throw new Error('Reminder not found');

    // Delete calendar event if it exists
    if (reminder.calendarEventId) {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: reminder.calendarEventId,
      });
    }

    // Delete database record
    await prisma.writingReminder.delete({
      where: { id: reminderId },
    });
  }

  async syncNovelSchedule(novel: Novel): Promise<void> {
    // Create default writing schedule based on novel's target audience and genre
    const schedule = this.generateDefaultSchedule(novel);
    
    // Create reminders for each scheduled session
    for (const session of schedule) {
      await this.createWritingReminder(novel.userId, novel.id, {
        title: `Writing Session: ${novel.title}`,
        description: `Time to work on your novel "${novel.title}"`,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime.toISOString(),
        recurring: true,
        recurrenceRule: 'FREQ=WEEKLY',
      });
    }
  }

  private generateDefaultSchedule(novel: Novel): { startTime: Date; endTime: Date }[] {
    const schedule: { startTime: Date; endTime: Date }[] = [];
    const now = new Date();

    // Generate 3 sessions per week
    for (let i = 0; i < 3; i++) {
      const startTime = new Date(now);
      startTime.setDate(now.getDate() + i * 2); // Every other day
      startTime.setHours(18, 0, 0, 0); // 6 PM

      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + CalendarService.REMINDER_DURATION);

      schedule.push({ startTime, endTime });
    }

    return schedule;
  }
} 