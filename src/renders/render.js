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

export const renderValidBorder = (element, isValid) => {
  if (isValid) {
    element.classList.add('is-valid');
    element.classList.remove('is-invalid');
  } else {
    element.classList.add('is-invalid');
    element.classList.remove('is-valid');
  }
};

const render = (element, data) => {
  const { title, description, items } = data;
  const div = document.createElement('div');
  div.classList.add('card');
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
  element.prepend(div);
};

export default render;
