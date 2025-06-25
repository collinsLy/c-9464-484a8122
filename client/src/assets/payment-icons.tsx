
import { SVGProps } from 'react';
import { MpesaIcon, AirtelMoneyIcon } from './mobile-money-icons';

export { MpesaIcon, AirtelMoneyIcon };

export const VisaIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M44 35H4V13H44V35Z" fill="#1A1F71"/>
    <path d="M19.128 27.208L20.607 20.778H22.702L21.223 27.208H19.128Z" fill="#FFFFFF"/>
    <path d="M27.8 21.013C27.389 20.863 26.733 20.7 25.911 20.7C24.089 20.7 22.778 21.65 22.767 23.013C22.744 24.013 23.689 24.575 24.411 24.9C25.156 25.238 25.389 25.45 25.389 25.738C25.378 26.175 24.833 26.375 24.333 26.375C23.633 26.375 23.244 26.275 22.633 26.013L22.389 25.9L22.122 27.675C22.611 27.875 23.522 28.05 24.478 28.063C26.422 28.063 27.7 27.125 27.722 25.675C27.733 24.888 27.211 24.288 26.122 23.775C25.467 23.438 25.067 23.213 25.067 22.888C25.067 22.6 25.4 22.3 26.122 22.3C26.722 22.288 27.167 22.413 27.511 22.538L27.678 22.613L27.8 21.013Z" fill="#FFFFFF"/>
    <path d="M31.944 20.778H33.589L35.544 27.208H33.544C33.544 27.208 33.333 26.483 33.278 26.295H30.389C30.311 26.433 29.944 27.208 29.944 27.208H27.722L30.944 21.245C31.189 20.77 31.544 20.778 31.944 20.778ZM33.022 24.758C32.889 24.395 32.156 22.508 32.156 22.508C32.144 22.508 31.967 22.07 31.856 21.808L31.733 22.445C31.733 22.445 31.244 24.47 31.167 24.758H33.022Z" fill="#FFFFFF"/>
    <path d="M16.544 24.758L16.122 23.313C15.667 22.075 14.544 20.738 13.289 20.075L15.233 27.195H17.344L20.733 20.778H18.622L16.544 24.758Z" fill="#FFFFFF"/>
    <path d="M14.211 20.778H11.011L11 20.913C13.544 21.563 15.211 22.938 15.989 24.575L15.344 21.313C15.233 20.838 14.756 20.79 14.211 20.778Z" fill="#F7B600"/>
  </svg>
);

export const MastercardIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="18" cy="24" r="12" fill="#EB001B"/>
    <circle cx="30" cy="24" r="12" fill="#F79E1B"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M24 32.771C26.887 30.382 28.678 26.889 28.678 23C28.678 19.111 26.887 15.618 24 13.229C21.113 15.618 19.322 19.111 19.322 23C19.322 26.889 21.113 30.382 24 32.771Z" fill="#FF5F00"/>
  </svg>
);

export const PayPalIcon = (props: SVGProps<SVGSVGElement>) => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/0/0e/PayPal_2024_%28Icon%29.svg" 
    alt="PayPal Logo 2024" 
    {...props} 
  />
);

export const BankIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M24 12L36 18V20H12V18L24 12Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M14 22H16V32H14V22ZM22 22H20V32H22V22ZM26 22H28V32H26V22ZM34 22H32V32H34V22Z" fill="currentColor"/>
    <path d="M12 34H36V36H12V34Z" fill="currentColor"/>
  </svg>
);