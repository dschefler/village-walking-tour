import { NextResponse } from 'next/server';

// Destination is server-side only — never exposed to the client
const FEEDBACK_TO = 'dina@thorncreativemarketing.com';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, message, name } = body;

    if (!rating && !message?.trim()) {
      return NextResponse.json(
        { error: 'Please provide a rating or message' },
        { status: 400 }
      );
    }

    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.CONTACT_EMAIL_TO;

    if (sendGridApiKey && fromEmail) {
      try {
        const sgMail = await import('@sendgrid/mail');
        sgMail.default.setApiKey(sendGridApiKey);

        const stars = rating ? '⭐'.repeat(Number(rating)) + ` (${rating}/5)` : 'Not rated';
        const displayName = name?.trim() || 'Anonymous';

        await sgMail.default.send({
          to: FEEDBACK_TO,
          from: fromEmail,
          subject: `[Walking Tour Feedback] ${stars}`,
          text: [
            'New feedback from the Southampton Village Walking Tour app:',
            '',
            `Rating: ${stars}`,
            `Name: ${displayName}`,
            '',
            'Message:',
            message?.trim() || '(no message provided)',
          ].join('\n'),
          html: `
            <h2>New Walking Tour Feedback</h2>
            <p><strong>Rating:</strong> ${stars}</p>
            <p><strong>Name:</strong> ${displayName}</p>
            <h3>Message:</h3>
            <p>${(message?.trim() || '(no message provided)').replace(/\n/g, '<br>')}</p>
          `.trim(),
        });
      } catch (emailError) {
        // Log but don't fail — submission is still recorded
        console.error('Feedback email send error:', emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
