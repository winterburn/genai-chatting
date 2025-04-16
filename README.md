# GenAI Testing Application

A FastAPI-based application that demonstrates the integration of OpenAI's GPT models with Qdrant vector database for context-aware question answering.

## Features

- FastAPI web server with CORS support
- OpenAI GPT integration for natural language processing
- Qdrant vector database for semantic search
- Context-aware question answering
- Comprehensive test suite

## Prerequisites

- Python 3.8+
- OpenAI API key
- Qdrant server running locally (default: http://localhost:6333)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd genai-testing
```

2. Create and activate a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -e ".[test]"
```

4. Create a `.env` file in the project root with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

## Running the Application

1. Start the FastAPI server:
```bash
fastapi dev main.py
```

2. The application will be available at `http://localhost:8080`

## API Endpoints

### POST /answer
Accepts a JSON payload with a prompt and returns an AI-generated answer based on the context.

Request:
```json
{
    "prompt": "Your question here"
}
```

Response:
```json
"AI-generated answer"
```

## Running Tests

To run the test suite:
```bash
pytest
```

The test suite includes:
- Context retrieval tests
- Answer generation tests
- Error handling tests
- Environment variable validation

## Project Structure

```
genai-testing/
├── main.py              # Main FastAPI application
├── pyproject.toml       # Project configuration and dependencies
├── tests/               # Test directory
│   └── test_main.py    # Test suite
└── README.md           # This file
```

## Development

This project uses:
- FastAPI for the web framework
- OpenAI for AI capabilities
- Qdrant for vector database
- pytest for testing
- pyproject.toml for dependency management

## License

MIT

## Author

Olli Helminen - coding@winterburn.aleeas.com
