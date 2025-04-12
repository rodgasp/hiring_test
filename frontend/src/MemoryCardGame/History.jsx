import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import backgroundGif from "../assets/images/play.gif";
import calmBackground from "../assets/images/calm-wallpaper.jpg";
import backgroundMusic from "../assets/audio/background-music.mp3";
import buttonHoverSound from "../assets/audio/button-hover.mp3";
import buttonClickSound from "../assets/audio/button-click.mp3";
import "./Play.css";
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const PixelButton = styled(Box)(() => ({
  display: "inline-block",
  backgroundColor: "#2c2c54",
  color: "#fff",
  fontFamily: '"Press Start 2P", cursive',
  fontSize: "14px",
  padding: "15px 30px",
  border: "2px solid #00d9ff",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
  cursor: "pointer",
  textAlign: "center",
  transition: "transform 0.2s, background-color 0.2s, box-shadow 0.2s",
  "&:hover": {
    backgroundColor: "#40407a",
    borderColor: "#00aaff",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.4)",
  },
  "&:active": {
    transform: "scale(0.95)",
  },
}));

const History = () => {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState(null);
  const [isCalmMode, setIsCalmMode] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);

  useEffect(() => {
    const calmMode = localStorage.getItem("calmMode") === "true";
    setIsCalmMode(calmMode);
  }, []);


useEffect(() => {
  const userID = localStorage.getItem("userID");
  fetch(`http://localhost:5005/api/memory/history/${userID}`)
    .then(response => response.json())
    .then(data => {
      setGameHistory(data);
    })
    .catch(error => {
      console.error("Error fetching history:", error);
      alert("Failed to fetch history");
    });
}, []);

  const [bgVolume, setBgVolume] = useState(
    localStorage.getItem("bgVolume") !== null ? parseInt(localStorage.getItem("bgVolume"), 10) : 50
  );
  const [sfxVolume, setSfxVolume] = useState(
    localStorage.getItem("sfxVolume") !== null ? parseInt(localStorage.getItem("sfxVolume"), 10) : 50
  );

  const bgAudioRef = useRef(null);
  const hoverAudioRef = useRef(null);
  const clickAudioRef = useRef(null);

  useEffect(() => {
    bgAudioRef.current = new Audio(backgroundMusic);
    hoverAudioRef.current = new Audio(buttonHoverSound);
    clickAudioRef.current = new Audio(buttonClickSound);

    const bgAudio = bgAudioRef.current;
    bgAudio.loop = true;
    bgAudio.volume = bgVolume / 100;

    const startMusic = () => {
      bgAudio.play().catch((error) => console.error("Autoplay failed:", error));
    };

    document.addEventListener("click", startMusic, { once: true });

    return () => {
      document.removeEventListener("click", startMusic);
      bgAudio.pause();
      bgAudio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = bgVolume / 100;
    }
    localStorage.setItem("bgVolume", bgVolume);
  }, [bgVolume]);

  useEffect(() => {
    hoverAudioRef.current.volume = sfxVolume / 100;
    clickAudioRef.current.volume = sfxVolume / 100;
    localStorage.setItem("sfxVolume", sfxVolume);
  }, [sfxVolume]);

  const handleBackButton = () => {
    navigate("/play"); // Navigate to play
  };
  
  return (
    <div
      className="background-container"
      style={{
        backgroundImage: `url(${isCalmMode ? calmBackground : backgroundGif})`,
        position: 'relative'  // Added to contain absolute positioned button
      }}
    >
      <PixelButton 
        onClick={handleBackButton} 
        sx={{ 
          position: 'absolute',
          top: '16px',
          left: '16px'
        }}
      >
        Back
      </PixelButton>
      <h1 className={`game-title ${isCalmMode ? "calm-title" : ""}`}>
        WonderCards
      </h1>
      <h5 style={{ color: 'white', fontFamily: "'Press Start 2P', cursive" }}>
        Wallet: {localStorage.getItem('userID')}
      </h5>

      <div className="button-container">
        <h2 className={`${isCalmMode ? "calm-mode-label" : ""} modal-h2`} style={{ fontFamily: "'Press Start 2P', cursive" }}>
          Game History
        </h2>
            
        <div style={{overflowY: 'auto', maxHeight: '120vh', paddingBottom: '1000px', marginBottom: '100px'}}>
          {gameHistory.map((game, index) => (
            <div
              key={index}
              style={{
                margin: '10px 0',
                padding: '40px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                fontFamily: "'Press Start 2P', cursive"
              }}
            >
              <p>Difficulty: {game.difficulty}</p>
              <p>Failed Attempts: {game.failed}</p>
              <p>Status: {game.completed ? 'Completed' : 'Incomplete'}</p>
              <p>Time: {game.timeTaken} seconds</p>
              <p>Date: {new Date(game.gameDate).toLocaleDateString('en-GB')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
