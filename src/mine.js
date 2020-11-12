const ObjectsToCsv = require('objects-to-csv');
const stackOverflow = require('./utils/stackOverflow');
const fetch = require('./utils/fetch');
const l = require('./utils/logger');

class Mine {
  constructor(objective, pageLength) {
    this.objective = objective;
    this.pageLength = pageLength;
    this.file = './data/results.csv';
    this.current = 1;
    this.cursor = null;
    this.discarded = 0;
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
    l.info(`Veja o resultados em ./data :D`);
  }

  async dig(token, tag) {
    try {
      await fetch(token, this.cursor, this.pageLength).then(async (res) => {
        this.cursor = res.pageInfo.endCursor || null;
        this.current += 1;
        await stackOverflow(this.polish(res.nodes, tag), tag).then(
          async (data) => {
            console.log(`${tag} Salvando as métricas dos repositórios...`);
            await Mine.store('./data/repos.csv', data.repos, tag);
            console.log(`${tag} Salvando as métricas das issues abertas...`);
            await Mine.store('./data/open_issues.csv', data.openIssues, tag);
            console.log(`${tag} Salvando as métricas das issues fechadas...`);
            await Mine.store(
              './data/closed_issues.csv',
              data.closedIssues,
              tag
            );
          }
        );
      });
    } catch (e) {
      l.error(`${tag} Erro na requisição:`, e.message);
      l.info(`${tag} Tentando novamente...`);
    }
  }

  static async store(file, data, tag) {
    return new ObjectsToCsv(data)
      .toDisk(file, {
        append: true,
        bom: true,
      })
      .then(() => {
        l.success(`${tag} Resultados da página salvos em ${file}`);
      });
  }

  polish(dirt, tag) {
    console.log(`${tag} Formatando página...`);
    const temp = dirt.map((repo) => {
      return {
        repo: {
          '<usuário>/<repositório>': repo.nameWithOwner,
          'Nº de estrelas': repo.stargazerCount,
          'Linguagem principal': repo.primaryLanguage
            ? repo.primaryLanguage.name
            : 'N/A',
          'Nº de issues': repo.totalIssues.totalCount,
          'Nº de issues abertas': repo.openIssues.totalCount,
          'Nº de issues fechadas': repo.closedIssues.totalCount,
          'Proporção de issues fechadas': (
            repo.closedIssues.totalCount / repo.totalIssues.totalCount || 0
          ).toFixed(2),
        },
        issues: {
          open: repo.openIssues.nodes.map((issue) => {
            return {
              '<usuário>/<repositório>': repo.nameWithOwner,
              ID: issue.id,
              Número: issue.number,
              Titulo: issue.title,
              'Nº de comentários': issue.comments.totalCount,
              'Data de criação': issue.createdAt,
              'Data da última atualização': issue.updatedAt,
              'Data de conclusão': '-',
            };
          }),
          closed: repo.closedIssues.nodes.map((issue) => {
            return {
              '<usuário>/<repositório>': repo.nameWithOwner,
              ID: issue.id,
              Número: issue.number,
              Titulo: issue.title,
              'Nº de comentários': issue.comments.totalCount,
              'Data de criação': issue.createdAt,
              'Data da última atualização': issue.updatedAt,
              'Data de conclusão': issue.closedAt,
            };
          }),
        },
      };
    });

    const repos = [];
    const openIssues = [];
    const closedIssues = [];

    temp.forEach((t) => {
      if (t.repo['Nº de issues'] > 0) {
        repos.push(t.repo);
        openIssues.push(...t.issues.open);
        closedIssues.push(...t.issues.closed);
      } else {
        l.status(
          `${tag} Repositório ${t.repo['<usuário>/<repositório>']} descartado por não possuir issues`
        );
        this.discarded += 1;
        l.info(`${tag} Total de repositórios descartados:`, this.discarded);
      }
    });

    return {
      repos,
      openIssues,
      closedIssues,
    };
  }
}

module.exports = Mine;
