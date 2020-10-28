const axios = require('axios');
const query = require('./query');

module.exports = (
  token,
  cursor,
  pageLength,
  urlAPI = 'https://api.github.com/graphql'
) => {
  return axios
    .post(
      urlAPI,
      {
        query: query(cursor, pageLength),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => {
      return response.data.data.search;
    });
};
