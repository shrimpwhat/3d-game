import React, { useCallback, useEffect, useRef, useState, memo } from "react";
import { Game } from "./Game";

const GameCanvas: React.FC = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeGame = useCallback(async () => {
    try {
      if (!canvasRef.current) {
        throw new Error("Canvas ref is null");
      }

      gameRef.current = new Game(canvasRef.current);
      gameRef.current.start();
      setIsLoading(false);

      await gameRef.current.waitForInitialization();
    } catch (err) {
      console.error("Failed to initialize game:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeGame();

    return () => {
      if (gameRef.current) {
        gameRef.current.dispose();
        gameRef.current = null;
      }
    };
  }, [initializeGame]);

  return (
    <>
      {isLoading && <div className="info loading">Loading game...</div>}
      {error && <div className="info error">Error: {error}</div>}
      <canvas ref={canvasRef} />
    </>
  );
});

export default GameCanvas;
