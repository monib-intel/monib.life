# Reading Services Composition Architecture

## Overview

Integration of **Reading Assistant** (Analytical Reading) with **Syntopical Reader** (Comparative Analysis) to create a complete implementation of Mortimer Adler's reading framework.

## Composed Agent Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    INSPECTIONAL → ANALYTICAL                      │
│                      (Reading Assistant)                          │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ↓
                   📚 EPUB/PDF Input
                             │
                             ↓
                ┌────────────────────────┐
                │  Component 1: Converter │
                │  EPUB → Markdown        │
                └────────────┬───────────┘
                             │
                             ↓
                ┌────────────────────────────────────────┐
                │  Component 2: AI Analysis (7 Stages)   │
                │  ─────────────────────────────────     │
                │  Stage 1: Classification & Thesis      │
                │  Stage 2: Chapter Summaries            │
                │  Stage 3: Structure                    │
                │  Stage 4: Key Terms                    │
                │  Stage 5: Problems & Recommendations   │
                │  Stage 6: Practical Implications       │
                │  Stage 7: Further Reading              │
                └────────────┬───────────────────────────┘
                             │
                             ↓
              📄 Analytical Reading Output
              (Classification, Thesis, Structure,
               Terms, Arguments, Implications)
                             │
                             ↓
┌────────────────────────────────────────────────────────────────────┐
│                         BRIDGE ADAPTER                             │
│  Transforms Analytical Output → Structural Format                  │
│                                                                     │
│  Maps:                                                              │
│  • Thesis → Central Question + Diagnosis + Thesis                  │
│  • Key Terms → Terms Table                                         │
│  • Structure → Argument Architecture                               │
│  • Arguments → Dependencies & Assumptions                          │
│  • (Prompts for missing: Scope, Unique Contributions)              │
└────────────────────────────┬───────────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│                         SYNTOPICAL READING                        │
│                    (Syntopical Reader System)                     │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ↓
              📋 Structural Analysis (Agent 1 Format)
              (Question, Diagnosis, Thesis, Terms,
               Architecture, Scope, Dependencies)
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
    Multiple Books    User's Draft      Research Questions
         │                  │                  │
         │                  ▼                  │
         │          ┌───────────────┐          │
         │          │   Agent 5     │          │
         │          │   Writing     │          │
         │          │   Analyzer    │          │
         │          └───────┬───────┘          │
         │                  │                  │
         └──────────────────┴──────────────────┘
                            │
                            ▼
                   ┌────────────────┐
                   │    Agent 2     │
                   │   Syntopical   │
                   │   Comparator   │
                   └────────┬───────┘
                            │
                            ↓
              📊 Comparative Analysis
              (Agreements, Disagreements,
               Term Conflicts, Tensions)
                            │
                            ↓
                   ┌────────────────┐
                   │    Agent 3     │
                   │    Library     │
                   │   Connector    │
                   └────────┬───────┘
                            │
                            ↓
              📚 Library Connections
              (Relevant books from user's
               collection, connections)
                            │
                            ↓
                   ┌────────────────┐
                   │    Agent 4     │
                   │   Gap Finder   │
                   └────────┬───────┘
                            │
                            ▼
              💡 Research Recommendations
              (Gaps identified, directions
               to explore, external sources)
```

## Agent Directory

### Reading Assistant Agents (Analytical Level)

| Agent | Type | Purpose | Input | Output |
|-------|------|---------|-------|--------|
| **Converter** | Preprocessor | Extract text from EPUB | EPUB file | Markdown |
| **AI Analyzer** | Analytical | Deep single-book analysis (7 stages) | Markdown | Structured analysis |
| **Obsidian Formatter** | Postprocessor | Add wikilinks for vault | Markdown | Obsidian format |

### Bridge Layer

| Agent | Type | Purpose | Input | Output |
|-------|------|---------|-------|--------|
| **Adapter** | Transformer | Map Analytical → Structural format | Reading Assistant output | Agent 1 format |

### Syntopical Reader Agents (Syntopical Level)

| Agent | Type | Purpose | Input | Output |
|-------|------|---------|-------|--------|
| **Agent 1** | Extractor | Extract structure (BYPASSED when using Reading Assistant) | Raw book | Structural analysis |
| **Agent 2** | Comparator | Compare multiple books syntopically | Multiple structures | Comparison analysis |
| **Agent 3** | Connector | Link to user's library | Analysis + Library | Connections |
| **Agent 4** | Gap Finder | Identify missing perspectives | Analysis + Connections | Recommendations |
| **Agent 5** | Writer | Analyze user's drafts | User's writing | Questions & gaps |

## Complete Agent List (7 Total)

1. **EPUB Converter** - EPUB → Markdown
2. **Analytical Analyzer** - Deep single-book analysis (7 stages)
3. **Bridge Adapter** - Analytical → Structural transformation
4. **Syntopical Comparator** (Agent 2) - Compare book structures
5. **Library Connector** (Agent 3) - Connect to user's collection
6. **Gap Finder** (Agent 4) - Identify what's missing
7. **Writing Analyzer** (Agent 5) - Analyze user's drafts

## Workflow Examples

### Full Pipeline: Book → Understanding → Comparison → Gaps

```bash
# 1. Analytical Reading (Reading Assistant)
reading-assistant analyze book1.epub
reading-assistant analyze book2.epub
reading-assistant analyze book3.epub

# 2. Bridge transformation
adapter transform \
  --input vault/BookSummaries/book1_InspectionalReading.md \
  --output data/structures/book1.md

adapter transform \
  --input vault/BookSummaries/book2_InspectionalReading.md \
  --output data/structures/book2.md

adapter transform \
  --input vault/BookSummaries/book3_InspectionalReading.md \
  --output data/structures/book3.md

# 3. Syntopical Reading
syntopical compare data/structures/*.md
syntopical library-connect --analysis data/analyses/comparison.md
syntopical find-gaps --analysis data/analyses/comparison.md
```

### Writing-Driven Research

```bash
# 1. Analyze your draft
syntopical analyze-writing draft.md

# 2. Find relevant books you already have
syntopical library-connect \
  --analysis data/analyses/draft-questions.md \
  --library ~/Books

# 3. Deep read those books
reading-assistant analyze ~/Books/relevant-book.epub

# 4. Transform and compare
adapter transform vault/BookSummaries/relevant-book.md
syntopical compare data/structures/*.md

# 5. Find remaining gaps
syntopical find-gaps --analysis data/analyses/comparison.md
```

## Data Flow

```
EPUB → Markdown → Analytical Analysis → Structural Format
                                              ↓
                    Multiple Structures → Comparison
                                              ↓
                    User Library → Connections → Gaps → Recommendations
```

## Benefits of Composition

1. **Complete Adler Framework**: Inspectional → Analytical → Syntopical
2. **Reuse Deep Analysis**: Reading Assistant's 7-stage analysis feeds syntopical comparison
3. **Modular**: Can use Reading Assistant standalone or feed into syntopical pipeline
4. **Efficient**: Avoid re-extracting book content
5. **Rich Context**: Syntopical agents work with deeper analytical data

## Implementation Status

- ✅ Reading Assistant (Analytical) - Implemented
- ✅ Syntopical Reader (Agents 2-5) - Implemented
- ⚠️ Bridge Adapter - **NEEDS IMPLEMENTATION**
- ⚠️ Integration testing - **NEEDS IMPLEMENTATION**

## Next Steps

1. Implement Bridge Adapter to transform formats
2. Test Reading Assistant → Syntopical pipeline
3. Create unified CLI that orchestrates both services
4. Add end-to-end integration tests
