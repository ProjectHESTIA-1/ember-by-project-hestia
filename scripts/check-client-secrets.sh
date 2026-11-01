#!/usr/bin/env bash
# Fails if a server-only secret name appears anywhere it could reach the browser.
#
# Guards:
#  1. No NEXT_PUBLIC_ variable may carry a secret-looking name.
#  2. Server secret names may only be referenced from src/lib/env/server.ts, and
#     the admin client may only be imported from an allow-listed set of server modules.
set -euo pipefail
cd "$(dirname "$0")/.."

status=0

echo "check: no secret-looking NEXT_PUBLIC_ variables"
if grep -rnE 'NEXT_PUBLIC_[A-Z0-9_]*(SECRET|SERVICE_ROLE|PRIVATE|PASSWORD|TOKEN)' \
  --include='*.ts' --include='*.tsx' --include='*.js' --include='*.mjs' --include='.env*' \
  --exclude-dir=node_modules --exclude-dir=.next . ; then
  echo "  FAIL: a NEXT_PUBLIC_ variable has a secret-looking name" >&2
  status=1
fi

echo "check: SUPABASE_SERVICE_ROLE_KEY referenced only in src/lib/env/server.ts"
if grep -rn 'SUPABASE_SERVICE_ROLE_KEY' src --include='*.ts' --include='*.tsx' \
  | grep -vE '^src/lib/env/server(\.test)?\.ts:' ; then
  echo "  FAIL: SUPABASE_SERVICE_ROLE_KEY referenced outside src/lib/env/server.ts" >&2
  status=1
fi

echo "check: admin client imported only from allow-listed modules"
# Add a path here only with a CODEOWNERS-approved change and a matching entry in
# docs/AUTHORIZATION.md ("Service-role code paths").
allowlist_regex='^src/lib/supabase/admin\.ts:'
if grep -rnE "from ['\"]@/lib/supabase/admin['\"]" src --include='*.ts' --include='*.tsx' \
  | grep -vE "$allowlist_regex" ; then
  echo "  FAIL: @/lib/supabase/admin imported from a module that is not allow-listed" >&2
  status=1
fi

echo "check: no 'use client' module imports a server-only module"
while IFS= read -r file; do
  if grep -qE "from ['\"]@/lib/(env/server|supabase/(server|admin))['\"]" "$file"; then
    echo "  FAIL: $file is a client module importing server-only code" >&2
    status=1
  fi
done < <(grep -rlE "^[\"']use client[\"']" src --include='*.ts' --include='*.tsx' || true)

if [ "$status" -eq 0 ]; then
  echo "ok: no client-side secret exposure detected"
fi
exit $status
