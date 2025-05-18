"use client";

import React, { useEffect } from 'react';
import { Users, FileText, Star, BarChart2, CreditCard, Clock, AlertCircle, Download, Building2 } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';






// Données fictives pour les statistiques générales
const statsData = {
  'entreprise-xyz': {
    totalEmployes: 248,
    employesInscrits: 187,
    demandesTotal: 423,
    demandesMoyenne: 2.3,
    noteEmployes: 4.7,
    montantDebloque: 245000,
    montantARembourser: 18500,
    tauxRemboursement: 97.5
  },
  'tech-solutions': {
    totalEmployes: 124,
    employesInscrits: 98,
    demandesTotal: 215,
    demandesMoyenne: 2.2,
    noteEmployes: 4.5,
    montantDebloque: 120000,
    montantARembourser: 9500,
    tauxRemboursement: 98.2
  },
  'global-finance': {
    totalEmployes: 312,
    employesInscrits: 275,
    demandesTotal: 682,
    demandesMoyenne: 2.5,
    noteEmployes: 4.8,
    montantDebloque: 380000,
    montantARembourser: 28000,
    tauxRemboursement: 99.1
  }
};

// Données fictives pour l'évolution des demandes
const demandesEvolutionData = {
  'entreprise-xyz': [
    { mois: 'Jan', demandes: 42 },
    { mois: 'Fév', demandes: 38 },
    { mois: 'Mar', demandes: 45 },
    { mois: 'Avr', demandes: 52 },
    { mois: 'Mai', demandes: 48 },
  ],
  'tech-solutions': [
    { mois: 'Jan', demandes: 25 },
    { mois: 'Fév', demandes: 22 },
    { mois: 'Mar', demandes: 28 },
    { mois: 'Avr', demandes: 30 },
    { mois: 'Mai', demandes: 32 },
  ],
  'global-finance': [
    { mois: 'Jan', demandes: 65 },
    { mois: 'Fév', demandes: 72 },
    { mois: 'Mar', demandes: 68 },
    { mois: 'Avr', demandes: 75 },
    { mois: 'Mai', demandes: 82 },
  ]
};

// Données fictives pour l'évolution des montants débloqués
const montantsEvolutionData = {
  'entreprise-xyz': [
    { mois: 'Jan', montant: 42000 },
    { mois: 'Fév', montant: 38000 },
    { mois: 'Mar', montant: 45000 },
    { mois: 'Avr', montant: 52000 },
    { mois: 'Mai', montant: 48000 },
  ],
  'tech-solutions': [
    { mois: 'Jan', montant: 22000 },
    { mois: 'Fév', montant: 18000 },
    { mois: 'Mar', montant: 25000 },
    { mois: 'Avr', montant: 28000 },
    { mois: 'Mai', montant: 27000 },
  ],
  'global-finance': [
    { mois: 'Jan', montant: 65000 },
    { mois: 'Fév', montant: 72000 },
    { mois: 'Mar', montant: 68000 },
    { mois: 'Avr', montant: 75000 },
    { mois: 'Mai', montant: 82000 },
  ]
};

