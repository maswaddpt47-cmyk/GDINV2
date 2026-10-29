// gdin-pure.js — fonctions utilitaires pures
// Aucune dépendance DOM, Chart.js ou état mutable.
// Chargé par index.html (via <script src>) et par gdin-pure.test.js (Node).

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
  // === Lieux partenaires sortis de « Autre structure » le 20/09/2026 ===
  // Admis par le repli sur « Structure orienteur », ils y arrivaient en vrac.
  // normKey() ne neutralise que casse, accents et espaces multiples : chaque
  // graphie qui diffère par la ponctuation ou un mot en plus a besoin de sa
  // propre clé. ABRIS était éclaté en dix graphies pour 181 lignes.
  'IME Montclairjoie':                      'IME Montclairjoie',
  // Dispositif du collège Saint-Pierre à Casseneuil (précisé par l'utilisateur
  // le 20/09/2026). « micro collège » nu ne rejoint pas « Micro-collège
  // Casseneuil » par la clé souple : les deux graphies sont nécessaires.
  'micro collège':                          'Micro-collège Saint-Pierre Casseneuil',
  'Micro-collège Casseneuil':               'Micro-collège Saint-Pierre Casseneuil',
  'COLLEGE GERMILLAC TONNEINS':             'Collège Germillac Tonneins',
  'Collège Germillac':                      'Collège Germillac Tonneins',
  'Collège Jasmin - Agen':                  'Collège Jasmin Agen',
  'Collège Lucie AUBRAC':                   'Collège Lucie Aubrac',
  'Club des Aînés de la Cascade - Fauillet':'Club des Aînés Fauillet',
  'Val de Garonne Agglomération':           'Val de Garonne Agglomération',
  'Association Service Environnement':      'Association Service Environnement',
  'Association Service Environnement - Sainte-Bazeille':'Association Service Environnement',
  'France Services Pays de Lauzun':         'France Services Pays de Lauzun',
  'France Services du Pays de Lauzun':      'France Services Pays de Lauzun',
  'Mairie Monteton':                        'Mairie Monteton',
  'Permanence - Maison de la vie associative':'Maison de la vie associative',
  'MFR Castelmoron':                        'MFR Castelmoron',
  'UNA 47':                                 'UNA 47',
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
  // === Association ABRIS (Casseneuil) ===
  // Les graphies étaient recensées mais toutes renvoyées vers « Autre
  // structure », ce qui les noyait au lieu de les regrouper. Confirmé par
  // l'utilisateur le 20/09/2026 : c'est bien un seul lieu, 181 lignes.
  'ABRIS':                                  'Association ABRIS Casseneuil',
  'Association ABRIS':                      'Association ABRIS Casseneuil',
  'Asso ABRIS':                             'Association ABRIS Casseneuil',
  'Association Abris Casseneuil':           'Association ABRIS Casseneuil',
  'Association ABRIS (Casseneuil)':         'Association ABRIS Casseneuil',
  'Asso ABRIS (Casseneuil)':                'Association ABRIS Casseneuil',
  'Asso ABRIS Casseneuil':                  'Association ABRIS Casseneuil',
  'ABRIS - CASSENEUIL':                     'Association ABRIS Casseneuil',
  'Association ABRIS Casseneuil':           'Association ABRIS Casseneuil',
  'Association ABRIS - Casseneuil':         'Association ABRIS Casseneuil',
  'Association ABRIS ( Casseneuil)':        'Association ABRIS Casseneuil',
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
// Clé souple : en plus de la casse et des accents, neutralise la ponctuation
// et les mots qui ne distinguent pas deux lieux (« association », « asso »,
// « permanence », articles). Sert de dernier recours, jamais de premier :
// le mapping explicite porte les décisions métier et garde la priorité.
//
// Sans elle, chaque nouvelle façon d'écrire un partenaire déjà connu retombe
// dans « Autre structure » — et les saisies restant libres, la dérive est
// continue. ABRIS était arrivé à dix graphies. Vérifié le 20/09/2026 : sur les
// 181 entrées écrites à la main, cette clé n'en met jamais deux en conflit, et
// elle aurait déduit seule 54 d'entre elles.
//
// Une clé qui désigne deux lieux différents n'est pas indexée : mieux vaut
// renvoyer « Autre structure » que rattacher au mauvais partenaire.
function normKeySouple(s){
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()
    .replace(/[^a-z0-9]+/g,' ')
    .replace(/\b(association|asso|permanence|de|du|des|la|le|les|d|l)\b/g,' ')
    .replace(/\s+/g,' ').trim();
}
const CMS_MAP_SOUPLE={};
{
  const vus={};
  Object.entries(CMS_MAP_RAW).forEach(([k,v])=>{
    const ks=normKeySouple(k);
    if(!ks)return;
    if(vus[ks]&&vus[ks]!==v){CMS_MAP_SOUPLE[ks]=null;return;}
    vus[ks]=v;
    if(CMS_MAP_SOUPLE[ks]!==null)CMS_MAP_SOUPLE[ks]=v;
  });
}

function normCms(lieu){
  if(!lieu)return null;
  const s=String(lieu).trim();
  return CMS_MAP[s]??CMS_MAP[normKey(s)]??CMS_MAP_SOUPLE[normKeySouple(s)]??null;
}

// ─── Utilitaires HTML ────────────────────────────────────────────────────────
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// ─── Réparation d'encodage ───────────────────────────────────────────────────
// Sur l'export de septembre 2026, la colonne « Date action (saisie) » sort de
// SheetJS en mojibake UTF-16 : "㠰〯⼳〲㈲" au lieu de "08/03/2022". Chaque
// caractère porte deux octets ASCII inversés. Sans réparation, date_action est
// null partout, la clé de fusion des doublons devient constante et 2 826
// actions réelles sont écrasées (mesuré le 20/09/2026 sur 24 410 lignes).
//
// La détection est volontairement stricte — tout caractère hors du plan
// supérieur fait renoncer — parce qu'un décodage appliqué à tort corrompt une
// donnée saine : "é" (U+00E9) produirait un octet nul. Sur l'export réel,
// 24 410 cellules réparées, toutes dans la colonne visée, aucun faux positif
// sur les ~512 000 autres. Couvert par les tests « demojibakeUtf16 ».
function demojibakeUtf16(s){
  const t=String(s);
  // Un nombre impair d'octets laisse un dernier caractère à octet haut nul,
  // donc sous U+0100 : la queue optionnelle le couvre sans ouvrir la porte au
  // texte latin, qui n'a aucun caractère du plan supérieur en tête.
  if(!/^[Ā-￿]+[\x20-\x7E]?$/.test(t))return t;
  let o='';
  for(let i=0;i<t.length;i++){const c=t.charCodeAt(i);o+=String.fromCharCode(c&0xff,c>>8);}
  if(o.charCodeAt(o.length-1)===0)o=o.slice(0,-1);
  return /^[\x20-\x7E]+$/.test(o)?o:t;
}

