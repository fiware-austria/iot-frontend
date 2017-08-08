export interface GitHubUser {
  username: string,
  provider: string,
  emails: [{
    value: string,
    primary: boolean,
    verified: boolean
  }]
}


