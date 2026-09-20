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
  // === Lieux partenaires sortis de « Autre structure » le 20/09/2026 ===
  // Admis par le repli sur « Structure orienteur », ils y arrivaient en vrac.
  // normKey() ne neutralise que casse, accents et espaces multiples : chaque
  // graphie qui diffère par la ponctuation ou un mot en plus a besoin de sa
  // propre clé. ABRIS était éclaté en dix graphies pour 181 lignes.
  'IME Montclairjoie':                      'IME Montclairjoie',
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
    if(r.orienteur&&connus.has(r.orienteur)){r.conum=r.orienteur;comblees++;}
  });
  return comblees;
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
  return {commune:ci('commune'),motif:ci('motif'),type:ci('type action',"type d'action"),
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
    records.push({date_demande:dd,date_action:da,id_demande:cell(c,I.nDem),conum:cell(c,I.conum),
      cms,lieu_raw:lieuRaw,structure:structureRaw,commune:cell(c,I.commune),themas,type_action:types,
      orienteur:cell(c,I.orienteur),motif:cell(c,I.motif).slice(0,120),
      benef_connu:cell(c,I.benef).toLowerCase()==='oui',urgence:cell(c,I.urgence).toLowerCase()==='oui',
      etat,date_planifiee:excelDate(cell(c,I.datePlanif))||null,
      date_realisation:excelDate(cell(c,I.dateReal))||null});
    stats.retenues++;
  }
  if(!records.length)throw new Error('Aucun enregistrement valide. Vérifiez le format.');
  stats.cellules_reparees=cellulesReparees;
  stats.cms_via_structure=cmsViaStructure;
  const{canon,fusionnees}=communesCanoniques(records);
  records.forEach(r=>{if(r.commune)r.commune=canon[normCommuneKey(r.commune)];});
  stats.communes_fusionnees=fusionnees;
  stats.conum_via_referent=comblerConum(records);
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
  if(stats.communes_fusionnees)parts.push(`${stats.communes_fusionnees} communes regroupées`);
  if(stats.conum_via_referent)parts.push(`${stats.conum_via_referent} conseillers lus dans le référent`);
  if(stats.cellules_reparees)parts.push(`${stats.cellules_reparees} cellules réparées (encodage)`);
  return parts.join(' · ');
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

// ─── État des actions ─────────────────────────────────────────────────────────
// Ne JAMAIS tester l'état avec includes('réalisée') : "Non réalisée" contient
// "réalisée", ce qui faisait compter les non-réalisées comme réalisées.
// Couvert par les tests « isRealisee » de gdin-pure.test.js.
function normEtat(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();}
function isRealisee(etat){return normEtat(etat)==='realisee';}

// ─── Demandes distinctes ──────────────────────────────────────────────────────
// Une demande (N° Demande) génère plusieurs lignes d'action : compter les lignes
// n'est pas compter les demandes. Couvert par les tests « countDemandes ».
function countDemandes(arr){return new Set((arr||[]).map(r=>r&&r.id_demande).filter(Boolean)).size;}

// Compatibilité Node.js (tests) ET navigateur (script tag)
if(typeof module!=='undefined'){
  module.exports={
    MONTH_FR,TYPE_KEYS,TYPE_PALETTE,CMS_MAP_RAW,KEEP_CMS,CMS_MAP,
    normKey,normCms,extractDominantCms,
    esc,demojibakeUtf16,normCommuneKey,communesCanoniques,comblerConum,normKeySouple,excelDate,parseXlsText,parseRows,mapColonnes,normHeader,formatResumeImport,ETAT_MAP,TYPE_EXCLUS,TYPE_CYCLE_PASS,ECARTER_SANS_CMS,
    typeColor,pct,monthLabel,count,countThemas,countTypes,
    parseDt,dayDiff,bizDays,
    normEtat,isRealisee,countDemandes,
  };
}
