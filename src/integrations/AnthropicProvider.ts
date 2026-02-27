import anthropic from 'anthropic';

export class AnthropicProvider {
  private client: any;

  constructor(apiKey: string) {
    this.client = new anthropic.Anthropic({ apiKey });
  }

  public async summarize(text: string): Promise<string> {
    const resp = await this.client.responses.create({
      model: 'claude-2.1',
      input: `Please summarize the following text:\n\n${text}`
    });
    return resp.output?.[0]?.content?.[0]?.text || '';
  }

  public async generate(prompt: string, maxTokens: number = 200): Promise<string> {
    const resp = await this.client.responses.create({
      model: 'claude-2.1',
      input: prompt,
      max_tokens_to_sample: maxTokens
    });
    return resp.output?.[0]?.content?.[0]?.text || '';
  }
}
