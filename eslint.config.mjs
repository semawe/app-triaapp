// Configuration de lint construite à la main, et non plus héritée de
// `eslint-config-next`. Ce paquet embarque `eslint-plugin-react`,
// `eslint-plugin-import` et `eslint-plugin-jsx-a11y`, dont les deux premiers
// appellent encore l'API de contexte retirée par eslint 10 : tant qu'il les
// embarque, il plafonne le projet à eslint 9. Les remplaçants retenus ici
// couvrent le même terrain et acceptent eslint 10. Le plugin Next lui-même est
// conservé : c'est lui qui porte les règles propres au framework.
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import next from "@next/eslint-plugin-next";
import react from "@eslint-react/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import importX from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  globalIgnores([
    // Reprises telles quelles des ignores par défaut d'eslint-config-next, que
    // sa disparition ne doit pas rouvrir.
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Client Prisma généré : ni écrit ni relu à la main, il produisait à lui
    // seul l'essentiel des 593 erreurs qui rendaient `npm run lint` inutilisable.
    "src/generated/**",
    // Worktrees Git des sessions Claude Code : copies du dépôt à l'intérieur du
    // dépôt. Sans cette ligne, chaque fichier est linté deux fois et les
    // avertissements apparaissent en double.
    ".claude/worktrees/**",
  ]),

  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  // TypeScript. Version non typée : le lint reste rapide et n'a pas besoin du
  // programme complet, `tsc --noEmit` couvrant déjà le typage en propre.
  tseslint.configs.recommended,

  // Règles du framework, y compris les Core Web Vitals que la config Next
  // activait.
  next.configs.recommended,
  next.configs["core-web-vitals"],

  // React. `@eslint-react` remplace `eslint-plugin-react` ; sa variante
  // « typescript » retire les règles de PropTypes, sans objet ici.
  react.configs["recommended-typescript"],
  // `configs["recommended-latest"]` du plugin est encore au format hérité
  // (clé `plugins` en tableau) et eslint 10 la refuse ; l'équivalent plat
  // vit sous `configs.flat`.
  reactHooks.configs.flat["recommended-latest"],

  // Imports : `eslint-config-next` n'activait qu'une seule règle de ce plugin,
  // et on s'y tient. Prendre l'ensemble « recommended » ferait entrer la
  // résolution de modules dans le lint — sept cents erreurs de chemins sur un
  // projet que `tsc` valide déjà, pour une couverture que personne n'a demandée.
  {
    plugins: { "import-x": importX },
    rules: { "import-x/no-anonymous-default-export": "warn" },
  },

  // Accessibilité. L'ensemble « recommended » du plugin est bien plus large que
  // ce qu'activait `eslint-config-next` ; on reprend ses six règles à
  // l'identique. Élargir la couverture est un chantier en soi, pas un effet de
  // bord d'une montée de version : les constats que le jeu complet fait
  // apparaître sont consignés à part.
  {
    plugins: { "jsx-a11y": jsxA11y },
    rules: {
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
    },
  },

  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // `@eslint-react` couvre plus large que `eslint-plugin-react` qu'il
      // remplace. Ces deux règles-là n'existaient pas dans le régime précédent
      // et leurs constats ne sont pas des régressions : ils sont réels mais
      // relèvent d'une passe à eux, consignée dans la tâche Notion 2204.
      //
      // `purity` ne signale ici que des `new Date()` dans des composants
      // serveur asynchrones, où « maintenant » est l'instant de la requête.
      // `no-array-index-key` ne porte que sur des listes de chaînes statiques
      // sans identité propre (domaines, redevabilités, lignes de texte
      // découpées), jamais réordonnées.
      "@eslint-react/purity": "off",
      "@eslint-react/no-array-index-key": "off",
      // Le code s'autorise `_` en tête pour un paramètre volontairement inusité.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
    },
  },
]);

export default eslintConfig;
