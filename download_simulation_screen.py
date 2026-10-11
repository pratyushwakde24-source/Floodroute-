import json
import os
import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

screen_data = {
    "name": "projects/16985371342318152841/screens/0f2a04890e544858bf3933c0e2cc5296",
    "title": "Flood Simulation & Event Replay",
    "screenshot": {
        "downloadUrl": "https://lh3.googleusercontent.com/aida/AEtjO1Xu57pudHQoEvvp401yjN3wkFP87TneQ3cDEymjeCCPDSVppdnYhVyatK3irfLs4GUHae5TiCuaEuatausqHNBXRRmP_yNCyJllCEd8HUkpEAstIy8L_V2siKBqxNYcJDF1LCTEvGSkGGJk3yrGaVqttt6_R5xMgwT5RUhavdT5rZp_t_hxRpXcYJDs8rPIroLOPfAxMnqlHYt_VHdZxcv4CVX5xuv3TcNAnknMYlfaWTcLzxi-KxrlMXDe"
    },
    "htmlCode": {
        "downloadUrl": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1ZDYyZDFhODRjNGIwMDMwMWZmYWRjMTM3OGVjEgsSBxDVi77srgsYAZIBJAoKcHJvamVjdF9pZBIWQhQxNjk4NTM3MTM0MjMxODE1Mjg0MQ&filename=&opi=89354086",
        "mimeType": "text/html"
    },
    "width": "2560",
    "height": "2496",
    "deviceType": "DESKTOP"
}

target_folder = r"c:\Users\praty\FLOODROUTE\screens\17_flood-simulation-event-replay"
os.makedirs(target_folder, exist_ok=True)

img_url = screen_data["screenshot"]["downloadUrl"]
img_target = os.path.join(target_folder, "screenshot.png")
req = urllib.request.Request(img_url, headers=headers)
with urllib.request.urlopen(req, context=ctx) as resp, open(img_target, 'wb') as out_f:
    out_f.write(resp.read())
print(f"[OK] Downloaded screenshot: {os.path.getsize(img_target)} bytes", flush=True)

html_url = screen_data["htmlCode"]["downloadUrl"]
html_target = os.path.join(target_folder, "code.html")
req = urllib.request.Request(html_url, headers=headers)
with urllib.request.urlopen(req, context=ctx) as resp, open(html_target, 'wb') as out_f:
    out_f.write(resp.read())
print(f"[OK] Downloaded code.html: {os.path.getsize(html_target)} bytes", flush=True)

meta = {
    "index": 17,
    "id": "0f2a04890e544858bf3933c0e2cc5296",
    "title": screen_data["title"],
    "deviceType": screen_data["deviceType"],
    "width": screen_data["width"],
    "height": screen_data["height"],
    "screenshotUrl": img_url,
    "htmlUrl": html_url
}
with open(os.path.join(target_folder, "metadata.json"), "w", encoding="utf-8") as mf:
    json.dump(meta, mf, indent=2)

manifest_path = r"c:\Users\praty\FLOODROUTE\screens\manifest.json"
manifest = []
if os.path.exists(manifest_path):
    with open(manifest_path, "r", encoding="utf-8") as mf:
        manifest = json.load(mf)
manifest.append(meta)
with open(manifest_path, "w", encoding="utf-8") as mf:
    json.dump(manifest, mf, indent=2)

print("[OK] Manifest updated successfully", flush=True)
