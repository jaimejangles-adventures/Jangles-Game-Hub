import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useBucks } from '@/hooks/use-bucks';

type BucksContextType = {
  balance: number;
  earnBuck: (gameSlug: string) => Promise<void>;
  spendBuck: (gameSlug: string) => Promise<boolean>;
  showToast: boolean;
  warningMessage: string | null;
};

const BucksContext = createContext<BucksContextType>({
  balance: 0,
  earnBuck: async () => {},
  spendBuck: async () => false,
  showToast: false,
  warningMessage: null,
});

export function useBucksContext() {
  return useContext(BucksContext);
}

export function BucksProvider({ children }: { children: ReactNode }) {
  const { balance, earnBuck: rawEarn, spendBuck } = useBucks();
  const [showToast, setShowToast] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const prevBalance = useRef<number>(balance);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (balance > prevBalance.current) {
      setShowToast(true);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setShowToast(false), 2500);
    }
    prevBalance.current = balance;
  }, [balance]);

  const earnBuck = async (gameSlug: string) => {
    const warning = await rawEarn(gameSlug);
    if (warning) {
      setWarningMessage(warning);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      warningTimer.current = setTimeout(() => setWarningMessage(null), 3000);
    }
  };

  return (
    <BucksContext.Provider value={{ balance, earnBuck, spendBuck, showToast, warningMessage }}>
      {children}
    </BucksContext.Provider>
  );
}
