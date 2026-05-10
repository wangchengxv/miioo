import { useState } from 'react';
import { PulsingBorder } from '@paper-design/shaders-react';
import bgImage from '../assets/home-bg.png';
import PrimaryNav from '../components/PrimaryNav';

const ICON_STYLE = { flexShrink: '0' };

const NAV_ITEMS = [
  {
    key: 'home',
    label: '首页',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={ICON_STYLE}>
        <path d="M3 6V14H13V6L8 2L3 6Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.333 9.667V14H9.667V9.667H6.333Z" stroke="#FFFFFF" strokeLinejoin="round" />
        <path d="M3 14H13" stroke="#FFFFFF" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'project',
    label: '项目',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={ICON_STYLE}>
        <path d="M1.667 3C1.667 2.632 1.965 2.333 2.333 2.333H6.333L8 4.333H13.666C14.035 4.333 14.333 4.632 14.333 5V13.667C14.333 14.035 14.035 14.333 13.666 14.333H2.333C1.965 14.333 1.667 14.035 1.667 13.667V3Z" stroke="#FFFFFF" strokeLinejoin="round" />
        <path d="M5.983 9.333H9.983" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'create',
    label: '创作',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={ICON_STYLE}>
        <path d="M6.334 2.667L9.334 5.333L12.678 3.37L11 7L14 9.667L10 9.333L8.5 12.667L7.667 9L3.667 8.667L7.17 6.55L6.334 2.667Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.667 14.007L7.667 9" stroke="#FFFFFF" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'assets',
    label: '资产',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={ICON_STYLE}>
        <path d="M1.667 2.667C1.667 2.298 1.965 2 2.333 2H6.333L8 4H13.667C14.035 4 14.333 4.298 14.333 4.667V13.333C14.333 13.701 14.035 14 13.667 14H2.333C1.965 14 1.667 13.701 1.667 13.333V2.667Z" stroke="#FFFFFF" strokeLinejoin="round" />
        <path d="M8 6.667L8.748 8.304L10.536 8.509L9.21 9.726L9.567 11.491L8 10.605L6.433 11.491L6.79 9.726L5.464 8.509L7.252 8.304L8 6.667Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const BOTTOM_NAV_ITEMS = [
  {
    key: 'apps',
    label: '应用',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={ICON_STYLE}>
        <path d="M14 2H10.667V5.333H14V2Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 10.667H10.667V14H14V10.667Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.333 10.667H2V14H5.333V10.667Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.333 2H2V5.333H5.333V2Z" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.667 8H10" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.667 8H13.334" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 12.333V13" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 5.667V10.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 2.667V3.333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'notifications',
    label: '通知',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={ICON_STYLE}>
        <path d="M3.8 12.2H3.3V12.7H3.8V12.2ZM12.2 12.2V12.7H12.7V12.2H12.2ZM2 11.7C1.724 11.7 1.5 11.924 1.5 12.2C1.5 12.476 1.724 12.7 2 12.7V12.2V11.7ZM14 12.7C14.276 12.7 14.5 12.476 14.5 12.2C14.5 11.924 14.276 11.7 14 11.7V12.2V12.7ZM9.5 12.2H10C10 11.924 9.776 11.7 9.5 11.7V12.2ZM6.5 12.2V11.7C6.224 11.7 6 11.924 6 12.2H6.5ZM8 2V1.5C5.404 1.5 3.3 3.604 3.3 6.2H3.8H4.3C4.3 4.157 5.957 2.5 8 2.5V2ZM3.8 6.2H3.3V12.2H3.8H4.3V6.2H3.8ZM3.8 12.2V12.7H12.2V12.2V11.7H3.8V12.2ZM12.2 12.2H12.7V6.2H12.2H11.7V12.2H12.2ZM12.2 6.2H12.7C12.7 3.604 10.596 1.5 8 1.5V2V2.5C10.043 2.5 11.7 4.157 11.7 6.2H12.2ZM2 12.2V12.7H14V12.2V11.7H2V12.2ZM8 14V14.5C9.105 14.5 10 13.605 10 12.5H9.5H9C9 13.052 8.552 13.5 8 13.5V14ZM9.5 12.5H10V12.2H9.5H9V12.5H9.5ZM9.5 12.2V11.7H6.5V12.2V12.7H9.5V12.2ZM6.5 12.2H6V12.5H6.5H7V12.2H6.5ZM6.5 12.5H6C6 13.605 6.895 14.5 8 14.5V14V13.5C7.448 13.5 7 13.052 7 12.5H6.5Z" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    key: 'api',
    label: 'API',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={ICON_STYLE}>
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="#FFFFFF" />
        <path d="M4.98 6.364L4.452 8.248C4.448 8.26 4.45 8.272 4.458 8.284C4.466 8.296 4.476 8.302 4.488 8.302H5.484C5.496 8.302 5.506 8.296 5.514 8.284C5.522 8.272 5.524 8.26 5.52 8.248L4.992 6.364C4.992 6.36 4.99 6.358 4.986 6.358C4.982 6.358 4.98 6.36 4.98 6.364ZM3.426 10C3.342 10 3.276 9.966 3.228 9.898C3.18 9.83 3.17 9.756 3.198 9.676L4.44 5.944C4.476 5.848 4.534 5.77 4.614 5.71C4.698 5.65 4.79 5.62 4.89 5.62H5.106C5.21 5.62 5.302 5.65 5.382 5.71C5.466 5.77 5.524 5.848 5.556 5.944L6.798 9.676C6.826 9.756 6.816 9.83 6.768 9.898C6.72 9.966 6.654 10 6.57 10H6.354C6.258 10 6.168 9.97 6.084 9.91C6.004 9.846 5.95 9.766 5.922 9.67L5.73 8.992C5.726 8.96 5.704 8.944 5.664 8.944H4.308C4.272 8.944 4.25 8.96 4.242 8.992L4.05 9.67C4.026 9.766 3.972 9.846 3.888 9.91C3.808 9.97 3.718 10 3.618 10H3.426ZM8.222 6.304V7.75C8.222 7.778 8.238 7.796 8.27 7.804C8.422 7.824 8.57 7.834 8.714 7.834C9.038 7.834 9.284 7.764 9.452 7.624C9.624 7.48 9.71 7.276 9.71 7.012C9.71 6.48 9.378 6.214 8.714 6.214C8.57 6.214 8.422 6.224 8.27 6.244C8.238 6.252 8.222 6.272 8.222 6.304ZM7.73 10C7.638 10 7.558 9.966 7.49 9.898C7.426 9.83 7.394 9.75 7.394 9.658V5.992C7.394 5.896 7.426 5.81 7.49 5.734C7.554 5.658 7.634 5.616 7.73 5.608C8.07 5.576 8.398 5.56 8.714 5.56C9.314 5.56 9.764 5.68 10.064 5.92C10.364 6.156 10.514 6.5 10.514 6.952C10.514 7.452 10.368 7.83 10.076 8.086C9.788 8.342 9.36 8.47 8.792 8.47C8.66 8.47 8.486 8.462 8.27 8.446C8.238 8.446 8.222 8.462 8.222 8.494V9.658C8.222 9.75 8.188 9.83 8.12 9.898C8.052 9.966 7.972 10 7.88 10H7.73ZM11.623 10C11.531 10 11.451 9.966 11.383 9.898C11.316 9.83 11.281 9.75 11.281 9.658V5.962C11.281 5.87 11.316 5.79 11.383 5.722C11.451 5.654 11.531 5.62 11.623 5.62H11.864C11.956 5.62 12.036 5.654 12.104 5.722C12.171 5.79 12.206 5.87 12.206 5.962V9.658C12.206 9.75 12.171 9.83 12.104 9.898C12.036 9.966 11.956 10 11.864 10H11.623Z" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    key: 'menu',
    label: '菜单',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={ICON_STYLE}>
        <path d="M2.65 3.983H13.317" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.65 7.983H13.317" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.65 11.983H13.317" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const BG_URL = bgImage;

const CMB_ICON_DEFAULT = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: '0' }}>
    <path d="M3.33329 14.6667H12.6666C13.0348 14.6667 13.3333 14.3682 13.3333 14V4.66671H9.99996V1.33337H3.33329C2.9651 1.33337 2.66663 1.63185 2.66663 2.00004V14C2.66663 14.3682 2.9651 14.6667 3.33329 14.6667Z" fill="#2DC3E1" stroke="#2DC3E1" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 1.33337L13.3333 4.66671" stroke="#2DC3E1" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.96918 9.92307C6.92086 10.0698 6.89669 10.1427 6.85699 10.1561C6.83963 10.1619 6.82084 10.1619 6.80348 10.1561C6.76379 10.1427 6.73961 10.0698 6.69129 9.92307C6.4902 9.31032 6.38922 9.00394 6.19936 8.76143C6.11177 8.64967 6.01079 8.5487 5.89903 8.4611C5.65652 8.27123 5.35015 8.17026 4.7374 7.96918C4.59068 7.92085 4.51776 7.89669 4.50438 7.85698C4.49856 7.83962 4.49856 7.82083 4.50438 7.80347C4.51776 7.76378 4.59068 7.73961 4.7374 7.69128C5.35015 7.49019 5.65652 7.38922 5.89903 7.19936C6.01122 7.11176 6.11176 7.01079 6.19936 6.89902C6.38923 6.65608 6.4902 6.34971 6.69129 5.73739C6.73961 5.59068 6.76378 5.51775 6.80348 5.50437C6.82084 5.49855 6.83963 5.49855 6.85699 5.50437C6.89669 5.51775 6.92086 5.59068 6.96918 5.73739C7.17027 6.35014 7.27125 6.65651 7.46111 6.89902C7.54874 7.01075 7.64959 7.11145 7.76144 7.19892C8.00439 7.38922 8.31076 7.49019 8.92351 7.69171C9.06979 7.73961 9.14272 7.76377 9.15652 7.8039C9.16225 7.82113 9.16225 7.83975 9.15652 7.85698C9.14272 7.89668 9.06979 7.92085 8.92351 7.96918C8.31076 8.17026 8.00438 8.27124 7.76144 8.4611C7.64968 8.54869 7.54914 8.64967 7.46154 8.76143C7.27168 9.00438 7.17027 9.31032 6.96918 9.92307ZM10.0295 11.1676C9.99754 11.2651 9.98158 11.3138 9.95483 11.3229C9.94334 11.3267 9.93093 11.3267 9.91944 11.3229C9.89269 11.3138 9.87672 11.2651 9.84479 11.1676C9.71059 10.7589 9.64328 10.5548 9.51684 10.393C9.45815 10.3183 9.39084 10.251 9.31618 10.1928C9.15436 10.0659 8.95026 9.99859 8.54205 9.86482C8.44453 9.83245 8.39534 9.81649 8.38671 9.78973C8.38289 9.77825 8.38289 9.76583 8.38671 9.75435C8.39534 9.7276 8.4441 9.71163 8.54205 9.6797C8.95026 9.54507 9.1548 9.47818 9.31618 9.35175C9.39079 9.2932 9.45802 9.22582 9.5164 9.15109C9.64327 8.98927 9.71058 8.78517 9.84436 8.37653C9.87672 8.27901 9.89268 8.23025 9.91944 8.22119C9.93093 8.21737 9.94334 8.21737 9.95483 8.22119C9.98158 8.23025 9.99754 8.27901 10.0295 8.37653C10.1641 8.78517 10.231 8.98928 10.3579 9.15109C10.4163 9.22567 10.4835 9.29289 10.5581 9.35131C10.7199 9.47818 10.924 9.54549 11.3326 9.67926C11.4302 9.71163 11.4789 9.72759 11.488 9.75435C11.4918 9.76583 11.4918 9.77825 11.488 9.78973C11.4789 9.81648 11.4302 9.83245 11.3326 9.86438C10.924 9.99901 10.7199 10.0659 10.5581 10.1928C10.4834 10.251 10.4161 10.3183 10.3579 10.393C10.231 10.5548 10.1637 10.7589 10.0299 11.1675L10.0295 11.1676ZM7.85897 12.3918C7.83869 12.4526 7.82876 12.4832 7.81236 12.4888C7.80509 12.4913 7.7972 12.4913 7.78993 12.4888C7.77353 12.4832 7.76318 12.4526 7.74333 12.3918C7.65918 12.1363 7.61733 12.009 7.53793 11.9076C7.50168 11.861 7.45983 11.8191 7.41279 11.7825C7.31181 11.7035 7.18408 11.6616 6.92906 11.5775C6.86822 11.5572 6.83758 11.5473 6.83197 11.5309C6.8295 11.5236 6.8295 11.5157 6.83197 11.5085C6.83758 11.4921 6.86822 11.4821 6.92906 11.4618C7.18408 11.3777 7.31181 11.3358 7.41322 11.2569C7.45982 11.2204 7.50184 11.1783 7.53836 11.1317C7.61733 11.0303 7.65918 10.903 7.74333 10.6476C7.76318 10.5867 7.77353 10.5561 7.78993 10.5505C7.7972 10.548 7.80509 10.548 7.81236 10.5505C7.82876 10.5561 7.83869 10.5867 7.85897 10.6476C7.94268 10.903 7.98497 11.0303 8.06394 11.1317C8.10045 11.1784 8.14246 11.2204 8.18908 11.2569C8.29005 11.3358 8.41778 11.3777 8.67323 11.4618C8.73408 11.4821 8.76472 11.4921 8.77033 11.5085C8.77279 11.5157 8.77279 11.5236 8.77033 11.5309C8.76472 11.5473 8.73408 11.5572 8.67323 11.5775C8.41778 11.6612 8.29005 11.7035 8.18908 11.7825C8.14246 11.819 8.10045 11.861 8.06394 11.9076C7.98497 12.009 7.94311 12.1363 7.85897 12.3918Z" fill="white" />
  </svg>
);

