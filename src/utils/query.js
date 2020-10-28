module.exports = (cursor, pageLength = 5) => {
  const after = cursor ? `, after: "${cursor}"` : '';

  return `
  {
    search(type: REPOSITORY, query: "stars:>100 sort:stars", first: ${pageLength}${after}) {
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
