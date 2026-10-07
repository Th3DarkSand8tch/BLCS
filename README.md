# BLCS

Relais entre la tâche planifiée « Recherche des blocus annoncés » et la carte des blocus (https://blocus.itsnotme.fun/).

- `blocus.json` : les blocus trouvés par la tâche planifiée (mis à jour automatiquement).
- `.github/workflows/sync.yml` : à chaque mise à jour du fichier, envoie les nouvelles lignes dans la table `blocus` du site, en statut « à vérifier ».
- `scripts/sync.mjs` : le script d'envoi. Les doublons sont ignorés.

Pour confirmer ou supprimer un signalement : Supabase, « Table Editor », table `blocus`.
