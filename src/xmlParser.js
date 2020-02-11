const parse = (data) => {
  const domparser = new DOMParser();
  return domparser.parseFromString(data, 'text/xml');
};

export default parse;
