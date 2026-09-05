import { cache } from "react";

/**
 * L'instant de la requête, calculé une seule fois et partagé par tout son rendu.
 *
 * Appeler `new Date()` en plein rendu d'un composant serveur donne un « maintenant »
 * différent à chaque appel : une page qui décide plusieurs fois si une échéance est
 * dépassée peut se contredire d'une ligne à l'autre, et rien ne rend la valeur
 * reproductible. `cache` de React mémorise le résultat pour la durée de la requête,
 * ce qui rend la page cohérente avec elle-même sans la figer d'une requête à l'autre.
 */
export const maintenant = cache(() => new Date());