// ─── Normalisation des communes ──────────────────────────────────────────────
// La même commune est saisie sous plusieurs graphies : casse, accents, tirets,
// ST/SAINT. Mesuré le 20/09/2026 sur l'export de septembre : 497 libellés pour
// 364 communes réelles, « Villeneuve-sur-Lot » à lui seul sous six graphies.
// Toute statistique par commune était donc éclatée entre les orthographes.
//
// La clé sert au regroupement uniquement ; le libellé affiché reste la graphie
// la plus fréquente du fichier, ce qui conserve tirets et accents réels sans
// exiger un référentiel INSEE. Même règle que l'index de la carte, qui
// normalisait déjà de son côté sans que les agrégations en profitent.
// Couvert par les tests « normCommuneKey » et « parseRows — communes ».
function normCommuneKey(s){
  return String(s).toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/[-'’]/g,' ').replace(/\bST\b/g,'SAINT').replace(/\bSTE\b/g,'SAINTE')
    .replace(/\s+/g,' ').trim();
}

// Graphie dominante par clé : la plus fréquente, le libellé le plus petit
// départageant les ex æquo pour que deux imports du même fichier concordent.
function communesCanoniques(records){
  const freq={};
  records.forEach(r=>{
    if(!r.commune)return;
    const k=normCommuneKey(r.commune);
    (freq[k]=freq[k]||{})[r.commune]=(freq[k][r.commune]||0)+1;
  });
  const canon={};let fusionnees=0;
  Object.entries(freq).forEach(([k,graphies])=>{
    const noms=Object.keys(graphies);
    if(noms.length>1)fusionnees++;
    canon[k]=noms.sort((a,b)=>graphies[b]-graphies[a]||(a<b?-1:a>b?1:0))[0];
  });
  return{canon,fusionnees};
}

// ─── Attribution du conseiller ───────────────────────────────────────────────
// « Conseiller numérique » n'est renseigné que sur 30 % des lignes ; la colonne
// « Référent » l'est à 99 % et porte souvent un conseiller. Mesuré le
// 20/09/2026 : les deux concordent à 95 % là où elles coexistent, ce qui fait
// du Référent une source constatée, à préférer à toute déduction.
//
// applyConumAttrib() (dans les HTML) comblait d'abord par CONUM_ATTRIB, un
// mapping CMS → conseiller : une déduction géographique passait donc avant la
// donnée réelle, et contredisait le Référent sur 782 lignes. Combler ici, à
// l'import, rétablit l'ordre sans toucher à l'affichage — les lignes traitées
// ne sont plus vues comme vides en aval.
//
// La liste des conseillers est dérivée des données, jamais codée en dur : le
// dépôt est public, y inscrire des noms d'agents les publierait.
// Couvert par les tests « comblerConum ».
function comblerConum(records){
  const connus=new Set();
  records.forEach(r=>{const c=(r.conum||'').trim();if(c&&c!=='?')connus.add(c);});
  let comblees=0;
  records.forEach(r=>{
    const c=(r.conum||'').trim();
    if(c&&c!=='?')return;
    if(r.orienteur&&connus.has(r.orienteur)){r.conum=r.orienteur;r.conum_origine='referent';comblees++;}
  });
  return comblees;
}

// ─── Référentiel des communes du Lot-et-Garonne ──────────────────────────────
// Les 319 communes actuelles du département, d'après le découpage administratif
// officiel (@etalab/decoupage-administratif 6.0.0, extrait le 20/09/2026).
// Embarqué plutôt qu'appelé : geo.api.gouv.fr sert déjà la carte, mais un
// réseau qui le filtre ne doit pas emporter la normalisation des communes.
//
// Ce référentiel est ce qui rend le rapprochement sûr. Brax et Bias, Layrac et
// Clairac, Saint-Vite et Saint-Sixte sont à deux caractères les unes des
// autres : toutes y figurent, donc aucune ne peut être écrasée par une
// voisine. Sans lui, un rapprochement par ressemblance fabrique des chiffres
// faux sans prévenir.
const COMMUNES_47=[
  'Agen','Agmé','Agnac','Aiguillon','Allemans-du-Dropt',
  'Allez-et-Cazeneuve','Allons','Ambrus','Andiran','Antagnac','Anthé',
  'Anzex','Argenton','Armillac','Astaffort','Aubiac','Auradou',
  'Auriac-sur-Dropt','Bajamont','Baleyssagues','Barbaste','Bazens',
  'Beaugas','Beaupuy','Beauville','Beauziac','Bias','Birac-sur-Trec',
  'Blanquefort-sur-Briolance','Blaymont','Boé','Bon-Encontre',
  'Boudy-de-Beauregard','Bouglon','Bourgougnague','Bourlens','Bournel',
  'Bourran','Boussès','Brax','Bruch','Brugnac','Buzet-sur-Baïse','Cahuzac',
  'Calignac','Calonges','Cambes','Cancon','Casseneuil','Cassignas',
  'Castelculier','Casteljaloux','Castella','Castelmoron-sur-Lot',
  'Castelnau-sur-Gupie','Castelnaud-de-Gratecambe','Castillonnès',
  'Caubeyres','Caubon-Saint-Sauveur','Caudecoste','Caumont-sur-Garonne',
  'Cauzac','Cavarc','Cazideroque','Clairac','Clermont-Dessous',
  'Clermont-Soubiran','Cocumont','Colayrac-Saint-Cirq','Condezaygues',
  'Coulx','Courbiac','Cours','Couthures-sur-Garonne','Cuq','Cuzorn',
  'Damazan','Dausse','Dévillac','Dolmayrac','Dondas','Doudrac','Douzains',
  'Durance','Duras','Engayrac','Escassefort','Esclottes','Espiens',
  'Estillac','Fals','Fargues-sur-Ourbise','Fauguerolles','Fauillet',
  'Ferrensac','Feugarolles','Fieux','Fongrave','Foulayronnes',
  'Fourques-sur-Garonne','Francescas','Fréchou','Frégimont','Frespech',
  'Fumel','Galapian','Gaujac','Gavaudun','Gontaud-de-Nogaret',
  'Granges-sur-Lot','Grateloup-Saint-Gayrand','Grayssas','Grézet-Cavagnan',
  'Guérin','Hautefage-la-Tour','Hautesvignes','Houeillès','Jusix',
  'La Croix-Blanche','La Réunion','La Sauvetat-de-Savères',
  'La Sauvetat-du-Dropt','La Sauvetat-sur-Lède','Labastide-Castel-Amouroux',
  'Labretonie','Lacapelle-Biron','Lacaussade','Lacépède','Lachapelle',
  'Lafitte-sur-Lot','Lafox','Lagarrigue','Lagruère','Lagupie','Lalandusse',
  'Lamontjoie','Lannes','Laparade','Laperche','Laplume','Laroque-Timbaut',
  'Lasserre','Laugnac','Laussou','Lauzun','Lavardac','Lavergne','Layrac',
  'Le Mas-d\'Agenais','Le Passage','Le Temple-sur-Lot','Lédat',
  'Lévignac-de-Guyenne','Leyritz-Moncassin','Longueville','Loubès-Bernac',
  'Lougratte','Lusignan-Petit','Madaillan','Marcellus','Marmande',
  'Marmont-Pachas','Masquières','Massels','Massoulès','Mauvezin-sur-Gupie',
  'Mazières-Naresse','Meilhan-sur-Garonne','Mézin','Miramont-de-Guyenne',
  'Moirax','Monbahus','Monbalen','Moncaut','Monclar','Moncrabeau',
  'Monflanquin','Monheurt','Monségur','Monsempron-Libos',
  'Montagnac-sur-Auvignon','Montagnac-sur-Lède','Montastruc','Montauriol',
  'Montaut','Montayral','Montesquieu','Monteton','Montgaillard-en-Albret',
  'Montignac-de-Lauzun','Montignac-Toupinerie','Montpezat','Montpouillan',
  'Monviel','Moulinet','Moustier','Nérac','Nicole','Nomdieu','Pailloles',
  'Pardaillan','Parranquet','Paulhiac','Penne-d\'Agenais','Peyrière',
  'Pindères','Pinel-Hauterive','Pompiey','Pompogne','Pont-du-Casse',
  'Port-Sainte-Marie','Poudenas','Poussignac','Prayssas','Puch-d\'Agenais',
  'Pujols','Puymiclan','Puymirol','Puysserampion','Rayet','Razimet',
  'Réaup-Lisse','Rives','Romestaing','Roquefort','Roumagne','Ruffiac',
  'Saint-Antoine-de-Ficalba','Saint-Astier','Saint-Aubin','Saint-Avit',
  'Saint-Barthélemy-d\'Agenais','Saint-Caprais-de-Lerm',
  'Saint-Colomb-de-Lauzun','Saint-Étienne-de-Fougères',
  'Saint-Étienne-de-Villeréal','Saint-Eutrope-de-Born',
  'Saint-Front-sur-Lémance','Saint-Georges','Saint-Géraud',
  'Saint-Hilaire-de-Lusignan','Saint-Jean-de-Duras','Saint-Jean-de-Thurac',
  'Saint-Laurent','Saint-Léger','Saint-Léon','Saint-Martin-Curton',
  'Saint-Martin-de-Beauville','Saint-Martin-de-Villeréal',
  'Saint-Martin-Petit','Saint-Maurice-de-Lestapel','Saint-Maurin',
  'Saint-Nicolas-de-la-Balerme','Saint-Pardoux-du-Breuil',
  'Saint-Pardoux-Isaac','Saint-Pastour','Saint-Pé-Saint-Simon',
  'Saint-Pierre-de-Buzet','Saint-Pierre-de-Clairac',
  'Saint-Pierre-sur-Dropt','Saint-Quentin-du-Dropt','Saint-Robert',
  'Saint-Romain-le-Noble','Saint-Salvy','Saint-Sardos',
  'Saint-Sauveur-de-Meilhan','Saint-Sernin','Saint-Sixte',
  'Saint-Sylvestre-sur-Lot','Saint-Urcisse','Saint-Vincent-de-Lamontjoie',
  'Saint-Vite','Sainte-Bazeille','Sainte-Colombe-de-Duras',
  'Sainte-Colombe-de-Villeneuve','Sainte-Colombe-en-Bruilhois',
  'Sainte-Gemme-Martaillac','Sainte-Livrade-sur-Lot','Sainte-Marthe',
  'Sainte-Maure-de-Peyriac','Salles','Samazan','Sauméjan','Saumont',
  'Sauvagnas','Sauveterre-la-Lémance','Sauveterre-Saint-Denis',
  'Savignac-de-Duras','Savignac-sur-Leyze','Ségalas','Sembas','Sénestis',
  'Sérignac-Péboudou','Sérignac-sur-Garonne','Seyches','Sos','Soumensac',
  'Taillebourg','Tayrac','Thézac','Thouars-sur-Garonne','Tombebœuf',
  'Tonneins','Tourliac','Tournon-d\'Agenais','Tourtrès','Trémons',
  'Trentels','Varès','Verteuil-d\'Agenais','Vianne','Villebramar',
  'Villefranche-du-Queyran','Villeneuve-de-Duras','Villeneuve-sur-Lot',
  'Villeréal','Villeton','Virazeil','Xaintrailles'
];

// Rattache un libellé saisi à son nom officiel, ou rend null.
// Quatre niveaux, du plus sûr au moins sûr — et jamais de choix en cas
// d'ambiguïté : mieux vaut garder la saisie que se tromper de commune.
//   1. correspondance exacte, une fois casse, accents, tirets et ST/SAINT
//      neutralisés, et le bruit retiré (code postal, CEDEX, téléphone) ;
//   2. à l'article initial près — « MAS D'AGENAIS » pour « Le Mas-d'Agenais » ;
//   3. le nom officiel ouvre le libellé — « LE PASSAGE D'AGEN » pour
//      « Le Passage ». Exigé en tête, jamais n'importe où : « Agen » apparaît
//      dans « Passage d'Agen » et dans « Valence-d'Agen », qui est du 82 ;
//   4. à deux caractères près, et seulement au-delà de dix caractères, pour
//      un seul candidat. En deçà la ressemblance ne prouve rien : « Vannes »
//      est à un caractère de « Lannes », « Donzac » à deux de « Dondas ».
// Mesuré le 20/09/2026 sur l'export de septembre : 42 libellés rattachés,
// 342 lignes, aucun rattachement erroné après inspection de chaque décision.
function communeKeyBase(s){
  return normCommuneKey(String(s).replace(/[ŒœŒ]/g,'oe')).toLowerCase();
}
function communeNettoyee(s){
  return communeKeyBase(s).replace(/\b\d{5}\b/g,' ').replace(/\bcedex\b\s*\d*/g,' ')
    .replace(/\b\d{6,}\b/g,' ').replace(/\s+/g,' ').trim();
}
function sansArticle(s){return s.replace(/^(le|la|les) /,'');}
const REF_47={},REF_47_SANS_ARTICLE={};
const REF_47_CLES=COMMUNES_47.map(n=>[communeKeyBase(n),n]);
COMMUNES_47.forEach(n=>{
  const b=communeKeyBase(n);
  REF_47[b]=n;
  const a=sansArticle(b);
  if(!(a in REF_47_SANS_ARTICLE))REF_47_SANS_ARTICLE[a]=n;
  else if(REF_47_SANS_ARTICLE[a]!==n)REF_47_SANS_ARTICLE[a]=null;
});
function distanceMax2(a,b){
  if(Math.abs(a.length-b.length)>2)return 9;
  const m=[];
  for(let i=0;i<=b.length;i++)m[i]=[i];
  for(let j=0;j<=a.length;j++)m[0][j]=j;
  for(let i=1;i<=b.length;i++)for(let j=1;j<=a.length;j++)
    m[i][j]=b[i-1]===a[j-1]?m[i-1][j-1]:Math.min(m[i-1][j-1]+1,m[i][j-1]+1,m[i-1][j]+1);
  return m[b.length][a.length];
}
function rattacherCommune(nom){
  const s=communeNettoyee(nom);
  if(!s)return null;
  if(REF_47[s])return REF_47[s];
  const sa=sansArticle(s);
  if(REF_47_SANS_ARTICLE[sa])return REF_47_SANS_ARTICLE[sa];
  let c=REF_47_CLES.filter(([rk])=>rk.length>=4&&(s+' ').startsWith(rk+' '));
  if(!c.length)c=REF_47_CLES.filter(([rk])=>sansArticle(rk).length>=4&&(sa+' ').startsWith(sansArticle(rk)+' '));
  if(c.length){
    c.sort((a,b)=>b[0].length-a[0].length);
    return(c.length===1||c[0][0].length>c[1][0].length)?c[0][1]:null;
  }
  if(s.length<10)return null;
  c=REF_47_CLES.filter(([rk])=>distanceMax2(s,rk)<=2);
  return c.length===1?c[0][1]:null;
}

// ─── Conversion de dates Excel ───────────────────────────────────────────────
function excelDate(v){if(!v&&v!==0)return null;if(typeof v==='string'){const s=demojibakeUtf16(v).trim();const m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(m)return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;const m2=s.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m2)return s.slice(0,10);const n2=parseFloat(s);if(isNaN(n2)||n2<1)return null;return new Date((n2-25569)*86400*1000).toISOString().slice(0,10);}const n=parseFloat(v);if(isNaN(n)||n<1)return null;const d=new Date((n-25569)*86400*1000);return d.toISOString().slice(0,10);}

