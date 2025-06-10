"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Euro, TrendingUp, TrendingDown, Filter, Download, Printer, Users, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/dashboard/StatCard';
import { 
  LineChart, 
  Line, 
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

// Types pour les statistiques
interface StatItem {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
}

// Les statistiques seront générées dynamiquement en fonction de l'entreprise connectée
const getStats = (company: any): StatItem[] => [
  { label: "Flux du Montant Financé", value: `${company?.stats?.montantTotal?.toLocaleString() || 0} GNF`, icon: <Euro />, accent: "bg-blue-600" },
  { label: "Montant total debloqué ce mois ci", value: company?.stats?.montantDebloque || 0, icon: <TrendingUp />, accent: "bg-green-600" },
  { label: "Montant à rembourser ce mois ci", value: company?.stats?.montantRembourser || 0, icon: <TrendingDown />, accent: "bg-red-600" },
  { label: "Date limite de Remboursement", value: company?.stats?.dateLimiteRemboursement || 0, icon: <Calendar />, accent: "bg-amber-600" },
];

// Données fictives pour les finances (utilisées si les données de l'entreprise ne sont pas disponibles)
const transactionsData = [
  { 
    id: 1, 
    date: "02/05/2025", 
    description: "Paiement client XYZ", 
    montant: 2500, 
    type: "Revenu", 
    categorie: "Vente de services",
    statut: "Complété"
  },
  { 
    id: 2, 
    date: "30/04/2025", 
    description: "Achat matériel informatique", 
    montant: -1200, 
    type: "Dépense", 
    categorie: "Équipement",
    statut: "Complété"
  },
  { 
    id: 3, 
    date: "28/04/2025", 
    description: "Paiement client ABC", 
    montant: 1800, 
    type: "Revenu", 
    categorie: "Vente de services",
    statut: "Complété"
  },
  { 
    id: 4, 
    date: "25/04/2025", 
    description: "Salaires employés", 
    montant: -8500, 
    type: "Dépense", 
    categorie: "Salaires",
    statut: "Complété"
  },
  { 
    id: 5, 
    date: "20/04/2025", 
    description: "Loyer bureau", 
    montant: -2000, 
    type: "Dépense", 
    categorie: "Loyer",
    statut: "Complété"
  },
  { 
    id: 6, 
    date: "15/04/2025", 
    description: "Paiement client DEF", 
    montant: 3200, 
    type: "Revenu", 
    categorie: "Vente de services",
    statut: "Complété"
  },
  { 
    id: 7, 
    date: "10/04/2025", 
    description: "Facture électricité", 
    montant: -350, 
    type: "Dépense", 
    categorie: "Charges",
    statut: "Complété"
  },
  { 
    id: 8, 
    date: "05/04/2025", 
    description: "Paiement client GHI", 
    montant: 1500, 
    type: "Revenu", 
    categorie: "Vente de services",
    statut: "Complété"
  }
];

// Statistiques financières
const stats = [
  { label: "Revenus (mois)", value: "9 000 GNF", icon: <TrendingUp />, accent: "bg-green-600" },
  { label: "Dépenses (mois)", value: "12 050 GNF", icon: <TrendingDown />, accent: "bg-red-600" },
  { label: "Balance", value: "-3 050 GNF", icon: <Euro />, accent: "bg-amber-600" },
  { label: "Prévisions", value: "+15%", icon: <TrendingUp />, accent: "bg-blue-600" },
];

const statsPerService = [
  { label: "Avance sur Salaire", value: "9 000 GNF", icon: <TrendingUp />, accent: "bg-green-600" },
  { label: "P2P", value: "12 050 GNF", icon: <TrendingUp />, accent: "bg-red-600" },
  { label: "Gestion et Conseil Financier", value: "Gratuit", icon: <TrendingUp />, accent: "bg-amber-600" },
  { label: "Paiement de Salaire", value: "20 000 GNF", icon: <TrendingUp />, accent: "bg-blue-600" },
];
// Données pour le graphique d'évolution
const evolutionData = [
  { mois: 'Jan', revenus: 8000, depenses: 6000 },
  { mois: 'Fév', revenus: 7500, depenses: 7000 },
  { mois: 'Mar', revenus: 9500, depenses: 8000 },
  { mois: 'Avr', revenus: 9000, depenses: 12050 },
  { mois: 'Mai', revenus: 11000, depenses: 9000 },
  { mois: 'Juin', revenus: 12500, depenses: 10000 },
];

// Données pour le graphique de répartition des dépenses
const depensesData = [
  { name: 'Salaires', value: 8500, color: '#3b82f6' },
  { name: 'Loyer', value: 2000, color: '#10b981' },
  { name: 'Équipement', value: 1200, color: '#f59e0b' },
  { name: 'Charges', value: 350, color: '#ef4444' },
];

// Formatter pour les montants en euros
const euroFormatter = (value: number) => `${value.toLocaleString()} GNF`;

export default function FinancesPage() {
  // const { isAuthenticated, currentCompany } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Créer la référence en dehors des hooks
  const hasFinishedLoading = React.useRef(false);
  
  // Rediriger vers la page de login si l'utilisateur n'est pas authentifié
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [isAuthenticated, router]);
  
  // // Mettre fin au chargement quand l'entreprise est chargée
  // useEffect(() => {
  //   if (currentCompany && !hasFinishedLoading.current) {
  //     hasFinishedLoading.current = true;
  //     setLoading(false);
  //   }
  // }, [currentCompany]);
  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Chargement des données financières...</p>
      </div>
    );
  }
  
  // Générer les statistiques pour l'entreprise connectée
  // const stats = getStats(currentCompany);
  
  // Utiliser les données de l'entreprise pour les graphiques si disponibles
  // const avancesData = currentCompany?.financeData?.avances || evolutionData;
  // const repartitionData = currentCompany?.financeData?.repartition || depensesData;
  
  return (
    <div className="flex flex-col gap-6 py-4">
      <h1 className="text-2xl font-bold text-[var(--zalama-text)]">Finances</h1>
      {/* <p className="text-[var(--zalama-text)]/70 mb-4">Entreprise: {currentCompany?.name}</p> */}
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      
      {/* Statistiques par service */}
      <h2 className="text-lg font-semibold text-[var(--zalama-text)] underline">Details Par Service</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6">
        {statsPerService.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      
      {/* Barre d&apos;actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-2">
        <div className="flex gap-2">
          <div className="relative">
            <input 
              type="month" 
              defaultValue="2025-05"
              className="pl-4 pr-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)] w-full sm:w-48"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]">
            <Filter className="h-4 w-4" />
            <span>Filtres</span>
          </button>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]">
            <Printer className="h-4 w-4" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>
      
      {/* Tableau des transactions */}
      <div className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] overflow-hidden mt-2">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]">
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text)]/70 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text)]/70 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text)]/70 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text)]/70 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--zalama-text)]/70 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--zalama-text)]/70 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--zalama-border)]">
              {transactionsData.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-[var(--zalama-bg-light)]/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[var(--zalama-text)]">{transaction.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[var(--zalama-text)]">{transaction.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[var(--zalama-text)]">{transaction.categorie}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {transaction.type === 'Revenu' ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <span className="text-sm text-[var(--zalama-text)]">{transaction.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm font-medium ${
                      transaction.montant > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {transaction.montant > 0 ? '+' : ''}{transaction.montant} GNF
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.statut === 'Complété' 
                        ? 'bg-green-100 text-green-800' 
                        : transaction.statut === 'En attente' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-[var(--zalama-border)]">
          <div className="text-sm text-[var(--zalama-text)]/70">
            Affichage de 1 à 8 sur 24 transactions
          </div>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]">
              Précédent
            </button>
            <button className="px-3 py-1 rounded border border-[var(--zalama-border)] bg-[var(--zalama-blue)] text-white">
              1
            </button>
            <button className="px-3 py-1 rounded border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]">
              2
            </button>
            <button className="px-3 py-1 rounded border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]">
              3
            </button>
            <button className="px-3 py-1 rounded border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
