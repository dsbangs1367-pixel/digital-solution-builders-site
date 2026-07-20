import LegalPage from './LegalPage';

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="What data dsbdigital.biz collects, where it goes, and how to have it deleted. First-party analytics, no cookies, no third-party ad tracking."
      canonicalPath="/privacy"
      updated="20 July 2026"
    >
      <p>
        This policy explains what data this website, dsbdigital.biz, collects and what happens
        to it. The site is run by Digital Solution Builders.
      </p>

      <h2>What the forms collect</h2>
      <p>
        The contact form asks for your name, your email address, and a message, plus your
        company and project type if you choose to add them. The playbook form asks for your
        name and email address. That is everything the forms collect. There are no accounts
        and no passwords.
      </p>

      <h2>Where your details go</h2>
      <p>
        When you submit a form, a serverless function relays your details to my lead pipeline:
        an n8n webhook records the submission, a Slack notification tells me you wrote, and
        your name and email go on my lead list. The submission arrives with basic technical
        metadata: your browser's user-agent string and the time you sent it. I use your
        details to send you what you asked for, such as the free chapter or a note when the
        book is out. They are never sold or passed to advertisers.
      </p>

      <h2>Analytics</h2>
      <p>
        The site measures traffic with its own endpoint, /api/track. It is first-party and
        sets no cookies. It counts page views and a few anonymous interaction events, such as
        shares and contact form submissions. For each page view it records the page path, a
        rough device and browser category read from your browser's user agent, a two-letter
        country code, and the site that referred you. The analytics endpoint stores no IP
        addresses and no full user-agent strings, so nothing in it identifies you.
      </p>

      <h2>Third parties</h2>
      <p>
        There is no third-party ad tracking on this site: no advertising pixels, no cross-site
        trackers, and no analytics scripts from ad networks.
      </p>

      <h2>Deleting your data</h2>
      <p>
        Email danielbangs@dsbdigital.biz from the address you signed up with, or name it in
        your message, and I will delete your details from the lead list.
      </p>
    </LegalPage>
  );
}
