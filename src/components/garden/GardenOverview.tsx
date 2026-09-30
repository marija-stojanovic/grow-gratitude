import React from 'react';
import { Button, Card, Copy } from '../UI';

export function GardenOverview({
  activeCount,
  completedCount,
  plantingOpen,
  onTogglePlanting,
}: {
  activeCount: number;
  completedCount: number;
  plantingOpen: boolean;
  onTogglePlanting: () => void;
}) {
  return (
    <Card tinted>
      <Copy heading>Moja bašta</Copy>
      <Copy muted>
        {activeCount} aktivnih biljaka · {completedCount} potpuno uzgojenih
      </Copy>
      <Button
        label={plantingOpen ? 'Zatvori izbor' : 'Dodaj novu biljku'}
        onPress={onTogglePlanting}
      />
    </Card>
  );
}
