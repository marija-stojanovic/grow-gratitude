import React from 'react';
import { Card, Copy, EmptyState, Screen } from '../components/UI';

export function StatisticsScreen() {
  return (
    <Screen
      eyebrow="PROSTOR ZA OSVRT"
      title="Statistika"
      description="Upoznaj svoje raspoloženje kroz svakodnevne zapise."
    >
      <Card>
        <EmptyState
          symbol="▥"
          title="Svaki zapis je dio slike"
          description="Još nema evidentiranih raspoloženja. Kada uvedemo unos, ovdje će se pojaviti pregled posljednjih sedam dana i mjesečna statistika."
        />
      </Card>
      <Card tinted>
        <Copy heading>Bez pritiska i ocjenjivanja</Copy>
        <Copy muted>
          Pregled će ti pomoći da se osvrneš na protekle dane. Dani bez unosa
          ostat će prazni, bez pretpostavljanja kako si se osjećala.
        </Copy>
      </Card>
    </Screen>
  );
}
