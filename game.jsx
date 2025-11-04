import React, { useState, useEffect } from 'react';
import { Heart, Home, Globe, Mountain, Users, Sparkles, Dice1, Smile, Frown, Meh, AlertCircle, SkipForward, Trophy, Zap } from 'lucide-react';

const REGIONS = [
  { name: 'Home', color: 'bg-amber-100', icon: Home },
  { name: 'Culture', color: 'bg-purple-100', icon: Globe },
  { name: 'Challenge', color: 'bg-red-100', icon: Mountain },
  { name: 'Connection', color: 'bg-blue-100', icon: Users },
  { name: 'Dreams', color: 'bg-green-100', icon: Sparkles }
];

const EMOTIONS = [
  { emoji: '😄', name: 'Joy' },
  { emoji: '😢', name: 'Sadness' },
  { emoji: '😠', name: 'Anger' },
  { emoji: '😨', name: 'Fear' },
  { emoji: '😍', name: 'Love' },
  { emoji: '😐', name: 'Neutral' }
];

const IDENTITY_CARDS = {
  Home: [
    "Describe a place that feels like home to you",
    "Share a family tradition that shaped you",
    "Tell about a meal that brings back memories",
    "Describe your earliest childhood memory"
  ],
  Culture: [
    "Share a tradition from your heritage",
    "Describe music that represents your culture",
    "Tell about a cultural celebration you love",
    "Share a value passed down in your family"
  ],
  Challenge: [
    "Describe a time you felt excluded",
    "Share a moment you overcame fear",
    "Tell about a loss that changed you",
    "Describe a time you stood up for yourself"
  ],
  Connection: [
    "Share how a friend changed your life",
    "Describe a moment of deep understanding",
    "Tell about someone who believed in you",
    "Share a time you felt truly seen"
  ],
  Dreams: [
    "Describe who you hope to become",
    "Share a dream you're afraid to pursue",
    "Tell about a goal that excites you",
    "Describe your vision of a better world"
  ]
};

const ROUTE_CARDS = [
  { text: "Share a pivotal moment in your journey", effect: "gain", tokens: 1 },
  { text: "Describe a crossroads you faced", effect: "gain", tokens: 1 },
  { text: "Tell about a detour that taught you something", effect: "gain", tokens: 2 },
  { text: "Share a time you helped someone else", effect: "gain", tokens: 2 },
  { text: "Skip your next turn to reflect deeply", effect: "skip", tokens: 0 },
  { text: "Move forward 3 spaces", effect: "move", tokens: 3 },
  { text: "You felt disconnected from others", effect: "lose", tokens: 1 },
  { text: "A misunderstanding caused distance", effect: "lose", tokens: 1 },
  { text: "You struggled to express yourself", effect: "lose", tokens: 2 },
  { text: "Self-doubt crept in and held you back", effect: "lose", tokens: 2 },
  { text: "You faced rejection and felt alone", effect: "lose", tokens: 3 }
];

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const createBoardLayout = () => {
  const layout = [];
  REGIONS.forEach(region => {
    for (let i = 0; i < 8; i++) {
      layout.push({ ...region, isMainSpace: i === 0 });
    }
  });
  return shuffleArray(layout);
};