// Données fictives pour la répartition par motifs de demande
const repartitionMotifsData = {
  'entreprise-xyz': [
    { motif: 'Loyer', valeur: 32, color: `hsl(${0 * 45}, 70%, 50%)` },
    { motif: 'Maladie', valeur: 25, color: `hsl(${1 * 45}, 70%, 50%)` },
    { motif: 'Éducation', valeur: 18, color: `hsl(${2 * 45}, 70%, 50%)` },
    { motif: 'Urgence familiale', valeur: 15, color: `hsl(${3 * 45}, 70%, 50%)` },
    { motif: 'Alimentation', valeur: 10, color: `hsl(${4 * 45}, 70%, 50%)` },
    { motif: 'Autres', valeur: 5, color: `hsl(${5 * 45}, 70%, 50%)` },
  ],
  'tech-solutions': [
    { motif: 'Loyer', valeur: 28, color: `hsl(${0 * 45}, 70%, 50%)` },
    { motif: 'Maladie', valeur: 22, color: `hsl(${1 * 45}, 70%, 50%)` },
    { motif: 'Éducation', valeur: 20, color: `hsl(${2 * 45}, 70%, 50%)` },
    { motif: 'Urgence familiale', valeur: 12, color: `hsl(${3 * 45}, 70%, 50%)` },
    { motif: 'Alimentation', valeur: 13, color: `hsl(${4 * 45}, 70%, 50%)` },
    { motif: 'Autres', valeur: 5, color: `hsl(${5 * 45}, 70%, 50%)` },
  ],
  'global-finance': [
    { motif: 'Loyer', valeur: 35, color: `hsl(${0 * 45}, 70%, 50%)` },
    { motif: 'Maladie', valeur: 20, color: `hsl(${1 * 45}, 70%, 50%)` },
    { motif: 'Éducation', valeur: 15, color: `hsl(${2 * 45}, 70%, 50%)` },
    { motif: 'Urgence familiale', valeur: 18, color: `hsl(${3 * 45}, 70%, 50%)` },
    { motif: 'Alimentation', valeur: 8, color: `hsl(${4 * 45}, 70%, 50%)` },
    { motif: 'Autres', valeur: 4, color: `hsl(${5 * 45}, 70%, 50%)` },
  ]
};

// Données fictives pour les alertes récentes
const alertesRecentesData = {
  'entreprise-xyz': [
    { id: 1, titre: "Dépassement de plafond", description: "Le plafond mensuel de demandes a été atteint", date: "02/05/2025", type: "warning" },
    { id: 2, titre: "Nouvelle demande", description: "Jean Dupont a soumis une nouvelle demande d'avance", date: "01/05/2025", type: "info" },
    { id: 3, titre: "Retard de paiement", description: "Échéance du 30/04 non honorée", date: "01/05/2025", type: "error" },
  ],
  'tech-solutions': [
    { id: 1, titre: "Nouvelle demande", description: "Marie Martin a soumis une nouvelle demande d'avance", date: "02/05/2025", type: "info" },
    { id: 2, titre: "Mise à jour contractuelle", description: "Nouveaux termes de service disponibles", date: "30/04/2025", type: "info" },
    { id: 3, titre: "Anomalie détectée", description: "Plusieurs demandes similaires en peu de temps", date: "28/04/2025", type: "warning" },
  ],
  'global-finance': [
    { id: 1, titre: "Dépassement de plafond", description: "Le plafond mensuel de demandes a été atteint", date: "02/05/2025", type: "warning" },
    { id: 2, titre: "Nouvelle demande", description: "Thomas Petit a soumis une nouvelle demande d'avance", date: "01/05/2025", type: "info" },
    { id: 3, titre: "Changement de statut", description: "5 nouveaux employés ont été activés", date: "30/04/2025", type: "success" },
  ]
};

// Fonction pour formatter les montants en euros
const euroFormatter = (value: number) => `${value.toLocaleString()} GNF`;

