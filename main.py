import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from qdrant_client import QdrantClient
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
qdrant = QdrantClient(url="http://localhost:6333")


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost",
        "http://localhost:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Message(BaseModel):
    prompt: str


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


@app.post("/answer")
def get_answer(message: Message):
    documents = get_context(message.prompt)
    print(documents)
    response = client.responses.create(
        model="gpt-4o-mini",
        instructions="You are a friendly chat bot. Answer to the users prompt using the provided context. Write nicely structured answers.",
        input=f"User promt {message.prompt}, Related context: {documents}",
    )

    return response.output_text


app.mount(
    "/", StaticFiles(directory="genai-frontend/public", html=True), name="genai testing"
)