const CMB_ICON_HOVER = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: '0' }}>
    <defs>
      <linearGradient id="cmb-h0" x1="8" y1="0.833" x2="8" y2="15.166" gradientUnits="userSpaceOnUse"><stop stopColor="#7AE5B9"/><stop offset="1" stopColor="#2DC3E1"/></linearGradient>
      <linearGradient id="cmb-h1" x1="8" y1="0.833" x2="8" y2="15.166" gradientUnits="userSpaceOnUse"><stop stopColor="#7AE5B9"/><stop offset="1" stopColor="#2DC3E1"/></linearGradient>
      <linearGradient id="cmb-h2" x1="8" y1="1.333" x2="8" y2="14.667" gradientUnits="userSpaceOnUse"><stop stopColor="#7AE5B9"/><stop offset="1" stopColor="#2DC3E1"/></linearGradient>
      <linearGradient id="cmb-h3" x1="8" y1="0.833" x2="8" y2="15.166" gradientUnits="userSpaceOnUse"><stop stopColor="#7AE5B9"/><stop offset="1" stopColor="#2DC3E1"/></linearGradient>
      <linearGradient id="cmb-h4" x1="8" y1="1.333" x2="8" y2="14.667" gradientUnits="userSpaceOnUse"><stop stopColor="#7AE5B9"/><stop offset="1" stopColor="#2DC3E1"/></linearGradient>
    </defs>
    <path d="M9.646 0.98C9.842 0.785 10.158 0.785 10.354 0.98L13.687 4.313C13.882 4.508 13.882 4.825 13.687 5.02C13.491 5.215 13.175 5.215 12.979 5.02L9.646 1.687C9.451 1.492 9.451 1.175 9.646 0.98Z" fill="url(#cmb-h0)" />
    <path d="M3.333 14.667H12.667C13.035 14.667 13.333 14.368 13.333 14V4.667H10V1.333H3.333C2.965 1.333 2.667 1.632 2.667 2V14C2.667 14.368 2.965 14.667 3.333 14.667Z" fill="url(#cmb-h1)" />
    <path d="M3.333 14.667H12.667C13.035 14.667 13.333 14.368 13.333 14V4.667H10V1.333H3.333C2.965 1.333 2.667 1.632 2.667 2V14C2.667 14.368 2.965 14.667 3.333 14.667Z" fill="url(#cmb-h2)" />
    <path d="M2.167 14V2C2.167 1.356 2.689 0.833 3.334 0.833H10C10.276 0.833 10.5 1.057 10.5 1.333V4.166H13.334C13.61 4.167 13.833 4.391 13.834 4.666V14C13.833 14.645 13.311 15.166 12.667 15.166H3.334C2.689 15.166 2.167 14.645 2.167 14ZM3.167 14C3.167 14.092 3.242 14.166 3.334 14.166H12.667C12.759 14.166 12.833 14.092 12.834 14V5.166H10C9.724 5.166 9.5 4.942 9.5 4.666V1.833H3.334C3.242 1.833 3.167 1.908 3.167 2V14Z" fill="url(#cmb-h3)" />
    <path d="M2.167 14V2C2.167 1.356 2.689 0.833 3.334 0.833H10C10.276 0.833 10.5 1.057 10.5 1.333V4.166H13.334C13.61 4.167 13.833 4.391 13.834 4.666V14C13.833 14.645 13.311 15.166 12.667 15.166H3.334C2.689 15.166 2.167 14.645 2.167 14ZM3.167 14C3.167 14.092 3.242 14.166 3.334 14.166H12.667C12.759 14.166 12.833 14.092 12.834 14V5.166H10C9.724 5.166 9.5 4.942 9.5 4.666V1.833H3.334C3.242 1.833 3.167 1.908 3.167 2V14Z" fill="url(#cmb-h4)" />
    <path d="M6.969 9.923C6.921 10.07 6.897 10.143 6.857 10.156C6.84 10.162 6.821 10.162 6.803 10.156C6.764 10.143 6.74 10.07 6.691 9.923C6.49 9.31 6.389 9.004 6.199 8.761C6.112 8.65 6.011 8.549 5.899 8.461C5.657 8.271 5.35 8.17 4.737 7.969C4.591 7.921 4.518 7.897 4.504 7.857C4.499 7.84 4.499 7.821 4.504 7.803C4.518 7.764 4.591 7.74 4.737 7.691C5.35 7.49 5.657 7.389 5.899 7.199C6.011 7.112 6.112 7.011 6.199 6.899C6.389 6.656 6.49 6.35 6.691 5.737C6.74 5.591 6.764 5.518 6.803 5.504C6.821 5.499 6.84 5.499 6.857 5.504C6.897 5.518 6.921 5.591 6.969 5.737C7.17 6.35 7.271 6.657 7.461 6.899C7.549 7.011 7.65 7.111 7.761 7.199C8.004 7.389 8.311 7.49 8.924 7.692C9.07 7.74 9.143 7.764 9.157 7.804C9.162 7.821 9.162 7.84 9.157 7.857C9.143 7.897 9.07 7.921 8.924 7.969C8.311 8.17 8.004 8.271 7.761 8.461C7.65 8.549 7.549 8.65 7.462 8.761C7.272 9.004 7.17 9.31 6.969 9.923ZM10.03 11.168C9.998 11.265 9.982 11.314 9.955 11.323C9.943 11.327 9.931 11.327 9.919 11.323C9.893 11.314 9.877 11.265 9.845 11.168C9.711 10.759 9.643 10.555 9.517 10.393C9.458 10.318 9.391 10.251 9.316 10.193C9.154 10.066 8.95 9.999 8.542 9.865C8.445 9.832 8.395 9.816 8.387 9.79C8.383 9.778 8.383 9.766 8.387 9.754C8.395 9.728 8.444 9.712 8.542 9.68C8.95 9.545 9.155 9.478 9.316 9.352C9.391 9.293 9.458 9.226 9.516 9.151C9.643 8.989 9.711 8.785 9.844 8.377C9.877 8.279 9.893 8.23 9.919 8.221C9.931 8.217 9.943 8.217 9.955 8.221C9.982 8.23 9.998 8.279 10.03 8.377C10.164 8.785 10.231 8.989 10.358 9.151C10.416 9.226 10.483 9.293 10.558 9.351C10.72 9.478 10.924 9.545 11.333 9.679C11.43 9.712 11.479 9.728 11.488 9.754C11.492 9.766 11.492 9.778 11.488 9.79C11.479 9.816 11.43 9.832 11.333 9.864C10.924 9.999 10.72 10.066 10.558 10.193C10.483 10.251 10.416 10.318 10.358 10.393C10.231 10.555 10.164 10.759 10.03 11.168ZM7.859 12.392C7.839 12.453 7.829 12.483 7.812 12.489C7.805 12.491 7.797 12.491 7.79 12.489C7.774 12.483 7.763 12.453 7.743 12.392C7.659 12.136 7.617 12.009 7.538 11.908C7.502 11.861 7.46 11.819 7.413 11.783C7.312 11.704 7.184 11.662 6.929 11.578C6.868 11.557 6.838 11.547 6.832 11.531C6.83 11.524 6.83 11.516 6.832 11.508C6.838 11.492 6.868 11.482 6.929 11.462C7.184 11.378 7.312 11.336 7.413 11.257C7.46 11.22 7.502 11.178 7.538 11.132C7.617 11.03 7.659 10.903 7.743 10.648C7.763 10.587 7.774 10.556 7.79 10.55C7.797 10.548 7.805 10.548 7.812 10.55C7.829 10.556 7.839 10.587 7.859 10.648C7.943 10.903 7.985 11.03 8.064 11.132C8.1 11.178 8.142 11.22 8.189 11.257C8.29 11.336 8.418 11.378 8.673 11.462C8.734 11.482 8.765 11.492 8.77 11.508C8.773 11.516 8.773 11.524 8.77 11.531C8.765 11.547 8.734 11.557 8.673 11.578C8.418 11.661 8.29 11.704 8.189 11.783C8.142 11.819 8.1 11.861 8.064 11.908C7.985 12.009 7.943 12.136 7.859 12.392Z" fill="#FFFFFF" />
  </svg>
);

