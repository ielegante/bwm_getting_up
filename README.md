# Legal Document Triage and Review System

This is a Next.js frontend application for the Legal Document Triage and Review System, designed to help legal professionals efficiently review and manage documents.

**Note: This is a work in progress and an experiment in working with an AI agent.**

## Core Functionality

The core functionality of this application is streamlined to:

1. Upload a zip file containing documents
2. Process and analyze these documents (vectorization or graph database)
3. Generate quick summaries of the documents' content
4. Enable document-by-document review within the zip file
5. Identify relationships between files and key personas
6. Mark documents as relevant, privileged, or key
7. Allow for local operation without cloud or server dependencies (except potentially for language model access)

## Getting Started

### Prerequisites

- Node.js 16.8.0 or later
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:

```bash
npm install
# or
yarn install
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Tech Stack

- **Next.js**: React framework for server-rendered applications
- **TypeScript**: Typed JavaScript for better developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **React Context API**: For state management
- **Lucide React**: Icon library
