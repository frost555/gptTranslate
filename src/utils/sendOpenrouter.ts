import axios from 'axios';
import { ModelName } from '../../types';

// Definitions of subtypes are below
type Request = {
  // Either "messages" or "prompt" is required
  messages?: Message[];
  prompt?: string;

  // If "model" is unspecified, uses the user's default
  model?: string; // See "Supported Models" section

  // Allows to force the model to produce specific output format.
  // Only supported by OpenAI models, Nitro models, and some others - check the
  // providers on the model page on openrouter.ai/models to see if it's supported,
  // and set `require_parameters` to true in your Provider Preferences. See
  // openrouter.ai/docs/provider-routing
  response_format?: { type: 'json_object' };

  stop?: string | string[];
  stream?: boolean; // Enable streaming

  // See LLM Parameters (openrouter.ai/docs/parameters)
  max_tokens?: number; // Range: [1, context_length)
  temperature?: number; // Range: [0, 2]
  top_p?: number; // Range: (0, 1]
  top_k?: number; // Range: [1, Infinity) Not available for OpenAI models
  frequency_penalty?: number; // Range: [-2, 2]
  presence_penalty?: number; // Range: [-2, 2]
  repetition_penalty?: number; // Range: (0, 2]
  seed?: number; // OpenAI only

  // Tool calling
  // Will be passed down as-is for providers implementing OpenAI's interface.
  // For providers with custom interfaces, we transform and map the properties.
  // Otherwise, we transform the tools into a YAML template. The model responds with an assistant message.
  // See models supporting tool calling: openrouter.ai/models?supported_parameters=tools
  tools?: Tool[];
  tool_choice?: ToolChoice;

  // Additional optional parameters
  logit_bias?: { [key: number]: number };

  // OpenRouter-only parameters
  // See "Prompt Transforms" section: openrouter.ai/docs/transforms
  transforms?: string[];
  // See "Model Routing" section: openrouter.ai/docs/model-routing
  models?: string[];
  route?: 'fallback';
  // See "Provider Routing" section: openrouter.ai/docs/provider-routing
  provider?: unknown;
};

// Subtypes:

type TextContent = {
  type: 'text';
  text: string;
};

type ImageContentPart = {
  type: 'image_url';
  image_url: {
    url: string; // URL or base64 encoded image data
    detail?: string; // Optional, defaults to 'auto'
  };
};

type ContentPart = TextContent | ImageContentPart;

type Message = {
  role: 'user' | 'assistant' | 'system' | 'tool';
  // ContentParts are only for the 'user' role:
  content: string | ContentPart[];
  // If "name" is included, it will be prepended like this
  // for non-OpenAI models: `{name}: {content}`
  name?: string;
};

type FunctionDescription = {
  description?: string;
  name: string;
  parameters: object; // JSON Schema object
};

type Tool = {
  type: 'function';
  function: FunctionDescription;
};

type ToolChoice =
  | 'none'
  | 'auto'
  | {
      type: 'function';
      function: {
        name: string;
      };
    };

type SendOpenrouterArgs = {
  systemPrompt: string;
  prompt: string;
  temperature?: number;
  modelName: ModelName;
};

export async function sendOpenrouter({
  systemPrompt,
  prompt,
  temperature = 0,
  modelName,
}: SendOpenrouterArgs): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('API key is not set in the environment variables.');
  }

  const url = 'https://openrouter.ai/api/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  const data: Request = {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature,
    model: modelName,
  };

  try {
    const response = await axios.post(url, data, { headers });
    // console.log(response.data.choices);
    // throw new Error();
    if (
      response.data &&
      response.data.choices &&
      response.data.choices.length > 0
    ) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Unexpected response format from OpenRouter API');
    }
  } catch (error) {
    console.error('Error sending request to OpenRouter API:', error);
    throw error;
  }
}
