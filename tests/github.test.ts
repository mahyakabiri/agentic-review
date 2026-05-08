import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubService } from '../src/github';

const { mockListFiles, mockGetPR } = vi.hoisted(() => ({
  mockListFiles: vi.fn(),
  mockGetPR: vi.fn(),
}));

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    rest: {
      pulls: {
        listFiles: mockListFiles,
        get: mockGetPR,
      },
    },
  })),
}));

describe('GitHubService', () => {
  let service: GitHubService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GitHubService('fake-token');
  });

  describe('getDiff', () => {
    it('returns the list of changed files', async () => {
      const fakeFiles = [
        { filename: 'src/auth.ts', additions: 10, deletions: 2, patch: '@@ -1 +1 @@' },
      ];
      mockListFiles.mockResolvedValue({ data: fakeFiles });

      const result = await service.getDiff('owner', 'repo', 1);

      expect(result).toEqual(fakeFiles);
      expect(mockListFiles).toHaveBeenCalledWith({ owner: 'owner', repo: 'repo', pull_number: 1 });
    });

    it('propagates errors from the API', async () => {
      mockListFiles.mockRejectedValue(new Error('Not Found'));
      await expect(service.getDiff('owner', 'repo', 999)).rejects.toThrow('Not Found');
    });
  });

  describe('getPR', () => {
    it('returns PR metadata', async () => {
      const fakePR = { number: 1, title: 'Fix auth bug', state: 'open' };
      mockGetPR.mockResolvedValue({ data: fakePR });

      const result = await service.getPR('owner', 'repo', 1);

      expect(result).toEqual(fakePR);
      expect(mockGetPR).toHaveBeenCalledWith({ owner: 'owner', repo: 'repo', pull_number: 1 });
    });
  });
});
