import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import * as z from "zod";

// Define the schema for form data validation
const enquirySchema = z.object({
  firstname: z.string().min(2, "First name must be at least 2 characters"),
  lastname: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  contact: z.string().min(5, "Contact number is too short"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  country: z.string().min(2, "Please select a country"),
});

// Type definition for the form data
type EnquiryData = z.infer<typeof enquirySchema>;

// Configure Nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ADMIN,
      pass: process.env.EMAIL_ADMIN_PASS,
    },
  });
};

// Email template
const generateEmailHTML = (data: EnquiryData) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f2f8f6; border-radius: 8px;">
      <h2 style="color: #0DAC9A; border-bottom: 2px solid #0DAC9A; padding-bottom: 10px;">New Enquiry Received</h2>
      <div style="margin: 20px 0;">
        <p><strong>First Name:</strong> ${data.firstname}</p>
        <p><strong>Last Name:</strong> ${data.lastname}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Contact:</strong> ${data.country} ${data.contact}</p>
        <p><strong>Message:</strong> ${data.message}</p>
      </div>
      <footer style="font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px;">
        <p>Sent from Enquiry Form - ${new Date().toLocaleString()}</p>
      </footer>
    </div>
  `;
};

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = enquirySchema.parse(body);

    // Create email transporter
    const transporter = createTransporter();

    // Email options
    const mailOptions = {
      from: `"Enquiry Form" <${process.env.EMAIL_ADMIN}>`,
      to: process.env.EMAIL_ADMIN,
      subject: `New Enquiry from ${validatedData.firstname} ${validatedData.lastname}`,
      html: generateEmailHTML(validatedData),
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      {
        success: true,
        message: "Enquiry sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error("Error sending enquiry email:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send enquiry",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle non-POST requests
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: "Method not allowed",
    },
    { status: 405 }
  );
}