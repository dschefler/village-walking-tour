import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Fallback destination for the public Southampton tour (server-side only)
const FEEDBACK_TO_DEFAULT = 'dina@thorncreativemarketing.com';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, message, name, orgSlug } = body;

    if (!rating && !message?.trim()) {
      return NextResponse.json(
        { error: 'Please provide a rating or message' },
        { status: 400 }
      );
    }

    // Resolve destination email — org contact_email takes priority over default
    let feedbackTo = FEEDBACK_TO_DEFAULT;
    if (orgSlug) {
      try {
        const supabase = createClient();
        const { data: org } = await supabase
          .from('organizations')
          .select('contact_email, name')
          .eq('slug', orgSlug)
          .single();
        if (org?.contact_email) {
          feedbackTo = org.contact_email;
        }
      } catch {
        // Fall back to default if lookup fails
      }
    }

    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.CONTACT_EMAIL_TO;

    if (sendGridApiKey && fromEmail) {
      try {
        const sgMail = await import('@sendgrid/mail');
        sgMail.default.setApiKey(sendGridApiKey);

        const stars = rating ? '⭐'.repeat(Number(rating)) + ` (${rating}/5)` : 'Not rated';
        const displayName = name?.trim() || 'Anonymous';
        const tourLabel = orgSlug ? `${orgSlug} Walking Tour` : 'Southampton Village Walking Tour';

        await sgMail.default.send({
          to: feedbackTo,
          from: fromEmail,
          subject: `[Walking Tour Feedback] ${stars}`,
          text: [
            `New feedback from the ${tourLabel} app:`,
            '',
            `Rating: ${stars}`,
            `Name: ${displayName}`,
            '',
            'Message:',
            message?.trim() || '(no message provided)',
          ].join('\n'),
          html: `
            <h2>New Walking Tour Feedback</h2>
            <p><strong>Tour:</strong> ${tourLabel}</p>
            <p><strong>Rating:</strong> ${stars}</p>
            <p><strong>Name:</strong> ${displayName}</p>
            <h3>Message:</h3>
            <p>${(message?.trim() || '(no message provided)').replace(/\n/g, '<br>')}</p>
          `.trim(),
        });
      } catch (emailError) {
        console.error('Feedback email send error:', emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
