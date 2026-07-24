# Support Chat

> Solution interne de support informatique permettant aux utilisateurs de contacter rapidement le service informatique depuis leur poste de travail, tout en transmettant automatiquement les informations techniques nécessaires au diagnostic.

Support Chat est une application full-stack développée pour répondre à une problématique concrète de support informatique : simplifier la déclaration d’un incident, réduire les échanges nécessaires pour identifier le poste concerné et centraliser les conversations avant leur éventuelle transformation en ticket GLPI.

Le projet combine une application utilisateur déployable sur les postes de travail, une interface d’administration destinée aux techniciens et une API sécurisée assurant la gestion des conversations, des utilisateurs, des équipements et de l’intégration GLPI.

---

## Contexte du projet

Dans un environnement professionnel, les demandes d’assistance sont régulièrement transmises par téléphone, par email ou directement auprès du service informatique.

Ces méthodes présentent plusieurs limites :

- manque d’informations techniques sur le poste concerné ;
- absence d’historique centralisé ;
- difficulté à identifier précisément l’utilisateur et son équipement ;
- multiplication des canaux de communication ;
- temps perdu avant même de commencer le diagnostic ;
- création manuelle des tickets dans l’outil ITSM.

Support Chat vise à proposer un point d’entrée simple et immédiat entre l’utilisateur et le support informatique.

Lorsqu’un utilisateur ouvre l’application, le système peut automatiquement récupérer certaines informations du poste :

- nom de l’ordinateur ;
- utilisateur Windows ;
- domaine ;
- identifiant unique de l’installation.

Le technicien dispose ainsi du contexte nécessaire dès le début de la conversation.

---

## Objectifs

Le projet poursuit plusieurs objectifs :

- améliorer la prise en charge des demandes d’assistance ;
- fournir automatiquement les informations du poste ;
- centraliser les échanges entre l’utilisateur et le technicien ;
- limiter les appels et les emails liés aux incidents simples ;
- conserver un historique complet de la conversation ;
- sécuriser les actions réservées au support ;
- transformer une conversation en ticket GLPI ;
- préparer une architecture évolutive vers du temps réel et des notifications.

---

## Démonstration fonctionnelle

### Côté utilisateur

L’utilisateur peut :

- ouvrir automatiquement une demande d’assistance ;
- envoyer des messages au support ;
- consulter les réponses du technicien ;
- visualiser le statut de sa demande ;
- retrouver sa conversation après avoir fermé l’application ;
- utiliser le client depuis une application Tauri ou un navigateur ;
- recevoir un message système lors de la création d’un ticket GLPI ;
- voir la saisie désactivée lorsque la conversation est terminée.

### Côté technicien

Le technicien peut :

- se connecter à une interface sécurisée ;
- consulter les conversations en cours ;
- identifier l’utilisateur et son poste ;
- accéder à l’historique complet des messages ;
- répondre à l’utilisateur ;
- modifier le statut d’une conversation ;
- créer un ticket GLPI à partir de l’échange ;
- fermer une conversation ;
- supprimer une conversation selon son niveau d’autorisation.

---

## Compétences mises en œuvre

Ce projet met en pratique plusieurs compétences liées au développement logiciel et au support informatique.

### Développement full-stack

- conception d’une API REST avec NestJS ;
- développement d’interfaces avec Next.js et React ;
- utilisation de TypeScript sur l’ensemble du projet ;
- gestion d’une base de données avec Prisma ;
- organisation d’un monorepo ;
- séparation entre logique métier, accès aux données et interface.

### Support informatique

- identification automatique du poste utilisateur ;
- récupération du nom de machine ;
- récupération de l’utilisateur Windows ;
- prise en compte du domaine Active Directory ;
- association d’une demande à un équipement ;
- historique des échanges ;
- suivi du statut d’un incident ;
- intégration avec une solution ITSM.

### Sécurité applicative

- authentification par JWT ;
- stockage du token dans un cookie HttpOnly ;
- protection des routes côté API ;
- contrôle des rôles avec des Guards NestJS ;
- distinction entre administrateur et technicien ;
- validation des données avec `class-validator` ;
- contrôle de l’identité réelle de l’expéditeur côté serveur ;
- suppression des décisions sensibles côté frontend.

### Intégration système

- client desktop avec Tauri ;
- communication entre TypeScript et les commandes natives ;
- détection des informations Windows ;
- utilisation d’un identifiant persistant d’installation ;
- intégration avec l’API REST de GLPI.

---

## Architecture du projet

Le projet utilise un monorepo composé de trois applications principales.

```text
support-chat/
├── apps/
│   ├── api/       # API NestJS
│   ├── admin/     # Interface technicien et administrateur
│   └── client/    # Application utilisateur Next.js / Tauri
│
├── package.json
└── README.md

┌───────────────────────────────┐
│ Client utilisateur            │
│ Next.js / React / Tauri       │
│                               │
│ - Envoi de messages           │
│ - Identification du poste     │
│ - Suivi de la conversation    │
└───────────────┬───────────────┘
                │
                │ HTTP / JSON
                ▼
┌───────────────────────────────┐
│ API NestJS                    │
│                               │
│ - Authentification            │
│ - Autorisations               │
│ - Logique métier              │
│ - Gestion des conversations   │
│ - Gestion des équipements     │
│ - Intégration GLPI            │
└───────┬─────────────────┬─────┘
        │                 │
        ▼                 ▼
┌───────────────┐   ┌───────────────┐
│ Prisma        │   │ API GLPI      │
│ SQLite        │   │ Création      │
│               │   │ de tickets    │
└───────────────┘   └───────────────┘
        ▲
        │
        │ HTTP sécurisé
        │
┌───────┴───────────────────────┐
│ Interface d’administration    │
│ Next.js / React               │
│                               │
│ - Consultation                │
│ - Réponse technicien          │
│ - Gestion des statuts         │
│ - Création de tickets GLPI    │
└───────────────────────────────┘


