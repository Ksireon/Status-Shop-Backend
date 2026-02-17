export function parseDurationSeconds(input: string | undefined): number {
  if (!input) return 900;

  const trimmed = input.trim();
  if (!trimmed) return 900;

  if (/^\d+$/.test(trimmed)) return Number(trimmed);

  const match = /^(\d+)\s*([smhd])$/i.exec(trimmed);
  if (!match) return 900;

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (!Number.isFinite(value) || value <= 0) return 900;

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      return 900;
  }
}
