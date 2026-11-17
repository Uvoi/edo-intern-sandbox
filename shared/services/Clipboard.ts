export type CopyToClipboard = (text: string) => Promise<void>;

export const copyToClipboard: CopyToClipboard = (text) =>
  navigator.clipboard.writeText(text);
