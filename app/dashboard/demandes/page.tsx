"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, CheckCircle, Clock, AlertCircle, Search, Filter, Calendar, Download, Plus, MoreHorizontal, User, Tag, MessageSquare, PlusSquare, MailWarning, DollarSign, SquaresExclude } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/dashboard/StatCard';

// Types de services disponibles
const serviceTypes = [
  { id: "avance-salaire", label: "Avance sur Salaire", icon: <PlusSquare className="h-4 w-4" /> },
  { id: "p2p", label: "P2P", icon: <SquaresExclude className="h-4 w-4" /> },
  { id: "conseil-financier", label: "Gestion et Conseil Financier", icon: <MailWarning className="h-4 w-4" /> },
  { id: "paiement-salaire", label: "Paiement de Salaire", icon: <DollarSign className="h-4 w-4" /> },
];

// Données fictives pour les demandes
const demandesData = [
  { 
    id: "DEM-2025-001", 
    titre: "Avance sur salaire pour frais médicaux", 
    description: "Demande d'avance de 1500€ pour couvrir des frais médicaux urgents", 
    date: "02/05/2025", 
    type: "Avance sur Salaire", 
    serviceId: "avance-salaire",
    montant: 1500,
    demandeur: "Jean Dupont",
    statut: "En attente",
    priorite: "Haute",
    commentaires: 2
  },
  { 
    id: "DEM-2025-002", 
    titre: "Paiement anticipé du salaire de mai", 
    description: "Demande de versement anticipé du salaire pour le mois de mai", 
    date: "30/04/2025", 
    type: "Paiement de Salaire", 
    serviceId: "paiement-salaire",
    montant: 2800,
    demandeur: "Sophie Martin",
    statut: "Approuvée",
    priorite: "Normale",
    commentaires: 3
  },
  { 
    id: "DEM-2025-003", 
    titre: "Prêt P2P pour projet personnel", 
    description: "Demande de prêt P2P de 5000€ pour financement d'un projet personnel", 
    date: "28/04/2025", 
    type: "P2P", 
    serviceId: "p2p",
    montant: 5000,
    demandeur: "Thomas Petit",
    statut: "En cours de traitement",
    priorite: "Normale",
    commentaires: 5
  },
  { 
    id: "DEM-2025-004", 
    titre: "Conseil pour optimisation fiscale", 
    description: "Demande de consultation pour optimiser la structure fiscale de mon entreprise", 
    date: "25/04/2025", 
    type: "Gestion et Conseil Financier", 
    serviceId: "conseil-financier",
    montant: null,
    demandeur: "Emma Leroy",
    statut: "Approuvée",
    priorite: "Normale",
    commentaires: 1
  },
  { 
    id: "DEM-2025-005", 
    titre: "Avance sur salaire pour déménagement", 
    description: "Demande d'avance de 2000€ pour couvrir les frais de déménagement", 
    date: "20/04/2025", 
    type: "Avance sur Salaire", 
    serviceId: "avance-salaire",
    montant: 2000,
    demandeur: "Lucas Moreau",
    statut: "Refusée",
    priorite: "Normale",
    commentaires: 4
  },
  { 
    id: "DEM-2025-006", 
    titre: "Paiement de prime exceptionnelle", 
    description: "Demande de versement de la prime exceptionnelle de fin de projet", 
    date: "18/04/2025", 
    type: "Paiement de Salaire", 
    serviceId: "paiement-salaire",
    montant: 1200,
    demandeur: "Chloé Dubois",
    statut: "Approuvée",
    priorite: "Urgente",
    commentaires: 2
  },
  { 
    id: "DEM-2025-007", 
    titre: "Prêt P2P pour formation", 
    description: "Demande de prêt P2P de 3500€ pour financer une formation professionnelle", 
    date: "15/04/2025", 
    type: "P2P", 
    serviceId: "p2p",
    montant: 3500,
    demandeur: "Antoine Bernard",
    statut: "En attente",
    priorite: "Haute",
    commentaires: 0
  },
  { 
    id: "DEM-2025-008", 
    titre: "Conseil pour investissements", 
    description: "Demande de conseil pour diversifier mes investissements professionnels", 
    date: "10/04/2025", 
    type: "Gestion et Conseil Financier", 
    serviceId: "conseil-financier",
    montant: null,
    demandeur: "Julie Robert",
    statut: "En cours de traitement",
    priorite: "Normale",
    commentaires: 6
  },
  { 
    id: "DEM-2025-009", 
    titre: "Avance sur salaire pour événement familial", 
    description: "Demande d'avance de 1000€ pour financer un mariage familial", 
    date: "08/04/2025", 
    type: "Avance sur Salaire", 
    serviceId: "avance-salaire",
    montant: 1000,
    demandeur: "Marc Lefebvre",
    statut: "Approuvée",
    priorite: "Normale",
    commentaires: 1
  },
  { 
    id: "DEM-2025-010", 
    titre: "Paiement des heures supplémentaires", 
    description: "Demande de versement des heures supplémentaires du mois d'avril", 
    date: "05/04/2025", 
    type: "Paiement de Salaire", 
    serviceId: "paiement-salaire",
    montant: 450,
    demandeur: "Sarah Nguyen",
    statut: "En attente",
    priorite: "Normale",
    commentaires: 2
  }
];

