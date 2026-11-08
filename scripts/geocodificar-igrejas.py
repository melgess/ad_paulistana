"""Consulta única do cadastro: uma requisição por vez, intervalo >=1,1 s e cache persistente.
Política: https://operations.osmfoundation.org/policies/nominatim/
Nunca usado pelo navegador; coordenadas do visitante não são transmitidas.
"""
from pathlib import Path
import json, re, time, unicodedata, urllib.request, urllib.parse, urllib.error, sys
ROOT=Path(__file__).resolve().parent.parent
DATA=ROOT/'js/igrejas-dados.js'; CACHE=ROOT/'data/geocodificacao-cache.json'
data=json.loads(DATA.read_text(encoding='utf-8').split(' = ',1)[1].rstrip(';\n '))
cache=json.loads(CACHE.read_text(encoding='utf-8')) if CACHE.exists() else {}
def norm(s): return unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()
def save():
    DATA.write_text('window.ADPAULISTANA_IGREJAS = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
    CACHE.write_text(json.dumps(cache,ensure_ascii=False,indent=2),encoding='utf-8')
def street_query(r):
    a=r['endereco']
    if r['id']=='sao-paulo-matriz-lapa': return '235 Rua Cipião','235'
    a=re.sub(r'^END\.\s*','',a)
    a=re.sub(r'^R(?:\.|UA\s*:?)\s*','Rua ',a,flags=re.I)
    a=re.sub(r'^AV(?:\.|ENIDA)?\s*','Avenida ',a,flags=re.I)
    a=re.sub(r'^TV\.\s*','Travessa ',a,flags=re.I)
    a=re.sub(r'\bN[º°:]\s*',' ',a)
    m=re.search(r'^(.+?),\s*(\d+[A-Z]?)\b',a)
    if not m: m=re.search(r'^(.+?\D)\s+(\d+[A-Z]?)\b',a)
    if m:
        road=m[1].strip(' ,;-'); number=m[2]
        return number+' '+road, number
    return a.split('CEP')[0].strip(' ,;-'),None
last_request=0
for index,r in enumerate(data['igrejas'],1):
    street,number=street_query(r)
    params={'format':'jsonv2','street':street,'state':'Paraná' if r['uf']=='PR' else 'São Paulo','countrycodes':'br','addressdetails':1,'limit':3}
    if r['cidade']: params['city']=r['cidade']
    query=urllib.parse.urlencode(params)
    if query not in cache:
        if '--cache-only' in sys.argv:
            continue
        time.sleep(max(0,1.1-(time.monotonic()-last_request)))
        request=urllib.request.Request('https://nominatim.openstreetmap.org/search?'+query,headers={'User-Agent':'ADPaulistanaCongregacoes/1.0 (https://adpaulistana.com.br; one-time address import)'})
        try:
            last_request=time.monotonic()
            with urllib.request.urlopen(request,timeout=15) as resp: cache[query]=json.load(resp)
        except urllib.error.HTTPError as e:
            if e.code in (403,429):
                save(); print('Serviço solicitou interrupção:',e.code,flush=True); break
            print('Erro HTTP',e.code,r['id'],flush=True); continue
        except Exception as e:
            print('Falha de rede',r['id'],type(e).__name__,flush=True); continue
    r['coordenadas']=None
    for result in cache[query]:
        address=result.get('address',{})
        if result.get('place_rank',0)<26: continue
        city=address.get('city') or address.get('town') or address.get('village') or address.get('municipality')
        if r['cidade'] and (not city or norm(city)!=norm(r['cidade'])): continue
        if address.get('ISO3166-2-lvl4')!='BR-'+r['uf']: continue
        road=address.get('road') or address.get('pedestrian') or address.get('residential') or ''
        ignore={'rua','avenida','travessa','estrada','doutor','dr','de','da','do','das','dos','r','av','n','numero','s','sem'}
        road_query=street.split(' ',1)[1] if number else street
        wanted={w for w in re.findall(r'[a-z0-9]+',norm(road_query)) if w not in ignore}
        actual={w for w in re.findall(r'[a-z0-9]+',norm(road)) if w not in ignore}
        # Nomes genéricos ou numerados não podem apontar para outra rua.
        if not wanted or wanted != actual: continue
        postcode=re.sub(r'\D','',address.get('postcode',''))
        expected=re.sub(r'\D','',r['cep'] or '')
        if expected and postcode and expected[:5]!=postcode[:5]: continue
        if len(wanted)<2 and (not expected or not postcode or expected[:5]!=postcode[:5]): continue
        lat,lon=float(result['lat']),float(result['lon'])
        if not (-34<lat<6 and -74<lon<-34): continue
        precise=bool(number and norm(address.get('house_number',''))==norm(number))
        r['coordenadas']={'latitude':lat,'longitude':lon,'precisao':'numero' if precise else 'logradouro','fonte':'OpenStreetMap','enderecoEncontrado':result['display_name'],'url':'https://www.openstreetmap.org/'+result['osm_type']+'/'+str(result['osm_id'])}
        if not r['cidade'] and city: r['cidade']=city
        break
    save()
    if index%10==0 or index==len(data['igrejas']):
        print(index,'/',len(data['igrejas']),'| localizadas:',sum(bool(x['coordenadas']) for x in data['igrejas']),flush=True)
save()
