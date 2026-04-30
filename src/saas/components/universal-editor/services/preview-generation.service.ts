import { Injectable } from '@angular/core';
import { EditorTheme } from '../models/editor-theme';
import { EditorLayout } from '../models/editor-layout';

export interface PreviewData {
    layout: EditorLayout;
    theme: EditorTheme;
    sections: string[];
    content: Record<string, any>;
    photos?: Array<{ url: string; category: string }>;
    propertyDetails?: any;
}

@Injectable({
    providedIn: 'root'
})
export class PreviewGenerationService {
    
    generateHtml(data: PreviewData): string {
        const { layout, theme, content, photos, propertyDetails } = data;
        
        console.log('[PreviewGeneration] Input photos:', photos?.length, 'content keys:', Object.keys(content || {}));
        
        const cssVariables = this.generateCssVariables(theme);
        const baseStyles = this.generateBaseStyles();
        const layoutStyles = this.generateLayoutStyles(layout, theme);
        const bodyContent = this.generateBodyContent(data);
        
        return `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Preview</title>
                    <style>
                        ${cssVariables}
                        ${baseStyles}
                        ${layoutStyles}
                    </style>
                </head>
                <body>
                    ${bodyContent}
                </body>
            </html>
        `;
    }

    private generateCssVariables(theme: EditorTheme): string {
        return `
            :root {
                --primary-color: ${theme.primaryColor};
                --secondary-color: ${theme.secondaryColor};
                --background-color: ${theme.backgroundColor};
                --text-color: ${theme.textColor};
                --accent-color: ${theme.accentColor};
                --font-family: ${theme.fontFamily};
                --font-heading: ${theme.fontHeading};
                --font-size: ${this.getFontSize(theme.fontSize)};
                --button-radius: ${this.getButtonRadius(theme.buttonStyle)};
                --spacing: ${this.getSpacingValue(theme.spacing)};
                --border-radius: ${this.getBorderRadiusValue(theme.borderRadius)};
                --background-image: ${theme.backgroundImage ? `url(${theme.backgroundImage})` : 'none'};
                --background-size: ${theme.backgroundSize};
            }
        `;
    }

    private generateBaseStyles(): string {
        return `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: var(--font-family);
                color: var(--text-color);
                background-color: var(--background-color);
                line-height: 1.6;
            }
            h1, h2, h3, h4, h5, h6 {
                font-family: var(--font-heading);
                color: var(--primary-color);
                margin-bottom: 1rem;
            }
            p {
                margin-bottom: 1rem;
            }
            img {
                max-width: 100%;
                height: auto;
                display: block;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem;
            }
            .btn {
                display: inline-block;
                padding: 0.75rem 1.5rem;
                background-color: var(--primary-color);
                color: white;
                text-decoration: none;
                border-radius: var(--button-radius);
                transition: opacity 0.2s;
                border: none;
                cursor: pointer;
            }
            .btn:hover {
                opacity: 0.9;
            }
            .section {
                padding: 3rem 2rem;
                margin-bottom: 2rem;
            }
            .grid {
                display: grid;
                gap: 1.5rem;
            }
            .grid-2 { grid-template-columns: repeat(2, 1fr); }
            .grid-3 { grid-template-columns: repeat(3, 1fr); }
            .grid-4 { grid-template-columns: repeat(4, 1fr); }
            @media (max-width: 768px) {
                .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
            }
        `;
    }

