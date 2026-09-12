import React from 'react';
import { Badge, Button, Card, Copy, Screen } from '../components/UI';
import { SeedIllustration } from '../components/SeedIllustration';

export function TodayScreen({ onOpenGarden }: { onOpenGarden: () => void }) {
  const date = new Intl.DateTimeFormat('bs-BA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  return (
    <Screen
      eyebrow="GROWGRATITUDE · DANAS"
      title="Svaki dan, malo zahvalnosti."
      description={date}
    >
      <Card tinted>
        <SeedIllustration />
        <Copy heading>Tvoja bašta počinje malim korakom.</Copy>
        <Copy muted>
          Jedna zahvalnost, jedno zalivanje. Upoznaj teme za svoju buduću baštu.
        </Copy>
        <Button label="Pogledaj baštu" onPress={onOpenGarden} />
      </Card>
      <Card>
        <Copy heading>Kako si danas?</Copy>
        <Copy muted>
          Ovdje ćeš bilježiti raspoloženje jednom dnevno i pratiti kako se
          osjećaš kroz vrijeme.
        </Copy>
        <Badge>Unos stiže u narednoj fazi</Badge>
      </Card>
      <Card>
        <Copy heading>Trenutak za sebe</Copy>
        <Copy muted>
          Spin Wheel će ti ponuditi male izazove za dan. Moći ćeš dodati i svoje
          ideje.
        </Copy>
        <Badge>Izazovi su u pripremi</Badge>
      </Card>
    </Screen>
  );
}
