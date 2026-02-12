import { Assumptions, MonthlyTrackingData, ProspectingChannel } from './types';

export const DEFAULT_CHANNELS: ProspectingChannel[] = [
  // --- RELATIONNEL (Réseau, Prescripteurs, CRM) ---
  { 
    id: 'recommandations', 
    category: 'Relationnel',
    name: 'Cercle Perso & Recommandations', 
    description: 'Solliciter famille, amis et anciens clients.',
    details: {
      actionSmart: "Contacter X personnes de votre sphère privée ou anciens clients pour informer de votre activité ou demander une mise en relation.",
      example: "Lundi : appel à 3 anciens clients. Jeudi : déjeuner avec un ancien collègue. Objectif : 1 lead qualifié.",
      horizon: "Immédiat (Lead chaud)",
      indicators: ["appels_passes", "mises_en_relation"],
      tips: ["Taux de conversion élevé (50-70% sur recommandation). Organisez un pot de lancement ou envoyez un email personnalisé."]
    },
    enabled: true, 
    distributionPercent: 20, 
    actionsPerR1: 2, 
    actionUnit: 'contacts' 
  },
  { 
    id: 'prescripteurs', 
    category: 'Relationnel',
    name: 'Partenaires & Prescripteurs', 
    description: 'Notaires, gardiens, commerçants, artisans.',
    details: {
      actionSmart: "Visiter ou appeler X partenaires locaux (boulangerie, notaire, concierge) pour entretenir le lien et déposer des cartes.",
      example: "Cette semaine : visite de 2 gardiens + 1 RDV notaire.",
      horizon: "Moyen terme (1 à 3 mois)",
      indicators: ["partenaires_visites", "leads_recus"],
      tips: ["Apportez de la valeur (estimation gratuite pour leurs clients) avant de demander. Les meilleurs rapportent plusieurs mandats/an."]
    },
    enabled: true, 
    distributionPercent: 10, 
    actionsPerR1: 5, 
    actionUnit: 'visites' 
  },
  { 
    id: 'reseau_affaires', 
    category: 'Relationnel',
    name: 'Réseaux Business (BNI/Clubs)', 
    description: 'Rencontres entrepreneurs et afterworks pro.',
    details: {
      actionSmart: "Échanger avec X professionnels et récupérer leurs coordonnées (cartes) lors d'événements business.",
      example: "Mardi soir : Afterwork entrepreneurs → 3 cartes récupérées avec promesse de rappel.",
      horizon: "Moyen terme",
      indicators: ["contacts_business", "rdv_partenaires"],
      tips: ["Ne comptez pas l'événement, comptez les mains serrées et les cartes récupérées. L'objectif est de repartir avec des leads."]
    },
    enabled: false, 
    distributionPercent: 0, 
    actionsPerR1: 15, 
    actionUnit: 'contacts' 
  },
  { 
    id: 'vie_associative', 
    category: 'Relationnel',
    name: 'Vie Associative & Sportive', 
    description: 'Clubs de sport, loisirs, associations locales.',
    details: {
      actionSmart: "Initier une conversation 'Immo' avec X personnes lors de vos activités personnelles (sport, culture, école).",
      example: "Samedi Tennis : Discuter marché immo avec 2 partenaires après le match.",
      horizon: "Long terme (Confiance)",
      indicators: ["discussions_immo", "cartes_donnees"],
      tips: ["Soyez passionné par votre activité sans être lourd. C'est la fréquence des interactions naturelles qui crée l'opportunité."]
    },
    enabled: true, 
    distributionPercent: 5, 
    actionsPerR1: 25, 
    actionUnit: 'contacts' 
  },
  { 
    id: 'suivi_crm', 
    category: 'Relationnel',
    name: 'Relance Base / Nurturing', 
    description: 'Relance téléphonique des anciens prospects.',
    details: {
      actionSmart: "Appeler X contacts 'tièdes' ou anciens prospects estimation de votre CRM pour prendre des nouvelles.",
      example: "Vendredi 14h-16h : rappel de 10 estimations datant de plus de 6 mois.",
      horizon: "Immédiat (Réactivation)",
      indicators: ["relances_effectuees", "projets_detectes"],
      tips: ["Les agences rigoureuses augmentent de +67% leur conversion grâce au suivi. Ne lâchez rien avant le 'Non' définitif."]
    },
    enabled: true, 
    distributionPercent: 10, 
    actionsPerR1: 20, 
    actionUnit: 'relances' 
  },

  // --- TERRAIN (Physique) ---
  { 
    id: 'porte_a_porte', 
    category: 'Terrain',
    name: 'Porte-à-Porte (PaP)', 
    description: 'Prospection active sur micro-secteur.',
    details: {
      actionSmart: "Frapper à X portes, se présenter et proposer une estimation ou une info quartier.",
      example: "Mardi + Jeudi 17h-19h : 60 portes → 10 contacts réels → 1 RDV.",
      horizon: "Moyen terme (30 à 100 portes pour 1 mandat)",
      indicators: ["portes_frappees", "contacts_argumentes"],
      tips: ["Soyez bref et souriant. Préparez une phrase d'accroche ('Je viens de vendre le T3 au coin de la rue...')."]
    },
    enabled: true, 
    distributionPercent: 15, 
    actionsPerR1: 50, 
    actionUnit: 'portes' 
  },
  { 
    id: 'pap_cible', 
    category: 'Terrain',
    name: 'PaP Ciblé (Pige Physique)', 
    description: 'Visite directe aux propriétaires vendeurs identifiés (Panneaux).',
    details: {
      actionSmart: "Identifier les biens avec panneau 'A Vendre' et aller frapper à la porte pour proposer une estimation comparative.",
      example: "Mercredi : Repérage de 3 panneaux -> 3 tentatives de contact physique.",
      horizon: "Court terme",
      indicators: ["biens_visites", "proprietaires_rencontres"],
      tips: ["Beaucoup plus efficace que le téléphone car difficile à éconduire. Apportez une étude de marché du quartier en main propre."]
    },
    enabled: false, 
    distributionPercent: 0, 
    actionsPerR1: 15, // Plus qualifié que le PaP classique
    actionUnit: 'visites' 
  },
  { 
    id: 'courrier_cible', 
    category: 'Terrain',
    name: 'Courrier Ciblé (Boîte aux Lettres)', 
    description: 'Dépôt de lettre manuscrite pour biens en vente.',
    details: {
      actionSmart: "Déposer une lettre personnalisée (enveloppe couleur, manuscrite) dans la boîte aux lettres d'un bien en vente (PAP ou concurrent).",
      example: "Vendredi : Dépôt de 5 courriers 'J'ai un acquéreur pour votre maison'.",
      horizon: "Moyen terme",
      indicators: ["courriers_deposes", "appels_recus"],
      tips: ["Ne mettez pas un flyer commercial. Écrivez une lettre empathique : 'J'ai vu que vous vendiez...'."]
    },
    enabled: false, 
    distributionPercent: 0, 
    actionsPerR1: 30, 
    actionUnit: 'lettres' 
  },
  { 
    id: 'distribution_prospectus', 
    category: 'Terrain',
    name: 'Boîtage (Flyers)', 
    description: 'Distribution de masse ciblée.',
    details: {
      actionSmart: "Distribuer X flyers sur une zone précise (ex: autour d'un bien vendu ou nouveauté).",
      example: "Samedi matin : 500 boites sur le quartier 'Les Fleurs'.",
      horizon: "Long terme (Mois)",
      indicators: ["flyers_distribues", "appels_entrants"],
      tips: ["Ratios faibles (1/1000). Utile pour la notoriété visuelle ('Top of Mind') ou ciblage précis 'Vendu dans votre rue'."]
    },
    enabled: true, 
    distributionPercent: 5, 
    actionsPerR1: 1000, 
    actionUnit: 'boites' 
  },
  { 
    id: 'affichage_local', 
    category: 'Terrain',
    name: 'Affichage Local', 
    description: 'Affiches chez commerçants, panneaux, vitrines.',
    details: {
      actionSmart: "Négocier et poser X affiches 'Recherche Bien' ou 'Vendu' chez les commerçants de proximité.",
      example: "Cette semaine : poser 5 affiches boulangerie/presse.",
      horizon: "Long terme (Notoriété)",
      indicators: ["affiches_posees", "appels_entrants"],
      tips: ["Rotation régulière nécessaire. Privilégiez les lieux de fort passage/attente."]
    },
    enabled: false, 
    distributionPercent: 0, 
    actionsPerR1: 30, 
    actionUnit: 'affiches' 
  },
  { 
    id: 'evenementiel_terrain', 
    category: 'Terrain',
    name: 'Portes Ouvertes & Stands', 
    description: 'Animation stand marché, foire ou Open House.',
    details: {
      actionSmart: "Organiser 1 événement physique (stand ou visite libre) pour capter des contacts directs.",
      example: "Samedi matin : stand au marché avec jeu concours estimation.",
      horizon: "Court terme",
      indicators: ["evenements", "contacts_recuperes"],
      tips: ["30% des visiteurs laissent leurs coordonnées. La clé est la relance immédiate (J+1)."]
    },
    enabled: false, 
    distributionPercent: 0, 
    actionsPerR1: 1, // 1 événement bien géré peut générer 1 R1
    actionUnit: 'événements' 
  },

  // --- TÉLÉPHONE & SMS ---
  { 
    id: 'pige', 
    category: 'Téléphone',
    name: 'Pige (Annonces PAP)', 
    description: 'Appel des vendeurs actifs (LBC, PAP).',
    details: {
      actionSmart: "Appeler les nouvelles annonces de particuliers pour proposer ses services (ou acquéreurs).",
      example: "Tous les matins 9h-10h : 10 appels ciblés.",
      horizon: "Court terme (Vendeur actif)",
      indicators: ["appels_passes", "rdv_pris"],
      tips: ["Exige tact et valeur ajoutée. ~30-60 appels pour 1 mandat. Le vendeur a un projet concret."]
    },
    enabled: true, 
    distributionPercent: 15, 
    actionsPerR1: 30, 
    actionUnit: 'appels' 
  },
  { 
    id: 'sequence_sms', 
    category: 'Téléphone',
    name: 'Séquence SMS Vendeur', 
    description: 'Séquence de 3 SMS (Présentation > Service > Offre).',
    details: {
      actionSmart: "Engager une conversation par SMS avec un vendeur (Pige) via une séquence progressive : 1. Intro soft, 2. Envoi dossier valeur, 3. Proposition RDV.",
      example: "Envoyer le SMS #1 à 10 nouvelles annonces le matin.",
      horizon: "Court terme",
      indicators: ["sequences_lancees", "reponses_recues"],
      tips: ["Moins intrusif que l'appel. Taux de réponse élevé si le message est personnalisé et non robotique. Ne vendez pas, proposez de l'aide."]
    },
    enabled: false, 
    distributionPercent: 0, 
    actionsPerR1: 60, // Il faut lancer ~60 séquences pour décrocher 1 RDV ferme
    actionUnit: 'séquences' 
  },

  // --- DIGITAL (Organique & Payant) ---
  { 
    id: 'avis_google', 
    category: 'Digital',
    name: 'Conquête d\'Avis Google', 
    description: 'Solliciter des avis 5 étoiles clients/partenaires.',
    details: {
      actionSmart: "Envoyer une demande d'avis personnalisée (SMS/WhatsApp) à X anciens clients ou partenaires.",
      example: "Mardi : Envoyer le lien Google à 3 clients signés l'an dernier + 2 artisans.",
      horizon: "Moyen terme (Réputation & SEO)",
      indicators: ["demandes_envoyees", "avis_recus"],
      tips: ["Crucial pour le SEO Local. Un appel préalable augmente le taux de retour à 80%. Profitez-en pour demander des nouvelles (double effet)."]
    },
    enabled: true, 
    distributionPercent: 5, 
    actionsPerR1: 20, // Impact indirect fort + Lead réactivation
    actionUnit: 'demandes' 
  },
  { 
    id: 'contenu_reseaux_sociaux', 
    category: 'Digital',
    name: 'Réseaux Sociaux (Posts)', 
    description: 'Facebook, Insta, LinkedIn, TikTok (Organique).',
    details: {
      actionSmart: "Publier du contenu local à valeur ajoutée (vidéo marché, conseil, bien vendu).",
      example: "Mardi : Vidéo visite. Jeudi : Post chiffres marché.",
      horizon: "Long terme (Branding)",
      indicators: ["posts_publies", "messages_prives"],
      tips: ["Sert la confiance ('Social Proof'). Faible conversion directe, fort impact indirect."]
    },
    enabled: true, 
    distributionPercent: 5, 
    actionsPerR1: 20, 
    actionUnit: 'posts' 
  },
  { 
    id: 'social_selling', 
    category: 'Digital',
    name: 'Social Selling', 
    description: 'Interactions sur groupes locaux (Nextdoor, FB ville).',
    details: {
      actionSmart: "Commenter et aider sur les groupes locaux. Répondre aux questions immo.",
      example: "15 min/jour : répondre à 3 questions sur le groupe 'Vivre à [Ville]'.",
      horizon: "Moyen terme",
      indicators: ["commentaires", "conversations_messenger"],
      tips: ["Ne vendez pas directement. Soyez l'expert serviable du quartier."]
    },
    enabled: false, 
    distributionPercent: 0, 
    actionsPerR1: 50, 
    actionUnit: 'interactions' 
  },
  { 
    id: 'leads_google_ads', 
    category: 'Digital',
    name: 'Référencement Payant (SEA)', 
    description: 'Achat de mots-clés "Estimation [Ville]" sur Google.',
    details: {
      actionSmart: "Traiter les leads entrants générés par vos campagnes de recherche.",
      example: "Rappel dans les 5 minutes de toute demande d'estimation web.",
      horizon: "Immédiat",
      indicators: ["leads_traites", "rdv_pris"],
      tips: ["Intention forte (le client cherche activement). Conversion élevée si réactivité maximale."]
    },
    enabled: false, 
    distributionPercent: 0, 
    actionsPerR1: 5, // ~20% de conv Lead -> RDV
    actionUnit: 'leads' 
  },
  { 
    id: 'leads_social_ads', 
    category: 'Digital',
    name: 'Publicité Sociale (FB/Insta)', 
    description: 'Publicité ciblée (Sponsoring) avec formulaire.',
    details: {
      actionSmart: "Traiter les leads issus des publicités Facebook/Instagram.",
      example: "Campagne 'Vendu dans votre rue' : traiter les 10 formulaires reçus cette semaine.",
      horizon: "Court terme",
      indicators: ["leads_traites", "rdv_pris"],
      tips: ["Leads souvent plus 'froids' que Google. Nécessite plus de qualification et de relance."]
    },
    enabled: false, 
    distributionPercent: 0, 
    actionsPerR1: 15, // ~6-7% de conv Lead -> RDV
    actionUnit: 'leads' 
  },
  { 
    id: 'leads_payants', 
    category: 'Digital',
    name: 'Achat de Leads (Plateformes)', 
    description: 'MeilleursAgents, Netvendeur, etc.',
    details: {
      actionSmart: "Appeler immédiatement les leads achetés aux plateformes.",
      example: "Alerte reçue -> Appel dans la minute.",
      horizon: "Immédiat",
      indicators: ["leads_achetes", "rdv_pris"],
      tips: ["Forte concurrence (envoyé à plusieurs agents). La vitesse est le seul critère de réussite."]
    },
    enabled: true, 
    distributionPercent: 10, 
    actionsPerR1: 8, 
    actionUnit: 'leads' 
  },
  { 
    id: 'creation_contenu_web', 
    category: 'Digital',
    name: 'Blog / Vidéo (SEO)', 
    description: 'Articles de blog, Guides PDF, Vidéos YouTube.',
    details: {
      actionSmart: "Produire un contenu de fond (Article ou Vidéo) optimisé pour le référencement local.",
      example: "Rédiger 'Prix du m2 à [Ville] en 2025'.",
      horizon: "Très long terme (SEO)",
      indicators: ["contenus_produits", "trafic_web"],
      tips: ["1 contenu travaille pour vous pendant des années. 1 à 3% des lecteurs deviennent des leads."]
    },
    enabled: false, 
    distributionPercent: 0, 
    actionsPerR1: 5, // Difficile à jauger, on compte l'action de production
    actionUnit: 'contenus' 
  },
];

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  objectiveMode: 'monthlyIncome',
  
  monthlyNetSalaryGoal: 3000,
  targetTurnover: 150000,
  targetSales: 15,
  
  avgFee: 8500, 
  
  // Funnel
  mandatesPerSale: 5, 
  r1PerMandate: 2, 
  visitsPerOffer: 10, // New default
  
  monthsWorked: 11,
  
  channels: DEFAULT_CHANNELS
};

export const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const initChannelTracking = (channels: ProspectingChannel[]) => {
  return channels.map(c => ({
    channelId: c.id,
    weeks: [
      { actionsDone: 0, contactsObtained: 0, rdvObtained: 0 },
      { actionsDone: 0, contactsObtained: 0, rdvObtained: 0 },
      { actionsDone: 0, contactsObtained: 0, rdvObtained: 0 },
      { actionsDone: 0, contactsObtained: 0, rdvObtained: 0 },
    ] as [any, any, any, any]
  }));
};

export const INITIAL_TRACKING_DATA: MonthlyTrackingData[] = Array.from({ length: 12 }, (_, i) => ({
  monthIndex: i,
  channelTracking: initChannelTracking(DEFAULT_CHANNELS),
  manualTurnover: 0,
  manualSales: 0,
  manualOffers: 0,
  manualVisits: 0,
  manualMandates: 0
}));