import { watch } from 'melanke-watchjs';
import i18next from 'i18next';

const renderItems = (items) => {
  const result = items.map((i) => {
    const { text, link } = i;
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
  const span = `<span class="sr-only">${i18next.t('.loading')}...</span>`;
  div.innerHTML = span;
  element.prepend(div);
};

const deleteSpinner = () => {
  const spinnerElement = document.querySelector('.spinner-border');
  spinnerElement.remove();
};

const render = (elements, state) => {
  const {
    content, urlInput, submit,
  } = elements;

  // renderSpinner(content);
  watch(state, 'urlState', () => {
    const { urlState } = state;
    switch (urlState) {
      case 'valid': {
        submit.removeAttribute('disabled');
        urlInput.classList.add('is-valid');
        urlInput.classList.remove('is-invalid');
        break;
      }
      case 'invalid': {
        submit.setAttribute('disabled', true);
        urlInput.classList.add('is-invalid');
        urlInput.classList.remove('is-valid');
        break;
      }
      default: {
        submit.setAttribute('disabled', true);
        urlInput.classList.remove('is-valid');
        urlInput.classList.remove('is-invalid');
        urlInput.value = '';
      }
    }
  });

  watch(state, 'currentUrl', () => {
    const { currentUrl } = state;
    urlInput.value = currentUrl;
  });

  watch(state, 'feedList', () => {
    // content.innerHTML = '';
    const { feedList, posts } = state;
    feedList.forEach((l) => {
      const { title, description } = l;
      const div = document.createElement('div');
      div.classList.add('card', 'mt-5');
      const text = `
        <div class="card mb-0">
          <div class="card-header">
            ${title}
          </div>
          <div class="card-body pb-1">
            <p class="card-text">${description}</p>
            ${renderItems(posts)}
          </div>
        </div>
      `;
      div.innerHTML = text;
      content.prepend(div);
    });
  });

  watch(state, 'formState', () => {
    const { formState } = state;
    switch (formState) {
      case 'filling': {
        deleteSpinner();
        submit.removeAttribute('disabled');
        break;
      }
      case 'pending': {
        renderSpinner(content);
        submit.setAttribute('disabled', true);
        urlInput.value = '';
        break;
      }
      case 'failure': {
        break;
      }
      default:
        throw new Error('WHA?t');
    }
  });
};

export default render;
