import os
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI, OpenAIError
from qdrant_client import QdrantClient
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Initialize clients with error handling
try:
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    if not os.environ.get("OPENAI_API_KEY"):
        raise ValueError("OPENAI_API_KEY environment variable is not set")
except Exception as e:
    print(f"Error initializing OpenAI client: {str(e)}")
    raise

try:
    qdrant = QdrantClient(url=os.environ.get("QDRANT_URL"))
except Exception as e:
    print(f"Error connecting to Qdrant: {str(e)}")
    raise

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
    try:
        vector = (
            client.embeddings.create(model="text-embedding-3-small", input=prompt)
            .data[0]
            .embedding
        )
        documents = qdrant.search(
            collection_name="demo_collection", query_vector=vector
        )
        documents = [x.payload.get("page_content") for x in documents]
        return documents
    except OpenAIError as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving context: {str(e)}"
        )


@app.post("/answer")
def get_answer(message: Message):
    try:
        documents = get_context(message.prompt)
        if not documents:
            raise HTTPException(status_code=404, detail="No relevant context found")

        response = client.responses.create(
            model="gpt-4o-mini",
            instructions="You are a friendly chat bot. Answer to the users prompt using the provided context. Write nicely structured answers.",
            input=f"User prompt {message.prompt}, Related context: {documents}",
        )
        return response.output_text
    except OpenAIError as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating answer: {str(e)}"
        )


app.mount(
    "/", StaticFiles(directory="genai-frontend/build", html=True), name="genai testing"
)