export default function EntrepriseDashboardPage() {
  const { isAuthenticated, currentCompany, currentPartenaire, userRole } = useAuth();
  const router = useRouter();
  
  // Créer la référence en dehors des hooks
  const hasShownWelcome = React.useRef(false);

  // Rediriger vers la page de login si l'utilisateur n'est pas authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Redirection vers la page de login');
      router.push('/login');
    }
  }, [isAuthenticated, router]);
  
  // Afficher un message de bienvenue adapté au type d'utilisateur
  useEffect(() => {
    if (isAuthenticated && !hasShownWelcome.current) {
      hasShownWelcome.current = true;
      
      if (userRole === 'admin' && currentCompany) {
        toast.success(`Bienvenue sur le tableau de bord de ${currentCompany.name}`, {
          id: 'dashboard-welcome'
        });
      } else if (userRole === 'rh' && currentPartenaire) {
        toast.success(`Bienvenue sur le tableau de bord de ${currentPartenaire.nom}`, {
          id: 'dashboard-welcome'
        });
      }
    }
  }, [currentCompany, currentPartenaire, isAuthenticated, userRole]);
  
  // Afficher un état de chargement si aucune donnée n'est disponible
  if ((userRole === 'admin' && !currentCompany) || (userRole === 'rh' && !currentPartenaire)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Adapter l'affichage en fonction du type d'utilisateur
  if (userRole === 'admin' && currentCompany) {
    // Utiliser les données de l'entreprise connectée
    const entrepriseData = {
      totalEmployes: currentCompany.stats.totalEmployes,
      employesInscrits: Math.round(currentCompany.stats.totalEmployes * 0.8),
      demandesTotal: currentCompany.stats.demandesMois * 12,
      demandesMoyenne: parseFloat((currentCompany.stats.demandesMois / currentCompany.stats.totalEmployes).toFixed(1)),
      noteEmployes: 4.5,
      montantDebloque: currentCompany.stats.montantTotal * 12,
      montantARembourser: currentCompany.stats.montantTotal * 0.1,
      tauxRemboursement: 97.5,
      limiteRemboursement: currentCompany.stats.limiteRemboursement,
      joursAvantRemboursement: currentCompany.stats.joursAvantRemboursement,
      dateLimiteRemboursement: currentCompany.stats.dateLimiteRemboursement
    };
    
    // Utiliser les données de l'entreprise pour les graphiques
    const demandesEvolution = currentCompany.financeData.demandes;
    const montantsEvolution = currentCompany.financeData.avances;
    
    // Utiliser les données de répartition par motifs
    const motifsDemandes = currentCompany.financeData.repartition.map((item, index) => ({
      motif: item.categorie,
      valeur: item.montant,
      color: `hsl(${index * 45}, 70%, 50%)`
    }));
    
    const alertesRecentes = currentCompany.alertes;

    return (
      <div className="dashboard-container px-6 py-4">
        
        {/* En-tête avec les informations de l'entreprise */}
        {currentCompany && (
          <div className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] p-6 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="h-16 w-16 relative mr-4 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                  <Image 
                    src={currentCompany.logo} 
                    alt={`${currentCompany.name} logo`}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--zalama-text)]">
                    {currentCompany.name}
                  </h2>
                  <p className="text-sm text-[var(--zalama-text)]/70">
                    {currentCompany.industry} • {currentCompany.employeesCount} employés
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-[var(--zalama-blue)]/10 text-[var(--zalama-blue)] text-sm font-medium px-3 py-1 rounded-full flex items-center">
                  <Building2 className="h-4 w-4 mr-1" />
                  Partenaire depuis {new Date(currentCompany.createdAt).getFullYear()}
                </div>
                <div className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  Compte actif
                </div>
              </div>
            </div>
            
            
            
          </div>
        )}
        
        {/* Statistiques générales */}
        <div className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Employés inscrits" 
              value={`${entrepriseData.employesInscrits}/${entrepriseData.totalEmployes}`} 
              icon={<Users />} 
              accent="bg-blue-600" 
            />
            <StatCard 
              label="Demandes totales" 
              value={entrepriseData.demandesTotal} 
              icon={<FileText />} 
              accent="bg-purple-600" 
            />
            <StatCard 
              label="Demandes par employé" 
              value={entrepriseData.demandesMoyenne.toFixed(1)} 
              icon={<BarChart2 />} 
              accent="bg-amber-600" 
            />
            <StatCard 
              label="Note moyenne" 
              value={`${entrepriseData.noteEmployes}/5`} 
              icon={<Star />} 
              accent="bg-green-600" 
            />
          </div>
        </div>
        
        {/* Performance financière */}
        <div className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Performance financière</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard 
              label="Montant total débloqué" 
              value={`${entrepriseData.montantDebloque.toLocaleString()} GNF`} 
              icon={<CreditCard />} 
              accent="bg-blue-600" 
            />
            <StatCard 
              label="À rembourser ce mois" 
              value={`${entrepriseData.montantARembourser.toLocaleString()} GNF`} 
              icon={<Clock />} 
              accent="bg-amber-600" 
            />
            <StatCard 
              label="Taux de remboursement" 
              value={`${entrepriseData.tauxRemboursement}%`} 
              icon={<BarChart2 />} 
              accent="bg-green-600" 
            />
          
          </div>
          {/* Informations de remboursement */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--zalama-text)]/80">Date limite de remboursement</h3>
                    <p className="text-2xl font-bold text-[var(--zalama-text)]">{entrepriseData.dateLimiteRemboursement}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                
              </div>
              
              <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--zalama-text)]/80">Jours Restants avant Remboursement </h3>
                    <p className="text-2xl font-bold text-[var(--zalama-text)]">{entrepriseData.joursAvantRemboursement} jours</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${entrepriseData.joursAvantRemboursement <= 3 ? 'bg-red-500' : entrepriseData.joursAvantRemboursement <= 7 ? 'bg-amber-500' : 'bg-green-500'}`} 
                      style={{ width: `${100 - Math.min(100, (entrepriseData.joursAvantRemboursement / 30) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs mt-1 text-[var(--zalama-text)]/70">
                    {entrepriseData.joursAvantRemboursement <= 3 
                      ? 'Remboursement imminent!' 
                      : entrepriseData.joursAvantRemboursement <= 7 
                        ? 'Remboursement cette semaine' 
                        : 'Remboursement à venir'}
                  </p>
                </div>
              </div>
            </div>
        </div>
        
        {/* Visualisations et Graphiques */}
        <div className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--zalama-text)] mb-4">Visualisations et Graphiques</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Évolution des demandes */}
            <div className="bg-[var(--zalama-bg-light)]/30 rounded-lg p-4">
              <h3 className="text-md font-medium text-[var(--zalama-text)] mb-3">Évolution des demandes</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={demandesEvolution}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--zalama-border)" />
                    <XAxis dataKey="mois" stroke="var(--zalama-text)" />
                    <YAxis stroke="var(--zalama-text)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--zalama-card)', 
                        borderColor: 'var(--zalama-border)' 
                      }}
                      labelStyle={{ color: 'var(--zalama-text)' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="demandes" stroke="var(--zalama-blue)" strokeWidth={2} activeDot={{ r: 8 }} name="Nombre de demandes" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Évolution des montants débloqués */}
            <div className="bg-[var(--zalama-bg-light)]/30 rounded-lg p-4">
              <h3 className="text-md font-medium text-[var(--zalama-text)] mb-3">Montants débloqués</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={montantsEvolution}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--zalama-border)" />
                    <XAxis dataKey="mois" stroke="var(--zalama-text)" />
                    <YAxis stroke="var(--zalama-text)" tickFormatter={euroFormatter} />
                    <Tooltip 
                      formatter={(value) => [`${value.toLocaleString()} GNF`, 'Montant']}
                      contentStyle={{ 
                        backgroundColor: 'var(--zalama-card)', 
                        borderColor: 'var(--zalama-border)' 
                      }}
                      labelStyle={{ color: 'var(--zalama-text)' }}
                    />
                    <Legend />
                    <Bar dataKey="montant" fill="var(--zalama-blue)" name="Montant débloqué" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Répartition par motifs de demande */}
            <div className="bg-[var(--zalama-bg-light)]/30 rounded-lg p-4">
              <h3 className="text-md font-medium text-[var(--zalama-text)] mb-3">Répartition par motifs</h3>
              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={motifsDemandes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="valeur"
                      nameKey="motif"
                      label={({ motif, percent }) => `${motif}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {motifsDemandes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--zalama-card)', 
                        borderColor: 'var(--zalama-border)' 
                      }}
                      labelStyle={{ color: 'var(--zalama-text)' }}
                    />
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center"
                      formatter={(value) => <span style={{ color: 'var(--zalama-text)' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Alertes récentes */}
            <div className="bg-[var(--zalama-bg-light)]/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-medium text-[var(--zalama-text)]">Alertes récentes</h3>
                <button className="text-sm text-[var(--zalama-blue)] hover:underline">Voir toutes</button>
              </div>
              <div className="space-y-3 h-72 overflow-y-auto pr-2">
                {alertesRecentes.map((alerte) => (
                  <div key={alerte.id} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--zalama-card)]">
                    <div className="flex-shrink-0 mt-1">
                      {alerte.type === 'warning' && <AlertCircle className="h-5 w-5 text-[var(--zalama-amber)]" />}
                      {alerte.type === 'info' && <AlertCircle className="h-5 w-5 text-[var(--zalama-blue)]" />}
                      {alerte.type === 'error' && <AlertCircle className="h-5 w-5 text-[var(--zalama-red)]" />}
                      {alerte.type === 'success' && <AlertCircle className="h-5 w-5 text-[var(--zalama-green)]" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[var(--zalama-text)]">{alerte.titre}</h3>
                      <p className="text-xs text-[var(--zalama-text)]/70 mt-1">{alerte.description}</p>
                      <div className="flex items-center mt-2 text-xs text-[var(--zalama-text)]/60">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{alerte.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Documents et rapports */}
        <div className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--zalama-text)]">Documents et rapports</h2>
            <button className="text-sm text-[var(--zalama-blue)] hover:underline flex items-center gap-1">
              <Download className="h-4 w-4" />
              Tout télécharger
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--zalama-bg-light)]/30 hover:bg-[var(--zalama-bg-light)]/50 transition-colors cursor-pointer">
              <Download className="h-5 w-5 text-[var(--zalama-blue)]" />
              <div>
                <h3 className="text-sm font-medium text-[var(--zalama-text)]">Relevé mensuel - Mai 2025</h3>
                <p className="text-xs text-[var(--zalama-text)]/70">PDF - 1.2 MB</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--zalama-bg-light)]/30 hover:bg-[var(--zalama-bg-light)]/50 transition-colors cursor-pointer">
              <Download className="h-5 w-5 text-[var(--zalama-blue)]" />
              <div>
                <h3 className="text-sm font-medium text-[var(--zalama-text)]">Rapport d&apos;activité - T1 2025</h3>
                <p className="text-xs text-[var(--zalama-text)]/70">PDF - 2.8 MB</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--zalama-bg-light)]/30 hover:bg-[var(--zalama-bg-light)]/50 transition-colors cursor-pointer">
              <Download className="h-5 w-5 text-[var(--zalama-blue)]" />
              <div>
                <h3 className="text-sm font-medium text-[var(--zalama-text)]">Échéancier de remboursement</h3>
                <p className="text-xs text-[var(--zalama-text)]/70">XLSX - 0.9 MB</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--zalama-bg-light)]/30 hover:bg-[var(--zalama-bg-light)]/50 transition-colors cursor-pointer">
              <Download className="h-5 w-5 text-[var(--zalama-blue)]" />
              <div>
                <h3 className="text-sm font-medium text-[var(--zalama-text)]">Statistiques utilisateurs</h3>
                <p className="text-xs text-[var(--zalama-text)]/70">XLSX - 1.5 MB</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--zalama-bg-light)]/30 hover:bg-[var(--zalama-bg-light)]/50 transition-colors cursor-pointer">
              <Download className="h-5 w-5 text-[var(--zalama-blue)]" />
              <div>
                <h3 className="text-sm font-medium text-[var(--zalama-text)]">Contrat de partenariat</h3>
                <p className="text-xs text-[var(--zalama-text)]/70">PDF - 3.2 MB</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--zalama-bg-light)]/30 hover:bg-[var(--zalama-bg-light)]/50 transition-colors cursor-pointer">
              <Download className="h-5 w-5 text-[var(--zalama-blue)]" />
              <div>
                <h3 className="text-sm font-medium text-[var(--zalama-text)]">Guide d&apos;utilisation</h3>
                <p className="text-xs text-[var(--zalama-text)]/70">PDF - 4.5 MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (userRole === 'rh' && currentPartenaire) {
    // Créer des données adaptées pour le partenaire
    const partenaireData = {
      totalEmployes: currentPartenaire.employeesCount || 0,
      employesInscrits: Math.round((currentPartenaire.employeesCount || 0) * 0.8),
      demandesTotal: 0, // À remplacer par les vraies données
      demandesMoyenne: 0, // À remplacer par les vraies données
      noteEmployes: 4.5, // Valeur par défaut
      montantDebloque: 0, // À remplacer par les vraies données
      montantARembourser: 0, // À remplacer par les vraies données
      tauxRemboursement: 97.5, // Valeur par défaut
      limiteRemboursement: 0, // À remplacer par les vraies données
      joursAvantRemboursement: 30, // Valeur par défaut
      dateLimiteRemboursement: "30/06/2025" // Valeur par défaut
    };
    
    // Données fictives pour les graphiques
    const demandesEvolution = demandesEvolutionData['entreprise-xyz'];
    const montantsEvolution = montantsEvolutionData['entreprise-xyz'];
    const motifsDemandes = repartitionMotifsData['entreprise-xyz'];
    const alertesRecentes = alertesRecentesData['entreprise-xyz'];

    return (
      <div className="dashboard-container px-6 py-4">
        {/* En-tête avec les informations du partenaire */}
        <div className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="h-16 w-16 relative mr-4 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                <Image 
                  src={currentPartenaire.logo || '/images/logos/default.svg'} 
                  alt={`${currentPartenaire.nom} logo`}
                  fill
                  className="object-contain p-2"
                />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[var(--zalama-text)]">
                  {currentPartenaire.nom}
                </h2>
                <p className="text-sm text-[var(--zalama-text)]/70">
                  {currentPartenaire.secteur} • {currentPartenaire.employeesCount || 0} employés
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-[var(--zalama-blue)]/10 text-[var(--zalama-blue)] text-sm font-medium px-3 py-1 rounded-full flex items-center">
                <Building2 className="h-4 w-4 mr-1" />
                Partenaire depuis {new Date(currentPartenaire.datePartenariat).getFullYear()}
              </div>
              <div className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                {currentPartenaire.actif ? "Compte actif" : "Compte inactif"}
              </div>
            </div>
          </div>
        </div>
        
        {/* Statistiques générales */}
        <div className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Employés inscrits" 
              value={`${partenaireData.employesInscrits}/${partenaireData.totalEmployes}`} 
              icon={<Users />} 
              accent="bg-blue-600" 
            />
            <StatCard 
              label="Demandes totales" 
              value={partenaireData.demandesTotal} 
              icon={<FileText />} 
              accent="bg-purple-600" 
            />
            <StatCard 
              label="Demandes par employé" 
              value={partenaireData.demandesMoyenne.toFixed(1)} 
              icon={<BarChart2 />} 
              accent="bg-amber-600" 
            />
            <StatCard 
              label="Note moyenne" 
              value={`${partenaireData.noteEmployes}/5`} 
              icon={<Star />} 
              accent="bg-green-600" 
            />
          </div>
        </div>
        
        {/* Reste du tableau de bord pour les RH */}
        {/* Vous pouvez adapter le reste du contenu pour les RH */}
      </div>
    );
  } else {
    // Cas où l'utilisateur est authentifié mais n'a pas de rôle valide
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Accès non autorisé ou données non disponibles</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retourner à la page de connexion
          </button>
        </div>
      </div>
    );
  }
}
