const getItemLink = (item) => {
  const linkElement = item.querySelector('link');
  const link = linkElement.textContent;
  return link;
};

const getItemContent = (item) => {
  const contentElement = item.querySelector('description');
  const content = contentElement.textContent;
  return content;
};

const parse = (rss) => {
  const titleElement = rss.querySelector('title');
  const title = titleElement.textContent;
  const descriptionElement = rss.querySelector('description');
  const description = descriptionElement.textContent;
  const itemElements = rss.querySelectorAll('item');
  console.log(itemElements[0]);
  const items = [...itemElements].map((i) => ({ text: getItemContent(i), link: getItemLink(i) }));
  return {
    title,
    description,
    items,
  };
};

export default parse;
