// lib/emailService.js
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
// dotenv is loaded at the application entry point (e.g., index.js),
// so process.env variables should be available here.

const awsRegion = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const sesFromEmail = process.env.SES_FROM_EMAIL;

let sesClientInstance = null;

if (!accessKeyId || !secretAccessKey || !awsRegion || !sesFromEmail) {
  console.warn(
    "WARNING: AWS SES environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, SES_FROM_EMAIL) are not fully configured. " +
    "Email sending will be disabled. Please check your .env file."
  );
} else {
  try {
    sesClientInstance = new SESClient({
      region: awsRegion,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
    console.log(`AWS SES Client configured successfully for region: ${awsRegion} and default sender: ${sesFromEmail}`);
  } catch (error) {
    console.error("Error configuring AWS SES Client:", error);
    // sesClientInstance will remain null
  }
}

/**
 * For AWS SES to send emails to unverified email addresses from unverified sender addresses,
 * the SES account must be moved out of the sandbox environment by AWS.
 *
 * The SES_FROM_EMAIL must be a verified identity (either a domain or an email address)
 * in the AWS SES console for the specified AWS_REGION.
 *
 * During development and testing in the sandbox, all recipient email addresses must also be verified,
 * unless sending from the SES Mailbox Simulator.
 */

/**
 * Sends an email using AWS SES.
 * @param {object} params - The email parameters.
 * @param {string|string[]} params.to - The recipient email address(es). Can be a single string or an array of strings.
 * @param {string} params.subject - The email subject.
 * @param {string} params.htmlBody - The HTML body of the email.
 * @param {string} params.textBody - The plain text body of the email.
 * @returns {Promise<{success: boolean, messageId?: string, error?: any}>}
 */
async function sendEmail({ to, subject, htmlBody, textBody }) {
  if (!sesClientInstance) { // Check if the client was initialized
    console.error("SES Client not initialized. Email not sent. Check AWS configuration in .env file.");
    // Consider throwing an error here or ensuring this case is handled by callers if email is critical
    return { success: false, error: "Email service not configured." };
  }
  if (!SES_FROM_EMAIL) { // Should ideally be caught by client init check too, but good for defense
    console.error("SES_FROM_EMAIL not configured in .env file. Email not sent.");
    return { success: false, error: "Sender email not configured." };
  }

  const emailParams = {
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to],
      // CcAddresses: [], // Optional
      // BccAddresses: [], // Optional
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlBody,
        },
        Text: {
          Charset: "UTF-8",
          Data: textBody,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: SES_FROM_EMAIL,
    // ReplyToAddresses: [SES_FROM_EMAIL], // Optional: Set if you want replies to go to a different address
  };

  try {
    const command = new SendEmailCommand(emailParams);
    const data = await sesClientInstance.send(command);
    console.log(`Email sent successfully to ${Array.isArray(to) ? to.join(', ') : to}: Message ID - ${data.MessageId}`);
    return { success: true, messageId: data.MessageId };
  } catch (error) {
    console.error(`Error sending email via SES to ${Array.isArray(to) ? to.join(', ') : to}:`, error);
    // Provide more context if possible, e.g., error.name, error.message
    // SES errors can be specific (e.g., MessageRejected, MailFromDomainNotVerifiedException)
    return { success: false, error: error.message || "Failed to send email via SES." };
  }
}

module.exports = {
  sesClient: sesClientInstance,
  SES_FROM_EMAIL: sesFromEmail,
  sendEmail, // Add the new function
};
