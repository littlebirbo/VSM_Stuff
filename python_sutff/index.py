import json

# Read file1.json
with open('games_metadata.json', 'r', encoding='utf-8') as file1:
    file1_data = json.load(file1)

# Read file2.json
with open('games.json', 'r', encoding='utf-8') as file2:
    file2_data = json.load(file2)

# Create a dictionary to store the merged data
merged_data = {}

# Merge file1_data into merged_data using app_id as key
for app in file1_data["apps"]:
    app_id = app["app_id"]
    merged_data[app_id] = app

# Merge file2_data into merged_data using app_id as key
for app in file2_data["apps"]:
    app_id = app["app_id"]
    if app_id in merged_data:
        # Merge additional fields into existing app data
        merged_data[app_id].update(app)
    else:
        # Add new app data to merged_data
        merged_data[app_id] = app

# Create a new dictionary to store the merged apps list
merged_file_data = {"apps": list(merged_data.values())}

# Write merged data to a new file
with open('merged_file.json', 'w') as merged_file:
    json.dump(merged_file_data, merged_file, indent=4)
