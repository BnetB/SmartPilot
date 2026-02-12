import React, { useMemo } from 'react';
import { useStore } from '../context/Store';
import { calculateGlobalTargets, calculateChannelTargets } from '../utils/calculations';
import { 
  TrendingUp, BatteryCharging, BatteryFull, BatteryWarning, 
  Target, AlertTriangle, CheckCircle2, ArrowRight, BrainCircuit,
  Calendar, Activity, Microscope, AlertOctagon, Footprints, Flame, Quote, Sparkles
} from 'lucide-react';
import { MONTH_NAMES } from '../constants';

// Helper for projection
const getProjection = (current: number) => {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const day = now.getDate();
  if (day === 0) return current;
  return Math.round((current / day) * daysInMonth);
};

export const ManagerView: React.FC = () => {
  const { state } = useStore();
  const currentMonthIndex = new Date().getMonth();
  
  // --- 1. DATA EXTRACTION ---
  const tracking = state.tracking[currentMonthIndex];
  const prevTracking = currentMonthIndex > 0 ? state.tracking[currentMonthIndex - 1] : null;
  
  const globals = calculateGlobalTargets(state.assumptions);
  const channelTargets = calculateChannelTargets(globals.monthlyR1, state.assumptions.channels);

  // Targets
  const targetActions = channelTargets.reduce((sum, c) => sum + c.monthlyActionTarget, 0);
  const targetRDV = globals.monthlyR1;

  // Actuals (Current Month)
  let actualActions = 0;
  let actualRDV = 0;
  let bestChannelName = "";
  let bestChannelRDV = -1;

  tracking.channelTracking.forEach(ct => {
    let channelActions = 0;
    let channelRDV = 0;
    ct.weeks.forEach(w => {
      actualActions += w.actionsDone;
      channelActions += w.actionsDone;
      actualRDV += w.rdvObtained;
      channelRDV += w.rdvObtained;
    });

    // Identify Best Channel
    if (channelRDV > bestChannelRDV) {
        bestChannelRDV = channelRDV;
        const cInfo = state.assumptions.channels.find(c => c.id === ct.channelId);
        if (cInfo) bestChannelName = cInfo.name;
    }
  });

  // Actuals (Previous Month)
  let prevActions = 0;
  if (prevTracking) {
      prevTracking.channelTracking.forEach(ct => {
          ct.weeks.forEach(w => prevActions += w.actionsDone);
      });
  }

  // Days since last action
  const lastActiveDate = state.activeDays.length > 0 ? state.activeDays[state.activeDays.length - 1] : null;
  const daysSinceLastAction = lastActiveDate 
    ? Math.floor((new Date().getTime() - new Date(lastActiveDate).getTime()) / (1000 * 3600 * 24))
    : 30; // Default high if no activity

  const currentDayOfMonth = new Date().getDate();

  // Ratios
  const rateActions = targetActions > 0 ? Math.round((actualActions / targetActions) * 100) : 0;
  const rateRDV = targetRDV > 0 ? Math.round((actualRDV / targetRDV) * 100) : 0;
  
  // Projections
  const projRDV = getProjection(actualRDV);
  const gapRDV = targetRDV - projRDV;

  // --- 2. COACHING ENGINE (RULES) ---
  const getCoachAdvice = () => {
    // 🔴 CAS 1 – Aucune action enregistrée après 5 jours (Début de mois inactif)
    if (actualActions === 0 && currentDayOfMonth >= 5) {
        return {
            scenario: 'START_STOP',
            level: 'critical',
            color: 'red',
            icon: AlertOctagon,
            title: "Arrêt Cardiaque",
            constat: "Tu n’as enregistré aucune action depuis plusieurs jours.",
            strategie: "Sans action, il ne peut pas y avoir de progression. C’est l’action qui crée l’expérience, l’expérience qui crée la maîtrise, et la maîtrise qui crée les résultats.",
            action: "Crée le mouvement dès aujourd’hui, même avec une action simple.",
            citations: [
                "“On apprend en agissant.” – Aristote",
                "“Le seul endroit où le succès vient avant le travail, c'est dans le dictionnaire.” – Vidal Sassoon",
                "“Celui qui veut trouve un moyen, celui qui ne veut pas trouve une excuse.” – Socrate"
            ],
            ctas: [
                "Bloquer 1h de prospection terrain",
                "Planifier 30 minutes d’actions immédiates",
                "Réaliser 10 actions simples aujourd’hui",
                "Relancer 5 contacts répertoire"
            ]
        };
    }

    // 🟡 CAS 5 – Plus de 5 jours sans action (Rupture en cours de mois)
    if (daysSinceLastAction >= 5 && actualActions > 0) {
        return {
            scenario: 'BREAK',
            level: 'warning',
            color: 'orange',
            icon: BatteryWarning,
            title: "Rupture de Régularité",
            constat: "Une rupture de régularité est détectée.",
            strategie: "Cela arrive à tout le monde. Ce qui compte, c’est la reprise. Reviens à l’essentiel : concentre ton attention sur ton activité.",
            action: "Relance la dynamique avec une action simple aujourd’hui.",
            citations: [
                "“Ce n’est pas la chute qui compte, mais la capacité à se relever.” – Nelson Mandela",
                "“Là où va ton attention, va ton énergie.” – Tony Robbins",
                "“Le succès ne dépend pas de ce que vous faites de temps en temps, mais de ce que vous faites chaque jour.” – Zig Ziglar",
                "“Le succès n’est rien de plus que quelques disciplines simples pratiquées chaque jour.” – Jim Rohn"
            ],
            ctas: [
                "Relancer 10 anciens contacts",
                "Bloquer 45 minutes relationnelles",
                "Réaliser 10 actions rapides",
                "Reprogrammer 1 créneau terrain"
            ]
        };
    }

    // 🟡 CAS 2 – Volume élevé mais peu de RDV (Pb Conversion)
    if (rateActions >= 70 && rateRDV <= 30) {
        return {
            scenario: 'CONVERSION',
            level: 'warning',
            color: 'yellow',
            icon: BrainCircuit,
            title: "Efficacité à revoir",
            constat: "Tu fournis l’effort nécessaire, mais les RDV ne suivent pas encore.",
            strategie: "Ce n’est pas un échec, c’est une phase d’apprentissage. Chaque action te rend plus compétent, plus précis, plus efficace.",
            action: "Analyse tes échanges et ajuste ton discours.",
            citations: [
                "“Dans la vie, je ne perds jamais. Soit je gagne, soit j’apprends.” – Nelson Mandela",
                "“L’échec est simplement l’opportunité de recommencer, cette fois de manière plus intelligente.” – Henry Ford"
            ],
            ctas: [
                "Analyser 3 conversations récentes",
                "Travailler ton script vendeur 15 min",
                "Préparer 5 réponses aux objections",
                "T’entraîner à voix haute (Roleplay)"
            ]
        };
    }

    // 🟢 CAS 3 – Bon ratio mais volume insuffisant (Potentiel inexploité)
    if (rateRDV > 40 && rateActions < 50) { // Using RDV rate as proxy for good ratio/luck
        return {
            scenario: 'VOLUME',
            level: 'success', // Positive tone but push for more
            color: 'green',
            icon: BatteryCharging,
            title: "Potentiel Inexploité",
            constat: "Tu es efficace lorsque tu passes à l’action.",
            strategie: "Le levier n’est pas la compétence, mais le volume. C’est la répétition régulière qui crée l’effet cumulé et amplifie les résultats.",
            action: "Augmente légèrement ton volume cette semaine.",
            citations: [
                "“Le succès est la somme de petits efforts répétés jour après jour.” – Robert Collier",
                "“La discipline est le pont entre les objectifs et l’accomplissement.” – Jim Rohn",
                "“La régularité bat toujours le talent.” – Michael Jordan"
            ],
            ctas: [
                "Ajouter 30% d’actions cette semaine",
                "Bloquer 2 créneaux supplémentaires",
                "Doubler ton volume pendant 48h",
                "Lancer un mini-challenge personnel"
            ]
        };
    }

    // 🟢 CAS 4 – Progression positive (Momentum)
    if (actualActions > prevActions && prevActions > 0) {
        return {
            scenario: 'GROWTH',
            level: 'success',
            color: 'green',
            icon: TrendingUp,
            title: "Momentum Positif",
            constat: "Tu es en progression par rapport au mois précédent.",
            strategie: "Tes efforts commencent à produire leurs effets. Le travail paie toujours ses dettes. Continue à accélérer.",
            action: "Maintiens le rythme et renforce ce qui fonctionne.",
            citations: [
                "“La réussite appartient à ceux qui persévèrent.” – Napoléon Hill",
                "“Ce que vous obtenez en atteignant vos objectifs n’est pas aussi important que ce que vous devenez en les atteignant.” – Zig Ziglar"
            ],
            ctas: [
                "Maintenir ton rythme actuel",
                "Consolider tes créneaux hebdos",
                "Intensifier ton meilleur canal",
                "Ajouter un créneau bonus"
            ]
        };
    }

    // 🔵 CAS 6 – Canal dominant identifié (Focus)
    if (bestChannelRDV >= 1) {
        return {
            scenario: 'FOCUS',
            level: 'info',
            color: 'blue',
            icon: Target,
            title: "Levier Identifié",
            constat: `Ton canal le plus performant est : ${bestChannelName}.`,
            strategie: "Lorsque tu identifies ce qui fonctionne, tu dois concentrer ton énergie dessus. La focalisation multiplie l’impact.",
            action: "Oriente 60% de ton énergie vers ce canal cette semaine.",
            citations: [
                "“La focalisation crée la puissance.” – Anonyme",
                "“Le succès vient de la concentration de l’énergie.” – Bruce Lee",
                "“Ce sur quoi tu te concentres grandit.” – Eckhart Tolle"
            ],
            ctas: [
                `Planifier 3 sessions ${bestChannelName}`,
                "Dédier 60% de ton temps à ce canal",
                "Intensifier ce levier sur 7 jours",
                "Optimiser ce canal dès aujourd’hui"
            ]
        };
    }

    // Fallback (Début de cycle normal)
    return {
        scenario: 'DEFAULT',
        level: 'info',
        color: 'gray',
        icon: Activity,
        title: "Initialisation",
        constat: "Le mois ne fait que commencer.",
        strategie: "La régularité est la clé de la réussite commerciale. Chaque journée compte pour bâtir ton résultat.",
        action: "Lance ta première série d'actions dès maintenant.",
        citations: ["“Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment est maintenant.”"],
        ctas: ["Saisir mes premières actions", "Consulter ma roadmap"]
    };
  };

  const advice = useMemo(() => getCoachAdvice(), [actualActions, actualRDV, rateActions, rateRDV, daysSinceLastAction, bestChannelName]);
  
  // Pick one random citation to avoid UI jitter, use memo with dependency on advice scenario
  const randomCitation = useMemo(() => {
    const index = Math.floor(Math.random() * advice.citations.length);
    return advice.citations[index];
  }, [advice.scenario]);

  const DiagnosisIcon = advice.icon;

  // Colors mapping based on level
  const themeColors = {
      critical: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-900 dark:text-red-100', border: 'border-red-100 dark:border-red-800', icon: 'text-red-600 dark:text-red-400', bar: 'bg-red-500' },
      warning: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-900 dark:text-orange-100', border: 'border-orange-100 dark:border-orange-800', icon: 'text-orange-600 dark:text-orange-400', bar: 'bg-orange-500' },
      yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-900 dark:text-yellow-100', border: 'border-yellow-100 dark:border-yellow-800', icon: 'text-yellow-600 dark:text-yellow-400', bar: 'bg-yellow-500' },
      success: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-900 dark:text-green-100', border: 'border-green-100 dark:border-green-800', icon: 'text-green-600 dark:text-green-400', bar: 'bg-green-500' },
      info: { bg: 'bg-capi-blue-50 dark:bg-capi-blue-900/20', text: 'text-capi-blue-900 dark:text-capi-blue-100', border: 'border-capi-blue-100 dark:border-capi-blue-800', icon: 'text-capi-blue-600 dark:text-capi-blue-400', bar: 'bg-capi-blue-500' },
      gray: { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-900 dark:text-gray-100', border: 'border-gray-200 dark:border-gray-700', icon: 'text-gray-500', bar: 'bg-gray-500' },
  }[advice.level] || { bg: 'bg-gray-50', text: 'text-gray-900', border: 'border-gray-200', icon: 'text-gray-500', bar: 'bg-gray-500' };

  // --- 3. MICRO OBJECTIVES ---
  const dailyTargetStandard = Math.ceil(targetActions / 20); 
  const dailyTargetMin = Math.ceil(dailyTargetStandard * 0.5);
  const dailyTargetChallenge = Math.ceil(dailyTargetStandard * 1.3);

  return (
    <div className="space-y-8 animate-in fade-in pb-20 max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div>
         <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <BrainCircuit size={32} className="text-capi-blue-600" />
            Analyse Coach
         </h2>
         <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 ml-11">
            Diagnostic tactique de ta performance sur {MONTH_NAMES[currentMonthIndex]}.
         </p>
      </div>

      {/* SECTION 1: DIAGNOSTIC SYNTHÉTIQUE */}
      <div className="bg-white dark:bg-capi-dark-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-capi-dark-700 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Situation */}
              <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                      <Activity size={14}/> Situation Actuelle
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                      Tu es à <span className={`${rateRDV >= 100 ? 'text-green-500' : 'text-capi-blue-600'}`}>{rateRDV}%</span> de ton objectif RDV.
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-capi-dark-900 h-2 rounded-full overflow-hidden">
                     <div className={`h-full rounded-full ${rateRDV >= 100 ? 'bg-green-500' : 'bg-capi-blue-500'}`} style={{ width: `${Math.min(100, rateRDV)}%` }}></div>
                  </div>
              </div>
              
              {/* Projection */}
              <div className="space-y-2 border-t md:border-t-0 md:border-l border-gray-100 dark:border-capi-dark-700 pt-4 md:pt-0 md:pl-8">
                   <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                      <Calendar size={14}/> Projection Fin de Mois
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                      Au rythme actuel, tu atteindras <span className="text-gray-900 dark:text-white bg-gray-100 dark:bg-capi-dark-700 px-2 rounded">{projRDV}</span> RDV sur {targetRDV} prévus.
                  </div>
              </div>

              {/* Écart */}
              <div className="space-y-2 border-t md:border-t-0 md:border-l border-gray-100 dark:border-capi-dark-700 pt-4 md:pt-0 md:pl-8">
                   <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                      <Target size={14}/> Levier Prioritaire
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {gapRDV > 0 
                        ? <span className="text-orange-500">Il te manque {gapRDV} RDV.</span>
                        : <span className="text-green-500">Tu es en avance de {Math.abs(gapRDV)} RDV !</span>
                      }
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                      {actualActions === 0 ? "L'urgence est de lancer la machine." : rateActions < 50 ? "L'augmentation du volume est la clé." : "La conversion doit être ta priorité."}
                  </p>
              </div>
          </div>
      </div>

      {/* SECTION 2: CONSEIL DU COACH */}
      <div className={`rounded-3xl border-2 overflow-hidden shadow-lg relative transition-all duration-500 ${themeColors.border} ${themeColors.bg}`}>
          
          {/* Header Card */}
          <div className="p-8 pb-6 border-b border-black/5 dark:border-white/5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl backdrop-blur-sm shadow-sm bg-white dark:bg-black/20 ${themeColors.icon}`}>
                          <DiagnosisIcon size={28} />
                      </div>
                      <div>
                          <div className={`text-[10px] font-black uppercase tracking-widest opacity-70 ${themeColors.text}`}>Conseil Stratégique</div>
                          <h3 className={`text-2xl font-black ${themeColors.text}`}>{advice.title}</h3>
                      </div>
                  </div>
                  <div className={`px-3 py-1 rounded-lg backdrop-blur-sm text-xs font-bold uppercase tracking-wider bg-white/50 dark:bg-black/20 ${themeColors.text}`}>
                      {advice.level === 'critical' ? 'Urgence' : advice.level === 'warning' ? 'Attention' : advice.level === 'success' ? 'Top' : 'Info'}
                  </div>
              </div>

              <div className="space-y-6">
                  <div className="bg-white/60 dark:bg-black/10 p-4 rounded-xl backdrop-blur-sm border border-white/40 dark:border-white/5">
                      <div className={`text-xs font-bold uppercase tracking-wide mb-1 opacity-70 ${themeColors.text}`}>🔎 Constat</div>
                      <p className={`font-bold text-lg leading-tight ${themeColors.text}`}>{advice.constat}</p>
                  </div>
                  
                  <div>
                      <div className={`text-xs font-bold uppercase tracking-wide mb-1 opacity-70 ${themeColors.text}`}>🧠 Lecture Stratégique</div>
                      <p className={`font-medium text-base leading-relaxed opacity-90 ${themeColors.text}`}>{advice.strategie}</p>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white dark:bg-capi-dark-800 rounded-xl shadow-sm border border-white/50 dark:border-gray-700">
                       <div className={`p-2 rounded-lg bg-black text-white dark:bg-white dark:text-black shrink-0 mt-0.5`}>
                          <Sparkles size={18} />
                       </div>
                       <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">🚀 Action Prioritaire</div>
                          <div className="font-bold text-gray-900 dark:text-white text-lg">{advice.action}</div>
                       </div>
                  </div>
              </div>
          </div>

          {/* Citation & CTAs */}
          <div className="p-8 bg-white/40 dark:bg-black/10 backdrop-blur-sm">
             
             {/* Citation */}
             <div className="mb-8 text-center px-4 md:px-12">
                <Quote size={24} className={`mx-auto mb-2 opacity-30 ${themeColors.icon}`} />
                <p className={`font-medium italic text-lg opacity-80 ${themeColors.text}`}>
                   {randomCitation}
                </p>
             </div>

             {/* Contextual CTAs */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {advice.ctas.map((cta, idx) => (
                    <button 
                      key={idx}
                      className="group flex items-center justify-between p-4 bg-white dark:bg-capi-dark-800 border border-gray-200 dark:border-capi-dark-700 hover:border-capi-blue-400 dark:hover:border-capi-blue-500 rounded-xl shadow-sm transition-all hover:scale-[1.02] text-left"
                    >
                       <span className="font-bold text-gray-700 dark:text-gray-200 text-sm group-hover:text-capi-blue-600 dark:group-hover:text-capi-blue-400">{cta}</span>
                       <div className="p-1.5 bg-gray-50 dark:bg-capi-dark-700 rounded-full group-hover:bg-capi-blue-50 dark:group-hover:bg-capi-blue-900 transition-colors">
                          <ArrowRight size={16} className="text-gray-400 group-hover:text-capi-blue-600 dark:group-hover:text-capi-blue-400" />
                       </div>
                    </button>
                ))}
             </div>
          </div>
      </div>

      {/* SECTION 3: MICRO-OBJECTIFS */}
      <div className="bg-white dark:bg-capi-dark-800 rounded-3xl p-8 border border-gray-200 dark:border-capi-dark-700 shadow-sm">
           <div className="flex items-center gap-2 mb-6">
              <Footprints size={24} className="text-capi-blue-600" />
              <h3 className="font-bold text-gray-900 dark:text-white uppercase text-sm tracking-wide">🎯 Objectif Aujourd'hui</h3>
           </div>
           <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Choisis ton niveau d'intensité pour la journée. L'important est de ne pas rester à zéro.
           </p>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Minimum */}
              <div className="p-5 bg-gray-50 dark:bg-capi-dark-900 rounded-2xl border border-gray-100 dark:border-capi-dark-700 text-center hover:border-gray-300 transition-colors cursor-pointer group">
                 <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-hover:text-gray-600 dark:group-hover:text-gray-300">Minimum Vital</div>
                 <div className="text-4xl font-black text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-colors">{dailyTargetMin}</div>
                 <div className="text-xs text-gray-400 font-medium mt-1">actions</div>
              </div>

              {/* Standard */}
              <div className="p-5 bg-capi-blue-50 dark:bg-capi-blue-900/10 rounded-2xl border-2 border-capi-blue-200 dark:border-capi-blue-800 text-center relative shadow-sm hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-capi-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Recommandé</div>
                 <div className="text-xs font-bold text-capi-blue-600 dark:text-capi-blue-400 uppercase tracking-widest mb-2 mt-2">Cible Standard</div>
                 <div className="text-5xl font-black text-capi-blue-700 dark:text-white">{dailyTargetStandard}</div>
                 <div className="text-xs text-capi-blue-500 dark:text-capi-blue-300 font-medium mt-1">actions</div>
              </div>

              {/* Challenge */}
              <div className="p-5 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800 text-center hover:border-purple-300 transition-colors cursor-pointer group">
                 <div className="flex justify-center items-center gap-1 text-xs font-bold text-purple-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 uppercase tracking-widest mb-2">
                    Challenge <Flame size={12}/>
                 </div>
                 <div className="text-4xl font-black text-purple-300 group-hover:text-purple-700 dark:group-hover:text-white transition-colors">{dailyTargetChallenge}</div>
                 <div className="text-xs text-purple-400 font-medium mt-1">actions</div>
              </div>
           </div>
      </div>

    </div>
  );
};