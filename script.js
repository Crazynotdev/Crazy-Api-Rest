/* script.js - interactions for Rebix API dashboard
   Features:
   - hide loading screen and reveal main content
   - search filter (live)
   - open modal on icon-btn click, show endpoint + description
   - copy endpoint button
   - optional "Submit" button to run a sample GET (fetch) and show result
   - NSFW endpoints show a warning prompt before open
   - keyboard accessibility (Esc to close modal)
*/

(() => {
  // DOM refs
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

  // helper: fade out loading then show main
  function finishLoading() {
    loadingScreen.style.transition = 'opacity 350ms ease';
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      mainContent.style.display = 'block';
    }, 360);
  }

  // simulate loading assets / endpoints
  window.addEventListener('load', () => {
    // small delay so spinner visible
    setTimeout(finishLoading, 600);
  });

  // SEARCH: filters table rows by route name / description
  function handleSearchFilter() {
    const q = (searchInput.value || '').trim().toLowerCase();
    // find all tbody rows
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(r => {
      const text = (r.textContent || '').toLowerCase();
      // if matches show, otherwise hide
      r.style.display = text.includes(q) ? '' : 'none';
    });
  }
  searchInput.addEventListener('input', handleSearchFilter);

  // MODAL MANAGEMENT
  function openModal(name, desc, endpoint, isNsfw=false) {
    // NSFW check
    if (isNsfw) {
      const ok = confirm("Cet endpoint est marqué NSFW. Voulez-vous continuer ?");
      if (!ok) return;
    }

    modal.setAttribute('aria-hidden','false');
    modalTitle.textContent = name || 'API Response';
    modalDesc.textContent = desc || '';
    modalEndpointP.textContent = endpoint || '';
    modalContentPre.classList.add('d-none');
    copyBtn.classList.remove('d-none');
    submitQueryBtn.classList.remove('d-none');
    apiQueryInputContainer.innerHTML = ''; // clear

    // If endpoint has query parameters, show a small input to allow editing before submit
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
          input.style.padding = '6px 8px';
          input.style.borderRadius = '8px';
          input.style.border = '1px solid rgba(255,255,255,0.04)';
          input.style.background = 'transparent';
          input.style.color = 'inherit';
          input.style.minWidth = '120px';

          const wrapper = document.createElement('div');
          wrapper.style.display = 'flex';
          wrapper.style.flexDirection = 'column';
          wrapper.appendChild(label);
          wrapper.appendChild(input);
          fragment.appendChild(wrapper);
        });

        apiQueryInputContainer.appendChild(fragment);
      }
    } catch(e) {
      // ignore malformed urls
    }

    // focus close for keyboard users
    modalCloseBtn.focus();
  }

  function closeModal() {
    modal.setAttribute('aria-hidden','true');
    modalContentPre.textContent = '';
    modalContentPre.classList.add('d-none');
  }

  // Wire icon buttons in tables
  document.querySelectorAll('.icon-btn').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const el = ev.currentTarget;
      const path = el.dataset.apiPath || el.getAttribute('data-api-path');
      const name = el.dataset.apiName || el.getAttribute('data-api-name') || 'API';
      const desc = el.dataset.apiDesc || el.getAttribute('data-api-desc') || '';
      const isNsfw = el.dataset.nsfw === "true" || el.getAttribute('data-nsfw') === 'true';

      // Prepend origin if path seems relative
      const endpoint = path && path.startsWith('/') ? (window.location.origin + path) : path;

      openModal(name, desc, endpoint, isNsfw);
    });
  });

  // Copy endpoint to clipboard
  copyBtn.addEventListener('click', async () => {
    const text = modalEndpointP.textContent || '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied!';
      setTimeout(()=> copyBtn.textContent = 'Copy API', 1500);
    } catch (err) {
      copyBtn.textContent = 'Failed to copy';
      setTimeout(()=> copyBtn.textContent = 'Copy API', 1500);
    }
  });

  // Submit/try endpoint (GET only)
  submitQueryBtn.addEventListener('click', async () => {
    const rawEndpoint = modalEndpointP.textContent || '';
    if (!rawEndpoint) return;

    // rebuild URL from editable inputs, if present
    let endpoint = rawEndpoint;
    const inputs = apiQueryInputContainer.querySelectorAll('input[data-key]');
    if (inputs.length) {
      try {
        const u = new URL(rawEndpoint);
        inputs.forEach(i => {
          u.searchParams.set(i.dataset.key, i.value || '');
        });
        endpoint = u.toString();
      } catch (e) {
        // keep raw if parsing fails
      }
    }

    modalContentPre.classList.remove('d-none');
    modalContentPre.textContent = 'Loading...';

    try {
      const res = await fetch(endpoint, { method: 'GET' });
      // try to parse JSON, otherwise text
      const contentType = res.headers.get('content-type') || '';
      let body;
      if (contentType.includes('application/json')) body = await res.json();
      else body = await res.text();

      // pretty print
      if (typeof body === 'object') {
        modalContentPre.textContent = JSON.stringify(body, null, 2);
      } else {
        modalContentPre.textContent = body;
      }
    } catch (err) {
      modalContentPre.textContent = `Error: ${err.message || err}`;
    }
  });

  // Close modal via close button and Esc key / click outside
  modalCloseBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (ev) => {
    if (ev.target === modal) closeModal();
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') closeModal();
  });

  // Accessibility: ensure interactive elements have keyboard support
  document.querySelectorAll('.icon-btn').forEach(btn => {
    btn.setAttribute('tabindex','0');
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // Small UX: hide developer-tool protector if user accepted to keep devtools (already in HTML)
  // Add small protection: disable right-click on modal content (prevent quick inspect)
  document.querySelectorAll('.modal-content').forEach(m => {
    m.addEventListener('contextmenu', e => e.preventDefault());
  });

  // Graceful degradation: if fetch is blocked, inform user
  if (!window.fetch) {
    submitQueryBtn.disabled = true;
    submitQueryBtn.title = "Fetch API not supported in this browser.";
  }

  // Optional: show small friendly console log
  console.log("%cRebix API Dashboard ready", "color: #7c5cff; font-weight:700");

})();
