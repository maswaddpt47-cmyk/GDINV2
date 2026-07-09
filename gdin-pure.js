// gdin-pure.js — fonctions utilitaires pures
// Aucune dépendance DOM, Chart.js ou état mutable.
// Chargé par index.html (via <script src>) ET par tests.html.

// ─── Constantes ────────────────────────────────────────────────────────────
const MONTH_FR=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const TYPE_KEYS=['Accompagnement','Prise de contact','Orientation vers un tiers'];
// Palette étendue pour N types
const TYPE_PALETTE=['#3b82f6','#10b981','#8b5cf6','#f97316','#22d3ee','#eab308','#ef4444','#ec4899','#14b8a6','#a855f7','#84cc16','#f59e0b'];
function typeColor(i){return TYPE_PALETTE[i%TYPE_PALETTE.length];}

// ─── CMS_MAP_RAW — variantes connues → nom canonique ───────────────────────
// Les valeurs absentes du map sont rattachées à 'Autre structure' (voir extractDominantCms)
const CMS_MAP_RAW={
  // === CMS / antennes CD47 ===
  'Centre Médico-Social de Villeneuve/Lot':'CMS Villeneuve/Lot',
  'CMS Villeneuve-sur-Lot':                'CMS Villeneuve/Lot',
  'CMS Villeneuve':                         'CMS Villeneuve/Lot',
  'CMS de Villeneuve-sur-Lot':             'CMS Villeneuve/Lot',
  'CMS Villeneuve/Lot':                     'CMS Villeneuve/Lot',
  'CMS Villeneuve (ASE)':                   'CMS Villeneuve/Lot',
  'Visite à Domicile (CMS Villeneuve-Sur-Lot)':'CMS Villeneuve/Lot',
  'Centre Médico-Social Agen Montanou':    'CMS Agen Montanou',
  'CMS Montanou':                           'CMS Agen Montanou',
  'CMS MONTANOU':                           'CMS Agen Montanou',
  'Centre Médico-Social Agen Louis Vivent':'CMS Agen Louis Vivent',
  'CMS Louis Vivent':                       'CMS Agen Louis Vivent',
  'Centre Médico-Social Agen Tapie':       'CMS Agen Tapie',
  'Centre Médico-Social de Marmande':      'CMS Marmande',
  'Visite à Domicile (CMS Marmande)':      'CMS Marmande',
  'Centre Médico-Social de Fumel':         'CMS Fumel',
  'CMS de Fumel':                           'CMS Fumel',
  'CCAS Fumel':                             'CMS Fumel',
  'Visite à Domicile (CMS Fumel)':         'CMS Fumel',
  'France Services - FUMEL':               'CMS Fumel',
  'France Services - Fumel':               'CMS Fumel',
  'Centre Médico-Social de Nérac':         'CMS Nérac',
  'CMS Nérac':                              'CMS Nérac',
  'CMS de Nérac':                           'CMS Nérac',
  'Visite A Domicile (CMS Nérac)':         'CMS Nérac',
  '10 Place Aristide Briand 47600 Nérac':  'CMS Nérac',
  'Centre Médico-Social de Tonneins':      'CMS Tonneins',
  'CMS Tonneins':                           'CMS Tonneins',
  'TONNEINS':                               'CMS Tonneins',
  'POINT COMMUN TONNEINS':                  'CMS Tonneins',
  'Le Point Commun Tonneins':               'CMS Tonneins',
  'Rue des Vignes 47400 Tonneins':          'CMS Tonneins',
  'Permanence - Centre Médico-Social Antenne AIGUILLO':'CMS Antenne Aiguillon',
  'Permanence - Centre Médico-Social Antenne AIGUILLON':'CMS Antenne Aiguillon',
  'France Services Aiguillon':              'CMS Antenne Aiguillon',
  'France Service Aiguillon':               'CMS Antenne Aiguillon',
  'FS Aiguillon':                           'CMS Antenne Aiguillon',
  'AIGUILLON':                              'CMS Antenne Aiguillon',
  'CMS Aiguillon':                          'CMS Antenne Aiguillon',
  'CCAS Aiguillon':                         'CMS Antenne Aiguillon',
  'Cours Alsace Lorraine 47190 Aiguillon':  'CMS Antenne Aiguillon',
  '30 Rue Thiers 47190 Aiguillon':          'CMS Antenne Aiguillon',
  'Permanence - France Travail AIGUILLON':  'CMS Antenne Aiguillon',
  'Permanence - Antenne du CMS de Marmande (ST-PARDOU)':'CMS Marmande (St-Pardoux)',
  'Permanence - Antenne du CMS de Marmande (ST-PARDOUX-ISAAC)':'CMS Marmande (St-Pardoux)',
  'Permanence - Antenne dU CMS de Marmande (ST-PARDOUX-ISAAC)':'CMS Marmande (St-Pardoux)',
  'Permanence - UDR de ST-PARDOUX-ISAAC':  'CMS Marmande (St-Pardoux)',
  'Permanence - Centre médico-social de Casteljaloux':  'CMS Casteljaloux',
  'Centre Médico-Social de Casteljaloux':               'CMS Casteljaloux',
  'Permanence - Centre Social de CASTILLONNES':         'Permanence Castillonnès',
  // === DSIAN et variantes typographiques ===
  'DSIAN':'DSIAN','dsian':'DSIAN','DISAN':'DSIAN','DSAIAN':'DSIAN',
  'DSIA?':'DSIAN','DSAIN':'DSIAN','DSAN':'DSIAN',
  // === France Services ===
  'France Services Villeneuve/Lot':         'France Services Villeneuve/Lot',
  'France Services du Confluent':           'France Services Confluent',
  'France Services Confluent':              'France Services Confluent',
  'Maison des Marmandais - France Services Marmande':'France Services Marmande',
  'France Services Nérac':                  'France Services Nérac',
  'Permanence - France services Nérac':     'France Services Nérac',
  'France Travail':                         'France Travail',
  // === Médiathèques ===
  'Permanence - Médiathèque Départementale':'Médiathèque Départementale',
  'Médiathèque Départementale':             'Médiathèque Départementale',
  'Médiathèque départementale':             'Médiathèque Départementale',
  'médiathèque départementale':             'Médiathèque Départementale',
  'Médiathèque Dptle':                      'Médiathèque Départementale',
  'Médiathèque municipale Villeneuve/Lot':  'Médiathèque Villeneuve/Lot',
  'Médiathèque municipale de Villeneuve/Lot':'Médiathèque Villeneuve/Lot',
  'Médiathèque Municipale Villeneuve/Lot':  'Médiathèque Villeneuve/Lot',
  'Médiathèque municipale VILLENEUVE SUR LOT':'Médiathèque Villeneuve/Lot',
  'Médiathèque Municipale de Villeneuve-sur-Lot':'Médiathèque Villeneuve/Lot',
  'Médiathèque Municipale de Villeneuve/Lot':'Médiathèque Villeneuve/Lot',
  'Médiathèque municipale Villeneve/Lot':   'Médiathèque Villeneuve/Lot',
  'Médiathèque municipale Villeneuve sur Lot':'Médiathèque Villeneuve/Lot',
  'Médiathèque municipale Villeneuve/lot':  'Médiathèque Villeneuve/Lot',
  'Médiathèque municipale Villeneuve-sur-Lot':'Médiathèque Villeneuve/Lot',
  'Médiathèque municipale de Villeneuve sur Lot':'Médiathèque Villeneuve/Lot',
  'Bibliothèque Municipale de Villeneuve-sur-Lot':'Médiathèque Villeneuve/Lot',
  'Bibliothèque Municipale de Villeneuve':  'Médiathèque Villeneuve/Lot',
  'Bibliothèque municipale de Villeneuve sur Lot':'Médiathèque Villeneuve/Lot',
  'Médiathèque de Foulayronnes':            'Médiathèque Foulayronnes',
  'Médiathèque Foulayronnes':               'Médiathèque Foulayronnes',
  'Médiathèque municipale de Foulayronnes': 'Médiathèque Foulayronnes',
  'Médiathèque de FOULAYRONNES':            'Médiathèque Foulayronnes',
  'Médiathèque de Casseneuil':              'Médiathèque Casseneuil',
  'Médiathèque municipale de Casseneuil':   'Médiathèque Casseneuil',
  'médiathèque de Casseneuil':              'Médiathèque Casseneuil',
  'Médiathèque Casseneuil':                 'Médiathèque Casseneuil',
  'Médiathèque CASSENEUIL':                 'Médiathèque Casseneuil',
  'Médiathèque de CASSENEUIL':              'Médiathèque Casseneuil',
  'Bibliothèque de Casseneuil':             'Médiathèque Casseneuil',
  'Médiathèque Pont-du-Casse':              'Médiathèque Pont-du-Casse',
  'Médiathèque de Pont-du-Casse':           'Médiathèque Pont-du-Casse',
  'PONT DU CASSE':                          'Médiathèque Pont-du-Casse',
  'Médiathèque de Boé':                     'Médiathèque Boé',
  'Médiathèque municipale de Boé':          'Médiathèque Boé',
  // === Structures externes majeures ===
  'IME de Fongrave - Layrac':               'IME Fongrave Layrac',
  'IME de Fongrave Layrac':                 'IME Fongrave Layrac',
  'APF France Handicap':                    'APF France Handicap',
  'Association APF France Handicap':        'APF France Handicap',
  'APF France Handicap Agen':               'APF France Handicap',
  'APF France Handicap - Agen':             'APF France Handicap',
  'Mission Locale - antenne de VILLENEUVE-SUR-LOT':'Mission Locale Villeneuve/Lot',
  'Mission Locale antenne de VILLENEUVE-SUR-LOT':'Mission Locale Villeneuve/Lot',
  'Mission Locale Pays Villeneuvois - VILLENEUVE-SUR-':'Mission Locale Villeneuve/Lot',
  'Mission Locale Villeneuve-sur-Lot':      'Mission Locale Villeneuve/Lot',
  'Permanence - Centre social de VILLEREAL':'Centre Social Villéreal',
  'Permanence - Centre social de VILLEREAL (ECLATS)':'Centre Social Villéreal',
  'Permanence - Locaux de ECLATS':          'Centre Social Villéreal',
  'VILLEREAL':                              'Centre Social Villéreal',
  'Association Convergence - Fumel':        'Association Convergence Fumel',
  'Local Association Convergence - Fumel':  'Association Convergence Fumel',
  'Association Convergence':                'Association Convergence Fumel',
  '36 Avenue de Villeneuve-sur-Lot - MONSEMPRON-LIBOS':'GEM Monsempron-Libos',
  'GEM, 36 Av de Villeneuve-sur-Lot, MONSEMPRON-LIBOS':'GEM Monsempron-Libos',
  'GEM, 36 av. de Villeneuve - MONSEMPRON-LIBOS':'GEM Monsempron-Libos',
  'Association GEM - MONSEMPRON-LIBOS':     'GEM Monsempron-Libos',
  '461 Ch. de Cussac, MONSEMPRON-LIBOS':   'GEM Monsempron-Libos',
  'GEM Marmande':                           'GEM Marmande',
  'Groupe FLE - Collège Anatole France Villeneuve sur Lot':'Collège Anatole France Villeneuve/Lot',
  'Collège Anatole France Villeneuve sur Lot':'Collège Anatole France Villeneuve/Lot',
  'Collège Anatole France Villeneuve/Lot':  'Collège Anatole France Villeneuve/Lot',
  'Collège Anatole France - VILLENEUVE SUR LOT':'Collège Anatole France Villeneuve/Lot',
  'Collège Jean Monnet - Fumel':            'Cité Scolaire Fumel',
  'Cité Scolaire de Fumel (Collège)':       'Cité Scolaire Fumel',
  'Cité scolaire de FUMEL':                 'Cité Scolaire Fumel',
  'Cité Sco Fumel':                         'Cité Scolaire Fumel',
  'Cité scolaire de Fumel':                 'Cité Scolaire Fumel',
  'Cité Scolaire de FUMEL':                 'Cité Scolaire Fumel',
  'Collège de Fumel':                       'Cité Scolaire Fumel',
  'Collège Fumel':                          'Cité Scolaire Fumel',
  'Régie de la Vallée du Lot - Fumel':      'Régie Vallée du Lot',
  'Régie de Territoire de la Vallée du Lot - Villeneuve-sur-Lot':'Régie Vallée du Lot',
  'La Sauvegarde':                          'La Sauvegarde ESAT',
  'La Sauvegarde (ESAT) Bon Encontre':      'La Sauvegarde ESAT',
  'La Sauvegarde ESAT':                     'La Sauvegarde ESAT',
  'Maison des Familles - Monsempron-Libos': 'Maison des Familles Monsempron-Libos',
  'Maison des familles - MONSEMPRONS LIBOS':'Maison des Familles Monsempron-Libos',
  'Maison des Familles Monsempron Libos':   'Maison des Familles Monsempron-Libos',
  'Maison des familles MONSEMPRON LIBOS':   'Maison des Familles Monsempron-Libos',
  'Maison des Familles - Monsempron Libos': 'Maison des Familles Monsempron-Libos',
  'Maison des familles Monsempron Libos':   'Maison des Familles Monsempron-Libos',
  'Maison des Familles - MONSEMPRON-LIBOS': 'Maison des Familles Monsempron-Libos',
  'Maison des Familles':                    'Maison des Familles Monsempron-Libos',
  'Haras de Villeneuve-sur-Lot':            'Haras Villeneuve/Lot',
  'Haras nationaux, Villeneuve/Lot':        'Haras Villeneuve/Lot',
  'Haras Villeneuve/Lot':                   'Haras Villeneuve/Lot',
  'Haras Nationaux':                        'Haras Villeneuve/Lot',
  'Haras nationaux':                        'Haras Villeneuve/Lot',
  'Chemins Verts de l\'Emploi - Villeneuve':'Chemins Verts de l\'Emploi',
  'Les Chemins Verts de l\'Emploi':         'Chemins Verts de l\'Emploi',
  'Chemins verts de l\'emploi Agen':        'Chemins Verts de l\'Emploi',
  'Campus numérique':                       'Campus Numérique',
  'Campus Numérique - Agen':                'Campus Numérique',
  'Campus Numérique':                       'Campus Numérique',
  // === Associations et structures diverses → 'Autre structure' ===
  'Association ABRIS':                      'Autre structure',
  'Asso ABRIS':                             'Autre structure',
  'Association ABRIS (Casseneuil)':         'Autre structure',
  'Asso ABRIS (Casseneuil)':                'Autre structure',
  'Asso ABRIS Casseneuil':                  'Autre structure',
  'ABRIS - CASSENEUIL':                     'Autre structure',
  'Association ABRIS Casseneuil':           'Autre structure',
  'Association ABRIS - Casseneuil':         'Autre structure',
  'Association ABRIS ( Casseneuil)':        'Autre structure',
};
// KEEP_CMS dérivée automatiquement — une seule source de vérité
const KEEP_CMS=new Set(Object.values(CMS_MAP_RAW));
// Lookup accent-insensitive + lowercase
function normKey(s){
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g,'')
    .toLowerCase().replace(/\s+/g,' ').trim();
}
const CMS_MAP={};
Object.entries(CMS_MAP_RAW).forEach(([k,v])=>{CMS_MAP[k]=v;CMS_MAP[normKey(k)]=v;});
// Extraire le CMS dominant : le plus fréquent parmi les non-DSIAN
// Si lieuRaw est vide → '' (ligne ignorée à l'import)
// Si lieuRaw non vide mais inconnu → 'Autre structure' (ligne conservée)
function extractDominantCms(lieuRaw){
  const parts=(lieuRaw||'').split(';').map(s=>s.trim()).filter(Boolean);
  const nonDsian=parts.filter(p=>!p.toUpperCase().includes('DSIAN')&&!p.toUpperCase().includes('DISTANCE'));
  const pool=nonDsian.length?nonDsian:parts;
  if(!pool.length)return '';
  const freq={};
  pool.forEach(p=>{const n=normCms(p);if(n)freq[n]=(freq[n]||0)+1;});
  const sorted=Object.entries(freq).sort((a,b)=>b[1]-a[1]);
  return sorted[0]?sorted[0][0]:'Autre structure';
}
// normCms — pas de fallback : absent du map = null
function normCms(lieu){
  if(!lieu)return null;
  const s=String(lieu).trim();
  return CMS_MAP[s]??CMS_MAP[normKey(s)]??null;
}

