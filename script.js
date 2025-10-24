/* script.js - Rebix API Dashboard interactions
   Features:
   - Loading screen fade-out
   - Live search filter
   - Modal display for endpoints (with NSFW warning)
   - Copy endpoint & optional submit (GET) button
   - Keyboard accessibility (Esc to close modal, Enter/Space for buttons)
*/

(() => {
  // --- DOM References ---
  const loadingScreen = document.getElementById('loading-screen');
  const mainContent = document.getElementById('main-content');
  const searchInput = document.getElementById('search-input');

  const modal = document.getElementById('apiResponseModal');
  const modalTitle = document.getElementById('apiResponseModalLabel');
  const modalDesc = document.getElementById('apiResponseModalDesc');
  const modalContentPre = document.getElementById('apiResponseContent');
  const modalEndpointP = document.getElementById('apiEndpoint');
  const copyBtn = document.getElementById('copyEndpointBtn');
  const submitQueryBtn = document.getElementById('submitQueryBtn');
  const apiQueryInputContainer = document.getElementById('apiQueryInputContainer');
  const modalCloseBtn = document.querySelector('.modal-close');

  // --- Loading screen fade ---
  function finishLoading() {
    loadingScreen.style.transition = 'opacity 350ms ease';
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      mainContent.style.display = 'block';
    }, 360);
  }
  window.addEventListener('load', () => setTimeout(finishLoading, 600));

  // --- Live Search Filter ---
  function handleSearchFilter() {
    const q = (searchInput.value || '').trim().toLowerCase();
    document.querySelectorAll('tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  }
  searchInput.addEventListener('input', handleSearchFilter);

  // --- Modal Management ---
  function openModal(name, desc, endpoint, isNsfw=false) {
    if (isNsfw && !confirm("Cet endpoint est marqué NSFW. Voulez-vous continuer ?")) return;

    modal.setAttribute('aria-hidden','false');
    modalTitle.textContent = name || 'API Response';
    modalDesc.textContent = desc || '';
    modalEndpointP.textContent = endpoint || '';
    modalContentPre.classList.add('d-none');
    copyBtn.classList.remove('d-none');
    submitQueryBtn.classList.remove('d-none');
    apiQueryInputContainer.innerHTML = '';

    // Show input fields if endpoint has query parameters
    try {
      const url = new URL(endpoint, window.location.origin);
      const params = Array.from(url.searchParams.entries());
      if (params.length) {
        const fragment = document.createElement('div');
        fragment.style.display = 'flex';
        fragment.style.gap = '8px';
        fragment.style.flexWrap = 'wrap';
        params.forEach(([k,v]) => {
          const label = document.createElement('label');
          label.style.fontSize = '12px';
          label.style.color = 'var(--muted)';
          label.textContent = k;

          const input = document.createElement('input');
          input.value = v;
          input.dataset.key = k;
          Object.assign(input.style, {
            padding: '6px 8px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.04)',
            background: 'transparent',
            color: 'inherit',
            minWidth: '120px'
          });

          const wrapper = document.createElement('div');
          wrapper.style.display = 'flex';
          wrapper.style.flexDirection = 'column';
          wrapper.append(label, input);
          fragment.appendChild(wrapper);
        });
        apiQueryInputContainer.appendChild(fragment);
      }
    } catch(e){}

    modalCloseBtn.focus();
  }

  function closeModal() {
    modal.setAttribute('aria-hidden','true');
    modalContentPre.textContent = '';
    modalContentPre.classList.add('d-none');
  }

  // --- Icon button events ---
  document.querySelectorAll('.icon-btn').forEach(btn => {
    btn.setAttribute('tabindex','0');
    btn.addEventListener('click', () => {
      const path = btn.dataset.apiPath || btn.getAttribute('data-api-path');
      const endpoint = path && path.startsWith('/') ? window.location.origin + path : path;
      openModal(
        btn.dataset.apiName || btn.getAttribute('data-api-name') || 'API',
        btn.dataset.apiDesc || btn.getAttribute('data-api-desc') || '',
        endpoint,
        btn.dataset.nsfw === "true" || btn.getAttribute('data-nsfw') === 'true'
      );
    });
    btn.addEventListener('keydown', e => {
      if (['Enter',' '].includes(e.key)) { e.preventDefault(); btn.click(); }
    });
  });

  // --- Copy Endpoint ---
  copyBtn.addEventListener('click', async () => {
    const text = modalEndpointP.textContent || '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy API', 1500);
    } catch {
      copyBtn.textContent = 'Failed to copy';
      setTimeout(() => copyBtn.textContent = 'Copy API', 1500);
    }
  });

  // --- Submit GET Request ---
  submitQueryBtn.addEventListener('click', async () => {
    let endpoint = modalEndpointP.textContent || '';
    if (!endpoint) return;

    // Update with query inputs
    const inputs = apiQueryInputContainer.querySelectorAll('input[data-key]');
    if (inputs.length) {
      try {
        const u = new URL(endpoint);
        inputs.forEach(i => u.searchParams.set(i.dataset.key, i.value || ''));
        endpoint = u.toString();
      } catch {}
    }

    modalContentPre.classList.remove('d-none');
    modalContentPre.textContent = 'Loading...';
    try {
      const res = await fetch(endpoint, { method: 'GET' });
      const contentType = res.headers.get('content-type') || '';
      let body = contentType.includes('application/json') ? await res.json() : await res.text();
      modalContentPre.textContent = typeof body === 'object' ? JSON.stringify(body, null, 2) : body;
    } catch (err) {
      modalContentPre.textContent = `Error: ${err.message || err}`;
    }
  });

  // --- Close modal events ---
  modalCloseBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', ev => { if (ev.target === modal) closeModal(); });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape') closeModal(); });

  // --- Disable right-click on modal content ---
  document.querySelectorAll('.modal-content').forEach(m => m.addEventListener('contextmenu', e => e.preventDefault()));

  // --- Graceful fallback ---
  if (!window.fetch) {
    submitQueryBtn.disabled = true;
    submitQueryBtn.title = "Fetch API not supported in this browser.";
  }

  console.log("%cRebix API Dashboard ready", "color: #7c5cff; font-weight:700");
})();
