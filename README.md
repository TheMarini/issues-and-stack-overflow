# GitHub Issues e Stack Overflow Q&As
Uma análise se a discussão de issues nos repositórios mais populares do GitHub se refletem em perguntas e respostas relacionadas no Stack Overflow.

## :card_index: Sumário

1. [:label: Versões](#label-versões)
2. [:abacus: Dados](#abacus-dados)
3. [:information_source: Introdução](#information_source-introdução)
4. [:fire: Instalação](#fire-instalação)
5. [:busts_in_silhouette: Autores](#busts_in_silhouette-autores)

## :label: Versões

- [Sprint 3 (v0.3.0) - _current_](https://github.com/TheMarini/issues-and-stack-overflow/tree/v0.3.0)
- [Sprint 2 (v0.2.0)](https://github.com/TheMarini/issues-and-stack-overflow/tree/v0.2.0)
- [Sprint 1 (v0.1.0)](https://github.com/TheMarini/issues-and-stack-overflow/tree/v0.1.0)

**Obs.:** essa lista pode estar desatualizada conforme o lançamento de novas _releases_. A versão atualizada sempre estará no último lançamento feito, o qual se encontra na [branch main](https://github.com/TheMarini/issues-and-stack-overflow).

## :abacus: Dados

As métricas - e as futuras análises sobre elas - serão baseadas conforme os dados diponíveis em [`repos.csv`](https://github.com/TheMarini/issues-and-stack-overflow/blob/v0.3.0/data/repos.csv), [`open_issues.csv`](https://github.com/TheMarini/issues-and-stack-overflow/blob/v0.3.0/data/open_issues.csv) e [`closed_issues.csv`](https://github.com/TheMarini/issues-and-stack-overflow/blob/v0.3.0/data/closed_issues.csv) presentes neste repositório, obtidos em 11/11/2020 às 20h30 através do código e método descrito a seguir.

## :information_source: Introdução

Nesta terceira entrega do projeto, o objetivo foi o seguinte:

> **Sprint 03:** Mineração do Stack Overflow (consulta dos posts no Stack Overflow + valores das métricas do estudo)
> - Valor: 8 pontos
> - Entrega em 04/11/2020 até às 23:59 no Canvas e no SGA

Tendo isto em vista, foi desenvolvido um _script_ em Node.js que, a partir de um _token_ da API do GitHub, realiza uma busca paginada da _query_ GraphQL a seguir enquanto, paralelamente, os resultados são salvos nos respectivos arquivos CSV:

- [`repos.csv`](https://github.com/TheMarini/issues-and-stack-overflow/blob/v0.3.0/data/repos.csv): métricas dos repositórios;
- [`open_issues.csv`](https://github.com/TheMarini/issues-and-stack-overflow/blob/v0.3.0/data/open_issues.csv): métricas das _issues_ abertas de cada repositório;
- [`closed_issues.csv`](https://github.com/TheMarini/issues-and-stack-overflow/blob/v0.3.0/data/closed_issues.csv): métricas das _issues_ fechadas de cada repositório;

```GraphQL
  {
    search(type: REPOSITORY, query: "stars:>100 sort:stars", first: 100) {
      repositoryCount
      pageInfo {
        endCursor
      }
      nodes {
        ... on Repository {
          nameWithOwner
          stargazerCount
          primaryLanguage {
            name
          }
          totalIssues: issues {
            totalCount
          }
          openIssues: issues(states: [OPEN], orderBy: {field: COMMENTS, direction: DESC}, first: 5) {
            totalCount
            nodes {
              id
              number
              title
              createdAt
              updatedAt
              closedAt
              comments {
                totalCount
              }
            }
          }
          closedIssues: issues(states: [CLOSED], orderBy: {field: COMMENTS, direction: DESC}, first: 5) {
            totalCount
            nodes {
              id
              number
              title
              createdAt
              updatedAt
              closedAt
              comments {
                totalCount
              }
            }
          }
        }
      }
    }
  }
```
**:warning: AVISO:** devido há limitações da API do GitHub, só é possível ter uma boa taxa de sucesso na requisição da _query_ acima se ela for feita de 4 em 4 resultados. Por isto, este é o número máximo de resultados por página configurado no código, necessitando então de 25 requisições no total para se chegar aos 100 desejados.

### Repositórios sem _issues_

Ao longo da busca, os repositórios que não possuirem _issues_ são descartados, contabilizados e informados ao usuário para que seja possível identificar o défict faltante até o nº de resultados almejado. Por exemplo, em uma execução realizada no dia 28/10/2020 às 23h00, 7 dos 100 repositórios retornados foram descartados, por isto a quantidade de páginas a serem retornadas foi aumentada de 25 para 30, de acordo com as seguintes variáveis em `index.js`:

```Javascript
// Quantity of pages as objective
const pages = 30;
// Quantity of results by page
const pageLength = 4;
```

Desta forma é possível obter um número superior ao desejado com o objetivo de previnir a ocorrência de repositórios sem _issues_.

### Métricas do Stack Overflow

Conforme os resultados das páginas são retornados, para cada _issue_ é realizado uma busca para a API do Stack Overflow na rota `/search/advanced` com o termo `<usuário>/<repositório> <número da issue>`. Além disso, o filtro `!4(EH5lWNG)R3L7Drl` é ultilizado para que só seja retornado as métricas necessárias. 

Exemplo de busca realizada: https://api.stackexchange.com/docs/advanced-search#page=1&order=desc&sort=votes&q=vue%2Fvuejs%202873&filter=!4(EH5lWNG)R3L7Drl&site=stackoverflow&run=true 

## :fire: Instalação

1. Instale as dependências:
    ```
    npm install
    ```
2. (Recomendado) Crie a váriável de ambiente `TOKEN` a partir de um arquivo `.env`, na raiz do projeto, com o seguinte conteúdo:
   ```
   TOKEN=seu_token_do_GitHub_API
   ```
   :information_source: Não se preocupe, caso não queira realizar o item acima, poderá informar seu _token_ diretamente na linha de comando.
3. Execute:
    ```
    npm start
    ```
4. Pronto, agora é só esperar e os resultados estarão no diretório `/data` (a partir da raiz do projeto) com o nome `repos.csv`, `open_issues.csv` e `closed_issues.csv` :heavy_check_mark:

## :busts_in_silhouette: Autores

- [Bruno Marini](https://github.com/TheMarini)
- [Guilherme Willer](https://github.com/guigawiller)


