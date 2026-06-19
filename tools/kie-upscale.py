#!/usr/bin/env python3
"""
kie-upscale.py — AI-upscale an image via Kie.ai (Recraft Crisp Upscale).

Key resolution: env KIE_API_KEY, else ~/.config/kie/api_key
Usage:
  python3 tools/kie-upscale.py "https://.../image.jpg" --out assets/upscaled.jpg
Docs: https://docs.kie.ai/market/recraft/crisp-upscale
"""
import argparse, json, os, sys, time, urllib.request, urllib.error
from pathlib import Path

CREATE_URL = "https://api.kie.ai/api/v1/jobs/createTask"
POLL_URL   = "https://api.kie.ai/api/v1/jobs/recordInfo"
MODEL      = "recraft/crisp-upscale"


def get_key():
    k = os.environ.get("KIE_API_KEY", "").strip()
    if k:
        return k
    p = Path.home() / ".config" / "kie" / "api_key"
    if p.exists() and p.read_text().strip():
        return p.read_text().strip()
    sys.exit("No API key found (KIE_API_KEY or ~/.config/kie/api_key).")


def _req(url, key, data=None, method="GET"):
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header("Authorization", f"Bearer {key}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read().decode()[:400]}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("image_url")
    ap.add_argument("--out", required=True)
    ap.add_argument("--max-wait", type=int, default=240)
    args = ap.parse_args()
    key = get_key()

    print(f"→ creating upscale task ({MODEL}) …")
    created = _req(CREATE_URL, key, {"model": MODEL, "input": {"image": args.image_url}}, method="POST")
    if created.get("code") != 200:
        sys.exit(f"createTask failed: {json.dumps(created)[:400]}")
    task_id = created["data"]["taskId"]
    print(f"  taskId: {task_id}")

    print("→ upscaling", end="", flush=True)
    deadline = time.monotonic() + args.max_wait
    url = None
    while time.monotonic() < deadline:
        time.sleep(4)
        print(".", end="", flush=True)
        info = _req(f"{POLL_URL}?taskId={task_id}", key).get("data") or {}
        state = info.get("state")
        if state == "success":
            rj = json.loads(info.get("resultJson") or "{}")
            urls = rj.get("resultUrls") or []
            url = urls[0] if urls else None
            print(f"\n  credits used: {info.get('creditsConsumed')}")
            break
        if state in ("fail", "failed", "error"):
            sys.exit(f"\nUpscale failed: {info.get('failMsg') or json.dumps(info)[:300]}")
    print() if url is None else None
    if not url:
        sys.exit("Timed out or no result URL.")

    out = Path(args.out); out.parent.mkdir(parents=True, exist_ok=True)
    dl = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(dl, timeout=180) as r:
        out.write_bytes(r.read())
    print(f"✓ saved {out}  ({out.stat().st_size // 1024} KB)")
    print(f"  source: {url}")


if __name__ == "__main__":
    main()
