import { Resend } from "resend";

let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not configured; emails will be skipped.");
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_ADDRESS = "DOMO <notifications@domo-app.com>";

async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const client = getResendClient();
  if (!client) return;

  try {
    await client.emails.send({ from: FROM_ADDRESS, to, subject, text });
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err);
  }
}

export async function notifyContractorsNewJob(
  contractors: Array<{ email: string | null | undefined; name: string }>,
  job: { id: number; title: string; category: string; location: string }
): Promise<void> {
  const jobs = contractors
    .filter((c) => !!c.email)
    .map((contractor) =>
      sendEmail(
        contractor.email!,
        `New job available: ${job.title}`,
        `Hi ${contractor.name},\n\nA new ${job.category} job has been posted in ${job.location}.\n\nTitle: ${job.title}\n\nLog in to DOMO to view the details and submit a quote.\n\nThe DOMO Team`
      )
    );
  await Promise.allSettled(jobs);
}

export async function notifyCustomerNewQuote(
  homeownerEmail: string,
  homeownerName: string,
  job: { id: number; title: string },
  contractorName: string,
  amount: number
): Promise<void> {
  const dollars = (amount / 100).toFixed(2);
  await sendEmail(
    homeownerEmail,
    `New quote received for "${job.title}"`,
    `Hi ${homeownerName},\n\nYou have received a new quote of $${dollars} CAD from ${contractorName} for your job "${job.title}".\n\nLog in to DOMO to review and accept the quote.\n\nThe DOMO Team`
  );
}

export async function notifyPaymentConfirmed(
  homeownerEmail: string,
  homeownerName: string,
  contractorEmail: string | null | undefined,
  contractorName: string,
  job: { id: number; title: string },
  amount: number
): Promise<void> {
  const dollars = (amount / 100).toFixed(2);

  const homeownerMsg = sendEmail(
    homeownerEmail,
    `Payment confirmed for "${job.title}"`,
    `Hi ${homeownerName},\n\nYour payment of $${dollars} CAD for "${job.title}" has been confirmed. Thank you!\n\nThe DOMO Team`
  );

  const contractorMsg = contractorEmail
    ? sendEmail(
        contractorEmail,
        `Payment received for "${job.title}"`,
        `Hi ${contractorName},\n\nA payment of $${dollars} CAD has been confirmed for the job "${job.title}". The funds will be processed shortly.\n\nThe DOMO Team`
      )
    : Promise.resolve();

  await Promise.allSettled([homeownerMsg, contractorMsg]);
}
