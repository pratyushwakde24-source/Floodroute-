import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  host: process.env.HOST || '0.0.0.0',
  awsRegion: process.env.AWS_REGION || 'ap-south-1',
  bedrockModelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0',
  simulationMode: process.env.SIMULATION_MODE === 'true' || true,
  aiProvider: process.env.AI_PROVIDER || 'bedrock',
};
