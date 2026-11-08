from pathlib import Path
from pypdf import PdfReader
import re, json, unicodedata, sys
ROOT=Path(__file__).resolve().parent.parent
SOURCE='https://drive.google.com/file/d/1BUXBbCUhnzteCJW2jQQWGNult9Kr73eE/view'
def norm(s):
    return unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()
def slug(s): return re.sub('[^a-z0-9]+','-',norm(s)).strip('-')
def title(s):
    s=s.strip().title()
    for part in ['De','Da','Do','Das','Dos','E']:
        s=re.sub(r'\b'+part+r'\b',part.lower(),s)
    return s
REGIONS={
'ARARAQUARA':('Araraquara','ediel-alencar'),
'BIRIGUI':('Birigui',None),
'EMBU DAS ARTES':('Embu das Artes','helizaldo-carvalho'),
'LITORAL':('Litoral','valmir-rodrigues'),
'MAUÁ':('Mauá','isaias-lima'),
'ITAPETININGA / ANGATUBA':('Itapetininga / Angatuba','rosiesley-oliveira'),
'SANTA BÁRBARA DO OESTE':('Santa Bárbara do Oeste',None),
'SÃO JOSÉ DO RIO PRETO':('São José do Rio Preto','william-assis'),
'SOROCABA':('Sorocaba','jose-novais'),
'SUZANO':('Suzano','ednardo-bezerra')}
pdf=PdfReader(sys.argv[1]); records=[]; region='Capital e Grande São Paulo'; pastor=None; city=None; state='SP'; field=None; parts=[]
for page_no,page in enumerate(pdf.pages,1):
    text=page.extract_text(); parts.append(f'--- Página {page_no} ---\n{text}')
    for raw in text.splitlines():
        line=' '.join(raw.split())
        if not line: continue
        if line.startswith('REGIONAL '):
            key=re.sub(r'^REGIONAL (?:DE |DO )?','',line)
            region,pastor_id=REGIONS[key]; pastor=None; field=None
            city='Embu das Artes' if key=='EMBU DAS ARTES' else None
        elif line.startswith('RESPONSÁVEL:'):
            name=re.sub(r'^RESPONSÁVEL:\s*PR\.?\s*','',line)
            pastor={'nome':'Pr. '+title(name),'pastorId':pastor_id,'cargo':'Responsável regional'}
        elif not line.startswith('\uf0b7') and line.endswith(':'):
            field=re.sub(r'^CAMPO (?:DE |DO )?','',line[:-1])
            city=re.sub(r'-(SP|PR)$','',field); city=title(city)
            if city=='São Miguel': city='São Paulo'
            if city=='Ilha Bela': city='Ilhabela'
            if city=='Paraná': city='Maringá'
            state='PR' if field.endswith('-PR') else 'SP'
        elif line.startswith('\uf0b7'):
            name,address=line[1:].strip().split(':',1); address=address.strip(); name=title(name)
            local_city=city
            # Cidades explicitamente indicadas no nome/endereço da congregação.
            overrides={'Monte Alto':'Monte Alto','Barrinha':'Barrinha','Taboão da Serra':'Taboão da Serra','Diadema-Sp':'Diadema','Ribeirão Pires-Sp':'Ribeirão Pires','Guapiaçu':'Guapiaçu','Uchoa':'Uchoa','Nhandeara':'Nhandeara','Tabapuã':'Tabapuã','Cajati Hold':'Cajati','Cajato São José':'Cajati'}
            local_city=overrides.get(name,local_city)
            if name.startswith('Boituva'): local_city='Boituva'
            if region=='Embu das Artes' and name in ['Macedônia','Jd.Sandra']: local_city=None
            if name=='Guarapiranga': local_city=None
            cep=None; cep_text=None
            match=re.search(r'CEP\s*[-:,]?\s*([\d][\d .-]*\d)',address,re.I)
            if not match:
                match=re.search(r'\b(\d{5}\s*-\s*\d{3})\b',address)
            if match:
                cep_text=match[1]; digits=re.sub(r'\D','',cep_text)
                if len(digits)==8: cep=digits[:5]+'-'+digits[5:]
            query_address=re.sub(r'CEP\s*[-:,]?\s*[\d][\d .-]*\d','',address,flags=re.I).strip(' ,;-')
            if cep_text: query_address=query_address.replace(cep_text,'').strip(' ,;-')
            query_address=re.sub(r'\bCEP\s*[-:,]?\s*','',query_address,flags=re.I)
            query_address=re.sub(r',\s*[–-]\s*',', ',query_address)
            query_address=' '.join(query_address.split()).strip(' ,;-/')
            # A grafia da rua da Matriz já consta corretamente na página de contato.
            if name=='Matriz-Lapa': query_address='Rua Cipião, 235, Lapa'
            key=slug((local_city or region)+'-'+name)
            if any(r['id']==key for r in records): key+='-'+str(len(records)+1)
            records.append({'id':key,'nome':name,'cidade':local_city,'uf':state,'regional':region,'campo':title(field) if field else None,'endereco':query_address,'cep':cep,'responsavel':pastor.copy() if pastor else None,'contato':{'telefone':None,'whatsapp':None,'email':None},'coordenadas':None,'fonte':{'pagina':page_no,'texto':line[1:].strip()},'pendencias':['CEP incompleto ou inválido no documento'] if cep_text and not cep else []})
assert len(records)==161,len(records)
# Contato oficial da sede já presente no site; não se aplica às demais congregações.
records[0]['contato']['telefone']='(11) 3864-2547'
existing=ROOT/'js/igrejas-dados.js'
if existing.exists():
    old=json.loads(existing.read_text(encoding='utf-8').split(' = ',1)[1].rstrip(';\n '))
    by_id={r['id']:r for r in old['igrejas']}
    for r in records:
        if r['id'] in by_id: r['coordenadas']=by_id[r['id']].get('coordenadas')
payload={'fonte':SOURCE,'igrejas':records}
existing.write_text('window.ADPAULISTANA_IGREJAS = '+json.dumps(payload,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
(ROOT/'data/igrejas-fonte.txt').write_text('Fonte: '+SOURCE+'\n\n'+'\n'.join(parts),encoding='utf-8')
print('Importadas',len(records),'congregações;',sum(bool(r['cep']) for r in records),'com CEP válido;',sum(bool(r['responsavel']) for r in records),'com responsável regional.')
