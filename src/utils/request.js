import axios from 'axios';
// import url from 'url';

// eslint-disable-next-line arrow-body-style
const request = (urlName, proxy) => {
  // const resultUrl = new URL(urlName);
  // console.log(resultUrl)
  // return axios.get(resultUrl.href);
  return axios.get(`https://${proxy}/${urlName}`);
};

export default request;
