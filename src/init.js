import '@babel/polyfill';
import 'bootstrap';
import { string } from 'yup';
import _ from 'lodash';
import i18next from 'i18next';

import './styles/custom.scss';
import parse from './parsers/rssParser';
import render from './view';
import resources from './locales';
import request from './utils/request';

i18next.init({
  lng: 'en',
  debug: true,
  resources,
});

// Предпочитайте композицию (пайплайн) вместо матрешки функций.
// valid, invalid, blank
export default () => {
  const initLink = {
    id: _.uniqueId(),
    url: 'http://a.ru',
    title: 'My title',
    description: 'My description',
    posts: [],
  };

  const state = {
    feedList: [initLink],
    currentUrl: '',
    urlState: 'blank',
    formState: 'filling',
    errors: {},
    posts: [{ text: 'My text', link: 'my link' }],
  };

  // const repl = 'repl.it/@enmalafeev/RSS-reader';
  const proxy = 'cors-anywhere.herokuapp.com';
  const loremRss = 'https://lorem-rss.herokuapp.com/feed';
  // const cv = 'https://cv.hexlet.io/resumes.rss';

  const elements = {
    container: document.querySelector('.container'),
    content: document.querySelector('.content'),
    form: document.querySelector('form'),
    urlInput: document.querySelector('input'),
    submit: document.querySelector('[type="submit"]'),
  };

  const handleInput = ({ target: { value } }) => {
    state.currentUrl = value;
    if (value === '') {
      state.urlState = 'blank';
      return;
    }

    const schema = string().url();
    const hasFeedListURL = state.feedList.every((l) => l.url !== state.currentUrl);
    schema.isValid(state.currentUrl)
      .then((result) => {
        state.urlState = (result && hasFeedListURL) ? 'valid' : 'invalid';
      });
  };

  const domparser = new DOMParser();
  const handleSubmit = (e) => {
    e.preventDefault();
    const {
      feedList, currentUrl, urlState, posts,
    } = state;
    if ((urlState !== 'valid') || state.formState !== 'filling') {
      return;
    }
    state.formState = 'pending';
    request(currentUrl, proxy)
      .then((result) => {
        const { data } = result;
        const rssDocument = domparser.parseFromString(data, 'text/xml');
        const { title, description, items } = parse(rssDocument);
        const newFeed = {
          url: currentUrl,
          id: _.uniqueId(),
          title,
          description,
        };
        const postsWithId = items.map((post) => (
          { ...post, id: _.uniqueId(), feedId: newFeed.id }
        ));

        feedList.push(newFeed);
        posts.push(...postsWithId);
      }).catch(() => {
        state.formState = 'failure';
      }).finally(() => {
        state.currentUrl = '';
        state.urlState = 'blank';
        state.formState = 'filling';
      });
  };

  elements.urlInput.addEventListener('input', handleInput);
  elements.form.addEventListener('submit', handleSubmit);

  request(loremRss, proxy)
    .then((e) => {
      const { data } = e;
      const rssDocument = domparser.parseFromString(data, 'text/xml');
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
