// Demo gate — not for production security. Password shared out-of-band.
const DEMO_PASSWORD = 'wl-karte-2026';
const STORAGE_KEY = 'wl-machinery-karte-demo';

function unlock() {
  document.getElementById('gate').hidden = true;
  document.getElementById('app').hidden = false;
}

function initGallery() {
  const main = document.getElementById('main-photo');
  document.querySelectorAll('.thumb').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.thumb').forEach((t) => t.classList.remove('active'));
      btn.classList.add('active');
      main.dataset.view = btn.dataset.view;
    });
  });
}

if (sessionStorage.getItem(STORAGE_KEY) === '1') {
  unlock();
  initGallery();
} else {
  document.getElementById('gate-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const val = document.getElementById('pw').value;
    const err = document.getElementById('gate-err');
    if (val === DEMO_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, '1');
      err.hidden = true;
      unlock();
      initGallery();
    } else {
      err.hidden = false;
    }
  });
}
