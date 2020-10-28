module.exports = (cursor, language) => {
  const after = cursor ? `, after: "${cursor}"` : '';

  return `
  {
    search(type: REPOSITORY, query: "stars:>100 language:${language}", first: 5${after}) {
      repositoryCount
      pageInfo {
        endCursor
      }
      nodes {
        ... on Repository {
          nameWithOwner
          stargazerCount
          createdAt
          forkCount
          watchers {
            totalCount
          }
          releases {
            totalCount
          }
        }
      }
    }
  }  
  `;
};
