// ============================================================
// BI Command Center — App Logic
// ============================================================

// ── Auth0 Configuration ───────────────────────────────────
const AUTH0_DOMAIN    = 'YOUR_AUTH0_DOMAIN';    // e.g. dev-xxxx.us.auth0.com
const AUTH0_CLIENT_ID = 'YOUR_AUTH0_CLIENT_ID';

(function () {
  'use strict';

  // ── Auth0 State ───────────────────────────────────────────
  let auth0Client = null;

  async function initAuth0() {
    // Warn if Auth0 credentials have not been configured
    if (AUTH0_DOMAIN === 'YOUR_AUTH0_DOMAIN' || AUTH0_CLIENT_ID === 'YOUR_AUTH0_CLIENT_ID') {
      console.error('Auth0 is not configured. Please replace AUTH0_DOMAIN and AUTH0_CLIENT_ID in app.js with your Auth0 credentials.');
      return;
    }

    try {
      auth0Client = await auth0.createAuth0Client({
        domain:   AUTH0_DOMAIN,
        clientId: AUTH0_CLIENT_ID,
        authorizationParams: {
          redirect_uri: window.location.origin + window.location.pathname,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Auth0 client:', err);
      return;
    }

    // Handle redirect callback after login
    if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
      try {
        await auth0Client.handleRedirectCallback();
        // Clean up URL query params after callback
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error('Auth0 redirect callback failed:', err);
        // Remove the broken query string so the user can try again
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
    }

    const isAuthenticated = await auth0Client.isAuthenticated();
    if (isAuthenticated) {
      await showDashboard();
    }
    // Login screen remains visible if not authenticated
  }

  async function showDashboard() {
    // Hide login screen
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) loginScreen.style.display = 'none';

    // Show dashboard elements
    document.querySelector('header.topnav').style.display = '';
    document.getElementById('sidenav').style.display = '';
    document.querySelector('main.main-content').style.display = '';

    // Display logged-in user info
    const user = await auth0Client.getUser();
    if (user) {
      const nameEl = document.getElementById('topnav-user-name');
      const userEl = document.getElementById('topnav-user');
      if (nameEl) nameEl.textContent = user.name || user.email || '';
      if (userEl) userEl.style.display = '';
    }

    buildSidenav();
    navigate(currentSection);
  }

  // ── SVG Icon Library ──────────────────────────────────────
  const ICONS = {
    home:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>`,
    layers:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    cube:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    git:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 012 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>`,
    clock:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    chart:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
    star:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    trend:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
    external:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    doc:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    check:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    x:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    dollar:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`,
    bolt:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    logo:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="7" y1="8" x2="7" y2="13"/><line x1="12" y1="6" x2="12" y2="13"/><line x1="17" y1="10" x2="17" y2="13"/></svg>`,
  };

  function icon(name, cls = '') {
    return `<span class="sidenav__icon ${cls}">${ICONS[name] || ''}</span>`;
  }

  // ── Helpers ───────────────────────────────────────────────
  function progressBar(pct, modifier = '', label = '') {
    const clamped = Math.min(100, Math.max(0, pct));
    return `
      <div class="progress-bar ${modifier}">
        <div class="progress-bar__fill" style="width:${clamped}%" data-target="${clamped}"></div>
      </div>
      ${label ? `<div style="font-size:11px;color:var(--color-text-sub);margin-top:4px;">${label}</div>` : ''}
    `;
  }

  function chip(text, type = 'blue') {
    return `<span class="chip chip--${type}"><span class="chip__dot"></span>${text}</span>`;
  }

  // Return icon SVG sized to w×h (and optionally with extra attributes injected)
  function iconSized(name, size, extraAttrs = '') {
    if (!ICONS[name]) return '';
    const attrs = `width="${size}" height="${size}" ${extraAttrs}`.trim();
    return ICONS[name].replace('<svg ', `<svg ${attrs} `);
  }

  function statusChip(status) {
    if (status === 'on_track') return chip('On Track', 'green');
    if (status === 'at_risk')  return chip('At Risk', 'yellow');
    if (status === 'blocked')  return chip('Blocked', 'red');
    return chip('Unknown', 'grey');
  }

  function levelChip(level) {
    const map = { 'Beginner': 'grey', 'Intermediate': 'blue', 'Advanced': 'blue', 'Expert': 'dark' };
    return chip(level, map[level] || 'grey');
  }

  function radialGauge(pct, size = 120, label = 'Score') {
    const r = (size / 2) - 10;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return `
      <div class="radial-gauge" style="width:${size}px;height:${size}px;">
        <svg class="radial-gauge__svg" width="${size}" height="${size}">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stop-color="var(--color-blue-mid)"/>
              <stop offset="100%" stop-color="var(--color-blue-light)"/>
            </linearGradient>
          </defs>
          <circle class="radial-gauge__track" cx="${size/2}" cy="${size/2}" r="${r}"/>
          <circle class="radial-gauge__fill"
            cx="${size/2}" cy="${size/2}" r="${r}"
            stroke-dasharray="${circ}"
            stroke-dashoffset="${offset}"
            style="stroke-dashoffset:${circ};"
            data-target="${offset}"
            data-circ="${circ}"/>
        </svg>
        <div class="radial-gauge__label">
          <span class="radial-gauge__value">${pct}</span>
          <span class="radial-gauge__sub">${label}</span>
        </div>
      </div>
    `;
  }

  // ── Section: Overview ─────────────────────────────────────
  function renderOverview() {
    const d = DATA.overview;
    const metricsHtml = d.metrics.map(m => `
      <div class="metric-tile">
        <div class="metric-tile__icon">${iconSized(m.icon, 18)}</div>
        <div class="metric-tile__value">${m.value}<span style="font-size:18px;font-weight:400;letter-spacing:0;">${m.unit}</span></div>
        <div class="metric-tile__label">${m.label}</div>
        <div class="metric-tile__delta">${m.delta}</div>
      </div>
    `).join('');

    return `
      <div class="section-header">
        <div class="section-header__eyebrow">Overview</div>
        <div class="section-header__title">Command Center</div>
        <div class="section-header__subtitle">Your real-time journey to becoming a top 0.1% Director of BI – Expense Technology.</div>
      </div>

      <!-- Hero Card -->
      <div class="card card--hero mb-24">
        <div class="kpi-hero">
          <div class="kpi-hero__main">
            ${radialGauge(d.overallScore, 140, 'Top 0.1%')}
          </div>
          <div style="flex:3;min-width:220px;">
            <div style="font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-bottom:8px;">North Star Progress</div>
            <div class="kpi-hero__number">${d.overallScore}<span style="font-size:32px;font-weight:300;">/100</span></div>
            <div class="kpi-hero__label">Overall Progress to Top 0.1%</div>
            <div class="kpi-hero__desc">Delivering best-in-class self-service analytics with Power BI, enterprise-grade star schema data models, and GitHub-based engineering practices across 5 Expense Technology domains.</div>
          </div>
        </div>
      </div>

      <!-- Metric Tiles -->
      <div class="grid-4 mb-24">
        ${metricsHtml}
      </div>

      <!-- Progress Gauges -->
      <div class="grid-2">
        <div class="card">
          <div style="font-size:13px;font-weight:600;color:var(--color-blue-deep);margin-bottom:16px;">Architecture Execution Progress</div>
          <div style="margin-bottom:8px;font-size:12px;color:var(--color-text-sub);display:flex;justify-content:space-between;">
            <span>Star schema + Semantic model rollout</span>
            <span style="font-weight:500;color:var(--color-blue-mid);">${d.architectureProgress}%</span>
          </div>
          ${progressBar(d.architectureProgress, 'progress-bar--thick')}
          <div style="margin-top:20px;margin-bottom:8px;font-size:12px;color:var(--color-text-sub);display:flex;justify-content:space-between;">
            <span>GitHub / CI-CD Integration</span>
            <span style="font-weight:500;color:var(--color-blue-mid);">20%</span>
          </div>
          ${progressBar(20, 'progress-bar--thick')}
        </div>
        <div class="card">
          <div style="font-size:13px;font-weight:600;color:var(--color-blue-deep);margin-bottom:16px;">Self-Service Adoption Progress</div>
          <div style="margin-bottom:8px;font-size:12px;color:var(--color-text-sub);display:flex;justify-content:space-between;">
            <span>Finance partners using self-service</span>
            <span style="font-weight:500;color:var(--color-blue-mid);">${d.adoptionProgress}%</span>
          </div>
          ${progressBar(d.adoptionProgress, 'progress-bar--thick')}
          <div style="margin-top:20px;margin-bottom:8px;font-size:12px;color:var(--color-text-sub);display:flex;justify-content:space-between;">
            <span>Business value realized</span>
            <span style="font-weight:500;color:var(--color-blue-mid);">22%</span>
          </div>
          ${progressBar(22, 'progress-bar--thick')}
        </div>
      </div>
    `;
  }

  // ── Section: Domain Maturity ──────────────────────────────
  let domainView = 'architecture';

  function renderDomains() {
    const domains = DATA.domains;

    const archCards = domains.map(d => {
      const barColor = d.score >= 70 ? '' : d.score >= 40 ? '' : 'progress-bar--warning';
      return `
        <div class="domain-card">
          <div class="domain-card__stripe" style="background:${d.color};"></div>
          <div class="domain-card__header">
            <div>
              <div class="domain-card__name">${d.name}</div>
              <div class="domain-card__phase">${d.phase}</div>
            </div>
            <div style="text-align:right;">
              <div class="domain-card__score">${d.score}</div>
              <div style="font-size:10px;color:var(--color-text-sub);">/ 100</div>
            </div>
          </div>
          <div class="domain-card__progress">
            ${progressBar(d.score, `progress-bar--thick ${barColor}`)}
          </div>
          <div style="padding-left:14px;margin-bottom:14px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <div style="font-size:11px;color:var(--color-text-sub);margin-bottom:4px;">Star Schema</div>
                ${progressBar(d.starSchema)}
                <div style="font-size:10px;color:var(--color-text-sub);margin-top:2px;">${d.starSchema}%</div>
              </div>
              <div>
                <div style="font-size:11px;color:var(--color-text-sub);margin-bottom:4px;">Semantic Model</div>
                ${progressBar(d.semanticModel)}
                <div style="font-size:10px;color:var(--color-text-sub);margin-top:2px;">${d.semanticModel}%</div>
              </div>
              <div>
                <div style="font-size:11px;color:var(--color-text-sub);margin-bottom:4px;">GitHub Ready</div>
                ${progressBar(d.githubReady)}
                <div style="font-size:10px;color:var(--color-text-sub);margin-top:2px;">${d.githubReady}%</div>
              </div>
              <div>
                <div style="font-size:11px;color:var(--color-text-sub);margin-bottom:4px;">Business Value</div>
                ${progressBar(d.businessValue)}
                <div style="font-size:10px;color:var(--color-text-sub);margin-top:2px;">${d.businessValue}%</div>
              </div>
            </div>
          </div>
          <div class="domain-card__footer">
            <div class="domain-card__note">${d.note}</div>
            ${statusChip(d.status)}
          </div>
        </div>
      `;
    }).join('');

    const adoptionCards = domains.map(d => `
      <div class="domain-card">
        <div class="domain-card__stripe" style="background:${d.color};"></div>
        <div class="domain-card__header">
          <div>
            <div class="domain-card__name">${d.name}</div>
            <div class="domain-card__phase">Self-Service Adoption</div>
          </div>
          <div style="text-align:right;">
            <div class="domain-card__score">${d.adoption}</div>
            <div style="font-size:10px;color:var(--color-text-sub);">/ 100</div>
          </div>
        </div>
        <div class="domain-card__progress">
          ${progressBar(d.adoption, 'progress-bar--thick')}
        </div>
        <div style="padding-left:14px;margin-bottom:14px;">
          <div style="font-size:12px;color:var(--color-text-sub);margin-bottom:8px;">Finance partners actively using self-service reports</div>
          <div style="display:flex;gap:24px;">
            <div>
              <div style="font-size:20px;font-weight:300;color:var(--color-blue-deep);">${d.adoption > 0 ? Math.round(d.adoption / 10) : 0}</div>
              <div style="font-size:11px;color:var(--color-text-sub);">Active users</div>
            </div>
            <div>
              <div style="font-size:20px;font-weight:300;color:var(--color-blue-deep);">${d.businessValue}</div>
              <div style="font-size:11px;color:var(--color-text-sub);">Value score</div>
            </div>
          </div>
        </div>
        <div class="domain-card__footer">
          <div class="domain-card__note">${d.note}</div>
          ${statusChip(d.status)}
        </div>
      </div>
    `).join('');

    return `
      <div class="section-header">
        <div class="section-header__eyebrow">Domain Maturity</div>
        <div class="section-header__title">5-Domain Architecture Plan</div>
        <div class="section-header__subtitle">Track star schema design, semantic model build, and adoption across all expense domains.</div>
      </div>

      <div style="margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div class="tabs">
          <button class="tab-item ${domainView === 'architecture' ? 'active' : ''}" onclick="App.setDomainView('architecture')">Architecture View</button>
          <button class="tab-item ${domainView === 'adoption' ? 'active' : ''}" onclick="App.setDomainView('adoption')">Adoption View</button>
        </div>
        <div style="font-size:12px;color:var(--color-text-sub);">5 domains · Last updated Feb 2026</div>
      </div>

      <div class="grid-auto" id="domainCards">
        ${domainView === 'architecture' ? archCards : adoptionCards}
      </div>
    `;
  }

  // ── Section: Power BI Models ──────────────────────────────
  function renderModels() {
    const cards = DATA.models.map(m => `
      <div class="model-card">
        <div class="model-card__title">${m.title}</div>
        <div class="model-card__domain">${m.domain} · ${m.version}</div>
        <div class="model-card__indicators">
          <div class="model-card__indicator">
            <span class="model-card__indicator-label">In GitHub</span>
            ${m.inGithub ? chip('Yes ✓', 'green') : chip('No', 'grey')}
          </div>
          <div class="model-card__indicator">
            <span class="model-card__indicator-label">Documentation</span>
            <span style="font-size:12px;font-weight:500;color:var(--color-blue-mid);">${m.docPct}%</span>
          </div>
          <div style="padding:4px 0 2px;">
            ${progressBar(m.docPct)}
          </div>
          <div class="model-card__indicator">
            <span class="model-card__indicator-label">Validation</span>
            ${chip(m.validationStatus, m.validationChip)}
          </div>
          <div class="model-card__indicator">
            <span class="model-card__indicator-label">Deploy Status</span>
            ${chip(m.deployStatus, m.deployChip)}
          </div>
        </div>
        <div class="model-card__actions">
          <button class="btn btn--secondary btn--sm">${iconSized('external', 13)} View Details</button>
          <button class="btn btn--secondary btn--sm">${iconSized('doc', 13)} Documentation</button>
        </div>
      </div>
    `).join('');

    const inGithub = DATA.models.filter(m => m.inGithub).length;
    const avgDoc   = Math.round(DATA.models.reduce((s, m) => s + m.docPct, 0) / DATA.models.length);

    return `
      <div class="section-header">
        <div class="section-header__eyebrow">Power BI Semantic Models</div>
        <div class="section-header__title">Model Health Tracker</div>
        <div class="section-header__subtitle">Monitor the build, documentation, and deployment status of all Power BI semantic models.</div>
      </div>

      <div class="grid-3 mb-24">
        <div class="metric-tile">
          <div class="metric-tile__icon">${iconSized('cube', 18)}</div>
          <div class="metric-tile__value">${DATA.models.length}</div>
          <div class="metric-tile__label">Total Semantic Models</div>
        </div>
        <div class="metric-tile">
          <div class="metric-tile__icon">${iconSized('git', 18)}</div>
          <div class="metric-tile__value">${inGithub}</div>
          <div class="metric-tile__label">Models in GitHub</div>
          <div class="metric-tile__delta">${Math.round(inGithub/DATA.models.length*100)}% of total</div>
        </div>
        <div class="metric-tile">
          <div class="metric-tile__icon">${iconSized('doc', 18)}</div>
          <div class="metric-tile__value">${avgDoc}<span style="font-size:16px;font-weight:400;">%</span></div>
          <div class="metric-tile__label">Avg Documentation Coverage</div>
        </div>
      </div>

      <div class="grid-auto">
        ${cards}
      </div>
    `;
  }

  // ── Section: GitHub / CI-CD ───────────────────────────────
  function renderGithub() {
    const g = DATA.github;
    const maxActivity = Math.max(...g.activity);
    const activityBars = g.activity.map(v => {
      const h = Math.round((v / maxActivity) * 100);
      const hi = v > maxActivity * 0.7 ? 'activity-bar--high' : '';
      return `<div class="activity-bar ${hi}" style="height:${h}%;" title="${v} commits"></div>`;
    }).join('');

    const pipelineRows = g.pipelines.map(p => `
      <div class="card card--accent" style="padding:16px 20px;">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div>
            <div style="font-family:'SFMono-Regular','Fira Mono',monospace;font-size:13px;font-weight:500;color:var(--color-text);">${p.name}</div>
            <div style="font-size:12px;color:var(--color-text-sub);margin-top:3px;">Tests: ${p.tests} · Deploy: ${p.deploy}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            ${chip(p.status, p.chip)}
          </div>
        </div>
      </div>
    `).join('');

    const checklistHtml = g.ciChecklist.map(c => `
      <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(217,217,217,0.25);">
        <span style="width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;background:${c.done ? 'rgba(34,197,94,0.12)' : 'var(--color-grey-100)'};">
          ${c.done
            ? iconSized('check', 12, 'style="color:var(--color-success)"')
            : iconSized('x', 12, 'style="color:var(--color-grey-400)"')}
        </span>
        <span style="font-size:13px;color:${c.done ? 'var(--color-text)' : 'var(--color-text-sub)'};">${c.label}</span>
      </div>
    `).join('');

    return `
      <div class="section-header">
        <div class="section-header__eyebrow">GitHub / CI-CD</div>
        <div class="section-header__title">BI as Software</div>
        <div class="section-header__subtitle">Treat every Power BI model like production-grade software: versioned, tested, and deployed through GitHub.</div>
      </div>

      <div class="grid-4 mb-24">
        <div class="metric-tile">
          <div class="metric-tile__icon">${iconSized('git', 18)}</div>
          <div class="metric-tile__value">${g.repoCount}</div>
          <div class="metric-tile__label">BI Repositories</div>
        </div>
        <div class="metric-tile">
          <div class="metric-tile__icon">${iconSized('bolt', 18)}</div>
          <div class="metric-tile__value">${g.recentCommits}</div>
          <div class="metric-tile__label">Recent Commits</div>
          <div class="metric-tile__delta">Last 30 days</div>
        </div>
        <div class="metric-tile">
          <div class="metric-tile__icon">${iconSized('layers', 18)}</div>
          <div class="metric-tile__value">${g.pipelines.length}</div>
          <div class="metric-tile__label">Active Pipelines</div>
        </div>
        <div class="metric-tile">
          <div class="metric-tile__icon">${iconSized('trend', 18)}</div>
          <div class="metric-tile__value">${g.openPRs}</div>
          <div class="metric-tile__label">Open Pull Requests</div>
        </div>
      </div>

      <div class="grid-2 mb-24">
        <div class="card">
          <div style="font-size:13px;font-weight:600;color:var(--color-blue-deep);margin-bottom:4px;">Engineering Activity</div>
          <div style="font-size:12px;color:var(--color-text-sub);margin-bottom:16px;">Commits over last 27 days</div>
          <div class="activity-bars">
            ${activityBars}
          </div>
        </div>
        <div class="card">
          <div style="font-size:13px;font-weight:600;color:var(--color-blue-deep);margin-bottom:16px;">CI/CD Readiness Checklist</div>
          ${checklistHtml}
          <div style="margin-top:14px;display:flex;gap:8px;">
            <button class="btn btn--secondary btn--sm">Review Full Checklist</button>
          </div>
        </div>
      </div>

      <div style="font-size:13px;font-weight:600;color:var(--color-blue-deep);margin-bottom:16px;">Pipeline Status</div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${pipelineRows}
      </div>

      <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn--primary">${iconSized('external', 15)} View Repos on GitHub</button>
        <button class="btn btn--secondary">Review CI Checklist</button>
      </div>
    `;
  }

  // ── Section: Impact & Value ───────────────────────────────
  function renderImpact() {
    const imp = DATA.impact;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const maxH = Math.max(...imp.monthlyHours, 1);
    const sparkBars = imp.monthlyHours.map((v, i) => {
      const h = Math.round((v / maxH) * 100);
      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
        <div style="width:100%;background:${v > 0 ? 'rgba(44,142,214,0.25)' : 'rgba(217,217,217,0.3)'};border-radius:4px 4px 0 0;height:${Math.max(h,4)}px;border:1px solid ${v > 0 ? 'rgba(44,142,214,0.3)' : 'transparent'};transition:height 0.6s;"></div>
        <div style="font-size:9px;color:var(--color-grey-400);">${months[i].slice(0,1)}</div>
      </div>`;
    }).join('');

    const timelineHtml = imp.milestones.map(m => `
      <div class="timeline__item ${m.status === 'done' ? 'timeline__item--done' : m.status === 'active' ? 'timeline__item--active' : ''}">
        <div class="timeline__dot"></div>
        <div class="timeline__date">${m.date}</div>
        <div class="timeline__title">${m.title}</div>
        <div class="timeline__desc">${m.desc}</div>
      </div>
    `).join('');

    return `
      <div class="section-header">
        <div class="section-header__eyebrow">Impact & Value</div>
        <div class="section-header__title">Business Impact Dashboard</div>
        <div class="section-header__subtitle">Quantifying the value delivered by the BI Command Center architecture.</div>
      </div>

      <div class="grid-3 mb-24">
        <div class="card card--hero" style="padding:28px;">
          <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.65);margin-bottom:12px;">Hours Saved Monthly</div>
          <div style="font-size:52px;font-weight:200;letter-spacing:-2px;color:white;line-height:1;">${imp.hoursSaved}<span style="font-size:22px;font-weight:300;"> hrs</span></div>
          <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:8px;">Manual report work eliminated</div>
        </div>
        <div class="metric-tile" style="justify-content:center;">
          <div class="metric-tile__icon">${iconSized('trend', 18)}</div>
          <div class="metric-tile__value">${imp.forecastStepsReduced}</div>
          <div class="metric-tile__label">Forecasting Steps Reduced</div>
          <div class="metric-tile__delta">Automation in Consulting model</div>
        </div>
        <div class="metric-tile" style="justify-content:center;">
          <div class="metric-tile__icon">${iconSized('dollar', 18)}</div>
          <div class="metric-tile__value">$${(imp.vendorCostAvoided / 1000).toFixed(0)}k</div>
          <div class="metric-tile__label">Vendor Cost Avoided (est.)</div>
          <div class="metric-tile__delta">Annualized projection</div>
        </div>
      </div>

      <div class="grid-2 mb-24">
        <div class="card">
          <div style="font-size:13px;font-weight:600;color:var(--color-blue-deep);margin-bottom:4px;">Hours Saved Over Time</div>
          <div style="font-size:12px;color:var(--color-text-sub);margin-bottom:16px;">Monthly hours of manual work eliminated (2025–2026)</div>
          <div style="display:flex;align-items:flex-end;gap:3px;height:80px;">
            ${sparkBars}
          </div>
        </div>
        <div class="card">
          <div style="font-size:13px;font-weight:600;color:var(--color-blue-deep);margin-bottom:4px;">Future Impact Projection</div>
          <div style="font-size:12px;color:var(--color-text-sub);margin-bottom:16px;">Wire in real data to project value at full scale</div>
          <div class="chart-placeholder">
            ${iconSized('chart', 36)}
            <span>Chart placeholder — connect real data</span>
          </div>
        </div>
      </div>

      <div class="section-header">
        <div class="section-header__eyebrow">Milestones</div>
        <div class="section-header__title" style="font-size:20px;">Major Milestones</div>
      </div>
      <div class="card">
        <div class="timeline">
          ${timelineHtml}
        </div>
      </div>
    `;
  }

  // ── Section: Skills & Growth ──────────────────────────────
  function renderSkills() {
    const skillRows = DATA.skills.map(s => {
      const levelColors = { 'Beginner': 'var(--color-grey-400)', 'Intermediate': 'var(--color-blue-mid)', 'Advanced': 'var(--color-blue-deep)', 'Expert': '#4F46E5' };
      return `
        <div class="skill-item">
          <div class="skill-item__name">${s.name}</div>
          <div>
            <div style="position:relative;height:8px;background:var(--color-grey-200);border-radius:999px;overflow:hidden;">
              <div style="position:absolute;top:0;left:0;height:100%;width:${s.targetPct}%;background:rgba(217,217,217,0.4);border-radius:999px;"></div>
              <div style="position:absolute;top:0;left:0;height:100%;width:${s.levelPct}%;background:linear-gradient(90deg,${s.color},${s.color}cc);border-radius:999px;transition:width 0.8s cubic-bezier(0.4,0,0.2,1);"></div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:4px;">
              <span style="font-size:10px;color:var(--color-text-sub);">Current: ${s.levelPct}%</span>
              <span style="font-size:10px;color:var(--color-grey-400);">Target: ${s.targetPct}%</span>
            </div>
          </div>
          <div class="skill-item__level" style="color:${levelColors[s.level] || 'var(--color-text-sub)'};">${s.level}</div>
        </div>
      `;
    }).join('');

    const milestoneHtml = DATA.skillMilestones.map(m => `
      <div class="timeline__item ${m.status === 'done' ? 'timeline__item--done' : m.status === 'active' ? 'timeline__item--active' : ''}">
        <div class="timeline__dot"></div>
        <div class="timeline__date">${m.date}</div>
        <div class="timeline__title">${m.title}</div>
      </div>
    `).join('');

    const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const levelCounts = levels.map(l => ({ level: l, count: DATA.skills.filter(s => s.level === l).length }));
    const levelBars = levelCounts.map(lc => `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
        <div style="width:90px;font-size:11px;color:var(--color-text-sub);">${lc.level}</div>
        <div style="flex:1;height:6px;background:var(--color-grey-200);border-radius:999px;overflow:hidden;">
          <div style="height:100%;width:${Math.round(lc.count/DATA.skills.length*100)}%;background:linear-gradient(90deg,var(--color-blue-mid),var(--color-blue-light));border-radius:999px;"></div>
        </div>
        <div style="width:20px;text-align:right;font-size:11px;color:var(--color-blue-mid);font-weight:500;">${lc.count}</div>
      </div>
    `).join('');

    return `
      <div class="section-header">
        <div class="section-header__eyebrow">Skills & Growth</div>
        <div class="section-header__title">Personal RPG Skill Tree</div>
        <div class="section-header__subtitle">Track your progression toward becoming a top 0.1% Director of BI – Expense Technology.</div>
      </div>

      <div class="grid-2 mb-24">
        <div class="card">
          <div style="font-size:13px;font-weight:600;color:var(--color-blue-deep);margin-bottom:4px;">Skill Distribution</div>
          <div style="font-size:12px;color:var(--color-text-sub);margin-bottom:20px;">${DATA.skills.length} tracked skill areas</div>
          ${levelBars}
          <div class="divider"></div>
          <div style="font-size:12px;color:var(--color-text-sub);">
            <span style="color:var(--color-blue-mid);font-weight:500;">Target:</span> All skills at Advanced or Expert by end of 2027.
          </div>
        </div>
        <div class="card">
          <div style="font-size:13px;font-weight:600;color:var(--color-blue-deep);margin-bottom:16px;">Journey Milestones</div>
          <div class="timeline" style="max-height:280px;overflow-y:auto;">
            ${milestoneHtml}
          </div>
        </div>
      </div>

      <div class="card">
        <div style="font-size:13px;font-weight:600;color:var(--color-blue-deep);margin-bottom:20px;">Skill Progression</div>
        ${skillRows}
      </div>
    `;
  }

  // ── Navigation & Routing ──────────────────────────────────
  const NAV_ITEMS = [
    { id: 'overview',    label: 'Overview',          icon: 'home',   render: renderOverview },
    { id: 'domains',     label: 'Domains',            icon: 'layers', render: renderDomains },
    { id: 'models',      label: 'Power BI Models',   icon: 'cube',   render: renderModels },
    { id: 'github',      label: 'GitHub / CI-CD',    icon: 'git',    render: renderGithub },
    { id: 'impact',      label: 'Impact & Value',     icon: 'trend',  render: renderImpact },
    { id: 'skills',      label: 'Skills & Growth',   icon: 'star',   render: renderSkills },
  ];

  let currentSection = 'overview';

  function navigate(id) {
    currentSection = id;

    // Update nav highlight
    document.querySelectorAll('.sidenav__item').forEach(el => {
      el.classList.toggle('active', el.dataset.section === id);
    });

    // Render section
    const item = NAV_ITEMS.find(n => n.id === id);
    const container = document.getElementById('sectionContent');
    if (item && container) {
      container.innerHTML = item.render();
      animateProgressBars();
      animateGauges();
    }
  }

  function animateProgressBars() {
    requestAnimationFrame(() => {
      document.querySelectorAll('.progress-bar__fill[data-target]').forEach(el => {
        el.style.width = el.dataset.target + '%';
      });
    });
  }

  function animateGauges() {
    requestAnimationFrame(() => {
      document.querySelectorAll('.radial-gauge__fill[data-target]').forEach(el => {
        setTimeout(() => {
          el.style.strokeDashoffset = el.dataset.target;
        }, 100);
      });
    });
  }

  // ── Build Side Nav ────────────────────────────────────────
  function buildSidenav() {
    const nav = document.getElementById('sidenav');
    if (!nav) return;

    const items = NAV_ITEMS.map(n => `
      <button class="sidenav__item ${n.id === currentSection ? 'active' : ''}" data-section="${n.id}" onclick="App.navigate('${n.id}')">
        <span class="sidenav__icon">${ICONS[n.icon] || ''}</span>
        <span>${n.label}</span>
      </button>
    `).join('');

    nav.innerHTML = `
      <div class="sidenav__section-label">Navigation</div>
      ${items}
      <div class="sidenav__spacer"></div>
      <div class="sidenav__footer">BI Command Center v1.0</div>
    `;
  }

  // ── Public API ────────────────────────────────────────────
  window.App = {
    navigate,
    setDomainView(view) {
      domainView = view;
      navigate('domains');
    },
    async login() {
      if (!auth0Client) return;
      try {
        await auth0Client.loginWithRedirect({
          authorizationParams: { connection: 'google-oauth2' },
        });
      } catch (err) {
        console.error('Login failed:', err);
      }
    },
    async logout() {
      if (!auth0Client) return;
      try {
        await auth0Client.logout({
          logoutParams: {
            returnTo: window.location.origin + window.location.pathname,
          },
        });
      } catch (err) {
        console.error('Logout failed:', err);
      }
    },
  };

  // ── Init ──────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initAuth0();
  });

})();
