import axios from 'axios';

export const doRequest = (urlName, proxy) => axios.get(`https://${proxy}/${urlName}`);

export const makeUrl = (value) => {
  try {
    const url = new URL(value, `https://${value}`);
    // console.log(url)
    return url.href;
  } catch {
    return value;
  }
};

// export default doRequest;
