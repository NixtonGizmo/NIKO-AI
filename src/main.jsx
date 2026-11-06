
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef
} from 'react';

import { createRoot } from 'react-dom/client';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useLocation,
  useSearchParams
} from 'react-router-dom';

import { supabase } from './lib/supabase';

import {
  MessageSquare,
  History,
  Mic2,
  User,
  Plus,
  Search,
  LogOut,
  Sparkles,
  Menu,
  X,
  Send,
  Copy,
  RefreshCw,
  Paperclip,
  Volume2,
  Square,
  ChevronRight,
  ArrowUp,
  MoreHorizontal,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Check,
  Settings2,
  Command,
  Sun,
  Moon,
  Headphones,
  Clock,
  Bot,
  Mic,
  StopCircle,
  Pencil,
  CircleHelp
} from 'lucide-react';


/* =========================================================
   NIKO AI - CREAM PREMIUM EDITION
   Everything is contained in this file.
========================================================= */


/* =========================================================
   GLOBAL STYLES
========================================================= */

const styles = `

@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');

:root {
  --cream: #F7F4ED;
  --cream-dark: #EFEAE0;
  --cream-light: #FCFAF6;
  --paper: #FFFFFF;
  --brown: #342D25;
  --brown-soft: #675D51;
  --muted: #9A9083;
  --gold: #A58A62;
  --gold-light: #D9C5A5;
  --border: #E9E2D6;
  --sidebar: #F1EDE4;
  --success: #66836C;
  --danger: #A95B50;
  --shadow: 0 12px 40px rgba(62, 48, 31, .055);
}

* {
  box-sizing: border-box;
}

html, body, #root {
  margin: 0;
  min-height: 100%;
  width: 100%;
}

body {
  background: var(--cream);
  color: var(--brown);
  font-family: 'DM Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
}

button, input, textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

.niko-logo {
  display: inline-block;
  flex-shrink: 0;
}

a {
  color: inherit;
  text-decoration: none;
}

button:disabled {
  opacity: .45;
  cursor: not-allowed;
}

::selection {
  background: #DCCBAF;
  color: #30271E;
}

.app-shell {
  min-height: 100vh;
  display: flex;
  background: var(--cream);
}

/* SIDEBAR */

.sidebar {
  width: 265px;
  min-width: 265px;
  height: 100vh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  background: var(--sidebar);
  border-right: 1px solid var(--border);
  padding: 26px 17px 18px;
  z-index: 20;
  transition: transform .3s ease;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 2px;
}

.brand b {
  color: var(--gold);
  font-weight: 500;
}

.logo-mark {
  width: 35px;
  height: 35px;
  border-radius: 11px;
  background: var(--brown);
  color: #E8D9BD;
  display: grid;
  place-items: center;
}

.side-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5px 32px;
}

.new-chat {
  height: 47px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 15px;
  background: var(--brown);
  color: #F8F3E9;
  border: none;
  border-radius: 9px;
  font-weight: 600;
  font-size: 13px;
  transition: .2s;
}

.new-chat:hover {
  background: #504437;
  transform: translateY(-1px);
}

.nav-label {
  color: var(--muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.7px;
  padding: 30px 12px 12px;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.sidebar nav a {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 12px 13px;
  border-radius: 8px;
  color: var(--brown-soft);
  font-size: 13px;
  font-weight: 500;
  transition: .2s;
}

.sidebar nav a:hover {
  background: #E8E1D5;
  color: var(--brown);
}

.sidebar nav a.active {
  background: #E6DED0;
  color: var(--brown);
  font-weight: 700;
}

.side-bottom {
  margin-top: auto;
}

.sidebar-divider {
  height: 1px;
  background: var(--border);
  margin: 16px 0;
}

.status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px 17px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #719276;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(113,146,118,.12);
}

.status strong {
  display: block;
  font-size: 12px;
}

.status small {
  display: block;
  font-size: 10px;
  color: var(--muted);
  margin-top: 3px;
}

.profile-mini {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: rgba(255,255,255,.35);
  padding: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
  text-align: left;
  color: var(--brown);
}

.avatar {
  width: 34px;
  height: 34px;
  background: var(--brown);
  color: #F2E8D6;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-family: 'Playfair Display', serif;
  font-size: 15px;
}

.profile-mini strong {
  display: block;
  font-size: 12px;
}

.profile-mini small {
  color: var(--muted);
  font-size: 10px;
}

.ellipsis {
  min-width: 0;
  overflow: hidden;
}

.ellipsis strong,
.ellipsis small {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 13px 10px 5px;
  border: none;
  background: transparent;
  color: var(--brown-soft);
  font-size: 12px;
}

/* MAIN */

.main {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  position: relative;
}

.mobile-header {
  display: none;
  height: 65px;
  padding: 0 17px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  background: var(--cream-light);
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--brown);
  border-radius: 9px;
  transition: .2s;
}

.icon-btn:hover {
  background: var(--cream-dark);
  border-color: var(--border);
}

.mobile-only {
  display: none;
}

.logo-mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
}

/* PAGE */

.page {
  width: 100%;
  max-width: 1150px;
  margin: auto;
  padding: 38px 45px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.page-head h1 {
  font-family: 'Playfair Display', serif;
  font-size: 34px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -.7px;
}

.page-head p {
  color: var(--muted);
  font-size: 13px;
  margin-top: 8px;
}

.eyebrow {
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--gold);
  font-weight: 700;
}

/* CHAT */

.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: 1100px;
  margin: auto;
  padding: 0 50px;
}

.chat-top {
  min-height: 83px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}

.chat-top h1 {
  font-family: 'Playfair Display', serif;
  font-size: 23px;
  font-weight: 600;
  margin: 4px 0 0;
}

.chat-top .eyebrow {
  font-size: 9px;
}

.chat-window {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 28px 0;
  scroll-behavior: smooth;
}

.chat-empty {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 25px 10px;
  animation: fadeUp .5s ease;
}

.niko-mini {
  width: 65px;
  height: 65px;
  border-radius: 22px;
  display: grid;
  place-items: center;
  background: var(--brown);
  color: #E6D2AE;
  margin-bottom: 25px;
  box-shadow: 0 12px 30px rgba(52,45,37,.13);
}

.chat-empty h2 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(27px, 4vw, 39px);
  font-weight: 500;
  margin: 0;
}

.chat-empty p {
  font-size: 13px;
  color: var(--muted);
  margin: 12px 0 30px;
}

.suggestions {
  display: flex;
  gap: 9px;
  justify-content: center;
  flex-wrap: wrap;
}

.suggestions button {
  background: #FDFBF7;
  border: 1px solid var(--border);
  border-radius: 30px;
  padding: 11px 17px;
  color: var(--brown-soft);
  font-size: 11px;
  transition: .2s;
}

.suggestions button:hover {
  background: #EAE1D2;
  color: var(--brown);
  border-color: var(--gold-light);
}

/* MESSAGES */

.messages {
  max-width: 850px;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.message {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  animation: fadeUp .25s ease;
}

.message-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #E9E1D4;
  color: var(--brown);
}

.message.assistant .message-avatar {
  background: var(--brown);
  color: #EAD8B8;
}

.bubble {
  flex: 1;
  min-width: 0;
}

.role {
  font-size: 12px;
  font-weight: 700;
  margin: 4px 0 9px;
}

.content {
  font-size: 14px;
  line-height: 1.85;
  color: #50483F;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.message.user .content {
  background: #EDE6DA;
  border-radius: 4px 13px 13px 13px;
  padding: 13px 16px;
  display: inline-block;
  max-width: 100%;
}

.msg-actions {
  display: flex;
  gap: 15px;
  margin-top: 12px;
}

.msg-actions button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--muted);
  font-size: 10px;
  background: transparent;
  border: none;
  padding: 4px 0;
}

.msg-actions button:hover {
  color: var(--brown);
}

/* COMPOSER */

.composer-wrap {
  padding: 15px 0 23px;
  background: var(--cream);
}

.composer {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  border: 1px solid #DED4C5;
  background: #FFFEFB;
  border-radius: 15px;
  padding: 10px 12px;
  box-shadow: var(--shadow);
  transition: .2s;
}

.composer:focus-within {
  border-color: #BDA782;
  box-shadow: 0 0 0 3px rgba(165,138,98,.09);
}

.composer textarea {
  flex: 1;
  min-width: 0;
  max-height: 180px;
  resize: none;
  border: none;
  outline: none;
  background: transparent;
  color: var(--brown);
  padding: 9px 0;
  font-size: 13px;
  line-height: 1.6;
}

.composer textarea::placeholder {
  color: #AAA194;
}

.send {
  width: 39px;
  height: 39px;
  border-radius: 11px;
  border: none;
  background: var(--brown);
  color: white;
  display: grid;
  place-items: center;
  transition: .2s;
}

.send:hover:not(:disabled) {
  background: #665541;
  transform: translateY(-2px);
}

.composer-note {
  text-align: center;
  color: #AAA093;
  font-size: 10px;
  margin-top: 11px;
}

.composer-tools {
  display: flex;
  gap: 5px;
  align-items: center;
}

.composer-tools button {
  border: none;
  background: transparent;
  color: var(--muted);
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  border-radius: 8px;
}

.composer-tools button:hover {
  background: var(--cream-dark);
  color: var(--brown);
}

.loader {
  width: 17px;
  height: 17px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

/* HISTORY */

.history-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  background: #FCFAF6;
  border: 1px solid var(--border);
  padding: 16px 18px;
  border-radius: 11px;
  transition: .2s;
}

.history-item:hover {
  border-color: #C8B796;
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

.history-main {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}

.history-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #EDE5D8;
  color: var(--brown);
}

.history-main h3 {
  font-size: 13px;
  margin: 0 0 5px;
  font-weight: 600;
}

.history-main p {
  color: var(--muted);
  font-size: 10px;
  margin: 0;
}

.history-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.history-actions button {
  border: none;
  background: transparent;
  color: var(--muted);
  padding: 8px;
  border-radius: 8px;
}

.history-actions button:hover {
  background: var(--cream-dark);
  color: var(--brown);
}

.history-actions .delete:hover {
  color: var(--danger);
}

/* EMPTY */

.empty-state {
  min-height: 270px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #FCFAF6;
  border: 1px dashed #DCD2C3;
  border-radius: 14px;
  padding: 25px;
}

.empty-state > svg {
  color: var(--gold);
  margin-bottom: 17px;
}

.empty-state h2 {
  font-family: 'Playfair Display', serif;
  font-size: 23px;
  font-weight: 500;
  margin: 0;
}

.empty-state p {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.7;
  max-width: 340px;
}

/* BUTTONS */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border-radius: 9px;
  padding: 12px 19px;
  border: 1px solid var(--border);
  font-size: 12px;
  font-weight: 600;
  transition: .2s;
}

.btn.primary {
  background: var(--brown);
  border-color: var(--brown);
  color: #F8F2E8;
}

.btn.primary:hover {
  background: #55483A;
}

.btn.ghost {
  background: transparent;
  color: var(--brown);
}

.btn.ghost:hover {
  background: var(--cream-dark);
}

.btn.full {
  width: 100%;
}

/* VOICE */

.voice-stage {
  min-height: 560px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #FCFAF6;
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 35px 20px;
}

.voice-orb {
  width: 165px;
  height: 165px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #EAE2D4;
  margin-bottom: 28px;
  transition: .3s;
}

.voice-orb.listening {
  background: #E5D3B8;
  animation: pulse 1.8s infinite;
}

.voice-core {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--brown);
  color: #E8D6B8;
  box-shadow: 0 10px 30px rgba(52,45,37,.18);
}

.voice-state {
  color: var(--gold);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.voice-stage h2 {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  font-weight: 500;
  max-width: 500px;
  margin: 17px auto 28px;
  overflow-wrap: anywhere;
}

.voice-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.muted {
  color: var(--muted);
  font-size: 11px;
}

.center {
  text-align: center;
}

/* PROFILE */

.profile-card {
  background: #FCFAF6;
  border: 1px solid var(--border);
  border-radius: 15px;
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 23px;
}

.profile-avatar {
  width: 82px;
  height: 82px;
  border-radius: 50%;
  background: var(--brown);
  color: #E9D7B7;
  display: grid;
  place-items: center;
  font-family: 'Playfair Display', serif;
  font-size: 31px;
}

.profile-card h2 {
  font-family: 'Playfair Display', serif;
  font-size: 25px;
  font-weight: 500;
  margin: 9px 0;
}

.profile-card p {
  color: var(--muted);
  font-size: 12px;
}

.message-row {
  display: flex;
  width: 100%;
  margin: 14px 0;
}

.user-row {
  justify-content: flex-end;
}

.ai-row {
  justify-content: flex-start;
}

.message-bubble {
  width: fit-content;
  max-width: min(78%, 720px);
  min-width: 90px;
  padding: 13px 17px;
  border-radius: 16px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.user-bubble {
  margin-left: auto;
  background: #e9dfcf;
  color: #332719;
  border: 1px solid #e0d3c0;
  border-bottom-right-radius: 5px;
}

.ai-bubble {
  margin-right: auto;
  background: #f8f5ef;
  color: #332719;
  border: 1px solid #e9e1d5;
  border-bottom-left-radius: 5px;
}

.message-bubble .role {
  margin-bottom: 6px;
  font-size: 10px;
  color: var(--gold);
}

.message-bubble .content {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (max-width: 560px) {
  .message-bubble {
    max-width: 88%;
    padding: 11px 14px;
  }
}

  .niko-logo {
  width: 42px;
  height: 42px;
  object-fit: contain;
}

.profile-info {
  margin-top: 25px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: #FCFAF6;
  padding: 20px;
}

.profile-info h3 {
  font-size: 13px;
  margin: 0 0 15px;
}

.profile-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
}

.profile-row:last-child {
  border-bottom: none;
}

.profile-row span:first-child {
  color: var(--muted);
}

/* AUTH */

.auth {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--cream);
}

.auth-art {
  background: #EDE5D8;
  padding: 55px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.auth-art h2 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(38px, 5vw, 65px);
  line-height: 1.15;
  font-weight: 500;
  margin: 35px 0 15px;
}

.auth-art p {
  color: var(--brown-soft);
  line-height: 1.8;
  font-size: 13px;
  max-width: 380px;
}

.auth-orb {
  margin-top: 65px;
  width: 125px;
  height: 125px;
  border-radius: 35px;
  display: grid;
  place-items: center;
  background: var(--brown);
  color: #E6D1AC;
}

.auth-card {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 25px;
}

.auth-inner {
  width: 100%;
  max-width: 390px;
}

.back {
  color: var(--muted);
  font-size: 12px;
  display: inline-block;
  margin-bottom: 45px;
}

.auth-inner h1 {
  font-family: 'Playfair Display', serif;
  font-size: 37px;
  font-weight: 500;
  margin: 12px 0;
}

.auth-inner > p {
  color: var(--muted);
  font-size: 12px;
  margin-bottom: 28px;
}

.auth-inner label {
  display: block;
  margin-bottom: 18px;
  color: var(--brown-soft);
  font-size: 11px;
  font-weight: 600;
}

.auth-inner input {
  width: 100%;
  height: 46px;
  padding: 0 13px;
  margin-top: 8px;
  background: #FCFAF6;
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
  color: var(--brown);
}

.auth-inner input:focus {
  border-color: var(--gold);
}

.google-btn {
  width: 100%;
  height: 45px;
  background: #FCFAF6;
  margin: 10px 0;
}

.google-mark {
  font-size: 17px;
  font-weight: 700;
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 19px 0;
  color: var(--muted);
  font-size: 11px;
}

.auth-divider:before,
.auth-divider:after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.error {
  background: #F7E9E5;
  border: 1px solid #E7C7BE;
  color: #934D42;
  border-radius: 8px;
  padding: 11px;
  font-size: 11px;
  margin: 15px 0;
}

.switch {
  text-align: center;
  color: var(--muted);
  font-size: 11px;
  margin-top: 25px;
}

.switch a {
  color: var(--brown);
  font-weight: 700;
}

/* LANDING */

.landing {
  min-height: 100vh;
  background: var(--cream);
}

.landing-nav {
  height: 85px;
  padding: 0 7%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 25px;
}

.text-link {
  font-size: 12px;
  color: var(--brown-soft);
}

.hero {
  max-width: 1200px;
  margin: auto;
  min-height: 640px;
  padding: 90px 7%;
  display: grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 50px;
  align-items: center;
}

.hero-copy h1 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(45px, 6vw, 76px);
  line-height: 1.12;
  font-weight: 500;
  letter-spacing: -2px;
  margin: 22px 0;
}

.hero-copy h1 span {
  color: var(--gold);
}

.hero-copy p {
  color: var(--brown-soft);
  line-height: 1.9;
  font-size: 14px;
  max-width: 480px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 32px;
}

.hero-visual {
  min-height: 400px;
  display: grid;
  place-items: center;
  position: relative;
}

.hero-core {
  width: 230px;
  height: 230px;
  border-radius: 70px;
  background: var(--brown);
  color: #E8D4B1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 17px;
  transform: rotate(-7deg);
  box-shadow: 0 30px 70px rgba(52,45,37,.18);
}

.hero-core strong {
  font-family: 'Playfair Display', serif;
  font-size: 27px;
  letter-spacing: 5px;
  transform: rotate(7deg);
}

.hero-core svg {
  transform: rotate(7deg);
}

.hero-note {
  position: absolute;
  background: #FCFAF6;
  border: 1px solid var(--border);
  border-radius: 11px;
  padding: 14px 18px;
  box-shadow: var(--shadow);
  font-size: 11px;
}

.hero-note.one {
  top: 45px;
  right: 0;
}

.hero-note.two {
  bottom: 55px;
  left: 0;
}

.landing-footer {
  border-top: 1px solid var(--border);
  padding: 25px 7%;
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 11px;
}

/* SPLASH */

.splash {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: var(--cream);
  font-family: 'Playfair Display', serif;
  letter-spacing: 5px;
}

.message-row {
  display: flex;
  width: 100%;
  margin: 14px 0;
}

.user-row {
  justify-content: flex-end;
}

.ai-row {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 75%;
  padding: 13px 17px;
  border-radius: 18px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.user-bubble {
  background: #e9dfcf;
  color: #332719;
  border-bottom-right-radius: 5px;
}

.ai-bubble {
  background: #f8f5ef;
  color: #332719;
  border: 1px solid #e9e1d5;
  border-bottom-left-radius: 5px;
}

.splash .logo-mark {
  width: 60px;
  height: 60px;
  border-radius: 19px;
}

/* ANIMATIONS */

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(9px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(165,138,98,.12); }
  50% { box-shadow: 0 0 0 20px rgba(165,138,98,0); }
}

/* RESPONSIVE */

@media(max-width: 850px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    transform: translateX(-105%);
    box-shadow: none;
  }

  .sidebar.open {
    transform: translateX(0);
    box-shadow: 15px 0 50px rgba(40,30,20,.12);
  }

  .mobile-only {
    display: grid;
  }

  .mobile-header {
    display: flex;
  }

  .chat-page {
    height: calc(100vh - 65px);
    padding: 0 22px;
  }

  .chat-top {
    min-height: 68px;
  }

  .page {
    padding: 28px 24px;
  }

  .hero {
    grid-template-columns: 1fr;
    padding-top: 65px;
    text-align: center;
  }

  .hero-copy p {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-visual {
    min-height: 340px;
  }
}

@media(max-width: 560px) {
  .auth {
    grid-template-columns: 1fr;
  }

  .auth-art {
    display: none;
  }

  .auth-card {
    min-height: 100vh;
    padding: 25px;
  }

  .chat-page {
    padding: 0 13px;
  }

  .chat-window {
    padding: 20px 0;
  }

  .chat-empty h2 {
    font-size: 27px;
  }

  .chat-empty p {
    max-width: 280px;
    line-height: 1.7;
  }

  .suggestions {
    max-width: 320px;
  }

  .message {
    gap: 9px;
  }

  .message-avatar {
    width: 29px;
    height: 29px;
  }

  .content {
    font-size: 13px;
  }

  .composer-wrap {
    padding-bottom: 12px;
  }

  .page {
    padding: 24px 16px;
  }

  .page-head h1 {
    font-size: 28px;
  }

  .voice-stage {
    min-height: 470px;
  }

  .voice-orb {
    width: 140px;
    height: 140px;
  }

  .voice-core {
    width: 95px;
    height: 95px;
  }

  .profile-card {
    padding: 18px;
    gap: 15px;
  }

  .profile-avatar {
    width: 65px;
    height: 65px;
  }

  .profile-card h2 {
    font-size: 20px;
  }

  .history-item {
    padding: 12px;
  }

  .hero {
    padding: 55px 22px;
  }

  .hero-copy h1 {
    font-size: 48px;
  }

  .hero-visual {
    min-height: 290px;
  }

  .hero-core {
    width: 185px;
    height: 185px;
  }

  .hero-note.one {
    right: -4px;
  }

  .hero-note.two {
    left: -4px;
  }

  .landing-nav {
    padding: 0 18px;
  }

  .landing-footer {
    padding: 20px;
  }

  .nav-actions {
    gap: 12px;
  }
}

`;


