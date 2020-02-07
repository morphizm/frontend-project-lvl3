const getPublishDate = (item) => {
  const pubDateElement = item.querySelector('pubDate');
  const publishDate = pubDateElement.textContent;
  return new Date(publishDate);
};

const getLink = (item) => {
  const linkElement = item.querySelector('link');
  return linkElement.textContent;
};

const getDescription = (item) => {
  const contentElement = item.querySelector('description');
  return contentElement.textContent;
};

const getTitle = (item) => {
  const titleElement = item.querySelector('title');
  return titleElement.textContent;
};

const parse = (rssDocument) => {
  const title = getTitle(rssDocument);
  const description = getDescription(rssDocument);
  const publishDate = getPublishDate(rssDocument);
  const itemElements = rssDocument.querySelectorAll('item');

  const items = [...itemElements].map((item) => (
    { text: getDescription(item), link: getLink(item), publishDate: getPublishDate(item) }));

  return {
    title,
    description,
    publishDate,
    items,
  };
};

export default parse;
