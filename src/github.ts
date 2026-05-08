import { Octokit } from "@octokit/rest";

export class GitHubService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }
 async getPR(owner: string, repo: string, pull_number: number) {
    const { data } = await this.octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
    });
    return data;
  }

  async getDiff(owner: string, repo: string, pull_number: number) {
    const { data: files } = await this.octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number,
    });
    return files;
  }

  async getFileContent(owner: string, repo: string, fileSha: string | null = ''): Promise<string> {
    const { data } = await this.octokit.rest.git.getBlob({
      owner,
      repo,
      file_sha: fileSha || '',
    });
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }
}

export const githubService = new GitHubService(process.env.GITHUB_TOKEN!);