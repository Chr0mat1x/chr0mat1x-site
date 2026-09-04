// ============ PRELOADER ============
function hidePreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) preloader.classList.add('preloader--hidden');
}
window.addEventListener('load', () => setTimeout(hidePreloader, 400));
document.addEventListener('DOMContentLoaded', () => setTimeout(hidePreloader, 600));
// Аварийное скрытие через 2 секунды в любом случае
setTimeout(hidePreloader, 2000);

// ============ HEADER SCROLL ============
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('header--scrolled', window.scrollY > 40);
});

// ============ BURGER / MOBILE NAV ============
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => {
  burger.classList.toggle('burger--open');
  nav.classList.toggle('nav--open');
  // Блокируем прокрутку страницы под открытым меню
  document.body.classList.toggle('menu-locked', nav.classList.contains('nav--open'));
});
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('burger--open');
    nav.classList.remove('nav--open');
    document.body.classList.remove('menu-locked');
  });
});

// ============ CUSTOM CURSOR ============
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
});
document.querySelectorAll('a, button, summary, input, textarea').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('cursor--big'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--big'));
});

// ============ REVEAL ON SCROLL ============
const revealEls = document.querySelectorAll('.reveal');

// Мгновенно показываем всё, что уже попадает в первый экран — без таймеров и наблюдателей
function revealInView() {
  revealEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('reveal--visible');
    }
  });
}
revealInView();
window.addEventListener('load', revealInView);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => {
    if (!el.classList.contains('reveal--visible')) observer.observe(el);
  });
  // Страховка: если через 3 сек ничего не проявилось — показываем всё
  setTimeout(() => {
    const anyVisible = document.querySelector('.reveal--visible');
    if (!anyVisible) document.documentElement.classList.add('reveal-fallback');
  }, 3000);
} else {
  revealEls.forEach(el => el.classList.add('reveal--visible'));
}

// ============ CONTACT FORM ============
const form = document.getElementById('form');
const formStatus = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

// Ссылки на поля берём один раз на верхнем уровне
const fieldName = form.querySelector('input[name="name"]');
const fieldContact = form.querySelector('input[name="contact"]');
const fieldMessage = form.querySelector('textarea[name="message"]');

form.addEventListener('submit', e => {
  e.preventDefault();

  let valid = true;

  [fieldName, fieldContact].forEach(field => {
    if (!field.value.trim()) {
      field.classList.add('invalid');
      valid = false;
    } else {
      field.classList.remove('invalid');
    }
  });

  if (!valid) {
    formStatus.textContent = 'Заполните имя и контакт — без них не свяжемся.';
    formStatus.className = 'form__status form__status--err';
    return;
  }

  // ============ ОТПРАВКА ЗАЯВКИ НА ПОЧТУ ============
  // Форма отправляется через Formspree на sumarokovart@gmail.com
  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправляем...';

  const finish = () => {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Отправить заявку';
  };

  fetch('https://formspree.io/f/xrpgkdze', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: new FormData(form)
  })
    .then(res => {
      if (res.ok) {
        formStatus.textContent = 'Заявка отправлена! Ответим в течение дня.';
        formStatus.className = 'form__status form__status--ok';
        form.reset();
      } else {
        throw new Error('bad status');
      }
    })
    .catch(() => {
      // Резервный путь — открыть почтовую программу с готовым письмом
      const subject = encodeURIComponent('Заявка с сайта Chr0mat1x');
      const body = encodeURIComponent(
        `Имя: ${fieldName.value.trim()}\nКонтакт: ${fieldContact.value.trim()}\nО проекте: ${fieldMessage.value.trim() || '—'}`
      );
      window.location.href = `mailto:sumarokovart@gmail.com?subject=${subject}&body=${body}`;
      formStatus.textContent = 'Открываем почту — отправьте письмо оттуда.';
      formStatus.className = 'form__status form__status--ok';
    })
    .finally(finish);
});

// Убираем подсветку ошибки при вводе
[fieldName, fieldContact].forEach(field => {
  field.addEventListener('input', () => field.classList.remove('invalid'));
});
