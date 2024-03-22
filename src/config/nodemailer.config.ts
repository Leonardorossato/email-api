import * as nodemailer from 'nodemailer';
import path from 'path';


export class EmailConfirmation {
  constructor(private readonly transporter: nodemailer) {}

  async sendMail(data: any) {
    const trasnportInfo = {
      host: process.env.NODEMAILER_HOST,
      port: Number(process.env.NODEMAILER_PORT),
      secure: false,
      adpter: 'smtp',
      template: {
        dir: path.resolve(__dirname, '..', '..', 'templates'),
        options: {
          extName: '.hbs',
          layoutsDir: path.resolve(__dirname, '..', '..', 'templates'),
        },
      },
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    };

    const transport = nodemailer.createTransport({ ...trasnportInfo });

    const info = {
      from: 'Hey <abc@gmail.com>',
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html,
    };

    await transport.sendMail(info, (err, info) => {
      if (err) {
        return err;
      } else {
        return info;
      }
    });

    return {
      message: 'Email sent successfully',
    };
  }
}
