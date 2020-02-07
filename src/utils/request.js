import axios from 'axios';

const doRequest = (urlName, proxy) => axios.get(`https://${proxy}/${urlName}`);

export default doRequest;
