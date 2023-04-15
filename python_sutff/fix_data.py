import json

# Load JSON data from file
with open("games_full.json", "r", encoding='utf-8') as f:
    data = json.load(f)

# Loop through each object in the "apps" array
for app in data["apps"]:
    # Get app_id value
    app_id = app["app_id"]
    
    # Add "thumbnail" property with value as specified
    app["thumbnail"] = f"https://steamcdn-a.akamaihd.net/steam/apps/{app_id}/capsule_467x181.jpg"

# Write updated JSON data back to file
with open("games_full.json", "w") as f:
    json.dump(data, f, indent=2)

print(f"Successfully updated JSON data in games_full.json")
