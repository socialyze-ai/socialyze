export const sendOtpTemplate = (
  otp: string,
  name: string,
): { subject: string; html: string } => {
  return {
    subject: '🎉 Welcome to Socialyze! Your OTP to Get Started',
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f3f4f6;
          padding: 20px;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 30px;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          color: #2c3e50;
        }
        .content {
          font-size: 16px;
          color: #34495e;
          margin-top: 20px;
        }
        .otp-box {
          background-color: #2ecc71;
          color: white;
          font-size: 20px;
          font-weight: bold;
          padding: 10px;
          text-align: center;
          margin-top: 20px;
          border-radius: 6px;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #7f8c8d;
          margin-top: 30px;
        }
      </style>
      <title>Welcome to Socialyze</title>
    </head>
    <body>
      <div class="container">
        <div class="header">Welcome to Socialyze!</div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>We're thrilled to have you on board! To get started, please use the OTP below to complete your registration:</p>
          <div class="otp-box">${otp}</div>
          <p>Don't worry, the OTP is only valid for a limited time, so use it soon!</p>
          <p>If you have any questions, feel free to reach out to us. We're here to help!</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Socialyze. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  };
};

// You can add other templates as needed