// ─── Import : un seul parseur pour tous les chemins ──────────────────────────
// Le texte collé et le fichier .xls passent par parseRows(). Jusqu'au
// 20/09/2026 il existait deux implémentations divergentes : sur l'export de
// juin 2026, le même fichier donnait 22 934 enregistrements par un chemin et
// 17 015 par l'autre (mesuré). Ne jamais réintroduire une seconde copie du
// mapping ailleurs — couvert par les tests « parseRows ».
const ETAT_MAP={'en cours':'En attente','en attente':'En attente','realisee':'Réalisée','réalisée':'Réalisée','non realisee':'Non réalisée','non réalisée':'Non réalisée','annulee':'Annulée','annulée':'Annulée'};
const TYPE_EXCLUS=new Set(['Reservation']);
// Cycle de vie du Pass Numérique : lignes générées par l'outil, pas des actions.
const TYPE_CYCLE_PASS=new Set(['Demande suivi pass (auto)','Suivi pass','Sondage pass']);
// Une ligne dont ni « Lieu / CMS » ni « Structure orienteur » n'est renseigné
// est écartée : aucun lieu n'est alors rattachable. Depuis le 20/09/2026 le
// repli sur la structure s'applique d'abord, si bien qu'aucune ligne de
// l'export de septembre ne tombe plus ici. Le compte rendu d'import affiche le
// nombre concerné dans les deux cas.
const ECARTER_SANS_CMS=true;

