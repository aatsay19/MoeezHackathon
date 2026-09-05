# Ummah Connect — Hackathon MVP

## 1. Role

You are the senior full-stack engineer and technical architect for this hackathon project.

Your job is to help build a polished, production-quality MVP while aggressively protecting scope.

Do NOT attempt to build every possible feature.

The hackathon judging rubric is:

* Technical Implementation: 25%
* User Experience and Design: 20%
* Problem Solving: 20%
* Innovation and Creativity: 15%
* Presentation and Communication: 10%
* Community Focus: 10%

Every technical and product decision should support these judging criteria.

---

# 2. Product Vision

Muslim religious institutions, Muslim-owned businesses, nonprofits, community organizations, and individual community members often operate in fragmented networks.

Relevant information is scattered across:

* WhatsApp groups
* Facebook groups
* Instagram
* Email
* Organization websites
* Word of mouth
* LinkedIn
* Flyers
* Individual community networks

The problem is not that the Muslim community lacks resources.

The problem is that existing resources are fragmented and difficult to discover.

Ummah Connect is a community network designed to connect:

* Individuals
* Muslim organizations
* Religious institutions
* Muslim-owned businesses
* Nonprofits

through structured opportunities and community needs.

The core product primitive is an "Opportunity."

Examples:

* Job
* Volunteer opportunity
* Service
* Request for help
* Space/rental
* Event
* Referral
* Other community need

The platform should make it dramatically easier to:

1. Discover opportunities.
2. Find people and organizations.
3. Share community needs.
4. Offer skills and help.
5. Connect organizations with community members.

The product should NOT simply feel like "LinkedIn for Muslims."

The goal is to create infrastructure that connects existing community networks.

---

# 3. MVP Product Principles

## Principle 1 — Solve fragmentation

The platform should make information searchable and discoverable across organizations and community members.

## Principle 2 — Organizations are first-class users

The product is not exclusively person-to-person networking.

The network is:

Person ↔ Organization ↔ Business ↔ Opportunity

## Principle 3 — Opportunities are the core object

Avoid building separate complicated systems for jobs, volunteering, requests, events, rentals, etc.

Use a unified Opportunity model with different types.

## Principle 4 — Minimize friction

Posting an opportunity should be fast.

Responding to an opportunity should be one or two clicks.

## Principle 5 — Trust matters

Organizations and businesses should support a verification status.

## Principle 6 — Avoid feature creep

Do NOT build full messaging, social feeds, follower systems, likes, comments, payments, mobile apps, or LinkedIn integration in the initial MVP.

---

# 4. Technology Stack

Use:

* Next.js
* React
* TypeScript
* Next.js App Router
* Tailwind CSS
* shadcn/ui
* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Storage
* Zod
* Lucide React
* Vercel

Do NOT introduce:

* Java
* Spring Boot
* Angular
* Express
* Separate backend services
* Microservices
* Redis
* Kafka
* Docker unless absolutely necessary
* Separate API server

Keep the architecture simple and hackathon-friendly.

---

# 5. Architecture

Preferred architecture:

User
↓
Next.js / React
↓
Next.js Server Actions / Server-side functions
↓
Supabase
├── PostgreSQL
├── Auth
└── Storage

Use server-side operations for sensitive database operations.

Use Supabase Row Level Security wherever appropriate.

Never expose privileged Supabase credentials to the browser.

---

# 6. User Types

The MVP supports three primary profile types:

### Individual

Examples:

* Software engineer
* Student
* Accountant
* Volunteer
* Community member

### Organization

Examples:

* Masjid
* Islamic center
* Nonprofit
* Community organization
* Religious institution

### Business

Examples:

* Muslim-owned business
* Professional service provider
* Restaurant
* Retail business
* Consulting company

Do not create unnecessary role complexity.

---

# 7. Core MVP Features

## Feature 1 — Authentication

Users can:

* Sign up
* Log in
* Log out
* Reset password

Users select their profile type during onboarding.

---

## Feature 2 — Profiles

Individual profiles contain:

* Name
* Profile image
* Location
* Bio
* Profession
* Skills
* Interests

Organization/business profiles contain:

* Name
* Logo
* Description
* Type
* Location
* Website
* Verification status

---

## Feature 3 — Opportunity Creation

Authenticated organizations, businesses, and individuals can create opportunities.

Opportunity types:

* Job
* Volunteer
* Service
* Request
* Space
* Event
* Other

Opportunity fields should include only fields that are genuinely necessary.

At minimum:

* Title
* Description
* Type
* Creator
* Location
* Date/time when applicable
* Expiration date
* Status

---

## Feature 4 — Opportunity Feed

Users can browse opportunities.

The feed should support:

* Type filtering
* Location filtering
* Search
* Sorting/relevance

Cards should clearly communicate:

