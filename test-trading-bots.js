
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAHSlKslQx4lRQEZX-QcfCGr5pO7qG-yWI",
  authDomain: "vertev-tradings.firebaseapp.com",
  projectId: "vertev-tradings",
  storageBucket: "vertev-tradings.firebasestorage.app",
  messagingSenderId: "47392604150",
  appId: "1:47392604150:web:1405bfcdac7efad4e411d7",
  measurementId: "G-TLR3LCX09J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testTradingBotBalance() {
  console.log('🚀 Starting Trading Bot Balance Test...\n');

  // Test user ID from your system
  const testUserId = '5uKZPhNIsWRU90RtyETuxPgt6T02';
  
  try {
    // 1. Test getting current balances
    console.log('1. Testing balance retrieval...');
    const userRef = doc(db, 'users', testUserId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('❌ User document does not exist!');
      return;
    }

    const userData = userDoc.data();
    console.log('📄 User document found');
    
    // Check USDT balance from assets
    const usdtBalance = userData?.assets?.USDT?.amount ?? 0;
    const generalBalance = userData?.balance ?? 0;
    
    console.log(`💰 Current USDT Balance (assets.USDT.amount): ${usdtBalance} USDT`);
    console.log(`💵 Current General Balance: $${generalBalance}`);
    
    // 2. Test which balance the bots are actually reading
    console.log('\n2. Testing bot balance logic...');
    
    // This is how your bots check USDT balance
    const botUSDTBalance = userData?.assets?.USDT?.amount ?? userData?.balance ?? 0;
    console.log(`🤖 Bot reads USDT balance as: ${botUSDTBalance} USDT`);
    
    // 3. Test minimum balance requirements for bots
    console.log('\n3. Testing bot eligibility...');
    const botRequirements = {
      'Standard Bot': 20,
      'Master Bot': 40,
      'Pro Basic Bot': 100,
      'Pro Premium Bot': 200
    };

    Object.entries(botRequirements).forEach(([botType, requirement]) => {
      const canTrade = botUSDTBalance >= requirement;
      const status = canTrade ? '✅' : '❌';
      console.log(`${status} ${botType} (${requirement} USDT): ${canTrade ? 'AVAILABLE' : 'INSUFFICIENT FUNDS'}`);
    });

    // 4. Test USDT balance update
    console.log('\n4. Testing USDT balance update...');
    
    // Add 50 USDT for testing
    const newUSDTAmount = usdtBalance + 50;
    
    const assets = userData?.assets || {};
    assets.USDT = {
      ...assets.USDT,
      amount: newUSDTAmount,
      name: "USDT"
    };
    
    await updateDoc(userRef, { assets });
    console.log(`✅ Updated USDT balance from ${usdtBalance} to ${newUSDTAmount} USDT`);

    // 5. Verify the update
    console.log('\n5. Verifying balance update...');
    const updatedDoc = await getDoc(userRef);
    const updatedData = updatedDoc.data();
    const verifyBalance = updatedData?.assets?.USDT?.amount ?? 0;
    
    if (verifyBalance === newUSDTAmount) {
      console.log('✅ Balance update verified successfully!');
      
      // Re-check bot eligibility
      console.log('\n6. Re-checking bot eligibility after update...');
      Object.entries(botRequirements).forEach(([botType, requirement]) => {
        const canTrade = verifyBalance >= requirement;
        const status = canTrade ? '✅' : '❌';
        console.log(`${status} ${botType} (${requirement} USDT): ${canTrade ? 'AVAILABLE' : 'INSUFFICIENT FUNDS'}`);
      });
    } else {
      console.log('❌ Balance update verification failed!');
    }

    // 7. Restore original balance
    console.log('\n7. Restoring original balance...');
    const originalAssets = userData?.assets || {};
    originalAssets.USDT = {
      ...originalAssets.USDT,
      amount: usdtBalance,
      name: "USDT"
    };
    
    await updateDoc(userRef, { assets: originalAssets });
    console.log(`✅ Restored original USDT balance: ${usdtBalance} USDT`);

    console.log('\n🎉 Trading Bot Balance Test Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Install required packages first
console.log('Installing required Firebase packages...');
const { execSync } = require('child_process');

try {
  execSync('npm install firebase', { stdio: 'inherit' });
  console.log('✅ Firebase packages installed\n');
  
  // Run the test
  testTradingBotBalance();
} catch (error) {
  console.error('❌ Failed to install packages:', error.message);
}
