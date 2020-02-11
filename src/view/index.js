import { watch } from 'melanke-watchjs';
import i18next from 'i18next';

const renderItems = (items) => {
  const result = items.map((item) => {
    const { text, link } = item;
    const html = `
      <li class="list-group-item">
        <a href="${link}" target="_blank">${text}</a>
      </li>
    `;
    return html;
  }).join('');

  return `
    <ul class="list-group list-group-flush">
      ${result}
    </ul>
  `;
};

const renderSpinner = (element) => {
  const div = document.createElement('div');
  div.classList.add('spinner-border');
  div.setAttribute('role', 'status');
  const span = `<span class="sr-only">${i18next.t('loading')}...</span>`;
  div.innerHTML = span;
  element.prepend(div);
};

const removeSpinner = () => {
  const spinnerElement = document.querySelector('.spinner-border');
  if (spinnerElement) {
    spinnerElement.remove();
  }
};

const renderErrorAlert = (element, message) => {
  const errorElement = document.querySelector('[type="error"]');
  if (errorElement) {
    return;
  }
  const div = document.createElement('div');
  div.classList.add('alert', 'alert-info');
  div.setAttribute('role', 'alert');
  div.setAttribute('type', 'error');
  div.innerHTML = message;
  element.prepend(div);
};

const removeErrorAlert = () => {
  const errorElement = document.querySelector('[type="error"]');
  errorElement.remove();
};

const render = (elements, state) => {
  const {
    content, urlInput, submit, container,
  } = elements;

  watch(state.form, 'errors', () => {
    const { errors } = state.form;
    const isValidUrl = !errors.url;

    if (isValidUrl) {
      urlInput.classList.remove('is-invalid');
    } else {
      urlInput.classList.add('is-invalid');
    }
  });

  watch(state.form, 'valid', () => {
    const { valid } = state.form;
    if (valid) {
      submit.removeAttribute('disabled');
    } else {
      submit.setAttribute('disabled', true);
    }
  });

  watch(state, 'feedList', () => {
    content.innerHTML = '';
    const { feedList, posts } = state;
    feedList.forEach((list) => {
      const { title, description, id } = list;
      const feedPosts = posts.filter((post) => post.feedId === id);
      const div = document.createElement('div');
      div.classList.add('card', 'mt-5');
      const text = `
        <div class="card mb-0">
          <div class="card-header">
            ${title}
          </div>
          <div class="card-body pb-1">
            <p class="card-text">${description}</p>
            ${renderItems(feedPosts)}
          </div>
        </div>
      `;
      div.innerHTML = text;
      content.prepend(div);
    });
  });

  watch(state.form, 'processState', () => {
    const { form: { processState } } = state;
    switch (processState) {
      case 'filling': {
        removeSpinner();
        break;
      }
      case 'pending': {
        renderSpinner(content);
        submit.setAttribute('disabled', true);
        urlInput.value = '';
        break;
      }
      default:
    }
  });

  watch(state, 'errors', () => {
    const { errors: { error } } = state;
    if (error) {
      const message = i18next.t(error);
      renderErrorAlert(container, message);
      setTimeout(removeErrorAlert, 15000);
    }
  });
};

export default render;
