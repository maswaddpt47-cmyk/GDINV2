#!/usr/bin/env node
// Diagnostic des communes : pour chaque graphie brute d'un fichier, compare
//   - la clé de la macro de recomptage (NormCommune, approximative),
//   - la clé de l'application (normCommuneKey) et son rattachement
//     au référentiel officiel (rattacherCommune), sinon la graphie canonique
//     (communesCanoniques), exactement comme parseRows().
// Aucun réglage : les deux colonnes de groupes sortent des règles telles quelles.
//
// Usage : node scripts/diag-communes.js communes.tsv
//   communes.tsv : une graphie par ligne, « libellé<TAB>nombre » (nombre facultatif,
//   1 par défaut). Les espaces de tête et de fin sont conservés : ce sont des
//   graphies distinctes pour la macro. Ne contient que des noms de communes.
const fs=require('fs');
const P=require('../gdin-pure.js');

// Réplique de NormCommune (ControleGDIN.bas) : minuscules, accents retirés,
// tout caractère hors a-z0-9 devient un espace, st→saint, ste→sainte.
function cleMacro(s){
  const t=String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  return t.replace(/[^a-z0-9]/g,' ').split(' ').filter(Boolean)
    .map(w=>w==='st'?'saint':w==='ste'?'sainte':w).join(' ');
}

const f=process.argv[2];
if(!f){console.error('Usage : node scripts/diag-communes.js communes.tsv');process.exit(1);}
const lignes=fs.readFileSync(f,'utf8').split(/\r?\n/).filter(l=>l.length);
const brut=lignes.map(l=>{
  const i=l.lastIndexOf('\t');
  const n=i>=0&&/^\d+$/.test(l.slice(i+1).trim())?+l.slice(i+1):1;
  return{lib:i>=0&&n!==1||/\t\d+$/.test(l)?l.slice(0,i):l,n};
});

// Mêmes étapes que parseRows() : canon calculé sur les lignes, puis par ligne
// rattachement officiel, à défaut graphie canonique de la clé.
// parseRows() lit chaque cellule avec .trim() avant tout (cell(), gdin-pure.js:553-557).
const records=[];brut.forEach(b=>{for(let i=0;i<b.n;i++)records.push({commune:b.lib.trim()});});
const{canon}=P.communesCanoniques(records);
const lignesOut=brut.map(b=>{
  const lib=b.lib.trim();
  const officiel=P.rattacherCommune(lib);
  const cleApp=P.normCommuneKey(lib);
  return{lib:b.lib,n:b.n,cleMacro:cleMacro(b.lib),cleApp,officiel,
    final:officiel||canon[cleApp],voie:officiel?'référentiel':'canonique'};
});

const grp=(cle)=>{const m=new Map();lignesOut.forEach(l=>{const k=cle(l);(m.get(k)||m.set(k,[]).get(k)).push(l);});return m;};
const gMacro=grp(l=>l.cleMacro),gApp=grp(l=>l.final);

const q=s=>'«'+s+'»';
console.log('GRAPHIES BRUTES (distinctes, casse et espaces conservés) :',lignesOut.length,'— lignes :',records.length);
console.log('\nlibellé brut | n | clé macro | clé application | rattachement officiel | voie | commune finale');
lignesOut.forEach(l=>console.log([q(l.lib),l.n,l.cleMacro,l.cleApp,l.officiel||'—',l.voie,l.final].join(' | ')));
console.log('\nGROUPES MACRO (NormCommune) :',gMacro.size);
console.log('GROUPES APPLICATION (commune finale) :',gApp.size);

console.log('\nGroupes de l\'application qui réunissent plusieurs groupes de la macro :');
let diffs=0;
gApp.forEach((ls,fin)=>{
  const cles=[...new Set(ls.map(l=>l.cleMacro))];
  if(cles.length>1){diffs++;
    console.log(' ●',fin,'←',cles.map(c=>'«'+c+'» ('+ls.filter(l=>l.cleMacro===c).map(l=>q(l.lib)+'×'+l.n).join(', ')+')').join('  +  '));}
});
if(!diffs)console.log(' (aucun)');
console.log('\nGroupes de la macro que l\'application sépare :');
let sep=0;
gMacro.forEach((ls,cle)=>{
  const fins=[...new Set(ls.map(l=>l.final))];
  if(fins.length>1){sep++;console.log(' ●',cle,'→',fins.join(' | '));}
});
if(!sep)console.log(' (aucun)');
console.log('\nGraphies non rattachées au référentiel officiel :');
lignesOut.filter(l=>!l.officiel).forEach(l=>console.log(' -',q(l.lib),'×'+l.n,'→ canonique',l.final));
