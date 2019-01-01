const nock = require("nock");
module.exports = () => {
  process.env.NODE_ENV = "test";
  process.env.TEST_PORT = 0;
  nock("https://api.sendgrid.com")
    .post("/v3/mail/send")
    .reply(200, {
      message: "success"
  });
};

