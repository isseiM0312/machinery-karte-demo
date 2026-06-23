(function () {
  var PASS = 'wl-karte-2026';
  var KEY = 'wl-machinery-karte-demo';
  var machines = window.MACHINES || [];
  var filtered = machines.slice();
  var pendingSection = '';
  var currentDetailId = '';

  var gate = document.getElementById('gate');
  var app = document.getElementById('app');
  var listView = document.getElementById('list-view');
  var detailView = document.getElementById('detail-view');
  var listEl = document.getElementById('result-list');
  var resultMeta = document.getElementById('result-meta');
  var listTitle = document.getElementById('list-title');
  var detailRoot = document.getElementById('detail-root');
  var lightbox = document.getElementById('lightbox');

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function catClass(cat) {
    return { new: 'new', used: 'used', repair: 'repair', demo: 'demo' }[cat] || 'used';
  }

  function formatHours(h) {
    return h === 0 ? '—' : h.toLocaleString('ja-JP') + ' h';
  }

  function photosFor(m) {
    if (m.photos && m.photos.length) return m.photos;
    return [
      { id: 1, src: '', label: '外観' },
      { id: 2, src: '', label: 'キャビン' },
      { id: 3, src: '', label: '整備後' },
    ];
  }

  function showList() {
    listView.hidden = false;
    detailView.hidden = true;
    currentDetailId = '';
    location.hash = 'list';
  }

  function showDetail(id, section) {
    var m = machines.find(function (x) { return x.id === id; });
    if (!m) return showList();
    section = section || '';
    pendingSection = section;
    var targetHash = section ? 'detail/' + id + '/' + section : 'detail/' + id;
    var current = location.hash.replace(/^#/, '');
    var sameMachine = currentDetailId === id && !detailView.hidden;

    listView.hidden = true;
    detailView.hidden = false;

    if (current !== targetHash) {
      location.hash = targetHash;
    }

    if (!sameMachine || currentDetailId !== id) {
      currentDetailId = id;
      renderDetail(m);
    }
    if (pendingSection) scrollToSection(pendingSection);
  }

  function jumpToSection(id, section) {
    var targetHash = 'detail/' + id + '/' + section;
    if (location.hash.replace(/^#/, '') !== targetHash) {
      history.replaceState(null, '', '#' + targetHash);
    }
    pendingSection = section;
    scrollToSection(section);
  }

  function scrollToSection(section) {
    requestAnimationFrame(function () {
      var el = document.getElementById('section-' + section);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (section === 'files') highlightFile(pendingFileId);
      }
      pendingSection = '';
    });
  }

  var pendingFileId = '';

  function highlightFile(fileId) {
    if (!fileId) return;
    detailRoot.querySelectorAll('.files li').forEach(function (li) {
      li.classList.toggle('is-highlight', li.dataset.fileId === fileId);
    });
    var target = detailRoot.querySelector('.files li[data-file-id="' + fileId + '"]');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function openLightbox(src, label) {
    if (!lightbox || !src) return;
    lightbox.querySelector('.lightbox-img').src = src;
    lightbox.querySelector('.lightbox-cap').textContent = label || '';
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
  }

  function renderRepairStatus(rs) {
    if (!rs) return '';
    return (
      '<section class="panel repair-panel" id="section-repair">' +
        '<h2>預り修理ステータス</h2>' +
        '<dl class="repair-grid">' +
          '<div><dt>預り入庫</dt><dd>' + esc(rs.received) + '</dd></div>' +
          '<div><dt>預り理由</dt><dd>' + esc(rs.reason) + '</dd></div>' +
          '<div><dt>作業状況</dt><dd><span class="repair-progress">' + esc(rs.progress) + '</span></dd></div>' +
          '<div><dt>完了見込</dt><dd>' + esc(rs.eta) + '</dd></div>' +
          '<div><dt>担当</dt><dd>' + esc(rs.assignee) + '</dd></div>' +
          '<div class="full"><dt>メモ</dt><dd>' + esc(rs.note) + '</dd></div>' +
        '</dl>' +
      '</section>'
    );
  }

  function renderGallery(m) {
    var photos = photosFor(m);
    var main = photos[0];
    var mainClass = 'gallery-main' + (main.src ? ' has-photo' : '');

    var thumbs = photos.map(function (p, i) {
      var style = p.src ? ' style="background-image:url(\'' + p.src + '\')"' : '';
      var viewAttr = p.src ? '' : ' data-view="' + p.id + '"';
      var cls = 'thumb' + (p.src ? ' has-photo' : '') + (i === 0 ? ' active' : '');
      return '<button type="button" class="' + cls + '"' +
        ' data-src="' + esc(p.src) + '" data-label="' + esc(p.label) + '"' + viewAttr + style +
        ' aria-label="' + esc(p.label) + '"></button>';
    }).join('');

    return (
      '<div class="gallery">' +
        '<div class="' + mainClass + '" id="main-photo"' +
          (main.src ? '' : ' data-view="' + (m.thumb || 1) + '"') +
          (main.src ? ' style="background-image:url(\'' + main.src + '\')"' : '') +
          ' role="button" tabindex="0" aria-label="写真を拡大"></div>' +
        '<div class="gallery-thumbs">' + thumbs + '</div>' +
        '<p class="gallery-note">※ クリックで拡大表示</p>' +
      '</div>'
    );
  }

  function renderDetail(m) {
    var history = m.history.map(function (h) {
      var link = '';
      if (h.fileId) {
        link = '<button type="button" class="timeline-link" data-file-id="' + esc(h.fileId) + '">' +
          '関連添付を見る →</button>';
      }
      return '<li id="hist-' + esc(h.fileId || h.date.replace(/\//g, '')) + '">' +
        '<time>' + esc(h.date) + '</time>' +
        '<strong>' + esc(h.title) + '</strong>' +
        '<span>' + esc(h.sub) + '</span>' + link + '</li>';
    }).join('');

    var files = m.files.map(function (f) {
      var ext = f.type === 'pdf' ? 'pdf' : 'img';
      var fid = f.id || f.name;
      return '<li data-file-id="' + esc(fid) + '" id="file-' + esc(fid) + '">' +
        '<span class="ext ' + ext + '">' + ext.toUpperCase() + '</span>' +
        '<div><strong>' + esc(f.name) + '</strong><span>' + esc(f.sub) + '</span></div>' +
        '<button type="button" class="btn btn-sm file-preview" data-file-id="' + esc(fid) + '">プレビュー</button>' +
        '</li>';
    }).join('');

    detailRoot.innerHTML =
      '<nav class="crumb"><a href="#" id="back-list">機械一覧</a> / ' + esc(m.name) + ' ' + esc(m.model) + '</nav>' +
      '<div class="hero">' +
        renderGallery(m) +
        '<div class="summary">' +
          '<p class="status-pill ' + catClass(m.category) + '">' + esc(m.categoryLabel) + '</p>' +
          '<h1>' + esc(m.name) + ' <span>' + esc(m.maker) + ' ' + esc(m.model) + '</span></h1>' +
          '<p class="sub">管理No. ' + esc(m.id) + ' ｜ 最終更新 ' + esc(m.updated) + '</p>' +
          '<dl class="quick">' +
            '<div><dt>現在状態</dt><dd>' + esc(m.status) + '</dd></div>' +
            '<div><dt>保管場所</dt><dd>' + esc(m.location) + '</dd></div>' +
            '<div><dt>顧客</dt><dd>' + esc(m.customer) + '</dd></div>' +
          '</dl>' +
          '<div class="jump-links">' +
            (m.repairStatus ? '<a href="#" class="jump-link" data-section="repair">預り状態</a>' : '') +
            '<a href="#" class="jump-link" data-section="history">修理履歴</a>' +
            '<a href="#" class="jump-link" data-section="files">関連添付</a>' +
          '</div>' +
          '<div class="actions">' +
            '<button type="button" class="btn primary demo-toast" data-msg="デモ：状態更新画面は本開発で実装">状態を更新</button>' +
            '<button type="button" class="btn demo-toast" data-msg="デモ：添付アップロードは本開発で実装">添付を追加</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      renderRepairStatus(m.repairStatus) +
      '<section class="panel">' +
        '<h2>機械情報 <span class="code">' + esc(m.model) + ' · S/N ' + esc(m.serial) + '</span></h2>' +
        '<table class="spec">' +
          '<tr><th>メーカー</th><td>' + esc(m.maker) + '</td><th>管理区分</th><td>' + esc(m.categoryLabel) + '</td></tr>' +
          '<tr><th>型式</th><td>' + esc(m.model) + '</td><th>製造年</th><td>' + m.year + '年</td></tr>' +
          '<tr><th>シリアルNo.</th><td>' + esc(m.serial) + '</td><th>稼働時間</th><td>' + formatHours(m.hours) + '</td></tr>' +
          '<tr><th>仕向地</th><td>' + esc(m.destination) + '</td><th>入庫日</th><td>' + esc(m.inbound) + '</td></tr>' +
        '</table>' +
      '</section>' +
      '<section class="panel">' +
        '<h2>主要仕様</h2>' +
        '<table class="spec">' +
          '<tr><th>エンジン</th><td>' + esc(m.engine) + '</td><th>出力</th><td>' + esc(m.power) + '</td></tr>' +
          '<tr><th>操作重量</th><td>' + esc(m.weight) + '</td><th>バケット容量</th><td>' + esc(m.bucket) + '</td></tr>' +
          '<tr><th>最大掘削深度</th><td>' + esc(m.depth) + '</td><th>燃料</th><td>' + esc(m.fuel) + '</td></tr>' +
        '</table>' +
      '</section>' +
      '<div class="cols">' +
        '<section class="panel" id="section-history">' +
          '<h2>修理・整備履歴</h2><ul class="timeline">' + history + '</ul></section>' +
        '<section class="panel" id="section-files">' +
          '<h2>関連添付</h2><ul class="files">' + files + '</ul>' +
          '<p class="panel-note">見積・請求の<b>作成</b>は既存システムのまま。本カルテへ添付で紐付け。</p></section>' +
      '</div>' +
      '<div id="preview-toast" class="preview-toast" hidden></div>';

    document.getElementById('back-list').addEventListener('click', function (e) {
      e.preventDefault();
      showList();
    });
    bindDetailInteractions(m);
  }

  function showPreviewToast(name) {
    var toast = detailRoot.querySelector('#preview-toast');
    if (!toast) return;
    toast.textContent = 'デモ：「' + name + '」をプレビュー（本番ではPDF/画像ビューアで表示）';
    toast.hidden = false;
    clearTimeout(showPreviewToast._t);
    showPreviewToast._t = setTimeout(function () { toast.hidden = true; }, 3200);
  }

  function bindDetailInteractions(m) {
    initGallery(detailRoot, m);

    detailRoot.querySelectorAll('.jump-link').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        jumpToSection(m.id, a.dataset.section);
      });
    });

    detailRoot.querySelectorAll('.timeline-link').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        pendingFileId = btn.dataset.fileId;
        scrollToSection('files');
        highlightFile(pendingFileId);
        pendingFileId = '';
      });
    });

    detailRoot.querySelectorAll('.file-preview').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var fid = btn.dataset.fileId;
        var f = m.files.find(function (x) { return (x.id || x.name) === fid; });
        if (f) showPreviewToast(f.name);
      });
    });

    detailRoot.querySelectorAll('.demo-toast').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        showPreviewToast(btn.dataset.msg);
      });
    });
  }

  function initGallery(root, m) {
    var scope = root || document;
    var main = scope.querySelector('#main-photo');
    if (!main) return;

    function setMain(thumb) {
      var src = thumb.dataset.src;
      var label = thumb.dataset.label || '';
      if (src) {
        main.style.backgroundImage = 'url(' + src + ')';
        main.classList.add('has-photo');
        main.removeAttribute('data-view');
        main.dataset.label = label;
      } else {
        main.style.backgroundImage = '';
        main.classList.remove('has-photo');
        main.dataset.view = thumb.dataset.view || '1';
        main.dataset.label = label;
      }
    }

    scope.querySelectorAll('.thumb').forEach(function (el) {
      el.addEventListener('click', function () {
        scope.querySelectorAll('.thumb').forEach(function (t) { t.classList.remove('active'); });
        el.classList.add('active');
        setMain(el);
      });
    });

    function openMainLightbox() {
      var src = main.style.backgroundImage.replace(/^url\(["']?|["']?\)$/g, '');
      if (src) openLightbox(src, main.dataset.label || '');
    }

    main.addEventListener('click', openMainLightbox);
    main.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMainLightbox(); }
    });
  }

  function renderList() {
    listTitle.textContent = '社内 商用機械一覧（' + machines.length + '台）';
    resultMeta.textContent = '全' + machines.length + '件中 ' + (filtered.length ? '1' : '0') + '〜' + filtered.length + '件を表示';
    if (!filtered.length) {
      listEl.innerHTML = '<p class="list-empty">条件に一致する機械がありません。</p>';
      return;
    }
    listEl.innerHTML = filtered.map(function (m) {
      var thumbStyle = '';
      var thumbAttr = ' data-view="' + m.thumb + '"';
      if (m.photos && m.photos[0] && m.photos[0].src) {
        thumbStyle = ' style="background-image:url(' + esc(m.photos[0].src) + ')"';
        thumbAttr = ' class="list-thumb has-photo"';
      } else {
        thumbAttr = ' class="list-thumb"' + thumbAttr;
      }
      var historyBtn = m.history && m.history.length
        ? '<button type="button" class="btn btn-sm list-history" data-id="' + esc(m.id) + '">履歴を見る</button>'
        : '';
      return (
        '<article class="list-row" data-id="' + esc(m.id) + '">' +
          '<div' + thumbAttr + thumbStyle + '></div>' +
          '<div class="list-body">' +
            '<p class="list-headline">' + esc(m.headline) + '</p>' +
            '<div class="list-meta">' +
              '<span><b>' + esc(m.maker) + '</b> ' + esc(m.model) + '</span>' +
              '<span>' + m.year + '年 · ' + esc(m.categoryLabel) + '</span>' +
              '<span>' + formatHours(m.hours) + ' · ' + esc(m.status) + '</span>' +
              '<span>' + esc(m.location) + '</span>' +
            '</div>' +
            '<div class="list-foot">' +
              '<span class="list-id">管理No. ' + esc(m.id) + '</span>' +
              '<div class="list-actions">' + historyBtn +
              '<button type="button" class="btn primary btn-sm list-open" data-id="' + esc(m.id) + '">カルテを見る</button></div>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function bindListClicks() {
    listEl.addEventListener('click', function (e) {
      var histBtn = e.target.closest('.list-history');
      if (histBtn) {
        e.stopPropagation();
        showDetail(histBtn.dataset.id, 'history');
        return;
      }
      var openBtn = e.target.closest('.list-open');
      if (openBtn) {
        e.stopPropagation();
        showDetail(openBtn.dataset.id);
        return;
      }
      var row = e.target.closest('.list-row');
      if (row) showDetail(row.dataset.id);
    });
  }

  function applyFilters() {
    var cat = document.getElementById('f-category').value;
    var maker = document.getElementById('f-maker').value;
    var status = document.getElementById('f-status').value;
    var location = document.getElementById('f-location').value;
    var q = (document.getElementById('f-keyword').value || '').trim().toLowerCase();

    filtered = machines.filter(function (m) {
      if (cat && m.category !== cat) return false;
      if (maker && m.maker !== maker) return false;
      if (status && m.status !== status) return false;
      if (location && m.location !== location) return false;
      if (q) {
        var hay = [m.id, m.name, m.model, m.maker, m.headline, m.location, m.categoryLabel].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    renderList();
  }

  function bindFilters() {
    document.getElementById('search-form').addEventListener('submit', function (e) {
      e.preventDefault();
      applyFilters();
    });
    document.getElementById('reset-btn').addEventListener('click', function () {
      document.getElementById('search-form').reset();
      document.getElementById('f-category').value = '';
      document.querySelectorAll('.chip-filter').forEach(function (b) { b.classList.remove('active'); });
      document.querySelector('.chip-filter[data-cat=""]').classList.add('active');
      applyFilters();
    });
    document.querySelectorAll('.chip-filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.chip-filter').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.getElementById('f-category').value = btn.dataset.cat || '';
        applyFilters();
      });
    });
  }

  function parseHash() {
    var h = location.hash.replace(/^#/, '');
    if (h.indexOf('detail/') !== 0) return null;
    var parts = h.slice(7).split('/');
    return { id: parts[0], section: parts[1] || '' };
  }

  function routeFromHash() {
    var p = parseHash();
    if (p && p.id) {
      showDetail(p.id, p.section);
    } else {
      showList();
    }
  }

  function unlock() {
    gate.classList.add('is-hidden');
    app.classList.remove('is-locked');
    bindFilters();
    bindListClicks();
    applyFilters();
    routeFromHash();
    window.addEventListener('hashchange', routeFromHash);
  }

  function tryUnlock() {
    var val = (document.getElementById('pw').value || '').trim();
    var err = document.getElementById('gate-err');
    if (val === PASS) {
      sessionStorage.setItem(KEY, '1');
      err.hidden = true;
      unlock();
      return true;
    }
    err.hidden = false;
    return false;
  }

  document.getElementById('gate-btn').addEventListener('click', tryUnlock);
  document.getElementById('gate-form').addEventListener('submit', function (e) {
    e.preventDefault();
    tryUnlock();
  });

  if (lightbox) {
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  if (sessionStorage.getItem(KEY) === '1') unlock();
})();
