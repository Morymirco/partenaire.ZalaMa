"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Paperclip, User, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

// Types pour les messages et les pièces jointes
interface Attachment {
  id: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'other';
  name: string;
  url: string;
  size: number; // en octets
  extension: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'admin';
  timestamp: Date;
  read: boolean;
  attachments?: Attachment[];
}

// Données fictives pour les conversations
const initialMessages: Record<string, Message[]> = {
  'acme': [
    { id: '1', content: 'Bonjour, comment pouvons-nous vous aider aujourd\'hui ?', sender: 'admin', timestamp: new Date('2025-05-15T10:00:00'), read: true },
    { id: '2', content: 'Nous avons une question concernant le remboursement du mois dernier.', sender: 'user', timestamp: new Date('2025-05-15T10:05:00'), read: true },
    { id: '3', content: 'Bien sûr, pourriez-vous préciser quelle est votre question ?', sender: 'admin', timestamp: new Date('2025-05-15T10:07:00'), read: true },
    { id: '4', content: 'Nous n\'avons pas reçu la confirmation de notre dernier paiement.', sender: 'user', timestamp: new Date('2025-05-15T10:10:00'), read: true },
    { 
      id: '5', 
      content: 'Voici le reçu de notre virement.', 
      sender: 'user', 
      timestamp: new Date('2025-05-15T10:11:00'), 
      read: true,
      attachments: [
        {
          id: 'att1',
          type: 'document',
          name: 'recu_virement_avril.pdf',
          url: '/documents/recu_virement_avril.pdf',
          size: 1250000,
          extension: 'pdf'
        }
      ]
    },
    { id: '6', content: 'Je vérifie cela immédiatement. Merci pour le reçu.', sender: 'admin', timestamp: new Date('2025-05-15T10:12:00'), read: true },
  ],
  'globex': [
    { id: '1', content: 'Bonjour, comment pouvons-nous vous aider aujourd\'hui ?', sender: 'admin', timestamp: new Date('2025-05-16T09:00:00'), read: true },
    { id: '2', content: 'Nous souhaitons augmenter notre plafond d\'avances.', sender: 'user', timestamp: new Date('2025-05-16T09:15:00'), read: true },
    { id: '3', content: 'Merci pour votre demande. Pour cela, nous aurons besoin de vos derniers états financiers.', sender: 'admin', timestamp: new Date('2025-05-16T09:20:00'), read: true },
    {
      id: '4',
      content: 'Voici nos états financiers du dernier trimestre ainsi qu\'une photo de notre nouvelle usine.',
      sender: 'user',
      timestamp: new Date('2025-05-16T09:30:00'),
      read: true,
      attachments: [
        {
          id: 'att2',
          type: 'document',
          name: 'etats_financiers_Q1_2025.xlsx',
          url: '/documents/etats_financiers_Q1_2025.xlsx',
          size: 2450000,
          extension: 'xlsx'
        },
        {
          id: 'att3',
          type: 'image',
          name: 'nouvelle_usine.jpg',
          url: '/images/nouvelle_usine.jpg',
          size: 3500000,
          extension: 'jpg'
        }
      ]
    },
    { id: '5', content: 'Merci pour ces documents. Nous les analyserons et reviendrons vers vous rapidement.', sender: 'admin', timestamp: new Date('2025-05-16T09:35:00'), read: true },
  ],
  'stark': [
    { id: '1', content: 'Bonjour, comment pouvons-nous vous aider aujourd\'hui ?', sender: 'admin', timestamp: new Date('2025-05-17T11:00:00'), read: true },
    { id: '2', content: 'Nous avons un nouveau projet et nous aimerions discuter des options de financement.', sender: 'user', timestamp: new Date('2025-05-17T11:30:00'), read: true },
    { id: '3', content: 'Excellent ! Pouvez-vous nous donner plus de détails sur ce projet ?', sender: 'admin', timestamp: new Date('2025-05-17T11:35:00'), read: false },
    {
      id: '4',
      content: 'Voici une présentation vidéo de notre nouveau projet.',
      sender: 'user',
      timestamp: new Date('2025-05-17T11:40:00'),
      read: false,
      attachments: [
        {
          id: 'att4',
          type: 'video',
          name: 'presentation_projet.mp4',
          url: '/videos/presentation_projet.mp4',
          size: 15000000,
          extension: 'mp4'
        }
      ]
    },
  ],
};