* Opportunity type
* Title
* Organization/person
* Location
* Date
* Relevant action

---

## Feature 5 — Opportunity Response

Different opportunity types can have different primary actions:

Job:

* Apply

Volunteer:

* I'm Interested

Event:

* RSVP

Request:

* Offer Help

Service:

* Contact

For the MVP, these actions should create an Opportunity Response record.

Do not build a complete messaging platform.

---

## Feature 6 — Search and Discovery

Users should be able to search across:

* Opportunities
* People
* Organizations
* Businesses

The search experience should be simple and fast.

---

## Feature 7 — Verification

Organizations and businesses should have a verification state.

Possible states:

* Unverified
* Pending
* Verified

For the hackathon MVP, an administrator can manually mark an organization/business as verified.

Do not build a complicated automated verification process.

---

# 8. AI Features

AI is secondary to the core product.

Do NOT introduce AI until the core MVP works.

Potential AI features:

## AI Feature A — Opportunity Structuring

Allow a user to enter natural language such as:

"We need 10 volunteers next Saturday from 10 AM to 2 PM to help distribute food."

AI can extract:

* Opportunity type
* Title
* Date
* Time
* Number of volunteers
* Description
* Location if available

The user MUST review and confirm the generated fields before publishing.

## AI Feature B — Opportunity Matching

Use user profile information and opportunity metadata to recommend relevant opportunities.

The MVP does not require a sophisticated machine-learning model.

A transparent scoring system or LLM-assisted classification is acceptable.

AI must enhance the product rather than exist merely as a gimmick.

---

# 9. Database Requirements

Before implementing database code, create:

/docs/database-schema.md

Document:

* Tables
* Columns
* Data types
* Relationships
* Primary keys
* Foreign keys
* Indexes
* Row Level Security policies

Potential entities include:

* profiles
* organizations
* organization_members
* opportunities
* opportunity_responses
* skills
* profile_skills
* opportunity_skills

Do not create unnecessary tables.

Challenge the schema before implementation.

Authentication users should be managed through Supabase Auth.

Application-specific profile data should be stored separately from auth.users.

---

# 10. UI/UX Requirements

The product should feel like a polished modern professional platform.

Do NOT make it look like:

* A generic CRUD dashboard
* An admin panel
* A university project
* A social media clone

Design goals:

* Clean
* Modern
* Trustworthy
* Community-oriented
* Professional
* Mobile responsive
* Accessible
* Fast to understand

Use shadcn/ui components where appropriate.

Use consistent spacing, typography, cards, badges, buttons, dialogs, forms, and navigation.

Use Lucide icons.

Avoid excessive animations.

Prioritize usability over visual gimmicks.

---

# 11. Primary Navigation

Recommended navigation:

Home
Opportunities
Organizations
People
Post Opportunity

Authenticated users should have access to:

Profile
My Opportunities
My Responses
Settings

Do not add unnecessary navigation items.

---

# 12. Homepage

The homepage should immediately communicate:

"Connect with your community."

Supporting message:

"Find opportunities. Share your skills. Support Muslim organizations and businesses."

Primary CTAs:

* Explore Opportunities
* Post an Opportunity

Show a small selection of real/demo opportunities.

---

# 13. Demo Data

The application must support seeded/demo data.

Create realistic demo data representing a local Muslim community.

Include:

* Several organizations
* Several businesses
* Several individual profiles
* Multiple opportunities across different categories

Demo data should make the platform feel alive.

Do not use meaningless data such as:

"Test Organization 1."

Use realistic but fictional names.

Clearly document how to seed/reset demo data.

---

# 14. Security

Implement:

* Supabase Row Level Security
* Authentication checks
* Server-side authorization
* Input validation
* Zod validation
* Safe database operations

Never trust client-provided user IDs for authorization.

A user must not be able to edit/delete another user's resources unless explicitly authorized.

Do not expose service-role keys to the client.

---

# 15. Code Quality

Use:

* TypeScript
* Strong typing
* Reusable components
* Small focused functions
* Clear naming
* Consistent folder structure

Avoid:

* Huge components
* Duplicate logic
* Hardcoded data inside UI components
* Unnecessary abstractions
* Premature optimization

Use comments only when they provide meaningful context.

---

# 16. Development Process

CRITICAL:

Do NOT implement the entire application at once.

Work in explicit stages.

Before each stage:

1. Review existing implementation.
2. Review the requirements.
3. Identify dependencies.
4. Explain the implementation plan.
5. Implement only that stage.
6. Run tests/type checks/linting.
7. Verify the application works.
8. Summarize what changed.
9. Identify any remaining issues.
10. Wait for approval before moving to the next major stage.

Do not silently expand scope.

---

# 17. Development Stages

## STAGE 0 — Product and Architecture Planning

