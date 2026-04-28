
import { Injectable, inject, signal } from '@angular/core';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ContextData, ReportData, Scores } from '../types';
import { SupabaseService } from './supabase.service';
import { TranslationService } from './translation.service';
import { AIService, AIProviderType } from './ai/ai.service';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private supabaseService = inject(SupabaseService);
  private translationService = inject(TranslationService);
  private aiService = inject(AIService);
  
  private useNewProvider = signal(false);
  private isNewInitialized = signal(false);

constructor() {
    // Initialisation paresseuse (lazy load) lors de la première requête
  }

  async enableNewProvider(provider: AIProviderType = 'gemini', apiKey?: string): Promise<void> {
    if (this.isNewInitialized()) return;
    try {
      const key = apiKey || await this.supabaseService.supabase.rpc('get_decrypted_active_key').then(r => r.data);
      await this.aiService.initialize(provider, key);
      this.useNewProvider.set(true);
      this.isNewInitialized.set(true);
    } catch (e) {
      console.error('[GeminiService] Failed to enable new provider:', e);
    }
  }

  private async ensureClient(): Promise<void> {
    if (this.genAI) return;

    try {
      // Appel RPC pour récupérer la clé déchiffrée
      const { data, error } = await this.supabaseService.supabase.rpc('get_decrypted_active_key');

      if (error || !data) {
        console.error("Erreur lors de la récupération de la clé API:", error);
        throw new Error("Impossible de récupérer la clé API active depuis le serveur.");
      }

      this.genAI = new GoogleGenerativeAI(data);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    } catch (e) {
      console.error("Failed to initialize Gemini Client", e);
      throw new Error("Service IA non configuré. Veuillez contacter l'administrateur.");
    }
  }

  /**
   * Robust JSON cleaner that finds the first '{' and last '}' to extract valid JSON,
   * ignoring any markdown or explanatory text surrounding it.
   */
  private cleanJson(text: string): string {
    if (!text) return '{}';

    // 1. Remove Markdown code blocks (```json ... ```)
    let clean = text.replace(/```json/g, '').replace(/```/g, '');

    // 2. Find the FIRST '{' or '[' and the LAST '}' or ']'
    const firstBrace = clean.search(/[{[]/);
    const lastBrace = Math.max(clean.lastIndexOf('}'), clean.lastIndexOf(']'));

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return clean.substring(firstBrace, lastBrace + 1);
    }

    return clean.trim();
  }


  async generateReport(context: ContextData, scores: Scores): Promise<any> {
    await this.ensureClient();
    const lang = this.translationService.currentLang();

    const prompt = `
      Act as an expert Airbnb consultant. Analyze the following property context and evaluation scores to generate a detailed diagnostic report.

      PROPERTY CONTEXT:
      ${JSON.stringify(context, null, 2)}

      EVALUATION SCORES:
      ${JSON.stringify(scores, null, 2)}

      TASK:
      Generate a comprehensive diagnostic report strictly in language "${lang}".
      
      REQUIRED JSON OUTPUT FORMAT:
      {
        "summary": "Executive summary of the property potential...",
        "strengths": ["List of key strengths..."],
        "weaknesses": ["List of areas for improvement..."],
        "recommendations": ["Specific actionable advice..."],
        "marketingAdvice": "Advice on pricing and positioning...",
        "recommendedPlan": "TIER_1" | "TIER_2" | "TIER_3" (Choose one based on potential: TIER_3 for high luxury/revenue, TIER_2 for solid properties, TIER_1 for starters),
        "estimatedRevenue": "Estimated monthly revenue range..."
      }
    `;

    try {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      const response = await result.response;
      return JSON.parse(this.cleanJson(response.text()));
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  async getConciergeResponse(propertyName: string, context: string, question: string): Promise<string> {
    try {
      await this.ensureClient();
      const lang = this.translationService.currentLang();

      // Strict prompt engineering to restrict knowledge to the provided context
      const prompt = `
          Tu es le concierge virtuel IA dédié à la propriété nommée "${propertyName}".
          
          Voici la **SEULE et UNIQUE** source de vérité concernant cette propriété. Tu ne dois utiliser **aucune** connaissance externe sur le monde pour répondre aux questions spécifiques sur le logement :
          
          --- DÉBUT DES INFORMATIONS DE LA PROPRIÉTÉ ---
          ${context}
          --- FIN DES INFORMATIONS ---

          RÈGLES STRICTES DE RÉPONSE :
          1. Réponds à la question de l'invité en utilisant **uniquement** les informations ci-dessus.
          2. Si la réponse ne se trouve pas explicitement dans les informations fournies, tu dois répondre : "Je suis désolé, je n'ai pas cette information spécifique concernant le logement. Veuillez contacter l'hôte directement."
          3. Ne pas inventer d'informations (codes wifi, emplacement des clés, etc.) si elles ne sont pas dans le texte.
          4. Sois courtois, bref et serviable, comme un concierge de luxe.
          5. Réponds toujours en langue : "${lang}".

          Question de l'invité : "${question}"
        `;

      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      return "Désolé, je ne peux pas répondre pour le moment (Service IA indisponible).";
    }
  }

  async autoFillBooklet(address: string, emptyDataStructure: any): Promise<any> {
    await this.ensureClient();
    const lang = this.translationService.currentLang();

    const prompt = `
        You are a helpful assistant for an Airbnb host located at: "${address}".
        
        Your task is to fill the provided JSON structure.
        **IMPORTANT:** The input JSON contains specific INSTRUCTIONS in the values (e.g. "LIST: 3 restaurants...").
        You MUST replace these instructions with the actual content found via your knowledge base.

        **SECTION 1: PUBLIC LOCAL DATA (Restaurants, Activities, Transport, Shops, Tourism)**
        - **MANDATORY:** When you see an instruction asking for a list (e.g. 'recommandationRestaurants', 'guideActivites'), you MUST provide real, accurate, and specific recommendations.
        - **FORMAT:** Provide a **list of 3-5 top-rated specific places** with names and addresses.
        - **NEVER** use "N/A" for these fields unless the location is in the middle of a desert.

        **SECTION 2: PRIVATE PROPERTY DATA (Wifi codes, Door codes, Specific device instructions)**
        - If a field is empty or asks for private info you cannot know (Wifi password, digicode), return EXACTLY: "N/A (dépend de la propriété)".
        - **DO NOT INVENT** specific codes or keys.

        **RESPONSE FORMAT:**
        1. Respond in Language: "${lang}".
        2. Return ONLY the JSON object.
        3. **PRESERVE THE EXACT JSON KEYS** provided below.
        
        Structure to fill:
        ${JSON.stringify(emptyDataStructure)}
      `;

    try {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      const response = await result.response;
      return JSON.parse(this.cleanJson(response.text()));
    } catch (error) {
      console.error('Error auto-filling booklet:', error);
      throw error;
    }
  }

  async findEquipmentManuals(equipmentList: string[]): Promise<Record<string, string>> {
    await this.ensureClient();

    const prompt = `
        For each appliance description below, find the official user manual PDF URL.
        Input: ${JSON.stringify(equipmentList)}
        Return a JSON object: { "Original Description": "URL" or null }.
      `;

    try {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      const response = await result.response;
      return JSON.parse(this.cleanJson(response.text()));
    } catch (error) {
      console.error('Error finding manuals:', error);
      return {};
    }
  }

  async generateMarketingDescription(propertyContext: string): Promise<string> {
    await this.ensureClient();
    const lang = this.translationService.currentLang();

    const prompt = `
        Tu es un copywriter expert en immobilier de luxe et location saisonnière.
        Ton but est de rédiger une description de listing "irrésistible" pour attirer des locataires potentiels.
        
        Utilise les informations brutes suivantes sur la propriété :
        "${propertyContext}"

        INSTRUCTIONS :
        1. Rédige un texte d'environ 150-200 mots.
        2. Utilise un ton chaleureux, invitant et professionnel.
        3. Mets en avant les points forts (équipements, localisation, ambiance).
        4. Utilise des émojis avec parcimonie pour structurer le texte.
        5. Structure le texte avec une accroche, un corps de texte et un appel à l'action subtil.
        6. Ne mets PAS de titre "Description :", commence directement le texte.
        7. Réponds en Langue : "${lang}".
      `;

    try {
      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating description:', error);
      return "Erreur lors de la génération de la description.";
    }
  }

  async generateMicrositeDesign(propertyData: any): Promise<any> {
    await this.ensureClient();

    const prompt = `
        You are a world-class Web Designer specialized in Hospitality.
        Based on the property data below, determine the best design strategy for a promotional microsite.

        Property Data:
        ${JSON.stringify(propertyData).substring(0, 5000)} // Limit context size

        TASKS:
        1. Select the best **Theme** ('modern', 'cozy', or 'luxury') based on the property style.
        2. Pick a **Primary Color** (Hex code) that matches the vibe.
        3. Write a short, catchy **Headline** (max 6 words).
        4. Select which **Sections** should be visible on a PUBLIC promotional site.
           - Available sections: 'gallery', 'amenities', 'reviews', 'rules', 'guide'.
           - RULE: Only include sections if there is data for them.
           - RULE: 'gallery' and 'amenities' are highly recommended.

        RESPONSE FORMAT (JSON ONLY):
        {
          "template": "modern" | "cozy" | "luxury",
          "primaryColor": "#hex",
          "headline": "String",
          "visibleSections": ["gallery", "amenities", ...]
        }
      `;

    try {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      const response = await result.response;
      return JSON.parse(this.cleanJson(response.text()));
    } catch (error) {
      console.error('Error generating design:', error);
      throw error;
    }
  }

  async generateOptimizedListing(context: string, photos: { url: string; id: string }[], maxPhotos: number): Promise<{ description: string; selectedPhotoIds: string[] }> {
    await this.ensureClient();

    // 1. Prepare Images
    const photosToAnalyze = photos.slice(0, 30);
    const parts: any[] = [];

    // Helper to fetch and convert to base64
    const urlToBase64 = async (url: string): Promise<string | null> => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            // Remove data:image/jpeg;base64, prefix
            resolve(base64data.split(',')[1]);
          };
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.error("Failed to load image for AI:", url, e);
        return null; // Skip failed images
      }
    };

    // Load images in parallel
    console.log("Downloading images for AI analysis...");
    const base64Images = await Promise.all(photosToAnalyze.map(p => urlToBase64(p.url)));

    // Construct parts
    parts.push({
      text: `
        You are an expert Vacation Rental Copywriter and Photographer.
        
        TASK 1: Write an "Irresistible" Listing Description.
        - Use the "Selling the Experience" methodology.
        - Tone: Warm, professional, inviting.
        - Language: ${this.translationService.currentLang()}.

        TASK 2: Select the Best Photos.
        - Select EXACTLY (or up to) ${maxPhotos} photos that best sell the property.
        - The input photos correspond to these IDs in order: ${JSON.stringify(photosToAnalyze.map(p => p.id))}.

        CONTEXT PROPERTY DATA:
        ${context}

        RESPONSE FORMAT (JSON ONLY):
        {
          "description": "Your markdown formatted description...",
          "selectedPhotoIds": ["id1", "id3", ...]
        }
    `});

    base64Images.forEach((b64, index) => {
      if (b64) {
        parts.push({
          inlineData: {
            data: b64,
            mimeType: "image/jpeg"
          }
        });
      }
    });

    try {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: parts }]
      });
      const response = await result.response;

      const parsed = JSON.parse(this.cleanJson(response.text()));
      return {
        description: parsed.description,
        selectedPhotoIds: parsed.selectedPhotoIds || []
      };
    } catch (error) {
      console.error('Error generating optimized listing:', error);
      throw error;
    }
  }

  async generateVisibilityAudit(context: any, language: string): Promise<any> {
    if (!this.genAI) await this.ensureClient();

    try {
      const prompt = `You are an expert SEO and Digital Marketing Auditor for Vacation Rentals.
            Perform a simulated "Visibility Audit" for the following property.

            **CONTEXT:**
            - Language/Region: ${language.toUpperCase()}
            - Property Name: ${context.name}
            - Address: ${context.address}
            - Description: ${context.description}
            - Amenities: ${context.amenities.join(', ')}
            - USER PROVIDED URLs: 
                - Airbnb: ${context.urls?.airbnb || 'None'}
                - Booking: ${context.urls?.booking || 'None'}
                - Other: ${context.urls?.other || 'None'}

            **VALIDATION & AUDIT LOGIC:**
            1. **CHECK URLs FIRST:** 
               - If the user PROVIDED valid URLs for Airbnb or Booking, **assume the property is VISIBLE on those platforms** (Status: "Visible").
               - Analyze the URL quality (is it a clean direct link?).
            
            2. **CHECK CONTENT & ADDRESS (If no URLs provided):**
               - If NO URLs are provided AND the address is obviously fake ("123 Fake St", "Nowhere") -> **FAIL THE AUDIT (Score 0)**.
               - If NO URLs are provided AND description is empty -> **FAIL THE AUDIT (Score 0)**.

            **TASK (If Valid):**
            1. Analyze visibility based on the provided content and claimed platforms.
            2. Give a score (0-100). If valid URLs are provided, the score should generally be higher (>60) unless the description is terrible.
            3. Provide specific tips.

            **RESPONSE FORMAT (JSON ONLY):**
            {
                "score": 0-100 (integer),
                "summary": "Short 1-sentence summary.",
                "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
                "platforms": [
                    { "name": "Airbnb", "status": "Visible/Not Found", "observation": "..." },
                    { "name": "Booking", "status": "Visible/Not Found", "observation": "..." },
                    { "name": "Google Maps", "status": "Visible/Not Found", "observation": "..." }
                ],
                "tips": [
                    { "title": "Tip Title", "description": "Actionable advice." }
                ]
            }
            Do not include markdown code blocks. Just the JSON string.`;

      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      const response = await result.response;
      return JSON.parse(this.cleanJson(response.text()));
    } catch (error) {
      console.error('Gemini Audit Error:', error);
      // Fallback mock
      return {
        score: 72,
        summary: "Visibilité correcte mais des opportunités de mots-clés sont manquées.",
        keywords: ["Vue mer", "Centre ville", "Wifi Fibre", "Parking gratuit"],
        platforms: [
          { name: "Airbnb", status: "Good", observation: "Contenu bien structuré." },
          { name: "Booking.com", status: "Average", observation: "Manque de photos diversifiées." },
          { name: "Google Maps", status: "Low", observation: "Adresse exacte difficile à trouver." }
        ],
        tips: [
          { title: "Optimiser le Titre", description: "Ajoutez 'Vue Mer' au début de votre titre." },
          { title: "Compléter les équipements", description: "Assurez-vous que tous les équipements de cuisine sont cochés." }
        ]
      };
    }
  }

  async generateFaqList(propertyName: string, propertyContext: string, address: string): Promise<{ question: string, answer: string }[]> {
    console.log('[GeminiService] generateFaqList called for:', propertyName);
    console.warn('[GeminiService] GENERATING FAQ FOR ADDRESS:', address); // CORRECT PLACEMENT
    await this.ensureClient();

    const prompt = `
        You are an expert Host Assistant for a vacation rental.
        
        TASK:
        1. Identify 10-12 distinct, frequently asked questions (topics: Check-in, Parking, Wifi, Transport, Coffee, etc.) that a guest would likely ask about this specific property or location.
        2. Answer questions primarily using the PROPERTY CONTEXT.
        3. For questions about local amenities (Pharmacy, Supermarket, Parking, etc.), use your GENERAL KNOWLEDGE of the address to provide the **NAME and EXACT ADDRESS** of the closest options.
        4. If the answer is publicly unknown, write "Information non disponible".

        PROPERTY CONTEXT:
        ${propertyContext}
        
        ADDRESS: ${address}

        RESPONSE FORMAT (JSON ONLY):
        [
            { "question": "Question text...", "answer": "Answer text..." },
            ...
        ]
        
        Language: ${this.translationService.currentLang()}.
    `;

    try {
      console.log('[GeminiService] Sending prompt to AI...');
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      const response = await result.response;
      const text = response.text();
      console.log('[GeminiService] Raw AI response:', text);
      const parsed = JSON.parse(this.cleanJson(text));
      console.log('[GeminiService] Parsed FAQ:', parsed);
      return parsed;
    } catch (error: any) {
      console.error('[GeminiService] Error generating FAQ list:', error);
      // Smart Offline Fallback WITH DEBUG INFO
      return this.generateOfflineFaqs(propertyContext, address, error.message || error.toString());
    }
  }

  private generateOfflineFaqs(context: string, address: string, debugError?: string): { question: string, answer: string }[] {
    const faqs: { question: string, answer: string }[] = [];
    const encodedAddress = encodeURIComponent(address);

    // 1. Extract info from context using simple regex/includes
    const wifiMatch = context.match(/Wifi: (.+)/i);
    const wifiInfo = wifiMatch ? wifiMatch[1] : "Le code Wifi sera disponible dans votre livret d'accueil.";

    const checkinMatch = context.match(/check-in: (.+)/i);
    const checkinTime = checkinMatch ? checkinMatch[1] : "15h00";

    const checkoutMatch = context.match(/check-out: (.+)/i);
    const checkoutTime = checkoutMatch ? checkoutMatch[1] : "11h00";

    const parkingMatch = context.match(/Parking: (.+)/i);
    const parkingInfo = parkingMatch ? parkingMatch[1] : "Des places de stationnement publiques sont disponibles dans la rue.";

    // 2. Generate Deterministic FAQs
    faqs.push({
      question: "Quelle est l'heure de départ (Check-out) ?",
      answer: `Le départ doit s'effectuer impérativement avant ${checkoutTime} pour permettre le nettoyage.`
    });

    faqs.push({
      question: "Quelle est l'heure d'arrivée (Check-in) ?",
      answer: `Vous pouvez accéder au logement à partir de ${checkinTime}.`
    });

    faqs.push({
      question: "Quel est le code Wifi ?",
      answer: `Voici les informations de connexion : ${wifiInfo}`
    });

    faqs.push({
      question: "Où puis-je me garer ?",
      answer: parkingInfo + `\n\nVoir les parkings à proximité : https://www.google.com/maps/search/parking+near+${encodedAddress}`
    });

    faqs.push({
      question: "Fournissez-vous le linge de maison ?",
      answer: "Oui, les draps et les serviettes de toilette sont fournis (qualité hôtelière)."
    });

    faqs.push({
      question: "Y a-t-il une machine à café ?",
      answer: "Oui, une machine à café est à votre disposition dans la cuisine."
    });

    faqs.push({
      question: "Le ménage est-il inclus ?",
      answer: "Le ménage de fin de séjour est inclus, mais nous vous demandons de laisser la cuisine propre et de sortir les poubelles."
    });

    faqs.push({
      question: "Puis-je fumer dans le logement ?",
      answer: "Non, le logement est strictement non-fumeur. Merci de fumer à l'extérieur."
    });

    faqs.push({
      question: "Acceptez-vous les animaux ?",
      answer: "Pour des raisons d'allergies et d'hygiène, nos amis les animaux ne sont pas admis."
    });

    faqs.push({
      question: "Où se trouve la pharmacie la plus proche ?",
      answer: `Vous trouverez une pharmacie à quelques minutes à pied.\nVoir sur la carte : https://www.google.com/maps/search/pharmacie+near+${encodedAddress}`
    });

    faqs.push({
      question: "Que faire en cas d'urgence ?",
      answer: "En cas d'urgence vitale, composez le 112. Pour un problème lié au logement, contactez-nous via la messagerie."
    });

    if (debugError) {
      faqs.push({
        question: "⚠️ DEBUG: Why am I seeing this?",
        answer: `The AI generation failed, so we showed you these offline backup questions instead.\n\nERROR DETAIL: ${debugError}`
      });
    }

    return faqs;

  }

  async getMarketAnalysis(address: string, context?: any): Promise<{
    estimatedNightlyRate: number;
    estimatedOccupancy: number;
    conciergeCommission: number;
    cleaningFees: number;
    summary: string;
    suggestedPrice?: number;
    suggestedInterestRate?: number;
    suggestedVariableCosts?: any;
    monthlySeasonality?: number[];
    monthlyNightlyPrices?: number[];
  }> {
    await this.ensureClient();

    const contextPrompt = context ? `
        PROPERTY CHARACTERISTICS:
        - Property Type: ${context.propertyType || 'Apartment'}
        - Host Country: ${context.hostCountry}
        - Property Country: ${context.propertyCountry}
        - Rooms: ${context.rooms}
        - Total Size: ${context.totalSize} m²
        - Garden Size: ${context.gardenSize} m²
        - Has Swimming Pool: ${context.hasPool ? 'Yes' : 'No'}
        - Additional Details: ${context.additionalDetails}
    ` : '';

    const prompt = `
        You are an expert Real Estate Analyst specializing in global short-term rentals.
        Target Location: \"${address}\"
        ${contextPrompt}

        TASK: Estimate detailed market metrics for a property with these characteristics in this specific location.
        1. Average Nightly Rate (EUR).
        2. Average Occupancy Rate (%).
        3. Typical Concierge Commission (%).
        4. Average Cleaning Fee (EUR, per stay).
        5. Estimated Property Purchase Price (EUR) for this specific type and size of property there.
        6. Typical Local Mortgage Interest Rate (%).
        7. Monthly Variable Costs (EUR) (Wifi, Electricity, Water).
        8. Seasonality factors (12 values, occupancy % per month).
        9. Nightly prices by month (12 values, EUR).
        10. A short 1-sentence summary of the rental market potential.

        RESPONSE FORMAT (JSON ONLY):
        {
            "estimatedNightlyRate": 120,
            "estimatedOccupancy": 70,
            "conciergeCommission": 20,
            "cleaningFees": 60,
            "suggestedPrice": 250000,
            "suggestedInterestRate": 3.8,
            "suggestedVariableCosts": { "wifi": 30, "electricity": 80, "water": 30 },
            "monthlySeasonality": [40, 45, 60, 70, 80, 90, 100, 100, 80, 60, 50, 70],
            "monthlyNightlyPrices": [100, 100, 120, 140, 160, 180, 220, 250, 180, 140, 120, 160],
            "summary": "High demand area with strong seasonal peaks and premium potential due to features."
        }
    `;

    try {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      const response = await result.response;
      return JSON.parse(this.cleanJson(response.text()));
    } catch (error) {
      console.error('Error getting market analysis:', error);
      return {
        estimatedNightlyRate: 100,
        estimatedOccupancy: 65,
        conciergeCommission: 20,
        cleaningFees: 50,
        summary: "Analysis unavailable (Service Error)."
      };
    }
  }

  async generateText(prompt: string, retries = 3): Promise<string> {
    await this.ensureClient();
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await this.model!.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error: any) {
        const is503 = error?.message?.includes('503') || error?.status === 503;
        const isRateLimit = error?.message?.includes('429');
        
        if ((is503 || isRateLimit) && attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.warn(`[Gemini] ${is503 ? 'Server busy' : 'Rate limited'}, retrying in ${delay}ms (attempt ${attempt}/${retries})...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        console.error('Error generating text:', error);
        throw error;
      }
    }
    
    throw new Error('Gemini API unavailable after multiple attempts');
  }
  async auditRenovationQuote(roomType: string, area: number, amount: number, finishLevel: string): Promise<{
    isReasonable: boolean;
    marketAverage: number;
    score: number;
    observations: string;
    tips: string[];
  }> {
    await this.ensureClient();
    const lang = this.translationService.currentLang();

    const prompt = `
        You are a Construction Cost Auditor specialized in short-term rental renovations.
        
        AUDIT REQUEST:
        - Room Type: ${roomType}
        - Area: ${area} sqm
        - Quote Amount: ${amount} EUR
        - Target Finish: ${finishLevel}
        
        TASK:
        1. Compare this quote to European market averages (taking Finish Level into account).
        2. Determine if it is reasonable or overpriced.
        3. Provide a score (0-100) where 100 is excellent value.
        4. Give specific observations and 3 tips to reduce costs.

        RESPONSE FORMAT (JSON ONLY):
        {
          "isReasonable": boolean,
          "marketAverage": number (total budget estimate),
          "score": number,
          "observations": "Short summary in ${lang}",
          "tips": ["Tip 1 in ${lang}", "Tip 2", "Tip 3"]
        }
    `;

    try {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      const response = await result.response;
      return JSON.parse(this.cleanJson(response.text()));
    } catch (error) {
      console.error('Error auditing renovation quote:', error);
      return {
        isReasonable: true,
        marketAverage: area * 600,
        score: 70,
        observations: "Audit unavailable (Service Error). Mock average used.",
        tips: ["Compare with at least 3 vendors", "Review material list", "Negotiate labor costs"]
      };
    }
  }

  async analyzeCapexPlan(
    rooms: Array<{ type: string; area: number; finish_level: string; budget_estimate: number; actual_spend: number }>,
    quotes: Array<{ vendor_name: string; amount: number }>,
    propertyAddress?: string
  ): Promise<{
    overallScore: number;
    budgetVsQuotes: {
      totalBudget: number;
      totalQuotes: number;
      variance: number;
      variancePercent: number;
    };
    recommendations: string[];
    risks: string[];
    opportunities: string[];
    propertyInsights?: {
      location?: string;
      estimatedValue?: number;
      marketTrends?: string;
    };
  }> {
    await this.ensureClient();
    const lang = this.translationService.currentLang();

    const totalBudget = rooms.reduce((sum, r) => sum + r.budget_estimate, 0);
    const totalActualSpend = rooms.reduce((sum, r) => sum + r.actual_spend, 0);
    const totalQuotes = quotes.reduce((sum, q) => sum + q.amount, 0);

    const prompt = `
        You are a Senior Construction Cost Analyst and Real Estate Investment Advisor specializing in short-term rental properties.
        
        COMPREHENSIVE CAPEX ANALYSIS REQUEST:
        
        PROPERTY LOCATION: ${propertyAddress || 'Not specified'}
        
        RENOVATION PLAN:
        ${JSON.stringify(rooms, null, 2)}
        
        VENDOR QUOTES RECEIVED:
        ${JSON.stringify(quotes, null, 2)}
        
        BUDGET SUMMARY:
        - Total Planned Budget: ${totalBudget} EUR
        - Total Actual Spend (so far): ${totalActualSpend} EUR
        - Total Quote Amount: ${totalQuotes} EUR
        - Budget vs Quotes Variance: ${totalQuotes - totalBudget} EUR (${((totalQuotes - totalBudget) / totalBudget * 100).toFixed(1)}%)
        
        TASK:
        Perform a comprehensive analysis of this renovation plan considering:
        1. Overall value assessment (score 0-100, where 100 is excellent value)
        2. Budget vs quotes comparison and variance analysis
        3. Specific recommendations to optimize costs and quality
        4. Risk factors (budget overruns, quality issues, timeline concerns)
        5. Opportunities for cost savings or value enhancement
        6. Property market insights based on location (if provided)
        
        ANALYSIS GUIDELINES:
        - Consider finish level appropriateness for short-term rental ROI
        - Evaluate if quotes are competitive for European market standards
        - Assess room prioritization and budget allocation
        - Identify potential cost optimization strategies
        - Consider property value impact and rental income potential
        
        RESPONSE FORMAT (JSON ONLY):
        {
          "overallScore": number (0-100),
          "budgetVsQuotes": {
            "totalBudget": ${totalBudget},
            "totalQuotes": ${totalQuotes},
            "variance": ${totalQuotes - totalBudget},
            "variancePercent": ${((totalQuotes - totalBudget) / totalBudget * 100).toFixed(1)}
          },
          "recommendations": [
            "Specific actionable recommendation 1 in ${lang}",
            "Specific actionable recommendation 2 in ${lang}",
            "Specific actionable recommendation 3 in ${lang}"
          ],
          "risks": [
            "Risk factor 1 in ${lang}",
            "Risk factor 2 in ${lang}",
            "Risk factor 3 in ${lang}"
          ],
          "opportunities": [
            "Opportunity 1 in ${lang}",
            "Opportunity 2 in ${lang}",
            "Opportunity 3 in ${lang}"
          ],
          "propertyInsights": {
            "location": "Brief location assessment in ${lang}",
            "estimatedValue": number (estimated property value increase from renovation),
            "marketTrends": "Brief market trend analysis in ${lang}"
          }
        }
    `;

    try {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      const response = await result.response;
      const analysis = JSON.parse(this.cleanJson(response.text()));

      // Ensure budgetVsQuotes has correct calculated values
      analysis.budgetVsQuotes = {
        totalBudget,
        totalQuotes,
        variance: totalQuotes - totalBudget,
        variancePercent: parseFloat(((totalQuotes - totalBudget) / totalBudget * 100).toFixed(1))
      };

      return analysis;
    } catch (error) {
      console.error('Error analyzing Capex plan:', error);
      // Fallback analysis
      return {
        overallScore: 70,
        budgetVsQuotes: {
          totalBudget,
          totalQuotes,
          variance: totalQuotes - totalBudget,
          variancePercent: parseFloat(((totalQuotes - totalBudget) / totalBudget * 100).toFixed(1))
        },
        recommendations: [
          "Compare quotes from at least 3 different vendors for each room",
          "Consider phasing the renovation to spread costs over time",
          "Focus on high-impact rooms (kitchen, bathroom) for STR appeal"
        ],
        risks: [
          "Budget variance detected - quotes may exceed planned budget",
          "Ensure all quotes include materials and labor to avoid hidden costs",
          "Timeline delays could impact rental income projections"
        ],
        opportunities: [
          "Negotiate bulk discounts if using same vendor for multiple rooms",
          "Consider mid-range finishes for better ROI in STR market",
          "Energy-efficient upgrades may qualify for tax incentives"
        ],
        propertyInsights: propertyAddress ? {
          location: "Analysis unavailable (Service Error)",
          estimatedValue: Math.round(totalBudget * 1.5),
          marketTrends: "Unable to assess market trends at this time"
        } : undefined
      };
    }
  }


  async checkCompliance(address: string, city: string): Promise<{
    riskScore: number;
    riskLevel: string;
    riskStatus: string;
    description: string;
    recommendations: string[];
  }> {
    await this.ensureClient();
    const lang = this.translationService.currentLang();

    const prompt = `
        You are a Legal Compliance Expert specialized in Short-Term Rental (STR) regulations and municipal zoning.
        
        TASK: Analyze the compliance risk for a potential Airbnb at the following location.
        - Address: ${address}
        - City: ${city}

        INSTRUCTIONS:
        1. Research or use your knowledge about STR laws in this city (e.g., Paris, Barcelona, London, NYC, etc.).
        2. Determine the "Risk Score" (0-100), where 100 is "Banned/Forbidden" and 0 is "Fully Permitted".
        3. Define "Risk Level" (e.g., Critical Risk, High Risk, Moderate Risk, Safe Zone).
        4. Define "Risk Status" (e.g., Prohibited, Restricted, Registration Required, Permitted).
        5. Provide a detailed description of the current regulations in ${lang}.
        6. List 3 specific actionable recommendations (e.g., get registration number, tax duties) in ${lang}.

        RESPONSE FORMAT (JSON ONLY):
        {
          "riskScore": number,
          "riskLevel": "string",
          "riskStatus": "string",
          "description": "string",
          "recommendations": ["string", "string", "string"]
        }
    `;

    try {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      const response = await result.response;
      return JSON.parse(this.cleanJson(response.text()));
    } catch (error) {
      console.error('Error checking compliance:', error);
      return {
        riskScore: 50,
        riskLevel: 'Moderate Risk',
        riskStatus: 'Unknown',
        description: 'Unable to perform real-time scan. Please check local municipal website.',
        recommendations: ['Check for registration requirements', 'Verify tax obligations', 'Consult a legal expert']
      };
    }
  }

  async generateTaxBriefing(hostCountry: string, propertyCountry: string): Promise<string> {
    await this.ensureClient();
    const lang = this.translationService.currentLang();

    const prompt = `
        You are an international tax advisor specialized in short-term rental properties.
        
        TASK: Provide a high-level tax briefing for a host living in "${hostCountry}" with a rental property in "${propertyCountry}".
        
        INSTRUCTIONS:
        1. Explain the tax obligations in both countries (if applicable).
        2. Mention relevant tax treaties or double taxation avoidance mechanisms.
        3. Suggest the most common tax-efficient structures (e.g., LMNP vs SCI in France, or similar for other countries).
        4. Keep it concise, professional, and educational.
        5. Add a strong disclaimer that this is NOT official legal or tax advice.
        6. Language: "${lang}".

        Output format: Cleanly formatted text (Markdown).
    `;

    try {
      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating tax briefing:', error);
      return "Tax briefing unavailable at the moment.";
    }
  }

  async generateFinalRoiReport(data: any): Promise<any> {
    await this.ensureClient();
    const lang = this.translationService.currentLang();

    const prompt = `
        You are a Senior Financial Advisor for High-Yield Real Estate Investments.
        
        TASK: Generate a comprehensive ROI Analysis & Risk Report for a rental property.
        
        INPUT DATA:
        ${JSON.stringify(data, null, 2)}
        
        REPORT REQUIREMENTS (JSON format):
        1. "global_score": 0-100 (Overall health integer).
        2. "risk_level": "High", "Medium", or "Low".
        3. "market_sentiment": "Bullish", "Bearish", or "Neutral".
        4. "strengths": List of 3 key positive drivers (Bullish factors).
        5. "opportunities": List of 3 key RISK FACTORS (Bearish factors). *Note: Labelled 'opportunities' for legacy compatibility, but content must be RISKS.*
        6. "comprehensive_verdict": Final investment advice summary (1 sentence).
        
        Language: "${lang}".
        Return ONLY the JSON.
    `;

    try {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      const response = await result.response;
      return JSON.parse(this.cleanJson(response.text()));
    } catch (error) {
      console.error('Error generating ROI report (Using Fallback):', error);
      // Fallback Mock Data for Development/Quota Exceeded
      return {
        global_score: 85,
        risk_level: 'Low',
        market_sentiment: 'Bullish',
        strengths: [
          'High demand area with strong tourism growth.',
          'Excellent projected cashflow vs market average.',
          'Property features align perfectly with traveler preferences.'
        ],
        opportunities: [
          'Potential regulatory tightening in the sector.',
          'Seasonal vacancy risks during winter months.',
          'Maintenance costs may rise due to property age.'
        ],
        comprehensive_verdict: 'An excellent investment opportunity with manageable risks; recommended for immediate acquisition.'
      };
    }
  }
}