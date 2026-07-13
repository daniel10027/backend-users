import { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ message: `Route non trouvee : ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  if (err instanceof Error && err.name === "MulterError") {
    res.status(400).json({ message: `Erreur lors du televersement du fichier : ${err.message}` });
    return;
  }

  console.error("Erreur non geree :", err);
  res.status(500).json({ message: "Erreur interne du serveur" });
}