    private generateLayoutStyles(layout: EditorLayout, theme: EditorTheme): string {
        const config = layout.config;
        const layoutType = config.layoutType;
        
        return `
            /* ============================================
               ANIMATION SYSTEM
               ============================================ */
            
            /* Entrance Animations */
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeInScale {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideInLeft {
                from { opacity: 0; transform: translateX(-50px); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(50px); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes kenBurns {
                from { transform: scale(1); }
                to { transform: scale(1.1); }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            @keyframes scrollIndicator {
                0%, 100% { opacity: 1; transform: translateY(0); }
                50% { opacity: 0.5; transform: translateY(10px); }
            }

            /* Animation Classes */
            .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
            .animate-fade-in-scale { animation: fadeInScale 0.8s ease-out forwards; }
            .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
            .animate-slide-in-left { animation: slideInLeft 0.8s ease-out forwards; }
            .animate-slide-in-right { animation: slideInRight 0.8s ease-out forwards; }
            .animate-ken-burns { animation: kenBurns 10s ease-out forwards; }
            .animate-pulse { animation: pulse 2s ease-in-out infinite; }
            .animate-scroll-indicator { animation: scrollIndicator 2s ease-in-out infinite; }

            /* Stagger children animations */
            .stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
            .stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
            .stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
            .stagger-children > *:nth-child(4) { animation-delay: 0.4s; }
            .stagger-children > *:nth-child(5) { animation-delay: 0.5s; }
            .stagger-children > *:nth-child(6) { animation-delay: 0.6s; }
            
            /* Animation trigger on viewport entry */
            .animate-on-scroll { opacity: 0; transform: translateY(30px); }
            .animate-on-scroll.visible { animation: fadeInUp 0.8s ease-out forwards; }

            /* ============================================
               HOVER EFFECTS SYSTEM
               ============================================ */
            
            /* Lift effect */
            .hover-lift {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            .hover-lift:hover {
                transform: translateY(-8px);
                box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            }
            
            /* Zoom effect */
            .hover-zoom {
                overflow: hidden;
            }
            .hover-zoom img,
            .hover-zoom .zoom-container {
                transition: transform 0.5s ease;
            }
            .hover-zoom:hover img,
            .hover-zoom:hover .zoom-container {
                transform: scale(1.1);
            }
            
            /* Glow effect */
            .hover-glow {
                transition: box-shadow 0.3s ease;
            }
            .hover-glow:hover {
                box-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
            }
            
            /* Shine effect */
            .hover-shine {
                position: relative;
                overflow: hidden;
            }
            .hover-shine::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                transition: left 0.5s ease;
            }
            .hover-shine:hover::after {
                left: 100%;
            }

            /* ============================================
               PARALLAX SYSTEM
               ============================================ */
            
            .parallax-bg {
                background-attachment: fixed;
                background-position: center;
                background-repeat: no-repeat;
                background-size: cover;
            }
            
            @media (max-width: 768px) {
                .parallax-bg { background-attachment: scroll; }
            }

            /* ============================================
               LAYOUT: HERO FULLSCREEN
               ============================================ */
            
            .hero-fullscreen {
                position: relative;
                height: 100vh;
                min-height: 600px;
                background-size: cover;
                background-position: center;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
            .hero-fullscreen::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(
                    to bottom,
                    rgba(0,0,0,0.2) 0%,
                    rgba(0,0,0,0.4) 50%,
                    rgba(0,0,0,0.7) 100%
                );
            }
            .hero-fullscreen .hero-content {
                position: relative;
                z-index: 1;
                max-width: 900px;
                padding: 2rem;
                text-align: center;
            }
            .hero-fullscreen .hero-headline {
                font-size: clamp(2.5rem, 6vw, 4.5rem);
                font-weight: 700;
                margin-bottom: 1rem;
                text-shadow: 0 4px 20px rgba(0,0,0,0.5);
                opacity: 0;
                animation: fadeInUp 1s ease-out 0.3s forwards;
            }
            .hero-fullscreen .hero-subtitle {
                font-size: clamp(1rem, 2vw, 1.5rem);
                opacity: 0;
                animation: fadeInUp 1s ease-out 0.6s forwards;
            }
            .hero-fullscreen .scroll-indicator {
                position: absolute;
                bottom: 40px;
                left: 50%;
                transform: translateX(-50%);
                opacity: 0;
                animation: fadeIn 1s ease-out 1s forwards, scrollIndicator 2s ease-in-out 2s infinite;
                cursor: pointer;
            }
            .hero-fullscreen .scroll-indicator span {
                display: block;
                width: 24px;
                height: 24px;
                border-right: 2px solid white;
                border-bottom: 2px solid white;
                transform: rotate(45deg);
                margin: 0 auto;
            }

            /* ============================================
               LAYOUT: HERO SPLIT
               ============================================ */
            
            .hero-split {
                display: grid;
                grid-template-columns: 1fr 1fr;
                min-height: 100vh;
            }
            @media (max-width: 768px) {
                .hero-split { grid-template-columns: 1fr; }
            }
            .hero-split .split-image {
                position: relative;
                background-size: cover;
                background-position: center;
            }
            .hero-split .split-image::before {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, rgba(0,0,0,0.1), rgba(0,0,0,0.3));
            }
            .hero-split .split-content {
                display: flex;
                flex-direction: column;
                justify-content: center;
                padding: 4rem;
                background: var(--background-color);
            }
            .hero-split .split-headline {
                font-size: clamp(2rem, 4vw, 3rem);
                font-weight: 700;
                margin-bottom: 1.5rem;
                color: var(--primary-color);
                opacity: 0;
                animation: slideInRight 0.8s ease-out 0.3s forwards;
            }
            .hero-split .split-details {
                display: flex;
                gap: 2rem;
                flex-wrap: wrap;
                margin-bottom: 2rem;
                opacity: 0;
                animation: slideInRight 0.8s ease-out 0.5s forwards;
            }
            .hero-split .split-detail {
                text-align: center;
            }
            .hero-split .split-detail-value {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--primary-color);
            }
            .hero-split .split-detail-label {
                font-size: 0.875rem;
                color: var(--text-color);
                opacity: 0.7;
            }

            /* ============================================
               LAYOUT: GALLERY GRID
               ============================================ */
            
            .gallery-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 0.5rem;
                padding: 0.5rem;
            }
            @media (max-width: 768px) {
                .gallery-grid { grid-template-columns: 1fr; }
            }
            .gallery-grid .gallery-item {
                position: relative;
                aspect-ratio: 4/3;
                overflow: hidden;
                border-radius: 8px;
                cursor: pointer;
            }
            .gallery-grid .gallery-item img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .gallery-grid .gallery-item:hover img {
                transform: scale(1.1);
            }
            .gallery-grid .gallery-item::after {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .gallery-grid .gallery-item:hover::after {
                opacity: 1;
            }
            .gallery-grid .gallery-caption {
                position: absolute;
                bottom: 1rem;
                left: 1rem;
                right: 1rem;
                color: white;
                font-weight: 600;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s ease;
                z-index: 1;
            }
            .gallery-grid .gallery-item:hover .gallery-caption {
                opacity: 1;
                transform: translateY(0);
            }

            /* ============================================
               LAYOUT: CAROUSEL
               ============================================ */
            
            .hero-carousel {
                position: relative;
                height: 70vh;
                min-height: 500px;
                overflow: hidden;
            }
            .hero-carousel .carousel-slide {
                position: absolute;
                inset: 0;
                background-size: cover;
                background-position: center;
                opacity: 0;
                transition: opacity 1s ease;
            }
            .hero-carousel .carousel-slide.active {
                opacity: 1;
            }
            .hero-carousel .carousel-slide::before {
                content: '';
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.4);
            }
            .hero-carousel .carousel-content {
                position: relative;
                z-index: 1;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: white;
                text-align: center;
                padding: 2rem;
            }
            .hero-carousel .carousel-nav {
                position: absolute;
                bottom: 2rem;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 0.5rem;
                z-index: 2;
            }
            .hero-carousel .carousel-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: rgba(255,255,255,0.5);
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .hero-carousel .carousel-dot.active {
                background: white;
                transform: scale(1.2);
            }

            /* ============================================
               LAYOUT: MASONRY
               ============================================ */
            
            .photo-masonry {
                column-count: 3;
                column-gap: 1rem;
                padding: 1rem;
            }
            @media (max-width: 1024px) {
                .photo-masonry { column-count: 2; }
            }
            @media (max-width: 640px) {
                .photo-masonry { column-count: 1; }
            }
            .photo-masonry .masonry-item {
                break-inside: avoid;
                margin-bottom: 1rem;
                border-radius: 8px;
                overflow: hidden;
                position: relative;
            }
            .photo-masonry .masonry-item img {
                width: 100%;
                height: auto;
                display: block;
                transition: transform 0.5s ease;
            }
            .photo-masonry .masonry-item:hover img {
                transform: scale(1.05);
            }
            .photo-masonry .masonry-overlay {
                position: absolute;
                inset: 0;
                background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
                display: flex;
                align-items: flex-end;
                padding: 1.5rem;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .photo-masonry .masonry-item:hover .masonry-overlay {
                opacity: 1;
            }
            .photo-masonry .masonry-label {
                color: white;
                font-weight: 600;
            }

            /* ============================================
               LAYOUT: SIDEBAR SCROLL
               ============================================ */
            
            .sidebar-layout {
                display: grid;
                grid-template-columns: 45% 55%;
                min-height: 100vh;
            }
            @media (max-width: 768px) {
                .sidebar-layout { grid-template-columns: 1fr; }
            }
            .sidebar-layout .sidebar-photos {
                position: sticky;
                top: 0;
                height: 100vh;
                overflow-y: auto;
            }
            .sidebar-layout .sidebar-photo {
                width: 100%;
                height: 50vh;
                object-fit: cover;
            }
            .sidebar-layout .main-content {
                padding: 3rem;
            }

            /* ============================================
               LEGACY HERO SECTION (backward compat)
               ============================================ */
            
            .hero-section {
                position: relative;
                min-height: 60vh;
                background-size: cover;
                background-position: center;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                color: white;
            }
            .hero-section::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4));
            }
            .hero-content {
                position: relative;
                z-index: 1;
                max-width: 800px;
                padding: 2rem;
            }
            .hero-headline {
                font-size: 3rem;
                font-weight: bold;
                margin-bottom: 1rem;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }
            
            /* Property Info Cards */
            .property-info-card {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: var(--border-radius);
                padding: var(--spacing);
                border: 1px solid rgba(255, 255, 255, 0.2);
                text-align: center;
            }
            .property-info-value {
                font-size: 2rem;
                font-weight: bold;
                color: var(--primary-color);
            }
            .property-info-label {
                font-size: 0.875rem;
                color: var(--text-color);
                margin-top: 0.5rem;
            }
            
            /* Amenities Grid */
            .amenities-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }
            .amenity-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: var(--border-radius);
            }
            .amenity-icon {
                font-size: 1.5rem;
            }
            
            /* Contact Section */
            .contact-section {
                background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
                color: white;
                padding: 3rem 2rem;
                border-radius: var(--border-radius);
                text-align: center;
            }
            .contact-form {
                max-width: 500px;
                margin: 2rem auto 0;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            .contact-form input,
            .contact-form textarea {
                padding: 0.75rem 1rem;
                border-radius: var(--button-radius);
                border: none;
                font-family: var(--font-family);
                font-size: 1rem;
            }
            .contact-form button {
                background: white;
                color: var(--primary-color);
                padding: 0.75rem 2rem;
                border: none;
                border-radius: var(--button-radius);
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s;
            }
            .contact-form button:hover {
                transform: translateY(-2px);
            }
            
            /* Description Section */
            .description-section {
                max-width: 800px;
                margin: 0 auto;
                line-height: 1.8;
            }
            .description-text {
                font-size: 1.125rem;
                color: var(--text-color);
            }
            
            /* Gallery Grid */
            .photo-gallery {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
                margin: 2rem 0;
            }
            .gallery-item {
                border-radius: var(--border-radius);
                overflow: hidden;
                aspect-ratio: 4/3;
            }
            .gallery-item img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s;
            }
            .gallery-item:hover img {
                transform: scale(1.05);
            }
        `;
    }

