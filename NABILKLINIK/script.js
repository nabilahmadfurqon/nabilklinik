// Slider latar otomatis, tanpa tombol navigasi. Teks dan CTA tetap stabil.
const hero = document.querySelector('.hero-full');
const backgrounds = [...document.querySelectorAll('.hero-background')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let slideIndex = 0;
let sliderTimer = null;
let hovered = false;
function stopSlider() {
  if (sliderTimer !== null) window.clearInterval(sliderTimer);
  sliderTimer = null;
}
function syncSlider() {
  stopSlider();
  if (reducedMotion.matches || document.hidden || hovered || hero.contains(document.activeElement)) return;
  sliderTimer = window.setInterval(() => {
    backgrounds[slideIndex].classList.remove('is-active');
    slideIndex = (slideIndex + 1) % backgrounds.length;
    backgrounds[slideIndex].classList.add('is-active');
  }, 5500);
}
hero.addEventListener('mouseenter', () => { hovered = true; syncSlider(); });
hero.addEventListener('mouseleave', () => { hovered = false; syncSlider(); });
hero.addEventListener('focusin', stopSlider);
hero.addEventListener('focusout', () => window.setTimeout(syncSlider, 0));
document.addEventListener('visibilitychange', syncSlider);
reducedMotion.addEventListener('change', syncSlider);
syncSlider();
// Menutup jawaban lain saat satu pertanyaan dibuka.
const questions = [...document.querySelectorAll('.faq-list details')];
questions.forEach(question => question.addEventListener('toggle', () => {
  if (question.open) questions.forEach(other => { if (other !== question) other.open = false; });
}));
// Form kontak membuka WhatsApp dengan pesan yang sudah disiapkan.
const contactDialog = document.querySelector('#contact-dialog');
const contactForm = document.querySelector('#whatsapp-form');
const serviceSelect = document.querySelector('#contact-service');
const formError = document.querySelector('#form-error');
const config = window.NABIL_CONFIG || {};
let doctorMessage = '';
document.querySelectorAll('[data-contact]').forEach(button => {
  button.addEventListener('click', () => {
    const requested = button.dataset.contact;
    serviceSelect.value = [...serviceSelect.options].some(option => option.value === requested)
      ? requested : 'Informasi kunjungan';
    const messageField = document.querySelector('#contact-message');
    if (button.dataset.doctor) {
      doctorMessage = `Saya ingin membuat janji dengan ${button.dataset.doctor}. Jadwal pilihan: ${button.dataset.schedule}. Mohon konfirmasi jadwal yang tersedia.`;
      messageField.value = doctorMessage;
    } else if (messageField.value === doctorMessage) {
      messageField.value = '';
      doctorMessage = '';
    }
    formError.hidden = true;
    contactDialog.showModal();
  });
});
document.querySelector('.dialog-close').addEventListener('click', () => contactDialog.close());
function normalizeWhatsAppNumber(value) {
  const number = String(value || '').replace(/[\s()+-]/g, '');
  return number.startsWith('08') ? '62' + number.slice(1) : number;
}
function buildWhatsAppUrl(number, name, service, message) {
  const text = `Halo NABILKLINIK, saya ${name}.\nSaya ingin menanyakan layanan ${service}.`
    + (message ? `\n\n${message}` : '');
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
contactForm.addEventListener('submit', event => {
  event.preventDefault();
  formError.hidden = true;
  if (!contactForm.reportValidity()) return;
  const name = document.querySelector('#contact-name').value.trim();
  const message = document.querySelector('#contact-message').value.trim();
  if (!name) {
    formError.textContent = 'Isi nama Anda terlebih dahulu.';
    formError.hidden = false;
    document.querySelector('#contact-name').focus();
    return;
  }
  const number = normalizeWhatsAppNumber(config.whatsappNumber);
  if (!/^[1-9]\d{7,14}$/.test(number)) {
    formError.textContent = 'Nomor WhatsApp belum diatur. Silakan coba kembali nanti.';
    formError.hidden = false;
    return;
  }
  window.open(buildWhatsAppUrl(number, name, serviceSelect.value, message), '_blank', 'noopener,noreferrer');
});
// Tautan sosial hanya muncul ketika alamat akun sudah diisi di config.js.
[['instagramUrl', '#instagram-link'], ['facebookUrl', '#facebook-link']].forEach(([key, selector]) => {
  try {
    const url = new URL(config[key]);
    if (url.protocol !== 'https:') return;
    const link = document.querySelector(selector);
    link.href = url.href;
    link.hidden = false;
    document.querySelector('#footer-socials').hidden = false;
  } catch { /* Alamat kosong: tidak menampilkan tautan yang belum tersedia. */ }
});
// 3. Menu mobile: aria-expanded mengikuti kondisi menu.
const menuToggle = document.querySelector('.menu-toggle');
const navigationLinks = document.querySelector('#navigation-links');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Buka menu navigasi');
  navigationLinks.classList.remove('is-open');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
  navigationLinks.classList.toggle('is-open', open);
});
navigationLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
menuToggle.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

// Bentuk melayang aktif setelah halaman digulir melewati 24px.
const siteHeader = document.querySelector('.site-header');
function updateFloatingNavbar() {
  siteHeader.classList.toggle('is-floating', window.scrollY > 24);
}
window.addEventListener('scroll', updateFloatingNavbar, { passive: true });
updateFloatingNavbar();

// Tutup menu saat Escape, klik di luar navbar, atau beralih ke desktop.
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});
document.addEventListener('click', event => {
  if (!siteHeader.contains(event.target)) closeMenu();
});
const compactNavigation = window.matchMedia('(max-width: 600px)');
compactNavigation.addEventListener('change', closeMenu);

// Dropdown layanan: daftar tautan navigasi, bukan menu aplikasi.
const servicesToggle = document.querySelector('.services-toggle');
const servicesDropdown = document.querySelector('#services-dropdown');
const servicesNavigation = document.querySelector('.nav-dropdown');
function closeServicesDropdown() {
  servicesToggle.setAttribute('aria-expanded', 'false');
  servicesDropdown.hidden = true;
}
servicesToggle.addEventListener('click', () => {
  const open = servicesToggle.getAttribute('aria-expanded') !== 'true';
  servicesToggle.setAttribute('aria-expanded', String(open));
  servicesDropdown.hidden = !open;
});
servicesDropdown.querySelectorAll('a').forEach(link => link.addEventListener('click', closeServicesDropdown));
document.addEventListener('click', event => {
  if (!servicesNavigation.contains(event.target)) closeServicesDropdown();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && servicesToggle.getAttribute('aria-expanded') === 'true') {
    closeServicesDropdown();
    if (compactNavigation.matches && menuToggle.getAttribute('aria-expanded') !== 'true') menuToggle.focus();
    else servicesToggle.focus();
  }
});
menuToggle.addEventListener('click', closeServicesDropdown);
compactNavigation.addEventListener('change', closeServicesDropdown);

// Filter poli hanya menyembunyikan profil yang tidak sesuai pilihan.
const doctorPoli = document.querySelector('#doctor-poli');
const doctorCards = [...document.querySelectorAll('.doctor-card')];
doctorPoli.addEventListener('change', () => {
  let visible = 0;
  doctorCards.forEach(card => {
    card.hidden = doctorPoli.value !== 'all' && card.dataset.poli !== doctorPoli.value;
    if (!card.hidden) visible += 1;
  });
  document.querySelector('#doctor-result').textContent = `Menampilkan ${visible} dokter.`;
});
