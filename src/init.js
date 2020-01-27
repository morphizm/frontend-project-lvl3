import '@babel/polyfill';
import 'bootstrap';
import axios from 'axios';
import WatchJS from 'melanke-watchjs';
import validator from 'validator';
import './styles/custom.scss';
import parse from './rssparser';
import render, { renderValidBorder } from './render';

// setAttribute('disabled', true);
const doRequest = (url, proxy) => {
  return axios.get(`https://${proxy}/${url}`);
};

export default () => {
  const state = {
    feedList: ['a.ru'],
    currentURL: null,
    isValidURL: false,
  };
  const container = document.querySelector('.container');
  const content = document.querySelector('.content');
  const form = container.querySelector('form');
  const input = form.querySelector('input');

  const proxy = 'cors-anywhere.herokuapp.com';
  const loremRss = 'lorem-rss.herokuapp.com/feed';
  // const repl = 'repl.it/@enmalafeev/RSS-reader'

  const handleChange = (e) => {
    state.currentURL = e.target.value;
  };
  input.addEventListener('change', handleChange);
  const { watch } = WatchJS;

  watch(state, 'currentURL', () => {
    const isValidURL = validator.isURL(state.currentURL);
    const hasFeedListURL = state.feedList.every((e) => e !== state.currentURL);
    renderValidBorder(input, isValidURL && hasFeedListURL);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('SUBMIT')
    const { feedList, currentURL, isValidURL } = state;
    if (isValidURL) {
      return;
    }
    let isLoading = true;

    doRequest(currentURL, proxy)
      .then(() => {

      })
      // eslint-disable-next-line no-console
      .catch(console.log)
      .finally(() => { isLoading = false; });
  };

  form.addEventListener('submit', handleSubmit);

  const domparser = new DOMParser();

  // let isLoading = true;
  doRequest(loremRss, proxy)
    .then((e) => {
      // console.log(e);
      const { data } = e;
      // console.log(data);
      const parsedData = domparser.parseFromString(data, 'text/xml');
      // console.log(parsedData);
      // console.log(parse(parsedData));
      render(content, parse(parsedData));
    })
    // eslint-disable-next-line no-console
    .catch(console.log)
    // .finally(() => { isLoading = false; });
};
