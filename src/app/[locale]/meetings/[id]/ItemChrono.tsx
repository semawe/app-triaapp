"use client";

import { useEffect, useState } from "react";

export default function ItemChrono({ activatedAt }: { activatedAt: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(activatedAt).getTime();
    // Le premier appel est synchrone volontairement : l'état part de 0 pour que
    // le rendu serveur et le premier rendu client coïncident, et ce tick rattrape
    // le temps écoulé sans attendre la première seconde. Calculer la valeur dans
    // l'initialiseur de useState ferait diverger les deux rendus.
    // eslint-disable-next-line @eslint-react/set-state-in-effect
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activatedAt]);

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  const isLong = elapsed > 300; // > 5 min

  return (
    <span
      className={`text-xs font-mono tabular-nums ${
        isLong ? "text-orange-400" : "text-gray-500"
      }`}
    >
      {m}:{s.toString().padStart(2, "0")}
    </span>
  );
}
