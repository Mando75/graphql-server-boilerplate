# GraphQL Server boilerplate
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/5f37e282e69c47dd859b1c35fc00afea)](https://www.codacy.com/app/Mando75/graphql-server-boilerplate?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Mando75/graphql-server-boilerplate&amp;utm_campaign=Badge_Grade)

Boilerplate code for an Apollo Server with Typescript, TypeORM, Jest, Postgresql, Redis, and SendGrid. 

# Description
This project provides a boilerplate codebase for building scalable and modular GraphQL APIs with Apollo Server. The boilerplate includes these features (which can be removed if desired)
    * Basic user registration
    * User registration through 3rd party OAuth providers
    * Account email verification
    * Login and session handling

GraphQL is self documenting, so for a full reference of the provided API, clone the project and run it locally with GraphQLPlayground (provided with the repo).

# Install Instructions

1. Make sure you have Postgresql and Redis installed on your local machine.

2. Fork or clone the repository

3. Run `yarn install`

4. Make sure you have the following keys present in an `.env` file or as environmental variables
    * SENDGRID_API_KEY (for sending emails)
    * CODACY_PROJECT_TOKEN (if you want to report testing coverage on a forked repo)
    * SESSION_SECRET (Used to secure session cookies)
    * HOST (your local testing host, i.e. `http://localhost:4000`)
    
5. Run `yarn build && yarn start` (see `package.json` for additional scripts)
 
 # Contributing
 This project is not open to direct contributions at the moment, as it is still under heavy development. If you do find an issue or would like to raise a concern, please open an issue and I will address as soon as I can. 
