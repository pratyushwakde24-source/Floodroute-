import json
import os
import re
import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

with open(r"C:\Users\praty\.gemini\antigravity-ide\brain\789820f0-e0e3-45a2-84fc-38796ddafd97\.system_generated\steps\9\output.txt", "r", encoding="utf-8") as f:
    data = json.load(f)

screens_by_id = {}
for screen in data.get("screens", []):
    s_id = screen["name"].split("/")[-1]
    screens_by_id[s_id] = screen

requested_ids = [
    "2d3afecf9c5d42349df390ba4cfe60bf",
    "49966d36623b4ae7ab91be19a2b3742c",
    "49c5d6fa45194ad0861a2b62b2140200",
    "59efe9a83d3a4377909b8e45667a3899",
    "6eb7b943bc4b4396acecb99c1785072b",
    "7073d312db5446b5ac4c60fe05ff2ff9",
    "77523524d1264cc78443d2d77960bf13",
    "8208e6e2aff3466a9ffbeb010f570fb3",
    "a1fb3b68ba1447e283220df8118f70cb",
    "a4eb4ec28882448fbe2b0c3aceace593",
    "aa192cab92834382bb25f7016e2dcbb9",
    "aa8c34aa334641fdac2608620649b994",
    "e439bd9c5dbf4a04b336aacf66a5d923",
    "fc68339d5af34c8b92c2067c7f1eab1b",
]

def sanitize_title(title):
    clean = re.sub(r'[^\w\s-]', '', title).strip().lower()
    clean = re.sub(r'[-\s]+', '-', clean)
    return clean[:40]

output_dir = r"c:\Users\praty\FLOODROUTE"
screens_dir = os.path.join(output_dir, "screens")
os.makedirs(screens_dir, exist_ok=True)

manifest = []

for idx, sid in enumerate(requested_ids, 1):
    screen = screens_by_id.get(sid)
    if not screen:
        print(f"[{idx}/14] Screen ID {sid} not found in project!")
        continue
    
    title = screen.get("title", f"screen_{sid}")
    short_slug = sanitize_title(title)
    folder_name = f"{idx:02d}_{short_slug}"
    target_folder = os.path.join(screens_dir, folder_name)
    os.makedirs(target_folder, exist_ok=True)
    
    print(f"\nProcessing [{idx}/14]: {title} ({sid})")
    
    screenshot_info = screen.get("screenshot", {})
    img_url = screenshot_info.get("downloadUrl")
    img_path = None
    if img_url:
        img_filename = "screenshot.png"
        img_target = os.path.join(target_folder, img_filename)
        try:
            req = urllib.request.Request(img_url, headers=headers)
            with urllib.request.urlopen(req, context=ctx) as resp, open(img_target, 'wb') as out_f:
                out_f.write(resp.read())
            img_path = img_target
            print(f"  [OK] Downloaded image -> {img_filename} ({os.path.getsize(img_target)} bytes)", flush=True)
        except Exception as e:
            print(f"  [FAIL] Failed downloading image: {e}", flush=True)
            
    html_info = screen.get("htmlCode", {})
    html_url = html_info.get("downloadUrl") if isinstance(html_info, dict) else None
    code_path = None
    if html_url:
        html_filename = "code.html"
        html_target = os.path.join(target_folder, html_filename)
        try:
            req = urllib.request.Request(html_url, headers=headers)
            with urllib.request.urlopen(req, context=ctx) as resp, open(html_target, 'wb') as out_f:
                out_f.write(resp.read())
            code_path = html_target
            print(f"  [OK] Downloaded HTML -> {html_filename} ({os.path.getsize(html_target)} bytes)", flush=True)
        except Exception as e:
            print(f"  [FAIL] Failed downloading code: {e}", flush=True)
    else:
        print("  [-] No HTML code entry (standalone asset/image)", flush=True)

    meta = {
        "index": idx,
        "id": sid,
        "title": title,
        "deviceType": screen.get("deviceType"),
        "width": screen.get("width"),
        "height": screen.get("height"),
        "screenshotUrl": img_url,
        "htmlUrl": html_url,
    }
    with open(os.path.join(target_folder, "metadata.json"), "w", encoding="utf-8") as mf:
        json.dump(meta, mf, indent=2)
        
    manifest.append(meta)

with open(os.path.join(screens_dir, "manifest.json"), "w", encoding="utf-8") as mf:
    json.dump(manifest, mf, indent=2)

print("\nFinished downloading all requested screens!")
