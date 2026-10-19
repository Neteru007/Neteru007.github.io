import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, shareReplay } from 'rxjs';
import { dataVersions } from './catalog-version';
import { CatalogEntry, CatalogKind, isCatalog } from './models';
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly requests = new Map<CatalogKind, Observable<CatalogEntry[]>>();
  entries(kind: CatalogKind): Observable<CatalogEntry[]> {
    const cached = this.requests.get(kind);
    if (cached) return cached;
    const request = this.http.get<unknown>('/catalogues/data/' + kind + '.json?v=' + dataVersions[kind]).pipe(
      map(value => { if (!isCatalog(value) || value.some(entry => entry.kind !== kind)) throw new Error('Invalid catalogue data'); return value; }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.requests.set(kind, request);
    return request;
  }
}
