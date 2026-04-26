import os
from datetime import datetime
from dotenv import load_dotenv

from langchain.agents import create_agent
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.tools import tool
from langchain_core.messages import AIMessage
from pydantic import BaseModel, Field


load_dotenv()

os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_KEY")

# ── Model ──────────────────────────────────────────────────────────────────
llm = ChatGoogleGenerativeAI(
    model="gemma-4-26b-a4b-it", 
    temperature=0.2
)

# ── RAG Setup ──────────────────────────────────────────────────────────────
def load_pdfs_to_vectorstore(pdf_paths: list[str]):
    """Load PDFs, chunk them, embed and store in Chroma."""
    docs = []
    for path in pdf_paths:
        loader = PyPDFLoader(path)
        docs.extend(loader.load())

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )
    chunks = splitter.split_documents(docs)

    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    vectorstore = Chroma.from_documents(chunks, embeddings, persist_directory="./chroma_db")
    print(f"✅ Loaded {len(chunks)} chunks from {len(pdf_paths)} PDF(s)")
    return vectorstore

# Point to your PDFs here
PDF_PATHS = [
    "embeddings/Underwater_Welding_Certifications_and_Fitness_Standards.pdf",
    # "another_file.pdf",
]

vectorstore = load_pdfs_to_vectorstore(PDF_PATHS)
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# ── Tools ──────────────────────────────────────────────────────────────────

@tool
def search_documents(query: str) -> str:
    """Search the loaded PDF documents for relevant information. 
    Use this during thinking to evaluate certifications, fitness standards, or any other info contained in the PDFs."""
    print("hit search documents tool")
    results = retriever.invoke(query)
    if not results:
        return "No relevant information found in the documents."
    
    output = ""
    for i, doc in enumerate(results):
        source = doc.metadata.get("source", "unknown")
        page = doc.metadata.get("page", "?")
        output += f"\n[Doc {i+1} | {source} | page {page}]:\n{doc.page_content}\n"
    return output

@tool
def estimate_dive_fitness(last_dive_depth: float,last_dive_depth_units: str, last_dive_date: str, next_dive_date: str) -> str:
    """
    Estimates dive fitness based on last dive depth and date. 
    Inputs: last_dive_depth in feet(float), last_dive_depth_units: 'feet' or 'meters'. Defaults to 'feet'., last_dive_date (YYYY-MM-DD HH:MM:SS), next_dive_date (YYYY-MM-DD HH:MM:SS).
    """
    print("hit estimate dive fitness tool")
    if(last_dive_depth_units.lower() == "meters"):
        last_dive_depth = last_dive_depth * 3.28084  # Convert meters to feet
        
    try:
        start = datetime.strptime(last_dive_date, "%Y-%m-%d %H:%M:%S")
        next_dive = datetime.strptime(next_dive_date, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return "Error: Timestamps must be in YYYY-MM-DD HH:MM:SS format."

    # Calculate Surface Interval (SI) in hours
    si_hours = (next_dive - start).total_seconds() / 3600

    # 1. THE "CLEAN SLATE" RULE
    if si_hours >= 24:
        return "STATUS: FIT. Surface interval exceeds 24 hours. Nitrogen levels normalized."

    # 2. THE "NO-GO" MINIMUM WINDOW
    if si_hours < 2:
        return f"STATUS: UNFIT. Surface interval ({si_hours:.1f}h) is below the 2-hour minimum safety threshold."

    # 3. CAUTIONARY DEPTH-BASED ESTIMATION
    # We assume 'worst case' nitrogen loading from the previous dive.
    if last_dive_depth > 100:
        required_wait = 12
        severity = "HIGH (Deep Dive)"
    elif last_dive_depth > 60:
        required_wait = 8
        severity = "MODERATE"
    else:
        required_wait = 4
        severity = "LOW"

    if si_hours < required_wait:
        return (f"STATUS: UNFIT (CAUTION). For a {last_dive_depth}ft dive ({severity}), "
                f"a minimum of {required_wait}h is recommended. Current interval: {si_hours:.1f}h.")
    
    return (f"STATUS: CONDITIONALLY FIT. Surface interval of {si_hours:.1f}h is acceptable for a "
            f"{last_dive_depth}ft previous dive. Monitor for symptoms of DCS.")


tools = [search_documents, estimate_dive_fitness]

# ── Agent ──────────────────────────────────────────────────────────────────
agent = create_agent(
    model=llm,
    tools=tools,
    system_prompt="You are a dive roster assistant. Given a job and a list of divers, select the safest and most qualified team.\n\n"
    "Use tools if necessary. Prioritize safety above all else. Include a final output with the chosen divers' IDs list, your reasoning, and a confidence level (high, medium, low).",
)

def run_agent(message: str) -> str:
    print("Calling agent...");
    result = agent.invoke({"messages": [{"role": "user", "content": message}]})
    print(f"\nAgent: {result['messages'][-1].content}")
    return result['messages'][-1].content



# ── pydantic formatter ──────────────────────────────────────────────────────────────────
class FormattedResponse(BaseModel):
    chosen_ids: list[int] = Field(description="Generated Lineup of workers id numbers recommended for the next job")
    reasoning: str = Field(description="A detailed report of agent's reasoning, why it picked the divers it did.")
    confidence: str = Field(description="high, medium, or low")

structured_llm = llm.with_structured_output(FormattedResponse)

def formatter(string_response: str):
    structured_out = structured_llm.invoke(f"Format this response properly:\n\n{string_response}")
    print(f"\nStructured Output: {structured_out}")
    return structured_out.model_dump()

