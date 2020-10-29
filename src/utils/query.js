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
  `;
};
