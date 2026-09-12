import React from 'react';
import { Card, Copy, EmptyState, Screen } from '../components/UI';

export function HistoryScreen() {
  return (
    <Screen
      eyebrow="SAČUVANI TRENUTCI"
      title="Historija"
      description="Mjesto na kojem će se čuvati tvoje male i velike zahvalnosti."
    >
      <Card>
        <EmptyState
          symbol="≡"
          title="Još nema zapisanih zahvalnosti"
          description="Nakon što uvedemo dnevne unose, ovdje ćeš ih pregledati od najnovijeg prema najstarijem."
        />
      </Card>
      <Card tinted>
        <Copy heading>Uspomene ostaju</Copy>
        <Copy muted>
          Prekid niza rasta neće obrisati tvoje zahvalnosti. Ovdje ćeš ih moći
          ponovo pročitati i pronaći prema biljci, temi ili datumu.
        </Copy>
      </Card>
    </Screen>
  );
}
