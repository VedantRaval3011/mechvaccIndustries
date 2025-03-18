// app/api/send-interest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import { InterestedUser } from '@/models/interestedUser.model';

export async function POST(request: NextRequest) {
  try {
    const { productId, productTitle, userQueries } = await request.json();

    // Validate input
    if (!productId || !productTitle) {
      return NextResponse.json({ error: 'Product ID and title are required' }, { status: 400 });
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    // Save to MongoDB
    const interestedUser = new InterestedUser({
      productId,
      productTitle,
      queries: userQueries || [],
    });
    await interestedUser.save();

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADMIN,
        pass: process.env.EMAIL_ADMIN_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_ADMIN,
      to: process.env.EMAIL_ADMIN,
      subject: `New Interest in: ${productTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
              .header { background: #f8f9fa; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; }
              .header h2 { margin: 0; color: #2c3e50; }
              .content { padding: 20px; }
              .detail { margin: 10px 0; }
              .detail strong { color: #2c3e50; }
              .queries { margin-top: 20px; }
              .queries ul { list-style: none; padding: 0; }
              .queries li { padding: 10px; background: #f8f9fa; margin: 5px 0; border-radius: 4px; }
              .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>New Interest Submission</h2>
              </div>
              <div class="content">
                <div class="detail">
                  <strong>Title:</strong> ${productTitle}
                </div>
                <div class="detail">
                  <strong>ID:</strong> ${productId}
                </div>
                <div class="queries">
                  <h3>User Details:</h3>
                  <ul>
                    ${(userQueries || []).map((query: { title: string; value?: string }) => `
                      <li>
                        <strong>${query.title}:</strong> 
                        ${query.value || 'Not specified'}
                      </li>
                    `).join('')}
                  </ul>
                </div>
              </div>
              <div class="footer">
                This email was generated automatically. Please do not reply directly.
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Interest submitted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending interest email:', error);
    return NextResponse.json(
      { error: 'Failed to send interest email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}