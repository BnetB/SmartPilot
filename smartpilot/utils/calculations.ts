import { Assumptions, GlobalTargets, ChannelTarget, MonthlyTrackingData, ProspectingChannel } from '../types';

/**
 * 1. Calculate Global Targets based on Objective Mode
 */
export const calculateGlobalTargets = (assumptions: Assumptions): GlobalTargets => {
  let annualTurnover = 0;
  let annualSales = 0;

  // Determine starting point
  switch (assumptions.objectiveMode) {
    case 'monthlyIncome':
      // Net Monthly * 2 (charges approx) * 12 months = Annual Turnover
      annualTurnover = assumptions.monthlyNetSalaryGoal * 2 * 12;
      annualSales = Math.ceil(annualTurnover / assumptions.avgFee);
      break;
    case 'annualTurnover':
      annualTurnover = assumptions.targetTurnover;
      annualSales = Math.ceil(annualTurnover / assumptions.avgFee);
      break;
    case 'annualSales':
      annualSales = assumptions.targetSales;
      annualTurnover = annualSales * assumptions.avgFee;
      break;
  }

  // Funnel: Sales -> Mandates -> R1
  // Using "Per Sale" logic (e.g., 5 mandates per sale)
  const annualMandates = Math.ceil(annualSales * assumptions.mandatesPerSale);
  const annualR1 = Math.ceil(annualMandates * assumptions.r1PerMandate);

  // Time division
  const monthlyR1 = Math.ceil(annualR1 / (assumptions.monthsWorked || 11)); // Protect against 0
  const weeklyR1 = Number((monthlyR1 / 4).toFixed(1));

  return {
    annualTurnover,
    annualSales,
    annualMandates,
    annualR1,
    monthlyR1,
    weeklyR1
  };
};

/**
 * 2. Calculate Targets per Channel
 */
export const calculateChannelTargets = (
  monthlyR1Target: number, 
  channels: ProspectingChannel[]
): ChannelTarget[] => {
  
  return channels.map(channel => {
    if (!channel.enabled) {
      return { 
        channelId: channel.id, 
        channelName: channel.name,
        monthlyActionTarget: 0, 
        weeklyActionTarget: 0, 
        monthlyR1Target: 0,
        actionUnit: channel.actionUnit
      };
    }

    // How many R1s from this channel?
    const channelR1Target = monthlyR1Target * (channel.distributionPercent / 100);

    // How many actions? (Yield * R1 needed)
    const monthlyActionTarget = Math.ceil(channelR1Target * channel.actionsPerR1);
    const weeklyActionTarget = Math.ceil(monthlyActionTarget / 4);

    return {
      channelId: channel.id,
      channelName: channel.name,
      monthlyR1Target: Number(channelR1Target.toFixed(1)),
      monthlyActionTarget,
      weeklyActionTarget,
      actionUnit: channel.actionUnit
    };
  });
};

/**
 * 3. Aggregate Actuals
 */
export const aggregateActuals = (tracking: MonthlyTrackingData[]) => {
  return tracking.reduce((acc, curr) => {
    acc.turnover += curr.manualTurnover;
    acc.sales += curr.manualSales;
    acc.offers += (curr.manualOffers || 0);
    acc.visits += (curr.manualVisits || 0);
    acc.mandates += curr.manualMandates;

    curr.channelTracking.forEach(ct => {
      ct.weeks.forEach(week => {
        acc.actions += week.actionsDone;
        acc.rdv += week.rdvObtained;
        acc.contacts += week.contactsObtained;
      });
    });

    return acc;
  }, { turnover: 0, sales: 0, offers: 0, visits: 0, mandates: 0, actions: 0, rdv: 0, contacts: 0 });
};

// Helper for progress
export const calculateProgress = (actual: number, target: number) => {
  if (target === 0) return 0;
  return Math.round((actual / target) * 100);
};

export const getPerformanceColor = (percentage: number) => {
  if (percentage >= 100) return "bg-green-200 text-green-800";
  if (percentage >= 60) return "bg-yellow-200 text-yellow-800";
  return "bg-red-200 text-red-800";
};

// --- NOUVEAUTÉS PÉDAGOGIQUES ---

/**
 * Estime le temps nécessaire pour réaliser une action
 * Basé sur des moyennes terrain constatées
 */
