# Tools

Utilities for operating the `bc-247-hospitality` site.

## `purge-cache.sh`

CDN cache purge utility for the AEM Cloud publish origin. Supports purging a single URL, one or more surrogate keys, or the entire cache, in either soft or hard mode.

### Prerequisites

1. `cdn.yaml` deployed via the Cloud Manager config pipeline.
2. `CDN_PURGEKEY` environment variable set with the purge token (see below).
3. `curl` and `bash` available locally.

### Generating `CDN_PURGEKEY`

The purge key is a shared secret between your local environment and the CDN. Generate a strong random token with `openssl`:

```bash
openssl rand -hex 32
```

Then:

1. Add the value to `cdn.yaml` (the `purgeKey` field) and deploy via Cloud Manager so the CDN accepts it.
2. Export the same value locally so the script can authenticate:

   ```bash
   export CDN_PURGEKEY="<value-from-openssl>"
   ```

   To persist it, add the `export` line to your shell profile (`~/.zshrc`, `~/.bashrc`, etc.).

Treat the key like any other credential — do not commit it to the repo or paste it into shared chats.

### Usage

```bash
./tools/purge-cache.sh [--soft|--hard] <url PATH | tag KEYS | all>
```

| Mode  | Behavior |
| ----- | -------- |
| `--hard` (default) | Blocks until the origin responds; cached content is invalidated immediately. |
| `--soft` | Serves stale content while revalidating in the background. |

### Examples

Purge a single page:

```bash
./tools/purge-cache.sh url /events/index.html
```

Purge by surrogate key(s) (space-separated, quoted):

```bash
./tools/purge-cache.sh tag "events homepage"
```

Soft-purge a single URL:

```bash
./tools/purge-cache.sh --soft url /index.html
```

Purge the entire CDN cache (prompts for confirmation):

```bash
./tools/purge-cache.sh all
```

### Troubleshooting

- **`CDN_PURGEKEY environment variable is not set.`** — Export the variable in your current shell, or open a new shell after adding it to your profile.
- **`HTTP Status: 401` / `403`** — The local key does not match the value deployed via `cdn.yaml`. Confirm both sides hold the same token.
- **`HTTP Status: 404` on a URL purge** — The path was never cached at that exact URL. Check the path (including leading `/` and any trailing segment) against the published page.
