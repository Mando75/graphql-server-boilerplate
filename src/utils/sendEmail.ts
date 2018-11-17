import * as sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export const sendConfirmEmail = async ({
  to,
  link
}: {
  to: string;
  link: string;
}) => {
  const msg = {
    to,
    from: "bryanmullerdev@gmail.com",
    subject: "Please confirm your email",
    html: `<html>
             <body>
               <p>Thank you for signing up! Please click on the link below to confirm your email</p>
               <a href="${link}">Please confirm your email</a>
             </body>
           </html>`
  };
  return await sgMail.send(msg);
};
