export const randomBytes = (length: number): Uint8Array => {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  };