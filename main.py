import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from openai import OpenAI
from qdrant_client import QdrantClient
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
qdrant = QdrantClient(url="http://localhost:6333")


app = FastAPI()


def get_context(prompt: str) -> list[str]:
    """Get the context from the vector database."""
    vector = (
        client.embeddings.create(model="text-embedding-3-small", input=prompt)
        .data[0]
        .embedding
    )
    documents = qdrant.search(collection_name="demo_collection", query_vector=vector)
    documents = [x.payload.get("page_content") for x in documents]
    return documents


@app.get("/answer/{prompt}")
def get_answer(prompt: str):
    documents = get_context(prompt)
    print(documents)
    response = client.responses.create(
        model="gpt-4o-mini",
        instructions=f"Give responses that are rooted to these provided texts: {', '.join(documents)}.",
        input=prompt,
    )

    return response.output_text


app.mount(
    "/", StaticFiles(directory="genai-frontend/public", html=True), name="genai testing"
)
