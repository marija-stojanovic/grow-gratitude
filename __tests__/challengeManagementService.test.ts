jest.mock('../src/repositories/challengeRepository', () => ({
  challengeRepository: {
    findById: jest.fn(),
    findByTitle: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    updateCustom: jest.fn(),
    setActive: jest.fn(),
    deleteCustom: jest.fn(),
  },
}));

import { challengeRepository } from '../src/repositories/challengeRepository';
import {
  ChallengeManagementError,
  createCustomChallenge,
  deleteCustomChallenge,
  renameCustomChallenge,
  setChallengeActive,
} from '../src/services/challengeManagementService';
import type { Challenge } from '../src/types';

const mockFindById = jest.mocked(challengeRepository.findById);
const mockFindByTitle = jest.mocked(challengeRepository.findByTitle);
const mockFindAll = jest.mocked(challengeRepository.findAll);
const mockCreate = jest.mocked(challengeRepository.create);
const mockUpdateCustom = jest.mocked(challengeRepository.updateCustom);
const mockSetActive = jest.mocked(challengeRepository.setActive);
const mockDeleteCustom = jest.mocked(challengeRepository.deleteCustom);

const builtIn: Challenge = {
  id: 'built-in',
  title: 'Prošetaj 15 minuta.',
  origin: 'built-in',
  isActive: true,
  createdAt: '2026-09-23T08:00:00.000Z',
  updatedAt: '2026-09-23T08:00:00.000Z',
};
const custom: Challenge = {
  ...builtIn,
  id: 'custom',
  title: 'Pročitaj deset stranica.',
  origin: 'custom',
};

beforeEach(() => jest.clearAllMocks());

test('dodaje očišćen korisnički izazov kao aktivan', async () => {
  mockFindByTitle.mockResolvedValue(null);
  mockCreate.mockResolvedValue(undefined);

  const challenge = await createCustomChallenge({
    id: 'new-custom',
    title: '  Napiši kratku poruku prijatelju.  ',
    createdAt: '2026-09-23T10:00:00.000Z',
  });

  expect(challenge).toMatchObject({
    title: 'Napiši kratku poruku prijatelju.',
    origin: 'custom',
    isActive: true,
  });
  expect(mockCreate).toHaveBeenCalledWith(challenge);
});

test('ne dozvoljava dupli naziv izazova', async () => {
  mockFindByTitle.mockResolvedValue(builtIn);

  await expect(
    createCustomChallenge({
      id: 'new-custom',
      title: builtIn.title,
      createdAt: '2026-09-23T10:00:00.000Z',
    }),
  ).rejects.toMatchObject<Partial<ChallengeManagementError>>({
    code: 'duplicate-title',
  });
  expect(mockCreate).not.toHaveBeenCalled();
});

test('ugrađeni izazov se ne može uređivati', async () => {
  mockFindById.mockResolvedValue(builtIn);

  await expect(
    renameCustomChallenge({
      id: builtIn.id,
      title: 'Novi naziv',
      updatedAt: '2026-09-23T10:00:00.000Z',
    }),
  ).rejects.toMatchObject<Partial<ChallengeManagementError>>({
    code: 'built-in-read-only',
  });
  expect(mockUpdateCustom).not.toHaveBeenCalled();
});

test('uređuje naziv korisničkog izazova', async () => {
  mockFindById.mockResolvedValue(custom);
  mockFindByTitle.mockResolvedValue(null);
  mockUpdateCustom.mockResolvedValue(true);

  const updated = await renameCustomChallenge({
    id: custom.id,
    title: '  Pročitaj jedno poglavlje. ',
    updatedAt: '2026-09-23T10:00:00.000Z',
  });

  expect(updated.title).toBe('Pročitaj jedno poglavlje.');
  expect(mockUpdateCustom).toHaveBeenCalledWith(
    custom.id,
    'Pročitaj jedno poglavlje.',
    '2026-09-23T10:00:00.000Z',
  );
});

test('ne isključuje posljednji aktivni izazov', async () => {
  mockFindById.mockResolvedValue(custom);
  mockFindAll.mockResolvedValue([custom]);

  await expect(
    setChallengeActive({
      id: custom.id,
      isActive: false,
      updatedAt: '2026-09-23T10:00:00.000Z',
    }),
  ).rejects.toMatchObject<Partial<ChallengeManagementError>>({
    code: 'last-active-challenge',
  });
  expect(mockSetActive).not.toHaveBeenCalled();
});

test('dozvoljava isključivanje kada drugi aktivni izazov ostaje', async () => {
  mockFindById.mockResolvedValue(builtIn);
  mockFindAll.mockResolvedValue([builtIn, custom]);
  mockSetActive.mockResolvedValue(true);

  const updated = await setChallengeActive({
    id: builtIn.id,
    isActive: false,
    updatedAt: '2026-09-23T10:00:00.000Z',
  });

  expect(updated.isActive).toBe(false);
  expect(mockSetActive).toHaveBeenCalledWith(
    builtIn.id,
    false,
    '2026-09-23T10:00:00.000Z',
  );
});

test('ugrađeni izazov se ne može obrisati', async () => {
  mockFindById.mockResolvedValue(builtIn);
  mockFindAll.mockResolvedValue([builtIn, custom]);

  await expect(deleteCustomChallenge(builtIn.id)).rejects.toMatchObject<
    Partial<ChallengeManagementError>
  >({ code: 'built-in-read-only' });
  expect(mockDeleteCustom).not.toHaveBeenCalled();
});

test('briše korisnički izazov kada drugi aktivni izazov ostaje', async () => {
  mockFindById.mockResolvedValue(custom);
  mockFindAll.mockResolvedValue([custom, builtIn]);
  mockDeleteCustom.mockResolvedValue(true);

  await expect(deleteCustomChallenge(custom.id)).resolves.toBe(custom);
  expect(mockDeleteCustom).toHaveBeenCalledWith(custom.id);
});
