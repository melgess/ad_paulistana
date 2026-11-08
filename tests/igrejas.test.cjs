'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const search = require('../js/igrejas.js');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync('js/igrejas-dados.js','utf8'),context);
vm.runInNewContext(fs.readFileSync('js/pastores-dados.js','utf8'),context);
const rows=context.window.ADPAULISTANA_IGREJAS.igrejas;
const people=context.window.ADPASTORES;

test('todos os 161 registros da fonte são únicos e continuam acessíveis',()=>{
 assert.equal(rows.length,161);
 assert.equal(new Set(rows.map(r=>r.id)).size,161);
 assert.equal(search.filtrar(rows,{}).length,161);
 for(const row of rows){
  assert.ok(row.endereco&&row.fonte.texto&&row.fonte.pagina);
  if(row.responsavel?.pastorId){
   const person=people.find(p=>p.id===row.responsavel.pastorId);
   assert.ok(person,row.id);assert.ok(fs.existsSync(person.foto));
  }
 }
});
test('CEP funciona com ou sem hífen e em busca parcial',()=>{
 for(const query of ['05047060','05047-060','05047']) assert.ok(search.filtrar(rows,{busca:query}).some(r=>r.id==='sao-paulo-matriz-lapa'));
});
test('busca ignora acentos e combina nome e cidade',()=>{
 const found=search.filtrar(rows,{busca:'jaguare sao paulo'});
 assert.equal(found.length,1);assert.equal(found[0].nome,'Jaguaré');
 assert.equal(search.filtrar(rows,{busca:'texto-inexistente-123456789'}).length,0);
});
test('cidade e regional são filtros cumulativos',()=>{
 const found=search.filtrar(rows,{cidade:'Marília',regional:'Araraquara'});
 assert.equal(found.length,3);
 assert.equal(search.filtrar(rows,{cidade:'Marília',regional:'Suzano'}).length,0);
});
test('distância geográfica é em linha reta, inclusive para coordenadas zero',()=>{
 assert.equal(search.distancia({latitude:0,longitude:0},{latitude:0,longitude:0}),0);
 const km=search.distancia({latitude:0,longitude:0},{latitude:0,longitude:1});
 assert.ok(km>111&&km<112);
 assert.equal(search.temCoordenadas({coordenadas:{latitude:0,longitude:0}}),true);
 assert.equal(search.temCoordenadas({coordenadas:{latitude:91,longitude:0}}),false);
 assert.equal(search.temCoordenadas({coordenadas:{latitude:null,longitude:null}}),false);
});
test('ordenação coloca as mais próximas primeiro e preserva registros sem coordenadas',()=>{
 const fixture=[{id:'far',nome:'Longe',cidade:'A',coordenadas:{latitude:0,longitude:1}},
 {id:'unknown',nome:'Sem coordenadas',cidade:'A',coordenadas:null},
 {id:'near',nome:'Perto',cidade:'A',coordenadas:{latitude:0,longitude:.01}}];
 assert.deepEqual(search.ordenar(fixture,{latitude:0,longitude:0}).map(r=>r.id),['near','far','unknown']);
 assert.equal(fixture[0].id,'far');
 const ordered=search.ordenar(rows,{latitude:-23.5233751,longitude:-46.6991587});
 assert.equal(ordered.length,161);assert.equal(ordered[0].id,'sao-paulo-matriz-lapa');
 const firstUnknown=ordered.findIndex(r=>!search.temCoordenadas(r));
 assert.ok(ordered.slice(firstUnknown).every(r=>!search.temCoordenadas(r)));
});
test('todos os links de mapas preservam endereço e cidade, sem enviar a origem do visitante',()=>{
 for(const row of rows){
  const maps=search.linksMapas(row);const google=new URL(maps.google);const waze=new URL(maps.waze);
  assert.equal(google.searchParams.get('api'),'1');
  assert.ok(google.searchParams.get('destination').includes(row.endereco));
  if(row.cidade) assert.ok(google.searchParams.get('destination').includes(row.cidade));
  assert.equal(waze.searchParams.get('q'),google.searchParams.get('destination'));
  assert.equal(waze.searchParams.get('navigate'),'yes');
  assert.equal(google.searchParams.has('origin'),false);
 }
});
