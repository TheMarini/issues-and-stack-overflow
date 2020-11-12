/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
// API url
const API = 'https://api.stackexchange.com/2.2/search/advanced';
// Returned attributes filter
const filterId = '!4(EH5lWNG)R3L7Drl';
// Default params besides page, pageSize and query
const defaultParams = `?site=stackoverflow&order=desc&sort=votes&filter=${filterId}`;
// Axios config
const axios = require('axios').create({ baseURL: API });
// Sleep function for API requests per second limit
const sleep = require('./sleep');
// Logger
const l = require('./logger');

function fetch(params) {
  return axios
    .get(params)
    .then((res) => res)
    .catch((e) => {
      l.error(
        'Erro na requisição: ',
        e.response.data.error_message || e.response
      );
    });
}

async function getMetrics(query, tag) {
  // Metrics returned
  const metrics = {
    qtdQuestions: 0,
    qtdAnswers: 0,
    qtdViews: 0,
  };

  // Page control
  let page = 1;
  const pageSize = 100;

  // More pages flag
  let hasMore = true;

  // While has more pages
  while (hasMore) {
    const res = await fetch(
      `${defaultParams}&page=${page}&pageSize=${pageSize}&q=${query}`
    );

    l.info(
      `${tag} Nº de requisições restantes a API do StackOverflow:`,
      res.data.quota_remaining,
      '/',
      res.data.quota_max
    );

    metrics.qtdQuestions = res.data.total;
    metrics.qtdAnswers += res.data.items.reduce(
      (total, question) => total + question.answer_count,
      0
    );
    metrics.qtdViews += res.data.items.reduce(
      (total, question) => total + question.view_count,
      0
    );

    // API requests per second limit
    await sleep(1000);

    hasMore = res.data.has_more;
    page += 1;
  }

  return metrics;
}

module.exports = async (data, tag) => {
  l.log(`${tag} Buscando métricas no StackOverflow...`);

  // Open issues
  for (const issue of data.openIssues) {
    const metrics = await getMetrics(
      `${issue['<usuário>/<repositório>']} ${issue['Número']}`,
      tag
    );
    issue['Nº de perguntas no SO'] = metrics.qtdQuestions;
    issue['Nº de respostas no SO'] = metrics.qtdAnswers;
    issue['Nº de visualizações no SO'] = metrics.qtdViews;
  }

  // Closed issues
  for (const issue of data.closedIssues) {
    const metrics = await getMetrics(
      `${issue['<usuário>/<repositório>']} ${issue['Número']}`,
      tag
    );
    issue['Nº de perguntas no SO'] = metrics.qtdQuestions;
    issue['Nº de respostas no SO'] = metrics.qtdAnswers;
    issue['Nº de visualizações no SO'] = metrics.qtdViews;
  }

  return data;
};
