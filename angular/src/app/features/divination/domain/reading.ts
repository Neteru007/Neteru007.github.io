import type { TarotCard } from '../data/deck.data';
export const positions = ['Минуле', 'Теперішнє', 'Майбутнє'] as const;
export function readingText(card: TarotCard, index: number): string {
  if (index === 0)
    return (
      'У позиції минулого карта пропонує озирнутися на тему: ' +
      card.theme +
      '. Який досвід або давній вибір впливає на ситуацію сьогодні?'
    );
  if (index === 1)
    return (
      'У позиції теперішнього зверніть увагу на тему: ' +
      card.theme +
      '. Як вона проявляється у ваших думках, почуттях або діях зараз?'
    );
  return (
    'У позиції майбутнього розгляньте можливий напрямок: ' +
    card.theme +
    '. Це запрошення подумати про наслідки ваших наступних кроків, а не обіцянка події.'
  );
}
