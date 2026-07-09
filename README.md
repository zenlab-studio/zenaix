# ZEN Account — Guida al deploy su Netlify

Questo pacchetto contiene ZEN 6 (in `index.html`) con il nuovo sistema **ZEN Account**:
login/registrazione online con username + password, sincronizzazione delle chat e del
profilo su qualsiasi dispositivo, tramite **Netlify Functions + Netlify Blobs** (nessun
servizio esterno da configurare).

## Cosa è cambiato rispetto alla versione precedente

- Prima: gli account erano salvati solo in `localStorage` del browser (nessuna vera
  password, nessun accesso da altri dispositivi).
- Ora: puoi creare un **ZEN Account** vero (username + password con hash sicuro
  bcrypt), fare login da qualsiasi PC/telefono, e le tue chat si sincronizzano
  automaticamente sul server.
- Resta comunque disponibile la modalità **offline/locale** (bottone "Continua senza
  account") per chi non vuole registrarsi.
- Al primo login online, se il browser aveva account/chat locali salvati in precedenza,
  vengono **migrati automaticamente** nel nuovo ZEN Account.

## Struttura del progetto

```
/
├── index.html                          ← ZEN 6 con il nuovo sistema ZEN Account
├── netlify.toml                        ← configurazione Netlify
├── package.json                        ← dipendenze (bcryptjs, @netlify/blobs)
└── netlify/functions/
    ├── _session.js                     ← firma/verifica token di sessione
    ├── _validate.js                    ← validazione username/password
    ├── auth-register.js                ← crea un nuovo ZEN Account
    ├── auth-login.js                   ← login
    ├── auth-change-password.js         ← cambio password
    └── sync-data.js                    ← scarica/salva profilo e chat
```

## Deploy su Netlify — passo per passo

### 1. Crea un repository Git (raccomandato)
Netlify funziona meglio collegato a GitHub/GitLab, così ogni modifica futura si
aggiorna in automatico. In alternativa puoi anche fare drag & drop della cartella
direttamente sul sito di Netlify, ma perderesti i redeploy automatici.

```bash
cd zen-account-project
git init
git add .
git commit -m "ZEN Account - primo deploy"
```
Poi crea un repo su GitHub e collega/pusha (`git remote add origin ...` e `git push`).

### 2. Collega il repository a Netlify
1. Vai su [app.netlify.com](https://app.netlify.com) e accedi.
2. "Add new site" → "Import an existing project" → scegli GitHub e seleziona il repo.
3. Build command: lascia vuoto (non serve build).
4. Publish directory: `.` (la root, dove sta `index.html`).
5. Clicca "Deploy site".

### 3. IMPORTANTISSIMO: imposta la variabile segreta `ZEN_SECRET`
Questo è il segreto usato per firmare i token di accesso. **Senza impostarlo, il
sistema funziona ma con un segreto di default non sicuro** — vanno cambiati subito.

1. Sul sito Netlify → "Site configuration" → "Environment variables".
2. Aggiungi una nuova variabile:
   - Key: `ZEN_SECRET`
   - Value: una stringa lunga e casuale (esempio: apri il terminale e genera con
     `openssl rand -hex 32`, oppure usa un generatore di password online da 40+ caratteri).
3. Salva, poi vai su "Deploys" → "Trigger deploy" → "Deploy site" per applicare la
   variabile.

### 4. Abilita Netlify Blobs
Netlify Blobs è già incluso di default nei siti Netlify (nessuna configurazione
aggiuntiva richiesta, a differenza di un vero database esterno). Le funzioni in
`netlify/functions/` lo usano automaticamente tramite `@netlify/blobs`.

### 5. Verifica che tutto funzioni
Apri il sito pubblicato, prova a:
1. Cliccare "Registrati" nel modal ZEN Account → crea un utente di test.
2. Scrivere qualche messaggio in una chat.
3. Apri il sito da un altro dispositivo (o in una finestra in incognito) e fai login
   con le stesse credenziali: le chat devono apparire.

Se qualcosa non va, controlla su Netlify → "Functions" → i log delle singole funzioni
(`auth-register`, `auth-login`, `sync-data`) per eventuali errori.

## Note di sicurezza

- Le password non vengono **mai** salvate in chiaro: sono hashate con bcrypt (10 rounds)
  prima di essere scritte su Netlify Blobs.
- I token di sessione sono firmati con HMAC-SHA256 usando `ZEN_SECRET` e scadono dopo
  30 giorni.
- Il cambio password richiede sempre la password attuale.
- Non esiste un vero "recupero password via email" (per scelta, dato che il sistema è
  username+password senza email): se un utente perde le credenziali, deve creare un
  nuovo account. Se in futuro vuoi aggiungere il recupero via email, serve integrare un
  servizio di invio email (es. Resend, SendGrid) — dimmelo e lo aggiungo.

## Sviluppo locale (opzionale)

Per testare le Netlify Functions in locale prima del deploy:

```bash
npm install -g netlify-cli
cd zen-account-project
npm install
netlify dev
```

Questo avvia un server locale che simula sia il sito che le functions, così puoi
testare login/registrazione/sync senza dover fare deploy ogni volta.
