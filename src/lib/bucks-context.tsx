import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useBucks } from '@/hooks/use-bucks';

type BucksContextType = {
  balance: number;
  earnBuck: (gameSlug: string) => Promise<void>;
  spendBuck: (gameSlug: string) => Promise<boolean>;
  showToast: boolean;
};

const BucksContext = createContext<BucksContextType>({
  balance: 0,
  earnBuck: async () => {},
  spendBuck: async () => false,
  showToast: false,
});

export function useBucksContext() {
  return useContext(BucksContext);
}

export function BucksProvider({ children }: { children: ReactNode }) {
  const { balance, earnBuck: rawEarn, spendBuck } = useBucks();
  const [showToast, setShowToast] = useState(false);
  const prevBalance = useRef<number>(balance);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (balance > prevBalance.current) {
      setShowToast(true);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setShowToast(false), 2500);
    }
    prevBalance.current = balance;
  }, [balance]);

  const earnBuck = async (gameSlug: string) => {
    await rawEarn(gameSlug);
  };

  return (
    <BucksContext.Provider value={{ balance, earnBuck, spendBuck, showToast }}>
      {children}
    </BucksContext.Provider>
  );
}
