const d = require('download-git-repo');
const { exec } = require('child_process');
const { promisify } = require('util');
const rimraf = require('rimraf');
const ObjectsToCsv = require('objects-to-csv');
const l = require('./utils/logger');

const executeCommand = promisify(exec);

async function store(file, data, tag) {
  console.log(`${tag} Salvando...`);
  return new ObjectsToCsv([data])
    .toDisk(file, {
      append: true,
      bom: true,
    })
    .then(() => {
      l.success(`${tag} Salvo em ${file}`);
    });
}

function download(nameWithOwner, path) {
  return new Promise((resolve, reject) => {
    d(nameWithOwner, path, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

async function clone(nameWithOwner, tag) {
  const split = nameWithOwner.split('/');
  const path = `./temp/${split[0]}-${split[1]}`;

  l.status(`${tag} Baixando ${nameWithOwner} para ${path}`);
  return download(nameWithOwner, path).then(async () => {
    l.log(`${tag} Analisando LOC, SLOC e CLOC...`);
    const { stdout } = await executeCommand(
      `sloc ${path} --keys total,source,comment`
    );

    const output = stdout
      .replace(/\D/gim, ' ')
      .split(' ')
      .filter((e) => e);

    const results = {
      total: parseInt(output[0], 10),
      source: parseInt(output[1], 10),
      comments: parseInt(output[2], 10),
    };

    try {
      l.log(`${tag} Análise feita. Apagando ${path}`);
      rimraf.sync(path);
    } catch (error) {
      l.error(`${tag} Não foi possível apagar ${path}:`, error.message);
      l.log(`${tag} Continuando para o próximo...`);
    }

    return {
      // eslint-disable-next-line no-restricted-globals
      total: isNaN(results.total) ? 0 : results.total,
      // eslint-disable-next-line no-restricted-globals
      source: isNaN(results.source) ? 0 : results.source,
      // eslint-disable-next-line no-restricted-globals
      comments: isNaN(results.comments) ? 0 : results.comments,
    };
  });
}

async function init(repos, tag, file) {
  for (let i = 0; i < repos.length; i += 1) {
    const repo = repos[i];
    // eslint-disable-next-line no-await-in-loop
    const results = await clone(repo['<usuário>/<repositório>'], tag);
    // eslint-disable-next-line no-param-reassign
    repos[i].LOC = results.total;
    // eslint-disable-next-line no-param-reassign
    repos[i].SLOC = results.source;
    // eslint-disable-next-line no-param-reassign
    repos[i].CLOC = results.comments;
    // eslint-disable-next-line no-await-in-loop
    await store(file, repos[i], tag);
  }
}

module.exports = (repos, tag, file) => {
  return init(repos, tag, file);
};
