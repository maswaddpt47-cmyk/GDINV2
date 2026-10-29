/**
 * Parcours de minimisation sans navigateur : exécute les fonctions du HTML,
 * avec des magasins simulés (dont validation atomique des transactions IDB).
 * Le rendu et le véritable IndexedDB restent couverts par la suite Playwright.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { retirerMotifs } = require('./gdin-pure.js');

const HTML = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const SNAP = 'gdin_snap_v4', OLD = 'gdin_data_v3', META = 'gdin_meta_v3';
function extrait(debut, fin) {
  const a = HTML.indexOf(debut), b = HTML.indexOf(fin, a);
  assert.ok(a >= 0 && b > a, `fonction introuvable : ${debut}`);
  return HTML.slice(a, b);
}
const STOCKAGE = extrait("const LS_SNAP=", 'function _instantaneValide(') +
  extrait('function nettoyerMotifsStockes(){', '// INIT');
const IMPORT = extrait('async function handleAutoImport(', '\nfunction showImportError(') +
  extrait('function handleResetAndImport(', '\nasync function resetToEmbedded(');

function ligne(i) {
  return { id_demande:String(i), motif:'texte fictif', date_demande:'2025-03-10',
    rang_ligne:i, rang_atelier:i + 1, conum_origine:'source',
    themas:['Logement'], type_action:['Accompagnement'], champ_ancien:'préservé' };
}
const copie = x => structuredClone(x);

function magasins({ refusLS = false, refusIDB = false } = {}) {
  const ls = new Map([
    [SNAP, JSON.stringify({ schema:2, rev:12, records:[ligne(1)], meta:{ filename:'a.xlsx' } })],
    [OLD, JSON.stringify([ligne(2)])], [META, JSON.stringify({ filename:'ancien.xlsx' })],
  ]);
  const idb = new Map([
    [SNAP, { schema:2, rev:11, records:[ligne(3)], meta:{ filename:'b.xlsx' } }],
    [OLD, [ligne(4)]], [META, { filename:'ancienne.xlsx' }],
  ]);
  const db = {
    close() {},
    transaction() {
      const stage = new Map([...idb].map(([k, v]) => [k, copie(v)]));
      let annule = false, demandes = 0, finPrevue = false;
      const tx = {
        abort() { annule = true; queueMicrotask(() => tx.onabort?.()); },
        objectStore() { return {
          get(k) {
            demandes++;
            const requete = {};
            queueMicrotask(() => {
              if (annule) return;
              requete.result = stage.has(k) ? copie(stage.get(k)) : undefined;
              requete.onsuccess?.();
              demandes--;
              if (demandes || finPrevue) return;
              finPrevue = true;
              setImmediate(() => {
                if (annule) return;
                idb.clear();
                stage.forEach((v, cle) => idb.set(cle, copie(v)));
                tx.oncomplete?.();
              });
            });
            return requete;
          },
          put(v, k) {
            if (refusIDB) tx.abort();
            else stage.set(k, copie(v));
          },
        }; },
      };
      return tx;
    },
  };
  const contexte = vm.createContext({
    console, setTimeout, clearTimeout, retirerMotifs, LS_KEY:OLD, LS_META:META,
    IDB_DELAI_MAX:500,
    localStorage:{
      getItem:k => ls.has(k) ? ls.get(k) : null,
      setItem(k, v) { if (refusLS) throw Error('quota'); ls.set(k, v); },
      removeItem:k => ls.delete(k),
    },
    _idbOpen:async () => db,
    _idbPut:async (k, v) => { idb.set(k, copie(v)); return true; },
    _idbDel:async (...cles) => { cles.forEach(k => idb.delete(k)); return true; },
  });
  vm.runInContext(STOCKAGE, contexte);
  return { contexte, ls, idb };
}

function sansMotif(valeur, instantane) {
  const resultat = copie(valeur);
  const records = instantane ? resultat.records : resultat;
  records.forEach(r => { delete r.motif; });
  return resultat;
}

describe('nettoyage persistant des anciens motifs', () => {
  it('préserve toutes les données sauf motif dans les quatre copies, et respecte la file', async () => {
    const m = magasins();
    // Une écriture déjà en file doit finir avant le nettoyage de sa révision.
    const recent = JSON.stringify({ schema:2, rev:50, records:[ligne(9)], meta:{ filename:'recent.xlsx' } });
    let debloquer;
    const attente = new Promise(resolve => { debloquer = resolve; });
    m.contexte._enfile(async () => { await attente; m.ls.set(SNAP, recent); });
    const avantLS = new Map(m.ls), avantIDB = new Map(copie([...m.idb]));
    avantLS.set(SNAP, recent);
    const nettoyage = m.contexte.nettoyerMotifsStockes();
    assert.equal(JSON.parse(m.ls.get(SNAP)).rev, 12);
    debloquer();
    const resultat = await nettoyage;
    assert.equal(resultat.ok, true);
    assert.equal(resultat.champsRetires, 4);
    for (const cle of [SNAP, OLD]) {
      assert.deepEqual(JSON.parse(m.ls.get(cle)), sansMotif(JSON.parse(avantLS.get(cle)), cle === SNAP));
      assert.deepEqual(m.idb.get(cle), sansMotif(avantIDB.get(cle), cle === SNAP));
    }
    assert.equal(m.ls.get(META), avantLS.get(META));
    assert.deepEqual(m.idb.get(META), avantIDB.get(META));
    assert.equal((await m.contexte.nettoyerMotifsStockes()).champsRetires, 0);
  });

  it('signale les écritures refusées sans perte et ne ressuscite pas une base réinitialisée', async () => {
    for (const options of [{ refusLS:true }, { refusIDB:true }]) {
      const m = magasins(options), avantLS = [...m.ls], avantIDB = copie([...m.idb]);
      const resultat = await m.contexte.nettoyerMotifsStockes();
      assert.equal(resultat.ok, false);
      assert.equal(resultat.champsRetires, 2);
      if (options.refusLS) assert.deepEqual([...m.ls], avantLS);
      if (options.refusIDB) assert.deepEqual([...m.idb], avantIDB);
    }
    const orpheline = magasins({ refusLS:true });
    orpheline.ls.delete(META);
    for (const cle of [SNAP, OLD]) {
      orpheline.idb.set(cle, sansMotif(orpheline.idb.get(cle), cle === SNAP));
    }
    orpheline.ls.set(SNAP, JSON.stringify(sansMotif(JSON.parse(orpheline.ls.get(SNAP)), true)));
    const resultat = await orpheline.contexte.nettoyerMotifsStockes();
    assert.equal(resultat.ok, false);
    assert.equal(resultat.champsRetires, 0);
    assert.equal(resultat.champsDetectes, 1);

    for (const nettoyageEnPremier of [true, false]) {
      const m = magasins();
      const operations = nettoyageEnPremier
        ? [m.contexte.nettoyerMotifsStockes(), m.contexte.clearStorage()]
        : [m.contexte.clearStorage(), m.contexte.nettoyerMotifsStockes()];
      await Promise.all(operations);
      assert.equal(m.ls.size, 0);
      assert.equal(m.idb.size, 0);
    }
    const m = magasins();
    const sauvegarde = m.contexte.saveToStorage([ligne(8)], { filename:'attente.xlsx' });
    await Promise.all([m.contexte.clearStorage(), m.contexte.nettoyerMotifsStockes()]);
    assert.equal(await sauvegarde, false);
    assert.equal(m.ls.size, 0);
    assert.equal(m.idb.size, 0);
  });
});

describe('désactivation des fichiers JSON', () => {
  it('refuse extension et type JSON, y compris pour un remplacement, avant lecture ou effacement', async () => {
    const erreurs = [], base = [ligne(1)];
    const contexte = vm.createContext({
      DATA:base, pendingData:null,
      document:{ getElementById(id) {
        assert.equal(id, 'import-error', 'aucune interface de progression ne doit démarrer');
        return { style:{} };
      } },
      showImportError:message => erreurs.push(message),
      FileReader:class { constructor() { assert.fail('aucune lecture de fichier JSON'); } },
      clearStorage() { assert.fail('aucun effacement avant rejet'); },
      isBinaryXls() { assert.fail('aucune tentative de parsing JSON comme classeur'); },
      localStorage:{ setItem() { assert.fail('aucune sauvegarde de JSON'); } },
    });
    vm.runInContext(IMPORT, contexte);
    const avant = copie(base);
    const fichiers = [
      { name:'ancien.JSON', type:'' },
      { name:'renomme.txt', type:'application/json' },
      { name:'renomme.xls', type:'application/ld+json' },
      { name:'renomme.csv', type:'text/json;charset=utf-8' },
    ];
    for (const fichier of fichiers) {
      await contexte.handleAutoImport(fichier);
      contexte.handleResetAndImport(fichier);
    }
    assert.equal(erreurs.length, fichiers.length * 2);
    erreurs.forEach(message => assert.match(message, /JSON.*désactivé/));
    assert.deepEqual(base, avant);
    assert.equal(contexte.pendingData, null);
  });
});
