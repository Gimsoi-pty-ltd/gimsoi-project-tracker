// Color tokens (matches frontend)
// Primary:    #002D62  (navy blue)
// Dark:       #011f44  (deep navy)
// Background: #f4f4f4  (light card bg)
// Text:       #333333

const STYLES = {
  body: 'font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;',
  header: 'background: linear-gradient(to right, #002D62, #011f44); padding: 24px 20px; text-align: center; border-radius: 5px 5px 0 0;',
  h1: 'color: white; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;',
  card: 'background-color: #f4f4f4; padding: 28px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);',
  code: 'font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #002D62;',
  badge: 'background-color: #002D62; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 28px;',
  btn: 'background-color: #002D62; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block;',
  footer: 'text-align: center; margin-top: 20px; color: #888; font-size: 0.78em;',
};

const layout = (title, headerText, bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="${STYLES.body}">
  <div style="${STYLES.header}">
    <h1 style="${STYLES.h1}">${headerText}</h1>
  </div>
  <div style="${STYLES.card}">
    ${bodyContent}
    <p>Best regards,<br><strong>The Gimsoi Team</strong></p>
  </div>
  <div style="${STYLES.footer}">
    <p>This is an automated message — please do not reply.</p>
  </div>
</body>
</html>
`;

export const VERIFICATION_EMAIL_TEMPLATE = layout(
  'Verify Your Email',
  'Verify Your Email',
  `
    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="${STYLES.code}">{verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration.
       It expires in <strong>15 minutes</strong>.</p>
    <p>If you didn't create an account, you can safely ignore this email.</p>
  `
);

export const PASSWORD_RESET_SUCCESS_TEMPLATE = layout(
  'Password Reset Successful',
  'Password Reset Successful',
  `
    <p>Hello,</p>
    <p>Your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="${STYLES.badge}">✓</div>
    </div>
    <p>If you did not initiate this reset, contact support immediately.</p>
    <p>For your security:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Avoid reusing passwords across sites</li>
    </ul>
  `
);

export const PASSWORD_RESET_REQUEST_TEMPLATE = layout(
  'Reset Your Password',
  'Password Reset',
  `
    <p>Hello,</p>
    <p>We received a request to reset your password.
       If you didn't request this, you can ignore this email.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="${STYLES.btn}">Reset Password</a>
    </div>
    <p>This link expires in <strong>1 hour</strong>.</p>
  `
);

export const WELCOME_EMAIL_TEMPLATE = layout(
  'Welcome to Gimsoi',
  'Welcome Aboard!',
  `
    <p>Hello {name},</p>
    <p>Your email is verified and your account is now active. Here's how to get started:</p>
    <ul>
      <li>Complete your profile</li>
      <li>Explore the dashboard</li>
      <li>Check out the latest updates</li>
    </ul>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{loginURL}" style="${STYLES.btn}">Go to Dashboard</a>
    </div>
    <p>If you have any questions, our support team is here to help.</p>
  `
);
