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
    "name": "projects/16985371342318152841/screens/143337f0626c4ff3a6e019084515aa6c",
    "title": "Incidents List",
    "screenshot": {
        "downloadUrl": "https://lh3.googleusercontent.com/aida/AEtjO1VUHZ8PrQfD2YzZmR_eMdbsNTE3vSqW8gYTlJgMMDoUxvYZCorNrYptv3DoXiR3l0XVkApbhGsOBTD36Vysa0BPGSxUDQrCHVa8Qo_9-btbqQgH9zWGyoSQ72EonBJY8IHcSZf0fk4RGlzZQfCeMdBVh2whAnuBYOMuBdHIfdS_9pcVZe1qghEe8OL_2zSoUTg8uESWbdtSeDedU3TLebFHtoFHcVBrnnBGBuvsP5ytuYgZBJQcCP8zNS6I"
    },
    "htmlCode": {
        "downloadUrl": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1ZDYyYzZkYTdkYzYwNTAzYzE4YWFiMThhMmRlEgsSBxDVi77srgsYAZIBJAoKcHJvamVjdF9pZBIWQhQxNjk4NTM3MTM0MjMxODE1Mjg0MQ&filename=&opi=89354086",
        "mimeType": "text/html"
    },
    "width": "2560",
    "height": "3702",
    "deviceType": "DESKTOP"
}

target_folder = r"c:\Users\praty\FLOODROUTE\screens\15_incidents-list"
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
    "index": 15,
    "id": "143337f0626c4ff3a6e019084515aa6c",
    "title": screen_data["title"],
    "deviceType": screen_data["deviceType"],
    "width": screen_data["width"],
    "height": screen_data["height"],
    "screenshotUrl": img_url,
    "htmlUrl": html_url
}
with open(os.path.join(target_folder, "metadata.json"), "w", encoding="utf-8") as mf:
    json.dump(meta, mf, indent=2)

# Update manifest
manifest_path = r"c:\Users\praty\FLOODROUTE\screens\manifest.json"
manifest = []
if os.path.exists(manifest_path):
    with open(manifest_path, "r", encoding="utf-8") as mf:
        manifest = json.load(mf)
manifest.append(meta)
with open(manifest_path, "w", encoding="utf-8") as mf:
    json.dump(manifest, mf, indent=2)

print("[OK] Manifest updated successfully", flush=True)
