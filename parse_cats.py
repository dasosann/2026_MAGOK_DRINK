import json
import re

with open('user_categories.txt', 'r', encoding='utf-8') as f:
    text = f.read()

category_map = {}
current_cat = "기타"

lines = text.split('\n')
for line in lines:
    line = line.strip()
    if line.startswith('###'):
        if '전통주' in line:
            current_cat = '전통주'
        elif '증류주' in line:
            current_cat = '증류주/고량주'
        elif '수입 와인' in line:
            current_cat = '수입 와인'
        elif '한국와인' in line:
            current_cat = '한국와인/과실주'
        elif '맥주' in line:
            current_cat = '맥주'
        elif '사케' in line:
            current_cat = '사케'
        elif '종합 주류' in line:
            current_cat = '리큐르/종합'
        elif '음식' in line:
            current_cat = '안주/식품'
        elif '편의 시설' in line:
            current_cat = '편의 시설'
        elif '기타' in line:
            current_cat = '기타'
    elif line.startswith('*'):
        matches = re.findall(r'[A-Z]-\d{2}', line)
        for m in matches:
            category_map[m] = current_cat

# Handle joint booths or missing booths
booths = json.load(open('src/data/booth-map-data.json', 'r', encoding='utf-8'))['booths']
final_map = {}
for b in booths:
    bid = b['id']
    if bid in category_map:
        final_map[bid] = category_map[bid]
    elif '~' in bid:
        # e.g. J-13 ~ 20. If it's a joint booth, just call it 기타 or find if any sub-id matches
        final_map[bid] = '복합 부스 (전통주/안주)'
    else:
        final_map[bid] = '기타'

# Wait, J-13 ~ 20 is actually a joint booth in the JSON (J-13 ~ 20).
# Let's map it to "전통주" since that's what many of them are, or "복합 부스".
# The user's list has J-13 as 전통주, J-14 as 안주/식품. So J-13 ~ 20 has both.
if 'J-13 ~ 20' in final_map:
    final_map['J-13 ~ 20'] = '전통주' # User might want to search by traditional alcohol

with open('src/data/booth-categories.json', 'w', encoding='utf-8') as f:
    json.dump(final_map, f, ensure_ascii=False, indent=2)

print("Done. Categories assigned.")