// Statistiques des demandes
const stats = [
  { label: "Total demandes", value: 42, icon: <FileText />, accent: "bg-blue-600" },
  { label: "Approuvées", value: 28, icon: <CheckCircle />, accent: "bg-green-600" },
  { label: "En attente", value: 8, icon: <Clock />, accent: "bg-amber-600" },
  { label: "Refusées", value: 6, icon: <AlertCircle />, accent: "bg-red-600" },
];
const statsPerTypes = [
  { label: "Avance sur Salaire", value: 10, icon: <PlusSquare />, accent: "bg-blue-600" },
  { label: "P2P", value: 6, icon: <SquaresExclude />, accent: "bg-blue-600" },
  { label: "Gestion et Conseil Financier", value: 12, icon: <MailWarning />, accent: "b-blue-600" },
  { label: "Payement de Salaire", value: 20, icon: <DollarSign />, accent: "bg-blue-600" },
]

export default function DemandesPage() {
 
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // Créer la référence en dehors des hooks
  const hasFinishedLoading = React.useRef(false);
  
  // Rediriger vers la page de login si l'utilisateur n'est pas authentifié
 
    // Rediriger vers la page de login si l'utilisateur n'est pas authentifié
    useEffect(() => {
      if (!loading && !user) {
        router.push('/login');
      }
    }, [user, loading, router]);
  
  // Gérer le clic en dehors du menu des filtres
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filtrer les demandes en fonction des filtres sélectionnés
  const filteredDemandes = demandesData.filter(demande => {
    // Filtre par terme de recherche
    const matchesSearch = searchTerm === '' || 
      demande.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.demandeur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre par service
    const matchesService = selectedService === null || demande.serviceId === selectedService;
    
    // Filtre par statut
    const matchesStatus = statusFilter === null || demande.statut === statusFilter;
    
    return matchesSearch && matchesService && matchesStatus;
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredDemandes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDemandes.slice(indexOfFirstItem, indexOfLastItem);
  
  // Fonction pour changer de page
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Scroll vers le haut de la page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Calculer les statistiques basées sur les demandes filtrées
  const filteredStats = [
    { 
      label: "Total demandes", 
      value: filteredDemandes.length, 
      icon: <FileText />, 
      accent: "bg-blue-600" 
    },
    { 
      label: "Approuvées", 
      value: filteredDemandes.filter(d => d.statut === 'Approuvée').length, 
      icon: <CheckCircle />, 
      accent: "bg-green-600" 
    },
    { 
      label: "En attente", 
      value: filteredDemandes.filter(d => d.statut === 'En attente').length, 
      icon: <Clock />, 
      accent: "bg-amber-600" 
    },
    { 
      label: "Refusées", 
      value: filteredDemandes.filter(d => d.statut === 'Refusée').length, 
      icon: <AlertCircle />, 
      accent: "bg-red-600" 
    },
  ];
  
  // Calculer les statistiques par type de service
  const filteredStatsPerTypes = serviceTypes.map(service => ({
    label: service.label,
    value: filteredDemandes.filter(d => d.serviceId === service.id).length,
    icon: service.icon,
    accent: "bg-blue-600"
  }));

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Chargement des demandes...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-[var(--zalama-text)]">Demandes</h1>
        {/* <p className="text-[var(--zalama-text)]/70">Entreprise: {currentCompany?.name}</p> */}
      
      {/* Statistiques */}
      <h2 className="text-xl font-bold text-[var(--zalama-text)] mt-2">Généralités sur les demandes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4">
        {filteredStats.map((stat, index) => (
          <StatCard 
            key={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            accent={stat.accent}
          />
        ))}
      </div>

      {/* Statistiques par type */}
      <h2 className="text-xl font-bold text-[var(--zalama-text)] mt-2">Détails par type de service</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4">
        {filteredStatsPerTypes.map((stat, index) => (
          <StatCard 
            key={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            accent={stat.accent}
          />
        ))}
      </div>
      
      {/* Barre d&apos;actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-2">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une demande..." 
              className="pl-10 pr-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)] w-full sm:w-64"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${selectedService || statusFilter ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]'}`}
            >
              <Filter className="h-4 w-4" />
              <span>Filtres {(selectedService || statusFilter) && '(actifs)'}</span>
            </button>
            
            {/* Menu des filtres */}
            {showFilterMenu && (
              <div 
                ref={filterMenuRef}
                className="absolute top-full left-0 mt-2 w-72 bg-[var(--zalama-card)] rounded-lg shadow-lg border border-[var(--zalama-border)] overflow-hidden z-10"
              >
                <div className="p-3 border-b border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/30">
                  <h3 className="text-sm font-medium text-[var(--zalama-text)]">Filtrer par service</h3>
                  <div className="mt-2 space-y-1">
                    <div 
                      onClick={() => setSelectedService(null)}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${selectedService === null ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-[var(--zalama-bg-light)]/50'}`}
                    >
                      <div className="w-4 h-4 flex-shrink-0"></div>
                      <span className="text-sm">Tous les services</span>
                    </div>
                    {serviceTypes.map((service) => (
                      <div 
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${selectedService === service.id ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-[var(--zalama-bg-light)]/50'}`}
                      >
                        <div className="w-4 h-4 flex-shrink-0">{service.icon}</div>
                        <span className="text-sm">{service.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-3 border-b border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/30">
                  <h3 className="text-sm font-medium text-[var(--zalama-text)]">Filtrer par statut</h3>
                  <div className="mt-2 space-y-1">
                    <div 
                      onClick={() => setStatusFilter(null)}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${statusFilter === null ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-[var(--zalama-bg-light)]/50'}`}
                    >
                      <span className="text-sm">Tous les statuts</span>
                    </div>
                    <div 
                      onClick={() => setStatusFilter('En attente')}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${statusFilter === 'En attente' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-[var(--zalama-bg-light)]/50'}`}
                    >
                      <Clock className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">En attente</span>
                    </div>
                    <div 
                      onClick={() => setStatusFilter('En cours de traitement')}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${statusFilter === 'En cours de traitement' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-[var(--zalama-bg-light)]/50'}`}
                    >
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">En cours de traitement</span>
                    </div>
                    <div 
                      onClick={() => setStatusFilter('Approuvée')}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${statusFilter === 'Approuvée' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-[var(--zalama-bg-light)]/50'}`}
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Approuvée</span>
                    </div>
                    <div 
                      onClick={() => setStatusFilter('Refusée')}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${statusFilter === 'Refusée' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-[var(--zalama-bg-light)]/50'}`}
                    >
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Refusée</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 flex justify-between">
                  <button 
                    onClick={() => {
                      setSelectedService(null);
                      setStatusFilter(null);
                    }}
                    className="text-sm text-[var(--zalama-text)]/70 hover:text-[var(--zalama-text)] transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                  <button 
                    onClick={() => setShowFilterMenu(false)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]">
            <Calendar className="h-4 w-4" />
            <span>Historique</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>
      
      {/* Liste des demandes */}
      <div className="space-y-4 mt-2">
        {filteredDemandes.length === 0 ? (
          <div className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] p-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <Search className="h-12 w-12 text-[var(--zalama-text)]/30 mb-4" />
              <h3 className="text-lg font-medium text-[var(--zalama-text)]">Aucune demande trouvée</h3>
              <p className="mt-1 text-sm text-[var(--zalama-text)]/70">
                Aucune demande ne correspond à vos critères de recherche ou de filtrage.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedService(null);
                  setStatusFilter(null);
                  setCurrentPage(1);
                }}
                className="mt-4 px-4 py-2 bg-[var(--zalama-blue)] text-white rounded-md"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        ) : (
          currentItems.map((demande) => (
            <div 
              key={demande.id} 
              className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-[var(--zalama-text)]">{demande.titre}</h3>
                        <span className="text-xs text-[var(--zalama-text)]/60">{demande.id}</span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--zalama-text)]/80">{demande.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                        demande.statut === 'En attente' 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' 
                          : demande.statut === 'Approuvée' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : demande.statut === 'Refusée'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {demande.statut}
                      </span>
                      <button className="p-1 rounded-full hover:bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]/70 hover:text-[var(--zalama-text)]">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--zalama-text)]/60">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      <span>{demande.demandeur}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{demande.date}</span>
                    </div>
                    <div className="flex items-center">
                      {serviceTypes.find(s => s.id === demande.serviceId)?.icon && (
                        <div className="mr-1">
                          {serviceTypes.find(s => s.id === demande.serviceId)?.icon}
                        </div>
                      )}
                      <span>{demande.type}</span>
                    </div>
                    {demande.montant !== null && (
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        <span>{demande.montant.toLocaleString()} €</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span>{demande.commentaires} commentaires</span>
                    </div>
                    <div className={`flex items-center px-2 py-0.5 rounded-full ${
                      demande.priorite === 'Urgente' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                        : demande.priorite === 'Haute' 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      <span>Priorité: {demande.priorite}</span>
                    </div>
                  </div>
                </div>
                <div className="flex md:flex-col gap-2 mt-3 md:mt-0">
                  <button className="flex-1 md:w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--zalama-blue)] text-white text-sm">
                    <CheckCircle className="h-3 w-3" />
                    <span>Approuver</span>
                  </button>
                  <button className="flex-1 md:w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)] text-sm">
                    <AlertCircle className="h-3 w-3" />
                    <span>Refuser</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-[var(--zalama-text)]/70">
          {filteredDemandes.length === 0 
            ? "Aucune demande trouvée" 
            : filteredDemandes.length === 1 
              ? "1 demande trouvée" 
              : `Affichage de ${indexOfFirstItem + 1} à ${Math.min(indexOfLastItem, filteredDemandes.length)} sur ${filteredDemandes.length} demandes`
          }
        </div>
        {filteredDemandes.length > 0 && (
          <div className="flex gap-1">
            <button 
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded border ${currentPage === 1 ? 'border-[var(--zalama-border)]/30 bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]/30 cursor-not-allowed' : 'border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]/80'}`}
            >
              Précédent
            </button>
            
            {/* Affichage des boutons de pagination */}
            {[...Array(totalPages)].map((_, index) => {
              // Afficher au maximum 5 boutons de pagination
              if (totalPages <= 5 || 
                  // Toujours afficher la première page
                  index === 0 || 
                  // Toujours afficher la dernière page
                  index === totalPages - 1 ||
                  // Afficher les pages autour de la page courante
                  (index >= currentPage - 2 && index <= currentPage + 0)) {
                return (
                  <button 
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`px-3 py-1 rounded border ${currentPage === index + 1 ? 'border-[var(--zalama-border)] bg-[var(--zalama-blue)] text-white' : 'border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]/80'}`}
                  >
                    {index + 1}
                  </button>
                );
              } else if ((index === 1 && currentPage > 3) || (index === totalPages - 2 && currentPage < totalPages - 2)) {
                // Afficher des points de suspension pour indiquer des pages non affichées
                return (
                  <span key={index} className="px-3 py-1 text-[var(--zalama-text)]/70">...</span>
                );
              }
              return null;
            })}
            
            <button 
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1 rounded border ${currentPage === totalPages || totalPages === 0 ? 'border-[var(--zalama-border)]/30 bg-[var(--zalama-bg-light)]/50 text-[var(--zalama-text)]/30 cursor-not-allowed' : 'border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]/80'}`}
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
