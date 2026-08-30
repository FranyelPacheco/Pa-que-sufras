jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    getString: jest.fn(() => null),
    set: jest.fn(),
    getNumber: jest.fn(() => 0),
    getBoolean: jest.fn(() => false),
  }),
}));

import { QUESTIONS } from '../src/constants/questions';
import { CHALLENGES } from '../src/constants/challenges';
import { getAssignableQuestions, pickRandomItem, shuffleArray } from '../src/utils/game';
import type { Player } from '../src/types/game';

describe('Questions bank', () => {
  it('should have exactly 250 questions per level (750 total)', () => {
    const level1 = QUESTIONS.filter((q) => q.level === 1);
    const level2 = QUESTIONS.filter((q) => q.level === 2);
    const level3 = QUESTIONS.filter((q) => q.level === 3);

    expect(level1.length).toBe(250);
    expect(level2.length).toBe(250);
    expect(level3.length).toBe(250);
    expect(QUESTIONS.length).toBe(750);
  });

  it('should have unique IDs for all questions', () => {
    const ids = QUESTIONS.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid genderTarget values', () => {
    QUESTIONS.forEach((q) => {
      expect(['all', 'H', 'M']).toContain(q.genderTarget);
    });
  });

  it('should have valid level values', () => {
    QUESTIONS.forEach((q) => {
      expect([1, 2, 3]).toContain(q.level);
    });
  });
});

describe('Challenges bank', () => {
  it('should have at least 20 challenges per level', () => {
    expect(CHALLENGES[1].length).toBeGreaterThanOrEqual(20);
    expect(CHALLENGES[2].length).toBeGreaterThanOrEqual(20);
    expect(CHALLENGES[3].length).toBeGreaterThanOrEqual(20);
    expect(CHALLENGES[4].length).toBeGreaterThanOrEqual(20);
  });

  it('should contain non-empty strings', () => {
    [1, 2, 3, 4].forEach((lvl) => {
      CHALLENGES[lvl as 1 | 2 | 3 | 4].forEach((ch) => {
        expect(typeof ch).toBe('string');
        expect(ch.trim().length).toBeGreaterThan(5);
      });
    });
  });
});

describe('Question assignment logic', () => {
  const malePlayer: Player = {
    id: '1',
    name: 'Carlos',
    gender: 'H',
    avatarColor: '#FF2E63',
    avatarIndex: 0,
  };

  const femalePlayer: Player = {
    id: '2',
    name: 'María',
    gender: 'M',
    avatarColor: '#4ADE80',
    avatarIndex: 1,
  };

  const mixedPlayers: Player[] = [malePlayer, femalePlayer];
  const onlyMalePlayers: Player[] = [malePlayer];
  const onlyFemalePlayers: Player[] = [femalePlayer];

  it('should return all level 1 questions for mixed group', () => {
    const pool = getAssignableQuestions(1, mixedPlayers);
    const total = QUESTIONS.filter((q) => q.level === 1).length;
    expect(pool.length).toBe(total);
  });

  it('should filter out male-only questions when only females play', () => {
    const pool = getAssignableQuestions(2, onlyFemalePlayers);
    const hasMaleOnly = pool.some((q) => q.genderTarget === 'H');
    expect(hasMaleOnly).toBe(false);
  });

  it('should filter out female-only questions when only males play', () => {
    const pool = getAssignableQuestions(2, onlyMalePlayers);
    const hasFemaleOnly = pool.some((q) => q.genderTarget === 'M');
    expect(hasFemaleOnly).toBe(false);
  });

  it('should exclude already-used question IDs', () => {
    const pool = getAssignableQuestions(1, mixedPlayers, ['q-l1-01', 'q-l1-02']);
    const total = QUESTIONS.filter((q) => q.level === 1).length;
    expect(pool.length).toBe(total - 2);
    expect(pool.some((q) => q.id === 'q-l1-01')).toBe(false);
    expect(pool.some((q) => q.id === 'q-l1-02')).toBe(false);
  });

  it('should return empty pool when all questions are excluded', () => {
    const allIds = QUESTIONS.filter((q) => q.level === 1).map((q) => q.id);
    const pool = getAssignableQuestions(1, mixedPlayers, allIds);
    expect(pool.length).toBe(0);
  });

  it('should handle empty player list', () => {
    const pool = getAssignableQuestions(1, []);
    expect(pool.length).toBe(0);
  });
});

describe('pickRandomItem', () => {
  it('should return null for empty array', () => {
    expect(pickRandomItem([])).toBeNull();
  });

  it('should return the only item for single-element array', () => {
    expect(pickRandomItem([42])).toBe(42);
  });

  it('should return an item from the array', () => {
    const items = [1, 2, 3, 4, 5];
    const result = pickRandomItem(items);
    expect(items).toContain(result);
  });
});

describe('shuffleArray', () => {
  it('should return an array with the same elements', () => {
    const input = [1, 2, 3, 4, 5, 6];
    const output = shuffleArray(input);
    expect(output.length).toBe(input.length);
    expect([...output].sort()).toEqual([...input].sort());
  });

  it('should not mutate the original array', () => {
    const input = [1, 2, 3, 4, 5];
    const original = [...input];
    shuffleArray(input);
    expect(input).toEqual(original);
  });

  it('should handle empty and single-element arrays', () => {
    expect(shuffleArray([])).toEqual([]);
    expect(shuffleArray([42])).toEqual([42]);
  });
});

describe('Shuffle-bag turn fairness', () => {
  it('should give every player exactly one turn per full cycle', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const queue: string[] = shuffleArray(ids);
    const turns: string[] = [];
    const cycle = [...queue];

    while (queue.length > 0) {
      const next = queue.pop();
      if (next) turns.push(next);
    }

    expect(turns.length).toBe(ids.length);
    expect([...turns].sort()).toEqual([...ids].sort());
    expect(new Set(turns).size).toBe(ids.length);
    expect([...cycle].sort()).toEqual([...ids].sort());
  });
});
