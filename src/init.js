import '@babel/polyfill';
import 'bootstrap';
import './_custom.scss';
import Example from './Example';

export default () => {
  const element = document.getElementById('container');
  const obj = new Example(element);
  // obj.init();
};