/* =========================================================
   AUTH CONTEXT
========================================================= */

const AuthContext = createContext(null);

function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {

      if (mounted) {
        setUser(data.session?.user || null);
        setLoading(false);
      }

    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };

  }, []);

  const value = useMemo(
    () => ({ user, loading, setUser }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

}

const useAuth = () => useContext(AuthContext);


/* =========================================================
   LOCAL CHAT HISTORY
========================================================= */

function storageKey(userId) {
  return `niko_chat_history_${userId}`;
}

function makeId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `niko_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );
}

function readChats(userId) {

  try {
    return JSON.parse(
      localStorage.getItem(storageKey(userId)) || '[]'
    );
  } catch {
    return [];
  }

}

function writeChats(userId, chats) {

  try {
    localStorage.setItem(
      storageKey(userId),
      JSON.stringify(chats)
    );
  } catch (error) {
    console.error('History storage error:', error);
  }

}

function saveConversation(userId, conversation) {

  const chats = readChats(userId);

  const index = chats.findIndex(
    item => item.id === conversation.id
  );

  if (index >= 0) {
    chats[index] = {
      ...chats[index],
      ...conversation,
      updatedAt: Date.now()
    };
  } else {
    chats.unshift({
      ...conversation,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  chats.sort((a, b) => b.updatedAt - a.updatedAt);

  writeChats(userId, chats.slice(0, 100));

}


/* =========================================================
   AUTH PROTECTION
========================================================= */

function NikoLogo({ size = 26, className = "" }) {
  return (
    <img
      src="/logo.png"
      alt="NIKO AI"
      className={`niko-logo ${className}`}
      style={{
        width: size,
        height: size,
        objectFit: "contain"
      }}
    />
  );
}

function Splash() {
  return (
    <div className="splash">
      <div className="logo-mark">
        <NikoLogo size={42} />
      </div>
      NIKO AI
    </div>
  );
}

function Protected({ children }) {

  const { user, loading } = useAuth();

  if (loading) return <Splash />;

  return user
    ? children
    : <Navigate to="/login" replace />;

}


/* =========================================================
   LOGO
========================================================= */

function Logo() {

  return (
    <Link className="brand" to="/app/chat">
      <span className="logo-mark">
        <img
          src="/logo.png"
          alt="NIKO AI"
          onError={(e) => console.log("Logo not found:", e.currentTarget.src)}
        />
      </span>
      <span>NIKO <b>AI</b></span>
    </Link>
  );

}


/* =========================================================
   APPLICATION SHELL
========================================================= */

function Shell({ children }) {

  const { user, setUser } = useAuth();

  const nav = useNavigate();
  const loc = useLocation();

  const [mobile, setMobile] = useState(false);

  const items = [
    ['/app/chat', 'Chat', MessageSquare],
    ['/app/history', 'Chat History', History],
    ['/app/voice', 'Voice', Mic2],
    ['/app/profile', 'Profile', User]
  ];

  async function logout() {

    await supabase.auth.signOut();

    setUser(null);

    nav('/login');

  }

  function newChat() {
    nav(`/app/chat?new=${Date.now()}`);
    setMobile(false);
  }

  return (

    <div className="app-shell">

      <aside className={mobile ? 'sidebar open' : 'sidebar'}>

        <div className="side-top">

          <Logo />

          <button
            className="icon-btn mobile-only"
            onClick={() => setMobile(false)}
          >
            <X size={19} />
          </button>

        </div>

        <button className="new-chat" onClick={newChat}>
          <Plus size={17} />
          New conversation
        </button>

        <div className="nav-label">
          WORKSPACE
        </div>

        <nav>

          {items.map(([to, label, Icon]) => {

            const active =
              to === '/app/chat'
                ? loc.pathname === '/app/chat'
                : loc.pathname === to;

            return (

              <Link
                key={to}
                to={to}
                onClick={() => setMobile(false)}
                className={active ? 'active' : ''}
              >
                <Icon size={18} />
                {label}
              </Link>

            );

          })}

        </nav>

        <div className="side-bottom">

          <div className="sidebar-divider" />

          <div className="status">
            <span className="status-dot" />

            <div>
              <strong>Niko online</strong>
              <small>Your AI companion</small>
            </div>
          </div>

          <button
            className="profile-mini"
            onClick={() => nav('/app/profile')}
          >

            <div className="avatar">
              {(
                user?.user_metadata?.name ||
                user?.email ||
                'N'
              )[0].toUpperCase()}
            </div>

            <div className="ellipsis">
              <strong>
                {user?.user_metadata?.name || 'Niko user'}
              </strong>
              <small>{user?.email}</small>
            </div>

          </button>

          <button className="logout" onClick={logout}>
            <LogOut size={15} />
            Sign out
          </button>

        </div>

      </aside>

      <main className="main">

        <header className="mobile-header">

          <button
            className="icon-btn"
            onClick={() => setMobile(true)}
          >
            <Menu size={20} />
          </button>

          <Logo />

          <button
            className="icon-btn"
            onClick={newChat}
          >
            <Plus size={19} />
          </button>

        </header>

        {children}

      </main>

    </div>

  );

}


/* =========================================================
   LANDING PAGE
========================================================= */

function Landing() {

  return (

    <div className="landing">

      <header className="landing-nav">

        <Logo />

        <div className="nav-actions">

          <Link to="/login" className="text-link">
            Sign in
          </Link>

          <Link to="/signup" className="btn primary">
            Get started
            <ChevronRight size={16} />
          </Link>

        </div>

      </header>

      <section className="hero">

        <div className="hero-copy">

          <span className="eyebrow">
            YOUR PERSONAL AI
          </span>

          <h1>
            Intelligence,
            <br />
            made <span>personal.</span>
          </h1>

          <p>
            Meet Niko. A thoughtful AI companion designed
            to help you think clearly, explore ideas,
            create things and get more done.
          </p>

          <div className="hero-actions">

            <Link to="/signup" className="btn primary">
              Start with Niko
              <ArrowUp size={16} />
            </Link>

            <Link to="/login" className="btn ghost">
              I have an account
            </Link>

          </div>

        </div>

        <div className="hero-visual">

          <div className="hero-core">
            <Sparkles size={55} />
            <strong>NIKO</strong>
          </div>

          <div className="hero-note one">
            <Sparkles size={13} />
            &nbsp; Thoughtful conversations
          </div>

          <div className="hero-note two">
            <Mic2 size={13} />
            &nbsp; Natural voice experience
          </div>

        </div>

      </section>

      <footer className="landing-footer">
        <Logo />
        <span>© {new Date().getFullYear()} NIKO AI</span>
      </footer>

    </div>

  );

}


/* =========================================================
   LOGIN / SIGNUP
========================================================= */

function AuthPage({ signup = false }) {

  const { setUser } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function googleLogin() {

    setErr('');
    setBusy(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app/chat`
      }
    });

    if (error) {
      setErr(error.message);
      setBusy(false);
    }

  }

  async function submit(e) {

    e.preventDefault();

    setBusy(true);
    setErr('');

    try {

      if (signup) {

        const { data, error } = await supabase.auth.signUp({

          email,
          password,

          options: {
            data: { name }
          }

        });

        if (error) throw error;

        if (data.session) {
          setUser(data.user);
          nav('/app/chat');
        } else {
          setErr(
            'Account created. Please check your email to confirm your account.'
          );
        }

      } else {

        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password
          });

        if (error) throw error;

        setUser(data.user);

        nav('/app/chat');

      }

    } catch (error) {

      setErr(error?.message || 'Authentication failed.');

    } finally {

      setBusy(false);

    }

  }

  return (

    <div className="auth">

      <div className="auth-art">

        <Logo />

        <div className="auth-orb">
          <Sparkles size={55} />
        </div>

        <h2>
          A calmer space
          <br />
          to think.
        </h2>

        <p>
          Your ideas, conversations and creativity
          deserve a beautiful place.
        </p>

      </div>

      <div className="auth-card">

        <div className="auth-inner">

          <Link to="/" className="back">
            ← Back to Niko
          </Link>

          <span className="eyebrow">
            NIKO AI
          </span>

          <h1>
            {signup ? 'Create account' : 'Welcome back.'}
          </h1>

          <p>
            {signup
              ? 'Create your personal AI workspace.'
              : 'Continue your conversations with Niko.'}
          </p>

          {err && <div className="error">{err}</div>}

          <button
            type="button"
            className="btn ghost google-btn"
            onClick={googleLogin}
            disabled={busy}
          >
            <span className="google-mark">G</span>
            Continue with Google
          </button>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          <form onSubmit={submit}>

            {signup && (

              <label>
                Your name

                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />

              </label>

            )}

            <label>
              Email address

              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

            </label>

            <label>
              Password

              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                minLength={8}
                required
              />

            </label>

            <button
              className="btn primary full"
              disabled={busy}
            >
              {busy
                ? 'Please wait...'
                : signup
                  ? 'Create account'
                  : 'Sign in'}

              <ChevronRight size={17} />

            </button>

          </form>

          <div className="switch">

            {signup
              ? 'Already have an account? '
              : 'New to Niko? '}

            <Link to={signup ? '/login' : '/signup'}>
              {signup ? 'Sign in' : 'Create one'}
            </Link>

          </div>

        </div>

      </div>

    </div>

  );

}


