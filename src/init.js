import { string } from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import axios from 'axios';

import './styles/custom.scss';
import parse from './xmlParser';
import render from './view';
import resources from './locales';
import { makeUrl, getRssData } from './utils';

i18next.init({
  lng: 'en',
  debug: true,
  resources,
});

const validate = (fields, options) => {
  const { feedList } = options;
  const { url } = fields;
  const errors = {};

  if (url) {
    const schema = string().url();
    const hasFeedListCurrentUrl = !feedList.every((list) => list.url !== url);
    const newUrl = makeUrl(url);
    const isUrl = schema.isValidSync(newUrl);
    if (hasFeedListCurrentUrl || !isUrl) {
      errors.url = true;
    }
  }

  return errors;
};

const validatePresense = (fields) => Object.values(fields).every((f) => f !== '');

const updateValidationState = (state) => {
  const { feedList, form: { fields } } = state;
  const errors = validate(fields, { feedList });
  state.errors = errors;
  state.form.valid = _.isEqual(errors, {}) && validatePresense(fields);
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
    state.form.fields.url = value;
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

    axios.get(`https://${proxy}/${form.fields.url}`)
      .then(({ data }) => {
        const rssDocument = parse(data);
        const { title, description, items } = getRssData(rssDocument);
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

  const getDifferenceByFeedPosts = () => {
    const { feedList } = state;
    feedList.forEach((feed) => {
      const { url, id } = feed;
      const oldFeedPublishDate = feed.publishDate;
      axios.get(`https://${proxy}/${url}`)
        .then(({ data }) => {
          const rssDocument = parse(data);
          const parsedRss = getRssData(rssDocument);
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
    setTimeout(getDifferenceByFeedPosts, 5000);
  };

  setTimeout(getDifferenceByFeedPosts, 5000);
  render(elements, state);
};
