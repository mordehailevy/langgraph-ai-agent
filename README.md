# LangGraph AI Agent

A tool-calling AI agent built with **LangChain** and **LangGraph**: ask a question in a chat UI, and the agent decides on its own when to call live tools (weather, product catalog) before answering.

## What it does

- **Chat UI** in a single HTML page, served by the same Express server
- **ReAct agent** (`createReactAgent` from `@langchain/langgraph`) that reasons, calls tools, then answers
- **Two tools:**

| Tool | What it does |
|------|--------------|
| `get_weather` | Turns a city name into coordinates (Open-Meteo geocoding), then returns the current temperature, humidity and wind speed. |
| `getProducts` | Returns the product catalog (id, title, description, price) from the public DummyJSON API. |

- **Works with any OpenAI-compatible model** (OpenAI by default, or any provider set with a base URL)
- **Production basics:** input validation, a 30-second agent timeout, JSON error responses, request size limit, no secrets in the repo

## How it works

```
Browser (frontend/index.html)
   │  POST /ask { "question": "Weather in Tel Aviv?" }
   ▼
Express server (index.ts) ── validates the question
   ▼
LangGraph ReAct agent ⇄ LLM (ChatOpenAI, OpenAI-compatible)
   │  the model picks a tool when it needs real data
   ├─► get_weather ──► Open-Meteo geocoding + forecast APIs
   └─► getProducts ──► DummyJSON products API
   ▼
{ "answer": "..." } ──► shown in the chat
```

## Tech stack

TypeScript · Node.js · Express 5 · LangChain · LangGraph · OpenAI-compatible LLM · Open-Meteo API · HTML/CSS/JS

## Getting started

Requires Node.js 18+ and an API key for an OpenAI-compatible chat API.

```bash
git clone https://github.com/mordehailevy/langgraph-ai-agent.git
cd langgraph-ai-agent
npm install
cp .env.example .env   # then fill in LLM_API_KEY (and LLM_BASE_URL for a non-OpenAI provider)
npm run dev            # http://localhost:3000
```

| Variable | Required | Description |
|----------|----------|-------------|
| `LLM_API_KEY` | yes | API key of your model provider |
| `LLM_BASE_URL` | no | Base URL of an OpenAI-compatible API (empty = OpenAI) |
| `LLM_MODEL` | no | Model name, default `gpt-4o-mini` |
| `PORT` | no | Server port, default `3000` |

You can also call the API directly:

```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the weather in Jerusalem right now?"}'
```

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Runs the server and restarts on changes |
| `npm start` | Runs the server |
| `npm run typecheck` | Type-checks the project |
| `npm run build` | Compiles to `dist/` |

## Project structure

```
├── index.ts              Express server and LangGraph agent
├── tools/
│   ├── getWeather.ts     Weather tool (Open-Meteo)
│   └── getProducts.ts    Product catalog tool (DummyJSON)
├── frontend/index.html   Chat UI
└── .env.example          Environment variables template
```

## Background

Started during the AI agents module of the John Bryce Full Stack & AI program (Tel Aviv), then extended: a second tool, error handling, timeouts and input validation.

**Author:** [Mordehai Levy](https://github.com/mordehailevy) · [LinkedIn](https://www.linkedin.com/in/mordehailevy)
