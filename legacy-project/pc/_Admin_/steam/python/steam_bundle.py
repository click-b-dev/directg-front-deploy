#!/usr/bin/python3
import cgi, os
print("Content-Type: text/html;charset:cp949\n")
print()

form = cgi.FieldStorage()

if 'bundleid' in form:
	bundleid = form["bundleid"].value

from bs4 import BeautifulSoup as bs
import urllib.request
import urllib.parse
import json

from PIL import Image

baseUrl = 'https://store.steampowered.com/bundle/'

url = baseUrl + bundleid

headers = {'Cookie: birthtime=470682001;lastagecheckage=1-0-1985;'}
req = urllib.request.Request(url)
req.add_header('Cookie','birthtime=470682001;lastagecheckage=1-0-1985')
f = urllib.request.urlopen(req)

soup = bs(f, "html.parser",from_encoding='cp949')
bundle_name = soup.find(class_='pageheader').get_text()
bundle_final_package_price = soup.find(class_='bundle_final_package_price').get_text()
bundle_discount = soup.find(class_='bundle_discount').get_text()
bundle_final_price_with_discount = soup.find(class_='bundle_final_price_with_discount').get_text()
cnt = len(soup.find_all(class_='bundle_package_item'))
package_header_tag = soup.find(class_='package_header')
package_header = package_header_tag.get('src') if package_header_tag else ''

item_data = {}
item_data['m_rgItems'] = []

appid = []
app_name = []
discount_price = []
original_price = []
packageid = []

print(cnt)

for i in range(0,cnt):
    appid = soup.find_all(class_='bundle_package_item')[i].div.get('data-ds-appid')
    packageid = soup.find_all(class_='bundle_package_item')[i].div.get('data-ds-packageid')
    app_name = soup.find_all(class_='tab_item_name')[i].get_text()

    item_appid = []
    item_appname = []
    item_packageid = []

    item_appid.insert(0,appid)
    item_appname.insert(0,app_name)

    item_data['m_rgItems'].append( {
        'm_nPackageID':item_packageid,
        'm_rgIncludedAppIDs':item_appid,
        'm_rgIncludedAppNames':item_appname,
    })

json_data = {}

file_path = "/home/dgkrshop/www/upload/bundle/bundle_" + bundleid + ".json"

json_data['data'] = []
json_data['data'].append( {
    'bundleid':bundleid,
    'bundle_name':bundle_name,
	'bundle_header':package_header,
    'bundle_data': json.dumps(item_data)
})

if int(cnt) > 0 :
    with open(file_path, 'w') as outfile:
         json.dump(json_data,outfile, indent=4)
else:
    print(cnt)

print(package_header)

if package_header:
    image_path = "/home/dgkrshop/www/upload/bundle/"+bundleid
    try:
        if not os.path.exists(image_path):
          os.makedirs(image_path)
    except OSError:
          print("Error: Failed to create the directory.")

    os.system("curl " + package_header + " > /home/dgkrshop/www/upload/bundle/"+bundleid+"/header_586x192.jpg")
    curl_img = Image.open("/home/dgkrshop/www/upload/bundle/"+bundleid+"/header_586x192.jpg")
