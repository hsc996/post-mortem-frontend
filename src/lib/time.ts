export const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
