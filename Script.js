const pages=[...document.querySelectorAll('.page')];
const nav=[...document.querySelectorAll('.nav')];

function docs(){
  return JSON.parse(localStorage.getItem('gnrp_docs')||'[]');
}

function login(){
  const name=document.getElementById('loginName').value.trim();
  const grade=document.getElementById('loginGrade').value;

  if(!name){
    alert('Indique ton nom ou pseudo RP.');
    return;
  }

  localStorage.setItem('gnrp_user',JSON.stringify({
    name,
    grade
  }));

  boot();
}

function logout(){
  localStorage.removeItem('gnrp_user');
  location.reload();
}

function boot(){
  const u=JSON.parse(localStorage.getItem('gnrp_user')||'null');

  if(!u) return;

  document.getElementById('login').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  document.getElementById('userInfo').textContent=
    `${u.name} • ${u.grade}`;

  document.getElementById('welcomeName').textContent=u.name;

  updateStats();
}

function updateStats(){
  const d=docs();

  document.getElementById('statDocs').textContent=d.length;

  document.getElementById('statEnq').textContent=
    d.filter(x=>x.type==='enquete').length;

  document.getElementById('statInter').textContent=
    d.filter(x=>x.type==='interpellation').length;
}

function show(id){
  pages.forEach(p=>
    p.classList.toggle('active',p.id===id)
  );

  nav.forEach(n=>
    n.classList.toggle('active',n.dataset.page===id)
  );

  if(id==='dossiers'){
    renderList();
  }

  updateStats();

  scrollTo({
    top:0,
    behavior:'smooth'
  });
}

nav.forEach(n=>{
  n.onclick=()=>show(n.dataset.page);
});

document.querySelectorAll('FormButtons').forEach(el=>{
  el.outerHTML=`
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

document.querySelectorAll('form').forEach(form=>{
  form.addEventListener('submit',e=>{
    e.preventDefault();

    const data=Object.fromEntries(
      new FormData(form).entries()
    );

    data.type=form.dataset.type;
    data.id=crypto.randomUUID();
    data.created=new Date().toLocaleString('fr-FR');

    const u=JSON.parse(
      localStorage.getItem('gnrp_user')||'{}'
    );

    data.auteur=u.name||'Inconnu';

    const all=docs();

    all.unshift(data);

    localStorage.setItem(
      'gnrp_docs',
      JSON.stringify(all)
    );

    updateStats();

    alert(
      'Document RP enregistré dans ce navigateur.'
    );

    form.reset();
  });
});

function label(t){
  return({
    intervention:'Rapport d’intervention',
    interpellation:'Interpellation RP',
    enquete:'Ouverture d’enquête',
    audition:'Audition fictive',
    controle:'Contrôle routier',
    pv:'Procès-verbal RP'
  })[t]||t;
}

function esc(s){
  return String(s??'').replace(
    /[&<>"']/g,
    c=>({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#039;'
    })[c]
  );
}

function renderList(){
  const box=document.getElementById('list');

  const q=(
    document.getElementById('search')?.value||''
  ).toLowerCase();

  const all=docs();

  const filtered=all.filter(d=>
    JSON.stringify(d)
      .toLowerCase()
      .includes(q)
  );

  if(!filtered.length){
    box.innerHTML=
      '<div class="empty">Aucun dossier trouvé.</div>';
    return;
  }

  box.innerHTML=filtered.map(d=>{
    const i=all.findIndex(
      x=>x.id===d.id
    );

    return`
      <div class="doc">

        <div>
          <b>${label(d.type)}</b>
          — ${esc(d.numero||'Sans numéro')}

          <br>

          <small>
            ${esc(d.auteur||'')}
            •
            ${esc(d.created||'')}
          </small>
        </div>

        <div>
          <button onclick="printDoc(${i})">
            🖨️
          </button>

          <button onclick="delDoc(${i})">
            🗑️
          </button>
        </div>

      </div>
    `;
  }).join('');
}

function clearSearch(){
  document.getElementById('search').value='';
  renderList();
}

function delDoc(i){
  const d=docs();

  if(!confirm(
    'Supprimer ce document RP ?'
  )){
    return;
  }

  d.splice(i,1);

  localStorage.setItem(
    'gnrp_docs',
    JSON.stringify(d)
  );

  renderList();
  updateStats();
}

function printDoc(i){
  const d=docs()[i];

  let rows='';

  Object.entries(d).forEach(([k,v])=>{
    if(!['id','type'].includes(k)&&v){
      rows+=`
        <p>
          <b>${esc(k)}</b>
          <br>
          ${esc(v).replace(/\n/g,'<br>')}
        </p>
      `;
    }
  });

  const w=open('','_blank');

  w.document.write(`
    <html>

      <head>

        <title>
          ${label(d.type)}
        </title>

        <style>

          body{
            font-family:Arial;
            max-width:800px;
            margin:40px auto;
            line-height:1.5;
          }

          h1{
            border-bottom:2px solid #102a43;
            padding-bottom:12px;
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
          Document fictif destiné au jeu RP
        </small>

        <script>
          print()
        <\/script>

      </body>

    </html>
  `);

  w.document.close();
}

document.getElementById('themeBtn').onclick=()=>{
  document.body.classList.toggle('dark');
};

boot();
