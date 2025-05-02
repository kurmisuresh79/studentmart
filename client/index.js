
function showPage(id) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.add('hidden');
  });
  const pageElement = document.getElementById(id);
  if (pageElement) {
    pageElement.classList.remove('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('nav-home')?.addEventListener('click', () => showPage('home'));
  document.getElementById('nav-buy')?.addEventListener('click', () => showPage('buy'));
  document.getElementById('nav-add')?.addEventListener('click', () => showPage('add'));
  document.getElementById('nav-cart')?.addEventListener('click', () => showPage('cart'));
  document.getElementById('btn-login')?.addEventListener('click', () => showPage('login'));
  document.getElementById('btn-signup')?.addEventListener('click', () => showPage('register'));

  showPage('home'); // initial page load
});
