describe("mailerService", () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.MAILGUN_SMTP_USER;
    delete process.env.MAILGUN_SMTP_PASSWORD;
    delete process.env.MAIL_FROM;
  });

  afterEach(() => {
    delete process.env.MAILGUN_SMTP_USER;
    delete process.env.MAILGUN_SMTP_PASSWORD;
    delete process.env.MAIL_FROM;
  });

  function mockNodemailer(sendMailImpl?: jest.Mock) {
    const sendMailMock = sendMailImpl ?? jest.fn().mockResolvedValue({ messageId: "ok" });
    const createTransportMock = jest.fn(() => ({ sendMail: sendMailMock }));
    jest.doMock("nodemailer", () => ({ createTransport: createTransportMock }));
    return { sendMailMock, createTransportMock };
  }

  it("crée un transporter Mailgun via SMTP", () => {
    const { createTransportMock } = mockNodemailer();
    process.env.MAILGUN_SMTP_USER = "2021413@sandbox.mailgun.org";
    process.env.MAILGUN_SMTP_PASSWORD = "test-smtp-password";

    require("../services/mailerService.js");

    expect(createTransportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "smtp.mailgun.org",
        port: 587,
        auth: { user: "2021413@sandbox.mailgun.org", pass: "test-smtp-password" },
      }),
    );
  });

  it("sendMail envoie avec le MAIL_FROM configuré", async () => {
    const { sendMailMock } = mockNodemailer();
    process.env.MAIL_FROM = "CineTest <test@test.com>";

    const { sendMail } = require("../services/mailerService.js");
    await sendMail({ to: "user@test.com", subject: "Sujet", html: "<p>Body</p>" });

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "CineTest <test@test.com>",
        to: "user@test.com",
        subject: "Sujet",
        html: "<p>Body</p>",
      }),
    );
  });

  it("sendMail utilise le from par défaut si MAIL_FROM absent", async () => {
    const { sendMailMock } = mockNodemailer();

    const { sendMail } = require("../services/mailerService.js");
    await sendMail({ to: "user@test.com", subject: "Sujet", html: "<p>Body</p>" });

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({ from: "CineConnect <noreply@cineconnect.fr>" }),
    );
  });

  it("sendMail loggue l'erreur sans planter si le transport échoue", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockNodemailer(jest.fn().mockRejectedValue(new Error("SMTP unreachable")));

    const { sendMail } = require("../services/mailerService.js");
    await expect(
      sendMail({ to: "user@test.com", subject: "S", html: "<p>H</p>" }),
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      "[mailer] Erreur d'envoi d'email :",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});