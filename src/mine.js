const moment = require('moment');
const ObjectsToCsv = require('objects-to-csv');
const fetch = require('./utils/fetch');
const l = require('./utils/logger');
const analysis = require('./analysis');

class Mine {
  constructor(objective, pageLength) {
    this.objective = objective;
    this.pageLength = pageLength;
    this.file = './data/results.csv';
    this.current = 1;
    this.cursor = null;
  }

  async start(token) {
    l.title('\n--- Iniciando busca ---');
    const digs = [];
    let tag = `[${this.current}/${this.objective}]`;
    while (this.current <= this.objective) {
      console.log(`${tag} Buscando página...`);
      // eslint-disable-next-line no-await-in-loop
      await this.dig(token, tag);
      tag = `[${this.current}/${this.objective}]`;
    }
    await Promise.all(digs);
    l.title('--- Fim da busca ---\n');
    l.info(`Veja o resultado em ${this.file} :D`);
  }

  async dig(token, tag) {
    try {
      await fetch(token, this.cursor, this.pageLength).then((res) => {
        this.cursor = res.pageInfo.endCursor || null;
        this.current += 1;
        const data = Mine.polish(res.nodes, tag);
        return analysis(data, tag, this.file);
      });
    } catch (e) {
      l.error(`${tag} Erro na requisição:`, e.message);
      l.info(`${tag} Tentando novamente...`);
    }
  }

  static async store(file, data, tag) {
    console.log(`${tag} Salvando...`);
    return new ObjectsToCsv(data)
      .toDisk(file, {
        append: true,
        bom: true,
      })
      .then(() => {
        l.success(`${tag} Resultados da página salvos em ${file}`);
      });
  }

  static polish(dirt, tag) {
    console.log(`${tag} Formatando página...`);
    return dirt.map((repo) => {
      return {
        '<usuário>/<repositório>': repo.nameWithOwner,
        Estrelas: repo.stargazerCount,
        'Idade (anos)': moment().diff(repo.createdAt, 'years', true).toFixed(2),
        'Data de criação': repo.createdAt,
        Forks: repo.forkCount,
        Watchers: repo.watchers.totalCount,
        Releases: repo.releases.totalCount,
      };
    });
  }
}

module.exports = Mine;
