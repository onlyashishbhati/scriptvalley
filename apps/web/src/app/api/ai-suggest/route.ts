import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const MAX_CODE_LENGTH = 20000;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      code: string;
      language: string;
      action: "fix" | "optimize";
    };

    const { code, language, action } = body;

    if (!code || !language || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (code.length > MAX_CODE_LENGTH) {
      return NextResponse.json(
        { error: `Code is too long. Please limit it to ${MAX_CODE_LENGTH} characters.` },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const prompts: Record<typeof action, string> = {
      fix: `You are a code debugging assistant. Analyze the following ${language} code and fix any bugs, errors, or issues.

Rules:
1. Only return the corrected code, no explanations or comments
2. Maintain the original code structure and formatting style
3. Fix syntax errors, logical errors, and potential runtime issues
4. If no issues are found, return the original code unchanged
5. Do not add any markdown formatting or code blocks
6. Preserve variable names and function names unless they cause errors

Code to fix:
${code}

Fixed code:`,

      optimize: `You are a code optimization assistant. Optimize the following ${language} code for better performance, readability, and best practices.

Rules:
1. Only return the optimized code, no explanations or comments
2. Maintain the original functionality exactly
3. Improve performance, reduce complexity, follow best practices for ${language}
4. Keep the same structure and variable names where possible
5. Do not add any markdown formatting or code blocks
6. Focus on algorithmic improvements, cleaner syntax, and modern ${language} features

Code to optimize:
${code}

Optimized code:`,
    };

    if (!prompts[action]) {
      return NextResponse.json(
        { error: 'Invalid action. Use "fix" or "optimize"' },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompts[action],
    });

    let suggestedCode = response.text ?? "";

    suggestedCode = suggestedCode
      .replace(/```[\w]*\n?/g, "")
      .replace(/```/g, "")
      .trim();

    if (!suggestedCode || suggestedCode.length < 5) {
      return NextResponse.json(
        { error: "AI could not generate a valid suggestion. Please try again." },
        { status: 500 }
      );
    }

    if (suggestedCode === code.trim()) {
      const message =
        action === "fix"
          ? "No bugs or errors found in your code!"
          : "Your code is already well-optimized!";

      return NextResponse.json({
        success: true,
        originalCode: code,
        suggestedCode,
        action,
        language,
        message,
      });
    }

    return NextResponse.json({
      success: true,
      originalCode: code,
      suggestedCode,
      action,
      language,
    });

  } catch (error: unknown) {
    console.error("Gemini API Error:", error);

    const message = (error as Error).message || "";

    if (message.includes("quota") || message.includes("429")) {
      return NextResponse.json(
        { error: "AI service quota exceeded. Please try again in a few minutes." },
        { status: 429 }
      );
    }
    if (message.includes("safety") || message.includes("blocked")) {
      return NextResponse.json(
        { error: "Code content was flagged by safety filters." },
        { status: 400 }
      );
    }
    if (message.includes("API key") || message.includes("api_key")) {
      return NextResponse.json(
        { error: "Invalid API configuration. Please check your settings." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to get AI suggestion. Please try again later." },
      { status: 500 }
    );
  }
}