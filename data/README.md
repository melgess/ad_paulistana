# Cadastro de congregações

Página: `nossas-igrejas.html`. Cadastro central: `js/igrejas-dados.js`.

## Manutenção

- Edite nome, endereço, cidade, CEP e contatos no registro de cada congregação.
- `responsavel.pastorId` referencia o cadastro existente em `js/pastores-dados.js`. A associação indica responsabilidade **regional**, sem atribuir pastoreio local.
- `contato.telefone` aceita telefone brasileiro; `contato.whatsapp` deve conter DDI 55 e DDD; `contato.email` aceita o endereço de e-mail local.
- Só preencha coordenadas quando o endereço tiver sido conferido. Use `precisao: "numero"` para o imóvel e `"logradouro"` para referência aproximada da rua.
- O telefone da Matriz foi reutilizado do contato oficial já existente no site. Não foi copiado para as outras igrejas.

## Fonte e importação

Fonte: https://drive.google.com/file/d/1BUXBbCUhnzteCJW2jQQWGNult9Kr73eE/view

A transcrição do PDF está em `igrejas-fonte.txt`, com páginas. Cada registro conserva o texto original e a página de origem.

O script `scripts/importar-igrejas.py caminho/do/documento.pdf` reconstrói o cadastro a partir do PDF (requer pypdf). Revisar alterações manuais antes de executar novamente: a importação reconstrói endereços, contatos e responsáveis; apenas coordenadas existentes são reaproveitadas.

## Coordenadas

Resultado da consulta inicial: 53 de 161 endereços com coordenadas aceitas por correspondência de rua, cidade e CEP quando disponível. Não representa confirmação presencial do imóvel. Apenas 2 resultados correspondem ao número; as demais coordenadas são referências de logradouro.

A página não consulta um geocodificador e não transmite a posição do visitante. A distância é calculada localmente, em linha reta, entre os endereços com coordenadas; os demais aparecem ao final com distância indisponível.

Resultados OSM mantidos em `geocodificacao-cache.json`. A revisão local do cache é feita com `scripts/geocodificar-igrejas.py --cache-only`. O modo sem essa opção só serve para uma consulta pontual e manual do cadastro, nunca tarefa periódica: uma única máquina/thread, intervalo mínimo de 1,1 s, cache persistente, User-Agent identificável e interrupção ao receber 403/429. Política: https://operations.osmfoundation.org/policies/nominatim/ . Dados: © colaboradores do OpenStreetMap, ODbL; https://www.openstreetmap.org/copyright .

## Pendências de conteúdo

- 160 congregações sem contato local no documento.
- 54 congregações sem responsável informado (Capital e Grande São Paulo).
- Faltam fotos de Pr. Alan Barbosa e Pr. José dos Santos Ferreira. Os nomes são mostrados sem foto.
- Associação das fotos segue os nomes dos arquivos: José Novais / José Novaes e William Assis / Willian Pereira de Assis precisam de confirmação editorial da grafia completa.
- Os CEPS incompletos e demais grafias problemáticas foram preservados na fonte; não foram completados por suposição.

## Endereços sem coordenadas confiáveis

