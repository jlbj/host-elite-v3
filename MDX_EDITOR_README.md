# MDX Editor - Setup Instructions

## 1. Run the Database Migration

### Option A: Copy from SQL File
1. Open `MDX_MIGRATION.sql` in this project
2. Copy the SQL content
3. Go to: https://dcaarwmafbrqdmwbulpt.supabase.co/project/sql
4. Paste and click **Run**

### Option B: Direct Link
Open this pre-filled URL (may need to copy SQL manually):
https://dcaarwmafbrqdmwbulpt.supabase.co/project/sql

Then paste:
```sql
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS mdx_content TEXT;
COMMENT ON COLUMN public.properties.mdx_content IS 'MDX content for custom website/microsite layouts';
```

## 2. Access the MDX Editor

1. Start the app: `npm run dev`
2. Navigate to a property
3. Click **MDX Editor** in the left sidebar (under Management section)
4. Edit MDX code and see live preview
5. Click **Save** to persist to database

## Features

- **Monaco Editor** - Professional code editor with syntax highlighting
- **Live Preview** - See changes instantly as you type
- **Templates** - Basic and Luxury templates to start from
- **Components**: Hero, Gallery, Features, Testimonials, Contact, CTA, Text

## Example MDX

```mdx
<Hero
  title="Luxury Villa"
  subtitle="Premium Rental"
  backgroundImage="https://example.com/image.jpg"
/>

<Gallery
  title="Photo Gallery"
  images={["url1.jpg", "url2.jpg"]}
/>

<Contact
  email="booking@example.com"
  phone="+34 612 345 678"
/>
```