import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
const built=await build({stdin:{contents:'export * from "./src/lib/patientImport"; export * from "./src/lib/finance"; export {treatmentTotals,lastVisit} from "./src/lib/derive"; export {emptyPatient} from "./src/store/store";',resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,platform:'node',format:'esm'});
const api=await import(`data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString('base64')}`);
const person=api.emptyPatient({id:'test',name:'Teste',stage:'tratamento',importedSources:[{id:'source',name:'original.docx',attachmentId:'file',sha256:'a'.repeat(64),text:'Registro anterior',importedAt:'2026-10-02'}],attachments:[{id:'file',name:'original.docx',mime:'application/octet-stream',size:1,category:'documento',createdAt:'2026-10-02'}]});
const pack={app:'prontuario-patient-import',version:1,expectedEmail:'teste@example.com',patients:[person],files:{file:'data:application/octet-stream;base64,YQ=='}};
assert.equal(api.validatePatientImport(pack,'teste@example.com',[]),pack);
assert.throws(()=>api.validatePatientImport(pack,'outra@example.com',[]));
assert.throws(()=>api.validatePatientImport(pack,'teste@example.com',[person]));
assert.throws(()=>api.validatePatientImport({...pack,files:{}},'teste@example.com',[]));
assert.equal(api.emptyPatient(person).stage,'tratamento');
const historical={id:'old',amount:1000,date:'2025-01-01',method:'pix',historical:true,receiptAttachmentId:'file'};
assert.equal(api.treatmentTotals({...person,treatments:[{price:500,status:'aprovado'}],payments:[historical]}).balance,500);
assert.equal(api.deletablePaymentAttachment({...person,payments:[historical]},historical),undefined);
assert.equal(api.deletablePaymentAttachment({...person,importedSources:[],payments:[historical]},historical),undefined);
assert.equal(api.deletablePaymentAttachment({...person,importedSources:[],payments:[{...historical,historical:false}]},{...historical,historical:false}),'file');
assert.throws(()=>api.validatePatientImport({...pack,patients:[{...person,payments:[{...historical,date:'2025-02-31'}]}]},'teste@example.com',[]));
assert.equal(api.lastVisit({...person,evolutions:[{date:'2025-01-01',clinicalVisit:false}]},[]),null);
if(process.argv[2]) {
 const actual=JSON.parse(await readFile(process.argv[2],'utf8'));
 api.validatePatientImport(actual,actual.expectedEmail,[]);
 console.log(`Pacote real validado: ${actual.patients.length} pacientes / ${Object.keys(actual.files).length} documentos.`);
}
console.log('Testes de importação, conta, duplicação, histórico e proteção dos originais passaram.');