export default function MessagesPage() {
  // const { isAuthenticated, currentCompany } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  
  // Créer la référence en dehors des hooks
  const hasFinishedLoading = React.useRef(false);
  
  // Rediriger vers la page de login si l'utilisateur n'est pas authentifié
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [isAuthenticated, router]);
  
  // Charger les messages
  // useEffect(() => {
  //   if (currentCompany && !hasFinishedLoading.current) {
  //     // Simuler un délai de chargement
  //     setTimeout(() => {
  //       // Récupérer les messages pour l'entreprise connectée
  //       // const companyId = currentCompany.id.toLowerCase();
  //       // const companyMessages = initialMessages[companyId] || [];
  //       // setMessages(companyMessages);
  //       setLoading(false);
  //       hasFinishedLoading.current = true;
  //     }, 1000);
  //   }
  //   }, [currentCompany]);
  
  // Faire défiler automatiquement vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Ouvrir le menu des pièces jointes
  const handleAttachmentClick = () => {
    setShowAttachmentMenu(!showAttachmentMenu);
  };

  // Gérer le clic en dehors du menu des pièces jointes
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
        setShowAttachmentMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Gérer l'importation de fichiers par type
  const handleFileImport = (type: 'image' | 'document' | 'video' | 'audio' | 'other') => {
    if (fileInputRef.current) {
      // Définir les types de fichiers acceptés en fonction du type sélectionné
      switch (type) {
        case 'image':
          fileInputRef.current.accept = 'image/*';
          break;
        case 'document':
          fileInputRef.current.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';
          break;
        case 'video':
          fileInputRef.current.accept = 'video/*';
          break;
        case 'audio':
          fileInputRef.current.accept = 'audio/*';
          break;
        case 'other':
          fileInputRef.current.accept = '';
          break;
      }
      fileInputRef.current.click();
    }
    setShowAttachmentMenu(false);
  };

  // Gérer le changement de fichier sélectionné
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];

    Array.from(files).forEach(file => {
      // Déterminer le type de fichier
      let fileType: 'image' | 'document' | 'video' | 'audio' | 'other' = 'other';
      if (file.type.startsWith('image/')) fileType = 'image';
      else if (file.type.startsWith('video/')) fileType = 'video';
      else if (file.type.startsWith('audio/')) fileType = 'audio';
      else if (
        file.type === 'application/pdf' ||
        file.type.includes('word') ||
        file.type.includes('excel') ||
        file.type.includes('powerpoint') ||
        file.type.includes('text/plain')
      ) fileType = 'document';

      // Obtenir l'extension du fichier
      const extension = file.name.split('.').pop() || '';

      // Créer une URL temporaire pour le fichier
      const url = URL.createObjectURL(file);

      // Ajouter le fichier à la liste des pièces jointes
      newAttachments.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: fileType,
        name: file.name,
        url: url,
        size: file.size,
        extension: extension.toLowerCase()
      });
    });

    setAttachments([...attachments, ...newAttachments]);
    toast.success(`${newAttachments.length} fichier(s) ajouté(s)`);

    // Réinitialiser l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Supprimer une pièce jointe
  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  // Envoyer un nouveau message
  const handleSendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date(),
      read: false,
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
    setAttachments([]);
    
    // Simuler une réponse automatique après un court délai
    setTimeout(() => {
      const autoReply: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Merci pour votre message. Un conseiller va vous répondre dans les plus brefs délais.',
        sender: 'admin',
        timestamp: new Date(),
        read: false
      };
      setMessages(prev => [...prev, autoReply]);
    }, 1000);
  };
  
  // Formater la date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-2 text-gray-600 dark:text-gray-400">Chargement des messages...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--zalama-text)]">
          Messages
        </h1>
        <p className="text-[var(--zalama-text)]/70">
          Communiquez avec l'équipe ZaLaMa
        </p>
      </div>
      
      <div className="bg-[var(--zalama-card)] rounded-lg border border-[var(--zalama-border)] overflow-hidden">
        {/* En-tête du chat */}
        <div className="p-4 border-b border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/30 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <User className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <h2 className="text-md font-medium text-[var(--zalama-text)]">Support ZaLaMa</h2>
              <p className="text-xs text-[var(--zalama-text)]/70">En ligne</p>
            </div>
          </div>
        </div>
        
        {/* Corps du chat */}
        <div className="p-4 h-[60vh] overflow-y-auto bg-[var(--zalama-bg)]/30">
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white rounded-tr-none' 
                      : 'bg-[var(--zalama-bg-light)] text-[var(--zalama-text)] rounded-tl-none'
                  }`}
                >
                  <p>{message.content}</p>
                  
                  {/* Affichage des pièces jointes */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.attachments.map((attachment) => (
                        <div 
                          key={attachment.id} 
                          className={`rounded p-2 ${message.sender === 'user' ? 'bg-blue-600' : 'bg-[var(--zalama-bg)]'}`}
                        >
                          {/* Aperçu en fonction du type de fichier */}
                          {attachment.type === 'image' && (
                            <div className="mb-2">
                              <img 
                                src={attachment.url} 
                                alt={attachment.name} 
                                className="max-h-40 max-w-full rounded object-contain"
                              />
                            </div>
                          )}
                          
                          {attachment.type === 'video' && (
                            <div className="mb-2">
                              <video 
                                src={attachment.url} 
                                controls 
                                className="max-h-40 max-w-full rounded"
                              />
                            </div>
                          )}
                          
                          {attachment.type === 'audio' && (
                            <div className="mb-2">
                              <audio 
                                src={attachment.url} 
                                controls 
                                className="max-w-full"
                              />
                            </div>
                          )}
                          
                          {/* Informations sur le fichier */}
                          <div className="flex items-center">
                            <div className="mr-2 p-1 rounded bg-white/10">
                              {attachment.type === 'document' && (
                                <span className="text-xs font-bold">{attachment.extension.toUpperCase()}</span>
                              )}
                              {attachment.type === 'image' && (
                                <span className="text-xs font-bold">IMG</span>
                              )}
                              {attachment.type === 'video' && (
                                <span className="text-xs font-bold">VID</span>
                              )}
                              {attachment.type === 'audio' && (
                                <span className="text-xs font-bold">AUD</span>
                              )}
                              {attachment.type === 'other' && (
                                <span className="text-xs font-bold">FILE</span>
                              )}
                            </div>
                            <div className="flex-1 text-sm truncate">
                              <div className="truncate">{attachment.name}</div>
                              <div className="text-xs opacity-70">{formatFileSize(attachment.size)}</div>
                            </div>
                            <a 
                              href={attachment.url} 
                              download={attachment.name}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 p-1 rounded hover:bg-white/10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end mt-1 text-xs opacity-70">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatDate(message.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Zone d'affichage des pièces jointes en cours d'ajout */}
        {attachments.length > 0 && (
          <div className="px-4 py-2 border-t border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/30">
            <div className="text-xs font-medium text-[var(--zalama-text)]/70 mb-2">Pièces jointes ({attachments.length})</div>
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <div 
                  key={attachment.id} 
                  className="flex items-center bg-[var(--zalama-bg)]/50 rounded p-1 pr-2"
                >
                  <div className="mr-1 p-1 rounded bg-blue-500/10">
                    {attachment.type === 'document' && (
                      <span className="text-xs font-bold text-blue-500">{attachment.extension.toUpperCase()}</span>
                    )}
                    {attachment.type === 'image' && (
                      <span className="text-xs font-bold text-blue-500">IMG</span>
                    )}
                    {attachment.type === 'video' && (
                      <span className="text-xs font-bold text-blue-500">VID</span>
                    )}
                    {attachment.type === 'audio' && (
                      <span className="text-xs font-bold text-blue-500">AUD</span>
                    )}
                    {attachment.type === 'other' && (
                      <span className="text-xs font-bold text-blue-500">FILE</span>
                    )}
                  </div>
                  <span className="text-xs truncate max-w-[100px]">{attachment.name}</span>
                  <button 
                    onClick={() => removeAttachment(attachment.id)}
                    className="ml-1 text-[var(--zalama-text)]/50 hover:text-[var(--zalama-text)] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Barre de saisie */}
        <div className="p-4 border-t border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/30">
          <div className="flex items-center">
            <div className="relative">
              <button 
                onClick={handleAttachmentClick}
                className="p-2 rounded-full text-[var(--zalama-text)]/70 hover:bg-[var(--zalama-bg-light)] transition-colors cursor-pointer"
                title="Joindre un fichier"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              
              {/* Menu des pièces jointes */}
              {showAttachmentMenu && (
                <div 
                  ref={attachmentMenuRef}
                  className="absolute bottom-full left-0 mb-2 w-48 bg-[var(--zalama-card)] rounded-lg shadow-lg border border-[var(--zalama-border)] overflow-hidden z-10"
                >
                  <div className="p-2 border-b border-[var(--zalama-border)] bg-[var(--zalama-bg-light)]/30">
                    <h3 className="text-sm font-medium text-[var(--zalama-text)]">Ajouter un fichier</h3>
                  </div>
                  <div className="p-1">
                    <button 
                      onClick={() => handleFileImport('image')} 
                      className="w-full text-left p-2 text-sm text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]/50 rounded transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                      </svg>
                      Image
                    </button>
                    <button 
                      onClick={() => handleFileImport('document')} 
                      className="w-full text-left p-2 text-sm text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]/50 rounded transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Document
                    </button>
                    <button 
                      onClick={() => handleFileImport('video')} 
                      className="w-full text-left p-2 text-sm text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]/50 rounded transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Vidéo
                    </button>
                    <button 
                      onClick={() => handleFileImport('audio')} 
                      className="w-full text-left p-2 text-sm text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]/50 rounded transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                      </svg>
                      Audio
                    </button>
                    <button 
                      onClick={() => handleFileImport('other')} 
                      className="w-full text-left p-2 text-sm text-[var(--zalama-text)] hover:bg-[var(--zalama-bg-light)]/50 rounded transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Autre fichier
                    </button>
                  </div>
                </div>
              )}
              
              {/* Input file caché */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple 
              />
            </div>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Écrivez votre message ici..."
              className="flex-1 p-2 mx-2 bg-transparent border-none outline-none text-[var(--zalama-text)]"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && attachments.length === 0}
              className={`p-2 rounded-full ${
                newMessage.trim() || attachments.length > 0
                  ? 'bg-blue-500 text-white' 
                  : 'bg-[var(--zalama-bg-light)] text-[var(--zalama-text)]/50'
              } transition-colors`}
              title="Envoyer"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-[var(--zalama-text)]/70">
        <p>Temps de réponse habituel : moins de 24 heures ouvrées</p>
        <p>Pour les urgences, veuillez contacter le +33 1 23 45 67 89</p>
      </div>
    </div>
  );
}
