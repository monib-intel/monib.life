# Resume Assistant

AI assistant that generates role-specific resumes from source data.

## Overview

The Resume Assistant takes your master resume data and a job description, then generates a tailored resume optimized for the specific role. Output is PDF format.

## Usage

### With Nix (Recommended)

```bash
# From project root
nix develop

cd services/resume-assistant
python main.py --job-description "Software Engineer at Company X..."
```

### Manual Setup

```bash
cd services/resume-assistant
pip install -r requirements.txt
python main.py --job-description "..."
```

## Input

1. **Job Description**: Text describing the target role (CLI argument or file)
2. **Source Resume**: `vault/resume/source.md` (master resume data)

## Output

PDF file optimized for the target role:
- Tailored highlights based on job requirements
- Relevant experience emphasized
- Skills matched to job description
- Professional formatting

Note: PDFs are ephemeral and not stored in vault (generated on-demand).

## Source Resume Format

The source resume (`vault/resume/source.md`) should include:

```yaml
---
name: "Full Name"
email: "email@example.com"
phone: "+1-xxx-xxx-xxxx"
location: "City, State"
linkedin: "linkedin.com/in/username"
github: "github.com/username"
website: "example.com"
---

# Summary
[Professional summary]

# Experience

## Company Name | Role Title
*Start Date - End Date | Location*

- Achievement 1
- Achievement 2
- Achievement 3

## Previous Company | Previous Role
...

# Education

## Degree, Major | University Name
*Graduation Year*

# Skills

## Technical
- Skill 1
- Skill 2

## Languages
- Language 1 (Proficiency)

# Certifications
- Certification 1
- Certification 2

# Projects
- Project 1: Description
- Project 2: Description
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key | Yes* |
| `ANTHROPIC_API_KEY` | Anthropic API key | Yes* |
| `AI_PROVIDER` | `openai` or `anthropic` | No (default: openai) |

*One of the API keys is required based on the chosen provider.

## Configuration

Create a `.env` file:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

## Development

### Running Tests

```bash
nix develop
cd services/resume-assistant
python -m pytest tests/
```

### Code Style

```bash
black main.py
flake8 main.py
```

## Architecture

1. **Source Parser**: Reads and parses `vault/resume/source.md`
2. **Job Analyzer**: Extracts key requirements from job description
3. **Matcher**: Identifies relevant experience and skills
4. **Generator**: Creates tailored resume content using AI
5. **Renderer**: Produces PDF using Pandoc/LaTeX

## PDF Generation

Uses Pandoc with LaTeX template:
- Professional layout
- ATS-friendly formatting
- Consistent styling

### Dependencies

- Pandoc
- LaTeX (texliveSmall in Nix)
- Custom template (optional)

## Error Handling

- Missing source resume: Clear error with setup instructions
- Invalid job description: Request more specific input
- PDF generation failure: Check LaTeX/Pandoc installation

## Future Enhancements

- Multiple template options
- Cover letter generation
- LinkedIn optimization
- ATS score estimation
- Integration with admin API
