const getPublishDate = (item) => {
  const pubDateElement = item.querySelector('pubDate');
  const publishDate = pubDateElement.textContent;
  return new Date(publishDate);
};

const getLink = (item) => {
  const linkElement = item.querySelector('link');
  const link = linkElement.textContent;
  return link;
};

const getDescription = (item) => {
  const contentElement = item.querySelector('description');
  const content = contentElement.textContent;
  return content;
};

const parse = (rssDocument) => {
  const titleElement = rssDocument.querySelector('title');
  const title = titleElement.textContent;
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
