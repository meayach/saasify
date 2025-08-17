import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApplicationRefreshService {
  private refreshSubject = new Subject<void>();

  // Observable que les composants peuvent écouter
  refreshNeeded$ = this.refreshSubject.asObservable();

  // Méthode pour déclencher un rafraîchissement
  triggerRefresh(): void {
    console.log('🔄 Déclenchement du rafraîchissement des applications');
    this.refreshSubject.next();
  }
}
