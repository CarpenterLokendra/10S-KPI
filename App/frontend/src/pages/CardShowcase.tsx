import { useState } from 'react'
import { Card as CardType } from '@/types/game'
import { PlayingCard, CardBack, CardHand, CardPile, SuitIcon } from '@/components/playing-card'
import Button from '@/components/ui/Button'

export default function CardShowcase() {
  const mockHand: CardType[] = [
    { suit: 'hearts', value: 'K' },
    { suit: 'diamonds', value: 'Q' },
    { suit: 'clubs', value: '10' },
    { suit: 'spades', value: '5' },
    { suit: 'hearts', value: '2' },
    { suit: 'diamonds', value: '8' },
  ]

  const mockPlayedCards: CardType[] = [
    { suit: 'hearts', value: '7' },
    { suit: 'clubs', value: 'A' },
    { suit: 'diamonds', value: '3' },
  ]

  const [selectedIndex, setSelectedIndex] = useState<number>()
  const [position, setPosition] = useState<'bottom' | 'top' | 'left' | 'right'>('bottom')

  return (
    <div className="min-h-screen bg-bg-base text-text-primary px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-heading-lg font-rajdhani mb-8">Playing Card Components</h1>

        {/* Suit Icons */}
        <section className="mb-12">
          <h2 className="text-heading-md font-rajdhani mb-4">Suit Icons</h2>
          <div className="flex gap-8 p-6 bg-bg-surface rounded-lg">
            <div className="flex items-center gap-2">
              <SuitIcon suit="hearts" size={32} className="text-red-500" />
              <span>Hearts</span>
            </div>
            <div className="flex items-center gap-2">
              <SuitIcon suit="diamonds" size={32} className="text-red-500" />
              <span>Diamonds</span>
            </div>
            <div className="flex items-center gap-2">
              <SuitIcon suit="clubs" size={32} className="text-text-primary" />
              <span>Clubs</span>
            </div>
            <div className="flex items-center gap-2">
              <SuitIcon suit="spades" size={32} className="text-text-primary" />
              <span>Spades</span>
            </div>
          </div>
        </section>

        {/* Individual Cards */}
        <section className="mb-12">
          <h2 className="text-heading-md font-rajdhani mb-4">Individual Cards</h2>
          <div className="flex gap-6 p-6 bg-bg-surface rounded-lg overflow-x-auto">
            <PlayingCard suit="hearts" value="K" size="lg" />
            <PlayingCard suit="diamonds" value="Q" size="lg" />
            <PlayingCard suit="clubs" value="10" size="lg" />
            <PlayingCard suit="spades" value="A" size="lg" />
            <PlayingCard suit="hearts" value="5" size="lg" isPlayable={false} />
            <PlayingCard suit="clubs" value="3" size="lg" isSelected />
            <CardBack size="lg" />
          </div>
        </section>

        {/* Card Pile */}
        <section className="mb-12">
          <h2 className="text-heading-md font-rajdhani mb-4">Card Pile (Center Table)</h2>
          <div className="p-6 bg-bg-surface rounded-lg flex justify-center">
            <CardPile cards={mockPlayedCards} deckCount={32} cardSize="lg" layout="cascade" />
          </div>
        </section>

        {/* Card Hand */}
        <section className="mb-12">
          <h2 className="text-heading-md font-rajdhani mb-4">Card Hand (Arc Layout)</h2>

          <div className="mb-6 flex gap-4">
            {(['bottom', 'top', 'left', 'right'] as const).map((pos) => (
              <Button
                key={pos}
                variant={position === pos ? 'primary' : 'secondary'}
                onClick={() => setPosition(pos)}
              >
                {pos.charAt(0).toUpperCase() + pos.slice(1)}
              </Button>
            ))}
          </div>

          <div className="h-96 bg-bg-surface rounded-lg flex items-center justify-center relative overflow-hidden">
            <CardHand
              cards={mockHand}
              selectedIndex={selectedIndex}
              position={position}
              onCardClick={(card, index) => setSelectedIndex(index)}
              playableIndices={[0, 2, 4]}
              cardSize="lg"
            />
          </div>

          {selectedIndex !== undefined && (
            <div className="mt-4 p-4 bg-bg-surface rounded text-center">
              <p className="text-text-secondary">
                Selected:{' '}
                <span className="font-semibold text-gold-500">
                  {mockHand[selectedIndex].value} of {mockHand[selectedIndex].suit}
                </span>
              </p>
              <p className="text-xs text-text-muted mt-1">Click a card to select it</p>
            </div>
          )}
        </section>

        {/* Card Sizes */}
        <section className="mb-12">
          <h2 className="text-heading-md font-rajdhani mb-4">Card Sizes</h2>
          <div className="p-6 bg-bg-surface rounded-lg flex gap-8 justify-center items-end">
            <div className="text-center">
              <PlayingCard suit="hearts" value="K" size="sm" />
              <p className="text-xs text-text-secondary mt-2">Small</p>
            </div>
            <div className="text-center">
              <PlayingCard suit="hearts" value="K" size="md" />
              <p className="text-xs text-text-secondary mt-2">Medium</p>
            </div>
            <div className="text-center">
              <PlayingCard suit="hearts" value="K" size="lg" />
              <p className="text-xs text-text-secondary mt-2">Large</p>
            </div>
          </div>
        </section>

        {/* Card States */}
        <section className="mb-12">
          <h2 className="text-heading-md font-rajdhani mb-4">Card States</h2>
          <div className="p-6 bg-bg-surface rounded-lg flex gap-8 justify-center items-center flex-wrap">
            <div className="text-center">
              <PlayingCard suit="hearts" value="K" size="lg" isPlayable />
              <p className="text-xs text-text-secondary mt-2">Playable</p>
            </div>
            <div className="text-center">
              <PlayingCard suit="hearts" value="K" size="lg" isPlayable={false} />
              <p className="text-xs text-text-secondary mt-2">Not Playable</p>
            </div>
            <div className="text-center">
              <PlayingCard suit="hearts" value="K" size="lg" isSelected />
              <p className="text-xs text-text-secondary mt-2">Selected</p>
            </div>
            <div className="text-center">
              <PlayingCard suit="diamonds" value="10" size="lg" />
              <p className="text-xs text-text-secondary mt-2">Red Suit (10)</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
