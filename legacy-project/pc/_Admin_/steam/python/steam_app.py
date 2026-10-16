#!/usr/bin/python3
import cgi, os
print("Content-Type: text/html;charset:cp949\n")
print()

form = cgi.FieldStorage()

if 'appid' in form:
	appid = form["appid"].value

from bs4 import BeautifulSoup as bs
import urllib.request
import urllib.parse
import json

baseUrl = 'https://store.steampowered.com/app/'

url = baseUrl + appid + '?l=koreana'

headers = {'Cookie: birthtime=470682001;lastagecheckage=1-0-1985;'}
req = urllib.request.Request(url)
req.add_header('Cookie','birthtime=470682001;lastagecheckage=1-0-1985')
f = urllib.request.urlopen(req)

soup = bs(f, "html.parser",from_encoding='utf-8')

app_name = soup.find("div",id="appHubAppName").get_text()
controller_support_info = soup.find('div',attrs={'data-featuretarget': 'store-sidebar-controller-support-info'}).get('data-props')
cnt = len(soup.find_all(class_='app_tag'))

print(app_name)

tag_name = []
item_tag = []

for i in range(0,cnt-1):
    tag_name = soup.find_all(class_='app_tag')[i].get_text()
    item_tag.append( {
        'tag_name':tag_name.strip()
    })

print(item_tag)
json_data = {}

file_path = "/home/dgkrshop/www/upload/tag/tag_" + appid + "_ko.json"

json_data['data'] = []
json_data['data'].append( {
    'appid':appid,
    'app_name':app_name,
    'tag': json.dumps(item_tag, ensure_ascii=False),
	'controller_support_info':json.dumps(controller_support_info,ensure_ascii=False),
})

if int(appid) > 0:
    with open(file_path, 'w', encoding='utf-8') as outfile:
        json.dump(json_data,outfile, indent=4)
else : 
    print('failed')