/* =========================================================
   CHAT COMPONENT
========================================================= */

function Chat() {

  const { user } = useAuth();

  const navigate = useNavigate();

  const [params] = useSearchParams();

  const conversationParam = params.get('id');
  const newParam = params.get('new');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const [activeId, setActiveId] = useState('');
  const [serverId, setServerId] = useState('');

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  /* Load existing conversation */

  useEffect(() => {

    if (!user?.id) return;

    if (conversationParam) {

      const chats = readChats(user.id);

      const found = chats.find(
        chat => chat.id === conversationParam
      );

      if (found) {

        setActiveId(found.id);
        setMessages(found.messages || []);
        setServerId(found.serverId || '');

      } else {

        setActiveId(conversationParam);
        setMessages([]);
        setServerId('');

      }

    } else {

      setActiveId(makeId());
      setMessages([]);
      setServerId('');

    }

    setInput('');

  }, [conversationParam, newParam, user?.id]);

  /* Scroll */

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: 'smooth'
    });

  }, [messages, busy]);

  /* Persist */

  function persist(nextMessages, id = activeId, remoteId = serverId) {

    if (!user?.id || !id) return;

    const firstUser = nextMessages.find(
      message => message.role === 'user'
    );

    saveConversation(user.id, {

      id,
      serverId: remoteId,

      title: firstUser
        ? firstUser.content.slice(0, 55)
        : 'New conversation',

      messages: nextMessages

    });

  }

  /* Send message */

  async function send() {

    if (!input.trim() || busy) return;

    if (!user?.id) return;

    const text = input.trim();

    setInput('');

    const currentId = activeId || makeId();

    const userMessage = {
      role: 'user',
      content: text
    };

    const nextMessages = [
      ...messages,
      userMessage
    ];

    setMessages(nextMessages);

    setBusy(true);

    persist(nextMessages, currentId);

    try {

      const endpoint =
        import.meta.env.VITE_APPWRITE_ENDPOINT ||
        'https://sgp.cloud.appwrite.io/v1';

      const functionId =
        import.meta.env.VITE_APPWRITE_AI_FUNCTION_ID ||
        'niko_ai_api';

      const projectId =
        import.meta.env.VITE_APPWRITE_PROJECT_ID;

      if (!projectId) {
        throw new Error(
          'VITE_APPWRITE_PROJECT_ID is missing in .env'
        );
      }

      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error(
          'Your login session has expired. Please sign in again.'
        );
      }

      const response = await fetch(
        `${endpoint}/functions/${functionId}/executions`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': projectId
          },

          body: JSON.stringify({

            body: JSON.stringify({

              supabaseAccessToken: session.access_token,

              conversationId: serverId || null,

              messages: nextMessages

            }),

            async: false

          })

        }
      );

      let execution = {};

      try {
        execution = await response.json();
      } catch {
        throw new Error(
          'Appwrite returned an invalid response.'
        );
      }

      if (!response.ok) {
        throw new Error(
          execution.message ||
          execution.error ||
          `Appwrite HTTP ${response.status}`
        );
      }

      if (execution.status === 'failed') {
        throw new Error(
          execution.stderr ||
          execution.responseBody ||
          'Niko Function execution failed.'
        );
      }

      const responseBody = execution.responseBody;

      if (!responseBody) {
        throw new Error(
          'Function returned an empty response. Check Appwrite logs.'
        );
      }

      let result;

      try {
        result =
          typeof responseBody === 'string'
            ? JSON.parse(responseBody)
            : responseBody;
      } catch {
        throw new Error(
          'Invalid JSON returned from Niko Function.'
        );
      }

      if (
        execution.responseStatusCode &&
        execution.responseStatusCode >= 400
      ) {
        throw new Error(
          result?.error ||
          result?.message ||
          `Niko Function HTTP ${execution.responseStatusCode}`
        );
      }

      const output =
        result?.content ||
        result?.message ||
        '';

      if (!output) {
        throw new Error(
          result?.error ||
          'Niko returned no AI message.'
        );
      }

      const remoteConversationId = result.conversationId;