    private generateBodyContent(data: PreviewData): string {
        const { layout, content, propertyDetails } = data;
        const templateSections = layout.templateSections || [];
        
        // Sort sections by order
        const sortedSections = [...templateSections].sort((a, b) => a.order - b.order);
        
        // Extract photos from content (can be at root or nested in photo-gallery)
        let photos = data.photos || [];
        
        // NEW: Check for user-selected photos from photo picker
        const selectedPhotosJson = content['photo-gallery']?.['selectedPhotos'] || content['selectedPhotos'];
        if (selectedPhotosJson) {
            try {
                const selectedUrls = typeof selectedPhotosJson === 'string' ? JSON.parse(selectedPhotosJson) : selectedPhotosJson;
                if (Array.isArray(selectedUrls) && selectedUrls.length > 0) {
                    // Filter the available photos to only include selected ones
                    const allPhotos = photos.length > 0 ? photos : (
                        content['photo-gallery']?.['photos'] || content['photos'] || []
                    );
                    photos = allPhotos.filter((p: any) => selectedUrls.includes(p.url || p));
                    // If selected photos exist, use them; otherwise fall back to all
                    if (photos.length === 0 && selectedUrls.length > 0) {
                        photos = selectedUrls.map((url: string) => ({ url, category: 'Selected' }));
                    }
                }
            } catch { /* ignore parse errors */ }
        }
        
        if (!photos || photos.length === 0) {
            // Try to extract from content
            const photoGallery = content['photo-gallery'];
            if (photoGallery && typeof photoGallery === 'object') {
                photos = photoGallery['photos'] || [];
            } else if (Array.isArray(content['photos'])) {
                photos = content['photos'];
            }
        }
        
        // If still no photos, use placeholder
        if (!photos || photos.length === 0) {
            photos = [
                { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop', category: 'Exterior' },
                { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', category: 'Living Room' },
                { url: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=600&fit=crop', category: 'Bedroom' },
                { url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&h=600&fit=crop', category: 'Kitchen' }
            ];
        }
        
        let html = '<div class="preview-wrapper">';
        
        // Extract content values
        const title = this.extractContent(content, 'title', 'title') || 'Beautiful Property';
        const description = this.extractContent(content, 'description', 'description') || 'Welcome to our wonderful property!';
        const propertyType = this.extractNestedContent(content, 'propertyDetails', 'property_type') || 'Entire Home';
        const bedrooms = this.extractNestedContent(content, 'propertyDetails', 'bedrooms') || '2';
        const bathrooms = this.extractNestedContent(content, 'propertyDetails', 'bathrooms') || '1';
        const maxGuests = this.extractNestedContent(content, 'propertyDetails', 'max_guests') || '4';
        const amenitiesList = this.extractNestedContent(content, 'amenities', 'amenities') || [];
        const amenities = Array.isArray(amenitiesList) ? amenitiesList : ['WiFi', 'Kitchen', 'Parking', 'Air Conditioning'];
        
        // Get hero image
        const heroPhoto = photos && photos.length > 0 ? photos[0].url : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200';
        
// Render each section based on template and layout type
        const layoutType = layout.config.layoutType || 'classic';
        
        for (const section of sortedSections) {
            if (!section.visible) continue;
            
            // Skip duplicate hero sections in certain layouts
            if (section.type === 'hero' && layoutType !== 'classic' && layoutType !== 'fullscreen') {
                continue;
            }
            
            switch (section.type) {
                case 'hero':
                    html += this.generateHeroSectionByLayout(layoutType, heroPhoto, title, propertyDetails, photos);
                    break;
                case 'headline':
                    html += this.generateHeadlineSectionByLayout(layoutType, title, section.style);
                    break;
                case 'property-info':
                    html += this.generatePropertyInfoSection(bedrooms, bathrooms, maxGuests, propertyType, section.style);
                    break;
                case 'description':
                    html += this.generateDescriptionSection(description, section.style);
                    break;
                case 'amenities':
                    html += this.generateAmenitiesSection(amenities, section.style);
                    break;
                case 'contact':
                    html += this.generateContactSection(section.style);
                    break;
                case 'gallery':
                    html += this.generateGallerySectionByLayout(layoutType, photos, section.style);
                    break;
            }
        }
        
        html += '</div>';
        return html;
    }
    
    private generateHeroSectionByLayout(layoutType: string, photoUrl: string, title: string, propertyDetails?: any, photos?: any[]): string {
        console.log('[Preview] generateHeroSectionByLayout called:', layoutType, ' photos:', photos?.length);
        
        const subtitle = `${propertyDetails?.property_type || 'Entire Home'} · ${propertyDetails?.bedrooms || '2'} Beds · ${propertyDetails?.bathrooms || '1'} Bath`;
        
        // Ensure we always have photos for display
        const displayPhotos = photos && photos.length > 0 ? photos : [
            { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop', category: 'Exterior' },
            { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', category: 'Living Room' },
            { url: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=600&fit=crop', category: 'Bedroom' },
            { url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&h=600&fit=crop', category: 'Kitchen' },
            { url: 'https://images.unsplash.com/photo-1552322474-44f8a209d6c7?w=800&h=600&fit=crop', category: 'Bathroom' }
        ];
        
        switch (layoutType) {
            case 'fullscreen':
                const fsPhoto = photoUrl || displayPhotos[0].url;
                return `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width,initial-scale=1">
                        <title>Preview</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { font-family: system-ui, sans-serif; }
                            .hero { position: relative; width: 100%; height: 100vh; min-height: 500px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
                            .hero-img { position: absolute; width: 100%; height: 100%; object-fit: cover; }
                            .hero-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 100%); }
                            .hero-content { position: relative; z-index: 10; text-align: center; color: white; padding: 2rem; }
                            .hero-title { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 700; margin-bottom: 0.75rem; text-shadow: 0 2px 20px rgba(0,0,0,0.6); }
                            .hero-subtitle { font-size: 1.25rem; opacity: 0.9; text-shadow: 0 1px 10px rgba(0,0,0,0.6); }
                        </style>
                    </head>
                    <body>
                        <section class="hero">
                            <img src="${fsPhoto}" class="hero-img" alt="Hero" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" crossorigin="anonymous">
                            <div style="display:none;width:100%;height:100%;background:linear-gradient(135deg,#667eea,#764ba2);align-items:center;justify-content:center;color:white;font-size:2rem;">⚠️ Image failed</div>
                            <div class="hero-overlay"></div>
                            <div class="hero-content">
                                <h1 class="hero-title">${title}</h1>
                                <p class="hero-subtitle">${subtitle}</p>
                            </div>
                        </section>
                    </body>
                    </html>
                `;
            
            case 'split':
                const splitPhoto = photoUrl || displayPhotos[0].url;
                const contentHtml = `
                    <div class="split-content">
                        <h2 class="split-headline">${title}</h2>
                        <div class="split-details">
                            <div class="split-detail">
                                <div class="split-detail-value">${propertyDetails?.bedrooms || '2'}</div>
                                <div class="split-detail-label">Bedrooms</div>
                            </div>
                            <div class="split-detail">
                                <div class="split-detail-value">${propertyDetails?.bathrooms || '1'}</div>
                                <div class="split-detail-label">Bathrooms</div>
                            </div>
                            <div class="split-detail">
                                <div class="split-detail-value">${propertyDetails?.max_guests || '4'}</div>
                                <div class="split-detail-label">Guests</div>
                            </div>
                        </div>
                    </div>
                `;
                return `
                    <div class="hero-split">
                        <div class="split-image" style="background-image: url('${splitPhoto}');">
                            <img src="${splitPhoto}" alt="Property" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
                        </div>
                        ${contentHtml}
                    </div>
                `;
            
            case 'grid':
                return this.generateGalleryGrid(displayPhotos, title, subtitle);
            
            case 'carousel':
                return this.generateCarousel(displayPhotos, title, subtitle);
            
            case 'masonry':
                return this.generateMasonry(displayPhotos);
            
            case 'sidebar':
                return this.generateSidebarLayout(displayPhotos, title);
            
            default:
                // Classic layout - ensure we have a fallback photo
                const fallbackPhoto = photoUrl || displayPhotos[0].url;
                return `
                    <section class="hero-section" style="background-image: url('${fallbackPhoto}');">
                        <div class="hero-content">
                            <h1 class="hero-headline">${title}</h1>
                            <p style="font-size: 1.25rem; margin-top: 1rem; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${subtitle}</p>
                        </div>
                    </section>
                `;
        }
    }
    
    private generateGalleryGrid(photos: any[], title: string, subtitle: string): string {
        // Ensure we have photos
        const displayPhotos = photos && photos.length > 0 ? photos : [
            { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop', category: 'Exterior' },
            { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', category: 'Living Room' },
            { url: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=600&fit=crop', category: 'Bedroom' },
            { url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&h=600&fit=crop', category: 'Kitchen' }
        ];
        
        const photosToShow = displayPhotos.slice(0, 4);
        let galleryItems = '';
        
        for (let i = 0; i < displayPhotos.length; i++) {
            const photo = displayPhotos[i];
            const caption = photo?.category || `Photo ${i + 1}`;
            galleryItems += `
                <div class="gallery-item">
                    <img src="${photo.url}" alt="${caption}" loading="lazy">
                    <div class="gallery-caption">${caption}</div>
                </div>
            `;
        }
        
        return `
            <section class="gallery-grid">
                ${galleryItems}
            </section>
            <section class="section">
                <div class="container">
                    <h2 style="font-size: 2.5rem; text-align: center; margin-bottom: 1rem;">${title}</h2>
                    <p style="text-align: center; opacity: 0.8;">${subtitle}</p>
                </div>
            </section>
        `;
    }
    
    private generateCarousel(photos: any[], title: string, subtitle: string): string {
        // Ensure we have photos
        const displayPhotos = photos && photos.length > 0 ? photos : [
            { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop', category: 'Exterior' },
            { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop', category: 'Living Room' },
            { url: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&h=800&fit=crop', category: 'Bedroom' }
        ];
        
        const photosToShow = displayPhotos.slice(0, 5);
        let slides = '';
        let dots = '';
        
        for (let i = 0; i < photosToShow.length; i++) {
            const photo = photosToShow[i];
            slides += `
                <div class="carousel-slide ${i === 0 ? 'active' : ''}" style="background-image: url('${photo.url}');">
                    <img src="${photo.url}" alt="Carousel ${i+1}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:-1;">
                    <div class="carousel-content">
                        <h2 style="font-size: clamp(2rem, 5vw, 4rem); font-weight: 700; margin-bottom: 1rem;">${title}</h2>
                        <p style="font-size: 1.25rem;">${subtitle}</p>
                    </div>
                </div>
            `;
            dots += `<div class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`;
        }
        
        return `
            <section class="hero-carousel">
                ${slides}
                <div class="carousel-nav">${dots}</div>
            </section>
        `;
    }
    
    private generateMasonry(photos: any[]): string {
        // Ensure we have photos
        const displayPhotos = photos && photos.length > 0 ? photos : [
            { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop', category: 'Exterior' },
            { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', category: 'Living Room' },
            { url: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=600&fit=crop', category: 'Bedroom' },
            { url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&h=600&fit=crop', category: 'Kitchen' },
            { url: 'https://images.unsplash.com/photo-1552322474-44f8a209d6c7?w=800&h=600&fit=crop', category: 'Bathroom' }
        ];
        
        let masonryItems = '';
        
        for (const photo of displayPhotos) {
            const caption = photo?.category || 'Photo';
            masonryItems += `
                <div class="masonry-item">
                    <img src="${photo.url}" alt="${caption}" loading="lazy">
                    <div class="masonry-overlay">
                        <span class="masonry-label">${caption}</span>
                    </div>
                </div>
            `;
        }
        
        return `
            <section class="photo-masonry">
                ${masonryItems}
            </section>
        `;
    }
    
    private generateSidebarLayout(photos: any[], title: string): string {
        // Ensure we have photos
        const displayPhotos = photos && photos.length > 0 ? photos : [
            { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop', category: 'Exterior' },
            { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', category: 'Living Room' },
            { url: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=600&fit=crop', category: 'Bedroom' }
        ];
        
        let sidebarPhotos = '';
        
        for (const photo of displayPhotos.slice(0, 3)) {
            sidebarPhotos += `<img class="sidebar-photo" src="${photo.url}" alt="Property photo" loading="lazy">`;
        }
        
        return `
            <div class="sidebar-layout">
                <div class="sidebar-photos">
                    ${sidebarPhotos}
                </div>
                <div class="main-content">
                    <h2 style="font-size: 2.5rem; margin-bottom: 2rem;">${title}</h2>
                </div>
            </div>
        `;
    }
    
    private generateHeadlineSectionByLayout(layoutType: string, title: string, style?: string): string {
        if (layoutType === 'fullscreen' || layoutType === 'grid' || layoutType === 'carousel' || layoutType === 'masonry') {
            // These layouts have headlines integrated into hero, skip separate headline
            return '';
        }
        
        const styles: Record<string, string> = {
            'centered': 'text-align: center; font-size: 2.5rem;',
            'split-right': 'font-size: 2.5rem; text-align: left;',
            'typography-hero': 'font-size: 4rem; font-weight: 300; letter-spacing: -2px;'
        };
        
        return `
            <section class="section">
                <div class="container">
                    <h2 style="${styles[style || 'centered'] || 'font-size: 2.5rem;'}">${title}</h2>
                </div>
            </section>
        `;
    }
    
    private generateGallerySectionByLayout(layoutType: string, photos: any[], style?: string): string {
        switch (layoutType) {
            case 'grid':
                return this.generateGalleryGrid(photos, 'Property Gallery', '');
            case 'masonry':
                return this.generateMasonry(photos);
            case 'carousel':
                return this.generateCarousel(photos, 'Our Property', '');
            default:
                return this.generateGallerySection(photos, style);
        }
    }
    
    private generateHeroSection(photoUrl: string, title: string, propertyDetails?: any): string {
        return `
            <section class="hero-section" style="background-image: url('${photoUrl}');">
                <div class="hero-content">
                    <h1 class="hero-headline">${title}</h1>
                    <p style="font-size: 1.25rem; margin-top: 1rem; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
                        ${propertyDetails?.property_type || 'Entire Home'} · ${propertyDetails?.bedrooms || '2'} Beds · ${propertyDetails?.bathrooms || '1'} Bath
                    </p>
                </div>
            </section>
        `;
    }

    private generateHeadlineSection(title: string, style?: string): string {
        const styles: Record<string, string> = {
            'centered': 'text-align: center; font-size: 2.5rem;',
            'bold-large': 'font-size: 3.5rem; font-weight: 900;',
            'gold-accent': 'font-size: 2.5rem; border-bottom: 3px solid #D4AF37; display: inline-block;',
            'welcome-text': 'font-size: 2rem; font-style: italic;',
            'overlay': 'font-size: 3rem; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);',
            'compact-header': 'font-size: 1.75rem; font-weight: 600;',
            'split-right': 'font-size: 2.5rem; text-align: left;',
            'hero-overlay': 'font-size: 3.5rem; color: white; margin-top: 2rem;',
            'typography-hero': 'font-size: 4rem; font-weight: 300; letter-spacing: -2px;'
        };
        
        return `
            <section class="section">
                <div class="container">
                    <h2 style="${styles[style || 'centered'] || 'font-size: 2.5rem;'}">${title}</h2>
                </div>
            </section>
        `;
    }

    private generatePropertyInfoSection(bedrooms: string, bathrooms: string, maxGuests: string, propertyType: string, style?: string): string {
        return `
            <section class="section">
                <div class="container">
                    <div class="grid grid-4">
                        <div class="property-info-card">
                            <div class="property-info-value">🏠</div>
                            <div class="property-info-label">${propertyType}</div>
                        </div>
                        <div class="property-info-card">
                            <div class="property-info-value">${bedrooms}</div>
                            <div class="property-info-label">Bedrooms</div>
                        </div>
                        <div class="property-info-card">
                            <div class="property-info-value">${bathrooms}</div>
                            <div class="property-info-label">Bathrooms</div>
                        </div>
                        <div class="property-info-card">
                            <div class="property-info-value">${maxGuests}</div>
                            <div class="property-info-label">Guests</div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    private generateDescriptionSection(description: string, style?: string): string {
        return `
            <section class="section">
                <div class="container">
                    <div class="description-section">
                        <h2 style="margin-bottom: 1.5rem;">About This Property</h2>
                        <div class="description-text">
                            ${description}
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    private generateAmenitiesSection(amenities: any[], style?: string): string {
        const amenityIcons: Record<string, string> = {
            'WiFi': '📶', 'Kitchen': '🍳', 'Parking': '🅿️', 'Air Conditioning': '❄️',
            'Heating': '🔥', 'TV': '📺', 'Washer': '🧺', 'Dryer': '👕',
            'Pool': '🏊', 'Hot Tub': '🛁', 'Gym': '💪', 'Elevator': '🛗'
        };
        
        const amenityItems = amenities.slice(0, 8).map((amenity, index) => {
            const name = typeof amenity === 'string' ? amenity : amenity.name || `Amenity ${index + 1}`;
            const icon = amenityIcons[name] || '✨';
            return `
                <div class="amenity-item">
                    <span class="amenity-icon">${icon}</span>
                    <span>${name}</span>
                </div>
            `;
        }).join('');
        
        return `
            <section class="section">
                <div class="container">
                    <h2 style="margin-bottom: 1.5rem; text-align: center;">Amenities</h2>
                    <div class="amenities-grid">
                        ${amenityItems}
                    </div>
                </div>
            </section>
        `;
    }

    private generateContactSection(style?: string): string {
        return `
            <section class="section">
                <div class="container">
                    <div class="contact-section">
                        <h2 style="color: white; margin-bottom: 1rem;">Contact Property Owner</h2>
                        <p style="color: rgba(255,255,255,0.9);">Have questions? We'd love to hear from you!</p>
                        <form class="contact-form" onsubmit="event.preventDefault();">
                            <input type="text" placeholder="Your Name" required>
                            <input type="email" placeholder="Your Email" required>
                            <textarea rows="4" placeholder="Your Message" required></textarea>
                            <button type="submit">Send Message</button>
                        </form>
                    </div>
                </div>
            </section>
        `;
    }

    private generateGallerySection(photos: Array<{url: string; category: string}>, style?: string): string {
        // Ensure we have photos
        const displayPhotos = photos && photos.length > 0 ? photos : [
            { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop', category: 'Exterior' },
            { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', category: 'Living Room' },
            { url: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=600&fit=crop', category: 'Bedroom' },
            { url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&h=600&fit=crop', category: 'Kitchen' },
            { url: 'https://images.unsplash.com/photo-1552322474-44f8a209d6c7?w=800&h=600&fit=crop', category: 'Bathroom' },
            { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop', category: 'Pool' }
        ];
        
        const galleryItems = displayPhotos.slice(0, 6).map(photo => `
            <div class="gallery-item">
                <img src="${photo.url}" alt="${photo.category || 'Property photo'}" loading="lazy">
            </div>
        `).join('');
        
        return `
            <section class="section">
                <div class="container">
                    <h2 style="margin-bottom: 1.5rem; text-align: center;">Photo Gallery</h2>
                    <div class="photo-gallery">
                        ${galleryItems}
                    </div>
                </div>
            </section>
        `;
    }

    private extractContent(content: Record<string, any>, sectionKey: string, fieldKey: string): string {
        const section = content[sectionKey];
        if (!section) return '';
        if (typeof section === 'object') {
            return section[fieldKey] || '';
        }
        return section || '';
    }

    private extractNestedContent(content: Record<string, any>, sectionKey: string, fieldKey: string): any {
        const section = content[sectionKey];
        if (!section) return null;
        if (typeof section === 'object') {
            return section[fieldKey] || null;
        }
        return section || null;
    }

    private getFontSize(size: 'sm' | 'md' | 'lg' | 'xl'): string {
        const sizes = { sm: '14px', md: '16px', lg: '18px', xl: '20px' };
        return sizes[size];
    }

    private getButtonRadius(style: 'rounded' | 'sharp' | 'pill'): string {
        const radii = { rounded: '0.375rem', sharp: '0', pill: '9999px' };
        return radii[style];
    }

    private getSpacingValue(spacing: 'compact' | 'normal' | 'spacious'): string {
        const values = { compact: '1rem', normal: '1.5rem', spacious: '2rem' };
        return values[spacing];
    }

    private getBorderRadiusValue(radius: 'none' | 'sm' | 'md' | 'lg' | 'full'): string {
        const values = { none: '0', sm: '0.25rem', md: '0.5rem', lg: '1rem', full: '9999px' };
        return values[radius];
    }
}
