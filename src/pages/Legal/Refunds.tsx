import LegalPage from './LegalPage';

export default function Refunds() {
  return (
    <LegalPage
      title="Refund Policy"
      description="A 30-day, no-conditions refund policy for The Global African Professional. Email within 30 days of purchase for a full refund."
      canonicalPath="/refunds"
      updated="20 July 2026"
    >
      <p>
        The Global African Professional comes with one simple promise: if it is not for you,
        you get your money back.
      </p>

      <h2>The policy</h2>
      <p>
        Email me at danielbangs@dsbdigital.biz within 30 days of purchase and I will refund
        you. No conditions. I would rather refund than have you feel you wasted money.
      </p>

      <h2>How to ask</h2>
      <p>
        Send the email from the address you used at checkout, or mention that address in your
        message, so I can find the purchase. You do not need to give a reason.
      </p>

      <h2>How the money comes back</h2>
      <p>
        Refunds for card purchases are processed through Paddle, the merchant of record. The
        same 30-day window applies however you paid, whether by card through Paddle or by
        mobile money.
      </p>
    </LegalPage>
  );
}
