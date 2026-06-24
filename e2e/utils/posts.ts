import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const repoRoot = path.resolve(__dirname, '..', '..');
const postsDir = path.join(repoRoot, '_posts');

export const TEST_POST_FILENAME = '2099-01-01-e2e-test-post.md';

export function testPostPath(filename = TEST_POST_FILENAME): string {
  return path.join(postsDir, filename);
}

export function writeTestPost(options: {
  title: string;
  excerpt: string;
  body?: string;
  filename?: string;
}): void {
  const content = `---
title: "${options.title}"
date: 2099-01-01
tags: [E2E, Testing]
excerpt: "${options.excerpt}"
---
${options.body ?? 'End-to-end test post body.'}
`;

  fs.mkdirSync(postsDir, { recursive: true });
  fs.writeFileSync(testPostPath(options.filename), content, 'utf8');
}

export function removeTestPost(filename = TEST_POST_FILENAME): void {
  const filePath = testPostPath(filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function rebuildProjectsJson(): void {
  execSync('node scripts/build-projects.js', {
    cwd: repoRoot,
    stdio: 'pipe',
  });
}

export function resetTestPosts(): void {
  removeTestPost();
  rebuildProjectsJson();
}
