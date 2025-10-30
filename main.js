  /* -------------------------
       CONFIG - Cambia estas variables
       ------------------------- */
    const GITHUB_USERNAME = 'pikatostes'; // <- reemplázalo con tu usuario de GitHub
    const MAX_REPOS = 9; // cuantos repos quieres mostrar
    const SHOW_FORKS = false; // mostrar forks?

    // Datos personales (personaliza)
    const PERSONAL = {
      name: 'Alejandro Ríos', // tu nombre
      resumeUrl: '#', // pon la url a tu CV o deja vacío
    };

    // -------------------------
    // NO TOCAR MÁS ABAJO
    // -------------------------

    document.getElementById('name').textContent = PERSONAL.name;
    document.getElementById('download-resume').href = PERSONAL.resumeUrl || '#';
    document.getElementById('avatar').textContent = PERSONAL.name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();
    document.getElementById('github-link').textContent = `github.com/${GITHUB_USERNAME}`;

    const projectsEl = document.getElementById('projects');
    const repoCountEl = document.getElementById('repo-count');
    const searchEl = document.getElementById('search');

    async function fetchRepos(username){
      try{
        const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
        if(!res.ok) throw new Error('No se pudo obtener repos. Revisa el nombre de usuario o la API rate limit');
        const repos = await res.json();
        return repos.filter(r => SHOW_FORKS ? true : !r.fork).slice(0, MAX_REPOS);
      }catch(e){
        console.error(e);
        projectsEl.innerHTML = `<div style="grid-column:1/-1;padding:18px;background:rgba(255,255,255,0.02);border-radius:12px">Error cargando repos: ${e.message}</div>`;
        return [];
      }
    }

    function renderRepos(repos){
      repoCountEl.textContent = `${repos.length} repos`;
      if(repos.length===0){projectsEl.innerHTML = `<div style="grid-column:1/-1;padding:18px;color:var(--muted)">No hay repos para mostrar. Asegúrate de haber configurado <code>GITHUB_USERNAME</code>.</div>`;return}

      projectsEl.innerHTML = '';
      repos.forEach(r=>{
        const el = document.createElement('article');
        el.className = 'project';
        el.innerHTML = `
          <div>
            <h3>${escapeHtml(r.name)}</h3>
            <p style="margin:6px 0 0 0;color:var(--muted);font-size:13px">${escapeHtml(r.description || '')}</p>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div class="meta">
              <span>${r.language || ''}</span>
              <span>★ ${r.stargazers_count}</span>
              <span>${new Date(r.updated_at).toLocaleDateString()}</span>
            </div>
            <div class="actions">
              <a class="btn" href="${r.html_url}" target="_blank" rel="noopener"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a>
              ${r.homepage ? `<a class="btn" href="${r.homepage}" target="_blank" rel="noopener">Demo</a>` : ''}
            </div>
          </div>
        `;
        projectsEl.appendChild(el);
      })
    }

    function escapeHtml(str){
      return String(str).replace(/[&<>\"']/g, (c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" })[c]);
    }

    function filterAndRender(allRepos){
      const q = searchEl.value.trim().toLowerCase();
      const filtered = allRepos.filter(r => r.name.toLowerCase().includes(q) || (r.language||'').toLowerCase().includes(q) || (r.description||'').toLowerCase().includes(q));
      renderRepos(filtered);
    }

    (async ()=>{
      const repos = await fetchRepos(GITHUB_USERNAME);
      // map and keep useful fields
      const mapped = repos.map(r=>({
        name: r.name,
        description: r.description,
        html_url: r.html_url,
        homepage: r.homepage,
        language: r.language,
        stargazers_count: r.stargazers_count,
        updated_at: r.updated_at,
        fork: r.fork
      }));

      renderRepos(mapped);
      searchEl.addEventListener('input', ()=>filterAndRender(mapped));

    })();


    // pequeño fallback para clicks en CV
    document.getElementById('download-resume').addEventListener('click', (e)=>{
      if(!PERSONAL.resumeUrl){
        e.preventDefault();
        alert('Añade la URL de tu CV en la variable PERSONAL.resumeUrl del script.');
      }
    })

  