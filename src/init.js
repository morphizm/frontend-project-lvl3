import { string, object } from 'yup';
// import uniqueId from 'lodash/uniqueId';
import { uniqueId } from 'lodash';
import i18next from 'i18next';
import axios from 'axios';

import './styles/custom.scss';
import parse from './xmlParser';
import initWatchers from './view';
import resources from './locales';

i18next.init({
  lng: 'en',
  debug: true,
  resources,
});

const updateValidationState = (state) => {
  const { feedList, form: { fields } } = state;
  const { url } = fields;

  const hasFeedListCurrentUrl = !feedList.every((list) => list.url !== url);
  const schema = object({
    url: string().required().url().test(() => !hasFeedListCurrentUrl),
  });

  try {
    schema.validateSync(fields);
    state.errors = {};
    state.form.valid = true;
  } catch (e) {
    state.errors = { [e.path]: true };
    state.form.valid = false;
  }
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
        const { title, description, items } = parse(data);
        const newFeed = {
          id: uniqueId(),
          url: form.fields.url,
          title,
          description,
        };
        const postsWithId = items.map((post) => (
          { ...post, id: uniqueId(), feedId: newFeed.id }
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
            { ...post, id: uniqueId(), feedId: id }
          ));

          feed.publishDate = newFeedPublishDate;
          state.posts.push(...postsWithId);
        });
    });
    setTimeout(getDifferenceByFeedPosts, 5000);
  };

  setTimeout(getDifferenceByFeedPosts, 5000);
  initWatchers(elements, state);
};