function CreationManualButton() {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const showDefault = !hovered || pressed;

  return (
    <button
      type="button"
      className="flex items-center rounded-[7px] gap-1 h-9 py-0 bg-transparent border-0 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {showDefault ? CMB_ICON_DEFAULT : CMB_ICON_HOVER}
      {showDefault ? (
        <div className="inline-block w-max shrink-0 font-['AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] text-[#2DC3E1] text-sm/4.5">
          创作手册
        </div>
      ) : (
        <div className="inline-block w-max shrink-0 font-['AlibabaPuHuiTi_2_65_Medium','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] font-medium text-transparent bg-clip-text text-sm/4.5" style={{ backgroundImage: 'linear-gradient(in oklab 180deg, oklab(84.6% -0.114 0.031) 0%, oklab(75.5% -0.102 -0.072) 100%)' }}>
          创作手册
        </div>
      )}
    </button>
  );
}

function LoginButton() {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      className="flex flex-col h-[36px] shrink-0 rounded-full p-px relative overflow-hidden cursor-pointer border-0 bg-transparent"
      style={{
        boxShadow: pressed ? 'none' : '#00000066 3px 3px 8px',
        transition: 'box-shadow 120ms ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {/* outer gradient layers */}
      <span className="absolute inset-0 rounded-full" style={{ backgroundImage: 'linear-gradient(in oklab 148.76deg, oklab(100% 0 0 / 70%) 3.64%, oklab(56.7% 0 0 / 30%) 42.81%)', opacity: pressed ? 0 : hovered ? 0 : 1, transition: 'opacity 150ms ease' }} />
      <span className="absolute inset-0 rounded-full" style={{ backgroundImage: 'linear-gradient(in oklab 183.38deg, oklab(100% 0 0 / 90%) -10.72%, oklab(56.7% 0 0 / 30%) 41.97%)', opacity: hovered && !pressed ? 1 : 0, transition: 'opacity 150ms ease' }} />
      <span className="absolute inset-0 rounded-full" style={{ backgroundImage: 'linear-gradient(in oklab 228.51deg, oklab(100% 0 0 / 40%) 11.17%, oklab(56.7% 0 0 / 30%) 45.43%)', opacity: pressed ? 1 : 0, transition: 'opacity 150ms ease' }} />

      {/* inner fill */}
      <div className="flex items-center grow shrink basis-[0%] rounded-full px-20 gap-4 self-stretch relative overflow-hidden">
        <span className="absolute inset-0 rounded-full" style={{ backgroundImage: 'linear-gradient(in oklab 180deg, oklab(23.1% 0 0) 0%, oklab(0% 0 0) 100%)', opacity: pressed ? 0 : hovered ? 0 : 1, transition: 'opacity 150ms ease' }} />
        <span className="absolute inset-0 rounded-full" style={{ backgroundImage: 'linear-gradient(in oklab 183.84deg, oklab(38% 0 0) 5.46%, oklab(0% 0 0) 108.34%)', opacity: hovered && !pressed ? 1 : 0, transition: 'opacity 150ms ease' }} />
        <span className="absolute inset-0 rounded-full" style={{ backgroundImage: 'linear-gradient(in oklab 183.84deg, oklab(9.1% 0 0) 5.46%, oklab(0% 0 0) 108.34%)', opacity: pressed ? 1 : 0, transition: 'opacity 150ms ease' }} />
        <span className="inline-block w-max shrink-0 font-['AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] text-white text-sm/4.5 relative">登录</span>
      </div>
    </button>
  );
}

const SECONDARY_TEXT = 'rgba(255, 255, 255, 0.60)';

function StartCreationButton() {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const scale = pressed ? 1 : hovered ? 1.035 : 1;
  const contentColor = pressed ? SECONDARY_TEXT : '#FFFFFF';

  return (
    <div
      className="left-[50%] bottom-[80px] absolute w-[200px] h-[52px]"
      style={{
        translate: '-50%',
        transform: `scale(${scale})`,
        transformOrigin: '50% 50%',
        transition: 'transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      role="button"
      tabIndex={0}
    >
      {/* outer shader bloom — subtle 8px spill onto bg image on hover */}
      <div
        aria-hidden="true"
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: '-8px',
          opacity: hovered && !pressed ? 1 : 0,
          transition: 'opacity 220ms ease',
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(55% 70% at 18% 50%, rgba(0, 197, 239, 0.45) 0%, rgba(0, 197, 239, 0) 75%),' +
              'radial-gradient(55% 70% at 82% 50%, rgba(208, 78, 232, 0.4) 0%, rgba(208, 78, 232, 0) 75%),' +
              'radial-gradient(50% 60% at 50% 50%, rgba(255, 200, 22, 0.32) 0%, rgba(255, 200, 22, 0) 75%)',
            filter: 'blur(8px)',
          }}
        />
      </div>

      <PulsingBorder
        speed={1} roundness={1} thickness={1} softness={1}
        intensity={0.2} bloom={0.28} spots={4} spotSize={0.49}
        pulse={0.25} smoke={0.55} smokeSize={0.6}
        scale={1} rotation={0} aspectRatio="auto"
        colors={['#00C5EF', '#D04EE8', '#FFC816']}
        colorBack="#00000000"
        className="rounded-full absolute inset-0 bg-black"
      />
      <div
        className="flex absolute items-center gap-12 left-[50%] top-[50%] p-0"
        style={{
          translate: '-50% -50%',
          color: contentColor,
          transition: 'color 140ms ease',
        }}
      >
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" style={{ width: '20px', height: '20px', flexShrink: '0' }}>
          <path d="M643.346 393.248c6.186-18.779 9.279-28.114 14.361-29.826a10.715 10.715 0 0 1 6.849 0c5.081 1.712 8.175 11.047 14.361 29.826 25.739 78.432 38.664 117.648 62.966 148.689 11.212 14.306 24.137 27.23 38.443 38.443 31.041 24.303 70.257 37.227 148.689 62.966 18.779 6.186 28.114 9.279 29.826 14.361a10.771 10.771 0 0 1 0 6.849c-1.712 5.081-11.047 8.175-29.826 14.361-78.432 25.739-117.648 38.664-148.689 62.966-14.361 11.212-27.23 24.137-38.443 38.443-24.303 31.097-37.227 70.312-62.966 148.689-6.186 18.779-9.279 28.114-14.361 29.826a10.771 10.771 0 0 1-6.849 0c-5.081-1.712-8.175-11.047-14.361-29.826-25.739-78.432-38.664-117.648-62.966-148.689a225.077 225.077 0 0 0-38.443-38.387c-31.097-24.358-70.312-37.283-148.744-63.077-18.724-6.131-28.059-9.224-29.826-14.361a10.771 10.771 0 0 1 0-6.794c1.767-5.081 11.102-8.175 29.826-14.361 78.432-25.739 117.648-38.664 148.744-62.966 14.306-11.212 27.175-24.137 38.387-38.443 24.303-31.097 37.283-70.257 63.022-148.689zM251.629 233.954c4.087-12.483 6.131-18.724 9.555-19.884a7.18 7.18 0 0 1 4.529 0c3.424 1.16 5.468 7.401 9.555 19.884 17.178 52.306 25.794 78.432 41.978 99.144 7.512 9.555 16.128 18.172 25.684 25.628 20.713 16.239 46.838 24.855 99.089 41.978 12.483 4.143 18.779 6.186 19.884 9.611a7.18 7.18 0 0 1 0 4.529c-1.105 3.424-7.346 5.468-19.884 9.555-52.251 17.233-78.432 25.794-99.089 41.978a150.235 150.235 0 0 0-25.628 25.684c-16.239 20.713-24.855 46.838-41.978 99.144-4.143 12.483-6.186 18.724-9.611 19.884a7.18 7.18 0 0 1-4.529 0c-3.424-1.16-5.468-7.401-9.555-19.884-17.233-52.306-25.794-78.432-42.033-99.144a150.235 150.235 0 0 0-25.628-25.628c-20.713-16.239-46.838-24.855-99.144-41.978-12.483-4.143-18.724-6.186-19.884-9.611a7.18 7.18 0 0 1 0-4.529c1.16-3.424 7.401-5.468 19.884-9.555 52.306-17.233 78.432-25.794 99.144-42.033 9.555-7.457 18.172-16.073 25.628-25.628 16.239-20.713 24.855-46.838 41.978-99.144zM529.454 77.256c2.596-7.788 3.866-11.71 5.965-12.428a4.419 4.419 0 0 1 2.872 0c2.099 0.718 3.424 4.64 5.965 12.428 10.771 32.698 16.128 48.992 26.291 61.972 4.64 5.965 9.997 11.323 16.018 16.018 12.925 10.108 29.274 15.465 61.917 26.236 7.788 2.596 11.71 3.866 12.428 5.965a4.474 4.474 0 0 1 0 2.872c-0.718 2.099-4.64 3.369-12.428 5.965-32.643 10.771-48.992 16.128-61.972 26.236a94.063 94.063 0 0 0-16.018 16.018c-10.108 12.98-15.465 29.274-26.236 61.972-2.541 7.788-3.866 11.71-5.965 12.428a4.419 4.419 0 0 1-2.872 0c-2.099-0.718-3.369-4.64-5.965-12.428-10.715-32.698-16.128-48.992-26.236-61.972a93.897 93.897 0 0 0-16.018-16.018c-12.925-10.108-29.274-15.465-61.972-26.236-7.788-2.596-11.71-3.866-12.428-5.965a4.474 4.474 0 0 1 0-2.872c0.718-2.099 4.64-3.369 12.428-5.965 32.698-10.715 49.047-16.128 61.972-26.236a93.897 93.897 0 0 0 16.018-16.018c10.108-12.98 15.465-29.274 26.236-61.972z" fill="currentColor" />
        </svg>
        <span className="w-fit shrink-0 font-['AlibabaPuHuiTi_2_65_Medium','Alibaba_PuHuiTi_2.0',system-ui,sans-serif] font-medium text-base/5" style={{ color: 'currentColor' }}>开始创作</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeKey, setActiveKey] = useState('home');
  const [bottomActiveKey, setBottomActiveKey] = useState(null);
  const toggleBottom = (key) => setBottomActiveKey((prev) => (prev === key ? null : key));
  return (
    <div className="[font-synthesis:none] overflow-clip w-screen h-screen relative bg-neutral-400 antialiased">
      <div className="absolute bg-cover bg-center inset-0" style={{ backgroundImage: `url(${BG_URL})` }} />
      <div
        className="flex flex-col items-start absolute inset-0"
        style={{ backgroundImage: 'linear-gradient(in oklab 180deg, oklab(0% 0 0 / 0%) 81.58%, oklab(0% 0 0) 100%), linear-gradient(in oklab 90deg, oklab(0% 0 0 / 60%) 0%, oklab(0% 0 0 / 0%) 9.99%)' }}
      >
        {/* headbar */}
        <div className="flex items-center px-32 py-12 justify-between gap-[37px] self-stretch">
          <svg width="80" height="24.15" viewBox="0 0 947 286" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-label="miioo">
            <path d="M335 86H389V286H335V86Z" fill="white"/>
            <path d="M425 86H479V286H425V86Z" fill="white"/>
            <path d="M180 251C180 270.33 164.33 286 145 286C125.67 286 110 270.33 110 251C110 231.67 125.67 216 145 216C164.33 216 180 231.67 180 251Z" fill="#00D4FF"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M0 286L0.00488281 39H0.667969H5.58887C13.9136 68.0675 31.0835 93.3978 54 111.894V286H0Z" fill="white"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M290 286H236V111.894C258.917 93.3978 276.086 68.0674 284.41 39H289.332H289.995L290 286Z" fill="white"/>
            <path d="M655 186C655 163.909 637.091 146 615 146C592.909 146 575 163.909 575 186C575 208.091 592.909 226 615 226V286C559.772 286 515 241.228 515 186C515 130.772 559.772 86 615 86C670.228 86 715 130.772 715 186C715 241.228 670.228 286 615 286V226C637.091 226 655 208.091 655 186Z" fill="white"/>
            <path d="M887 186C887 163.909 869.091 146 847 146C824.909 146 807 163.909 807 186C807 208.091 824.909 226 847 226V286C791.772 286 747 241.228 747 186C747 130.772 791.772 86 847 86C902.228 86 947 130.772 947 186C947 241.228 902.228 286 847 286V226C869.091 226 887 208.091 887 186Z" fill="white"/>
            <path opacity="0.4" d="M423 0C441.225 0 456 14.7746 456 33C456 51.2254 441.225 66 423 66C417.194 66 411.74 64.498 407 61.8652C417.138 56.2337 424 45.4193 424 33C424 20.5805 417.138 9.76525 407 4.13379C411.739 1.50119 417.194 0 423 0Z" fill="#00D4FF"/>
            <path opacity="0.2" d="M455 0C473.225 0 488 14.7746 488 33C488 51.2254 473.225 66 455 66C449.194 66 443.74 64.498 439 61.8652C449.138 56.2337 456 45.4193 456 33C456 20.5805 449.138 9.76525 439 4.13379C443.739 1.50119 449.194 0 455 0ZM423.951 34.7764C423.938 35.0196 423.923 35.2621 423.905 35.5039C423.923 35.2621 423.938 35.0196 423.951 34.7764Z" fill="#00D4FF"/>
            <path opacity="0.6" d="M424 33C424 51.2254 409.225 66 391 66C372.775 66 358 51.2254 358 33C358 14.7746 372.775 0 391 0C409.225 0 424 14.7746 424 33Z" fill="#00D4FF"/>
            <path d="M392 33C392 51.2254 377.225 66 359 66C340.775 66 326 51.2254 326 33C326 14.7746 340.775 0 359 0C377.225 0 392 14.7746 392 33Z" fill="#00D4FF"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M145 144C211.206 144 267.047 99.6278 284.41 39H289.332C289.773 43.6071 290 48.2771 290 53C290 133.081 225.081 198 145 198C64.9189 198 0 133.081 0 53C0 48.2772 0.226074 43.6072 0.667969 39H5.58887C22.9517 99.6278 78.7935 144 145 144Z" fill="white"/>
          </svg>
          <div className="flex items-center gap-16 p-0">
            <CreationManualButton />
            <LoginButton />
          </div>
        </div>

        {/* primary navigation */}
        <div className="flex flex-col items-start gap-0 flex-1 p-0">
          <div className="flex flex-col items-start px-32 py-24 flex-1">
            <PrimaryNav items={NAV_ITEMS} activeKey={activeKey} onChange={setActiveKey} variant="vertical" />
          </div>

          {/* bottom icon group */}
          <div className="px-32 py-24 self-stretch">
            <PrimaryNav
              items={BOTTOM_NAV_ITEMS}
              activeKey={bottomActiveKey}
              onChange={toggleBottom}
              variant="compact"
            />
          </div>
        </div>
      </div>

      {/* start button */}
      <StartCreationButton />
    </div>
  );
}
