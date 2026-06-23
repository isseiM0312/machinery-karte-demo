(function () {
  var PASS = 'wl-karte-2026';
  var KEY = 'wl-machinery-karte-demo';
  var machines = window.MACHINES || [];
  var filtered = machines.slice();

  var gate = document.getElementById('gate');
  var app = document.getElementById('app');
  var listView = document.getElementById('list-view');
  var detailView = document.getElementById('detail-view');
  var listEl = document.getElementById('result-list');
  var resultMeta = document.getElementById('result-meta');
  var listTitle = document.getElementById('list-title');
  var detailRoot = document.getElementById('detail-root');
  var crumbList = document.getElementById('crumb-list');

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

  function showList() {
    listView.hidden = false;
    detailView.hidden = true;
    location.hash = 'list';
  }

  function showDetail(id) {
    var m = machines.find(function (x) { return x.id === id; });
    if (!m) return showList();
    listView.hidden = true;
    detailView.hidden = false;
    location.hash = 'detail/' + id;
    renderDetail(m);
  }

  function renderDetail(m) {
    var history = m.history.map(function (h) {
      return '<li><time>' + esc(h.date) + '</time><strong>' + esc(h.title) + '</strong><span>' + esc(h.sub) + '</span></li>';
    }).join('');
    var files = m.files.map(function (f) {
      var ext = f.type === 'pdf' ? 'pdf' : 'img';
      return '<li><span class="ext ' + ext + '">' + ext.toUpperCase() + '</span><div><strong>' + esc(f.name) + '</strong><span>' + esc(f.sub) + '</span></div></li>';
    }).join('');

    detailRoot.innerHTML =
      '<nav class="crumb"><a href="#" id="back-list">機械一覧</a> / ' + esc(m.name) + ' ' + esc(m.model) + '</nav>' +
      '<div class="hero">' +
        '<div class="gallery">' +
          '<div class="gallery-main" id="main-photo" data-view="' + m.thumb + '"></div>' +
          '<div class="gallery-thumbs">' +
            '<button type="button" class="thumb active" data-view="1" aria-label="外観"></button>' +
            '<button type="button" class="thumb" data-view="2" aria-label="キャビン"></button>' +
            '<button type="button" class="thumb" data-view="3" aria-label="整備後"></button>' +
          '</div>' +
          '<p class="gallery-note">※ 画像クリックで拡大表示（デモ）</p>' +
        '</div>' +
        '<div class="summary">' +
          '<p class="status-pill ' + catClass(m.category) + '">' + esc(m.categoryLabel) + '</p>' +
          '<h1>' + esc(m.name) + ' <span>' + esc(m.maker) + ' ' + esc(m.model) + '</span></h1>' +
          '<p class="sub">管理No. ' + esc(m.id) + ' ｜ 最終更新 ' + esc(m.updated) + '</p>' +
          '<dl class="quick">' +
            '<div><dt>現在状態</dt><dd>' + esc(m.status) + '</dd></div>' +
            '<div><dt>保管場所</dt><dd>' + esc(m.location) + '</dd></div>' +
            '<div><dt>顧客</dt><dd>' + esc(m.customer) + '</dd></div>' +
          '</dl>' +
          '<div class="actions">' +
            '<button type="button" class="btn primary">状態を更新</button>' +
            '<button type="button" class="btn">添付を追加</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
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
        '<section class="panel"><h2>修理・整備履歴</h2><ul class="timeline">' + history + '</ul></section>' +
        '<section class="panel"><h2>関連添付</h2><ul class="files">' + files + '</ul>' +
          '<p class="panel-note">見積・請求の<b>作成</b>は既存システムのまま。本カルテへ添付で紐付け。</p></section>' +
      '</div>';

    document.getElementById('back-list').addEventListener('click', function (e) {
      e.preventDefault();
      showList();
    });
    initGallery(detailRoot);
  }

  function initGallery(root) {
    var scope = root || document;
    var main = scope.querySelector('#main-photo');
    if (!main) return;
    scope.querySelectorAll('.thumb').forEach(function (el) {
      el.addEventListener('click', function () {
        scope.querySelectorAll('.thumb').forEach(function (t) { t.classList.remove('active'); });
        el.classList.add('active');
        main.dataset.view = el.dataset.view;
      });
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
      return (
        '<article class="list-row" data-id="' + esc(m.id) + '">' +
          '<div class="list-thumb" data-view="' + m.thumb + '"></div>' +
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
              '<button type="button" class="btn primary btn-sm list-open">カルテを見る</button>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    listEl.addEventListener('click', function (e) {
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

  function routeFromHash() {
    var h = location.hash.replace(/^#/, '');
    if (h.indexOf('detail/') === 0) {
      showDetail(h.split('/')[1]);
    } else {
      showList();
    }
  }

  function unlock() {
    gate.classList.add('is-hidden');
    app.classList.remove('is-locked');
    bindFilters();
    applyFilters();
    routeFromHash();
    window.addEventListener('hashchange', routeFromHash);
    if (crumbList) crumbList.addEventListener('click', function (e) { e.preventDefault(); showList(); });
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

  if (sessionStorage.getItem(KEY) === '1') unlock();
})();
