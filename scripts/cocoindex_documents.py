from __future__ import annotations

import argparse
import fnmatch
import json
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

DEFAULT_INCLUDE_PATTERNS = ["docs/**/*.md", "docs/**/*.mdx", "**/*.md", "**/*.mdx", "**/*.txt"]
DEFAULT_EXCLUDE_PATTERNS = [
    "node_modules/**",
    "dist/**",
    ".git/**",
    ".next/**",
    ".turbo/**",
    "coverage/**",
    ".cocoindex/**",
    ".gitnexus/**",
    ".hybrid-index/**",
    ".claude/**",
    "__pycache__/**",
    ".venv/**",
    "venv/**",
]
INDEX_DIRNAME = ".cocoindex"
INDEX_FILENAME = "documents.json"
SETTINGS_FILENAME = "settings.json"


@dataclass(frozen=True)
class Chunk:
    file_path: str
    start_line: int
    end_line: int
    language: str
    content: str
    tokens: list[str]


def main() -> None:
    parser = argparse.ArgumentParser(description="Document-only CocoIndex ingestion for HybridCode.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    index_parser = subparsers.add_parser("index")
    index_parser.add_argument("--project-dir", required=True)
    index_parser.add_argument("--reset", action="store_true")

    search_parser = subparsers.add_parser("search")
    search_parser.add_argument("--project-dir", required=True)
    search_parser.add_argument("--query", required=True)
    search_parser.add_argument("--limit", type=int, default=10)
    search_parser.add_argument("--path")

    args = parser.parse_args()
    if args.command == "index":
        print(json.dumps(index_documents(Path(args.project_dir), reset=args.reset)))
        return

    print(json.dumps(search_documents(Path(args.project_dir), args.query, limit=args.limit, path_glob=args.path)))


def index_documents(project_dir: Path, *, reset: bool) -> dict[str, int]:
    index_file = index_path(project_dir)
    if reset and index_file.exists():
        index_file.unlink()

    config = load_config(project_dir)
    chunks = [asdict(chunk) for chunk in build_chunks(project_dir, config)]
    index_file.parent.mkdir(parents=True, exist_ok=True)
    index_file.write_text(json.dumps({"chunks": chunks}, indent=2), encoding="utf-8")

    indexed_files = len({chunk["file_path"] for chunk in chunks})
    return {"indexedFiles": indexed_files, "chunkCount": len(chunks)}


def search_documents(project_dir: Path, query: str, *, limit: int, path_glob: str | None) -> dict[str, Any]:
    payload = json.loads(index_path(project_dir).read_text(encoding="utf-8"))
    query_tokens = tokenize(query)
    results: list[dict[str, Any]] = []

    for chunk in payload.get("chunks", []):
        if path_glob and not fnmatch.fnmatch(chunk["file_path"], path_glob):
            continue
        score = score_tokens(query_tokens, chunk.get("tokens", []))
        if score <= 0:
            continue
        results.append(
            {
                "file_path": chunk["file_path"],
                "start_line": chunk["start_line"],
                "end_line": chunk["end_line"],
                "language": chunk["language"],
                "score": score,
                "content": chunk["content"],
            }
        )

    results.sort(key=lambda item: item["score"], reverse=True)
    return {"results": results[: max(1, limit)]}


def build_chunks(project_dir: Path, config: dict[str, list[str]]) -> list[Chunk]:
    chunks: list[Chunk] = []
    for path in iter_document_files(project_dir, config):
        text = path.read_text(encoding="utf-8", errors="ignore")
        for chunk_text, start_line, end_line in split_text(text):
            if not chunk_text.strip():
                continue
            relative_path = path.relative_to(project_dir).as_posix()
            chunks.append(
                Chunk(
                    file_path=relative_path,
                    start_line=start_line,
                    end_line=end_line,
                    language=detect_language(path),
                    content=chunk_text,
                    tokens=tokenize(f"{relative_path} {chunk_text}"),
                )
            )
    return chunks


def split_text(text: str) -> list[tuple[str, int, int]]:
    try:
        from cocoindex.ops.text import RecursiveSplitter  # type: ignore

        splitter = RecursiveSplitter(chunk_size=1200, chunk_overlap=120)
        raw_chunks = [normalize_split_piece(piece) for piece in splitter.split(text)]
    except Exception:
        raw_chunks = fallback_split(text)

    chunks: list[tuple[str, int, int]] = []
    offset = 0
    for piece in raw_chunks:
        if not piece.strip():
            continue
        start = text.find(piece, offset)
        if start < 0:
            start = offset
        end = start + len(piece)
        start_line = text.count("\n", 0, start) + 1
        end_line = start_line + piece.count("\n")
        chunks.append((piece.strip(), start_line, end_line))
        offset = end
    return chunks


def normalize_split_piece(piece: Any) -> str:
    if isinstance(piece, str):
        return piece
    if isinstance(piece, dict):
        return str(piece.get("text") or piece.get("content") or "")
    value = getattr(piece, "text", None) or getattr(piece, "content", None)
    return str(value or piece)


def fallback_split(text: str) -> list[str]:
    lines = text.splitlines()
    pieces: list[str] = []
    step = 40
    for index in range(0, len(lines), step):
        pieces.append("\n".join(lines[index : index + step]))
    return pieces or [text]


def iter_document_files(project_dir: Path, config: dict[str, list[str]]) -> list[Path]:
    include_patterns = config.get("includePatterns", DEFAULT_INCLUDE_PATTERNS)
    exclude_patterns = config.get("excludePatterns", DEFAULT_EXCLUDE_PATTERNS)
    files: list[Path] = []

    for path in project_dir.rglob("*"):
        if not path.is_file():
            continue
        relative_path = path.relative_to(project_dir).as_posix()
        if any(fnmatch.fnmatch(relative_path, pattern) for pattern in exclude_patterns):
            continue
        if any(fnmatch.fnmatch(relative_path, pattern) for pattern in include_patterns):
            files.append(path)

    files.sort()
    return files


def load_config(project_dir: Path) -> dict[str, list[str]]:
    settings = project_dir / INDEX_DIRNAME / SETTINGS_FILENAME
    if not settings.exists():
        return {
            "includePatterns": DEFAULT_INCLUDE_PATTERNS,
            "excludePatterns": DEFAULT_EXCLUDE_PATTERNS,
        }
    return json.loads(settings.read_text(encoding="utf-8"))


def index_path(project_dir: Path) -> Path:
    return project_dir / INDEX_DIRNAME / INDEX_FILENAME


def tokenize(value: str) -> list[str]:
    return [token for token in re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", value).lower().split() for token in re.split(r"[^a-z0-9]+", token) if len(token) >= 2]


def score_tokens(query_tokens: list[str], content_tokens: list[str]) -> float:
    if not query_tokens or not content_tokens:
        return 0.0

    frequencies: dict[str, int] = {}
    for token in content_tokens:
        frequencies[token] = frequencies.get(token, 0) + 1

    matched = 0
    weighted = 0.0
    for token in set(query_tokens):
        frequency = frequencies.get(token, 0)
        if frequency <= 0:
            continue
        matched += 1
        weighted += 1 + frequency / 10

    if matched == 0:
        return 0.0
    return round((weighted / max(len(content_tokens), 1) ** 0.5) * matched, 4)


def detect_language(path: Path) -> str:
    extension = path.suffix.lower()
    if extension in {".md", ".mdx"}:
        return "markdown"
    if extension == ".txt":
        return "text"
    return extension.removeprefix(".") or "text"


if __name__ == "__main__":
    main()
