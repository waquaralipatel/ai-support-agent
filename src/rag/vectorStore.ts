import fs from "fs";
import path from "path";
import type { KnowledgeChunk } from "./chunker.js";

export interface StoredVector {
  chunk: KnowledgeChunk;
  embedding: number[];
}

const VECTOR_DIR = "data/vector";

export function loadAmazonVectorIndex(): StoredVector[] {
  if (!fs.existsSync(VECTOR_DIR)) {
    throw new Error(
      `Vector directory not found: ${VECTOR_DIR}`
    );
  }

  const files = fs
    .readdirSync(VECTOR_DIR)
    .filter(
      (file) =>
        /^amazon_vectors_\d+\.json$/.test(file)
    )
    .sort();

  if (files.length === 0) {
    throw new Error(
      "No Amazon vector batches found."
    );
  }

  const vectors: StoredVector[] = [];

  for (const file of files) {
    const filePath = path.join(VECTOR_DIR, file);

    const batch: StoredVector[] = JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    );

    vectors.push(...batch);
  }

  return vectors;
}