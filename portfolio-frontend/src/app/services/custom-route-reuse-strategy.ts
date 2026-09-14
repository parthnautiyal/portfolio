import { RouteReuseStrategy, DetachedRouteHandle, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private storedHandles = new Map<string, DetachedRouteHandle>();

  // Determine if this route (and its subtree) should be detached and saved
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const key = this.getRouteKey(route);
    if (!key || key === '**' || key === 'wildcard') {
      return false;
    }
    return true;
  }

  // Store the detached route handle in our memory map
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    const key = this.getRouteKey(route);
    if (!key) return;

    if (handle) {
      this.storedHandles.set(key, handle);
    } else {
      this.storedHandles.delete(key);
    }
  }

  // Determine if a stored route handle exists for this route to re-attach
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const key = this.getRouteKey(route);
    return !!key && this.storedHandles.has(key);
  }

  // Retrieve the stored route handle to re-attach immediately (0ms, zero re-render)
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const key = this.getRouteKey(route);
    if (!key || !this.storedHandles.has(key)) {
      return null;
    }
    return this.storedHandles.get(key) || null;
  }

  // Determine if the router should reuse the current route (e.g. re-clicking the active tab)
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  // Robust leaf-traversal route key extractor
  private getRouteKey(route: ActivatedRouteSnapshot): string {
    let r: ActivatedRouteSnapshot = route;
    while (r.firstChild) {
      r = r.firstChild;
    }

    if (r.routeConfig) {
      const p = r.routeConfig.path;
      if (p === '') return 'root_home';
      if (p !== undefined && p !== null) return p;
    }

    const fullUrl = route.pathFromRoot
      .map(s => s.url.map(segment => segment.path).join('/'))
      .filter(Boolean)
      .join('/');

    return fullUrl || 'root_home';
  }

  clearCache(): void {
    this.storedHandles.clear();
  }
}
