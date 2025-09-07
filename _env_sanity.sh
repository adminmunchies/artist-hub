set -euo pipefail

# 1) .gitignore-Regel für .env*
if ! grep -qxF ".env*" .gitignore 2>/dev/null; then
  printf "\n# env files\n.env*\n" >> .gitignore
fi

# 2) Alle .env-Dateien aus dem Git-Index entfernen (falls je committed)
git rm --cached -r .env .env.* 2>/dev/null || true
git commit -m "chore: ignore env files" 2>/dev/null || true

# 3) Kurzer Check: stehen Keys im Repo (sollten 0 Treffer sein)?
echo "---- grep for SUPABASE_SERVICE_ROLE (should be empty) ----"
git grep -n SUPABASE_SERVICE_ROLE || true
echo "---- grep for NEXT_PUBLIC_SUPABASE_ANON_KEY literal (should be empty) ----"
git grep -n NEXT_PUBLIC_SUPABASE_ANON_KEY || true

# 4) Dev-Server sauber neu starten
pkill -f "next dev" 2>/dev/null || true
rm -rf .next .turbo
echo "Ready. Start dev with:  npm run dev"
