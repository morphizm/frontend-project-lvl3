import { watch } from 'melanke-watchjs';

const renderItems = (items) => {
  const result = items.map((i) => {
    const { text, link } = i;
    const html = `
      <li class="list-group-item">
        <a href="${link}">${text}</a>
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

const render = (elements, state) => {
  // console.log('R')
  const {
    content, urlInput,
  } = elements;

  watch(state, 'urlState', () => {
    const { urlState } = state;
    switch (urlState) {
      case 'valid': {
        urlInput.classList.add('is-valid');
        urlInput.classList.remove('is-invalid');
        break;
      }
      case 'invalid': {
        urlInput.classList.add('is-invalid');
        urlInput.classList.remove('is-valid');
        break;
      }
      default: {
        urlInput.classList.remove('is-valid');
        urlInput.classList.remove('is-invalid');
      }
    }
  });

  watch(state, 'feedList', () => {
    content.innerHTML = '';
    state.feedList.forEach((l) => {
      const { title, description, items } = l;
      const div = document.createElement('div');
      div.classList.add('card', 'mt-5');
      const text = `
        <div class="card mb-0">
          <div class="card-header">
            ${title}
          </div>
          <div class="card-body pb-1">
            <p class="card-text">${description}</p>
            ${renderItems(items)}
          </div>
        </div>
      `;
      div.innerHTML = text;
      content.prepend(div);
    });
  });
};

export default render;
