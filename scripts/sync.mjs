// Envoie les lignes de blocus.json dans la table "blocus" de Supabase.
// Les doublons sont refusés par l'index unique de la table (réponse 409) et simplement ignorés.
import { readFileSync } from "node:fs";

const SB = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const KEY = (process.env.SUPABASE_KEY || "").trim();
if (!SB || !KEY) { console.error("SUPABASE_URL ou SUPABASE_KEY manquant."); process.exit(1); }

const rows = JSON.parse(readFileSync(new URL("../blocus.json", import.meta.url), "utf8"));
if (!Array.isArray(rows)) { console.error("blocus.json doit être un tableau."); process.exit(1); }

// La base refuse les dates antérieures à hier : inutile de les envoyer.
const hier = new Date(Date.now() - 36 * 3600 * 1000).toISOString().slice(0, 10);
let ajoutes = 0, doublons = 0, ignores = 0, erreurs = 0;

for (const r of rows) {
  const row = {
    ville: String(r.ville || "").trim(),
    lieu: String(r.lieu || "").trim().slice(0, 80),
    date: String(r.date || "").trim(),
    heure: String(r.heure || "").trim().slice(0, 5),
    source: String(r.source || "").trim(),
    statut: "a_verifier",
  };
  const valide = row.ville && row.lieu && /^\d{4}-\d{2}-\d{2}$/.test(row.date)
    && row.date >= hier && row.source.startsWith("https://") && row.source.length <= 300;
  if (!valide) { ignores++; continue; }

  const res = await fetch(SB + "/rest/v1/blocus", {
    method: "POST",
    headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
  if (res.ok) { ajoutes++; console.log("Ajouté :", row.ville, row.date, row.lieu); }
  else if (res.status === 409) { doublons++; }
  else { erreurs++; console.error("Erreur", res.status, row.ville, row.date, row.lieu, await res.text()); }
}

console.log(`Terminé : ${ajoutes} ajouté(s), ${doublons} déjà présent(s), ${ignores} ignoré(s), ${erreurs} erreur(s).`);
if (erreurs) process.exit(1);
