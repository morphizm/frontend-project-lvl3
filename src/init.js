import '@babel/polyfill';
import 'bootstrap';
import axios from 'axios';
import validator from 'validator';
import './custom.scss';
import parse from './rssparser';
import render from './render';

export default () => {
  const state = {
    feedList: [],
    currentURL: null,

  };
  const container = document.querySelector('.container');
  const content = document.querySelector('.content');

  // VALIDATION: URL, HAS,
  // class is-valid; is-invalid
  // setAttribute('disabled', true);
  // const form = document.querySelector('button');
  // form.setAttribute('disabled', true);

  const proxy = 'cors-anywhere.herokuapp.com';
  const loremRss = 'lorem-rss.herokuapp.com/feed';
  // const repl = 'repl.it/@enmalafeev/RSS-reader'

  const form = container.querySelector('form');
  const input = form.querySelector('input');

  const handleChange = (e) => {
    state.currentURL = e.target.value;
    console.log(state);
  };
  input.addEventListener('change', handleChange);

  const domparser = new DOMParser();

  const request = axios.get(`https://${proxy}/${loremRss}`)
    .then((e) => {
      console.log(e);
      const { data } = e;
      console.log(data);
      const parsedData = domparser.parseFromString(data, 'text/xml');
      console.log(parsedData);
      console.log(parse(parsedData));
      render(content, parse(parsedData));
    })
    // eslint-disable-next-line no-console
    .catch(console.log);
  // return request;
};
