# Project: AI-Integrated Content Writing Web Platform

[cite_start]Building an AI-integrated content writing support website is a practical direction with high commercial potential and large user demand[cite: 23].

## 1. Tech Stack & Architecture
* [cite_start]**Frontend**: ReactJS, Vue.js, or Next.js (especially good for SEO optimization)[cite: 35].
* [cite_start]**Backend**: Node.js (Express) or Python (FastAPI/Flask), which is excellent for AI ecosystem support[cite: 37].
* [cite_start]**Database**: PostgreSQL or MongoDB to store user information and article history[cite: 40].
* [cite_start]**AI Integration**: Gemini API, OpenAI API (GPT), or Claude[cite: 38]. [cite_start]You can use LangChain to manage and optimize prompts[cite: 39].

## 2. Project Features

### Core Features (For Users)
* [cite_start]**Template-based Generation**: Users input keywords, select a platform (Facebook, Blog, TikTok...), and choose a tone[cite: 25]. [cite_start]The AI then generates a complete article[cite: 26].
* [cite_start]**SEO Optimization**: The system automatically distributes keywords and writes SEO-standard titles and meta descriptions for blogs[cite: 27].
* [cite_start]**Rewrite & Polish**: Allows users to paste raw text for the AI to fix spelling errors, smooth out the writing, or change the length[cite: 28].
* [cite_start]**Outline Generator**: For users running out of ideas, simply entering a topic will generate a detailed outline[cite: 29, 30].

### Advanced Features (For Differentiation)
* [cite_start]**Brand Voice**: Users provide 2-3 old articles for the system to analyze[cite: 31]. [cite_start]The AI then writes new articles matching that specific style and tone[cite: 32].
* [cite_start]**Text-to-Image**: Integrates APIs (like DALL-E or Midjourney) to generate suitable illustrations for the articles[cite: 33].
* [cite_start]**Direct Publishing**: Supports posting articles directly to WordPress or Facebook Fanpages via API[cite: 34].

## 3. User Interface (UI)
[cite_start]The interface should be designed to be intuitive and user-friendly[cite: 59].
* [cite_start]**Dashboard Screen (Overview)**: Displays statistics on words generated, recent articles, and quick-access buttons to writing tools[cite: 60].
* [cite_start]**Workspace Screen (Editor)**: The most important area, divided into 2 parts[cite: 61]:
    * [cite_start]**Left Column**: Forms to input keywords, select platforms, and choose tones[cite: 61].
    * [cite_start]**Right Column**: A Rich Text Editor for users to view AI results and edit directly[cite: 62].
* [cite_start]**Content Management Screen (History)**: Stores all generated articles and outlines for easy retrieval[cite: 63].
* [cite_start]**Settings Screen**: Account configuration, "Brand Voice" setup, and social media/WordPress linking for direct publishing[cite: 64].

## 4. Admin Interface (System Management)
* [cite_start]**Admin Dashboard**: Statistics on total users, API requests consumed, and revenue[cite: 65].
* [cite_start]**User Management**: View user list, account status, usage history, and manage passwords or locks[cite: 66].
* [cite_start]**Subscription/Billing**: Configure monthly word limits, image limits, and manage payments[cite: 67].
* [cite_start]**System Settings**: Manage API Keys (Gemini, OpenAI), customize global LangChain prompts, and track system error logs[cite: 68].

## 5. Application Name Suggestions
* [cite_start]**Short & Visual**: WriteAI, AIPen, ContentX, WordFlow[cite: 71, 72, 73, 74].
* [cite_start]**Professional Orientation**: SmartScribe, BrandVoice, OptiContent, CopyCraft[cite: 75, 76, 77, 78].
* [cite_start]**Creative & Impressive**: MagicPen AI (BútThần AI), WordNinja, GoodWords (ChữHay), FastContent (NhanhContent)[cite: 79, 80, 81, 82].

## 6. UI Design Prompt

*Here is the detailed prompt to use with UI design AI tools (like v0.dev, Figma AI):*

> [cite_start]**Act as an Expert UI/UX Designer.** Design a modern, clean, and intuitive SaaS web application interface for an AI-powered Content Writing platform[cite: 96, 97]. The design style should be **Minimalist & Focused**, utilizing a primary color of **Dark Slate (#334155)** combined with an **Ivory White (#F9FAFB)** background.
> 
> [cite_start]Please design the following 4 main screens[cite: 99]:
> 
> **1. Dashboard Screen (Overview)**
> [cite_start]* **Header/Nav**: Minimalist top or side navigation bar[cite: 99].
> * **Hero Section**: A welcoming greeting with quick-action cards/buttons to start writing: "Blog Post", "Social Media (Facebook/TikTok)", and "Email"[cite: 100].
> [cite_start]* **Statistics Panel**: Display visual counters for "Words Generated", "Articles Saved", and "Images Created"[cite: 101].
> [cite_start]* **Recent Activity**: A list or grid view showing the most recently generated articles with their status and creation date[cite: 102].
> 
> **2. Workspace Screen (The Core Editor)**
> * **Layout**: A split-screen layout (Two columns)[cite: 104].
> [cite_start]* **Left Column (Input Forms)**: Input fields for "Target Keywords", "Topic", and a dropdown for "Platform" (Facebook, Blog, TikTok)[cite: 104]. [cite_start]A dropdown or selector for "Tone of Voice" (Professional, Casual, Humor, or Custom Brand Voice)[cite: 105]. [cite_start]Toggle switches or tabs for extra tools: "Generate Outline", "Optimize SEO (Title & Meta Description)", and "Generate AI Image (DALL-E/Midjourney)"[cite: 106]. [cite_start]A prominent primary button: "Generate Content"[cite: 107].
> [cite_start]* **Right Column (Rich Text Editor & Output)**: A clean, distraction-free Rich Text Editor where the AI output appears[cite: 107]. [cite_start]Floating contextual menu (when text is selected) with options: "Rewrite", "Fix Grammar", "Expand", and "Summarize"[cite: 108]. [cite_start]A top bar above the editor with a "Publish Directly" button (WordPress/Facebook logos)[cite: 109].
> 
> **3. Content Management Screen (History/Library)**
> [cite_start]* **Layout**: A data grid or card layout[cite: 110].
> * **Features**: Search bar, filter by "Platform" or "Date"[cite: 111].
> [cite_start]* **Items**: List of all previously generated articles and outlines[cite: 111]. [cite_start]Each item should show the title, a small thumbnail (if an AI image was generated), tags (platform/tone), and a "Quick Edit" button[cite: 112].
> 
> **4. Settings Screen (Configuration & Brand Voice)**
> [cite_start]* **Layout**: Sidebar navigation for different setting categories[cite: 113].
> [cite_start]* **Profile/Account**: Basic user info[cite: 114].
> * **Brand Voice Setup**: A dedicated section where users can upload or paste 2-3 sample articles to train their custom "Brand Voice"[cite: 114].
> [cite_start]* **Integrations**: A panel to connect third-party APIs (WordPress, Facebook Pages) with "Connect" toggle buttons[cite: 115].
> 
> **Design Requirements:**
> * **Design Style**: Minimalist & Focused.
> * **Color Palette**: Use **Dark Slate (#334155)** for primary accents/text and **Ivory White (#F9FAFB)** for the main background.
> [cite_start]* Use a modern sans-serif font (e.g., Inter or Roboto)[cite: 116].
> * Ensure high contrast for readability[cite: 116].
> [cite_start]* Make the Workspace screen look like a highly productive environment without feeling cluttered[cite: 117].
> [cite_start]* Include placeholders for icons (e.g., Lucide or Feather icons)[cite: 118].