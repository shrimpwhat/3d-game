import React, { useEffect, useRef, useState } from "react";
import { Game } from "./Game";

interface GameCanvasProps {
  style?: React.CSSProperties;
  className?: string;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ style, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const initializeGame = async () => {
      try {
        console.log("Starting game initialization...");

        if (!canvasRef.current) {
          throw new Error("Canvas ref is null");
        }

        console.log("Creating Game instance...");
        // Initialize game
        gameRef.current = new Game(canvasRef.current);

        console.log("Starting game loop...");
        // Start the game loop immediately
        gameRef.current.start();

        // Remove loading screen immediately to see what's rendered
        setIsLoading(false);

        console.log(
          "Basic game started, physics will initialize in background..."
        );

        // Wait for physics initialization in background
        try {
          await gameRef.current.waitForInitialization();
          console.log("Physics initialization complete!");
        } catch (physicsError) {
          console.warn(
            "Physics initialization failed, but basic scene should still work:",
            physicsError
          );
        }
      } catch (err) {
        console.error("Failed to initialize game:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setIsLoading(false);
      }
    };

    initializeGame();

    // Cleanup function
    return () => {
      if (gameRef.current) {
        gameRef.current.dispose();
        gameRef.current = null;
      }
    };
  }, []);
  const defaultStyle: React.CSSProperties = {
    width: "100vw",
    height: "100vh",
    display: "block",
    ...style,
  };

  //   if (!isLoading) {
  //     return (
  //       <div
  //         style={{
  //           ...defaultStyle,
  //           display: "flex",
  //           alignItems: "center",
  //           justifyContent: "center",
  //           backgroundColor: "#87CEEB",
  //           color: "white",
  //           fontSize: "24px",
  //         }}
  //       >
  //         Loading game...
  //       </div>
  //     );
  //   }

  if (error) {
    return (
      <div
        style={{
          ...defaultStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ff0000",
          color: "white",
          fontSize: "18px",
        }}
      >
        Error: {error}
      </div>
    );
  }

  return <canvas ref={canvasRef} style={defaultStyle} className={className} />;
};

export default GameCanvas;
