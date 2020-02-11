import '@babel/polyfill';
import 'bootstrap';
import { string } from 'yup';
import _ from 'lodash';
import i18next from 'i18next';

import './styles/custom.scss';
import parse from './rssParser';
import render from './view';
import resources from './locales';
import { doRequest, makeUrl } from './utils';

i18next.init({
  lng: 'en',
  debug: true,
  resources,
});

const validate = (fields, options) => {
  const { feedList } = options;
  const { url } = fields;
  const errors = {};

  const schema = string().url();
  const hasFeedListCurrentUrl = !feedList.every((list) => list.url !== url);
  const isUrl = schema.isValidSync(url);
  if (hasFeedListCurrentUrl || !isUrl) {
    errors.url = true;
  }
  return errors;
};

const updateValidationState = (state) => {
  const { feedList, form: { fields } } = state;
  const errors = validate(fields, { feedList });
  state.errors = errors;
  state.form.valid = _.isEqual(errors, {});
};

export default () => {
  const state = {
    form: {
      processState: 'filling',
      fields: {
        url: '',
      },
      valid: false,
    },
    feedList: [],
    posts: [],
    errors: {},
  };

  const proxy = 'cors-anywhere.herokuapp.com';

  const elements = {
    container: document.querySelector('.container'),
    content: document.querySelector('.content'),
    form: document.querySelector('form'),
    urlInput: document.querySelector('input'),
    submit: document.querySelector('[type="submit"]'),
  };

  const handleInput = ({ target: { value } }) => {
    state.form.fields.url = makeUrl(value);
    updateValidationState(state);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const {
      feedList, posts, form,
    } = state;

    if (!form.valid || form.processState !== 'filling') {
      return;
    }
    form.processState = 'pending';
    doRequest(form.fields.url, proxy)
      .then(({ data }) => {
        // const rssDocument = domparser.parseFromString(data, 'text/xml');
        const { title, description, items } = parse(data);
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
      }).catch((error) => {
        state.errors = { error: error.name };
      }).finally(() => {
        form.fields.url = '';
        form.valid = false;
        form.processState = 'filling';
      });
  };

  elements.urlInput.addEventListener('input', handleInput);
  elements.form.addEventListener('submit', handleSubmit);

  const getNewFeedPosts = () => {
    const { feedList } = state;
    feedList.forEach((feed) => {
      const { url, id } = feed;
      const oldFeedPublishDate = feed.publishDate;
      doRequest(url, proxy)
        .then(({ data }) => {
          const parsedRss = parse(data);
          const newFeedPublishDate = parsedRss.publishDate;
          if (newFeedPublishDate === oldFeedPublishDate) {
            return;
          }
          const { items } = parsedRss;
          const newItems = items.filter((item) => {
            const { publishDate } = item;
            return oldFeedPublishDate < publishDate;
          });
          const postsWithId = newItems.map((post) => (
            { ...post, id: _.uniqueId(), feedId: id }
          ));

          feed.publishDate = newFeedPublishDate;
          state.posts.push(...postsWithId);
        });
    });
    setTimeout(getNewFeedPosts, 5000);
  };

  setTimeout(getNewFeedPosts, 5000);
  render(elements, state);
};
