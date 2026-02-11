
/**
 * Mock email service to simulate sending reservation confirmations.
 * In a production environment, this would call a backend API or a service like SendGrid/Mailgun.
 */
export const sendEmail = async (to: string, subject: string, body: string): Promise<boolean> => {
  console.log(`[Email Service] Sending email to: ${to}`);
  console.log(`[Email Service] Subject: ${subject}`);
  console.log(`[Email Service] Body: ${body}`);

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // In this mock, we assume success
  return true;
};
