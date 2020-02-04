import '@babel/polyfill';
import 'bootstrap';
import axios from 'axios';
import { string } from 'yup';
import _ from 'lodash';
import { watch } from 'melanke-watchjs';

import './styles/custom.scss';
import parse from './parsers/rssparser';
import render from './view';

const doRequest = (url, proxy) => {
  return axios.get(`https://${proxy}/${url}`);
};

// Предпочитайте композицию (пайплайн) вместо матрешки функций.
// valid, invalid, blank
export default () => {
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

  // const repl = 'repl.it/@enmalafeev/RSS-reader'
  const proxy = 'cors-anywhere.herokuapp.com';
  const loremRss = 'lorem-rss.herokuapp.com/feed';

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
        state.urlState = result && hasFeedListURL ? 'valid' : 'invalid';
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { feedList, currentURL, urlState } = state;
    if (urlState !== 'valid') {
      return;
    }

    doRequest(currentURL, proxy)
      .then(() => {

      });
  };

  elements.urlInput.addEventListener('input', handleChange);
  elements.form.addEventListener('submit', handleSubmit);

  const domparser = new DOMParser();

  doRequest(loremRss, proxy)
    .then((e) => {
      const { data } = e;
      const parsedData = domparser.parseFromString(data, 'text/xml');
      const p = parse(parsedData);
      const newFeed = {
        id: _.uniqueId(),
        ...parse(parsedData),
      };
      state.feedList.push(newFeed);
      console.log(p);
    });

  render(elements, state);
};
