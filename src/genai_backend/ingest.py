from sys import argv
from uuid import uuid4
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from langchain_openai import OpenAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document


def load_and_split_file(filepath: str) -> list[Document]:
    loader = PyPDFLoader(filepath)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = text_splitter.split_documents(loader.load())
    return chunks


if __name__ == "__main__":
    embedding = OpenAIEmbeddings(model="text-embedding-3-small")
    client = QdrantClient(url="http://localhost:6333")
    if not client.collection_exists("demo_collection"):
        client.create_collection(
            "demo_collection",
            vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
        )
        print("created")
    doc_store = QdrantVectorStore.from_existing_collection(
        embedding=embedding,
        collection_name="demo_collection",
        url="http://localhost:6333",
    )

    chunks = load_and_split_file(argv[1])
    ids = [str(uuid4()) for _ in range(len(chunks))]
    doc_store.add_documents(chunks, ids=ids)
