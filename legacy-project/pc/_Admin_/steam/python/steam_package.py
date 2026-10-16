#!/usr/bin/python3
import cgi, os
print("Content-Type: text/html;charset:cp949\n")
print()
form = cgi.FieldStorage()

if 'packageid' in form:
	packageid = form["packageid"].value

from bs4 import BeautifulSoup as bs
import urllib.request
import urllib.parse
import json
from PIL import Image

baseUrl = 'https://store.steampowered.com/sub/'

url = baseUrl + packageid

headers = {'Cookie: birthtime=470682001;lastagecheckage=1-0-1985;'}
req = urllib.request.Request(url)
req.add_header('Cookie','birthtime=470682001;lastagecheckage=1-0-1985')
f = urllib.request.urlopen(req)

soup = bs(f, "html.parser",from_encoding='cp949')

package_name = soup.find("meta", property="og:title")['content']
subid = soup.find(attrs={"name":"subid"}).get('value')
cnt = len(soup.find_all(class_='tab_item'))

print(package_name)
print(subid)
print(cnt)

item_data = {}
item_data['m_rgItems'] = []

appid = []
app_name = []

for i in range(0,cnt):
    appid = soup.find_all(class_='tab_item')[i].get('data-ds-appid')
    app_name = soup.find_all(class_='tab_item_name')[i].get_text()

    item_appid = []
    item_appname = []
    item_appid.insert(0,appid)
    item_appname.insert(0,app_name)

    item_data['m_rgItems'].append( {
        'm_rgIncludedAppIDs':item_appid,
        'm_rgIncludedAppNames':item_appname
    })

json_data = {}

file_path = "/home/dgkrshop/www/upload/package/package_" + packageid + ".json"

json_data['data'] = []
json_data['data'].append( {
    'packageid':packageid,
    'package_data': json.dumps(item_data)
})
if int(subid) > 0:
    with open(file_path, 'w') as outfile:
        json.dump(json_data,outfile, indent=4)
else : 
    print('failed')