if (!remoteConversationId) {
  throw new Error(
    'Backend did not return a valid conversation ID.'
  );
}

setServerId(remoteConversationId);

      const finalMessages = [
        ...nextMessages,
        {
          role: 'assistant',
          content: String(output)
        }
      ];

      setMessages(finalMessages);

      persist(
        finalMessages,
        currentId,
        remoteConversationId
      );

      if (!conversationParam) {
        navigate(`/app/chat?id=${currentId}`, {
          replace: true
        });
      }

    } catch (error) {

      console.error('NIKO CHAT ERROR:', error);

      const errorMessages = [
        ...nextMessages,
        {
          role: 'assistant',
          content:
            `Niko connection error: ${
              error?.message || 'Unknown error'
            }`
        }
      ];

      setMessages(errorMessages);

      persist(errorMessages, currentId);

    } finally {

      setBusy(false);

    }

  }

  /* Copy */

  function copyMessage(content) {

    navigator.clipboard?.writeText(content)
      .catch(console.error);

  }

  /* Regenerate */

  function regenerate() {

    const lastUser = [...messages]
      .reverse()
      .find(message => message.role === 'user');

    if (!lastUser || busy) return;

    const previous = messages.slice(
      0,
      messages.lastIndexOf(lastUser) + 1
    );

    setMessages(previous);

    setInput(lastUser.content);

  }

  /* Input suggestions */

  function suggestion(text) {
    setInput(text);
    textareaRef.current?.focus();
  }

  return (

    <div className="chat-page">

      <div className="chat-top">

        <div>
          <span className="eyebrow">
            NIKO / PERSONAL ASSISTANT
          </span>

          <h1>Conversation</h1>
        </div>

        <button
          className="icon-btn"
          title="New conversation"
          onClick={() => navigate(`/app/chat?new=${Date.now()}`)}
        >
          <Plus size={20} />
        </button>

      </div>

      <div className="chat-window">

        {messages.length === 0 ? (

          <div className="chat-empty">

            <div className="niko-mini">
              <Sparkles size={30} />
            </div>

            <span className="eyebrow">
              A LITTLE SPACE FOR BIG IDEAS
            </span>

            <h2>
              What shall we explore today?
            </h2>

            <p>
              Ask Niko to think, explain, create,
              write or help you plan something.
            </p>

            <div className="suggestions">

              <button
                onClick={() => suggestion('Help me plan a new project.')}
              >
                <Command size={13} />
                &nbsp; Plan a project
              </button>

              <button
                onClick={() => suggestion('Teach me something new.')}
              >
                Learn something
              </button>

              <button
                onClick={() => suggestion('Help me write something.')}
              >
                Write something
              </button>

            </div>

          </div>

        ) : (

          <div className="messages">

            {messages.map((message, index) => (
  <div
    className={`message-row ${
      message.role === 'user' ? 'user-row' : 'ai-row'
    }`}
    key={`${index}-${message.role}`}
  >
    <div
      className={`message-bubble ${
        message.role === 'user' ? 'user-bubble' : 'ai-bubble'
      }`}
    >
      <div className="role">
        {message.role === 'assistant' ? 'Niko' : 'You'}
      </div>

      <div className="content">
        {message.content}
      </div>

      {message.role === 'assistant' && (
        <div className="msg-actions">
          <button onClick={() => copyMessage(message.content)}>
            <Copy size={13} /> Copy
          </button>

          {index === messages.length - 1 && (
            <button onClick={regenerate}>
              <RefreshCw size={13} /> Regenerate
            </button>
          )}
        </div>
      )}
    </div>
  </div>
))}

            {busy && (

              <div className="message assistant">

                <div className="message-avatar">
                  <Sparkles size={15} />
                </div>

                <div className="bubble">
                  <div className="role">Niko</div>
                  <div className="content">
                    Thinking...
                  </div>
                </div>

              </div>

            )}

            <div ref={bottomRef} />

          </div>

        )}

      </div>

      <div className="composer-wrap">

        <div className="composer">

          <div className="composer-tools">

            <button
              type="button"
              title="Voice"
              onClick={() => navigate('/app/voice')}
            >
              <Mic size={18} />
            </button>

          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {

              if (
                e.key === 'Enter' &&
                !e.shiftKey
              ) {
                e.preventDefault();
                send();
              }

            }}
            placeholder="Message Niko..."
            rows="1"
          />

          <button
            className="send"
            onClick={send}
            disabled={busy || !input.trim()}
            title="Send message"
          >
            {busy
              ? <span className="loader" />
              : <ArrowUp size={20} />}
          </button>

        </div>

        <div className="composer-note">
          Niko can make mistakes. Review important information.
        </div>

      </div>

    </div>

  );

}


