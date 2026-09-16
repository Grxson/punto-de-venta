export interface MutableBoolean {
  current: boolean;
}

export const createSingleFlight = <T>() => {
  let inFlight: Promise<T> | null = null;

  return (operation: () => Promise<T>): Promise<T> => {
    if (inFlight) {
      return inFlight;
    }

    const current = operation();
    inFlight = current;

    const clearCurrent = () => {
      if (inFlight === current) {
        inFlight = null;
      }
    };

    current.then(clearCurrent, clearCurrent);
    return current;
  };
};

export const acquireLock = (lock: MutableBoolean): boolean => {
  if (lock.current) {
    return false;
  }

  lock.current = true;
  return true;
};

export const releaseLock = (lock: MutableBoolean): void => {
  lock.current = false;
};

export const didAuthTokenChange = (
  requestAuthorization: string | undefined,
  currentToken: string | null,
): boolean => {
  return Boolean(
    requestAuthorization &&
    currentToken &&
    requestAuthorization !== `Bearer ${currentToken}`,
  );
};
