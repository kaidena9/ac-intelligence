#!/usr/bin/env python3
"""
kie-image.py — generate an image via the Kie.ai API and save it locally.

Key resolution (first found wins):
  1. env var  KIE_API_KEY
  2. file     ~/.config/kie/api_key   (recommended; chmod 600, outside the repo)

Usage:
  python3 tools/kie-image.py "a prompt" --out assets/hero.jpg
  python3 tools/kie-image.py "a prompt" --aspect 16:9 --model flux-kontext-max --format jpeg

Models (Flux Kontext):
  flux-kontext-pro   (default, cheaper)
  flux-kontext-max   (highest quality)

Docs: https://docs.kie.ai/flux-kontext-api/generate-or-edit-image
"""
import argparse, json, os, sys, time, urllib.request, urllib.error
from pathlib import Path

CREATE_URL = "https://api.kie.ai/api/v1/flux/kontext/generate"
POLL_URL   = "https://api.kie.ai/api/v1/flux/kontext/record-info"


def get_key():
    k = os.environ.get("KIE_API_KEY", "").strip()
    if k:
        return k
    p = Path.home() / ".config" / "kie" / "api_key"
    if p.exists():
        k = p.read_text().strip()
        if k:
            return k
    sys.exit("No API key found. Set KIE_API_KEY or put the key in ~/.config/kie/api_key")


def _req(url, key, data=None, method="GET"):
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header("Authorization", f"Bearer {key}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read().decode()[:300]}")
    except urllib.error.URLError as e:
        sys.exit(f"Network error: {e}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("prompt")
    ap.add_argument("--out", required=True, help="output path, e.g. assets/hero.jpg")
    ap.add_argument("--aspect", default="16:9",
                    help="21:9 | 16:9 | 4:3 | 1:1 | 3:4 | 9:16")
    ap.add_argument("--model", default="flux-kontext-pro",
                    choices=["flux-kontext-pro", "flux-kontext-max"])
    ap.add_argument("--format", default="jpeg", choices=["jpeg", "png"])
    ap.add_argument("--max-wait", type=int, default=180, help="seconds")
    args = ap.parse_args()

    key = get_key()

    print(f"→ creating task ({args.model}, {args.aspect}) …")
    created = _req(CREATE_URL, key, {
        "prompt": args.prompt,
        "model": args.model,
        "aspectRatio": args.aspect,
        "outputFormat": args.format,
    }, method="POST")
    if created.get("code") != 200:
        sys.exit(f"createTask failed: {created.get('msg')} ({json.dumps(created)[:300]})")
    task_id = created["data"]["taskId"]
    print(f"  taskId: {task_id}")

    print("→ generating", end="", flush=True)
    deadline = time.monotonic() + args.max_wait
    img_url = None
    while time.monotonic() < deadline:
        time.sleep(3)
        print(".", end="", flush=True)
        info = _req(f"{POLL_URL}?taskId={task_id}", key)
        d = info.get("data") or {}
        resp = d.get("response") or {}
        img_url = resp.get("resultImageUrl") or (resp.get("resultUrls") or [None])[0]
        flag = d.get("successFlag")
        if img_url:
            break
        if flag in (2, 3) or d.get("errorCode"):
            sys.exit(f"\nGeneration failed: {d.get('errorMessage') or d.get('errorCode')}")
    print()
    if not img_url:
        sys.exit("Timed out waiting for the image.")

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    dl = urllib.request.Request(img_url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(dl, timeout=120) as r:
            out.write_bytes(r.read())
    except urllib.error.HTTPError as e:
        sys.exit(f"\nDownload failed (HTTP {e.code}). Image URL: {img_url}")
    print(f"✓ saved {out}  ({out.stat().st_size // 1024} KB)")
    print(f"  source: {img_url}")


if __name__ == "__main__":
    main()