Do NOT build application features yet.

Create:

* /docs/product-requirements.md
* /docs/architecture.md
* /docs/database-schema.md
* /docs/design-system.md
* /docs/implementation-plan.md

Review the proposed architecture and identify potential problems.

Explicitly identify:

* Scope risks
* Technical risks
* UX risks
* Cold-start/network-effect risks
* Trust/verification risks

Then stop.

---

## STAGE 1 — Project Scaffolding

Create the Next.js application.

Configure:

* TypeScript
* App Router
* Tailwind
* shadcn/ui
* ESLint
* Environment variables
* Supabase client/server utilities

Create the base layout and design system.

Do not implement major business features yet.

---

## STAGE 2 — Database and Authentication

Implement:

* Supabase connection
* Database migrations/schema
* RLS
* Authentication
* Sign up
* Login
* Logout
* Password reset
* Profile creation

Create seed/demo data support.

Verify authorization behavior.

---

## STAGE 3 — Profiles

Implement:

* Individual profiles
* Organization profiles
* Business profiles
* Profile editing
* Profile viewing
* Skills
* Location
* Verification badge

Create polished profile pages.

---

## STAGE 4 — Opportunities

Implement:

* Create opportunity
* Edit opportunity
* Delete opportunity
* View opportunity
* Opportunity feed
* Opportunity types
* Opportunity status
* Expiration
* Organization/business attribution

This is the most important product feature.

---

## STAGE 5 — Discovery

Implement:

* Search
* Filtering
* Location filtering
* Opportunity category filtering
* People search
* Organization search
* Business search

Make discovery fast and intuitive.

---

## STAGE 6 — Engagement

Implement:

* Apply
* I'm Interested
* RSVP
* Offer Help
* Contact

Store responses in the database.

Create:

"My Responses"

and

"My Opportunities"

pages.

Do not build messaging yet.

---

## STAGE 7 — AI

Only implement AI after the core MVP is stable.

Implement:

1. AI opportunity structuring.
2. AI/relevance-based opportunity recommendations.

AI should always fail gracefully.

Do not make the application unusable if the AI API is unavailable.

---

## STAGE 8 — Hackathon Polish

Focus heavily on the judging rubric.

Technical:

* Fix bugs
* Improve loading states
* Improve error handling
* Verify RLS
* Verify mobile responsiveness
* Remove console errors
* Type check
* Lint

UX:

* Consistent spacing
* Empty states
* Skeleton loading
* Helpful errors
* Accessible forms
* Clear calls to action

Presentation:

* Seed compelling demo data
* Prepare a polished demo flow
* Make the core value proposition obvious within 30 seconds

---

# 18. Demo Flow

The final demo should tell a story.

Scenario:

1. An Islamic organization needs volunteers.
2. Organization posts an opportunity.
3. A community member discovers it.
4. Community member clicks "I'm Interested."
5. Organization sees the response.
6. Community member searches for a relevant professional/service.
7. The platform recommends a relevant opportunity.
8. Demonstrate AI transforming a natural-language request into a structured opportunity.
9. Show verified organizations/businesses.
10. End by showing the network connecting people, organizations, businesses, and opportunities.

The demo should demonstrate the problem and solution rather than simply showing technical features.

---

# 19. Things NOT to Build

Unless explicitly approved later, do NOT implement:

* LinkedIn integration
* Facebook integration
* WhatsApp integration
* Full messaging
* Chat
* Likes
* Comments
* Followers
* Social media feed
* Groups
* Payments
* Marketplace checkout
* Mobile application
* Video
* Voice
* Complex notifications
* Recommendation ML infrastructure
* Microservices
* Redis
* Kafka
* Complex admin dashboard

These are future roadmap items, not MVP requirements.

---

# 20. Future Roadmap

Potential post-MVP capabilities:

* LinkedIn profile import
* Google authentication
* WhatsApp sharing
* Organization verification
* Advanced recommendation engine
* Community groups
* Messaging
* Push notifications
* Mobile apps
* Organization analytics
* Event management
* Donations
* Payments
* Local community chapters
* API integrations

Do not implement these now.

---

# 21. Critical Product Question

At every stage ask:

"Does this feature make it easier for a Muslim community member or organization to discover, share, or act on a community opportunity?"

If the answer is no, challenge whether the feature belongs in the MVP.

---

# 22. Definition of Success

The MVP succeeds if a judge can understand the following within approximately 30 seconds:

"Muslim community resources are fragmented across many disconnected channels. This platform creates a searchable network connecting people, organizations, businesses, and opportunities."

The application should then demonstrate that claim through a polished, functional experience.

Do not optimize for the number of features.

Optimize for:

* Clear problem
* Clear solution
* Strong UX
* Functional technology
* Community impact
* Memorable demonstration
