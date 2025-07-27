// app/privacy/page.tsx
import React from 'react';

export const metadata = {
  title: 'Privacy Policy – Lexit',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="prose mx-auto my-12 px-4">
      <h1>Privacy Policy</h1>
      <p>Last updated: July 27, 2025</p>

      <h2>1. Overview</h2>
      <p>
        Lexit (“we”, “our”, “us”) is committed to protecting your privacy.
        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you play our word‑game application (“App”).
      </p>

      <h2>2. Information We Collect</h2>
      <ul>
        <li>
          <strong>Nickname and Game Data:</strong> When you play in Daily Challenge mode, we collect your nickname, score, start seed, end seed, and dayKey, and store these on our backend to populate leaderboards.
        </li>
        <li>
          <strong>Analytics Data:</strong> We use Google Analytics (and any built‑in Vercel analytics) to collect usage metrics (IP address, device type, browser, pages visited, time stamps) to improve the App.
        </li>
        <li>
          <strong>LocalStorage:</strong> We store your nickname in your browser’s localStorage so you don’t have to re‑enter it each session.
        </li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <ul>
        <li>To generate and display public leaderboards.</li>
        <li>To personalize your experience (saving your nickname).</li>
        <li>To understand App usage and fix bugs via analytics.</li>
        <li>To troubleshoot technical issues if you contact us.</li>
      </ul>

      <h2>4. Disclosure of Your Information</h2>
      <ul>
        <li>
          <strong>Third‑Party Services:</strong> We share Analytics Data with Google Analytics under their <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Privacy Policy</a>.
        </li>
        <li>
          <strong>Legal Requirements:</strong> We may disclose your data where required by law or to protect our rights.
        </li>
      </ul>

      <h2>5. Data Retention</h2>
      <p>
        We retain your leaderboard entries indefinitely for historical and competitive purposes.
        Analytics data is retained according to our Google Analytics settings.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        You may request deletion of your nickname and scores by contacting us at <a href="mailto:steveniovine@yahoo.com">steveniovine@yahoo.com</a>.
      </p>

      <h2>7. Security</h2>
      <p>
        We implement reasonable administrative, technical, and physical measures to protect your data.
      </p>

      <h2>8. Children’s Privacy</h2>
      <p>
        Our App is not intended for children under 13. We do not knowingly collect data from children under 13.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The “Last updated” date will reflect changes.
      </p>

      <h2>10. Contact Us</h2>
      <p>
        For questions about this Privacy Policy, please email <a href="mailto:steveniovine@yahoo.com">steveniovine@yahoo.com</a>.
      </p>
    </main>
  );
}
