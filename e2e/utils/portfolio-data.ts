import fs from 'fs';
import path from 'path';

const portfolioDataPath = path.resolve(__dirname, '..', '..', 'assets', 'data', 'portfolio-data.json');

export interface ExperienceEntry {
  role: string;
  company: string;
  period: string;
  start: string;
  end: string;
  summary: string;
  highlights: string[];
}

export function loadExperiences(): ExperienceEntry[] {
  const raw = JSON.parse(fs.readFileSync(portfolioDataPath, 'utf8')) as { experiences: ExperienceEntry[] };
  return raw.experiences;
}

export function formatExperienceMonth(dateValue: string): string {
  const [year, month] = dateValue.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
}

export function formatExperienceRange(start: string, end: string): string {
  const startLabel = formatExperienceMonth(start);
  if (end === 'present') {
    return `${startLabel} – Present`;
  }
  return `${startLabel} – ${formatExperienceMonth(end)}`;
}

export function totalHighlightCount(experiences: ExperienceEntry[]): number {
  return experiences.reduce((sum, experience) => sum + experience.highlights.length, 0);
}