// ─── Utilitaires HTML ────────────────────────────────────────────────────────
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// ─── Conversion de dates Excel ───────────────────────────────────────────────
function excelDate(v){if(!v&&v!==0)return null;if(typeof v==='string'){const m=v.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(m)return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;const m2=v.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);if(m2)return v.trim().slice(0,10);}const n=parseFloat(v);if(isNaN(n)||n<1)return null;const d=new Date((n-25569)*86400*1000);return d.toISOString().slice(0,10);}

// ─── Parse TSV texte (export XLS→texte) ─────────────────────────────────────
function parseXlsText(text){
  const lines=text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n').filter(l=>l.trim()!==''&&!l.startsWith('## Sheet:'));
  if(lines.length<2)throw new Error('Fichier vide ou format non reconnu');
  const hdrsRaw=lines[0].split('\t');
  if(hdrsRaw.length<5)throw new Error(`En-têtes insuffisantes : ${hdrsRaw.length} colonnes`);
  function normH(s){return String(s).toLowerCase().replace(/\s+/g,' ').trim().replace(/[éèê]/g,'e').replace(/[àâ]/g,'a').replace(/[ùû]/g,'u').replace(/[îï]/g,'i').replace(/[ôö]/g,'o').replace(/['’]/g,"'");}
  const hdrs=hdrsRaw.map(normH);
  function ci(...hints){return hdrs.findIndex(h=>hints.some(hint=>h.includes(normH(hint))));}
  const iCommune=ci('commune'),iMotif=ci('motif'),iType=ci('type action',"type d'action"),iLieu=ci('lieu / cms','lieu/cms'),iDateAct=ci('date action'),iOrienteur=(()=>{const r=ci('referent');return r>=0?r:ci('orienteur','prescripteur');})(),iDateDem=ci('date demande'),iConum=ci('conseiller num'),iThemas=ci('thematique'),iBenef=ci('beneficiaire connu','benef connu'),iUrgence=ci('urgence'),iEtat=ci("libelle de l'etat","etat de l'action"),iDatePlanif=ci('date planif','date planifier'),iDateReal=ci('date de realisation','date reelle','date realisation'),iNDem=ci('n° demande','numero demande','n demande','num demande');
  if(iDateDem<0)throw new Error(`Colonne "Date demande" introuvable. En-têtes : ${hdrsRaw.slice(0,8).join(' | ')}`);
  const EXCL=new Set(['Reservation']);
  const ETAT_MAP={'en cours':'En attente','en attente':'En attente','realisee':'Réalisée','réalisée':'Réalisée','non realisee':'Non réalisée','non réalisée':'Non réalisée','annulee':'Annulée','annulée':'Annulée'};
  const records=[],warnings=[];
  for(let i=1;i<lines.length;i++){
    const cols=lines[i].split('\t');
    if(cols.length<5)continue;
    const dd=excelDate(iDateDem>=0?cols[iDateDem]:'');if(!dd)continue;
    const da=excelDate(iDateAct>=0?cols[iDateAct]:'')||null;
    let cms=extractDominantCms((iLieu>=0?cols[iLieu]||'':'').trim());
    const lieuRaw=(iLieu>=0?cols[iLieu]||'':'').trim();
    const themas=(iThemas>=0?cols[iThemas]||'':'').split('/').map(t=>t.trim()).filter(Boolean);
    const seen=new Set(),types=[];
    for(const p of (iType>=0?cols[iType]||'':'').split(';')){const t=p.trim();if(t&&!EXCL.has(t)&&!seen.has(t)){seen.add(t);types.push(t);}if(types.length>=4)break;}
    const etatRaw=(iEtat>=0?cols[iEtat]||'':'').trim();
    const etat=ETAT_MAP[etatRaw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')]||(etatRaw||null);
    const dp=iDatePlanif>=0?excelDate(cols[iDatePlanif])||null:null;
    const dr=iDateReal>=0?excelDate(cols[iDateReal])||null:null;
    records.push({date_demande:dd,date_action:da,id_demande:(iNDem>=0?cols[iNDem]||'':'').trim(),conum:(iConum>=0?cols[iConum]||'':'').trim(),cms,lieu_raw:lieuRaw,commune:(iCommune>=0?cols[iCommune]||'':'').trim(),themas,type_action:types,orienteur:(iOrienteur>=0?cols[iOrienteur]||'':'').trim(),motif:(iMotif>=0?cols[iMotif]||'':'').slice(0,120).trim(),benef_connu:(iBenef>=0?cols[iBenef]||'':'').trim().toLowerCase()==='oui',urgence:(iUrgence>=0?cols[iUrgence]||'':'').trim().toLowerCase()==='oui',etat,date_planifiee:dp,date_realisation:dr});
  }
  if(!records.length)throw new Error('Aucun enregistrement valide. Vérifiez le format.');
  return{records,warnings};
}

// ─── Agrégations ─────────────────────────────────────────────────────────────
function count(arr,key){const m={};arr.forEach(r=>{const v=r[key]||'?';m[v]=(m[v]||0)+1;});return Object.fromEntries(Object.entries(m).sort((a,b)=>b[1]-a[1]));}
function countThemas(arr){const m={};arr.forEach(r=>(r.themas||[]).forEach(t=>{m[t]=(m[t]||0)+1;}));return Object.fromEntries(Object.entries(m).sort((a,b)=>b[1]-a[1]));}
function countTypes(arr){const m={};arr.forEach(r=>(r.type_action||[]).filter(t=>t!=='Reservation').forEach(t=>{m[t]=(m[t]||0)+1;}));return Object.fromEntries(Object.entries(m).sort((a,b)=>b[1]-a[1]));}
function pct(n,total){return total?Math.round(n/total*100):0;}
function monthLabel(k){const[y,mo]=k.split('-');return MONTH_FR[parseInt(mo)-1]+' '+y.slice(2);}

// ─── Calculs de délais ────────────────────────────────────────────────────────
function parseDt(v){
  if(!v)return null;
  try{
    if(typeof v==='string'){
      const m=v.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if(m)return new Date(parseInt(m[3]),parseInt(m[2])-1,parseInt(m[1]));
      const m2=v.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
      if(m2)return new Date(parseInt(m2[1]),parseInt(m2[2])-1,parseInt(m2[3]));
    }
    const d=(v instanceof Date)?v:new Date(v);
    return isNaN(d.getTime())?null:d;
  }catch(e){return null;}
}
function dayDiff(d1,d2){if(!d1||!d2)return null;const ms=d2.getTime()-d1.getTime();return ms<0?null:Math.round(ms/86400000);}
function bizDays(d1,d2){if(!d1||!d2)return null;const s=new Date(d1);s.setHours(0,0,0,0);const e=new Date(d2);e.setHours(0,0,0,0);if(e<s)return null;let n=0,cur=new Date(s);while(cur<e){const d=cur.getDay();if(d!==0&&d!==6)n++;cur.setDate(cur.getDate()+1);}return n;}

// Compatibilité Node.js (tests) ET navigateur (script tag)
if(typeof module!=='undefined'){
  module.exports={
    MONTH_FR,TYPE_KEYS,TYPE_PALETTE,CMS_MAP_RAW,KEEP_CMS,CMS_MAP,
    normKey,normCms,extractDominantCms,
    esc,excelDate,parseXlsText,
    typeColor,pct,monthLabel,count,countThemas,countTypes,
    parseDt,dayDiff,bizDays,
  };
}
