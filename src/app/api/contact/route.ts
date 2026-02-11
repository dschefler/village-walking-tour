import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Store in database
    const { error: dbError } = await supabase.from('contact_submissions').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || null,
      message: message.trim(),
      status: 'pending',
    });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    // Send email notification if SendGrid is configured
    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    const contactEmailTo = process.env.CONTACT_EMAIL_TO;

    if (sendGridApiKey && contactEmailTo) {
      try {
        const sgMail = await import('@sendgrid/mail');
        sgMail.default.setApiKey(sendGridApiKey);

        await sgMail.default.send({
          to: contactEmailTo,
          from: contactEmailTo, // Must be verified sender
          replyTo: email,
          subject: `[Village Walking Tours] ${subject || 'New Contact Form Submission'}`,
          text: `
New contact form submission:

Name: ${name}
Email: ${email}
Subject: ${subject || 'Not provided'}

Message:
${message}
          `.trim(),
          html: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
<p><strong>Subject:</strong> ${subject || 'Not provided'}</p>
<h3>Message:</h3>
<p>${message.replace(/\n/g, '<br>')}</p>
          `.trim(),
        });
      } catch (emailError) {
        // Log but don't fail the request
        console.error('Email send error:', emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
