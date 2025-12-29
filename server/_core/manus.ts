/**
 * Manus Forge API Integration Module
 * تكامل Manus Forge API مباشرة
 */

import { ENV } from "./env";
import type { Message, InvokeParams, InvokeResult, Tool, ToolChoice } from "./llm";

const assertManusApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("MANUS_API_KEY (BUILT_IN_FORGE_API_KEY) is not configured");
  }
};

const resolveManusApiUrl = () =>
  ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
    : "https://forge.manus.im/v1/chat/completions";

const ensureArray = (
  value: string | Array<{ type: string; text?: string; image_url?: { url: string }; file_url?: { url: string } }>
): Array<{ type: string; text?: string; image_url?: { url: string }; file_url?: { url: string } }> => 
  (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: string | { type: string; text?: string; image_url?: { url: string }; file_url?: { url: string } }
): { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } } | { type: "file_url"; file_url: { url: string } } => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return { type: "text", text: part.text || "" };
  }

  if (part.type === "image_url" && part.image_url) {
    return { type: "image_url", image_url: part.image_url };
  }

  if (part.type === "file_url" && part.file_url) {
    return { type: "file_url", file_url: part.file_url };
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | { type: "function"; function: { name: string } } | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error("tool_choice 'required' was provided but no tools were configured");
    }
    if (tools.length > 1) {
      throw new Error("tool_choice 'required' needs a single tool or specify the tool name explicitly");
    }
    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  if ("function" in toolChoice && toolChoice.function) {
    return {
      type: "function",
      function: { name: toolChoice.function.name },
    };
  }

  return toolChoice;
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: { type: string; json_schema?: { name: string; schema: Record<string, unknown>; strict?: boolean } };
  response_format?: { type: string; json_schema?: { name: string; schema: Record<string, unknown>; strict?: boolean } };
  outputSchema?: { name: string; schema: Record<string, unknown>; strict?: boolean };
  output_schema?: { name: string; schema: Record<string, unknown>; strict?: boolean };
}):
  | { type: "json_schema"; json_schema: { name: string; schema: Record<string, unknown>; strict?: boolean } }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && explicitFormat.json_schema && !explicitFormat.json_schema.schema) {
      throw new Error("responseFormat json_schema requires a defined schema object");
    }
    return explicitFormat as any;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

/**
 * Invoke Manus Forge API directly
 */
export async function invokeManus(params: InvokeParams): Promise<InvokeResult> {
  assertManusApiKey();

  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    maxTokens,
    max_tokens,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
    model,
  } = params;

  const payload: Record<string, unknown> = {
    model: model || "gemini-2.5-flash",
    messages: messages.map(normalizeMessage),
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }

  payload.max_tokens = maxTokens || max_tokens || 32768;
  
  // Manus supports thinking tokens
  payload.thinking = {
    budget_tokens: 128
  };

  // Handle response format
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }

  const response = await fetch(resolveManusApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Manus API error: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as InvokeResult;
}

