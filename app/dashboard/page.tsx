"use client";

import React, { useEffect, useState } from 'react';
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
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types pour les données
interface Partenaire {
  id: string;
  nom: string;
  secteur: string;
  employeesCount: number;
  logo: string;
  datePartenariat: any; // Timestamp ou Date
  actif: boolean;
  adresse: string;
  dateCreation: any;
  description: string;
  email: string;
}

interface DashboardStats {
  totalEmployes: number;
  employesInscrits: number;
  demandesTotal: number;
  demandesMoyenne: number;
  noteEmployes: number;
  montantDebloque: number;
  montantARembourser: number;
  tauxRemboursement: number;
  limiteRemboursement: string;
  joursAvantRemboursement: number;
  dateLimiteRemboursement: string;
}

interface SalaryAdvanceRequest {
  id: string;
  montantTotal: number;
  motif: string;
  statut: string;
  dateCreation: any; // Timestamp ou Date
  entrepriseId: string;
  employeId?: string;
  email?: string;
}

// Fonction pour formater les montants
const fraFormatter = (value: number) => `${value.toLocaleString()} GNF`;

// Fonction pour calculer les jours restants avant une date
const calculateDaysUntil = (date: string): number => {
  const today = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

export default function EntrepriseDashboardPage() {
  const { user, loading, isAdmin, isRH } = useAuth();
  const router = useRouter();
  
  // États pour stocker les données
  const [currentPartenaire, setCurrentPartenaire] = useState<Partenaire | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [demandesEvolution, setDemandesEvolution] = useState<any[]>([]);
  const [montantsEvolution, setMontantsEvolution] = useState<any[]>([]);
  const [motifsDemandes, setMotifsDemandes] = useState<any[]>([]);
  const [alertesRecentes, setAlertesRecentes] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Référence pour le message de bienvenue
  const hasShownWelcome = React.useRef(false);

  // Rediriger vers la page de login si non authentifié
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Récupérer les données Firebase
  useEffect(() => {
    const fetchData = async () => {
      if (loading || !user) return;
      
      try {
        setDataLoading(true);

        // Récupérer les données de l'utilisateur connecté
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          throw new Error('Utilisateur non trouvé');
        }
        const userData = userDoc.data();
        const partenaireId = userData.partenaireId;

        if (!partenaireId) {
          throw new Error('Aucun partenaire associé à cet utilisateur');
        }

        // Récupérer les données du partenaire
        const partenaireDoc = await getDoc(doc(db, 'partenaires', partenaireId));
        if (partenaireDoc.exists()) {
          const partenaireData = partenaireDoc.data();
          const partenaire: Partenaire = {
            id: partenaireDoc.id,
            nom: partenaireData.nom || 'Partenaire',
            secteur: partenaireData.secteur || 'Secteur non spécifié',
            employeesCount: partenaireData.employeesCount || 0,
            logo: partenaireData.logo || '/images/logos/default.svg',
            datePartenariat: partenaireData.datePartenariat || new Date(),
            actif: partenaireData.actif ?? true,
            adresse: partenaireData.adresse || 'Adresse non spécifiée',
            dateCreation: partenaireData.dateCreation || new Date(),
            description: partenaireData.description || 'Description non spécifiée',
            email: partenaireData.email || 'Email non spécifié',
            
          };
          setCurrentPartenaire(partenaire);
        } else {
          throw new Error('Partenaire non trouvé');
        }

        // Récupérer les employés de l'entreprise
        const usersQuery = query(
          collection(db, 'employes'),
          where('partenaireId', '==', partenaireId)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const employees = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(employees);
        const totalEmployes = employees.length;
        
        const employesInscrits = employees.length;

        // Récupérer les demandes d'avance de salaire
        const requestsQuery = query(
          collection(db, 'salary_advance_requests'),
          where('entrepriseId', '==', partenaireId)
        );
        const requestsSnapshot = await getDocs(requestsQuery);
        const validRequests: SalaryAdvanceRequest[] = requestsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as SalaryAdvanceRequest));

        // Calculer les statistiques
        const demandesTotal = validRequests.length;
        const demandesMoyenne = totalEmployes > 0 ? parseFloat((demandesTotal / totalEmployes).toFixed(1)) : 0;
        const montantDebloque = validRequests.reduce((sum, req) => sum + (req.montantTotal || 0), 0);
        const montantARembourser = validRequests
          .filter(req => req.statut === 'approuve')
          .reduce((sum, req) => sum + (req.montantTotal || 0), 0);
        const tauxRemboursement = 97.5; // À calculer si données disponibles
        const noteEmployes = 4.5; // À calculer si données disponibles
        const limiteRemboursement = '30/06/2025'; // À ajuster
        const joursAvantRemboursement = calculateDaysUntil(limiteRemboursement);
        const dateLimiteRemboursement = limiteRemboursement;

        setDashboardStats({
          totalEmployes,
          employesInscrits,
          demandesTotal,
          demandesMoyenne,
          montantDebloque,
          montantARembourser,
          tauxRemboursement,
          noteEmployes,
          limiteRemboursement,
          joursAvantRemboursement,
          dateLimiteRemboursement,
        });

        // Préparer les données pour l'évolution des demandes
        const demandesByMonth: { [key: string]: number } = {};
        validRequests.forEach(req => {
          const date = new Date(req.dateCreation.toDate());
          const month = date.toLocaleString('fr-FR', { month: 'short' });
          demandesByMonth[month] = (demandesByMonth[month] || 0) + 1;
        });
        const demandesEvolutionData = Object.entries(demandesByMonth).map(([mois, demandes]) => ({
          mois,
          demandes,
        }));
        setDemandesEvolution(demandesEvolutionData);

        // Préparer les données pour l'évolution des montants
        const montantsByMonth: { [key: string]: number } = {};
        validRequests.forEach(req => {
          const date = new Date(req.dateCreation.toDate());
          const month = date.toLocaleString('fr-FR', { month: 'short' });
          montantsByMonth[month] = (montantsByMonth[month] || 0) + (req.montantTotal || 0);
        });
        const montantsEvolutionData = Object.entries(montantsByMonth).map(([mois, montant]) => ({
          mois,
          montant,
        }));
        setMontantsEvolution(montantsEvolutionData);

        // Préparer les données pour la répartition par motifs
        const motifsCount: { [key: string]: number } = {};
        validRequests.forEach(req => {
          const motif = req.motif || 'Autres';
          motifsCount[motif] = (motifsCount[motif] || 0) + (req.montantTotal || 0);
        });
        const totalMotifs = Object.values(motifsCount).reduce((sum, montant) => sum + montant, 0);
        const motifsData = Object.entries(motifsCount).map(([motif, montant], index) => ({
          motif,
          valeur: totalMotifs > 0 ? (montant / totalMotifs) * 100 : 0,
          color: `hsl(${index * 45}, 70%, 50%)`,
        }));
        setMotifsDemandes(motifsData);

        // Générer des alertes récentes
        const recentRequests = validRequests
          .sort((a, b) => b.dateCreation.toDate().getTime() - a.dateCreation.toDate().getTime())
          .slice(0, 3)
          .map((req, index) => ({
            id: index + 1,
            titre: `Nouvelle demande`,
            description: `Demande de ${req.montantTotal} GNF pour ${req.motif}`,
            date: req.dateCreation.toDate().toLocaleDateString('fr-FR'),
            type: req.statut === 'approuve' ? 'success' : 'info',
          }));
        setAlertesRecentes(recentRequests);

        // Afficher le message de bienvenue
        if (!hasShownWelcome.current && currentPartenaire) {
          hasShownWelcome.current = true;
          toast.success(`Bienvenue sur le tableau de bord de ${currentPartenaire.nom}`, {
            id: 'dashboard-welcome',
          });
        }

      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user, loading, isAdmin, isRH, router]);

  // États de chargement
  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || (!isAdmin && !isRH) || !currentPartenaire || !dashboardStats) {
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

  // Rendu du tableau de bord pour RH
  return (
    <div className="dashboard-container px-6 py-4">
      {/* En-tête avec les informations du partenaire */}
      <div className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="h-16 w-16 relative mr-4 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
              <Image 
                src={currentPartenaire.logo} 
                alt={`${currentPartenaire.nom} logo`}
                fill
                className="object-contain p-2"
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[var(--zalama-text)]">
                {currentPartenaire.nom} ({dashboardStats.employesInscrits} employés)
              </h2>
              <p className="text-sm text-[var(--zalama-text)]/70">
                {currentPartenaire.secteur}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[var(--zalama-blue)]/10 text-[var(--zalama-blue)] text-sm font-medium px-3 py-1 rounded-full flex items-center">
              <Building2 className="h-4 w-4 mr-1" />
              Partenaire depuis {(() => {
                try {
                  if (currentPartenaire.datePartenariat && typeof currentPartenaire.datePartenariat.toDate === 'function') {
                    return new Date(currentPartenaire.datePartenariat.toDate()).getFullYear();
                  } else {
                    return new Date(currentPartenaire.datePartenariat).getFullYear();
                  }
                } catch (e) {
                  return new Date().getFullYear();
                }
              })()}
            </div>
            <div className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
              {currentPartenaire.actif ? 'Compte actif' : 'Compte inactif'}
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques générales */}
      <div className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Employés inscrits" 
            value={`${dashboardStats.employesInscrits}/${dashboardStats.totalEmployes}`} 
            icon={<Users />} 
            accent="bg-blue-600" 
          />
          <StatCard 
            label="Demandes totales" 
            value={dashboardStats.demandesTotal} 
            icon={<FileText />} 
            accent="bg-purple-600" 
          />
          <StatCard 
            label="Demandes par employé" 
            value={dashboardStats.demandesMoyenne.toFixed(1)} 
            icon={<BarChart2 />} 
            accent="bg-amber-600" 
          />
          <StatCard 
            label="Note moyenne" 
            value={`${dashboardStats.noteEmployes}/5`} 
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
            value={`${dashboardStats.montantDebloque.toLocaleString()} GNF`} 
            icon={<CreditCard />} 
            accent="bg-blue-600" 
          />
          <StatCard 
            label="À rembourser ce mois" 
            value={`${dashboardStats.montantARembourser.toLocaleString()} GNF`} 
            icon={<Clock />} 
            accent="bg-amber-600" 
          />
          <StatCard 
            label="Taux de remboursement" 
            value={`${dashboardStats.tauxRemboursement}%`} 
            icon={<BarChart2 />} 
            accent="bg-green-600" 
          />
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-[var(--zalama-text)]/80">Date limite de remboursement</h3>
                <p className="text-2xl font-bold text-[var(--zalama-text)]">{dashboardStats.dateLimiteRemboursement}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-[var(--zalama-bg-light)] rounded-lg p-4 border border-[var(--zalama-border)]">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-[var(--zalama-text)]/80">Jours restants avant remboursement</h3>
                <p className="text-2xl font-bold text-[var(--zalama-text)]">{dashboardStats.joursAvantRemboursement} jours</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${dashboardStats.joursAvantRemboursement <= 3 ? 'bg-red-500' : dashboardStats.joursAvantRemboursement <= 7 ? 'bg-amber-500' : 'bg-green-500'}`} 
                  style={{ width: `${100 - Math.min(100, (dashboardStats.joursAvantRemboursement / 30) * 100)}%` }}
                ></div>
              </div>
              <p className="text-xs mt-1 text-[var(--zalama-text)]/70">
                {dashboardStats.joursAvantRemboursement <= 3 
                  ? 'Remboursement imminent!' 
                  : dashboardStats.joursAvantRemboursement <= 7 
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
                  <YAxis stroke="var(--zalama-text)" tickFormatter={fraFormatter} />
                  <Tooltip 
                    formatter={(value) => [`${Number(value).toLocaleString()} GNF`, 'Montant']}
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
                    label={({ motif, percent }) => `${motif}: ${(percent).toFixed(0)}%`}
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
                    {alerte.type === 'success' && <AlertCircle className="h-5 w-5 text-[var(--zalama-green)]" />}
                    {alerte.type === 'info' && <AlertCircle className="h-5 w-5 text-[var(--zalama-blue)]" />}
                    {alerte.type === 'warning' && <AlertCircle className="h-5 w-5 text-[var(--zalama-amber)]" />}
                    {alerte.type === 'error' && <AlertCircle className="h-5 w-5 text-[var(--zalama-red)]" />}
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
              <h3 className="text-sm font-medium text-[var(--zalama-text)]">Relevé mensuel - Juin 2025</h3>
              <p className="text-xs text-[var(--zalama-text)]/70">PDF - 1.2 MB</p>
            </div>
          </div>
          {/* Ajouter d'autres documents si nécessaire */}
        </div>
      </div>
    </div>
  );
}