/* ==========================================================================
   Natali di Puglia — Client Script Ufficiale (natali_puglia.js)
   Stile editoriale e navigazione ispirata a Tutta la Rossani (Puglia Culture)
   ========================================================================== */

(function () {
  'use strict';

  var events = window.NATALI_EVENTI || [];
  var currentProvince = window.INITIAL_PROVINCIA || 'Tutte le province';
  var currentCategory = 'Tutte le categorie';
  var currentPeriod = 'Tutti i giorni';
  var currentGratuito = 'Tutti';
  var searchQuery = '';

  var container = document.getElementById('eventi-container');
  var countPill = document.getElementById('eventi-count');
  var eyeBrow = document.getElementById('vista-occhiello');
  var mainTitle = document.getElementById('vista-titolo');
  var searchInput = document.getElementById('search-input');
  var drawerPanel = document.getElementById('drawer-filtri');
  var mobilePill = document.getElementById('mobile-pill');
  var mobileClose = document.getElementById('mobile-close');

  function init() {
    setupEventListeners();
    applyFilters();
  }

  function setupEventListeners() {
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        searchQuery = e.target.value.trim().toLowerCase();
        applyFilters();
      });
    }

    // Province filter buttons in sidebar and hero
    document.querySelectorAll('[data-filtro-provincia]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var prov = this.getAttribute('data-filtro-provincia');
        // If clicking hero link that points to another page, let normal link work unless on index
        if (this.classList.contains('hero-prov-link')) {
          var href = this.getAttribute('href');
          if (href && href !== '#' && href !== 'index.html' && window.location.pathname.indexOf(href) === -1 && !href.startsWith('#')) {
            return; // allow browser to navigate to dedicated page
          }
        }
        e.preventDefault();
        setProvince(prov);
        var progSec = document.getElementById('programma');
        if (progSec) {
          progSec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Category filter buttons
    document.querySelectorAll('[data-filtro-cat]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentCategory = this.getAttribute('data-filtro-cat');
        updateActiveMenu('[data-filtro-cat]', currentCategory);
        applyFilters();
      });
    });

    // Period / Day buttons
    document.querySelectorAll('[data-filtro-periodo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentPeriod = this.getAttribute('data-filtro-periodo');
        updateActiveMenu('[data-filtro-periodo]', currentPeriod);
        applyFilters();
      });
    });

    // Reset button
    var resetBtn = document.getElementById('btn-reset-filtri');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        currentProvince = 'Tutte le province';
        currentCategory = 'Tutte le categorie';
        currentPeriod = 'Tutti i giorni';
        currentGratuito = 'Tutti';
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        updateActiveMenu('[data-filtro-provincia]', currentProvince);
        updateActiveMenu('[data-filtro-cat]', currentCategory);
        updateActiveMenu('[data-filtro-periodo]', currentPeriod);
        applyFilters();
      });
    }

    // Mobile drawer toggle
    if (mobilePill && drawerPanel) {
      mobilePill.addEventListener('click', function () {
        drawerPanel.classList.add('is-open');
      });
    }
    if (mobileClose && drawerPanel) {
      mobileClose.addEventListener('click', function () {
        drawerPanel.classList.remove('is-open');
      });
    }
  }

  function setProvince(prov) {
    currentProvince = prov;
    updateActiveMenu('[data-filtro-provincia]', currentProvince);
    // Update hero links active state
    document.querySelectorAll('.hero-prov-link').forEach(function (link) {
      var p = link.getAttribute('data-filtro-provincia');
      if (p === currentProvince) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
    applyFilters();
  }

  function updateActiveMenu(selector, activeVal) {
    document.querySelectorAll(selector).forEach(function (b) {
      var val = b.getAttribute(selector.replace(/[\[\]]/g, ''));
      if (val === activeVal) {
        b.classList.add('is-current');
      } else {
        b.classList.remove('is-current');
      }
    });
  }

  function applyFilters() {
    var filtered = events.filter(function (ev) {
      // Province check
      if (currentProvince !== 'Tutte le province' && ev.provincia !== currentProvince) {
        return false;
      }

      // Category check
      if (currentCategory !== 'Tutte le categorie' && ev.categoria !== currentCategory) {
        return false;
      }

      // Period / Date check
      if (currentPeriod !== 'Tutti i giorni') {
        var matchPeriod = checkPeriodMatch(ev, currentPeriod);
        if (!matchPeriod) return false;
      }

      // Search query
      if (searchQuery) {
        var haystack = [
          ev.titolo,
          ev.comune,
          ev.luogo,
          ev.quartiere,
          ev.descrizione,
          ev.note,
          ev.provincia,
          ev.categoria
        ].join(' ').toLowerCase();

        if (haystack.indexOf(searchQuery) === -1) {
          return false;
        }
      }

      return true;
    });

    // Update Eyebrow and Title
    if (eyeBrow) {
      eyeBrow.textContent = currentProvince === 'Tutte le province' ? 'Tutta la Puglia' : 'Provincia di ' + currentProvince;
    }
    if (mainTitle) {
      if (currentCategory !== 'Tutte le categorie') {
        mainTitle.textContent = currentCategory;
      } else if (currentPeriod !== 'Tutti i giorni') {
        mainTitle.textContent = getPeriodLabel(currentPeriod);
      } else {
        mainTitle.textContent = currentProvince === 'Tutte le province' ? 'Tutte le iniziative in programma' : 'Iniziative a ' + currentProvince;
      }
    }

    renderEvents(filtered);
  }

  function getPeriodLabel(key) {
    var map = {
      'san-nicola': '6 Dicembre · San Nicola',
      'immacolata': '8 Dicembre · Immacolata',
      'santa-lucia': '13 Dicembre · Santa Lucia',
      'vigilia-natale': '24-26 Dicembre · Natale e S. Stefano',
      'capodanno': '31 Dicembre – 1 Gennaio · Capodanno',
      'epifania': '6 Gennaio · Epifania'
    };
    return map[key] || 'Programma';
  }

  function checkPeriodMatch(ev, periodKey) {
    var dtS = ev.data_inizio || '';
    var dtE = ev.data_fine || '';
    var sIso = ev.data_inizio_iso || '';
    var eIso = ev.data_fine_iso || '';

    if (periodKey === 'san-nicola') return containsDate(sIso, eIso, dtS, dtE, '2026-12-06', '06/12');
    if (periodKey === 'immacolata') return containsDate(sIso, eIso, dtS, dtE, '2026-12-08', '08/12');
    if (periodKey === 'santa-lucia') return containsDate(sIso, eIso, dtS, dtE, '2026-12-13', '13/12');
    if (periodKey === 'vigilia-natale') {
      return containsDate(sIso, eIso, dtS, dtE, '2026-12-24', '24/12') ||
             containsDate(sIso, eIso, dtS, dtE, '2026-12-25', '25/12') ||
             containsDate(sIso, eIso, dtS, dtE, '2026-12-26', '26/12');
    }
    if (periodKey === 'capodanno') {
      return containsDate(sIso, eIso, dtS, dtE, '2026-12-31', '31/12') ||
             containsDate(sIso, eIso, dtS, dtE, '2027-01-01', '01/01');
    }
    if (periodKey === 'epifania') return containsDate(sIso, eIso, dtS, dtE, '2027-01-06', '06/01');
    return true;
  }

  function containsDate(sIso, eIso, sStr, eStr, targetIso, targetStr) {
    if (sIso && eIso) {
      if (targetIso >= sIso && targetIso <= eIso) return true;
    }
    if (sStr.indexOf(targetStr) !== -1 || eStr.indexOf(targetStr) !== -1) {
      return true;
    }
    return false;
  }

  function renderEvents(list) {
    if (countPill) {
      countPill.textContent = list.length + (list.length === 1 ? ' appuntamento' : ' appuntamenti');
    }

    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = '<div style="background:#fff; border-radius:16px; padding:48px 24px; text-align:center; border:1px solid rgba(22,24,28,0.12);">' +
        '<h3 style="font-family:var(--tlr-font-titoli); font-size:1.3rem; margin-bottom:8px;">Nessun appuntamento trovato</h3>' +
        '<p style="color:var(--tlr-grigio-testo); font-size:0.95rem;">Prova a selezionare un’altra provincia, cambiare la data o reimpostare i filtri.</p>' +
        '</div>';
      return;
    }

    // Group events by time slot or date range, exactly like Rossani
    var groups = {};
    list.forEach(function (ev) {
      var timeKey = ev.orario && ev.orario.indexOf('Tutto il giorno') === -1 ? ev.orario : 'Tutto il giorno';
      // Group key combining date info and time
      var dateLabel = ev.data_inizio || 'Periodo Natalizio';
      if (ev.data_fine && ev.data_fine !== ev.data_inizio) {
        dateLabel += ' – ' + ev.data_fine;
      }
      var groupKey = dateLabel;
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(ev);
    });

    var html = '<ol class="tlr-fasce">';
    Object.keys(groups).forEach(function (groupKey) {
      var evGroup = groups[groupKey];
      html += '<li class="tlr-fascia">' +
        '<div class="tlr-fascia-ora">' +
          escapeHtml(groupKey) +
          '<span class="tlr-fascia-sub">' + evGroup.length + (evGroup.length === 1 ? ' evento' : ' eventi') + '</span>' +
        '</div>' +
        '<div class="tlr-evs">';

      evGroup.forEach(function (ev) {
        var isFree = (ev.gratuito || '').toLowerCase().indexOf('sì') !== -1 || (ev.gratuito || '').toLowerCase().indexOf('si') !== -1;
        var infoLine = [];
        if (ev.proposto_comune && (ev.proposto_comune.toLowerCase().indexOf('sì') !== -1 || ev.proposto_comune.toLowerCase().indexOf('si') !== -1)) {
          infoLine.push('Iniziativa promossa dal Comune di ' + escapeHtml(ev.comune));
        }
        if (ev.orario && ev.orario.indexOf('Tutto il giorno') === -1) {
          infoLine.push('Orario: ' + escapeHtml(ev.orario));
        }
        if (ev.quartiere) {
          infoLine.push('Quartiere ' + escapeHtml(ev.quartiere));
        }

        html += '<article class="tlr-ev">' +
          '<div class="tlr-ev-meta">' +
            '<span class="tlr-ev-tema">' + escapeHtml(ev.categoria || 'Iniziativa') + '</span>' +
            '<span class="tlr-ev-prov-pill">' + escapeHtml(ev.provincia) + '</span>' +
            (isFree ? '<span class="tlr-ev-badge-free">Ingresso Gratuito</span>' : '') +
          '</div>' +
          '<h3 class="tlr-ev-tit">' + escapeHtml(ev.titolo) + '</h3>' +
          (infoLine.length > 0 ? '<p class="tlr-ev-info">' + infoLine.join(' · ') + '</p>' : '') +
          '<p class="tlr-ev-luogo">' +
            '<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>' +
            '<span><strong>' + escapeHtml(ev.comune) + '</strong>' + (ev.luogo ? ' · ' + escapeHtml(ev.luogo) : '') + '</span>' +
          '</p>' +
          (ev.descrizione ? '<p class="tlr-ev-desc">' + escapeHtml(ev.descrizione) + '</p>' : '') +
          (ev.note ? '<p class="tlr-ev-note">Nota: ' + escapeHtml(ev.note) + '</p>' : '') +
          '<div class="tlr-ev-azioni">' +
            '<div></div>' +
            '<div class="tlr-ev-btns">' +
              (ev.link ? '<a href="' + escapeHtml(ev.link) + '" target="_blank" rel="noopener" class="tlr-btn-link">Sito ufficiale ↗</a>' : '') +
              '<button type="button" class="tlr-btn-link" onclick="window.condividiEvento(' + ev.id + ')">Condividi</button>' +
              '<button type="button" class="tlr-btn-link" onclick="window.scaricaICS(' + ev.id + ')">+ Calendario (.ics)</button>' +
            '</div>' +
          '</div>' +
        '</article>';
      });

      html += '</div></li>';
    });
    html += '</ol>';

    container.innerHTML = html;
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.condividiEvento = function (id) {
    var ev = events.find(function (e) { return e.id === id; });
    if (!ev) return;
    var shareText = 'Natali di Puglia: ' + ev.titolo + ' a ' + ev.comune + ' (' + ev.provincia + '). Scopri tutti gli appuntamenti su ' + window.location.href;
    if (navigator.share) {
      navigator.share({
        title: ev.titolo,
        text: shareText,
        url: window.location.href
      }).catch(function () {});
    } else {
      navigator.clipboard.writeText(shareText).then(function () {
        alert('Dettagli evento copiati negli appunti!');
      }).catch(function () {
        prompt('Copia questo link:', shareText);
      });
    }
  };

  window.scaricaICS = function (id) {
    var ev = events.find(function (e) { return e.id === id; });
    if (!ev) return;
    var dtStart = (ev.data_inizio_iso || '2026-12-06').replace(/-/g, '') + 'T100000Z';
    var dtEnd = (ev.data_fine_iso || ev.data_inizio_iso || '2026-12-06').replace(/-/g, '') + 'T180000Z';
    var icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Natali di Puglia//IT',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'SUMMARY:' + ev.titolo.replace(/,/g, '\\,'),
      'DESCRIPTION:' + (ev.descrizione || '').replace(/\n/g, ' ').replace(/,/g, '\\,'),
      'LOCATION:' + (ev.comune + ' ' + (ev.luogo || '')).replace(/,/g, '\\,'),
      'DTSTART:' + dtStart,
      'DTEND:' + dtEnd,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    var blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'evento_' + id + '.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
