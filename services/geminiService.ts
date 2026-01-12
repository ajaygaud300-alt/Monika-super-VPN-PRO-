
import { GoogleGenAI, Type } from "@google/genai";
import { Server } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getSmartRecommendation(task: string, servers: Server[]): Promise<{ serverId: string; reason: string }> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Recommend the best VPN server from this list for the user's task: "${task}".
    Available servers: ${JSON.stringify(servers.map(s => ({ id: s.id, name: s.name, ping: s.ping, load: s.load })))}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          serverId: { type: Type.STRING, description: 'The ID of the recommended server' },
          reason: { type: Type.STRING, description: 'A short explanation for why this server was chosen' }
        },
        required: ['serverId', 'reason']
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { serverId: servers[0].id, reason: "Default recommendation." };
  }
}