export const estimateFieldTime = (actionCount: number, channelId: string): string => {
  if (actionCount <= 0) return "";
  
  let ratePerHour = 0;

  switch (channelId) {
    // TERRAIN
    case 'distribution_prospectus': ratePerHour = 250; break; // ~250 boites/h
    case 'porte_a_porte': ratePerHour = 20; break; // ~20 portes/h
    case 'pap_cible': ratePerHour = 5; break; // ~5 visites physiques (temps de trajet + porte)
    case 'courrier_cible': ratePerHour = 5; break; // ~12 min/lettre (écrire + déposer)
    case 'affichage_local': ratePerHour = 5; break; // ~5 affiches/h (négo + pose)
    case 'evenementiel_terrain': ratePerHour = 0.25; break; // 1 événement = 4h
    
    // TÉLÉPHONE
    case 'pige': ratePerHour = 15; break; // ~15 appels/h (recherche + appel + note)
    case 'sequence_sms': ratePerHour = 20; break; // ~3 min par séquence (copier/coller personnalisé)
    
    // DIGITAL
    case 'avis_google': ratePerHour = 10; break; // ~6 min par demande personnalisée (appel ou sms)
    case 'contenu_reseaux_sociaux': ratePerHour = 2; break; // ~30 min par post
    case 'social_selling': ratePerHour = 10; break; // ~6 min par interaction
    case 'leads_google_ads': ratePerHour = 6; break; // ~10 min par lead
    case 'leads_social_ads': ratePerHour = 6; break; // ~10 min par lead
    case 'leads_payants': ratePerHour = 6; break; // ~10 min par lead
    case 'creation_contenu_web': ratePerHour = 0.25; break; // ~4h par contenu fond
    
    // RELATIONNEL
    case 'recommandations': ratePerHour = 4; break; // ~15 min par demande qualifiée
    case 'prescripteurs': ratePerHour = 2; break; // ~30 min par visite
    case 'reseau_affaires': ratePerHour = 3; break; // ~20 min par contact (en moyenne durant l'événement)
    case 'vie_associative': ratePerHour = 2; break; // ~30 min par contact (en moyenne durant l'activité)
    case 'suivi_crm': ratePerHour = 10; break; // ~6 min par relance

    default: ratePerHour = 10;
  }

  const hours = actionCount / ratePerHour;
  
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (Number.isInteger(hours)) return `${hours}h`;
  
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h${m > 0 ? m : ''}`;
};

/**
 * Analyse la régularité sur les 4 dernières semaines actives
 */
export const analyzeConsistency = (tracking: MonthlyTrackingData[], monthIndex: number) => {
  // Simplification: Regarde le mois en cours
  const currentMonth = tracking[monthIndex];
  let weeksActive = 0;
  let totalWeeks = 0;

  currentMonth.channelTracking.forEach(ct => {
    ct.weeks.forEach(w => {
        if (w.actionsDone > 0) weeksActive++;
        totalWeeks++; // This counts all weeks across all channels, logic needs refinement for "Weeks worked"
    });
  });
  
  // Logic: Did the user perform actions in Week 1, Week 2, Week 3?
  // We aggregate all channels per week
  const weeklyActivity = [0, 0, 0, 0];
  currentMonth.channelTracking.forEach(ct => {
      ct.weeks.forEach((w, idx) => {
          if (w.actionsDone > 0) weeklyActivity[idx] = 1;
      });
  });

  const consistencyScore = weeklyActivity.reduce((a, b) => a + b, 0); // 0 to 4
  
  let feedback = "";
  if (consistencyScore === 4) feedback = "Excellent ! La régularité est la clé.";
  else if (consistencyScore >= 2) feedback = "Bon début, essaye de ne rien lâcher la semaine prochaine.";
  else feedback = "La priorité est de reprendre un rythme hebdomadaire régulier.";

  return { score: consistencyScore, feedback };
};

/**
 * Génère une analyse managériale automatique
 */
export const getManagerFeedback = (actionsProgress: number, rdvProgress: number): { title: string, desc: string, status: 'success' | 'warning' | 'danger' } => {
  if (actionsProgress > 80 && rdvProgress > 80) {
    return { title: "Alignement Parfait", desc: "L'effort paie. Continuez sur cette lancée.", status: 'success' };
  }
  if (actionsProgress > 80 && rdvProgress < 50) {
    return { title: "Problème de Conversion", desc: "Gros volume d'actions mais peu de RDV. Travailler le discours, l'accroche ou la cible.", status: 'warning' };
  }
  if (actionsProgress < 50 && rdvProgress < 50) {
    return { title: "Déficit d'Activité", desc: "Le volume d'actions est insuffisant pour espérer des résultats. Revoir la discipline.", status: 'danger' };
  }
  if (actionsProgress < 50 && rdvProgress > 80) {
    return { title: "Chance ou Talent ?", desc: "Peu d'actions mais beaucoup de RDV. Attention à la durabilité de ces résultats.", status: 'warning' };
  }
  return { title: "En construction", desc: "Continuez à alimenter les données.", status: 'warning' };
};