function normHeader(s){return String(s).toLowerCase().replace(/\s+/g,' ').trim().replace(/[éèê]/g,'e').replace(/[àâ]/g,'a').replace(/[ùû]/g,'u').replace(/[îï]/g,'i').replace(/[ôö]/g,'o').replace(/['’]/g,"'");}

function mapColonnes(hdrsRaw){
  const hdrs=(hdrsRaw||[]).map(normHeader);
  const ci=(...hints)=>hdrs.findIndex(h=>hints.some(hint=>h.includes(normHeader(hint))));
  return {commune:ci('commune'),type:ci('type action',"type d'action"),
    lieu:ci('lieu / cms','lieu/cms'),dateAct:ci('date action'),
    orienteur:(()=>{const r=ci('referent');return r>=0?r:ci('orienteur','prescripteur');})(),
    dateDem:ci('date demande'),conum:ci('conseiller num'),themas:ci('thematique'),
    benef:ci('beneficiaire connu','benef connu'),urgence:ci('urgence'),
    etat:ci("libelle de l'etat","etat de l'action"),
    datePlanif:ci('date planif','date planifier'),
    dateReal:ci('date de realisation','date reelle','date realisation'),
    nDem:ci('n° demande','numero demande','n demande','num demande'),
    structure:ci('structure orienteur')};
}

// rows : tableau de lignes, chaque ligne étant un tableau de cellules.
// Retourne {records, stats} — stats alimente le compte rendu d'import.
function parseRows(rows){
  if(!rows||rows.length<2)throw new Error('Fichier vide ou format non reconnu');
  const hdrsRaw=rows[0];
  if(hdrsRaw.length<5)throw new Error(`En-têtes insuffisantes : ${hdrsRaw.length} colonnes`);
  const I=mapColonnes(hdrsRaw);
  if(I.dateDem<0)throw new Error(`Colonne "Date demande" introuvable. En-têtes : ${hdrsRaw.slice(0,8).join(' | ')}`);
  let cellulesReparees=0,cmsViaStructure=0;
  const cell=(c,i)=>{
    const brut=String(i>=0?(c[i]==null?'':c[i]):'');
    const repare=demojibakeUtf16(brut);
    if(repare!==brut)cellulesReparees++;
    return repare.trim();
  };
  const records=[],warnings=[];
  const stats={lues:rows.length-1,retenues:0,ecartees:0,motifs:{ligne_incomplete:0,date_demande_absente:0,lieu_cms_vide:0,cycle_pass:0},
    colonnes_absentes:Object.keys(I).filter(k=>I[k]<0),regle_sans_cms:ECARTER_SANS_CMS?'ecartees':'conservees'};
  for(let i=1;i<rows.length;i++){
    const c=rows[i];
    if(!c||c.length<5){stats.motifs.ligne_incomplete++;stats.ecartees++;continue;}
    const dd=excelDate(cell(c,I.dateDem));
    if(!dd){stats.motifs.date_demande_absente++;stats.ecartees++;continue;}
    // Le cycle de vie du Pass Numérique génère des lignes sans conseiller ni
    // thématique ni lieu : de la plomberie, pas de l'activité. 4 184 lignes sur
    // l'export de septembre. Les écarter par type d'action, jamais par nom de
    // structure : UNA 47 porte 969 lignes du cycle et 30 d'activité réelle.
    // « Demande de prescription de Pass » n'en fait pas partie — c'est un geste
    // de conseiller, pas un automatisme.
    const typesBruts=cell(c,I.type).split(';').map(t=>t.trim()).filter(Boolean);
    if(typesBruts.length&&typesBruts.every(t=>TYPE_CYCLE_PASS.has(t))){
      stats.motifs.cycle_pass++;stats.ecartees++;continue;}
    const lieuRaw=cell(c,I.lieu);
    const structureRaw=cell(c,I.structure);
    const cmsLieu=extractDominantCms(lieuRaw);
    // Le lieu est parfois saisi dans « Structure orienteur » au lieu de
    // « Lieu / CMS ». Une structure connue donne son libellé canonique, une
    // structure inconnue « Autre structure » — exactement ce que fait déjà
    // « Lieu / CMS » pour un libellé qu'il ne connaît pas. Sans ce repli,
    // 965 ateliers restaient invisibles : un sur cinq.
    const cms=cmsLieu||normCms(structureRaw)||(structureRaw?'Autre structure':null);
    if(!cms&&ECARTER_SANS_CMS){stats.motifs.lieu_cms_vide++;stats.ecartees++;continue;}
    if(!cms)stats.motifs.lieu_cms_vide++;
    if(!cmsLieu&&cms)cmsViaStructure++;
    const da=excelDate(cell(c,I.dateAct))||null;
    const themas=cell(c,I.themas).split('/').map(t=>t.trim()).filter(Boolean);
    const seen=new Set(),types=[];
    for(const t of typesBruts){
      if(t&&!TYPE_EXCLUS.has(t)&&!seen.has(t)){seen.add(t);types.push(t);}
      if(types.length>=4)break;}
    const etatRaw=cell(c,I.etat);
    const etat=ETAT_MAP[normEtat(etatRaw)]||(etatRaw||null);
    const conumSource=cell(c,I.conum);
    records.push({date_demande:dd,date_action:da,id_demande:cell(c,I.nDem),conum:conumSource,
      conum_origine:conumSource&&conumSource!=='?'?'source':'',
      cms,lieu_raw:lieuRaw,structure:structureRaw,commune:cell(c,I.commune),themas,type_action:types,
      orienteur:cell(c,I.orienteur),
      benef_connu:cell(c,I.benef).toLowerCase()==='oui',urgence:cell(c,I.urgence).toLowerCase()==='oui',
      etat,date_planifiee:excelDate(cell(c,I.datePlanif))||null,
      date_realisation:excelDate(cell(c,I.dateReal))||null});
    stats.retenues++;
  }
  if(!records.length)throw new Error('Aucun enregistrement valide. Vérifiez le format.');
  stats.cellules_reparees=cellulesReparees;
  stats.cms_via_structure=cmsViaStructure;
  const{canon,fusionnees}=communesCanoniques(records);
  let communesOfficielles=0;
  records.forEach(r=>{
    if(!r.commune)return;
    const officiel=rattacherCommune(r.commune);
    if(officiel){r.commune=officiel;communesOfficielles++;}
    else r.commune=canon[normCommuneKey(r.commune)];
  });
  stats.communes_fusionnees=fusionnees;
  stats.communes_officielles=communesOfficielles;
  stats.conum_via_referent=comblerConum(records);
  stats.participations_atelier=numeroterParticipants(records);
  numeroterLignes(records);
  return{records,warnings,stats};
}

// Texte collé depuis Excel (TSV) → lignes → parseRows
function parseXlsText(text){
  const lines=String(text).replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n')
    .filter(l=>l.trim()!==''&&!l.startsWith('## Sheet:'));
  return parseRows(lines.map(l=>l.split('\t')));
}

// Résumé lisible du compte rendu d'import, affiché après chaque import.
// L'utilisateur produit des rapports fréquemment : il doit voir ce que l'outil
// a gardé et ce qu'il a jeté sans avoir à ouvrir le code.
function formatResumeImport(stats){
  if(!stats)return '';
  const m=stats.motifs||{};
  const parts=[`${stats.lues} lignes lues`,`${stats.retenues} retenues`];
  if(stats.regle_sans_cms==='conservees'){
    if(stats.ecartees>0)parts.push(`${stats.ecartees} écartées`);
    if(m.lieu_cms_vide)parts.push(`${m.lieu_cms_vide} sans CMS (conservées)`);
    if(stats.cms_via_structure)parts.push(`${stats.cms_via_structure} lieux lus dans la structure orienteur`);
    if(stats.communes_officielles)parts.push(`${stats.communes_officielles} communes rattachées au référentiel`);
    if(stats.communes_fusionnees)parts.push(`${stats.communes_fusionnees} communes regroupées`);
    if(stats.conum_via_referent)parts.push(`${stats.conum_via_referent} conseillers lus dans le référent`);
    if(stats.cellules_reparees)parts.push(`${stats.cellules_reparees} cellules réparées (encodage)`);
    return parts.join(' · ');
  }
  if(stats.ecartees>0){
    const d=[];
    if(m.lieu_cms_vide)d.push(`${m.lieu_cms_vide} sans CMS`);
    if(m.date_demande_absente)d.push(`${m.date_demande_absente} sans date de demande`);
    if(m.ligne_incomplete)d.push(`${m.ligne_incomplete} incomplètes`);
    if(m.cycle_pass)d.push(`${m.cycle_pass} du cycle Pass`);
    parts.push(`${stats.ecartees} écartées (${d.join(', ')})`);
  }else parts.push('aucune écartée');
  if(stats.cms_via_structure)parts.push(`${stats.cms_via_structure} lieux lus dans la structure orienteur`);
  if(stats.communes_officielles)parts.push(`${stats.communes_officielles} communes rattachées au référentiel`);
  if(stats.communes_fusionnees)parts.push(`${stats.communes_fusionnees} communes regroupées`);
  if(stats.conum_via_referent)parts.push(`${stats.conum_via_referent} conseillers lus dans le référent`);
  if(stats.cellules_reparees)parts.push(`${stats.cellules_reparees} cellules réparées (encodage)`);
  return parts.join(' · ');
}

// ─── Agrégations ─────────────────────────────────────────────────────────────
// countEntries — classement fiable, du plus fréquent au moins fréquent.
// count() renvoie un objet : JavaScript y replace les clés entières en tête,
// quel que soit leur volume. Un libellé numérique — « 47 », « 47000 », codes
// postaux saisis à la place du nom — passait donc devant « Agen » et ses
// 4 791 lignes (mesuré le 20/09/2026). Tout classement affiché passe par
// countEntries ; count() ne sert plus qu'aux accès par clé, où l'ordre est
// sans objet. Les ex æquo sont départagés alphabétiquement pour que deux
// rendus du même jeu de données concordent.
function countEntries(arr,key){
  const m={};
  (arr||[]).forEach(r=>{const v=r[key]||'?';m[v]=(m[v]||0)+1;});
  return Object.entries(m).sort((a,b)=>b[1]-a[1]||(a[0]<b[0]?-1:a[0]>b[0]?1:0));
}
function count(arr,key){return Object.fromEntries(countEntries(arr,key));}
// countThemas compte, pour chaque thématique, LES LIGNES QUI LA PORTENT : une
// thématique saisie deux fois sur une ligne compte une fois, mais une ligne à
// trois thématiques compte dans trois entrées. Une valeur se rapporte donc aux
// lignes (« % des accompagnements », dénominateur = toutes les lignes, sans
// thématique comprises — choix de l'utilisateur, AG-004, 22/10/2026) ; la
// SOMME des valeurs dépasse le nombre de lignes et ne se divise jamais par lui
// (lignesAvecThemas pour un Top 3). Jamais « demandes » : aucune déduplication
// par N° de demande (AG-003).
// ── Mention de révisabilité (AG-002, 22/10/2026) ──
// À période identique, le total d'accompagnements est passé de 7 881 à 8 313
// entre deux imports : un chiffre déjà communiqué change sans que rien ne le
// signale. Tout écran qui donne un chiffre, et toute diapositive projetée,
// portent donc la période couverte, la date du dernier import et la mention
// que les chiffres sont révisables.
// Ceci N'ARCHIVE RIEN : reproduire un bilan déjà diffusé exigerait de
// conserver ses données, ses filtres et sa version de calcul hors du poste
// (volet B d'AG-002, en attente de la durée de conservation applicable).
function dateFr(iso){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso==null?'':iso));
  return m?`${m[3]}/${m[2]}/${m[1]}`:'';
}
function mentionRevisabilite(opts){
  const o=opts||{};
  const d=dateFr(o.debut), f=dateFr(o.fin);
  let periode = d&&f ? `Période du ${d} au ${f}`
    : d ? `Période depuis le ${d}`
    : f ? `Période jusqu'au ${f}`
    : 'Toutes périodes';
  // Années cochées : quand la sélection est un sous-ensemble des années de la base,
  // la mention la nomme et relègue les bornes de la base entre parenthèses. Annoncer
  // « du 11/02/2022 au 29/10/2026 » sous un bilan 2025 décrivait la base, pas le
  // bilan (AG-004, décision 4).
  const sel=(o.annees||[]).map(String).filter(Boolean).sort();
  const baseA=(o.anneesBase||[]).map(String);
  if(sel.length&&baseA.length&&sel.length<baseA.length){
    const lib=sel.length===1?`Année ${sel[0]}`:`Années ${sel.join(', ')}`;
    periode=d&&f?`${lib} (base du ${d} au ${f})`:lib;
  }
  const imp=o.dateImport?`données importées le ${String(o.dateImport)}`:'source non datée';
  return `${periode} · ${imp} · chiffres susceptibles d'être révisés`;
}

function countThemas(arr){const m={};arr.forEach(r=>new Set(r.themas||[]).forEach(t=>{m[t]=(m[t]||0)+1;}));return Object.fromEntries(Object.entries(m).sort((a,b)=>b[1]-a[1]));}
// Lignes portant au moins une des thématiques citées : l'union, pour un
// « Top 3 ». Additionner les valeurs de countThemas compterait deux fois une
// ligne qui en porte deux (jusqu'à 200 %, AG-004).
function lignesAvecThemas(arr,noms){const s=new Set(noms);return(arr||[]).filter(r=>(r.themas||[]).some(t=>s.has(t))).length;}
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

// ─── État des actions ─────────────────────────────────────────────────────────
// Ne JAMAIS tester l'état avec includes('réalisée') : "Non réalisée" contient
// "réalisée", ce qui faisait compter les non-réalisées comme réalisées.
// Couvert par les tests « isRealisee » de gdin-pure.test.js.
function normEtat(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();}
function isRealisee(etat){return normEtat(etat)==='realisee';}

// ─── Doublons du panneau qualité ─────────────────────────────────────────────
// Clé distincte de celle qui dédoublonne à l'import : ici on signale des
// lignes suspectes à l'utilisateur, on n'en supprime aucune.
//
// Le comptage passait par `keys.filter((k,i)=>keys.indexOf(k)!==i)`, quadratique
// donc : 1 547 ms sur les 20 226 enregistrements de l'export de septembre,
// contre 3 ms avec un Set — 516 fois plus lent, pour un résultat identique
// (5 693 doublons dans les deux cas, mesuré le 20/09/2026). Le coût croît au
// carré du volume : la même mesure donnait 823 ms sur 17 015 lignes.
function cleDoublon(r){
  if(r.id_demande&&r.date_action)
    return`id:${r.id_demande}|da:${r.date_action}|${(r.type_action||[]).slice().sort().join('+')}`;
  // Sans date d'action, le N° de demande reste dans la clé : deux demandes
  // distinctes du même jour, du même conseiller et du même orienteur ne sont
  // pas des doublons (AG-007, 29/10/2026).
  return`${r.id_demande||''}|${r.date_demande}|${r.date_action||''}|${r.conum||''}|${r.orienteur||''}`;
}
// Les ateliers sont exclus : cleDoublon() donne la même clé à tous les
// participants d'une séance, puisque le nom du bénéficiaire n'entre pas dans
// l'application. Les compter revenait à signaler 4 894 doublons (25 % de la
// base) là où il y en a 12, soit 0,1 % hors ateliers — mesuré le 20/09/2026
// sur l'export de septembre. Un panneau qualité qui crie au loup sur un quart
// des lignes ne sert plus à rien.
function compterDoublons(records){
  const vus=new Set();
  let n=0;
  (records||[]).forEach(r=>{
    if(estAtelier(r))return;
    const k=cleDoublon(r);
    if(vus.has(k))n++;else vus.add(k);
  });
  return n;
}

// ─── Attribution du conseiller par secteur ────────────────────────────────────
// Le mapping CMS → conseiller était codé en dur dans le HTML. Deux défauts
// mesurés le 20/09/2026 sur l'export de septembre :
//   - il inscrivait nom et secteur d'affectation de six agents dans un dépôt
//     public, sans aucune finalité de publication ;
//   - figé sur l'affectation du moment, il était appliqué à cinq ans
//     d'historique : le CMS de Tonneins est tenu par une conseillère de 2022 à
//     2024 puis par une autre à partir de 2025, et le mapping attribuait toute
//     la période à la seconde — 2 853 lignes concernées, 34 % des déductions.
// La dérivation par année suit les changements d'affectation au lieu de les
// écraser. Elle reste une inférence : le bandeau de l'onglet Fiabilité doit
// continuer à l'annoncer.
// Couvert par les tests « deriverAttributionCms » et « attribuerConum ».
function conseillersConnus(records){
  const s=new Set();
  (records||[]).forEach(r=>{const c=((r&&r.conum)||'').trim();if(c&&c!=='?')s.add(c);});
  return s;
}

// { parAnnee: {'<cms>|<année>': nom}, global: {'<cms>': nom} }
// Le majoritaire l'emporte ; à égalité, le premier rencontré, pour que deux
// exécutions sur le même fichier donnent le même résultat.
const ORIGINES_CONUM=new Set(['source','referent','deduit','inconnu']);
const ORIGINES_PREUVE=new Set(['source','referent']);
function deriverAttributionCms(records){
  const cptAn={},cptCms={};
  (records||[]).forEach(r=>{
    const c=((r&&r.conum)||'').trim();
    if(!c||c==='?'||!r.cms||!r.date_demande)return;
    // Seule une attribution constatée (colonne du fichier, ou référent) vaut
    // preuve : une valeur déduite ou d'origine inconnue renforcerait le
    // majoritaire par sa propre déduction.
    if(!ORIGINES_PREUVE.has(r.conum_origine))return;
    const k=`${r.cms}|${r.date_demande.slice(0,4)}`;
    (cptAn[k]=cptAn[k]||{})[c]=(cptAn[k][c]||0)+1;
    (cptCms[r.cms]=cptCms[r.cms]||{})[c]=(cptCms[r.cms][c]||0)+1;
  });
  const majoritaire=m=>{let nom=null,n=0;for(const[k,v]of Object.entries(m))if(v>n){nom=k;n=v;}return nom;};
  const parAnnee={},global={};
  Object.entries(cptAn).forEach(([k,m])=>{parAnnee[k]=majoritaire(m);});
  Object.entries(cptCms).forEach(([k,m])=>{global[k]=majoritaire(m);});
  return{parAnnee,global};
}

// Comble le conseiller manquant depuis le secteur, sans jamais écraser une
// valeur constatée. Pose conum_origine (source | referent | deduit | inconnu)
// et conum_deduit, que l'onglet Fiabilité utilise. Idempotent : retraiter une
// base déjà traitée ne change aucune origine. Rend le nombre de lignes comblées.
function attribuerConum(records){
  const base=records||[];
  const t=deriverAttributionCms(base);
  const connus=conseillersConnus(base);
  let n=0;
  base.forEach(r=>{
    const c=(r.conum||'').trim();
    if(c&&c!=='?'){
      // Base enregistrée avant le champ conum_origine : seule une déduction
      // posée par l'ancien code est reconnaissable. Un « non déduit » sans
      // origine peut venir du fichier OU d'une déduction effacée par l'ancien
      // retraitement — l'origine n'est pas récupérable, on ne l'affirme pas.
      if(!ORIGINES_CONUM.has(r.conum_origine))r.conum_origine=r.conum_deduit===true?'deduit':'inconnu';
      r.conum_deduit=r.conum_origine==='deduit';
      return;}
    let nom=null;
    // 1. l'orienteur est lui-même un conseiller identifié dans le fichier
    if(r.orienteur&&connus.has(r.orienteur))nom=r.orienteur;
    // 2. le conseiller du secteur cette année-là
    if(!nom&&r.cms&&r.date_demande)nom=t.parAnnee[`${r.cms}|${r.date_demande.slice(0,4)}`]||null;
    // 3. à défaut, le conseiller du secteur toutes années confondues
    if(!nom&&r.cms)nom=t.global[r.cms]||null;
    if(nom){r.conum=nom;r.conum_origine='deduit';r.conum_deduit=true;n++;}
    else{r.conum_origine='';r.conum_deduit=false;}
  });
  return n;
}

// Couleur stable d'un conseiller, dérivée de son nom — le mapping explicite
// inscrivait les noms de cinq agents dans un dépôt public. Même nom, même
// couleur, sans jamais stocker le nom.
function couleurConum(nom){
  const s=String(nom||'');
  let h=0;
  for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;
  return TYPE_PALETTE[h%TYPE_PALETTE.length];
}

// ─── Sessions d'atelier ───────────────────────────────────────────────────────
// Une ligne d'atelier est une PARTICIPATION, pas un atelier. Sur l'export de
// septembre 2026 : 5 478 lignes pour 596 sessions réelles, soit 9,2 participants
// en moyenne (mesuré le 20/09/2026, max 104). Annoncer « 5 478 ateliers » à des
// élus est indéfendable — afficher partout « N ateliers · M participations ».
// Une session = un N° de demande + une date d'action. Le nom du bénéficiaire
// n'entre pas dans l'application (minimisation RGPD), donc rien d'autre ne
// permet de distinguer deux participants d'une même séance.
// Couvert par les tests « compterSessionsAtelier ».
const TYPE_ATELIER='Atelier';
function estAtelier(r){return !!r&&(r.type_action||[]).includes(TYPE_ATELIER);}
function cleSessionAtelier(r){return`${(r&&r.id_demande)||'?'}|${(r&&r.date_action)||'?'}`;}
function compterSessionsAtelier(records){
  const vues=new Set();
  (records||[]).forEach(r=>{if(estAtelier(r))vues.add(cleSessionAtelier(r));});
  return vues.size;
}
// { sessions, participations } — les deux chiffres vont toujours ensemble.
function statsAteliers(records){
  const participations=(records||[]).filter(estAtelier).length;
  return{sessions:compterSessionsAtelier(records),participations};
}

// Rang du participant dans sa séance, attribué dans l'ordre du fichier.
// Sans lui, la fusion de confirmImport() supprimait 78 % des participations :
// deux participants d'une même séance ont les mêmes valeurs sur tous les
// champs importés — le nom du bénéficiaire n'entre pas dans l'application
// (minimisation RGPD) — et passaient donc pour la même ligne importée deux
// fois. Mesuré le 20/09/2026 sur l'export de septembre : 5 478 → 1 225.
// Le rang rend la fusion idempotente : réimporter le même fichier redonne les
// mêmes rangs, donc les mêmes clés, donc aucun doublon.
// Couvert par les tests « numeroterParticipants » et « cleFusion ».
function numeroterParticipants(records){
  const compteurs=new Map();
  let n=0;
  (records||[]).forEach(r=>{
    if(!estAtelier(r))return;
    const k=cleSessionAtelier(r);
    const rang=(compteurs.get(k)||0)+1;
    compteurs.set(k,rang);
    r.rang_atelier=rang;
    n++;
  });
  return n;
}

// ─── Identité d'une ligne et fusion à l'import ───────────────────────────────
// Une DEMANDE (N° demande) porte plusieurs ACTIONS, et l'export ne donne aucun
// identifiant d'action. L'identité retenue (20/10/2026) est donc :
//   N° demande + types + date d'action + CMS, plus un rang qui départage les
//   lignes strictement identiques d'un même fichier (comme pour les ateliers).
// Elle exclut tout ce que l'application calcule ou qui peut changer d'un export
// à l'autre — conseiller (déduit après la fusion : l'ancienne clé le contenait,
// d'où 2 → 3 → 4 lignes à chaque réimport), état, date planifiée, date de
// réalisation. Ces trois derniers sont mis à jour par fusionnerImport().
// Limites : une date d'action corrigée à la source crée une nouvelle ligne et
// laisse l'ancienne ; le rang suppose le même ordre de lignes d'un export à
// l'autre (vrai pour le même fichier, pas garanti pour un export partiel ou
// réordonné). Couvert par les tests « cleFusion » et « fusionnerImport ».
function cleBaseAction(r){
  const types=(r.type_action||[]).slice().sort().join('+');
  if(r.id_demande)return`${r.id_demande}|${types}|${r.date_action||''}|${r.cms||''}`;
  // Sans N° de demande (jamais constaté sur l'export de septembre) : repli sur
  // les champs source.
  return`?|${r.date_demande}|${r.date_action||''}|${r.cms||''}|${r.commune||''}|${r.orienteur||''}|${(r.themas||[]).slice().sort().join('/')}|${types}`;
}
// Rang de la ligne parmi celles qui partagent sa clé de base, dans l'ordre du
// fichier. Les ateliers ont leur propre rang (numeroterParticipants).
function numeroterLignes(records){
  const compteurs=new Map();
  let n=0;
  (records||[]).forEach(r=>{
    if(estAtelier(r))return;
    const k=cleBaseAction(r);
    const rang=(compteurs.get(k)||0)+1;
    compteurs.set(k,rang);
    r.rang_ligne=rang;
    n++;
  });
  return n;
}
// Clé de fusion utilisée à l'import pour reconnaître une ligne déjà en base.
// Ne pas la confondre avec cleDoublon(), qui sert au panneau qualité.
function cleFusion(r){
  if(!r)return'';
  // Atelier : la séance est identifiée par son N° de demande et sa date, le
  // rang distingue les participants. La clé générique ne convient pas — elle
  // ne porte pas le N° de demande, et deux séances distinctes qui partagent
  // date, lieu et conseiller entraient en collision (314 participations
  // perdues, mesuré le 20/09/2026).
  if(estAtelier(r))return`atl:${cleSessionAtelier(r)}|p:${r.rang_atelier||0}`;
  return`act:${cleBaseAction(r)}|r:${r.rang_ligne||1}`;
}
// Champs qu'un nouvel export peut légitimement corriger sur une ligne connue.
const CHAMPS_MUTABLES=['etat','date_planifiee','date_realisation'];
// Fusionne les lignes d'un nouvel import dans la base. Ne modifie ni `base` ni
// `nouveaux` : rend { records, ajoutes, misAJour, identiques, doublonsFichier }.
// Une ligne déjà connue garde son enrichissement (conseiller, délai) et reçoit
// l'état et les dates du nouvel export, qui fait foi.
function fusionnerImport(base,nouveaux){
  const out=(base||[]).slice();
  const index=new Map();
  out.forEach((r,i)=>{const k=cleFusion(r);if(!index.has(k))index.set(k,i);});
  const vusFichier=new Set();
  let ajoutes=0,misAJour=0,identiques=0,doublonsFichier=0;
  (nouveaux||[]).forEach(r=>{
    const k=cleFusion(r);
    if(vusFichier.has(k)){doublonsFichier++;return;}
    vusFichier.add(k);
    if(!index.has(k)){index.set(k,out.length);out.push(r);ajoutes++;return;}
    const i=index.get(k);
    const diff=CHAMPS_MUTABLES.filter(c=>(out[i][c]||null)!==(r[c]||null));
    if(diff.length){
      const maj={...out[i]};
      diff.forEach(c=>{maj[c]=r[c]||null;});
      out[i]=maj;misAJour++;
    }else identiques++;
  });
  return{records:out,ajoutes,misAJour,identiques,doublonsFichier};
}

// ─── Fiabilité des indicateurs ────────────────────────────────────────────────
// Protéger celui qui présente le dashboard. N'afficher que des écarts MESURÉS
// sur le fichier importé — jamais une marge inventée, ce serait l'inverse du
// but recherché. Couvert par les tests « indicateursFiabilite ».
//
// Les seuils sont arbitraires mais explicites : ils servent à hiérarchiser
// l'affichage (rien / point orange / bandeau), pas à juger la donnée.
const SEUILS_FIABILITE=[[1,'solide'],[5,'bonne'],[10,'moyenne'],[25,'partielle']];
function niveauFiabilite(margePct){
  for(const[seuil,nom]of SEUILS_FIABILITE)if(margePct<seuil)return nom;
  return'faible';
}
function indicateursFiabilite(records,stats){
  const base=records||[];
  const n=base.length;
  if(!n)return[];
  const st=stats||{};
  const ind=[];
  // `sur` = la population contrôlée. Les doublons d'un type se rapportent aux
  // lignes de ce type, pas à toute la base : 1 doublon sur 2 accompagnements
  // affichait 0,5 % parmi 200 lignes, classé « solide » (AG-004).
  // Population nulle (`sur` = 0) : le contrôle n'a rien examiné. Il ne se range ni
  // parmi les contrôles sans défaut ni parmi les points de vigilance (AG-004,
  // décision du 29/10/2026) : `applicable:false`, jamais un ✓.
  const ajoute=(cle,libelle,valeur,ecart,fait,sur)=>{
    if(sur===0){
      ind.push({cle,libelle,valeur,ecart:0,sur:0,marge:0,niveau:'solide',applicable:false,
        fait:'non applicable — aucune ligne de ce type dans la sélection'});
      return;
    }
    const pop=sur==null?n:sur;
    const marge=pop?Math.round(ecart/pop*1000)/10:0;
    ind.push({cle,libelle,valeur,ecart,sur:pop,marge,niveau:niveauFiabilite(marge),fait});
  };

  // Demandes : le N° est renseigné sur toutes les lignes retenues, donc exact.
  const sansNum=base.filter(r=>!r.id_demande).length;
  ajoute('demandes','Demandes distinctes',countDemandes(base),sansNum,
    sansNum?`${sansNum} lignes sans N° de demande sur ${n} lignes`:'N° de demande renseigné sur 100 % des lignes');

  // Types principaux : la marge est le nombre de doublons suspects du type.
  [['accompagnements','Accompagnements','Accompagnement'],
   ['contacts','Prises de contact','Prise de contact']].forEach(([cle,libelle,type])=>{
    const lignes=base.filter(r=>(r.type_action||[]).includes(type));
    const dbl=compterDoublons(lignes);
    const unite=libelle.toLowerCase();
    ajoute(cle,libelle,lignes.length,dbl,
      `${dbl?`${dbl} doublon${dbl>1?'s':''} suspect${dbl>1?'s':''}`:'aucun doublon suspect'} sur ${lignes.length} ${unite}`,
      lignes.length);
  });

  // Ateliers : pas de marge, une reformulation. Une ligne est une participation.
  const atl=statsAteliers(base);
  if(atl.participations>0)ind.push({cle:'ateliers',libelle:'Ateliers',valeur:atl.sessions,
    ecart:0,sur:atl.participations,marge:0,niveau:'solide',
    fait:`${atl.sessions} séances pour ${atl.participations} participations`,
    participations:atl.participations});

  // Dimensions d'analyse : la marge est la part de lignes non rattachables.
  const autreStructure=base.filter(r=>r.cms==='Autre structure').length;
  ajoute('lieu','Par lieu / CMS',new Set(base.map(r=>r.cms).filter(Boolean)).size,autreStructure,
    `${autreStructure} lignes en « Autre structure » sur ${n} lignes`);

  const horsRef=base.filter(r=>r.commune&&!rattacherCommune(r.commune)).length;
  ajoute('commune','Par commune',new Set(base.map(r=>r.commune).filter(Boolean)).size,horsRef,
    `${horsRef} lignes hors référentiel officiel sur ${n} lignes`);

  const sansThema=base.filter(r=>!r.themas||!r.themas.length).length;
  ajoute('themas','Thématiques',new Set(base.flatMap(r=>r.themas||[])).size,sansThema,
    `${sansThema} lignes sans thématique sur ${n} lignes`);

  const chrono=base.filter(r=>r.date_realisation&&r.date_realisation<r.date_demande).length;
  ajoute('delais','Délais',null,chrono,`${chrono} réalisations antérieures à leur demande sur ${n} lignes`);

  // Conseiller : l'indicateur le plus sensible. conum_deduit est posé par
  // applyConumAttrib ; sans lui on retombe sur les lignes sans conseiller.
  const deduits=base.some(r=>r.conum_deduit!==undefined)
    ? base.filter(r=>r.conum_deduit).length
    : base.filter(r=>!r.conum||r.conum==='?').length;
  // Origine inconnue : base enregistrée avant le suivi de provenance. On ne
  // peut pas dire qu'elle est exacte, donc elle compte dans la marge.
  const inconnus=base.filter(r=>r.conum_origine==='inconnu').length;
  ajoute('conseiller','Par conseiller',new Set(base.map(r=>r.conum).filter(Boolean)).size,deduits+inconnus,
    `${deduits} lignes attribuées par déduction depuis le CMS sur ${n} lignes`+(inconnus?` · ${inconnus} d'origine inconnue (base d'une version antérieure : réimporter l'export pour la retrouver)`:''));

  return ind;
}

// Défauts de saisie constatés, à lister tels quels dans l'onglet.
function defautsSaisie(records,stats){
  const base=records||[];
  const n=base.length;
  const st=stats||{};
  const l=[];
  // Deux dénominateurs : les défauts constatés sur la base portent sur les
  // lignes en base, ceux issus de l'import portent sur les lignes lues ou
  // retenues à ce moment-là. Les mélanger donnait 104,9 % sur une colonne
  // réparée à 100 % (mesuré le 20/09/2026).
  const add=(libelle,val,total)=>{if(val>0)l.push({libelle,val,sur:total,part:total?Math.round(val/total*1000)/10:0});};
  add('Référent absent',base.filter(r=>!r.orienteur).length,n);
  add('Commune absente',base.filter(r=>!r.commune).length,n);
  add('Action antérieure à sa demande',base.filter(r=>r.date_action&&r.date_action<r.date_demande).length,n);
  const retenues=st.retenues||n;
  add('Cellules « Date action » réparées à l\'import',st.cellules_reparees||0,retenues);
  add('Graphies de communes regroupées',st.communes_fusionnees||0,retenues);
  add('Lieux lus dans la structure orienteur',st.cms_via_structure||0,retenues);
  add('Conseillers lus dans le référent',st.conum_via_referent||0,retenues);
  add('Lignes écartées à l\'import',st.ecartees||0,st.lues||retenues);
  return l;
}

// Synthèse d'une ligne, affichée après import.
// Ne PAS réduire l'ensemble au pire indicateur : un seul point faible ferait
// afficher « fiabilité faible » alors que la plupart des contrôles sont nets.
// Ne pas non plus faire passer un contrôle « solide » pour une exactitude :
// « solide » = moins de 1 % de défauts DÉTECTÉS, pas zéro (AG-004, Codex). La
// synthèse sépare donc les contrôles sans défaut détecté de ceux qui en ont
// peu, annonce les points de vigilance et nomme le plus sensible.
function syntheseFiabilite(indicateurs){
  const tous=indicateurs||[];
  const ind=tous.filter(i=>i.applicable!==false);
  const nonApplicables=tous.length-ind.length;
  if(!ind.length)return{niveau:'—',solides:0,sansDefaut:0,vigilance:0,nonApplicables,plusFaible:null,
    texte:nonApplicables?`${nonApplicables} contrôle${nonApplicables>1?'s':''} non applicable${nonApplicables>1?'s':''}`:'aucune donnée'};
  const solides=ind.filter(i=>i.niveau==='solide');
  const sansDefaut=solides.filter(i=>!i.ecart).length;
  const peu=solides.length-sansDefaut;
  const enVigilance=ind.filter(i=>i.niveau!=='solide');
  const plusFaible=enVigilance.slice().sort((a,b)=>b.marge-a.marge)[0]||null;
  const pire=plusFaible?plusFaible.niveau:'solide';
  const pl=(k,mot)=>`${k} ${mot}${k>1?'s':''}`;
  const parts=[`${pl(sansDefaut,'contrôle')} sans défaut détecté`];
  if(peu)parts.push(`${peu} avec moins de 1 % de défauts`);
  if(nonApplicables)parts.push(`${nonApplicables} non applicable${nonApplicables>1?'s':''} (aucune ligne de ce type)`);
  parts.push(enVigilance.length
    ?`${pl(enVigilance.length,'point')} de vigilance · le plus sensible : ${plusFaible.libelle} (${plusFaible.marge} %)`
    :'aucun point de vigilance');
  return{niveau:pire,solides:solides.length,sansDefaut,vigilance:enVigilance.length,nonApplicables,plusFaible,texte:parts.join(' · ')};
}

// ─── Libellé des lignes affichées ────────────────────────────────────────────
// Un titre qui affirme « Accompagnements » pendant que le filtre de type montre
// des ateliers est faux. Constaté le 21/09/2026 sur « Accompagnements par CMS »
// et « Accompagnements — N/N-1/N-2 ». Couvert par les tests « libelleLignes ».
const LIBELLE_LIGNES={
  '':'Demandes',
  'Accompagnement':'Accompagnements',
  'Prise de contact':'Prises de contact',
  'Orientation vers un tiers':'Orientations vers un tiers',
  'Atelier':'Participations',
  'Demande de prescription de Pass':'Prescriptions de Pass',
  'Orientation vers un CN du 47':'Orientations vers un CN 47',
  'Autre':'Autres actions',
};
function libelleLignes(typeFiltre){
  const k=typeFiltre==null?'':String(typeFiltre);
  return LIBELLE_LIGNES[k]||'Demandes';
}

// ─── Nombre d'un KPI, pour l'animation de comptage (28/10/2026) ──────────────
// decouperNombre lit « 95% », « 1 234 », « +12% », « 4,5 j » ; tout le reste
// (texte, « — », « <20 cas », date) rend null et ne s'anime pas. Une valeur
// entre 1900 et 2100 est un compte comme un autre : l'exclure pour épargner
// les années figeait « 1947 non réalisées » (constaté le 28/10/2026), et aucun
// élément animé n'affiche d'année seule.
// formaterCommeNombre réécrit une valeur intermédiaire dans le même format. La
// valeur finale affichée n'est jamais recalculée : l'animation remet le texte
// d'origine tel quel à la fin.
function decouperNombre(texte){
  const m=/^(\s*[+\-\u2212]?)(\d{1,3}(?:[ \u00a0\u202f]\d{3})+|\d+)(?:([.,])(\d+))?(\s?(?:%|[a-zA-Zéèû.]{1,6})?\s*)$/.exec(String(texte==null?'':texte));
  if(!m)return null;
  const sepMil=(/[ \u00a0\u202f]/.exec(m[2])||[''])[0];
  const entier=m[2].replace(/[ \u00a0\u202f]/g,'');
  const decimales=m[4]?m[4].length:0;
  const valeur=parseFloat(entier+(m[4]?'.'+m[4]:''));
  return{prefixe:m[1],valeur,decimales,sepDec:m[3]||',',sepMil,suffixe:m[5]};
}
function formaterCommeNombre(v,modele){
  const fixe=Math.abs(v).toFixed(modele.decimales);
  let[ent,dec]=fixe.split('.');
  if(modele.sepMil)ent=ent.replace(/\B(?=(\d{3})+(?!\d))/g,modele.sepMil);
  return modele.prefixe+ent+(dec?modele.sepDec+dec:'')+modele.suffixe;
}

// ─── Mois d'une période ───────────────────────────────────────────────────────
// Les courbes d'évolution construisaient leur axe depuis les mois présents dans
// les données : un mois sans activité disparaissait au lieu de s'afficher à
// zéro, et deux points voisins à l'écran pouvaient être séparés de plusieurs
// mois réels. Mesuré le 21/09/2026 sur le Rapport : 10 points affichés pour une
// période de 36 mois. Cette fonction rend l'axe complet, bornes incluses.
// `annees` (Set ou tableau) restreint aux années sélectionnées ; vide = toutes.
// Couvert par les tests « moisDeLaPeriode ».
function moisDeLaPeriode(debut,fin,annees){
  const m=/^(\d{4})-(\d{2})/, a=m.exec(String(debut||'')), b=m.exec(String(fin||''));
  if(!a||!b)return[];
  let y=+a[1], mo=+a[2];
  const yF=+b[1], moF=+b[2];
  if(y>yF||(y===yF&&mo>moF))return[];
  const garde=annees&&(annees.size||annees.length)
    ? (annees instanceof Set?annees:new Set(annees)) : null;
  const out=[];
  while(y<yF||(y===yF&&mo<=moF)){
    const cle=`${y}-${String(mo).padStart(2,'0')}`;
    if(!garde||garde.has(String(y)))out.push(cle);
    mo++; if(mo>12){mo=1;y++;}
    if(out.length>1200)break;  // garde-fou : 100 ans
  }
  return out;
}


// ─── Export CSV : neutraliser les formules ────────────────────────────────────
// Entourer un champ de guillemets protège la structure du CSV, pas son
// interprétation : Excel et LibreOffice évaluent une cellule qui commence par
// = + - @ (ou une tabulation / un retour chariot) comme une formule. Un texte
// venu d'un fichier piégé suffit. L'apostrophe
// de tête force le texte. Audit du 20/10/2026, constat 12.
function neutraliserFormule(v){
  const t=String(v==null?'':v);
  return /^[=+\-@\t\r]/.test(t)?"'"+t:t;
}
function celluleCSV(v){return`"${neutraliserFormule(v).replace(/"/g,'""')}"`;}

// Anciennes bases : supprimer le texte libre sans toucher aux lignes ni à leur
// identité. Le nettoyage en place laisse intacts rangs, provenance et références.
function retirerMotifs(records){
  let n=0;
  (records||[]).forEach(r=>{
    if(r&&Object.prototype.hasOwnProperty.call(r,'motif')){delete r.motif;n++;}
  });
  return n;
}

// ─── Bases enregistrées avant l'identité par rang ─────────────────────────────
// Une base sans rang_ligne vient d'avant le 20/10/2026 : ses doublons ont déjà
// été fusionnés par l'ancienne clé, donc elle est INCOMPLÈTE (76 demandes
// disparues sur l'export de septembre) et ses rangs ne peuvent qu'être
// reconstitués dans l'ordre de la base. Pas de purge : on complète, on le dit,
// et on propose de réimporter l'export source.
function baseAncienne(records){
  return(records||[]).some(r=>r&&!estAtelier(r)&&r.rang_ligne===undefined);
}
function completerRangs(records){
  const ancienne=baseAncienne(records);
  if(ancienne)numeroterLignes(records);
  if((records||[]).some(r=>r&&estAtelier(r)&&r.rang_atelier===undefined))numeroterParticipants(records);
  return ancienne;
}


// ─── États des actions : une seule nomenclature ───────────────────────────────
// À l'import, ETAT_MAP ramène « En cours » et « En attente » à « En attente ».
// Les écrans comptaient pourtant « En cours » (toujours 0) et versaient dans
// cette colonne tout ce qui n'était ni réalisé ni non réalisé (417 lignes dont
// 145 d'autres états, mesuré le 20/10/2026). Quatre catégories, aucune ne
// déborde sur une autre : realisee | non_realisee | en_attente | autre.
function categorieEtat(etat){
  const e=normEtat(etat);
  if(e==='realisee')return'realisee';
  if(e==='non realisee')return'non_realisee';
  if(e==='en attente'||e==='en cours')return'en_attente';
  return'autre';
}
function repartitionEtats(records){
  const r={realisee:0,non_realisee:0,en_attente:0,autre:0,total:0};
  (records||[]).forEach(x=>{r[categorieEtat(x&&x.etat)]++;r.total++;});
  return r;
}

// ─── Actions dérivées (onglet États, réactivité, délais) ──────────────────────
// Réactivité = délai entre la demande et la PREMIÈRE prise de contact valide DE
// LA MÊME DEMANDE. Le rapprochement se faisait sur conseiller + CMS + date de
// demande : deux demandes du même jour partageaient le contact de l'une
// d'elles (délais [1, 10] devenaient [1, 1], mesuré le 20/10/2026 ; 697
// accompagnements n'avaient aucun contact de leur propre demande). Sans N° de
// demande, aucun rapprochement : le cas est compté « sans contact », jamais
// emprunté à une autre demande.
// `jour` garde la date entière (filtrer au jour) ; `date` est le mois, pour
// regrouper les graphiques. 48 h = au plus 2 jours ouvrés (lundi-vendredi,
// fériés non retirés), la source ne donnant pas d'heure.
// `aujourdhui` : une date planifiée n'est retenue que si elle est passée.
function deriverActions(records,aujourdhui){
  const fin=aujourdhui instanceof Date?new Date(aujourdhui):new Date();
  fin.setHours(23,59,59,999);
  const pd=v=>{if(!v)return null;const d=new Date(v);return isNaN(d)?null:d;};
  const delaiContact={};
  (records||[]).forEach(r=>{
    if(!r.id_demande)return;
    if(!(r.type_action||[]).some(t=>t.toLowerCase().includes('prise de contact')))return;
    const dC=pd(r.date_demande);if(!dC)return;
    const dR=pd(r.date_realisation),dP=pd(r.date_planifiee);
    let dContact=null;if(dR&&dR<=fin)dContact=dR;else if(dP&&dP<=fin)dContact=dP;
    if(!dContact)return;
    const dl=bizDays(dC,dContact);if(dl===null||dl<0)return;
    if(!(r.id_demande in delaiContact)||dl<delaiContact[r.id_demande])delaiContact[r.id_demande]=dl;
  });
  const out=[];
  (records||[]).forEach(r=>{
    if(!(r.type_action||[]).some(t=>t.toLowerCase().startsWith('accompagnement')))return;
    if(!r.cms)return;
    const dC=pd(r.date_demande),dR=pd(r.date_realisation);
    const date=r.date_demande?r.date_demande.slice(0,7):null,year=date?date.slice(0,4):null;
    const avecContact=!!r.id_demande&&(r.id_demande in delaiContact);
    out.push({etat:r.etat||'',cms:r.cms,conum:r.conum,date,jour:r.date_demande||null,year,lieu:r.cms,
      id_demande:r.id_demande||'',
      delai_reactivite:avecContact?delaiContact[r.id_demande]:null,
      delai_total:bizDays(dC,dR)});
  });
  return out;
}
// Délai de premier contact, UNE valeur par demande : deriverActions répète le
// délai d'une demande sur chacun de ses accompagnements, si bien qu'une demande
// à 20 accompagnements pesait 20 fois (95 % au lieu de 50 %, AG-004). Une
// action sans N° de demande est un cas à part entière. null = sans contact.
function delaisParDemande(actions){
  const m=new Map();
  (actions||[]).forEach((r,i)=>{
    const k=r.id_demande?'d:'+r.id_demande:'l:'+i;
    const d=r.delai_reactivite!=null&&r.delai_reactivite>=0?r.delai_reactivite:null;
    if(!m.has(k)||(d!=null&&(m.get(k)==null||d<m.get(k))))m.set(k,d);
  });
  return[...m.values()];
}
// Réactivité « 48 h » = premier contact en 2 jours ouvrés au plus, fériés non
// retirés — une mesure, pas un délai réglementaire. Comptée PAR DEMANDE
// (choix de l'utilisateur, AG-004, 22/10/2026). `calculables` = demandes avec
// un contact valide ; `sansContact` = demandes sans contact, à afficher à côté
// du taux. Le taux n'est publié qu'à partir de `seuil` demandes calculables.
function reactivite48(actions,seuil){
  const delais=delaisParDemande(actions);
  const calc=delais.filter(d=>d!=null);
  const dans48=calc.filter(d=>d<=2).length;
  const min=seuil==null?20:seuil;
  return{calculables:calc.length,dans48,sansContact:delais.length-calc.length,
    taux:calc.length>=min?Math.round(dans48/calc.length*100):null};
}
// Filtre par période au JOUR : les écrans comparaient des mois (YYYY-MM), si
// bien qu'un filtre du 16/09 au 16/09 reprenait tout septembre.
function dansPeriode(jour,debut,fin){
  if(!jour)return false;
  return(!debut||jour>=debut)&&(!fin||jour<=fin);
}
// Taux d'accompagnements réalisés : lignes à l'état « Réalisée » sur les lignes.
// Ce n'est PAS un taux de demandes closes (une demande porte plusieurs actions).
function tauxRealisation(records){
  const liste=records||[];
  const realisees=liste.filter(r=>isRealisee(r.etat)).length;
  return{realisees,total:liste.length,taux:liste.length?Math.round(realisees/liste.length*100):0};
}


// ─── Filtre de type d'action ──────────────────────────────────────────────────
// Même normalisation que le filtre de l'en-tête (casse, accents, pluriel).
// Les comparaisons annuelles du Bilan l'ignoraient : +557 % calculés sur 230 /
// 35 actions de tous types, quand le filtre « Accompagnement » en comptait 121
// / 31 (+290 %, mesuré le 20/10/2026).
function filtrerParType(records,typeFiltre){
  const liste=records||[];
  if(!typeFiltre)return liste;
  const nt=x=>String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/s$/,'');
  const cible=nt(typeFiltre);
  return liste.filter(r=>(r.type_action||[]).some(x=>nt(x).startsWith(cible)));
}
// Évolution année N / N-1 À LA MÊME DATE. L'année la plus récente de la base
// est en général incomplète : la comparer à une année entière donnait −35,3 %
// là où la même période donne −5,5 % (mesuré le 20/10/2026). `dateMax` est la
// dernière date de demande de la base ; `partielle` dit si la coupure s'applique.
function evolutionAnnuelle(records,anneeN,dateMax){
  const liste=records||[];
  const anneeP=anneeN?String(parseInt(anneeN)-1):'';
  const partielle=!!(anneeN&&dateMax&&dateMax.slice(0,4)===anneeN&&dateMax.slice(5)<'12-31');
  const coupure=partielle?dateMax.slice(5):'12-31';
  const dans=(r,an)=>r.date_demande&&r.date_demande.startsWith(an)&&r.date_demande.slice(5)<=coupure;
  const nRec=anneeN?liste.filter(r=>dans(r,anneeN)).length:0;
  const nPre=anneeP?liste.filter(r=>dans(r,anneeP)).length:0;
  const delta=nPre>0?Math.round((nRec-nPre)/nPre*100):null;
  const jj=coupure.slice(3),mm=coupure.slice(0,2);
  return{nRec,nPre,delta,partielle,coupure:`${jj}/${mm}`,anneeN,anneeP};
}

