export type MidnightProvider = {
  enable?: () => Promise<unknown>;
};

type MidnightWindow = {
  midnight?: MidnightProvider;
  cardano?: {
    midnight?: MidnightProvider;
  };
};

const readWindow = (): MidnightWindow | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window as unknown as MidnightWindow;
};

export const getMidnightProvider = (): MidnightProvider | undefined => {
  const midnightWindow = readWindow();
  if (!midnightWindow) {
    return undefined;
  }

  if (midnightWindow.midnight) {
    return midnightWindow.midnight;
  }

  return midnightWindow.cardano?.midnight;
};

export const ensureMidnightEnabled = async (): Promise<MidnightProvider> => {
  const provider = getMidnightProvider();
  if (!provider) {
    throw new Error("Midnight Lace provider not detected");
  }

  if (typeof provider.enable === "function") {
    await provider.enable();
  }

  return provider;
};
