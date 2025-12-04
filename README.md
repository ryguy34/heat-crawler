# Web Scraping Guide: SNKRS, Supreme, Palace, and Kith

In this guide, we will walk you through the process of creating a web scraper using Node.js to extract data from SNKRS (under development), Supreme, Palace, and Kith websites. We'll also provide an overview of each website and highlight their key features.

## Table of Contents

- [SNKRS](#snkrs)
- [Supreme](#supreme)
- [Palace](#palace)
- [Kith](#kith)
- [Setup](#setup)

## SNKRS

_Status: Under development — functionality and endpoints are still being built._

The SNKRS website is a popular platform for sneaker enthusiasts. It features limited-edition and exclusive sneaker releases from various brands.

Key Features:

- Exclusive Sneaker Releases
- Limited-Edition Products
- Sneaker Release Calendar
- Weekly Product Drops at 10 AM EST

## Supreme

Supreme is a streetwear brand known for its highly sought-after apparel, accessories, and collaborations.

Key Features:

- Weekly Product Drops at 11 AM EST
- Collaborations with Artists and Brands
- Hypebeast Culture Icon

## Palace

Palace Skateboards is a British streetwear brand with a focus on skateboarding culture and bold designs.

Key Features:

- Skateboarding Apparel and Accessories
- Unique Graphic Designs
- Limited Product Releases
- Weekly Product Drops at 11 AM EST

## Kith

Kith is a lifestyle brand and retail store known for its curated selection of apparel, footwear, and collaborations.

Key Features:

- Exclusive Collaborations
- Premium Apparel and Footwear
- Multibrand Retail Experience
- Seasonal Collections
- Global Presence
- Weekly Product Drops at 11 AM EST

## Setup

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/ryguy34/heat-crawler.git
cd heat-crawler

# Prerequisites
- Node.js 18+ recommended
- pnpm installed (preferred). Install on Windows PowerShell:

npm install -g pnpm
pnpm -v

# Using pnpm (recommended)
pnpm install
pnpm dev        # runs `tsx watch src/main.ts` in dev mode
pnpm build      # compiles TypeScript to dist/
pnpm start      # runs the compiled app

# Using npm (alternative)
npm install
npm run dev
npm run build
npm start
```
