import { describe, it, expect } from 'vitest';
import { LISTINGS, plantedListingFor, listingById } from '@/data/listings';
import { ARCHETYPE_IDS } from '@/lib/types';

describe('listings', () => {
  it('has exactly one planted listing per archetype', () => {
    for (const id of ARCHETYPE_IDS) {
      const planted = LISTINGS.filter((l) => l.isPlanted && l.archetypeId === id);
      expect(planted).toHaveLength(1);
    }
  });
  it('includes genuine decoys', () => {
    expect(LISTINGS.some((l) => !l.isPlanted && l.archetypeId === null)).toBe(true);
  });
  it('marks the fake-payment listing as player-as-seller', () => {
    expect(plantedListingFor('fake_payment_proof').playerIsSeller).toBe(true);
  });
  it('listingById returns the correct listing and undefined for unknown id', () => {
    expect(listingById('p-off')?.id).toBe('p-off');
    expect(listingById('does-not-exist')).toBeUndefined();
  });
  it('all non-planted listings have archetypeId null', () => {
    LISTINGS.filter((l) => !l.isPlanted).forEach((l) => {
      expect(l.archetypeId).toBeNull();
    });
  });
});
