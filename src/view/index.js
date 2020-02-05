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
  const span = `<span class="sr-only">${i18next.t('loading')}...</span>`;
  div.innerHTML = span;
  element.prepend(div);
};

const deleteSpinner = () => {
  const spinnerElement = document.querySelector('.spinner-border');
  if (spinnerElement) {
    spinnerElement.remove();
  }
};

const renderFailLoadResource = (element) => {
  const div = document.createElement('div');
  div.classList.add('alert', 'alert-info');
  div.setAttribute('role', 'alert');
  div.innerHTML = i18next.t('failLoadResource');
  element.prepend(div);
};

const render = (elements, state) => {
  const {
    content, urlInput, submit,
  } = elements;

  // console.log(i18next.t('loading'))

  watch(state, 'form', () => {
    const { form: { valid, fields } } = state;
    if (valid || fields.url === '') {
      submit.removeAttribute('disabled');
      urlInput.classList.remove('is-invalid');
      return;
    }
    submit.setAttribute('disabled', true);
    urlInput.classList.add('is-invalid');
  });

  // watch(state.form, 'fields', () => {
  // });

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
        deleteSpinner();
        // submit.removeAttribute('disabled');
        break;
      }
      case 'pending': {
        renderSpinner(content);
        submit.setAttribute('disabled', true);
        urlInput.value = '';
        break;
      }
      case 'failure': {
        renderFailLoadResource(content);
        break;
      }
      default:
        throw new Error('WHA?t');
    }
  });
};

export default render;
