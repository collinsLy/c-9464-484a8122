
import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const Credit3DCard: React.FC = () => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState({ month: '05', year: '29' });
  const [cvv, setCvv] = useState('');
  const db = getFirestore();
  
  useEffect(() => {
    // Generate or retrieve a persistent card number for this user
    const fetchOrGenerateCardData = async () => {
      if (auth.currentUser) {
        const userCardRef = doc(db, 'userCards', auth.currentUser.uid);
        const cardDoc = await getDoc(userCardRef);
        
        if (cardDoc.exists()) {
          // Use existing card number
          const cardData = cardDoc.data();
          setCardNumber(cardData.cardNumber || '');
          setExpiryDate({
            month: cardData.expiryMonth || '05',
            year: cardData.expiryYear || '29'
          });
          setCvv(cardData.cvv || '');
        } else {
          // Generate new card number - format: 4XXX XXXX XXXX XXXX (starts with 4 for Visa-like format)
          const newCardNumber = '4' + Array(15).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
          
          // Calculate expiry date (current month + 4 years)
          const now = new Date();
          const expiryMonth = String(now.getMonth() + 1).padStart(2, '0');
          const expiryYear = String((now.getFullYear() + 4) % 100).padStart(2, '0');
          
          // Generate CVV (3 digits)
          const newCvv = Math.floor(100 + Math.random() * 900).toString();
          
          // Save to Firestore
          await setDoc(userCardRef, {
            cardNumber: newCardNumber,
            expiryMonth,
            expiryYear,
            cvv: newCvv,
            createdAt: new Date()
          });
          
          setCardNumber(newCardNumber);
          setExpiryDate({ month: expiryMonth, year: expiryYear });
          setCvv(newCvv);
        }
      } else {
        // Demo mode - generate temporary card number
        const tempCardNumber = '4' + Array(15).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
        const now = new Date();
        const expiryMonth = String(now.getMonth() + 1).padStart(2, '0');
        const expiryYear = String((now.getFullYear() + 4) % 100).padStart(2, '0');
        const tempCvv = Math.floor(100 + Math.random() * 900).toString();
        
        setCardNumber(tempCardNumber);
        setExpiryDate({ month: expiryMonth, year: expiryYear });
        setCvv(tempCvv);
      }
    };
    
    fetchOrGenerateCardData();
  }, [auth.currentUser]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = e.currentTarget.getBoundingClientRect();
    const centerX = card.left + card.width / 2;
    const centerY = card.top + card.height / 2;
    const posX = e.clientX - centerX;
    const posY = e.clientY - centerY;
    
    setRotateY(posX * 0.05);
    setRotateX(-posY * 0.05);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const flipCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full pt-8 pb-8">
      <div 
        className="relative w-full max-w-md h-64 cursor-pointer mb-8"
        style={{ perspective: '1000px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className="w-full h-full relative transition-transform duration-700"
          style={{ 
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isFlipped ? 'rotateY(180deg)' : ''}`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Front of Card */}
          <div 
            className="absolute w-full h-full rounded-xl shadow-xl overflow-hidden"
            style={{ 
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, #3023ae, #53a0fd, #00e5ff)'
            }}
          >
            {/* Card Content - Front */}
            <div className="relative w-full h-full p-6 text-white">
              {/* EMV Chip */}
              <div className="absolute left-6 top-24">
                <div className="w-12 h-9 bg-yellow-700 rounded-md flex items-center justify-center overflow-hidden">
                  <div className="w-10 h-7 bg-yellow-600 rounded-sm flex items-center justify-center">
                    <div className="w-8 h-5 bg-yellow-800"></div>
                  </div>
                </div>
              </div>
              
              {/* NFC Symbol */}
              <div className="absolute left-20 top-28">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12,2 C6.48,2 2,6.48 2,12 C2,17.52 6.48,22 12,22 C17.52,22 22,17.52 22,12" 
                    stroke="white" strokeWidth="1" fill="none" opacity="0.8" />
                  <path d="M12,6 C8.7,6 6,8.7 6,12 C6,15.3 8.7,18 12,18 C15.3,18 18,15.3 18,12" 
                    stroke="white" strokeWidth="1" fill="none" opacity="0.8" />
                  <path d="M12,10 C10.9,10 10,10.9 10,12 C10,13.1 10.9,14 12,14 C13.1,14 14,13.1 14,12" 
                    stroke="white" strokeWidth="1" fill="none" opacity="0.8" />
                </svg>
              </div>
              
              {/* Vertex Logo */}
              <div className="flex items-center space-x-2 mb-8">
                <img src="/favicon.svg" alt="Vertex Logo" className="w-8 h-8" />
                <span className="font-bold text-xl tracking-wider">VERTEX</span>
              </div>
              
              {/* Card Number */}
              <div className="mt-16 tracking-widest text-lg font-medium">
                {cardNumber ? 
                  `•••• •••• •••• ${cardNumber.slice(-4)}` : 
                  `•••• •••• •••• ${auth?.currentUser?.uid?.slice(-4) || Math.floor(1000 + Math.random() * 9000)}`
                }
              </div>
              
              {/* Valid Dates */}
              <div className="mt-4 flex space-x-4">
                <div>
                  <div className="text-xs opacity-70">VALID FROM</div>
                  <div>{new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : new Date().getMonth() + 1}/{new Date().getFullYear().toString().slice(-2)}</div>
                </div>
                <div>
                  <div className="text-xs opacity-70">VALID THRU</div>
                  <div>{expiryDate.month}/{expiryDate.year}</div>
                </div>
              </div>
              
              {/* Cardholder Name */}
              <div className="mt-4">
                <div>{auth?.currentUser?.displayName?.toUpperCase() || "J. SMITH"}</div>
              </div>
              
              {/* Card Network Logo */}
              <div className="absolute bottom-5 right-6">
                <div className="flex">
                  <div className="w-8 h-8 rounded-full bg-orange-500 opacity-80"></div>
                  <div className="w-8 h-8 rounded-full bg-yellow-500 opacity-80 -ml-3"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Back of Card */}
          <div 
            className="absolute w-full h-full rounded-xl shadow-xl overflow-hidden"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, #3023ae, #53a0fd, #00e5ff)'
            }}
          >
            {/* Card Content - Back */}
            <div className="relative w-full h-full text-white">
              {/* Magnetic Strip */}
              <div className="w-full h-12 bg-black bg-opacity-80 mt-5"></div>
              
              {/* Signature Strip */}
              <div className="mx-4 my-6 h-10 bg-white rounded flex items-center">
                <div className="w-3/4 h-6 mx-2 bg-gray-100 flex items-center">
                  <div className="text-black text-xs ml-2" style={{ fontFamily: "'Brush Script MT', cursive" }}>
                    {auth?.currentUser?.displayName || "J. Smith"}
                  </div>
                </div>
                <div className="text-black font-mono text-xs mr-2">{cvv || '•••'}</div>
              </div>
              
              {/* Terms */}
              <div className="mx-4 my-2 text-xs opacity-80">
                <p>This card is property of Vertex Financial and must be returned upon request. Use of this card is subject to the credit card agreement.</p>
              </div>
              
              {/* Customer Service */}
              <div className="mx-4 my-4 text-xs">
                <p>Customer Service: 1-800-VERTEX-CC</p>
                <p>Lost/Stolen: 1-800-VERTEX-01</p>
                <p>International: +1-XXX-XXX-XXXX</p>
              </div>
              
              {/* Logo */}
              <div className="absolute bottom-6 right-6 flex items-center space-x-1">
                <img src="/favicon.svg" alt="Vertex Logo" className="w-6 h-6" />
                <span className="font-bold text-sm tracking-wider">VERTEX</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={flipCard}
        className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-md transition-colors duration-300"
      >
        {isFlipped ? "Show Front" : "Show Back"}
      </button>
      
      <div className="mt-8 text-center max-w-md">
        <p className="text-white/70 text-sm">
          Move your mouse over the card to see the 3D effect, or click the button to flip the card.
        </p>
      </div>
    </div>
  );
};

export default Credit3DCard;