/* =========================================================
   CHAT HISTORY
========================================================= */

function ChatHistory() {

  const { user } = useAuth();

  const navigate = useNavigate();

  const [chats, setChats] = useState([]);

  const [search, setSearch] = useState('');

  function refresh() {
    if (user?.id) {
      setChats(readChats(user.id));
    }
  }

  useEffect(() => {
    refresh();
  }, [user?.id]);

  function deleteChat(id) {

    const updated = chats.filter(
      chat => chat.id !== id
    );

    writeChats(user.id, updated);

    setChats(updated);

  }

  const filtered = chats.filter(chat =>
    (chat.title || '').toLowerCase()
      .includes(search.toLowerCase())
  );

  function formatDate(timestamp) {

    if (!timestamp) return '';

    return new Date(timestamp).toLocaleString(
      undefined,
      {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    );

  }

  return (

    <div className="page">

      <div className="page-head">

        <div>
          <span className="eyebrow">
            YOUR PERSONAL ARCHIVE
          </span>

          <h1>Chat history</h1>

          <p>
            Revisit your conversations with Niko.
          </p>
        </div>

        <button
          className="btn primary"
          onClick={() => navigate(`/app/chat?new=${Date.now()}`)}
        >
          <Plus size={16} />
          New chat
        </button>

      </div>

      <div className="composer" style={{ marginBottom: 22 }}>

        <div className="composer-tools">
          <Search size={17} />
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search conversations..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--brown)',
            fontSize: 13,
            padding: 10
          }}
        />

        {search && (
          <button
            className="icon-btn"
            onClick={() => setSearch('')}
          >
            <X size={15} />
          </button>
        )}

      </div>

      {filtered.length === 0 ? (

        <div className="empty-state">

          <History size={34} />

          <h2>
            {search
              ? 'No matching conversations'
              : 'Your story starts here.'}
          </h2>

          <p>
            {search
              ? 'Try another search term.'
              : 'Your saved conversations will appear here when you start chatting with Niko.'}
          </p>

          {!search && (

            <button
              className="btn primary"
              onClick={() => navigate('/app/chat')}
            >
              Start a conversation
              <ChevronRight size={15} />
            </button>

          )}

        </div>

      ) : (

        <div className="history-list">

          {filtered.map(chat => (

            <div
              className="history-item"
              key={chat.id}
            >

              <div
                className="history-main"
                onClick={() => navigate(`/app/chat?id=${chat.id}`)}
                style={{ cursor: 'pointer', flex: 1 }}
              >

                <div className="history-icon">
                  <MessageSquare size={18} />
                </div>

                <div style={{ minWidth: 0 }}>

                  <h3>{chat.title || 'New conversation'}</h3>

                  <p>
                    {formatDate(chat.updatedAt)}
                    {' · '}
                    {chat.messages?.length || 0} messages
                  </p>

                </div>

              </div>

              <div className="history-actions">

                <button
                  title="Open conversation"
                  onClick={() => navigate(`/app/chat?id=${chat.id}`)}
                >
                  <ChevronRight size={18} />
                </button>

                <button
                  className="delete"
                  title="Delete conversation"
                  onClick={() => deleteChat(chat.id)}
                >
                  <Trash2 size={16} />
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}


/* =========================================================
   VOICE ASSISTANT
========================================================= */

function Voice() {

  const [listening, setListening] = useState(false);

  const [text, setText] = useState('');

  const [language, setLanguage] = useState('en-IN');

  const recognitionRef = useRef(null);

  useEffect(() => {

    return () => {
      recognitionRef.current?.stop();
    };

  }, []);

  function toggle() {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      setText(
        'Speech recognition is not supported in this browser.'
      );

      return;

    }

    if (listening) {

      recognitionRef.current?.stop();

      setListening(false);

      return;

    }

    const recognition = new SpeechRecognition();

    recognitionRef.current = recognition;

    recognition.lang = language;

    recognition.interimResults = true;

    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      setText('');
    };

    recognition.onresult = event => {

      setText(
        Array.from(event.results)
          .map(result => result[0].transcript)
          .join('')
      );

    };

    recognition.onerror = event => {

      setText(
        `Voice error: ${event.error}`
      );

      setListening(false);

    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();

  }

  function speak() {

    if (!text || !('speechSynthesis' in window)) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = language;

    utterance.rate = 1;

    utterance.pitch = 1;

    speechSynthesis.speak(utterance);

  }

  function stopSpeech() {

    speechSynthesis.cancel();

  }

  function sendToChat() {

    if (!text.trim()) return;

    sessionStorage.setItem(
      'niko_voice_message',
      text
    );

    window.location.href = '/app/chat';

  }

  return (

    <div className="page">

      <div className="page-head">

        <div>
          <span className="eyebrow">
            NATURAL CONVERSATION
          </span>

          <h1>Voice studio</h1>

          <p>
            Speak naturally. Let Niko listen.
          </p>
        </div>

      </div>

      <div className="voice-stage">

        <div
          className={
            listening
              ? 'voice-orb listening'
              : 'voice-orb'
          }
        >

          <div className="voice-core">
            <Mic2 size={42} />
          </div>

        </div>

        <span className="voice-state">
          {listening
            ? 'Listening to you...'
            : 'Ready when you are'}
        </span>

        <h2>
          {text || 'What would you like to say?'}
        </h2>

        <div className="voice-actions">

          <button
            className="btn primary"
            onClick={toggle}
          >

            {listening
              ? <Square size={15} />
              : <Mic2 size={15} />}

            {listening
              ? 'Stop listening'
              : 'Start speaking'}

          </button>

          <button
            className="btn ghost"
            onClick={speak}
            disabled={!text}
          >
            <Volume2 size={16} />
            Speak text
          </button>

          <button
            className="btn ghost"
            onClick={stopSpeech}
          >
            <StopCircle size={16} />
            Stop audio
          </button>

        </div>

        <div style={{ marginTop: 28 }}>

          <label
            style={{
              fontSize: 11,
              color: 'var(--muted)'
            }}
          >
            Recognition language &nbsp;

            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 7,
                padding: 8,
                color: 'var(--brown)'
              }}
            >
              <option value="en-IN">English (India)</option>
              <option value="hi-IN">Hindi</option>
              <option value="en-US">English (US)</option>
            </select>

          </label>

        </div>

        {text && (

          <div style={{ marginTop: 25 }}>

            <button
              className="btn primary"
              onClick={sendToChat}
            >
              Send to chat
              <Send size={15} />
            </button>

          </div>

        )}

        <p className="muted center" style={{ marginTop: 25 }}>
          Voice uses your browser's speech recognition
          and speech synthesis capabilities.
        </p>

      </div>

    </div>

  );

}


/* =========================================================
   PROFILE
========================================================= */

function Profile() {

  const { user } = useAuth();

  const name =
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Niko user';

  const initial = name[0].toUpperCase();

  const chats = readChats(user?.id);

  return (

    <div className="page">

      <div className="page-head">

        <div>
          <span className="eyebrow">
            YOUR ACCOUNT
          </span>

          <h1>Profile</h1>

          <p>
            Your personal Niko account.
          </p>
        </div>

      </div>

      <div className="profile-card">

        <div className="profile-avatar">
          {initial}
        </div>

        <div>

          <span className="eyebrow">
            NIKO MEMBER
          </span>

          <h2>{name}</h2>

          <p>{user?.email}</p>

          <span
            style={{
              fontSize: 10,
              color: 'var(--success)',
              fontWeight: 700
            }}
          >
            <Check size={12} style={{ display: 'inline' }} />
            &nbsp; Account authenticated
          </span>

        </div>

      </div>

      <div className="profile-info">

        <h3>Account information</h3>

        <div className="profile-row">
          <span>Full name</span>
          <strong>{name}</strong>
        </div>

        <div className="profile-row">
          <span>Email address</span>
          <strong>{user?.email}</strong>
        </div>

        <div className="profile-row">
          <span>Account provider</span>
          <strong>Supabase</strong>
        </div>

        <div className="profile-row">
          <span>Saved conversations</span>
          <strong>{chats.length}</strong>
        </div>

      </div>

      <div className="profile-info">

        <h3>About Niko</h3>

        <p
          className="muted"
          style={{ lineHeight: 1.9 }}
        >
          Niko is your personal AI workspace for
          thoughtful conversations, creativity,
          learning and everyday assistance.
        </p>

      </div>

    </div>

  );

}


/* =========================================================
   MAIN APP
========================================================= */

function App() {

  return (

    <AuthProvider>

      <style>{styles}</style>

      <Routes>

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<AuthPage />}
        />

        <Route
          path="/signup"
          element={<AuthPage signup />}
        />

        <Route
          path="/app"
          element={<Navigate to="/app/chat" replace />}
        />

        <Route
          path="/app/chat"
          element={
            <Protected>
              <Shell>
                <Chat />
              </Shell>
            </Protected>
          }
        />

        <Route
          path="/app/history"
          element={
            <Protected>
              <Shell>
                <ChatHistory />
              </Shell>
            </Protected>
          }
        />

        <Route
          path="/app/voice"
          element={
            <Protected>
              <Shell>
                <Voice />
              </Shell>
            </Protected>
          }
        />

        <Route
          path="/app/profile"
          element={
            <Protected>
              <Shell>
                <Profile />
              </Shell>
            </Protected>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </AuthProvider>

  );

}


/* =========================================================
   RENDER
========================================================= */

createRoot(
  document.getElementById('root')
).render(

  <BrowserRouter>
    <App />
  </BrowserRouter>

);
