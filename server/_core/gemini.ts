/**
 * Google Gemini Integration Module
 * تكامل Google Gemini مباشرة
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "./env";
import type { Message, InvokeParams, InvokeResult, Tool, ToolCall } from "./llm";

const assertGeminiApiKey = () => {
  const apiKey = ENV.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return apiKey;
};

/**
 * Convert our Message format to Gemini's format
 */
const convertMessagesToGemini = (messages: Message[]) => {
  const geminiMessages: Array<{
    role: "user" | "model";
    parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>;
  }> = [];

  for (const message of messages) {
    const role = message.role === "assistant" ? "model" : "user";
    const content = Array.isArray(message.content) ? message.content : [message.content];
    
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
    
    for (const part of content) {
      if (typeof part === "string") {
        parts.push({ text: part });
      } else if (part.type === "text") {
        parts.push({ text: part.text });
      } else if (part.type === "image_url") {
        // Extract base64 data from data URL if present
        const imageUrl = part.image_url.url;
        if (imageUrl.startsWith("data:")) {
          const [header, data] = imageUrl.split(",");
          const mimeType = header.match(/data:([^;]+)/)?.[1] || "image/png";
          parts.push({
            inlineData: {
              mimeType,
              data,
            },
          });
        } else {
          // For URLs, we'd need to fetch and convert, but Gemini API supports URLs directly
          // For now, convert to text reference
          parts.push({ text: `[Image: ${imageUrl}]` });
        }
      } else if (part.type === "file_url") {
        parts.push({ text: `[File: ${part.file_url.url}]` });
      }
    }

    if (parts.length > 0) {
      geminiMessages.push({ role, parts });
    }
  }

  return geminiMessages;
};

/**
 * Convert Gemini tools to our Tool format
 */
const convertToolsToGemini = (tools?: Tool[]) => {
  if (!tools || tools.length === 0) return undefined;

  return {
    functionDeclarations: tools.map((tool) => ({
      name: tool.function.name,
      description: tool.function.description || "",
      parameters: tool.function.parameters || {},
    })),
  };
};

/**
 * Convert Gemini response to our InvokeResult format
 */
const convertGeminiResponseToResult = (
  response: any,
  model: string
): InvokeResult => {
  const candidates = response.candidates || [];
  const candidate = candidates[0];
  
  if (!candidate) {
    throw new Error("No candidates in Gemini response");
  }

  const content = candidate.content?.parts || [];
  const textParts: string[] = [];
  const toolCalls: ToolCall[] = [];

  for (const part of content) {
    if (part.text) {
      textParts.push(part.text);
    } else if (part.functionCall) {
      toolCalls.push({
        id: `call_${Date.now()}_${Math.random()}`,
        type: "function",
        function: {
          name: part.functionCall.name,
          arguments: JSON.stringify(part.functionCall.args || {}),
        },
      });
    }
  }

  const messageContent = textParts.length === 1 
    ? textParts[0] 
    : textParts.map(text => ({ type: "text" as const, text }));

  return {
    id: `gemini_${Date.now()}`,
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: messageContent,
          ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
        },
        finish_reason: candidate.finishReason || "stop",
      },
    ],
    usage: response.usageMetadata
      ? {
          prompt_tokens: response.usageMetadata.promptTokenCount || 0,
          completion_tokens: response.usageMetadata.candidatesTokenCount || 0,
          total_tokens: response.usageMetadata.totalTokenCount || 0,
        }
      : undefined,
  };
};

/**
 * Invoke Gemini API directly
 */
export async function invokeGemini(
  params: InvokeParams & { model?: string }
): Promise<InvokeResult> {
  const apiKey = assertGeminiApiKey();

  const { messages, tools, toolChoice, model = "gemini-2.0-flash-exp" } = params;

  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model });

  // Convert messages
  const geminiMessages = convertMessagesToGemini(messages);

  // Convert tools if provided
  const geminiTools = convertToolsToGemini(tools);

  // Build generation config
  const generationConfig: any = {
    maxOutputTokens: params.maxTokens || params.max_tokens || 32768,
  };

  // Handle response format
  if (params.responseFormat || params.response_format) {
    const format = params.responseFormat || params.response_format;
    if (format?.type === "json_object") {
      generationConfig.responseMimeType = "application/json";
    } else if (format?.type === "json_schema" && format.json_schema) {
      generationConfig.responseMimeType = "application/json";
      generationConfig.responseSchema = {
        type: "object",
        properties: format.json_schema.schema,
      };
    }
  }

  // Handle tool choice
  let toolConfig: any = undefined;
  if (tools && tools.length > 0) {
    if (toolChoice === "none" || toolChoice === "auto") {
      toolConfig = {
        functionCallingConfig: {
          mode: toolChoice === "none" ? "NONE" : "AUTO",
        },
      };
    } else if (typeof toolChoice === "object" && "function" in toolChoice) {
      toolConfig = {
        functionCallingConfig: {
          mode: "ANY",
          allowedFunctionNames: [toolChoice.function.name],
        },
      };
    } else {
      toolConfig = {
        functionCallingConfig: {
          mode: "AUTO",
        },
      };
    }
  }

  try {
    // Start a chat session
    const chat = geminiModel.startChat({
      history: geminiMessages.slice(0, -1), // All messages except the last one
      tools: geminiTools,
      toolConfig,
      generationConfig,
    });

    // Send the last message
    const lastMessage = geminiMessages[geminiMessages.length - 1];
    const result = await chat.sendMessage(lastMessage.parts);

    const response = await result.response;

    return convertGeminiResponseToResult(response, model);
  } catch (error) {
    throw new Error(
      `Gemini API error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

