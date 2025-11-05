import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

declare global {
  interface Window {
    __env?: { apiUrl?: string };
  }
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  get apiUrl(): string {
    // Priority: runtime window.__env (injected by env.js) -> build-time environment.ts
    return window.__env?.apiUrl || environment.apiUrl;
  }
}
