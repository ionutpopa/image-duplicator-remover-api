import * as mobilenet from "@tensorflow-models/mobilenet";

export async function loadModel() {
  const model = await mobilenet.load();
  return model;
}
