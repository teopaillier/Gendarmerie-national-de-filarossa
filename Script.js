const pages = [...document.querySelectorAll('.page')];
const nav = [...document.querySelectorAll('.nav')];

function show(id) {
  pages.forEach(p =>
    p.classList.toggle('active', p.id === id)
  );

  nav.forEach(n =>
    n.classList.toggle('active', n.dataset.page === id)
  );

  if (id === 'dossiers') renderList();

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

nav.forEach(n =>
  n.onclick = () => show(n.dataset.page)
);

document.querySelectorAll('FormButtons').forEach(el => {
  el.outerHTML = `
    <div class="actions">
      <button class="primary" type="submit">
        💾 Enregistrer le document
      </button>

      <button type="button" onclick="window.print()">
        🖨️ Imprimer / PDF
      </button>

      <button type="button" onclick="this.closest('form').reset()">
        ↺ Effacer
      </button>
    </div>
  `;
});

document.querySelectorAll('form').forEach(form => {

  form.addEventListener('submit', e => {
    e.preventDefault();

    const data = Object.fromEntries(
      new FormData(form).entries()
    );

    data.type = form.dataset.type;
    data.id = crypto.randomUUID();
    data.created = new Date().toLocaleString('fr-FR');

    const docs = JSON.parse(
      localStorage.getItem('gnrp_docs') || '[]'
    );

    docs.unshift(data);

    localStorage.setItem(
      'gnrp_docs',
      JSON.stringify(docs)
    );

    alert(
      'Document RP enregistré dans le navigateur.'
    );
  });

});

function renderList() {

  const box = document.getElementById('list');

  const docs = JSON.parse(
    localStorage.getItem('gnrp_docs') || '[]'
  );

  if (!docs.length) {
    box.innerHTML =
      '<div class="empty">Aucun document enregistré.</div>';
    return;
  }

  box.innerHTML = docs.map((d, i) => `
    <div class="doc">
      <div>
        <b>${label(d.type)}</b>
        —
        ${esc(d.numero || 'Sans numéro')}
      </div>

      <div>
        <small>${esc(d.created)}</small>

        <button onclick="printDoc(${i})">
          🖨️
        </button>

        <button onclick="delDoc(${i})">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
}

function label(t) {

  return ({
    intervention: 'Rapport d’intervention',
    interpellation: 'Interpellation RP',
    enquete: 'Ouverture d’enquête',
    audition: 'Audition fictive',
    controle: 'Contrôle routier',
    pv: 'Procès-verbal RP'
  })[t] || t;
}

function esc(s) {

  return String(s ?? '').replace(
    /[&<>"']/g,
    c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[c]
  );
}

function delDoc(i) {

  const d = JSON.parse(
    localStorage.getItem('gnrp_docs') || '[]'
  );

  d.splice(i, 1);

  localStorage.setItem(
    'gnrp_docs',
    JSON.stringify(d)
  );

  renderList();
}

function printDoc(i) {

  const d = JSON.parse(
    localStorage.getItem('gnrp_docs') || '[]'
  )[i];

  let rows = '';

  Object.entries(d).forEach(([k, v]) => {

    if (!['id', 'type', 'created'].includes(k) && v) {

      rows += `
        <p>
          <b>${esc(k)}</b>
          <br>
          ${esc(v).replace(/\n/g, '<br>')}
        </p>
      `;
    }

  });

  const w = open('', '_blank');

  w.document.write(`
    <html>
      <head>
        <title>${label(d.type)}</title>

        <style>
          body {
            font-family: Arial;
            max-width: 800px;
            margin: 40px auto;
            line-height: 1.5;
          }

          h1 {
            border-bottom: 2px solid #102a43;
            padding-bottom: 12px;
          }
        </style>
      </head>

      <body>

        <h1>
          Gendarmerie RP —
          ${label(d.type)}
        </h1>

        ${rows}

        <hr>

        <small>
          Document fictif destiné au jeu RP —
          ${esc(d.created)}
        </small>

        <script>
          print()
        <\/script>

      </body>
    </html>
  `);

  w.document.close();
}

document.getElementById('themeBtn').onclick =
  () => document.body.classList.toggle('dark');
