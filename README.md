# claude-mods

Mods pour Claude Code.

## ⛏ minecraft-usage — Claude Craft

Dashboard en fenêtre latérale, thème Minecraft, qui montre ce qu'il te reste
sur chaque fenêtre de limite Claude :

| Jauge | Fenêtre | Style |
| --- | --- | --- |
| ♥ Session · 5 h | `five_hour` | barre + 10 cœurs de vie |
| ◆ Semaine · tous modèles | `seven_day` | barre diamant |
| ✦ Semaine · Opus / Sonnet | `seven_day_opus` / `seven_day_sonnet` (si le compte la reçoit) | barre enchantée |
| ▣ Inventaire · contexte | fenêtre de contexte de la conversation | barre de terre |

Chaque barre est verte (herbe) au-dessus de 50 % restant, dorée entre 20 et
50 %, rouge redstone sous 20 %, avec le compte à rebours avant le reset. Le
coût de la session s'affiche en émeraudes, et la ligne de statut résume le
tout (`⛏ ♥ 64% · ◆ 80%`).

Les chiffres viennent de Claude Code lui-même (`$.session.usage()` et
l'événement `session.measure`) : aucun appel réseau, aucun modèle utilisé.
Ils arrivent après la première réponse, et seulement sur un abonnement
Pro/Max.

### Installer

```
/plugin install minecraft-usage --marketplace loup0007a/claude-mods
```

Réponds `y` pour ajouter le marketplace, puis choisis le scope utilisateur.
Le panneau s'ouvre au démarrage de chaque session (ancré sur le côté à partir
de 110 colonnes) ; `/mc-usage` le rouvre.

### Développer

```
claude plugin validate minecraft-usage
claude plugin test minecraft-usage
claude --plugin-dir ./minecraft-usage
```
