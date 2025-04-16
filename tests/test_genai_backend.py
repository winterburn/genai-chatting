import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from genai_backend.genai_backend import app, get_context
import os

# Test client
client = TestClient(app)

# Mock data
MOCK_EMBEDDING = [0.1, 0.2, 0.3]  # Simplified mock embedding
MOCK_DOCUMENTS = [
    MagicMock(payload={"page_content": "Test document 1"}),
    MagicMock(payload={"page_content": "Test document 2"}),
]
MOCK_OPENAI_RESPONSE = MagicMock(
    output_text="This is a test response", data=[MagicMock(embedding=MOCK_EMBEDDING)]
)


@pytest.fixture
def mock_openai():
    with patch("genai_backend.genai_backend.client") as mock:
        mock.embeddings.create.return_value = MOCK_OPENAI_RESPONSE
        mock.responses.create.return_value = MagicMock(output_text="Test response")
        yield mock


@pytest.fixture
def mock_qdrant():
    with patch("genai_backend.genai_backend.qdrant") as mock:
        mock.search.return_value = MOCK_DOCUMENTS
        yield mock


def test_get_context_success(mock_openai, mock_qdrant):
    """Test successful context retrieval"""
    result = get_context("test prompt")
    assert len(result) == 2
    assert result[0] == "Test document 1"
    assert result[1] == "Test document 2"

    # Verify OpenAI was called correctly
    mock_openai.embeddings.create.assert_called_once_with(
        model="text-embedding-3-small", input="test prompt"
    )

    # Verify Qdrant was called correctly
    mock_qdrant.search.assert_called_once_with(
        collection_name="demo_collection", query_vector=MOCK_EMBEDDING
    )


def test_get_context_openai_error(mock_openai, mock_qdrant):
    """Test OpenAI error handling"""
    mock_openai.embeddings.create.side_effect = Exception("OpenAI API error")

    with pytest.raises(Exception) as exc_info:
        get_context("test prompt")
    assert "OpenAI API error" in str(exc_info.value)


def test_get_answer_success(mock_openai, mock_qdrant):
    """Test successful answer generation"""
    response = client.post("/answer", json={"prompt": "test question"})
    assert response.status_code == 200
    assert response.json() == "Test response"


def test_get_answer_no_context(mock_openai, mock_qdrant):
    """Test handling of no context found"""
    mock_qdrant.search.return_value = []

    response = client.post("/answer", json={"prompt": "test question"})
    assert response.status_code == 404
    assert "No relevant context found" in response.json()["detail"]


def test_get_answer_openai_error(mock_openai, mock_qdrant):
    """Test OpenAI error handling in answer endpoint"""
    mock_openai.responses.create.side_effect = Exception("OpenAI API error")

    response = client.post("/answer", json={"prompt": "test question"})
    assert response.status_code == 500
    assert "OpenAI API error" in response.json()["detail"]