// Évolution annuelle d'un couple : accompagnements seuls, une entrée par année du
// jeu, chacune comparée à l'année calendaire précédente. La dernière année, si
// elle est partielle, est comparée à la MÊME date (coupure d'evolutionAnnuelle).
// Avant le 29/10/2026 le bloc comptait toutes les lignes, tous types, et
// comparait à l'année précédente du jeu sans coupure (AG-004, décision 2).
function evolutionParAnnee(records,dateMax){
  const acc=filtrerParType(records,'Accompagnement');
  const annees=[...new Set(acc.filter(r=>r.date_demande).map(r=>r.date_demande.slice(0,4)))].sort();
  return annees.map(a=>evolutionAnnuelle(acc,a,dateMax));
}

// Orienteurs externes : référents distincts, hors vides, hors « ? », hors conseillers
// numériques. Une seule définition pour toutes les tuiles « Orienteurs actifs » et
// le texte « TS orienteurs » (AG-004, décision 3 : 25 comptait deux conseillers,
// la diapo TS orienteurs en annonçait 23). `conseillers` : Set des noms (ORI_EXCL).
function compterOrienteursExternes(records,conseillers){
  const exclus=conseillers||new Set();
  const vus=new Set();
  (records||[]).forEach(r=>{
    const o=String((r&&r.orienteur)||'').trim();
    if(o&&o!=='?'&&!exclus.has(o))vus.add(o);
  });
  return vus.size;
}

