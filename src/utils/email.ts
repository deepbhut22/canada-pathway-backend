import transporter from '../config/nodemailer';

// export const sendWelcomeEmail = async (to: string, firstName: string) => {
//     const htmlBody = `
//     <p>Hi ${firstName},</p>

//     <p>Thank you for joining <strong>PathPR.ca</strong>! We’re on a mission to simplify your Canadian immigration journey with powerful, free tools and expert support. Here’s what you get as soon as you log in:</p>

//     <ol>
//       <li><strong>100% Free AI‑Generated Reports</strong>
//         <ul>
//           <li>Instant CRS, CEC, FSW & PNP assessments</li>
//           <li>Personalized suggestions & next‑step recommendations</li>
//         </ul>
//       </li>
//       <li><strong>MapleAI – Your Personal Immigration Assistant</strong>
//         <ul>
//           <li>Leverages your profile & report data as context</li>
//           <li>Ask any immigration question, anytime</li>
//         </ul>
//       </li>
//       <li><strong>Canadian Immigration Dashboard</strong>
//         <ul>
//           <li>Interactive charts for Express Entry draws, statistics & more</li>
//           <li>Filter by program, date or province</li>
//         </ul>
//       </li>
//       <li><strong>All the Latest News & Blogs</strong>
//         <ul>
//           <li>Updates on policy changes, draw results, study permits & more</li>
//           <li>Curated insights to keep you informed</li>
//         </ul>
//       </li>
//       <li><strong>Personalized Consultations</strong>
//         <ul>
//           <li>One‑on‑one guidance with top immigration experts</li>
//           <li>Tailored strategies to maximize your chances</li>
//         </ul>
//       </li>
//     </ol>

//     <h3>Next Steps</h3>
//     <ol>
//       <li><a href="https://pathpr.ca/">Log in</a> to your dashboard</li>
//       <li>Generate your free AI report in seconds</li>
//       <li>Explore MapleAI—just type your first question in the chat</li>
//       <li>Browse the dashboard and news feed to stay ahead</li>
//       <li>Book a personalized consultation anytime</li>
//     </ol>

//     <p>Have questions? Email us at <a href="mailto:support@pathpr.ca">support@pathpr.ca</a> or visit <a href="https://pathpr.ca/contact">pathpr.ca/contact</a> — we’re here 24/7.</p>

//     <p>We’re excited to guide you every step of the way.<br><br>
//     Warmly,<br>
//     <strong>The PathPR.ca Team</strong><br>
//     Your AI‑Powered Immigration Partner</p>
//   `;

//     await transporter.sendMail({
//         from: '"PathPR.ca" <support@pathpr.ca>',
//         to,
//         subject: 'Welcome to PathPR.ca – Your Free, AI‑Powered Path to Canadian PR!',
//         html: htmlBody,
//     });
// };

export const sendWelcomeEmail = async (to: string, firstName: string) => {
  const htmlBody = `
  <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
    <h1 style="text-align:center;color:#005CAF;">Welcome to PathPR.ca!</h1>
    <p>Hi ${firstName},</p>
    <p>Thanks for joining <strong>PathPR.ca</strong>! Dive right in by exploring our key features below:</p>

    <!-- 1. Free AI Reports -->
    <h2 style="color:#005CAF;font-size:18px;margin:24px 0 8px;">100% Free AI‑Generated Reports</h2>
    <img
      src="https://pathpr.ca/images/feature-reports.jpg"
      alt="100% Free AI‑Generated Reports"
      width="600" height="750"
      style="display:block;width:100%;max-width:600px;height:auto;border-radius:4px;margin-bottom:20px;border:none;outline:none;text-decoration:none;"
    />

    <!-- 2. MapleAI -->
    <h2 style="color:#005CAF;font-size:18px;margin:24px 0 8px;">MapleAI – Your Personal Immigration Assistant</h2>
    <img
      src="https://pathpr.ca/images/feature-mapleai.jpg"
      alt="MapleAI – Your Personal Immigration Assistant"
      width="600" height="750"
      style="display:block;width:100%;max-width:600px;height:auto;border-radius:4px;margin-bottom:20px;border:none;outline:none;text-decoration:none;"
    />

    <!-- 3. Immigration Dashboard -->
    <h2 style="color:#005CAF;font-size:18px;margin:24px 0 8px;">Canadian Immigration Dashboard</h2>
    <img
      src="https://pathpr.ca/images/feature-dashboard.jpg"
      alt="Interactive Canadian Immigration Dashboard"
      width="600" height="750"
      style="display:block;width:100%;max-width:600px;height:auto;border-radius:4px;margin-bottom:20px;border:none;outline:none;text-decoration:none;"
    />

    <!-- 4. News & Blogs -->
    <h2 style="color:#005CAF;font-size:18px;margin:24px 0 8px;">All the Latest News & Blogs</h2>
    <img
      src="https://pathpr.ca/images/feature-news.jpg"
      alt="All the Latest Immigration News & Blogs"
      width="600" height="750"
      style="display:block;width:100%;max-width:600px;height:auto;border-radius:4px;margin-bottom:20px;border:none;outline:none;text-decoration:none;"
    />

    <!-- 5. Personalized Consultations -->
    <h2 style="color:#005CAF;font-size:18px;margin:24px 0 8px;">Your Path, Your Consultant, Your Success!</h2>
    <img
      src="https://pathpr.ca/images/feature-consultations.jpg"
      alt="Personalized Consultation with Immigration Experts"
      width="600" height="750"
      style="display:block;width:100%;max-width:600px;height:auto;border-radius:4px;margin-bottom:30px;border:none;outline:none;text-decoration:none;"
    />

    <!-- Next Steps -->
    <h3 style="color:#005CAF;margin-top:30px;">Next Steps</h3>
    <ol style="margin:0 0 20px 20px;padding:0;">
      <li><a href="https://pathpr.ca/" style="color:#005CAF;text-decoration:none;">Log in</a> to PathPR.ca</li>
      <li>Generate your free AI report in seconds</li>
      <li>Ask your first question in MapleAI</li>
      <li>Browse the dashboard and news feed</li>
      <li>Book a personalized consultation anytime</li>
    </ol>

    <p>Questions? Email us at <a href="mailto:support@pathpr.ca">support@pathpr.ca</a> or visit <a href="https://pathpr.ca/contact">pathpr.ca/contact</a>.</p>
    <p>Warmly,<br/><strong>The PathPR.ca Team</strong><br/>Your AI‑Powered Immigration Partner</p>
  </div>
  `;

  await transporter.sendMail({
    from: '"PathPR.ca" <support@pathpr.ca>',
    to,
    subject: 'Welcome to PathPR.ca – Your Free, AI‑Powered Path to Canadian PR!',
    html: htmlBody,
  });
};

export const sendResetPasswordEmail = async (to: string, resetUrl: string) => {
    const htmlBody = `
    <p>Hi,</p>

    <p>We received a request to reset your password. Click the link below to reset your password:</p>

    <a href="${resetUrl}">Reset Password</a>

    <p>If you did not request a password reset, please ignore this email.</p>

    <p>Thanks,<br>
    The PathPR.ca Team</p>  
    `;

    await transporter.sendMail({
        from: '"PathPR.ca" <support@pathpr.ca>',
        to,
        subject: 'Reset Password Request',
        html: htmlBody,
    });
};

