import { Suspense } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import APIKeySettings from '@/components/settings/APIKeySettings';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">AI Integration Settings</h2>
            <p className="text-muted-foreground">
              Configure your AI API keys for enhanced writing assistance
            </p>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <APIKeySettings />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 