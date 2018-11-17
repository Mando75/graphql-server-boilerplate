const nock = require('nock');
module.exports = () => {
  process.env.NODE_ENV = "test";
  process.env.TEST_PORT = 4001;
  process.env.TEST_HOST = "http://localhost:4001";
  process.env.TEST_GRAPHQL_ENDPOINT = "http://localhost:4001/graphql";
  const mock_sg = nock('https://api.sendgrid.com').post('/v3/mail/send').reply(200, {
    message: 'success'
  })
};
