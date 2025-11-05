import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ConfigService] });
  });

  afterEach(() => {
    // Clean up runtime override
    try {
      // @ts-ignore
      delete window.__env;
    } catch {}
  });

  it('should return runtime apiUrl when window.__env is present', () => {
    // @ts-ignore
    window.__env = { apiUrl: 'http://runtime-api:5000' };
    const service = TestBed.inject(ConfigService);
    expect(service.apiUrl).toBe('http://runtime-api:5000');
  });

  it('should return build-time apiUrl when runtime override is absent', () => {
    // Ensure runtime override not present
    try { // @ts-ignore
      delete window.__env; } catch {}
    const service = TestBed.inject(ConfigService);
    expect(typeof service.apiUrl).toBe('string');
    expect(service.apiUrl.length).toBeGreaterThan(0);
  });
});
