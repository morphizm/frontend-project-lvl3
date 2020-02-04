import '@babel/polyfill';
import 'bootstrap';
import axios from 'axios';
import { string } from 'yup';
import _ from 'lodash';
import i18next from 'i18next';

import './styles/custom.scss';
import parse from './parsers/rssparser';
import render from './view';
import resources from './locales';

const doRequest = (url, proxy) => {
  return axios.get(`https://${proxy}/${url}`);
};

i18next.init({
  lng: 'en',
  debug: true,
  resources,
});

// Предпочитайте композицию (пайплайн) вместо матрешки функций.
// valid, invalid, blank
export default () => {
  const domparser = new DOMParser();
  const initLink = {
    id: _.uniqueId(),
    url: 'http://a.ru',
    title: 'My title',
    description: 'My description',
    items: [],
  };

  const state = {
    feedList: [initLink],
    currentURL: '',
    urlState: 'blank',
    errors: {},
  };

  const repl = 'repl.it/@enmalafeev/RSS-reader';
  const proxy = 'cors-anywhere.herokuapp.com';
  const loremRss = 'https://lorem-rss.herokuapp.com/feed';
  const cv = 'https://cv.hexlet.io/resumes.rss';

  const elements = {
    container: document.querySelector('.container'),
    content: document.querySelector('.content'),
    form: document.querySelector('form'),
    urlInput: document.querySelector('input'),
  };

  const handleChange = ({ target: { value } }) => {
    state.currentURL = value;
    if (value === '') {
      state.urlState = 'blank';
      return;
    }

    const schema = string().url();
    const hasFeedListURL = state.feedList.every((l) => l.url !== state.currentURL);
    schema.isValid(state.currentURL)
      .then((result) => {
        state.urlState = (result && hasFeedListURL) ? 'valid' : 'invalid';
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { feedList, currentURL, urlState } = state;
    if (urlState !== 'valid') {
      return;
    }

    doRequest(currentURL, proxy)
      .then((e) => {
        const { data } = e;
        const rssDocument = domparser.parseFromString(data, 'text/xml');
        const parsedData = parse(rssDocument);
        const newFeed = {
          url: currentURL,
          id: _.uniqueId(),
          ...parsedData,
        };
        feedList.push(newFeed);
      });
  };

  elements.urlInput.addEventListener('input', handleChange);
  elements.form.addEventListener('submit', handleSubmit);

  doRequest(loremRss, proxy)
    .then((e) => {
      const { data } = e;
      const rssDocument = domparser.parseFromString(data, 'text/xml');
      // console.log(parsedData)
      const parsedData = parse(rssDocument);
      const newFeed = {
        url: loremRss,
        id: _.uniqueId(),
        ...parsedData,
      };
      state.feedList.push(newFeed);
    });

  render(elements, state);
};