| Congregação | Cidade/região | Endereço | Página do PDF |
| --- | --- | --- | --- |
| Jd.Panamericano | São Paulo | R. NATUREZA, 15- JD PANAMERICANO | 1 |
| Jd.Santo Elias | São Paulo | R. JONAS EUDOQUE SANTOS- VIELA A, 283- JD SANTO ELIAS | 1 |
| Jd.Sidney | São Paulo | R SIMÃO RAGUSA, 401- JD SIDNEY | 1 |
| Vila Souza | São Paulo | R. ÂNGELO ALEGRO, 19B - VILA SOUZA | 1 |
| Vila Iório | São Paulo | R. ANTÔNIO GOMES DE OLIVEIRA, 504- VILA IORO | 1 |
| Vila Mangalot | São Paulo | R. JOAQUIM OLIVEIRA FREITAS, 132 VILA MANGALOT | 1 |
| Comunidade do Moinho | São Paulo | R. Dª ELIAS CHAVES S/N, ; CAMPOS ELISEOS | 1 |
| São Mateus | São Paulo | TV. AMOR CIGANO, 85 - JARDIM DA CONQUISTA, SP | 1 |
| Pq.Novo Mundo | São Paulo | R. DONA MARIA DAS QUEDAS, 37 | 1 |
| Fernão Dias | São Paulo | RUA BARACHELAS SEM NÚMERO FERNÃO DIAS | 1 |
| Jd.Pouso Alegre | Barueri | R. GERTRUDES SILVA RAMOS, 508 | 1 |
| Pq.dos Camargos | Barueri | R. AMÉLIA, 82 | 1 |
| Laranjeiras | Caieiras | RUA JOÃO DE BARRO, 145 | 1 |
| Jordanésia | Cajamar | RUA HORTOLÂNDIA,15 – COLINA NOVA JORDANÉSIA | 1 |
| Cidade Ariston | Carapicuíba | AV. GIOVANNI NAZARÉ SILVA DE OLIVEIRA 513, ARISTON | 2 |
| Vila Silviânia | Carapicuíba | R. BOROCÉIA, II 15, VILA SIVIANIA | 2 |
| Francisco Morato | Francisco Morato | JARDIM VASSOURAS - RUA JARBAS DE AZEVEDO, 68 | 2 |
| Franco da Rocha | Franco da Rocha | VILA BELA R. JOSÉ AUGUSTO DA SILVA LOPES, 532 | 2 |
| Jd.Rosemary | Itapevi | R. ROQUE ALVES MENDES, 368 | 2 |
| Pq.Suburbano | Itapevi | R. DOS PERNAMBUCOS, 769 | 2 |
| Jd.Bela Vista | Itapevi | AV. DOS BUGRES, 393 | 2 |
| Jd.Santa Cecilia | Itapevi | R. MEXILHÄO PRÓXIMO N° 53 | 2 |
| Colinas de Itapevi | Itapevi | R. JORGE KOBAYASHI, Nº 213, TERREO | 2 |
| Vila Godinho | Jandira | RUA QUINZE DE NOVEMBRO - JARDIM STELLA MARIS | 2 |
| Jd. Gabriela | Jandira | R. AVELINO RIBEIRO DA SILVA, 286 – JD.GABRIELA 1 - JANDIRA | 2 |
| Angelina | Jandira | R. KATY, 227, JD GABRIELA 1- JANDIRA | 2 |
| Jd.Briquet | Jandira | R. CANGARATAMA, 307 – NOSSA SENHORA DE FÁTIMA - JANDIRA | 2 |
| Jd.Manah | Osasco | RUA IZOLDINO ALVES, 18 | 2 |
| Jd.Santa Maria | Osasco | AV ULISSES GUIMARAES, 249 | 2 |
| Jd.Veloso | Osasco | R. INAJAR PEREIRA DE SOUZA, 157 | 2 |
| Pq.Imperial | Osasco | RUA VIELA DA ESPERANÇA, 12-A, PORTAL D’OESTE | 2 |
| Colinas da Anhanguera | Santana de Parnaíba | R. ALDO BONADEI, 40 | 3 |
| Bairro 120 | Santana de Parnaíba | R. ZODIACO, 84 | 3 |
| Chácara Solar | Santana de Parnaíba | R. VENUS, 511-A | 3 |
| Jd.Santa Helena | São Paulo | R. DR. ARTUR DA NOVA, 2131 | 3 |
| Novo Horizonte | São Paulo | R. RECIFE, 15 - JARDIM HELENA, SÃO PAULO - SP | 3 |
| Jardim Araraquara | Araraquara | RUA CARLOS AMADEU BIZELI, Nº 81, JD. ARARAQUARA | 3 |
| Parque Residêncial São Paulo | Araraquara | RUA ALBERT EINSTEIN, 1622 , PQ. RESIDENCIAL SÃO PAULO | 3 |
| Del Rei | Araraquara | RUA ANTONIO MATAR, 583, JARDIM DEL REY | 3 |
| Selmi Dei Setor V | Araraquara | RUA MARIA DO CARMO FERREIRA GRANATTO, 227, SELMI DEI SETOR 5 | 3 |
| Vale do Sol | Araraquara | RUA ALBERTO ZERBINATTE, Nº 06, VALE DO SOL | 3 |
| Maria Luiza | Araraquara | AV. SGT. POLÍCIA MILITAR VITAL MARIA BUENO LOPES, 160, JARDIM MARIA LUIZA | 3 |
| Nova Marília | Marília | AV DURVAL DE MENEZES, 698, NOVA MARÍLIA | 4 |
| Sede Regional | Pitangueiras | R. ARTUR MESQUITA, 12, SANTA VITÓRIA | 4 |
| Sede Regional | Ribeirão Preto | RUA 14, 39, JARDIM PROGRESSO | 4 |
| Sede Regional | Sertãozinho | R. JOÃO MARIO DE CASTRO, 15, BAIRRO SINDICATO | 4 |
| Barrinha | Barrinha | R. JAMIL SAID SALEH, 735, JD PAULISTA | 4 |
| Sede | Araçatuba | RUA JOSÉ MADRID MARTINS 341- SÃO RAFAEL | 4 |
| Sede | Andradina | RUA ALNA KARDECK ,3500, PQ SÃO GABRIEL- ANDRADINA | 4 |
| Jd.Canaã | Andradina | END. RUA JOSÉ ANTÔNIO BATISTA, 80, JARDIM CANNÃ, ANDRADINA-SP | 5 |
| Sede | Castilho | R. HUM, 560, B. NOVA YORK | 5 |
| Sede | Panorama | AV. DR. MILTON DE NORONHA GUSTAVO, 1321 | 5 |
| Sede | Guararapes | RUA: FULGÊNCIO BONFIETTI N°50- BAIRRO ITALIA | 5 |
| Sede | Tupã | AV DOMINGOS DA COSTA LOPES 325.- BAIRRO JARDIM ITAIPU | 5 |
| Macedônia | Embu das Artes | RUA PRISCILIANA DE ALMEIDA – 247 | 5 |
| Taboão da Serra | Taboão da Serra | RUA ENGENHEIRO MIGUEL DE PAIVA BOENO | 5 |
| Jd.Sandra | Embu das Artes | AVENIDA DAS CRUZADAS N 337 PAISAGEM CASA GRANDE | 5 |
| Sede-Ocean | Praia Grande | RUA SEBASTIANA CELITE AGREALA, 14.330 - ANHANGUERA- PRAIA GRANDE | 5 |
| Vila Mirim | Praia Grande | RUA O BRASIL PARA CRISTO,384 - VILA MIRIM - PRAIA GRANDE - SP | 6 |
| Melvi | Praia Grande | RUA MONTE SERRAT, TRAVESSA 13, JD MELVI - PRAIA GRANDE - SP | 6 |
| Caeiras | Praia Grande | RUA TANCREDO NEVES,5686 - CAIEIRAS - PRAIA GRANDE - SP | 6 |
| Tupiry | Praia Grande | AV SÃO FRANCISCO DE ASSIS,,29880 - TUPIRY - PRAIA GRANDE - SP | 6 |
| Parque das Bandeiras | São Vicente | AV DOUTOR ESMERALDO SOARES TARQUINIO CAMPOS FILHO, 691 | 6 |
| Rio Branco | São Vicente | RUA JOSÉ BONA SOBRINHO,391 - JD RIO BRANCO - SÃO VICNETE - SP | 6 |
| Vila Edna | Guarujá | RUA NOSSA SENHORA APARECIDA, 109 - VILA EDNA - GUARUJÁ - SP | 6 |
| Pedreira | Guarujá | AV ASSIS CHATEOBRIAND,2104 - PEDREIRA- GUARUJÁ - SP | 6 |
| Conceiçãozinha | Guarujá | RUA OPERÁRIA, 70, SITIO CNMCEIÇÃOZINHA - GUARUJÁ - SP | 6 |
| Vila Baiana | Guarujá | RUA MARIO MALHEIRO, 325 - JD PRAIAN0 - GUARUJÁ - SP | 6 |
| Prainha | Guarujá | RUA PEREQUE, 718 - PRAINHA - GUARUJÁ - SP | 6 |
| Ilha Bela | Ilhabela | RUA PEDRO RIBEIRO PONTES, 98 - BAIRRO DO REINO - ILHA BELA- SP | 6 |
| Caraguatatuba | Caraguatatuba | RUA GÊNESIS, 228, BAIRRO TARUMÃ | 6 |
| Capinzal | Registro | ESTRADA DO CAPINZAL S/N | 6 |
| Cajati Hold | Cajati | RUA OPALA, 63, BAIRRO INHUNGUVIRA - CAJATI - SP | 6 |
| Cajato São José | Cajati | RUA PROJETADA,515, SÃO JOSÉ - CAJATI - SP | 6 |
| Sede Regional | Mauá | R. CONSTANTE DELLA MARINGA, 257, ITAPARK NOVO | 7 |
| Cerqueira Leite | Mauá | R. PROJETADA, 06 | 7 |
| Jd.Oratório I | Mauá | R. MACEIÓ, 104 | 7 |
| Jd.Oratório Ii | Mauá | R. AYRTON SENNA, 131 | 7 |
| Bairro Paranavaí | Mauá | R. CAMBÉ, 168 | 7 |
| Jd.Salgueiro | Mauá | RUA PARAGUAI,87 PARQUE DAS AMERICAS MAUÁ | 7 |
| Ouro Fino | Mauá | R. KANJI MIASAKA, 07 | 7 |
| Diadema-Sp | Diadema | RUA ESTRADA DA AGUA SANTA, 13 ELDORADO DIADEMA | 7 |
| Ribeirão Pires-Sp | Ribeirão Pires | BARRO BRANCO, R. JOAQUIM TÁVORA, 89 | 7 |
| Jardim Leonel | Itapetininga | RUA IZAURA ,18 | 7 |
| Angatuba | Angatuba | RUA DO PROGRESSO,581 | 7 |
| Banco da Terra 2 | Angatuba | BAIRRO GUAREI VELHO,0 | 7 |
| Sede Regional | Santa Bárbara do Oeste | RUA FLORIANO PEIXOTO, 1512 VILA BRASIL | 8 |
| Pq.Rochele | Santa Bárbara do Oeste | AV. DR. SEBASTIÃO DE PAULA COELHO, 950, PQ. ROCHELE | 8 |
| Jd.Esmeralda | Santa Bárbara do Oeste | RUA DO RAYON, 376, JD. ESMERALDA, SANTA BARBARA D’OESTE | 8 |
| Santa Rita de Cassia | Santa Bárbara do Oeste | RUA OLÍMPIA AMARO DA SILVA NÚMERO 367, SANTA RITA DE CASSIA | 8 |
| Sede Regional | Nova Odessa | R. HERNAN JANKOVITZ, 568, JD SANTA ROSA | 8 |
| Sede Regional Maringá | Maringá | AV DAS TORRES, 2154 QD 170 LOTE 24 - MARINGÁ - PR | 8 |
| Sede Regional | São José do Rio Preto | RUA SÃO VICENTE DE PAULO 201 JD ASTURIAS | 8 |
| Jd. Santo Antonio | São José do Rio Preto | RUA KASUTOCHI SAKAKIBARA 251 JD STO ANTONIO | 8 |
| Res. Solidariedade | São José do Rio Preto | RUA MARISTELA LENARDUZZI 470 RES. SOLIDARIEDADE | 9 |
| Res. Amizade | São José do Rio Preto | RUA JACLELINE FREITAS DO PRADO 38 RES AMIZADE | 9 |
| Res. Dignidade | São José do Rio Preto | AV THALES CARVALHO ZACHARIAS 1251 RES DIGNIDADE | 9 |
| Sede | Ilha Solteira | ILHA SOLTEIRA/SP R. GRAJAÚ, 115, BAIRRO COHAB | 9 |
| Sede | Pereira Barreto | R. PARAGUAI, 3659, SÃO FRANCISCO | 9 |
| Sede | Sud Menucci | R. EVARISTO GONÇALVES, 1036, JD. BRASÍLIA | 9 |
| Sede Regional | Sorocaba | R. RUA LÇÃO BRASIL, 15 | 10 |
| Boituva – Pq.Novo Mundo | Boituva | RUA ORLANDO MACIEL DE LIMA, 173 PQ. NOVO MUNDO | 10 |
| Boituva | Boituva | RECANTO MARAVILHA (RURAL) | 10 |
| Jd.Dora | Suzano | RUA 09 N: 48 | 10 |
| Caulim | Suzano | RUA 4, 140B- JARDDIM DAS LAVRAS | 10 |
| Miguel Badra | Suzano | RUA EDIMILSON RODRIGUES MARCELINO N: 260 | 10 |
| Planalto | Suzano | RUA FRANCISCO NORBERTO N:155 | 10 |
| Sede | Igaratá | RUA JOSE BENEDITO ARANTES N: 500- IGARATÁ | 10 |
