process.env.TS_NODE_FILES = true;
require("ts-node/register");
const { startTestServer } = require("./startTestServer");
const nock = require("nock");
module.exports = async () => {
  process.env.NODE_ENV = "test";
  process.env.TEST_PORT = 0;
  if (!process.env.TEST_HOST) {
    await startTestServer();
  }
  nock("https://api.sendgrid.com")
    .post("/v3/mail/send")
    .reply(200, {
      message: "success"
    });
  return null;
};