export default function RootsRoutesGame() {
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [setupPhase, setSetupPhase] = useState(true);
  const [playerCount, setPlayerCount] = useState(4);
  const [diceRoll, setDiceRoll] = useState(null);
  const [emotionRoll, setEmotionRoll] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [showCard, setShowCard] = useState(false);
  const [message, setMessage] = useState('');
  const [showGiveTokens, setShowGiveTokens] = useState(false);
  const [boardLayout, setBoardLayout] = useState([]);
  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [isEmotionRolling, setIsEmotionRolling] = useState(false);
  const [tokenAnimation, setTokenAnimation] = useState(null);
  const [celebrationAnimation, setCelebrationAnimation] = useState(false);
  const [playerNames, setPlayerNames] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sound effects using Web Audio API
  const playSound = (type) => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
      case 'dice':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'token-gain':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'token-lose':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'celebration':
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
          gain.gain.setValueAtTime(0.15, audioContext.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);
          osc.start(audioContext.currentTime + i * 0.1);
          osc.stop(audioContext.currentTime + i * 0.1 + 0.3);
        });
        break;
      case 'card':
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(350, audioContext.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'move':
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
    }
  };

  const initializePlayers = () => {
    const colors = ['bg-rose-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
    const newPlayers = Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      name: playerNames[i] || `Player ${i + 1}`,
      position: 0,
      belongingTokens: 1,
      regionTokens: { Home: false, Culture: false, Challenge: false, Connection: false, Dreams: false },
      color: colors[i % colors.length],
      inCircle: false,
      skipTurn: false
    }));
    setPlayers(newPlayers);
    setBoardLayout(createBoardLayout());
    setSetupPhase(false);
    setGameStarted(true);
    setMessage(`${newPlayers[0].name}'s turn! Roll the dice to begin.`);
  };

  const getCurrentRegion = (position) => {
    if (position >= boardLayout.length) return 'Dreams';
    return boardLayout[position].name;
  };

  const rollDice = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceRoll(roll);
    return roll;
  };

  const rollEmotion = () => {
    const emotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    setEmotionRoll(emotion);
    return emotion;
  };

  const handleRollDice = () => {
    if (players[currentPlayerIndex].skipTurn) {
      const newPlayers = [...players];
      newPlayers[currentPlayerIndex].skipTurn = false;
      setPlayers(newPlayers);
      nextTurn();
      return;
    }

    setIsDiceRolling(true);
    
    // Animated dice roll
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDiceRoll(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount >= 10) {
        clearInterval(rollInterval);
        const finalRoll = rollDice();
        setIsDiceRolling(false);
        
        const newPlayers = [...players];
        const currentPlayer = newPlayers[currentPlayerIndex];
        const oldPosition = currentPlayer.position;
        
        currentPlayer.position = Math.min(currentPlayer.position + finalRoll, boardLayout.length - 1);
        const region = getCurrentRegion(currentPlayer.position);
        
        setPlayers(newPlayers);
        
        setTimeout(() => {
          if (Math.random() > 0.3) {
            setIsEmotionRolling(true);
            
            // Animated emotion roll
            let emotionCount = 0;
            const emotionInterval = setInterval(() => {
              setEmotionRoll(EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)]);
              emotionCount++;
              if (emotionCount >= 8) {
                clearInterval(emotionInterval);
                const emotion = rollEmotion();
                setIsEmotionRolling(false);
                
                const cards = IDENTITY_CARDS[region];
                const card = cards[Math.floor(Math.random() * cards.length)];
                setCurrentCard({ type: 'identity', text: card, region, emotion });
                setMessage(`${currentPlayer.name} landed in ${region}! Respond to this prompt with ${emotion.name}:`);
                setShowCard(true);
              }
            }, 100);
          } else {
            const card = ROUTE_CARDS[Math.floor(Math.random() * ROUTE_CARDS.length)];
            setCurrentCard({ type: 'route', ...card });
            setMessage(`${currentPlayer.name} drew a Route Card!`);
            
            if (card.effect === 'gain') {
              currentPlayer.belongingTokens += card.tokens;
              setTokenAnimation({ type: 'gain', count: card.tokens });
              setTimeout(() => setTokenAnimation(null), 2000);
            } else if (card.effect === 'lose') {
              currentPlayer.belongingTokens = Math.max(0, currentPlayer.belongingTokens - card.tokens);
              setTokenAnimation({ type: 'lose', count: card.tokens });
              setTimeout(() => setTokenAnimation(null), 2000);
            } else if (card.effect === 'skip') {
              currentPlayer.skipTurn = true;
            } else if (card.effect === 'move') {
              currentPlayer.position = Math.min(currentPlayer.position + card.tokens, boardLayout.length - 1);
            }
            setPlayers(newPlayers);
            setShowCard(true);
          }
        }, 800);
      }
    }, 100);
  };

  const handleCardComplete = () => {
    const region = getCurrentRegion(players[currentPlayerIndex].position);
    const newPlayers = [...players];
    newPlayers[currentPlayerIndex].regionTokens[region] = true;
    setPlayers(newPlayers);
    setShowCard(false);
    setShowGiveTokens(true);
    setMessage('Other players: Give a Belonging Token if you felt connected to this story!');
  };

  const handleSkipStory = () => {
    setShowCard(false);
    setMessage(`${players[currentPlayerIndex].name} chose to skip this story.`);
    setTimeout(() => {
      nextTurn();
    }, 1500);
  };

  const giveToken = (fromPlayerId) => {
    const newPlayers = [...players];
    if (fromPlayerId !== currentPlayerIndex && newPlayers[fromPlayerId].belongingTokens > 0) {
      newPlayers[currentPlayerIndex].belongingTokens += 1;
      setPlayers(newPlayers);
      setMessage(`${newPlayers[fromPlayerId].name} gave a Belonging Token!`);
      setTokenAnimation({ type: 'gain', count: 1 });
      setTimeout(() => setTokenAnimation(null), 2000);
    }
  };

  const nextTurn = () => {
    setShowGiveTokens(false);
    setDiceRoll(null);
    setEmotionRoll(null);
    setCurrentCard(null);
    
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIndex);
    
    const nextPlayer = players[nextIndex];
    if (nextPlayer.skipTurn) {
      setMessage(`${nextPlayer.name}'s turn - Skip turn for reflection`);
    } else {
      setMessage(`${nextPlayer.name}'s turn! Roll the dice.`);
    }
  };

  const checkWinCondition = (player) => {
    const hasAllRegions = Object.values(player.regionTokens).every(v => v);
    const hasEnoughTokens = player.belongingTokens >= 5;
    return hasAllRegions && hasEnoughTokens;
  };

  const enterCircle = () => {
    const newPlayers = [...players];
    newPlayers[currentPlayerIndex].inCircle = true;
    setPlayers(newPlayers);
    setCelebrationAnimation(true);
    setMessage(`${newPlayers[currentPlayerIndex].name} has reached the Circle of Belonging! 🎉`);
    setTimeout(() => setCelebrationAnimation(false), 3000);
  };

  if (setupPhase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 border-4 border-purple-300">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4 animate-bounce">🎭🌍🎲</div>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
              Roots & Routes
            </h1>
            <p className="text-xl text-gray-600 font-bold">🎪 The Most Fun Identity Game Ever! 🎪</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-xl border-4 border-yellow-300">
              <label className="block text-xl font-black mb-3 text-yellow-900">
                🎮 How Many Brave Players? (4-8)
              </label>
              <input
                type="number"
                min="4"
                max="8"
                value={playerCount}
                onChange={(e) => setPlayerCount(Math.min(8, Math.max(4, parseInt(e.target.value) || 4)))}
                className="w-full p-4 border-4 border-yellow-400 rounded-xl text-2xl font-bold text-center focus:ring-4 focus:ring-yellow-300 transition"
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl border-4 border-blue-300">
              <label className="block text-xl font-black mb-3 text-blue-900">
                ✍️ Who's Playing? (Optional but Fun!)
              </label>
              <div className="space-y-2">
                {Array.from({ length: playerCount }, (_, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Player ${i + 1} (Mystery Person ${i + 1} 🕵️)`}
                    value={playerNames[i] || ''}
                    onChange={(e) => setPlayerNames({...playerNames, [i]: e.target.value})}
                    className="w-full p-3 border-3 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-200 transition font-semibold"
                  />
                ))}
              </div>
            </div>
            
            <button
              onClick={initializePlayers}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white py-6 rounded-2xl text-2xl font-black hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-3xl border-4 border-white"
            >
              🚀 LET'S GOOOOO! 🎉
            </button>
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border-4 border-green-300">
            <h3 className="font-black text-xl mb-3 text-green-900">🏆 How to Win This Thing:</h3>
            <ul className="text-base space-y-2 font-bold text-green-800">
              <li>✅ Collect badges from all 5 crazy regions</li>
              <li>💖 Earn at least 5 Belonging Hearts</li>
              <li>🎯 Make it to the Circle of Awesomeness!</li>
            </ul>
          </div>
          
          <div className="mt-4 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border-4 border-amber-300">
            <h3 className="font-black text-xl mb-3 text-amber-900">😎 Pro Tips:</h3>
            <p className="text-base font-bold text-amber-800">Skip any story if you're not feeling it! No pressure, just vibes! 🌈✨</p>
          </div>
        </div>
      </div>
    );
  }

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      {/* Token Animation Overlay */}
      {tokenAnimation && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className={`text-9xl font-black animate-bounce ${tokenAnimation.type === 'gain' ? 'text-green-500' : 'text-red-500'}`}>
            {tokenAnimation.type === 'gain' ? '🎉 +' : '😢 -'}{tokenAnimation.count} 
            <Heart className="inline-block ml-4 w-24 h-24" />
          </div>
        </div>
      )}
      
      {/* Celebration Animation */}
      {celebrationAnimation && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-9xl">
            <div className="animate-ping absolute">🎉</div>
            <div className="animate-bounce absolute">🎊</div>
            <div className="animate-spin absolute text-8xl">⭐</div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 mb-2 animate-pulse">
            🎪 Roots & Routes 🎪
          </h1>
          <p className="text-xl font-bold text-gray-700">The Journey of a Lifetime!</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Game Board */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl p-8 border-4 border-purple-300">
            <div className="relative">
              {/* Circular Board with Shuffled Regions */}
              <div className="w-full aspect-square max-w-2xl mx-auto relative">
                {/* Center Circle - MUCH BIGGER AND FUNNIER */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl z-10 animate-pulse border-8 border-white">
                  <div className="text-center">
                    <div className="text-5xl mb-2">🏆</div>
                    <Heart className="w-12 h-12 mx-auto text-white mb-2 animate-bounce" />
                    <span className="text-white font-black text-lg">CIRCLE OF<br/>AWESOME!</span>
                  </div>
                </div>
                
                {/* Region Spaces - MUCH LARGER */}
                {boardLayout.map((space, index) => {
                  const Icon = space.icon;
                  const totalSpaces = boardLayout.length;
                  const angle = (index / totalSpaces) * 2 * Math.PI - Math.PI / 2;
                  const radius = 200;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  return (
                    <div
                      key={index}
                      className={`absolute w-16 h-16 ${space.color} rounded-2xl border-4 border-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-125 hover:rotate-12 cursor-pointer`}
                      style={{
                        transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                        top: '50%',
                        left: '50%'
                      }}
                    >
                      {space.isMainSpace && (
                        <div className="relative">
                          <Icon className="w-8 h-8 animate-bounce" />
                          <div className="absolute -top-2 -right-2 text-2xl">✨</div>
                        </div>
                      )}
                      {players.filter(p => p.position === index).map((player, i) => (
                        <div
                          key={player.id}
                          className={`absolute w-10 h-10 ${player.color} rounded-full border-4 border-white shadow-2xl animate-bounce`}
                          style={{ 
                            transform: `translate(${i * 12}px, ${i * 12}px)`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center text-2xl">
                            {['😎', '🤩', '😁', '🥳', '😃', '🤗', '😊', '🌟'][player.id % 8]}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Current Turn Info - FUNNIER */}
            <div className="mt-6 p-6 bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 rounded-2xl shadow-lg border-4 border-purple-300">
              <p className="text-center font-black text-2xl text-purple-900 mb-4">{message}</p>
              
              {!showCard && !showGiveTokens && (
                <button
                  onClick={handleRollDice}
                  disabled={isDiceRolling}
                  className="mt-4 w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white py-4 rounded-2xl text-xl font-black hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed border-4 border-white"
                >
                  <Dice1 className={`w-8 h-8 ${isDiceRolling ? 'animate-spin' : ''}`} />
                  {isDiceRolling ? '🎲 ROLLING... 🎲' : '🎲 ROLL THE MAGIC DICE! 🎲'}
                </button>
              )}
              
              {diceRoll && (
                <div className="mt-6 text-center bg-white p-6 rounded-2xl border-4 border-purple-400 shadow-xl">
                  <p className="text-lg font-bold text-purple-700 mb-2">YOU ROLLED:</p>
                  <div className={`text-8xl font-black text-purple-600 ${isDiceRolling ? 'animate-pulse' : 'animate-bounce'}`}>
                    {diceRoll} 🎯
                  </div>
                </div>
              )}
              
              {emotionRoll && (
                <div className="mt-6 text-center bg-white p-6 rounded-2xl border-4 border-pink-400 shadow-xl">
                  <p className="text-lg font-bold text-pink-700 mb-2">YOUR EMOTION VIBE:</p>
                  <div className={`text-9xl ${isEmotionRolling ? 'animate-spin' : 'animate-bounce'}`}>
                    {emotionRoll.emoji}
                  </div>
                  <p className="text-2xl font-black text-pink-600 mt-2">{emotionRoll.name.toUpperCase()}!</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Player Stats - FUNNIER */}
          <div className="space-y-4">
            {players.map((player) => (
              <div
                key={player.id}
                className={`bg-white rounded-2xl shadow-lg p-5 transition-all duration-300 hover:shadow-2xl hover:scale-105 border-4 ${
                  player.id === currentPlayerIndex ? 'ring-8 ring-yellow-400 shadow-2xl scale-105 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50' : 'border-purple-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 ${player.color} rounded-full shadow-xl ${player.id === currentPlayerIndex ? 'animate-pulse' : ''} flex items-center justify-center text-2xl border-4 border-white`}>
                    {['😎', '🤩', '😁', '🥳', '😃', '🤗', '😊', '🌟'][player.id % 8]}
                  </div>
                  <span className="font-black text-xl">{player.name}</span>
                  {player.id === currentPlayerIndex && (
                    <div className="flex gap-1">
                      <Zap className="w-6 h-6 text-yellow-500 animate-bounce" />
                      <span className="text-2xl animate-pulse">👈</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 bg-pink-50 p-3 rounded-xl border-2 border-pink-200">
                    <Heart className="w-6 h-6 text-red-500 animate-pulse" />
                    <span className="font-black text-lg">{player.belongingTokens} Hearts</span>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(player.regionTokens).map(([region, has]) => (
                      <span
                        key={region}
                        className={`px-3 py-2 rounded-xl text-xs font-black transition-all duration-300 border-2 ${
                          has ? 'bg-green-100 text-green-800 shadow-lg scale-110 border-green-400' : 'bg-gray-100 text-gray-400 border-gray-200'
                        }`}
                      >
                        {has && '✅ '}{region}
                      </span>
                    ))}
                  </div>
                  
                  {checkWinCondition(player) && !player.inCircle && (
                    <button
                      onClick={enterCircle}
                      disabled={player.id !== currentPlayerIndex}
                      className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white py-3 rounded-xl font-black text-base hover:from-yellow-500 hover:via-orange-500 hover:to-red-500 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse border-4 border-white"
                    >
                      <Trophy className="inline w-6 h-6 mr-2 animate-bounce" />
                      ENTER THE CIRCLE! 🎊
                    </button>
                  )}
                  
                  {player.inCircle && (
                    <div className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-white py-3 rounded-xl text-center font-black text-base shadow-xl animate-pulse border-4 border-white">
                      🏆 IN THE CIRCLE! 🎉
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Card Display with Skip Option - FUNNIER */}
        {showCard && currentCard && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl shadow-2xl p-8 max-w-lg w-full transform animate-scaleIn border-8 border-purple-400">
              {currentCard.type === 'identity' && (
                <>
                  <div className="text-center mb-6 bg-white p-6 rounded-2xl border-4 border-purple-300 shadow-xl">
                    <div className="text-9xl mb-4 animate-bounce">{currentCard.emotion.emoji}</div>
                    <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                      {currentCard.region} TIME! 🎭
                    </h3>
                    <p className="text-xl font-bold text-gray-700">Feel the {currentCard.emotion.name}!</p>
                  </div>
                  <p className="text-xl text-center mb-8 font-black bg-yellow-100 p-6 rounded-2xl border-4 border-yellow-300 shadow-lg">
                    {currentCard.text} 🎤
                  </p>
                  
                  <div className="space-y-4">
                    <button
                      onClick={handleCardComplete}
                      className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white py-4 rounded-2xl text-xl font-black hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-110 border-4 border-white"
                    >
                      🎤 SHARE MY EPIC STORY! ✨
                    </button>
                    
                    <button
                      onClick={handleSkipStory}
                      className="w-full bg-gray-300 text-gray-800 py-4 rounded-2xl text-lg font-black hover:bg-gray-400 transition-all duration-200 flex items-center justify-center gap-3 hover:scale-105 border-4 border-white shadow-lg"
                    >
                      <SkipForward className="w-6 h-6" />
                      😌 SKIP (No pressure!)
                    </button>
                  </div>
                  
                  <p className="text-sm text-center text-gray-600 mt-4 font-bold bg-amber-50 p-3 rounded-xl border-2 border-amber-200">
                    💛 Your comfort = Our priority! 💛
                  </p>
                </>
              )}
              
              {currentCard.type === 'route' && (
                <>
                  <div className="text-center mb-6">
                    <div className="text-7xl mb-4 animate-spin">🌟</div>
                    <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                      🎲 ROUTE CARD! 🎲
                    </h3>
                  </div>
                  <p className="text-xl text-center mb-6 font-black bg-purple-100 p-6 rounded-2xl border-4 border-purple-300 shadow-lg">
                    {currentCard.text}
                  </p>
                  
                  {currentCard.effect === 'lose' && (
                    <div className="mb-6 p-6 bg-red-100 border-4 border-red-300 rounded-2xl animate-pulse shadow-xl">
                      <p className="text-center text-red-900 text-2xl font-black flex items-center justify-center gap-3">
                        <Heart className="w-8 h-8 animate-bounce" />
                        😢 LOSE {currentCard.tokens} HEART{currentCard.tokens > 1 ? 'S' : ''} 💔
                      </p>
                    </div>
                  )}
                  
                  {currentCard.effect === 'gain' && (
                    <div className="mb-6 p-6 bg-green-100 border-4 border-green-300 rounded-2xl animate-pulse shadow-xl">
                      <p className="text-center text-green-900 text-2xl font-black flex items-center justify-center gap-3">
                        <Heart className="w-8 h-8 animate-bounce" />
                        🎉 GAIN {currentCard.tokens} HEART{currentCard.tokens > 1 ? 'S' : ''} 💚
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <button
                      onClick={handleCardComplete}
                      className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white py-4 rounded-2xl text-xl font-black hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-110 border-4 border-white"
                    >
                      🎤 SHARE THE STORY! ✨
                    </button>
                    
                    <button
                      onClick={handleSkipStory}
                      className="w-full bg-gray-300 text-gray-800 py-4 rounded-2xl text-lg font-black hover:bg-gray-400 transition-all duration-200 flex items-center justify-center gap-3 hover:scale-105 border-4 border-white shadow-lg"
                    >
                      <SkipForward className="w-6 h-6" />
                      😌 SKIP IT!
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Give Tokens Phase - FUNNIER */}
        {showGiveTokens && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gradient-to-br from-white via-pink-50 to-purple-50 rounded-3xl shadow-2xl p-8 max-w-lg w-full transform animate-scaleIn border-8 border-pink-400">
              <div className="text-center mb-6">
                <div className="text-7xl mb-4 animate-bounce">💝</div>
                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-3">
                  SPREAD THE LOVE!
                </h3>
              </div>
              <p className="text-center mb-6 bg-pink-100 p-4 rounded-2xl border-4 border-pink-300 font-bold text-lg">
                Did {currentPlayer.name}'s story touch your heart? Give them a token! 💕
              </p>
              
              <div className="space-y-3 mb-6">
                {players.map((player) => (
                  player.id !== currentPlayerIndex && (
                    <button
                      key={player.id}
                      onClick={() => giveToken(player.id)}
                      className="w-full bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 hover:from-pink-300 hover:via-purple-300 hover:to-blue-300 text-pink-900 py-4 rounded-2xl font-black transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-2xl hover:scale-110 border-4 border-white text-lg"
                    >
                      <Heart className="w-7 h-7 animate-pulse" />
                      💝 {player.name} gives a HEART!
                    </button>
                  )
                ))}
              </div>
              
              <button
                onClick={nextTurn}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white py-4 rounded-2xl font-black hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-110 border-4 border-white text-xl"
              >
                ➡️ NEXT PLAYER'S TURN! 🎮
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}