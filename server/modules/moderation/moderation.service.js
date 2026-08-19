import * as tf from '@tensorflow/tfjs-node';
import * as nsfwjs from 'nsfwjs';

let model = null;

// Categories NSFWJS scores against; flag on the risky ones only
const RISK_CATEGORIES = ['Porn', 'Hentai', 'Sexy'];
const FLAG_THRESHOLD = 0.6;

async function getModel() {
  if (!model) {
    model = await nsfwjs.load();
    console.log('[moderation] NSFWJS model loaded');
  }
  return model;
}

/**
 * Classifies an image buffer, returns whether it should be flagged
 * plus the raw scores for logging/admin review context.
 */
export async function classifyImage(imageBuffer) {
  const loadedModel = await getModel();
  const image = tf.node.decodeImage(imageBuffer, 3); // 3 channels (RGB)

  try {
    const predictions = await loadedModel.classify(image);

    const highestRisk = predictions
      .filter((p) => RISK_CATEGORIES.includes(p.className))
      .reduce((max, p) => (p.probability > max ? p.probability : max), 0);

    return {
      flagged: highestRisk >= FLAG_THRESHOLD,
      highestRiskScore: highestRisk,
      predictions,
    };
  } finally {
    image.dispose(); // required — tf.Tensor doesn't get garbage collected automatically
  }
}