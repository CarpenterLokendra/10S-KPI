export function stripBotSuffix(username: string): string {
  return username.split('(')[0].trim()
}
