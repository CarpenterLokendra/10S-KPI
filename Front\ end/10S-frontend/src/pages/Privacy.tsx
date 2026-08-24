import { useNavigate } from 'react-router-dom'
import { useThemeModeStore } from '@/store/themeMode.store'
import Button from '@/components/ui/Button'

export default function Privacy() {
  const navigate = useNavigate()
  const { colorMode } = useThemeModeStore()

  return (
    <div className="min-h-screen w-full flex flex-col" style={{
      backgroundColor: colorMode === 'colour' ? '#ffffff' : '#0d0f14',
      color: colorMode === 'colour' ? '#000000' : '#ffffff',
    }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-white hover:opacity-80 transition"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="text-purple-100 mt-2">Last updated: July 25, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto px-4 md:px-8 py-12 w-full">
        <div className="prose prose-invert max-w-none" style={{
          color: colorMode === 'colour' ? '#000000' : '#e5e7eb',
        }}>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{
              color: colorMode === 'colour' ? '#6125c9' : '#f59e0b',
            }}>1. Introduction</h2>
            <p>
              Catch The Ten Pro ("we", "us", "our") operates the Catch The Ten Pro mobile and web application (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>
            <p>
              We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>What data we collect</li>
              <li>How we use your data</li>
              <li>How long we keep your data</li>
              <li>Your rights regarding your data</li>
              <li>How to contact us about privacy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{
              color: colorMode === 'colour' ? '#6125c9' : '#f59e0b',
            }}>2. Data We Collect</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Account Information</h3>
            <p>When you create an account, we collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Username and email address</li>
              <li>Password (encrypted hash, not plaintext)</li>
              <li>Profile information (avatar, display name, preferred language)</li>
              <li>Account settings and preferences</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Gameplay Data</h3>
            <p>During gameplay, we automatically collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Game history and results</li>
              <li>Scores and statistics</li>
              <li>Ranking and ELO ratings</li>
              <li>Multiplayer session information</li>
              <li>Device type and operating system</li>
              <li>Game version and settings</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.3 Technical Information</h3>
            <p>We collect technical information about your device and connection:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>IP address (for security and regional purposes)</li>
              <li>Device identifiers</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Connection type (WiFi, mobile, etc.)</li>
              <li>Crash logs and error reports</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.4 Advertising Data</h3>
            <p>To serve personalized advertisements, we work with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Google AdSense: Collects ad impressions, clicks, and user behavior for ad targeting</li>
              <li>Google Analytics: Tracks usage patterns and user journey</li>
              <li>Cookies and tracking pixels: Store user preferences for ad personalization</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.5 Analytics Data</h3>
            <p>We use Google Analytics to understand how users interact with our Service:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Page views and session duration</li>
              <li>User flow and navigation patterns</li>
              <li>Feature usage statistics</li>
              <li>Performance metrics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{
              color: colorMode === 'colour' ? '#6125c9' : '#f59e0b',
            }}>3. How We Use Your Data</h2>
            <p>We use the collected data for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Management:</strong> Creating and maintaining your account, authentication, and account recovery</li>
              <li><strong>Service Delivery:</strong> Providing and improving the game experience, matchmaking, and ranking systems</li>
              <li><strong>Communication:</strong> Sending game updates, maintenance notifications, and important account information</li>
              <li><strong>Advertising:</strong> Delivering personalized ads through Google AdSense based on your interests and behavior</li>
              <li><strong>Analytics:</strong> Understanding user behavior, improving features, and optimizing performance</li>
              <li><strong>Security:</strong> Detecting fraud, preventing abuse, and protecting user accounts</li>
              <li><strong>Legal Compliance:</strong> Complying with laws, regulations, and legal requests</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{
              color: colorMode === 'colour' ? '#6125c9' : '#f59e0b',
            }}>4. Data Sharing</h2>
            <p>We do NOT sell your personal data to third parties. We only share data in these cases:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google AdSense:</strong> Ad serving and personalization (user interests, behavior, demographics)</li>
              <li><strong>Google Analytics:</strong> Usage statistics and user journey analysis</li>
              <li><strong>Service Providers:</strong> Hosting providers (AWS) and payment processors for legitimate business operations</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
              <li><strong>Protection:</strong> To protect against fraud, security threats, or violations of our Terms of Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{
              color: colorMode === 'colour' ? '#6125c9' : '#f59e0b',
            }}>5. Data Retention</h2>
            <p>We retain your data as follows:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
              <li><strong>Deleted Accounts:</strong> Personal data purged within 30 days of deletion. Game history may be retained for analytics (anonymized)</li>
              <li><strong>Analytics Data:</strong> Retained for up to 2 years</li>
              <li><strong>Ad Cookies:</strong> Retained per Google AdSense and browser settings (typically 24 months)</li>
              <li><strong>Server Logs:</strong> Retained for 90 days for security purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{
              color: colorMode === 'colour' ? '#6125c9' : '#f59e0b',
            }}>6. Your Rights</h2>
            <p>You have the following rights regarding your personal data:</p>

            <h3 className="text-xl font-semibold mb-3 mt-4">Right to Access</h3>
            <p>You can request a copy of all personal data we hold about you. Contact us at privacy@catchtheten.com with the subject "Data Access Request".</p>

            <h3 className="text-xl font-semibold mb-3 mt-4">Right to Deletion</h3>
            <p>You can request deletion of your account and associated personal data. Submit a request at privacy@catchtheten.com with the subject "Account Deletion Request". We will delete your data within 30 days.</p>

            <h3 className="text-xl font-semibold mb-3 mt-4">Right to Rectification</h3>
            <p>You can update or correct your personal information through your account settings or by contacting us.</p>

            <h3 className="text-xl font-semibold mb-3 mt-4">Right to Opt-Out of Personalized Ads</h3>
            <p>You can opt out of personalized advertising at any time through your device settings. Visit Google's Ad Settings: https://adssettings.google.com/</p>

            <h3 className="text-xl font-semibold mb-3 mt-4">Right to Portability</h3>
            <p>You can request your data in a portable format. Contact privacy@catchtheten.com with the subject "Data Portability Request".</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{
              color: colorMode === 'colour' ? '#6125c9' : '#f59e0b',
            }}>7. Security</h2>
            <p>We implement industry-standard security measures to protect your data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>HTTPS encryption for all data in transit</li>
              <li>Bcrypt password hashing (passwords never stored in plaintext)</li>
              <li>AWS security best practices (VPC, security groups, IAM roles)</li>
              <li>Regular security updates and patches</li>
              <li>Access controls limiting data access to authorized personnel only</li>
              <li>Audit logging of data access</li>
            </ul>
            <p className="mt-4">
              However, no security system is 100% secure. If you have any security concerns, please contact us immediately at security@catchtheten.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{
              color: colorMode === 'colour' ? '#6125c9' : '#f59e0b',
            }}>8. Children's Privacy</h2>
            <p>
              Catch The Ten Pro is designed for users 13 years and older. We do not knowingly collect personal data from children under 13. If we become aware that a user is under 13, we will delete their account and personal data immediately.
            </p>
            <p className="mt-4">
              Parents or guardians who believe their child has provided personal data to us should contact us at privacy@catchtheten.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{
              color: colorMode === 'colour' ? '#6125c9' : '#f59e0b',
            }}>9. Third-Party Services</h2>
            <p>Our Service uses the following third-party services:</p>

            <h3 className="text-xl font-semibold mb-3 mt-4">Google AdSense</h3>
            <p>
              Google AdSense serves personalized ads based on your interests. Google's privacy policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://policies.google.com/privacy</a>
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">Google Analytics</h3>
            <p>
              We use Google Analytics to understand user behavior and improve our Service. Google's privacy policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://policies.google.com/privacy</a>
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">AWS (Amazon Web Services)</h3>
            <p>
              Our infrastructure is hosted on AWS. AWS's privacy policy: <a href="https://aws.amazon.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://aws.amazon.com/privacy/</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{
              color: colorMode === 'colour' ? '#6125c9' : '#f59e0b',
            }}>10. Policy Changes</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. When we make material changes, we will:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Update the "Last updated" date at the top of this policy</li>
              <li>Notify you via email if you have an account</li>
              <li>Display a prominent notice in the app</li>
            </ul>
            <p className="mt-4">
              Your continued use of our Service after changes indicates your acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4" style={{
              color: colorMode === 'colour' ? '#6125c9' : '#f59e0b',
            }}>11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mt-4" style={{
              backgroundColor: colorMode === 'colour' ? '#f3f4f6' : '#1f2937',
            }}>
              <p><strong>Email:</strong> privacy@catchtheten.com</p>
              <p><strong>Website:</strong> https://catchtheten.com</p>
              <p className="mt-4 text-sm">
                Response time: We will respond to privacy inquiries within 30 days.
              </p>
            </div>
          </section>

        </div>

        {/* Footer Button */}
        <div className="mt-12 flex gap-4">
          <Button onClick={() => navigate(-1)} variant="secondary">
            Back
          </Button>
          <Button onClick={() => window.print()} variant="secondary">
            Print Policy
          </Button>
        </div>
      </div>
    </div>
  )
}