// ─── Demandes distinctes ──────────────────────────────────────────────────────
// Une demande (N° Demande) génère plusieurs lignes d'action : compter les lignes
// n'est pas compter les demandes. Couvert par les tests « countDemandes ».
function countDemandes(arr){return new Set((arr||[]).map(r=>r&&r.id_demande).filter(Boolean)).size;}

// Compatibilité Node.js (tests) ET navigateur (script tag)
if(typeof module!=='undefined'){
  module.exports={
    MONTH_FR,TYPE_KEYS,TYPE_PALETTE,CMS_MAP_RAW,KEEP_CMS,CMS_MAP,
    normKey,normCms,extractDominantCms,
    esc,demojibakeUtf16,normCommuneKey,communesCanoniques,comblerConum,normKeySouple,rattacherCommune,COMMUNES_47,excelDate,parseXlsText,parseRows,mapColonnes,normHeader,formatResumeImport,estAtelier,cleSessionAtelier,compterSessionsAtelier,statsAteliers,numeroterParticipants,numeroterLignes,cleBaseAction,neutraliserFormule,celluleCSV,categorieEtat,repartitionEtats,filtrerParType,evolutionAnnuelle,evolutionParAnnee,compterOrienteursExternes,deriverActions,delaisParDemande,reactivite48,dansPeriode,tauxRealisation,retirerMotifs,baseAncienne,completerRangs,fusionnerImport,CHAMPS_MUTABLES,ORIGINES_CONUM,cleFusion,conseillersConnus,deriverAttributionCms,attribuerConum,couleurConum,indicateursFiabilite,defautsSaisie,syntheseFiabilite,niveauFiabilite,TYPE_ATELIER,ETAT_MAP,TYPE_EXCLUS,TYPE_CYCLE_PASS,ECARTER_SANS_CMS,
    typeColor,pct,monthLabel,count,countEntries,countThemas,lignesAvecThemas,countTypes,
    parseDt,dayDiff,bizDays,
    normEtat,isRealisee,countDemandes,dateFr,mentionRevisabilite,decouperNombre,formaterCommeNombre,cleDoublon,compterDoublons,moisDeLaPeriode,libelleLignes,LIBELLE_LIGNES,
  };
}
