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

const updateValidationState = (state) => {
  
};

// Предпочитайте композицию (пайплайн) вместо матрешки функций.
// valid, invalid, blank
export default () => {
  const initLink = {
    id: _.uniqueId(),
    url: 'http://a.ru',
    title: 'My title',
    description: 'My description',
  };

  const state = {
    form: {
      processState: 'filling',
      fields: {
        url: '',
      },
      valid: false,
    },
    feedList: [initLink],
    posts: [{ text: 'My text', link: 'my link', feedId: initLink.id }],
    errors: {},
  };

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
    state.form.fields.url = value;
    if (value === '') {
      state.form.valid = false;
      return;
    }

    const schema = string().url();
    const hasFeedListURL = state.feedList.every((list) => list.url !== state.form.fields.url);
    schema.isValid('http://' + state.form.fields.url)
      .then((result) => {
        state.form.valid = (result && hasFeedListURL);
      });
  };

  const domparser = new DOMParser();
  const handleSubmit = (e) => {
    e.preventDefault();
    const {
      feedList, posts, form,
    } = state;

    if (!form.valid || form.processState !== 'filling') {
      return;
    }
    form.processState = 'pending';
    request(form.fields.url, proxy)
      .then((result) => {
        const { data } = result;
        const rssDocument = domparser.parseFromString(data, 'text/xml');
        const { title, description, items } = parse(rssDocument);
        const newFeed = {
          id: _.uniqueId(),
          url: form.fields.url,
          title,
          description,
        };
        const postsWithId = items.map((post) => (
          { ...post, id: _.uniqueId(), feedId: newFeed.id }
        ));

        feedList.push(newFeed);
        posts.push(...postsWithId);
      }).catch((e) => {
        // console.log(e)
        state.errors['404'] = 'Lol'
        form.processState = 'failure';
      }).finally(() => {
        form.fields.url = '';
        form.valid = false;
        form.processState = 'filling';
        state.errors = {};
      });
  };

  elements.urlInput.addEventListener('input', handleInput);
  elements.form.addEventListener('submit', handleSubmit);

  request(loremRss, proxy)
    .then((e) => {
      const { data } = e;
      const rssDocument = domparser.parseFromString(data, 'text/xml');
      const { title, description, items } = parse(rssDocument);
      const newFeed = {
        url: loremRss,
        id: _.uniqueId(),
        title,
        description,
      };
      const postsWithId = items.map((post) => (
        { ...post, id: _.uniqueId(), feedId: newFeed.id }
      ));

      state.feedList.push(newFeed);
      state.posts.push(...postsWithId);
    });

  render(elements, state);
};
